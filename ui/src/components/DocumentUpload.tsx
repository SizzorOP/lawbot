"use client";

import { useCallback, useState } from "react";
import { documentsApi } from "@/lib/api";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";

interface DocumentUploadProps {
    caseId: string;
    onUploadComplete: () => void;
}

export function DocumentUpload({ caseId, onUploadComplete }: DocumentUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) await uploadFile(files[0]);
        },
        [caseId]
    );

    const handleFileSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) await uploadFile(files[0]);
            // Reset file input
            e.target.value = "";
        },
        [caseId]
    );

    const uploadFile = async (file: File) => {
        setUploading(true);
        setUploadStatus(null);
        try {
            await documentsApi.upload(caseId, file);
            setUploadStatus({ type: "success", message: `"${file.name}" uploaded successfully.` });
            onUploadComplete();
        } catch (err: any) {
            setUploadStatus({
                type: "error",
                message: err.message || "Upload failed. Please try again.",
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            {/* Drop Zone */}
            <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${isDragOver
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-blue-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
            >
                <input
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
                />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-zinc-500">Uploading...</span>
                    </div>
                ) : (
                    <>
                        <Upload
                            className={`w-8 h-8 mb-2 transition-colors ${isDragOver ? "text-blue-500" : "text-zinc-400"
                                }`}
                        />
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                                Click to upload
                            </span>{" "}
                            or drag and drop
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                            PDF, DOCX, TXT, PNG, JPG (max 50MB)
                        </p>
                    </>
                )}
            </label>

            {/* Status Message */}
            {uploadStatus && (
                <div
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${uploadStatus.type === "success"
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                        }`}
                >
                    {uploadStatus.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{uploadStatus.message}</span>
                    <button
                        onClick={() => setUploadStatus(null)}
                        className="ml-auto text-zinc-400 hover:text-zinc-600"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
