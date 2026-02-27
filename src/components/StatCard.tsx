/**
 * Stat Card — displays a single metric (stars, forks, etc.)
 */
interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
}

export function StatCard({ label, value, icon, color = "from-blue-500/20 to-blue-600/10" }: StatCardProps) {
    return (
        <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${color} p-5 backdrop-blur-sm`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-white">{value}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-2 text-2xl">{icon}</div>
            </div>
        </div>
    );
}
