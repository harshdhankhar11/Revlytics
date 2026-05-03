"use client";
import Image from "next/image";

export default function AuthNavbar() {
    return (
        <nav
            className="border-b"
            style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
            }}
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
                <div className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="Revlytics Logo"
                        width={32}
                        height={32}
                        priority
                    />
                    <span className="text-xl font-bold" style={{ color: "var(--heading)" }}>
                        Revlytics
                    </span>
                </div>
            </div>
        </nav>
    );
}
