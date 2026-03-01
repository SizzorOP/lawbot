"use client";

import { useState, useEffect } from "react";
import {
    Languages,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    Filter,
    Plus,
    X,
    CheckCircle2,
    FileText as FileTextIcon,
    ArrowRightLeft,
    Download,
    History as HistoryIcon
} from "lucide-react";
import { casesApi, CaseItem, DocumentItem } from "@/lib/api";
import { DocumentSelector } from "@/components/DocumentSelector";

const SUPPORTED_LANGUAGES = [
    "English", "Hindi", "Bengali", "Marathi", "Telugu",
    "Tamil", "Gujarati", "Urdu", "Kannada", "Odia",
    "Malayalam", "Punjabi", "Spanish", "French", "Arabic"
];

export default function TranslationPage() {
    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All");

    // Process State
    const [cases, setCases] = useState<CaseItem[]>([]);
    const [selectedUploadCaseId, setSelectedUploadCaseId] = useState("");
    const [activeTranslation, setActiveTranslation] = useState<null | {
        id: string;
        filename: string;
        sourceLang: string;
        targetLang: string;
        status: "configuring" | "translating" | "done";
        resultText?: string;
    }>(null);

    // Filter configuration
    const filterOptions = ["All", "Completed", "In Progress", "Failed"];

    useEffect(() => {
        // Load cases to allow attaching the new document
        const loadCases = async () => {
            try {
                const casesData = await casesApi.list();
                setCases(casesData);
                if (casesData.length > 0) {
                    setSelectedUploadCaseId(casesData[0].id);
                }
            } catch (err) {
                console.error("Failed to load cases", err);
            }
        };
        loadCases();
    }, []);

    const handleDocumentSelected = (doc: DocumentItem) => {
        setIsUploadOpen(false);
        setActiveTranslation({
            id: doc.id,
            filename: doc.original_filename,
            sourceLang: "Auto-detect",
            targetLang: "English",
            status: "configuring"
        });
    };

    const startTranslation = () => {
        if (!activeTranslation) return;
        setActiveTranslation(prev => prev ? { ...prev, status: "translating" } : null);

        // Simulating the backend process
        setTimeout(() => {
            setActiveTranslation(prev => prev ? {
                ...prev,
                status: "done",
                resultText: `[Simulated Translation Preview]\n\nDocument: ${prev.filename}\nSource Language: ${prev.sourceLang}\nTarget Language: ${prev.targetLang}\n\nThis is a mock output simulating the optical character recognition (OCR) and subsequent language translation of your requested legal document/image. In production, this text will accurately reflect the document's native contents translated directly into your selected language idiom without losing the legal context.`
            } : null);
        }, 3000);
    };

    const handleNewTranslation = () => {
        setActiveTranslation(null);
    };

    return (
        <div className="flex bg-white w-full h-full min-h-screen overflow-hidden relative">

            {/* Inner Collapsible Sidebar */}
            <div
                className={`transition-all duration-300 ease-in-out border-r border-zinc-200 bg-zinc-50/50 flex flex-col shrink-0 h-full ${isSidebarOpen ? 'w-[300px]' : 'w-0 border-transparent opacity-0 overflow-hidden'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-5 border-b border-zinc-200/50 min-w-[300px]">
                    <div className="flex items-center gap-2">
                        <Languages className="w-5 h-5 text-zinc-900" />
                        <h1 className="text-[18px] font-bold text-zinc-900 font-serif">Translation</h1>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 p-1.5 rounded-md transition-colors"
                            title="Collapse Sidebar"
                        >
                            <PanelLeftClose className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Sidebar Body */}
                <div className="p-4 space-y-4 flex flex-col h-full min-w-[300px]">
                    {/* Search & Filter */}
                    <div className="flex items-center gap-2 relative">
                        <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full pl-8 pr-4 py-1.5 bg-white border border-zinc-200 rounded-full text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                            />
                        </div>

                        {/* Filter Button & Popover */}
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full border transition-colors ${isFilterOpen ? 'bg-zinc-100 border-zinc-300 text-zinc-800' : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
                                title="Filter Options"
                            >
                                <Filter className="w-3.5 h-3.5" />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute top-10 right-0 w-40 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="px-3 py-1.5 border-b border-zinc-100 mb-1">
                                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Filter By</span>
                                    </div>
                                    {filterOptions.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => { setActiveFilter(opt); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-3 py-1.5 text-[13px] font-medium transition-colors ${activeFilter === opt ? 'bg-blue-50 text-blue-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* New Translation Button */}
                    <button
                        onClick={handleNewTranslation}
                        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-zinc-300 rounded-lg text-[13px] font-medium text-zinc-800 hover:bg-zinc-50 hover:border-zinc-400 transition-colors shadow-sm active:scale-[0.98]"
                    >
                        New Translation
                        <Plus className="w-4 h-4 text-zinc-500" />
                    </button>

                    {/* Empty history container */}
                    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center pt-8 opacity-50">
                        <HistoryIcon className="w-8 h-8 text-zinc-300 mb-2" />
                        <span className="text-[12px] font-medium text-zinc-400">No translations found</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative h-full bg-zinc-50/30">
                {/* Floating Open Sidebar Button (Visible only when sidebar is closed) */}
                <div className={`absolute top-4 left-4 z-10 transition-all duration-300 ${!isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="flex items-center gap-2 bg-white text-zinc-700 border border-zinc-200 shadow-sm px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-zinc-50 transition-colors"
                    >
                        <PanelLeftOpen className="w-4 h-4" />
                        Menu
                    </button>
                </div>

                <div className="flex-1 p-6 md:p-8 flex items-center justify-center overflow-auto">

                    {/* State 1: Dropzone (No active translation) */}
                    {!activeTranslation && (
                        <div className="w-full max-w-2xl h-full max-h-[600px] border-2 border-dashed border-zinc-300 hover:border-zinc-400 transition-colors rounded-2xl flex flex-col items-center justify-center bg-white shadow-sm p-8">
                            <button
                                onClick={() => setIsUploadOpen(true)}
                                className="flex items-center gap-2 bg-[#1a1f2c] hover:bg-black text-white px-6 py-3 rounded-lg text-[14px] font-medium transition-transform transform active:scale-95 shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                Select Document for Translation
                            </button>
                            <span className="text-zinc-500 text-[13px] my-4 font-medium">OR</span>
                            <span className="text-zinc-400 text-[14px] italic">Drag and drop the document here</span>
                        </div>
                    )}

                    {/* State 2 & 3: Translation Configuration or Processing */}
                    {activeTranslation && (
                        <div className="w-full max-w-4xl h-full flex flex-col gap-6 animate-in fade-in duration-300">

                            {/* Selected Document Indicator */}
                            <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                        <FileTextIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-[14px] font-bold text-zinc-900">{activeTranslation.filename}</h3>
                                        <p className="text-[12px] text-zinc-500">Document selected for translation</p>
                                    </div>
                                </div>
                                {activeTranslation.status === "configuring" && (
                                    <button
                                        onClick={handleNewTranslation}
                                        className="text-[12px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors px-3 py-1.5 border border-zinc-200 rounded-md"
                                    >
                                        Change File
                                    </button>
                                )}
                            </div>

                            {/* Language Configuration */}
                            {activeTranslation.status === "configuring" && (
                                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-[15px] font-serif font-bold text-zinc-900 mb-5">Configure Translation</h3>

                                    <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                        <div className="flex-1 w-full">
                                            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Translate From</label>
                                            <select
                                                value={activeTranslation.sourceLang}
                                                onChange={(e) => setActiveTranslation({ ...activeTranslation, sourceLang: e.target.value })}
                                                className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 bg-white text-[14px] font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all cursor-pointer"
                                            >
                                                <option value="Auto-detect">Auto-detect Language</option>
                                                {SUPPORTED_LANGUAGES.map(lang => (
                                                    <option key={lang} value={lang}>{lang}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 mt-4 hidden md:flex shrink-0">
                                            <ArrowRightLeft className="w-4 h-4" />
                                        </div>

                                        <div className="flex-1 w-full">
                                            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Translate To</label>
                                            <select
                                                value={activeTranslation.targetLang}
                                                onChange={(e) => setActiveTranslation({ ...activeTranslation, targetLang: e.target.value })}
                                                className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 bg-white text-[14px] font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all cursor-pointer"
                                            >
                                                {SUPPORTED_LANGUAGES.map(lang => (
                                                    <option key={lang} value={lang}>{lang}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={startTranslation}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-[14px] px-8 py-2.5 rounded-lg shadow-sm transition-transform transform active:scale-95"
                                        >
                                            Start Translation
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Loading State */}
                            {activeTranslation.status === "translating" && (
                                <div className="bg-white border border-zinc-200 rounded-xl p-12 flex flex-col items-center justify-center shadow-sm">
                                    <div className="w-10 h-10 border-4 border-zinc-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                                    <h3 className="text-[16px] font-bold text-zinc-900 mb-1">Analyzing and Translating...</h3>
                                    <p className="text-[13px] text-zinc-500">Processing document context and applying legal lexicons.</p>
                                </div>
                            )}

                            {/* Result State */}
                            {activeTranslation.status === "done" && (
                                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col h-full animate-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-[15px] font-bold text-emerald-900">Translation Complete</h3>
                                            <p className="text-[12px] text-emerald-700/80">Translated {activeTranslation.sourceLang} to {activeTranslation.targetLang}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg p-5 font-mono text-[13px] text-zinc-800 leading-relaxed overflow-y-auto whitespace-pre-wrap">
                                        {activeTranslation.resultText}
                                    </div>

                                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-100">
                                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-zinc-200 rounded-lg text-[13px] font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm">
                                            <Download className="w-4 h-4" /> Export Document
                                        </button>
                                        <button
                                            onClick={handleNewTranslation}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-50 border border-transparent rounded-lg text-[13px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                                        >
                                            Translate Another File
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>

            {/* Document Selector Modal */}
            {isUploadOpen && (
                <DocumentSelector
                    onClose={() => setIsUploadOpen(false)}
                    onSelect={handleDocumentSelected}
                />
            )}
        </div>
    );
}
