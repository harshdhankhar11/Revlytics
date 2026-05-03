"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/lib/sidebar-context";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, LogOut, HelpCircle, Zap, User } from "lucide-react";
import { signOut } from "next-auth/react";

interface TopNavbarProps {
    credits?: number;
}

export default function TopNavbar({ credits = 1200 }: TopNavbarProps) {
    const pathname = usePathname();
    const { isExpanded } = useSidebar();
    const [userName, setUserName] = useState("User");
    const [userEmail, setUserEmail] = useState("user@example.com");

    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const response = await fetch("/api/user/me");
                if (response.ok) {
                    const data = await response.json();
                    const u = data?.user;
                    if (u) {
                        setUserName(u.name || "User");
                        setUserEmail(u.email || "user@example.com");
                    }
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };
        getUserInfo();
    }, []);

    const getTitleFromPath = () => {
        if (pathname === "/dashboard") return "Overview";
        if (pathname.includes("/new-analysis")) return "New Analysis";
        if (pathname.includes("/reports")) return "My Reports";
        if (pathname.includes("/leaderboard")) return "🥇 Leaderboard";
        if (pathname.includes("/competitors")) return "⚔️ Competitor Battle Map";
        if (pathname.includes("/opportunities")) return "Opportunities";
        if (pathname.includes("/saved")) return "Saved";
        if (pathname.includes("/history")) return "History";
        if (pathname.includes("/exports")) return "Exports";
        if (pathname.includes("/profile")) return "Profile";
        if (pathname.includes("/settings")) return "Settings";
        if (pathname.includes("/billing")) return "Billing";
        return "Dashboard";
    };

    const getUserInitials = () => {
        return userName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header
            style={{
                left: isExpanded ? "256px" : "80px",
            }}
            className="fixed right-0 top-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 md:px-8 z-30 shadow-sm transition-all duration-300 ease-in-out"
        >
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-slate-900">{getTitleFromPath()}</h1>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-6">
                {/* Credits */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700">{credits.toLocaleString()} Credits</span>
                </div>

                {/* Notification Bell */}
                <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Divider */}
                <div className="h-6 w-px bg-slate-200"></div>

                {/* User Dropdown Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {getUserInitials()}
                        </div>
                        <div className="hidden sm:flex flex-col items-start">
                            <span className="text-sm font-medium text-slate-900">{userName}</span>
                            <span className="text-xs text-slate-500">{userEmail}</span>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-lg">
                        <div className="px-4 py-3 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                    {getUserInitials()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
                                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                                </div>
                            </div>
                        </div>
                        <DropdownMenuItem className="cursor-pointer">
                            <Link href="/dashboard/profile" className="flex items-center gap-2 w-full">
                                <User className="w-4 h-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <Link href="/dashboard/settings" className="flex items-center gap-2 w-full">
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <Link href="/dashboard/help" className="flex items-center gap-2 w-full">
                                <HelpCircle className="w-4 h-4" />
                                <span>Help & Support</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="cursor-pointer text-red-600"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
