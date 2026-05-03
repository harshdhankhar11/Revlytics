'use client';

export function ProductPreviewSkeleton() {
    return (
        <div className="bg-white rounded-lg border-2 border-slate-200 overflow-hidden animate-pulse">
            <div className="px-4 py-3 border-b bg-slate-100">
                <div className="h-3 w-20 bg-slate-300 rounded" />
            </div>

            <div className="p-4 space-y-3">
                <div className="w-full h-32 bg-slate-200 rounded-lg" />
                <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-200 rounded" />
                    <div className="h-4 w-5/6 bg-slate-200 rounded" />
                </div>
                <div className="flex gap-2">
                    <div className="h-6 w-20 bg-slate-200 rounded" />
                    <div className="h-6 w-20 bg-slate-200 rounded" />
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded" />
                <div className="h-8 w-full bg-slate-200 rounded-lg" />
            </div>
        </div>
    );
}
