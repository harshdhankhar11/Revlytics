import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions as any);
        if (!session || !(session as any).user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const email = (session as any).user.email;
        const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const items = await prisma.analysisJob.findMany({
            where: { userId: user.id },
            orderBy: [{ completedAt: 'desc' }, { startedAt: 'desc' }],
            take: 10,
            select: {
                id: true,
                userProductUrl: true,
                userProductAsin: true,
                executiveSummary: true,
                startedAt: true,
                completedAt: true,
                status: true,
            },
        });

        // Map a display name for each item
        const mapped = items.map((it) => ({
            id: it.id,
            name: it.executiveSummary ? String(it.executiveSummary).slice(0, 80) : it.userProductAsin ?? it.userProductUrl ?? it.id,
            startedAt: it.startedAt,
            completedAt: it.completedAt,
            status: it.status,
        }));

        return NextResponse.json({ items: mapped });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
