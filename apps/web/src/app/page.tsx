import { SportsSummary } from "@/components/apps/sports-summary";
import { fetchSportsSummary } from "@/lib/fetch-sports-summary";

export const revalidate = 120;

export default async function HomePage() {
  const summary = await fetchSportsSummary();

  return (
    <main className="container py-20">
      <section className="space-y-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-blaze-400">Cloudflare Native</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">BlazeSportsIntel</h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Real-time intelligence for every team, powered by Workers, D1, and KV. This scaffold is wired
            for Cloudflare Pages so we can ship blazing-fast experiences from day one.
          </p>
        </header>
        <SportsSummary summary={summary} />
      </section>
    </main>
  );
}
