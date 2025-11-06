import { TrendingUp, Users, Target, Trophy, MapPin, Clock } from 'lucide-react';
import { GlobalStats } from '@/types/api';

interface LiveStatsProps {
  stats: GlobalStats;
}

export default function LiveStats({ stats }: LiveStatsProps) {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <section className="py-20 bg-baseball-gray text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="section-heading text-baseball-yellow">
            LIVE GAME INTELLIGENCE
          </h2>
          <p className="text-xl text-white/80">
            Real-time statistics from the Sandlot Sluggers community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Players */}
          <div className="stat-card bg-white/10 backdrop-blur-sm border-baseball-yellow/30">
            <div className="flex items-start justify-between mb-4">
              <Users className="text-baseball-yellow" size={32} />
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                LIVE
              </span>
            </div>
            <div className="text-4xl font-display text-baseball-yellow mb-2">
              {formatNumber(stats.activePlayers)}
            </div>
            <div className="text-white/80">Active Players (24h)</div>
          </div>

          {/* Total Players */}
          <div className="stat-card bg-white/10 backdrop-blur-sm border-baseball-yellow/30">
            <div className="flex items-start justify-between mb-4">
              <TrendingUp className="text-baseball-yellow" size={32} />
            </div>
            <div className="text-4xl font-display text-baseball-yellow mb-2">
              {formatNumber(stats.totalPlayers)}
            </div>
            <div className="text-white/80">Total Players</div>
          </div>

          {/* Games Today */}
          <div className="stat-card bg-white/10 backdrop-blur-sm border-baseball-yellow/30">
            <div className="flex items-start justify-between mb-4">
              <Trophy className="text-baseball-yellow" size={32} />
            </div>
            <div className="text-4xl font-display text-baseball-yellow mb-2">
              {formatNumber(stats.gamesPlayedToday)}
            </div>
            <div className="text-white/80">Games Played Today</div>
          </div>

          {/* Total Home Runs */}
          <div className="stat-card bg-white/10 backdrop-blur-sm border-baseball-yellow/30">
            <div className="flex items-start justify-between mb-4">
              <Target className="text-baseball-yellow" size={32} />
            </div>
            <div className="text-4xl font-display text-baseball-yellow mb-2">
              {formatNumber(stats.totalHomeRuns)}
            </div>
            <div className="text-white/80">Total Home Runs</div>
          </div>

          {/* Most Popular Stadium */}
          <div className="stat-card bg-white/10 backdrop-blur-sm border-baseball-yellow/30">
            <div className="flex items-start justify-between mb-4">
              <MapPin className="text-baseball-yellow" size={32} />
            </div>
            <div className="text-2xl font-display text-baseball-yellow mb-2">
              {stats.mostPopularStadium.name}
            </div>
            <div className="text-white/80">
              Most Popular Stadium ({stats.mostPopularStadium.percentage}%)
            </div>
          </div>

          {/* Average Game Length */}
          <div className="stat-card bg-white/10 backdrop-blur-sm border-baseball-yellow/30">
            <div className="flex items-start justify-between mb-4">
              <Clock className="text-baseball-yellow" size={32} />
            </div>
            <div className="text-4xl font-display text-baseball-yellow mb-2">
              {stats.averageGameLength}m
            </div>
            <div className="text-white/80">Avg. Game Length</div>
          </div>
        </div>

        {/* Additional aggregated stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-5xl font-display text-baseball-yellow mb-2">
              {formatNumber(stats.totalGamesPlayed)}
            </div>
            <div className="text-white/80">Total Games Played</div>
          </div>
          <div>
            <div className="text-5xl font-display text-baseball-yellow mb-2">
              {formatNumber(stats.totalHits)}
            </div>
            <div className="text-white/80">Total Hits</div>
          </div>
          <div>
            <div className="text-5xl font-display text-baseball-yellow mb-2">
              {formatNumber(stats.totalRuns)}
            </div>
            <div className="text-white/80">Total Runs Scored</div>
          </div>
        </div>

        <div className="mt-8 text-center text-white/60 text-sm">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </div>
      </div>
    </section>
  );
}
