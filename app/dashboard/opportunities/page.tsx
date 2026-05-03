'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
    Search,
    TrendingUp,
    Zap,
    AlertCircle,
    Flame,
    ChevronRight,
    RefreshCw,
    Copy,
    Share2,
    Sparkles,
    Loader,
} from 'lucide-react';

interface Opportunity {
    id: string;
    analysisJobId: string;
    title: string;
    description: string;
    category: string;
    impact: string;
    effort: string;
    confidenceScore: number;
    estimatedImpact: string;
    customerDemand: string;
    competitorGap: string;
    status: string;
    priorityScore: number;
}

interface Analysis {
    id: string;
    userProductUrl: string;
    products: Array<{
        title: string;
        isUserProduct: boolean;
    }>;
}

export default function OpportunitiesPage() {
    const { status } = useSession();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingMarket, setGeneratingMarket] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [impactFilter, setImpactFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('pending');

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [oppRes, analysisRes] = await Promise.all([
                fetch('/api/opportunities'),
                fetch('/api/reports'),
            ]);

            if (oppRes.ok) {
                setOpportunities(await oppRes.json());
            }
            if (analysisRes.ok) {
                setAnalyses(await analysisRes.json());
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateMarketAnalysis = async () => {
        setGeneratingMarket(true);
        try {
            const response = await fetch('/api/opportunities/ai/market-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate market analysis');
            }

            await fetchData();
        } catch (error) {
            console.error('Error:', error);
            alert(error instanceof Error ? error.message : 'Failed to generate market analysis');
        } finally {
            setGeneratingMarket(false);
        }
    };

    const copyOpportunity = async (opp: Opportunity) => {
        const lines = [
            opp.title,
            opp.description,
            `Category: ${opp.category}`,
            `Impact: ${opp.impact}`,
            `Effort: ${opp.effort}`,
            `Confidence: ${opp.confidenceScore}%`,
            opp.estimatedImpact ? `Estimated Impact: ${opp.estimatedImpact}` : null,
            opp.customerDemand ? `Customer Demand: ${opp.customerDemand}` : null,
            opp.competitorGap ? `Competitor Gap: ${opp.competitorGap}` : null,
        ].filter(Boolean);

        try {
            await navigator.clipboard.writeText(lines.join('\n'));
        } catch (error) {
            console.error('Failed to copy opportunity:', error);
        }
    };

    const shareOpportunity = async (opp: Opportunity) => {
        const text = `${opp.title}\n${opp.description}`;
        const shareData = {
            title: opp.title,
            text,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                return;
            }

            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error('Failed to share opportunity:', error);
        }
    };

    const filteredOpportunities = opportunities.filter((opp) => {
        const matchesSearch =
            opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opp.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || opp.category === categoryFilter;
        const matchesImpact = impactFilter === 'ALL' || opp.impact === impactFilter;
        const matchesStatus = opp.status === statusFilter;
        return matchesSearch && matchesCategory && matchesImpact && matchesStatus;
    });

    const groupedByAnalysis = filteredOpportunities.reduce((acc, opp) => {
        const analysisId = opp.analysisJobId;
        if (!acc[analysisId]) {
            acc[analysisId] = [];
        }
        acc[analysisId].push(opp);
        return acc;
    }, {} as Record<string, Opportunity[]>);

    const getAnalysisTitle = (analysisId: string) => {
        const analysis = analyses.find((a) => a.id === analysisId);
        const userProduct = analysis?.products?.find((p) => p.isUserProduct);
        return userProduct?.title || 'Unknown Product';
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'HIGH':
                return 'bg-red-50 border-red-200 text-red-700';
            case 'MEDIUM':
                return 'bg-amber-50 border-amber-200 text-amber-700';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-700';
        }
    };

    const getEffortColor = (effort: string) => {
        switch (effort) {
            case 'EASY':
                return 'bg-green-50 border-green-200 text-green-700';
            case 'MEDIUM':
                return 'bg-amber-50 border-amber-200 text-amber-700';
            default:
                return 'bg-red-50 border-red-200 text-red-700';
        }
    };

    const getImpactIcon = (impact: string) => {
        switch (impact) {
            case 'HIGH':
                return <Flame className="w-4 h-4" />;
            case 'MEDIUM':
                return <Zap className="w-4 h-4" />;
            default:
                return <TrendingUp className="w-4 h-4" />;
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading opportunities...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Growth Opportunities</h1>
                    <p className="text-lg text-slate-600">Actionable insights to beat competitors and increase sales</p>
                </div>

                {opportunities.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        {analyses.length === 0 ? (
                            <>
                                <p className="text-slate-600 text-lg mb-4">You need 1 analysis report</p>
                                <p className="text-slate-500 mb-6">Start by running an analysis to get market insights and opportunities</p>
                                <Link
                                    href="/dashboard/new-analysis"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Start Analysis
                                </Link>
                            </>
                        ) : (
                            <>
                                <p className="text-slate-600 text-lg mb-4">No opportunities found yet</p>
                                <p className="text-slate-500 mb-6">Generate AI-powered market analysis opportunities from your analysis data</p>
                                <button
                                    onClick={handleGenerateMarketAnalysis}
                                    disabled={generatingMarket}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition-colors"
                                >
                                    {generatingMarket ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Analyzing Market...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Find New Market Analysis
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search opportunities..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-end gap-4">
                                    <button
                                        onClick={fetchData}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Refresh
                                    </button>
                                    <button
                                        onClick={handleGenerateMarketAnalysis}
                                        disabled={generatingMarket}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        {generatingMarket ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                Market Analysis
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Impact</label>
                                    <select
                                        value={impactFilter}
                                        onChange={(e) => setImpactFilter(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="ALL">All Impact</option>
                                        <option value="HIGH">High Impact</option>
                                        <option value="MEDIUM">Medium Impact</option>
                                        <option value="LOW">Low Impact</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="ALL">All Categories</option>
                                        <option value="Listing Optimization">Listing Optimization</option>
                                        <option value="Product Improvement">Product Improvement</option>
                                        <option value="Pricing Strategy">Pricing Strategy</option>
                                        <option value="Marketing Angle">Marketing Angle</option>
                                        <option value="Competitive Response">Competitive Response</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="pending">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {Object.entries(groupedByAnalysis).map(([analysisId, opps]) => (
                            <div key={analysisId} className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">{getAnalysisTitle(analysisId)}</h2>
                                        <p className="text-sm text-slate-500 mt-1">{opps.length} opportunities found</p>
                                    </div>
                                    <Link
                                        href={`/dashboard/opportunities/${analysisId}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition-colors"
                                    >
                                        View Details
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>

                                <div className="grid gap-4">
                                    {opps.map((opp) => (
                                        <div key={opp.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{opp.title}</h3>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getImpactColor(opp.impact)}`}>
                                                            {getImpactIcon(opp.impact)}
                                                            {opp.impact} Impact
                                                        </span>
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getEffortColor(opp.effort)}`}>
                                                            {opp.effort} Effort
                                                        </span>
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700">
                                                            {opp.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-slate-900">{opp.priorityScore}</p>
                                                    <p className="text-xs text-slate-500">Priority</p>
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-600 mb-4">{opp.description}</p>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                {opp.estimatedImpact && (
                                                    <div className="rounded-lg bg-slate-50 p-3">
                                                        <p className="text-xs text-slate-500 mb-1">Expected Impact</p>
                                                        <p className="text-sm font-semibold text-slate-900">{opp.estimatedImpact}</p>
                                                    </div>
                                                )}
                                                {opp.customerDemand && (
                                                    <div className="rounded-lg bg-slate-50 p-3">
                                                        <p className="text-xs text-slate-500 mb-1">Customer Demand</p>
                                                        <p className="text-sm font-semibold text-slate-900">{opp.customerDemand}</p>
                                                    </div>
                                                )}
                                                <div className="rounded-lg bg-slate-50 p-3">
                                                    <p className="text-xs text-slate-500 mb-1">Confidence</p>
                                                    <p className="text-sm font-semibold text-slate-900">{opp.confidenceScore}%</p>
                                                </div>
                                                {opp.competitorGap && (
                                                    <div className="rounded-lg bg-slate-50 p-3">
                                                        <p className="text-xs text-slate-500 mb-1">Competitor Gap</p>
                                                        <p className="text-sm font-semibold text-slate-900">{opp.competitorGap}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => copyOpportunity(opp)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                    Copy
                                                </button>
                                                <button
                                                    onClick={() => shareOpportunity(opp)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                    Share
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
