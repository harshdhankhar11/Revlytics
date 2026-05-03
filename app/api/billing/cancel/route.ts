import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions as any)
        if (!session || !(session as any).user?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const orderId = body?.orderId
        if (!orderId) return NextResponse.json({ message: 'Invalid' }, { status: 400 })

        const txn = await prisma.transaction.findUnique({ where: { orderId } })
        if (!txn) return NextResponse.json({ message: 'Not found' }, { status: 404 })

        await prisma.transaction.update({ where: { id: txn.id }, data: { status: 'CANCELLED' } })

        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
