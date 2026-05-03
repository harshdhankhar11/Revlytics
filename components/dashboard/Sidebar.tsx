"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSidebar } from "@/lib/sidebar-context";
import {
    LayoutDashboard,
    Microscope,
    FolderOpen,
    Trophy,
    Target,
    Users,
    Bookmark,
    Clock,
    Download,
    User,
    Settings,
    CreditCard,
    HelpCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Star,
    Menu,
    X,
} from "lucide-react";

type NavItem = {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
};

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isExpanded, isMobileOpen, setIsExpanded, setIsMobileOpen } = useSidebar();

    const navItems: NavItem[] = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/new-analysis", label: "New Analysis", icon: Microscope },
        { href: "/dashboard/reports", label: "My Reports", icon: FolderOpen },
        { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
        { href: "/dashboard/opportunities", label: "Opportunities", icon: Target, badge: "New" },
        { href: "/dashboard/competitors", label: "Competitors", icon: Users },
        { href: "/dashboard/history", label: "History", icon: Clock },
        { href: "/dashboard/profile", label: "Profile", icon: User },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
        { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    ];

    useEffect(() => {
        navItems.forEach((item) => {
            router.prefetch(item.href);
        });
    }, [router]);

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    const handleLogout = () => {
        signOut({ callbackUrl: "/login" });
    };

    // Recent history items (names only)
    const [historyItems, setHistoryItems] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const res = await fetch('/api/analysis/history');
                if (!res.ok) return;
                const data = await res.json();
                if (mounted && data?.items) {
                    setHistoryItems(data.items.map((i: any) => ({ id: i.id, name: i.name })));
                }
            } catch (err) {
                // ignore
            }
        };
        load();
        return () => { mounted = false };
    }, []);

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed bottom-6 right-6 md:hidden w-12 h-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors z-50\"
                title="Toggle Menu"
            >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/30 md:hidden z-30"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200 flex flex-col z-40 transition-all duration-300 ease-in-out shadow-sm ${isExpanded ? "w-64" : "w-20"
                    } ${!isMobileOpen && "-translate-x-full md:translate-x-0"
                    }`}
            >
                {/* Header with Logo and Toggle */}
                <div className={`flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-slate-100 ${!isExpanded && "flex-col gap-2"}`}>
                    {isExpanded && (
                        <Link href="/dashboard" className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                R
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-sm font-bold text-slate-900 truncate">Revlytics</h1>
                            </div>
                        </Link>
                    )}
                    {!isExpanded && (
                        <Link
                            href="/dashboard"
                            className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 hover:shadow-md transition-shadow"
                        >
                            R
                        </Link>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                        title={isExpanded ? "Collapse" : "Expand"}
                    >
                        {isExpanded ? (
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                        )}
                    </button>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
                    <div className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={item.label}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-md transition-colors group relative flex-shrink-0 ${active
                                        ? "bg-indigo-50 text-indigo-600"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        } ${!isExpanded && "justify-center"}`}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    {isExpanded && (
                                        <>
                                            <span className="text-xs font-medium flex-1 truncate">{item.label}</span>
                                            {item.badge && (
                                                <span
                                                    className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${item.badge === "New"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-indigo-100 text-indigo-600"
                                                        }`}
                                                >
                                                    {item.badge === "New" ? (
                                                        <>
                                                            <Star className="w-2.5 h-2.5 mr-0.5" />
                                                            {item.badge}
                                                        </>
                                                    ) : (
                                                        item.badge
                                                    )}
                                                </span>
                                            )}
                                        </>
                                    )}
                                    {!isExpanded && item.badge && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                                            {item.badge === "New" ? "!" : item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom Actions - Fixed */}
                <div className="flex-shrink-0 flex flex-col gap-1 px-2 py-3 border-t border-slate-100">
                    {/* Recent history names */}
                    {isExpanded && historyItems.length > 0 && (
                        <div className="mb-2 px-2">
                            <h4 className="text-xs font-semibold text-slate-600 mb-1">Recent</h4>
                            <ul className="space-y-1 max-h-40 overflow-y-auto">
                                {historyItems.map((h) => (
                                    <li key={h.id} className="text-xs text-slate-700 truncate">{h.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <Link
                        href="/dashboard/help"
                        title="Help"
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors ${!isExpanded && "justify-center"
                            }`}
                    >
                        <HelpCircle className="w-4 h-4 flex-shrink-0" />
                        {isExpanded && <span className="text-xs font-medium">Help</span>}
                    </Link>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full ${!isExpanded && "justify-center"
                            }`}
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        {isExpanded && <span className="text-xs font-medium">Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
