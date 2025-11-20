/**
 * Game modes system supporting Career, Tournament, Practice, and more
 */

export enum GameMode {
    QUICK_PLAY = 'QUICK_PLAY',
    CAREER = 'CAREER',
    TOURNAMENT = 'TOURNAMENT',
    PRACTICE = 'PRACTICE',
    HOME_RUN_DERBY = 'HOME_RUN_DERBY',
    MULTIPLAYER = 'MULTIPLAYER',
    CHALLENGE = 'CHALLENGE',
    SEASON = 'SEASON'
}

export enum Difficulty {
    ROOKIE = 'ROOKIE',
    PRO = 'PRO',
    ALL_STAR = 'ALL_STAR',
    LEGEND = 'LEGEND'
}

/**
 * Career mode progression
 */
export interface CareerData {
    playerId: string;
    playerName: string;
    teamName: string;
    position: string;
    level: number;
    experience: number;
    experienceToNextLevel: number;

    // Career stats
    gamesPlayed: number;
    wins: number;
    losses: number;
    championships: number;
    totalHits: number;
    totalHomeRuns: number;
    battingAverage: number;
    totalStrikeouts: number;

    // Unlocks
    unlockedCharacters: string[];
    unlockedStadiums: string[];
    unlockedBats: string[];
    unlockedGloves: string[];

    // Currency
    coins: number;
    gems: number;

    // Season progression
    currentSeason: number;
    seasonsCompleted: number;

    // Achievements
    achievementsUnlocked: string[];
}

/**
 * Tournament structure
 */
export interface TournamentData {
    tournamentId: string;
    name: string;
    type: 'single_elimination' | 'double_elimination' | 'round_robin';
    difficulty: Difficulty;
    teams: string[];
    bracket: TournamentMatch[];
    currentRound: number;
    totalRounds: number;
    playerTeam: string;
    prize: {
        coins: number;
        gems: number;
        unlocks: string[];
    };
}

/**
 * Tournament match
 */
export interface TournamentMatch {
    matchId: string;
    round: number;
    team1: string;
    team2: string;
    winner?: string;
    score1?: number;
    score2?: number;
    completed: boolean;
}

/**
 * Season structure
 */
export interface SeasonData {
    seasonId: string;
    seasonNumber: number;
    gamesPerSeason: number;
    teams: string[];
    schedule: SeasonGame[];
    standings: TeamStanding[];
    playoffs?: PlayoffData;
    playerTeam: string;
}

/**
 * Season game
 */
export interface SeasonGame {
    gameId: string;
    week: number;
    homeTeam: string;
    awayTeam: string;
    completed: boolean;
    homeScore?: number;
    awayScore?: number;
}

/**
 * Team standings
 */
export interface TeamStanding {
    team: string;
    wins: number;
    losses: number;
    winPercentage: number;
    gamesBack: number;
    runsScored: number;
    runsAllowed: number;
}

/**
 * Playoff structure
 */
export interface PlayoffData {
    rounds: TournamentMatch[][];
    currentRound: number;
}

/**
 * Practice mode configuration
 */
export interface PracticeConfig {
    mode: 'batting' | 'pitching' | 'fielding';
    difficulty: Difficulty;
    duration: number; // minutes
    goals: PracticeGoal[];
}

/**
 * Practice goals
 */
export interface PracticeGoal {
    id: string;
    description: string;
    target: number;
    current: number;
    reward: number; // experience points
    completed: boolean;
}

/**
 * Home Run Derby configuration
 */
export interface HomeRunDerbyConfig {
    rounds: number;
    outsPerRound: number;
    competitors: string[];
    difficulty: Difficulty;
}

/**
 * Home Run Derby results
 */
export interface HomeRunDerbyResults {
    competitorId: string;
    homeRuns: number;
    longestHomeRun: number;
    totalDistance: number;
}

/**
 * Challenge mode
 */
export interface ChallengeData {
    challengeId: string;
    name: string;
    description: string;
    objectives: ChallengeObjective[];
    difficulty: Difficulty;
    timeLimit?: number; // seconds
    rewards: {
        coins: number;
        experience: number;
        unlocks?: string[];
    };
}

/**
 * Challenge objective
 */
export interface ChallengeObjective {
    id: string;
    description: string;
    type: 'score_runs' | 'hit_homeruns' | 'get_strikeouts' | 'complete_game' | 'perfect_game';
    target: number;
    current: number;
    completed: boolean;
}

/**
 * Comprehensive game modes system
 */
export class GameModesSystem {
    private currentMode: GameMode = GameMode.QUICK_PLAY;
    private currentDifficulty: Difficulty = Difficulty.PRO;

    // Career mode
    private careerData: CareerData | null = null;

    // Tournament mode
    private activeTournament: TournamentData | null = null;

    // Season mode
    private activeSeason: SeasonData | null = null;

    // Practice mode
    private activePractice: PracticeConfig | null = null;

    // Home Run Derby
    private activeHomeRunDerby: HomeRunDerbyConfig | null = null;
    private derbyResults: Map<string, HomeRunDerbyResults> = new Map();

    // Challenge mode
    private activeChallenges: Map<string, ChallengeData> = new Map();
    private completedChallenges: Set<string> = new Set();

    // Experience and leveling system
    private experienceCurve: number[] = [];

    constructor() {
        this.initializeExperienceCurve();
    }

    /**
     * Initialize experience curve for leveling
     */
    private initializeExperienceCurve(): void {
        // Experience required for each level (1-100)
        for (let level = 1; level <= 100; level++) {
            // Exponential curve: base * (level ^ 1.5)
            const experience = Math.floor(100 * Math.pow(level, 1.5));
            this.experienceCurve.push(experience);
        }
    }

    /**
     * Start career mode
     */
    public startCareer(playerName: string, teamName: string, position: string): CareerData {
        this.currentMode = GameMode.CAREER;

        this.careerData = {
            playerId: `player_${Date.now()}`,
            playerName,
            teamName,
            position,
            level: 1,
            experience: 0,
            experienceToNextLevel: this.experienceCurve[0],
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            championships: 0,
            totalHits: 0,
            totalHomeRuns: 0,
            battingAverage: 0,
            totalStrikeouts: 0,
            unlockedCharacters: ['default'],
            unlockedStadiums: ['dusty_acres'],
            unlockedBats: ['wooden'],
            unlockedGloves: ['standard'],
            coins: 0,
            gems: 0,
            currentSeason: 1,
            seasonsCompleted: 0,
            achievementsUnlocked: []
        };

        return this.careerData;
    }

    /**
     * Award experience in career mode
     */
    public awardExperience(amount: number): { leveledUp: boolean; newLevel?: number } {
        if (!this.careerData) return { leveledUp: false };

        this.careerData.experience += amount;

        // Check for level up
        if (this.careerData.experience >= this.careerData.experienceToNextLevel) {
            return this.levelUp();
        }

        return { leveledUp: false };
    }

    /**
     * Level up player
     */
    private levelUp(): { leveledUp: boolean; newLevel: number } {
        if (!this.careerData) return { leveledUp: false, newLevel: 1 };

        this.careerData.level++;
        const newLevel = this.careerData.level;

        // Set new experience requirement
        if (newLevel <= 100) {
            this.careerData.experienceToNextLevel = this.experienceCurve[newLevel - 1];
        }

        // Award level-up rewards
        this.careerData.coins += 500 * newLevel;

        // Unlock rewards at milestone levels
        if (newLevel === 10) {
            this.unlockCharacter('comet_carter');
        } else if (newLevel === 25) {
            this.unlockStadium('beach_bash');
        } else if (newLevel === 50) {
            this.unlockCharacter('blaze');
        }

        return { leveledUp: true, newLevel };
    }

    /**
     * Unlock character in career
     */
    private unlockCharacter(characterId: string): void {
        if (!this.careerData) return;

        if (!this.careerData.unlockedCharacters.includes(characterId)) {
            this.careerData.unlockedCharacters.push(characterId);
        }
    }

    /**
     * Unlock stadium in career
     */
    private unlockStadium(stadiumId: string): void {
        if (!this.careerData) return;

        if (!this.careerData.unlockedStadiums.includes(stadiumId)) {
            this.careerData.unlockedStadiums.push(stadiumId);
        }
    }

    /**
     * Record game result in career
     */
    public recordCareerGame(won: boolean, hits: number, homeRuns: number, strikeouts: number): void {
        if (!this.careerData) return;

        this.careerData.gamesPlayed++;
        if (won) {
            this.careerData.wins++;
        } else {
            this.careerData.losses++;
        }

        this.careerData.totalHits += hits;
        this.careerData.totalHomeRuns += homeRuns;
        this.careerData.totalStrikeouts += strikeouts;

        // Calculate batting average
        if (this.careerData.gamesPlayed > 0) {
            this.careerData.battingAverage = this.careerData.totalHits / (this.careerData.gamesPlayed * 4); // Assume 4 at-bats per game
        }

        // Award experience based on performance
        let experienceGained = 100; // Base experience
        experienceGained += hits * 20;
        experienceGained += homeRuns * 50;
        if (won) experienceGained += 100;

        this.awardExperience(experienceGained);

        // Award coins
        this.careerData.coins += 50 + (hits * 10) + (homeRuns * 25);
    }

    /**
     * Start tournament
     */
    public startTournament(
        name: string,
        type: TournamentData['type'],
        teams: string[],
        difficulty: Difficulty
    ): TournamentData {
        this.currentMode = GameMode.TOURNAMENT;

        const bracket = this.generateTournamentBracket(teams, type);

        this.activeTournament = {
            tournamentId: `tournament_${Date.now()}`,
            name,
            type,
            difficulty,
            teams,
            bracket,
            currentRound: 1,
            totalRounds: Math.ceil(Math.log2(teams.length)),
            playerTeam: teams[0], // Assume player is first team
            prize: {
                coins: 1000 * teams.length,
                gems: 10 * teams.length,
                unlocks: []
            }
        };

        return this.activeTournament;
    }

    /**
     * Generate tournament bracket
     */
    private generateTournamentBracket(teams: string[], type: TournamentData['type']): TournamentMatch[] {
        const bracket: TournamentMatch[] = [];

        if (type === 'single_elimination') {
            // Pair teams for first round
            for (let i = 0; i < teams.length; i += 2) {
                if (i + 1 < teams.length) {
                    bracket.push({
                        matchId: `match_${i / 2}`,
                        round: 1,
                        team1: teams[i],
                        team2: teams[i + 1],
                        completed: false
                    });
                }
            }
        } else if (type === 'round_robin') {
            // Every team plays every other team
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    bracket.push({
                        matchId: `match_${i}_${j}`,
                        round: 1,
                        team1: teams[i],
                        team2: teams[j],
                        completed: false
                    });
                }
            }
        }

        return bracket;
    }

    /**
     * Record tournament match result
     */
    public recordTournamentMatch(matchId: string, team1Score: number, team2Score: number): void {
        if (!this.activeTournament) return;

        const match = this.activeTournament.bracket.find(m => m.matchId === matchId);
        if (!match) return;

        match.score1 = team1Score;
        match.score2 = team2Score;
        match.winner = team1Score > team2Score ? match.team1 : match.team2;
        match.completed = true;

        // Check if round is complete
        const roundMatches = this.activeTournament.bracket.filter(m => m.round === this.activeTournament!.currentRound);
        const allComplete = roundMatches.every(m => m.completed);

        if (allComplete && this.activeTournament.type === 'single_elimination') {
            this.advanceTournamentRound();
        }
    }

    /**
     * Advance to next tournament round
     */
    private advanceTournamentRound(): void {
        if (!this.activeTournament) return;

        const currentRoundMatches = this.activeTournament.bracket.filter(
            m => m.round === this.activeTournament!.currentRound
        );

        const winners = currentRoundMatches.map(m => m.winner!).filter(w => w !== undefined);

        if (winners.length <= 1) {
            // Tournament complete
            this.completeTournament(winners[0]);
            return;
        }

        // Create next round matches
        this.activeTournament.currentRound++;

        for (let i = 0; i < winners.length; i += 2) {
            if (i + 1 < winners.length) {
                this.activeTournament.bracket.push({
                    matchId: `match_r${this.activeTournament.currentRound}_${i / 2}`,
                    round: this.activeTournament.currentRound,
                    team1: winners[i],
                    team2: winners[i + 1],
                    completed: false
                });
            }
        }
    }

    /**
     * Complete tournament
     */
    private completeTournament(winner: string): void {
        if (!this.activeTournament) return;

        // Award prizes if player won
        if (winner === this.activeTournament.playerTeam && this.careerData) {
            this.careerData.coins += this.activeTournament.prize.coins;
            this.careerData.gems += this.activeTournament.prize.gems;
            this.careerData.championships++;

            // Award experience
            this.awardExperience(1000);
        }
    }

    /**
     * Start season
     */
    public startSeason(teams: string[], gamesPerSeason: number = 20): SeasonData {
        this.currentMode = GameMode.SEASON;

        const schedule = this.generateSeasonSchedule(teams, gamesPerSeason);
        const standings = teams.map(team => ({
            team,
            wins: 0,
            losses: 0,
            winPercentage: 0,
            gamesBack: 0,
            runsScored: 0,
            runsAllowed: 0
        }));

        this.activeSeason = {
            seasonId: `season_${Date.now()}`,
            seasonNumber: this.careerData?.currentSeason || 1,
            gamesPerSeason,
            teams,
            schedule,
            standings,
            playerTeam: teams[0]
        };

        return this.activeSeason;
    }

    /**
     * Generate season schedule
     */
    private generateSeasonSchedule(teams: string[], gamesPerSeason: number): SeasonGame[] {
        const schedule: SeasonGame[] = [];
        const gamesPerWeek = Math.ceil(teams.length / 2);
        const weeksInSeason = Math.ceil(gamesPerSeason / gamesPerWeek);

        let gameId = 0;

        for (let week = 1; week <= weeksInSeason; week++) {
            // Round-robin pairing for this week
            for (let i = 0; i < teams.length; i += 2) {
                if (i + 1 < teams.length && gameId < gamesPerSeason) {
                    const homeTeam = Math.random() > 0.5 ? teams[i] : teams[i + 1];
                    const awayTeam = homeTeam === teams[i] ? teams[i + 1] : teams[i];

                    schedule.push({
                        gameId: `game_${gameId++}`,
                        week,
                        homeTeam,
                        awayTeam,
                        completed: false
                    });
                }
            }
        }

        return schedule;
    }

    /**
     * Record season game result
     */
    public recordSeasonGame(gameId: string, homeScore: number, awayScore: number): void {
        if (!this.activeSeason) return;

        const game = this.activeSeason.schedule.find(g => g.gameId === gameId);
        if (!game) return;

        game.homeScore = homeScore;
        game.awayScore = awayScore;
        game.completed = true;

        // Update standings
        const homeStanding = this.activeSeason.standings.find(s => s.team === game.homeTeam);
        const awayStanding = this.activeSeason.standings.find(s => s.team === game.awayTeam);

        if (homeStanding && awayStanding) {
            homeStanding.runsScored += homeScore;
            homeStanding.runsAllowed += awayScore;
            awayStanding.runsScored += awayScore;
            awayStanding.runsAllowed += homeScore;

            if (homeScore > awayScore) {
                homeStanding.wins++;
                awayStanding.losses++;
            } else {
                awayStanding.wins++;
                homeStanding.losses++;
            }

            // Calculate win percentage
            const homeGames = homeStanding.wins + homeStanding.losses;
            const awayGames = awayStanding.wins + awayStanding.losses;

            homeStanding.winPercentage = homeGames > 0 ? homeStanding.wins / homeGames : 0;
            awayStanding.winPercentage = awayGames > 0 ? awayStanding.wins / awayGames : 0;
        }

        // Sort standings
        this.updateStandings();

        // Check if season is complete
        const allGamesComplete = this.activeSeason.schedule.every(g => g.completed);
        if (allGamesComplete) {
            this.startPlayoffs();
        }
    }

    /**
     * Update standings with games back
     */
    private updateStandings(): void {
        if (!this.activeSeason) return;

        // Sort by win percentage
        this.activeSeason.standings.sort((a, b) => b.winPercentage - a.winPercentage);

        // Calculate games back
        const leaderWins = this.activeSeason.standings[0].wins;
        const leaderLosses = this.activeSeason.standings[0].losses;

        for (const standing of this.activeSeason.standings) {
            standing.gamesBack = ((leaderWins - standing.wins) + (standing.losses - leaderLosses)) / 2;
        }
    }

    /**
     * Start playoffs
     */
    private startPlayoffs(): void {
        if (!this.activeSeason) return;

        // Take top teams for playoffs (top 4)
        const playoffTeams = this.activeSeason.standings.slice(0, 4).map(s => s.team);

        // Create playoff bracket
        const rounds: TournamentMatch[][] = [];

        // Semi-finals
        rounds.push([
            {
                matchId: 'playoff_semi_1',
                round: 1,
                team1: playoffTeams[0],
                team2: playoffTeams[3],
                completed: false
            },
            {
                matchId: 'playoff_semi_2',
                round: 1,
                team1: playoffTeams[1],
                team2: playoffTeams[2],
                completed: false
            }
        ]);

        // Finals placeholder
        rounds.push([
            {
                matchId: 'playoff_final',
                round: 2,
                team1: '',
                team2: '',
                completed: false
            }
        ]);

        this.activeSeason.playoffs = {
            rounds,
            currentRound: 1
        };
    }

    /**
     * Start practice mode
     */
    public startPractice(mode: PracticeConfig['mode'], difficulty: Difficulty, duration: number): PracticeConfig {
        this.currentMode = GameMode.PRACTICE;

        const goals: PracticeGoal[] = [];

        // Generate goals based on practice mode
        switch (mode) {
            case 'batting':
                goals.push(
                    { id: 'hits', description: 'Get 10 hits', target: 10, current: 0, reward: 50, completed: false },
                    { id: 'homeruns', description: 'Hit 3 home runs', target: 3, current: 0, reward: 100, completed: false },
                    { id: 'perfects', description: 'Get 5 perfect contacts', target: 5, current: 0, reward: 75, completed: false }
                );
                break;

            case 'pitching':
                goals.push(
                    { id: 'strikes', description: 'Throw 15 strikes', target: 15, current: 0, reward: 50, completed: false },
                    { id: 'strikeouts', description: 'Get 5 strikeouts', target: 5, current: 0, reward: 100, completed: false },
                    { id: 'perfect_location', description: 'Hit target 10 times', target: 10, current: 0, reward: 75, completed: false }
                );
                break;

            case 'fielding':
                goals.push(
                    { id: 'catches', description: 'Make 10 catches', target: 10, current: 0, reward: 50, completed: false },
                    { id: 'perfect_throws', description: 'Make 5 perfect throws', target: 5, current: 0, reward: 100, completed: false },
                    { id: 'diving_catches', description: 'Make 3 diving catches', target: 3, current: 0, reward: 150, completed: false }
                );
                break;
        }

        this.activePractice = {
            mode,
            difficulty,
            duration,
            goals
        };

        return this.activePractice;
    }

    /**
     * Update practice goal progress
     */
    public updatePracticeGoal(goalId: string, progress: number): void {
        if (!this.activePractice) return;

        const goal = this.activePractice.goals.find(g => g.id === goalId);
        if (!goal) return;

        goal.current += progress;

        if (goal.current >= goal.target && !goal.completed) {
            goal.completed = true;

            // Award experience in career mode
            if (this.careerData) {
                this.awardExperience(goal.reward);
            }
        }
    }

    /**
     * Start Home Run Derby
     */
    public startHomeRunDerby(competitors: string[], difficulty: Difficulty): HomeRunDerbyConfig {
        this.currentMode = GameMode.HOME_RUN_DERBY;

        this.activeHomeRunDerby = {
            rounds: 3,
            outsPerRound: 10,
            competitors,
            difficulty
        };

        // Initialize results
        for (const competitor of competitors) {
            this.derbyResults.set(competitor, {
                competitorId: competitor,
                homeRuns: 0,
                longestHomeRun: 0,
                totalDistance: 0
            });
        }

        return this.activeHomeRunDerby;
    }

    /**
     * Record home run in derby
     */
    public recordHomeRun(competitorId: string, distance: number): void {
        const result = this.derbyResults.get(competitorId);
        if (!result) return;

        result.homeRuns++;
        result.totalDistance += distance;

        if (distance > result.longestHomeRun) {
            result.longestHomeRun = distance;
        }
    }

    /**
     * Get Home Run Derby results
     */
    public getHomeRunDerbyResults(): HomeRunDerbyResults[] {
        return Array.from(this.derbyResults.values()).sort((a, b) => b.homeRuns - a.homeRuns);
    }

    /**
     * Create challenge
     */
    public createChallenge(
        name: string,
        description: string,
        objectives: ChallengeObjective[],
        difficulty: Difficulty,
        timeLimit?: number
    ): ChallengeData {
        const challenge: ChallengeData = {
            challengeId: `challenge_${Date.now()}`,
            name,
            description,
            objectives,
            difficulty,
            timeLimit,
            rewards: {
                coins: 500 * objectives.length,
                experience: 200 * objectives.length
            }
        };

        this.activeChallenges.set(challenge.challengeId, challenge);

        return challenge;
    }

    /**
     * Update challenge objective
     */
    public updateChallengeObjective(challengeId: string, objectiveId: string, progress: number): void {
        const challenge = this.activeChallenges.get(challengeId);
        if (!challenge) return;

        const objective = challenge.objectives.find(o => o.id === objectiveId);
        if (!objective) return;

        objective.current += progress;

        if (objective.current >= objective.target) {
            objective.completed = true;
        }

        // Check if all objectives complete
        const allComplete = challenge.objectives.every(o => o.completed);

        if (allComplete) {
            this.completeChallenge(challengeId);
        }
    }

    /**
     * Complete challenge
     */
    private completeChallenge(challengeId: string): void {
        const challenge = this.activeChallenges.get(challengeId);
        if (!challenge) return;

        this.completedChallenges.add(challengeId);

        // Award rewards
        if (this.careerData) {
            this.careerData.coins += challenge.rewards.coins;
            this.awardExperience(challenge.rewards.experience);

            if (challenge.rewards.unlocks) {
                for (const unlock of challenge.rewards.unlocks) {
                    // Handle unlock
                }
            }
        }

        this.activeChallenges.delete(challengeId);
    }

    /**
     * Get current mode
     */
    public getCurrentMode(): GameMode {
        return this.currentMode;
    }

    /**
     * Get current difficulty
     */
    public getCurrentDifficulty(): Difficulty {
        return this.currentDifficulty;
    }

    /**
     * Set difficulty
     */
    public setDifficulty(difficulty: Difficulty): void {
        this.currentDifficulty = difficulty;
    }

    /**
     * Get career data
     */
    public getCareerData(): CareerData | null {
        return this.careerData;
    }

    /**
     * Get active tournament
     */
    public getActiveTournament(): TournamentData | null {
        return this.activeTournament;
    }

    /**
     * Get active season
     */
    public getActiveSeason(): SeasonData | null {
        return this.activeSeason;
    }

    /**
     * Get active practice
     */
    public getActivePractice(): PracticeConfig | null {
        return this.activePractice;
    }

    /**
     * Save game data
     */
    public saveGameData(): object {
        return {
            currentMode: this.currentMode,
            currentDifficulty: this.currentDifficulty,
            careerData: this.careerData,
            activeTournament: this.activeTournament,
            activeSeason: this.activeSeason,
            completedChallenges: Array.from(this.completedChallenges)
        };
    }

    /**
     * Load game data
     */
    public loadGameData(data: any): void {
        this.currentMode = data.currentMode || GameMode.QUICK_PLAY;
        this.currentDifficulty = data.currentDifficulty || Difficulty.PRO;
        this.careerData = data.careerData || null;
        this.activeTournament = data.activeTournament || null;
        this.activeSeason = data.activeSeason || null;
        this.completedChallenges = new Set(data.completedChallenges || []);
    }

    /**
     * Dispose game modes system
     */
    public dispose(): void {
        this.careerData = null;
        this.activeTournament = null;
        this.activeSeason = null;
        this.activePractice = null;
        this.activeHomeRunDerby = null;
        this.activeChallenges.clear();
        this.derbyResults.clear();
    }
}
