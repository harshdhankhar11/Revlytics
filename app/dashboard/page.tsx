import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';
import { BarChart3, Clock, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Dashboard | Revlytics',
    description: 'Your analysis dashboard',
};

function buildActivityBuckets(analysisDates: Date[]) {
    const bucketCount = 12;
    const daysInRange = 30;
    const buckets = Array.from({ length: bucketCount }, () => 0);

    analysisDates.forEach((date) => {
        const ageInDays = Math.max(0, (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        const bucketIndex = Math.min(bucketCount - 1, Math.floor((ageInDays / daysInRange) * bucketCount));
        buckets[bucketIndex] += 1;
    });

    const maxValue = Math.max(1, ...buckets);

    return buckets.map((value, index) => {
        const height = Math.max(12, Math.round((value / maxValue) * 100));
        const label = index === 0 ? '30d' : index === bucketCount - 1 ? 'Now' : '';

        return {
            value,
            height,
            label,
        };
    });
}

function truncateText(text: string, maxLength: number) {
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, name: true, credits: true, analysisCount: true, monthlyAnalysisLimit: true },
    });

    if (!user) {
        redirect('/login');
    }

    const recentAnalyses = await prisma.analysisJob.findMany({
        where: { userId: user.id },
        include: { products: true },
        orderBy: { startedAt: 'desc' },
        take: 6,
    });

    const totalAnalysesCompleted = await prisma.analysisJob.count({
        where: { userId: user.id, status: 'COMPLETED' },
    });

    const totalProductsAnalyzed = await prisma.product.count({
        where: { analysisJob: { userId: user.id } },
    });

    // Quick insights data
    const recentOpportunities = await prisma.opportunity.findMany({
        where: { analysisJob: { is: { userId: user.id } } },
        orderBy: { priorityScore: 'desc' },
        take: 5,
        select: { id: true, title: true, impact: true, effort: true, analysisJobId: true },
    });

    const topCriteria = await prisma.purchaseCriterion.findMany({
        where: { analysisJob: { is: { userId: user.id } } },
        orderBy: { mentionCount: 'desc' },
        take: 5,
        select: { id: true, name: true, mentionCount: true, analysisJobId: true },
    });

    const recentInsights = await prisma.marketInsight.findMany({
        where: { analysisJob: { is: { userId: user.id } } },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: { id: true, title: true, category: true, severity: true, createdAt: true, analysisJobId: true },
    });

    const activityBuckets = buildActivityBuckets(recentAnalyses.map((analysis) => analysis.startedAt));
    const topOpportunity = recentOpportunities[0];
    const topCriterion = topCriteria[0];
    const latestInsight = recentInsights[0];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Welcome back, {user.name || 'User'}</h1>
                        <p className="text-sm text-slate-600">Overview of your recent analyses and account</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs text-slate-500">Credits</div>
                            <div className="text-lg font-semibold text-amber-600">{user.credits}</div>
                        </div>
                        <Link href="/dashboard/new-analysis" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm">
                            New Analysis
                        </Link>
                    </div>
                </div>

                {/* Main layout: left stats + chart, right recent analyses */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Top stats cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-lg shadow border">
                                <div className="text-sm text-slate-500">Analyses This Month</div>
                                <div className="mt-2 text-2xl font-bold text-slate-900">{user.analysisCount}</div>
                                <div className="text-xs text-slate-400">Limit: {user.monthlyAnalysisLimit}</div>
                            </div>
                            <div className="bg-white p-5 rounded-lg shadow border">
                                <div className="text-sm text-slate-500">Completed Analyses</div>
                                <div className="mt-2 text-2xl font-bold text-slate-900">{totalAnalysesCompleted}</div>
                                <div className="text-xs text-slate-400">All time</div>
                            </div>
                            <div className="bg-white p-5 rounded-lg shadow border">
                                <div className="text-sm text-slate-500">Products Analyzed</div>
                                <div className="mt-2 text-2xl font-bold text-slate-900">{totalProductsAnalyzed}</div>
                                <div className="text-xs text-slate-400">Including competitors</div>
                            </div>
                        </div>

                        {/* Lightweight sparkline / activity */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200/80">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-5">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                        <BarChart3 className="h-3.5 w-3.5" />
                                        Activity snapshot
                                    </div>
                                    <h3 className="mt-3 text-lg font-semibold text-slate-900">Activity over the last 30 days</h3>
                                    <p className="mt-1 text-sm text-slate-500">Recent analysis volume, grouped into simple time buckets.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm sm:text-right">
                                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                                        <div className="text-xs uppercase tracking-wide text-slate-400">Recent analyses</div>
                                        <div className="mt-1 text-lg font-semibold text-slate-900">{recentAnalyses.length}</div>
                                    </div>
                                    <div className="rounded-xl bg-indigo-50 px-4 py-3">
                                        <div className="text-xs uppercase tracking-wide text-indigo-500">Completed</div>
                                        <div className="mt-1 text-lg font-semibold text-indigo-700">{totalAnalysesCompleted}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(to_bottom,rgba(248,250,252,0.92),rgba(255,255,255,1))] p-4 sm:p-5">
                                <div className="flex h-56 items-end gap-2 sm:gap-3">
                                    {activityBuckets.map((bucket, index) => (
                                        <div key={index} className="flex h-full flex-1 flex-col justify-end">
                                            <div className="mb-2 flex flex-1 items-end justify-center">
                                                <div
                                                    className="w-full max-w-10 rounded-t-2xl bg-gradient-to-t from-indigo-600 via-indigo-500 to-sky-400 shadow-[0_8px_20px_rgba(99,102,241,0.18)] transition-transform duration-200 hover:-translate-y-1"
                                                    style={{ height: `${bucket.height}%`, minHeight: bucket.value > 0 ? '14px' : '8px' }}
                                                />
                                            </div>
                                            <div className="text-center text-[11px] font-medium text-slate-400">
                                                {bucket.label || (index % 3 === 0 ? `${index + 1}` : '')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                                    <span>Oldest bucket</span>
                                    <span>Newest bucket</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200/80">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-5">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                        <Zap className="h-3.5 w-3.5" />
                                        Quick insights
                                    </div>
                                    <h3 className="mt-3 text-lg font-semibold text-slate-900">High-signal takeaways from your latest work</h3>
                                    <p className="mt-1 text-sm text-slate-500">A more scannable summary of what matters most right now.</p>
                                </div>
                                <Link href="/dashboard/analysis" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    Open analysis history
                                </Link>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-3">
                                <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-slate-900">Top opportunity</h4>
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    {topOpportunity ? (
                                        <>
                                            <a href={`/dashboard/analysis/${topOpportunity.analysisJobId}/report`} className="mt-3 block text-sm font-medium text-slate-900 hover:text-indigo-600 hover:underline">
                                                {truncateText(topOpportunity.title, 72)}
                                            </a>
                                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                                <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">Impact: {topOpportunity.impact ?? 'N/A'}</span>
                                                <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">Effort: {topOpportunity.effort ?? 'N/A'}</span>
                                            </div>
                                            <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
                                                Highest priority among the latest opportunities.
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mt-3 text-sm text-slate-500">No opportunities yet.</div>
                                    )}
                                    <div className="mt-4 text-right">
                                        <Link href="/dashboard/opportunities" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                            View all opportunities
                                        </Link>
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-slate-900">Most mentioned criterion</h4>
                                        <Clock className="h-4 w-4 text-sky-500" />
                                    </div>
                                    {topCriterion ? (
                                        <>
                                            <a href={`/dashboard/analysis/${topCriterion.analysisJobId}/report`} className="mt-3 block text-sm font-medium text-slate-900 hover:text-indigo-600 hover:underline">
                                                {topCriterion.name}
                                            </a>
                                            <div className="mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                                                Mention count: {topCriterion.mentionCount}
                                            </div>
                                            <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
                                                Shows which buying signal is showing up most often.
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mt-3 text-sm text-slate-500">No criteria yet.</div>
                                    )}
                                    <div className="mt-4 text-right">
                                        <Link href="/dashboard/analysis" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                            View criteria
                                        </Link>
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-slate-900">Latest market insight</h4>
                                        <BarChart3 className="h-4 w-4 text-violet-500" />
                                    </div>
                                    {latestInsight ? (
                                        <>
                                            <a href={`/dashboard/analysis/${latestInsight.analysisJobId}/report`} className="mt-3 block text-sm font-medium text-slate-900 hover:text-indigo-600 hover:underline">
                                                {truncateText(latestInsight.title, 72)}
                                            </a>
                                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                                <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">{latestInsight.category}</span>
                                                <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">Severity: {latestInsight.severity}</span>
                                            </div>
                                            <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
                                                Latest insight pulled from your most recent analysis.
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mt-3 text-sm text-slate-500">No insights yet.</div>
                                    )}
                                    <div className="mt-4 text-right">
                                        <Link href="/dashboard/analysis" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                            View all insights
                                        </Link>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>

                    {/* Right column: recent analyses list */}
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-lg shadow border">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-800">Recent Analyses</h3>
                                <Link href="/dashboard/reports" className="text-xs text-indigo-600">See all</Link>
                            </div>

                            {recentAnalyses.length === 0 ? (
                                <div className="text-sm text-slate-600">No analyses yet — start one now.</div>
                            ) : (
                                <div className="space-y-3">
                                    {recentAnalyses.map((analysis) => {
                                        const mainProduct = analysis.products.find((p) => p.isUserProduct);
                                        return (
                                            <div key={analysis.id} className="p-3 bg-slate-50 rounded">
                                                <div className="flex items-start justify-between">
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-slate-900 truncate">{mainProduct?.title ?? 'Untitled'}</div>
                                                        <div className="text-xs text-slate-500">{analysis.products.length} products • {new Date(analysis.startedAt).toLocaleDateString()}</div>
                                                    </div>
                                                    <div className="ml-3 text-right">
                                                        <div className="text-xs text-slate-700">{analysis.status}</div>
                                                        <div className="mt-2">
                                                            <Link href={analysis.status === 'COMPLETED' ? `/dashboard/analysis/${analysis.id}/report` : `/dashboard/analysis/${analysis.id}/progress`} className="text-xs text-indigo-600">Open</Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}