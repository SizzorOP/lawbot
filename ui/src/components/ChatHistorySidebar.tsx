"use client";

import { useState, useRef, useEffect } from "react";
import {
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    MessageSquare,
    Pencil,
    Trash2,
    Check,
    X,
    MoreHorizontal,
} from "lucide-react";

export interface ChatSession {
    id: string;
    title: string;
    messages: any[];
    createdAt: number;
    updatedAt: number;
}

interface ChatHistorySidebarProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onNewChat: () => void;
    onSelectSession: (id: string) => void;
    onRenameSession: (id: string, newTitle: string) => void;
    onDeleteSession: (id: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}

function groupSessionsByDate(sessions: ChatSession[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - 7 * 86400000;

    const groups: { label: string; sessions: ChatSession[] }[] = [
        { label: "Today", sessions: [] },
        { label: "Yesterday", sessions: [] },
        { label: "Previous 7 Days", sessions: [] },
        { label: "Older", sessions: [] },
    ];

    const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

    for (const s of sorted) {
        if (s.updatedAt >= today) groups[0].sessions.push(s);
        else if (s.updatedAt >= yesterday) groups[1].sessions.push(s);
        else if (s.updatedAt >= sevenDaysAgo) groups[2].sessions.push(s);
        else groups[3].sessions.push(s);
    }

    return groups.filter((g) => g.sessions.length > 0);
}

export function ChatHistorySidebar({
    sessions,
    activeSessionId,
    onNewChat,
    onSelectSession,
    onRenameSession,
    onDeleteSession,
    isOpen,
    onToggle,
}: ChatHistorySidebarProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const editRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingId && editRef.current) editRef.current.focus();
    }, [editingId]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const startRename = (session: ChatSession) => {
        setEditingId(session.id);
        setEditValue(session.title);
        setMenuOpen(null);
    };

    const confirmRename = () => {
        if (editingId && editValue.trim()) {
            onRenameSession(editingId, editValue.trim());
        }
        setEditingId(null);
    };

    const cancelRename = () => {
        setEditingId(null);
        setEditValue("");
    };

    const groups = groupSessionsByDate(sessions);

    // Collapsed state — just a toggle button
    if (!isOpen) {
        return (
            <div className="flex flex-col items-center pt-4 gap-3 w-12 border-r border-zinc-200 bg-zinc-50 shrink-0">
                <button
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-zinc-200 text-zinc-500 transition-colors"
                    title="Open chat history"
                >
                    <PanelLeftOpen className="w-5 h-5" />
                </button>
                <button
                    onClick={onNewChat}
                    className="p-2 rounded-lg hover:bg-zinc-200 text-zinc-500 transition-colors"
                    title="New chat"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-[280px] border-r border-zinc-200 bg-zinc-50 shrink-0 h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-zinc-200">
                <button
                    onClick={onNewChat}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors shadow-sm flex-1 mr-2"
                >
                    <Plus className="w-4 h-4" />
                    New Chat
                </button>
                <button
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-zinc-200 text-zinc-500 transition-colors"
                    title="Close sidebar"
                >
                    <PanelLeftClose className="w-5 h-5" />
                </button>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin">
                {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-400 text-sm">
                        <MessageSquare className="w-8 h-8 mb-3 opacity-40" />
                        <p>No conversations yet</p>
                        <p className="text-xs mt-1">Start a new chat to begin</p>
                    </div>
                ) : (
                    groups.map((group) => (
                        <div key={group.label} className="mb-3">
                            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-1.5">
                                {group.label}
                            </p>
                            {group.sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`group relative flex items-center rounded-lg px-2.5 py-2 cursor-pointer text-sm transition-all duration-150
                    ${session.id === activeSessionId
                                            ? "bg-zinc-200 text-zinc-900 font-medium"
                                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                        }`}
                                    onClick={() => {
                                        if (editingId !== session.id) onSelectSession(session.id);
                                    }}
                                >
                                    <MessageSquare className="w-4 h-4 shrink-0 mr-2.5 opacity-60" />

                                    {editingId === session.id ? (
                                        <div className="flex items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                ref={editRef}
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") confirmRename();
                                                    if (e.key === "Escape") cancelRename();
                                                }}
                                                className="flex-1 min-w-0 px-1.5 py-0.5 text-sm rounded border border-blue-400 bg-white outline-none"
                                            />
                                            <button onClick={confirmRename} className="p-0.5 text-green-600 hover:text-green-700">
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={cancelRename} className="p-0.5 text-red-500 hover:text-red-600">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="truncate flex-1">{session.title}</span>

                                            {/* Action dots — visible on hover or when menu open */}
                                            <div className="relative" ref={menuOpen === session.id ? menuRef : null}>
                                                <button
                                                    className={`p-1 rounded text-zinc-400 hover:text-zinc-600 transition-opacity
                            ${menuOpen === session.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMenuOpen(menuOpen === session.id ? null : session.id);
                                                    }}
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>

                                                {/* Dropdown menu */}
                                                {menuOpen === session.id && (
                                                    <div className="absolute right-0 top-7 z-50 w-36 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                                        <button
                                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                startRename(session);
                                                            }}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                            Rename
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteSession(session.id);
                                                                setMenuOpen(null);
                                                            }}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
