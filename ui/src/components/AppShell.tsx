"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";

const publicPaths = ["/login", "/signup", "/verify-email", "/auth/callback"];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();

    const isPublicPage = publicPaths.some((p) => pathname.startsWith(p));

    // On public pages (login, signup, etc.) — render children without sidebar
    if (isPublicPage) {
        return <>{children}</>;
    }

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-900">
                <div className="w-8 h-8 border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        router.push("/login");
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-900">
                <div className="w-8 h-8 border-2 border-zinc-200 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-white dark:bg-zinc-900 selection:bg-blue-100 selection:text-blue-900">
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
