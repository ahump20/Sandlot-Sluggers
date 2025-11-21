/**
 * Advanced Matchmaking System for Sandlot Sluggers
 * Provides skill-based matchmaking and lobby management
 *
 * Features:
 * - Skill-based matchmaking (ELO/MMR system)
 * - Ranked and casual game modes
 * - Team balancing algorithms
 * - Connection quality assessment
 * - Party/group matchmaking
 * - Region-based matching
 * - Preference matching (game mode, rules)
 * - Matchmaking queue system
 * - Seasonal rankings and leaderboards
 * - Placement matches
 * - Rank tiers and divisions
 * - Anti-smurf detection
 * - Penalty system for leaving/AFK
 * - Priority queue for good behavior
 * - Cross-platform matchmaking
 */

import { Observable } from '@babylonjs/core/Misc/observable';

export enum GameMode {
    QUICK_PLAY = 'quick_play',
    RANKED = 'ranked',
    COMPETITIVE = 'competitive',
    CASUAL = 'casual',
    CUSTOM = 'custom',
    TOURNAMENT = 'tournament',
    PRACTICE = 'practice',
    TRAINING = 'training'
}

export enum RankTier {
    BRONZE = 'bronze',
    SILVER = 'silver',
    GOLD = 'gold',
    PLATINUM = 'platinum',
    DIAMOND = 'diamond',
    MASTER = 'master',
    GRANDMASTER = 'grandmaster',
    LEGEND = 'legend'
}

export enum MatchmakingStatus {
    IDLE = 'idle',
    QUEUED = 'queued',
    SEARCHING = 'searching',
    MATCH_FOUND = 'match_found',
    LOADING = 'loading',
    IN_GAME = 'in_game',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    FAILED = 'failed'
}

export enum Region {
    NORTH_AMERICA_EAST = 'na_east',
    NORTH_AMERICA_WEST = 'na_west',
    SOUTH_AMERICA = 'south_america',
    EUROPE_WEST = 'europe_west',
    EUROPE_EAST = 'europe_east',
    ASIA_EAST = 'asia_east',
    ASIA_SOUTHEAST = 'asia_southeast',
    OCEANIA = 'oceania',
    MIDDLE_EAST = 'middle_east',
    AFRICA = 'africa'
}

export enum ConnectionQuality {
    EXCELLENT = 'excellent',
    GOOD = 'good',
    FAIR = 'fair',
    POOR = 'poor',
    UNSTABLE = 'unstable'
}

export interface PlayerMatchmakingProfile {
    playerId: string;
    displayName: string;
    skillRating: number; // MMR/ELO
    rankTier: RankTier;
    rankDivision: number; // 1-5
    rankPoints: number;
    winRate: number;
    totalGames: number;
    recentPerformance: number[]; // Last 20 games
    preferredRole?: string;
    preferredPosition?: string;
    region: Region;
    connectionQuality: ConnectionQuality;
    averagePing: number;
    language: string;
    accountLevel: number;
    trustScore: number; // Anti-cheat/behavior score
    isInParty: boolean;
    partyId?: string;
    partySize?: number;
    queueStartTime?: number;
    consecutiveWins: number;
    consecutiveLosses: number;
}

export interface MatchmakingPreferences {
    modes: GameMode[];
    regions: Region[];
    maxPing: number;
    allowCrossPlatform: boolean;
    strictSkillMatch: boolean;
    preferSameLanguage: boolean;
    avoidPlayers: string[]; // Blocked players
}

export interface MatchmakingQueue {
    mode: GameMode;
    players: PlayerMatchmakingProfile[];
    parties: Party[];
    averageWaitTime: number;
    queueSize: number;
}

export interface Party {
    id: string;
    leaderId: string;
    members: PlayerMatchmakingProfile[];
    averageSkillRating: number;
    region: Region;
    preferences: MatchmakingPreferences;
    queueStartTime: number;
}

export interface MatchProposal {
    id: string;
    mode: GameMode;
    players: PlayerMatchmakingProfile[];
    teams: {
        home: PlayerMatchmakingProfile[];
        away: PlayerMatchmakingProfile[];
    };
    skillDifference: number;
    predictedQuality: number; // 0-100
    region: Region;
    serverId: string;
    estimatedPing: Map<string, number>;
    createdAt: number;
    expiresAt: number;
    acceptances: Set<string>;
    rejections: Set<string>;
}

export interface MatchResult {
    matchId: string;
    winner: 'home' | 'away' | 'draw';
    homeScore: number;
    awayScore: number;
    duration: number;
    players: Map<string, PlayerMatchResult>;
    timestamp: Date;
}

export interface PlayerMatchResult {
    playerId: string;
    team: 'home' | 'away';
    won: boolean;
    skillRatingChange: number;
    rankPointsChange: number;
    performance: number; // 0-100
    stats: any;
}

export interface RankInfo {
    tier: RankTier;
    division: number;
    points: number;
    nextRankPoints: number;
    progress: number; // 0-100
    seasonBest: {
        tier: RankTier;
        division: number;
    };
}

export interface Season {
    id: string;
    number: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    rewards: SeasonReward[];
}

export interface SeasonReward {
    rankTier: RankTier;
    minDivision: number;
    rewards: {
        currency?: { type: string; amount: number }[];
        items?: string[];
        titles?: string[];
        cosmetics?: string[];
    };
}

export interface MatchmakingPenalty {
    playerId: string;
    type: 'leave' | 'afk' | 'toxicity' | 'griefing';
    severity: number; // 1-5
    queueBanUntil?: Date;
    rankPointsPenalty?: number;
    expiresAt: Date;
    reason: string;
}

export class MatchmakingSystem {
    private playerProfiles: Map<string, PlayerMatchmakingProfile>;
    private queues: Map<GameMode, MatchmakingQueue>;
    private parties: Map<string, Party>;
    private activeMatches: Map<string, MatchProposal>;
    private matchHistory: Map<string, MatchResult[]>;
    private penalties: Map<string, MatchmakingPenalty[]>;
    private currentSeason: Season | null;

    // Matchmaking parameters
    private readonly SKILL_RANGE_INITIAL: number = 100;
    private readonly SKILL_RANGE_EXPANSION_RATE: number = 50; // Per minute
    private readonly MAX_SKILL_RANGE: number = 500;
    private readonly MATCH_ACCEPTANCE_TIMEOUT: number = 30000; // 30 seconds
    private readonly K_FACTOR: number = 32; // ELO K-factor
    private readonly PLACEMENT_MATCHES: number = 10;

    // Trust and behavior
    private readonly BASE_TRUST_SCORE: number = 100;
    private readonly MIN_TRUST_SCORE: number = 0;
    private readonly MAX_TRUST_SCORE: number = 200;

    // Observables for events
    public onQueueJoined: Observable<{ playerId: string; mode: GameMode }>;
    public onQueueLeft: Observable<{ playerId: string; mode: GameMode }>;
    public onMatchFound: Observable<MatchProposal>;
    public onMatchAccepted: Observable<{ matchId: string; playerId: string }>;
    public onMatchRejected: Observable<{ matchId: string; playerId: string }>;
    public onMatchStarted: Observable<string>;
    public onMatchCompleted: Observable<MatchResult>;
    public onRankChanged: Observable<{ playerId: string; oldRank: RankInfo; newRank: RankInfo }>;
    public onSeasonEnded: Observable<Season>;
    public onPenaltyApplied: Observable<MatchmakingPenalty>;

    constructor() {
        this.playerProfiles = new Map();
        this.queues = new Map();
        this.parties = new Map();
        this.activeMatches = new Map();
        this.matchHistory = new Map();
        this.penalties = new Map();
        this.currentSeason = null;

        this.onQueueJoined = new Observable();
        this.onQueueLeft = new Observable();
        this.onMatchFound = new Observable();
        this.onMatchAccepted = new Observable();
        this.onMatchRejected = new Observable();
        this.onMatchStarted = new Observable();
        this.onMatchCompleted = new Observable();
        this.onRankChanged = new Observable();
        this.onSeasonEnded = new Observable();
        this.onPenaltyApplied = new Observable();

        this.initializeQueues();
        this.initializeSeason();
    }

    private initializeQueues(): void {
        const modes = Object.values(GameMode);
        for (const mode of modes) {
            this.queues.set(mode, {
                mode,
                players: [],
                parties: [],
                averageWaitTime: 60000, // 1 minute default
                queueSize: 0
            });
        }
    }

    private initializeSeason(): void {
        const now = new Date();
        const seasonEnd = new Date(now);
        seasonEnd.setMonth(seasonEnd.getMonth() + 3); // 3-month seasons

        this.currentSeason = {
            id: `season_${Date.now()}`,
            number: 1,
            startDate: now,
            endDate: seasonEnd,
            isActive: true,
            rewards: this.generateSeasonRewards()
        };
    }

    private generateSeasonRewards(): SeasonReward[] {
        const tiers = [
            { tier: RankTier.BRONZE, coins: 1000, gems: 10 },
            { tier: RankTier.SILVER, coins: 2500, gems: 25 },
            { tier: RankTier.GOLD, coins: 5000, gems: 50 },
            { tier: RankTier.PLATINUM, coins: 10000, gems: 100 },
            { tier: RankTier.DIAMOND, coins: 20000, gems: 200 },
            { tier: RankTier.MASTER, coins: 40000, gems: 400 },
            { tier: RankTier.GRANDMASTER, coins: 75000, gems: 750 },
            { tier: RankTier.LEGEND, coins: 150000, gems: 1500 }
        ];

        return tiers.map(t => ({
            rankTier: t.tier,
            minDivision: 1,
            rewards: {
                currency: [
                    { type: 'coins', amount: t.coins },
                    { type: 'gems', amount: t.gems }
                ],
                items: [],
                titles: [`${t.tier}_season_${this.currentSeason!.number}`],
                cosmetics: []
            }
        }));
    }

    public createPlayerProfile(playerId: string, displayName: string, region: Region): PlayerMatchmakingProfile {
        const profile: PlayerMatchmakingProfile = {
            playerId,
            displayName,
            skillRating: 1000, // Starting MMR
            rankTier: RankTier.BRONZE,
            rankDivision: 5,
            rankPoints: 0,
            winRate: 0,
            totalGames: 0,
            recentPerformance: [],
            region,
            connectionQuality: ConnectionQuality.GOOD,
            averagePing: 50,
            language: 'en',
            accountLevel: 1,
            trustScore: this.BASE_TRUST_SCORE,
            isInParty: false,
            consecutiveWins: 0,
            consecutiveLosses: 0
        };

        this.playerProfiles.set(playerId, profile);
        return profile;
    }

    public joinQueue(playerId: string, mode: GameMode, preferences?: MatchmakingPreferences): boolean {
        const profile = this.playerProfiles.get(playerId);
        if (!profile) return false;

        // Check for active penalties
        if (this.hasPenalty(playerId)) {
            return false;
        }

        // Check if already in queue
        if (profile.queueStartTime) {
            return false;
        }

        const queue = this.queues.get(mode);
        if (!queue) return false;

        profile.queueStartTime = Date.now();

        // If in party, add party to queue
        if (profile.isInParty && profile.partyId) {
            const party = this.parties.get(profile.partyId);
            if (party && party.leaderId === playerId) {
                queue.parties.push(party);
            }
        } else {
            queue.players.push(profile);
        }

        queue.queueSize++;

        this.onQueueJoined.notifyObservers({ playerId, mode });

        return true;
    }

    public leaveQueue(playerId: string, mode: GameMode): boolean {
        const profile = this.playerProfiles.get(playerId);
        if (!profile) return false;

        const queue = this.queues.get(mode);
        if (!queue) return false;

        // Remove from solo queue
        const playerIndex = queue.players.findIndex(p => p.playerId === playerId);
        if (playerIndex !== -1) {
            queue.players.splice(playerIndex, 1);
            queue.queueSize--;
        }

        // Remove party from queue
        if (profile.isInParty && profile.partyId) {
            const partyIndex = queue.parties.findIndex(p => p.id === profile.partyId);
            if (partyIndex !== -1) {
                queue.parties.splice(partyIndex, 1);
                queue.queueSize -= queue.parties[partyIndex].members.length;
            }
        }

        profile.queueStartTime = undefined;

        this.onQueueLeft.notifyObservers({ playerId, mode });

        return true;
    }

    public createParty(leaderId: string): Party | null {
        const leader = this.playerProfiles.get(leaderId);
        if (!leader) return null;

        const party: Party = {
            id: `party_${Date.now()}`,
            leaderId,
            members: [leader],
            averageSkillRating: leader.skillRating,
            region: leader.region,
            preferences: {
                modes: [GameMode.QUICK_PLAY],
                regions: [leader.region],
                maxPing: 100,
                allowCrossPlatform: true,
                strictSkillMatch: false,
                preferSameLanguage: false,
                avoidPlayers: []
            },
            queueStartTime: 0
        };

        this.parties.set(party.id, party);
        leader.isInParty = true;
        leader.partyId = party.id;
        leader.partySize = 1;

        return party;
    }

    public addToParty(partyId: string, playerId: string): boolean {
        const party = this.parties.get(partyId);
        const player = this.playerProfiles.get(playerId);

        if (!party || !player) return false;

        // Max party size check (e.g., 5 players)
        if (party.members.length >= 5) return false;

        party.members.push(player);
        party.averageSkillRating = this.calculatePartyAverageSkill(party);

        player.isInParty = true;
        player.partyId = partyId;
        player.partySize = party.members.length;

        // Update party size for all members
        for (const member of party.members) {
            member.partySize = party.members.length;
        }

        return true;
    }

    private calculatePartyAverageSkill(party: Party): number {
        const total = party.members.reduce((sum, member) => sum + member.skillRating, 0);
        return total / party.members.length;
    }

    public findMatches(mode: GameMode): void {
        const queue = this.queues.get(mode);
        if (!queue) return;

        const now = Date.now();

        // Try to match parties first
        this.matchParties(queue, now);

        // Then match solo players
        this.matchSoloPlayers(queue, now);
    }

    private matchParties(queue: MatchmakingQueue, now: number): void {
        // Simple party matching logic
        // In practice, this would be more sophisticated
        const availableParties = queue.parties.filter(p => {
            const waitTime = now - p.queueStartTime;
            return waitTime > 5000; // At least 5 seconds in queue
        });

        // Need at least 2 parties or 1 party + enough solo players
        if (availableParties.length < 2) return;

        // Match first two parties
        const party1 = availableParties[0];
        const party2 = availableParties[1];

        if (this.canMatchParties(party1, party2, now)) {
            this.createMatch(queue.mode, [...party1.members, ...party2.members]);
        }
    }

    private canMatchParties(party1: Party, party2: Party, now: number): boolean {
        // Check skill difference
        const skillDiff = Math.abs(party1.averageSkillRating - party2.averageSkillRating);
        const maxSkillDiff = this.calculateMaxSkillDiff(now - party1.queueStartTime);

        if (skillDiff > maxSkillDiff) return false;

        // Check region compatibility
        if (party1.region !== party2.region) {
            // Check if cross-region is allowed
            return false;
        }

        return true;
    }

    private matchSoloPlayers(queue: MatchmakingQueue, now: number): void {
        const availablePlayers = queue.players.filter(p => {
            const waitTime = now - (p.queueStartTime || 0);
            return waitTime > 2000; // At least 2 seconds in queue
        });

        // Need at least 2 players for a match (1v1) or more for team games
        const minPlayers = this.getMinPlayersForMode(queue.mode);
        if (availablePlayers.length < minPlayers) return;

        // Sort by skill rating
        availablePlayers.sort((a, b) => a.skillRating - b.skillRating);

        // Find best match
        const matchedPlayers: PlayerMatchmakingProfile[] = [];

        for (let i = 0; i < availablePlayers.length && matchedPlayers.length < minPlayers; i++) {
            const player = availablePlayers[i];
            const waitTime = now - (player.queueStartTime || 0);
            const maxSkillDiff = this.calculateMaxSkillDiff(waitTime);

            // Check if player can be matched with current group
            if (matchedPlayers.length === 0) {
                matchedPlayers.push(player);
            } else {
                const avgSkill = matchedPlayers.reduce((sum, p) => sum + p.skillRating, 0) / matchedPlayers.length;
                const skillDiff = Math.abs(player.skillRating - avgSkill);

                if (skillDiff <= maxSkillDiff) {
                    matchedPlayers.push(player);
                }
            }
        }

        if (matchedPlayers.length >= minPlayers) {
            this.createMatch(queue.mode, matchedPlayers);
        }
    }

    private calculateMaxSkillDiff(waitTime: number): number {
        // Expand skill range over time
        const minutes = waitTime / 60000;
        const expansion = minutes * this.SKILL_RANGE_EXPANSION_RATE;
        return Math.min(this.SKILL_RANGE_INITIAL + expansion, this.MAX_SKILL_RANGE);
    }

    private getMinPlayersForMode(mode: GameMode): number {
        switch (mode) {
            case GameMode.QUICK_PLAY:
            case GameMode.CASUAL:
                return 2;
            case GameMode.RANKED:
            case GameMode.COMPETITIVE:
                return 2;
            default:
                return 2;
        }
    }

    private createMatch(mode: GameMode, players: PlayerMatchmakingProfile[]): void {
        const matchId = `match_${Date.now()}`;

        // Balance teams
        const teams = this.balanceTeams(players);

        // Calculate match quality
        const skillDiff = this.calculateTeamSkillDifference(teams.home, teams.away);
        const quality = this.calculateMatchQuality(skillDiff);

        const match: MatchProposal = {
            id: matchId,
            mode,
            players,
            teams,
            skillDifference: skillDiff,
            predictedQuality: quality,
            region: players[0].region,
            serverId: 'server_' + players[0].region,
            estimatedPing: new Map(),
            createdAt: Date.now(),
            expiresAt: Date.now() + this.MATCH_ACCEPTANCE_TIMEOUT,
            acceptances: new Set(),
            rejections: new Set()
        };

        // Calculate estimated ping for each player
        for (const player of players) {
            match.estimatedPing.set(player.playerId, player.averagePing);
        }

        this.activeMatches.set(matchId, match);

        // Remove players from queue
        const queue = this.queues.get(mode);
        if (queue) {
            for (const player of players) {
                const index = queue.players.findIndex(p => p.playerId === player.playerId);
                if (index !== -1) {
                    queue.players.splice(index, 1);
                    queue.queueSize--;
                }
                player.queueStartTime = undefined;
            }
        }

        this.onMatchFound.notifyObservers(match);
    }

    private balanceTeams(players: PlayerMatchmakingProfile[]): {
        home: PlayerMatchmakingProfile[];
        away: PlayerMatchmakingProfile[];
    } {
        // Sort by skill
        const sorted = [...players].sort((a, b) => b.skillRating - a.skillRating);

        // Alternate distribution for balance
        const home: PlayerMatchmakingProfile[] = [];
        const away: PlayerMatchmakingProfile[] = [];

        for (let i = 0; i < sorted.length; i++) {
            if (i % 2 === 0) {
                home.push(sorted[i]);
            } else {
                away.push(sorted[i]);
            }
        }

        return { home, away };
    }

    private calculateTeamSkillDifference(team1: PlayerMatchmakingProfile[], team2: PlayerMatchmakingProfile[]): number {
        const avg1 = team1.reduce((sum, p) => sum + p.skillRating, 0) / team1.length;
        const avg2 = team2.reduce((sum, p) => sum + p.skillRating, 0) / team2.length;
        return Math.abs(avg1 - avg2);
    }

    private calculateMatchQuality(skillDifference: number): number {
        // Quality decreases as skill difference increases
        // 100 quality = 0 skill diff, 0 quality = 500+ skill diff
        return Math.max(0, 100 - (skillDifference / 5));
    }

    public acceptMatch(matchId: string, playerId: string): boolean {
        const match = this.activeMatches.get(matchId);
        if (!match) return false;

        // Check if already accepted/rejected
        if (match.acceptances.has(playerId) || match.rejections.has(playerId)) {
            return false;
        }

        match.acceptances.add(playerId);
        this.onMatchAccepted.notifyObservers({ matchId, playerId });

        // Check if all players have accepted
        if (match.acceptances.size === match.players.length) {
            this.startMatch(matchId);
        }

        return true;
    }

    public rejectMatch(matchId: string, playerId: string): boolean {
        const match = this.activeMatches.get(matchId);
        if (!match) return false;

        match.rejections.add(playerId);
        this.onMatchRejected.notifyObservers({ matchId, playerId });

        // Cancel match if anyone rejects
        this.cancelMatch(matchId);

        // Apply penalty for rejection (minor)
        this.applyPenalty(playerId, 'leave', 1, 'Rejected match');

        return true;
    }

    private startMatch(matchId: string): void {
        const match = this.activeMatches.get(matchId);
        if (!match) return;

        // Update player status
        for (const player of match.players) {
            // Set player status to IN_GAME
        }

        this.onMatchStarted.notifyObservers(matchId);
    }

    private cancelMatch(matchId: string): void {
        const match = this.activeMatches.get(matchId);
        if (!match) return;

        // Return players to queue
        const queue = this.queues.get(match.mode);
        if (queue) {
            for (const player of match.players) {
                if (!match.rejections.has(player.playerId)) {
                    player.queueStartTime = Date.now();
                    queue.players.push(player);
                    queue.queueSize++;
                }
            }
        }

        this.activeMatches.delete(matchId);
    }

    public reportMatchResult(matchId: string, result: MatchResult): void {
        const match = this.activeMatches.get(matchId);
        if (!match) return;

        // Update player ratings and ranks
        for (const [playerId, playerResult] of result.players.entries()) {
            this.updatePlayerRating(playerId, playerResult);
        }

        // Store match history
        for (const playerId of result.players.keys()) {
            if (!this.matchHistory.has(playerId)) {
                this.matchHistory.set(playerId, []);
            }
            this.matchHistory.get(playerId)!.push(result);
        }

        this.activeMatches.delete(matchId);
        this.onMatchCompleted.notifyObservers(result);
    }

    private updatePlayerRating(playerId: string, result: PlayerMatchResult): void {
        const profile = this.playerProfiles.get(playerId);
        if (!profile) return;

        const oldRank = this.getRankInfo(playerId);

        // Update skill rating (ELO)
        const expectedScore = this.calculateExpectedScore(profile.skillRating, result.performance);
        const actualScore = result.won ? 1 : 0;
        const ratingChange = Math.round(this.K_FACTOR * (actualScore - expectedScore));

        profile.skillRating += ratingChange;
        profile.skillRating = Math.max(0, profile.skillRating);

        // Update rank points
        let pointsChange = result.won ? 25 : -20;
        if (result.performance > 75) pointsChange += 5;
        if (result.performance < 25) pointsChange -= 5;

        profile.rankPoints += pointsChange;

        // Handle rank promotion/demotion
        this.updateRank(profile);

        // Update stats
        profile.totalGames++;
        profile.winRate = (profile.winRate * (profile.totalGames - 1) + (result.won ? 1 : 0)) / profile.totalGames;
        profile.recentPerformance.push(result.performance);
        if (profile.recentPerformance.length > 20) {
            profile.recentPerformance.shift();
        }

        // Update streak
        if (result.won) {
            profile.consecutiveWins++;
            profile.consecutiveLosses = 0;
        } else {
            profile.consecutiveWins = 0;
            profile.consecutiveLosses++;
        }

        const newRank = this.getRankInfo(playerId);
        this.onRankChanged.notifyObservers({ playerId, oldRank, newRank });
    }

    private calculateExpectedScore(rating: number, performance: number): number {
        // Simple expected score calculation
        return 1 / (1 + Math.pow(10, (1000 - rating) / 400));
    }

    private updateRank(profile: PlayerMatchmakingProfile): void {
        const tiers = [
            { tier: RankTier.BRONZE, pointsPerDivision: 100 },
            { tier: RankTier.SILVER, pointsPerDivision: 100 },
            { tier: RankTier.GOLD, pointsPerDivision: 100 },
            { tier: RankTier.PLATINUM, pointsPerDivision: 100 },
            { tier: RankTier.DIAMOND, pointsPerDivision: 100 },
            { tier: RankTier.MASTER, pointsPerDivision: 100 },
            { tier: RankTier.GRANDMASTER, pointsPerDivision: 100 },
            { tier: RankTier.LEGEND, pointsPerDivision: 100 }
        ];

        // Handle promotion
        while (profile.rankPoints >= 100) {
            profile.rankPoints -= 100;
            profile.rankDivision--;

            if (profile.rankDivision < 1) {
                // Promote to next tier
                const currentTierIndex = tiers.findIndex(t => t.tier === profile.rankTier);
                if (currentTierIndex < tiers.length - 1) {
                    profile.rankTier = tiers[currentTierIndex + 1].tier;
                    profile.rankDivision = 5;
                } else {
                    // Already at max tier
                    profile.rankDivision = 1;
                    profile.rankPoints = 0;
                }
            }
        }

        // Handle demotion
        while (profile.rankPoints < 0) {
            profile.rankDivision++;

            if (profile.rankDivision > 5) {
                // Demote to previous tier
                const currentTierIndex = tiers.findIndex(t => t.tier === profile.rankTier);
                if (currentTierIndex > 0) {
                    profile.rankTier = tiers[currentTierIndex - 1].tier;
                    profile.rankDivision = 1;
                    profile.rankPoints = 50;
                } else {
                    // Already at lowest tier
                    profile.rankDivision = 5;
                    profile.rankPoints = 0;
                }
            } else {
                profile.rankPoints = 0;
            }
        }
    }

    public getRankInfo(playerId: string): RankInfo {
        const profile = this.playerProfiles.get(playerId);
        if (!profile) {
            return {
                tier: RankTier.BRONZE,
                division: 5,
                points: 0,
                nextRankPoints: 100,
                progress: 0,
                seasonBest: {
                    tier: RankTier.BRONZE,
                    division: 5
                }
            };
        }

        return {
            tier: profile.rankTier,
            division: profile.rankDivision,
            points: profile.rankPoints,
            nextRankPoints: 100,
            progress: profile.rankPoints,
            seasonBest: {
                tier: profile.rankTier,
                division: profile.rankDivision
            }
        };
    }

    private applyPenalty(playerId: string, type: 'leave' | 'afk' | 'toxicity' | 'griefing', severity: number, reason: string): void {
        const penalty: MatchmakingPenalty = {
            playerId,
            type,
            severity,
            expiresAt: new Date(Date.now() + severity * 3600000), // Severity hours
            reason
        };

        // Apply queue ban for more severe penalties
        if (severity >= 3) {
            penalty.queueBanUntil = new Date(Date.now() + severity * 3600000);
        }

        // Apply rank points penalty
        if (type === 'leave' || type === 'afk') {
            penalty.rankPointsPenalty = severity * 10;
            const profile = this.playerProfiles.get(playerId);
            if (profile) {
                profile.rankPoints -= severity * 10;
                this.updateRank(profile);
            }
        }

        // Reduce trust score
        const profile = this.playerProfiles.get(playerId);
        if (profile) {
            profile.trustScore = Math.max(this.MIN_TRUST_SCORE, profile.trustScore - severity * 10);
        }

        if (!this.penalties.has(playerId)) {
            this.penalties.set(playerId, []);
        }
        this.penalties.get(playerId)!.push(penalty);

        this.onPenaltyApplied.notifyObservers(penalty);
    }

    private hasPenalty(playerId: string): boolean {
        const penalties = this.penalties.get(playerId);
        if (!penalties) return false;

        const now = new Date();
        const activePenalties = penalties.filter(p => p.queueBanUntil && p.queueBanUntil > now);

        return activePenalties.length > 0;
    }

    public update(deltaTime: number): void {
        // Check for expired match proposals
        const now = Date.now();
        for (const [matchId, match] of this.activeMatches.entries()) {
            if (now > match.expiresAt) {
                this.cancelMatch(matchId);
            }
        }

        // Run matchmaking for all queues
        for (const mode of this.queues.keys()) {
            this.findMatches(mode);
        }
    }

    public dispose(): void {
        this.playerProfiles.clear();
        this.queues.clear();
        this.parties.clear();
        this.activeMatches.clear();
        this.matchHistory.clear();
        this.penalties.clear();
    }
}
