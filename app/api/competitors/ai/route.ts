import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { analysisJobId } = await request.json();

        if (!analysisJobId) {
            return NextResponse.json(
                { error: "analysisJobId is required" },
                { status: 400 }
            );
        }

        // Get analysis job
        const analysisJob = await prisma.analysisJob.findUnique({
            where: { id: analysisJobId },
            include: {
                user: true,
                products: true,
            },
        });

        if (!analysisJob || analysisJob.user?.id !== session.user.id) {
            return NextResponse.json(
                { error: "Analysis not found or unauthorized" },
                { status: 404 }
            );
        }

        if (!GOOGLE_GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "API key not configured" },
                { status: 500 }
            );
        }

        const client = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);
        const model = client.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        // Get user product
        const userProduct = analysisJob.products.find((p) => p.isUserProduct);
        const competitors = analysisJob.products.filter(
            (p) => !p.isUserProduct
        );

        // Prepare product data for analysis
        const productData = analysisJob.products.map((p) => ({
            name: p.title,
            brand: p.brand,
            price: p.price,
            rating: p.rating,
            reviewCount: p.reviewCount,
            monthlyRevenue: p.monthlyRevenue,
            strengths: p.strengths,
            weaknesses: p.weaknesses,
            isUserProduct: p.isUserProduct,
        }));

        // Create AI prompt
        const prompt = `Analyze this competitive landscape for an e-commerce product. Generate a comprehensive competitive analysis.

User Product: ${userProduct?.title || "Unknown"}
Competitors: ${competitors.map((c) => c.title).join(", ")}

Product Data (JSON):
${JSON.stringify(productData, null, 2)}

Please analyze and provide:

1. COMPETITOR RANKINGS - Rank each competitor by market strength (1-5 ranking)
2. CUSTOMER CRITERIA - Identify top 5-7 customer purchase criteria by importance with:
   - Name (e.g., "Absorption", "Price", "Taste")
   - Customer mention percentage (0-100)
   - Score for user product (0-100)
   - Score for each competitor (0-100)
   - Gap analysis (how far behind/ahead user product is)
3. STRENGTHS & WEAKNESSES - For user product vs top competitor
4. COMPETITIVE GAPS - Opportunities where user product can differentiate (3-5 gaps with estimated revenue impact)
5. ACTIONABLE RECOMMENDATIONS - Top 5 recommendations to increase market share with expected impact and effort level

Format response as a detailed JSON object with these keys:
- competitorRankings: array of {name, rank, score, strengths, weaknesses}
- customerCriteria: array of {name, mentionPercentage, userScore, competitorScores, gap}
- strengths: array of strings
- weaknesses: array of strings
- competitiveGaps: array of {title, description, yourAdvantage, estimatedImpact}
- recommendations: array of {title, description, expectedImpact, effort, category, actionSteps}`;

        const response = await model.generateContent(prompt);

        // Extract response text
        let analysisData;
        try {
            const responseText =
                response.response.candidates?.[0]?.content?.parts?.[0]?.text ||
                response.response.text?.();

            if (!responseText) {
                throw new Error("No response text from API");
            }

            // Try to extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Could not find JSON in response");
            }

            analysisData = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error("Failed to parse AI response:", parseError);
            return NextResponse.json(
                { error: "Failed to parse AI analysis" },
                { status: 500 }
            );
        }

        // Store competitor comparisons
        const competitorComparisons = await Promise.all(
            competitors.map((comp, index) => {
                const rankData = analysisData.competitorRankings?.find(
                    (r: any) => r.name.includes(comp.title.split(" ")[0])
                );
                return prisma.competitorComparison.create({
                    data: {
                        analysisJobId,
                        competitorProductId: comp.id,
                        competitorRank: rankData?.rank || index + 2,
                        competitorName: comp.title,
                        competitorBrand: comp.brand,
                        estimatedMonthlyRevenue: comp.monthlyRevenue || 0,
                        overallRating: comp.rating || 0,
                        reviewCount: comp.reviewCount || 0,
                        topStrengths: rankData?.strengths || comp.strengths || [],
                        topWeaknesses: rankData?.weaknesses || comp.weaknesses || [],
                        analysisStatus: "COMPLETED",
                    },
                });
            })
        );

        // Store customer criteria comparison
        const criteriaData = await Promise.all(
            (analysisData.customerCriteria || []).map((criteria: any, index: number) =>
                prisma.competitorCriteria.create({
                    data: {
                        analysisJobId,
                        criteriaName: criteria.name,
                        competitorScore:
                            Math.max(
                                ...(Object.values(criteria.competitorScores || {}) as number[])
                            ) || 75,
                        userProductScore: criteria.userScore || 70,
                        scoreDifference:
                            (criteria.userScore || 70) -
                            (Math.max(
                                ...(Object.values(
                                    criteria.competitorScores || {}
                                ) as number[])
                            ) || 75),
                        mentionCount: Math.round(
                            criteria.mentionPercentage * 10
                        ),
                        importanceRank: index + 1,
                        customerMentionPercentage:
                            criteria.mentionPercentage || 50,
                        criteriaData: criteria,
                    },
                })
            )
        );

        // Store competitive gaps
        const gapsData = await Promise.all(
            (analysisData.competitiveGaps || []).map((gap: any) =>
                prisma.competitiveGap.create({
                    data: {
                        analysisJobId,
                        gapTitle: gap.title,
                        gapDescription: gap.description,
                        yourAdvantage: gap.yourAdvantage,
                        estimatedImpact: gap.estimatedImpact,
                        opportunitySize: gap.estimatedImpact?.includes("+25")
                            ? "HIGH"
                            : gap.estimatedImpact?.includes("+15")
                                ? "MEDIUM"
                                : "LOW",
                    },
                })
            )
        );

        // Store recommendations
        const recommendationsData = await Promise.all(
            (analysisData.recommendations || []).map((rec: any) =>
                prisma.competitiveRecommendation.create({
                    data: {
                        analysisJobId,
                        title: rec.title,
                        description: rec.description,
                        category: rec.category || "PRODUCT",
                        expectedImpact: rec.expectedImpact,
                        effort: rec.effort || "MEDIUM",
                        priority:
                            rec.effort === "EASY"
                                ? "HIGH"
                                : rec.effort === "MEDIUM"
                                    ? "MEDIUM"
                                    : "LOW",
                        actionSteps: rec.actionSteps || [],
                        successMetrics: [
                            `Increase revenue by ${rec.expectedImpact}`,
                        ],
                    },
                })
            )
        );

        return NextResponse.json({
            success: true,
            competitorComparisons,
            criteria: criteriaData,
            gaps: gapsData,
            recommendations: recommendationsData,
        });
    } catch (error) {
        console.error("Error analyzing competitors:", error);
        return NextResponse.json(
            { error: "Failed to analyze competitors" },
            { status: 500 }
        );
    }
}
