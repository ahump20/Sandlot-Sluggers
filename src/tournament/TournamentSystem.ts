import { Observable } from '@babylonjs/core';

/**
 * Tournament type
 */
export enum TournamentType {
    SINGLE_ELIMINATION = 'single_elimination',
    DOUBLE_ELIMINATION = 'double_elimination',
    ROUND_ROBIN = 'round_robin',
    SWISS = 'swiss',
    LADDER = 'ladder',
    SEASON = 'season',
    PLAYOFFS = 'playoffs'
}

/**
 * Tournament status
 */
export enum TournamentStatus {
    REGISTRATION = 'registration',
    READY = 'ready',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

/**
 * Match status
 */
export enum MatchStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FORFEIT = 'forfeit',
    CANCELLED = 'cancelled'
}

/**
 * Tournament participant
 */
export interface TournamentParticipant {
    id: string;
    name: string;
    seed: number;
    eliminated: boolean;
    wins: number;
    losses: number;
    points: number;
    stats?: {
        runsScored: number;
        runsAllowed: number;
        differenti: number;
        [key: string]: number;
    };
}

/**
 * Tournament match
 */
export interface TournamentMatch {
    id: string;
    tournamentId: string;
    round: number;
    matchNumber: number;
    participant1Id?: string;
    participant2Id?: string;
    winnerId?: string;
    loserId?: string;
    score1?: number;
    score2?: number;
    status: MatchStatus;
    scheduledTime?: number;
    startTime?: number;
    endTime?: number;
    bracket?: 'winners' | 'losers' | 'grand_finals';
    bestOf?: number;
    gamesPlayed?: number;
    metadata?: {
        gameIds?: string[];
        stats?: any;
    };
}

/**
 * Tournament bracket
 */
export interface TournamentBracket {
    rounds: TournamentRound[];
    grandFinals?: TournamentMatch;
}

/**
 * Tournament round
 */
export interface TournamentRound {
    roundNumber: number;
    matches: TournamentMatch[];
    completed: boolean;
}

/**
 * Tournament prize
 */
export interface TournamentPrize {
    placement: number;
    coins?: number;
    gems?: number;
    items?: Array<{ id: string; quantity: number }>;
    title?: string;
    badge?: string;
    trophyId?: string;
}

/**
 * Tournament
 */
export interface Tournament {
    id: string;
    name: string;
    description: string;
    type: TournamentType;
    status: TournamentStatus;
    organizerId: string;
    participants: Map<string, TournamentParticipant>;
    maxParticipants: number;
    minParticipants: number;
    registrationStart: number;
    registrationEnd: number;
    startTime: number;
    endTime?: number;
    currentRound: number;
    totalRounds: number;
    bracket?: TournamentBracket;
    matches: Map<string, TournamentMatch>;
    prizes: TournamentPrize[];
    rules?: {
        bestOf?: number;
        tiebreaker?: 'runs' | 'head_to_head' | 'coin_flip';
        autoAdvance?: boolean;
        maxRounds?: number;
    };
    requirements?: {
        minLevel?: number;
        maxLevel?: number;
        minRank?: number;
        entryFee?: number;
    };
    metadata?: {
        featured?: boolean;
        sponsored?: boolean;
        recurring?: boolean;
        season?: string;
    };
}

/**
 * Standings entry
 */
export interface StandingsEntry {
    rank: number;
    participantId: string;
    participantName: string;
    wins: number;
    losses: number;
    points: number;
    winPercentage: number;
    runsScored: number;
    runsAllowed: number;
    runDifferential: number;
    streak: number;
}

/**
 * Tournament history entry
 */
export interface TournamentHistoryEntry {
    tournamentId: string;
    tournamentName: string;
    type: TournamentType;
    placement: number;
    totalParticipants: number;
    wins: number;
    losses: number;
    prizesWon: TournamentPrize;
    completedDate: number;
}

/**
 * Season schedule
 */
export interface SeasonSchedule {
    seasonId: string;
    weeks: SeasonWeek[];
}

/**
 * Season week
 */
export interface SeasonWeek {
    weekNumber: number;
    startDate: number;
    endDate: number;
    matches: TournamentMatch[];
}

/**
 * Playoff bracket
 */
export interface PlayoffBracket {
    format: 'best_of_5' | 'best_of_7';
    rounds: PlayoffRound[];
}

/**
 * Playoff round
 */
export interface PlayoffRound {
    roundName: string;
    series: PlayoffSeries[];
}

/**
 * Playoff series
 */
export interface PlayoffSeries {
    id: string;
    participant1Id: string;
    participant2Id: string;
    wins1: number;
    wins2: number;
    games: TournamentMatch[];
    winnerId?: string;
}

/**
 * Tournament System
 * Comprehensive tournament and competitive play management
 */
export class TournamentSystem {
    // Active tournaments
    private tournaments: Map<string, Tournament> = new Map();

    // Player tournament history
    private playerHistory: Map<string, TournamentHistoryEntry[]> = new Map();

    // Active registrations
    private playerRegistrations: Map<string, Set<string>> = new Map();

    // Ladder rankings
    private ladderRankings: Map<string, StandingsEntry[]> = new Map();

    // Observables
    private onTournamentStartedObservable: Observable<Tournament> = new Observable();
    private onTournamentCompletedObservable: Observable<Tournament> = new Observable();
    private onMatchCompletedObservable: Observable<TournamentMatch> = new Observable();
    private onRoundCompletedObservable: Observable<{ tournamentId: string; round: number }> = new Observable();

    // Settings
    private enabled: boolean = true;
    private autoProgressRounds: boolean = true;

    constructor() {}

    /**
     * Create tournament
     */
    public createTournament(
        name: string,
        type: TournamentType,
        maxParticipants: number,
        startTime: number,
        options?: {
            description?: string;
            prizes?: TournamentPrize[];
            rules?: Tournament['rules'];
            requirements?: Tournament['requirements'];
        }
    ): Tournament {
        const tournamentId = this.generateId('tourn');

        const tournament: Tournament = {
            id: tournamentId,
            name,
            description: options?.description || '',
            type,
            status: TournamentStatus.REGISTRATION,
            organizerId: 'system',
            participants: new Map(),
            maxParticipants,
            minParticipants: this.getMinParticipants(type, maxParticipants),
            registrationStart: Date.now(),
            registrationEnd: startTime - 3600000, // 1 hour before start
            startTime,
            currentRound: 0,
            totalRounds: this.calculateTotalRounds(type, maxParticipants),
            matches: new Map(),
            prizes: options?.prizes || this.generateDefaultPrizes(maxParticipants),
            rules: options?.rules || this.getDefaultRules(type),
            requirements: options?.requirements
        };

        this.tournaments.set(tournamentId, tournament);

        return tournament;
    }

    /**
     * Register participant
     */
    public registerParticipant(
        tournamentId: string,
        participantId: string,
        participantName: string
    ): boolean {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return false;

        // Check registration status
        if (tournament.status !== TournamentStatus.REGISTRATION) {
            console.warn('Tournament registration is closed');
            return false;
        }

        // Check if full
        if (tournament.participants.size >= tournament.maxParticipants) {
            console.warn('Tournament is full');
            return false;
        }

        // Check if already registered
        if (tournament.participants.has(participantId)) {
            console.warn('Already registered');
            return false;
        }

        // Check requirements
        if (!this.checkRequirements(tournament, participantId)) {
            console.warn('Requirements not met');
            return false;
        }

        // Register participant
        const seed = tournament.participants.size + 1;
        tournament.participants.set(participantId, {
            id: participantId,
            name: participantName,
            seed,
            eliminated: false,
            wins: 0,
            losses: 0,
            points: 0,
            stats: {
                runsScored: 0,
                runsAllowed: 0,
                differential: 0
            }
        });

        // Track registration
        if (!this.playerRegistrations.has(participantId)) {
            this.playerRegistrations.set(participantId, new Set());
        }
        this.playerRegistrations.get(participantId)!.add(tournamentId);

        // Check if ready to start
        if (tournament.participants.size >= tournament.minParticipants) {
            tournament.status = TournamentStatus.READY;
        }

        return true;
    }

    /**
     * Unregister participant
     */
    public unregisterParticipant(tournamentId: string, participantId: string): boolean {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return false;

        if (tournament.status !== TournamentStatus.REGISTRATION) {
            console.warn('Cannot unregister after registration closes');
            return false;
        }

        tournament.participants.delete(participantId);
        this.playerRegistrations.get(participantId)?.delete(tournamentId);

        // Reseed remaining participants
        let seed = 1;
        for (const participant of tournament.participants.values()) {
            participant.seed = seed++;
        }

        // Update status
        if (tournament.participants.size < tournament.minParticipants) {
            tournament.status = TournamentStatus.REGISTRATION;
        }

        return true;
    }

    /**
     * Start tournament
     */
    public startTournament(tournamentId: string): boolean {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return false;

        if (tournament.status !== TournamentStatus.READY) {
            console.warn('Tournament not ready to start');
            return false;
        }

        if (tournament.participants.size < tournament.minParticipants) {
            console.warn('Not enough participants');
            return false;
        }

        tournament.status = TournamentStatus.IN_PROGRESS;
        tournament.currentRound = 1;

        // Generate bracket/schedule
        switch (tournament.type) {
            case TournamentType.SINGLE_ELIMINATION:
                this.generateSingleEliminationBracket(tournament);
                break;
            case TournamentType.DOUBLE_ELIMINATION:
                this.generateDoubleEliminationBracket(tournament);
                break;
            case TournamentType.ROUND_ROBIN:
                this.generateRoundRobinSchedule(tournament);
                break;
            case TournamentType.SWISS:
                this.generateSwissRound(tournament, 1);
                break;
            case TournamentType.SEASON:
                this.generateSeasonSchedule(tournament);
                break;
        }

        this.onTournamentStartedObservable.notifyObservers(tournament);

        return true;
    }

    /**
     * Generate single elimination bracket
     */
    private generateSingleEliminationBracket(tournament: Tournament): void {
        const participants = Array.from(tournament.participants.values())
            .sort((a, b) => a.seed - b.seed);

        const rounds: TournamentRound[] = [];
        let currentRound = 1;
        let matchNumber = 1;

        // Calculate number of first round byes
        const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(participants.length)));
        const byes = nextPowerOf2 - participants.length;

        // First round
        const firstRoundMatches: TournamentMatch[] = [];
        let participantIndex = 0;

        // Add matches for non-bye participants
        const matchCount = (participants.length - byes) / 2;
        for (let i = 0; i < matchCount; i++) {
            const match: TournamentMatch = {
                id: this.generateId('match'),
                tournamentId: tournament.id,
                round: currentRound,
                matchNumber: matchNumber++,
                participant1Id: participants[participantIndex++].id,
                participant2Id: participants[participantIndex++].id,
                status: MatchStatus.SCHEDULED,
                bestOf: tournament.rules?.bestOf || 1
            };

            firstRoundMatches.push(match);
            tournament.matches.set(match.id, match);
        }

        rounds.push({
            roundNumber: currentRound,
            matches: firstRoundMatches,
            completed: false
        });

        // Create placeholder matches for subsequent rounds
        let previousRoundMatches = firstRoundMatches.length + byes;
        currentRound++;

        while (previousRoundMatches > 1) {
            const roundMatches: TournamentMatch[] = [];
            const matchesInRound = previousRoundMatches / 2;

            for (let i = 0; i < matchesInRound; i++) {
                const match: TournamentMatch = {
                    id: this.generateId('match'),
                    tournamentId: tournament.id,
                    round: currentRound,
                    matchNumber: matchNumber++,
                    status: MatchStatus.SCHEDULED,
                    bestOf: tournament.rules?.bestOf || 1
                };

                roundMatches.push(match);
                tournament.matches.set(match.id, match);
            }

            rounds.push({
                roundNumber: currentRound,
                matches: roundMatches,
                completed: false
            });

            previousRoundMatches = matchesInRound;
            currentRound++;
        }

        tournament.bracket = { rounds };
        tournament.totalRounds = rounds.length;
    }

    /**
     * Generate double elimination bracket
     */
    private generateDoubleEliminationBracket(tournament: Tournament): void {
        // Similar to single elimination but with winners and losers brackets
        this.generateSingleEliminationBracket(tournament);

        // Would add losers bracket logic here
    }

    /**
     * Generate round robin schedule
     */
    private generateRoundRobinSchedule(tournament: Tournament): void {
        const participants = Array.from(tournament.participants.values());
        const n = participants.length;
        const rounds: TournamentRound[] = [];

        // Generate all possible pairings
        let matchNumber = 1;
        let roundNumber = 1;

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const match: TournamentMatch = {
                    id: this.generateId('match'),
                    tournamentId: tournament.id,
                    round: roundNumber,
                    matchNumber: matchNumber++,
                    participant1Id: participants[i].id,
                    participant2Id: participants[j].id,
                    status: MatchStatus.SCHEDULED,
                    bestOf: tournament.rules?.bestOf || 1
                };

                tournament.matches.set(match.id, match);

                // Add to appropriate round
                let round = rounds.find(r => r.roundNumber === roundNumber);
                if (!round) {
                    round = {
                        roundNumber: roundNumber,
                        matches: [],
                        completed: false
                    };
                    rounds.push(round);
                }

                round.matches.push(match);

                // Move to next round after certain number of matches
                if (round.matches.length >= Math.floor(n / 2)) {
                    roundNumber++;
                }
            }
        }

        tournament.bracket = { rounds };
        tournament.totalRounds = rounds.length;
    }

    /**
     * Generate Swiss round
     */
    private generateSwissRound(tournament: Tournament, roundNumber: number): void {
        const participants = Array.from(tournament.participants.values())
            .filter(p => !p.eliminated)
            .sort((a, b) => {
                // Sort by points, then wins
                if (b.points !== a.points) return b.points - a.points;
                return b.wins - a.wins;
            });

        const matches: TournamentMatch[] = [];
        const paired = new Set<string>();
        let matchNumber = 1;

        // Pair participants with similar records
        for (let i = 0; i < participants.length - 1; i++) {
            if (paired.has(participants[i].id)) continue;

            // Find best opponent
            for (let j = i + 1; j < participants.length; j++) {
                if (paired.has(participants[j].id)) continue;

                // Check if they've played before
                // (Would need match history check here)

                const match: TournamentMatch = {
                    id: this.generateId('match'),
                    tournamentId: tournament.id,
                    round: roundNumber,
                    matchNumber: matchNumber++,
                    participant1Id: participants[i].id,
                    participant2Id: participants[j].id,
                    status: MatchStatus.SCHEDULED,
                    bestOf: tournament.rules?.bestOf || 1
                };

                matches.push(match);
                tournament.matches.set(match.id, match);
                paired.add(participants[i].id);
                paired.add(participants[j].id);
                break;
            }
        }

        // Handle bye if odd number
        if (participants.length % 2 === 1) {
            const byeParticipant = participants.find(p => !paired.has(p.id));
            if (byeParticipant) {
                byeParticipant.points += 3; // Award bye points
            }
        }

        if (!tournament.bracket) {
            tournament.bracket = { rounds: [] };
        }

        tournament.bracket.rounds.push({
            roundNumber,
            matches,
            completed: false
        });
    }

    /**
     * Generate season schedule
     */
    private generateSeasonSchedule(tournament: Tournament): void {
        const participants = Array.from(tournament.participants.values());
        const weeks: SeasonWeek[] = [];
        const gamesPerWeek = Math.ceil(participants.length / 2);
        let weekNumber = 1;
        let matchNumber = 1;

        // Generate weekly schedule
        const totalWeeks = participants.length - 1; // Each team plays each other once

        for (let week = 0; week < totalWeeks; week++) {
            const weekMatches: TournamentMatch[] = [];
            const weekStart = tournament.startTime + week * 7 * 24 * 60 * 60 * 1000;
            const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;

            // Round-robin pairing for this week
            for (let i = 0; i < participants.length / 2; i++) {
                const p1Index = (i + week) % participants.length;
                const p2Index = (participants.length - 1 - i + week) % participants.length;

                if (p1Index !== p2Index) {
                    const match: TournamentMatch = {
                        id: this.generateId('match'),
                        tournamentId: tournament.id,
                        round: weekNumber,
                        matchNumber: matchNumber++,
                        participant1Id: participants[p1Index].id,
                        participant2Id: participants[p2Index].id,
                        status: MatchStatus.SCHEDULED,
                        scheduledTime: weekStart + i * 24 * 60 * 60 * 1000,
                        bestOf: 1
                    };

                    weekMatches.push(match);
                    tournament.matches.set(match.id, match);
                }
            }

            weeks.push({
                weekNumber: weekNumber++,
                startDate: weekStart,
                endDate: weekEnd,
                matches: weekMatches
            });
        }

        tournament.metadata = {
            ...tournament.metadata,
            season: JSON.stringify({ weeks })
        };
    }

    /**
     * Report match result
     */
    public reportMatchResult(
        matchId: string,
        winnerId: string,
        score1: number,
        score2: number
    ): boolean {
        const match = Array.from(this.tournaments.values())
            .flatMap(t => Array.from(t.matches.values()))
            .find(m => m.id === matchId);

        if (!match) return false;

        const tournament = this.tournaments.get(match.tournamentId);
        if (!tournament) return false;

        // Update match
        match.winnerId = winnerId;
        match.loserId = winnerId === match.participant1Id ? match.participant2Id : match.participant1Id;
        match.score1 = score1;
        match.score2 = score2;
        match.status = MatchStatus.COMPLETED;
        match.endTime = Date.now();

        // Update participant records
        const winner = tournament.participants.get(winnerId);
        const loser = tournament.participants.get(match.loserId!);

        if (winner && loser) {
            winner.wins++;
            loser.losses++;

            // Update stats
            if (winner.stats) {
                winner.stats.runsScored += score1;
                winner.stats.runsAllowed += score2;
                winner.stats.differential = winner.stats.runsScored - winner.stats.runsAllowed;
            }

            if (loser.stats) {
                loser.stats.runsScored += score2;
                loser.stats.runsAllowed += score1;
                loser.stats.differential = loser.stats.runsScored - loser.stats.runsAllowed;
            }

            // Award points based on tournament type
            if (tournament.type === TournamentType.ROUND_ROBIN || tournament.type === TournamentType.SWISS) {
                winner.points += 3; // Win
                loser.points += 0; // Loss
            }

            // Mark loser as eliminated in single/double elimination
            if (tournament.type === TournamentType.SINGLE_ELIMINATION) {
                loser.eliminated = true;
            }
        }

        this.onMatchCompletedObservable.notifyObservers(match);

        // Check if round is complete
        this.checkRoundCompletion(tournament, match.round);

        return true;
    }

    /**
     * Check if round is complete
     */
    private checkRoundCompletion(tournament: Tournament, roundNumber: number): void {
        if (!tournament.bracket) return;

        const round = tournament.bracket.rounds.find(r => r.roundNumber === roundNumber);
        if (!round) return;

        // Check if all matches in round are complete
        const allComplete = round.matches.every(m => m.status === MatchStatus.COMPLETED);

        if (allComplete && !round.completed) {
            round.completed = true;
            this.onRoundCompletedObservable.notifyObservers({
                tournamentId: tournament.id,
                round: roundNumber
            });

            // Advance to next round if auto-progress enabled
            if (this.autoProgressRounds) {
                this.advanceToNextRound(tournament);
            }
        }
    }

    /**
     * Advance to next round
     */
    private advanceToNextRound(tournament: Tournament): void {
        const currentRound = tournament.currentRound;
        const nextRound = currentRound + 1;

        if (nextRound > tournament.totalRounds) {
            // Tournament complete
            this.completeTournament(tournament);
            return;
        }

        tournament.currentRound = nextRound;

        // Generate next round if Swiss
        if (tournament.type === TournamentType.SWISS) {
            this.generateSwissRound(tournament, nextRound);
        }

        // Set up next round matches with winners
        if (tournament.bracket && tournament.type === TournamentType.SINGLE_ELIMINATION) {
            const previousRound = tournament.bracket.rounds.find(r => r.roundNumber === currentRound);
            const currentRoundMatches = tournament.bracket.rounds.find(r => r.roundNumber === nextRound);

            if (previousRound && currentRoundMatches) {
                let matchIndex = 0;
                for (let i = 0; i < previousRound.matches.length; i += 2) {
                    const match1 = previousRound.matches[i];
                    const match2 = previousRound.matches[i + 1];
                    const nextMatch = currentRoundMatches.matches[matchIndex++];

                    if (match1.winnerId) {
                        nextMatch.participant1Id = match1.winnerId;
                    }
                    if (match2 && match2.winnerId) {
                        nextMatch.participant2Id = match2.winnerId;
                    }
                }
            }
        }
    }

    /**
     * Complete tournament
     */
    private completeTournament(tournament: Tournament): void {
        tournament.status = TournamentStatus.COMPLETED;
        tournament.endTime = Date.now();

        // Calculate final standings
        const standings = this.calculateStandings(tournament.id);

        // Award prizes
        for (const standing of standings) {
            const prize = tournament.prizes.find(p => p.placement === standing.rank);
            if (prize) {
                this.awardPrize(standing.participantId, tournament, prize);
            }
        }

        this.onTournamentCompletedObservable.notifyObservers(tournament);
    }

    /**
     * Award prize
     */
    private awardPrize(participantId: string, tournament: Tournament, prize: TournamentPrize): void {
        // Record in history
        if (!this.playerHistory.has(participantId)) {
            this.playerHistory.set(participantId, []);
        }

        const participant = tournament.participants.get(participantId);
        if (!participant) return;

        const historyEntry: TournamentHistoryEntry = {
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            type: tournament.type,
            placement: prize.placement,
            totalParticipants: tournament.participants.size,
            wins: participant.wins,
            losses: participant.losses,
            prizesWon: prize,
            completedDate: Date.now()
        };

        this.playerHistory.get(participantId)!.push(historyEntry);

        // Would actually award items/currency here
        console.log(`Awarded prize to ${participant.name}: Placement ${prize.placement}`);
    }

    /**
     * Calculate standings
     */
    public calculateStandings(tournamentId: string): StandingsEntry[] {
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) return [];

        const standings: StandingsEntry[] = Array.from(tournament.participants.values()).map(p => ({
            rank: 0,
            participantId: p.id,
            participantName: p.name,
            wins: p.wins,
            losses: p.losses,
            points: p.points,
            winPercentage: p.wins / (p.wins + p.losses) || 0,
            runsScored: p.stats?.runsScored || 0,
            runsAllowed: p.stats?.runsAllowed || 0,
            runDifferential: p.stats?.differential || 0,
            streak: 0 // Would calculate from match history
        }));

        // Sort by points, then wins, then run differential
        standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.wins !== a.wins) return b.wins - a.wins;
            return b.runDifferential - a.runDifferential;
        });

        // Assign ranks
        standings.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        return standings;
    }

    /**
     * Get tournament
     */
    public getTournament(tournamentId: string): Tournament | undefined {
        return this.tournaments.get(tournamentId);
    }

    /**
     * Get all tournaments
     */
    public getAllTournaments(status?: TournamentStatus): Tournament[] {
        let tournaments = Array.from(this.tournaments.values());

        if (status) {
            tournaments = tournaments.filter(t => t.status === status);
        }

        return tournaments.sort((a, b) => b.startTime - a.startTime);
    }

    /**
     * Get player tournaments
     */
    public getPlayerTournaments(playerId: string): Tournament[] {
        const tournamentIds = this.playerRegistrations.get(playerId);
        if (!tournamentIds) return [];

        return Array.from(tournamentIds)
            .map(id => this.tournaments.get(id))
            .filter(t => t !== undefined) as Tournament[];
    }

    /**
     * Get player history
     */
    public getPlayerHistory(playerId: string): TournamentHistoryEntry[] {
        return this.playerHistory.get(playerId) || [];
    }

    /**
     * Check requirements
     */
    private checkRequirements(tournament: Tournament, participantId: string): boolean {
        if (!tournament.requirements) return true;

        // Would check actual player data here
        return true;
    }

    /**
     * Get minimum participants
     */
    private getMinParticipants(type: TournamentType, maxParticipants: number): number {
        switch (type) {
            case TournamentType.SINGLE_ELIMINATION:
            case TournamentType.DOUBLE_ELIMINATION:
                return 4;
            case TournamentType.ROUND_ROBIN:
                return 3;
            case TournamentType.SWISS:
                return 8;
            case TournamentType.SEASON:
                return 6;
            default:
                return 2;
        }
    }

    /**
     * Calculate total rounds
     */
    private calculateTotalRounds(type: TournamentType, maxParticipants: number): number {
        switch (type) {
            case TournamentType.SINGLE_ELIMINATION:
                return Math.ceil(Math.log2(maxParticipants));
            case TournamentType.DOUBLE_ELIMINATION:
                return Math.ceil(Math.log2(maxParticipants)) * 2;
            case TournamentType.ROUND_ROBIN:
                return maxParticipants - 1;
            case TournamentType.SWISS:
                return Math.ceil(Math.log2(maxParticipants));
            case TournamentType.SEASON:
                return maxParticipants - 1;
            default:
                return 1;
        }
    }

    /**
     * Generate default prizes
     */
    private generateDefaultPrizes(maxParticipants: number): TournamentPrize[] {
        const prizes: TournamentPrize[] = [];

        // 1st place
        prizes.push({
            placement: 1,
            coins: 5000,
            gems: 50,
            items: [{ id: 'gold_trophy', quantity: 1 }],
            title: 'Champion',
            badge: 'tournament_winner'
        });

        // 2nd place
        prizes.push({
            placement: 2,
            coins: 3000,
            gems: 30,
            items: [{ id: 'silver_trophy', quantity: 1 }]
        });

        // 3rd place
        if (maxParticipants >= 8) {
            prizes.push({
                placement: 3,
                coins: 2000,
                gems: 20,
                items: [{ id: 'bronze_trophy', quantity: 1 }]
            });
        }

        // Top 4
        if (maxParticipants >= 16) {
            prizes.push({
                placement: 4,
                coins: 1000,
                gems: 10
            });
        }

        return prizes;
    }

    /**
     * Get default rules
     */
    private getDefaultRules(type: TournamentType): Tournament['rules'] {
        return {
            bestOf: 1,
            tiebreaker: 'runs',
            autoAdvance: true
        };
    }

    /**
     * Generate ID
     */
    private generateId(prefix: string): string {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Subscribe to tournament started
     */
    public onTournamentStarted(callback: (tournament: Tournament) => void): void {
        this.onTournamentStartedObservable.add(callback);
    }

    /**
     * Subscribe to tournament completed
     */
    public onTournamentCompleted(callback: (tournament: Tournament) => void): void {
        this.onTournamentCompletedObservable.add(callback);
    }

    /**
     * Subscribe to match completed
     */
    public onMatchCompleted(callback: (match: TournamentMatch) => void): void {
        this.onMatchCompletedObservable.add(callback);
    }

    /**
     * Subscribe to round completed
     */
    public onRoundCompleted(callback: (data: { tournamentId: string; round: number }) => void): void {
        this.onRoundCompletedObservable.add(callback);
    }

    /**
     * Enable/disable system
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        this.tournaments.clear();
        this.playerHistory.clear();
        this.playerRegistrations.clear();

        this.onTournamentStartedObservable.clear();
        this.onTournamentCompletedObservable.clear();
        this.onMatchCompletedObservable.clear();
        this.onRoundCompletedObservable.clear();
    }
}
