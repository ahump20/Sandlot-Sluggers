import { Vector3 } from '@babylonjs/core';
import { PitchType, PitchCharacteristics, PitchZone } from '../pitching/PitchingSystem';

/**
 * Swing types affecting contact
 */
export enum SwingType {
    NORMAL = 'NORMAL',          // Standard swing
    POWER = 'POWER',            // Full power swing
    CONTACT = 'CONTACT',        // Choke up for contact
    BUNT = 'BUNT',              // Bunt attempt
    CHECK = 'CHECK'             // Check swing (stopped)
}

/**
 * Contact quality levels
 */
export enum ContactQuality {
    PERFECT = 'PERFECT',        // Sweet spot hit
    SOLID = 'SOLID',            // Good contact
    DECENT = 'DECENT',          // Playable contact
    WEAK = 'WEAK',              // Poor contact
    FOUL = 'FOUL',              // Foul ball
    MISS = 'MISS'               // Complete miss
}

/**
 * Hit types based on trajectory
 */
export enum HitType {
    GROUND_BALL = 'GROUND_BALL',
    LINE_DRIVE = 'LINE_DRIVE',
    FLY_BALL = 'FLY_BALL',
    POP_UP = 'POP_UP',
    BUNT = 'BUNT',
    FOUL = 'FOUL'
}

/**
 * Batting stance configuration
 */
export interface BattingStance {
    handedness: 'right' | 'left' | 'switch';
    stance: 'open' | 'closed' | 'square';
    depth: 'deep' | 'middle' | 'shallow'; // Position in box
    crowdPlate: boolean; // Closer to plate
}

/**
 * Swing mechanics and timing
 */
export interface SwingMechanics {
    swingType: SwingType;
    swingStart: number;         // Time swing started (seconds)
    swingDuration: number;      // How long swing takes (seconds)
    batSpeed: number;           // mph
    launchAngle: number;        // degrees
    exitVelocity: number;       // mph
    spinRate: number;           // rpm on ball after contact
    sprayAngle: number;         // degrees left/right
}

/**
 * Batter profile with skills and tendencies
 */
export interface BatterProfile {
    batterId: string;
    power: number;              // 1-10
    contact: number;            // 1-10
    speed: number;              // 1-10
    patience: number;           // 1-10 (affects swing decisions)
    vision: number;             // 1-10 (pitch recognition)
    stance: BattingStance;

    // Hot/cold zones
    hotZones: PitchZone[];
    coldZones: PitchZone[];

    // Pitch preferences
    preferredPitches: PitchType[];
    weakAgainst: PitchType[];

    // Tendencies
    pullHitter: boolean;        // More likely to pull
    flyBallHitter: boolean;     // More fly balls
    groundBallHitter: boolean;  // More ground balls
    aggressiveness: number;     // 1-10, how likely to swing
}

/**
 * Swing timing windows for different results
 */
export interface TimingWindows {
    perfectWindow: number;      // milliseconds for perfect timing
    solidWindow: number;        // milliseconds for solid contact
    decentWindow: number;       // milliseconds for decent contact
    weakWindow: number;         // milliseconds for weak contact
}

/**
 * Batting approach for at-bat
 */
export interface BattingApproach {
    lookingFor: PitchType | 'any'; // Sit on specific pitch
    targetZone: PitchZone | 'any'; // Look for location
    swingType: SwingType;
    takePitch: boolean;         // Taking this pitch
}

/**
 * Contact result with full details
 */
export interface ContactResult {
    quality: ContactQuality;
    hitType: HitType;
    exitVelocity: number;       // mph
    launchAngle: number;        // degrees
    sprayAngle: number;         // degrees left/right
    spinRate: number;           // rpm
    trajectory: Vector3[];      // Predicted ball path
    landingPosition: Vector3;
    hangTime: number;           // seconds in air
    distance: number;           // feet traveled
}

/**
 * Advanced batting system with realistic mechanics
 */
export class BattingSystem {
    private batterProfiles: Map<string, BatterProfile> = new Map();
    private timingWindows: TimingWindows;

    // Current swing state
    private isSwinging: boolean = false;
    private swingStartTime: number = 0;
    private currentSwingType: SwingType = SwingType.NORMAL;

    // Batting statistics
    private atBatStats: Map<string, {
        atBats: number;
        hits: number;
        homeRuns: number;
        strikeouts: number;
        walks: number;
        swingAndMisses: number;
        perfectContacts: number;
    }> = new Map();

    constructor() {
        // Initialize timing windows (realistic MLB timing)
        this.timingWindows = {
            perfectWindow: 15,      // 15ms window for perfect contact
            solidWindow: 30,        // 30ms window for solid contact
            decentWindow: 50,       // 50ms window for decent contact
            weakWindow: 80          // 80ms window for weak contact
        };
    }

    /**
     * Create batter profile
     */
    public createBatterProfile(
        batterId: string,
        power: number,
        contact: number,
        speed: number,
        style: 'power' | 'contact' | 'balanced' = 'balanced'
    ): BatterProfile {
        let profile: BatterProfile = {
            batterId,
            power,
            contact,
            speed,
            patience: 5,
            vision: 5,
            stance: {
                handedness: Math.random() > 0.5 ? 'right' : 'left',
                stance: 'square',
                depth: 'middle',
                crowdPlate: false
            },
            hotZones: [],
            coldZones: [],
            preferredPitches: [],
            weakAgainst: [],
            pullHitter: false,
            flyBallHitter: false,
            groundBallHitter: false,
            aggressiveness: 5
        };

        // Adjust based on style
        switch (style) {
            case 'power':
                profile.power = Math.min(10, power + 2);
                profile.contact = Math.max(1, contact - 1);
                profile.aggressiveness = 7;
                profile.pullHitter = true;
                profile.flyBallHitter = true;
                profile.preferredPitches = [PitchType.FOUR_SEAM_FASTBALL];
                profile.weakAgainst = [PitchType.SLIDER, PitchType.CHANGEUP];
                profile.hotZones = [PitchZone.MIDDLE_INSIDE, PitchZone.MIDDLE_MIDDLE];
                profile.coldZones = [PitchZone.LOW_OUTSIDE, PitchZone.BALL_LOW];
                break;

            case 'contact':
                profile.contact = Math.min(10, contact + 2);
                profile.power = Math.max(1, power - 1);
                profile.aggressiveness = 4;
                profile.pullHitter = false;
                profile.groundBallHitter = true;
                profile.patience = 7;
                profile.vision = 8;
                profile.preferredPitches = [PitchType.CHANGEUP, PitchType.TWO_SEAM_FASTBALL];
                profile.weakAgainst = [PitchType.SLIDER];
                profile.hotZones = [PitchZone.MIDDLE_OUTSIDE, PitchZone.LOW_OUTSIDE];
                profile.coldZones = [PitchZone.HIGH_INSIDE, PitchZone.BALL_HIGH];
                break;

            case 'balanced':
                profile.aggressiveness = 5;
                profile.patience = 6;
                profile.vision = 6;
                profile.preferredPitches = [PitchType.FOUR_SEAM_FASTBALL, PitchType.CHANGEUP];
                profile.weakAgainst = [PitchType.SLIDER];
                profile.hotZones = [PitchZone.MIDDLE_MIDDLE, PitchZone.LOW_MIDDLE];
                profile.coldZones = [PitchZone.HIGH_OUTSIDE, PitchZone.BALL_HIGH];
                break;
        }

        this.batterProfiles.set(batterId, profile);
        this.initializeStats(batterId);

        return profile;
    }

    /**
     * Initialize batting statistics
     */
    private initializeStats(batterId: string): void {
        this.atBatStats.set(batterId, {
            atBats: 0,
            hits: 0,
            homeRuns: 0,
            strikeouts: 0,
            walks: 0,
            swingAndMisses: 0,
            perfectContacts: 0
        });
    }

    /**
     * Decide whether to swing at pitch
     */
    public shouldSwing(
        batterId: string,
        pitch: PitchCharacteristics,
        pitchLocation: Vector3,
        count: { balls: number; strikes: number },
        approach?: BattingApproach
    ): boolean {
        const profile = this.batterProfiles.get(batterId);
        if (!profile) return false;

        // Check if taking pitch
        if (approach?.takePitch) return false;

        // Determine if pitch is in strike zone
        const isStrike = this.isPitchInStrikeZone(pitchLocation);

        // Vision affects pitch recognition
        const visionFactor = profile.vision / 10;
        const recognitionAccuracy = 0.5 + (visionFactor * 0.5); // 50-100% recognition

        // Batter might misread pitch location
        const perceivedStrike = Math.random() < recognitionAccuracy ? isStrike : !isStrike;

        // Count situation affects decision
        const isBatterAhead = count.balls > count.strikes;
        const isTwoStrikes = count.strikes === 2;
        const isThreeBalls = count.balls === 3;

        // Base swing probability
        let swingProbability = profile.aggressiveness / 10;

        // Adjust for perceived strike
        if (perceivedStrike) {
            swingProbability += 0.4;
        } else {
            swingProbability -= 0.3;
        }

        // Adjust for count
        if (isTwoStrikes) {
            swingProbability += 0.3; // Protect plate
        } else if (isThreeBalls) {
            swingProbability -= 0.2; // More selective
        } else if (isBatterAhead) {
            swingProbability -= 0.1;
        }

        // Check if pitch matches approach
        if (approach) {
            if (approach.lookingFor !== 'any' && pitch.type === approach.lookingFor) {
                swingProbability += 0.3;
            }
        }

        // Check hot/cold zones
        const zone = this.getZoneFromLocation(pitchLocation);
        if (profile.hotZones.includes(zone)) {
            swingProbability += 0.2;
        } else if (profile.coldZones.includes(zone)) {
            swingProbability -= 0.2;
        }

        // Check preferred pitches
        if (profile.preferredPitches.includes(pitch.type)) {
            swingProbability += 0.15;
        } else if (profile.weakAgainst.includes(pitch.type)) {
            swingProbability -= 0.15;
        }

        return Math.random() < Math.max(0, Math.min(1, swingProbability));
    }

    /**
     * Execute swing and calculate contact
     */
    public executeSwing(
        batterId: string,
        pitch: PitchCharacteristics,
        pitchLocation: Vector3,
        swingTiming: number, // milliseconds early/late (negative = early, positive = late)
        swingType: SwingType = SwingType.NORMAL,
        fatigueFactor: number = 1.0
    ): ContactResult {
        const profile = this.batterProfiles.get(batterId);
        if (!profile) {
            return this.createMissResult();
        }

        this.currentSwingType = swingType;

        // Calculate timing quality
        const timingQuality = this.calculateTimingQuality(swingTiming);

        // Calculate bat-ball distance at swing point
        const contactDistance = this.calculateContactDistance(pitchLocation, swingTiming, pitch);

        // Determine if contact was made
        const madeContact = contactDistance < 0.15; // Within 15cm

        if (!madeContact) {
            this.recordSwingAndMiss(batterId);
            return this.createMissResult();
        }

        // Calculate contact quality
        const contactQuality = this.calculateContactQuality(
            timingQuality,
            contactDistance,
            profile,
            pitch,
            pitchLocation,
            fatigueFactor
        );

        // Calculate hit mechanics
        const exitVelocity = this.calculateExitVelocity(
            profile,
            pitch,
            contactQuality,
            swingType,
            fatigueFactor
        );

        const launchAngle = this.calculateLaunchAngle(
            profile,
            pitch,
            pitchLocation,
            contactQuality,
            swingType
        );

        const sprayAngle = this.calculateSprayAngle(
            profile,
            pitch,
            timingQuality,
            swingType
        );

        const spinRate = this.calculateBallSpin(pitch, contactQuality, launchAngle);

        // Determine hit type
        const hitType = this.determineHitType(launchAngle, exitVelocity, contactQuality);

        // Calculate trajectory
        const trajectory = this.calculateTrajectory(
            exitVelocity,
            launchAngle,
            sprayAngle,
            spinRate
        );

        const landingPosition = trajectory[trajectory.length - 1];
        const distance = Math.sqrt(
            landingPosition.x ** 2 + landingPosition.z ** 2
        ) * 3.28084; // Convert m to feet

        const hangTime = this.calculateHangTime(exitVelocity, launchAngle);

        // Record statistics
        this.recordContact(batterId, contactQuality, hitType, exitVelocity, distance);

        return {
            quality: contactQuality.quality,
            hitType,
            exitVelocity,
            launchAngle,
            sprayAngle,
            spinRate,
            trajectory,
            landingPosition,
            hangTime,
            distance
        };
    }

    /**
     * Calculate timing quality from timing offset
     */
    private calculateTimingQuality(swingTiming: number): number {
        const absTimingretError = Math.abs(swingTiming);

        if (absTimingError <= this.timingWindows.perfectWindow) {
            return 1.0; // Perfect
        } else if (absTimingError <= this.timingWindows.solidWindow) {
            return 0.85;
        } else if (absTimingError <= this.timingWindows.decentWindow) {
            return 0.65;
        } else if (absTimingError <= this.timingWindows.weakWindow) {
            return 0.4;
        } else {
            return 0.1; // Very late/early
        }
    }

    /**
     * Calculate distance between bat and ball at contact point
     */
    private calculateContactDistance(
        pitchLocation: Vector3,
        swingTiming: number,
        pitch: PitchCharacteristics
    ): number {
        // Simplified - in real game, this would involve full 3D collision detection
        const timingFactor = Math.abs(swingTiming) / 100; // Convert ms to factor
        const breakFactor = Math.sqrt(
            pitch.horizontalBreak ** 2 + pitch.verticalBreak ** 2
        ) / 100;

        return timingFactor + breakFactor;
    }

    /**
     * Calculate overall contact quality
     */
    private calculateContactQuality(
        timingQuality: number,
        contactDistance: number,
        profile: BatterProfile,
        pitch: PitchCharacteristics,
        pitchLocation: Vector3,
        fatigueFactor: number
    ): { quality: ContactQuality; factor: number } {
        // Base quality from timing
        let qualityFactor = timingQuality;

        // Contact skill affects consistency
        const contactSkill = (profile.contact / 10) * fatigueFactor;
        qualityFactor *= (0.7 + contactSkill * 0.3);

        // Pitch difficulty affects quality
        const pitchDifficulty = pitch.difficulty / 10;
        qualityFactor *= (1.2 - pitchDifficulty * 0.4);

        // Vision affects ability to square up ball
        const visionFactor = profile.vision / 10;
        qualityFactor *= (0.8 + visionFactor * 0.2);

        // Hot/cold zones
        const zone = this.getZoneFromLocation(pitchLocation);
        if (profile.hotZones.includes(zone)) {
            qualityFactor *= 1.15;
        } else if (profile.coldZones.includes(zone)) {
            qualityFactor *= 0.85;
        }

        // Preferred/weak pitches
        if (profile.preferredPitches.includes(pitch.type)) {
            qualityFactor *= 1.1;
        } else if (profile.weakAgainst.includes(pitch.type)) {
            qualityFactor *= 0.9;
        }

        // Determine quality category
        let quality: ContactQuality;
        if (qualityFactor >= 0.9) {
            quality = ContactQuality.PERFECT;
        } else if (qualityFactor >= 0.75) {
            quality = ContactQuality.SOLID;
        } else if (qualityFactor >= 0.55) {
            quality = ContactQuality.DECENT;
        } else if (qualityFactor >= 0.3) {
            quality = ContactQuality.WEAK;
        } else {
            // Very poor contact results in foul
            quality = Math.random() > 0.5 ? ContactQuality.FOUL : ContactQuality.WEAK;
        }

        return { quality, factor: qualityFactor };
    }

    /**
     * Calculate exit velocity off bat
     */
    private calculateExitVelocity(
        profile: BatterProfile,
        pitch: PitchCharacteristics,
        contactQuality: { quality: ContactQuality; factor: number },
        swingType: SwingType,
        fatigueFactor: number
    ): number {
        // Base exit velocity from power
        const basePower = profile.power * 10; // 10-100

        // Pitch velocity contributes to exit velocity
        const pitchVelocityContribution = pitch.velocity * 0.2;

        // Contact quality is critical
        const contactFactor = contactQuality.factor;

        // Swing type affects velocity
        let swingMultiplier = 1.0;
        switch (swingType) {
            case SwingType.POWER:
                swingMultiplier = 1.2;
                break;
            case SwingType.CONTACT:
                swingMultiplier = 0.9;
                break;
            case SwingType.BUNT:
                swingMultiplier = 0.2;
                break;
            case SwingType.CHECK:
                swingMultiplier = 0.3;
                break;
        }

        // Fatigue affects power
        const fatigueMultiplier = 0.7 + (fatigueFactor * 0.3);

        // Calculate final exit velocity
        let exitVelo = (basePower + pitchVelocityContribution) * contactFactor * swingMultiplier * fatigueMultiplier;

        // Add randomness
        exitVelo *= (0.95 + Math.random() * 0.1);

        // Clamp to realistic values (40-120 mph)
        return Math.max(40, Math.min(120, exitVelo));
    }

    /**
     * Calculate launch angle
     */
    private calculateLaunchAngle(
        profile: BatterProfile,
        pitch: PitchCharacteristics,
        pitchLocation: Vector3,
        contactQuality: { quality: ContactQuality; factor: number },
        swingType: SwingType
    ): number {
        // Base angle from swing type
        let baseAngle = 15; // degrees

        if (swingType === SwingType.POWER) {
            baseAngle = 25; // Uppercut
        } else if (swingType === SwingType.CONTACT) {
            baseAngle = 10; // Level swing
        } else if (swingType === SwingType.BUNT) {
            baseAngle = -5; // Downward
        }

        // Pitch height affects launch angle
        const pitchHeight = pitchLocation.y;
        const heightFactor = (pitchHeight - 1.15) * 15; // ±15 degrees per unit
        baseAngle += heightFactor;

        // Batter tendencies
        if (profile.flyBallHitter) {
            baseAngle += 10;
        } else if (profile.groundBallHitter) {
            baseAngle -= 10;
        }

        // Contact quality affects consistency
        const qualityVariance = (1 - contactQuality.factor) * 20;
        baseAngle += (Math.random() - 0.5) * qualityVariance;

        // Clamp to realistic range (-20 to 60 degrees)
        return Math.max(-20, Math.min(60, baseAngle));
    }

    /**
     * Calculate spray angle (pull/opposite field)
     */
    private calculateSprayAngle(
        profile: BatterProfile,
        pitch: PitchCharacteristics,
        timingQuality: number,
        swingType: SwingType
    ): number {
        // Perfect timing = pull, late = opposite field
        const handednessMultiplier = profile.stance.handedness === 'right' ? 1 : -1;

        // Timing affects spray
        let sprayAngle = 0;
        if (timingQuality > 0.9) {
            // Perfect timing = pull
            sprayAngle = profile.pullHitter ? -25 : -15;
        } else if (timingQuality > 0.7) {
            // Good timing = slight pull
            sprayAngle = -10;
        } else if (timingQuality > 0.5) {
            // Decent timing = up middle
            sprayAngle = 0;
        } else {
            // Late = opposite field
            sprayAngle = 15;
        }

        // Pitch inside/outside affects spray
        const pitchHorizontal = pitch.horizontalBreak;
        sprayAngle += pitchHorizontal * 0.5;

        // Power swings more likely to pull
        if (swingType === SwingType.POWER) {
            sprayAngle -= 10;
        }

        // Add randomness
        sprayAngle += (Math.random() - 0.5) * 15;

        // Apply handedness
        sprayAngle *= handednessMultiplier;

        // Clamp to realistic range (-45 to 45 degrees)
        return Math.max(-45, Math.min(45, sprayAngle));
    }

    /**
     * Calculate ball spin after contact
     */
    private calculateBallSpin(
        pitch: PitchCharacteristics,
        contactQuality: { quality: ContactQuality; factor: number },
        launchAngle: number
    ): number {
        // Base spin from contact
        const baseSpin = 2000 + Math.abs(launchAngle) * 50;

        // Contact quality affects spin consistency
        const spinVariance = (1 - contactQuality.factor) * 1000;

        return baseSpin + (Math.random() - 0.5) * spinVariance;
    }

    /**
     * Determine hit type from launch angle and exit velocity
     */
    private determineHitType(
        launchAngle: number,
        exitVelocity: number,
        contactQuality: { quality: ContactQuality; factor: number }
    ): HitType {
        if (contactQuality.quality === ContactQuality.FOUL) {
            return HitType.FOUL;
        }

        if (launchAngle < 10) {
            return HitType.GROUND_BALL;
        } else if (launchAngle < 25) {
            return HitType.LINE_DRIVE;
        } else if (launchAngle < 50) {
            if (exitVelocity > 90) {
                return HitType.FLY_BALL;
            } else {
                return HitType.POP_UP;
            }
        } else {
            return HitType.POP_UP;
        }
    }

    /**
     * Calculate ball trajectory
     */
    private calculateTrajectory(
        exitVelocity: number,
        launchAngle: number,
        sprayAngle: number,
        spinRate: number
    ): Vector3[] {
        const trajectory: Vector3[] = [];
        const dt = 0.01; // 10ms timesteps
        const maxTime = 10; // Max 10 seconds

        // Convert to m/s
        const v0 = exitVelocity * 0.44704;
        const launchRad = (launchAngle * Math.PI) / 180;
        const sprayRad = (sprayAngle * Math.PI) / 180;

        // Initial velocity components
        let vx = v0 * Math.cos(launchRad) * Math.sin(sprayRad);
        let vy = v0 * Math.sin(launchRad);
        let vz = v0 * Math.cos(launchRad) * Math.cos(sprayRad);

        // Starting position (home plate)
        let x = 0, y = 1, z = 0;

        const gravity = -9.81;
        const dragCoeff = 0.3;

        for (let t = 0; t < maxTime; t += dt) {
            trajectory.push(new Vector3(x, y, z));

            // Calculate drag
            const v = Math.sqrt(vx * vx + vy * vy + vz * vz);
            const drag = dragCoeff * v;

            // Update velocity
            vx -= vx * drag * dt;
            vy += (gravity - vy * drag) * dt;
            vz -= vz * drag * dt;

            // Update position
            x += vx * dt;
            y += vy * dt;
            z += vz * dt;

            // Stop if hit ground
            if (y <= 0) {
                trajectory.push(new Vector3(x, 0, z));
                break;
            }
        }

        return trajectory;
    }

    /**
     * Calculate hang time
     */
    private calculateHangTime(exitVelocity: number, launchAngle: number): number {
        const v0 = exitVelocity * 0.44704; // Convert to m/s
        const launchRad = (launchAngle * Math.PI) / 180;
        const vy = v0 * Math.sin(launchRad);

        // Simple projectile motion
        const hangTime = (2 * vy) / 9.81;
        return Math.max(0, hangTime);
    }

    /**
     * Check if pitch is in strike zone
     */
    private isPitchInStrikeZone(location: Vector3): boolean {
        return (
            Math.abs(location.x) <= 0.5 &&
            location.y >= 0.5 &&
            location.y <= 1.8 &&
            Math.abs(location.z) <= 0.3
        );
    }

    /**
     * Get pitch zone from location
     */
    private getZoneFromLocation(location: Vector3): PitchZone {
        // Simplified zone detection
        if (!this.isPitchInStrikeZone(location)) {
            if (location.x < -0.5) return PitchZone.BALL_INSIDE;
            if (location.x > 0.5) return PitchZone.BALL_OUTSIDE;
            if (location.y > 1.8) return PitchZone.BALL_HIGH;
            return PitchZone.BALL_LOW;
        }

        if (location.y > 1.4) {
            if (location.x < -0.2) return PitchZone.HIGH_INSIDE;
            if (location.x > 0.2) return PitchZone.HIGH_OUTSIDE;
            return PitchZone.HIGH_MIDDLE;
        } else if (location.y > 0.9) {
            if (location.x < -0.2) return PitchZone.MIDDLE_INSIDE;
            if (location.x > 0.2) return PitchZone.MIDDLE_OUTSIDE;
            return PitchZone.MIDDLE_MIDDLE;
        } else {
            if (location.x < -0.2) return PitchZone.LOW_INSIDE;
            if (location.x > 0.2) return PitchZone.LOW_OUTSIDE;
            return PitchZone.LOW_MIDDLE;
        }
    }

    /**
     * Create miss result
     */
    private createMissResult(): ContactResult {
        return {
            quality: ContactQuality.MISS,
            hitType: HitType.FOUL,
            exitVelocity: 0,
            launchAngle: 0,
            sprayAngle: 0,
            spinRate: 0,
            trajectory: [],
            landingPosition: new Vector3(0, 0, 0),
            hangTime: 0,
            distance: 0
        };
    }

    /**
     * Record swing and miss
     */
    private recordSwingAndMiss(batterId: string): void {
        const stats = this.atBatStats.get(batterId);
        if (stats) {
            stats.swingAndMisses++;
        }
    }

    /**
     * Record contact
     */
    private recordContact(
        batterId: string,
        contactQuality: { quality: ContactQuality; factor: number },
        hitType: HitType,
        exitVelocity: number,
        distance: number
    ): void {
        const stats = this.atBatStats.get(batterId);
        if (!stats) return;

        if (contactQuality.quality === ContactQuality.PERFECT) {
            stats.perfectContacts++;
        }

        if (distance > 400 && hitType === HitType.FLY_BALL) {
            stats.homeRuns++;
            stats.hits++;
        } else if (hitType !== HitType.FOUL && exitVelocity > 60) {
            // Likely a hit (simplified)
            stats.hits++;
        }

        stats.atBats++;
    }

    /**
     * Get batter profile
     */
    public getBatterProfile(batterId: string): BatterProfile | undefined {
        return this.batterProfiles.get(batterId);
    }

    /**
     * Get batting average
     */
    public getBattingAverage(batterId: string): number {
        const stats = this.atBatStats.get(batterId);
        if (!stats || stats.atBats === 0) return 0;
        return stats.hits / stats.atBats;
    }

    /**
     * Get batter statistics
     */
    public getBatterStats(batterId: string) {
        return this.atBatStats.get(batterId);
    }

    /**
     * Dispose batting system
     */
    public dispose(): void {
        this.batterProfiles.clear();
        this.atBatStats.clear();
    }
}
