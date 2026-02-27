/**
 * Login / Landing page.
 * Shows a dark hero with animated gradient, feature list, and GitHub sign-in button.
 * If the user is already signed in, redirect to /dashboard.
 */
import { auth } from "@/lib/auth";
import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

const FEATURES = [
  { icon: "🏗", title: "Architecture Diagrams", desc: "AI-generated Mermaid.js diagrams from your file tree" },
  { icon: "🗺", title: "Route Breakdown", desc: "Every API endpoint and page explained in plain English" },
  { icon: "📊", title: "Commit Timeline", desc: "Visual history of commits and contributor activity" },
  { icon: "🧩", title: "Tech Stack Detection", desc: "Automatic parsing of package.json, requirements.txt, and more" },
  { icon: "⚡", title: "Smart Caching", desc: "Results saved to MongoDB — analyze once, access instantly" },
  { icon: "✦", title: "AI-Powered", desc: "Powered by Google Gemini for deep code understanding" },
];

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-16">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-purple-600/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-600/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Hero */}
      <div className="text-center max-w-3xl">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          AI-Powered Repository Analysis
        </div>

        {/* Title */}
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Understand Any Repo{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Instantly
          </span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-slate-400 max-w-2xl mx-auto">
          Paste any GitHub URL and get a complete AI analysis — architecture diagrams, route
          breakdowns, commit history, contributor activity, and tech stack, all in one page.
        </p>

        {/* Sign-in button */}
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-lg shadow-white/10 transition-all duration-200 hover:bg-slate-100 hover:shadow-white/20 hover:scale-105 active:scale-95"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sign in with GitHub
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-600">
          No private repo access required · Only public repo analysis
        </p>
      </div>

      {/* Feature grid */}
      <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-white/[0.06] bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-white/10 hover:bg-slate-800/60"
          >
            <div className="mb-2 text-2xl">{f.icon}</div>
            <h3 className="font-semibold text-slate-200">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
