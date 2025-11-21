/**
 * Enhanced HUD System with Real-time Stats and Advanced Overlays
 * Provides comprehensive on-screen information and interactive UI elements
 */

export interface HUDElement {
    elementId: string;
    type: 'text' | 'image' | 'bar' | 'meter' | 'chart' | 'notification' | 'overlay';
    position: { x: number; y: number }; // Percentage or pixels
    size: { width: number; height: number };
    visible: boolean;
    opacity: number; // 0-1
    zIndex: number;
    animationState?: string;
}

export interface ScoreboardData {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    inning: number;
    isTopOfInning: boolean;
    outs: number;
}

export interface CountDisplay {
    balls: number;
    strikes: number;
    outs: number;
}

export interface BasesDisplay {
    firstBase: boolean;
    secondBase: boolean;
    thirdBase: boolean;
}

export interface PlayerCardData {
    playerId: string;
    playerName: string;
    number: number;
    position: string;
    battingAverage: number;
    onBasePercentage: number;
    sluggingPercentage: number;
    homeRuns: number;
    rbi: number;
    currentHotStreak: number;
    seasonStats: {
        games: number;
        atBats: number;
        hits: number;
        runs: number;
    };
}

export interface PitcherCardData {
    pitcherId: string;
    pitcherName: string;
    number: number;
    era: number;
    wins: number;
    losses: number;
    strikeouts: number;
    pitchCount: number;
    currentGameStats: {
        inningsPitched: number;
        strikeouts: number;
        walks: number;
        hitsAllowed: number;
        runsAllowed: number;
    };
}

export interface PowerMeterData {
    currentPower: number; // 0-100
    optimalRange: { min: number; max: number };
    isActive: boolean;
    isPerfect: boolean;
}

export interface PitchSpeedDisplay {
    speed: number; // mph
    pitchType: string;
    movement: { horizontal: number; vertical: number };
    accuracy: number; // 0-100
}

export interface HitTrajectoryOverlay {
    exitVelocity: number;
    launchAngle: number;
    projectedDistance: number;
    hangTime: number;
    isHomeRun: boolean;
}

export interface ReplayControls {
    isPlaying: boolean;
    playbackSpeed: number; // 0.25, 0.5, 1.0, 2.0
    currentTime: number;
    totalTime: number;
    cameraAngles: string[];
    selectedAngle: string;
}

export interface NotificationData {
    notificationId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'achievement';
    duration: number; // milliseconds
    icon?: string;
    timestamp: Date;
}

export interface StatComparison {
    stat: string;
    playerValue: number;
    opponentValue: number;
    average: number;
    rank: number;
}

export interface MiniMap {
    ballPosition: { x: number; y: number };
    fielderPositions: Map<string, { x: number; y: number }>;
    runnerPositions: Map<number, { x: number; y: number }>; // base number -> position
}

export interface CommentaryFeed {
    commentId: string;
    commentator: string;
    text: string;
    timestamp: Date;
    importance: number; // 1-10
}

export interface HotColdZoneDisplay {
    zones: Map<string, number>; // zone -> performance metric (0-100)
    showForBatter: boolean;
    showForPitcher: boolean;
}

export interface StaminaIndicator {
    currentStamina: number; // 0-100
    fatigueLevel: string;
    performanceImpact: number; // Percentage reduction
}

export interface WeatherWidget {
    condition: string;
    temperature: number;
    windSpeed: number;
    windDirection: number;
    impact: string;
}

export interface GameClock {
    gameTime: number; // seconds
    realTime: Date;
    isPaused: boolean;
}

export interface RallyIndicator {
    isRallying: boolean;
    runsScoredInInning: number;
    hitsInInning: number;
    consecutiveHits: number;
}

export interface MomentumMeter {
    homeTeamMomentum: number; // 0-100
    awayTeamMomentum: number; // 0-100
    swing: number; // Recent change
}

export interface PitchingGrid {
    recentPitches: Array<{
        location: { x: number; y: number };
        pitchType: string;
        result: 'strike' | 'ball' | 'hit' | 'foul';
    }>;
    heatMap: Map<string, number>; // Zone -> frequency
}

export interface BattingAnalysis {
    swingTiming: 'early' | 'perfect' | 'late';
    contactQuality: number; // 0-100
    plateAppDiscipline: number; // 0-100
    recommendedAdjustment: string;
}

/**
 * Enhanced HUD System
 */
export class EnhancedHUDSystem {
    // Core HUD elements
    private elements: Map<string, HUDElement> = new Map();

    // Data displays
    private scoreboard: ScoreboardData | null = null;
    private countDisplay: CountDisplay | null = null;
    private basesDisplay: BasesDisplay | null = null;

    // Player information
    private currentBatterCard: PlayerCardData | null = null;
    private currentPitcherCard: PitcherCardData | null = null;

    // Interactive elements
    private powerMeter: PowerMeterData | null = null;
    private pitchSpeed: PitchSpeedDisplay | null = null;
    private hitTrajectory: HitTrajectoryOverlay | null = null;

    // Replay controls
    private replayControls: ReplayControls | null = null;

    // Notifications
    private activeNotifications: NotificationData[] = [];
    private notificationQueue: NotificationData[] = [];
    private maxSimultaneousNotifications: number = 3;

    // Advanced displays
    private statComparisons: StatComparison[] = [];
    private miniMap: MiniMap | null = null;
    private commentaryFeed: CommentaryFeed[] = [];
    private maxCommentaryItems: number = 5;

    // Performance overlays
    private hotColdZones: HotColdZoneDisplay | null = null;
    private staminaIndicator: StaminaIndicator | null = null;
    private weatherWidget: WeatherWidget | null = null;

    // Game flow indicators
    private gameClock: GameClock | null = null;
    private rallyIndicator: RallyIndicator | null = null;
    private momentumMeter: MomentumMeter | null = null;

    // Analysis overlays
    private pitchingGrid: PitchingGrid | null = null;
    private battingAnalysis: BattingAnalysis | null = null;

    // Settings
    private hudSettings: {
        scale: number;
        opacity: number;
        theme: 'classic' | 'modern' | 'minimal';
        colorScheme: 'default' | 'colorblind';
        enableAnimations: boolean;
        showAdvancedStats: boolean;
    };

    // Animation state
    private animationTime: number = 0;

    constructor() {
        // Initialize default settings
        this.hudSettings = {
            scale: 1.0,
            opacity: 0.9,
            theme: 'modern',
            colorScheme: 'default',
            enableAnimations: true,
            showAdvancedStats: false
        };

        // Initialize core HUD elements
        this.initializeCoreElements();
    }

    /**
     * Initialize core HUD elements
     */
    private initializeCoreElements(): void {
        // Scoreboard
        this.elements.set('scoreboard', {
            elementId: 'scoreboard',
            type: 'overlay',
            position: { x: 50, y: 5 }, // Center top
            size: { width: 300, height: 80 },
            visible: true,
            opacity: 0.9,
            zIndex: 100
        });

        // Count display
        this.elements.set('count', {
            elementId: 'count',
            type: 'text',
            position: { x: 5, y: 5 }, // Top left
            size: { width: 100, height: 60 },
            visible: true,
            opacity: 0.9,
            zIndex: 100
        });

        // Bases display
        this.elements.set('bases', {
            elementId: 'bases',
            type: 'image',
            position: { x: 95, y: 5 }, // Top right
            size: { width: 80, height: 80 },
            visible: true,
            opacity: 0.9,
            zIndex: 100
        });

        // Player card (batter)
        this.elements.set('batter_card', {
            elementId: 'batter_card',
            type: 'overlay',
            position: { x: 5, y: 15 }, // Left side
            size: { width: 250, height: 150 },
            visible: false,
            opacity: 0.85,
            zIndex: 90
        });

        // Player card (pitcher)
        this.elements.set('pitcher_card', {
            elementId: 'pitcher_card',
            type: 'overlay',
            position: { x: 75, y: 15 }, // Right side
            size: { width: 250, height: 150 },
            visible: false,
            opacity: 0.85,
            zIndex: 90
        });

        // Power meter
        this.elements.set('power_meter', {
            elementId: 'power_meter',
            type: 'meter',
            position: { x: 50, y: 85 }, // Bottom center
            size: { width: 300, height: 40 },
            visible: false,
            opacity: 0.9,
            zIndex: 95
        });

        // Pitch speed
        this.elements.set('pitch_speed', {
            elementId: 'pitch_speed',
            type: 'text',
            position: { x: 50, y: 20 }, // Center
            size: { width: 150, height: 50 },
            visible: false,
            opacity: 0.9,
            zIndex: 110
        });

        // Notification area
        this.elements.set('notifications', {
            elementId: 'notifications',
            type: 'overlay',
            position: { x: 50, y: 30 }, // Center top
            size: { width: 400, height: 200 },
            visible: true,
            opacity: 1.0,
            zIndex: 200
        });

        // Mini-map
        this.elements.set('minimap', {
            elementId: 'minimap',
            type: 'overlay',
            position: { x: 90, y: 80 }, // Bottom right
            size: { width: 150, height: 150 },
            visible: false,
            opacity: 0.7,
            zIndex: 80
        });

        // Commentary feed
        this.elements.set('commentary', {
            elementId: 'commentary',
            type: 'overlay',
            position: { x: 50, y: 90 }, // Bottom center
            size: { width: 500, height: 100 },
            visible: true,
            opacity: 0.8,
            zIndex: 85
        });
    }

    /**
     * Update scoreboard
     */
    public updateScoreboard(data: ScoreboardData): void {
        this.scoreboard = data;
    }

    /**
     * Update count display
     */
    public updateCount(balls: number, strikes: number, outs: number): void {
        this.countDisplay = { balls, strikes, outs };
    }

    /**
     * Update bases display
     */
    public updateBases(first: boolean, second: boolean, third: boolean): void {
        this.basesDisplay = {
            firstBase: first,
            secondBase: second,
            thirdBase: third
        };
    }

    /**
     * Show batter card
     */
    public showBatterCard(data: PlayerCardData, duration?: number): void {
        this.currentBatterCard = data;

        const element = this.elements.get('batter_card');
        if (element) {
            element.visible = true;
            element.animationState = 'slide_in';

            if (duration) {
                setTimeout(() => {
                    this.hideBatterCard();
                }, duration);
            }
        }
    }

    /**
     * Hide batter card
     */
    public hideBatterCard(): void {
        const element = this.elements.get('batter_card');
        if (element) {
            element.animationState = 'slide_out';
            setTimeout(() => {
                element.visible = false;
            }, 300);
        }
    }

    /**
     * Show pitcher card
     */
    public showPitcherCard(data: PitcherCardData, duration?: number): void {
        this.currentPitcherCard = data;

        const element = this.elements.get('pitcher_card');
        if (element) {
            element.visible = true;
            element.animationState = 'slide_in';

            if (duration) {
                setTimeout(() => {
                    this.hidePitcherCard();
                }, duration);
            }
        }
    }

    /**
     * Hide pitcher card
     */
    public hidePitcherCard(): void {
        const element = this.elements.get('pitcher_card');
        if (element) {
            element.animationState = 'slide_out';
            setTimeout(() => {
                element.visible = false;
            }, 300);
        }
    }

    /**
     * Show power meter
     */
    public showPowerMeter(initialPower: number = 0): void {
        this.powerMeter = {
            currentPower: initialPower,
            optimalRange: { min: 80, max: 95 },
            isActive: true,
            isPerfect: false
        };

        const element = this.elements.get('power_meter');
        if (element) {
            element.visible = true;
        }
    }

    /**
     * Update power meter
     */
    public updatePowerMeter(power: number): void {
        if (!this.powerMeter) return;

        this.powerMeter.currentPower = power;

        // Check if in optimal range
        const inRange = power >= this.powerMeter.optimalRange.min &&
                        power <= this.powerMeter.optimalRange.max;

        this.powerMeter.isPerfect = inRange;
    }

    /**
     * Hide power meter
     */
    public hidePowerMeter(): void {
        const element = this.elements.get('power_meter');
        if (element) {
            element.visible = false;
        }

        this.powerMeter = null;
    }

    /**
     * Show pitch speed
     */
    public showPitchSpeed(speed: number, pitchType: string, movement: { horizontal: number; vertical: number }): void {
        this.pitchSpeed = {
            speed,
            pitchType,
            movement,
            accuracy: 100
        };

        const element = this.elements.get('pitch_speed');
        if (element) {
            element.visible = true;
            element.animationState = 'fade_in';

            // Auto-hide after 2 seconds
            setTimeout(() => {
                element.animationState = 'fade_out';
                setTimeout(() => {
                    element.visible = false;
                }, 300);
            }, 2000);
        }
    }

    /**
     * Show hit trajectory
     */
    public showHitTrajectory(
        exitVelocity: number,
        launchAngle: number,
        projectedDistance: number,
        hangTime: number
    ): void {
        this.hitTrajectory = {
            exitVelocity,
            launchAngle,
            projectedDistance,
            hangTime,
            isHomeRun: projectedDistance >= 400
        };

        // Would render trajectory overlay
        // Auto-hide after ball lands
    }

    /**
     * Add notification
     */
    public addNotification(
        title: string,
        message: string,
        type: NotificationData['type'] = 'info',
        duration: number = 3000
    ): void {
        const notification: NotificationData = {
            notificationId: `notif_${Date.now()}`,
            title,
            message,
            type,
            duration,
            timestamp: new Date()
        };

        // Add to queue
        this.notificationQueue.push(notification);

        // Process queue
        this.processNotificationQueue();
    }

    /**
     * Process notification queue
     */
    private processNotificationQueue(): void {
        // Show notifications up to max simultaneous
        while (this.activeNotifications.length < this.maxSimultaneousNotifications &&
               this.notificationQueue.length > 0) {
            const notification = this.notificationQueue.shift()!;

            this.activeNotifications.push(notification);

            // Schedule removal
            setTimeout(() => {
                this.removeNotification(notification.notificationId);
            }, notification.duration);
        }
    }

    /**
     * Remove notification
     */
    private removeNotification(notificationId: string): void {
        const index = this.activeNotifications.findIndex(n => n.notificationId === notificationId);

        if (index !== -1) {
            this.activeNotifications.splice(index, 1);

            // Process queue again
            this.processNotificationQueue();
        }
    }

    /**
     * Add stat comparison
     */
    public addStatComparison(
        stat: string,
        playerValue: number,
        opponentValue: number,
        average: number,
        rank: number
    ): void {
        this.statComparisons.push({
            stat,
            playerValue,
            opponentValue,
            average,
            rank
        });
    }

    /**
     * Update mini-map
     */
    public updateMiniMap(
        ballPosition: { x: number; y: number },
        fielderPositions: Map<string, { x: number; y: number }>,
        runnerPositions: Map<number, { x: number; y: number }>
    ): void {
        this.miniMap = {
            ballPosition,
            fielderPositions,
            runnerPositions
        };
    }

    /**
     * Add commentary
     */
    public addCommentary(commentator: string, text: string, importance: number = 5): void {
        const commentary: CommentaryFeed = {
            commentId: `comment_${Date.now()}`,
            commentator,
            text,
            timestamp: new Date(),
            importance
        };

        this.commentaryFeed.unshift(commentary);

        // Limit feed size
        if (this.commentaryFeed.length > this.maxCommentaryItems) {
            this.commentaryFeed.pop();
        }
    }

    /**
     * Update hot/cold zones
     */
    public updateHotColdZones(zones: Map<string, number>, forBatter: boolean, forPitcher: boolean): void {
        this.hotColdZones = {
            zones,
            showForBatter: forBatter,
            showForPitcher: forPitcher
        };
    }

    /**
     * Update stamina indicator
     */
    public updateStaminaIndicator(stamina: number, fatigueLevel: string, performanceImpact: number): void {
        this.staminaIndicator = {
            currentStamina: stamina,
            fatigueLevel,
            performanceImpact
        };
    }

    /**
     * Update weather widget
     */
    public updateWeatherWidget(
        condition: string,
        temperature: number,
        windSpeed: number,
        windDirection: number,
        impact: string
    ): void {
        this.weatherWidget = {
            condition,
            temperature,
            windSpeed,
            windDirection,
            impact
        };
    }

    /**
     * Update game clock
     */
    public updateGameClock(gameTime: number, isPaused: boolean): void {
        this.gameClock = {
            gameTime,
            realTime: new Date(),
            isPaused
        };
    }

    /**
     * Update rally indicator
     */
    public updateRallyIndicator(
        isRallying: boolean,
        runsScoredInInning: number,
        hitsInInning: number,
        consecutiveHits: number
    ): void {
        this.rallyIndicator = {
            isRallying,
            runsScoredInInning,
            hitsInInning,
            consecutiveHits
        };
    }

    /**
     * Update momentum meter
     */
    public updateMomentumMeter(homeMomentum: number, awayMomentum: number, swing: number): void {
        this.momentumMeter = {
            homeTeamMomentum: homeMomentum,
            awayTeamMomentum: awayMomentum,
            swing
        };
    }

    /**
     * Add pitch to grid
     */
    public addPitchToGrid(
        location: { x: number; y: number },
        pitchType: string,
        result: 'strike' | 'ball' | 'hit' | 'foul'
    ): void {
        if (!this.pitchingGrid) {
            this.pitchingGrid = {
                recentPitches: [],
                heatMap: new Map()
            };
        }

        this.pitchingGrid.recentPitches.push({
            location,
            pitchType,
            result
        });

        // Limit to last 20 pitches
        if (this.pitchingGrid.recentPitches.length > 20) {
            this.pitchingGrid.recentPitches.shift();
        }

        // Update heat map
        const zoneKey = `${Math.floor(location.x / 10)}_${Math.floor(location.y / 10)}`;
        const currentCount = this.pitchingGrid.heatMap.get(zoneKey) || 0;
        this.pitchingGrid.heatMap.set(zoneKey, currentCount + 1);
    }

    /**
     * Update batting analysis
     */
    public updateBattingAnalysis(
        timing: BattingAnalysis['swingTiming'],
        contactQuality: number,
        discipline: number,
        recommendation: string
    ): void {
        this.battingAnalysis = {
            swingTiming: timing,
            contactQuality,
            plateAppDiscipline: discipline,
            recommendedAdjustment: recommendation
        };
    }

    /**
     * Show replay controls
     */
    public showReplayControls(totalTime: number, cameraAngles: string[]): void {
        this.replayControls = {
            isPlaying: false,
            playbackSpeed: 0.5,
            currentTime: 0,
            totalTime,
            cameraAngles,
            selectedAngle: cameraAngles[0] || 'default'
        };
    }

    /**
     * Hide replay controls
     */
    public hideReplayControls(): void {
        this.replayControls = null;
    }

    /**
     * Toggle HUD element visibility
     */
    public toggleElement(elementId: string, visible?: boolean): void {
        const element = this.elements.get(elementId);
        if (!element) return;

        element.visible = visible !== undefined ? visible : !element.visible;
    }

    /**
     * Set HUD scale
     */
    public setScale(scale: number): void {
        this.hudSettings.scale = Math.max(0.5, Math.min(2.0, scale));

        // Apply scale to all elements
        for (const element of this.elements.values()) {
            // Would update element transforms
        }
    }

    /**
     * Set HUD opacity
     */
    public setOpacity(opacity: number): void {
        this.hudSettings.opacity = Math.max(0, Math.min(1, opacity));

        // Apply opacity to all elements
        for (const element of this.elements.values()) {
            element.opacity = this.hudSettings.opacity;
        }
    }

    /**
     * Set HUD theme
     */
    public setTheme(theme: 'classic' | 'modern' | 'minimal'): void {
        this.hudSettings.theme = theme;

        // Would reload theme assets
    }

    /**
     * Set color scheme
     */
    public setColorScheme(scheme: 'default' | 'colorblind'): void {
        this.hudSettings.colorScheme = scheme;

        // Would update colors
    }

    /**
     * Update HUD (call each frame)
     */
    public update(deltaTime: number): void {
        this.animationTime += deltaTime;

        // Update animations
        for (const element of this.elements.values()) {
            if (!element.visible || !element.animationState) continue;

            // Would update element animations
        }

        // Update power meter animation
        if (this.powerMeter && this.powerMeter.isActive) {
            // Would animate power meter filling
        }

        // Process notification queue
        if (this.notificationQueue.length > 0) {
            this.processNotificationQueue();
        }
    }

    /**
     * Get HUD element
     */
    public getElement(elementId: string): HUDElement | undefined {
        return this.elements.get(elementId);
    }

    /**
     * Get all active notifications
     */
    public getActiveNotifications(): NotificationData[] {
        return [...this.activeNotifications];
    }

    /**
     * Get commentary feed
     */
    public getCommentaryFeed(): CommentaryFeed[] {
        return [...this.commentaryFeed];
    }

    /**
     * Clear all overlays
     */
    public clearAllOverlays(): void {
        this.hitTrajectory = null;
        this.pitchSpeed = null;
        this.battingAnalysis = null;
        this.hotColdZones = null;

        this.hideBatterCard();
        this.hidePitcherCard();
        this.hidePowerMeter();
    }

    /**
     * Reset HUD
     */
    public reset(): void {
        this.clearAllOverlays();

        this.scoreboard = null;
        this.countDisplay = null;
        this.basesDisplay = null;
        this.activeNotifications = [];
        this.notificationQueue = [];
        this.commentaryFeed = [];
        this.statComparisons = [];
    }

    /**
     * Dispose HUD system
     */
    public dispose(): void {
        this.reset();
        this.elements.clear();
    }
}
