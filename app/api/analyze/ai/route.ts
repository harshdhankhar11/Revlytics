import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const client = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

async function analyzeWithGemini(products: any[]): Promise<any> {
    if (!client) {
        throw new Error('Gemini API key not configured');
    }

    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const userProduct = products.find((p) => p.isUserProduct);
    const competitors = products.filter((p) => !p.isUserProduct);

    const prompt = `You are an expert product analyst and market researcher. Given the following product data, generate a COMPLETE professional market analysis report. Output ONLY valid JSON.

USER PRODUCT:
${JSON.stringify(userProduct, null, 2)}

COMPETITORS (${competitors.length} products):
${JSON.stringify(competitors, null, 2)}

REQUIRED OUTPUT - Return this EXACT JSON structure with ALL fields populated (no empty arrays/objects unless truly unavailable):

{
  "productInfo": {
    "asin": "",
    "title": "",
    "overallScore": 0,
    "scoreBreakdown": {
      "quality": 0,
      "value": 0,
      "customerSatisfaction": 0,
      "marketFit": 0
    }
  },
  "purchaseCriteria": {
    "topCriteria": [{"criterion": "", "mentionCount": 0, "percentage": 0, "sentiment": ""}],
    "mentionPercentages": {},
    "sentimentScores": {}
  },
  "sentiment": {
    "overall": "",
    "positive": 0,
    "neutral": 0,
    "negative": 0,
    "trend": "",
    "confidence": 0.95
  },
  "strengths": [{"feature": "", "confidence": 0, "quote": "", "impact": "", "category": ""}],
  "weaknesses": [{"feature": "", "confidence": 0, "quote": "", "impact": "", "category": ""}],
  "strengthCount": 0,
  "weaknessCount": 0,
  "painPoints": {
    "items": [{"point": "", "frequency": 0, "severity": "", "affectedUsers": 0}],
    "frequencies": {},
    "severity": {}
  },
  "delighters": {
    "items": [{"feature": "", "frequency": 0, "impact": "", "sentimentBoost": 0}],
    "frequencies": {},
    "impact": {}
  },
  "competitivePositioning": {
    "advantage": "",
    "disadvantage": "",
    "uniqueSellingPoints": [""],
    "marketGaps": [{"gap": "", "opportunity": "", "urgency": ""}],
    "competitiveMoat": "",
    "barriersToEntry": [""]
  },
  "opportunities": [{
    "title": "",
    "description": "",
    "impact": "",
    "effort": "",
    "confidence": 0,
    "timeline": "",
    "estimatedROI": ""
  }],
  "reviewHighlights": {
    "bestQuote": "",
    "worstQuote": "",
    "mostHelpfulPositive": "",
    "mostHelpfulNegative": "",
    "recurringPhrases": [{"phrase": "", "count": 0, "sentiment": ""}],
    "themes": [{"theme": "", "mentions": 0, "sentiment": ""}]
  },
  "trends": {
    "temporal": [{"period": "", "metric": "", "value": 0, "direction": ""}],
    "emergingIssues": [{"issue": "", "severity": "", "trend": ""}],
    "seasonalPatterns": [{"pattern": "", "peak": "", "impact": ""}],
    "ratingCorrelation": {},
    "priceElasticity": "",
    "demandForecast": ""
  },
  "productImprovements": [{
    "area": "",
    "suggestion": "",
    "customerDemand": 0,
    "roiEstimate": "",
    "priority": "",
    "implementationCost": "",
    "expectedImpact": ""
  }],
  "listingOptimization": {
    "titleSuggestions": [{"suggestion": "", "score": 0, "keywords": []}],
    "bulletPointSuggestions": [{"point": "", "benefit": "", "keywords": []}],
    "descriptionSuggestions": [{"section": "", "content": "", "seoScore": 0}],
    "imageSuggestions": [{"type": "", "description": "", "priority": "", "expectedCTR": 0}],
    "backendKeywords": [{"keyword": "", "searchVolume": "", "competition": ""}],
    "aPlusContent": [{"module": "", "content": "", "expectedImpact": ""}]
  },
  "pricingStrategy": {
    "sensitivity": "",
    "optimalRange": {"min": 0, "max": 0, "recommended": 0},
    "priceComplaints": 0,
    "valuePerception": "",
    "competitorPricePositioning": "",
    "discountStrategy": "",
    "psychologicalPricing": "",
    "bundleOpportunities": [""]
  },
  "customerPersonas": [{
    "name": "",
    "percentage": 0,
    "demographics": {},
    "needs": [""],
    "painPoints": [""],
    "personaKeywords": [""],
    "buyingMotivations": [""],
    "priceSensitivity": "",
    "loyaltyPotential": ""
  }],
  "marketIntelligence": {
    "demandScore": 0,
    "saturationLevel": "",
    "buyerUrgency": "",
    "substitutionThreat": [{"threat": "", "severity": "", "alternatives": []}],
    "marketSize": "",
    "growthRate": "",
    "entryBarriers": [""],
    "regulatoryFactors": [""],
    "technologyTrends": [""]
  },
  "summary": {
    "executiveSummary": "",
    "top3Actions": [{"action": "", "priority": "", "expectedOutcome": "", "timeline": ""}],
    "riskFactors": [{"risk": "", "probability": "", "impact": "", "mitigation": ""}],
    "keyFindings": [{"finding": "", "evidence": "", "importance": ""}],
    "strategicRecommendations": [{"recommendation": "", "resources": "", "expectedROI": ""}]
  },
  "actionItems": [{
    "task": "",
    "priority": "",
    "owner": "",
    "timeline": "",
    "successMetric": "",
    "resources": ""
  }],
  "marketOpportunities": [{
    "opportunity": "",
    "marketSize": "",
    "competition": "",
    "entryStrategy": "",
    "potentialRevenue": "",
    "timeline": ""
  }],
  "riskFactors": [{
    "risk": "",
    "probability": "",
    "severity": "",
    "mitigation": "",
    "trigger": "",
    "contingency": ""
  }],
  "additionalData": {
    "charts": {
      "priceComparison": [{"competitor": "", "price": 0, "feature": ""}],
      "sentimentTimeline": [],
      "marketShare": [],
      "keywordDensity": {},
      "reviewGrowth": []
    },
    "metrics": {
      "totalAddressableMarket": "",
      "serviceableAvailableMarket": "",
      "serviceableObtainableMarket": "",
      "customerAcquisitionCost": "",
      "lifetimeValue": "",
      "paybackPeriod": ""
    },
    "benchmarks": {
      "industryAverageRating": 0,
      "averagePricePoint": 0,
      "typicalReviewCount": 0
    },
    "nlpInsights": {
      "topicClusters": [],
      "entityRecognition": [],
      "emotionAnalysis": {}
    },
    "competitiveIntelligence": {
      "winLossAnalysis": "",
      "featureGapMatrix": {},
      "swotAnalysis": {
        "strengths": [],
        "weaknesses": [],
        "opportunities": [],
        "threats": []
      }
    }
  },
  "insights": {
    "quickWins": [{"insight": "", "effort": "", "impact": "", "timeline": ""}],
    "longTermStrategies": [{"strategy": "", "investment": "", "returnHorizon": ""}],
    "differentiators": [{"differentiator": "", "uniqueness": "", "defensibility": ""}]
  },
  "isCompleted": true,
  "completedAt": ""
}

IMPORTANT:
- Every field must have data - use intelligent defaults based on available information
- For missing numeric data, calculate estimates based on similar products
- For text fields, generate professional content based on available product attributes
- Ensure arrays have at least 3-5 items each (no empty arrays)
- Provide realistic confidence scores (0.7-0.95) based on data completeness
- Include actionable, specific recommendations (not generic statements)
- All monetary values should be in USD

Generate the complete JSON now.`;

    let result: any;
    try {
        result = await model.generateContent(prompt as any);
    } catch (e: any) {
        console.error('Gemini generateContent error:', e);
        throw e;
    }

    const resp = result?.response as any;

    let responseText = '';
    try {
        if (resp?.candidates && resp.candidates.length > 0) {
            const parts = resp.candidates[0]?.content?.parts || [];
            responseText = parts.map((p: any) => p?.text || '').join('\n');
        } else if (typeof resp === 'string') {
            responseText = resp;
        } else if (resp?.text) {
            responseText = resp.text;
        } else {
            responseText = JSON.stringify(resp);
        }
    } catch (e) {
        responseText = String(resp);
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        try {
            return JSON.parse(responseText);
        } catch (e) {
            throw new Error('Failed to parse Gemini response');
        }
    }

    try {
        const parsed = JSON.parse(jsonMatch[0]);
        // Ensure all required sections exist
        return {
            productInfo: parsed.productInfo || { asin: '', title: '', overallScore: 0, scoreBreakdown: {} },
            purchaseCriteria: parsed.purchaseCriteria || { topCriteria: [], mentionPercentages: {}, sentimentScores: {} },
            sentiment: parsed.sentiment || { overall: 'Neutral', positive: 0, neutral: 0, negative: 0, trend: 'Stable', confidence: 0.8 },
            strengths: parsed.strengths || [],
            weaknesses: parsed.weaknesses || [],
            strengthCount: parsed.strengthCount || 0,
            weaknessCount: parsed.weaknessCount || 0,
            painPoints: parsed.painPoints || { items: [], frequencies: {}, severity: {} },
            delighters: parsed.delighters || { items: [], frequencies: {}, impact: {} },
            competitivePositioning: parsed.competitivePositioning || { advantage: '', disadvantage: '', uniqueSellingPoints: [], marketGaps: [], competitiveMoat: '', barriersToEntry: [] },
            opportunities: parsed.opportunities || [],
            reviewHighlights: parsed.reviewHighlights || { bestQuote: '', worstQuote: '', recurringPhrases: [], themes: [] },
            trends: parsed.trends || { temporal: [], emergingIssues: [], seasonalPatterns: [], ratingCorrelation: {}, priceElasticity: '', demandForecast: '' },
            productImprovements: parsed.productImprovements || [],
            listingOptimization: parsed.listingOptimization || { titleSuggestions: [], bulletPointSuggestions: [], descriptionSuggestions: [], imageSuggestions: [], backendKeywords: [], aPlusContent: [] },
            pricingStrategy: parsed.pricingStrategy || { sensitivity: '', optimalRange: { min: 0, max: 0, recommended: 0 }, priceComplaints: 0, valuePerception: '' },
            customerPersonas: parsed.customerPersonas || [],
            marketIntelligence: parsed.marketIntelligence || { demandScore: 0, saturationLevel: '', buyerUrgency: '', substitutionThreat: [], marketSize: '', growthRate: '', entryBarriers: [], regulatoryFactors: [], technologyTrends: [] },
            summary: parsed.summary || { executiveSummary: '', top3Actions: [], riskFactors: [], keyFindings: [], strategicRecommendations: [] },
            actionItems: parsed.actionItems || [],
            marketOpportunities: parsed.marketOpportunities || [],
            riskFactors: parsed.riskFactors || [],
            additionalData: parsed.additionalData || { charts: {}, metrics: {}, benchmarks: {}, nlpInsights: {}, competitiveIntelligence: {} },
            insights: parsed.insights || { quickWins: [], longTermStrategies: [], differentiators: [] },
            isCompleted: true,
            completedAt: new Date().toISOString()
        };
    } catch (e) {
        throw new Error('Failed to JSON.parse Gemini extracted content');
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (body.analysisJobId) {
            const { analysisJobId } = body;

            const analysisJob = await prisma.analysisJob.findUnique({
                where: { id: analysisJobId },
                include: { user: true, products: true },
            });

            if (!analysisJob) {
                return NextResponse.json({ error: 'Analysis job not found' }, { status: 404 });
            }

            const session = await getServerSession(authOptions);
            if (session?.user?.email && session.user.email !== analysisJob.user?.email) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            await prisma.analysisJob.update({
                where: { id: analysisJobId },
                data: { status: 'ANALYZING', progress: 85 },
            });

            const analysis = await analyzeWithGemini(analysisJob.products);

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
                    overallScore: analysis.productInfo?.overallScore ?? null,
                    executiveSummary: analysis.summary?.executiveSummary ?? null,
                    completedAt: new Date(),
                },
            });

            return NextResponse.json({
                success: true,
                analysisJobId,
                analysis: analysis,
                isCompleted: true,
            });
        }

        if (body.products && Array.isArray(body.products) && body.products.length > 0) {
            const session = await getServerSession(authOptions);
            const userId = (session?.user as any)?.id as string | undefined;
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const productsPayload: any[] = body.products;
            const userProduct = productsPayload[0];
            const competitorProducts = productsPayload.slice(1);

            const analysisJob = await prisma.analysisJob.create({
                data: {
                    userId: userId as string,
                    userProductUrl: userProduct.link || userProduct.asin || '',
                    competitorUrls: competitorProducts.map((p) => p.link || p.asin || ''),
                    userProductAsin: userProduct.asin || '',
                    competitorAsins: competitorProducts.map((p) => p.asin || ''),
                    status: 'ANALYZING',
                    progress: 5,
                },
            });

            const createdProducts: any[] = [];
            for (let i = 0; i < productsPayload.length; i++) {
                const p = productsPayload[i];
                try {
                    const prod = await prisma.product.create({
                        data: {
                            analysisJobId: analysisJob.id,
                            asin: p.asin || `${analysisJob.id}-${i}`,
                            title: p.title || p.productName || 'Unknown Product',
                            description: p.description || null,
                            brand: p.brand || null,
                            price: typeof p.price === 'number' ? p.price : p.currentPrice ?? null,
                            listPrice: p.listPrice ?? null,
                            rating: p.rating ?? null,
                            reviewCount: p.reviewCount ?? p.reviews ?? 0,
                            images: p.images || (p.imageUrl ? [p.imageUrl] : []),
                            isUserProduct: i === 0,
                            additionalData: p.additionalData || {},
                        },
                    });

                    if (Array.isArray(p.reviews) && p.reviews.length > 0) {
                        for (const r of p.reviews) {
                            try {
                                await prisma.review.create({
                                    data: {
                                        productId: prod.id,
                                        asin: prod.asin,
                                        reviewText: r.text || r.reviewText || '',
                                        reviewTitle: r.title || null,
                                        rating: Math.round(r.rating) || 0,
                                        verifiedPurchase: !!r.verified,
                                        reviewDate: r.date ? new Date(r.date) : new Date(),
                                        authorName: r.reviewer || r.authorName || null,
                                        helpfulCount: r.helpfulVotes || 0,
                                    },
                                });
                            } catch (revErr) {
                                console.error('Failed to create review', revErr);
                            }
                        }
                    }

                    createdProducts.push(prod);
                } catch (prodErr) {
                    console.error('Failed to create product', prodErr);
                }
            }

            (async () => {
                try {
                    await prisma.analysisJob.update({ where: { id: analysisJob.id }, data: { status: 'ANALYZING', progress: 85 } });

                    const productsFromDb = await prisma.product.findMany({ where: { analysisJobId: analysisJob.id } });
                    const analysis = await analyzeWithGemini(productsFromDb as any[]);

                    await prisma.analysisJob.update({
                        where: { id: analysisJob.id },
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
                            overallScore: analysis.productInfo?.overallScore ?? null,
                            executiveSummary: analysis.summary?.executiveSummary ?? null,
                            completedAt: new Date(),
                        },
                    });
                } catch (bgErr) {
                    console.error('Background AI analysis error', bgErr);
                    try {
                        await prisma.analysisJob.update({ where: { id: analysisJob.id }, data: { status: 'FAILED', errorMessage: bgErr instanceof Error ? bgErr.message : String(bgErr) } });
                    } catch (uErr) {
                        console.error('Failed to mark job FAILED', uErr);
                    }
                }
            })();

            return NextResponse.json({ success: true, analysisJobId: analysisJob.id });
        }

        return NextResponse.json({ error: 'Missing analysisJobId or products payload' }, { status: 400 });
    } catch (error) {
        console.error('AI analysis error:', error);

        const body = await req.json().catch(() => ({}));
        const jobId = body.analysisJobId;

        if (jobId) {
            try {
                await prisma.analysisJob.update({
                    where: { id: jobId },
                    data: {
                        status: 'FAILED',
                        errorMessage: error instanceof Error ? error.message : 'AI analysis failed',
                    },
                });
            } catch (updateError) {
                console.error('Error updating job to FAILED:', updateError);
            }
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'AI analysis failed' },
            { status: 500 }
        );
    }
}