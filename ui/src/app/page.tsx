"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Download,
    Briefcase,
    Search,
    PenTool,
    Headphones,
    CalendarDays,
    BookOpen,
    ExternalLink,
    Languages,
} from "lucide-react";

// ─── News Data ──────────────────────────────────────────────────────────
const newsItems = [
    {
        id: "news-1",
        title: "Madras High Court directs MS Dhoni to deposit ₹10 lakh in defamation case",
        summary: "In a defamation suit filed by MS Dhoni over IPL fixing allegations, the Madras High Court directed him to deposit ₹10 lakh. The amount is not a penalty, but intended to cover transcription and translation of audio-video evidence required for trial.",
        date: "February 20, 2026",
        image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=500&fit=crop",
        analysePrompt: "In a defamation suit filed by MS Dhoni over IPL fixing allegations, the Madras High Court directed him to deposit ₹10 lakh. The amount is not a penalty, but intended to cover transcription and translation of audio-video evidence required for trial.\nWho should bear the cost of processing evidence in such cases — the plaintiff, defendant, or the court?",
    },
    {
        id: "news-2",
        title: "Supreme Court clarifies guidelines on bail for economic offences",
        summary: "The Supreme Court of India laid down fresh guidelines distinguishing between economic offences and regular criminal cases for the purpose of bail, emphasizing that blanket denial of bail in economic offences violates fundamental rights under Article 21.",
        date: "February 18, 2026",
        image: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=400&h=500&fit=crop",
        analysePrompt: "The Supreme Court of India laid down fresh guidelines distinguishing between economic offences and regular criminal cases for the purpose of bail.\nAnalyse the legal precedents on bail in economic offences. How does Article 21 interact with denial of bail? What tests should courts apply when deciding bail in economic offence matters?",
    },
    {
        id: "news-3",
        title: "Delhi HC issues landmark ruling on tenants' rights during redevelopment",
        summary: "The Delhi High Court ruled that tenants cannot be evicted during building redevelopment without providing adequate alternative accommodation or compensation, strengthening tenant protections under the Delhi Rent Control Act.",
        date: "February 15, 2026",
        image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=500&fit=crop",
        analysePrompt: "The Delhi High Court ruled that tenants cannot be evicted during building redevelopment without providing adequate alternative accommodation or compensation.\nWhat are the current tenant protection mechanisms under the Delhi Rent Control Act? How does this ruling impact landlord-tenant disputes during redevelopment projects?",
    },
    {
        id: "news-4",
        title: "NCLAT upholds CCI penalty on tech giant for anti-competitive practices",
        summary: "The National Company Law Appellate Tribunal upheld a ₹1,337 crore penalty imposed by the Competition Commission of India on a major tech company for abusing its dominant position in the smartphone ecosystem market.",
        date: "February 12, 2026",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=500&fit=crop",
        analysePrompt: "NCLAT upheld a ₹1,337 crore penalty imposed by CCI on a major tech company for abusing its dominant position in the smartphone ecosystem market.\nWhat constitutes 'abuse of dominant position' under the Competition Act, 2002? What are the legal remedies available to companies facing such penalties?",
    },
];

// ─── Quick Prompts Data ─────────────────────────────────────────────────
const quickPrompts = [
    { title: "Create Case", icon: Briefcase, desc: "Everything about your case, organised in one place, so nothing slips through the cracks.", href: "/cases" },
    { title: "Start your Research", icon: Search, desc: "Search case law or upload documents and get clear, relevant answers without delay.", href: "/research" },
    { title: "Draft Documents", icon: PenTool, desc: "Describe what you need in plain language and receive a strong first draft to refine.", href: "/drafting" },
    { title: "Translate Document", icon: Languages, desc: "Translate documents accurately while preserving the exact legal language.", href: "/translation" },
    { title: "Summarise Meeting", icon: Headphones, desc: "Long meeting or call? Instantly extract key points, summaries, and action items.", href: "/meeting" },
    { title: "Add Event", icon: CalendarDays, desc: "Hearing or deadline approaching? Add it once and get timely reminders automatically.", href: "/calendar" },
    { title: "Browse Legal Library", icon: BookOpen, desc: "Find relevant acts, statutes, and judgments quickly without endless back and forth.", href: "/library" },
];

export default function DashboardPage() {
    const router = useRouter();

    const handleAnalyseLegally = (prompt: string) => {
        // Navigate to Research page with the pre-generated prompt in the URL
        const encodedPrompt = encodeURIComponent(prompt);
        router.push(`/research?prompt=${encodedPrompt}`);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            {/* Center Scrollable Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200">
                {/* Header Area */}
                <div className="flex items-center justify-between px-8 py-10 border-b border-zinc-100/50">
                    <div>
                        <h1 className="text-[28px] font-semibold text-zinc-900 font-serif tracking-tight mb-2">
                            Welcome chotu lal
                        </h1>
                        <p className="text-[13px] text-zinc-500 font-medium">Last worked on</p>
                    </div>
                    <button className="flex items-center gap-2 bg-[#2d2d2d] hover:bg-black text-white px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        Install App
                    </button>
                </div>

                {/* Main Content Areas */}
                <div className="p-8 max-w-4xl space-y-6">

                    {/* Onboarding Cards Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-serif font-bold text-[16px] text-zinc-900">How to use YuktiAI</h3>
                                <button className="text-[13px] font-medium text-zinc-900 hover:text-blue-600">Play video</button>
                            </div>
                            <p className="text-[13px] text-zinc-500 leading-relaxed">Watch this 3min video on how to use YuktiAI and how it can help you better your workflow</p>
                        </div>
                        <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-serif font-bold text-[16px] text-zinc-900">Take guided tour</h3>
                                <button className="text-zinc-400 hover:text-zinc-900 transition-colors -mt-1">
                                    <span className="text-xl">›</span>
                                </button>
                            </div>
                            <p className="text-[13px] text-zinc-500 leading-relaxed">View through all the different features of YuktiAI and how you can make the best use of it</p>
                        </div>
                    </div>

                    <div className="my-6 p-4 rounded-xl bg-blue-50/40 text-center border border-blue-50/50">
                        <p className="text-[13.5px] font-medium text-zinc-800">Not sure where to begin? Open a sample case to see the YuktiAI workflow in action.</p>
                    </div>

                    {/* Case Management Card */}
                    <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
                            <h2 className="text-[16px] font-bold text-zinc-900 font-serif tracking-tight">Case Management</h2>
                            <Briefcase className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="p-16 flex flex-col items-center justify-center">
                            <p className="text-[13px] text-zinc-400 mb-6">No cases found</p>
                            <Link
                                href="/cases"
                                className="text-[13px] font-semibold text-zinc-900 hover:text-blue-600 transition-colors"
                            >
                                Create Case
                            </Link>
                        </div>
                    </div>

                    {/* ─── News in Spotlight ──────────────────────────────────── */}
                    <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
                            <h2 className="text-[16px] font-bold text-zinc-900 font-serif tracking-tight">News in Spotlight</h2>
                        </div>

                        <div className="divide-y divide-zinc-100">
                            {newsItems.map((news) => (
                                <div key={news.id} className="p-6 flex gap-6 group">
                                    {/* News Thumbnail */}
                                    <div className="w-[200px] h-[220px] rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={news.image}
                                            alt={news.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* News Content */}
                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div>
                                            <h3 className="text-[15px] font-bold text-zinc-900 mb-3 leading-snug">
                                                {news.title}
                                            </h3>
                                            <p className="text-[13px] text-zinc-500 leading-relaxed mb-3">
                                                {news.summary}
                                            </p>
                                            <button className="text-[13px] font-semibold text-blue-700 hover:text-blue-800 transition-colors">
                                                Read more
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between pt-3">
                                            <span className="text-[12px] text-zinc-400">{news.date}</span>
                                            <button
                                                onClick={() => handleAnalyseLegally(news.analysePrompt)}
                                                className="px-5 py-2 bg-[#2d2d2d] hover:bg-black text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm"
                                            >
                                                Analyse Legally
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Right Sidebar for Quick Prompts */}
            <div className="w-[300px] xl:w-[320px] bg-white border-l border-zinc-100 flex-shrink-0 h-screen overflow-y-auto px-6 py-8 scrollbar-thin scrollbar-thumb-zinc-200">
                <h3 className="font-serif text-[18px] font-semibold text-zinc-900 tracking-tight mb-6 mt-2">Quick Prompts</h3>
                <div className="space-y-4">
                    {quickPrompts.map((prompt, idx) => (
                        <Link
                            key={idx}
                            href={prompt.href}
                            className="block p-[18px] bg-white border border-[#e5e7eb] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-zinc-300 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50/50 flex items-center justify-center text-blue-800">
                                        <prompt.icon className="w-[18px] h-[18px]" strokeWidth={2} />
                                    </div>
                                    <h4 className="text-[14px] font-bold text-zinc-900 group-hover:text-blue-700 transition-colors">{prompt.title}</h4>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                            </div>
                            <p className="text-[13px] text-zinc-500 leading-relaxed pr-2">
                                {prompt.desc}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
