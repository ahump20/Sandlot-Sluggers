import { Observable } from '@babylonjs/core';

/**
 * Leaderboard types
 */
export enum LeaderboardType {
    GLOBAL = 'global',
    FRIENDS = 'friends',
    LOCAL = 'local',
    SEASONAL = 'seasonal',
    WEEKLY = 'weekly',
    DAILY = 'daily',
    ALL_TIME = 'all_time'
}

/**
 * Leaderboard category
 */
export enum LeaderboardCategory {
    BATTING_AVERAGE = 'batting_average',
    HOME_RUNS = 'home_runs',
    RBIS = 'rbis',
    HITS = 'hits',
    STRIKEOUTS_PITCHING = 'strikeouts_pitching',
    ERA = 'era',
    WINS = 'wins',
    SAVES = 'saves',
    STOLEN_BASES = 'stolen_bases',
    FIELDING_PERCENTAGE = 'fielding_percentage',
    TOTAL_SCORE = 'total_score',
    LEVEL = 'level',
    ACHIEVEMENTS = 'achievements',
    GAMES_WON = 'games_won',
    WIN_STREAK = 'win_streak'
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
    rank: number;
    playerId: string;
    playerName: string;
    value: number;
    displayValue?: string;
    avatar?: string;
    level?: number;
    country?: string;
    team?: string;
    timestamp: number;
    metadata?: { [key: string]: any };
}

/**
 * Leaderboard data
 */
export interface Leaderboard {
    id: string;
    type: LeaderboardType;
    category: LeaderboardCategory;
    name: string;
    description: string;
    entries: LeaderboardEntry[];
    lastUpdated: number;
    nextUpdate?: number;
    totalEntries: number;
    playerRank?: number;
    playerEntry?: LeaderboardEntry;
}

/**
 * Leaderboard filter
 */
export interface LeaderboardFilter {
    country?: string;
    team?: string;
    levelMin?: number;
    levelMax?: number;
    nearPlayer?: string;
    range?: { start: number; end: number };
}

/**
 * Rank change
 */
export interface RankChange {
    playerId: string;
    category: LeaderboardCategory;
    oldRank: number;
    newRank: number;
    change: number;
    timestamp: number;
}

/**
 * Season data
 */
export interface SeasonData {
    id: string;
    name: string;
    startDate: number;
    endDate: number;
    active: boolean;
    rewards?: SeasonReward[];
}

/**
 * Season reward
 */
export interface SeasonReward {
    rank: number;
    coins?: number;
    gems?: number;
    items?: string[];
    title?: string;
    badge?: string;
}

/**
 * Leaderboard System
 * Comprehensive ranking and competition system
 */
export class LeaderboardSystem {
    // Leaderboards
    private leaderboards: Map<string, Leaderboard> = new Map();

    // Player scores
    private playerScores: Map<string, Map<LeaderboardCategory, number>> = new Map();

    // Rank history
    private rankHistory: Map<string, RankChange[]> = new Map();

    // Seasons
    private seasons: Map<string, SeasonData> = new Map();
    private currentSeasonId?: string;

    // Cache
    private cacheExpiry: number = 300000; // 5 minutes
    private lastFetchTime: Map<string, number> = new Map();

    // Observables
    private onRankChangedObservable: Observable<RankChange> = new Observable();
    private onLeaderboardUpdatedObservable: Observable<Leaderboard> = new Observable();
    private onSeasonEndedObservable: Observable<SeasonData> = new Observable();

    // Settings
    private enabled: boolean = true;
    private autoUpdate: boolean = true;
    private updateInterval: number = 60000; // 1 minute

    // Server communication
    private serverUrl?: string;
    private updateTimer?: number;

    constructor(serverUrl?: string) {
        this.serverUrl = serverUrl;
        this.initializeLeaderboards();

        if (this.autoUpdate) {
            this.startAutoUpdate();
        }
    }

    /**
     * Initialize leaderboard definitions
     */
    private initializeLeaderboards(): void {
        // Global leaderboards
        this.createLeaderboard(
            'global_batting_avg',
            LeaderboardType.GLOBAL,
            LeaderboardCategory.BATTING_AVERAGE,
            'Global Batting Average',
            'Top batting averages worldwide'
        );

        this.createLeaderboard(
            'global_home_runs',
            LeaderboardType.GLOBAL,
            LeaderboardCategory.HOME_RUNS,
            'Global Home Runs',
            'Most home runs worldwide'
        );

        this.createLeaderboard(
            'global_strikeouts',
            LeaderboardType.GLOBAL,
            LeaderboardCategory.STRIKEOUTS_PITCHING,
            'Global Strikeouts',
            'Most strikeouts worldwide'
        );

        this.createLeaderboard(
            'global_wins',
            LeaderboardType.GLOBAL,
            LeaderboardCategory.GAMES_WON,
            'Global Wins',
            'Most games won worldwide'
        );

        // Weekly leaderboards
        this.createLeaderboard(
            'weekly_score',
            LeaderboardType.WEEKLY,
            LeaderboardCategory.TOTAL_SCORE,
            'Weekly High Score',
            'Top scores this week'
        );

        this.createLeaderboard(
            'weekly_home_runs',
            LeaderboardType.WEEKLY,
            LeaderboardCategory.HOME_RUNS,
            'Weekly Home Runs',
            'Most home runs this week'
        );

        // Daily leaderboards
        this.createLeaderboard(
            'daily_score',
            LeaderboardType.DAILY,
            LeaderboardCategory.TOTAL_SCORE,
            'Daily High Score',
            'Top scores today'
        );

        // Seasonal leaderboards
        this.createLeaderboard(
            'season_batting',
            LeaderboardType.SEASONAL,
            LeaderboardCategory.BATTING_AVERAGE,
            'Season Batting Average',
            'Top batting averages this season'
        );

        this.createLeaderboard(
            'season_era',
            LeaderboardType.SEASONAL,
            LeaderboardCategory.ERA,
            'Season ERA',
            'Best ERAs this season'
        );
    }

    /**
     * Create leaderboard
     */
    private createLeaderboard(
        id: string,
        type: LeaderboardType,
        category: LeaderboardCategory,
        name: string,
        description: string
    ): void {
        const leaderboard: Leaderboard = {
            id,
            type,
            category,
            name,
            description,
            entries: [],
            lastUpdated: Date.now(),
            totalEntries: 0
        };

        this.leaderboards.set(id, leaderboard);
    }

    /**
     * Submit score
     */
    public async submitScore(
        playerId: string,
        playerName: string,
        category: LeaderboardCategory,
        value: number,
        metadata?: { [key: string]: any }
    ): Promise<void> {
        if (!this.enabled) return;

        // Update player score
        if (!this.playerScores.has(playerId)) {
            this.playerScores.set(playerId, new Map());
        }

        const oldValue = this.playerScores.get(playerId)!.get(category);
        this.playerScores.get(playerId)!.set(category, value);

        // Update relevant leaderboards
        const relevantBoards = Array.from(this.leaderboards.values())
            .filter(lb => lb.category === category);

        for (const board of relevantBoards) {
            await this.updateLeaderboard(board.id, playerId, playerName, value, metadata);
        }

        // Track rank changes
        if (oldValue !== undefined && oldValue !== value) {
            this.trackRankChange(playerId, category);
        }

        // Submit to server if available
        if (this.serverUrl) {
            try {
                await fetch(`${this.serverUrl}/scores`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        playerId,
                        playerName,
                        category,
                        value,
                        metadata,
                        timestamp: Date.now()
                    })
                });
            } catch (error) {
                console.error('Failed to submit score to server:', error);
            }
        }
    }

    /**
     * Update leaderboard with new entry
     */
    private async updateLeaderboard(
        leaderboardId: string,
        playerId: string,
        playerName: string,
        value: number,
        metadata?: { [key: string]: any }
    ): Promise<void> {
        const board = this.leaderboards.get(leaderboardId);
        if (!board) return;

        // Remove existing entry for this player
        board.entries = board.entries.filter(e => e.playerId !== playerId);

        // Add new entry
        board.entries.push({
            rank: 0, // Will be calculated when sorting
            playerId,
            playerName,
            value,
            displayValue: this.formatValue(board.category, value),
            timestamp: Date.now(),
            metadata
        });

        // Sort entries
        this.sortLeaderboard(board);

        // Assign ranks
        this.assignRanks(board);

        // Update last updated time
        board.lastUpdated = Date.now();
        board.totalEntries = board.entries.length;

        // Find player rank
        const playerEntry = board.entries.find(e => e.playerId === playerId);
        if (playerEntry) {
            board.playerRank = playerEntry.rank;
            board.playerEntry = playerEntry;
        }

        // Trim to top 1000 entries
        if (board.entries.length > 1000) {
            board.entries = board.entries.slice(0, 1000);
        }

        // Notify observers
        this.onLeaderboardUpdatedObservable.notifyObservers(board);
    }

    /**
     * Sort leaderboard entries
     */
    private sortLeaderboard(board: Leaderboard): void {
        // Some categories are "lower is better" (ERA, etc.)
        const lowerIsBetter = this.isLowerBetter(board.category);

        board.entries.sort((a, b) => {
            if (lowerIsBetter) {
                return a.value - b.value;
            } else {
                return b.value - a.value;
            }
        });
    }

    /**
     * Check if lower value is better for category
     */
    private isLowerBetter(category: LeaderboardCategory): boolean {
        return category === LeaderboardCategory.ERA;
    }

    /**
     * Assign ranks to entries
     */
    private assignRanks(board: Leaderboard): void {
        let currentRank = 1;

        for (let i = 0; i < board.entries.length; i++) {
            const entry = board.entries[i];

            // Check for ties
            if (i > 0 && board.entries[i - 1].value === entry.value) {
                entry.rank = board.entries[i - 1].rank;
            } else {
                entry.rank = currentRank;
            }

            currentRank++;
        }
    }

    /**
     * Format value for display
     */
    private formatValue(category: LeaderboardCategory, value: number): string {
        switch (category) {
            case LeaderboardCategory.BATTING_AVERAGE:
                return value.toFixed(3);
            case LeaderboardCategory.ERA:
                return value.toFixed(2);
            case LeaderboardCategory.FIELDING_PERCENTAGE:
                return value.toFixed(3);
            default:
                return Math.floor(value).toString();
        }
    }

    /**
     * Track rank change
     */
    private trackRankChange(playerId: string, category: LeaderboardCategory): void {
        // Find player's current rank across all boards for this category
        const relevantBoards = Array.from(this.leaderboards.values())
            .filter(lb => lb.category === category);

        for (const board of relevantBoards) {
            const entry = board.entries.find(e => e.playerId === playerId);
            if (!entry) continue;

            // Get previous rank from history
            const history = this.rankHistory.get(playerId) || [];
            const lastChange = history
                .filter(c => c.category === category)
                .sort((a, b) => b.timestamp - a.timestamp)[0];

            const oldRank = lastChange?.newRank || entry.rank;
            const newRank = entry.rank;

            if (oldRank !== newRank) {
                const change: RankChange = {
                    playerId,
                    category,
                    oldRank,
                    newRank,
                    change: oldRank - newRank, // Positive = moved up
                    timestamp: Date.now()
                };

                if (!this.rankHistory.has(playerId)) {
                    this.rankHistory.set(playerId, []);
                }

                this.rankHistory.get(playerId)!.push(change);

                // Trim history to last 100 changes
                if (this.rankHistory.get(playerId)!.length > 100) {
                    this.rankHistory.get(playerId)!.shift();
                }

                this.onRankChangedObservable.notifyObservers(change);
            }
        }
    }

    /**
     * Get leaderboard
     */
    public async getLeaderboard(
        leaderboardId: string,
        filter?: LeaderboardFilter,
        forceRefresh: boolean = false
    ): Promise<Leaderboard | null> {
        const board = this.leaderboards.get(leaderboardId);
        if (!board) return null;

        // Check cache
        const lastFetch = this.lastFetchTime.get(leaderboardId) || 0;
        const cacheValid = Date.now() - lastFetch < this.cacheExpiry;

        if (!forceRefresh && cacheValid) {
            return this.applyFilter(board, filter);
        }

        // Fetch from server if available
        if (this.serverUrl) {
            try {
                const response = await fetch(`${this.serverUrl}/leaderboards/${leaderboardId}`);
                const data = await response.json();

                board.entries = data.entries || [];
                board.lastUpdated = data.lastUpdated || Date.now();
                board.totalEntries = data.totalEntries || board.entries.length;

                this.sortLeaderboard(board);
                this.assignRanks(board);

                this.lastFetchTime.set(leaderboardId, Date.now());
            } catch (error) {
                console.error('Failed to fetch leaderboard from server:', error);
            }
        }

        return this.applyFilter(board, filter);
    }

    /**
     * Apply filter to leaderboard
     */
    private applyFilter(board: Leaderboard, filter?: LeaderboardFilter): Leaderboard {
        if (!filter) return board;

        const filtered = { ...board };
        let entries = [...board.entries];

        // Country filter
        if (filter.country) {
            entries = entries.filter(e => e.country === filter.country);
        }

        // Team filter
        if (filter.team) {
            entries = entries.filter(e => e.team === filter.team);
        }

        // Level filter
        if (filter.levelMin !== undefined) {
            entries = entries.filter(e => (e.level || 0) >= filter.levelMin!);
        }

        if (filter.levelMax !== undefined) {
            entries = entries.filter(e => (e.level || 0) <= filter.levelMax!);
        }

        // Range filter
        if (filter.range) {
            const start = filter.range.start;
            const end = filter.range.end;
            entries = entries.slice(start, end + 1);
        }

        // Near player filter
        if (filter.nearPlayer) {
            const playerIndex = entries.findIndex(e => e.playerId === filter.nearPlayer);
            if (playerIndex !== -1) {
                const start = Math.max(0, playerIndex - 5);
                const end = Math.min(entries.length - 1, playerIndex + 5);
                entries = entries.slice(start, end + 1);
            }
        }

        filtered.entries = entries;
        return filtered;
    }

    /**
     * Get player rank
     */
    public getPlayerRank(
        playerId: string,
        leaderboardId: string
    ): number | null {
        const board = this.leaderboards.get(leaderboardId);
        if (!board) return null;

        const entry = board.entries.find(e => e.playerId === playerId);
        return entry?.rank || null;
    }

    /**
     * Get player entry
     */
    public getPlayerEntry(
        playerId: string,
        leaderboardId: string
    ): LeaderboardEntry | null {
        const board = this.leaderboards.get(leaderboardId);
        if (!board) return null;

        return board.entries.find(e => e.playerId === playerId) || null;
    }

    /**
     * Get all leaderboards
     */
    public getAllLeaderboards(): Leaderboard[] {
        return Array.from(this.leaderboards.values());
    }

    /**
     * Get leaderboards by type
     */
    public getLeaderboardsByType(type: LeaderboardType): Leaderboard[] {
        return Array.from(this.leaderboards.values())
            .filter(lb => lb.type === type);
    }

    /**
     * Get rank history
     */
    public getRankHistory(
        playerId: string,
        category?: LeaderboardCategory
    ): RankChange[] {
        let history = this.rankHistory.get(playerId) || [];

        if (category) {
            history = history.filter(c => c.category === category);
        }

        return history.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Start season
     */
    public startSeason(
        id: string,
        name: string,
        duration: number,
        rewards?: SeasonReward[]
    ): void {
        const startDate = Date.now();
        const endDate = startDate + duration;

        const season: SeasonData = {
            id,
            name,
            startDate,
            endDate,
            active: true,
            rewards
        };

        this.seasons.set(id, season);
        this.currentSeasonId = id;

        // Reset seasonal leaderboards
        const seasonalBoards = Array.from(this.leaderboards.values())
            .filter(lb => lb.type === LeaderboardType.SEASONAL);

        for (const board of seasonalBoards) {
            board.entries = [];
            board.lastUpdated = Date.now();
            board.totalEntries = 0;
        }
    }

    /**
     * End season
     */
    public endSeason(seasonId: string): void {
        const season = this.seasons.get(seasonId);
        if (!season) return;

        season.active = false;

        // Distribute rewards
        if (season.rewards) {
            this.distributeSeasonRewards(season);
        }

        this.onSeasonEndedObservable.notifyObservers(season);

        if (this.currentSeasonId === seasonId) {
            this.currentSeasonId = undefined;
        }
    }

    /**
     * Distribute season rewards
     */
    private distributeSeasonRewards(season: SeasonData): void {
        // Get seasonal leaderboards
        const seasonalBoards = Array.from(this.leaderboards.values())
            .filter(lb => lb.type === LeaderboardType.SEASONAL);

        for (const board of seasonalBoards) {
            for (const entry of board.entries) {
                // Find matching reward
                const reward = season.rewards?.find(r => r.rank === entry.rank);

                if (reward) {
                    // Rewards would be applied to player account
                    console.log(`Player ${entry.playerName} earned season reward for rank ${entry.rank}`);
                }
            }
        }
    }

    /**
     * Get current season
     */
    public getCurrentSeason(): SeasonData | null {
        if (!this.currentSeasonId) return null;
        return this.seasons.get(this.currentSeasonId) || null;
    }

    /**
     * Reset weekly leaderboards
     */
    public resetWeeklyLeaderboards(): void {
        const weeklyBoards = Array.from(this.leaderboards.values())
            .filter(lb => lb.type === LeaderboardType.WEEKLY);

        for (const board of weeklyBoards) {
            board.entries = [];
            board.lastUpdated = Date.now();
            board.totalEntries = 0;
            this.onLeaderboardUpdatedObservable.notifyObservers(board);
        }
    }

    /**
     * Reset daily leaderboards
     */
    public resetDailyLeaderboards(): void {
        const dailyBoards = Array.from(this.leaderboards.values())
            .filter(lb => lb.type === LeaderboardType.DAILY);

        for (const board of dailyBoards) {
            board.entries = [];
            board.lastUpdated = Date.now();
            board.totalEntries = 0;
            this.onLeaderboardUpdatedObservable.notifyObservers(board);
        }
    }

    /**
     * Start auto update
     */
    private startAutoUpdate(): void {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        this.updateTimer = window.setInterval(async () => {
            if (this.serverUrl) {
                // Refresh all leaderboards
                for (const board of this.leaderboards.values()) {
                    await this.getLeaderboard(board.id, undefined, true);
                }
            }
        }, this.updateInterval);
    }

    /**
     * Subscribe to rank changes
     */
    public onRankChanged(callback: (change: RankChange) => void): void {
        this.onRankChangedObservable.add(callback);
    }

    /**
     * Subscribe to leaderboard updates
     */
    public onLeaderboardUpdated(callback: (leaderboard: Leaderboard) => void): void {
        this.onLeaderboardUpdatedObservable.add(callback);
    }

    /**
     * Subscribe to season end
     */
    public onSeasonEnded(callback: (season: SeasonData) => void): void {
        this.onSeasonEndedObservable.add(callback);
    }

    /**
     * Enable/disable system
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Set server URL
     */
    public setServerUrl(url: string): void {
        this.serverUrl = url;
    }

    /**
     * Set auto update
     */
    public setAutoUpdate(enabled: boolean, interval?: number): void {
        this.autoUpdate = enabled;

        if (interval) {
            this.updateInterval = interval;
        }

        if (enabled) {
            this.startAutoUpdate();
        } else if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = undefined;
        }
    }

    /**
     * Clear cache
     */
    public clearCache(): void {
        this.lastFetchTime.clear();
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        this.leaderboards.clear();
        this.playerScores.clear();
        this.rankHistory.clear();
        this.seasons.clear();

        this.onRankChangedObservable.clear();
        this.onLeaderboardUpdatedObservable.clear();
        this.onSeasonEndedObservable.clear();
    }
}
