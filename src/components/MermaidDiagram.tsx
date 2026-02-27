/**
 * MermaidDiagram — client-side component that renders a Mermaid.js string to SVG.
 * Dynamically imports mermaid to avoid SSR issues.
 */
"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
    chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!chart || !containerRef.current) return;
        setLoading(true);
        setError(null);

        let cancelled = false;

        (async () => {
            try {
                const mermaid = (await import("mermaid")).default;
                mermaid.initialize({
                    startOnLoad: false,
                    theme: "dark",
                    themeVariables: {
                        primaryColor: "#6366f1",
                        primaryTextColor: "#f1f5f9",
                        primaryBorderColor: "#818cf8",
                        lineColor: "#94a3b8",
                        secondaryColor: "#1e293b",
                        tertiaryColor: "#0f172a",
                        background: "#0f172a",
                        mainBkg: "#1e293b",
                        nodeBorder: "#6366f1",
                        clusterBkg: "#1e293b",
                        titleColor: "#f1f5f9",
                        edgeLabelBackground: "#1e293b",
                        fontFamily: "Inter, sans-serif",
                    },
                    flowchart: {
                        curve: "basis",
                        useMaxWidth: true,
                        rankSpacing: 150,
                        nodeSpacing: 100
                    },
                });

                const id = `mermaid-${Date.now()}`;
                const { svg } = await mermaid.render(id, chart.trim());
                if (!cancelled && containerRef.current) {
                    containerRef.current.innerHTML = svg;
                    // Make SVG responsive
                    const svgEl = containerRef.current.querySelector("svg");
                    if (svgEl) {
                        svgEl.style.width = "100%";
                        svgEl.style.height = "auto";
                        // Removed maxHeight to allow detailed diagrams to render fully 
                        // Set minWidth to prevent excessive squashing of complex diagrams
                        svgEl.style.minWidth = "800px";
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError(`Diagram render error: ${err instanceof Error ? err.message : String(err)}`);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [chart]);

    return (
        <div className="relative rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-4">
            <div className="mb-3 flex items-center gap-2">
                <span className="text-indigo-400">⬡</span>
                <h3 className="font-semibold text-slate-200">Architecture Diagram</h3>
                <span className="ml-auto rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
                    Mermaid.js
                </span>
            </div>

            {loading && (
                <div className="flex h-48 items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                        <span className="text-sm">Rendering diagram…</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-xl bg-red-950/50 p-4 text-sm text-red-400">
                    <p className="font-semibold">⚠ Could not render diagram</p>
                    <p className="mt-1 text-xs opacity-70">{error}</p>
                    <details className="mt-3">
                        <summary className="cursor-pointer text-xs">View raw Mermaid source</summary>
                        <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-300">
                            {chart}
                        </pre>
                    </details>
                </div>
            )}

            <div
                ref={containerRef}
                className={`overflow-x-auto ${loading ? "hidden" : ""}`}
                style={{ minHeight: error ? "0" : "200px" }}
            />
        </div>
    );
}
