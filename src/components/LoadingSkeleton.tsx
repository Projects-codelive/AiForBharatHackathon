/**
 * Loading skeleton — shown while the analysis runs (can take 30-60s).
 * Uses animated pulse blocks to keep the UI alive during heavy backend work.
 */
export function LoadingSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-6">
                <div className="mb-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-700" />
                    <div className="space-y-2">
                        <div className="h-4 w-48 rounded bg-slate-700" />
                        <div className="h-3 w-64 rounded bg-slate-700" />
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 rounded-xl bg-slate-700/50" />
                    ))}
                </div>
            </div>

            {/* Diagram skeleton */}
            <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-6">
                <div className="mb-4 h-5 w-48 rounded bg-slate-700" />
                <div className="h-72 rounded-xl bg-slate-700/50" />
            </div>

            {/* Cards row skeleton */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-slate-800/50 p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="h-5 w-20 rounded bg-slate-700" />
                            <div className="h-5 w-12 rounded bg-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-full rounded bg-slate-700" />
                            <div className="h-3 w-4/5 rounded bg-slate-700" />
                            <div className="h-3 w-3/5 rounded bg-slate-700" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-3 py-4 text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                <p className="text-sm">
                    Fetching GitHub data & running AI analysis… this may take 30–60 seconds
                </p>
            </div>
        </div>
    );
}
