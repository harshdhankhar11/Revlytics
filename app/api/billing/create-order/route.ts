import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import prisma from '@/lib/prisma'
import Razorpay from 'razorpay'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions as any)
        if (!session || !(session as any).user?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const credits = Number(body?.credits || 0)
        const amount = Number(body?.amount || 0)

        if (!credits || !amount) return NextResponse.json({ message: 'Invalid request' }, { status: 400 })

        const user = await prisma.user.findUnique({ where: { email: (session as any).user.email } })
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })

        const razor = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID || '', key_secret: process.env.RAZORPAY_KEY_SECRET || '' })

        const order = await razor.orders.create({
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            notes: { userId: user.id, credits: String(credits) }
        })

        let order_amount = order.amount as number;

        await prisma.transaction.create({
            data: {
                userId: user.id,
                orderId: order.id,
                amount: order_amount / 100,
                currency: order.currency || 'INR',
                credits: credits,
                status: 'PENDING'
            }
        })

        return NextResponse.json({ order, keyId: process.env.RAZORPAY_KEY_ID })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
