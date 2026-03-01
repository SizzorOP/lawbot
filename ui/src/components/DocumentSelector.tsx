"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, FileText, Image as ImageIcon, Video, FileAudio, Folder, Plus, X, Upload } from "lucide-react";
import { documentsApi, CaseItem, DocumentItem, casesApi } from "@/lib/api";
import { DocumentUpload } from "./DocumentUpload";

interface DocumentSelectorProps {
    onClose: () => void;
    onSelect: (doc: DocumentItem) => void;
    mode?: "documents" | "media";
}

export function DocumentSelector({ onClose, onSelect, mode = "documents" }: DocumentSelectorProps) {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [cases, setCases] = useState<CaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<string>("All");
    const [showUpload, setShowUpload] = useState(false);
    const [uploadCaseId, setUploadCaseId] = useState<string>("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [docsRes, casesRes] = await Promise.all([
                documentsApi.listAll(),
                casesApi.list()
            ]);
            setDocuments(docsRes);
            setCases(casesRes);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type?: string | null) => {
        if (!type) return <FileText className="w-5 h-5 text-gray-500" />;
        if (type.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
        if (["png", "jpg", "jpeg", "webp", "gif"].includes(type)) return <ImageIcon className="w-5 h-5 text-blue-500" />;
        if (["mp4", "mov", "avi", "mkv"].includes(type)) return <Video className="w-5 h-5 text-purple-500" />;
        if (["mp3", "wav", "m4a", "aac"].includes(type)) return <FileAudio className="w-5 h-5 text-yellow-500" />;
        return <FileText className="w-5 h-5 text-gray-500" />;
    };

    const filteredDocs = useMemo(() => {
        let result = documents;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(d =>
                d.original_filename.toLowerCase().includes(query)
            );
        }

        if (filter === "PDFs") {
            result = result.filter(d => d.file_type === "pdf");
        } else if (filter === "Photos & Images") {
            const imgTypes = ["png", "jpg", "jpeg", "webp", "gif"];
            result = result.filter(d => d.file_type && imgTypes.includes(d.file_type.toLowerCase()));
        } else if (filter === "Videos") {
            const vidTypes = ["mp4", "mov", "avi", "mkv", "webm"];
            result = result.filter(d => d.file_type && vidTypes.includes(d.file_type.toLowerCase()));
        } else if (filter === "Audio") {
            const audTypes = ["mp3", "wav", "m4a", "aac"];
            result = result.filter(d => d.file_type && audTypes.includes(d.file_type.toLowerCase()));
        }

        return result;
    }, [documents, searchQuery, filter]);

    const handleAssignCase = async (doc: DocumentItem, newCaseId: string) => {
        try {
            await documentsApi.update(doc.id, { case_id: newCaseId || null });
            fetchData(); // Refresh list to reflect changes
        } catch (error) {
            console.error("Failed to update case assignment:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-100">
                    <FileText className="w-5 h-5 text-zinc-800" />
                    <h2 className="text-[18px] font-bold text-zinc-900 font-serif whitespace-nowrap">Add Document</h2>

                    {/* Search */}
                    <div className="flex-1 ml-4">
                        <div className="relative max-w-xl">
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-300 rounded-full text-[14px] focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            />
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors ml-auto">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!showUpload ? (
                    <>
                        {/* Filters & Content */}
                        <div className="p-6 flex-1 overflow-y-auto flex flex-col bg-zinc-50/50">

                            <div className="flex items-center justify-between mb-6">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilter("All")}
                                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors border ${filter === "All" ? "bg-zinc-800 text-white border-zinc-800" : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"}`}
                                    >
                                        <Folder className="w-4 h-4" /> All
                                    </button>

                                    {mode === "documents" ? (
                                        <>
                                            <button
                                                onClick={() => setFilter("PDFs")}
                                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors border ${filter === "PDFs" ? "bg-zinc-800 text-white border-zinc-800" : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"}`}
                                            >
                                                <FileText className="w-4 h-4" /> PDFs
                                            </button>
                                            <button
                                                onClick={() => setFilter("Photos & Images")}
                                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors border ${filter === "Photos & Images" ? "bg-zinc-800 text-white border-zinc-800" : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"}`}
                                            >
                                                <ImageIcon className="w-4 h-4" /> Photos & Images
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setFilter("Videos")}
                                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors border ${filter === "Videos" ? "bg-zinc-800 text-white border-zinc-800" : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"}`}
                                            >
                                                <Video className="w-4 h-4" /> Videos
                                            </button>
                                            <button
                                                onClick={() => setFilter("Audio")}
                                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors border ${filter === "Audio" ? "bg-zinc-800 text-white border-zinc-800" : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"}`}
                                            >
                                                <FileAudio className="w-4 h-4" /> Audio
                                            </button>
                                        </>
                                    )}
                                </div>

                                <select className="text-[13px] border border-zinc-300 rounded-lg px-3 py-1.5 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400">
                                    <option>Sort by</option>
                                    <option>Newest First</option>
                                    <option>Oldest First</option>
                                </select>
                            </div>

                            {/* Document List View */}
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin"></div>
                                </div>
                            ) : filteredDocs.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                                    <p className="text-[14px]">No results found.</p>
                                </div>
                            ) : (
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
                                    {filteredDocs.map(doc => (
                                        <div key={doc.id} className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow group relative">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100">
                                                    {getIcon(doc.file_type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-[13px] font-semibold text-zinc-900 truncate" title={doc.original_filename}>{doc.original_filename}</h3>
                                                    <p className="text-[11px] text-zinc-500 mt-0.5">{doc.file_type?.toUpperCase()} • {doc.file_size ? (doc.file_size / 1024 / 1024).toFixed(2) + " MB" : "Unknown"}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                                                <select
                                                    value={doc.case_id || ""}
                                                    onChange={(e) => handleAssignCase(doc, e.target.value)}
                                                    className="w-full text-[11px] max-w-[140px] truncate border border-zinc-200 rounded-md px-2 py-1 bg-zinc-50 text-zinc-600 focus:outline-none focus:border-zinc-400"
                                                    title="Assign to Case"
                                                >
                                                    <option value="">No Case</option>
                                                    {cases.map(c => (
                                                        <option key={c.id} value={c.id}>{c.title}</option>
                                                    ))}
                                                </select>

                                                <button
                                                    onClick={() => onSelect(doc)}
                                                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[12px] font-semibold rounded-md transition-colors"
                                                >
                                                    Select
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>

                        {/* Footer & Floating FAB */}
                        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-white relative">
                            {/* Floating Top right relative to footer */}
                            <button
                                onClick={() => setShowUpload(true)}
                                className="absolute -top-16 right-6 w-12 h-12 bg-black hover:bg-zinc-800 text-white rounded-xl shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                                title="Upload New Document"
                            >
                                <Plus className="w-6 h-6" />
                            </button>

                            <div className="text-[13px] text-zinc-500 font-medium">
                                0 selected
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={onClose} className="px-5 py-2 border border-zinc-300 text-zinc-700 text-[13px] font-semibold rounded-lg hover:bg-zinc-50 transition-colors">
                                    Clear
                                </button>
                                <button disabled className="px-5 py-2 bg-zinc-400 text-white text-[13px] font-semibold rounded-lg opacity-80 cursor-not-allowed">
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Embedded Upload View */
                    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-zinc-50/50">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[15px] font-bold text-zinc-900">Upload New Document</h3>
                            <button onClick={() => setShowUpload(false)} className="text-[13px] font-semibold text-zinc-500 hover:text-zinc-800">
                                ← Back to list
                            </button>
                        </div>

                        <div className="max-w-xl mx-auto w-full bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="mb-6 space-y-2">
                                <label className="text-[13px] font-semibold text-zinc-800 block">Assign to Case (Optional)</label>
                                <select
                                    value={uploadCaseId}
                                    onChange={(e) => setUploadCaseId(e.target.value)}
                                    className="w-full text-[13px] border border-zinc-300 rounded-lg px-3 py-2.5 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-colors cursor-pointer"
                                >
                                    <option value="">No specific case (Global Upload)</option>
                                    {cases.map(c => (
                                        <option key={c.id} value={c.id}>{c.title} {c.case_number ? `(${c.case_number})` : ''}</option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-zinc-500">You can always reassign this document to a case later.</p>
                            </div>

                            <DocumentUpload
                                caseId={uploadCaseId || undefined}
                                allowedExtensions={mode === "media" ? ".mp3,.wav,.m4a,.aac,.mp4,.mov,.avi,.mkv,.webm" : undefined}
                                onUploadComplete={() => {
                                    fetchData();
                                    setShowUpload(false);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
