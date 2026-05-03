'use client';

import { Download } from 'lucide-react';

export function ExportReportButton({ reportId }: { reportId: string }) {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 print:hidden"
            aria-label={`Export analysis report ${reportId}`}
        >
            <Download className="h-4 w-4" />
            Export Report
        </button>
    );
}