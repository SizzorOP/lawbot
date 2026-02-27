"use client";

import { Sidebar } from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
            {/* Sidebar is fixed on the left */}
            <div className="fixed top-0 left-0 h-screen z-50">
                <Sidebar />
            </div>

            {/* Main content area — offset by sidebar width (260px) */}
            <main className="flex-1 ml-[260px] min-h-screen">
                {children}
            </main>
        </div>
    );
}
