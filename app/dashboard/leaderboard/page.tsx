import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';

export const metadata = {
    title: 'Leaderboard | Revlytics',
    description: 'Top products by estimated monthly revenue',
};

function formatCurrency(v: number | null | undefined) {
    if (!v && v !== 0) return '—';
    return `$${v!.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default async function LeaderboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return null;

    const products = await prisma.product.findMany({
        where: { analysisJob: { userId: user.id } },
        select: {
            id: true,
            title: true,
            brand: true,
            images: true,
            monthlyRevenue: true,
            rating: true,
            reviewCount: true,
            price: true,
            isUserProduct: true,
            productMetrics: {
                where: { metricName: 'monthlyRevenue' },
                orderBy: { timestamp: 'desc' },
                take: 2,
                select: { metricValue: true, timestamp: true },
            },
        },
    });

    const total = products.reduce((s, p) => s + (p.monthlyRevenue || 0), 0);

    const ranked = products
        .map((p) => ({
            ...p,
            marketShare: total > 0 ? ((p.monthlyRevenue || 0) / total) * 100 : 0,
            trend: (() => {
                const m = p.productMetrics || [];
                if (m.length >= 2) {
                    const prev = m[1].metricValue || 0;
                    const cur = m[0].metricValue || 0;
                    if (cur > prev) return 'Up';
                    if (cur < prev) return 'Down';
                    return 'Stable';
                }
                return 'Stable';
            })(),
        }))
        .sort((a, b) => (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0));

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">🥇 Leaderboard</h1>
                    <p className="text-slate-600 mt-2">Top products by estimated monthly revenue — your product is highlighted.</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rank</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Product Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Brand</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Monthly Revenue</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Rating</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Review Count</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Price</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Market Share</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Trend</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Your Product</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranked.map((p, idx) => (
                                <tr key={p.id} className={`border-b border-slate-200 ${p.isUserProduct ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-50'} transition-colors`}>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-bold text-slate-900">
                                            {idx + 1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                                                {p.images && p.images[0] && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={p.images[0]} alt={p.title || 'product'} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900 line-clamp-1">{p.title || 'Unknown'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{p.brand || '—'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-semibold text-slate-900">{formatCurrency(p.monthlyRevenue)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {p.rating ? (
                                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-200">
                                                <span className="text-xs font-semibold text-amber-900">⭐ {p.rating.toFixed(1)}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-500">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm text-slate-600">{p.reviewCount?.toLocaleString() ?? '—'}</td>
                                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{p.price ? `$${p.price.toFixed(2)}` : '—'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-semibold text-slate-900">{p.marketShare.toFixed(1)}%</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold ${p.trend === 'Up' ? 'bg-green-50 border border-green-200 text-green-700' : p.trend === 'Down' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>
                                            {p.trend === 'Up' && '📈 Up'}
                                            {p.trend === 'Down' && '📉 Down'}
                                            {p.trend === 'Stable' && '➡️ Stable'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {p.isUserProduct ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-sm">
                                                ✓
                                            </span>
                                        ) : (
                                            ''
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
