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
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true, avatar: true, credits: true, role: true, status: true, createdAt: true },
        });
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        return NextResponse.json({ user });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
