import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcrypt'
import prisma from './prisma'
import { NextAuthOptions } from 'next-auth'
import { normalizeEmail } from '@/utils/otp'

export const authOptions: NextAuthOptions = {
    session: { strategy: 'jwt' },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null
                const email = normalizeEmail(credentials.email)
                const user = await prisma.user.findUnique({ where: { email } })
                if (!user) return null

                if (user.status !== 'ACTIVE') {
                    throw new Error('ACCOUNT_NOT_VERIFIED')
                }

                const isValid = await bcrypt.compare(credentials.password, user.password!)
                if (!isValid) return null
                return { id: user.id, name: user.name ?? null, email: user.email, image: user.avatar ?? null }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.sub = String((user as any).id ?? token.sub)
                if ((user as any).name) token.name = (user as any).name
                if ((user as any).email) token.email = (user as any).email
                if ((user as any).image) token.picture = (user as any).image
            }
            return token
        },
        async session({ session, token }) {
            if (token?.sub) (session as any).user.id = token.sub
            if (token?.name) (session as any).user.name = token.name as string
            if (token?.email) (session as any).user.email = token.email as string
            if (token?.picture) (session as any).user.image = token.picture as string
            return session
        }
    },
    secret: process.env.NEXTAUTH_SECRET
}

export async function auth() {
    return getServerSession(authOptions as any)
}

export default authOptions
