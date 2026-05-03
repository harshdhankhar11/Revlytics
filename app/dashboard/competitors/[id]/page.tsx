"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, TrendingUp, TrendingDown, ArrowRight, Zap, Package, Truck, Award } from "lucide-react";

interface CompetitorData {
    rank: number;
    competitorName: string;
    competitorBrand: string;
    estimatedMonthlyRevenue: number;
    marketShare: number;
    overallRating: number;
    reviewCount: number;
    topStrengths: string[];
    topWeaknesses: string[];
}

interface CriteriaData {
    criteriaName: string;
    competitorScore: number;
    userProductScore: number;
    customerMentionPercentage: number;
    importanceRank: number;
}

interface GapData {
    gapTitle: string;
    gapDescription: string;
    yourAdvantage: string;
    estimatedImpact: string;
    opportunitySize: string;
}

interface RecommendationData {
    title: string;
    description: string;
    expectedImpact: string;
    category: string;
    effort: string;
    actionSteps: string[];
}

export default function CompetitorsPage() {
    const [data, setData] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const params = useParams();
    const analysisJobId = params.id as string;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/competitors?analysisJobId=${analysisJobId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch competitor data");
                }

                const result = await response.json();
                setData(result);
                setError(null);
            } catch (err) {
                console.error("Error fetching competitors:", err);
                setError(
                    err instanceof Error ? err.message : "Failed to fetch data"
                );
            } finally {
                setLoading(false);
            }
        };

        if (analysisJobId) {
            fetchData();
        }
    }, [analysisJobId]);

    const handleAnalyzeCompetitors = async () => {
        try {
            setIsAnalyzing(true);
            const response = await fetch("/api/competitors/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ analysisJobId }),
            });

            if (!response.ok) {
                throw new Error("Failed to analyze competitors");
            }

            // Refresh data after analysis
            const refreshResponse = await fetch(
                `/api/competitors?analysisJobId=${analysisJobId}`
            );
            const result = await refreshResponse.json();
            setData(result);
            setIsAnalyzing(false);
        } catch (err) {
            console.error("Error analyzing competitors:", err);
            setError(
                err instanceof Error ? err.message : "Failed to analyze data"
            );
            setIsAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading competitor data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const userProduct = data?.userProduct;
    const competitors: CompetitorData[] = data?.competitorData || [];
    const criteria: CriteriaData[] = data?.competitorCriteria || [];
    const gaps: GapData[] = data?.competitiveGaps || [];
    const recommendations: RecommendationData[] =
        data?.competitiveRecommendations || [];
    const totalRevenue = data?.totalRevenue || 0;

    const userRank =
        competitors.findIndex(
            (c) => c.competitorName === userProduct?.title
        ) + 1 || competitors.length + 1;
    const leaderRevenue = competitors[0]?.estimatedMonthlyRevenue || 0;
    const revenueGap = leaderRevenue - (userProduct?.monthlyRevenue || 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                ⚔️ Competitor Battle Map
                            </h1>
                            <p className="text-gray-600 mt-2">
                                How {userProduct?.title || "your product"} stacks
                                up against top 5 competitors
                            </p>
                        </div>
                        <button
                            onClick={handleAnalyzeCompetitors}
                            disabled={isAnalyzing}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Zap className="w-4 h-4" />
                            {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
                        <div className="text-sm text-gray-600 mb-1">
                            📊 Your Rank
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                            #{userRank}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            of {competitors.length + 1} products
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
                        <div className="text-sm text-gray-600 mb-1">
                            🏆 Market Leader
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {competitors[0]?.competitorBrand ||
                                competitors[0]?.competitorName}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            {formatCurrency(leaderRevenue)}/month
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
                        <div className="text-sm text-gray-600 mb-1">
                            💰 Your Revenue
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(userProduct?.monthlyRevenue || 0)}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            {userProduct?.monthlyRevenue
                                ? (
                                    ((userProduct.monthlyRevenue / totalRevenue) *
                                        100)
                                ).toFixed(1)
                                : "0"}
                            % market share
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
                        <div className="text-sm text-gray-600 mb-1">
                            📈 Gap to #1
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                            +{Math.round((revenueGap / (userProduct?.monthlyRevenue || 1)) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            {formatCurrency(revenueGap)} behind leader
                        </div>
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-bold text-gray-900">
                            📊 Competitor Comparison Table
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Rank
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Brand
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Reviews
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Monthly Revenue
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Market Share
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {competitors.map((competitor, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            {competitor.rank}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                            {competitor.competitorName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {competitor.competitorBrand}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-gray-900">
                                                    {competitor.overallRating?.toFixed(
                                                        1
                                                    ) || "N/A"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {competitor.reviewCount?.toLocaleString() ||
                                                "0"}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            {formatCurrency(
                                                competitor.estimatedMonthlyRevenue || 0
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-600"
                                                        style={{
                                                            width: `${competitor.marketShare}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-gray-600">
                                                    {competitor.marketShare?.toFixed(
                                                        1
                                                    )}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Customer Criteria Comparison */}
                {criteria.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                🎯 What Customers Care About (By Importance)
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-200">
                            {criteria
                                .sort(
                                    (a, b) =>
                                        (a.importanceRank || 999) -
                                        (b.importanceRank || 999)
                                )
                                .slice(0, 5)
                                .map((crit, index) => {
                                    const yourScore = crit.userProductScore || 0;
                                    const theirScore =
                                        crit.competitorScore || 0;
                                    const gap =
                                        ((yourScore - theirScore) / theirScore) *
                                        100;
                                    const isWinner = yourScore > theirScore;

                                    return (
                                        <div
                                            key={index}
                                            className="px-6 py-4"
                                        >
                                            <div className="mb-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            {index + 1}.{" "}
                                                            {
                                                                crit.criteriaName
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {crit.customerMentionPercentage?.toFixed(
                                                                0
                                                            )}
                                                            % of customers mention
                                                            this
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Your Product Score */}
                                            <div className="mb-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-indigo-600">
                                                            YOU
                                                        </span>
                                                        {isWinner && (
                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                                ✓ LEADER
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {yourScore}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-600"
                                                        style={{
                                                            width: `${Math.min(
                                                                yourScore,
                                                                100
                                                            )}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Competitor Score */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-600">
                                                            LEADER
                                                        </span>
                                                        {!isWinner && (
                                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                                                ⚠️ -{" "}
                                                                {Math.abs(
                                                                    gap
                                                                ).toFixed(0)}
                                                                %
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {theirScore}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-purple-600"
                                                        style={{
                                                            width: `${Math.min(
                                                                theirScore,
                                                                100
                                                            )}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {/* Competitive Gaps */}
                {gaps.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                💡 Competitive Gaps (Opportunities)
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-200">
                            {gaps.map((gap, index) => (
                                <div key={index} className="px-6 py-4">
                                    <div className="flex gap-4">
                                        <div className="text-2xl flex-shrink-0">
                                            {gap.opportunitySize === "HIGH"
                                                ? "🔥"
                                                : gap.opportunitySize ===
                                                    "MEDIUM"
                                                    ? "📦"
                                                    : "🚀"}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {gap.gapTitle}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {gap.gapDescription}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-indigo-600 font-medium">
                                                    {gap.yourAdvantage}
                                                </span>
                                                <span className="text-sm font-bold text-green-600">
                                                    {gap.estimatedImpact}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                🎯 Actionable Recommendations
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-200">
                            {recommendations
                                .sort((a, b) => {
                                    const priorityOrder = {
                                        HIGH: 0,
                                        MEDIUM: 1,
                                        LOW: 2,
                                    };
                                    return (
                                        (priorityOrder[
                                            a.effort as keyof typeof priorityOrder
                                        ] || 999) -
                                        (priorityOrder[
                                            b.effort as keyof typeof priorityOrder
                                        ] || 999)
                                    );
                                })
                                .map((rec, index) => (
                                    <div
                                        key={index}
                                        className="px-6 py-4"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {index + 1}. {rec.title}
                                                    </h3>
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded ${rec.effort ===
                                                                "EASY"
                                                                ? "bg-green-100 text-green-700"
                                                                : rec.effort ===
                                                                    "MEDIUM"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {rec.effort}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {rec.description}
                                                </p>
                                                {rec.actionSteps?.length >
                                                    0 && (
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            <p className="font-medium mb-1">
                                                                Action Steps:
                                                            </p>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {rec.actionSteps.map(
                                                                    (
                                                                        step,
                                                                        i
                                                                    ) => (
                                                                        <li
                                                                            key={i}
                                                                        >
                                                                            {step}
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm">
                                                        <span className="text-gray-600">
                                                            Expected Impact:{" "}
                                                        </span>
                                                        <span className="font-bold text-green-600">
                                                            {rec.expectedImpact}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
