export function AnalyzeFormSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
            </div>

            <div className="space-y-4">
                <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                        <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
                <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
                <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse" />
            </div>

            <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
        </div>
    );
}
