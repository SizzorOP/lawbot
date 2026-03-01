"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Moon, Sun, Lock, User, Shield } from "lucide-react";

export default function SettingsPage() {
    const { profile, refreshProfile } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");
    const [passwordErr, setPasswordErr] = useState("");
    const [saving, setSaving] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMsg("");
        setPasswordErr("");

        if (newPassword !== confirmNewPassword) {
            setPasswordErr("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordErr("Password must be at least 6 characters.");
            return;
        }

        setSaving(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setPasswordErr(error.message);
        } else {
            setPasswordMsg("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        }
        setSaving(false);
    };

    const experienceLabels: Record<string, string> = {
        less_than_1: "Less than 1 year",
        "1_to_3": "1 to 3 years",
        "3_to_5": "3 to 5 years",
        "5_plus": "5+ years",
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-900">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
                {/* Header */}
                <div className="px-8 py-10 border-b border-zinc-100 dark:border-zinc-800">
                    <h1 className="text-[28px] font-semibold text-zinc-900 dark:text-white font-serif tracking-tight mb-1">
                        Settings
                    </h1>
                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium">
                        Manage your account preferences
                    </p>
                </div>

                <div className="p-8 max-w-2xl space-y-8">

                    {/* Profile Info */}
                    <div className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-700">
                            <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                            <h2 className="text-[15px] font-bold text-zinc-900 dark:text-white">Profile</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Full Name</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{profile?.full_name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Role</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{profile?.role || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Experience</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{profile?.experience ? experienceLabels[profile.experience] || profile.experience : "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Phone</p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{profile?.phone || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-700">
                            {theme === "dark" ? <Moon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" /> : <Sun className="w-4 h-4 text-zinc-500" />}
                            <h2 className="text-[15px] font-bold text-zinc-900 dark:text-white">Appearance</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Dark Mode</p>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Switch between light and dark theme</p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${theme === "dark" ? "bg-blue-600" : "bg-zinc-200"}`}
                                >
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 flex items-center justify-center ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`}
                                    >
                                        {theme === "dark" ? <Moon className="w-3 h-3 text-blue-600" /> : <Sun className="w-3 h-3 text-amber-500" />}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-700">
                            <Lock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                            <h2 className="text-[15px] font-bold text-zinc-900 dark:text-white">Change Password</h2>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                            {passwordErr && (
                                <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-3">
                                    {passwordErr}
                                </div>
                            )}
                            {passwordMsg && (
                                <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm rounded-xl px-4 py-3">
                                    {passwordMsg}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                                    placeholder="Minimum 6 characters"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                                    placeholder="Re-enter new password"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 bg-zinc-900 dark:bg-white hover:bg-black dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                            >
                                {saving ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>

                    {/* Security Info */}
                    <div className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-700">
                            <Shield className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                            <h2 className="text-[15px] font-bold text-zinc-900 dark:text-white">Security</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Your account is secured with Supabase Auth. Email verification is required for all accounts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
