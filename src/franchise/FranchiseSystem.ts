import { Observable } from '@babylonjs/core';

/**
 * Season phase
 */
export enum SeasonPhase {
    PRE_SEASON = 'pre_season',
    REGULAR_SEASON = 'regular_season',
    POST_SEASON = 'post_season',
    OFF_SEASON = 'off_season'
}

/**
 * Team
 */
export interface Team {
    id: string;
    name: string;
    city: string;
    abbreviation: string;
    logo: string;
    colors: {
        primary: string;
        secondary: string;
    };
    division: string;
    conference: string;
    stadium: string;
    owner: string;
    manager: string;
    budget: number;
    reputation: number;
    fanBase: number;
    roster: string[];
    stats: TeamStats;
}

/**
 * Team stats
 */
export interface TeamStats {
    wins: number;
    losses: number;
    ties: number;
    winningPercentage: number;
    runsScored: number;
    runsAllowed: number;
    runDifferential: number;
    homeRecord: { wins: number; losses: number };
    awayRecord: { wins: number; losses: number };
    streak: number;
    lastTenRecord: { wins: number; losses: number };
}

/**
 * Player contract
 */
export interface PlayerContract {
    playerId: string;
    teamId: string;
    salary: number;
    yearsRemaining: number;
    totalYears: number;
    noTradeClause: boolean;
    bonuses?: {
        type: string;
        amount: number;
        condition: string;
    }[];
    startYear: number;
    endYear: number;
}

/**
 * Free agent
 */
export interface FreeAgent {
    playerId: string;
    playerName: string;
    position: string;
    age: number;
    overall: number;
    potential: number;
    demandingSalary: number;
    yearsDesired: number;
    interested: boolean;
}

/**
 * Trade proposal
 */
export interface TradeProposal {
    id: string;
    fromTeamId: string;
    toTeamId: string;
    fromPlayers: string[];
    toPlayers: string[];
    fromPicks?: DraftPick[];
    toPicks?: DraftPick[];
    status: 'pending' | 'accepted' | 'rejected' | 'countered';
    timestamp: number;
    expiryDate: number;
}

/**
 * Draft pick
 */
export interface DraftPick {
    year: number;
    round: number;
    originalTeam: string;
    currentOwner: string;
}

/**
 * Draft prospect
 */
export interface DraftProspect {
    id: string;
    name: string;
    position: string;
    age: number;
    overall: number;
    potential: number;
    college?: string;
    projectedRound: number;
    strengths: string[];
    weaknesses: string[];
    scouted: boolean;
    scoutReport?: {
        hitting: number;
        power: number;
        fielding: number;
        speed: number;
        potential: number;
        character: number;
    };
}

/**
 * Season schedule
 */
export interface SeasonSchedule {
    seasonYear: number;
    games: Game[];
    currentWeek: number;
    totalWeeks: number;
}

/**
 * Game
 */
export interface Game {
    id: string;
    week: number;
    homeTeamId: string;
    awayTeamId: string;
    scheduledDate: number;
    played: boolean;
    homeScore?: number;
    awayScore?: number;
    winnerId?: string;
    attendance?: number;
}

/**
 * Standings
 */
export interface Standings {
    division: string;
    teams: StandingsEntry[];
}

/**
 * Standings entry
 */
export interface StandingsEntry {
    rank: number;
    teamId: string;
    teamName: string;
    wins: number;
    losses: number;
    winningPercentage: number;
    gamesBack: number;
    homeRecord: string;
    awayRecord: string;
    divisionRecord: string;
    streak: string;
    lastTen: string;
}

/**
 * Playoff bracket
 */
export interface PlayoffBracket {
    year: number;
    rounds: PlayoffRound[];
}

/**
 * Playoff round
 */
export interface PlayoffRound {
    roundNumber: number;
    name: string;
    series: PlayoffSeries[];
}

/**
 * Playoff series
 */
export interface PlayoffSeries {
    id: string;
    team1Id: string;
    team2Id: string;
    team1Seed: number;
    team2Seed: number;
    team1Wins: number;
    team2Wins: number;
    games: Game[];
    winnerId?: string;
    seriesLength: number;
}

/**
 * Award
 */
export interface Award {
    id: string;
    name: string;
    category: 'mvp' | 'rookie' | 'cy_young' | 'gold_glove' | 'silver_slugger' | 'manager';
    winnerId: string;
    winnerName: string;
    year: number;
    stats?: any;
}

/**
 * Transaction
 */
export interface Transaction {
    id: string;
    type: 'trade' | 'signing' | 'release' | 'draft' | 'waiver' | 'injury' | 'activation';
    teamId: string;
    playerId?: string;
    description: string;
    timestamp: number;
    details?: any;
}

/**
 * Scouting report
 */
export interface ScoutingReport {
    playerId: string;
    scoutedBy: string;
    scoutedDate: number;
    overall: number;
    potential: number;
    ratings: Map<string, number>;
    strengths: string[];
    weaknesses: string[];
    notes: string;
    recommendation: 'must_have' | 'good_fit' | 'maybe' | 'pass';
}

/**
 * Franchise mode save
 */
export interface FranchiseSave {
    id: string;
    name: string;
    currentYear: number;
    currentPhase: SeasonPhase;
    userTeamId: string;
    difficulty: string;
    totalSeasons: number;
    championships: number;
    playoffAppearances: number;
    createdAt: number;
    lastPlayed: number;
    autoSave: boolean;
}

/**
 * Staff member
 */
export interface StaffMember {
    id: string;
    name: string;
    role: 'manager' | 'pitching_coach' | 'hitting_coach' | 'bench_coach' | 'trainer' | 'scout';
    rating: number;
    salary: number;
    yearsWithTeam: number;
    specialties: string[];
}

/**
 * Franchise System
 * Comprehensive career/franchise mode with full season simulation
 */
export class FranchiseSystem {
    // Franchise save
    private franchise?: FranchiseSave;

    // Current season
    private currentSeason: number = 2024;
    private seasonPhase: SeasonPhase = SeasonPhase.PRE_SEASON;

    // Teams
    private teams: Map<string, Team> = new Map();
    private userTeamId?: string;

    // Schedule
    private schedule?: SeasonSchedule;

    // Standings
    private standings: Map<string, Standings> = new Map();

    // Playoffs
    private playoffBracket?: PlayoffBracket;

    // Contracts and free agency
    private contracts: Map<string, PlayerContract> = new Map();
    private freeAgents: Map<string, FreeAgent> = new Map();

    // Trades
    private tradeProposals: Map<string, TradeProposal> = new Map();

    // Draft
    private draftProspects: Map<string, DraftProspect> = new Map();
    private draftPicks: Map<string, DraftPick[]> = new Map();

    // Transactions
    private transactions: Transaction[] = [];
    private maxTransactions: number = 1000;

    // Scouting
    private scoutingReports: Map<string, ScoutingReport> = new Map();
    private scoutingBudget: number = 0;

    // Staff
    private teamStaff: Map<string, StaffMember[]> = new Map();

    // Awards
    private seasonAwards: Map<number, Award[]> = new Map();

    // Observables
    private onSeasonAdvancedObservable: Observable<number> = new Observable();
    private onPhaseChangedObservable: Observable<SeasonPhase> = new Observable();
    private onGameCompletedObservable: Observable<Game> = new Observable();
    private onTradeCompletedObservable: Observable<TradeProposal> = new Observable();
    private onPlayerSignedObservable: Observable<PlayerContract> = new Observable();
    private onPlayoffsStartedObservable: Observable<PlayoffBracket> = new Observable();

    // Settings
    private enabled: boolean = true;
    private simSpeed: number = 1.0;
    private autoAdvance: boolean = false;

    constructor() {
        this.initializeLeague();
    }

    /**
     * Initialize league
     */
    private initializeLeague(): void {
        // Create divisions
        const divisions = [
            { name: 'AL East', conference: 'AL' },
            { name: 'AL Central', conference: 'AL' },
            { name: 'AL West', conference: 'AL' },
            { name: 'NL East', conference: 'NL' },
            { name: 'NL Central', conference: 'NL' },
            { name: 'NL West', conference: 'NL' }
        ];

        // Create teams (simplified - would have full 30 teams)
        this.createTeam({
            id: 'team_1',
            name: 'Yankees',
            city: 'New York',
            abbreviation: 'NYY',
            logo: 'yankees.png',
            colors: { primary: '#003087', secondary: '#FFFFFF' },
            division: 'AL East',
            conference: 'AL',
            stadium: 'Yankee Stadium',
            owner: 'Hal Steinbrenner',
            manager: 'Aaron Boone',
            budget: 200000000,
            reputation: 95,
            fanBase: 100
        });

        // Initialize draft picks for each team
        for (const team of this.teams.values()) {
            const picks: DraftPick[] = [];
            for (let year = this.currentSeason; year < this.currentSeason + 5; year++) {
                for (let round = 1; round <= 10; round++) {
                    picks.push({
                        year,
                        round,
                        originalTeam: team.id,
                        currentOwner: team.id
                    });
                }
            }
            this.draftPicks.set(team.id, picks);
        }
    }

    /**
     * Create team
     */
    private createTeam(config: Omit<Team, 'roster' | 'stats'>): void {
        const team: Team = {
            ...config,
            roster: [],
            stats: {
                wins: 0,
                losses: 0,
                ties: 0,
                winningPercentage: 0,
                runsScored: 0,
                runsAllowed: 0,
                runDifferential: 0,
                homeRecord: { wins: 0, losses: 0 },
                awayRecord: { wins: 0, losses: 0 },
                streak: 0,
                lastTenRecord: { wins: 0, losses: 0 }
            }
        };

        this.teams.set(team.id, team);
    }

    /**
     * Start new franchise
     */
    public startNewFranchise(
        name: string,
        teamId: string,
        difficulty: string = 'normal'
    ): FranchiseSave {
        this.franchise = {
            id: this.generateId('franchise'),
            name,
            currentYear: this.currentSeason,
            currentPhase: SeasonPhase.PRE_SEASON,
            userTeamId: teamId,
            difficulty,
            totalSeasons: 0,
            championships: 0,
            playoffAppearances: 0,
            createdAt: Date.now(),
            lastPlayed: Date.now(),
            autoSave: true
        };

        this.userTeamId = teamId;

        // Generate initial free agent pool
        this.generateFreeAgents();

        // Generate season schedule
        this.generateSeasonSchedule();

        return this.franchise;
    }

    /**
     * Generate season schedule
     */
    private generateSeasonSchedule(): void {
        const games: Game[] = [];
        const teams = Array.from(this.teams.values());
        let weekNumber = 1;
        let gameId = 1;

        // Generate round-robin schedule (simplified)
        for (let round = 0; round < 10; round++) {
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    const homeTeam = round % 2 === 0 ? teams[i] : teams[j];
                    const awayTeam = round % 2 === 0 ? teams[j] : teams[i];

                    games.push({
                        id: `game_${gameId++}`,
                        week: weekNumber,
                        homeTeamId: homeTeam.id,
                        awayTeamId: awayTeam.id,
                        scheduledDate: this.calculateGameDate(weekNumber),
                        played: false
                    });

                    if (games.length % (teams.length / 2) === 0) {
                        weekNumber++;
                    }
                }
            }
        }

        this.schedule = {
            seasonYear: this.currentSeason,
            games,
            currentWeek: 1,
            totalWeeks: weekNumber - 1
        };
    }

    /**
     * Calculate game date
     */
    private calculateGameDate(week: number): number {
        const seasonStart = new Date(this.currentSeason, 3, 1); // April 1st
        const weekMs = week * 7 * 24 * 60 * 60 * 1000;
        return seasonStart.getTime() + weekMs;
    }

    /**
     * Simulate week
     */
    public simulateWeek(): Game[] {
        if (!this.schedule) return [];

        const weekGames = this.schedule.games.filter(
            g => g.week === this.schedule!.currentWeek && !g.played
        );

        for (const game of weekGames) {
            this.simulateGame(game);
        }

        this.schedule.currentWeek++;

        // Check if regular season complete
        if (this.schedule.currentWeek > this.schedule.totalWeeks) {
            this.advanceToPlayoffs();
        }

        return weekGames;
    }

    /**
     * Simulate game
     */
    private simulateGame(game: Game): void {
        const homeTeam = this.teams.get(game.homeTeamId)!;
        const awayTeam = this.teams.get(game.awayTeamId)!;

        // Simple simulation (would be much more complex in reality)
        const homeScore = Math.floor(Math.random() * 10) + 1;
        const awayScore = Math.floor(Math.random() * 10) + 1;

        game.homeScore = homeScore;
        game.awayScore = awayScore;
        game.winnerId = homeScore > awayScore ? game.homeTeamId : game.awayTeamId;
        game.played = true;
        game.attendance = this.calculateAttendance(homeTeam);

        // Update team stats
        this.updateTeamStats(homeTeam, awayTeam, homeScore, awayScore, true);
        this.updateTeamStats(awayTeam, homeTeam, awayScore, homeScore, false);

        // Update standings
        this.updateStandings();

        this.onGameCompletedObservable.notifyObservers(game);
    }

    /**
     * Calculate attendance
     */
    private calculateAttendance(homeTeam: Team): number {
        const stadiumCapacity = 45000;
        const baseAttendance = stadiumCapacity * (homeTeam.fanBase / 100) * 0.6;
        const variance = Math.random() * 0.3 - 0.15; // +/- 15%
        return Math.floor(baseAttendance * (1 + variance));
    }

    /**
     * Update team stats
     */
    private updateTeamStats(
        team: Team,
        opponent: Team,
        runsScored: number,
        runsAllowed: number,
        isHome: boolean
    ): void {
        const won = runsScored > runsAllowed;

        team.stats.runsScored += runsScored;
        team.stats.runsAllowed += runsAllowed;
        team.stats.runDifferential = team.stats.runsScored - team.stats.runsAllowed;

        if (won) {
            team.stats.wins++;
            team.stats.streak = team.stats.streak > 0 ? team.stats.streak + 1 : 1;
        } else {
            team.stats.losses++;
            team.stats.streak = team.stats.streak < 0 ? team.stats.streak - 1 : -1;
        }

        team.stats.winningPercentage = team.stats.wins / (team.stats.wins + team.stats.losses);

        if (isHome) {
            if (won) team.stats.homeRecord.wins++;
            else team.stats.homeRecord.losses++;
        } else {
            if (won) team.stats.awayRecord.wins++;
            else team.stats.awayRecord.losses++;
        }
    }

    /**
     * Update standings
     */
    private updateStandings(): void {
        const divisionStandings = new Map<string, StandingsEntry[]>();

        for (const team of this.teams.values()) {
            if (!divisionStandings.has(team.division)) {
                divisionStandings.set(team.division, []);
            }

            const entry: StandingsEntry = {
                rank: 0,
                teamId: team.id,
                teamName: team.name,
                wins: team.stats.wins,
                losses: team.stats.losses,
                winningPercentage: team.stats.winningPercentage,
                gamesBack: 0,
                homeRecord: `${team.stats.homeRecord.wins}-${team.stats.homeRecord.losses}`,
                awayRecord: `${team.stats.awayRecord.wins}-${team.stats.awayRecord.losses}`,
                divisionRecord: '0-0', // Would calculate actual division record
                streak: team.stats.streak > 0 ? `W${team.stats.streak}` : `L${Math.abs(team.stats.streak)}`,
                lastTen: `${team.stats.lastTenRecord.wins}-${team.stats.lastTenRecord.losses}`
            };

            divisionStandings.get(team.division)!.push(entry);
        }

        // Sort and assign ranks
        for (const [division, entries] of divisionStandings) {
            entries.sort((a, b) => {
                if (b.winningPercentage !== a.winningPercentage) {
                    return b.winningPercentage - a.winningPercentage;
                }
                return b.wins - a.wins;
            });

            const leader = entries[0];
            entries.forEach((entry, index) => {
                entry.rank = index + 1;
                entry.gamesBack = (leader.wins - entry.wins + entry.losses - leader.losses) / 2;
            });

            this.standings.set(division, {
                division,
                teams: entries
            });
        }
    }

    /**
     * Advance to playoffs
     */
    private advanceToPlayoffs(): void {
        this.seasonPhase = SeasonPhase.POST_SEASON;

        // Select playoff teams (top teams from each division + wild cards)
        const playoffTeams = this.selectPlayoffTeams();

        // Generate playoff bracket
        this.playoffBracket = this.generatePlayoffBracket(playoffTeams);

        this.onPlayoffsStartedObservable.notifyObservers(this.playoffBracket);
        this.onPhaseChangedObservable.notifyObservers(SeasonPhase.POST_SEASON);
    }

    /**
     * Select playoff teams
     */
    private selectPlayoffTeams(): Team[] {
        const teams: Team[] = [];

        // Get division winners (6 teams)
        for (const standings of this.standings.values()) {
            const winner = standings.teams[0];
            const team = this.teams.get(winner.teamId);
            if (team) teams.push(team);
        }

        // Get wild card teams (top 4 non-division winners by record)
        const remaining = Array.from(this.teams.values())
            .filter(t => !teams.includes(t))
            .sort((a, b) => b.stats.winningPercentage - a.stats.winningPercentage)
            .slice(0, 4);

        teams.push(...remaining);

        return teams;
    }

    /**
     * Generate playoff bracket
     */
    private generatePlayoffBracket(teams: Team[]): PlayoffBracket {
        // Sort by seed
        teams.sort((a, b) => b.stats.winningPercentage - a.stats.winningPercentage);

        const bracket: PlayoffBracket = {
            year: this.currentSeason,
            rounds: []
        };

        // Wild Card Round
        const wildCardRound: PlayoffRound = {
            roundNumber: 1,
            name: 'Wild Card',
            series: []
        };

        // Create matchups (simplified)
        for (let i = 0; i < 4; i += 2) {
            wildCardRound.series.push({
                id: this.generateId('series'),
                team1Id: teams[i].id,
                team2Id: teams[i + 1].id,
                team1Seed: i + 1,
                team2Seed: i + 2,
                team1Wins: 0,
                team2Wins: 0,
                games: [],
                seriesLength: 3
            });
        }

        bracket.rounds.push(wildCardRound);

        return bracket;
    }

    /**
     * Propose trade
     */
    public proposeTrade(
        fromTeamId: string,
        toTeamId: string,
        fromPlayers: string[],
        toPlayers: string[],
        fromPicks?: DraftPick[],
        toPicks?: DraftPick[]
    ): TradeProposal {
        const proposal: TradeProposal = {
            id: this.generateId('trade'),
            fromTeamId,
            toTeamId,
            fromPlayers,
            toPlayers,
            fromPicks,
            toPicks,
            status: 'pending',
            timestamp: Date.now(),
            expiryDate: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        };

        this.tradeProposals.set(proposal.id, proposal);

        return proposal;
    }

    /**
     * Evaluate trade
     */
    public evaluateTrade(proposalId: string): {
        fairness: number;
        recommendation: 'accept' | 'reject' | 'counter';
    } {
        const proposal = this.tradeProposals.get(proposalId);
        if (!proposal) {
            return { fairness: 0, recommendation: 'reject' };
        }

        // Simple evaluation (would be much more complex in reality)
        const fromValue = proposal.fromPlayers.length * 50;
        const toValue = proposal.toPlayers.length * 50;

        const fairness = Math.min(fromValue, toValue) / Math.max(fromValue, toValue);

        let recommendation: 'accept' | 'reject' | 'counter';
        if (fairness > 0.9) {
            recommendation = 'accept';
        } else if (fairness > 0.7) {
            recommendation = 'counter';
        } else {
            recommendation = 'reject';
        }

        return { fairness, recommendation };
    }

    /**
     * Accept trade
     */
    public acceptTrade(proposalId: string): boolean {
        const proposal = this.tradeProposals.get(proposalId);
        if (!proposal) return false;

        proposal.status = 'accepted';

        // Execute trade
        const fromTeam = this.teams.get(proposal.fromTeamId);
        const toTeam = this.teams.get(proposal.toTeamId);

        if (!fromTeam || !toTeam) return false;

        // Move players
        for (const playerId of proposal.fromPlayers) {
            const index = fromTeam.roster.indexOf(playerId);
            if (index !== -1) {
                fromTeam.roster.splice(index, 1);
                toTeam.roster.push(playerId);

                // Update contract
                const contract = this.contracts.get(playerId);
                if (contract) {
                    contract.teamId = toTeam.id;
                }
            }
        }

        for (const playerId of proposal.toPlayers) {
            const index = toTeam.roster.indexOf(playerId);
            if (index !== -1) {
                toTeam.roster.splice(index, 1);
                fromTeam.roster.push(playerId);

                // Update contract
                const contract = this.contracts.get(playerId);
                if (contract) {
                    contract.teamId = fromTeam.id;
                }
            }
        }

        // Move draft picks
        if (proposal.fromPicks) {
            for (const pick of proposal.fromPicks) {
                pick.currentOwner = toTeam.id;
            }
        }

        if (proposal.toPicks) {
            for (const pick of proposal.toPicks) {
                pick.currentOwner = fromTeam.id;
            }
        }

        // Record transaction
        this.recordTransaction({
            id: this.generateId('trans'),
            type: 'trade',
            teamId: fromTeam.id,
            description: `Traded with ${toTeam.name}`,
            timestamp: Date.now(),
            details: proposal
        });

        this.onTradeCompletedObservable.notifyObservers(proposal);

        return true;
    }

    /**
     * Generate free agents
     */
    private generateFreeAgents(): void {
        // Generate random free agents (simplified)
        for (let i = 0; i < 50; i++) {
            const freeAgent: FreeAgent = {
                playerId: `fa_${i}`,
                playerName: `Free Agent ${i}`,
                position: this.getRandomPosition(),
                age: 20 + Math.floor(Math.random() * 15),
                overall: 60 + Math.floor(Math.random() * 30),
                potential: 60 + Math.floor(Math.random() * 30),
                demandingSalary: 1000000 + Math.floor(Math.random() * 10000000),
                yearsDesired: 1 + Math.floor(Math.random() * 5),
                interested: true
            };

            this.freeAgents.set(freeAgent.playerId, freeAgent);
        }
    }

    /**
     * Sign free agent
     */
    public signFreeAgent(playerId: string, teamId: string, salary: number, years: number): boolean {
        const freeAgent = this.freeAgents.get(playerId);
        const team = this.teams.get(teamId);

        if (!freeAgent || !team) return false;

        // Check budget
        if (team.budget < salary) {
            console.warn('Insufficient budget');
            return false;
        }

        // Create contract
        const contract: PlayerContract = {
            playerId,
            teamId,
            salary,
            yearsRemaining: years,
            totalYears: years,
            noTradeClause: false,
            startYear: this.currentSeason,
            endYear: this.currentSeason + years
        };

        this.contracts.set(playerId, contract);
        team.roster.push(playerId);
        this.freeAgents.delete(playerId);

        // Record transaction
        this.recordTransaction({
            id: this.generateId('trans'),
            type: 'signing',
            teamId,
            playerId,
            description: `Signed ${freeAgent.playerName} to ${years} year contract`,
            timestamp: Date.now(),
            details: contract
        });

        this.onPlayerSignedObservable.notifyObservers(contract);

        return true;
    }

    /**
     * Conduct draft
     */
    public conductDraft(): void {
        // Generate prospects if not already done
        if (this.draftProspects.size === 0) {
            this.generateDraftProspects();
        }

        // Simulate draft (simplified)
        const draftOrder = this.getDraftOrder();
        let pick = 1;

        for (let round = 1; round <= 10; round++) {
            for (const teamId of draftOrder) {
                const prospects = Array.from(this.draftProspects.values())
                    .filter(p => !this.isDrafted(p.id));

                if (prospects.length === 0) break;

                // AI picks best available
                prospects.sort((a, b) => b.overall - a.overall);
                const selectedProspect = prospects[0];

                // Add to team
                const team = this.teams.get(teamId);
                if (team) {
                    team.roster.push(selectedProspect.id);

                    // Create rookie contract
                    const contract: PlayerContract = {
                        playerId: selectedProspect.id,
                        teamId,
                        salary: 500000 + (10 - round) * 50000,
                        yearsRemaining: 3,
                        totalYears: 3,
                        noTradeClause: false,
                        startYear: this.currentSeason,
                        endYear: this.currentSeason + 3
                    };

                    this.contracts.set(selectedProspect.id, contract);

                    // Record transaction
                    this.recordTransaction({
                        id: this.generateId('trans'),
                        type: 'draft',
                        teamId,
                        playerId: selectedProspect.id,
                        description: `Drafted ${selectedProspect.name} in round ${round}, pick ${pick}`,
                        timestamp: Date.now()
                    });
                }

                pick++;
            }
        }
    }

    /**
     * Generate draft prospects
     */
    private generateDraftProspects(): void {
        for (let i = 0; i < 300; i++) {
            const prospect: DraftProspect = {
                id: `prospect_${i}`,
                name: `Prospect ${i}`,
                position: this.getRandomPosition(),
                age: 18 + Math.floor(Math.random() * 4),
                overall: 40 + Math.floor(Math.random() * 40),
                potential: 50 + Math.floor(Math.random() * 40),
                projectedRound: Math.ceil((i + 1) / 30),
                strengths: ['Power', 'Speed'],
                weaknesses: ['Contact', 'Fielding'],
                scouted: false
            };

            this.draftProspects.set(prospect.id, prospect);
        }
    }

    /**
     * Get draft order
     */
    private getDraftOrder(): string[] {
        // Reverse order of standings
        return Array.from(this.teams.values())
            .sort((a, b) => a.stats.winningPercentage - b.stats.winningPercentage)
            .map(t => t.id);
    }

    /**
     * Check if prospect is drafted
     */
    private isDrafted(prospectId: string): boolean {
        for (const team of this.teams.values()) {
            if (team.roster.includes(prospectId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Advance to off-season
     */
    public advanceToOffSeason(): void {
        this.seasonPhase = SeasonPhase.OFF_SEASON;

        // Process contract expirations
        this.processContractExpirations();

        // Generate new free agents
        this.generateFreeAgents();

        // Award season awards
        this.awardSeasonAwards();

        this.onPhaseChangedObservable.notifyObservers(SeasonPhase.OFF_SEASON);
    }

    /**
     * Process contract expirations
     */
    private processContractExpirations(): void {
        for (const [playerId, contract] of this.contracts) {
            contract.yearsRemaining--;

            if (contract.yearsRemaining <= 0) {
                // Contract expired - player becomes free agent
                const team = this.teams.get(contract.teamId);
                if (team) {
                    const index = team.roster.indexOf(playerId);
                    if (index !== -1) {
                        team.roster.splice(index, 1);
                    }
                }

                this.contracts.delete(playerId);

                // Add to free agent pool
                // Would create FreeAgent object here
            }
        }
    }

    /**
     * Award season awards
     */
    private awardSeasonAwards(): void {
        const awards: Award[] = [];

        // MVP (simplified - would actually calculate based on stats)
        awards.push({
            id: this.generateId('award'),
            name: 'Most Valuable Player',
            category: 'mvp',
            winnerId: 'player_1',
            winnerName: 'Star Player',
            year: this.currentSeason,
            stats: {}
        });

        this.seasonAwards.set(this.currentSeason, awards);
    }

    /**
     * Advance to next season
     */
    public advanceToNextSeason(): void {
        this.currentSeason++;
        this.seasonPhase = SeasonPhase.PRE_SEASON;

        // Reset team stats
        for (const team of this.teams.values()) {
            team.stats = {
                wins: 0,
                losses: 0,
                ties: 0,
                winningPercentage: 0,
                runsScored: 0,
                runsAllowed: 0,
                runDifferential: 0,
                homeRecord: { wins: 0, losses: 0 },
                awayRecord: { wins: 0, losses: 0 },
                streak: 0,
                lastTenRecord: { wins: 0, losses: 0 }
            };
        }

        // Generate new schedule
        this.generateSeasonSchedule();

        // Update franchise stats
        if (this.franchise) {
            this.franchise.totalSeasons++;
            this.franchise.currentYear = this.currentSeason;
        }

        this.onSeasonAdvancedObservable.notifyObservers(this.currentSeason);
        this.onPhaseChangedObservable.notifyObservers(SeasonPhase.PRE_SEASON);
    }

    /**
     * Record transaction
     */
    private recordTransaction(transaction: Transaction): void {
        this.transactions.push(transaction);

        // Trim old transactions
        if (this.transactions.length > this.maxTransactions) {
            this.transactions.shift();
        }
    }

    /**
     * Get random position
     */
    private getRandomPosition(): string {
        const positions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
        return positions[Math.floor(Math.random() * positions.length)];
    }

    /**
     * Get team
     */
    public getTeam(teamId: string): Team | undefined {
        return this.teams.get(teamId);
    }

    /**
     * Get all teams
     */
    public getAllTeams(): Team[] {
        return Array.from(this.teams.values());
    }

    /**
     * Get standings
     */
    public getStandings(division?: string): Standings[] {
        if (division) {
            const standing = this.standings.get(division);
            return standing ? [standing] : [];
        }

        return Array.from(this.standings.values());
    }

    /**
     * Get schedule
     */
    public getSchedule(): SeasonSchedule | undefined {
        return this.schedule;
    }

    /**
     * Get transactions
     */
    public getTransactions(teamId?: string, limit: number = 50): Transaction[] {
        let transactions = [...this.transactions].reverse();

        if (teamId) {
            transactions = transactions.filter(t => t.teamId === teamId);
        }

        return transactions.slice(0, limit);
    }

    /**
     * Get free agents
     */
    public getFreeAgents(position?: string): FreeAgent[] {
        let agents = Array.from(this.freeAgents.values());

        if (position) {
            agents = agents.filter(fa => fa.position === position);
        }

        return agents.sort((a, b) => b.overall - a.overall);
    }

    /**
     * Get draft prospects
     */
    public getDraftProspects(round?: number): DraftProspect[] {
        let prospects = Array.from(this.draftProspects.values());

        if (round) {
            prospects = prospects.filter(p => p.projectedRound === round);
        }

        return prospects.sort((a, b) => b.overall - a.overall);
    }

    /**
     * Subscribe to season advanced
     */
    public onSeasonAdvanced(callback: (year: number) => void): void {
        this.onSeasonAdvancedObservable.add(callback);
    }

    /**
     * Subscribe to phase changed
     */
    public onPhaseChanged(callback: (phase: SeasonPhase) => void): void {
        this.onPhaseChangedObservable.add(callback);
    }

    /**
     * Subscribe to game completed
     */
    public onGameCompleted(callback: (game: Game) => void): void {
        this.onGameCompletedObservable.add(callback);
    }

    /**
     * Subscribe to trade completed
     */
    public onTradeCompleted(callback: (trade: TradeProposal) => void): void {
        this.onTradeCompletedObservable.add(callback);
    }

    /**
     * Subscribe to player signed
     */
    public onPlayerSigned(callback: (contract: PlayerContract) => void): void {
        this.onPlayerSignedObservable.add(callback);
    }

    /**
     * Generate ID
     */
    private generateId(prefix: string): string {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Enable/disable system
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Save franchise
     */
    public saveFranchise(): string {
        const data = {
            franchise: this.franchise,
            currentSeason: this.currentSeason,
            seasonPhase: this.seasonPhase,
            teams: Array.from(this.teams.entries()),
            schedule: this.schedule,
            standings: Array.from(this.standings.entries()),
            contracts: Array.from(this.contracts.entries()),
            transactions: this.transactions.slice(-100)
        };

        return JSON.stringify(data);
    }

    /**
     * Load franchise
     */
    public loadFranchise(data: string): void {
        try {
            const parsed = JSON.parse(data);

            this.franchise = parsed.franchise;
            this.currentSeason = parsed.currentSeason;
            this.seasonPhase = parsed.seasonPhase;
            this.teams = new Map(parsed.teams);
            this.schedule = parsed.schedule;
            this.standings = new Map(parsed.standings);
            this.contracts = new Map(parsed.contracts);
            this.transactions = parsed.transactions;
        } catch (error) {
            console.error('Failed to load franchise:', error);
        }
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        this.teams.clear();
        this.contracts.clear();
        this.freeAgents.clear();
        this.tradeProposals.clear();
        this.draftProspects.clear();
        this.scoutingReports.clear();

        this.onSeasonAdvancedObservable.clear();
        this.onPhaseChangedObservable.clear();
        this.onGameCompletedObservable.clear();
        this.onTradeCompletedObservable.clear();
        this.onPlayerSignedObservable.clear();
        this.onPlayoffsStartedObservable.clear();
    }
}
