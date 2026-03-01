"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import Link from "next/link";

export function MobileHeader() {
    const [isOpen, setIsOpen] = useState(false);

    // Lock body scroll when drawer is open
    if (typeof document !== "undefined") {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }

    return (
        <>
            {/* Fixed Top Bar */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 z-40 flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex items-center justify-center w-7 h-7 bg-zinc-900 dark:bg-white rounded-lg shrink-0 overflow-hidden relative">
                        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-white dark:bg-zinc-900 rounded-sm" />
                        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-zinc-400 rounded-sm" />
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white dark:bg-zinc-900 rounded-full" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white font-serif">
                        YuktiAI
                    </span>
                </Link>

                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 -mr-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md transition-colors"
                    aria-label="Open Menu"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Drawer Content */}
            <div
                className={`md:hidden fixed inset-y-0 right-0 z-50 w-[280px] bg-white dark:bg-zinc-900 shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex items-center justify-between px-4 h-16 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="font-semibold text-zinc-900 dark:text-white font-serif tracking-tight">Menu</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 -mr-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        aria-label="Close Menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* We embed the fully-functional Sidebar, but force it to be expanded and override its fixed height/width borders */}
                <div className="h-[calc(100vh-64px)] overflow-hidden">
                    <Sidebar
                        isCollapsed={false}
                        toggleSidebar={() => setIsOpen(false)}
                        className="w-full !h-full border-r-0"
                    />
                </div>
            </div>
        </>
    );
}
