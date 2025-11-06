import { Trophy, Medal, Award } from 'lucide-react';
import { LeaderboardEntry } from '@/types/api';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
}

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-400" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Award className="text-amber-600" size={24} />;
      default:
        return <span className="text-baseball-gray font-bold">#{rank}</span>;
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="section-heading">TOP SLUGGERS</h2>
          <p className="text-xl text-baseball-gray/70">
            The best players in the league
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Leaderboard Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 mb-4 px-6 text-sm font-semibold text-baseball-gray/60 uppercase">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Player</div>
            <div className="col-span-2 text-center">Wins</div>
            <div className="col-span-2 text-center">Home Runs</div>
            <div className="col-span-2 text-center">Win Rate</div>
            <div className="col-span-2 text-center">Level</div>
          </div>

          {/* Leaderboard Entries */}
          <div className="space-y-3">
            {leaderboard.slice(0, 10).map((entry) => (
              <div
                key={entry.playerId}
                className={`stat-card ${
                  entry.rank <= 3
                    ? 'border-baseball-yellow/40 bg-gradient-to-r from-baseball-yellow/5 to-transparent'
                    : ''
                } hover:scale-[1.02] transition-transform`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Rank */}
                  <div className="col-span-12 md:col-span-1 flex items-center justify-center md:justify-start">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Player Name */}
                  <div className="col-span-12 md:col-span-3">
                    <div className="font-display text-xl text-baseball-red">
                      {entry.playerName}
                    </div>
                    <div className="text-sm text-baseball-gray/60">
                      {entry.gamesPlayed} games played
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="col-span-3 md:col-span-2 text-center">
                    <div className="font-mono text-2xl font-bold text-baseball-green">
                      {entry.wins}
                    </div>
                    <div className="text-xs text-baseball-gray/60">Wins</div>
                  </div>

                  <div className="col-span-3 md:col-span-2 text-center">
                    <div className="font-mono text-2xl font-bold text-baseball-red">
                      {entry.totalHomeRuns}
                    </div>
                    <div className="text-xs text-baseball-gray/60">HRs</div>
                  </div>

                  <div className="col-span-3 md:col-span-2 text-center">
                    <div className="font-mono text-2xl font-bold text-baseball-yellow">
                      {entry.winRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-baseball-gray/60">Win Rate</div>
                  </div>

                  <div className="col-span-3 md:col-span-2 text-center">
                    <div className="font-mono text-2xl font-bold text-baseball-gray">
                      {entry.level}
                    </div>
                    <div className="text-xs text-baseball-gray/60">Level</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-baseball-gray/60">
              No leaderboard data available yet. Be the first to play!
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
