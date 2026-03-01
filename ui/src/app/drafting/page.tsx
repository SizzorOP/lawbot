"use client";

import { useState } from "react";
import { PenTool, LayoutGrid, List, Filter, Plus } from "lucide-react";
import Link from "next/link";

export default function DraftingHomePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    return (
        <div className="min-h-screen bg-white flex flex-col pt-16 px-8 p-4">

            {/* Header & Toolbar */}
            <div className="w-full flex items-center justify-between mb-8 max-w-[1400px] mx-auto">
                <div className="flex items-center gap-3">
                    <PenTool className="w-6 h-6 text-zinc-900" />
                    <h1 className="text-2xl font-bold font-serif text-zinc-900 tracking-tight">Drafting</h1>

                    {/* Search Bar */}
                    <div className="relative ml-4">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-[300px] pl-4 pr-10 py-2 bg-white border border-zinc-200 rounded-full text-sm outline-none focus:border-zinc-400 transition-colors shadow-sm text-zinc-800 placeholder:text-zinc-400"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggles */}
                    <div className="flex bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 shadow-sm">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 transition-colors ${viewMode === "grid" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-300"}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 transition-colors ${viewMode === "list" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-300"}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Filter Button */}
                    <button className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-colors bg-white shadow-sm">
                        <Filter className="w-4 h-4" />
                    </button>

                    {/* New Draft Button */}
                    <Link
                        href="/drafting/new"
                        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm ml-2"
                    >
                        <Plus className="w-4 h-4" /> New Draft
                    </Link>
                </div>
            </div>

            {/* Empty State Body */}
            <div className="flex-1 flex flex-col items-center justify-center mb-32 animate-in fade-in zoom-in-95 duration-500 delay-100">
                <p className="text-zinc-400 text-sm font-medium">No results found.</p>
            </div>

        </div>
    );
}
