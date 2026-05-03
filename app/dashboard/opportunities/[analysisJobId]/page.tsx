import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';
import { OpportunityCard } from './opportunity-card';
import { PriorityMatrix } from './priority-matrix';
import { RegenerateButton } from './regenerate-button';

export const metadata = {
    title: 'Opportunities Analysis | Revlytics',
    description: 'View growth opportunities for your product',
};

export default async function OpportunitiesDetailPage({ params }: { params: Promise<{ analysisJobId: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    const { analysisJobId } = await params;

    const analysisJob = await prisma.analysisJob.findUnique({
        where: { id: analysisJobId },
        include: {
            user: true,
            products: {
                include: {
                    reviews: {
                        take: 5,
                    },
                },
            },
            opportunities: {
                orderBy: [{ impact: 'desc' }, { priorityScore: 'desc' }],
            },
        },
    });

    if (!analysisJob) {
        redirect('/dashboard/opportunities');
    }

    if (analysisJob.user?.email !== session.user.email) {
        redirect('/dashboard/opportunities');
    }

    const userProduct = analysisJob.products.find((p) => p.isUserProduct);
    const opportunities = analysisJob.opportunities;

    const stats = {
        total: opportunities.length,
        highImpact: opportunities.filter((o) => o.impact === 'HIGH').length,
        mediumImpact: opportunities.filter((o) => o.impact === 'MEDIUM').length,
        lowImpact: opportunities.filter((o) => o.impact === 'LOW').length,
        completed: opportunities.filter((o) => o.status === 'completed').length,
        avgConfidence: Math.round(opportunities.reduce((sum, o) => sum + o.confidenceScore, 0) / opportunities.length),
        avgPriority: Math.round(opportunities.reduce((sum, o) => sum + o.priorityScore, 0) / opportunities.length),
    };

    const opportunityScore = Math.min(
        100,
        Math.round(
            (stats.highImpact * 30 + stats.mediumImpact * 15 + stats.lowImpact * 5 + stats.avgConfidence) / 4
        )
    );

    const categories = [...new Set(opportunities.map((o) => o.category))];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Link
                    href="/dashboard/opportunities"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to all opportunities
                </Link>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Growth Opportunities for {userProduct?.title || 'Unknown'}</h1>
                            <p className="text-slate-600 mt-2">Actionable insights to improve your product listing and sales</p>
                        </div>
                        <div className="flex gap-3">
                            <RegenerateButton analysisJobId={analysisJobId} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">Opportunity Score</p>
                            <p className="text-3xl font-bold text-indigo-900">{opportunityScore}</p>
                            <p className="text-xs text-indigo-600 mt-1">out of 100</p>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-1">High Impact</p>
                            <p className="text-3xl font-bold text-red-900">{stats.highImpact}</p>
                            <p className="text-xs text-red-600 mt-1">opportunities</p>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">Medium Impact</p>
                            <p className="text-3xl font-bold text-amber-900">{stats.mediumImpact}</p>
                            <p className="text-xs text-amber-600 mt-1">opportunities</p>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Completed</p>
                            <p className="text-3xl font-bold text-blue-900">{stats.completed}</p>
                            <p className="text-xs text-blue-600 mt-1">of {stats.total}</p>
                        </div>
                    </div>
                </div>

                {opportunities.length > 0 ? (
                    <>
                        <PriorityMatrix opportunities={opportunities} />

                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">All Opportunities</h2>

                            {categories.map((category) => (
                                <div key={category} className="mb-8">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="inline-block w-1 h-6 bg-indigo-600 rounded-full"></span>
                                        {category}
                                    </h3>

                                    <div className="grid gap-4">
                                        {opportunities
                                            .filter((o) => o.category === category)
                                            .map((opp) => (
                                                <OpportunityCard key={opp.id} opportunity={opp} />
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                        <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 text-lg mb-2">No opportunities generated yet</p>
                        <p className="text-slate-500 mb-6">Click the button above to analyze this report for opportunities</p>
                        <RegenerateButton analysisJobId={analysisJobId} />
                    </div>
                )}
            </div>
        </div>
    );
}
