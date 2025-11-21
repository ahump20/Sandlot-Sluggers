/**
 * Comprehensive statistics and achievements tracking system
 */

/**
 * Player batting statistics
 */
export interface BattingStats {
    atBats: number;
    hits: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    runs: number;
    runsBattedIn: number;
    walks: number;
    strikeouts: number;
    stolenBases: number;
    caughtStealing: number;
    sacrificeFlies: number;
    hitByPitch: number;

    // Advanced stats
    battingAverage: number;      // hits / atBats
    onBasePercentage: number;    // (hits + walks + hitByPitch) / (atBats + walks + hitByPitch + sacrificeFlies)
    sluggingPercentage: number;  // totalBases / atBats
    ops: number;                 // onBasePercentage + sluggingPercentage
    babip: number;               // Batting average on balls in play

    // Contact quality
    perfectContacts: number;
    solidContacts: number;
    weakContacts: number;
    swingAndMisses: number;

    // Hit distribution
    pullHits: number;
    centerHits: number;
    oppositeHits: number;

    // Launch angle zones
    groundBalls: number;
    lineDrives: number;
    flyBalls: number;
    popUps: number;

    // Exit velocity
    averageExitVelocity: number;
    maxExitVelocity: number;

    // Hot/cold streaks
    currentStreak: number;       // Positive = hitting streak, negative = hitless streak
    longestHittingStreak: number;
    longestHomeRunStreak: number;
}

/**
 * Player pitching statistics
 */
export interface PitchingStats {
    gamesStarted: number;
    completeGames: number;
    shutouts: number;
    inningsPitched: number;
    wins: number;
    losses: number;
    saves: number;
    holds: number;
    blownSaves: number;

    // Per-pitch stats
    pitchesThrown: number;
    strikes: number;
    balls: number;
    strikeouts: number;
    walks: number;
    hitBatsmen: number;

    // Batted balls allowed
    hitsAllowed: number;
    homeRunsAllowed: number;
    runsAllowed: number;
    earnedRunsAllowed: number;

    // Advanced stats
    earnedRunAverage: number;    // (earnedRunsAllowed * 9) / inningsPitched
    whip: number;                // (walks + hitsAllowed) / inningsPitched
    strikeoutRate: number;       // strikeouts / batters faced
    walkRate: number;            // walks / batters faced
    strikePercentage: number;    // strikes / pitchesThrown

    // Pitch types
    fastballs: number;
    breaking: number;
    offspeed: number;

    // Velocity
    averageVelocity: number;
    maxVelocity: number;

    // Control
    perfectLocations: number;
    wildPitches: number;
}

/**
 * Player fielding statistics
 */
export interface FieldingStats {
    gamesPlayed: number;
    innings: number;
    position: string;

    // Defensive plays
    putOuts: number;
    assists: number;
    errors: number;
    doublePlays: number;
    triplePlays: number;

    // Fielding percentage
    chances: number;             // putOuts + assists + errors
    fieldingPercentage: number;  // (putOuts + assists) / chances

    // Advanced fielding
    rangeRating: number;         // 0-10
    divingCatches: number;
    perfectThrows: number;
    outfielderAssists: number;   // Throwing out runners

    // Catcher-specific
    catcherStolenBasesAllowed?: number;
    catcherCaughtStealing?: number;
    catcherThrowingPercentage?: number;
    passedBalls?: number;
}

/**
 * Team statistics
 */
export interface TeamStats {
    teamId: string;
    teamName: string;

    // Record
    wins: number;
    losses: number;
    ties: number;
    winPercentage: number;

    // Scoring
    runsScored: number;
    runsAllowed: number;
    runDifferential: number;

    // Team batting
    teamBattingAverage: number;
    teamOnBasePercentage: number;
    teamSluggingPercentage: number;
    teamHomeRuns: number;

    // Team pitching
    teamEarnedRunAverage: number;
    teamStrikeouts: number;
    teamWalks: number;

    // Streaks
    currentWinStreak: number;
    longestWinStreak: number;
    currentLossStreak: number;
}

/**
 * Game statistics
 */
export interface GameStats {
    gameId: string;
    date: Date;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    innings: number;

    // Game events
    totalHits: number;
    totalHomeRuns: number;
    totalStrikeouts: number;
    totalWalks: number;
    totalErrors: number;

    // Player performances
    playerStats: Map<string, {
        batting?: Partial<BattingStats>;
        pitching?: Partial<PitchingStats>;
        fielding?: Partial<FieldingStats>;
    }>;

    // Milestones achieved
    milestones: string[];
}

/**
 * Achievement definitions
 */
export enum AchievementCategory {
    BATTING = 'BATTING',
    PITCHING = 'PITCHING',
    FIELDING = 'FIELDING',
    CAREER = 'CAREER',
    SPECIAL = 'SPECIAL'
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    category: AchievementCategory;
    icon: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    points: number;
    requirement: {
        type: string;
        value: number;
    };
    rewards: {
        experience: number;
        coins: number;
        unlocks?: string[];
    };
}

/**
 * Unlocked achievement
 */
export interface UnlockedAchievement {
    achievementId: string;
    unlockedAt: Date;
    progress: number;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
    playerId: string;
    playerName: string;
    rank: number;
    value: number;
    metadata?: any;
}

/**
 * Advanced statistics and achievements system
 */
export class StatisticsSystem {
    // Player statistics
    private playerBattingStats: Map<string, BattingStats> = new Map();
    private playerPitchingStats: Map<string, PitchingStats> = new Map();
    private playerFieldingStats: Map<string, FieldingStats> = new Map();

    // Team statistics
    private teamStats: Map<string, TeamStats> = new Map();

    // Game history
    private gameHistory: GameStats[] = [];

    // Achievements
    private achievements: Map<string, Achievement> = new Map();
    private playerAchievements: Map<string, UnlockedAchievement[]> = new Map();

    // Leaderboards
    private leaderboards: Map<string, LeaderboardEntry[]> = new Map();

    // Milestones tracking
    private playerMilestones: Map<string, Set<string>> = new Map();

    constructor() {
        this.initializeAchievements();
    }

    /**
     * Initialize achievement definitions
     */
    private initializeAchievements(): void {
        const battingAchievements: Achievement[] = [
            {
                id: 'first_hit',
                name: 'First Hit',
                description: 'Record your first hit',
                category: AchievementCategory.BATTING,
                icon: 'first_hit',
                rarity: 'common',
                points: 10,
                requirement: { type: 'hits', value: 1 },
                rewards: { experience: 50, coins: 100 }
            },
            {
                id: 'home_run_king',
                name: 'Home Run King',
                description: 'Hit 100 home runs',
                category: AchievementCategory.BATTING,
                icon: 'hr_king',
                rarity: 'epic',
                points: 100,
                requirement: { type: 'homeRuns', value: 100 },
                rewards: { experience: 1000, coins: 5000, unlocks: ['golden_bat'] }
            },
            {
                id: 'perfect_game',
                name: 'Perfect Contact',
                description: 'Achieve 50 perfect contacts',
                category: AchievementCategory.BATTING,
                icon: 'perfect',
                rarity: 'rare',
                points: 50,
                requirement: { type: 'perfectContacts', value: 50 },
                rewards: { experience: 500, coins: 2000 }
            },
            {
                id: 'hit_streak',
                name: 'Hit Streak',
                description: 'Get a hit in 10 consecutive games',
                category: AchievementCategory.BATTING,
                icon: 'streak',
                rarity: 'rare',
                points: 75,
                requirement: { type: 'hittingStreak', value: 10 },
                rewards: { experience: 750, coins: 3000 }
            },
            {
                id: 'four_hundred_club',
                name: '.400 Club',
                description: 'Achieve .400 batting average in a season',
                category: AchievementCategory.BATTING,
                icon: 'elite_hitter',
                rarity: 'legendary',
                points: 200,
                requirement: { type: 'battingAverage', value: 0.400 },
                rewards: { experience: 2000, coins: 10000, unlocks: ['legendary_bat'] }
            }
        ];

        const pitchingAchievements: Achievement[] = [
            {
                id: 'first_strikeout',
                name: 'First Strikeout',
                description: 'Record your first strikeout',
                category: AchievementCategory.PITCHING,
                icon: 'k',
                rarity: 'common',
                points: 10,
                requirement: { type: 'strikeouts_pitching', value: 1 },
                rewards: { experience: 50, coins: 100 }
            },
            {
                id: 'strikeout_king',
                name: 'Strikeout King',
                description: 'Record 200 strikeouts',
                category: AchievementCategory.PITCHING,
                icon: 'strikeout_master',
                rarity: 'epic',
                points: 100,
                requirement: { type: 'strikeouts_pitching', value: 200 },
                rewards: { experience: 1000, coins: 5000 }
            },
            {
                id: 'perfect_game_pitched',
                name: 'Perfect Game',
                description: 'Pitch a perfect game',
                category: AchievementCategory.PITCHING,
                icon: 'perfect_game',
                rarity: 'legendary',
                points: 250,
                requirement: { type: 'perfectGame', value: 1 },
                rewards: { experience: 2500, coins: 15000, unlocks: ['legendary_ball'] }
            },
            {
                id: 'no_hitter',
                name: 'No-Hitter',
                description: 'Pitch a no-hitter',
                category: AchievementCategory.PITCHING,
                icon: 'no_hitter',
                rarity: 'epic',
                points: 150,
                requirement: { type: 'noHitter', value: 1 },
                rewards: { experience: 1500, coins: 7500 }
            }
        ];

        const fieldingAchievements: Achievement[] = [
            {
                id: 'diving_catch',
                name: 'Spectacular Catch',
                description: 'Make a diving catch',
                category: AchievementCategory.FIELDING,
                icon: 'diving',
                rarity: 'uncommon',
                points: 25,
                requirement: { type: 'divingCatches', value: 1 },
                rewards: { experience: 100, coins: 500 }
            },
            {
                id: 'golden_glove',
                name: 'Golden Glove',
                description: 'Achieve 1.000 fielding percentage in 50 games',
                category: AchievementCategory.FIELDING,
                icon: 'golden_glove',
                rarity: 'epic',
                points: 100,
                requirement: { type: 'perfectFielding', value: 50 },
                rewards: { experience: 1000, coins: 5000, unlocks: ['golden_glove'] }
            }
        ];

        const careerAchievements: Achievement[] = [
            {
                id: 'first_win',
                name: 'First Victory',
                description: 'Win your first game',
                category: AchievementCategory.CAREER,
                icon: 'first_win',
                rarity: 'common',
                points: 10,
                requirement: { type: 'wins', value: 1 },
                rewards: { experience: 100, coins: 200 }
            },
            {
                id: 'century',
                name: 'Century',
                description: 'Win 100 games',
                category: AchievementCategory.CAREER,
                icon: 'century',
                rarity: 'epic',
                points: 150,
                requirement: { type: 'wins', value: 100 },
                rewards: { experience: 1500, coins: 10000 }
            },
            {
                id: 'champion',
                name: 'Champion',
                description: 'Win a championship',
                category: AchievementCategory.CAREER,
                icon: 'trophy',
                rarity: 'rare',
                points: 100,
                requirement: { type: 'championships', value: 1 },
                rewards: { experience: 1000, coins: 5000 }
            },
            {
                id: 'dynasty',
                name: 'Dynasty',
                description: 'Win 5 championships',
                category: AchievementCategory.CAREER,
                icon: 'dynasty',
                rarity: 'legendary',
                points: 500,
                requirement: { type: 'championships', value: 5 },
                rewards: { experience: 5000, coins: 25000, unlocks: ['legendary_stadium'] }
            }
        ];

        const specialAchievements: Achievement[] = [
            {
                id: 'walk_off',
                name: 'Walk-Off Winner',
                description: 'Hit a walk-off home run',
                category: AchievementCategory.SPECIAL,
                icon: 'walkoff',
                rarity: 'rare',
                points: 75,
                requirement: { type: 'walkOffHomeRun', value: 1 },
                rewards: { experience: 750, coins: 3000 }
            },
            {
                id: 'grand_slam',
                name: 'Grand Slam',
                description: 'Hit a grand slam',
                category: AchievementCategory.SPECIAL,
                icon: 'grand_slam',
                rarity: 'uncommon',
                points: 50,
                requirement: { type: 'grandSlam', value: 1 },
                rewards: { experience: 500, coins: 2000 }
            },
            {
                id: 'immaculate_inning',
                name: 'Immaculate Inning',
                description: 'Strike out 3 batters on 9 pitches',
                category: AchievementCategory.SPECIAL,
                icon: 'immaculate',
                rarity: 'legendary',
                points: 200,
                requirement: { type: 'immaculateInning', value: 1 },
                rewards: { experience: 2000, coins: 10000 }
            },
            {
                id: 'cycle',
                name: 'Hit for the Cycle',
                description: 'Get a single, double, triple, and home run in one game',
                category: AchievementCategory.SPECIAL,
                icon: 'cycle',
                rarity: 'epic',
                points: 150,
                requirement: { type: 'cycle', value: 1 },
                rewards: { experience: 1500, coins: 7500 }
            }
        ];

        // Add all achievements
        [...battingAchievements, ...pitchingAchievements, ...fieldingAchievements, ...careerAchievements, ...specialAchievements]
            .forEach(achievement => {
                this.achievements.set(achievement.id, achievement);
            });
    }

    /**
     * Initialize player statistics
     */
    public initializePlayerStats(playerId: string, position: string): void {
        // Batting stats
        this.playerBattingStats.set(playerId, {
            atBats: 0,
            hits: 0,
            doubles: 0,
            triples: 0,
            homeRuns: 0,
            runs: 0,
            runsBattedIn: 0,
            walks: 0,
            strikeouts: 0,
            stolenBases: 0,
            caughtStealing: 0,
            sacrificeFlies: 0,
            hitByPitch: 0,
            battingAverage: 0,
            onBasePercentage: 0,
            sluggingPercentage: 0,
            ops: 0,
            babip: 0,
            perfectContacts: 0,
            solidContacts: 0,
            weakContacts: 0,
            swingAndMisses: 0,
            pullHits: 0,
            centerHits: 0,
            oppositeHits: 0,
            groundBalls: 0,
            lineDrives: 0,
            flyBalls: 0,
            popUps: 0,
            averageExitVelocity: 0,
            maxExitVelocity: 0,
            currentStreak: 0,
            longestHittingStreak: 0,
            longestHomeRunStreak: 0
        });

        // Pitching stats
        this.playerPitchingStats.set(playerId, {
            gamesStarted: 0,
            completeGames: 0,
            shutouts: 0,
            inningsPitched: 0,
            wins: 0,
            losses: 0,
            saves: 0,
            holds: 0,
            blownSaves: 0,
            pitchesThrown: 0,
            strikes: 0,
            balls: 0,
            strikeouts: 0,
            walks: 0,
            hitBatsmen: 0,
            hitsAllowed: 0,
            homeRunsAllowed: 0,
            runsAllowed: 0,
            earnedRunsAllowed: 0,
            earnedRunAverage: 0,
            whip: 0,
            strikeoutRate: 0,
            walkRate: 0,
            strikePercentage: 0,
            fastballs: 0,
            breaking: 0,
            offspeed: 0,
            averageVelocity: 0,
            maxVelocity: 0,
            perfectLocations: 0,
            wildPitches: 0
        });

        // Fielding stats
        this.playerFieldingStats.set(playerId, {
            gamesPlayed: 0,
            innings: 0,
            position,
            putOuts: 0,
            assists: 0,
            errors: 0,
            doublePlays: 0,
            triplePlays: 0,
            chances: 0,
            fieldingPercentage: 1.0,
            rangeRating: 5,
            divingCatches: 0,
            perfectThrows: 0,
            outfielderAssists: 0
        });

        // Initialize achievement tracking
        this.playerAchievements.set(playerId, []);
        this.playerMilestones.set(playerId, new Set());
    }

    /**
     * Record at-bat result
     */
    public recordAtBat(
        playerId: string,
        result: 'hit' | 'walk' | 'strikeout' | 'out',
        hitType?: 'single' | 'double' | 'triple' | 'homerun',
        rbi?: number
    ): void {
        const stats = this.playerBattingStats.get(playerId);
        if (!stats) return;

        stats.atBats++;

        switch (result) {
            case 'hit':
                stats.hits++;
                stats.currentStreak = Math.max(0, stats.currentStreak) + 1;

                if (hitType === 'double') stats.doubles++;
                else if (hitType === 'triple') stats.triples++;
                else if (hitType === 'homerun') {
                    stats.homeRuns++;
                    this.checkAchievement(playerId, 'homeRuns', stats.homeRuns);
                }

                if (rbi) stats.runsBattedIn += rbi;
                break;

            case 'walk':
                stats.walks++;
                break;

            case 'strikeout':
                stats.strikeouts++;
                stats.currentStreak = Math.min(0, stats.currentStreak) - 1;
                break;

            case 'out':
                stats.currentStreak = Math.min(0, stats.currentStreak) - 1;
                break;
        }

        // Update calculated stats
        this.updateBattingCalculations(playerId);

        // Check streaks
        if (stats.currentStreak > stats.longestHittingStreak) {
            stats.longestHittingStreak = stats.currentStreak;
            this.checkAchievement(playerId, 'hittingStreak', stats.longestHittingStreak);
        }
    }

    /**
     * Update batting calculations
     */
    private updateBattingCalculations(playerId: string): void {
        const stats = this.playerBattingStats.get(playerId);
        if (!stats || stats.atBats === 0) return;

        stats.battingAverage = stats.hits / stats.atBats;

        const plateAppearances = stats.atBats + stats.walks + stats.hitByPitch + stats.sacrificeFlies;
        if (plateAppearances > 0) {
            stats.onBasePercentage = (stats.hits + stats.walks + stats.hitByPitch) / plateAppearances;
        }

        const totalBases = stats.hits + stats.doubles + (stats.triples * 2) + (stats.homeRuns * 3);
        stats.sluggingPercentage = totalBases / stats.atBats;

        stats.ops = stats.onBasePercentage + stats.sluggingPercentage;

        // Check batting average achievements
        this.checkAchievement(playerId, 'battingAverage', stats.battingAverage);
    }

    /**
     * Record pitch result
     */
    public recordPitch(
        playerId: string,
        isStrike: boolean,
        isStrikeout: boolean = false,
        velocity?: number
    ): void {
        const stats = this.playerPitchingStats.get(playerId);
        if (!stats) return;

        stats.pitchesThrown++;

        if (isStrike) {
            stats.strikes++;
        } else {
            stats.balls++;
        }

        if (isStrikeout) {
            stats.strikeouts++;
            this.checkAchievement(playerId, 'strikeouts_pitching', stats.strikeouts);
        }

        if (velocity) {
            // Update velocity stats
            const totalVelocity = stats.averageVelocity * (stats.pitchesThrown - 1);
            stats.averageVelocity = (totalVelocity + velocity) / stats.pitchesThrown;

            if (velocity > stats.maxVelocity) {
                stats.maxVelocity = velocity;
            }
        }

        // Update calculations
        this.updatePitchingCalculations(playerId);
    }

    /**
     * Update pitching calculations
     */
    private updatePitchingCalculations(playerId: string): void {
        const stats = this.playerPitchingStats.get(playerId);
        if (!stats) return;

        if (stats.pitchesThrown > 0) {
            stats.strikePercentage = stats.strikes / stats.pitchesThrown;
        }

        if (stats.inningsPitched > 0) {
            stats.earnedRunAverage = (stats.earnedRunsAllowed * 9) / stats.inningsPitched;
            stats.whip = (stats.walks + stats.hitsAllowed) / stats.inningsPitched;
        }
    }

    /**
     * Record fielding play
     */
    public recordFieldingPlay(
        playerId: string,
        type: 'putout' | 'assist' | 'error' | 'double_play' | 'diving_catch'
    ): void {
        const stats = this.playerFieldingStats.get(playerId);
        if (!stats) return;

        switch (type) {
            case 'putout':
                stats.putOuts++;
                stats.chances++;
                break;

            case 'assist':
                stats.assists++;
                stats.chances++;
                break;

            case 'error':
                stats.errors++;
                stats.chances++;
                break;

            case 'double_play':
                stats.doublePlays++;
                break;

            case 'diving_catch':
                stats.divingCatches++;
                stats.putOuts++;
                stats.chances++;
                this.checkAchievement(playerId, 'divingCatches', stats.divingCatches);
                break;
        }

        // Update fielding percentage
        if (stats.chances > 0) {
            stats.fieldingPercentage = (stats.putOuts + stats.assists) / stats.chances;
        }
    }

    /**
     * Check achievement progress
     */
    private checkAchievement(playerId: string, statType: string, currentValue: number): void {
        for (const [id, achievement] of this.achievements.entries()) {
            if (achievement.requirement.type === statType && currentValue >= achievement.requirement.value) {
                this.unlockAchievement(playerId, id);
            }
        }
    }

    /**
     * Unlock achievement
     */
    private unlockAchievement(playerId: string, achievementId: string): void {
        const playerAchievements = this.playerAchievements.get(playerId);
        if (!playerAchievements) return;

        // Check if already unlocked
        if (playerAchievements.some(a => a.achievementId === achievementId)) return;

        const achievement = this.achievements.get(achievementId);
        if (!achievement) return;

        playerAchievements.push({
            achievementId,
            unlockedAt: new Date(),
            progress: 100
        });

        console.log(`Achievement unlocked: ${achievement.name}`);
    }

    /**
     * Get player batting stats
     */
    public getPlayerBattingStats(playerId: string): BattingStats | undefined {
        return this.playerBattingStats.get(playerId);
    }

    /**
     * Get player pitching stats
     */
    public getPlayerPitchingStats(playerId: string): PitchingStats | undefined {
        return this.playerPitchingStats.get(playerId);
    }

    /**
     * Get player fielding stats
     */
    public getPlayerFieldingStats(playerId: string): FieldingStats | undefined {
        return this.playerFieldingStats.get(playerId);
    }

    /**
     * Get player achievements
     */
    public getPlayerAchievements(playerId: string): UnlockedAchievement[] {
        return this.playerAchievements.get(playerId) || [];
    }

    /**
     * Get all achievements
     */
    public getAllAchievements(): Achievement[] {
        return Array.from(this.achievements.values());
    }

    /**
     * Update leaderboard
     */
    public updateLeaderboard(category: string, playerId: string, playerName: string, value: number): void {
        let leaderboard = this.leaderboards.get(category);

        if (!leaderboard) {
            leaderboard = [];
            this.leaderboards.set(category, leaderboard);
        }

        // Update or add entry
        const existingEntry = leaderboard.find(e => e.playerId === playerId);

        if (existingEntry) {
            existingEntry.value = value;
        } else {
            leaderboard.push({
                playerId,
                playerName,
                rank: 0,
                value
            });
        }

        // Sort and update ranks
        leaderboard.sort((a, b) => b.value - a.value);
        leaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
        });
    }

    /**
     * Get leaderboard
     */
    public getLeaderboard(category: string, limit: number = 10): LeaderboardEntry[] {
        const leaderboard = this.leaderboards.get(category);
        return leaderboard ? leaderboard.slice(0, limit) : [];
    }

    /**
     * Export all statistics
     */
    public exportStatistics(playerId: string): object {
        return {
            batting: this.playerBattingStats.get(playerId),
            pitching: this.playerPitchingStats.get(playerId),
            fielding: this.playerFieldingStats.get(playerId),
            achievements: this.playerAchievements.get(playerId),
            milestones: Array.from(this.playerMilestones.get(playerId) || [])
        };
    }

    /**
     * Dispose statistics system
     */
    public dispose(): void {
        this.playerBattingStats.clear();
        this.playerPitchingStats.clear();
        this.playerFieldingStats.clear();
        this.teamStats.clear();
        this.gameHistory.length = 0;
        this.playerAchievements.clear();
        this.leaderboards.clear();
        this.playerMilestones.clear();
    }
}
