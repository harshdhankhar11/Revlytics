import NextAuth from 'next-auth'
import { NextResponse, NextRequest } from 'next/server'
import authOptions from '../../../../lib/auth'
import { rateLimit } from '@/utils/rateLimiter'
import { redis } from '@/lib/redis'
import { getClientIp } from '@/utils/ip'

const handler = NextAuth(authOptions)

const wrappedHandler = async (req: NextRequest, context: any) => {
    if (req.method === 'POST') {
        const body = await req.clone().json().catch(() => ({}))

        if (body.email) {
            const clientIp = getClientIp(req)
            const emailKey = `rl:signin:email:${body.email}`
            const emailAllowed = await rateLimit({ key: emailKey, limit: 5, windowSeconds: 300 })

            if (!emailAllowed) {
                return NextResponse.json({
                    error: `Too many login attempts. Try again in ${await redis.ttl(emailKey)} seconds.`
                }, { status: 429 })
            }

            const ipKey = `rl:signin:ip:${clientIp}`
            const ipAllowed = await rateLimit({ key: ipKey, limit: 20, windowSeconds: 300 })

            if (!ipAllowed) {
                return NextResponse.json({
                    error: `Too many login attempts from this IP. Try again in ${await redis.ttl(ipKey)} seconds.`
                }, { status: 429 })
            }
        }
    }

    return handler(req, context)
}

export { wrappedHandler as GET, wrappedHandler as POST }

