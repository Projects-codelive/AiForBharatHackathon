/**
 * RouteCard — displays a single route with method badge and LLM-generated details.
 */
import { methodColor, lifecycleColor } from "@/lib/utils";

interface RouteCardProps {
    path: string;
    method: string;
    functionality: string;
    contribution: string;
    lifecycleRole: string;
}

export function RouteCard({ path, method, functionality, contribution, lifecycleRole }: RouteCardProps) {
    return (
        <div className="group flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-slate-800/60 p-5 transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-800">
            {/* Header row */}
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider ${methodColor(method)}`}
                >
                    {method?.toUpperCase()}
                </span>
                <code className="flex-1 overflow-x-auto rounded-lg bg-slate-900/80 px-3 py-1 text-sm font-mono text-slate-200">
                    {path}
                </code>
            </div>

            {/* Functionality */}
            <div>
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    What it does
                </p>
                <p className="text-sm leading-relaxed text-slate-300">{functionality}</p>
            </div>

            {/* Contribution */}
            <div>
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Project contribution
                </p>
                <p className="text-sm leading-relaxed text-slate-400">{contribution}</p>
            </div>

            {/* Lifecycle chip */}
            <div>
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${lifecycleColor(lifecycleRole)}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                    {lifecycleRole}
                </span>
            </div>
        </div>
    );
}
