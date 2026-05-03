import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import { SidebarProvider } from "@/lib/sidebar-context";
import DashboardContent from "./_components/dashboard-content";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    let userCredits = 0;
    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user?.email || "" },
            select: { credits: true },
        });
        userCredits = user?.credits || 0;
    } catch (error) {
        console.error("Error fetching user credits:", error);
    }

    return (
        <SidebarProvider>
            <DashboardContent credits={userCredits}>
                {children}
            </DashboardContent>
        </SidebarProvider>
    );
}
