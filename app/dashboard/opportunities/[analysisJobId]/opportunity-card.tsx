'use client';

import { useState } from 'react';
import { Copy, Share2, CheckCircle2, Clock, Flame, Zap } from 'lucide-react';

interface OpportunityCardProps {
    opportunity: {
        id: string;
        title: string;
        description: string;
        impact: string;
        effort: string;
        confidenceScore: number;
        estimatedImpact?: string;
        customerDemand?: string;
        competitorGap?: string;
        sampleQuotes?: string[];
        actionSteps?: string[];
        priorityScore: number;
        status: string;
    };
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
    const [status, setStatus] = useState(opportunity.status);

    const copyOpportunity = async () => {
        const lines = [
            opportunity.title,
            opportunity.description,
            `Impact: ${opportunity.impact}`,
            `Effort: ${opportunity.effort}`,
            `Confidence: ${opportunity.confidenceScore}%`,
            opportunity.estimatedImpact ? `Estimated Impact: ${opportunity.estimatedImpact}` : null,
            opportunity.customerDemand ? `Customer Demand: ${opportunity.customerDemand}` : null,
            opportunity.competitorGap ? `Competitor Gap: ${opportunity.competitorGap}` : null,
        ].filter(Boolean);

        try {
            await navigator.clipboard.writeText(lines.join('\n'));
        } catch (error) {
            console.error('Failed to copy opportunity:', error);
        }
    };

    const shareOpportunity = async () => {
        const text = `${opportunity.title}\n${opportunity.description}`;
        const shareData = {
            title: opportunity.title,
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

    const handleStatusChange = async (newStatus: string) => {
        try {
            const response = await fetch('/api/opportunities', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    opportunityId: opportunity.id,
                    status: newStatus,
                }),
            });

            if (response.ok) {
                setStatus(newStatus);
            }
        } catch (error) {
            console.error('Error updating opportunity:', error);
        }
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

    const getStatusColor = (currentStatus: string) => {
        switch (currentStatus) {
            case 'completed':
                return 'bg-green-50 border-green-200 text-green-700';
            case 'in_progress':
                return 'bg-amber-50 border-amber-200 text-amber-700';
            default:
                return 'bg-slate-50 border-slate-200 text-slate-700';
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">{opportunity.title}</h3>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getImpactColor(opportunity.impact)}`}>
                            {opportunity.impact === 'HIGH' ? <Flame className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                            {opportunity.impact} Impact
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getEffortColor(opportunity.effort)}`}>
                            {opportunity.effort} Effort
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
                            {status === 'completed' ? (
                                <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Done
                                </>
                            ) : status === 'in_progress' ? (
                                <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    In Progress
                                </>
                            ) : (
                                'Open'
                            )}
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{opportunity.priorityScore}</p>
                    <p className="text-xs text-slate-500">Priority</p>
                </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">{opportunity.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {opportunity.estimatedImpact && (
                    <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-500 mb-1">Impact</p>
                        <p className="text-sm font-semibold text-slate-900">{opportunity.estimatedImpact}</p>
                    </div>
                )}
                {opportunity.customerDemand && (
                    <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-500 mb-1">Demand</p>
                        <p className="text-sm font-semibold text-slate-900">{opportunity.customerDemand}</p>
                    </div>
                )}
                <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500 mb-1">Confidence</p>
                    <p className="text-sm font-semibold text-slate-900">{opportunity.confidenceScore}%</p>
                </div>
                {opportunity.competitorGap && (
                    <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-500 mb-1">Gap</p>
                        <p className="text-sm font-semibold text-slate-900">{opportunity.competitorGap}</p>
                    </div>
                )}
            </div>

            {opportunity.actionSteps && opportunity.actionSteps.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Action Steps</p>
                    <ol className="space-y-1">
                        {opportunity.actionSteps.map((step, index) => (
                            <li key={index} className="text-sm text-slate-700">
                                <span className="font-semibold">{index + 1}.</span> {step}
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {opportunity.sampleQuotes && opportunity.sampleQuotes.length > 0 && (
                <div className="mb-4 border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Customer Quotes</p>
                    <div className="space-y-2">
                        {opportunity.sampleQuotes.map((quote, index) => (
                            <p key={index} className="text-sm italic text-slate-600">
                                "{quote}"
                            </p>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button
                    onClick={copyOpportunity}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    <Copy className="w-4 h-4" />
                    Copy
                </button>
                <button
                    onClick={shareOpportunity}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    <Share2 className="w-4 h-4" />
                    Share
                </button>
                <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="ml-auto px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="pending">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
        </div>
    );
}
