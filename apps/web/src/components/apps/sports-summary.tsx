import type { SportsSummary } from "@/lib/fetch-sports-summary";

interface SportsSummaryProps {
  summary: SportsSummary;
}

export function SportsSummary({ summary }: SportsSummaryProps) {
  return (
    <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blaze-500/20 backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Sports Intelligence Pulse</h2>
        <span className="text-xs uppercase tracking-widest text-slate-400">
          {summary.generatedAt.toLocaleString()}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {summary.entries.map((entry) => (
          <article
            key={`${entry.sport}-${entry.metric}`}
            className="rounded-xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-blaze-400/40"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-blaze-300">{entry.sport}</p>
            <h3 className="text-xl font-semibold text-white">{entry.metric}</h3>
            <p className="text-3xl font-bold text-blaze-200">{entry.value}</p>
            <p className="mt-2 text-xs text-slate-400">{entry.context}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
