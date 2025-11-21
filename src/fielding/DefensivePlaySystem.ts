import { Vector3 } from '@babylonjs/core';

/**
 * Defensive positions
 */
export enum DefensivePosition {
    PITCHER = 'PITCHER',          // 1
    CATCHER = 'CATCHER',          // 2
    FIRST_BASE = 'FIRST_BASE',    // 3
    SECOND_BASE = 'SECOND_BASE',  // 4
    THIRD_BASE = 'THIRD_BASE',    // 5
    SHORTSTOP = 'SHORTSTOP',      // 6
    LEFT_FIELD = 'LEFT_FIELD',    // 7
    CENTER_FIELD = 'CENTER_FIELD',// 8
    RIGHT_FIELD = 'RIGHT_FIELD'   // 9
}

/**
 * Types of defensive plays
 */
export enum PlayType {
    ROUTINE_OUT = 'ROUTINE_OUT',
    FORCE_OUT = 'FORCE_OUT',
    TAG_OUT = 'TAG_OUT',
    DOUBLE_PLAY = 'DOUBLE_PLAY',
    TRIPLE_PLAY = 'TRIPLE_PLAY',
    CAUGHT_STEALING = 'CAUGHT_STEALING',
    PICKOFF = 'PICKOFF',
    DIVING_CATCH = 'DIVING_CATCH',
    SLIDING_CATCH = 'SLIDING_CATCH',
    OUTFIELD_ASSIST = 'OUTFIELD_ASSIST',
    ERROR = 'ERROR'
}

/**
 * Throw types
 */
export enum ThrowType {
    INFIELD_THROW = 'INFIELD_THROW',
    RELAY_THROW = 'RELAY_THROW',
    CUTOFF_THROW = 'CUTOFF_THROW',
    OUTFIELD_THROW = 'OUTFIELD_THROW',
    PICKOFF_THROW = 'PICKOFF_THROW',
    TAG_THROW = 'TAG_THROW'
}

/**
 * Runner status on base
 */
export interface BaseRunner {
    runnerId: string;
    currentBase: number;        // 0=home, 1=first, 2=second, 3=third
    isLeading: boolean;
    leadDistance: number;       // meters
    runningToBase?: number;
    speed: number;              // 1-10
    baseRunningSkill: number;   // 1-10
}

/**
 * Fielding play configuration
 */
export interface FieldingPlay {
    playId: string;
    playType: PlayType;
    ballPosition: Vector3;
    ballVelocity: Vector3;
    landingTime: number;        // seconds until ball lands

    // Fielders involved
    primaryFielder: string;
    secondaryFielders: string[];

    // Runners involved
    runners: BaseRunner[];

    // Play state
    started: boolean;
    completed: boolean;
    successful: boolean;
    error?: string;

    // Timing
    startTime: number;
    completionTime?: number;
}

/**
 * Throw configuration
 */
export interface ThrowConfig {
    throwerId: string;
    throwerPosition: Vector3;
    targetBase: number;
    targetPosition: Vector3;
    throwType: ThrowType;
    throwPower: number;         // 1-10
    throwAccuracy: number;      // 1-10
    fatigueFactor: number;      // 0-1
}

/**
 * Throw result
 */
export interface ThrowResult {
    throwId: string;
    success: boolean;
    trajectory: Vector3[];
    flightTime: number;         // seconds
    velocity: number;           // mph
    accuracy: number;           // 0-1, how close to target
    catchable: boolean;
    arrivalTime: number;        // seconds from now
}

/**
 * Double play configuration
 */
export interface DoublePlayScenario {
    startingBase: number;       // Where ball is fielded
    firstOut: number;           // First base to throw to
    secondOut: number;          // Second base for second out
    timeAvailable: number;      // seconds to complete
    difficulty: number;         // 1-10
}

/**
 * Catch attempt
 */
export interface CatchAttempt {
    fielderId: string;
    fielderPosition: Vector3;
    ballPosition: Vector3;
    ballVelocity: Vector3;
    catchDifficulty: number;    // 1-10
    catchProbability: number;   // 0-1
    requiresDive: boolean;
    requiresJump: boolean;
    requiresSprint: boolean;
}

/**
 * Comprehensive defensive play system
 */
export class DefensivePlaySystem {
    // Active plays
    private activePlays: Map<string, FieldingPlay> = new Map();
    private playIdCounter: number = 0;

    // Fielder positions and abilities
    private fielders: Map<string, {
        position: DefensivePosition;
        location: Vector3;
        fieldingRange: number;      // 1-10
        fieldingAccuracy: number;   // 1-10
        throwPower: number;         // 1-10
        throwAccuracy: number;      // 1-10
        speed: number;              // 1-10
    }> = new Map();

    // Base positions (MLB standard)
    private readonly basePositions: Record<number, Vector3> = {
        0: new Vector3(0, 0, 0),                    // Home plate
        1: new Vector3(27.432, 0, 27.432),          // First base (90 feet)
        2: new Vector3(0, 0, 38.795),               // Second base (127'3⅜")
        3: new Vector3(-27.432, 0, 27.432)          // Third base (90 feet)
    };

    // Standard defensive positions
    private readonly standardPositions: Record<DefensivePosition, Vector3> = {
        [DefensivePosition.PITCHER]: new Vector3(0, 0, 18.44),
        [DefensivePosition.CATCHER]: new Vector3(0, 0, -2),
        [DefensivePosition.FIRST_BASE]: new Vector3(25, 0, 20),
        [DefensivePosition.SECOND_BASE]: new Vector3(12, 0, 30),
        [DefensivePosition.THIRD_BASE]: new Vector3(-25, 0, 20),
        [DefensivePosition.SHORTSTOP]: new Vector3(-12, 0, 30),
        [DefensivePosition.LEFT_FIELD]: new Vector3(-25, 0, 70),
        [DefensivePosition.CENTER_FIELD]: new Vector3(0, 0, 90),
        [DefensivePosition.RIGHT_FIELD]: new Vector3(25, 0, 70)
    };

    // Throw speed by position (mph)
    private readonly throwSpeeds: Record<DefensivePosition, number> = {
        [DefensivePosition.PITCHER]: 90,
        [DefensivePosition.CATCHER]: 85,
        [DefensivePosition.FIRST_BASE]: 80,
        [DefensivePosition.SECOND_BASE]: 85,
        [DefensivePosition.THIRD_BASE]: 88,
        [DefensivePosition.SHORTSTOP]: 88,
        [DefensivePosition.LEFT_FIELD]: 85,
        [DefensivePosition.CENTER_FIELD]: 90,
        [DefensivePosition.RIGHT_FIELD]: 92
    };

    constructor() {
        // Initialize fielders at standard positions
        this.initializeFielders();
    }

    /**
     * Initialize fielders
     */
    private initializeFielders(): void {
        const positions = Object.values(DefensivePosition);

        for (const position of positions) {
            const fielderId = `fielder_${position}`;

            this.fielders.set(fielderId, {
                position,
                location: this.standardPositions[position].clone(),
                fieldingRange: 5,
                fieldingAccuracy: 5,
                throwPower: 5,
                throwAccuracy: 5,
                speed: 5
            });
        }
    }

    /**
     * Start new fielding play
     */
    public startPlay(
        ballPosition: Vector3,
        ballVelocity: Vector3,
        landingTime: number,
        runners: BaseRunner[]
    ): FieldingPlay {
        const playId = `play_${this.playIdCounter++}`;

        // Determine closest fielder
        const primaryFielder = this.findClosestFielder(ballPosition);

        // Determine secondary fielders (covering bases)
        const secondaryFielders = this.findSecondaryFielders(runners);

        // Determine play type
        const playType = this.determinePlayType(ballPosition, runners);

        const play: FieldingPlay = {
            playId,
            playType,
            ballPosition,
            ballVelocity,
            landingTime,
            primaryFielder,
            secondaryFielders,
            runners,
            started: true,
            completed: false,
            successful: false,
            startTime: performance.now() / 1000
        };

        this.activePlays.set(playId, play);

        return play;
    }

    /**
     * Find closest fielder to ball
     */
    private findClosestFielder(ballPosition: Vector3): string {
        let closest = '';
        let minDistance = Infinity;

        for (const [fielderId, fielder] of this.fielders.entries()) {
            const distance = Vector3.Distance(ballPosition, fielder.location);

            if (distance < minDistance) {
                minDistance = distance;
                closest = fielderId;
            }
        }

        return closest;
    }

    /**
     * Find secondary fielders to cover bases
     */
    private findSecondaryFielders(runners: BaseRunner[]): string[] {
        const secondary: string[] = [];

        // Cover bases where runners are going
        for (const runner of runners) {
            if (runner.runningToBase) {
                const basePosition = this.basePositions[runner.runningToBase];

                // Find fielder covering this base
                const coveringFielder = this.findFielderCoveringBase(runner.runningToBase);
                if (coveringFielder && !secondary.includes(coveringFielder)) {
                    secondary.push(coveringFielder);
                }
            }
        }

        return secondary;
    }

    /**
     * Find fielder covering specific base
     */
    private findFielderCoveringBase(base: number): string | null {
        // Standard coverage assignments
        const coverageMap: Record<number, DefensivePosition[]> = {
            1: [DefensivePosition.FIRST_BASE, DefensivePosition.SECOND_BASE],
            2: [DefensivePosition.SHORTSTOP, DefensivePosition.SECOND_BASE],
            3: [DefensivePosition.THIRD_BASE, DefensivePosition.SHORTSTOP],
            0: [DefensivePosition.CATCHER]
        };

        const positions = coverageMap[base] || [];

        for (const [fielderId, fielder] of this.fielders.entries()) {
            if (positions.includes(fielder.position)) {
                return fielderId;
            }
        }

        return null;
    }

    /**
     * Determine play type
     */
    private determinePlayType(ballPosition: Vector3, runners: BaseRunner[]): PlayType {
        const runnerCount = runners.length;

        // Check for potential double play
        if (runnerCount >= 2) {
            return PlayType.DOUBLE_PLAY;
        }

        // Check if ball is in outfield
        const distanceFromHome = Math.sqrt(ballPosition.x ** 2 + ballPosition.z ** 2);

        if (distanceFromHome > 60) {
            return PlayType.OUTFIELD_ASSIST;
        }

        // Check for force play situation
        const forceAtFirst = runners.length === 0 || runners.some(r => r.currentBase === 0);

        if (forceAtFirst) {
            return PlayType.FORCE_OUT;
        }

        return PlayType.ROUTINE_OUT;
    }

    /**
     * Attempt catch
     */
    public attemptCatch(
        fielderId: string,
        ballPosition: Vector3,
        ballVelocity: Vector3
    ): CatchAttempt {
        const fielder = this.fielders.get(fielderId);
        if (!fielder) {
            throw new Error(`Fielder ${fielderId} not found`);
        }

        // Calculate distance to ball
        const distance = Vector3.Distance(fielder.location, ballPosition);

        // Determine if dive/jump/sprint required
        const requiresDive = distance > fielder.fieldingRange * 0.8;
        const requiresJump = ballPosition.y > 2.5;
        const requiresSprint = distance > fielder.speed;

        // Calculate catch difficulty
        let catchDifficulty = 1;

        // Distance affects difficulty
        catchDifficulty += distance / 5;

        // Height affects difficulty
        if (ballPosition.y > 2) {
            catchDifficulty += (ballPosition.y - 2);
        } else if (ballPosition.y < 0.5) {
            catchDifficulty += (0.5 - ballPosition.y) * 2;
        }

        // Velocity affects difficulty
        const speed = ballVelocity.length();
        catchDifficulty += speed / 10;

        // Diving/jumping increases difficulty
        if (requiresDive) catchDifficulty += 2;
        if (requiresJump) catchDifficulty += 1.5;

        catchDifficulty = Math.max(1, Math.min(10, catchDifficulty));

        // Calculate catch probability
        const skillFactor = (fielder.fieldingRange + fielder.fieldingAccuracy) / 20;
        const catchProbability = Math.max(0, Math.min(1, skillFactor * (11 - catchDifficulty) / 10));

        return {
            fielderId,
            fielderPosition: fielder.location,
            ballPosition,
            ballVelocity,
            catchDifficulty,
            catchProbability,
            requiresDive,
            requiresJump,
            requiresSprint
        };
    }

    /**
     * Execute catch
     */
    public executeCatch(catchAttempt: CatchAttempt): boolean {
        const fielder = this.fielders.get(catchAttempt.fielderId);
        if (!fielder) return false;

        // Roll for success
        const roll = Math.random();
        const success = roll < catchAttempt.catchProbability;

        if (success) {
            // Move fielder to ball position
            fielder.location = catchAttempt.ballPosition.clone();
            fielder.location.y = 0; // Ground level
        }

        return success;
    }

    /**
     * Execute throw
     */
    public executeThrow(config: ThrowConfig): ThrowResult {
        const fielder = this.fielders.get(config.throwerId);
        if (!fielder) {
            throw new Error(`Fielder ${config.throwerId} not found`);
        }

        // Calculate base throw velocity
        const baseVelocity = this.throwSpeeds[fielder.position] || 85;
        const powerFactor = config.throwPower / 10;
        const fatiguePenalty = (1 - config.fatigueFactor) * 10; // Up to -10 mph when tired

        const throwVelocity = baseVelocity * powerFactor - fatiguePenalty;

        // Calculate throw trajectory
        const trajectory = this.calculateThrowTrajectory(
            config.throwerPosition,
            config.targetPosition,
            throwVelocity
        );

        // Calculate flight time
        const distance = Vector3.Distance(config.throwerPosition, config.targetPosition);
        const flightTime = distance / (throwVelocity * 0.44704); // Convert mph to m/s

        // Calculate accuracy
        const accuracyFactor = (config.throwAccuracy + fielder.throwAccuracy) / 20;
        const accuracyError = (1 - accuracyFactor) * 2; // Up to 2 meters off target

        const actualLanding = config.targetPosition.add(
            new Vector3(
                (Math.random() - 0.5) * accuracyError,
                0,
                (Math.random() - 0.5) * accuracyError
            )
        );

        const accuracy = 1 - (Vector3.Distance(actualLanding, config.targetPosition) / 2);

        // Determine if catchable
        const catchable = accuracy > 0.5;

        return {
            throwId: `throw_${Date.now()}`,
            success: catchable,
            trajectory,
            flightTime,
            velocity: throwVelocity,
            accuracy: Math.max(0, Math.min(1, accuracy)),
            catchable,
            arrivalTime: flightTime
        };
    }

    /**
     * Calculate throw trajectory
     */
    private calculateThrowTrajectory(from: Vector3, to: Vector3, velocity: number): Vector3[] {
        const trajectory: Vector3[] = [];
        const steps = 20;

        const direction = to.subtract(from);
        const distance = direction.length();
        const normalized = direction.normalize();

        // Add arc based on distance
        const arcHeight = Math.min(distance * 0.15, 5); // Max 5m arc

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const position = from.add(normalized.scale(distance * t));

            // Add vertical arc
            position.y = Math.sin(t * Math.PI) * arcHeight;

            trajectory.push(position);
        }

        return trajectory;
    }

    /**
     * Attempt double play
     */
    public attemptDoublePlay(scenario: DoublePlayScenario): {
        firstOutSuccess: boolean;
        secondOutSuccess: boolean;
        timeElapsed: number;
    } {
        // Simulate first throw
        const firstBasePosition = this.basePositions[scenario.firstOut];
        const secondBasePosition = this.basePositions[scenario.secondOut];

        // First throw timing
        const firstThrowTime = Vector3.Distance(
            this.basePositions[scenario.startingBase],
            firstBasePosition
        ) / 20; // Simplified timing

        // Turn time (fielder receives, pivots, throws)
        const turnTime = 0.5 + (Math.random() * 0.3); // 0.5-0.8 seconds

        // Second throw timing
        const secondThrowTime = Vector3.Distance(firstBasePosition, secondBasePosition) / 20;

        const totalTime = firstThrowTime + turnTime + secondThrowTime;

        // Check if both outs made in time
        const firstOutSuccess = firstThrowTime < scenario.timeAvailable * 0.6;
        const secondOutSuccess = firstOutSuccess && totalTime < scenario.timeAvailable;

        return {
            firstOutSuccess,
            secondOutSuccess,
            timeElapsed: totalTime
        };
    }

    /**
     * Check if runner is safe or out
     */
    public checkRunnerStatus(
        runner: BaseRunner,
        throwArrivalTime: number,
        baseNumber: number
    ): 'safe' | 'out' {
        // Calculate runner arrival time
        const basePosition = this.basePositions[baseNumber];
        const runnerDistance = Vector3.Distance(
            this.basePositions[runner.currentBase],
            basePosition
        );

        // Runner speed (m/s) - MLB average is about 7 m/s
        const runnerSpeed = 5 + (runner.speed * 0.3);
        const runnerArrivalTime = runnerDistance / runnerSpeed;

        // Add reaction time
        const reactionTime = (10 - runner.baseRunningSkill) * 0.1;
        const totalRunnerTime = runnerArrivalTime + reactionTime;

        // Compare times (need to beat throw by 0.1s for tie to go to runner)
        if (totalRunnerTime < throwArrivalTime - 0.1) {
            return 'safe';
        } else {
            return 'out';
        }
    }

    /**
     * Execute tag play
     */
    public executeTagPlay(
        fielderId: string,
        runner: BaseRunner,
        ballArrivalTime: number
    ): { success: boolean; runnerOut: boolean } {
        const fielder = this.fielders.get(fielderId);
        if (!fielder) {
            return { success: false, runnerOut: false };
        }

        // Calculate if fielder can make the tag
        const tagDifficulty = 1 + (runner.speed / 10) * 5; // Faster runners harder to tag

        const tagSkill = (fielder.fieldingAccuracy + fielder.speed) / 20;
        const tagProbability = Math.max(0.3, 1 - (tagDifficulty / 10) + tagSkill);

        // Roll for tag success
        const success = Math.random() < tagProbability;

        // Runner is out if tagged successfully
        const runnerOut = success;

        return { success, runnerOut };
    }

    /**
     * Calculate pickoff attempt success
     */
    public attemptPickoff(
        base: number,
        pitcher: string,
        runner: BaseRunner
    ): { caught: boolean; runnerReturns: boolean } {
        // Pickoff success depends on:
        // 1. Pitcher's pickoff move
        // 2. Runner's lead distance
        // 3. Runner's baserunning skill

        const leadRisk = runner.leadDistance / 3; // Risky leads easier to pick off

        const pickoffChance = 0.1 + leadRisk - (runner.baseRunningSkill / 20);

        const caught = Math.random() < pickoffChance;

        // If not caught, can runner get back safely?
        const returnChance = (runner.speed + runner.baseRunningSkill) / 20;
        const runnerReturns = !caught || Math.random() < returnChance;

        return { caught, runnerReturns };
    }

    /**
     * Complete fielding play
     */
    public completePlay(playId: string, successful: boolean, error?: string): void {
        const play = this.activePlays.get(playId);
        if (!play) return;

        play.completed = true;
        play.successful = successful;
        play.error = error;
        play.completionTime = performance.now() / 1000;

        // Could trigger achievements, update stats, etc.
    }

    /**
     * Get fielder position
     */
    public getFielderPosition(fielderId: string): Vector3 | undefined {
        return this.fielders.get(fielderId)?.location;
    }

    /**
     * Move fielder
     */
    public moveFielder(fielderId: string, newPosition: Vector3): void {
        const fielder = this.fielders.get(fielderId);
        if (fielder) {
            fielder.location = newPosition;
        }
    }

    /**
     * Get base position
     */
    public getBasePosition(base: number): Vector3 {
        return this.basePositions[base];
    }

    /**
     * Update fielder abilities
     */
    public updateFielderAbilities(
        fielderId: string,
        abilities: Partial<{
            fieldingRange: number;
            fieldingAccuracy: number;
            throwPower: number;
            throwAccuracy: number;
            speed: number;
        }>
    ): void {
        const fielder = this.fielders.get(fielderId);
        if (!fielder) return;

        Object.assign(fielder, abilities);
    }

    /**
     * Get active plays
     */
    public getActivePlays(): FieldingPlay[] {
        return Array.from(this.activePlays.values());
    }

    /**
     * Dispose defensive play system
     */
    public dispose(): void {
        this.activePlays.clear();
        this.fielders.clear();
    }
}
