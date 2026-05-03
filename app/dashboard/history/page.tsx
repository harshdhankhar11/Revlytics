"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type HistoryItem = {
    id: string;
    name: string;
    status?: string;
    startedAt?: string | null;
    completedAt?: string | null;
};

export default function HistoryPage() {
    const [items, setItems] = useState<HistoryItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch("/api/analysis/history");
                if (!res.ok) {
                    setError("Failed to load history");
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                if (mounted) setItems(data.items ?? []);
            } catch (err) {
                console.error(err);
                if (mounted) setError("Server error");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="py-6">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-lg font-semibold mb-4">History</h2>

                <div className="bg-white rounded-lg shadow p-4">
                    {loading && <div className="text-sm text-slate-600">Loading...</div>}
                    {error && <div className="text-sm text-red-600">{error}</div>}

                    {!loading && items && items.length === 0 && (
                        <div className="text-sm text-slate-600">No history available.</div>
                    )}

                    {!loading && items && items.length > 0 && (
                        <ul className="space-y-2">
                            {items.map((it) => (
                                <li key={it.id} className="p-3 border rounded flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/dashboard/analysis/${it.id}`} className="text-sm font-medium text-slate-900 truncate">
                                            {it.name}
                                        </Link>
                                        <div className="text-xs text-slate-500">
                                            {it.startedAt ? new Date(it.startedAt).toLocaleString() : ""}
                                            {it.completedAt ? ` • Completed ${new Date(it.completedAt).toLocaleString()}` : ""}
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${it.status === "COMPLETED"
                                                    ? "bg-green-100 text-green-800"
                                                    : it.status === "FAILED"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-amber-100 text-amber-800"
                                                }`}
                                        >
                                            {it.status ?? "UNKNOWN"}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
