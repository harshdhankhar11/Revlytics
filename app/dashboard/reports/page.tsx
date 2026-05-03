'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
    Search,
    Filter,
    Calendar,
    Zap,
    CheckCircle2,
    AlertCircle,
    Clock,
    ChevronRight,
} from 'lucide-react';

interface AnalysisReport {
    id: string;
    status: string;
    progress: number;
    startedAt: string;
    completedAt: string | null;
    products: Array<{
        id: string;
        title: string;
        isUserProduct: boolean;
        price: number | null;
        rating: number | null;
        reviewCount: number;
    }>;
    userProductUrl: string;
    analysisResults: any;
}

export default function ReportsPage() {
    const { data: session, status } = useSession();
    const [analyses, setAnalyses] = useState<AnalysisReport[]>([]);
    const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    useEffect(() => {
        fetchAnalyses();
    }, []);

    useEffect(() => {
        filterAnalyses();
    }, [analyses, searchTerm, statusFilter]);

    const fetchAnalyses = async () => {
        try {
            const response = await fetch('/api/reports');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setAnalyses(data);
        } catch (error) {
            console.error('Error fetching analyses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAnalyses = () => {
        let filtered = analyses;

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter((a) => a.status === statusFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (a) =>
                    a.products.some((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    a.userProductUrl.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredAnalyses(filtered);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case 'FAILED':
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-amber-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'FAILED':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'PENDING':
                return 'bg-slate-50 text-slate-700 border-slate-200';
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Analysis Reports</h1>
                    <p className="text-lg text-slate-600">View all your market analyses and reports</p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by product or URL..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="ALL">All Status</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="PENDING">Pending</option>
                                <option value="FAILED">Failed</option>
                            </select>
                        </div>

                        {/* Refresh */}
                        <div className="flex items-end">
                            <button
                                onClick={fetchAnalyses}
                                className="w-full px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition-colors"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block">
                            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                        </div>
                        <p className="text-slate-600 mt-4">Loading your analyses...</p>
                    </div>
                ) : filteredAnalyses.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 text-lg mb-4">No analyses found</p>
                        <Link
                            href="/dashboard/new-analysis"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Create New Analysis
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredAnalyses.map((analysis) => {
                            const mainProduct = analysis.products.find((p) => p.isUserProduct);
                            const competitors = analysis.products.filter((p) => !p.isUserProduct);

                            return (
                                <div
                                    key={analysis.id}
                                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {getStatusIcon(analysis.status)}
                                                <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                                                    {mainProduct?.title || 'Unknown Product'}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-slate-600">{mainProduct?.id}</p>
                                        </div>
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                                analysis.status
                                            )}`}
                                        >
                                            {analysis.status}
                                        </span>
                                    </div>

                                    {/* Product Info */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-slate-200">
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Main Product</p>
                                            <p className="font-semibold text-slate-900">1 Product</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Competitors</p>
                                            <p className="font-semibold text-slate-900">{competitors.length} Products</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Avg Rating</p>
                                            <p className="font-semibold text-slate-900">
                                                {mainProduct?.rating ? `${mainProduct.rating.toFixed(1)}⭐` : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Analyzed</p>
                                            <p className="font-semibold text-slate-900">
                                                {new Date(analysis.startedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-sm text-slate-700">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(analysis.startedAt).toLocaleString()}
                                        </div>
                                        {analysis.progress > 0 && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 rounded-lg text-sm text-indigo-700">
                                                <Zap className="w-4 h-4" />
                                                {analysis.progress}% Complete
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-3">
                                        {analysis.status === 'COMPLETED' ? (
                                            <>
                                                <Link
                                                    href={`/dashboard/analysis/${analysis.id}/report`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition-colors"
                                                >
                                                    View Report
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </>
                                        ) : analysis.status === 'FAILED' ? (
                                            <Link
                                                href={`/dashboard/analysis/${analysis.id}/progress`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition-colors"
                                            >
                                                View Error
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/dashboard/analysis/${analysis.id}/progress`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-lg transition-colors"
                                            >
                                                View Progress
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
