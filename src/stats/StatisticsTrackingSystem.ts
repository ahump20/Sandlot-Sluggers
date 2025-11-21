/**
 * StatisticsTrackingSystem.ts
 * Comprehensive statistics tracking with advanced analytics and sabermetrics
 */

export interface GameEvent {
  timestamp: Date;
  inning: number;
  outs: number;
  batterName: string;
  pitcherName: string;
  eventType:
    | 'single'
    | 'double'
    | 'triple'
    | 'homerun'
    | 'walk'
    | 'strikeout'
    | 'groundout'
    | 'flyout'
    | 'error'
    | 'fielders_choice'
    | 'hit_by_pitch'
    | 'sacrifice';
  rbi: number;
  runScored: boolean;
  exitVelocity?: number;
  launchAngle?: number;
  hitDistance?: number;
  pitchType?: string;
  pitchSpeed?: number;
}

export interface BattingStats {
  // Basic stats
  plateAppearances: number;
  atBats: number;
  hits: number;
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  walks: number;
  strikeouts: number;
  hitByPitch: number;
  sacrifices: number;
  rbis: number;
  runs: number;
  stolenBases: number;
  caughtStealing: number;

  // Advanced stats (calculated)
  battingAverage: number; // AVG
  onBasePercentage: number; // OBP
  sluggingPercentage: number; // SLG
  onBasePlusSlugging: number; // OPS
  isolatedPower: number; // ISO
  babip: number; // Batting Average on Balls In Play
  walkRate: number; // BB%
  strikeoutRate: number; // K%
  walkToStrikeoutRatio: number; // BB/K

  // Sabermetrics
  weightedOnBaseAverage: number; // wOBA
  weightedRunsCreatedPlus: number; // wRC+
  battingRunsValue: number; // Runs above average
  winProbabilityAdded: number; // WPA

  // Quality of contact
  averageExitVelocity: number;
  averageLaunchAngle: number;
  hardHitRate: number; // % of balls hit >95 mph
  barrelRate: number; // % of ideal contact

  // Situational
  runnersInScoringPosition: {
    atBats: number;
    hits: number;
    avg: number;
  };
  clutchPerformance: number; // Performance in high leverage
  versusPitcherHand: {
    vsRHP: { atBats: number; hits: number; avg: number };
    vsLHP: { atBats: number; hits: number; avg: number };
  };
}

export interface PitchingStats {
  // Basic stats
  gamesPlayed: number;
  gamesStarted: number;
  inningsPitched: number;
  wins: number;
  losses: number;
  saves: number;
  holds: number;
  blownSaves: number;
  hitsAllowed: number;
  runsAllowed: number;
  earnedRuns: number;
  walksAllowed: number;
  strikeouts: number;
  homeRunsAllowed: number;
  hitBatsmen: number;

  // Advanced stats
  earnedRunAverage: number; // ERA
  whip: number; // (Walks + Hits) / IP
  strikeoutsPerNine: number; // K/9
  walksPerNine: number; // BB/9
  hitsPerNine: number; // H/9
  strikeoutToWalkRatio: number; // K/BB
  homeRunsPerNine: number; // HR/9

  // Sabermetrics
  fieldingIndependentPitching: number; // FIP
  expectedFieldingIndependentPitching: number; // xFIP
  skillInteractiveEarnedRunAverage: number; // SIERA
  leftOnBasePercentage: number; // LOB%
  strandsRatedPercentage: number; // Strand rate
  winProbabilityAdded: number; // WPA

  // Pitch quality
  averageFastballVelocity: number;
  averageSpinRate: number;
  strikePercentage: number;
  swingingStrikeRate: number; // SwStr%
  contactRate: number;
  zoneRate: number; // % pitches in strike zone
  chaseRate: number; // % swings outside zone

  // Pitch usage
  pitchMix: {
    fastball: number;
    curveball: number;
    slider: number;
    changeup: number;
  };

  // Situational
  versusLeftHanded: {
    atBats: number;
    hits: number;
    avg: number;
  };
  versusRightHanded: {
    atBats: number;
    hits: number;
    avg: number;
  };
  firstPitchStrikes: number;
  firstPitchStrikeRate: number;
}

export interface FieldingStats {
  // Basic stats
  gamesPlayed: number;
  innings: number;
  putouts: number;
  assists: number;
  errors: number;
  doublePlays: number;

  // Advanced stats
  fieldingPercentage: number; // (PO + A) / (PO + A + E)
  rangeFactory: number; // RF/9 = (PO + A) * 9 / Inn
  zoneRating: number; // Plays made / plays available
  ultimateZoneRating: number; // UZR - runs above average
  defensiveRunsSaved: number; // DRS
  outfielderArmStrength: number; // Assist rate
  catcherFramingRuns: number; // Framing runs saved
  catcherThrowingRunning: number; // CS runs above avg
  catcherBlockingRuns: number; // Blocking runs saved
}

export interface BaseRunningStats {
  // Basic stats
  attempts: number;
  stolenBases: number;
  caughtStealing: number;
  stolenBasePercentage: number;

  // Advanced stats
  extraBaseTaken: number; // Advancing extra base on hits
  extraBasePercentage: number;
  baseRunningRuns: number; // BsR - runs above average
  firstToThirdOnSingle: number;
  firstToHomeOnDouble: number;
  groundedIntoDoublePlays: number;
}

export interface TeamStats {
  teamName: string;
  season: number;
  wins: number;
  losses: number;
  winPercentage: number;

  // Team batting
  teamBatting: BattingStats;

  // Team pitching
  teamPitching: PitchingStats;

  // Team fielding
  teamFielding: FieldingStats;

  // Team baserunning
  teamBaserunning: BaseRunningStats;

  // Advanced team metrics
  runsScored: number;
  runsAllowed: number;
  runDifferential: number;
  pythagoreanWinPercentage: number; // Expected W% based on runs
  teamWAR: number; // Wins above replacement
  teamOPS: number;
  teamERA: number;

  // Splits
  homeRecord: { wins: number; losses: number };
  awayRecord: { wins: number; losses: number };
  vsLeftHandedPitchers: { wins: number; losses: number };
  vsRightHandedPitchers: { wins: number; losses: number };
  oneRunGames: { wins: number; losses: number };
  extraInningGames: { wins: number; losses: number };

  // Streaks
  currentStreak: { type: 'W' | 'L'; count: number };
  longestWinStreak: number;
  longestLoseStreak: number;

  // Monthly performance
  monthlyRecords: Array<{
    month: string;
    wins: number;
    losses: number;
  }>;
}

export interface PlayerGameLog {
  date: Date;
  opponent: string;
  batting?: {
    atBats: number;
    hits: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    rbis: number;
    walks: number;
    strikeouts: number;
  };
  pitching?: {
    inningsPitched: number;
    hitsAllowed: number;
    runsAllowed: number;
    earnedRuns: number;
    walksAllowed: number;
    strikeouts: number;
    decision: 'W' | 'L' | 'ND' | 'S';
  };
  fielding?: {
    putouts: number;
    assists: number;
    errors: number;
  };
}

export interface Leaderboard {
  category:
    | 'batting_average'
    | 'home_runs'
    | 'rbis'
    | 'stolen_bases'
    | 'ops'
    | 'era'
    | 'wins'
    | 'strikeouts'
    | 'saves'
    | 'whip';
  leaders: Array<{
    rank: number;
    playerName: string;
    teamName: string;
    value: number;
  }>;
  lastUpdated: Date;
}

export class StatisticsTrackingSystem {
  private playerBattingStats: Map<string, BattingStats> = new Map();
  private playerPitchingStats: Map<string, PitchingStats> = new Map();
  private playerFieldingStats: Map<string, FieldingStats> = new Map();
  private playerBaseRunningStats: Map<string, BaseRunningStats> = new Map();
  private teamStats: Map<string, TeamStats> = new Map();
  private gameEvents: GameEvent[] = [];
  private playerGameLogs: Map<string, PlayerGameLog[]> = new Map();

  // Constants for advanced calculations
  private readonly WO  BA_WEIGHTS = {
    walk: 0.69,
    hitByPitch: 0.72,
    single: 0.88,
    double: 1.24,
    triple: 1.56,
    homeRun: 1.95
  };

  private readonly FIP_CONSTANT = 3.2; // League average FIP constant

  constructor() {
    // Initialize system
  }

  /**
   * Record a game event
   */
  public recordEvent(event: GameEvent): void {
    this.gameEvents.push(event);

    // Update batting stats
    this.updateBattingStats(event);

    // Update pitching stats
    this.updatePitchingStats(event);

    // Update fielding stats if applicable
    if (event.eventType.includes('out') || event.eventType === 'error') {
      this.updateFieldingStats(event);
    }

    // Update baserunning stats
    if (event.eventType === 'single' || event.eventType === 'double' || event.runScored) {
      this.updateBaseRunningStats(event);
    }

    // Add to game log
    this.addToGameLog(event);
  }

  /**
   * Update batting stats from event
   */
  private updateBattingStats(event: GameEvent): void {
    let stats = this.playerBattingStats.get(event.batterName);

    if (!stats) {
      stats = this.initializeBattingStats();
      this.playerBattingStats.set(event.batterName, stats);
    }

    stats.plateAppearances++;

    switch (event.eventType) {
      case 'single':
        stats.atBats++;
        stats.hits++;
        stats.singles++;
        break;
      case 'double':
        stats.atBats++;
        stats.hits++;
        stats.doubles++;
        break;
      case 'triple':
        stats.atBats++;
        stats.hits++;
        stats.triples++;
        break;
      case 'homerun':
        stats.atBats++;
        stats.hits++;
        stats.homeRuns++;
        stats.rbi++;
        stats.runs++;
        break;
      case 'walk':
        stats.walks++;
        break;
      case 'strikeout':
        stats.atBats++;
        stats.strikeouts++;
        break;
      case 'groundout':
      case 'flyout':
        stats.atBats++;
        break;
      case 'hit_by_pitch':
        stats.hitByPitch++;
        break;
      case 'sacrifice':
        stats.sacrifices++;
        break;
    }

    stats.rbis += event.rbi;
    if (event.runScored) stats.runs++;

    // Track quality of contact
    if (event.exitVelocity) {
      stats.averageExitVelocity =
        (stats.averageExitVelocity * (stats.atBats - 1) + event.exitVelocity) / stats.atBats;

      if (event.exitVelocity >= 95) {
        stats.hardHitRate = (stats.hardHitRate * (stats.atBats - 1) + 1) / stats.atBats;
      }
    }

    if (event.launchAngle !== undefined) {
      stats.averageLaunchAngle =
        (stats.averageLaunchAngle * (stats.atBats - 1) + event.launchAngle) / stats.atBats;

      // Barrel: 95+ mph exit velo + optimal launch angle (25-31°)
      if (
        event.exitVelocity &&
        event.exitVelocity >= 95 &&
        event.launchAngle >= 25 &&
        event.launchAngle <= 31
      ) {
        stats.barrelRate = (stats.barrelRate * (stats.atBats - 1) + 1) / stats.atBats;
      }
    }

    // Recalculate derived stats
    this.calculateBattingDerivedStats(stats);
  }

  /**
   * Update pitching stats from event
   */
  private updatePitchingStats(event: GameEvent): void {
    let stats = this.playerPitchingStats.get(event.pitcherName);

    if (!stats) {
      stats = this.initializePitchingStats();
      this.playerPitchingStats.set(event.pitcherName, stats);
    }

    // Update based on event
    switch (event.eventType) {
      case 'single':
      case 'double':
      case 'triple':
      case 'homerun':
        stats.hitsAllowed++;
        if (event.eventType === 'homerun') {
          stats.homeRunsAllowed++;
          stats.earnedRuns++;
        }
        break;
      case 'walk':
        stats.walksAllowed++;
        break;
      case 'strikeout':
        stats.strikeouts++;
        break;
      case 'hit_by_pitch':
        stats.hitBatsmen++;
        break;
    }

    // Track pitch types
    if (event.pitchType && event.pitchSpeed) {
      this.updatePitchMix(stats, event.pitchType);

      if (event.pitchType === 'fastball') {
        stats.averageFastballVelocity =
          (stats.averageFastballVelocity * 0.95 + event.pitchSpeed * 0.05);
      }
    }

    // Recalculate derived stats
    this.calculatePitchingDerivedStats(stats);
  }

  /**
   * Update fielding stats
   */
  private updateFieldingStats(event: GameEvent): void {
    // Would need fielder name from event - simplified here
    const fielderName = 'Fielder'; // Placeholder

    let stats = this.playerFieldingStats.get(fielderName);

    if (!stats) {
      stats = this.initializeFieldingStats();
      this.playerFieldingStats.set(fielderName, stats);
    }

    if (event.eventType === 'groundout' || event.eventType === 'flyout') {
      stats.putouts++;
    } else if (event.eventType === 'error') {
      stats.errors++;
    }

    this.calculateFieldingDerivedStats(stats);
  }

  /**
   * Update baserunning stats
   */
  private updateBaseRunningStats(event: GameEvent): void {
    let stats = this.playerBaseRunningStats.get(event.batterName);

    if (!stats) {
      stats = this.initializeBaseRunningStats();
      this.playerBaseRunningStats.set(event.batterName, stats);
    }

    // Update stolen bases, extra bases, etc.
    // Simplified here

    this.calculateBaseRunningDerivedStats(stats);
  }

  /**
   * Calculate batting derived statistics
   */
  private calculateBattingDerivedStats(stats: BattingStats): void {
    // Batting Average
    stats.battingAverage = stats.atBats > 0 ? stats.hits / stats.atBats : 0;

    // On-Base Percentage
    const obpDenominator =
      stats.atBats + stats.walks + stats.hitByPitch + stats.sacrifices;
    stats.onBasePercentage =
      obpDenominator > 0
        ? (stats.hits + stats.walks + stats.hitByPitch) / obpDenominator
        : 0;

    // Slugging Percentage
    const totalBases =
      stats.singles +
      stats.doubles * 2 +
      stats.triples * 3 +
      stats.homeRuns * 4;
    stats.sluggingPercentage = stats.atBats > 0 ? totalBases / stats.atBats : 0;

    // OPS
    stats.onBasePlusSlugging = stats.onBasePercentage + stats.sluggingPercentage;

    // Isolated Power
    stats.isolatedPower = stats.sluggingPercentage - stats.battingAverage;

    // BABIP (Batting Average on Balls In Play)
    const ballsInPlay = stats.atBats - stats.strikeouts - stats.homeRuns + stats.sacrifices;
    const hitsExcludingHR = stats.hits - stats.homeRuns;
    stats.babip = ballsInPlay > 0 ? hitsExcludingHR / ballsInPlay : 0;

    // Walk and Strikeout Rates
    stats.walkRate = stats.plateAppearances > 0 ? stats.walks / stats.plateAppearances : 0;
    stats.strikeoutRate = stats.plateAppearances > 0 ? stats.strikeouts / stats.plateAppearances : 0;
    stats.walkToStrikeoutRatio = stats.strikeouts > 0 ? stats.walks / stats.strikeouts : stats.walks;

    // wOBA (Weighted On-Base Average)
    const wobaSum =
      stats.walks * this.WOBA_WEIGHTS.walk +
      stats.hitByPitch * this.WOBA_WEIGHTS.hitByPitch +
      stats.singles * this.WOBA_WEIGHTS.single +
      stats.doubles * this.WOBA_WEIGHTS.double +
      stats.triples * this.WOBA_WEIGHTS.triple +
      stats.homeRuns * this.WOBA_WEIGHTS.homeRun;

    stats.weightedOnBaseAverage =
      stats.plateAppearances > 0 ? wobaSum / stats.plateAppearances : 0;

    // wRC+ (Weighted Runs Created Plus) - simplified
    const leagueWOBA = 0.320; // League average
    const wOBAScale = 1.15; // Scale factor
    const runScaleAvg = 5.0; // Runs per PA
    stats.weightedRunsCreatedPlus =
      (((stats.weightedOnBaseAverage - leagueWOBA) / wOBAScale + runScaleAvg) * 100) / runScaleAvg;
  }

  /**
   * Calculate pitching derived statistics
   */
  private calculatePitchingDerivedStats(stats: PitchingStats): void {
    // ERA (Earned Run Average)
    stats.earnedRunAverage =
      stats.inningsPitched > 0 ? (stats.earnedRuns * 9) / stats.inningsPitched : 0;

    // WHIP (Walks and Hits per Inning Pitched)
    stats.whip =
      stats.inningsPitched > 0
        ? (stats.walksAllowed + stats.hitsAllowed) / stats.inningsPitched
        : 0;

    // K/9, BB/9, H/9
    stats.strikeoutsPerNine =
      stats.inningsPitched > 0 ? (stats.strikeouts * 9) / stats.inningsPitched : 0;
    stats.walksPerNine =
      stats.inningsPitched > 0 ? (stats.walksAllowed * 9) / stats.inningsPitched : 0;
    stats.hitsPerNine =
      stats.inningsPitched > 0 ? (stats.hitsAllowed * 9) / stats.inningsPitched : 0;

    // K/BB ratio
    stats.strikeoutToWalkRatio =
      stats.walksAllowed > 0 ? stats.strikeouts / stats.walksAllowed : stats.strikeouts;

    // HR/9
    stats.homeRunsPerNine =
      stats.inningsPitched > 0 ? (stats.homeRunsAllowed * 9) / stats.inningsPitched : 0;

    // FIP (Fielding Independent Pitching)
    stats.fieldingIndependentPitching =
      stats.inningsPitched > 0
        ? ((13 * stats.homeRunsAllowed + 3 * stats.walksAllowed - 2 * stats.strikeouts) /
            stats.inningsPitched +
            this.FIP_CONSTANT)
        : 0;

    // xFIP (Expected Fielding Independent Pitching)
    const leagueHRFBRate = 0.10; // 10% of fly balls are HRs (league avg)
    const estimatedFlyBalls = stats.hitsAllowed * 0.4; // ~40% of hits are fly balls
    const expectedHR = estimatedFlyBalls * leagueHRFBRate;
    stats.expectedFieldingIndependentPitching =
      stats.inningsPitched > 0
        ? ((13 * expectedHR + 3 * stats.walksAllowed - 2 * stats.strikeouts) /
            stats.inningsPitched +
            this.FIP_CONSTANT)
        : 0;

    // Strike percentage
    const totalPitches = stats.strikeouts * 6 + stats.walksAllowed * 4 + stats.hitsAllowed * 3;
    const strikes = stats.strikeouts * 3 + totalPitches * 0.6;
    stats.strikePercentage = totalPitches > 0 ? strikes / totalPitches : 0;
  }

  /**
   * Calculate fielding derived statistics
   */
  private calculateFieldingDerivedStats(stats: FieldingStats): void {
    const totalChances = stats.putouts + stats.assists + stats.errors;
    stats.fieldingPercentage =
      totalChances > 0 ? (stats.putouts + stats.assists) / totalChances : 1.0;

    stats.rangeFactory =
      stats.innings > 0 ? ((stats.putouts + stats.assists) * 9) / stats.innings : 0;
  }

  /**
   * Calculate baserunning derived statistics
   */
  private calculateBaseRunningDerivedStats(stats: BaseRunningStats): void {
    const totalAttempts = stats.stolenBases + stats.caughtStealing;
    stats.stolenBasePercentage =
      totalAttempts > 0 ? stats.stolenBases / totalAttempts : 0;

    const extraBaseAttempts = stats.extraBaseTaken + (stats.attempts - stats.extraBaseTaken);
    stats.extraBasePercentage =
      extraBaseAttempts > 0 ? stats.extraBaseTaken / extraBaseAttempts : 0;
  }

  /**
   * Update pitch mix
   */
  private updatePitchMix(stats: PitchingStats, pitchType: string): void {
    const totalPitches =
      stats.pitchMix.fastball +
      stats.pitchMix.curveball +
      stats.pitchMix.slider +
      stats.pitchMix.changeup;

    switch (pitchType) {
      case 'fastball':
        stats.pitchMix.fastball = (stats.pitchMix.fastball * totalPitches + 1) / (totalPitches + 1);
        break;
      case 'curveball':
        stats.pitchMix.curveball = (stats.pitchMix.curveball * totalPitches + 1) / (totalPitches + 1);
        break;
      case 'slider':
        stats.pitchMix.slider = (stats.pitchMix.slider * totalPitches + 1) / (totalPitches + 1);
        break;
      case 'changeup':
        stats.pitchMix.changeup = (stats.pitchMix.changeup * totalPitches + 1) / (totalPitches + 1);
        break;
    }

    // Normalize
    const sum = Object.values(stats.pitchMix).reduce((a, b) => a + b, 0);
    if (sum > 0) {
      stats.pitchMix.fastball /= sum;
      stats.pitchMix.curveball /= sum;
      stats.pitchMix.slider /= sum;
      stats.pitchMix.changeup /= sum;
    }
  }

  /**
   * Add event to game log
   */
  private addToGameLog(event: GameEvent): void {
    // Simplified - would create detailed game log entries
  }

  /**
   * Generate leaderboards
   */
  public generateLeaderboards(): Leaderboard[] {
    const leaderboards: Leaderboard[] = [];

    // Batting Average Leaders
    const battingAvgLeaders = Array.from(this.playerBattingStats.entries())
      .filter(([_, stats]) => stats.atBats >= 50) // Minimum AB threshold
      .map(([name, stats]) => ({
        playerName: name,
        teamName: 'Team', // Would get from player data
        value: stats.battingAverage
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((leader, index) => ({ rank: index + 1, ...leader }));

    leaderboards.push({
      category: 'batting_average',
      leaders: battingAvgLeaders,
      lastUpdated: new Date()
    });

    // Home Run Leaders
    const homeRunLeaders = Array.from(this.playerBattingStats.entries())
      .map(([name, stats]) => ({
        playerName: name,
        teamName: 'Team',
        value: stats.homeRuns
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((leader, index) => ({ rank: index + 1, ...leader }));

    leaderboards.push({
      category: 'home_runs',
      leaders: homeRunLeaders,
      lastUpdated: new Date()
    });

    // ERA Leaders
    const eraLeaders = Array.from(this.playerPitchingStats.entries())
      .filter(([_, stats]) => stats.inningsPitched >= 20)
      .map(([name, stats]) => ({
        playerName: name,
        teamName: 'Team',
        value: stats.earnedRunAverage
      }))
      .sort((a, b) => a.value - b.value) // Lower is better
      .slice(0, 10)
      .map((leader, index) => ({ rank: index + 1, ...leader }));

    leaderboards.push({
      category: 'era',
      leaders: eraLeaders,
      lastUpdated: new Date()
    });

    // Strikeout Leaders
    const strikeoutLeaders = Array.from(this.playerPitchingStats.entries())
      .map(([name, stats]) => ({
        playerName: name,
        teamName: 'Team',
        value: stats.strikeouts
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((leader, index) => ({ rank: index + 1, ...leader }));

    leaderboards.push({
      category: 'strikeouts',
      leaders: strikeoutLeaders,
      lastUpdated: new Date()
    });

    return leaderboards;
  }

  /**
   * Initialize default stats objects
   */
  private initializeBattingStats(): BattingStats {
    return {
      plateAppearances: 0,
      atBats: 0,
      hits: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      walks: 0,
      strikeouts: 0,
      hitByPitch: 0,
      sacrifices: 0,
      rbis: 0,
      runs: 0,
      stolenBases: 0,
      caughtStealing: 0,
      battingAverage: 0,
      onBasePercentage: 0,
      sluggingPercentage: 0,
      onBasePlusSlugging: 0,
      isolatedPower: 0,
      babip: 0,
      walkRate: 0,
      strikeoutRate: 0,
      walkToStrikeoutRatio: 0,
      weightedOnBaseAverage: 0,
      weightedRunsCreatedPlus: 100,
      battingRunsValue: 0,
      winProbabilityAdded: 0,
      averageExitVelocity: 0,
      averageLaunchAngle: 0,
      hardHitRate: 0,
      barrelRate: 0,
      runnersInScoringPosition: { atBats: 0, hits: 0, avg: 0 },
      clutchPerformance: 0,
      versusPitcherHand: {
        vsRHP: { atBats: 0, hits: 0, avg: 0 },
        vsLHP: { atBats: 0, hits: 0, avg: 0 }
      }
    };
  }

  private initializePitchingStats(): PitchingStats {
    return {
      gamesPlayed: 0,
      gamesStarted: 0,
      inningsPitched: 0,
      wins: 0,
      losses: 0,
      saves: 0,
      holds: 0,
      blownSaves: 0,
      hitsAllowed: 0,
      runsAllowed: 0,
      earnedRuns: 0,
      walksAllowed: 0,
      strikeouts: 0,
      homeRunsAllowed: 0,
      hitBatsmen: 0,
      earnedRunAverage: 0,
      whip: 0,
      strikeoutsPerNine: 0,
      walksPerNine: 0,
      hitsPerNine: 0,
      strikeoutToWalkRatio: 0,
      homeRunsPerNine: 0,
      fieldingIndependentPitching: 0,
      expectedFieldingIndependentPitching: 0,
      skillInteractiveEarnedRunAverage: 0,
      leftOnBasePercentage: 0,
      strandsRatedPercentage: 0,
      winProbabilityAdded: 0,
      averageFastballVelocity: 0,
      averageSpinRate: 0,
      strikePercentage: 0,
      swingingStrikeRate: 0,
      contactRate: 0,
      zoneRate: 0,
      chaseRate: 0,
      pitchMix: {
        fastball: 0.5,
        curveball: 0.2,
        slider: 0.2,
        changeup: 0.1
      },
      versusLeftHanded: { atBats: 0, hits: 0, avg: 0 },
      versusRightHanded: { atBats: 0, hits: 0, avg: 0 },
      firstPitchStrikes: 0,
      firstPitchStrikeRate: 0
    };
  }

  private initializeFieldingStats(): FieldingStats {
    return {
      gamesPlayed: 0,
      innings: 0,
      putouts: 0,
      assists: 0,
      errors: 0,
      doublePlays: 0,
      fieldingPercentage: 1.0,
      rangeFactory: 0,
      zoneRating: 0,
      ultimateZoneRating: 0,
      defensiveRunsSaved: 0,
      outfielderArmStrength: 0,
      catcherFramingRuns: 0,
      catcherThrowingRuns: 0,
      catcherBlockingRuns: 0
    };
  }

  private initializeBaseRunningStats(): BaseRunningStats {
    return {
      attempts: 0,
      stolenBases: 0,
      caughtStealing: 0,
      stolenBasePercentage: 0,
      extraBaseTaken: 0,
      extraBasePercentage: 0,
      baseRunningRuns: 0,
      firstToThirdOnSingle: 0,
      firstToHomeOnDouble: 0,
      groundedIntoDoublePlays: 0
    };
  }

  /**
   * Public getters
   */
  public getBattingStats(playerName: string): BattingStats | undefined {
    return this.playerBattingStats.get(playerName);
  }

  public getPitchingStats(playerName: string): PitchingStats | undefined {
    return this.playerPitchingStats.get(playerName);
  }

  public getFieldingStats(playerName: string): FieldingStats | undefined {
    return this.playerFieldingStats.get(playerName);
  }

  public getGameEvents(): GameEvent[] {
    return [...this.gameEvents];
  }

  public getPlayerGameLog(playerName: string): PlayerGameLog[] {
    return this.playerGameLogs.get(playerName) || [];
  }
}
