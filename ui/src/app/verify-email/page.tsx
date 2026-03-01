"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4">
            <div className="w-full max-w-[420px] text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-950/50 rounded-2xl mb-6">
                    <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white font-serif tracking-tight mb-3">
                    Check your email
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
                    We&apos;ve sent a verification link to your email address.
                    Please click the link to verify your account and get started with YuktiAI.
                </p>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 mb-8">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Didn&apos;t receive the email? Check your spam folder or try signing up again.
                    </p>
                </div>
                <Link
                    href="/login"
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Back to sign in
                </Link>
            </div>
        </div>
    );
}
