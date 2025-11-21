/**
 * Player stamina and fatigue system
 * Affects performance over the course of a game and season
 */

export enum FatigueLevel {
    FRESH = 'FRESH',           // 90-100% stamina
    GOOD = 'GOOD',             // 70-89% stamina
    TIRED = 'TIRED',           // 50-69% stamina
    FATIGUED = 'FATIGUED',     // 30-49% stamina
    EXHAUSTED = 'EXHAUSTED'    // 0-29% stamina
}

export enum PlayerActivity {
    IDLE = 'IDLE',                    // Standing/waiting
    PITCHING = 'PITCHING',            // Throwing a pitch
    BATTING = 'BATTING',              // Swinging bat
    RUNNING_BASES = 'RUNNING_BASES',  // Base running
    FIELDING_ROUTINE = 'FIELDING_ROUTINE', // Catching routine fly
    FIELDING_DIVE = 'FIELDING_DIVE',  // Diving catch
    THROWING = 'THROWING',            // Throwing to base
    SPRINTING = 'SPRINTING'           // All-out sprint
}

export interface StaminaConfig {
    maxStamina: number;           // Base stamina pool (typically 100)
    recoveryRate: number;         // Stamina recovery per second when resting
    pitchingCost: number;         // Stamina cost per pitch
    battingCost: number;          // Stamina cost per swing
    runningCostPerMeter: number;  // Stamina cost per meter run
    diveCost: number;             // Stamina cost for diving
    throwCost: number;            // Stamina cost for throwing
    sprintMultiplier: number;     // Cost multiplier when sprinting (2x-3x)
}

export interface FatigueEffects {
    powerMultiplier: number;      // 0.5-1.0, affects hit/throw power
    accuracyMultiplier: number;   // 0.5-1.0, affects control
    speedMultiplier: number;      // 0.5-1.0, affects running speed
    reactionMultiplier: number;   // 0.5-1.0, affects fielding reactions
    injuryRisk: number;           // 0-1, chance of injury when fatigued
}

export interface PlayerStaminaState {
    playerId: string;
    currentStamina: number;
    maxStamina: number;
    fatigueLevel: FatigueLevel;
    pitchesThrown: number;
    swingsTaken: number;
    distanceRun: number;          // Total meters run
    consecutiveActivities: number; // Activities without rest
    minutesPlayed: number;
    isResting: boolean;
    timeSinceLastActivity: number; // Seconds
}

/**
 * Manages player stamina, fatigue, and performance degradation
 */
export class StaminaSystem {
    private playerStates: Map<string, PlayerStaminaState> = new Map();
    private config: StaminaConfig;

    // Fatigue accumulation over game
    private gameTime: number = 0;
    private inningNumber: number = 1;

    // Performance tracking
    private activityHistory: Map<string, PlayerActivity[]> = new Map();
    private maxHistoryLength: number = 20; // Track last 20 activities

    constructor(config?: Partial<StaminaConfig>) {
        // Default stamina configuration
        this.config = {
            maxStamina: 100,
            recoveryRate: 2.0,           // 2 stamina per second rest
            pitchingCost: 3.5,           // Each pitch costs stamina
            battingCost: 2.0,            // Each swing costs stamina
            runningCostPerMeter: 0.15,   // Cost per meter run
            diveCost: 8.0,               // Diving is expensive
            throwCost: 1.5,              // Throwing to base
            sprintMultiplier: 2.5,       // Sprinting costs 2.5x normal running
            ...config
        };
    }

    /**
     * Initialize stamina for a player
     */
    public initializePlayer(playerId: string, maxStamina?: number): void {
        const state: PlayerStaminaState = {
            playerId,
            currentStamina: maxStamina || this.config.maxStamina,
            maxStamina: maxStamina || this.config.maxStamina,
            fatigueLevel: FatigueLevel.FRESH,
            pitchesThrown: 0,
            swingsTaken: 0,
            distanceRun: 0,
            consecutiveActivities: 0,
            minutesPlayed: 0,
            isResting: true,
            timeSinceLastActivity: 0
        };

        this.playerStates.set(playerId, state);
        this.activityHistory.set(playerId, []);
    }

    /**
     * Update stamina system (call each frame)
     */
    public update(deltaTime: number): void {
        this.gameTime += deltaTime;

        // Update all players
        for (const [playerId, state] of this.playerStates.entries()) {
            this.updatePlayerStamina(playerId, state, deltaTime);
        }
    }

    /**
     * Update individual player stamina
     */
    private updatePlayerStamina(playerId: string, state: PlayerStaminaState, deltaTime: number): void {
        state.timeSinceLastActivity += deltaTime;

        // Recover stamina when resting
        if (state.isResting && state.timeSinceLastActivity > 3) {
            const recovery = this.config.recoveryRate * deltaTime;
            state.currentStamina = Math.min(state.maxStamina, state.currentStamina + recovery);
        }

        // Progressive fatigue over game time (stamina max decreases slightly each inning)
        const inningFatigueMultiplier = 1 - (this.inningNumber * 0.02); // -2% per inning
        const adjustedMaxStamina = this.config.maxStamina * Math.max(0.7, inningFatigueMultiplier);

        if (state.currentStamina > adjustedMaxStamina) {
            state.currentStamina = adjustedMaxStamina;
        }

        // Update fatigue level
        state.fatigueLevel = this.calculateFatigueLevel(state.currentStamina, adjustedMaxStamina);

        // Update minutes played
        state.minutesPlayed = this.gameTime / 60;
    }

    /**
     * Calculate fatigue level from current stamina
     */
    private calculateFatigueLevel(currentStamina: number, maxStamina: number): FatigueLevel {
        const percentage = (currentStamina / maxStamina) * 100;

        if (percentage >= 90) return FatigueLevel.FRESH;
        if (percentage >= 70) return FatigueLevel.GOOD;
        if (percentage >= 50) return FatigueLevel.TIRED;
        if (percentage >= 30) return FatigueLevel.FATIGUED;
        return FatigueLevel.EXHAUSTED;
    }

    /**
     * Record player activity and deduct stamina
     */
    public recordActivity(playerId: string, activity: PlayerActivity, intensity: number = 1.0): void {
        const state = this.playerStates.get(playerId);
        if (!state) return;

        // Calculate stamina cost
        let cost = 0;
        switch (activity) {
            case PlayerActivity.PITCHING:
                cost = this.config.pitchingCost;
                state.pitchesThrown++;
                break;

            case PlayerActivity.BATTING:
                cost = this.config.battingCost;
                state.swingsTaken++;
                break;

            case PlayerActivity.FIELDING_DIVE:
                cost = this.config.diveCost;
                break;

            case PlayerActivity.THROWING:
                cost = this.config.throwCost;
                break;

            case PlayerActivity.RUNNING_BASES:
                // Cost calculated based on distance in recordRunning()
                break;

            case PlayerActivity.SPRINTING:
                // Higher cost, calculated based on distance
                break;

            case PlayerActivity.FIELDING_ROUTINE:
                cost = 1.0; // Minimal cost for routine plays
                break;

            case PlayerActivity.IDLE:
                state.isResting = true;
                state.consecutiveActivities = 0;
                return;
        }

        // Apply intensity multiplier
        cost *= intensity;

        // Increase cost for consecutive activities without rest
        const consecutiveMultiplier = 1 + (state.consecutiveActivities * 0.1);
        cost *= consecutiveMultiplier;

        // Deduct stamina
        state.currentStamina = Math.max(0, state.currentStamina - cost);
        state.isResting = false;
        state.timeSinceLastActivity = 0;
        state.consecutiveActivities++;

        // Track activity history
        this.addToActivityHistory(playerId, activity);
    }

    /**
     * Record running activity with distance
     */
    public recordRunning(playerId: string, distanceMeters: number, isSprinting: boolean = false): void {
        const state = this.playerStates.get(playerId);
        if (!state) return;

        state.distanceRun += distanceMeters;

        const baseCost = this.config.runningCostPerMeter * distanceMeters;
        const cost = isSprinting ? baseCost * this.config.sprintMultiplier : baseCost;

        state.currentStamina = Math.max(0, state.currentStamina - cost);
        state.isResting = false;
        state.timeSinceLastActivity = 0;
        state.consecutiveActivities++;

        this.addToActivityHistory(playerId, isSprinting ? PlayerActivity.SPRINTING : PlayerActivity.RUNNING_BASES);
    }

    /**
     * Add activity to player's history
     */
    private addToActivityHistory(playerId: string, activity: PlayerActivity): void {
        const history = this.activityHistory.get(playerId);
        if (!history) return;

        history.push(activity);

        // Keep only recent history
        if (history.length > this.maxHistoryLength) {
            history.shift();
        }
    }

    /**
     * Get fatigue effects on player performance
     */
    public getFatigueEffects(playerId: string): FatigueEffects {
        const state = this.playerStates.get(playerId);
        if (!state) {
            return this.getDefaultFatigueEffects();
        }

        const staminaPercentage = state.currentStamina / state.maxStamina;

        // Base multipliers (1.0 = no effect)
        let powerMultiplier = 1.0;
        let accuracyMultiplier = 1.0;
        let speedMultiplier = 1.0;
        let reactionMultiplier = 1.0;
        let injuryRisk = 0;

        // Apply fatigue effects based on fatigue level
        switch (state.fatigueLevel) {
            case FatigueLevel.FRESH:
                // No penalties, slight bonus even
                powerMultiplier = 1.0;
                accuracyMultiplier = 1.0;
                speedMultiplier = 1.0;
                reactionMultiplier = 1.0;
                injuryRisk = 0.001; // Minimal risk
                break;

            case FatigueLevel.GOOD:
                powerMultiplier = 0.95;
                accuracyMultiplier = 0.97;
                speedMultiplier = 0.96;
                reactionMultiplier = 0.98;
                injuryRisk = 0.005;
                break;

            case FatigueLevel.TIRED:
                powerMultiplier = 0.85;
                accuracyMultiplier = 0.90;
                speedMultiplier = 0.88;
                reactionMultiplier = 0.92;
                injuryRisk = 0.015;
                break;

            case FatigueLevel.FATIGUED:
                powerMultiplier = 0.70;
                accuracyMultiplier = 0.75;
                speedMultiplier = 0.75;
                reactionMultiplier = 0.80;
                injuryRisk = 0.04;
                break;

            case FatigueLevel.EXHAUSTED:
                powerMultiplier = 0.50;
                accuracyMultiplier = 0.60;
                speedMultiplier = 0.60;
                reactionMultiplier = 0.65;
                injuryRisk = 0.10; // Significant injury risk
                break;
        }

        // Additional penalties for specific situations
        // Pitchers lose accuracy faster
        if (state.pitchesThrown > 80) {
            const overageMultiplier = 1 - ((state.pitchesThrown - 80) * 0.01);
            accuracyMultiplier *= Math.max(0.5, overageMultiplier);
        }

        // Batters lose power after many swings
        if (state.swingsTaken > 30) {
            const swingFatigue = 1 - ((state.swingsTaken - 30) * 0.005);
            powerMultiplier *= Math.max(0.7, swingFatigue);
        }

        // Long distance running affects speed
        if (state.distanceRun > 500) {
            const runFatigue = 1 - ((state.distanceRun - 500) * 0.0002);
            speedMultiplier *= Math.max(0.6, runFatigue);
        }

        return {
            powerMultiplier,
            accuracyMultiplier,
            speedMultiplier,
            reactionMultiplier,
            injuryRisk
        };
    }

    /**
     * Get default fatigue effects (no penalties)
     */
    private getDefaultFatigueEffects(): FatigueEffects {
        return {
            powerMultiplier: 1.0,
            accuracyMultiplier: 1.0,
            speedMultiplier: 1.0,
            reactionMultiplier: 1.0,
            injuryRisk: 0
        };
    }

    /**
     * Check if player should be warned about fatigue
     */
    public shouldWarnFatigue(playerId: string): boolean {
        const state = this.playerStates.get(playerId);
        if (!state) return false;

        return state.fatigueLevel === FatigueLevel.FATIGUED ||
               state.fatigueLevel === FatigueLevel.EXHAUSTED;
    }

    /**
     * Check if player should be substituted due to fatigue
     */
    public shouldSubstitute(playerId: string): boolean {
        const state = this.playerStates.get(playerId);
        if (!state) return false;

        // Auto-substitute if exhausted or pitcher has thrown too many pitches
        return state.fatigueLevel === FatigueLevel.EXHAUSTED ||
               (state.pitchesThrown > 100 && state.fatigueLevel === FatigueLevel.FATIGUED);
    }

    /**
     * Calculate injury occurrence based on fatigue
     */
    public checkInjury(playerId: string): boolean {
        const effects = this.getFatigueEffects(playerId);
        return Math.random() < effects.injuryRisk;
    }

    /**
     * Rest player (between innings, substitution)
     */
    public restPlayer(playerId: string, amount: number = 20): void {
        const state = this.playerStates.get(playerId);
        if (!state) return;

        state.currentStamina = Math.min(state.maxStamina, state.currentStamina + amount);
        state.isResting = true;
        state.consecutiveActivities = 0;
    }

    /**
     * Fully restore player stamina (between games)
     */
    public fullRestore(playerId: string): void {
        const state = this.playerStates.get(playerId);
        if (!state) return;

        state.currentStamina = state.maxStamina;
        state.pitchesThrown = 0;
        state.swingsTaken = 0;
        state.distanceRun = 0;
        state.consecutiveActivities = 0;
        state.isResting = true;
        state.timeSinceLastActivity = 0;

        const history = this.activityHistory.get(playerId);
        if (history) {
            history.length = 0;
        }
    }

    /**
     * Start new inning (slight stamina recovery)
     */
    public newInning(inningNumber: number): void {
        this.inningNumber = inningNumber;

        // All players get slight rest between innings
        for (const [playerId, state] of this.playerStates.entries()) {
            this.restPlayer(playerId, 10);
        }
    }

    /**
     * Get player stamina state
     */
    public getPlayerState(playerId: string): PlayerStaminaState | undefined {
        return this.playerStates.get(playerId);
    }

    /**
     * Get stamina percentage for UI display
     */
    public getStaminaPercentage(playerId: string): number {
        const state = this.playerStates.get(playerId);
        if (!state) return 100;

        return (state.currentStamina / state.maxStamina) * 100;
    }

    /**
     * Get fatigue level string for UI
     */
    public getFatigueDescription(playerId: string): string {
        const state = this.playerStates.get(playerId);
        if (!state) return 'Unknown';

        switch (state.fatigueLevel) {
            case FatigueLevel.FRESH:
                return 'Fresh and ready';
            case FatigueLevel.GOOD:
                return 'Good condition';
            case FatigueLevel.TIRED:
                return 'Getting tired';
            case FatigueLevel.FATIGUED:
                return 'Fatigued - performance affected';
            case FatigueLevel.EXHAUSTED:
                return 'EXHAUSTED - substitute recommended';
            default:
                return 'Unknown';
        }
    }

    /**
     * Get activity intensity analysis
     */
    public getActivityIntensity(playerId: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
        const state = this.playerStates.get(playerId);
        const history = this.activityHistory.get(playerId);

        if (!state || !history || history.length === 0) return 'LOW';

        // Analyze recent activity
        const recentActivities = history.slice(-10);
        const highIntensityCount = recentActivities.filter(a =>
            a === PlayerActivity.SPRINTING ||
            a === PlayerActivity.FIELDING_DIVE ||
            a === PlayerActivity.PITCHING
        ).length;

        if (highIntensityCount >= 7) return 'EXTREME';
        if (highIntensityCount >= 4) return 'HIGH';
        if (highIntensityCount >= 2) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Get recommended rest time in seconds
     */
    public getRecommendedRest(playerId: string): number {
        const state = this.playerStates.get(playerId);
        if (!state) return 0;

        const staminaDeficit = state.maxStamina - state.currentStamina;
        const restTime = staminaDeficit / this.config.recoveryRate;

        return Math.ceil(restTime);
    }

    /**
     * Export stamina data for statistics
     */
    public exportStaminaData(playerId: string): object {
        const state = this.playerStates.get(playerId);
        if (!state) return {};

        const effects = this.getFatigueEffects(playerId);
        const intensity = this.getActivityIntensity(playerId);

        return {
            playerId: state.playerId,
            currentStamina: state.currentStamina,
            staminaPercentage: this.getStaminaPercentage(playerId),
            fatigueLevel: state.fatigueLevel,
            pitchesThrown: state.pitchesThrown,
            swingsTaken: state.swingsTaken,
            distanceRun: state.distanceRun,
            minutesPlayed: state.minutesPlayed,
            activityIntensity: intensity,
            performanceMultipliers: {
                power: effects.powerMultiplier,
                accuracy: effects.accuracyMultiplier,
                speed: effects.speedMultiplier,
                reaction: effects.reactionMultiplier
            },
            injuryRisk: effects.injuryRisk,
            recommendedRestSeconds: this.getRecommendedRest(playerId)
        };
    }

    /**
     * Get all players' stamina summary
     */
    public getAllPlayersSummary(): Map<string, {stamina: number, fatigue: FatigueLevel}> {
        const summary = new Map();

        for (const [playerId, state] of this.playerStates.entries()) {
            summary.set(playerId, {
                stamina: this.getStaminaPercentage(playerId),
                fatigue: state.fatigueLevel
            });
        }

        return summary;
    }

    /**
     * Dispose stamina system
     */
    public dispose(): void {
        this.playerStates.clear();
        this.activityHistory.clear();
    }
}
