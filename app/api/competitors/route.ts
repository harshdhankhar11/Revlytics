import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const analysisJobId = searchParams.get("analysisJobId");

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
                competitorComparisons: true,
                competitorCriteria: true,
                competitiveGaps: true,
                competitiveRecommendations: true,
            },
        });

        if (!analysisJob || analysisJob.user?.id !== session.user.id) {
            return NextResponse.json(
                { error: "Analysis not found or unauthorized" },
                { status: 404 }
            );
        }

        // Get user product
        const userProduct = analysisJob.products.find(
            (p) => p.isUserProduct
        );

        // Calculate total revenue for market share
        const totalRevenue = analysisJob.products.reduce(
            (sum, p) => sum + (p.monthlyRevenue || 0),
            0
        );

        // Prepare competitor data with rankings
        const competitorData = analysisJob.competitorComparisons
            .map((comp, index) => ({
                ...comp,
                rank: index + 1,
                marketShare: totalRevenue
                    ? ((comp.estimatedMonthlyRevenue || 0) / totalRevenue) * 100
                    : 0,
            }))
            .sort(
                (a, b) =>
                    (b.estimatedMonthlyRevenue || 0) -
                    (a.estimatedMonthlyRevenue || 0)
            );

        return NextResponse.json({
            analysisJob,
            userProduct,
            competitorData,
            totalRevenue,
            competitorCriteria: analysisJob.competitorCriteria,
            competitiveGaps: analysisJob.competitiveGaps,
            competitiveRecommendations: analysisJob.competitiveRecommendations,
        });
    } catch (error) {
        console.error("Error fetching competitors:", error);
        return NextResponse.json(
            { error: "Failed to fetch competitors" },
            { status: 500 }
        );
    }
}
