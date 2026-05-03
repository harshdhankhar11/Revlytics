import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions as any);
        if (!session || !(session as any).user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, avatar } = body;

        const email = (session as any).user.email;
        const user = await prisma.user.update({
            where: { email },
            data: { name: name ?? undefined, avatar: avatar ?? undefined },
            select: { id: true, name: true, email: true, avatar: true, credits: true },
        });

        return NextResponse.json({ user });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
