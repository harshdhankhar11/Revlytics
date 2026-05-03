import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const analysisJob = await prisma.analysisJob.findUnique({
            where: { id },
            include: {
                user: true,
                products: {
                    select: {
                        id: true,
                        asin: true,
                        title: true,
                        isUserProduct: true,
                    },
                },
            },
        });

        if (!analysisJob) {
            return NextResponse.json({ error: 'Analysis job not found' }, { status: 404 });
        }

        if (analysisJob.user?.email !== session.user.email) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const analysisResults = analysisJob.analysisResults as any;
        const isCompleted = analysisJob.status === 'COMPLETED' && analysisResults?.isCompleted === true;

        return NextResponse.json({
            id: analysisJob.id,
            status: analysisJob.status,
            progress: analysisJob.progress,
            totalProductsScraped: analysisJob.totalProductsScraped,
            totalReviewsScraped: analysisJob.totalReviewsScraped,
            errorMessage: analysisJob.errorMessage,
            startedAt: analysisJob.startedAt,
            completedAt: analysisJob.completedAt,
            isCompleted,
            products: analysisJob.products,
        });
    } catch (error) {
        console.error('Error fetching analysis progress:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Internal server error',
            },
            { status: 500 }
        );
    }
}
