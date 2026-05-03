import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AlertCircle, Star, Package, TrendingUp, ThumbsUp, ThumbsDown, Award, Zap, AlertTriangle, BarChart3, DollarSign, Users, Target, CheckCircle, Clock } from 'lucide-react';

export const metadata = {
    title: 'Analysis Report | Revlytics',
    description: 'View your market analysis report',
};

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    const { id } = await params;

    const analysisJob = await prisma.analysisJob.findUnique({
        where: { id },
        include: {
            user: true,
            products: {
                include: {
                    reviews: {
                        orderBy: { reviewDate: 'desc' },
                        take: 10,
                    },
                    sentimentScores: true,
                    productCriteria: true,
                },
            },
        },
    });

    if (!analysisJob) {
        return (
            <div className="min-h-screen bg-white py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
                        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analysis Not Found</h1>
                        <p className="text-gray-600">This analysis does not exist or has been deleted.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (analysisJob.user?.email !== session.user.email) {
        redirect('/dashboard');
    }

    if (analysisJob.status !== 'COMPLETED') {
        return (
            <div className="min-h-screen bg-white py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
                        <div className="h-12 w-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6 text-gray-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analysis {analysisJob.status.toLowerCase()}</h1>
                        <p className="text-gray-600">Progress: {analysisJob.progress}%</p>
                        {analysisJob.errorMessage && (
                            <p className="text-red-600 mt-4 text-sm">{analysisJob.errorMessage}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const userProduct = analysisJob.products.find(p => p.isUserProduct === true);
    const competitorProducts = analysisJob.products.filter(p => p.isUserProduct === false);

    const actionItemsList = analysisJob.actionItems as string[] || [];
    const marketOpportunitiesList = analysisJob.marketOpportunities as string[] || [];
    const riskFactorsList = analysisJob.riskFactors as string[] || [];
    const strengthsList = userProduct?.strengths || [];
    const weaknessesList = userProduct?.weaknesses || [];

    const getSentimentIcon = (sentiment?: string) => {
        if (sentiment === 'POSITIVE') return <ThumbsUp className="w-4 h-4 text-green-600" />;
        if (sentiment === 'NEGATIVE') return <ThumbsDown className="w-4 h-4 text-red-600" />;
        return <Star className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Market Analysis Report</h1>
                            <p className="text-gray-500 text-sm mt-1">{analysisJob.userProductAsin || userProduct?.asin || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Analysis ID</p>
                            <p className="text-xs font-mono text-gray-500">{analysisJob.id.slice(0, 8)}...</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {analysisJob.completedAt ? new Date(analysisJob.completedAt).toLocaleDateString() : 'Pending'}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                        <div>
                            <p className="text-gray-400 text-xs mb-1">Your Product</p>
                            <p className="font-medium text-gray-900 text-sm line-clamp-2">{userProduct?.title || analysisJob.userProductAsin || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs mb-1">Competitors</p>
                            <p className="font-medium text-gray-900 text-sm">{competitorProducts.length} products</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs mb-1">Total Reviews</p>
                            <p className="font-medium text-gray-900 text-sm">{analysisJob.totalReviewsScraped}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs mb-1">Overall Score</p>
                            <p className="font-medium text-gray-900 text-sm">{analysisJob.overallScore || '—'}/100</p>
                        </div>
                    </div>
                </div>

                {analysisJob.executiveSummary && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-gray-700" />
                            <h2 className="text-lg font-semibold text-gray-900">Executive Summary</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{analysisJob.executiveSummary}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {(strengthsList.length > 0 || weaknessesList.length > 0) && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Analysis</h2>
                            {strengthsList.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ThumbsUp className="w-4 h-4 text-green-600" />
                                        <h3 className="font-medium text-gray-900">Strengths</h3>
                                    </div>
                                    <ul className="space-y-1">
                                        {strengthsList.map((s, i) => (
                                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                <span className="text-green-500">•</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {weaknessesList.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <ThumbsDown className="w-4 h-4 text-red-600" />
                                        <h3 className="font-medium text-gray-900">Weaknesses</h3>
                                    </div>
                                    <ul className="space-y-1">
                                        {weaknessesList.map((w, i) => (
                                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                <span className="text-red-500">•</span> {w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {userProduct && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500 text-sm">ASIN</span>
                                    <span className="text-gray-900 text-sm font-mono">{userProduct.asin}</span>
                                </div>
                                {userProduct.brand && (
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm">Brand</span>
                                        <span className="text-gray-900 text-sm">{userProduct.brand}</span>
                                    </div>
                                )}
                                {userProduct.price && (
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm">Price</span>
                                        <span className="text-gray-900 text-sm">${userProduct.price.toFixed(2)} {userProduct.currency}</span>
                                    </div>
                                )}
                                {userProduct.rating && (
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm">Rating</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                            <span className="text-gray-900 text-sm">{userProduct.rating}</span>
                                            <span className="text-gray-400 text-xs">({userProduct.reviewCount} reviews)</span>
                                        </div>
                                    </div>
                                )}
                                {userProduct.bsr && (
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm">Best Sellers Rank</span>
                                        <span className="text-gray-900 text-sm">#{userProduct.bsr.toLocaleString()}</span>
                                    </div>
                                )}
                                {userProduct.isAmazonChoice && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-500 text-sm">Amazon's Choice</span>
                                        <span className="text-blue-600 text-sm font-medium">Yes</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {competitorProducts.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5 text-gray-700" />
                            <h2 className="text-lg font-semibold text-gray-900">Competitors ({competitorProducts.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-gray-200">
                                    <tr className="text-left text-gray-500">
                                        <th className="pb-3 font-medium">Title</th>
                                        <th className="pb-3 font-medium">ASIN</th>
                                        <th className="pb-3 font-medium">Price</th>
                                        <th className="pb-3 font-medium">Rating</th>
                                        <th className="pb-3 font-medium">Reviews</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {competitorProducts.map((comp) => (
                                        <tr key={comp.id} className="hover:bg-gray-50">
                                            <td className="py-3 text-gray-900 max-w-xs truncate">{comp.title}</td>
                                            <td className="py-3 text-gray-500 font-mono text-xs">{comp.asin}</td>
                                            <td className="py-3 text-gray-900">${comp.price?.toFixed(2) || '—'}</td>
                                            <td className="py-3">
                                                {comp.rating ? (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                        <span>{comp.rating}</span>
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="py-3 text-gray-600">{comp.reviewCount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {analysisJob.pricingStrategy && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-5 h-5 text-gray-700" />
                            <h2 className="text-lg font-semibold text-gray-900">Pricing Strategy</h2>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-800 whitespace-pre-wrap">{JSON.stringify(analysisJob.pricingStrategy, null, 2)}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {actionItemsList.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5 text-gray-700" />
                                <h2 className="text-lg font-semibold text-gray-900">Action Items</h2>
                            </div>
                            <ul className="space-y-2">
                                {actionItemsList.map((item, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="text-gray-400">{i + 1}.</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {marketOpportunitiesList.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-gray-700" />
                                <h2 className="text-lg font-semibold text-gray-900">Opportunities</h2>
                            </div>
                            <ul className="space-y-2">
                                {marketOpportunitiesList.map((opp, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="text-gray-400">•</span> {opp}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {riskFactorsList.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5 text-gray-700" />
                                <h2 className="text-lg font-semibold text-gray-900">Risk Factors</h2>
                            </div>
                            <ul className="space-y-2">
                                {riskFactorsList.map((risk, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="text-gray-400">•</span> {risk}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {userProduct?.reviews && userProduct.reviews.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-5 h-5 text-gray-700" />
                            <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
                        </div>
                        <div className="space-y-4">
                            {userProduct.reviews.slice(0, 5).map((review) => (
                                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                                ))}
                                            </div>
                                            {review.sentiment && getSentimentIcon(review.sentiment)}
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(review.reviewDate).toLocaleDateString()}</span>
                                    </div>
                                    {review.reviewTitle && <p className="text-sm font-medium text-gray-800">{review.reviewTitle}</p>}
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">{review.reviewText}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{analysisJob.totalProductsScraped}</p>
                            <p className="text-xs text-gray-400">Products Scraped</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{analysisJob.totalReviewsScraped.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">Reviews Analyzed</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{competitorProducts.length}</p>
                            <p className="text-xs text-gray-400">Competitors</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{analysisJob.status}</p>
                            <p className="text-xs text-gray-400">Status</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-4 mt-4 text-center">
                        <p className="text-xs text-gray-400">
                            Generated on {analysisJob.completedAt ? new Date(analysisJob.completedAt).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}