"use client";
import { BarChart2, Users, Smile, Search, Zap, Share2 } from "lucide-react";

export default function FeaturesSection() {
    const features = [
        {
            icon: BarChart2,
            title: "Competitor Revenue Estimator",
            description: "Accurately estimate any competitor's revenue, profit & market share.",
        },
        {
            icon: Users,
            title: "Value of Customer",
            description: "Identify the true lifetime value, repeat purchase & customer loyalty.",
        },
        {
            icon: Smile,
            title: "Sentiment Analysis",
            description: "Understand customer emotions from reviews, social & feedback.",
        },
        {
            icon: Search,
            title: "Gap Finder",
            description: "Discover unmet customer needs and untapped keywords.",
        },
        {
            icon: Zap,
            title: "Opportunity Engine",
            description: "Get actionable, data-backed ideas to position & differentiate.",
        },
        {
            icon: Share2,
            title: "Export & Share",
            description: "Export reports or share insights with your team or clients.",
        },
    ];

    return (
        <section
            className="py-16"
            style={{
                backgroundColor: "var(--background)",
            }}
        >
            <div className="max-w-5xl mx-auto px-5">
                <div className="text-center mb-8">
                    <span
                        className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                        style={{
                            backgroundColor: "#eef2ff",
                            color: "#4f46e5",
                        }}
                    >
                        Powerful features built for sellers
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl p-5 shadow-sm border flex flex-col gap-2 hover:shadow-md transition-shadow"
                                style={{
                                    borderColor: "#f3f4f6",
                                }}
                            >
                                <div
                                    className="w-13 h-13 rounded-lg flex items-center justify-center"
                                    style={{
                                        backgroundColor: "#f2f5ff",
                                        color: "#2e3b7c",
                                    }}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h4
                                    className="font-semibold text-sm"
                                    style={{ color: "var(--heading)" }}
                                >
                                    {feature.title}
                                </h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-gray-600 mb-8">
                    <span className="text-gray-400 font-medium">Trusted by Amazon, Shopify, and 5,000+ brands</span>
                </div>
            </div>
        </section>
    );
}
