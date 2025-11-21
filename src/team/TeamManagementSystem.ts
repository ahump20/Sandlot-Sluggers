/**
 * Comprehensive Team Management System
 * Handles roster management, lineups, substitutions, and team building
 */

export interface PlayerAttributes {
    playerId: string;
    playerName: string;
    number: number;
    position: string;

    // Core stats (1-10 scale)
    power: number;
    contact: number;
    speed: number;
    pitchSpeed: number;
    pitchControl: number;
    fieldingRange: number;
    fieldingAccuracy: number;

    // Advanced stats
    batting: {
        average: number;
        onBasePercentage: number;
        slugging: number;
        homeRuns: number;
        rbi: number;
        strikeouts: number;
        walks: number;
    };

    pitching: {
        earnedRunAverage: number;
        wins: number;
        losses: number;
        strikeouts: number;
        walks: number;
        inningsPitched: number;
        saves: number;
    };

    fielding: {
        fieldingPercentage: number;
        errors: number;
        putouts: number;
        assists: number;
    };

    // Player traits and tendencies
    traits: PlayerTrait[];
    hotZones: string[];
    coldZones: string[];
    preferredPitches: string[];

    // Physical attributes
    height: number; // inches
    weight: number; // lbs
    bats: 'R' | 'L' | 'S'; // Switch hitter
    throws: 'R' | 'L';

    // Status
    isInjured: boolean;
    injuryDays: number;
    fatigueLevel: number; // 0-100
    morale: number; // 0-100

    // Contract/Value
    overall: number; // 0-100 overall rating
    potential: number; // 0-100 growth potential
    experience: number; // Years in game
    salary: number;
    contractYears: number;

    // Development
    developmentPoints: number;
    skillUpgrades: Map<string, number>;
}

export interface PlayerTrait {
    traitId: string;
    name: string;
    description: string;
    category: 'batting' | 'pitching' | 'fielding' | 'mental' | 'physical';
    effect: {
        statModifier?: { stat: string; amount: number };
        specialAbility?: string;
    };
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface Team {
    teamId: string;
    teamName: string;
    teamAbbreviation: string;
    teamColor: string;
    logoUrl: string;

    // Roster
    activeRoster: Map<string, PlayerAttributes>;
    benchPlayers: string[];
    injuredReserve: string[];

    // Lineup configuration
    battingOrder: string[]; // 9 player IDs in batting order
    fieldingPositions: Map<string, string>; // playerId -> position
    startingPitcher: string;
    bullpen: string[];

    // Team stats
    wins: number;
    losses: number;
    ties: number;
    winStreak: number;
    lossStreak: number;

    // Team ratings
    battingRating: number;
    pitchingRating: number;
    fieldingRating: number;
    speedRating: number;
    overallRating: number;

    // Team strategy
    offensiveStrategy: 'power' | 'contact' | 'speed' | 'balanced';
    defensiveStrategy: 'aggressive' | 'standard' | 'conservative';
    baserunningStyle: 'aggressive' | 'moderate' | 'conservative';

    // Resources
    budget: number;
    scoutingPoints: number;
}

export interface LineupCard {
    battingOrder: Array<{
        position: number; // 1-9
        playerId: string;
        fieldPosition: string;
    }>;
    startingPitcher: string;
    benchPlayers: string[];
    isValid: boolean;
    validationErrors: string[];
}

export interface SubstitutionRequest {
    requestId: string;
    type: 'pinch_hitter' | 'pinch_runner' | 'defensive_replacement' | 'pitching_change';
    playerOut: string;
    playerIn: string;
    position?: string;
    reason: string;
    inning: number;
    approved: boolean;
}

export interface TradeProposal {
    tradeId: string;
    proposingTeam: string;
    receivingTeam: string;
    playersOffered: string[];
    playersRequested: string[];
    additionalTerms?: {
        cashIncluded?: number;
        draftPicksIncluded?: string[];
    };
    status: 'pending' | 'accepted' | 'rejected' | 'countered';
    fairnessRating: number; // 0-100, how fair the trade is
}

export interface DraftPick {
    round: number;
    pick: number;
    overallPick: number;
    playerId?: string;
    team: string;
}

export interface ScoutingReport {
    playerId: string;
    scoutedBy: string;
    scoutingDate: Date;

    // Ratings
    currentRatings: {
        hitting: number;
        power: number;
        speed: number;
        fielding: number;
        arm: number;
        pitching?: number;
        control?: number;
    };

    potentialRatings: {
        hitting: number;
        power: number;
        speed: number;
        fielding: number;
        arm: number;
        pitching?: number;
        control?: number;
    };

    // Analysis
    strengths: string[];
    weaknesses: string[];
    projectRion: string;
    risk: 'low' | 'medium' | 'high';
    recommendation: 'pass' | 'monitor' | 'target' | 'must_have';

    // Comparisons
    mlbComparison?: string;
    similarPlayers: string[];
}

export interface TeamChemistry {
    overall: number; // 0-100
    batteryChemistry: Map<string, Map<string, number>>; // pitcher -> catcher -> chemistry
    infieldChemistry: number;
    outfieldChemistry: number;
    clubhouseLeaders: string[];
    personalityConflicts: Array<{ player1: string; player2: string; severity: number }>;
}

export interface CoachingStaff {
    headCoach: Coach;
    battingCoach: Coach;
    pitchingCoach: Coach;
    fieldingCoach: Coach;
    strengthCoach: Coach;
    mentalCoach: Coach;
}

export interface Coach {
    coachId: string;
    name: string;
    specialty: string;
    experience: number;
    rating: number; // 1-10
    bonus: {
        statBoost: string; // Which stat gets boosted
        amount: number; // How much boost
    };
    personalityType: 'motivator' | 'technician' | 'strategist' | 'player_friendly';
}

/**
 * Comprehensive Team Management System
 */
export class TeamManagementSystem {
    private teams: Map<string, Team> = new Map();
    private players: Map<string, PlayerAttributes> = new Map();
    private availablePlayers: Map<string, PlayerAttributes> = new Map(); // Free agents

    // Draft system
    private draftOrder: DraftPick[] = [];
    private isDraftActive: boolean = false;
    private currentDraftPick: number = 0;

    // Trade system
    private activeTradeProposals: Map<string, TradeProposal> = new Map();
    private tradeHistory: TradeProposal[] = [];

    // Scouting
    private scoutingReports: Map<string, ScoutingReport[]> = new Map();

    // Substitutions
    private gameSubstitutions: SubstitutionRequest[] = [];

    // Team chemistry
    private teamChemistry: Map<string, TeamChemistry> = new Map();

    // Coaching
    private coachingStaffs: Map<string, CoachingStaff> = new Map();

    // Player traits library
    private availableTraits: Map<string, PlayerTrait> = new Map();

    // Salary cap
    private readonly SALARY_CAP = 100000000; // $100M
    private readonly MIN_ROSTER_SIZE = 9;
    private readonly MAX_ROSTER_SIZE = 25;

    constructor() {
        this.initializePlayerTraits();
    }

    /**
     * Initialize available player traits
     */
    private initializePlayerTraits(): void {
        // Batting traits
        this.availableTraits.set('clutch_hitter', {
            traitId: 'clutch_hitter',
            name: 'Clutch Hitter',
            description: '+2 contact and power with runners in scoring position',
            category: 'batting',
            effect: {
                specialAbility: 'clutch_bonus'
            },
            rarity: 'rare'
        });

        this.availableTraits.set('home_run_hitter', {
            traitId: 'home_run_hitter',
            name: 'Home Run Hitter',
            description: '+3 power, increased home run probability',
            category: 'batting',
            effect: {
                statModifier: { stat: 'power', amount: 3 }
            },
            rarity: 'uncommon'
        });

        this.availableTraits.set('contact_specialist', {
            traitId: 'contact_specialist',
            name: 'Contact Specialist',
            description: '+3 contact, rarely strikes out',
            category: 'batting',
            effect: {
                statModifier: { stat: 'contact', amount: 3 }
            },
            rarity: 'uncommon'
        });

        this.availableTraits.set('speed_demon', {
            traitId: 'speed_demon',
            name: 'Speed Demon',
            description: '+3 speed, increased stolen base success',
            category: 'physical',
            effect: {
                statModifier: { stat: 'speed', amount: 3 }
            },
            rarity: 'uncommon'
        });

        // Pitching traits
        this.availableTraits.set('ace', {
            traitId: 'ace',
            name: 'Ace',
            description: '+2 to all pitching stats, stamina drains slower',
            category: 'pitching',
            effect: {
                specialAbility: 'ace_bonus'
            },
            rarity: 'epic'
        });

        this.availableTraits.set('closer', {
            traitId: 'closer',
            name: 'Closer',
            description: 'Significantly better in save situations',
            category: 'pitching',
            effect: {
                specialAbility: 'closer_bonus'
            },
            rarity: 'rare'
        });

        this.availableTraits.set('control_artist', {
            traitId: 'control_artist',
            name: 'Control Artist',
            description: '+3 control, rarely walks batters',
            category: 'pitching',
            effect: {
                statModifier: { stat: 'pitchControl', amount: 3 }
            },
            rarity: 'uncommon'
        });

        this.availableTraits.set('power_pitcher', {
            traitId: 'power_pitcher',
            name: 'Power Pitcher',
            description: '+3 velocity, more strikeouts',
            category: 'pitching',
            effect: {
                statModifier: { stat: 'pitchSpeed', amount: 3 }
            },
            rarity: 'uncommon'
        });

        // Fielding traits
        this.availableTraits.set('gold_glove', {
            traitId: 'gold_glove',
            name: 'Gold Glove',
            description: '+3 fielding range and accuracy',
            category: 'fielding',
            effect: {
                statModifier: { stat: 'fieldingRange', amount: 3 }
            },
            rarity: 'epic'
        });

        this.availableTraits.set('strong_arm', {
            traitId: 'strong_arm',
            name: 'Strong Arm',
            description: 'Faster, more accurate throws',
            category: 'fielding',
            effect: {
                specialAbility: 'strong_arm'
            },
            rarity: 'rare'
        });

        // Mental traits
        this.availableTraits.set('team_leader', {
            traitId: 'team_leader',
            name: 'Team Leader',
            description: 'Boosts morale of entire team',
            category: 'mental',
            effect: {
                specialAbility: 'morale_boost'
            },
            rarity: 'rare'
        });

        this.availableTraits.set('ice_in_veins', {
            traitId: 'ice_in_veins',
            name: 'Ice in Veins',
            description: 'Never gets nervous in pressure situations',
            category: 'mental',
            effect: {
                specialAbility: 'pressure_immunity'
            },
            rarity: 'epic'
        });

        this.availableTraits.set('hot_head', {
            traitId: 'hot_head',
            name: 'Hot Head',
            description: '-1 all stats when losing, +1 when winning',
            category: 'mental',
            effect: {
                specialAbility: 'momentum_swings'
            },
            rarity: 'common'
        });

        // Physical traits
        this.availableTraits.set('iron_man', {
            traitId: 'iron_man',
            name: 'Iron Man',
            description: 'Fatigue affects performance 50% less',
            category: 'physical',
            effect: {
                specialAbility: 'fatigue_resistance'
            },
            rarity: 'legendary'
        });

        this.availableTraits.set('injury_prone', {
            traitId: 'injury_prone',
            name: 'Injury Prone',
            description: '2x higher injury risk',
            category: 'physical',
            effect: {
                specialAbility: 'injury_risk'
            },
            rarity: 'common'
        });
    }

    /**
     * Create new team
     */
    public createTeam(teamName: string, abbreviation: string, color: string): Team {
        const teamId = `team_${Date.now()}_${Math.random()}`;

        const team: Team = {
            teamId,
            teamName,
            teamAbbreviation: abbreviation,
            teamColor: color,
            logoUrl: '',
            activeRoster: new Map(),
            benchPlayers: [],
            injuredReserve: [],
            battingOrder: [],
            fieldingPositions: new Map(),
            startingPitcher: '',
            bullpen: [],
            wins: 0,
            losses: 0,
            ties: 0,
            winStreak: 0,
            lossStreak: 0,
            battingRating: 50,
            pitchingRating: 50,
            fieldingRating: 50,
            speedRating: 50,
            overallRating: 50,
            offensiveStrategy: 'balanced',
            defensiveStrategy: 'standard',
            baserunningStyle: 'moderate',
            budget: this.SALARY_CAP,
            scoutingPoints: 1000
        };

        this.teams.set(teamId, team);

        // Initialize team chemistry
        this.teamChemistry.set(teamId, {
            overall: 50,
            batteryChemistry: new Map(),
            infieldChemistry: 50,
            outfieldChemistry: 50,
            clubhouseLeaders: [],
            personalityConflicts: []
        });

        return team;
    }

    /**
     * Add player to team
     */
    public addPlayerToTeam(teamId: string, player: PlayerAttributes): boolean {
        const team = this.teams.get(teamId);
        if (!team) return false;

        // Check roster size
        if (team.activeRoster.size >= this.MAX_ROSTER_SIZE) {
            console.log('Roster is full');
            return false;
        }

        // Check salary cap
        const currentPayroll = this.calculateTeamPayroll(teamId);
        if (currentPayroll + player.salary > this.SALARY_CAP) {
            console.log('Signing would exceed salary cap');
            return false;
        }

        // Add player to roster
        team.activeRoster.set(player.playerId, player);
        this.players.set(player.playerId, player);

        // Update team ratings
        this.updateTeamRatings(teamId);

        return true;
    }

    /**
     * Remove player from team
     */
    public removePlayerFromTeam(teamId: string, playerId: string): boolean {
        const team = this.teams.get(teamId);
        if (!team) return false;

        // Remove from active roster
        const removed = team.activeRoster.delete(playerId);

        if (removed) {
            // Remove from lineup if present
            team.battingOrder = team.battingOrder.filter(id => id !== playerId);
            team.fieldingPositions.delete(playerId);
            team.benchPlayers = team.benchPlayers.filter(id => id !== playerId);
            team.bullpen = team.bullpen.filter(id => id !== playerId);

            // Update team ratings
            this.updateTeamRatings(teamId);
        }

        return removed;
    }

    /**
     * Set batting lineup
     */
    public setBattingLineup(teamId: string, lineup: string[]): boolean {
        const team = this.teams.get(teamId);
        if (!team) return false;

        // Validate lineup
        if (lineup.length !== 9) {
            console.log('Lineup must have exactly 9 players');
            return false;
        }

        // Check all players exist on roster
        for (const playerId of lineup) {
            if (!team.activeRoster.has(playerId)) {
                console.log(`Player ${playerId} not on roster`);
                return false;
            }
        }

        // Check no duplicates
        const uniquePlayers = new Set(lineup);
        if (uniquePlayers.size !== lineup.length) {
            console.log('Lineup contains duplicate players');
            return false;
        }

        team.battingOrder = lineup;
        return true;
    }

    /**
     * Set fielding positions
     */
    public setFieldingPositions(teamId: string, positions: Map<string, string>): boolean {
        const team = this.teams.get(teamId);
        if (!team) return false;

        // Validate positions
        const requiredPositions = [
            'pitcher', 'catcher', 'first_base', 'second_base', 'third_base',
            'shortstop', 'left_field', 'center_field', 'right_field'
        ];

        const assignedPositions = new Set(positions.values());

        // Check all positions are covered
        for (const pos of requiredPositions) {
            if (!assignedPositions.has(pos)) {
                console.log(`Missing position: ${pos}`);
                return false;
            }
        }

        // Check players exist
        for (const playerId of positions.keys()) {
            if (!team.activeRoster.has(playerId)) {
                console.log(`Player ${playerId} not on roster`);
                return false;
            }
        }

        team.fieldingPositions = positions;
        return true;
    }

    /**
     * Create lineup card
     */
    public createLineupCard(teamId: string): LineupCard {
        const team = this.teams.get(teamId);
        if (!team) {
            return {
                battingOrder: [],
                startingPitcher: '',
                benchPlayers: [],
                isValid: false,
                validationErrors: ['Team not found']
            };
        }

        const errors: string[] = [];

        // Validate batting order
        if (team.battingOrder.length !== 9) {
            errors.push('Batting order must have 9 players');
        }

        // Validate starting pitcher
        if (!team.startingPitcher) {
            errors.push('No starting pitcher assigned');
        }

        // Build lineup card
        const battingOrder = team.battingOrder.map((playerId, index) => {
            const position = team.fieldingPositions.get(playerId) || 'unknown';
            return {
                position: index + 1,
                playerId,
                fieldPosition: position
            };
        });

        // Get bench players
        const fieldersAndStarter = new Set([...team.battingOrder, team.startingPitcher]);
        const benchPlayers = Array.from(team.activeRoster.keys()).filter(
            id => !fieldersAndStarter.has(id)
        );

        return {
            battingOrder,
            startingPitcher: team.startingPitcher,
            benchPlayers,
            isValid: errors.length === 0,
            validationErrors: errors
        };
    }

    /**
     * Request substitution
     */
    public requestSubstitution(
        teamId: string,
        type: SubstitutionRequest['type'],
        playerOut: string,
        playerIn: string,
        inning: number,
        reason: string
    ): SubstitutionRequest {
        const request: SubstitutionRequest = {
            requestId: `sub_${Date.now()}`,
            type,
            playerOut,
            playerIn,
            inning,
            reason,
            approved: false
        };

        // Validate substitution
        const team = this.teams.get(teamId);
        if (!team) {
            console.log('Team not found');
            return request;
        }

        // Check player in is available
        if (!team.benchPlayers.includes(playerIn) && !team.bullpen.includes(playerIn)) {
            console.log('Player not available for substitution');
            return request;
        }

        // Check player out is in game
        if (!team.battingOrder.includes(playerOut) && playerOut !== team.startingPitcher) {
            console.log('Player to substitute is not in game');
            return request;
        }

        // Approve substitution
        request.approved = true;
        this.gameSubstitutions.push(request);

        // Execute substitution
        this.executeSubstitution(teamId, request);

        return request;
    }

    /**
     * Execute substitution
     */
    private executeSubstitution(teamId: string, request: SubstitutionRequest): void {
        const team = this.teams.get(teamId);
        if (!team || !request.approved) return;

        switch (request.type) {
            case 'pinch_hitter':
            case 'pinch_runner':
                // Replace in batting order
                const batterIndex = team.battingOrder.indexOf(request.playerOut);
                if (batterIndex !== -1) {
                    team.battingOrder[batterIndex] = request.playerIn;
                }

                // Move players between bench and field
                const benchIndex = team.benchPlayers.indexOf(request.playerIn);
                if (benchIndex !== -1) {
                    team.benchPlayers.splice(benchIndex, 1);
                }
                team.benchPlayers.push(request.playerOut);
                break;

            case 'defensive_replacement':
                // Update fielding position
                if (request.position) {
                    team.fieldingPositions.set(request.playerIn, request.position);
                    team.fieldingPositions.delete(request.playerOut);
                }

                // Replace in batting order
                const defIndex = team.battingOrder.indexOf(request.playerOut);
                if (defIndex !== -1) {
                    team.battingOrder[defIndex] = request.playerIn;
                }

                // Move players
                const defBenchIndex = team.benchPlayers.indexOf(request.playerIn);
                if (defBenchIndex !== -1) {
                    team.benchPlayers.splice(defBenchIndex, 1);
                }
                team.benchPlayers.push(request.playerOut);
                break;

            case 'pitching_change':
                // Replace pitcher
                if (request.playerOut === team.startingPitcher) {
                    team.startingPitcher = request.playerIn;
                }

                // Move to/from bullpen
                const pitchIndex = team.bullpen.indexOf(request.playerIn);
                if (pitchIndex !== -1) {
                    team.bullpen.splice(pitchIndex, 1);
                }
                team.bullpen.push(request.playerOut);
                break;
        }
    }

    /**
     * Propose trade
     */
    public proposeTrade(
        proposingTeam: string,
        receivingTeam: string,
        playersOffered: string[],
        playersRequested: string[],
        additionalTerms?: TradeProposal['additionalTerms']
    ): TradeProposal {
        const tradeId = `trade_${Date.now()}`;

        // Calculate trade fairness
        const fairness = this.evaluateTradeFairness(
            proposingTeam,
            receivingTeam,
            playersOffered,
            playersRequested
        );

        const proposal: TradeProposal = {
            tradeId,
            proposingTeam,
            receivingTeam,
            playersOffered,
            playersRequested,
            additionalTerms,
            status: 'pending',
            fairnessRating: fairness
        };

        this.activeTradeProposals.set(tradeId, proposal);

        return proposal;
    }

    /**
     * Evaluate trade fairness
     */
    private evaluateTradeFairness(
        team1: string,
        team2: string,
        team1Players: string[],
        team2Players: string[]
    ): number {
        // Calculate total value of each side
        let team1Value = 0;
        let team2Value = 0;

        for (const playerId of team1Players) {
            const player = this.players.get(playerId);
            if (player) {
                team1Value += this.calculatePlayerValue(player);
            }
        }

        for (const playerId of team2Players) {
            const player = this.players.get(playerId);
            if (player) {
                team2Value += this.calculatePlayerValue(player);
            }
        }

        // Calculate fairness (0-100)
        const maxValue = Math.max(team1Value, team2Value);
        const minValue = Math.min(team1Value, team2Value);

        if (maxValue === 0) return 0;

        return (minValue / maxValue) * 100;
    }

    /**
     * Calculate player value for trades
     */
    private calculatePlayerValue(player: PlayerAttributes): number {
        let value = player.overall;

        // Age/potential factor
        if (player.experience < 3) {
            value += player.potential * 0.3; // Young players with potential are valuable
        } else if (player.experience > 10) {
            value *= 0.8; // Older players worth less
        }

        // Contract factor
        value *= (1 / (player.contractYears + 1)) * 2; // Shorter contracts more valuable

        // Salary factor
        const salaryRatio = player.salary / 10000000; // Normalize to $10M
        value *= Math.max(0.5, 2 - salaryRatio); // Expensive players less valuable

        return value;
    }

    /**
     * Accept trade
     */
    public acceptTrade(tradeId: string): boolean {
        const trade = this.activeTradeProposals.get(tradeId);
        if (!trade || trade.status !== 'pending') return false;

        const team1 = this.teams.get(trade.proposingTeam);
        const team2 = this.teams.get(trade.receivingTeam);

        if (!team1 || !team2) return false;

        // Execute trade - move players
        for (const playerId of trade.playersOffered) {
            this.removePlayerFromTeam(trade.proposingTeam, playerId);
            const player = this.players.get(playerId);
            if (player) {
                this.addPlayerToTeam(trade.receivingTeam, player);
            }
        }

        for (const playerId of trade.playersRequested) {
            this.removePlayerFromTeam(trade.receivingTeam, playerId);
            const player = this.players.get(playerId);
            if (player) {
                this.addPlayerToTeam(trade.proposingTeam, player);
            }
        }

        // Handle additional terms
        if (trade.additionalTerms?.cashIncluded) {
            team1.budget -= trade.additionalTerms.cashIncluded;
            team2.budget += trade.additionalTerms.cashIncluded;
        }

        trade.status = 'accepted';
        this.tradeHistory.push(trade);
        this.activeTradeProposals.delete(tradeId);

        return true;
    }

    /**
     * Reject trade
     */
    public rejectTrade(tradeId: string): boolean {
        const trade = this.activeTradeProposals.get(tradeId);
        if (!trade || trade.status !== 'pending') return false;

        trade.status = 'rejected';
        this.tradeHistory.push(trade);
        this.activeTradeProposals.delete(tradeId);

        return true;
    }

    /**
     * Start draft
     */
    public startDraft(teams: string[], rounds: number = 10): void {
        this.draftOrder = [];
        this.isDraftActive = true;
        this.currentDraftPick = 0;

        // Generate draft order (snake draft)
        for (let round = 1; round <= rounds; round++) {
            const roundTeams = round % 2 === 1 ? teams : [...teams].reverse();

            for (let i = 0; i < roundTeams.length; i++) {
                const pickNumber = (round - 1) * teams.length + i + 1;

                this.draftOrder.push({
                    round,
                    pick: i + 1,
                    overallPick: pickNumber,
                    team: roundTeams[i]
                });
            }
        }
    }

    /**
     * Make draft pick
     */
    public makeDraftPick(teamId: string, playerId: string): boolean {
        if (!this.isDraftActive) return false;

        const currentPick = this.draftOrder[this.currentDraftPick];
        if (!currentPick || currentPick.team !== teamId) {
            console.log('Not your turn to pick');
            return false;
        }

        // Check if player available
        const player = this.availablePlayers.get(playerId);
        if (!player) {
            console.log('Player not available');
            return false;
        }

        // Execute pick
        currentPick.playerId = playerId;
        this.addPlayerToTeam(teamId, player);
        this.availablePlayers.delete(playerId);

        // Move to next pick
        this.currentDraftPick++;

        // Check if draft complete
        if (this.currentDraftPick >= this.draftOrder.length) {
            this.isDraftActive = false;
            console.log('Draft completed!');
        }

        return true;
    }

    /**
     * Scout player
     */
    public scoutPlayer(teamId: string, playerId: string): ScoutingReport | null {
        const team = this.teams.get(teamId);
        const player = this.players.get(playerId) || this.availablePlayers.get(playerId);

        if (!team || !player) return null;

        // Check scouting points
        const scoutingCost = 10;
        if (team.scoutingPoints < scoutingCost) {
            console.log('Not enough scouting points');
            return null;
        }

        team.scoutingPoints -= scoutingCost;

        // Generate scouting report
        const report: ScoutingReport = {
            playerId,
            scoutedBy: teamId,
            scoutingDate: new Date(),
            currentRatings: {
                hitting: player.contact,
                power: player.power,
                speed: player.speed,
                fielding: player.fieldingRange,
                arm: player.fieldingAccuracy,
                pitching: player.pitchSpeed,
                control: player.pitchControl
            },
            potentialRatings: {
                hitting: Math.min(10, player.contact + 2),
                power: Math.min(10, player.power + 2),
                speed: Math.min(10, player.speed + 1),
                fielding: Math.min(10, player.fieldingRange + 2),
                arm: Math.min(10, player.fieldingAccuracy + 2),
                pitching: Math.min(10, player.pitchSpeed + 2),
                control: Math.min(10, player.pitchControl + 2)
            },
            strengths: this.identifyPlayerStrengths(player),
            weaknesses: this.identifyPlayerWeaknesses(player),
            projectRion: this.projectPlayerDevelopment(player),
            risk: this.assessPlayerRisk(player),
            recommendation: this.getScoutRecommendation(player),
            similarPlayers: []
        };

        // Store report
        if (!this.scoutingReports.has(teamId)) {
            this.scoutingReports.set(teamId, []);
        }
        this.scoutingReports.get(teamId)!.push(report);

        return report;
    }

    /**
     * Identify player strengths
     */
    private identifyPlayerStrengths(player: PlayerAttributes): string[] {
        const strengths: string[] = [];

        if (player.power >= 8) strengths.push('Elite power hitter');
        if (player.contact >= 8) strengths.push('Excellent contact');
        if (player.speed >= 8) strengths.push('Blazing speed');
        if (player.pitchSpeed >= 8) strengths.push('Power pitcher');
        if (player.pitchControl >= 8) strengths.push('Pinpoint control');
        if (player.fieldingRange >= 8) strengths.push('Outstanding range');
        if (player.fieldingAccuracy >= 8) strengths.push('Strong arm');

        return strengths;
    }

    /**
     * Identify player weaknesses
     */
    private identifyPlayerWeaknesses(player: PlayerAttributes): string[] {
        const weaknesses: string[] = [];

        if (player.power <= 3) weaknesses.push('Limited power');
        if (player.contact <= 3) weaknesses.push('Struggles with contact');
        if (player.speed <= 3) weaknesses.push('Below average speed');
        if (player.pitchSpeed <= 3) weaknesses.push('Lacks velocity');
        if (player.pitchControl <= 3) weaknesses.push('Control issues');
        if (player.fieldingRange <= 3) weaknesses.push('Limited range');
        if (player.fieldingAccuracy <= 3) weaknesses.push('Weak arm');

        return weaknesses;
    }

    /**
     * Project player development
     */
    private projectPlayerDevelopment(player: PlayerAttributes): string {
        if (player.potential >= 9) return 'Future superstar';
        if (player.potential >= 7) return 'All-star potential';
        if (player.potential >= 5) return 'Solid contributor';
        if (player.potential >= 3) return 'Role player';
        return 'Limited upside';
    }

    /**
     * Assess player risk
     */
    private assessPlayerRisk(player: PlayerAttributes): 'low' | 'medium' | 'high' {
        let riskScore = 0;

        if (player.isInjured) riskScore += 2;
        if (player.traits.some(t => t.traitId === 'injury_prone')) riskScore += 2;
        if (player.experience < 1) riskScore += 1; // Unproven
        // if (player.age > 35) riskScore += 2; // Age decline - TODO: add age property
        if (player.morale < 40) riskScore += 1;

        if (riskScore >= 4) return 'high';
        if (riskScore >= 2) return 'medium';
        return 'low';
    }

    /**
     * Get scout recommendation
     */
    private getScoutRecommendation(player: PlayerAttributes): ScoutingReport['recommendation'] {
        const value = this.calculatePlayerValue(player);

        if (value >= 90) return 'must_have';
        if (value >= 75) return 'target';
        if (value >= 60) return 'monitor';
        return 'pass';
    }

    /**
     * Calculate team payroll
     */
    public calculateTeamPayroll(teamId: string): number {
        const team = this.teams.get(teamId);
        if (!team) return 0;

        let totalSalary = 0;

        for (const player of team.activeRoster.values()) {
            totalSalary += player.salary;
        }

        return totalSalary;
    }

    /**
     * Update team ratings
     */
    private updateTeamRatings(teamId: string): void {
        const team = this.teams.get(teamId);
        if (!team) return;

        let battingTotal = 0;
        let pitchingTotal = 0;
        let fieldingTotal = 0;
        let speedTotal = 0;
        let count = 0;

        for (const player of team.activeRoster.values()) {
            battingTotal += (player.contact + player.power) / 2;
            pitchingTotal += (player.pitchSpeed + player.pitchControl) / 2;
            fieldingTotal += (player.fieldingRange + player.fieldingAccuracy) / 2;
            speedTotal += player.speed;
            count++;
        }

        if (count > 0) {
            team.battingRating = Math.round((battingTotal / count) * 10);
            team.pitchingRating = Math.round((pitchingTotal / count) * 10);
            team.fieldingRating = Math.round((fieldingTotal / count) * 10);
            team.speedRating = Math.round((speedTotal / count) * 10);
            team.overallRating = Math.round(
                (team.battingRating + team.pitchingRating + team.fieldingRating + team.speedRating) / 4
            );
        }
    }

    /**
     * Update team chemistry
     */
    public updateTeamChemistry(teamId: string): void {
        const team = this.teams.get(teamId);
        const chemistry = this.teamChemistry.get(teamId);

        if (!team || !chemistry) return;

        // Calculate battery chemistry (pitcher-catcher pairs)
        // Calculate based on games played together, success rate, etc.

        // Calculate infield/outfield chemistry
        // Based on positioning, communication, experience together

        // Identify clubhouse leaders
        chemistry.clubhouseLeaders = Array.from(team.activeRoster.values())
            .filter(p => p.traits.some(t => t.traitId === 'team_leader'))
            .map(p => p.playerId);

        // Overall chemistry affects team performance
        chemistry.overall = 50; // Would calculate based on various factors
    }

    /**
     * Get team
     */
    public getTeam(teamId: string): Team | undefined {
        return this.teams.get(teamId);
    }

    /**
     * Get player
     */
    public getPlayer(playerId: string): PlayerAttributes | undefined {
        return this.players.get(playerId);
    }

    /**
     * Get available free agents
     */
    public getFreeAgents(): PlayerAttributes[] {
        return Array.from(this.availablePlayers.values());
    }

    /**
     * Get scouting reports for team
     */
    public getScoutingReports(teamId: string): ScoutingReport[] {
        return this.scoutingReports.get(teamId) || [];
    }

    /**
     * Dispose team management system
     */
    public dispose(): void {
        this.teams.clear();
        this.players.clear();
        this.availablePlayers.clear();
        this.activeTradeProposals.clear();
        this.scoutingReports.clear();
        this.teamChemistry.clear();
        this.coachingStaffs.clear();
    }
}
