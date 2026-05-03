import { PrismaClient } from '@prisma/client'

declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
    return new PrismaClient()
}

function getPrismaClient() {
    const existingClient = global.__prisma

    if (!existingClient) {
        return createPrismaClient()
    }

    if (!("transaction" in existingClient) || !("payment" in existingClient) || !("user" in existingClient)) {
        return createPrismaClient()
    }

    return existingClient
}

const prisma = getPrismaClient()
if (process.env.NODE_ENV !== 'production') global.__prisma = prisma

export default prisma
