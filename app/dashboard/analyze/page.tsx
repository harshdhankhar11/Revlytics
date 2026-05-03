import { Suspense } from 'react';
import { AnalyzeForm } from '@/components/dashboard/NewAnalysis/AnalyzeForm';
import { AnalyzeFormSkeleton } from '@/components/dashboard/NewAnalysis/AnalyzeFormSkeleton';

export const metadata = {
    title: 'New Analysis | Revlytics',
    description: 'Start a new competitor analysis for your Amazon product',
};

export default function AnalyzePage() {
    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">New Analysis</h1>
                    <p className="mt-2 text-lg text-slate-600">
                        Analyze your Amazon product and compare it with competitors
                    </p>
                </div>

                <Suspense fallback={<AnalyzeFormSkeleton />}>
                    <AnalyzeForm />
                </Suspense>
            </div>
        </div>
    );
}
