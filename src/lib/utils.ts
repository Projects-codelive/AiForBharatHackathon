/**
 * Utility helpers for the GitHub Repo Analyzer
 */

/**
 * Parses a GitHub URL like https://github.com/owner/repo
 * and extracts the owner and repo name.
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
        const parsed = new URL(url.trim());
        if (parsed.hostname !== "github.com") return null;
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (parts.length < 2) return null;
        return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
    } catch {
        return null;
    }
}

/**
 * Truncates a string to a maximum byte/char length for LLM prompts.
 */
export function truncate(str: string, maxChars: number): string {
    if (str.length <= maxChars) return str;
    return str.slice(0, maxChars) + "\n... [TRUNCATED FOR CONTEXT LIMIT]";
}

/**
 * Formats a number with K/M suffix for display
 */
export function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

/**
 * Returns a color class for HTTP method badges
 */
export function methodColor(method: string): string {
    const map: Record<string, string> = {
        GET: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        POST: "bg-blue-500/20 text-blue-300 border-blue-500/40",
        PUT: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        PATCH: "bg-orange-500/20 text-orange-300 border-orange-500/40",
        DELETE: "bg-red-500/20 text-red-300 border-red-500/40",
        PAGE: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    };
    return map[method?.toUpperCase?.()] ?? "bg-slate-500/20 text-slate-300 border-slate-500/40";
}

/**
 * Returns a color for lifecycle role chips
 */
export function lifecycleColor(role: string): string {
    const r = role?.toLowerCase() ?? "";
    if (r.includes("auth")) return "bg-rose-900/40 text-rose-300";
    if (r.includes("crud") || r.includes("data")) return "bg-cyan-900/40 text-cyan-300";
    if (r.includes("render")) return "bg-violet-900/40 text-violet-300";
    if (r.includes("fetch")) return "bg-teal-900/40 text-teal-300";
    return "bg-slate-800 text-slate-400";
}
