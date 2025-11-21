import { Scene, Mesh, Vector3, Color3, Color4, InstancedMesh, SolidParticleSystem, StandardMaterial, Observable, Sound, Animation } from '@babylonjs/core';

/**
 * Crowd mood states
 */
export enum CrowdMood {
    EXCITED = 'excited',
    HAPPY = 'happy',
    NEUTRAL = 'neutral',
    DISAPPOINTED = 'disappointed',
    ANGRY = 'angry',
    ANXIOUS = 'anxious',
    ECSTATIC = 'ecstatic',
    DEJECTED = 'dejected'
}

/**
 * Crowd reaction types
 */
export enum CrowdReaction {
    CHEER = 'cheer',
    BOO = 'boo',
    GASP = 'gasp',
    OOH = 'ooh',
    AAH = 'aah',
    APPLAUSE = 'applause',
    STANDING_OVATION = 'standing_ovation',
    WAVE = 'wave',
    CHANT = 'chant',
    WHISTLE = 'whistle',
    JEER = 'jeer',
    SILENCE = 'silence'
}

/**
 * Crowd section types
 */
export enum CrowdSection {
    HOME_DUGOUT = 'home_dugout',
    AWAY_DUGOUT = 'away_dugout',
    BLEACHERS = 'bleachers',
    UPPER_DECK = 'upper_deck',
    LOWER_DECK = 'lower_deck',
    OUTFIELD = 'outfield',
    LUXURY_BOXES = 'luxury_boxes',
    STANDING_ROOM = 'standing_room'
}

/**
 * Individual crowd member
 */
export interface CrowdMember {
    id: number;
    position: Vector3;
    color: Color4;
    size: number;
    section: CrowdSection;
    mood: CrowdMood;
    isStanding: boolean;
    isWaving: boolean;
    animationOffset: number;
    team: 'home' | 'away' | 'neutral';
}

/**
 * Crowd section configuration
 */
export interface CrowdSectionConfig {
    section: CrowdSection;
    position: Vector3;
    rows: number;
    seatsPerRow: number;
    spacing: number;
    elevation: number;
    teamAffiliation: 'home' | 'away' | 'neutral';
    standingAllowed: boolean;
}

/**
 * Crowd behavior parameters
 */
export interface CrowdBehaviorParams {
    reactivity: number;        // 0-1, how quickly crowd reacts
    intensity: number;         // 0-1, how intense reactions are
    uniformity: number;        // 0-1, how synchronized crowd is
    loyalty: number;           // 0-1, team loyalty strength
    volatility: number;        // 0-1, mood swing magnitude
    attentiveness: number;     // 0-1, how engaged crowd is
}

/**
 * Game event affecting crowd
 */
export interface CrowdEvent {
    type: string;
    team: 'home' | 'away';
    intensity: number;
    duration: number;
    triggerReaction: CrowdReaction;
    moodChange: number;        // -1 to 1
}

/**
 * Wave configuration
 */
export interface WaveConfig {
    active: boolean;
    speed: number;
    currentSection: number;
    direction: 'clockwise' | 'counterclockwise';
    participationRate: number;
}

/**
 * Chant configuration
 */
export interface ChantConfig {
    active: boolean;
    text: string;
    rhythm: number[];
    sections: CrowdSection[];
    volume: number;
}

/**
 * Crowd statistics
 */
export interface CrowdStatistics {
    totalCapacity: number;
    attendance: number;
    attendancePercentage: number;
    homeSupport: number;
    awaySupport: number;
    neutralFans: number;
    averageMood: number;
    currentVolume: number;
    standingCount: number;
    waveParticipants: number;
}

/**
 * Advanced Crowd Simulation System
 * Realistic crowd behavior, reactions, waves, chants, and mood dynamics
 */
export class AdvancedCrowdSystem {
    private scene: Scene;

    // Crowd members
    private crowdMembers: CrowdMember[] = [];
    private crowdParticleSystem: SolidParticleSystem | null = null;
    private crowdMeshes: Map<CrowdSection, InstancedMesh[]> = new Map();

    // Sections
    private sections: Map<CrowdSection, CrowdSectionConfig> = new Map();

    // Crowd state
    private overallMood: CrowdMood = CrowdMood.NEUTRAL;
    private moodValue: number = 0.5; // 0-1 scale
    private volumeLevel: number = 0.5; // 0-1 scale
    private energyLevel: number = 0.5; // 0-1 scale

    // Behavior
    private behaviorParams: CrowdBehaviorParams = {
        reactivity: 0.7,
        intensity: 0.7,
        uniformity: 0.6,
        loyalty: 0.8,
        volatility: 0.5,
        attentiveness: 0.7
    };

    // Wave
    private waveConfig: WaveConfig = {
        active: false,
        speed: 2.0,
        currentSection: 0,
        direction: 'clockwise',
        participationRate: 0.7
    };

    // Chants
    private activeChants: ChantConfig[] = [];

    // Event queue
    private eventQueue: CrowdEvent[] = [];
    private currentEvent: CrowdEvent | null = null;

    // Timing
    private time: number = 0;
    private deltaTime: number = 0;

    // Audio
    private crowdAmbience: Sound | null = null;
    private cheerSound: Sound | null = null;
    private booSound: Sound | null = null;
    private gaspSound: Sound | null = null;
    private chantSound: Sound | null = null;

    // Performance
    private instanceCount: number = 0;
    private maxCrowdMembers: number = 50000;
    private lodDistances: number[] = [50, 100, 200, 400];
    private currentLOD: number = 0;

    // Observables
    private onMoodChangeObservable: Observable<CrowdMood> = new Observable();
    private onReactionObservable: Observable<CrowdReaction> = new Observable();
    private onWaveStartObservable: Observable<WaveConfig> = new Observable();
    private onChantStartObservable: Observable<ChantConfig> = new Observable();

    constructor(scene: Scene) {
        this.scene = scene;
        this.initializeSections();
    }

    /**
     * Initialize crowd sections
     */
    private initializeSections(): void {
        // Lower deck behind home dugout
        this.sections.set(CrowdSection.HOME_DUGOUT, {
            section: CrowdSection.HOME_DUGOUT,
            position: new Vector3(50, 5, 100),
            rows: 20,
            seatsPerRow: 50,
            spacing: 0.8,
            elevation: 0.5,
            teamAffiliation: 'home',
            standingAllowed: true
        });

        // Lower deck behind away dugout
        this.sections.set(CrowdSection.AWAY_DUGOUT, {
            section: CrowdSection.AWAY_DUGOUT,
            position: new Vector3(-50, 5, 100),
            rows: 20,
            seatsPerRow: 50,
            spacing: 0.8,
            elevation: 0.5,
            teamAffiliation: 'away',
            standingAllowed: true
        });

        // Outfield bleachers
        this.sections.set(CrowdSection.BLEACHERS, {
            section: CrowdSection.BLEACHERS,
            position: new Vector3(0, 5, -150),
            rows: 25,
            seatsPerRow: 100,
            spacing: 0.7,
            elevation: 0.4,
            teamAffiliation: 'neutral',
            standingAllowed: true
        });

        // Upper deck
        this.sections.set(CrowdSection.UPPER_DECK, {
            section: CrowdSection.UPPER_DECK,
            position: new Vector3(0, 25, 80),
            rows: 30,
            seatsPerRow: 120,
            spacing: 0.75,
            elevation: 0.6,
            teamAffiliation: 'neutral',
            standingAllowed: false
        });

        // Lower deck general seating
        this.sections.set(CrowdSection.LOWER_DECK, {
            section: CrowdSection.LOWER_DECK,
            position: new Vector3(0, 5, 80),
            rows: 25,
            seatsPerRow: 100,
            spacing: 0.8,
            elevation: 0.5,
            teamAffiliation: 'neutral',
            standingAllowed: true
        });

        // Outfield seats
        this.sections.set(CrowdSection.OUTFIELD, {
            section: CrowdSection.OUTFIELD,
            position: new Vector3(0, 3, -120),
            rows: 15,
            seatsPerRow: 80,
            spacing: 0.7,
            elevation: 0.3,
            teamAffiliation: 'neutral',
            standingAllowed: true
        });
    }

    /**
     * Generate crowd
     */
    public generateCrowd(attendance: number = 30000): void {
        this.crowdMembers = [];

        let remainingAttendance = attendance;
        const sectionsArray = Array.from(this.sections.values());

        for (const config of sectionsArray) {
            const capacity = config.rows * config.seatsPerRow;
            const sectionAttendance = Math.min(remainingAttendance, capacity);
            remainingAttendance -= sectionAttendance;

            this.generateSectionCrowd(config, sectionAttendance);

            if (remainingAttendance <= 0) break;
        }

        // Create visual representation
        this.createCrowdVisuals();
    }

    /**
     * Generate crowd for specific section
     */
    private generateSectionCrowd(config: CrowdSectionConfig, attendance: number): void {
        const capacity = config.rows * config.seatsPerRow;
        const fillRate = attendance / capacity;

        let memberId = this.crowdMembers.length;

        for (let row = 0; row < config.rows; row++) {
            for (let seat = 0; seat < config.seatsPerRow; seat++) {
                // Skip seats based on fill rate
                if (Math.random() > fillRate) continue;

                const x = config.position.x + (seat - config.seatsPerRow / 2) * config.spacing;
                const y = config.position.y + row * config.elevation;
                const z = config.position.z;

                // Determine team affiliation
                let team: 'home' | 'away' | 'neutral' = config.teamAffiliation;
                if (team === 'neutral') {
                    const rand = Math.random();
                    if (rand < 0.5) team = 'home';
                    else if (rand < 0.9) team = 'away';
                }

                // Determine color based on team
                let color: Color4;
                if (team === 'home') {
                    color = new Color4(0.8, 0.1, 0.1, 1); // Red
                } else if (team === 'away') {
                    color = new Color4(0.1, 0.1, 0.8, 1); // Blue
                } else {
                    color = new Color4(0.5, 0.5, 0.5, 1); // Gray
                }

                // Add some color variation
                color.r += (Math.random() - 0.5) * 0.2;
                color.g += (Math.random() - 0.5) * 0.2;
                color.b += (Math.random() - 0.5) * 0.2;

                const member: CrowdMember = {
                    id: memberId++,
                    position: new Vector3(x, y, z),
                    color: color,
                    size: 0.4 + Math.random() * 0.2,
                    section: config.section,
                    mood: CrowdMood.NEUTRAL,
                    isStanding: false,
                    isWaving: false,
                    animationOffset: Math.random() * Math.PI * 2,
                    team: team
                };

                this.crowdMembers.push(member);
            }
        }
    }

    /**
     * Create crowd visuals using instanced meshes
     */
    private createCrowdVisuals(): void {
        // Create solid particle system for efficient crowd rendering
        const crowdSPS = new SolidParticleSystem('crowdSPS', this.scene, {
            updatable: true,
            isPickable: false
        });

        // Create base mesh for crowd members
        const baseMesh = Mesh.CreateBox('crowdMember', 1, this.scene);
        baseMesh.scaling = new Vector3(0.4, 0.8, 0.4);

        // Add particles
        crowdSPS.addShape(baseMesh, this.crowdMembers.length);
        const mesh = crowdSPS.buildMesh();

        // Initialize particle positions and colors
        crowdSPS.initParticles = () => {
            for (let i = 0; i < this.crowdMembers.length; i++) {
                const particle = crowdSPS.particles[i];
                const member = this.crowdMembers[i];

                particle.position = member.position.clone();
                particle.color = member.color;
                particle.scaling = new Vector3(member.size, member.size, member.size);
            }
        };

        // Update particles
        crowdSPS.updateParticle = (particle) => {
            const member = this.crowdMembers[particle.idx];

            // Apply standing animation
            if (member.isStanding) {
                particle.scaling.y = member.size * 1.5;
            } else {
                particle.scaling.y = member.size;
            }

            // Apply waving animation
            if (member.isWaving) {
                const waveOffset = Math.sin(this.time * 3 + member.animationOffset) * 0.2;
                particle.position.x = member.position.x + waveOffset;
            } else {
                particle.position.x = member.position.x;
            }

            return particle;
        };

        crowdSPS.initParticles();
        crowdSPS.setParticles();

        this.crowdParticleSystem = crowdSPS;

        // Clean up base mesh
        baseMesh.dispose();

        this.instanceCount = this.crowdMembers.length;
    }

    /**
     * Trigger crowd reaction
     */
    public triggerReaction(reaction: CrowdReaction, team: 'home' | 'away', intensity: number = 1.0): void {
        const event: CrowdEvent = {
            type: reaction,
            team,
            intensity,
            duration: this.getReactionDuration(reaction),
            triggerReaction: reaction,
            moodChange: this.getReactionMoodChange(reaction, team)
        };

        this.eventQueue.push(event);
        this.processEvent(event);

        // Notify observers
        this.onReactionObservable.notifyObservers(reaction);
    }

    /**
     * Process crowd event
     */
    private processEvent(event: CrowdEvent): void {
        this.currentEvent = event;

        // Update crowd members based on event
        for (const member of this.crowdMembers) {
            // Skip if member doesn't support this team
            if (member.team !== event.team && member.team !== 'neutral') {
                continue;
            }

            // Determine if member reacts based on reactivity and uniformity
            const reactChance = this.behaviorParams.reactivity * this.behaviorParams.uniformity;
            if (Math.random() > reactChance) continue;

            // Apply reaction
            switch (event.triggerReaction) {
                case CrowdReaction.STANDING_OVATION:
                    member.isStanding = true;
                    member.isWaving = true;
                    break;

                case CrowdReaction.CHEER:
                case CrowdReaction.APPLAUSE:
                    member.isWaving = true;
                    break;

                case CrowdReaction.BOO:
                case CrowdReaction.JEER:
                    member.isWaving = Math.random() < 0.3;
                    break;

                case CrowdReaction.GASP:
                    member.isStanding = Math.random() < 0.5;
                    break;
            }

            // Update mood
            const moodChange = event.moodChange * event.intensity * this.behaviorParams.intensity;
            this.updateMemberMood(member, moodChange);
        }

        // Update overall mood
        this.updateOverallMood(event.moodChange * event.intensity);

        // Play audio
        this.playCrowdSound(event.triggerReaction, event.intensity);

        // Schedule reaction end
        setTimeout(() => {
            this.endReaction(event);
        }, event.duration * 1000);
    }

    /**
     * End crowd reaction
     */
    private endReaction(event: CrowdEvent): void {
        for (const member of this.crowdMembers) {
            // Reset reactions
            if (event.triggerReaction !== CrowdReaction.STANDING_OVATION) {
                member.isStanding = false;
            }
            member.isWaving = false;
        }

        this.currentEvent = null;
    }

    /**
     * Update member mood
     */
    private updateMemberMood(member: CrowdMember, moodChange: number): void {
        // Convert current mood to value
        let moodValue = this.moodToValue(member.mood);

        // Apply change with volatility
        moodValue += moodChange * this.behaviorParams.volatility;
        moodValue = Math.max(-1, Math.min(1, moodValue));

        // Convert back to mood
        member.mood = this.valueToMood(moodValue);
    }

    /**
     * Update overall crowd mood
     */
    private updateOverallMood(moodChange: number): void {
        this.moodValue += moodChange * this.behaviorParams.volatility;
        this.moodValue = Math.max(0, Math.min(1, this.moodValue));

        const newMood = this.valueToMood(this.moodValue * 2 - 1); // Scale to -1 to 1

        if (newMood !== this.overallMood) {
            this.overallMood = newMood;
            this.onMoodChangeObservable.notifyObservers(newMood);
        }
    }

    /**
     * Convert mood to numeric value
     */
    private moodToValue(mood: CrowdMood): number {
        switch (mood) {
            case CrowdMood.ECSTATIC: return 1.0;
            case CrowdMood.EXCITED: return 0.7;
            case CrowdMood.HAPPY: return 0.4;
            case CrowdMood.NEUTRAL: return 0.0;
            case CrowdMood.DISAPPOINTED: return -0.4;
            case CrowdMood.ANGRY: return -0.7;
            case CrowdMood.DEJECTED: return -1.0;
            case CrowdMood.ANXIOUS: return -0.2;
            default: return 0.0;
        }
    }

    /**
     * Convert numeric value to mood
     */
    private valueToMood(value: number): CrowdMood {
        if (value >= 0.85) return CrowdMood.ECSTATIC;
        if (value >= 0.5) return CrowdMood.EXCITED;
        if (value >= 0.2) return CrowdMood.HAPPY;
        if (value >= -0.2) return CrowdMood.NEUTRAL;
        if (value >= -0.5) return CrowdMood.DISAPPOINTED;
        if (value >= -0.85) return CrowdMood.ANGRY;
        return CrowdMood.DEJECTED;
    }

    /**
     * Get reaction duration
     */
    private getReactionDuration(reaction: CrowdReaction): number {
        switch (reaction) {
            case CrowdReaction.STANDING_OVATION: return 15;
            case CrowdReaction.CHEER: return 5;
            case CrowdReaction.BOO: return 4;
            case CrowdReaction.GASP: return 2;
            case CrowdReaction.APPLAUSE: return 6;
            case CrowdReaction.WAVE: return 20;
            case CrowdReaction.CHANT: return 10;
            default: return 3;
        }
    }

    /**
     * Get reaction mood change
     */
    private getReactionMoodChange(reaction: CrowdReaction, team: 'home' | 'away'): number {
        const multiplier = team === 'home' ? 1 : -0.5; // Home events affect more positively

        switch (reaction) {
            case CrowdReaction.STANDING_OVATION: return 0.3 * multiplier;
            case CrowdReaction.CHEER: return 0.2 * multiplier;
            case CrowdReaction.BOO: return -0.2;
            case CrowdReaction.GASP: return -0.1;
            case CrowdReaction.APPLAUSE: return 0.15 * multiplier;
            case CrowdReaction.JEER: return -0.15;
            default: return 0;
        }
    }

    /**
     * Start the wave
     */
    public startWave(): void {
        this.waveConfig.active = true;
        this.waveConfig.currentSection = 0;

        this.onWaveStartObservable.notifyObservers(this.waveConfig);
    }

    /**
     * Update wave animation
     */
    private updateWave(deltaTime: number): void {
        if (!this.waveConfig.active) return;

        // Progress wave through sections
        const sectionsArray = Array.from(this.sections.keys());
        const currentSection = sectionsArray[Math.floor(this.waveConfig.currentSection) % sectionsArray.length];

        // Make members in current section stand and wave
        for (const member of this.crowdMembers) {
            if (member.section === currentSection) {
                if (Math.random() < this.waveConfig.participationRate) {
                    member.isStanding = true;
                    member.isWaving = true;

                    // Schedule sit down
                    setTimeout(() => {
                        member.isStanding = false;
                        member.isWaving = false;
                    }, 1000);
                }
            }
        }

        // Progress to next section
        this.waveConfig.currentSection += this.waveConfig.speed * deltaTime;

        // Complete wave after full rotation
        if (this.waveConfig.currentSection >= sectionsArray.length) {
            this.waveConfig.active = false;
        }
    }

    /**
     * Start chant
     */
    public startChant(text: string, sections: CrowdSection[], volume: number = 0.8): void {
        const chant: ChantConfig = {
            active: true,
            text,
            rhythm: [1, 0.5, 1, 0.5], // Simple rhythm pattern
            sections,
            volume
        };

        this.activeChants.push(chant);
        this.onChantStartObservable.notifyObservers(chant);

        // Auto-stop after duration
        setTimeout(() => {
            this.stopChant(chant);
        }, 15000);
    }

    /**
     * Stop chant
     */
    private stopChant(chant: ChantConfig): void {
        const index = this.activeChants.indexOf(chant);
        if (index >= 0) {
            this.activeChants.splice(index, 1);
        }
    }

    /**
     * Play crowd sound
     */
    private playCrowdSound(reaction: CrowdReaction, intensity: number): void {
        // Sound playback would integrate with audio system
        this.volumeLevel = intensity;
    }

    /**
     * Set behavior parameters
     */
    public setBehaviorParams(params: Partial<CrowdBehaviorParams>): void {
        this.behaviorParams = { ...this.behaviorParams, ...params };
    }

    /**
     * Get crowd statistics
     */
    public getStatistics(): CrowdStatistics {
        const homeFans = this.crowdMembers.filter(m => m.team === 'home').length;
        const awayFans = this.crowdMembers.filter(m => m.team === 'away').length;
        const neutralFans = this.crowdMembers.filter(m => m.team === 'neutral').length;
        const standingCount = this.crowdMembers.filter(m => m.isStanding).length;
        const wavingCount = this.crowdMembers.filter(m => m.isWaving).length;

        let totalCapacity = 0;
        for (const config of this.sections.values()) {
            totalCapacity += config.rows * config.seatsPerRow;
        }

        return {
            totalCapacity,
            attendance: this.crowdMembers.length,
            attendancePercentage: (this.crowdMembers.length / totalCapacity) * 100,
            homeSupport: (homeFans / this.crowdMembers.length) * 100,
            awaySupport: (awayFans / this.crowdMembers.length) * 100,
            neutralFans: (neutralFans / this.crowdMembers.length) * 100,
            averageMood: this.moodValue,
            currentVolume: this.volumeLevel,
            standingCount,
            waveParticipants: wavingCount
        };
    }

    /**
     * Update crowd system
     */
    public update(deltaTime: number): void {
        this.time += deltaTime;
        this.deltaTime = deltaTime;

        // Update wave
        if (this.waveConfig.active) {
            this.updateWave(deltaTime);
        }

        // Update particle system
        if (this.crowdParticleSystem) {
            this.crowdParticleSystem.setParticles();
        }

        // Gradually return to neutral mood
        if (this.moodValue > 0.5) {
            this.moodValue -= deltaTime * 0.05;
        } else if (this.moodValue < 0.5) {
            this.moodValue += deltaTime * 0.05;
        }

        // Decay volume
        this.volumeLevel *= Math.pow(0.95, deltaTime * 60);

        // Decay energy
        this.energyLevel *= Math.pow(0.98, deltaTime * 60);
    }

    /**
     * Subscribe to mood changes
     */
    public onMoodChange(callback: (mood: CrowdMood) => void): void {
        this.onMoodChangeObservable.add(callback);
    }

    /**
     * Subscribe to reactions
     */
    public onReaction(callback: (reaction: CrowdReaction) => void): void {
        this.onReactionObservable.add(callback);
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        if (this.crowdParticleSystem) {
            this.crowdParticleSystem.dispose();
        }

        for (const meshes of this.crowdMeshes.values()) {
            for (const mesh of meshes) {
                mesh.dispose();
            }
        }

        this.crowdMembers = [];
        this.crowdMeshes.clear();
        this.sections.clear();

        this.onMoodChangeObservable.clear();
        this.onReactionObservable.clear();
        this.onWaveStartObservable.clear();
        this.onChantStartObservable.clear();
    }
}
