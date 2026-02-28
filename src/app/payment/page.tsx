"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ─── Plan definitions ─────────────────────────────────────────────────────────
const PLANS: Record<string, { name: string; price: string; features: string[] }> = {
    starter: {
        name: "Starter",
        price: "₹299",
        features: ["10 deep route analyses/day", "Mermaid diagrams", "Email support"],
    },
    pro: {
        name: "Pro",
        price: "₹799",
        features: ["Unlimited analyses", "Priority processing", "Team cache", "Priority support"],
    },
    enterprise: {
        name: "Enterprise",
        price: "₹2,499",
        features: ["Everything in Pro", "Bring your own API key", "Dedicated manager", "SLA"],
    },
};

// ─── Payment form (frontend blueprint) ───────────────────────────────────────

function PaymentContent() {
    const searchParams = useSearchParams();
    const planId = searchParams.get("plan") ?? "pro";
    const plan = PLANS[planId] ?? PLANS.pro;

    const [step, setStep] = useState<"details" | "confirm" | "success">("details");
    const [form, setForm] = useState({ name: "", email: "", card: "", expiry: "", cvv: "" });
    const [loading, setLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handlePay(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        // Simulated processing delay — backend will replace this
        setTimeout(() => {
            setLoading(false);
            setStep("success");
        }, 2000);
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Navbar */}
            <header className="border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold">
                            🔍
                        </div>
                        <span className="font-bold text-white">RepoLens</span>
                    </div>
                    <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-200 transition">
                        ← Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-12">
                {step === "success" ? (
                    /* ── Success state ── */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-4xl ring-1 ring-emerald-500/30">
                            ✓
                        </div>
                        <h1 className="text-3xl font-extrabold text-white">Payment Successful!</h1>
                        <p className="mt-3 text-slate-400">
                            Welcome to <strong className="text-white">RepoLens {plan.name}</strong>. Your account has been upgraded.
                        </p>
                        <Link
                            href="/dashboard"
                            className="mt-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105"
                        >
                            Go to Dashboard →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">

                        {/* ── Left: order summary ── */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-6">
                                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">Order Summary</p>
                                <h2 className="text-2xl font-extrabold text-white">RepoLens {plan.name}</h2>
                                <div className="mt-4 flex items-end gap-1">
                                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                    <span className="mb-1 text-sm text-slate-400">/month</span>
                                </div>
                                <ul className="mt-5 space-y-2.5">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                                            <span className="text-emerald-400 shrink-0">✓</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>Subtotal</span><span>{plan.price}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-400 mt-1">
                                        <span>GST (18%)</span>
                                        <span>+{planId === "starter" ? "₹54" : planId === "pro" ? "₹144" : "₹450"}</span>
                                    </div>
                                    <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm font-bold text-white">
                                        <span>Total</span>
                                        <span>{planId === "starter" ? "₹353" : planId === "pro" ? "₹943" : "₹2,949"}</span>
                                    </div>
                                </div>

                                {/* Trust badges */}
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {["🔒 SSL Secured", "💳 Razorpay", "↩ Cancel Anytime"].map(b => (
                                        <span key={b} className="rounded-full bg-slate-700/60 px-2.5 py-1 text-[11px] text-slate-400">
                                            {b}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Plan switcher */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                {Object.entries(PLANS).map(([id, p]) => (
                                    <Link
                                        key={id}
                                        href={`/payment?plan=${id}`}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${id === planId
                                                ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                                                : "border-white/10 bg-slate-800/40 text-slate-400 hover:text-slate-200"
                                            }`}
                                    >
                                        {p.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* ── Right: payment form ── */}
                        <div className="lg:col-span-3">
                            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-6">
                                <p className="mb-5 text-sm font-bold text-white">Payment Details</p>
                                <form onSubmit={handlePay} className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-400">Full Name</label>
                                        <input
                                            name="name" value={form.name} onChange={handleChange} required
                                            placeholder="Shyam Sundar"
                                            className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-400">Email Address</label>
                                        <input
                                            name="email" type="email" value={form.email} onChange={handleChange} required
                                            placeholder="you@example.com"
                                            className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>

                                    {/* Card number */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-400">Card Number</label>
                                        <div className="relative">
                                            <input
                                                name="card" value={form.card} onChange={handleChange} required
                                                placeholder="4242  4242  4242  4242"
                                                maxLength={19}
                                                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 pr-12"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">💳</span>
                                        </div>
                                    </div>

                                    {/* Expiry + CVV */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Expiry Date</label>
                                            <input
                                                name="expiry" value={form.expiry} onChange={handleChange} required
                                                placeholder="MM / YY" maxLength={7}
                                                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-slate-400">CVV</label>
                                            <input
                                                name="cvv" value={form.cvv} onChange={handleChange} required
                                                placeholder="•••" maxLength={4} type="password"
                                                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 disabled:opacity-60 disabled:hover:scale-100"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Processing…
                                            </>
                                        ) : (
                                            <>🔒 Pay {planId === "starter" ? "₹353" : planId === "pro" ? "₹943" : "₹2,949"} Securely</>
                                        )}
                                    </button>

                                    {/* Disclaimer */}
                                    <p className="text-center text-[11px] text-slate-600">
                                        This is a frontend blueprint. Actual payment processing will be integrated via Razorpay.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
        }>
            <PaymentContent />
        </Suspense>
    );
}
