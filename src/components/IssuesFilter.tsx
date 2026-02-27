"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import type { FilteredIssue } from "@/lib/github";

interface IssuesFilterProps {
    repoUrl: string;
}

const DEFAULT_LABELS = ["good first issue", "feature request", "performance", "bug"];

export function IssuesFilter({ repoUrl }: IssuesFilterProps) {
    const [loading, setLoading] = useState(false);
    const [issues, setIssues] = useState<FilteredIssue[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Filters State
    const [type, setType] = useState<"issue" | "pr">("issue");
    const [sort, setSort] = useState<"created-desc" | "created-asc" | "comments-desc">("created-desc");
    const [selectedLabels, setSelectedLabels] = useState<string[]>(DEFAULT_LABELS);

    // Available labels to choose from (could be dynamic, but starting with a solid list)
    const availableLabels = [
        "bug",
        "documentation",
        "duplicate",
        "enhancement",
        "feature request",
        "good first issue",
        "help wanted",
        "invalid",
        "question",
        "wontfix",
        "performance"
    ];

    const toggleLabel = (label: string) => {
        if (selectedLabels.includes(label)) {
            setSelectedLabels(selectedLabels.filter(l => l !== label));
        } else {
            setSelectedLabels([...selectedLabels, label]);
        }
    };

    const fetchIssues = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                repoUrl,
                type,
                sort,
            });
            if (selectedLabels.length > 0) {
                params.set("labels", selectedLabels.join(","));
            }

            const res = await fetch(`/api/issues?${params.toString()}`);
            if (!res.ok) {
                throw new Error("Failed to fetch issues");
            }
            const data = await res.json();
            setIssues(data.issues || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when filters change
    useEffect(() => {
        if (repoUrl) {
            fetchIssues();
        }
    }, [repoUrl, type, sort, selectedLabels]);

    return (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5 mt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                    <span className="text-emerald-400">◎</span>
                    <h3 className="font-semibold text-slate-200">Issue Explorer</h3>
                </div>

                {/* Desktop Filters Row */}
                <div className="flex flex-wrap items-center gap-3">

                    {/* Type Filter */}
                    <div className="relative group">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="appearance-none bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer pr-8"
                        >
                            <option value="issue">Issues</option>
                            <option value="pr">Pull Requests</option>
                        </select>
                        <svg className="w-4 h-4 absolute right-2.5 top-2 pointer-events-none text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>

                    {/* Sort Filter */}
                    <div className="relative group">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as any)}
                            className="appearance-none bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer pr-8"
                        >
                            <option value="created-desc">Newest</option>
                            <option value="created-asc">Oldest</option>
                            <option value="comments-desc">Most Commented</option>
                        </select>
                        <svg className="w-4 h-4 absolute right-2.5 top-2 pointer-events-none text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </div>

            {/* Labels Filter Section */}
            <div className="mb-6">
                <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Filter by Labels</p>
                <div className="flex flex-wrap gap-2">
                    {availableLabels.map(label => {
                        const isSelected = selectedLabels.includes(label);
                        return (
                            <button
                                key={label}
                                onClick={() => toggleLabel(label)}
                                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${isSelected
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="rounded-xl bg-red-950/50 p-4 text-sm text-red-400 text-center border border-red-900/50 mb-4">
                    <p>Failed to load issues: {error}</p>
                </div>
            )}

            {/* Issues List Container */}
            <div className="relative min-h-[200px] border border-slate-800 rounded-xl bg-slate-900/30 overflow-hidden">

                {loading ? (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                        <span className="text-xs text-slate-400 mt-2">Fetching from GitHub...</span>
                    </div>
                ) : issues.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-slate-500 text-sm">
                        No {type === "issue" ? 'issues' : 'pull requests'} found matching these filters.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {issues.map(issue => (
                            <a
                                key={issue.id}
                                href={issue.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-3 p-4 hover:bg-slate-800/50 transition-colors group"
                            >
                                {/* Icon */}
                                <div className="mt-1 flex-shrink-0">
                                    {issue.state === "open" ? (
                                        <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                            <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-purple-500" viewBox="0 0 16 16" fill="currentColor">
                                            <path fillRule="evenodd" d="M1.5 8a6.5 6.5 0 0110.65-5.09.75.75 0 001.07-1.05A8 8 0 1016 8a.75.75 0 00-1.5 0 6.5 6.5 0 01-1.39 4.02l1.64 1.64a.75.75 0 001.06-1.06l-1.64-1.64A6.5 6.5 0 011.5 8zm2.47-2.47a.75.75 0 111.06-1.06l4.03 4.03-1.06 1.06-4.03-4.03z" />
                                        </svg>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        <h4 className="text-slate-200 font-medium group-hover:text-emerald-400 transition-colors">
                                            {issue.title}
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5 mt-1 sm:mt-0">
                                            {issue.labels.map(l => (
                                                <span
                                                    key={l.name}
                                                    className="px-1.5 py-0.5 rounded-full text-[10px] font-medium border"
                                                    style={{
                                                        backgroundColor: `#${l.color}20`,
                                                        borderColor: `#${l.color}40`,
                                                        color: `#${l.color}`
                                                    }}
                                                >
                                                    {l.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                                        <span>#{issue.number}</span>
                                        <span>opened {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
                                        <span>by {issue.user.login}</span>
                                        {issue.comments > 0 && (
                                            <>
                                                <span className="text-slate-700 mx-1">•</span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                    {issue.comments}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Author Avatar */}
                                <div className="hidden sm:block flex-shrink-0">
                                    <img
                                        src={issue.user.avatar_url}
                                        alt={issue.user.login}
                                        className="w-6 h-6 rounded-full border border-slate-700"
                                        loading="lazy"
                                    />
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
