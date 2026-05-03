import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.OMKAR_API_KEY;
const API_BASE = 'https://amazon-scraper-api.omkar.cloud';

async function resolveShortUrl(shortUrl: string): Promise<string | null> {
    try {
        const response = await axios.get(shortUrl, {
            maxRedirects: 5,
            timeout: 5000,
        });
        return response.request.res.responseUrl || response.config.url;
    } catch (error) {
        return null;
    }
}

function extractAsinFromUrl(urlString: string): string | null {
    try {
        const fullUrlMatch = urlString.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
        if (fullUrlMatch) {
            return fullUrlMatch[1];
        }

        if (/^B0[A-Z0-9]{8}$/.test(urlString)) {
            return urlString;
        }

        return null;
    } catch (error) {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let { asin, countryCode = 'US' } = body;

        if (!asin) {
            return NextResponse.json({ error: 'Missing ASIN or URL' }, { status: 400 });
        }

        let urlToProcess = asin;

        if (asin.includes('http') || asin.includes('amzn.')) {
            if (asin.includes('amzn.in') || asin.includes('amzn.to') || asin.includes('amzn.')) {
                const resolved = await resolveShortUrl(asin);
                if (resolved) {
                    urlToProcess = resolved;
                }
            }

            const extractedAsin = extractAsinFromUrl(urlToProcess);
            if (extractedAsin) {
                asin = extractedAsin;
            }
        }

        if (!asin || !/^B0[A-Z0-9]{8}$/.test(asin)) {
            return NextResponse.json({ error: 'Invalid ASIN format. Please provide a valid Amazon product link.' }, { status: 400 });
        }

        if (!API_KEY) {
            console.error('OMKAR_API_KEY is not configured');
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        console.log(`Fetching product for ASIN: ${asin}`);

        const url = `${API_BASE}/amazon/product-details`;

        const response = await axios.get(url, {
            params: {
                asin: asin,
                country_code: countryCode,
            },
            headers: {
                'API-Key': API_KEY,
            },
            timeout: 10000,
        });

        const data = response.data;

        if (!data || (!data.product_name && !data.asin)) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            asin: data.asin || asin,
            productName: data.product_name || 'Unknown Product',
            currentPrice: data.current_price || null,
            originalPrice: data.original_price || null,
            rating: data.rating || null,
            reviews: data.reviews || 0,
            imageUrl: data.main_image_url || null,
            isAmazonChoice: data.is_amazon_choice || false,
            isBestSeller: data.is_bestseller || false,
            isPrime: data.is_prime || false,
            currency: data.currency || 'USD',
            link: data.link || `https://www.amazon.com/dp/${asin}`,
        });
    } catch (error) {
        console.error('Error fetching product details:', error);

        if (error instanceof Error) {
            if (error.message.includes('timeout')) {
                return NextResponse.json(
                    { error: 'Request timeout - API took too long to respond' },
                    { status: 504 }
                );
            }
        }

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to fetch product details',
            },
            { status: 500 }
        );
    }
}
