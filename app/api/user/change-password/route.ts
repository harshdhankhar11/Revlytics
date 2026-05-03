import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions as any);
        if (!session || !(session as any).user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { oldPassword, newPassword } = body;
        if (!oldPassword || !newPassword) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        }

        const email = (session as any).user.email;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            return NextResponse.json({ message: "User not found or cannot change password" }, { status: 404 });
        }

        const ok = await bcrypt.compare(oldPassword, user.password);
        if (!ok) {
            return NextResponse.json({ message: "Old password is incorrect" }, { status: 401 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ message: "New password must be at least 8 characters" }, { status: 400 });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { email }, data: { password: hashed } });

        return NextResponse.json({ message: "Password updated" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
