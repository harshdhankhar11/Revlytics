import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { getClientIp } from '@/utils/ip'
import { rateLimit } from '@/utils/rateLimiter'
import { generateOTP, normalizeEmail, storeOTPInRedis } from '@/utils/otp'
import { sendMail } from '@/utils/mail'
import { generateVerificationEmailTemplate } from '@/utils/emailTemplates'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email, mode = 'initial' } = body
        const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : ''

        if (!normalizedEmail) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 })
        }

        const clientIp = getClientIp(req);
        const rateKey = mode === 'resend'
            ? `rl:resend:email:${normalizedEmail}`
            : `rl:initial:email:${normalizedEmail}`;
        const rateLimitResult = await rateLimit({
            key: rateKey,
            limit: mode === 'resend' ? 3 : 1,
            windowSeconds: mode === 'resend' ? 600 : 900,
        });

        if (!rateLimitResult) {
            return NextResponse.json({
                message: `Too many verification requests. Try again in ${await redis.ttl(rateKey)} seconds.`
            }, { status: 429 });
        }

        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        if (user.status === 'ACTIVE') {
            return NextResponse.json({ message: 'Email already verified' }, { status: 400 })
        }

        const otpKey = `otp:${normalizedEmail}`
        const existingOtp = await redis.get(otpKey)

        if (mode !== 'resend' && existingOtp) {
            return NextResponse.json({
                message: 'Verification code already sent. Check your inbox.',
                sent: false
            }, { status: 200 })
        }

        if (mode === 'resend') {
            await redis.del(otpKey)
            await redis.del(`otp:attempts:${normalizedEmail}`)
        }

        const otp = generateOTP()
        await storeOTPInRedis(normalizedEmail, otp, redis)

        const emailTemplate = generateVerificationEmailTemplate(user.name || 'User', otp)
        await sendMail({
            to: normalizedEmail,
            subject: 'Verify Your Email - Revlytics',
            htmlContent: emailTemplate
        })

        return NextResponse.json({
            message: mode === 'resend' ? 'Verification email resent successfully' : 'Verification email sent successfully',
            sent: true
        }, { status: 200 })
    } catch (err) {
        console.error('Resend email error:', err)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}
