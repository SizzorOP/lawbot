"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
            {/* Sidebar is fixed on the left */}
            <div className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}`}>
                <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
            </div>

            {/* Main content area — offset by sidebar width */}
            <main className={`flex-1 min-h-screen transition-all duration-300 ${isCollapsed ? 'pl-[72px]' : 'pl-[260px]'}`}>
                {children}
            </main>
        </div>
    );
}
