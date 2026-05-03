import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
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

        const analyses = await prisma.analysisJob.findMany({
            where: { userId: user.id },
            include: {
                products: {
                    select: {
                        id: true,
                        title: true,
                        isUserProduct: true,
                        price: true,
                        rating: true,
                        reviewCount: true,
                    },
                },
            },
            orderBy: { startedAt: 'desc' },
        });

        return NextResponse.json(analyses);
    } catch (error) {
        console.error('Reports API error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to fetch reports',
            },
            { status: 500 }
        );
    }
}
