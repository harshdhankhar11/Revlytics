'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader, AlertCircle, Zap } from 'lucide-react';

interface AnalysisProgress {
    id: string;
    status: 'PENDING' | 'SCRAPING' | 'PROCESSING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
    progress: number;
    totalProductsScraped: number;
    totalReviewsScraped: number;
    errorMessage?: string;
    startedAt: string;
    completedAt?: string;
    isCompleted?: boolean;
}

export function ProgressMonitor({ analysisId }: { analysisId: string }) {
    const router = useRouter();
    const [data, setData] = useState<AnalysisProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const response = await fetch(`/api/analyze/${analysisId}`);
                if (!response.ok) throw new Error('Failed to fetch progress');
                const progress = await response.json();
                setData(progress);

                if (progress.status === 'COMPLETED' && progress.isCompleted === true) {
                    setTimeout(() => {
                        router.push(`/dashboard/analysis/${analysisId}/report`);
                    }, 2000);
                } else if (progress.status === 'FAILED') {
                    setError(progress.errorMessage || 'Analysis failed');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error fetching progress');
            } finally {
                setIsLoading(false);
            }
        };

        const interval = setInterval(fetchProgress, 1500);
        fetchProgress();

        return () => clearInterval(interval);
    }, [analysisId, router]);

    const statusText: Record<string, string> = {
        PENDING: 'Initializing analysis...',
        SCRAPING: 'Scraping product data from Amazon...',
        PROCESSING: 'Processing and extracting insights...',
        ANALYZING: 'Generating AI analysis...',
        COMPLETED: 'Analysis complete!',
        FAILED: 'Analysis failed',
    };

    const getPhaseBasedProgress = (status: string, progress: number): { displayProgress: number; phase: string } => {
        switch (status) {
            case 'PENDING':
                return { displayProgress: 5, phase: 'Initialization' };
            case 'SCRAPING':
                // SCRAPING: 5-50%
                const scrapingProgress = 5 + (progress * 0.45);
                return { displayProgress: Math.min(scrapingProgress, 50), phase: `Scraping: ${Math.round(progress)}%` };
            case 'PROCESSING':
                // PROCESSING: 50-85%
                const processingProgress = 50 + (progress * 0.35);
                return { displayProgress: Math.min(processingProgress, 85), phase: `Processing: ${Math.round(progress)}%` };
            case 'ANALYZING':
                // ANALYZING: 85-100%
                const analyzingProgress = 85 + (progress * 0.15);
                return { displayProgress: Math.min(analyzingProgress, 99), phase: `AI Analysis: ${Math.round(progress)}%` };
            case 'COMPLETED':
                return { displayProgress: 100, phase: 'Completed' };
            default:
                return { displayProgress: progress, phase: 'Processing' };
        }
    };

    const getPhaseColor = (status: string): string => {
        switch (status) {
            case 'SCRAPING':
                return 'from-blue-500 to-blue-600';
            case 'PROCESSING':
                return 'from-purple-500 to-purple-600';
            case 'ANALYZING':
                return 'from-indigo-500 to-indigo-600';
            case 'COMPLETED':
                return 'from-emerald-500 to-emerald-600';
            default:
                return 'from-indigo-500 to-indigo-600';
        }
    };

    const phaseProgress = data ? getPhaseBasedProgress(data.status, data.progress) : null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-xl">
                    {isLoading ? (
                        <div className="space-y-6 text-center">
                            <div className="h-20 w-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
                                <Loader className="w-10 h-10 text-indigo-600 animate-spin" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Initializing...</h2>
                                <p className="text-slate-600 mt-2">Starting your competitive analysis</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="space-y-6 text-center">
                            <div className="h-20 w-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Analysis Failed</h2>
                                <p className="text-center text-sm text-red-600 mt-4 bg-red-50 rounded-lg p-4">
                                    {error}
                                </p>
                            </div>
                        </div>
                    ) : data ? (
                        <div className="space-y-8">
                            {data.status === 'COMPLETED' && data.isCompleted ? (
                                <>
                                    <div className="h-20 w-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-slate-900">
                                            ✨ Analysis Complete!
                                        </h2>
                                        <p className="text-center text-sm text-slate-600 mt-3">
                                            Your comprehensive market analysis is ready. Redirecting to your report...
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-center">
                                        <div className="h-20 w-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                                            <Zap className="w-10 h-10 text-white animate-bounce" />
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-slate-900">
                                            {statusText[data.status]}
                                        </h2>
                                        <p className="text-slate-600 mt-2">{phaseProgress?.phase || 'Processing'}</p>
                                    </div>

                                    {/* Phase Progress Bar */}
                                    <div className="space-y-3">
                                        <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getPhaseColor(data.status)} rounded-full transition-all duration-700 shadow-lg`}
                                                style={{ width: `${Math.min(phaseProgress?.displayProgress || data.progress, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-bold text-indigo-600">{Math.min(phaseProgress?.displayProgress || data.progress, 100)}%</p>
                                            <p className="text-xs text-slate-500">
                                                {(phaseProgress?.displayProgress || 0) < 50 && 'Gathering data...'}
                                                {(phaseProgress?.displayProgress || 0) >= 50 && (phaseProgress?.displayProgress || 0) < 85 && 'Processing insights...'}
                                                {(phaseProgress?.displayProgress || 0) >= 85 && (phaseProgress?.displayProgress || 0) < 100 && 'Final AI analysis...'}
                                                {(phaseProgress?.displayProgress || 0) >= 100 && 'Finalizing...'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Phase Indicators */}
                                    <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div className={`text-center p-2 rounded ${data.status === 'PENDING' ? 'bg-yellow-100 border-yellow-300' : data.status === 'SCRAPING' || data.status === 'PROCESSING' || data.status === 'ANALYZING' || data.status === 'COMPLETED' ? 'bg-emerald-100 border-emerald-300' : 'bg-slate-100 border-slate-300'} border text-xs font-semibold`}>
                                            <p className="text-slate-700">📋 Init</p>
                                        </div>
                                        <div className={`text-center p-2 rounded ${data.status === 'SCRAPING' ? 'bg-yellow-100 border-yellow-300' : data.status === 'PROCESSING' || data.status === 'ANALYZING' || data.status === 'COMPLETED' ? 'bg-emerald-100 border-emerald-300' : 'bg-slate-100 border-slate-300'} border text-xs font-semibold`}>
                                            <p className="text-slate-700">📊 Scrape</p>
                                        </div>
                                        <div className={`text-center p-2 rounded ${data.status === 'PROCESSING' ? 'bg-yellow-100 border-yellow-300' : data.status === 'ANALYZING' || data.status === 'COMPLETED' ? 'bg-emerald-100 border-emerald-300' : 'bg-slate-100 border-slate-300'} border text-xs font-semibold`}>
                                            <p className="text-slate-700">⚙️ Process</p>
                                        </div>
                                        <div className={`text-center p-2 rounded ${data.status === 'ANALYZING' ? 'bg-yellow-100 border-yellow-300' : data.status === 'COMPLETED' ? 'bg-emerald-100 border-emerald-300' : 'bg-slate-100 border-slate-300'} border text-xs font-semibold`}>
                                            <p className="text-slate-700">🤖 AI</p>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                                            <p className="text-2xl font-bold text-slate-900">{data.totalProductsScraped}</p>
                                            <p className="text-xs text-slate-600 mt-1">Products</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                                            <p className="text-2xl font-bold text-slate-900">{data.totalReviewsScraped}</p>
                                            <p className="text-xs text-slate-600 mt-1">Reviews</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                                            <p className="text-2xl font-bold text-indigo-600">
                                                {data.status === 'ANALYZING' ? '🤖' : '✓'}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-1">Status</p>
                                        </div>
                                    </div>

                                    {/* Status Messages */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                        <p className="text-xs text-slate-700">
                                            <span className="font-semibold">Current Stage:</span> {statusText[data.status]}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-2">
                                            {data.status === 'SCRAPING' && '📊 Fetching product details, images, and customer reviews...'}
                                            {data.status === 'PROCESSING' && '⚙️ Processing data and extracting key insights...'}
                                            {data.status === 'ANALYZING' && '🧠 Running advanced AI analysis using Gemini 2.5...'}
                                            {data.status === 'PENDING' && '⏳ Preparing your analysis...'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Info Footer */}
                {data && data.status !== 'COMPLETED' && (
                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-600">
                            ⏱️ This analysis typically takes 2-3 minutes. Please don't close this window.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
