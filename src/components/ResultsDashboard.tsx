/**
 * ResultsDashboard — orchestrates the display of all analysis data.
 * Receives the full analysis payload and renders all panels.
 */
"use client";

import { StatCard } from "./StatCard";
import { MermaidDiagram } from "./MermaidDiagram";
import { RouteCard } from "./RouteCard";
import { CommitTimeline } from "./CommitTimeline";
import { IssuesFilter } from "./IssuesFilter";
import { formatNumber } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnalysisData = Record<string, any>;

interface ResultsDashboardProps {
    data: AnalysisData;
    cached: boolean;
    onForceRefresh: () => void;
    isRefreshing: boolean;
}

export function ResultsDashboard({ data, cached, onForceRefresh, isRefreshing }: ResultsDashboardProps) {
    const { metadata, commits, contributors, repoStatus, techStack, llmAnalysis, analyzedAt } = data;

    return (
        <div className="space-y-6">
            {/* ── Cache badge + Force Refresh ── */}
            {cached && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                    <span className="text-amber-400">⚡</span>
                    <p className="flex-1 text-sm text-amber-300">
                        Showing cached result from{" "}
                        <strong>{new Date(analyzedAt).toLocaleString()}</strong>
                    </p>
                    <button
                        onClick={onForceRefresh}
                        disabled={isRefreshing}
                        className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/30 disabled:opacity-50"
                    >
                        {isRefreshing ? "Refreshing…" : "🔄 Force Refresh"}
                    </button>
                </div>
            )}

            {/* ── Repo Header ── */}
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-6">
                <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-bold text-white">{metadata?.fullName}</h2>
                            {metadata?.isPrivate && (
                                <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                                    Private
                                </span>
                            )}
                            {metadata?.language && (
                                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300 border border-indigo-500/30">
                                    {metadata.language}
                                </span>
                            )}
                        </div>
                        {metadata?.description && (
                            <p className="mt-1.5 text-sm text-slate-400">{metadata.description}</p>
                        )}
                        {metadata?.topics?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {metadata.topics.map((t: string) => (
                                    <span key={t} className="rounded-full bg-slate-700/80 px-2 py-0.5 text-xs text-slate-300">
                                        #{t}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <a
                        href={`https://github.com/${metadata?.fullName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600 flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        View on GitHub
                    </a>
                </div>

                {/* Stats row */}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard
                        label="Stars"
                        value={formatNumber(metadata?.stars ?? 0)}
                        icon="⭐"
                        color="from-yellow-500/20 to-yellow-600/5"
                    />
                    <StatCard
                        label="Forks"
                        value={formatNumber(metadata?.forks ?? 0)}
                        icon="🍴"
                        color="from-green-500/20 to-green-600/5"
                    />
                    <StatCard
                        label="Total Commits"
                        value={formatNumber(commits?.total ?? 0)}
                        icon="📝"
                        color="from-blue-500/20 to-blue-600/5"
                    />
                    <StatCard
                        label="Contributors"
                        value={contributors?.length ?? 0}
                        icon="👥"
                        color="from-purple-500/20 to-purple-600/5"
                    />
                </div>
            </div>

            {/* ── Overall Flow ── */}
            {llmAnalysis?.overallFlow && (
                <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-6">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-200">
                        <span className="text-indigo-400">✦</span>
                        AI Overview
                    </h3>
                    <p className="leading-relaxed text-slate-300">{llmAnalysis.overallFlow}</p>
                </div>
            )}

            {/* ── Architecture Diagram ── */}
            {llmAnalysis?.architectureMermaid && (
                <MermaidDiagram chart={llmAnalysis.architectureMermaid} />
            )}

            {/* ── Commits + Contributors ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {commits?.recent?.length > 0 && (
                    <CommitTimeline commits={commits.recent} total={commits.total} />
                )}

                {/* Contributors */}
                {contributors?.length > 0 && (
                    <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-5">
                        <h3 className="mb-4 font-semibold text-slate-200">👥 Top Contributors</h3>
                        <div className="space-y-3">
                            {contributors.slice(0, 10).map((c: AnalysisData, i: number) => (
                                <a
                                    key={i}
                                    href={c.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-700/50"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={c.avatar_url}
                                        alt={c.login}
                                        className="h-9 w-9 rounded-full border border-white/10"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-200">{c.login}</p>
                                        <div className="mt-0.5 flex items-center gap-1">
                                            <div
                                                className="h-1.5 rounded-full bg-indigo-500"
                                                style={{
                                                    width: `${Math.min(100, (c.contributions / (contributors[0]?.contributions ?? 1)) * 100)}%`,
                                                    minWidth: "8px",
                                                    maxWidth: "120px",
                                                }}
                                            />
                                            <span className="text-[11px] text-slate-500">{c.contributions} commits</span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Repo Status ── */}
            {repoStatus && (
                <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">
                    <h3 className="mb-4 font-semibold text-slate-200">📊 Repository Status</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl bg-slate-700/40 p-3 text-center">
                            <p className="text-2xl font-bold text-green-400">{repoStatus.openIssues}</p>
                            <p className="mt-0.5 text-xs text-slate-400">Open Issues</p>
                        </div>
                        <div className="rounded-xl bg-slate-700/40 p-3 text-center">
                            <p className="text-2xl font-bold text-slate-400">{repoStatus.closedIssues}</p>
                            <p className="mt-0.5 text-xs text-slate-400">Closed Issues</p>
                        </div>
                        <div className="rounded-xl bg-slate-700/40 p-3 text-center">
                            <p className="text-2xl font-bold text-blue-400">{repoStatus.openPRs}</p>
                            <p className="mt-0.5 text-xs text-slate-400">Open PRs</p>
                        </div>
                        <div className="rounded-xl bg-slate-700/40 p-3 text-center">
                            <p className="text-2xl font-bold text-purple-400">{repoStatus.closedPRs}</p>
                            <p className="mt-0.5 text-xs text-slate-400">Closed PRs</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tech Stack ── */}
            {(techStack?.frontend || techStack?.backend) && (
                <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">
                    <h3 className="mb-4 font-semibold text-slate-200 flex items-center gap-2">
                        <span>🧩</span> Tech Stack
                    </h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Frontend */}
                        {techStack.frontend && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-medium text-slate-300">Frontend</h4>
                                    <span className="rounded-full bg-slate-700/80 px-2 py-0.5 text-[10px] text-slate-400">
                                        {techStack.frontend.source}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {[...techStack.frontend.dependencies, ...techStack.frontend.devDependencies]
                                        .slice(0, 20)
                                        .map((dep: string) => (
                                            <span
                                                key={dep}
                                                className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2 py-1 text-xs font-mono text-indigo-300"
                                            >
                                                {dep}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Backend */}
                        {techStack.backend && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-medium text-slate-300">Backend</h4>
                                    <span className="rounded-full bg-slate-700/80 px-2 py-0.5 text-[10px] text-slate-400">
                                        {techStack.backend.source}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {[...techStack.backend.dependencies, ...techStack.backend.devDependencies]
                                        .slice(0, 20)
                                        .map((dep: string) => (
                                            <span
                                                key={dep}
                                                className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-mono text-emerald-300"
                                            >
                                                {dep}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Issue Explorer ── */}
            <IssuesFilter repoUrl={data.repoUrl} />

            {/* ── Routes ── */}
            {llmAnalysis?.routes?.length > 0 && (
                <div>
                    <div className="mb-4 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-200">🗺 Route Analysis</h3>
                        <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs text-indigo-300">
                            {llmAnalysis.routes.length} routes
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {llmAnalysis.routes.map((route: any, i: number) => (
                            <RouteCard key={i} repoUrl={data.repoUrl} routeIndex={i} {...route} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
