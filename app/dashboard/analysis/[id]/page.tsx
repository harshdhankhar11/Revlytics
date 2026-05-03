import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Analysis Overview | Revlytics',
    description: 'View your analysis products',
};

export default async function AnalysisOverviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/login');
    }

    const analysisJob = await prisma.analysisJob.findUnique({
        where: { id },
        include: {
            user: true,
            products: {
                orderBy: { isUserProduct: 'desc' },
            },
        },
    });

    if (!analysisJob || analysisJob.user?.email !== session.user.email) {
        redirect('/dashboard');
    }

    const userProduct = analysisJob.products.find((p) => p.isUserProduct);
    const competitors = analysisJob.products.filter((p) => !p.isUserProduct);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/dashboard/reports"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Reports
                </Link>

                {/* Header */}
                <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Analysis Overview</h1>
                    <div className="flex flex-wrap gap-4 items-center mt-4">
                        <div>
                            <p className="text-sm text-slate-600">Status</p>
                            <p className="text-lg font-semibold text-slate-900">{analysisJob.status}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Progress</p>
                            <p className="text-lg font-semibold text-slate-900">{analysisJob.progress}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Analyzed On</p>
                            <p className="text-lg font-semibold text-slate-900">
                                {new Date(analysisJob.startedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Your Product Section */}
                {userProduct && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                        <div className="px-8 py-6 border-b-2 border-indigo-600 bg-indigo-50">
                            <h2 className="text-2xl font-bold text-indigo-900">🎯 Your Product</h2>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Image */}
                                {userProduct.images && userProduct.images[0] && (
                                    <div className="flex justify-center">
                                        <div className="bg-slate-100 rounded-lg overflow-hidden w-full max-w-xs h-64">
                                            <img
                                                src={userProduct.images[0]}
                                                alt={userProduct.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                        'https://via.placeholder.com/300x300?text=No+Image';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Details */}
                                <div className="md:col-span-2">
                                    <h3 className="text-xl font-semibold text-slate-900 mb-4">{userProduct.title}</h3>

                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <p className="text-sm text-slate-600 mb-1">Price</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {userProduct.price
                                                    ? `$${userProduct.price.toFixed(2)}`
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 mb-1">Rating</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {userProduct.rating
                                                    ? `${userProduct.rating.toFixed(1)}⭐`
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 mb-1">Reviews</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {userProduct.reviewCount}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 mb-1">Brand</p>
                                            <p className="text-lg font-semibold text-slate-900">
                                                {userProduct.brand || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2">
                                        {userProduct.isAmazonChoice && (
                                            <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full border border-orange-300">
                                                ✓ Amazon Choice
                                            </span>
                                        )}
                                        {userProduct.isBestSeller && (
                                            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-300">
                                                ★ Best Seller
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Competitors Section */}
                {competitors.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b-2 border-emerald-600 bg-emerald-50">
                            <h2 className="text-2xl font-bold text-emerald-900">
                                📦 Competitor Products ({competitors.length})
                            </h2>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {competitors.map((competitor) => (
                                    <div
                                        key={competitor.id}
                                        className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                    >
                                        {/* Competitor Image */}
                                        {competitor.images && competitor.images[0] && (
                                            <div className="bg-slate-100 rounded-lg overflow-hidden mb-4 h-40">
                                                <img
                                                    src={competitor.images[0]}
                                                    alt={competitor.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            'https://via.placeholder.com/300x200?text=No+Image';
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Competitor Info */}
                                        <h3 className="font-semibold text-slate-900 mb-3 line-clamp-2">
                                            {competitor.title}
                                        </h3>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm text-slate-600">Price</p>
                                                <p className="font-semibold text-slate-900">
                                                    {competitor.price
                                                        ? `$${competitor.price.toFixed(2)}`
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm text-slate-600">Rating</p>
                                                <p className="font-semibold text-slate-900">
                                                    {competitor.rating
                                                        ? `${competitor.rating.toFixed(1)}⭐`
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm text-slate-600">Reviews</p>
                                                <p className="font-semibold text-slate-900">
                                                    {competitor.reviewCount}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        {(competitor.isAmazonChoice || competitor.isBestSeller) && (
                                            <div className="flex flex-wrap gap-2">
                                                {competitor.isAmazonChoice && (
                                                    <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded border border-orange-300">
                                                        ✓ Choice
                                                    </span>
                                                )}
                                                {competitor.isBestSeller && (
                                                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded border border-green-300">
                                                        ★ Seller
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* View Full Report */}
                {analysisJob.status === 'COMPLETED' && (
                    <div className="mt-8 text-center">
                        <Link
                            href={`/dashboard/analysis/${analysisJob.id}/report`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            View AI Analysis Report
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
