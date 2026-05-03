import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AlertCircle, Star, Package, TrendingUp, ThumbsUp, ThumbsDown, Award, Zap, AlertTriangle, BarChart3, DollarSign, Users, Target, CheckCircle, Clock, Sparkles, MessageSquare, RefreshCw, PenTool, ChartBar, User, Download, ArrowLeft } from 'lucide-react';
import { ExportReportButton } from './report-actions';

export const metadata = {
    title: 'Analysis Report | Revlytics',
    description: 'View your market analysis report',
};

function formatText(value: any): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) {
        if (value.length === 0) return '—';
        return value.map(v => formatText(v)).join(', ');
    }
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return 'Complex data';
        }
    }
    return String(value);
}

function renderActionItem(item: any) {
    if (typeof item === 'string') {
        return <p className="text-sm text-gray-700">{item}</p>;
    }
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">{item.task || item.action || item.title || 'Action Item'}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                {item.priority && <span>Priority: {item.priority}</span>}
                {item.timeline && <span>Timeline: {item.timeline}</span>}
                {item.owner && <span>Owner: {item.owner}</span>}
                {item.successMetric && <span className="col-span-2">Success: {item.successMetric}</span>}
            </div>
        </div>
    );
}

function renderOpportunity(opp: any) {
    if (typeof opp === 'string') {
        return <p className="text-sm text-gray-700">{opp}</p>;
    }
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">{opp.opportunity || opp.title || 'Market Opportunity'}</p>
            <div className="flex flex-wrap gap-2 text-xs">
                {opp.marketSize && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">📊 {formatText(opp.marketSize)}</span>}
                {opp.competition && <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">🏆 {formatText(opp.competition)}</span>}
                {opp.potentialRevenue && <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full">💰 {formatText(opp.potentialRevenue)}</span>}
                {opp.timeline && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">⏰ {formatText(opp.timeline)}</span>}
            </div>
            {opp.description && <p className="text-xs text-gray-600 mt-1">{formatText(opp.description)}</p>}
            {opp.entryStrategy && <p className="text-xs text-gray-500 mt-1">Strategy: {formatText(opp.entryStrategy)}</p>}
        </div>
    );
}

function renderRisk(risk: any) {
    if (typeof risk === 'string') {
        return <p className="text-sm text-gray-700">{risk}</p>;
    }
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">{risk.risk || risk.title || 'Risk Factor'}</p>
            <div className="flex flex-wrap gap-2 text-xs">
                {risk.probability && <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full">⚠️ Probability: {formatText(risk.probability)}</span>}
                {risk.severity && <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full">🔥 Severity: {formatText(risk.severity)}</span>}
            </div>
            {risk.mitigation && <p className="text-xs text-gray-600 mt-1">Mitigation: {formatText(risk.mitigation)}</p>}
        </div>
    );
}

function renderStrength(item: any) {
    if (typeof item === 'string') {
        return <p className="text-sm text-gray-700">{item}</p>;
    }
    return (
        <div>
            <p className="text-sm text-gray-700">{item.feature || formatText(item)}</p>
            {item.confidence && <p className="text-xs text-gray-400 mt-0.5">Confidence: {(item.confidence * 100).toFixed(0)}%</p>}
        </div>
    );
}

function renderWeakness(item: any) {
    if (typeof item === 'string') {
        return <p className="text-sm text-gray-700">{item}</p>;
    }
    return (
        <div>
            <p className="text-sm text-gray-700">{item.feature || formatText(item)}</p>
            {item.confidence && <p className="text-xs text-gray-400 mt-0.5">Confidence: {(item.confidence * 100).toFixed(0)}%</p>}
        </div>
    );
}

function renderThreat(threat: any) {
    if (typeof threat === 'string') {
        return <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">{threat}</span>;
    }
    return (
        <div className="px-3 py-2 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-red-800">{threat.threat || 'Threat'}</p>
            {threat.severity && <p className="text-xs text-red-600">Severity: {formatText(threat.severity)}</p>}
        </div>
    );
}

function renderIssue(issue: any) {
    if (typeof issue === 'string') {
        return <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">{issue}</span>;
    }
    return (
        <div className="px-3 py-2 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-red-800">{issue.issue || 'Issue'}</p>
            {issue.severity && <p className="text-xs text-red-600">Severity: {formatText(issue.severity)}</p>}
            {issue.trend && <p className="text-xs text-red-600">Trend: {formatText(issue.trend)}</p>}
        </div>
    );
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    function formatRecurringTheme(theme: any) {
        if (typeof theme === 'string') {
            return theme;
        }

        if (theme && typeof theme === 'object') {
            const phrase = theme.phrase || theme.text || theme.value || theme.name || 'Theme';
            const count = theme.count ? ` • ${theme.count}` : '';
            const sentiment = theme.sentiment ? ` • ${formatText(theme.sentiment)}` : '';
            return `${phrase}${count}${sentiment}`;
        }

        return formatText(theme);
    }

    function renderTitleSuggestion(suggestion: any) {
        if (typeof suggestion === 'string') {
            return <p className="text-sm text-gray-700 leading-6">{formatText(suggestion)}</p>;
        }

        return (
            <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    {suggestion.score !== undefined && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            Score {formatText(suggestion.score)}
                        </span>
                    )}
                    {suggestion.competition && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                            Competition {formatText(suggestion.competition)}
                        </span>
                    )}
                </div>

                {Array.isArray(suggestion.keywords) && suggestion.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {suggestion.keywords.map((keyword: any, index: number) => (
                            <span key={index} className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700">
                                {formatText(keyword)}
                            </span>
                        ))}
                    </div>
                )}

                <p className="text-sm leading-6 text-gray-700">
                    {formatText(suggestion.suggestion || suggestion.title || suggestion.text || suggestion.name || suggestion)}
                </p>
            </div>
        );
    }

    function renderBackendKeyword(keyword: any) {
        if (typeof keyword === 'string') {
            return <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{formatText(keyword)}</span>;
        }

        return (
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <p className="text-sm font-medium text-gray-900">{formatText(keyword.keyword || keyword.name || keyword.text || 'Keyword')}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-gray-500">
                    {keyword.competition && <span>Competition: {formatText(keyword.competition)}</span>}
                    {keyword.searchVolume && <span>Search volume: {formatText(keyword.searchVolume)}</span>}
                </div>
            </div>
        );
    }

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
                        {analysisJob.errorMessage && <p className="text-red-600 mt-4 text-sm">{analysisJob.errorMessage}</p>}
                    </div>
                </div>
            </div>
        );
    }

    const userProduct = analysisJob.products.find(p => p.isUserProduct === true);
    const competitorProducts = analysisJob.products.filter(p => p.isUserProduct === false);

    const totalProductsCount = analysisJob.products.length;
    const totalReviewsCount = analysisJob.products.reduce((sum, p) => sum + p.reviewCount, 0);

    const strengthsList = (analysisJob.strengths as any[]) || [];
    const weaknessesList = (analysisJob.weaknesses as any[]) || [];
    const actionItemsList = (analysisJob.actionItems as any[]) || [];
    const marketOpportunitiesList = (analysisJob.marketOpportunities as any[]) || [];
    const riskFactorsList = (analysisJob.riskFactors as any[]) || [];
    const productImprovements = (analysisJob.productImprovements as any[]) || [];
    const customerPersonas = (analysisJob.customerPersonas as any[]) || [];

    const purchaseCriteria = analysisJob.purchaseCriteria as any;
    const sentiment = analysisJob.sentiment as any;
    const competitivePositioning = analysisJob.competitivePositioning as any;
    const reviewHighlights = analysisJob.reviewHighlights as any;
    const trends = analysisJob.trends as any;
    const listingOptimization = analysisJob.listingOptimization as any;
    const pricingStrategy = analysisJob.pricingStrategy as any;
    const marketIntelligence = analysisJob.marketIntelligence as any;
    const summary = analysisJob.summary as any;
    const overallScore = analysisJob.overallScore || (userProduct?.rating ? Math.round(userProduct.rating * 20) : 0);

    const totalCompetitors = competitorProducts.length;
    const userProductRank = (() => {
        const allProducts = [...competitorProducts, userProduct].filter(p => p);
        const sorted = allProducts.sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
        const index = sorted.findIndex(p => p?.id === userProduct?.id);
        return index + 1;
    })();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-3">
                            <Link
                                href={`/dashboard/analysis/${analysisJob.id}`}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900 print:hidden"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to analysis
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Market Analysis Report</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-gray-500 text-sm font-mono">{userProduct?.asin || analysisJob.userProductAsin}</p>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <p className="text-gray-400 text-xs">{new Date(analysisJob.completedAt || new Date()).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-stretch gap-4 sm:items-end">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <ExportReportButton reportId={analysisJob.id} />
                                <Link
                                    href={`/dashboard/opportunities/${analysisJob.id}`}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors print:hidden"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    View Opportunities
                                </Link>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-gray-900">{overallScore}<span className="text-lg text-gray-400">/100</span></p>
                                    <p className="text-xs text-gray-500">Overall Score</p>
                                </div>
                                <div className="w-px h-10 bg-gray-200"></div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-gray-900">#{userProductRank}</p>
                                    <p className="text-xs text-gray-500">Quality Rank</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-100">
                        <div>
                            <p className="text-gray-400 text-xs mb-1">Your Product</p>
                            <p className="font-medium text-gray-900 text-sm line-clamp-2">{userProduct?.title || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs mb-1">Competitors</p>
                            <p className="font-semibold text-gray-900 text-lg">{totalCompetitors}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs mb-1">Total Products</p>
                            <p className="font-semibold text-gray-900 text-lg">{totalProductsCount}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs mb-1">Total Reviews</p>
                            <p className="font-semibold text-gray-900 text-lg">{totalReviewsCount.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs mb-1">Status</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                <CheckCircle className="w-3 h-3" /> {analysisJob.status}
                            </span>
                        </div>
                    </div>
                </div>

                {analysisJob.executiveSummary && (
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-6 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-semibold text-indigo-900">Executive Summary</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{analysisJob.executiveSummary}</p>
                    </div>
                )}

                {(strengthsList.length > 0 || weaknessesList.length > 0) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {strengthsList.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <ThumbsUp className="w-5 h-5 text-green-600" />
                                    <h3 className="font-semibold text-gray-900">Strengths</h3>
                                </div>
                                <ul className="space-y-2">
                                    {strengthsList.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 p-2 bg-green-50/30 rounded-lg">
                                            <span className="text-green-500 text-lg leading-5">•</span>
                                            <div className="flex-1">{renderStrength(s)}</div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {weaknessesList.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <ThumbsDown className="w-5 h-5 text-red-600" />
                                    <h3 className="font-semibold text-gray-900">Weaknesses</h3>
                                </div>
                                <ul className="space-y-2">
                                    {weaknessesList.map((w, i) => (
                                        <li key={i} className="flex items-start gap-2 p-2 bg-red-50/30 rounded-lg">
                                            <span className="text-red-500 text-lg leading-5">•</span>
                                            <div className="flex-1">{renderWeakness(w)}</div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {actionItemsList.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Recommended Action Items</h3>
                        </div>
                        <div className="space-y-3">
                            {actionItemsList.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                                    <div className="flex-1">{renderActionItem(item)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {userProduct && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-indigo-600" /> Your Product</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500 text-sm">Title</span><span className="text-gray-900 text-sm font-medium">{userProduct.title}</span></div>
                                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500 text-sm">ASIN</span><span className="text-gray-900 text-sm font-mono">{userProduct.asin}</span></div>
                                {userProduct.brand && <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500 text-sm">Brand</span><span className="text-gray-900 text-sm">{userProduct.brand}</span></div>}
                            </div>
                            <div className="space-y-2">
                                {userProduct.price && <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500 text-sm">Price</span><span className="text-gray-900 text-sm font-semibold">${userProduct.price.toFixed(2)}</span></div>}
                                {userProduct.rating && <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500 text-sm">Rating</span><div className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><span>{userProduct.rating}</span><span className="text-gray-400 text-xs">({userProduct.reviewCount.toLocaleString()} reviews)</span></div></div>}
                            </div>
                        </div>
                    </div>
                )}

                {competitorProducts.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-gray-600" /> Competitors ({competitorProducts.length})</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr className="text-left text-gray-500">
                                        <th className="px-4 py-3 font-medium rounded-l-lg">Product</th>
                                        <th className="px-4 py-3 font-medium">ASIN</th>
                                        <th className="px-4 py-3 font-medium">Price</th>
                                        <th className="px-4 py-3 font-medium">Rating</th>
                                        <th className="px-4 py-3 font-medium rounded-r-lg">Reviews</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {competitorProducts.map((comp) => (
                                        <tr key={comp.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-900 max-w-xs truncate">{comp.title}</td>
                                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">{comp.asin}</td>
                                            <td className="px-4 py-3 text-gray-900 font-medium">${comp.price?.toFixed(2) || '—'}</td>
                                            <td className="px-4 py-3">{comp.rating ? <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span>{comp.rating}</span></div> : '—'}</td>
                                            <td className="px-4 py-3 text-gray-600">{comp.reviewCount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {pricingStrategy && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                        <div className="flex items-center gap-2 mb-4"><DollarSign className="w-5 h-5 text-green-600" /><h3 className="font-semibold text-gray-900">Pricing Strategy Analysis</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pricingStrategy.sensitivity && <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Price Sensitivity</p><p className="text-sm font-medium text-gray-900">{formatText(pricingStrategy.sensitivity)}</p></div>}
                            {pricingStrategy.optimalRange && (pricingStrategy.optimalRange.min > 0 || pricingStrategy.optimalRange.max > 0) && (
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Optimal Price Range</p><p className="text-sm font-medium text-gray-900">${pricingStrategy.optimalRange.min} - ${pricingStrategy.optimalRange.max}</p></div>
                            )}
                            {pricingStrategy.valuePerception && <div className="p-3 bg-gray-50 rounded-lg col-span-2"><p className="text-xs text-gray-500">Value Perception</p><p className="text-sm text-gray-700">{formatText(pricingStrategy.valuePerception)}</p></div>}
                        </div>
                    </div>
                )}

                {competitivePositioning && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                        <div className="flex items-center gap-2 mb-4"><Award className="w-5 h-5 text-purple-600" /><h3 className="font-semibold text-gray-900">Competitive Positioning</h3></div>
                        <div className="space-y-3">
                            {competitivePositioning.advantage && <div className="p-3 bg-green-50 rounded-lg"><p className="text-xs text-green-700 font-semibold">Competitive Advantage</p><p className="text-sm text-gray-700">{formatText(competitivePositioning.advantage)}</p></div>}
                            {competitivePositioning.disadvantage && <div className="p-3 bg-red-50 rounded-lg"><p className="text-xs text-red-700 font-semibold">Competitive Disadvantage</p><p className="text-sm text-gray-700">{formatText(competitivePositioning.disadvantage)}</p></div>}
                            {competitivePositioning.uniqueSellingPoints?.length > 0 && (
                                <div><p className="text-xs text-gray-500 mb-2 font-semibold">Unique Selling Points</p><div className="flex flex-wrap gap-2">{competitivePositioning.uniqueSellingPoints.map((usp: string, i: number) => <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">{formatText(usp)}</span>)}</div></div>
                            )}
                        </div>
                    </div>
                )}

                {sentiment && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-600" /> Customer Sentiment Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg"><p className="text-2xl font-bold text-green-600">{sentiment.positive || 0}%</p><p className="text-xs text-gray-600">Positive</p></div>
                            <div className="text-center p-3 bg-gray-100 rounded-lg"><p className="text-2xl font-bold text-gray-600">{sentiment.neutral || 0}%</p><p className="text-xs text-gray-600">Neutral</p></div>
                            <div className="text-center p-3 bg-red-50 rounded-lg"><p className="text-2xl font-bold text-red-600">{sentiment.negative || 0}%</p><p className="text-xs text-gray-600">Negative</p></div>
                        </div>
                        {sentiment.overall && <div className="p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-700"><span className="font-semibold">Overall Sentiment:</span> {formatText(sentiment.overall)}</p></div>}
                    </div>
                )}

                {reviewHighlights && (reviewHighlights.bestQuote || reviewHighlights.recurringPhrases?.length > 0) && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-amber-600" /> Review Highlights</h3>
                        <div className="space-y-3">
                            {reviewHighlights.bestQuote && <div className="p-3 bg-green-50 rounded-lg"><p className="text-xs text-green-700 font-semibold">Best Customer Quote</p><p className="text-sm italic text-gray-700">"{formatText(reviewHighlights.bestQuote)}"</p></div>}
                            {reviewHighlights.recurringPhrases?.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-2 font-semibold">Recurring Themes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {reviewHighlights.recurringPhrases.map((theme: any, i: number) => (
                                            <span key={i} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
                                                {formatRecurringTheme(theme)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {userProduct?.reviews && userProduct.reviews.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-gray-600" /> Recent Customer Reviews</h3>
                        <div className="space-y-4">
                            {userProduct.reviews.slice(0, 5).map((review) => (
                                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex">{[...Array(5)].map((_, i) => (<Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />))}</div>
                                            {review.verifiedPurchase && <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Verified</span>}
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

                {(marketOpportunitiesList.length > 0 || riskFactorsList.length > 0) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {marketOpportunitiesList.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-amber-600" /><h3 className="font-semibold text-gray-900">Market Opportunities</h3></div>
                                <div className="space-y-3">{marketOpportunitiesList.map((opp, i) => (<div key={i} className="p-3 bg-amber-50/30 rounded-lg">{renderOpportunity(opp)}</div>))}</div>
                            </div>
                        )}
                        {riskFactorsList.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-red-600" /><h3 className="font-semibold text-gray-900">Risk Factors</h3></div>
                                <div className="space-y-3">{riskFactorsList.map((risk, i) => (<div key={i} className="p-3 bg-red-50/30 rounded-lg">{renderRisk(risk)}</div>))}</div>
                            </div>
                        )}
                    </div>
                )}

                {marketIntelligence && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                        <div className="flex items-center gap-2 mb-4"><ChartBar className="w-5 h-5 text-indigo-600" /><h3 className="font-semibold text-gray-900">Market Intelligence</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {marketIntelligence.demandScore > 0 && <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Demand Score</p><p className="text-lg font-bold text-gray-900">{marketIntelligence.demandScore}/100</p></div>}
                            {marketIntelligence.saturationLevel && <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Market Saturation</p><p className="text-sm font-medium text-gray-900">{formatText(marketIntelligence.saturationLevel)}</p></div>}
                            {marketIntelligence.substitutionThreat?.length > 0 && (
                                <div className="col-span-2 p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500 mb-2">Substitution Threats</p><div className="flex flex-wrap gap-2">{marketIntelligence.substitutionThreat.map((threat: any, i: number) => <div key={i}>{renderThreat(threat)}</div>)}</div></div>
                            )}
                        </div>
                    </div>
                )}

                {productImprovements.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                        <div className="flex items-center gap-2 mb-4"><RefreshCw className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-900">Recommended Product Improvements</h3></div>
                        <div className="space-y-3">
                            {productImprovements.map((imp, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{imp.area || formatText(imp)}</p>
                                        {imp.suggestion && <p className="text-sm text-gray-600">{formatText(imp.suggestion)}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {listingOptimization && (listingOptimization.titleSuggestions?.length > 0 || listingOptimization.backendKeywords?.length > 0) && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                        <div className="flex items-center gap-2 mb-4"><PenTool className="w-5 h-5 text-green-600" /><h3 className="font-semibold text-gray-900">Listing Optimization Suggestions</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {listingOptimization.titleSuggestions?.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-3 font-semibold">Title Suggestions</p>
                                    <div className="space-y-3">
                                        {listingOptimization.titleSuggestions.slice(0, 3).map((suggestion: any, i: number) => (
                                            <div key={i}>{renderTitleSuggestion(suggestion)}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {listingOptimization.backendKeywords?.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-3 font-semibold">Backend Keywords</p>
                                    <div className="flex flex-wrap gap-2">
                                        {listingOptimization.backendKeywords.slice(0, 10).map((keyword: any, i: number) => (
                                            <div key={i}>{renderBackendKeyword(keyword)}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {customerPersonas.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                        <div className="flex items-center gap-2 mb-4"><User className="w-5 h-5 text-purple-600" /><h3 className="font-semibold text-gray-900">Customer Personas</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {customerPersonas.map((persona, i) => (
                                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                                    <p className="font-medium text-gray-900">{formatText(persona.name)} {persona.percentage && <span className="text-xs text-gray-500">({formatText(persona.percentage)}%)</span>}</p>
                                    {persona.needs?.length > 0 && <p className="text-xs text-gray-600 mt-1">Needs: {persona.needs.map((n: any) => formatText(n)).join(', ')}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {trends && (trends.temporal?.length > 0 || trends.emergingIssues?.length > 0) && (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
                        <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-900">Market Trends</h3></div>
                        <div className="space-y-3">
                            {trends.emergingIssues?.length > 0 && (
                                <div><p className="text-xs text-gray-500 mb-2 font-semibold">Emerging Issues</p><div className="flex flex-wrap gap-2">{trends.emergingIssues.map((issue: any, i: number) => <div key={i}>{renderIssue(issue)}</div>)}</div></div>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><p className="text-2xl font-bold text-gray-900">{analysisJob.totalProductsScraped || totalProductsCount}</p><p className="text-xs text-gray-500">Products Analyzed</p></div>
                        <div><p className="text-2xl font-bold text-gray-900">{totalReviewsCount.toLocaleString()}</p><p className="text-xs text-gray-500">Reviews Analyzed</p></div>
                        <div><p className="text-2xl font-bold text-gray-900">{strengthsList.length + weaknessesList.length}</p><p className="text-xs text-gray-500">Insights Generated</p></div>
                        <div><p className="text-2xl font-bold text-gray-900">{actionItemsList.length + marketOpportunitiesList.length}</p><p className="text-xs text-gray-500">Recommendations</p></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Report generated on {new Date(analysisJob.completedAt || new Date()).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}