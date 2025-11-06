import Hero from '@/components/Hero';
import LiveStats from '@/components/LiveStats';
import Leaderboard from '@/components/Leaderboard';
import CharacterRoster from '@/components/CharacterRoster';
import StadiumShowcase from '@/components/StadiumShowcase';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import {
  fetchGlobalStats,
  fetchLeaderboard,
} from '@/lib/api';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  // Fetch data server-side with parallel requests
  const [globalStats, leaderboardData] = await Promise.all([
    fetchGlobalStats(),
    fetchLeaderboard(10, 'wins'),
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section id="hero">
        <Hero />
      </section>

      {/* Live Stats Dashboard */}
      <section id="stats">
        <LiveStats stats={globalStats} />
      </section>

      {/* Game Features */}
      <section id="features">
        <Features />
      </section>

      {/* Character Roster */}
      <section id="characters">
        <CharacterRoster />
      </section>

      {/* Stadium Showcase */}
      <section id="stadiums">
        <StadiumShowcase />
      </section>

      {/* Leaderboard */}
      <section id="leaderboard">
        <Leaderboard leaderboard={leaderboardData.leaderboard} />
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-baseball-red to-baseball-red/80 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-5xl md:text-6xl mb-6">
            READY TO STEP UP TO THE PLATE?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of players hitting home runs in Sandlot Sluggers
          </p>
          <a href="/" className="btn-primary inline-flex items-center gap-2 text-xl">
            LAUNCH GAME →
          </a>
          <p className="mt-6 text-white/70 text-sm">
            Also available as PWA - Add to Home Screen for fullscreen experience
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
