import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { getClientIp } from '@/utils/ip'
import { rateLimit } from '@/utils/rateLimiter'
import { normalizeEmail, verifyOTPFromRedis } from '@/utils/otp'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email, otp } = body
        const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : ''

        if (!normalizedEmail || !otp) {
            return NextResponse.json({ message: 'Missing email or OTP' }, { status: 400 })
        }

        const clientIp = getClientIp(req);
        const verifyKey = `rl:verify:ip:${clientIp}`;
        const verifyAllowed = await rateLimit({ key: verifyKey, limit: 5, windowSeconds: 300 });

        if (!verifyAllowed) {
            return NextResponse.json({
                message: `Too many verification attempts. Try again in ${await redis.ttl(verifyKey)} seconds.`
            }, { status: 429 });
        }

        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        if (user.status === 'ACTIVE') {
            return NextResponse.json({ message: 'Email already verified' }, { status: 400 })
        }

        const isValidOTP = await verifyOTPFromRedis(normalizedEmail, otp, redis)
        if (!isValidOTP) {
            return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 })
        }

        await prisma.user.update({
            where: { email: normalizedEmail },
            data: {
                status: 'ACTIVE',
                isEmailVerified: true
            }
        })

        return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 })
    } catch (err) {
        console.error('Verification error:', err)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
