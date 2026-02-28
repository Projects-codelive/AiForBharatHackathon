"use client";

import Link from "next/link";

const PLANS = [
    {
        id: "starter",
        name: "Starter",
        price: "₹299",
        period: "/month",
        description: "Perfect for individual developers exploring open-source.",
        color: "from-slate-700/60 to-slate-800/60",
        border: "border-white/10",
        badge: null,
        routes: "10 route analyses / day",
        features: [
            "10 deep route analyses per day",
            "Mermaid flow diagrams",
            "Step-by-step execution traces",
            "MongoDB result caching",
            "Email support",
        ],
        cta: "border-white/20 bg-slate-700/60 text-white hover:bg-slate-600/80",
    },
    {
        id: "pro",
        name: "Pro",
        price: "₹799",
        period: "/month",
        description: "For teams and power users who need unlimited insights.",
        color: "from-indigo-600/20 to-purple-700/20",
        border: "border-indigo-500/50",
        badge: "Most Popular",
        routes: "Unlimited route analyses",
        features: [
            "Unlimited deep route analyses",
            "Priority LLM processing",
            "Advanced Mermaid diagrams",
            "Team shared cache (cross-user)",
            "API access (coming soon)",
            "Priority support",
        ],
        cta: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105",
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "₹2,499",
        period: "/month",
        description: "Custom limits, private hosting, and dedicated support.",
        color: "from-amber-600/10 to-orange-700/10",
        border: "border-amber-500/30",
        badge: null,
        routes: "Unlimited + private model",
        features: [
            "Everything in Pro",
            "Bring your own Groq / OpenAI key",
            "Private MongoDB instance",
            "SSO / GitHub Org login",
            "Dedicated account manager",
            "SLA guarantee",
        ],
        cta: "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
    },
];

interface SubscriptionGateProps {
    route: string;
}

export function SubscriptionGate({ route }: SubscriptionGateProps) {
    return (
        <div className="mx-auto max-w-5xl px-4 py-12">
            {/* Header */}
            <div className="mb-12 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 ring-1 ring-indigo-500/40 text-3xl shadow-lg shadow-indigo-500/10">
                    🔒
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white">
                    You&apos;ve used all your free credits
                </h2>
                <p className="mt-3 text-base text-slate-400 max-w-lg mx-auto">
                    You&apos;ve analyzed{" "}
                    <code className="rounded-md bg-indigo-500/10 px-2 py-0.5 font-mono text-sm text-indigo-300 ring-1 ring-indigo-500/20">
                        {route}
                    </code>{" "}
                    and other routes using your free Groq tokens.
                    Upgrade to continue with unlimited deep route analysis.
                </p>

                {/* Free tier info */}
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/60 px-4 py-2 text-sm text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                    Free plan: ~2 route analyses per session
                </div>
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative flex flex-col rounded-2xl border bg-gradient-to-b ${plan.color} ${plan.border} p-6 shadow-xl transition-all duration-300 hover:scale-[1.02]`}
                    >
                        {/* Badge */}
                        {plan.badge && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-indigo-500/30">
                                    {plan.badge}
                                </span>
                            </div>
                        )}

                        {/* Plan name */}
                        <div className="mb-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                {plan.name}
                            </p>
                            <div className="mt-1 flex items-end gap-1">
                                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                <span className="mb-1 text-sm text-slate-400">{plan.period}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
                        </div>

                        {/* Routes highlight */}
                        <div className="mb-5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
                            <p className="text-sm font-semibold text-slate-200">🗺 {plan.routes}</p>
                        </div>

                        {/* Features */}
                        <ul className="mb-8 flex-1 space-y-2.5">
                            {plan.features.map((f) => (
                                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                                    <span className="mt-0.5 text-emerald-400 shrink-0">✓</span>
                                    {f}
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <Link
                            href={`/payment?plan=${plan.id}`}
                            className={`block w-full rounded-xl border px-4 py-3 text-center text-sm font-bold transition-all duration-200 ${plan.cta}`}
                        >
                            Proceed to Pay →
                        </Link>
                    </div>
                ))}
            </div>

            {/* Footer note */}
            <p className="mt-8 text-center text-xs text-slate-600">
                Prices in INR · Cancel anytime · No hidden fees · Secure payment via Razorpay
            </p>
        </div>
    );
}
