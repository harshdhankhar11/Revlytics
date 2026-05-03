"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const plans = [
    { credits: 10, price: 99, highlight: false },
    { credits: 50, price: 399, highlight: true },
    { credits: 100, price: 899, highlight: false }
]

export default function DashboardBillingPage() {
    const [loading, setLoading] = useState(false)
    const [libraryLoaded, setLibraryLoaded] = useState(false)
    const [pendingOrder, setPendingOrder] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (!window?.Razorpay) {
            const s = document.createElement('script')
            s.src = 'https://checkout.razorpay.com/v1/checkout.js'
            s.async = true
            s.onload = () => setLibraryLoaded(true)
            document.body.appendChild(s)
        } else {
            setLibraryLoaded(true)
        }

        const stored = localStorage.getItem('revlytics_order')
        if (stored) setPendingOrder(stored)
    }, [])

    useEffect(() => {
        let iv: any
        async function poll() {
            if (!pendingOrder) return
            try {
                setLoading(true)
                const res = await fetch(`/api/billing/transaction/${pendingOrder}`)
                if (res.ok) {
                    const data = await res.json()
                    const st = data.transaction?.status
                    if (st && st !== 'PENDING') {
                        localStorage.removeItem('revlytics_order')
                        setPendingOrder(null)
                        setLoading(false)
                        router.push('/dashboard/billing/history')
                    }
                }
            } catch (e) {
            } finally {
                setLoading(false)
            }
        }
        if (pendingOrder) {
            poll()
            iv = setInterval(poll, 3000)
        }
        return () => clearInterval(iv)
    }, [pendingOrder, router])

    async function handleBuy(plan: { credits: number; price: number }) {
        try {
            setLoading(true)
            const res = await fetch('/api/billing/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credits: plan.credits, amount: plan.price }) })
            const data = await res.json()
            if (!data?.order) throw new Error(data?.message || 'Order creation failed')

            const options = {
                key: data.keyId,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'Revlytics Credits',
                description: `${plan.credits} credits`,
                order_id: data.order.id,
                handler: function () {
                    localStorage.removeItem('revlytics_order')
                    setPendingOrder(null)
                    router.push('/dashboard/billing/history')
                },
                modal: {
                    ondismiss: function () {
                        const oid = data.order.id
                        fetch('/api/billing/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: oid }) })
                        localStorage.removeItem('revlytics_order')
                        setPendingOrder(null)
                        setLoading(false)
                    }
                }
            }
            await fetch('/api/billing/transaction/' + data.order.id)
            localStorage.setItem('revlytics_order', data.order.id)
            setPendingOrder(data.order.id)
            // @ts-ignore
            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (err: any) {
            alert(err?.message || 'Payment error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Billing</h1>
                    <p className="text-sm text-slate-500">Top up credits to run more analyses.</p>
                </div>
                <button onClick={() => router.push('/dashboard/billing/history')} className="px-4 py-2 bg-white border rounded shadow-sm hover:bg-slate-50">Transaction History</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((p) => (
                    <div key={p.credits} className={`rounded-lg p-6 shadow-md border ${p.highlight ? 'border-indigo-200 bg-indigo-50' : 'bg-white'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-medium">{p.credits} credits</h2>
                                <p className="text-sm text-slate-500 mt-1">One-time purchase</p>
                            </div>
                            <div className="text-2xl font-bold">₹{p.price}</div>
                        </div>

                        <div className="mt-6">
                            <button disabled={loading || !libraryLoaded || !!pendingOrder} onClick={() => handleBuy(p)} className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center">
                                {loading || !!pendingOrder ? (
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.6)" strokeWidth="4"></circle></svg>
                                ) : null}
                                {pendingOrder ? 'Processing...' : 'Add credits'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
