"use client";

import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import { useSidebar } from "@/lib/sidebar-context";

interface DashboardContentProps {
    children: React.ReactNode;
    credits: number;
}

export default function DashboardContent({ children, credits }: DashboardContentProps) {
    const { isExpanded } = useSidebar();

    return (
        <>
            <Sidebar />
            <TopNavbar credits={credits} />
            <main
                className={`mt-16 p-4 sm:p-6 md:p-8 min-h-screen transition-all duration-300 ease-in-out bg-slate-50 ${isExpanded ? "ml-64" : "ml-20"}`}
            >
                <div className="max-w-7xl mx-auto">{children}</div>
            </main>
        </>
    );
}
