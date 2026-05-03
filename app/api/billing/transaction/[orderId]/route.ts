import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { orderId: string } }) {
    try {
        const session = await getServerSession(authOptions as any)
        if (!session || !(session as any).user?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const { orderId } = params
        const txn = await prisma.transaction.findUnique({ where: { orderId } })
        if (!txn) return NextResponse.json({ message: 'Not found' }, { status: 404 })
        return NextResponse.json({ transaction: txn })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
