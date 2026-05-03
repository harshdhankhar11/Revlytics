// app/api/opportunities/ai/market-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const client = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // FIXED: Remove marketOpportunities from include since it's a JSON field
        const userAnalyses = await prisma.analysisJob.findMany({
            where: { userId: user.id },
            include: {
                products: {
                    select: {
                        title: true,
                        asin: true,
                        isUserProduct: true,
                        price: true,
                        rating: true,
                        reviewCount: true,
                        brand: true,
                        category: true,
                        bsr: true,
                        isAmazonChoice: true,
                        isBestSeller: true,
                    },
                },
                opportunities: true,
                // marketOpportunities is JSON, not a relation - remove from include
                // summary is JSON, not a relation - remove from include
                // pricingStrategy is JSON, not a relation - remove from include
                // customerPersonas is JSON, not a relation - remove from include
            },
            orderBy: { completedAt: 'desc' },
            take: 1,
        });

        if (userAnalyses.length === 0) {
            return NextResponse.json(
                { error: 'No analyses found. Please run an analysis first.' },
                { status: 400 }
            );
        }

        const analysisJob = userAnalyses[0];
        const userProduct = analysisJob.products.find((p) => p.isUserProduct);
        const competitors = analysisJob.products.filter((p) => !p.isUserProduct) || [];

        if (!userProduct) {
            return NextResponse.json(
                { error: 'No user product found in analyses' },
                { status: 400 }
            );
        }

        // Get JSON fields separately since they're not in include
        const existingMarketOpportunities = analysisJob.marketOpportunities as any[] || [];
        const existingSummary = analysisJob.summary as any || null;
        const existingPricingStrategy = analysisJob.pricingStrategy as any || null;
        const existingCustomerPersonas = analysisJob.customerPersonas as any[] || [];

        const existingCount = existingMarketOpportunities.length;

        const productSummary = `
PRODUCT DETAILS:
- Title: ${userProduct.title}
- ASIN: ${userProduct.asin}
- Brand: ${userProduct.brand || 'Unknown'}
- Category: ${userProduct.category || 'Unknown'}
- Price: $${userProduct.price || 'N/A'}
- Rating: ${userProduct.rating || 'N/A'}/5
- Reviews: ${userProduct.reviewCount || 0}
- BSR: ${userProduct.bsr || 'N/A'}
- Amazon's Choice: ${userProduct.isAmazonChoice ? 'Yes' : 'No'}
- Best Seller: ${userProduct.isBestSeller ? 'Yes' : 'No'}

COMPETITOR MARKET (${competitors.length} products):
${competitors
                .map(
                    (c, i) => `
${i + 1}. ${c.title}
   - Brand: ${c.brand || 'Unknown'}
   - Price: $${c.price || 'N/A'}
   - Rating: ${c.rating || 'N/A'}/5
   - Reviews: ${c.reviewCount || 0}
   - BSR: ${c.bsr || 'N/A'}
   - ${c.isAmazonChoice ? 'Amazon Choice' : ''} ${c.isBestSeller ? 'Best Seller' : ''}
`
                )
                .join('')}

EXISTING MARKET OPPORTUNITIES IDENTIFIED (${existingCount}):
${existingMarketOpportunities.length > 0
                ? existingMarketOpportunities.map((opp, i) => `${i + 1}. ${typeof opp === 'string' ? opp : opp.opportunity || opp.title || JSON.stringify(opp)}`).join('\n')
                : 'No existing opportunities recorded'}

PREVIOUS ANALYSIS INSIGHTS:
- Pricing Strategy: ${JSON.stringify(existingPricingStrategy || {})}
- Summary: ${JSON.stringify(existingSummary || {})}
- Customer Personas: ${JSON.stringify(existingCustomerPersonas || [])}
`;

        const prompt = `
You are an expert Amazon seller market analyst and strategic consultant. Analyze this product and market data to identify UNIQUE, NON-OBIVIOUS market expansion opportunities that haven't been explored before.

${productSummary}

IMPORTANT: 
1. Do NOT repeat any of the ${existingCount} existing opportunities listed above
2. Focus on FRESH, INNOVATIVE strategies that competitors are missing
3. Consider the specific brand, category, and market position

Based on this market analysis, identify 5-8 NEW MARKET EXPANSION OPPORTUNITIES for this seller. These should focus on:

OPPORTUNITY CATEGORIES:
- New Market Entry (different customer segments)
- Category Diversification (related product categories)
- Brand Extension (new product lines under same brand)
- Geographic Expansion (new regions/countries)
- Channel Strategy (B2B, wholesale, subscriptions)
- Strategic Partnerships (influencers, complementary brands)
- Platform Expansion (Walmart, eBay, Etsy, Shopify)
- Product Line Deepening (variants, bundles, accessories)
- Vertical Integration (manufacturing, logistics)
- International Expansion (Amazon Global, specific countries)
- Niche Domination (micro-segments within category)

For each opportunity, provide DETAILED analysis:

1. title: Compelling, action-oriented title
2. description: 3-4 sentence strategic explanation including market size potential
3. category: One of the categories above
4. impact: HIGH/MEDIUM/LOW
5. effort: EASY/MEDIUM/HARD
6. confidenceScore: 0-100
7. estimatedImpact: Specific metric (e.g., "+$50-100K annual revenue", "30% market share growth")
8. customerDemand: Specific data point from reviews/market
9. competitorGap: Specific gap identified
10. sampleQuotes: 2 sample customer statements or market indicators
11. actionSteps: 4-6 specific, actionable steps with estimated timeline
12. marketSize: Estimated TAM/SAM/SOM
13. timeline: Expected time to first revenue
14. investmentNeeded: Estimated upfront investment
15. roiProjection: Expected ROI

Return response as valid JSON only (no markdown, no extra text):

{
  "opportunities": [
    {
      "title": "string",
      "description": "string",
      "category": "string",
      "impact": "HIGH|MEDIUM|LOW",
      "effort": "EASY|MEDIUM|HARD",
      "confidenceScore": number,
      "estimatedImpact": "string",
      "customerDemand": "string",
      "competitorGap": "string",
      "sampleQuotes": ["string", "string"],
      "actionSteps": ["string", "string", "string", "string"],
      "marketSize": "string",
      "timeline": "string",
      "investmentNeeded": "string",
      "roiProjection": "string"
    }
  ],
  "marketAnalysis": {
    "totalAddressableMarket": "string",
    "growthRate": "string",
    "keyTrends": ["string", "string", "string"],
    "barriersToEntry": ["string", "string"],
    "successMetrics": ["string", "string", "string"]
  }
}`;

        if (!client) {
            throw new Error('Gemini API key not configured');
        }

        const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

        let result: any;
        try {
            result = await model.generateContent(prompt);
        } catch (e: any) {
            console.error('Gemini generateContent error:', e);
            throw e;
        }

        const response = result.response;
        let responseText = response.text();

        let parsedResponse;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return NextResponse.json(
                { error: 'Failed to parse AI response' },
                { status: 500 }
            );
        }

        const opportunities = parsedResponse.opportunities || [];
        const marketAnalysis = parsedResponse.marketAnalysis || {};

        const createdOpportunities = [];

        for (const opp of opportunities) {
            const priorityScore = Math.round(
                (opp.confidenceScore * 0.4 +
                    (opp.impact === 'HIGH' ? 100 : opp.impact === 'MEDIUM' ? 60 : 30) * 0.3 +
                    (opp.effort === 'EASY' ? 100 : opp.effort === 'MEDIUM' ? 60 : 30) * 0.3)
            );

            const existingOpp = await prisma.opportunity.findFirst({
                where: {
                    analysisJobId: analysisJob.id,
                    title: opp.title,
                },
            });

            if (!existingOpp) {
                const created = await prisma.opportunity.create({
                    data: {
                        analysisJobId: analysisJob.id,
                        title: opp.title,
                        description: opp.description,
                        category: opp.category || 'Market Expansion',
                        impact: opp.impact || 'MEDIUM',
                        effort: opp.effort || 'MEDIUM',
                        confidenceScore: opp.confidenceScore || 75,
                        priorityScore: priorityScore,
                        estimatedImpact: opp.estimatedImpact || 'TBD',
                        estimatedRoi: opp.roiProjection || 'TBD',
                        customerDemand: opp.customerDemand || 'Market analysis based',
                        competitorGap: opp.competitorGap || 'Strategic gap identified',
                        sampleQuotes: opp.sampleQuotes || [],
                        actionSteps: opp.actionSteps || [],
                        status: 'pending',
                        fullData: opp,
                    },
                });
                createdOpportunities.push(created);
            }
        }

        // Update marketOpportunities JSON field
        const newMarketOpps = opportunities.map((opp: any) => ({
            opportunity: opp.title,
            description: opp.description,
            marketSize: opp.marketSize,
            competition: `Competitor gap: ${opp.competitorGap}`,
            entryStrategy: opp.actionSteps[0] || 'TBD',
            potentialRevenue: opp.estimatedImpact,
            timeline: opp.timeline || '3-6 months',
            investmentNeeded: opp.investmentNeeded,
            roiProjection: opp.roiProjection,
        }));

        const allMarketOpps = [...existingMarketOpportunities, ...newMarketOpps];

        await prisma.analysisJob.update({
            where: { id: analysisJob.id },
            data: {
                marketOpportunities: allMarketOpps as any,
                additionalData: {
                    ...(analysisJob.additionalData as any || {}),
                    marketExpansionAnalysis: marketAnalysis,
                    lastOpportunityGeneration: new Date().toISOString(),
                    totalOpportunitiesGenerated: createdOpportunities.length,
                } as any,
            },
        });

        return NextResponse.json({
            success: true,
            count: createdOpportunities.length,
            opportunities: createdOpportunities,
            marketAnalysis: marketAnalysis,
            totalExisting: existingCount,
            totalNew: createdOpportunities.length,
        });
    } catch (error) {
        console.error('Error generating market opportunities:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to generate market opportunities',
            },
            { status: 500 }
        );
    }
}