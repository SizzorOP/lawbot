"use client";

import { useState, useRef, useEffect } from "react";
import {
    BookOpen,
    Search,
    Filter,
    ChevronDown,
    X,
    Calendar as CalendarIcon
} from "lucide-react";

export default function LegalLibraryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    // Filter State
    const [activeTab, setActiveTab] = useState<"legislative" | "court">("legislative");

    // Legislative Acts Form State
    const [actType, setActType] = useState("");
    const [status, setStatus] = useState("");
    const [year, setYear] = useState("");
    const [language, setLanguage] = useState("");

    // Court Judgements Form State
    const [court, setCourt] = useState("");
    const [outcome, setOutcome] = useState("");
    const [judgeNameInput, setJudgeNameInput] = useState("");
    const [judges, setJudges] = useState<string[]>([]);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Click outside to close filter
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleApplyFilters = () => {
        console.log("Applying Search:", searchQuery);
        if (activeTab === "legislative") {
            console.log("Legislative Filters:", { actType, status, year, language });
        } else {
            console.log("Court Filters:", { court, outcome, judges, dateFrom, dateTo });
        }
        setIsFilterOpen(false);
    };

    const handleAddJudge = () => {
        if (judgeNameInput.trim() && !judges.includes(judgeNameInput.trim())) {
            setJudges([...judges, judgeNameInput.trim()]);
            setJudgeNameInput("");
        }
    };

    const handleRemoveJudge = (name: string) => {
        setJudges(judges.filter(j => j !== name));
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-16 px-4">
            {/* Header */}
            <div className="w-full max-w-4xl flex flex-col">
                <div className="flex items-center gap-3 mb-8 ml-2">
                    <BookOpen className="w-6 h-6 text-zinc-900" />
                    <h1 className="text-2xl font-bold font-serif text-zinc-900 tracking-tight">Legal Library</h1>
                </div>

                {/* Search Bar Container */}
                <div className="relative flex items-center gap-3 w-full">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search for Acts, Judgements.."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-6 pr-12 py-3.5 bg-white border border-zinc-200 rounded-full text-[15px] outline-none focus:border-zinc-400 transition-colors shadow-sm text-zinc-800 placeholder:text-zinc-400"
                        />
                        <Search className="w-4 h-4 text-zinc-400 absolute right-6 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all ${isFilterOpen
                                ? "bg-zinc-100 border-zinc-300 text-zinc-800"
                                : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 hover:bg-zinc-50 shadow-sm"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                        </button>

                        {/* Filter Popover */}
                        {isFilterOpen && (
                            <div className="absolute top-16 right-0 w-[420px] bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

                                {/* Tabs */}
                                <div className="flex bg-zinc-50 p-1 border-b border-zinc-100">
                                    <button
                                        onClick={() => setActiveTab("legislative")}
                                        className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${activeTab === "legislative"
                                            ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/60"
                                            : "text-zinc-500 hover:text-zinc-700"
                                            }`}
                                    >
                                        Legislative Acts
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("court")}
                                        className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${activeTab === "court"
                                            ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/60"
                                            : "text-zinc-500 hover:text-zinc-700"
                                            }`}
                                    >
                                        Court Judgements
                                    </button>
                                </div>

                                {/* Form Body */}
                                <div className="p-6 space-y-5">
                                    {activeTab === "legislative" ? (
                                        <>
                                            <div className="space-y-1.5">
                                                <label className="text-[12px] font-semibold text-zinc-800">Act Type</label>
                                                <div className="relative">
                                                    <select
                                                        value={actType} onChange={e => setActType(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-600 appearance-none outline-none focus:border-zinc-400"
                                                    >
                                                        <option value="" disabled>Select Document Type</option>
                                                        <option value="central">Central Act</option>
                                                        <option value="state">State Act</option>
                                                        <option value="ordinance">Ordinance</option>
                                                    </select>
                                                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[12px] font-semibold text-zinc-800">Status</label>
                                                <div className="relative">
                                                    <select
                                                        value={status} onChange={e => setStatus(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-600 appearance-none outline-none focus:border-zinc-400"
                                                    >
                                                        <option value="" disabled>Select Status</option>
                                                        <option value="in_force">In Force</option>
                                                        <option value="repealed">Repealed</option>
                                                    </select>
                                                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[12px] font-semibold text-zinc-800">Year of Enactment</label>
                                                <div className="relative">
                                                    <select
                                                        value={year} onChange={e => setYear(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-600 appearance-none outline-none focus:border-zinc-400"
                                                    >
                                                        <option value="" disabled>Select Year</option>
                                                        {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                                            <option key={y} value={y}>{y}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[12px] font-semibold text-zinc-800">Language</label>
                                                <div className="relative">
                                                    <select
                                                        value={language} onChange={e => setLanguage(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-600 appearance-none outline-none focus:border-zinc-400"
                                                    >
                                                        <option value="" disabled>Select Language</option>
                                                        <option value="english">English</option>
                                                        <option value="hindi">Hindi</option>
                                                    </select>
                                                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-1.5">
                                                <label className="text-[12px] font-semibold text-zinc-800">Court / Tribunal</label>
                                                <div className="relative">
                                                    <select
                                                        value={court} onChange={e => setCourt(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-600 appearance-none outline-none focus:border-zinc-400"
                                                    >
                                                        <option value="" disabled>Select courts...</option>
                                                        <option value="supreme_court">Supreme Court of India</option>
                                                        <option value="delhi_hc">Delhi High Court</option>
                                                        <option value="bombay_hc">Bombay High Court</option>
                                                        <option value="calcutta_hc">Calcutta High Court</option>
                                                        <option value="madras_hc">Madras High Court</option>
                                                        <option value="karnataka_hc">Karnataka High Court</option>
                                                        <option value="kerala_hc">Kerala High Court</option>
                                                        <option value="gujarat_hc">Gujarat High Court</option>
                                                        <option value="rajasthan_hc">Rajasthan High Court</option>
                                                        <option value="madhya_pradesh_hc">Madhya Pradesh High Court</option>
                                                        <option value="allahabad_hc">Allahabad High Court</option>
                                                        <option value="andhra_pradesh_hc">Andhra Pradesh High Court</option>
                                                        <option value="telangana_hc">Telangana High Court</option>
                                                        <option value="patna_hc">Patna High Court</option>
                                                        <option value="orissa_hc">Orissa High Court</option>
                                                        <option value="chhattisgarh_hc">Chhattisgarh High Court</option>
                                                        <option value="jharkhand_hc">Jharkhand High Court</option>
                                                        <option value="uttarakhand_hc">Uttarakhand High Court</option>
                                                        <option value="himachal_pradesh_hc">Himachal Pradesh High Court</option>
                                                        <option value="punjab_and_haryana_hc">Punjab and Haryana High Court</option>
                                                        <option value="jammu_and_kashmir_hc">Jammu and Kashmir High Court</option>
                                                    </select>
                                                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[12px] font-semibold text-zinc-800">Case Outcome</label>
                                                <div className="relative">
                                                    <select
                                                        value={outcome} onChange={e => setOutcome(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-600 appearance-none outline-none focus:border-zinc-400"
                                                    >
                                                        <option value="" disabled>Select outcome...</option>
                                                        <option value="allowed">Allowed</option>
                                                        <option value="dismissed">Dismissed</option>
                                                        <option value="disposed">Disposed</option>
                                                    </select>
                                                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[12px] font-semibold text-zinc-800">Judge Name</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Search judges..."
                                                        value={judgeNameInput}
                                                        onChange={e => setJudgeNameInput(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleAddJudge()}
                                                        className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:border-zinc-400 placeholder:text-zinc-400 text-zinc-800"
                                                    />
                                                    <button
                                                        onClick={handleAddJudge}
                                                        className="px-5 py-2.5 bg-white border border-zinc-800 rounded-lg text-[13px] font-medium text-zinc-800 hover:bg-zinc-50 transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                {judges.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {judges.map(j => (
                                                            <div key={j} className="flex items-center gap-1.5 bg-zinc-100 px-2.5 py-1.5 rounded text-[12px] text-zinc-700">
                                                                {j}
                                                                <button onClick={() => handleRemoveJudge(j)} className="text-zinc-400 hover:text-zinc-600">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[12px] font-semibold text-zinc-800">Decision Date</label>
                                                <div className="flex gap-3">
                                                    <div className="flex-1 space-y-1">
                                                        <label className="text-[10px] text-zinc-500">From</label>
                                                        <div className="relative">
                                                            <CalendarIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                            <input
                                                                type="date"
                                                                value={dateFrom}
                                                                onChange={e => setDateFrom(e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-600 outline-none focus:border-zinc-400"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <label className="text-[10px] text-zinc-500">To</label>
                                                        <div className="relative">
                                                            <CalendarIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                            <input
                                                                type="date"
                                                                value={dateTo}
                                                                onChange={e => setDateTo(e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-600 outline-none focus:border-zinc-400"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                </div>

                                {/* Footer */}
                                <div className="flex justify-between gap-3 p-6 pt-2">
                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="flex-1 py-3 text-[13px] font-semibold text-zinc-800 border border-zinc-800 rounded-xl hover:bg-zinc-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleApplyFilters}
                                        className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-800 text-white text-[13px] font-semibold rounded-xl shadow-sm transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
