"use client";

import { useState, useEffect } from "react";
import { calendarApi, casesApi, CalendarEventItem, CaseItem } from "@/lib/api";
import {
    CalendarDays,
    Plus,
    X,
    Loader2,
    Clock,
    MapPin,
    Briefcase,
    Trash2,
    Filter,
} from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEventItem[]>([]);
    const [cases, setCases] = useState<CaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [typeFilter, setTypeFilter] = useState<string>("");

    const [formData, setFormData] = useState({
        title: "",
        event_type: "hearing",
        event_date: "",
        case_id: "",
        description: "",
        location: "",
    });
    const [creating, setCreating] = useState(false);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (typeFilter) params.event_type = typeFilter;
            const data = await calendarApi.list(params);
            setEvents(data);
        } catch (err) {
            console.error("Failed to load events:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadCases = async () => {
        try {
            const data = await casesApi.list();
            setCases(data);
        } catch (err) {
            console.error("Failed to load cases:", err);
        }
    };

    useEffect(() => {
        loadEvents();
        loadCases();
    }, [typeFilter]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.event_date) return;
        setCreating(true);
        try {
            const payload: any = {
                title: formData.title,
                event_type: formData.event_type,
                event_date: formData.event_date,
                description: formData.description || undefined,
                location: formData.location || undefined,
            };
            if (formData.case_id) payload.case_id = formData.case_id;
            await calendarApi.create(payload);
            setFormData({
                title: "",
                event_type: "hearing",
                event_date: "",
                case_id: "",
                description: "",
                location: "",
            });
            setShowForm(false);
            loadEvents();
        } catch (err) {
            console.error("Failed to create event:", err);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm("Delete this event?")) return;
        try {
            await calendarApi.delete(eventId);
            loadEvents();
        } catch (err) {
            console.error("Failed to delete event:", err);
        }
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const eventTypeColors: Record<string, { dot: string; badge: string }> = {
        hearing: {
            dot: "bg-blue-500",
            badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
        },
        deadline: {
            dot: "bg-red-500",
            badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
        },
        reminder: {
            dot: "bg-amber-500",
            badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
        },
    };

    // Group events by date
    const groupedEvents: Record<string, CalendarEventItem[]> = {};
    events.forEach((e) => {
        const dateKey = new Date(e.event_date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        if (!groupedEvents[dateKey]) groupedEvents[dateKey] = [];
        groupedEvents[dateKey].push(e);
    });

    return (
        <div className="min-h-screen p-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                            <CalendarDays className="w-5 h-5 text-white" />
                        </div>
                        Calendar
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 ml-[52px]">
                        Track hearings, deadlines, and reminders
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Event
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 w-fit mb-6">
                {["", "hearing", "deadline", "reminder"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setTypeFilter(f)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${typeFilter === f
                                ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                    >
                        {f === "" ? "All" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
                    </button>
                ))}
            </div>

            {/* Events Timeline */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
            ) : Object.keys(groupedEvents).length === 0 ? (
                <div className="text-center py-20 text-zinc-400">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No events scheduled</p>
                    <p className="text-sm mt-1">Add your first event to get started</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedEvents).map(([dateKey, dateEvents]) => (
                        <div key={dateKey}>
                            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                                {dateKey}
                            </h3>
                            <div className="space-y-2">
                                {dateEvents.map((event) => {
                                    const colors =
                                        eventTypeColors[event.event_type] || eventTypeColors.hearing;
                                    return (
                                        <div
                                            key={event.id}
                                            className="flex items-start justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-5 py-4 group hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`w-3 h-3 rounded-full mt-1 shrink-0 ${colors.dot}`}
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                                                        {event.title}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                        <span className="flex items-center gap-1 text-xs text-zinc-400">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDateTime(event.event_date)}
                                                        </span>
                                                        <span
                                                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${colors.badge}`}
                                                        >
                                                            {event.event_type}
                                                        </span>
                                                        {event.case_title && (
                                                            <Link
                                                                href={`/cases/${event.case_id}`}
                                                                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
                                                            >
                                                                <Briefcase className="w-3 h-3" />
                                                                {event.case_title}
                                                            </Link>
                                                        )}
                                                        {event.location && (
                                                            <span className="flex items-center gap-1 text-xs text-zinc-400">
                                                                <MapPin className="w-3 h-3" />
                                                                {event.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {event.description && (
                                                        <p className="text-xs text-zinc-400 mt-1.5">{event.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="p-2 text-zinc-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Event Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                New Event
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-zinc-400 hover:text-zinc-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Final Arguments"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={formData.event_type}
                                        onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                    >
                                        <option value="hearing">Hearing</option>
                                        <option value="deadline">Deadline</option>
                                        <option value="reminder">Reminder</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Date & Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.event_date}
                                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Link to Case
                                </label>
                                <select
                                    value={formData.case_id}
                                    onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                >
                                    <option value="">No case linked</option>
                                    {cases.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Courtroom 3, Saket Courts"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    placeholder="Additional notes..."
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                                >
                                    {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Create Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
