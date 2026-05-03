import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const client = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

async function generateComprehensiveAnalysis(analysisJob: any, userProduct: any, competitors: any[]) {
    if (!client) {
        throw new Error('Gemini API key not configured');
    }

    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert e-commerce product analyst and market researcher. Generate a COMPLETE professional analysis for the product below.

USER PRODUCT:
- Title: ${userProduct?.title || 'Unknown'}
- ASIN: ${userProduct?.asin || 'Unknown'}
- Price: $${userProduct?.price || 'N/A'}
- Rating: ${userProduct?.rating || 'N/A'}/5
- Reviews: ${userProduct?.reviewCount || 0}
- Brand: ${userProduct?.brand || 'Unknown'}

COMPETITORS (${competitors.length} products):
${competitors.map((c, i) => `${i + 1}. ${c.title} - $${c.price} - ${c.rating}/5 (${c.reviewCount} reviews)`).join('\n')}

SAMPLE REVIEWS:
${userProduct?.reviews?.slice(0, 10).map((r: any) => `"${r.reviewText?.substring(0, 200)}..." (${r.rating}⭐)`).join('\n') || 'No reviews available'}

Return ONLY valid JSON with this exact structure (all fields required, no empty arrays unless truly unavailable):

{
  "productInfo": {
    "asin": "${userProduct?.asin || ''}",
    "title": "${userProduct?.title || ''}",
    "overallScore": ${Math.round((userProduct?.rating || 0) * 20)},
    "scoreBreakdown": {
      "quality": ${Math.round((userProduct?.rating || 0) * 20)},
      "value": ${Math.round((userProduct?.rating || 0) * 16 + 10)},
      "customerSatisfaction": ${Math.round((userProduct?.rating || 0) * 18 + 5)},
      "marketFit": ${Math.round((userProduct?.rating || 0) * 15 + 15)}
    }
  },
  "sentiment": {
    "overall": "${userProduct?.rating && userProduct.rating >= 4 ? 'Very Positive' : userProduct?.rating >= 3 ? 'Mixed' : 'Negative'}",
    "positive": ${Math.round((userProduct?.rating || 0) * 20)},
    "neutral": ${Math.round(30 - (userProduct?.rating || 0) * 5)},
    "negative": ${Math.round(20 - (userProduct?.rating || 0) * 5)},
    "trend": "${userProduct?.reviewCount && userProduct.reviewCount > 100 ? 'Improving' : 'Stable'}",
    "confidence": 0.85
  },
  "strengths": [
    ${userProduct?.rating && userProduct.rating >= 4 ? '{"feature": "High customer satisfaction", "confidence": 0.9, "category": "Quality"}' : ''},
    ${userProduct?.price && userProduct.price < 50 ? '{"feature": "Competitive pricing", "confidence": 0.85, "category": "Value"}' : ''}
  ].filter(Boolean),
  "weaknesses": [
    ${userProduct?.reviewCount && userProduct.reviewCount < 50 ? '{"feature": "Low review volume", "confidence": 0.8, "category": "Social Proof"}' : ''},
    ${!userProduct?.brand || userProduct.brand === 'Unknown' ? '{"feature": "Unknown brand", "confidence": 0.75, "category": "Branding"}' : ''}
  ].filter(Boolean),
  "strengthCount": ${userProduct?.rating && userProduct.rating >= 4 ? 1 : 0},
  "weaknessCount": ${(!userProduct?.brand || userProduct.brand === 'Unknown' || (userProduct.reviewCount && userProduct.reviewCount < 50)) ? 1 : 0},
  "competitivePositioning": {
    "advantage": "${competitors.length > 0 && userProduct?.price && userProduct.price < (competitors[0]?.price || 100) ? 'Lower price point than key competitors' : 'Unique product features'}",
    "disadvantage": "${competitors.length > 0 && userProduct?.reviewCount && userProduct.reviewCount < (competitors[0]?.reviewCount || 0) ? 'Fewer customer reviews than competitors' : 'Limited brand recognition'}",
    "uniqueSellingPoints": ["${userProduct?.title?.split(' ').slice(0, 3).join(' ') || 'Quality product'}"],
    "marketGaps": ["Improve customer review collection", "Enhance product description"],
    "competitiveMoat": "${competitors.length === 0 ? 'First mover advantage' : 'Price competitiveness'}",
    "barriersToEntry": ["Brand building required", "Customer trust needed"]
  },
  "pricingStrategy": {
    "sensitivity": "${userProduct?.price && userProduct.price < 30 ? 'High' : userProduct?.price && userProduct.price > 100 ? 'Low' : 'Medium'}",
    "optimalRange": {
      "min": ${Math.max(0, (userProduct?.price || 0) - 10)},
      "max": ${(userProduct?.price || 0) + 10},
      "recommended": ${userProduct?.price || 0}
    },
    "priceComplaints": 0,
    "valuePerception": "${userProduct?.price && userProduct.price < 50 ? 'Good value for price' : 'Premium positioning'}",
    "competitorPricePositioning": "${competitors.length > 0 && userProduct?.price && userProduct.price < (competitors[0]?.price || 0) ? 'Below average' : 'Above average'}",
    "discountStrategy": "Consider bundle pricing",
    "psychologicalPricing": "Use .99 endings",
    "bundleOpportunities": ["Add accessories bundle"]
  },
  "actionItems": [
    {
      "task": "Optimize product listing with better keywords",
      "priority": "HIGH",
      "owner": "Marketing",
      "timeline": "2 weeks",
      "successMetric": "20% increase in organic traffic",
      "resources": "SEO tools, copywriter"
    },
    {
      "task": "Collect more customer reviews",
      "priority": "HIGH",
      "owner": "Customer Success",
      "timeline": "1 month",
      "successMetric": "50+ new reviews",
      "resources": "Email automation, follow-up system"
    }
  ],
  "marketOpportunities": [
    {
      "opportunity": "Expand to complementary categories",
      "marketSize": "$${Math.round((userProduct?.price || 0) * 10000)}M",
      "competition": "Moderate",
      "entryStrategy": "Start with best-selling variants",
      "potentialRevenue": "$${Math.round((userProduct?.price || 0) * 1000)}K annually",
      "timeline": "3-6 months"
    }
  ],
  "riskFactors": [
    {
      "risk": "Competitor price wars",
      "probability": "MEDIUM",
      "severity": "HIGH",
      "mitigation": "Build brand loyalty",
      "trigger": "Price drop by major competitor",
      "contingency": "Offer value-added services"
    }
  ],
  "productImprovements": [
    {
      "area": "Product quality",
      "suggestion": "Enhance packaging",
      "customerDemand": 65,
      "roiEstimate": "150%",
      "priority": "MEDIUM",
      "implementationCost": "$${Math.round((userProduct?.price || 0) * 2)}",
      "expectedImpact": "Higher customer satisfaction"
    }
  ],
  "listingOptimization": {
    "titleSuggestions": [
      "${userProduct?.title || 'Premium Product'} - Best Quality | Fast Shipping",
      "Top Rated ${userProduct?.title?.split(' ').slice(0, 2).join(' ') || 'Product'} with Free Delivery"
    ],
    "bulletPointSuggestions": [
      {"point": "Premium quality material", "benefit": "Long-lasting durability", "keywords": ["quality", "durable"]},
      {"point": "Fast & free shipping", "benefit": "Get it quickly", "keywords": ["fast shipping", "free delivery"]}
    ],
    "descriptionSuggestions": [
      {"section": "Product Overview", "content": "Experience the best quality with our premium product.", "seoScore": 85}
    ],
    "imageSuggestions": [
      {"type": "Lifestyle", "description": "Show product in use", "priority": "HIGH", "expectedCTR": 15},
      {"type": "Close-up", "description": "Highlight features", "priority": "MEDIUM", "expectedCTR": 10}
    ],
    "backendKeywords": [
      {"keyword": "premium quality", "searchVolume": "10K", "competition": "MEDIUM"},
      {"keyword": "best value", "searchVolume": "8K", "competition": "HIGH"}
    ],
    "aPlusContent": [
      {"module": "Comparison Chart", "content": "Compare with competitors", "expectedImpact": "Higher conversions"}
    ]
  },
  "customerPersonas": [
    {
      "name": "Value Seeker",
      "percentage": 45,
      "demographics": {"age": "25-40", "income": "Medium"},
      "needs": ["Good price", "Fast shipping"],
      "painPoints": ["High prices", "Slow delivery"],
      "personaKeywords": ["affordable", "cheap", "value"],
      "buyingMotivations": ["Price", "Reviews"],
      "priceSensitivity": "HIGH",
      "loyaltyPotential": "MEDIUM"
    },
    {
      "name": "Quality Buyer",
      "percentage": 35,
      "demographics": {"age": "35-55", "income": "High"},
      "needs": ["Premium features", "Brand trust"],
      "painPoints": ["Low quality", "Poor support"],
      "personaKeywords": ["premium", "luxury", "high-end"],
      "buyingMotivations": ["Quality", "Brand"],
      "priceSensitivity": "LOW",
      "loyaltyPotential": "HIGH"
    }
  ],
  "marketIntelligence": {
    "demandScore": ${Math.min(95, 50 + (userProduct?.reviewCount || 0) / 10)},
    "saturationLevel": "${competitors.length > 5 ? 'HIGH' : competitors.length > 2 ? 'MEDIUM' : 'LOW'}",
    "buyerUrgency": "${userProduct?.price && userProduct.price < 50 ? 'HIGH' : 'MEDIUM'}",
    "substitutionThreat": [
      {"threat": "Alternative products", "severity": "MEDIUM", "alternatives": ["Similar items from other brands"]}
    ],
    "marketSize": "$${Math.round((userProduct?.price || 0) * 100000)}M",
    "growthRate": "${Math.round(5 + Math.random() * 15)}%",
    "entryBarriers": ["Brand building", "Customer acquisition"],
    "regulatoryFactors": ["Product safety compliance"],
    "technologyTrends": ["AI personalization", "Mobile optimization"]
  },
  "summary": {
    "executiveSummary": "This product shows ${userProduct?.rating && userProduct.rating >= 4 ? 'strong' : 'moderate'} potential in the market with ${userProduct?.reviewCount || 0} reviews and a ${userProduct?.rating || 0}/5 rating. ${competitors.length > 0 ? `Key competitors include ${competitors[0]?.title} with ${competitors[0]?.reviewCount} reviews.` : 'First mover advantage available.'} Focus on ${userProduct?.reviewCount && userProduct.reviewCount < 50 ? 'collecting more reviews and' : 'improving'} product visibility to capture market share.",
    "top3Actions": [
      {"action": "Optimize product listing", "priority": "HIGH", "expectedOutcome": "Increased traffic", "timeline": "2 weeks"},
      {"action": "Collect customer reviews", "priority": "HIGH", "expectedOutcome": "Social proof", "timeline": "1 month"},
      {"action": "Monitor competitor pricing", "priority": "MEDIUM", "expectedOutcome": "Stay competitive", "timeline": "Ongoing"}
    ],
    "riskFactors": [
      {"risk": "Competitor advantage", "probability": "MEDIUM", "impact": "HIGH", "mitigation": "Differentiate product"}
    ],
    "keyFindings": [
      {"finding": "${userProduct?.rating && userProduct.rating >= 4 ? 'Good customer satisfaction' : 'Room for quality improvement'}", "evidence": "Based on ${userProduct?.reviewCount || 0} reviews", "importance": "HIGH"}
    ],
    "strategicRecommendations": [
      {"recommendation": "Invest in marketing", "resources": "$${Math.round((userProduct?.price || 0) * 500)} budget", "expectedROI": "200%"}
    ]
  },
  "reviewHighlights": {
    "bestQuote": "${userProduct?.reviews?.find((r: any) => r.rating >= 4)?.reviewText?.substring(0, 100) || 'Great product!'}",
    "worstQuote": "${userProduct?.reviews?.find((r: any) => r.rating <= 2)?.reviewText?.substring(0, 100) || 'N/A'}",
    "mostHelpfulPositive": "",
    "mostHelpfulNegative": "",
    "recurringPhrases": ["good quality", "fast shipping"],
    "themes": [
      {"theme": "Quality", "mentions": ${Math.min(50, (userProduct?.reviewCount || 0) / 2)}, "sentiment": "${userProduct?.rating && userProduct.rating >= 4 ? 'Positive' : 'Mixed'}"}
    ]
  },
  "trends": {
    "temporal": [],
    "emergingIssues": [
      {"issue": "Increased competition", "severity": "MEDIUM", "trend": "Rising"}
    ],
    "seasonalPatterns": [
      {"pattern": "Q4 peak", "peak": "November-December", "impact": "HIGH"}
    ],
    "ratingCorrelation": {},
    "priceElasticity": "${userProduct?.price && userProduct.price < 50 ? 'High' : 'Medium'}",
    "demandForecast": "${Math.round(10 + Math.random() * 20)}% growth next quarter"
  },
  "purchaseCriteria": {
    "topCriteria": [
      {"criterion": "Price", "mentionCount": ${Math.round((userProduct?.reviewCount || 0) * 0.3)}, "percentage": 30, "sentiment": "Neutral"},
      {"criterion": "Quality", "mentionCount": ${Math.round((userProduct?.reviewCount || 0) * 0.4)}, "percentage": 40, "sentiment": "Positive"}
    ],
    "mentionPercentages": {"price": 0.3, "quality": 0.4, "shipping": 0.2},
    "sentimentScores": {"price": 0.6, "quality": 0.8}
  },
  "additionalData": {
    "charts": {
      "priceComparison": ${JSON.stringify(competitors.map(c => ({ competitor: c.title.substring(0, 20), price: c.price, feature: "Base" })))},
      "sentimentTimeline": [],
      "marketShare": [],
      "keywordDensity": {},
      "reviewGrowth": []
    },
    "metrics": {
      "totalAddressableMarket": "$${Math.round((userProduct?.price || 0) * 1000000)}M",
      "serviceableAvailableMarket": "$${Math.round((userProduct?.price || 0) * 100000)}M",
      "serviceableObtainableMarket": "$${Math.round((userProduct?.price || 0) * 10000)}M",
      "customerAcquisitionCost": "$${Math.round((userProduct?.price || 0) * 0.2)}",
      "lifetimeValue": "$${Math.round((userProduct?.price || 0) * 2)}",
      "paybackPeriod": "${Math.round(3 + Math.random() * 6)} months"
    },
    "benchmarks": {
      "industryAverageRating": ${(3.5 + Math.random()).toFixed(1)},
      "averagePricePoint": ${Math.round((userProduct?.price || 0) * (0.8 + Math.random() * 0.4))},
      "typicalReviewCount": ${Math.round((userProduct?.reviewCount || 0) * 1.5)}
    },
    "nlpInsights": {
      "topicClusters": ["Quality", "Price", "Shipping"],
      "entityRecognition": ["Brand", "Materials"],
      "emotionAnalysis": {"joy": 0.6, "anger": 0.1, "sadness": 0.1}
    },
    "competitiveIntelligence": {
      "winLossAnalysis": "Competitors win on price and reviews",
      "featureGapMatrix": {},
      "swotAnalysis": {
        "strengths": ["Good product quality"],
        "weaknesses": ["Limited reviews"],
        "opportunities": ["Market expansion"],
        "threats": ["Competitor pricing"]
      }
    }
  },
  "insights": {
    "quickWins": [
      {"insight": "Optimize title for SEO", "effort": "LOW", "impact": "HIGH", "timeline": "1 day"}
    ],
    "longTermStrategies": [
      {"strategy": "Build brand presence", "investment": "$5K", "returnHorizon": "6-12 months"}
    ],
    "differentiators": [
      {"differentiator": "Product quality", "uniqueness": "HIGH", "defensibility": "MEDIUM"}
    ]
  },
  "isCompleted": true,
  "completedAt": "${new Date().toISOString()}"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let responseText = response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
    }

    return JSON.parse(jsonMatch[0]);
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
            include: {
                user: true,
                products: {
                    include: {
                        reviews: {
                            take: 20,
                            orderBy: { helpfulCount: 'desc' },
                        },
                    },
                },
            },
        });

        if (!analysisJob) {
            return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
        }

        if (analysisJob.user?.email !== session.user.email) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.analysisJob.update({
            where: { id: analysisJobId },
            data: { status: 'ANALYZING', progress: 50 },
        });

        const userProduct = analysisJob.products.find((p) => p.isUserProduct);
        const competitors = analysisJob.products.filter((p) => !p.isUserProduct);

        const analysis = await generateComprehensiveAnalysis(analysisJob, userProduct, competitors);

        await prisma.analysisJob.update({
            where: { id: analysisJobId },
            data: {
                status: 'COMPLETED',
                progress: 100,
                analysisResults: analysis as any,
                purchaseCriteria: analysis.purchaseCriteria,
                sentiment: analysis.sentiment,
                strengths: analysis.strengths,
                weaknesses: analysis.weaknesses,
                painPoints: analysis.painPoints,
                delighters: analysis.delighters,
                competitivePositioning: analysis.competitivePositioning,
                reviewHighlights: analysis.reviewHighlights,
                trends: analysis.trends,
                productImprovements: analysis.productImprovements,
                listingOptimization: analysis.listingOptimization,
                pricingStrategy: analysis.pricingStrategy,
                customerPersonas: analysis.customerPersonas,
                marketIntelligence: analysis.marketIntelligence,
                summary: analysis.summary,
                actionItems: analysis.actionItems,
                marketOpportunities: analysis.marketOpportunities,
                riskFactors: analysis.riskFactors,
                additionalData: analysis.additionalData,
                additionalInsights: analysis.insights,
                overallScore: analysis.productInfo?.overallScore || null,
                executiveSummary: analysis.summary?.executiveSummary || null,
                completedAt: new Date(),
            },
        });

        try {
            const opportunitiesPrompt = `Based on this analysis, generate 5-8 specific actionable opportunities:

${JSON.stringify(analysis, null, 2)}

Return JSON: { "opportunities": [{"title": "", "description": "", "category": "", "impact": "HIGH|MEDIUM|LOW", "effort": "EASY|MEDIUM|HARD", "confidenceScore": 0-100, "estimatedImpact": "", "customerDemand": "", "competitorGap": "", "sampleQuotes": [], "actionSteps": [], "priorityScore": 0-100}] }`;

            const model = client!.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const oppResult = await model.generateContent(opportunitiesPrompt);
            const oppText = oppResult.response.text();
            const oppJsonMatch = oppText.match(/\{[\s\S]*\}/);

            if (oppJsonMatch) {
                const oppData = JSON.parse(oppJsonMatch[0]);
                const opportunities = oppData.opportunities || [];

                await prisma.opportunity.deleteMany({ where: { analysisJobId } });

                for (const opp of opportunities) {
                    await prisma.opportunity.create({
                        data: {
                            analysisJobId,
                            title: opp.title || 'Market Opportunity',
                            description: opp.description || '',
                            category: opp.category || 'Other',
                            impact: opp.impact || 'MEDIUM',
                            effort: opp.effort || 'MEDIUM',
                            confidenceScore: opp.confidenceScore || 70,
                            estimatedImpact: opp.estimatedImpact,
                            customerDemand: opp.customerDemand,
                            competitorGap: opp.competitorGap,
                            sampleQuotes: opp.sampleQuotes || [],
                            actionSteps: opp.actionSteps || [],
                            priorityScore: opp.priorityScore || 50,
                            status: 'pending',
                            fullData: opp,
                        },
                    });
                }
            }
        } catch (oppError) {
            console.error('Error generating opportunities:', oppError);
        }

        return NextResponse.json({
            success: true,
            analysisJobId,
            analysis,
        });
    } catch (error) {
        console.error('Error generating analysis:', error);

        if (error instanceof Error && error.message.includes('analysisJobId')) {
            const body = await req.json().catch(() => ({}));
            const jobId = body.analysisJobId;
            if (jobId) {
                await prisma.analysisJob.update({
                    where: { id: jobId },
                    data: {
                        status: 'FAILED',
                        errorMessage: error.message,
                    },
                });
            }
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate analysis' },
            { status: 500 }
        );
    }
}