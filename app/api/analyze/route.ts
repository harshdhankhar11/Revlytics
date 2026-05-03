import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';

const API_KEY = process.env.OMKAR_API_KEY;
const API_BASE = 'https://amazon-scraper-api.omkar.cloud';

function extractAsinFromUrl(urlString: string): string | null {
    const urlMatch = urlString.match(/\/(?:dp|gp\/product|d)\/([A-Z0-9]+)/i);
    if (urlMatch) {
        return urlMatch[1];
    }
    if (/^B0[A-Z0-9]{8}$/.test(urlString)) {
        return urlString;
    }
    return null;
}

async function resolveShortUrl(shortUrl: string): Promise<string | null> {
    try {
        const response = await fetch(shortUrl, {
            redirect: 'follow',
            method: 'GET',
        } as any);
        return response.url;
    } catch (error) {
        console.error(`Error resolving short URL: ${shortUrl}`, error);
        return null;
    }
}

async function scrapeProductData(urlOrAsin: string, countryCode = 'US') {
    try {
        let asin = urlOrAsin;

        if (urlOrAsin.includes('http') || urlOrAsin.includes('amzn.')) {
            if (urlOrAsin.includes('amzn.in') || urlOrAsin.includes('amzn.to')) {
                const resolved = await resolveShortUrl(urlOrAsin);
                if (resolved) {
                    asin = extractAsinFromUrl(resolved) || urlOrAsin;
                }
            } else {
                asin = extractAsinFromUrl(urlOrAsin) || urlOrAsin;
            }
        }

        if (!asin || !/^B0[A-Z0-9]{8}$/.test(asin)) {
            return null;
        }

        const url = `${API_BASE}/amazon/product-details?asin=${asin}&country_code=${countryCode}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'API-Key': API_KEY || '',
            },
            next: { revalidate: 0 },
        } as any);

        if (!response.ok) {
            throw new Error(`Scraping failed for ASIN: ${asin}`);
        }
        const data = await response.json();

        const topReviews = data.top_reviews?.slice(0, 15) || [];

        return {
            asin: data.asin || asin,
            title: data.product_name || '',
            description: data.product_name || '',
            brand: data.brand_info || null,
            price: data.current_price || null,
            originalPrice: data.original_price || null,
            currency: data.currency || 'USD',
            rating: data.rating || null,
            reviewCount: data.reviews || 0,
            images: data.additional_image_urls || [data.main_image_url] || [],
            image: data.main_image_url || null,
            isAmazonChoice: data.is_amazon_choice || false,
            isBestSeller: data.is_bestseller || false,
            isPrime: data.is_prime || false,
            availability: data.availability || 'Unknown',
            numberOfOffers: data.number_of_offers || 0,
            deliveryInfo: data.delivery_info || null,
            keyFeatures: data.key_features || [],
            detailedRating: data.detailed_rating || {},
            topReviews: topReviews.map((review: any) => ({
                id: review.review_id,
                title: review.review_title,
                text: review.review_text,
                rating: review.rating,
                reviewer: review.reviewer_name,
                helpfulVotes: review.helpful_votes || 0,
                date: review.review_date,
                isVerified: review.is_verified_purchase,
            })),
            salesVolume: data.sales_volume || null,
        };
    } catch (error) {
        console.error(`Error scraping ${urlOrAsin}:`, error);
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { analysisJobId } = body;

        if (!analysisJobId) {
            return NextResponse.json({ error: 'Missing analysisJobId' }, { status: 400 });
        }

        const analysisJob = await prisma.analysisJob.findUnique({
            where: { id: analysisJobId },
            include: { user: true },
        });

        if (!analysisJob) {
            return NextResponse.json({ error: 'Analysis job not found' }, { status: 404 });
        }

        if (analysisJob.user?.email !== session.user.email) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.analysisJob.update({
            where: { id: analysisJobId },
            data: { status: 'SCRAPING', progress: 10 },
        });

        const allAsins = [analysisJob.userProductAsin, ...analysisJob.competitorAsins];
        const scrapedProducts = [];

        for (let i = 0; i < allAsins.length; i++) {
            const urlOrAsin = allAsins[i];
            const productData = await scrapeProductData(urlOrAsin);

            if (productData) {
                const isUserProduct = i === 0;
                const product = await prisma.product.create({
                    data: {
                        analysisJobId: analysisJobId,
                        asin: productData.asin,
                        title: productData.title,
                        description: productData.description,
                        brand: productData.brand,
                        price: productData.price,
                        listPrice: productData.originalPrice,
                        rating: productData.rating,
                        reviewCount: productData.reviewCount,
                        images: productData.images,
                        isAmazonChoice: productData.isAmazonChoice,
                        isBestSeller: productData.isBestSeller,
                        isUserProduct,
                        ratingDistribution: productData.detailedRating,
                        additionalData: {
                            currency: productData.currency,
                            isPrime: productData.isPrime,
                            availability: productData.availability,
                            numberOfOffers: productData.numberOfOffers,
                            deliveryInfo: productData.deliveryInfo,
                            keyFeatures: productData.keyFeatures,
                            topReviews: productData.topReviews,
                            salesVolume: productData.salesVolume,
                        },
                    },
                });
                scrapedProducts.push(product);
            }
        }

        const progressPercentage = Math.round((scrapedProducts.length / allAsins.length) * 80) + 10;

        await prisma.analysisJob.update({
            where: { id: analysisJobId },
            data: {
                status: 'PROCESSING',
                progress: progressPercentage,
                totalProductsScraped: scrapedProducts.length,
            },
        });

        // Trigger AI analysis asynchronously without blocking the response
        (async () => {
            try {
                const baseUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                
                // For internal API call, get the session token if available
                const aiResponse = await fetch(`${baseUrl}/api/analyze/ai`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': req.headers.get('cookie') || '',
                    },
                    body: JSON.stringify({ analysisJobId }),
                });

                if (!aiResponse.ok) {
                    const errorText = await aiResponse.text();
                    console.error('AI analysis request failed:', aiResponse.status, errorText);
                    
                    // Update job status to FAILED if AI analysis fails
                    await prisma.analysisJob.update({
                        where: { id: analysisJobId },
                        data: {
                            status: 'FAILED',
                            errorMessage: `AI analysis failed: ${aiResponse.status}`,
                        },
                    });
                }
            } catch (error) {
                console.error('Error triggering AI analysis:', error);
                
                // Update job status to FAILED
                try {
                    await prisma.analysisJob.update({
                        where: { id: analysisJobId },
                        data: {
                            status: 'FAILED',
                            errorMessage: error instanceof Error ? error.message : 'AI analysis error',
                        },
                    });
                } catch (updateError) {
                    console.error('Error updating job status:', updateError);
                }
            }
        })();

        return NextResponse.json({
            success: true,
            analysisJobId,
            productsScraped: scrapedProducts.length,
        });
    } catch (error) {
        console.error('Analysis job error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Internal server error',
            },
            { status: 500 }
        );
    }
}
