'use client';

import { Flame, Zap, TrendingUp } from 'lucide-react';

interface Opportunity {
    id: string;
    title: string;
    impact: string;
    effort: string;
    priorityScore: number;
}

interface PriorityMatrixProps {
    opportunities: Opportunity[];
}

export function PriorityMatrix({ opportunities }: PriorityMatrixProps) {
    const quadrants = {
        highImpactEasy: opportunities.filter((o) => o.impact === 'HIGH' && o.effort === 'EASY'),
        highImpactMedium: opportunities.filter((o) => o.impact === 'HIGH' && o.effort === 'MEDIUM'),
        highImpactHard: opportunities.filter((o) => o.impact === 'HIGH' && o.effort === 'HARD'),
        mediumImpactEasy: opportunities.filter((o) => o.impact === 'MEDIUM' && o.effort === 'EASY'),
        mediumImpactMedium: opportunities.filter((o) => o.impact === 'MEDIUM' && o.effort === 'MEDIUM'),
        mediumImpactHard: opportunities.filter((o) => o.impact === 'MEDIUM' && o.effort === 'HARD'),
        lowImpactEasy: opportunities.filter((o) => o.impact === 'LOW' && o.effort === 'EASY'),
        lowImpactMedium: opportunities.filter((o) => o.impact === 'LOW' && o.effort === 'MEDIUM'),
        lowImpactHard: opportunities.filter((o) => o.impact === 'LOW' && o.effort === 'HARD'),
    };

    const Quadrant = ({
        title,
        icon,
        color,
        opportunities: opps,
        recommendation,
    }: {
        title: string;
        icon: React.ReactNode;
        color: string;
        opportunities: Opportunity[];
        recommendation: string;
    }) => (
        <div className={`rounded-xl border-2 ${color} p-4`}>
            <div className="flex items-center gap-2 mb-3">
                {icon}
                <h4 className="font-semibold text-slate-900">{title}</h4>
            </div>
            <p className="text-xs text-slate-600 mb-3">{recommendation}</p>
            {opps.length > 0 ? (
                <div className="space-y-2">
                    {opps.map((opp) => (
                        <div key={opp.id} className="text-xs bg-white bg-opacity-50 rounded p-2">
                            <p className="font-medium text-slate-900 line-clamp-2">{opp.title}</p>
                            <p className="text-slate-600">Priority: {opp.priorityScore}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-slate-500 italic">No opportunities</p>
            )}
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Priority Matrix (Impact vs Effort)</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Quadrant
                    title="🔥 HIGH IMPACT, EASY"
                    icon={<Flame className="w-5 h-5 text-red-600" />}
                    color="border-red-200 bg-red-50"
                    opportunities={quadrants.highImpactEasy}
                    recommendation="DO FIRST - Quick wins with high impact"
                />
                <Quadrant
                    title="📌 HIGH IMPACT, MEDIUM"
                    icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
                    color="border-amber-200 bg-amber-50"
                    opportunities={quadrants.highImpactMedium}
                    recommendation="PLAN & SCHEDULE - Strategic priorities"
                />
                <Quadrant
                    title="⚙️ HIGH IMPACT, HARD"
                    icon={<TrendingUp className="w-5 h-5 text-slate-600" />}
                    color="border-slate-200 bg-slate-50"
                    opportunities={quadrants.highImpactHard}
                    recommendation="CONSIDER - Long-term strategic moves"
                />

                <Quadrant
                    title="⚡ MEDIUM IMPACT, EASY"
                    icon={<Zap className="w-5 h-5 text-green-600" />}
                    color="border-green-200 bg-green-50"
                    opportunities={quadrants.mediumImpactEasy}
                    recommendation="NICE TO HAVE - Easy improvements"
                />
                <Quadrant
                    title="📊 MEDIUM IMPACT, MEDIUM"
                    icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                    color="border-blue-200 bg-blue-50"
                    opportunities={quadrants.mediumImpactMedium}
                    recommendation="REVIEW - Evaluate carefully"
                />
                <Quadrant
                    title="🔧 MEDIUM IMPACT, HARD"
                    icon={<TrendingUp className="w-5 h-5 text-slate-600" />}
                    color="border-slate-200 bg-slate-50"
                    opportunities={quadrants.mediumImpactHard}
                    recommendation="DEFER - Low ROI for effort"
                />

                <Quadrant
                    title="💡 LOW IMPACT, EASY"
                    icon={<Zap className="w-5 h-5 text-slate-500" />}
                    color="border-slate-200 bg-slate-50"
                    opportunities={quadrants.lowImpactEasy}
                    recommendation="BONUS - If time permits"
                />
                <Quadrant
                    title="❌ LOW IMPACT, MEDIUM"
                    icon={<TrendingUp className="w-5 h-5 text-slate-500" />}
                    color="border-slate-200 bg-slate-50"
                    opportunities={quadrants.lowImpactMedium}
                    recommendation="SKIP - Low value"
                />
                <Quadrant
                    title="🚫 LOW IMPACT, HARD"
                    icon={<TrendingUp className="w-5 h-5 text-slate-500" />}
                    color="border-slate-200 bg-slate-50"
                    opportunities={quadrants.lowImpactHard}
                    recommendation="IGNORE - Not worth effort"
                />
            </div>

            <div className="mt-6 p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                <p className="text-sm text-indigo-900">
                    <span className="font-semibold">Pro Tip:</span> Start with the red zone (High Impact, Easy Effort) opportunities. They deliver the most value with
                    minimal effort. Then move to the amber zone for strategic improvements.
                </p>
            </div>
        </div>
    );
}
