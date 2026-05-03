'use client';

import { useState } from 'react';
import { Sparkles, Loader } from 'lucide-react';

interface RegenerateButtonProps {
    analysisJobId: string;
}

export function RegenerateButton({ analysisJobId }: RegenerateButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/opportunities/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisJobId }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate opportunities');
            }

            const data = await response.json();

            window.location.reload();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to generate opportunities';
            setError(message);
            console.error('Error generating opportunities:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition-colors"
            >
                {loading ? (
                    <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        Generate Opportunities
                    </>
                )}
            </button>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </>
    );
}
