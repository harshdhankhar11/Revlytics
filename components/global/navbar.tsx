"use client";
import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";

export default function Navbar() {
    return (
        <nav
            className="border-b"
            style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
            }}
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles
                        className="w-6 h-6"
                        style={{ color: "var(--primary)" }}
                    />
                    <span className="text-xl font-bold" style={{ color: "var(--heading)" }}>
                        Revlytics
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        style={{ color: "var(--text-secondary)" }}
                        className="hover:opacity-75 transition-opacity font-medium"
                    >
                        Log in
                    </button>
                    <Button>
                        Start Free Analysis →
                    </Button>
                </div>
            </div>
        </nav>
    );
}
