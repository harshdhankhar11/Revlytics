import { NextResponse, NextRequest } from 'next/server'
import bcrypt from 'bcrypt'
import prisma from '../../../lib/prisma'
import { rateLimit } from '@/utils/rateLimiter'
import { redis } from '@/lib/redis'
import { getClientIp } from '@/utils/ip'
import { normalizeEmail } from '@/utils/otp'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, email, password } = body
        const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : ''

        const clientIp = getClientIp(req);
        const emailKey = `rl:register:email:${normalizedEmail}`;
        const emailAllowed = await rateLimit({ key: emailKey, limit: 3, windowSeconds: 300 });

        if (!emailAllowed) {
            return NextResponse.json({
                message: `Too many registration requests for this email. Try again in ${await redis.ttl(emailKey)} seconds.`
            }, { status: 429 });
        }

        const ipKey = `rl:register:ip:${clientIp}`;
        const ipAllowed = await rateLimit({ key: ipKey, limit: 10, windowSeconds: 300 });

        if (!ipAllowed) {
            return NextResponse.json({ message: `Too many registration requests from this IP. Try again in ${await redis.ttl(ipKey)} seconds.` }, { status: 429 });
        }

        if (!normalizedEmail || !password) return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
        if (existing) return NextResponse.json({ message: 'User already exists' }, { status: 409 })

        const hashed = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                name: name ?? null,
                email: normalizedEmail,
                password: hashed,
                status: 'PENDING_VERIFICATION'
            }
        })

        return NextResponse.json({
            message: 'Registration successful. Please check your email to verify your account.',
            email: user.email
        }, { status: 201 })
    } catch (err) {
        console.error('Registration error:', err)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
