/**
 * CommitTimeline — shows recent commits as a vertical timeline.
 */
interface Commit {
    sha: string;
    message: string;
    author: string;
    date: string;
    url: string;
}

interface CommitTimelineProps {
    commits: Commit[];
    total: number;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
}

export function CommitTimeline({ commits, total }: CommitTimelineProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-200">
                    ⎇ Recent Commits
                </h3>
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-400">
                    {total.toLocaleString()} total
                </span>
            </div>

            <div className="relative space-y-0 overflow-hidden">
                {/* Vertical line */}
                <div className="absolute left-3 top-0 h-full w-px bg-slate-700" />

                {commits.slice(0, 15).map((commit, i) => (
                    <div key={i} className="relative flex gap-4 pb-4 last:pb-0">
                        {/* Dot */}
                        <div className="relative z-10 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500 ring-2 ring-slate-900" style={{ marginLeft: "8px" }} />

                        <div className="flex-1 min-w-0">
                            <a
                                href={commit.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm leading-snug text-slate-300 hover:text-indigo-300 truncate"
                            >
                                {commit.message}
                            </a>
                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                                <code className="rounded bg-slate-700/60 px-1.5 py-0.5 font-mono text-slate-400">
                                    {commit.sha}
                                </code>
                                <span>{commit.author}</span>
                                <span>·</span>
                                <span>{commit.date ? timeAgo(commit.date) : ""}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
