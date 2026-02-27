"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { MessageList } from "@/components/MessageList";
import { ChatMessage } from "@/types";
import { Scale } from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const hasStarted = messages.length > 0;

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query })
      });

      if (!res.ok) throw new Error("API Request Failed");

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Here are your results:",
        metadata: {
          type: data.route,
          results: data.result?.results || data.result // Adapt based on exact backend shape
        }
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error communicating with the YuktiAI backend. Please make sure the FastAPI server is running."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-zinc-900 dark:text-zinc-100 selection:bg-blue-200 dark:selection:bg-blue-900">

      {/* Main Container */}
      <div className={`flex flex-col mx-auto px-4 transition-all duration-700 ease-in-out w-full
        ${hasStarted ? 'pt-8 items-start max-w-5xl h-[calc(100vh-2rem)]' : 'justify-center items-center h-screen'}`}>

        {/* Empty State / Logo */}
        {!hasStarted && (
          <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-200">
              <Scale className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-center">
              What are you researching?
            </h1>
            <p className="text-lg text-zinc-500 mb-8 max-w-lg text-center">
              Search judgments, check procedures, or ask legal questions referencing Indian Kanoon.
            </p>
          </div>
        )}

        <div className={`w-full transition-all duration-500 overflow-hidden ${hasStarted ? 'mb-24 flex-1 flex flex-col min-h-0' : 'max-w-3xl translate-y-0'}`}>
          {hasStarted && <MessageList messages={messages} />}
        </div>

        <div className={`w-full transition-all duration-500 
          ${hasStarted ? 'fixed bottom-0 right-0 left-[240px] bg-gradient-to-t from-zinc-50 via-zinc-50 to-transparent dark:from-zinc-950 dark:via-zinc-950 pb-8 pt-12 px-4 z-40' : ''}`}>
          <div className={hasStarted ? "max-w-4xl mx-auto w-full" : "w-full"}>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {!hasStarted && (
            <div className="mt-8 flex items-center justify-center gap-3 text-sm text-zinc-500 animate-in fade-in duration-1000 delay-300">
              <span className="flex items-center gap-1.5"><kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 font-mono text-xs">Enter</kbd> to search</span>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
              <span>Powered by <span className="text-zinc-700 dark:text-zinc-300 font-medium">GPT-4o</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

