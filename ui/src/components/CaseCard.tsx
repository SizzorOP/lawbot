"use client";

import { CaseItem } from "@/lib/api";
import { Briefcase, FileText, CalendarDays } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    closed: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function CaseCard({ caseItem }: { caseItem: CaseItem }) {
    const statusClass = statusColors[caseItem.status] || statusColors.active;

    return (
        <Link href={`/cases/${caseItem.id}`}>
            <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer">
                {/* Hover gradient glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/30 dark:group-hover:from-blue-950/20 dark:group-hover:to-indigo-950/10 transition-all duration-300 pointer-events-none" />

                <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                    {caseItem.title}
                                </h3>
                                {caseItem.case_number && (
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                                        {caseItem.case_number}
                                    </p>
                                )}
                            </div>
                        </div>
                        <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${statusClass}`}
                        >
                            {caseItem.status}
                        </span>
                    </div>

                    {/* Meta */}
                    <div className="space-y-1.5 mb-3">
                        {caseItem.client_name && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                <span className="font-medium text-zinc-600 dark:text-zinc-300">Client:</span>{" "}
                                {caseItem.client_name}
                            </p>
                        )}
                        {caseItem.court && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                <span className="font-medium text-zinc-600 dark:text-zinc-300">Court:</span>{" "}
                                {caseItem.court}
                            </p>
                        )}
                    </div>

                    {/* Footer Stats */}
                    <div className="flex items-center gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{caseItem.document_count} docs</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>{caseItem.event_count} events</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
