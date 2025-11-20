import { Vector3 } from '@babylonjs/core';

/**
 * Pitch types with realistic characteristics
 */
export enum PitchType {
    FOUR_SEAM_FASTBALL = 'FOUR_SEAM_FASTBALL',
    TWO_SEAM_FASTBALL = 'TWO_SEAM_FASTBALL',
    CURVEBALL = 'CURVEBALL',
    SLIDER = 'SLIDER',
    CHANGEUP = 'CHANGEUP',
    CUTTER = 'CUTTER',
    SPLITTER = 'SPLITTER',
    SINKER = 'SINKER',
    KNUCKLEBALL = 'KNUCKLEBALL',
    SCREWBALL = 'SCREWBALL',
    SLURVE = 'SLURVE', // Slider-curve hybrid
    EEPHUS = 'EEPHUS'  // Super slow lob
}

/**
 * Pitch location zones in the strike zone
 */
export enum PitchZone {
    HIGH_INSIDE = 'HIGH_INSIDE',
    HIGH_MIDDLE = 'HIGH_MIDDLE',
    HIGH_OUTSIDE = 'HIGH_OUTSIDE',
    MIDDLE_INSIDE = 'MIDDLE_INSIDE',
    MIDDLE_MIDDLE = 'MIDDLE_MIDDLE',
    MIDDLE_OUTSIDE = 'MIDDLE_OUTSIDE',
    LOW_INSIDE = 'LOW_INSIDE',
    LOW_MIDDLE = 'LOW_MIDDLE',
    LOW_OUTSIDE = 'LOW_OUTSIDE',
    BALL_INSIDE = 'BALL_INSIDE',
    BALL_OUTSIDE = 'BALL_OUTSIDE',
    BALL_HIGH = 'BALL_HIGH',
    BALL_LOW = 'BALL_LOW'
}

/**
 * Pitch characteristics defining behavior
 */
export interface PitchCharacteristics {
    type: PitchType;
    velocity: number;              // mph
    spinRate: number;              // rpm
    spinAxis: Vector3;             // Spin direction
    horizontalBreak: number;       // inches
    verticalBreak: number;         // inches (drop/rise)
    releasePoint: Vector3;         // Where pitcher releases
    approachAngle: number;         // degrees
    plateVelocity: number;         // mph at plate
    movementQuality: number;       // 0-10 how sharp the break is
    difficulty: number;            // 1-10 how hard to hit
}

/**
 * Pitch sequence tracking for strategy
 */
export interface PitchSequence {
    pitches: PitchType[];
    locations: PitchZone[];
    results: ('strike' | 'ball' | 'hit' | 'foul')[];
    count: { balls: number; strikes: number }[];
}

/**
 * Pitcher repertoire - what pitches they can throw
 */
export interface PitcherRepertoire {
    pitcherId: string;
    primaryPitch: PitchType;
    pitches: Map<PitchType, number>; // Pitch type -> effectiveness (0-10)
    pitchUsageFrequency: Map<PitchType, number>; // How often to throw each pitch
    maxVelocity: number;
    control: number; // 1-10
    stamina: number; // 1-10
}

/**
 * Pitch intent - what pitcher is trying to do
 */
export interface PitchIntent {
    targetZone: PitchZone;
    desiredPitch: PitchType;
    intention: 'strikeout' | 'contact' | 'weak_contact' | 'waste_pitch';
    riskLevel: number; // 1-10, higher = more aggressive
}

/**
 * Advanced pitching system with realistic pitch physics and strategy
 */
export class PitchingSystem {
    // Pitch characteristics database
    private pitchDatabase: Map<PitchType, Partial<PitchCharacteristics>> = new Map();

    // Pitcher repertoires
    private pitcherRepertoires: Map<string, PitcherRepertoire> = new Map();

    // Pitch sequence tracking
    private currentAtBatSequence: PitchSequence | null = null;
    private gameSequences: Map<string, PitchSequence[]> = new Map(); // batterId -> sequences

    // Strategic state
    private batterTendencies: Map<string, Map<PitchZone, number>> = new Map(); // batterId -> zone -> success rate
    private pitchCount: { balls: number; strikes: number } = { balls: 0, strikes: 0 };

    constructor() {
        this.initializePitchDatabase();
    }

    /**
     * Initialize pitch characteristics database
     */
    private initializePitchDatabase(): void {
        // Four-seam fastball: Straight, high velocity
        this.pitchDatabase.set(PitchType.FOUR_SEAM_FASTBALL, {
            velocity: 92,
            spinRate: 2300,
            horizontalBreak: 0,
            verticalBreak: 12, // Rise due to backspin
            approachAngle: -6,
            movementQuality: 5,
            difficulty: 5
        });

        // Two-seam fastball: Slight movement, good for ground balls
        this.pitchDatabase.set(PitchType.TWO_SEAM_FASTBALL, {
            velocity: 90,
            spinRate: 2100,
            horizontalBreak: 8, // Arm-side movement
            verticalBreak: 8,
            approachAngle: -5.5,
            movementQuality: 6,
            difficulty: 6
        });

        // Curveball: Big downward break
        this.pitchDatabase.set(PitchType.CURVEBALL, {
            velocity: 78,
            spinRate: 2600,
            horizontalBreak: 6,
            verticalBreak: -12, // Sharp drop
            approachAngle: -4,
            movementQuality: 8,
            difficulty: 7
        });

        // Slider: Tight break, later movement
        this.pitchDatabase.set(PitchType.SLIDER, {
            velocity: 85,
            spinRate: 2400,
            horizontalBreak: 12, // Sweeping action
            verticalBreak: -3,
            approachAngle: -5,
            movementQuality: 9,
            difficulty: 8
        });

        // Changeup: Velocity change, slight drop
        this.pitchDatabase.set(PitchType.CHANGEUP, {
            velocity: 82,
            spinRate: 1700,
            horizontalBreak: 7,
            verticalBreak: -8, // Fade and drop
            approachAngle: -4.5,
            movementQuality: 7,
            difficulty: 7
        });

        // Cutter: Fast with late cut
        this.pitchDatabase.set(PitchType.CUTTER, {
            velocity: 88,
            spinRate: 2250,
            horizontalBreak: 5, // Cut away from arm side
            verticalBreak: 8,
            approachAngle: -5.5,
            movementQuality: 7,
            difficulty: 8
        });

        // Splitter: Drops sharply at plate
        this.pitchDatabase.set(PitchType.SPLITTER, {
            velocity: 86,
            spinRate: 1400,
            horizontalBreak: 3,
            verticalBreak: -15, // Hard drop
            approachAngle: -3,
            movementQuality: 9,
            difficulty: 9
        });

        // Sinker: Heavy sinking action
        this.pitchDatabase.set(PitchType.SINKER, {
            velocity: 91,
            spinRate: 2100,
            horizontalBreak: 10,
            verticalBreak: -6, // Sink
            approachAngle: -5,
            movementQuality: 7,
            difficulty: 6
        });

        // Knuckleball: Unpredictable movement
        this.pitchDatabase.set(PitchType.KNUCKLEBALL, {
            velocity: 68,
            spinRate: 100, // Almost no spin
            horizontalBreak: 15, // Random
            verticalBreak: 8, // Random
            approachAngle: -2,
            movementQuality: 10, // Very unpredictable
            difficulty: 9
        });

        // Screwball: Opposite break
        this.pitchDatabase.set(PitchType.SCREWBALL, {
            velocity: 80,
            spinRate: 2200,
            horizontalBreak: -10, // Opposite direction
            verticalBreak: -5,
            approachAngle: -4,
            movementQuality: 8,
            difficulty: 8
        });

        // Slurve: Slider-curve hybrid
        this.pitchDatabase.set(PitchType.SLURVE, {
            velocity: 82,
            spinRate: 2500,
            horizontalBreak: 9,
            verticalBreak: -8,
            approachAngle: -4.5,
            movementQuality: 8,
            difficulty: 8
        });

        // Eephus: Very slow, high arc
        this.pitchDatabase.set(PitchType.EEPHUS, {
            velocity: 55,
            spinRate: 900,
            horizontalBreak: 2,
            verticalBreak: 20, // High arc
            approachAngle: -1,
            movementQuality: 6,
            difficulty: 7 // Hard due to timing change
        });
    }

    /**
     * Create pitcher repertoire based on skill level and style
     */
    public createPitcherRepertoire(
        pitcherId: string,
        skillLevel: number, // 1-10
        style: 'power' | 'finesse' | 'groundball' | 'strikeout' = 'power'
    ): PitcherRepertoire {
        const repertoire: PitcherRepertoire = {
            pitcherId,
            primaryPitch: PitchType.FOUR_SEAM_FASTBALL,
            pitches: new Map(),
            pitchUsageFrequency: new Map(),
            maxVelocity: 85 + (skillLevel * 1.5), // 86-100 mph range
            control: skillLevel,
            stamina: skillLevel
        };

        // All pitchers have a fastball
        repertoire.pitches.set(PitchType.FOUR_SEAM_FASTBALL, skillLevel);
        repertoire.pitchUsageFrequency.set(PitchType.FOUR_SEAM_FASTBALL, 0.4);

        // Add pitches based on style
        switch (style) {
            case 'power':
                repertoire.primaryPitch = PitchType.FOUR_SEAM_FASTBALL;
                repertoire.pitches.set(PitchType.SLIDER, Math.max(1, skillLevel - 2));
                repertoire.pitches.set(PitchType.CUTTER, Math.max(1, skillLevel - 3));
                repertoire.pitchUsageFrequency.set(PitchType.SLIDER, 0.35);
                repertoire.pitchUsageFrequency.set(PitchType.CUTTER, 0.25);
                break;

            case 'finesse':
                repertoire.primaryPitch = PitchType.CHANGEUP;
                repertoire.pitches.set(PitchType.CHANGEUP, skillLevel);
                repertoire.pitches.set(PitchType.CURVEBALL, Math.max(1, skillLevel - 1));
                repertoire.pitches.set(PitchType.CUTTER, Math.max(1, skillLevel - 2));
                repertoire.pitchUsageFrequency.set(PitchType.CHANGEUP, 0.3);
                repertoire.pitchUsageFrequency.set(PitchType.CURVEBALL, 0.2);
                repertoire.pitchUsageFrequency.set(PitchType.CUTTER, 0.1);
                break;

            case 'groundball':
                repertoire.primaryPitch = PitchType.SINKER;
                repertoire.pitches.set(PitchType.SINKER, skillLevel);
                repertoire.pitches.set(PitchType.TWO_SEAM_FASTBALL, Math.max(1, skillLevel - 1));
                repertoire.pitches.set(PitchType.SLIDER, Math.max(1, skillLevel - 2));
                repertoire.pitchUsageFrequency.set(PitchType.SINKER, 0.35);
                repertoire.pitchUsageFrequency.set(PitchType.TWO_SEAM_FASTBALL, 0.15);
                repertoire.pitchUsageFrequency.set(PitchType.SLIDER, 0.1);
                break;

            case 'strikeout':
                repertoire.primaryPitch = PitchType.SLIDER;
                repertoire.pitches.set(PitchType.SLIDER, skillLevel);
                repertoire.pitches.set(PitchType.CURVEBALL, Math.max(1, skillLevel - 1));
                repertoire.pitches.set(PitchType.SPLITTER, Math.max(1, skillLevel - 2));
                repertoire.pitchUsageFrequency.set(PitchType.SLIDER, 0.35);
                repertoire.pitchUsageFrequency.set(PitchType.CURVEBALL, 0.15);
                repertoire.pitchUsageFrequency.set(PitchType.SPLITTER, 0.1);
                break;
        }

        this.pitcherRepertoires.set(pitcherId, repertoire);
        return repertoire;
    }

    /**
     * Select pitch based on game situation and strategy
     */
    public selectPitch(
        pitcherId: string,
        batterId: string,
        count: { balls: number; strikes: number },
        gameContext: {
            outs: number;
            runnersOn: boolean[];
            score: number; // Run differential
            inning: number;
        }
    ): PitchIntent {
        const repertoire = this.pitcherRepertoires.get(pitcherId);
        if (!repertoire) {
            throw new Error(`Pitcher ${pitcherId} not found`);
        }

        // Analyze situation
        const isPitcherAhead = count.strikes > count.balls;
        const isBatterAhead = count.balls > count.strikes;
        const isFullCount = count.balls === 3 && count.strikes === 2;
        const isTwoStrike = count.strikes === 2;
        const isThreeBall = count.balls === 3;

        let intention: PitchIntent['intention'] = 'contact';
        let riskLevel = 5;
        let targetZone: PitchZone = PitchZone.MIDDLE_MIDDLE;
        let desiredPitch: PitchType = repertoire.primaryPitch;

        // Strategic decisions based on count
        if (isPitcherAhead) {
            intention = 'weak_contact';
            riskLevel = 7;
            // Pitcher ahead: throw something off the plate or with movement
            desiredPitch = this.selectOffSpeedPitch(repertoire);
            targetZone = this.selectOutsideZone();
        } else if (isBatterAhead) {
            intention = 'contact';
            riskLevel = 3;
            // Batter ahead: challenge with fastball in zone
            desiredPitch = PitchType.FOUR_SEAM_FASTBALL;
            targetZone = this.selectSafeZone();
        } else if (isFullCount) {
            intention = 'contact';
            riskLevel = 5;
            // Full count: best pitch, good location
            desiredPitch = repertoire.primaryPitch;
            targetZone = this.selectCornerZone();
        } else if (isTwoStrike) {
            intention = 'strikeout';
            riskLevel = 8;
            // Two strikes: go for strikeout
            desiredPitch = this.selectStrikeoutPitch(repertoire);
            targetZone = this.selectChaseZone();
        } else if (isThreeBall) {
            intention = 'contact';
            riskLevel = 2;
            // Can't walk: groove a fastball
            desiredPitch = PitchType.FOUR_SEAM_FASTBALL;
            targetZone = PitchZone.MIDDLE_MIDDLE;
        }

        // Adjust for game context
        if (gameContext.runnersOn[2]) { // Runner on third
            // Don't want to give up easy contact
            if (intention === 'contact') {
                intention = 'weak_contact';
                riskLevel += 1;
            }
        }

        if (gameContext.outs === 2) {
            // Two outs: more aggressive
            riskLevel += 1;
        }

        if (Math.abs(gameContext.score) > 5) {
            // Blowout game: less risk
            riskLevel -= 2;
        }

        // Occasionally mix in unexpected pitch
        if (Math.random() < 0.15) {
            desiredPitch = this.selectRandomPitch(repertoire);
        }

        return {
            targetZone,
            desiredPitch,
            intention,
            riskLevel: Math.max(1, Math.min(10, riskLevel))
        };
    }

    /**
     * Select off-speed pitch from repertoire
     */
    private selectOffSpeedPitch(repertoire: PitcherRepertoire): PitchType {
        const offSpeedPitches = Array.from(repertoire.pitches.keys()).filter(
            p => p !== PitchType.FOUR_SEAM_FASTBALL && p !== PitchType.TWO_SEAM_FASTBALL
        );

        if (offSpeedPitches.length === 0) return PitchType.FOUR_SEAM_FASTBALL;

        // Weight by effectiveness
        const weights = offSpeedPitches.map(p => repertoire.pitches.get(p) || 1);
        return this.weightedRandomChoice(offSpeedPitches, weights);
    }

    /**
     * Select strikeout pitch
     */
    private selectStrikeoutPitch(repertoire: PitcherRepertoire): PitchType {
        const strikeoutPitches = [
            PitchType.SLIDER,
            PitchType.CURVEBALL,
            PitchType.SPLITTER,
            PitchType.SLURVE
        ].filter(p => repertoire.pitches.has(p));

        if (strikeoutPitches.length === 0) return repertoire.primaryPitch;

        const weights = strikeoutPitches.map(p => repertoire.pitches.get(p) || 1);
        return this.weightedRandomChoice(strikeoutPitches, weights);
    }

    /**
     * Select random pitch from repertoire
     */
    private selectRandomPitch(repertoire: PitcherRepertoire): PitchType {
        const pitches = Array.from(repertoire.pitches.keys());
        return pitches[Math.floor(Math.random() * pitches.length)];
    }

    /**
     * Weighted random selection
     */
    private weightedRandomChoice<T>(items: T[], weights: number[]): T {
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) return items[i];
        }

        return items[items.length - 1];
    }

    /**
     * Select zone outside strike zone for chase pitches
     */
    private selectChaseZone(): PitchZone {
        const chaseZones = [
            PitchZone.BALL_INSIDE,
            PitchZone.BALL_OUTSIDE,
            PitchZone.BALL_LOW
        ];
        return chaseZones[Math.floor(Math.random() * chaseZones.length)];
    }

    /**
     * Select safe zone in strike zone
     */
    private selectSafeZone(): PitchZone {
        const safeZones = [
            PitchZone.LOW_INSIDE,
            PitchZone.LOW_OUTSIDE,
            PitchZone.MIDDLE_INSIDE,
            PitchZone.MIDDLE_OUTSIDE
        ];
        return safeZones[Math.floor(Math.random() * safeZones.length)];
    }

    /**
     * Select corner zone
     */
    private selectCornerZone(): PitchZone {
        const cornerZones = [
            PitchZone.LOW_INSIDE,
            PitchZone.LOW_OUTSIDE,
            PitchZone.HIGH_INSIDE,
            PitchZone.HIGH_OUTSIDE
        ];
        return cornerZones[Math.floor(Math.random() * cornerZones.length)];
    }

    /**
     * Select zone outside strike zone
     */
    private selectOutsideZone(): PitchZone {
        const outsideZones = [
            PitchZone.BALL_INSIDE,
            PitchZone.BALL_OUTSIDE,
            PitchZone.BALL_LOW,
            PitchZone.BALL_HIGH
        ];
        return outsideZones[Math.floor(Math.random() * outsideZones.length)];
    }

    /**
     * Execute pitch - generate full characteristics
     */
    public executePitch(
        pitcherId: string,
        intent: PitchIntent,
        fatigueFactor: number = 1.0 // 0-1, affects velocity and control
    ): PitchCharacteristics {
        const repertoire = this.pitcherRepertoires.get(pitcherId);
        if (!repertoire) {
            throw new Error(`Pitcher ${pitcherId} not found`);
        }

        // Get base characteristics
        const baseChar = this.pitchDatabase.get(intent.desiredPitch);
        if (!baseChar) {
            throw new Error(`Pitch type ${intent.desiredPitch} not found`);
        }

        // Calculate actual velocity
        const pitchEffectiveness = repertoire.pitches.get(intent.desiredPitch) || 5;
        const velocityBonus = (pitchEffectiveness - 5) * 2; // -10 to +10 mph
        const fatigueVelocityPenalty = (1 - fatigueFactor) * 8; // Up to -8 mph when tired
        const velocity = (baseChar.velocity || 90) + velocityBonus - fatigueVelocityPenalty;

        // Calculate location with control affecting accuracy
        const targetLocation = this.getZoneLocation(intent.targetZone);
        const controlFactor = (repertoire.control / 10) * fatigueFactor;
        const locationError = (1 - controlFactor) * 0.5; // Up to 0.5 units off target

        const actualLocation = new Vector3(
            targetLocation.x + (Math.random() - 0.5) * locationError,
            targetLocation.y + (Math.random() - 0.5) * locationError,
            targetLocation.z + (Math.random() - 0.5) * locationError
        );

        // Calculate spin
        const spinRate = (baseChar.spinRate || 2000) * (0.9 + Math.random() * 0.2);
        const spinAxis = this.calculateSpinAxis(intent.desiredPitch);

        // Calculate movement
        const movementQuality = (baseChar.movementQuality || 5) * (pitchEffectiveness / 10);
        const horizontalBreak = (baseChar.horizontalBreak || 0) * (movementQuality / 5);
        const verticalBreak = (baseChar.verticalBreak || 0) * (movementQuality / 5);

        // Knuckleball gets random movement
        if (intent.desiredPitch === PitchType.KNUCKLEBALL) {
            const randomBreak = 20 * (Math.random() - 0.5);
            const randomVertBreak = 15 * (Math.random() - 0.5);
            return {
                type: intent.desiredPitch,
                velocity,
                spinRate,
                spinAxis,
                horizontalBreak: randomBreak,
                verticalBreak: randomVertBreak,
                releasePoint: new Vector3(0, 2, 18.44),
                approachAngle: baseChar.approachAngle || -5,
                plateVelocity: velocity * 0.95,
                movementQuality: 10,
                difficulty: 9
            };
        }

        return {
            type: intent.desiredPitch,
            velocity,
            spinRate,
            spinAxis,
            horizontalBreak,
            verticalBreak,
            releasePoint: new Vector3(0, 2, 18.44), // Standard release point
            approachAngle: baseChar.approachAngle || -5,
            plateVelocity: velocity * 0.95, // Loses 5% velocity by plate
            movementQuality,
            difficulty: baseChar.difficulty || 5
        };
    }

    /**
     * Get 3D location for pitch zone
     */
    private getZoneLocation(zone: PitchZone): Vector3 {
        // Strike zone: -0.5 to 0.5 X, 0.5 to 1.8 Y, 0 Z
        const zoneMap: Record<PitchZone, Vector3> = {
            [PitchZone.HIGH_INSIDE]: new Vector3(-0.35, 1.6, 0),
            [PitchZone.HIGH_MIDDLE]: new Vector3(0, 1.6, 0),
            [PitchZone.HIGH_OUTSIDE]: new Vector3(0.35, 1.6, 0),
            [PitchZone.MIDDLE_INSIDE]: new Vector3(-0.35, 1.15, 0),
            [PitchZone.MIDDLE_MIDDLE]: new Vector3(0, 1.15, 0),
            [PitchZone.MIDDLE_OUTSIDE]: new Vector3(0.35, 1.15, 0),
            [PitchZone.LOW_INSIDE]: new Vector3(-0.35, 0.7, 0),
            [PitchZone.LOW_MIDDLE]: new Vector3(0, 0.7, 0),
            [PitchZone.LOW_OUTSIDE]: new Vector3(0.35, 0.7, 0),
            [PitchZone.BALL_INSIDE]: new Vector3(-0.7, 1.15, 0),
            [PitchZone.BALL_OUTSIDE]: new Vector3(0.7, 1.15, 0),
            [PitchZone.BALL_HIGH]: new Vector3(0, 2.0, 0),
            [PitchZone.BALL_LOW]: new Vector3(0, 0.2, 0)
        };

        return zoneMap[zone] || new Vector3(0, 1.15, 0);
    }

    /**
     * Calculate spin axis for pitch type
     */
    private calculateSpinAxis(pitchType: PitchType): Vector3 {
        // Spin axis determines movement direction
        switch (pitchType) {
            case PitchType.FOUR_SEAM_FASTBALL:
                return new Vector3(0, 1, 0.1); // Pure backspin with slight drift

            case PitchType.TWO_SEAM_FASTBALL:
                return new Vector3(0.3, 0.9, 0.2); // Tilted for arm-side run

            case PitchType.CURVEBALL:
                return new Vector3(0.2, -0.8, 0.5); // Forward spin for drop

            case PitchType.SLIDER:
                return new Vector3(0.7, 0, 0.7); // Diagonal spin

            case PitchType.CHANGEUP:
                return new Vector3(0.1, -0.3, 0.9); // Tumbling action

            case PitchType.CUTTER:
                return new Vector3(-0.4, 0.8, 0.4); // Cut action

            case PitchType.SPLITTER:
                return new Vector3(0, -1, 0); // Pure topspin

            case PitchType.SINKER:
                return new Vector3(0.4, -0.6, 0.7); // Sinking action

            case PitchType.KNUCKLEBALL:
                return new Vector3(0.1, 0.1, 1); // Almost no axis

            case PitchType.SCREWBALL:
                return new Vector3(-0.7, 0, 0.7); // Opposite slider

            case PitchType.SLURVE:
                return new Vector3(0.5, -0.5, 0.7); // Slider-curve combo

            case PitchType.EEPHUS:
                return new Vector3(0, 0.5, 0.9); // High arc

            default:
                return new Vector3(0, 1, 0);
        }
    }

    /**
     * Start new at-bat sequence
     */
    public startAtBat(batterId: string): void {
        this.currentAtBatSequence = {
            pitches: [],
            locations: [],
            results: [],
            count: []
        };
    }

    /**
     * Record pitch result
     */
    public recordPitchResult(
        batterId: string,
        pitch: PitchCharacteristics,
        zone: PitchZone,
        result: 'strike' | 'ball' | 'hit' | 'foul',
        count: { balls: number; strikes: number }
    ): void {
        if (this.currentAtBatSequence) {
            this.currentAtBatSequence.pitches.push(pitch.type);
            this.currentAtBatSequence.locations.push(zone);
            this.currentAtBatSequence.results.push(result);
            this.currentAtBatSequence.count.push({ ...count });
        }
    }

    /**
     * End at-bat and store sequence
     */
    public endAtBat(batterId: string): void {
        if (this.currentAtBatSequence) {
            if (!this.gameSequences.has(batterId)) {
                this.gameSequences.set(batterId, []);
            }
            this.gameSequences.get(batterId)!.push(this.currentAtBatSequence);
            this.currentAtBatSequence = null;
        }
    }

    /**
     * Get pitcher repertoire
     */
    public getPitcherRepertoire(pitcherId: string): PitcherRepertoire | undefined {
        return this.pitcherRepertoires.get(pitcherId);
    }

    /**
     * Get pitch characteristics
     */
    public getPitchCharacteristics(pitchType: PitchType): Partial<PitchCharacteristics> | undefined {
        return this.pitchDatabase.get(pitchType);
    }

    /**
     * Dispose pitching system
     */
    public dispose(): void {
        this.pitcherRepertoires.clear();
        this.gameSequences.clear();
        this.currentAtBatSequence = null;
    }
}
