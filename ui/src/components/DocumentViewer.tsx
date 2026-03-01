"use client";

import { X } from "lucide-react";
import { DocumentItem, documentsApi } from "@/lib/api";

interface DocumentViewerProps {
    document: DocumentItem;
    onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
    const fileUrl = documentsApi.downloadUrl(document.id);
    const type = document.file_type?.toLowerCase() || "";

    const isImage = ["png", "jpg", "jpeg", "webp", "gif"].includes(type);
    const isVideo = ["mp4", "mov", "avi", "mkv", "webm"].includes(type);
    const isAudio = ["mp3", "wav", "m4a", "aac"].includes(type);
    const isPdf = type === "pdf";

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-900/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-zinc-50 shrink-0">
                    <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-[14px] font-semibold text-zinc-900 truncate" title={document.original_filename}>
                            {document.original_filename}
                        </h3>
                        {document.case_id && (
                            <p className="text-[12px] text-zinc-500 mt-0.5">Attached to Case</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 transition-colors"
                        title="Close Viewer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Viewer Body */}
                <div className="flex-1 overflow-auto bg-zinc-100 flex items-center justify-center relative rounded-b-xl">
                    {isImage ? (
                        <img
                            src={fileUrl}
                            alt={document.original_filename}
                            className="max-w-full max-h-full object-contain p-4 drop-shadow-md"
                        />
                    ) : isVideo ? (
                        <video
                            src={fileUrl}
                            controls
                            autoPlay
                            className="w-full h-full max-h-full outline-none bg-black"
                        />
                    ) : isAudio ? (
                        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm flex flex-col items-center">
                            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                                <span className="text-3xl">🎵</span>
                            </div>
                            <audio src={fileUrl} controls className="w-full" />
                        </div>
                    ) : isPdf ? (
                        <object
                            data={fileUrl}
                            type="application/pdf"
                            className="w-full h-full"
                        >
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-500">
                                <p className="mb-4 text-[14px]">Your browser does not support embedded PDFs.</p>
                                <a
                                    href={fileUrl}
                                    download
                                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-[13px] hover:bg-blue-700 transition"
                                >
                                    Download PDF instead
                                </a>
                            </div>
                        </object>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-zinc-200 rounded-xl flex items-center justify-center mb-4 text-zinc-400">
                                <span className="text-[12px] font-bold uppercase">{type || "?"}</span>
                            </div>
                            <h4 className="text-[15px] font-semibold text-zinc-800 mb-2">Preview not available</h4>
                            <p className="text-[13px] text-zinc-500 mb-6 max-w-sm">
                                This file type cannot be previewed in the browser. You can download it to view it locally.
                            </p>
                            <a
                                href={fileUrl}
                                download
                                className="px-5 py-2.5 bg-zinc-800 text-white font-medium rounded-lg text-[13px] hover:bg-black transition shadow-sm"
                            >
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
