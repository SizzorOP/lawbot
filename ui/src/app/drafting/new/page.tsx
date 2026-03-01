"use client";

import { useState } from "react";
import { Plus, Mic, Send } from "lucide-react";

export default function NewDraftPage() {
    const [promptText, setPromptText] = useState("");

    return (
        <div className="min-h-screen bg-white flex flex-col relative w-full items-center">

            {/* Top Stepper Navigation */}
            <div className="w-full border-b border-zinc-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex justify-center py-6 shrink-0">
                <div className="flex items-center gap-6 max-w-3xl w-full px-6">
                    {/* Step 1 */}
                    <div className="flex items-center gap-4">
                        <span className="text-[14px] font-bold text-zinc-900">1. Prompt Input</span>
                        <div className="w-8 h-[1px] bg-zinc-200"></div>
                    </div>
                    {/* Step 2 */}
                    <div className="flex items-center gap-4">
                        <span className="text-[14px] font-semibold text-zinc-400">2. Template Generation</span>
                        <div className="w-8 h-[1px] bg-zinc-100"></div>
                    </div>
                    {/* Step 3 */}
                    <div className="flex items-center gap-4">
                        <span className="text-[14px] font-semibold text-zinc-400">3. Prompt Query</span>
                    </div>
                </div>
            </div>

            {/* Main Content Workspace (Currently empty pushing input to bottom) */}
            <div className="flex-1 w-full flex flex-col items-center max-w-4xl px-4 py-8 relative">

                {/* 
                  This is the absolute positioned bottom floating text entry as per the design.
                  In a real chat loop, the main content div would map over messages.
                  Here, we lock the input box to the bottom area mirroring the screenshot exactly.
                */}
                <div className="absolute bottom-16 left-4 right-4 max-w-3xl mx-auto">
                    <div className="w-full bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all focus-within:shadow-md focus-within:border-zinc-300 p-4">
                        <textarea
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            placeholder="Ask anything..."
                            className="w-full min-h-[50px] max-h-[200px] resize-none outline-none text-[15px] text-zinc-800 placeholder:text-zinc-500 bg-transparent mb-4"
                            rows={2}
                        />
                        <div className="flex items-center justify-between mt-2 pt-2">
                            {/* Left Action Button (Attachment / Plus) */}
                            <button className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 transition-colors">
                                <Plus className="w-5 h-5" />
                            </button>

                            {/* Right Action Buttons (Voice & Submit) */}
                            <div className="flex items-center gap-2">
                                <button className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 transition-colors">
                                    <Mic className="w-4 h-4" />
                                </button>
                                <button className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-400 hover:bg-zinc-500 text-white transition-colors">
                                    <Send className="w-4 h-4 -ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
