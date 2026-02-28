/**
 * Dashboard page — protected by middleware.
 * Client component to handle form state, API calls, and result display.
 *
 * State is persisted to sessionStorage so navigating away (e.g., to analyze-route)
 * and pressing Back instantly restores the last result without any API call.
 */
"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ResultsDashboard } from "@/components/ResultsDashboard";

const SESSION_KEY = "dashboard_state";

interface DashboardState {
    url: string;
    result: { cached: boolean; data: any } | null;
}

function saveToSession(state: DashboardState) {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch { /* quota exceeded — ignore */ }
}

function loadFromSession(): DashboardState | null {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = useState<{ cached: boolean; data: any } | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    // ── On mount: restore last session state so Back navigation is instant ──
    useEffect(() => {
        const saved = loadFromSession();
        if (saved) {
            if (saved.url) setUrl(saved.url);
            if (saved.result) setResult(saved.result);
        }
        setHydrated(true);
    }, []);

    // ── Persist to sessionStorage whenever url or result changes ────────────
    useEffect(() => {
        if (!hydrated) return;
        saveToSession({ url, result });
    }, [url, result, hydrated]);

    async function runAnalysis(forceRefresh = false) {
        if (!url.trim()) return;
        setError(null);

        if (forceRefresh) {
            setIsRefreshing(true);
        } else {
            setLoading(true);
            setResult(null);
        }

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoUrl: url.trim(), forceRefresh }),
            });

            const json = await res.json();

            if (!res.ok) {
                setError(json.error ?? "Analysis failed. Please try again.");
                return;
            }

            setResult({ cached: json.cached, data: json.data });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Network error. Please try again.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }

    function handleForceRefresh() {
        runAnalysis(true);
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* ── Navbar ── */}
            <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold shadow-lg shadow-indigo-500/20">
                            🔍
                        </div>
                        <span className="font-bold text-white">RepoLens</span>
                    </div>

                    {/* User menu */}
                    {session?.user && (
                        <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={session.user.image ?? ""}
                                alt={session.user.name ?? ""}
                                className="h-8 w-8 rounded-full border border-white/10"
                            />
                            <span className="hidden text-sm text-slate-400 sm:block">
                                {session.user.name}
                            </span>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="rounded-lg border border-white/10 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
                            >
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-10">
                {/* ── Input card ── */}
                <div className="mb-8 rounded-2xl border border-white/[0.08] bg-slate-800/60 p-6 backdrop-blur-sm">
                    <h1 className="mb-1 text-xl font-bold text-white">Analyze a GitHub Repository</h1>
                    <p className="mb-5 text-sm text-slate-400">
                        Paste a public GitHub repository URL to get an AI-powered deep analysis.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                <svg className="h-4 w-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                            </div>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && runAnalysis()}
                                placeholder="https://github.com/Projects-codelive/FarmFlow"
                                className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none ring-0 transition focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <button
                            onClick={() => runAnalysis()}
                            disabled={loading || !url.trim()}
                            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-105 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Analyzing…
                                </>
                            ) : (
                                <>
                                    <span>✦</span>
                                    Analyze Repo
                                </>
                            )}
                        </button>
                    </div>

                    {/* Example URLs */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs text-slate-600">Try:</span>
                        {[
                            "https://github.com/vercel/next.js",
                            "https://github.com/shadcn-ui/ui",
                            "https://github.com/Projects-codelive/FarmFlow",
                        ].map((example) => (
                            <button
                                key={example}
                                onClick={() => setUrl(example)}
                                className="rounded-full bg-slate-700/50 px-2.5 py-0.5 text-xs text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
                            >
                                {example.replace("https://github.com/", "")}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Error state ── */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/50 px-5 py-4">
                        <span className="mt-0.5 text-red-400">⚠</span>
                        <div>
                            <p className="font-semibold text-red-300">Analysis Error</p>
                            <p className="mt-0.5 text-sm text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {/* ── Loading state ── */}
                {loading && <LoadingSkeleton />}

                {/* ── Results ── */}
                {!loading && result && (
                    <ResultsDashboard
                        data={result.data}
                        cached={result.cached}
                        onForceRefresh={handleForceRefresh}
                        isRefreshing={isRefreshing}
                    />
                )}

                {/* ── Empty state ── */}
                {!loading && !result && !error && hydrated && (
                    <div className="flex flex-col items-center justify-center py-24 text-center text-slate-600">
                        <div className="mb-4 text-6xl opacity-30">🔍</div>
                        <p className="text-lg font-medium text-slate-500">Enter a GitHub URL above to start</p>
                        <p className="mt-1 text-sm">The analysis takes 30–60 seconds on first run</p>
                    </div>
                )}
            </main>
        </div>
    );
}
