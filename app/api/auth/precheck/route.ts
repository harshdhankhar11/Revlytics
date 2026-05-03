import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import prisma from '@/lib/prisma'
import { rateLimit } from '@/utils/rateLimiter'
import { redis } from '@/lib/redis'
import { getClientIp } from '@/utils/ip'
import { normalizeEmail } from '@/utils/otp'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}))
        const email = typeof body.email === 'string' ? normalizeEmail(body.email) : ''
        const password = typeof body.password === 'string' ? body.password : ''

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
        }

        const clientIp = getClientIp(req)
        const emailKey = `rl:precheck:email:${email}`
        const ipKey = `rl:precheck:ip:${clientIp}`

        const emailAllowed = await rateLimit({ key: emailKey, limit: 5, windowSeconds: 300 })
        if (!emailAllowed) {
            return NextResponse.json({
                message: `Too many login attempts. Try again in ${await redis.ttl(emailKey)} seconds.`
            }, { status: 429 })
        }

        const ipAllowed = await rateLimit({ key: ipKey, limit: 20, windowSeconds: 300 })
        if (!ipAllowed) {
            return NextResponse.json({
                message: `Too many login attempts from this IP. Try again in ${await redis.ttl(ipKey)} seconds.`
            }, { status: 429 })
        }

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !user.password) {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
        }

        const passwordMatches = await bcrypt.compare(password, user.password)
        if (!passwordMatches) {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
        }

        if (user.status !== 'ACTIVE' || !user.isEmailVerified) {
            return NextResponse.json({
                message: 'Your email is not verified yet. Please check your email and verify your account.',
                needsVerification: true,
                email: user.email
            }, { status: 403 })
        }

        return NextResponse.json({ message: 'Credentials verified', ok: true }, { status: 200 })
    } catch (error) {
        console.error('Precheck login error:', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}