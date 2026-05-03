"use client";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export default function WhyRevlyticsSection() {
    const comparisonData = [
        { feature: "Competitor revenue estimates", revlytics: true, helium: false, jungle: false, seller: false },
        { feature: "AI sentiment analysis", revlytics: true, helium: false, jungle: false, seller: false },
        { feature: "Opportunity gap finder", revlytics: true, helium: true, jungle: false, seller: false },
        { feature: "Customer lifetime value", revlytics: true, helium: false, jungle: false, seller: false },
        { feature: "Export & share reports", revlytics: true, helium: true, jungle: true, seller: true },
    ];

    return (
        <section className="py-20 px-5">
            <div
                className="rounded-3xl p-6 md:p-8 shadow-2xl max-w-5xl mx-auto border relative overflow-hidden"
                style={{
                    backgroundColor: "#0d0f21",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                }}
            >
                <div className="flex flex-col md:flex-row md:items-start gap-8">
                    <div className="md:w-1/3 pt-2">
                        <div
                            className="inline-block px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider mb-3"
                            style={{
                                backgroundColor: "rgba(99, 102, 241, 0.2)",
                            }}
                        >
                            Why Revlytics?
                        </div>
                        <h3
                            className="text-white text-2xl md:text-3xl font-semibold leading-snug mb-3"
                            style={{ color: "white" }}
                        >
                            We give you data
                            <br />
                            that actually wins.
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed mb-5">
                            From scraping to actionable insights – we combine AI, big data, and competitor intelligence.
                        </p>
                        <Button
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold"
                            style={{
                                backgroundColor: "#5b4cf5",
                            }}
                        >
                            <ArrowRight className="w-4 h-4" /> Start Your Analysis
                        </Button>
                    </div>

                    <div className="md:w-2/3">
                        <div className="flex flex-wrap items-center gap-5 text-gray-400 text-xs mb-6">
                            <span className="text-white/60 font-medium uppercase tracking-wider">Compare features</span>
                            <span className="flex items-center gap-1 text-white">
                                ★ Revlytics
                            </span>
                            <span className="flex items-center gap-1 text-white/40">Helium 10</span>
                            <span className="flex items-center gap-1 text-white/40">Jungle Scout</span>
                            <span className="flex items-center gap-1 text-white/40">SellerSprite</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                                        <th className="w-1/3 text-white/90 font-medium text-sm pb-4 pt-2">
                                            Feature
                                        </th>
                                        <th className="text-center px-2">
                                            <span
                                                className="px-3 py-1 rounded-full text-xs text-white"
                                                style={{ backgroundColor: "#2c2f5a" }}
                                            >
                                                Revlytics
                                            </span>
                                        </th>
                                        <th className="text-center text-white/50 text-xs">Helium 10</th>
                                        <th className="text-center text-white/50 text-xs">Jungle Scout</th>
                                        <th className="text-center text-white/50 text-xs">SellerSprite</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonData.map((row, idx) => (
                                        <tr
                                            key={idx}
                                            style={{
                                                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                                            }}
                                        >
                                            <td className="py-3 text-gray-300 text-sm">{row.feature}</td>
                                            <td className="text-center py-3">
                                                {row.revlytics ? (
                                                    <Check className="w-5 h-5 text-white mx-auto" />
                                                ) : (
                                                    <X className="w-5 h-5 text-white/20 mx-auto" />
                                                )}
                                            </td>
                                            <td className="text-center py-3">
                                                {row.helium ? (
                                                    <Check className="w-5 h-5 text-white/40 mx-auto" />
                                                ) : (
                                                    <X className="w-5 h-5 text-white/20 mx-auto" />
                                                )}
                                            </td>
                                            <td className="text-center py-3">
                                                {row.jungle ? (
                                                    <Check className="w-5 h-5 text-white/30 mx-auto" />
                                                ) : (
                                                    <X className="w-5 h-5 text-white/20 mx-auto" />
                                                )}
                                            </td>
                                            <td className="text-center py-3">
                                                {row.seller ? (
                                                    <Check className="w-5 h-5 text-white/30 mx-auto" />
                                                ) : (
                                                    <X className="w-5 h-5 text-white/20 mx-auto" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-xs text-white/30 mt-4 text-right">
                            * Comparison based on public feature sets
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
