"use client"
import React, { useEffect, useState } from 'react'

export default function DashboardBillingHistory() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => { fetchPayments() }, [])

    async function fetchPayments() {
        setLoading(true)
        try {
            const res = await fetch('/api/billing/transactions')
            const data = await res.json()
            setTransactions(data.transactions || [])
        } catch (err) {
            console.error(err)
        } finally { setLoading(false) }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Transaction History</h1>
            {loading ? <p>Loading...</p> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="text-sm text-slate-500">
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Amount</th>
                                <th className="px-4 py-2">Currency</th>
                                <th className="px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 && (
                                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No transactions found</td></tr>
                            )}
                            {transactions.map((p) => (
                                <tr key={p.id} className="border-t">
                                    <td className="px-4 py-3 text-sm">{new Date(p.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm">{p.amount}</td>
                                    <td className="px-4 py-3 text-sm">{p.currency}</td>
                                    <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 rounded text-xs ${p.status === 'SUCCEEDED' ? 'bg-emerald-100 text-emerald-700' : p.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : p.status === 'CANCELLED' ? 'bg-gray-100 text-slate-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
