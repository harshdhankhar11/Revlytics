"use client";
import { Link2, Search, BarChart3, Puzzle } from "lucide-react";

export default function ProcessSection() {
    const steps = [
        {
            icon: Link2,
            title: "Input Your Product",
            description: "Paste any Amazon or Shopify link or add a keyword filter",
        },
        {
            icon: Search,
            title: "AI Scraping & Analysis",
            description: "We scan the competitor product and AI analyzes every insight",
        },
        {
            icon: BarChart3,
            title: "Revenue Estimation",
            description: "Get accurate monthly sales, revenue & market share",
        },
        {
            icon: Puzzle,
            title: "Your Battle Map",
            description: "Visualize opportunities, keyword gaps & recommendations",
        },
    ];

    return (
        <section
            className="py-20"
            style={{
                backgroundColor: "var(--background)",
            }}
        >
            <div className="max-w-6xl mx-auto px-5">
                <div className="flex flex-col items-center text-center mb-6">
                    <span
                        className="text-xs font-semibold uppercase tracking-widest mb-3"
                        style={{ color: "var(--primary)" }}
                    >
                        Just Attract
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--heading)" }}>
                        From URLs to Unfair Advantage
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-2 relative max-w-4xl mx-auto mb-14">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const bgColors = [
                            "var(--primary)",
                            "var(--primary)",
                            "#fbbf24",
                            "#10b981",
                        ];
                        return (
                            <div key={idx} className="flex flex-col items-center text-center px-2">
                                <div
                                    className="w-11 h-11 rounded-full flex items-center justify-center text-white mb-3"
                                    style={{
                                        backgroundColor: bgColors[idx],
                                    }}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <p
                                    className="font-bold text-xs md:text-sm"
                                    style={{ color: "var(--heading)" }}
                                >
                                    {step.title}
                                </p>
                                <p className="text-xs text-gray-500 leading-tight mt-2">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
