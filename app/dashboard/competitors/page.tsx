"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Microscope, Zap } from "lucide-react";

interface Analysis {
    id: string;
    userProductUrl: string;
    userProductAsin?: string;
    status: string;
    completedAt?: string;
    products: Array<{
        title: string;
        brand?: string;
        monthlyRevenue?: number;
        isUserProduct: boolean;
    }>;
}

export default function CompetitorsListPage() {
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzeProgress, setAnalyzeProgress] = useState<{
        current: number;
        total: number;
        currentAnalysis: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchAnalyses = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch analyses from new dedicated endpoint
                const response = await fetch("/api/competitors/products");

                if (response.ok) {
                    const data = await response.json();
                    setAnalyses(data.analyses || []);
                } else {
                    // Fallback: try to fetch from dashboard
                    try {
                        const dashResponse = await fetch("/api/dashboard");
                        if (dashResponse.ok) {
                            const dashData = await dashResponse.json();
                            const jobs = dashData.analysisJobs || [];
                            setAnalyses(
                                Array.isArray(jobs)
                                    ? jobs.filter(
                                        (job: any) => job.products?.length > 1
                                    )
                                    : []
                            );
                        } else {
                            setAnalyses([]);
                        }
                    } catch (err) {
                        console.error("Fallback fetch error:", err);
                        setAnalyses([]);
                    }
                }
            } catch (err) {
                console.error("Error fetching analyses:", err);
                setAnalyses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyses();
    }, []);

    const handleAnalyzeAllCompetitors = async () => {
        try {
            setAnalyzing(true);
            setError(null);
            setSuccessMessage(null);

            // Fetch latest analyses from database
            const response = await fetch("/api/competitors/products");

            if (!response.ok) {
                setError("Failed to fetch analyses from database.");
                setAnalyzing(false);
                return;
            }

            const data = await response.json();
            const currentAnalyses = data.analyses || [];

            if (currentAnalyses.length === 0) {
                setError(
                    "📊 No analyses with competitors found. Please run a product analysis first to compare with competitors."
                );
                setAnalyzing(false);
                return;
            }

            const totalAnalyses = currentAnalyses.length;

            for (let i = 0; i < totalAnalyses; i++) {
                const analysis = currentAnalyses[i];
                const userProduct = analysis.products?.find(
                    (p: any) => p.isUserProduct
                );

                setAnalyzeProgress({
                    current: i + 1,
                    total: totalAnalyses,
                    currentAnalysis: userProduct?.title || `Analysis ${i + 1}`,
                });

                try {
                    const response = await fetch("/api/competitors/ai", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ analysisJobId: analysis.id }),
                    });

                    if (!response.ok) {
                        console.error(
                            `Failed to analyze ${analysis.id}:`,
                            await response.text()
                        );
                    }
                } catch (err) {
                    console.error(`Error analyzing ${analysis.id}:`, err);
                }
            }

            setSuccessMessage(
                `✅ Competitor analysis completed for ${totalAnalyses} product(s)! Check individual battle maps for detailed insights.`
            );
            setAnalyzeProgress(null);

            // Refresh page and analyses
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to analyze competitors"
            );
            setAnalyzeProgress(null);
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analyses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            ⚔️ Competitor Analysis
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Select an analysis to view competitive battle maps and market
                            insights
                        </p>
                    </div>
                    <button
                        onClick={handleAnalyzeAllCompetitors}
                        disabled={analyzing}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
                    >
                        <Zap className="w-5 h-5" />
                        {analyzing ? "Analyzing..." : "Analyze with AI"}
                    </button>
                </div>

                {/* Progress Bar */}
                {analyzeProgress && (
                    <div className="mb-6 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                                📊 Analyzing: {analyzeProgress.currentAnalysis}
                            </p>
                            <p className="text-xs text-gray-600 mb-3">
                                Progress: {analyzeProgress.current} of{" "}
                                {analyzeProgress.total}
                            </p>
                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 transition-all duration-300"
                                    style={{
                                        width: `${(analyzeProgress.current /
                                            analyzeProgress.total) *
                                            100
                                            }%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                            <p className="text-sm text-gray-600">
                                AI is analyzing your competitors... This may take a minute.
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {analyses.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Microscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                            No competitor analyses yet.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Run product analyses first, then click "Analyze with AI" above to generate competitor battle maps.
                        </p>
                        <Link
                            href="/dashboard/new-analysis"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-gray-700 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                            Create Your First Analysis
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {analyses.map((analysis) => {
                            const userProduct = analysis.products?.find(
                                (p) => p.isUserProduct
                            );
                            const competitorCount =
                                analysis.products?.length - 1 || 0;

                            return (
                                <Link
                                    key={analysis.id}
                                    href={`/dashboard/competitors/${analysis.id}`}
                                >
                                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                                        <div className="mb-4">
                                            <h2 className="text-lg font-bold text-gray-900 line-clamp-2">
                                                {userProduct?.title ||
                                                    "Unknown Product"}
                                            </h2>
                                            <p className="text-sm text-gray-600">
                                                {userProduct?.brand}
                                            </p>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                    Competitors Analyzed
                                                </p>
                                                <p className="text-2xl font-bold text-indigo-600">
                                                    {competitorCount}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                    Monthly Revenue
                                                </p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {userProduct?.monthlyRevenue
                                                        ? new Intl.NumberFormat(
                                                            "en-US",
                                                            {
                                                                style: "currency",
                                                                currency:
                                                                    "USD",
                                                                maximumFractionDigits: 0,
                                                            }
                                                        ).format(
                                                            userProduct.monthlyRevenue
                                                        )
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                                            <span className="text-sm text-gray-600">
                                                View battle map
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-indigo-600" />
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
