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

        let opportunities: any[] = [];
        try {
            opportunities = await prisma.opportunity.findMany({
                where: {
                    analysisJob: {
                        userId: user.id,
                    },
                },
                include: {
                    analysisJob: {
                        select: {
                            id: true,
                            userProductAsin: true,
                            products: {
                                select: {
                                    title: true,
                                    isUserProduct: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    priorityScore: 'desc',
                },
            } as any);
        } catch (primaryError) {
            console.warn('Falling back to compatibility query for opportunities:', primaryError);
            opportunities = await (prisma.opportunity as any).findMany({
                where: {
                    analysisJob: {
                        userId: user.id,
                    },
                },
                include: {
                    analysisJob: {
                        select: {
                            id: true,
                            userProductAsin: true,
                            products: {
                                select: {
                                    title: true,
                                    isUserProduct: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    id: 'desc',
                },
            });
        }

        const normalizedOpportunities = opportunities.map((opportunity: any) => ({
            ...opportunity,
            status:
                opportunity.status ??
                (opportunity.isResolved === true ? 'completed' : 'pending'),
            priorityScore: opportunity.priorityScore ?? 0,
            confidenceScore: opportunity.confidenceScore ?? 0,
            estimatedImpact:
                opportunity.estimatedImpact ??
                opportunity.estimatedRoi ??
                '',
            customerDemand: opportunity.customerDemand ?? '',
            competitorGap: opportunity.competitorGap ?? '',
        }));

        return NextResponse.json(normalizedOpportunities);
    } catch (error) {
        console.error('Error fetching opportunities:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to fetch opportunities',
            },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { opportunityId, status } = body;

        if (!opportunityId || !status) {
            return NextResponse.json({ error: 'Missing opportunityId or status' }, { status: 400 });
        }

        const opportunity = await prisma.opportunity.findUnique({
            where: { id: opportunityId },
            include: {
                analysisJob: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!opportunity) {
            return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
        }

        if (opportunity.analysisJob.user?.email !== session.user.email) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let updated: any;
        try {
            updated = await prisma.opportunity.update({
                where: { id: opportunityId },
                data: {
                    status,
                    completedAt: status === 'completed' ? new Date() : null,
                },
            } as any);
        } catch (updateError) {
            console.warn('Falling back to compatibility update for opportunity:', updateError);
            updated = await (prisma.opportunity as any).update({
                where: { id: opportunityId },
                data: {
                    isResolved: status === 'completed',
                    resolvedAt: status === 'completed' ? new Date() : null,
                },
            });
        }

        return NextResponse.json({
            ...updated,
            status: updated.status ?? (updated.isResolved ? 'completed' : 'pending'),
        });
    } catch (error) {
        console.error('Error updating opportunity:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to update opportunity',
            },
            { status: 500 }
        );
    }
}
