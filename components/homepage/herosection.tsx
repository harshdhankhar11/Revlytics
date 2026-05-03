"use client";
import { Zap, Check, Clock } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

export default function HeroSection() {
    return (
        <section
            className="py-20"
            style={{
                backgroundColor: "var(--background)",
            }}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                            <span style={{ color: "var(--heading)" }}>Turn Amazon reviews into your</span>
                            <br />
                            <span
                                style={{
                                    color: "var(--primary)",
                                    fontStyle: "italic",
                                    display: "inline-block",
                                }}
                            >
                                competitive edge.
                            </span>
                        </h1>

                        <p
                            className="text-lg mb-8"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            AI analyzes thousands of reviews, estimates competitor revenue, and uncovers
                            opportunities others miss.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Paste your Amazon product URL"
                                    className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition"
                                    style={{
                                        borderColor: "var(--border)",
                                        color: "var(--heading)",
                                    }}
                                />
                                <Button>Analyze My Market</Button>
                            </div>

                            <button
                                className="text-sm font-medium hover:opacity-75 transition-opacity flex items-center gap-1"
                                style={{ color: "var(--primary)" }}
                            >
                                + Add up to 9 competitor URLs
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-8">
                            <div className="flex items-center gap-3">
                                <Zap
                                    className="w-5 h-5 flex-shrink-0"
                                    style={{ color: "var(--primary)" }}
                                />
                                <span style={{ color: "var(--text-secondary)" }} className="text-sm">
                                    AI-Powered Insights
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Check
                                    className="w-5 h-5 flex-shrink-0"
                                    style={{ color: "var(--success)" }}
                                />
                                <span style={{ color: "var(--text-secondary)" }} className="text-sm">
                                    No Credit Card Required
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock
                                    className="w-5 h-5 flex-shrink-0"
                                    style={{ color: "var(--primary)" }}
                                />
                                <span style={{ color: "var(--text-secondary)" }} className="text-sm">
                                    Results in 3 Minutes
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative hidden lg:block">
                        <Image
                            src="/home/home_hero_rightSide.png"
                            alt="Market Battle Map Dashboard"
                            width={600}
                            height={500}
                            quality={95}
                            priority
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
