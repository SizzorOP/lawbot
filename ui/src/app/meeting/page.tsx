"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Filter, Headphones, Video, FileAudio, Mic, StopCircle, Upload, Save, Clock, FileText, X } from "lucide-react";
import { documentsApi, DocumentItem } from "@/lib/api";
import { DocumentSelector } from "@/components/DocumentSelector";
import { DocumentViewer } from "@/components/DocumentViewer";

const AUDIO_VIDEO_EXTS = ["mp3", "wav", "m4a", "aac", "mp4", "mov", "avi", "mkv", "webm"];

export default function MeetingAssistantPage() {
    // Media & Docs State
    const [meetings, setMeetings] = useState<DocumentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewDocument, setViewDocument] = useState<DocumentItem | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState<"transcript" | "summary">("transcript");

    // UI Search & Filter
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("All"); // All, Audio, Video
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [notes, setNotes] = useState("");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        loadMeetings();
        return () => stopRecordingCleanup();
    }, []);

    const loadMeetings = async () => {
        setIsLoading(true);
        try {
            const docs = await documentsApi.listAll();
            // Filter strictly for audio/video conceptually
            const mediaDocs = docs.filter(d =>
                d.file_type && AUDIO_VIDEO_EXTS.includes(d.file_type.toLowerCase())
            );
            setMeetings(mediaDocs);
        } catch (error) {
            console.error("Failed to load meetings", error);
        } finally {
            setIsLoading(false);
        }
    };

    const stopRecordingCleanup = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleAnalyze = async (doc: DocumentItem) => {
        setIsAnalyzing(true);
        try {
            const updatedDoc = await documentsApi.analyzeMeeting(doc.id);
            setViewDocument(updatedDoc);
            loadMeetings();
        } catch (error) {
            console.error("Error analyzing meeting:", error);
            alert("Failed to analyze meeting.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([audioBlob], `Realtime_Meeting_${new Date().getTime()}.webm`, { type: 'audio/webm' });

                // Keep notes associated or download them temporarily
                if (notes.trim()) {
                    const notesBlob = new Blob([notes], { type: 'text/plain' });
                    const notesFile = new File([notesBlob], `Notes_Meeting_${new Date().getTime()}.txt`, { type: 'text/plain' });
                    await documentsApi.upload(notesFile);
                }

                await documentsApi.upload(file);

                setNotes(""); // Reset notes
                setRecordingTime(0);
                setIsRecording(false);
                loadMeetings();
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Microphone access denied or error:", error);
            alert("Could not access microphone for recording.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            if (timerRef.current) clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const filteredMeetings = useMemo(() => {
        let result = meetings;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(m => m.original_filename.toLowerCase().includes(query));
        }
        if (filter === "Audio") {
            result = result.filter(m => m.file_type && ["mp3", "wav", "m4a", "aac"].includes(m.file_type.toLowerCase()));
        } else if (filter === "Video") {
            result = result.filter(m => m.file_type && ["mp4", "mov", "avi", "mkv", "webm"].includes(m.file_type.toLowerCase()));
        }
        return result;
    }, [meetings, searchQuery, filter]);

    return (
        <div className="flex flex-col h-screen w-full bg-zinc-50 overflow-hidden relative">
            {/* Header */}
            <div className="flex-shrink-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-zinc-900" />
                    <h1 className="text-[18px] font-bold text-zinc-900 font-serif">Meeting Assistant</h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative w-64">
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search meetings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-300 rounded-full text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                        {isFilterOpen && (
                            <div className="absolute top-12 right-0 w-32 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-10 animate-in fade-in zoom-in-95 duration-100">
                                {["All", "Audio", "Video"].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => { setFilter(opt); setIsFilterOpen(false); }}
                                        className={`w-full text-left px-3 py-1.5 text-[13px] font-medium transition-colors ${filter === opt ? 'bg-blue-50 text-blue-700' : 'text-zinc-600 hover:bg-zinc-50'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-zinc-300 mx-2"></div>

                    {/* Actions */}
                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 rounded-lg text-[13px] font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm"
                    >
                        <Upload className="w-4 h-4" /> Upload
                    </button>

                    {isRecording ? (
                        <button
                            onClick={stopRecording}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-[13px] font-bold text-red-600 hover:bg-red-100 transition-colors shadow-sm animate-pulse"
                        >
                            <StopCircle className="w-4 h-4" /> Stop Recording
                        </button>
                    ) : (
                        <button
                            onClick={startRecording}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-transparent rounded-lg text-[13px] font-semibold text-white hover:bg-black transition-colors shadow-sm"
                        >
                            <Mic className="w-4 h-4" /> Record Meeting
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Split */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Meeting List */}
                <div className="w-[55%] flex flex-col border-r border-zinc-200 bg-zinc-50">
                    <div className="p-4 px-6 border-b border-zinc-200/50 bg-white">
                        <h2 className="text-[14px] font-bold text-zinc-800">Recent Meetings</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin"></div>
                            </div>
                        ) : filteredMeetings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                                <Headphones className="w-8 h-8 mb-3 opacity-50" />
                                <p className="text-[13px] font-medium">No recorded meetings found.</p>
                                <p className="text-[12px] mt-1 text-center max-w-xs">Record a new meeting or upload an existing audio/video file.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {filteredMeetings.map(meeting => {
                                    const isVideo = ["mp4", "mov", "avi", "mkv", "webm"].includes(meeting.file_type?.toLowerCase() || "");

                                    return (
                                        <div
                                            key={meeting.id}
                                            onClick={() => setViewDocument(meeting)}
                                            className="bg-white border border-zinc-200 rounded-xl p-4 cursor-pointer hover:border-zinc-300 hover:shadow-sm transition-all flex flex-col justify-between"
                                        >
                                            <div className="flex gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100">
                                                    {isVideo ? <Video className="w-5 h-5 text-purple-600" /> : <FileAudio className="w-5 h-5 text-blue-600" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-[13.5px] font-semibold text-zinc-900 truncate" title={meeting.original_filename}>{meeting.original_filename}</h3>
                                                    <p className="text-[12px] text-zinc-500 mt-0.5">{new Date(meeting.uploaded_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
                                                <span className="bg-zinc-100 px-2 py-1 rounded">{(meeting.file_size ? meeting.file_size / 1024 / 1024 : 0).toFixed(2)} MB</span>
                                                <span className="uppercase tracking-widest">{meeting.file_type}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Realtime Notes & Recording Panel */}
                <div className="w-[45%] flex flex-col bg-white">
                    {isRecording ? (
                        <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></span>
                                <span className="text-[14px] font-bold text-red-700">Recording in Progress</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-mono text-[16px] font-bold text-red-700 bg-white px-3 py-1 rounded-md border border-red-200">
                                <Clock className="w-4 h-4" />
                                {formatTime(recordingTime)}
                            </div>
                        </div>
                    ) : (
                        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                            <h2 className="text-[14px] font-bold text-zinc-800 flex items-center gap-2">
                                <FileAudio className="w-4 h-4 text-zinc-500" /> Realtime Notes
                            </h2>
                        </div>
                    )}

                    <div className="flex-1 p-6 flex flex-col">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={isRecording ? "Take realtime notes here while recording..." : "Meeting notes..."}
                            className="flex-1 w-full resize-none outline-none text-[14px] text-zinc-800 leading-relaxed placeholder:text-zinc-400 font-serif"
                        ></textarea>

                        <div className="pt-4 mt-auto border-t border-zinc-100 flex justify-end">
                            <button
                                onClick={async () => {
                                    if (!notes.trim()) return;
                                    const notesBlob = new Blob([notes], { type: 'text/plain' });
                                    const notesFile = new File([notesBlob], `Meeting_Notes_${new Date().getTime()}.txt`, { type: 'text/plain' });
                                    await documentsApi.upload(notesFile);
                                    alert("Notes saved successfully.");
                                    setNotes("");
                                    loadMeetings();
                                }}
                                disabled={!notes.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 rounded-lg text-[13px] font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" /> Save Notes Manually
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Selector Modal */}
            {isUploadOpen && (
                <DocumentSelector
                    mode="media"
                    onClose={() => setIsUploadOpen(false)}
                    onSelect={(doc) => {
                        setViewDocument(doc);
                        setIsUploadOpen(false);
                    }}
                />
            )}

            {/* View Document Modal */}
            {viewDocument && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-900/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden relative">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50 shrink-0">
                            <div className="flex-1 min-w-0 pr-4">
                                <h3 className="text-[16px] font-semibold text-zinc-900 truncate" title={viewDocument.original_filename}>
                                    {viewDocument.original_filename}
                                </h3>
                                <p className="text-[13px] text-zinc-500 mt-1">
                                    {viewDocument.file_type?.toUpperCase()} • {new Date(viewDocument.uploaded_at).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setViewDocument(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Viewer Body - Split Layout */}
                        <div className="flex-1 flex overflow-hidden">

                            {/* Left Side - Media Player */}
                            <div className="w-1/2 border-r border-zinc-200 bg-black flex items-center justify-center relative">
                                {["mp4", "mov", "avi", "mkv", "webm"].includes(viewDocument.file_type?.toLowerCase() || "") ? (
                                    <video
                                        src={documentsApi.downloadUrl(viewDocument.id)}
                                        controls
                                        autoPlay
                                        className="w-full h-full object-contain"
                                    />
                                ) : ["mp3", "wav", "m4a", "aac"].includes(viewDocument.file_type?.toLowerCase() || "") ? (
                                    <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-8">
                                        <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-8 border border-zinc-700 shadow-xl">
                                            <Headphones className="w-10 h-10 text-zinc-400" />
                                        </div>
                                        <audio
                                            src={documentsApi.downloadUrl(viewDocument.id)}
                                            controls
                                            className="w-full max-w-md"
                                        />
                                    </div>
                                ) : (
                                    <DocumentViewer document={viewDocument} onClose={() => setViewDocument(null)} />
                                )}
                            </div>

                            {/* Right Side - Analysis */}
                            <div className="w-1/2 flex flex-col bg-white">
                                {!viewDocument.transcript && !viewDocument.summary ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                                            <FileText className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <h3 className="text-[18px] font-semibold text-zinc-900 mb-3">Analysis Not Generated</h3>
                                        <p className="text-[14px] text-zinc-500 max-w-sm mb-8 leading-relaxed">
                                            Generate a detailed transcript and automated summary with key action items from this meeting recording.
                                        </p>
                                        <button
                                            onClick={() => handleAnalyze(viewDocument)}
                                            disabled={isAnalyzing}
                                            className={`px-6 py-2.5 rounded-lg text-[14px] font-medium transition-all shadow-sm flex items-center gap-2 ${isAnalyzing
                                                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow"
                                                }`}
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                                                    Analyzing Audio...
                                                </>
                                            ) : (
                                                <>
                                                    <Mic className="w-4 h-4" /> Generate Analysis
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Tabs */}
                                        <div className="flex border-b border-zinc-200">
                                            <button
                                                onClick={() => setActiveTab("transcript")}
                                                className={`flex-1 py-4 text-[14px] font-medium transition-colors border-b-2 ${activeTab === "transcript"
                                                    ? "border-blue-600 text-blue-600"
                                                    : "border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                                                    }`}
                                            >
                                                Transcript
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("summary")}
                                                className={`flex-1 py-4 text-[14px] font-medium transition-colors border-b-2 ${activeTab === "summary"
                                                    ? "border-blue-600 text-blue-600"
                                                    : "border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                                                    }`}
                                            >
                                                Summary & Action Items
                                            </button>
                                        </div>

                                        {/* Content Area */}
                                        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50">
                                            {activeTab === "transcript" && viewDocument.transcript && (
                                                <div className="space-y-4">
                                                    {viewDocument.transcript.split('\n').filter(Boolean).map((line, idx) => {
                                                        const timeMatch = line.match(/^\[(.*?)\]/);
                                                        const timestamp = timeMatch ? timeMatch[0] : '';
                                                        const content = timeMatch ? line.substring(timestamp.length).trim() : line;

                                                        return (
                                                            <div key={idx} className="flex gap-4 text-[14px]">
                                                                <span className="text-zinc-400 font-mono text-[13px] shrink-0 pt-0.5">{timestamp}</span>
                                                                <span className="text-zinc-800 leading-relaxed max-w-prose">{content}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {activeTab === "summary" && viewDocument.summary && (
                                                <div className="prose prose-sm prose-zinc max-w-none">
                                                    {viewDocument.summary.split('\n').map((line, idx) => (
                                                        <div key={idx}>
                                                            {line.startsWith('**') && line.endsWith('**') ? (
                                                                <h4 className="text-[15px] font-bold text-zinc-900 mt-6 mb-2">{line.replace(/\*\*/g, '')}</h4>
                                                            ) : line.startsWith('- [ ]') ? (
                                                                <div className="flex items-start gap-2 mb-2 ml-4">
                                                                    <div className="w-4 h-4 rounded border border-zinc-300 mt-0.5 shrink-0" />
                                                                    <span className="text-zinc-700">{line.replace('- [ ]', '').trim()}</span>
                                                                </div>
                                                            ) : line.startsWith('-') ? (
                                                                <div className="flex items-start gap-2 mb-2 ml-4">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                                                                    <span className="text-zinc-700">{line.replace('-', '').trim()}</span>
                                                                </div>
                                                            ) : line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') ? (
                                                                <div className="flex items-start gap-2 mb-2 ml-4">
                                                                    <span className="text-zinc-900 font-medium shrink-0">{line.split(' ')[0]}</span>
                                                                    <span className="text-zinc-700">{line.substring(line.indexOf(' ') + 1)}</span>
                                                                </div>
                                                            ) : line.trim() === '' ? (
                                                                <div className="h-2" />
                                                            ) : (
                                                                <p className="text-zinc-700 leading-relaxed mb-2">{line}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
