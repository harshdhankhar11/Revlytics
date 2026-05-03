import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Get all analysis jobs for user with products
        const analysisJobs = await prisma.analysisJob.findMany({
            where: { userId: user.id },
            include: {
                products: {
                    select: {
                        id: true,
                        title: true,
                        brand: true,
                        price: true,
                        rating: true,
                        reviewCount: true,
                        monthlyRevenue: true,
                        isUserProduct: true,
                        asin: true,
                    },
                },
            },
            orderBy: { completedAt: "desc" },
        });

        // Filter analyses with more than 1 product (competitors)
        const analysesWithCompetitors = analysisJobs.filter(
            (job) => job.products?.length > 1
        );

        if (analysesWithCompetitors.length === 0) {
            return NextResponse.json({
                success: true,
                analyses: [],
                totalAnalyses: 0,
                message: "No analyses with competitors found",
            });
        }

        return NextResponse.json({
            success: true,
            analyses: analysesWithCompetitors,
            totalAnalyses: analysesWithCompetitors.length,
        });
    } catch (error) {
        console.error("Error fetching products for analysis:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}
