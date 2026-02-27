"use client";

import Link from "next/link";
import { Download, Briefcase, FileText } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header Area */}
            <div className="flex items-center justify-between px-8 py-10 border-b border-zinc-100/50">
                <div>
                    <h1 className="text-[28px] font-semibold text-zinc-900 font-serif tracking-tight mb-2">
                        Welcome chotu lal
                    </h1>
                    <p className="text-[13px] text-zinc-500 font-medium">Getting started</p>
                </div>
                <button className="flex items-center gap-2 bg-[#2d2d2d] hover:bg-black text-white px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors shadow-sm">
                    <Download className="w-4 h-4" />
                    Install App
                </button>
            </div>

            {/* Main Content Areas */}
            <div className="p-8 max-w-5xl space-y-6">

                {/* Case Management Card */}
                <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
                        <h2 className="text-[15px] font-bold text-zinc-900 font-serif tracking-tight">Case Management</h2>
                        <Briefcase className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="p-12 flex flex-col items-center justify-center">
                        <p className="text-[13px] text-zinc-500 mb-6">No cases found</p>
                        <Link
                            href="/cases"
                            className="text-[13px] font-semibold text-zinc-900 hover:text-blue-600 transition-colors"
                        >
                            Create Case
                        </Link>
                    </div>
                </div>

                {/* Documents Storage Card */}
                <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
                        <h2 className="text-[15px] font-bold text-zinc-900 font-serif tracking-tight">Documents Storage</h2>
                        <FileText className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="p-12 flex flex-col items-center justify-center">
                        <p className="text-[13px] text-zinc-500 mb-6">No documents found</p>
                        <Link
                            href="/cases" // Temporarily routing to cases since we upload docs inside cases
                            className="text-[13px] font-semibold text-zinc-900 hover:text-blue-600 transition-colors"
                        >
                            Upload Document
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
