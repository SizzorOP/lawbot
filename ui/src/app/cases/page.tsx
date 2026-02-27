"use client";

import { useState, useEffect } from "react";
import { casesApi, CaseItem } from "@/lib/api";
import { CaseCard } from "@/components/CaseCard";
import {
    Briefcase,
    Plus,
    X,
    Search,
    Filter,
    Loader2,
} from "lucide-react";

export default function CasesPage() {
    const [cases, setCases] = useState<CaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        case_number: "",
        client_name: "",
        court: "",
        description: "",
    });
    const [creating, setCreating] = useState(false);

    const loadCases = async () => {
        setLoading(true);
        try {
            const data = await casesApi.list(filter || undefined);
            setCases(data);
        } catch (err) {
            console.error("Failed to load cases:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCases();
    }, [filter]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;
        setCreating(true);
        try {
            await casesApi.create(formData);
            setFormData({ title: "", case_number: "", client_name: "", court: "", description: "" });
            setShowForm(false);
            loadCases();
        } catch (err) {
            console.error("Failed to create case:", err);
        } finally {
            setCreating(false);
        }
    };

    const filteredCases = cases.filter(
        (c) =>
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.case_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen p-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        Case Management
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 ml-[52px]">
                        Manage all your cases from one place
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Case
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search cases by title, client, or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
                    {["", "active", "pending", "closed"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === f
                                    ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                }`}
                        >
                            {f === "" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cases Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
            ) : filteredCases.length === 0 ? (
                <div className="text-center py-20 text-zinc-400 dark:text-zinc-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No cases found</p>
                    <p className="text-sm mt-1">
                        {searchTerm ? "Try a different search term" : "Create your first case to get started"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCases.map((c) => (
                        <CaseCard key={c.id} caseItem={c} />
                    ))}
                </div>
            )}

            {/* New Case Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                Create New Case
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Case Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., State vs. Ram Kumar"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Case Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.case_number}
                                        onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                                        placeholder="e.g., CRL.A 123/2025"
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Client Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.client_name}
                                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                        placeholder="e.g., Ram Kumar"
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Court
                                </label>
                                <input
                                    type="text"
                                    value={formData.court}
                                    onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                                    placeholder="e.g., Delhi High Court"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the case..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                                >
                                    {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Create Case
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
