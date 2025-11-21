/**
 * AI Difficulty and Adaptive Intelligence System
 * Provides dynamic difficulty adjustment and smart opponent AI
 */

export enum DifficultyLevel {
    ROOKIE = 'ROOKIE',
    PRO = 'PRO',
    ALL_STAR = 'ALL_STAR',
    LEGEND = 'LEGEND',
    DYNAMIC = 'DYNAMIC' // Adapts to player skill
}

/**
 * AI behavior settings for different difficulty levels
 */
export interface AIBehaviorSettings {
    // Pitching AI
    pitchAccuracy: number;          // 0-1, how close to intended location
    pitchSelection: number;         // 0-1, how strategic pitch choices are
    pitchVelocityBonus: number;     // Bonus mph
    strikeThrowPercentage: number;  // 0-1, how often AI throws strikes

    // Batting AI
    swingDecisionQuality: number;   // 0-1, how good at recognizing pitches
    contactQuality: number;         // 0-1, multiplier on contact
    powerMultiplier: number;        // 0-1+, power boost
    timingWindow: number;           // milliseconds, timing window size

    // Fielding AI
    fieldingReaction: number;       // 0-1, how fast AI reacts to balls
    throwAccuracy: number;          // 0-1, throwing accuracy
    catchProbability: number;       // 0-1, base catch probability
    baseRunningAggression: number;  // 0-1, how aggressive on bases

    // Strategic AI
    decisionMaking: number;         // 0-1, overall strategic quality
    adaptability: number;           // 0-1, how well AI adapts to player
    mistakeFrequency: number;       // 0-1, how often AI makes errors
}

/**
 * Player performance tracking for adaptive difficulty
 */
export interface PlayerPerformanceData {
    // Recent performance (last 10 games)
    recentBattingAverage: number;
    recentHomeRuns: number;
    recentStrikeouts: number;
    recentWins: number;
    recentLosses: number;

    // Skill indicators
    averageContactQuality: number;  // 0-1
    averageTimingAccuracy: number;  // 0-1
    pitchRecognition: number;       // 0-1, how well player identifies pitches
    platePatience: number;          // 0-1, swing decision quality

    // Difficulty indicators
    currentWinStreak: number;
    currentLossStreak: number;
    averageScoreDifferential: number; // Average run diff per game

    // Engagement metrics
    gamesPlayedToday: number;
    averageGameDuration: number;    // minutes
    quitRate: number;               // 0-1, how often player quits
}

/**
 * Dynamic difficulty adjustment parameters
 */
export interface DifficultyAdjustmentConfig {
    enabled: boolean;
    adjustmentSpeed: number;        // 0-1, how fast difficulty changes
    minDifficulty: number;          // 0-1, minimum difficulty
    maxDifficulty: number;          // 0-1, maximum difficulty
    targetWinRate: number;          // 0-1, desired player win rate (e.g., 0.55)
    adjustmentInterval: number;     // games between adjustments
}

/**
 * AI personality types affecting behavior
 */
export enum AIPersonality {
    AGGRESSIVE = 'AGGRESSIVE',      // Swings at everything, throws heat
    PATIENT = 'PATIENT',            // Waits for pitch, works counts
    STRATEGIC = 'STRATEGIC',        // Analyzes and exploits weaknesses
    UNPREDICTABLE = 'UNPREDICTABLE', // Random behavior, hard to read
    DEFENSIVE = 'DEFENSIVE'         // Focuses on defense, small ball
}

/**
 * Comprehensive AI Difficulty System
 */
export class AIDifficultySystem {
    private currentDifficulty: DifficultyLevel = DifficultyLevel.PRO;
    private currentSettings: AIBehaviorSettings;
    private playerPerformance: PlayerPerformanceData;
    private adjustmentConfig: DifficultyAdjustmentConfig;

    // AI personality
    private aiPersonality: AIPersonality = AIPersonality.STRATEGIC;

    // Performance history
    private gameHistory: {
        won: boolean;
        score: number;
        opponentScore: number;
        battingAverage: number;
        timestamp: Date;
    }[] = [];

    // Adaptive difficulty calculation
    private difficultyValue: number = 0.5; // 0-1, internal difficulty rating
    private gamesUntilAdjustment: number = 0;

    constructor(initialDifficulty: DifficultyLevel = DifficultyLevel.PRO) {
        this.currentDifficulty = initialDifficulty;
        this.currentSettings = this.getDefaultSettings(initialDifficulty);

        // Initialize player performance tracking
        this.playerPerformance = {
            recentBattingAverage: 0.250,
            recentHomeRuns: 0,
            recentStrikeouts: 0,
            recentWins: 0,
            recentLosses: 0,
            averageContactQuality: 0.5,
            averageTimingAccuracy: 0.5,
            pitchRecognition: 0.5,
            platePatience: 0.5,
            currentWinStreak: 0,
            currentLossStreak: 0,
            averageScoreDifferential: 0,
            gamesPlayedToday: 0,
            averageGameDuration: 20,
            quitRate: 0
        };

        // Initialize adjustment config
        this.adjustmentConfig = {
            enabled: false,
            adjustmentSpeed: 0.5,
            minDifficulty: 0.2,
            maxDifficulty: 0.95,
            targetWinRate: 0.55,
            adjustmentInterval: 3
        };

        this.gamesUntilAdjustment = this.adjustmentConfig.adjustmentInterval;
    }

    /**
     * Get default AI behavior settings for difficulty level
     */
    private getDefaultSettings(difficulty: DifficultyLevel): AIBehaviorSettings {
        switch (difficulty) {
            case DifficultyLevel.ROOKIE:
                return {
                    pitchAccuracy: 0.4,
                    pitchSelection: 0.3,
                    pitchVelocityBonus: -5,
                    strikeThrowPercentage: 0.75,
                    swingDecisionQuality: 0.3,
                    contactQuality: 0.4,
                    powerMultiplier: 0.6,
                    timingWindow: 150,
                    fieldingReaction: 0.5,
                    throwAccuracy: 0.5,
                    catchProbability: 0.7,
                    baseRunningAggression: 0.3,
                    decisionMaking: 0.3,
                    adaptability: 0.2,
                    mistakeFrequency: 0.3
                };

            case DifficultyLevel.PRO:
                return {
                    pitchAccuracy: 0.65,
                    pitchSelection: 0.6,
                    pitchVelocityBonus: 0,
                    strikeThrowPercentage: 0.65,
                    swingDecisionQuality: 0.6,
                    contactQuality: 0.65,
                    powerMultiplier: 0.85,
                    timingWindow: 80,
                    fieldingReaction: 0.7,
                    throwAccuracy: 0.7,
                    catchProbability: 0.85,
                    baseRunningAggression: 0.6,
                    decisionMaking: 0.65,
                    adaptability: 0.6,
                    mistakeFrequency: 0.15
                };

            case DifficultyLevel.ALL_STAR:
                return {
                    pitchAccuracy: 0.8,
                    pitchSelection: 0.8,
                    pitchVelocityBonus: 3,
                    strikeThrowPercentage: 0.58,
                    swingDecisionQuality: 0.8,
                    contactQuality: 0.8,
                    powerMultiplier: 1.0,
                    timingWindow: 50,
                    fieldingReaction: 0.85,
                    throwAccuracy: 0.85,
                    catchProbability: 0.92,
                    baseRunningAggression: 0.75,
                    decisionMaking: 0.85,
                    adaptability: 0.8,
                    mistakeFrequency: 0.08
                };

            case DifficultyLevel.LEGEND:
                return {
                    pitchAccuracy: 0.95,
                    pitchSelection: 0.95,
                    pitchVelocityBonus: 5,
                    strikeThrowPercentage: 0.52,
                    swingDecisionQuality: 0.95,
                    contactQuality: 0.95,
                    powerMultiplier: 1.2,
                    timingWindow: 30,
                    fieldingReaction: 0.95,
                    throwAccuracy: 0.95,
                    catchProbability: 0.98,
                    baseRunningAggression: 0.85,
                    decisionMaking: 0.95,
                    adaptability: 0.95,
                    mistakeFrequency: 0.03
                };

            case DifficultyLevel.DYNAMIC:
                // Start at medium, will adapt
                return this.getDefaultSettings(DifficultyLevel.PRO);

            default:
                return this.getDefaultSettings(DifficultyLevel.PRO);
        }
    }

    /**
     * Record game result for performance tracking
     */
    public recordGameResult(
        won: boolean,
        playerScore: number,
        opponentScore: number,
        battingAverage: number,
        contactQuality: number,
        timingAccuracy: number
    ): void {
        // Add to history
        this.gameHistory.push({
            won,
            score: playerScore,
            opponentScore: opponentScore,
            battingAverage,
            timestamp: new Date()
        });

        // Keep only recent games (last 20)
        if (this.gameHistory.length > 20) {
            this.gameHistory.shift();
        }

        // Update performance data
        this.updatePlayerPerformance(won, playerScore, opponentScore, battingAverage, contactQuality, timingAccuracy);

        // Check if difficulty adjustment needed
        if (this.adjustmentConfig.enabled && this.currentDifficulty === DifficultyLevel.DYNAMIC) {
            this.gamesUntilAdjustment--;

            if (this.gamesUntilAdjustment <= 0) {
                this.adjustDifficulty();
                this.gamesUntilAdjustment = this.adjustmentConfig.adjustmentInterval;
            }
        }
    }

    /**
     * Update player performance metrics
     */
    private updatePlayerPerformance(
        won: boolean,
        playerScore: number,
        opponentScore: number,
        battingAverage: number,
        contactQuality: number,
        timingAccuracy: number
    ): void {
        // Update win/loss streaks
        if (won) {
            this.playerPerformance.currentWinStreak++;
            this.playerPerformance.currentLossStreak = 0;
            this.playerPerformance.recentWins++;
        } else {
            this.playerPerformance.currentLossStreak++;
            this.playerPerformance.currentWinStreak = 0;
            this.playerPerformance.recentLosses++;
        }

        // Calculate recent stats (last 10 games)
        const recentGames = this.gameHistory.slice(-10);

        if (recentGames.length > 0) {
            // Calculate average batting average
            this.playerPerformance.recentBattingAverage =
                recentGames.reduce((sum, g) => sum + g.battingAverage, 0) / recentGames.length;

            // Calculate average score differential
            this.playerPerformance.averageScoreDifferential =
                recentGames.reduce((sum, g) => sum + (g.score - g.opponentScore), 0) / recentGames.length;

            // Reset recent wins/losses to last 10
            this.playerPerformance.recentWins = recentGames.filter(g => g.won).length;
            this.playerPerformance.recentLosses = recentGames.filter(g => !g.won).length;
        }

        // Update skill indicators (exponential moving average)
        const alpha = 0.3; // Smoothing factor

        this.playerPerformance.averageContactQuality =
            alpha * contactQuality + (1 - alpha) * this.playerPerformance.averageContactQuality;

        this.playerPerformance.averageTimingAccuracy =
            alpha * timingAccuracy + (1 - alpha) * this.playerPerformance.averageTimingAccuracy;
    }

    /**
     * Adjust difficulty based on player performance
     */
    private adjustDifficulty(): void {
        const recentGames = this.gameHistory.slice(-10);

        if (recentGames.length < 3) {
            return; // Not enough data
        }

        // Calculate current win rate
        const wins = recentGames.filter(g => g.won).length;
        const winRate = wins / recentGames.length;

        // Determine if adjustment needed
        const targetWinRate = this.adjustmentConfig.targetWinRate;
        const winRateDiff = winRate - targetWinRate;

        // If player winning too much, increase difficulty
        // If player losing too much, decrease difficulty

        let adjustment = 0;

        if (Math.abs(winRateDiff) > 0.15) {
            // Significant difference, adjust more
            adjustment = -winRateDiff * this.adjustmentConfig.adjustmentSpeed * 0.15;
        } else if (Math.abs(winRateDiff) > 0.08) {
            // Moderate difference
            adjustment = -winRateDiff * this.adjustmentConfig.adjustmentSpeed * 0.08;
        }

        // Consider other factors
        // Long win streaks -> increase difficulty faster
        if (this.playerPerformance.currentWinStreak >= 5) {
            adjustment += 0.05;
        }

        // Long loss streaks -> decrease difficulty faster
        if (this.playerPerformance.currentLossStreak >= 5) {
            adjustment -= 0.05;
        }

        // Large score differentials indicate mismatch
        if (Math.abs(this.playerPerformance.averageScoreDifferential) > 4) {
            adjustment -= Math.sign(this.playerPerformance.averageScoreDifferential) * 0.03;
        }

        // Apply adjustment
        this.difficultyValue += adjustment;

        // Clamp to configured range
        this.difficultyValue = Math.max(
            this.adjustmentConfig.minDifficulty,
            Math.min(this.adjustmentConfig.maxDifficulty, this.difficultyValue)
        );

        // Update AI settings based on new difficulty value
        this.updateSettingsFromDifficultyValue();

        console.log(`Difficulty adjusted to: ${this.difficultyValue.toFixed(2)} (Win rate: ${winRate.toFixed(2)})`);
    }

    /**
     * Update AI settings based on difficulty value (0-1)
     */
    private updateSettingsFromDifficultyValue(): void {
        // Interpolate between rookie (0) and legend (1) settings
        const rookieSettings = this.getDefaultSettings(DifficultyLevel.ROOKIE);
        const legendSettings = this.getDefaultSettings(DifficultyLevel.LEGEND);

        const t = this.difficultyValue;

        // Interpolate each setting
        this.currentSettings = {
            pitchAccuracy: this.lerp(rookieSettings.pitchAccuracy, legendSettings.pitchAccuracy, t),
            pitchSelection: this.lerp(rookieSettings.pitchSelection, legendSettings.pitchSelection, t),
            pitchVelocityBonus: this.lerp(rookieSettings.pitchVelocityBonus, legendSettings.pitchVelocityBonus, t),
            strikeThrowPercentage: this.lerp(rookieSettings.strikeThrowPercentage, legendSettings.strikeThrowPercentage, t),
            swingDecisionQuality: this.lerp(rookieSettings.swingDecisionQuality, legendSettings.swingDecisionQuality, t),
            contactQuality: this.lerp(rookieSettings.contactQuality, legendSettings.contactQuality, t),
            powerMultiplier: this.lerp(rookieSettings.powerMultiplier, legendSettings.powerMultiplier, t),
            timingWindow: this.lerp(rookieSettings.timingWindow, legendSettings.timingWindow, t),
            fieldingReaction: this.lerp(rookieSettings.fieldingReaction, legendSettings.fieldingReaction, t),
            throwAccuracy: this.lerp(rookieSettings.throwAccuracy, legendSettings.throwAccuracy, t),
            catchProbability: this.lerp(rookieSettings.catchProbability, legendSettings.catchProbability, t),
            baseRunningAggression: this.lerp(rookieSettings.baseRunningAggression, legendSettings.baseRunningAggression, t),
            decisionMaking: this.lerp(rookieSettings.decisionMaking, legendSettings.decisionMaking, t),
            adaptability: this.lerp(rookieSettings.adaptability, legendSettings.adaptability, t),
            mistakeFrequency: this.lerp(rookieSettings.mistakeFrequency, legendSettings.mistakeFrequency, t)
        };
    }

    /**
     * Linear interpolation helper
     */
    private lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    /**
     * Apply personality modifiers to AI settings
     */
    private applyPersonalityModifiers(): AIBehaviorSettings {
        const settings = { ...this.currentSettings };

        switch (this.aiPersonality) {
            case AIPersonality.AGGRESSIVE:
                settings.swingDecisionQuality *= 0.7;  // Swings at more
                settings.baseRunningAggression *= 1.3;
                settings.pitchVelocityBonus += 3;
                settings.strikeThrowPercentage += 0.1;
                break;

            case AIPersonality.PATIENT:
                settings.swingDecisionQuality *= 1.2;  // More selective
                settings.baseRunningAggression *= 0.7;
                settings.strikeThrowPercentage -= 0.1;
                break;

            case AIPersonality.STRATEGIC:
                settings.adaptability *= 1.3;
                settings.decisionMaking *= 1.2;
                settings.pitchSelection *= 1.2;
                break;

            case AIPersonality.UNPREDICTABLE:
                // Add randomness to all settings
                Object.keys(settings).forEach(key => {
                    const k = key as keyof AIBehaviorSettings;
                    if (typeof settings[k] === 'number') {
                        settings[k] = (settings[k] as number) * (0.8 + Math.random() * 0.4);
                    }
                });
                break;

            case AIPersonality.DEFENSIVE:
                settings.fieldingReaction *= 1.2;
                settings.throwAccuracy *= 1.15;
                settings.catchProbability *= 1.1;
                settings.powerMultiplier *= 0.8;
                break;
        }

        return settings;
    }

    /**
     * Get current AI behavior settings (with personality applied)
     */
    public getAISettings(): AIBehaviorSettings {
        return this.applyPersonalityModifiers();
    }

    /**
     * Set difficulty level
     */
    public setDifficulty(difficulty: DifficultyLevel): void {
        this.currentDifficulty = difficulty;
        this.currentSettings = this.getDefaultSettings(difficulty);

        if (difficulty === DifficultyLevel.DYNAMIC) {
            this.adjustmentConfig.enabled = true;
            this.difficultyValue = 0.5; // Start at medium
        } else {
            this.adjustmentConfig.enabled = false;
        }
    }

    /**
     * Set AI personality
     */
    public setAIPersonality(personality: AIPersonality): void {
        this.aiPersonality = personality;
    }

    /**
     * Get current difficulty level
     */
    public getCurrentDifficulty(): DifficultyLevel {
        return this.currentDifficulty;
    }

    /**
     * Get difficulty value (0-1)
     */
    public getDifficultyValue(): number {
        return this.difficultyValue;
    }

    /**
     * Get player performance data
     */
    public getPlayerPerformance(): PlayerPerformanceData {
        return { ...this.playerPerformance };
    }

    /**
     * Configure dynamic difficulty adjustment
     */
    public configureDynamicDifficulty(config: Partial<DifficultyAdjustmentConfig>): void {
        Object.assign(this.adjustmentConfig, config);
    }

    /**
     * Check if AI should make a mistake
     */
    public shouldMakeMistake(): boolean {
        return Math.random() < this.currentSettings.mistakeFrequency;
    }

    /**
     * Get modified value based on AI difficulty
     */
    public applyDifficultyModifier(baseValue: number, setting: keyof AIBehaviorSettings): number {
        const settings = this.getAISettings();
        const modifier = settings[setting] as number;

        return baseValue * modifier;
    }

    /**
     * Export difficulty data
     */
    public exportData(): object {
        return {
            currentDifficulty: this.currentDifficulty,
            difficultyValue: this.difficultyValue,
            aiPersonality: this.aiPersonality,
            playerPerformance: this.playerPerformance,
            gameHistory: this.gameHistory,
            adjustmentConfig: this.adjustmentConfig
        };
    }

    /**
     * Import difficulty data
     */
    public importData(data: any): void {
        if (data.currentDifficulty) this.currentDifficulty = data.currentDifficulty;
        if (data.difficultyValue) this.difficultyValue = data.difficultyValue;
        if (data.aiPersonality) this.aiPersonality = data.aiPersonality;
        if (data.playerPerformance) this.playerPerformance = data.playerPerformance;
        if (data.gameHistory) this.gameHistory = data.gameHistory;
        if (data.adjustmentConfig) this.adjustmentConfig = data.adjustmentConfig;

        this.updateSettingsFromDifficultyValue();
    }

    /**
     * Reset difficulty tracking
     */
    public reset(): void {
        this.gameHistory = [];
        this.difficultyValue = 0.5;
        this.gamesUntilAdjustment = this.adjustmentConfig.adjustmentInterval;
        this.currentSettings = this.getDefaultSettings(this.currentDifficulty);
    }

    /**
     * Dispose AI system
     */
    public dispose(): void {
        this.gameHistory = [];
    }
}
