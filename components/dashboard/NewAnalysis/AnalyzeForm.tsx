'use client';

import React, { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lightbulb, Loader, Plus } from 'lucide-react';
import { UrlInput } from './UrlInput';
import { ProductPreview } from './ProductPreview';

const MAX_COMPETITORS = 9;

export function AnalyzeForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [userProductUrl, setUserProductUrl] = useState('');
    const [competitorUrls, setCompetitorUrls] = useState<string[]>(['', '', '']);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [globalError, setGlobalError] = useState('');

    const handleAddCompetitor = () => {
        if (competitorUrls.length < MAX_COMPETITORS) {
            setCompetitorUrls([...competitorUrls, '']);
            setErrors({ ...errors, [`competitor-${competitorUrls.length}`]: '' });
        }
    };

    const handleRemoveCompetitor = (index: number) => {
        const newUrls = competitorUrls.filter((_, i) => i !== index);
        setCompetitorUrls(newUrls);

        const newErrors = { ...errors };
        delete newErrors[`competitor-${index}`];
        setErrors(newErrors);
    };

    const pollingRef = useRef<number | null>(null);
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (pollingRef.current) clearTimeout(pollingRef.current);
        };
    }, []);

    const getPhaseBasedProgress = (status: string, progress: number | null) => {
        switch (status) {
            case 'PENDING':
                return 2;
            case 'SCRAPING':
                return 5 + Math.round(((progress ?? 0) / 100) * 45);
            case 'PROCESSING':
                // 50-85
                return 50 + Math.round(((progress ?? 0) / 100) * 35);
            case 'ANALYZING':
                // 85-99
                return 85 + Math.round(((progress ?? 0) / 100) * 14);
            case 'COMPLETED':
                return 100;
            case 'FAILED':
                return 0;
            default:
                return Math.max(1, Math.min(99, progress ?? 1));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setGlobalError('');

        const newErrors: { [key: string]: string } = {};

        if (!userProductUrl.trim()) {
            newErrors['product'] = 'Product URL is required';
        }

        const validCompetitors = competitorUrls.filter(url => url.trim());
        if (validCompetitors.length === 0) {
            newErrors['competitors'] = 'At least one competitor URL is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        startTransition(async () => {
            try {
                const fetchPreview = async (asinOrUrl: string) => {
                    const res = await fetch('/api/products/preview', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ asin: asinOrUrl }),
                    });
                    if (!res.ok) throw new Error('Failed to fetch product preview');
                    return res.json();
                };

                const previews = await Promise.all([
                    fetchPreview(userProductUrl),
                    ...validCompetitors.map((u) => fetchPreview(u)),
                ]);

                const productsPayload = previews.map((p: any, idx: number) => ({
                    asin: p.asin,
                    title: p.productName,
                    brand: p.brand || null,
                    price: p.currentPrice ?? null,
                    rating: p.rating ?? null,
                    reviewCount: p.reviews ?? 0,
                    bsr: p.bsr ?? null,
                    imageUrl: p.imageUrl ?? null,
                    link: p.link ?? `https://www.amazon.com/dp/${p.asin}`,
                    isUserProduct: idx === 0,
                }));

                // Post product payload directly to AI analyze API which will store and start background processing
                const aiRes = await fetch('/api/analyze/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ products: productsPayload }),
                });

                if (!aiRes.ok) {
                    const errText = await aiRes.text();
                    throw new Error(errText || 'AI analysis request failed');
                }

                const aiJson = await aiRes.json();
                const analysisJobId = aiJson?.analysisJobId;

                if (!analysisJobId) {
                    throw new Error('Missing analysis job id from AI API');
                }

                // Poll progress and show percentage inside the submit button
                setGlobalError('');
                const poll = async () => {
                    try {
                        const res = await fetch(`/api/analyze/${analysisJobId}`);
                        if (!res.ok) throw new Error('Failed to fetch progress');
                        const json = await res.json();
                        const status = json?.status;
                        const progressValue = json?.progress ?? null;
                        const percent = getPhaseBasedProgress(status, progressValue);
                        setGlobalError('');
                        setButtonProgress(percent);

                        if (status === 'COMPLETED' && json?.isCompleted) {
                            if (mountedRef.current) router.push(`/dashboard/analysis/${analysisJobId}/report`);
                            return;
                        }

                        if (status === 'FAILED') {
                            setGlobalError('Analysis failed. Please try again later.');
                            return;
                        }

                        if (mountedRef.current) {
                            pollingRef.current = window.setTimeout(poll, 1500);
                        }
                    } catch (err) {
                        console.error('Polling error', err);
                        if (mountedRef.current) pollingRef.current = window.setTimeout(poll, 2500);
                    }
                };

                // set initial progress
                setButtonProgress(5);
                poll();
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to start analysis';
                setGlobalError(message);
            }
        });
    };

    const [buttonProgress, setButtonProgress] = useState<number | null>(null);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
                {globalError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 font-medium">{globalError}</p>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Your Product</h3>
                    <UrlInput
                        label="Product URL (ASIN or Direct Link)"
                        value={userProductUrl}
                        onChange={setUserProductUrl}
                        error={errors['product']}
                        placeholder="https://www.amazon.com/dp/B0CMPMY9ZZ"
                    />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                        Competitors (up to {MAX_COMPETITORS})
                    </h3>
                    {errors['competitors'] && (
                        <p className="text-sm text-red-600 mb-4">{errors['competitors']}</p>
                    )}
                    <div className="space-y-3">
                        {competitorUrls.map((url, index) => (
                            <UrlInput
                                key={index}
                                label={`Competitor ${index + 1}${url.trim() === '' ? ' (optional)' : ''}`}
                                value={url}
                                onChange={(value) => {
                                    const newUrls = [...competitorUrls];
                                    newUrls[index] = value;
                                    setCompetitorUrls(newUrls);
                                    if (errors[`competitor-${index}`]) {
                                        const newErrors = { ...errors };
                                        delete newErrors[`competitor-${index}`];
                                        setErrors(newErrors);
                                    }
                                }}
                                onRemove={() => handleRemoveCompetitor(index)}
                                showRemove={competitorUrls.length > 1}
                                placeholder="https://www.amazon.com/dp/..."
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {competitorUrls.length < MAX_COMPETITORS && (
                        <button
                            type="button"
                            onClick={handleAddCompetitor}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Competitor
                        </button>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">Tip:</span> We'll scrape 100+ reviews per product
                        and analyze with AI. Takes 2-3 minutes per analysis.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                    {buttonProgress !== null ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            {buttonProgress}%
                        </>
                    ) : isPending ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Starting Analysis...
                        </>
                    ) : (
                        <>
                            🚀 Analyze My Market
                        </>
                    )}
                </button>
            </form>

            {/* Right Column - Product Previews */}
            <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 px-2">Product Preview</h3>

                    {/* Main Product Preview */}
                    <ProductPreview url={userProductUrl} isMain={true} />

                    {/* Competitor Previews */}
                    {competitorUrls.map((url, index) => (
                        <ProductPreview key={index} url={url} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
