"use client";

import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
    isExpanded: boolean;
    isMobileOpen: boolean;
    setIsExpanded: (expanded: boolean) => void;
    setIsMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <SidebarContext.Provider value={{ isExpanded, isMobileOpen, setIsExpanded, setIsMobileOpen }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
