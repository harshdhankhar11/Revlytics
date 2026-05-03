import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import Razorpay from 'razorpay'
import crypto from 'crypto'

export async function POST(req: Request) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature') || ''

    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
    if (!signature || signature !== expected) {
        return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
    }

    try {
        const payload = JSON.parse(body)

        const event = payload?.event

        const razor = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID || '', key_secret: process.env.RAZORPAY_KEY_SECRET || '' })

        let paymentEntity = payload?.payload?.payment?.entity
        let orderEntity = payload?.payload?.order?.entity

        if (!paymentEntity && orderEntity?.id) {
            // try to fetch latest payments for order
            const payments = await razor.payments.all({ order_id: orderEntity.id })
            paymentEntity = payments.items?.[0]
        }

        const orderId = paymentEntity?.order_id || orderEntity?.id
        if (!orderId) return NextResponse.json({ message: 'No order id' }, { status: 400 })

        const order = await razor.orders.fetch(orderId)
        const notes = order.notes || {}
        const userId = notes.userId
        const credits = Number(notes.credits || 0)

        const txn = await prisma.transaction.findUnique({ where: { orderId } })

        if (event === 'payment.captured' || paymentEntity?.status === 'captured') {
            const amount = (paymentEntity.amount || 0) / 100

            await prisma.payment.create({
                data: {
                    userId: userId,
                    amount: amount,
                    currency: paymentEntity.currency || 'INR',
                    paymentIntentId: paymentEntity.id,
                    status: 'SUCCEEDED',
                    productId: null
                }
            })

            if (txn) {
                await prisma.transaction.update({ where: { id: txn.id }, data: { status: 'SUCCEEDED', paymentIntentId: paymentEntity.id } })
            }

            if (userId) {
                await prisma.user.update({ where: { id: userId }, data: { credits: { increment: credits }, analysisCount: { increment: 5 } } })
            }

            return NextResponse.json({ ok: true })
        }

        if (event === 'payment.failed' || paymentEntity?.status === 'failed') {
            if (txn) {
                await prisma.transaction.update({ where: { id: txn.id }, data: { status: 'FAILED', paymentIntentId: paymentEntity?.id || undefined } })
            }

            await prisma.payment.create({
                data: {
                    userId: userId || '',
                    amount: (paymentEntity?.amount || 0) / 100,
                    currency: paymentEntity?.currency || 'INR',
                    paymentIntentId: paymentEntity?.id || `failed_${Date.now()}`,
                    status: 'FAILED',
                    productId: null
                }
            })
            return NextResponse.json({ ok: true })
        }

        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
