"use client";
import React from "react";

export default function Card({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`p-6 rounded-lg shadow-sm ` + className}
            style={{
                backgroundColor: "white",
                border: "1px solid var(--border)",
            }}
        >
            {children}
        </div>
    );
}
