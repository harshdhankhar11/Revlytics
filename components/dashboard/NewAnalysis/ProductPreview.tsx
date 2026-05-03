'use client';

import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, Star, ExternalLink, Check } from 'lucide-react';

interface ProductData {
    asin: string;
    productName: string;
    currentPrice: number | null;
    originalPrice: number | null;
    rating: number | null;
    reviews: number;
    imageUrl: string | null;
    currency: string;
    isBestSeller: boolean;
    isAmazonChoice: boolean;
    isPrime: boolean;
    link: string;
}

interface ProductPreviewProps {
    url: string;
    index?: number;
    isMain?: boolean;
}

export function ProductPreview({ url, index, isMain = false }: ProductPreviewProps) {
    const [product, setProduct] = useState<ProductData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!url.trim()) {
            setProduct(null);
            setError('');
            return;
        }

        const fetchProduct = async () => {
            setLoading(true);
            setError('');

            try {
                if (!url.trim()) {
                    setError('Invalid URL');
                    setProduct(null);
                    setLoading(false);
                    return;
                }

                const response = await fetch('/api/products/preview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ asin: url }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch product');
                }

                setProduct(data);
                setError('');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error fetching product');
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchProduct, 800);
        return () => clearTimeout(debounceTimer);
    }, [url]);

    if (!url.trim()) {
        return null;
    }

    return (
        <div className={`bg-white rounded-lg border-2 overflow-hidden transition-all ${error ? 'border-red-200' : 'border-slate-200'
            } hover:shadow-md`}>
            {/* Header */}
            <div className={`px-4 py-3 border-b flex items-center justify-between ${isMain ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'
                }`}>
                <span className="text-xs font-semibold text-slate-700">
                    {isMain ? '🎯 Your Product' : `📦 Competitor ${index ? index + 1 : ''}`}
                </span>
                {loading && <Loader className="w-4 h-4 text-indigo-600 animate-spin" />}
            </div>

            {/* Content */}
            <div className="p-4">
                {loading && !product ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
                        <p className="text-xs text-slate-600">Fetching product...</p>
                    </div>
                ) : error ? (
                    <div className="space-y-2">
                        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700">{error}</p>
                        </div>
                        {error.includes('Product not found') && (
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <p className="text-xs font-semibold text-amber-900 mb-1">Try:</p>
                                <ul className="text-xs text-amber-800 space-y-1">
                                    <li>• Check if the product exists on Amazon</li>
                                    <li>• Copy URL directly from Amazon product page</li>
                                    <li>• Try a different product</li>
                                    <li>• Some restricted products cannot be scraped</li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : product ? (
                    <div className="space-y-3">
                        {/* Image */}
                        {product.imageUrl && (
                            <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden">
                                <img
                                    src={product.imageUrl}
                                    alt={product.productName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        {/* Title */}
                        <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group"
                        >
                            <p className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors flex items-start gap-2">
                                {product.productName}
                                <ExternalLink className="w-3 h-3 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100" />
                            </p>
                        </a>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                            {product.isAmazonChoice && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded text-orange-700 text-xs font-medium">
                                    <Check className="w-3 h-3" />
                                    Amazon Choice
                                </span>
                            )}
                            {product.isBestSeller && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 text-xs font-medium">
                                    <Star className="w-3 h-3" />
                                    Best Seller
                                </span>
                            )}
                        </div>

                        {/* Rating */}
                        {product.rating !== null && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3.5 h-3.5 ${i < Math.round(product.rating!)
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-slate-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-semibold text-slate-900">
                                    {product.rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-slate-600">
                                    ({product.reviews.toLocaleString()} reviews)
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        {product.currentPrice !== null && (
                            <div className="pt-2 border-t border-slate-200">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-bold text-slate-900">
                                        {product.currency} {product.currentPrice.toFixed(2)}
                                    </span>
                                    {product.originalPrice && product.originalPrice > product.currentPrice && (
                                        <span className="text-sm text-slate-500 line-through">
                                            {product.currency} {product.originalPrice.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* View Link */}
                        <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block w-full mt-2 px-3 py-2 text-center text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                        >
                            View on Amazon ↗
                        </a>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
