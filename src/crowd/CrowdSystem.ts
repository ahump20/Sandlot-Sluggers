/**
 * Comprehensive Crowd and Atmosphere System for Sandlot Sluggers
 * Provides dynamic crowd simulation and stadium atmosphere
 *
 * Features:
 * - Individual crowd member simulation with behavior
 * - Crowd density and attendance management
 * - Dynamic crowd reactions to game events
 * - Wave mechanics and coordinated crowd movements
 * - Chants and cheers system
 * - Crowd noise levels based on game tension
 * - Home/away crowd support dynamics
 * - VIP and celebrity crowd members
 * - Mascot integration and animations
 * - Vendors and stadium staff
 * - Weather-based crowd behavior
 * - Time-based attendance patterns (early/late arrivals)
 * - Crowd audio spatialization
 * - Camera flashes on big moments
 * - Standing ovations
 */

import { Scene } from '@babylonjs/core/scene';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import { Vector3, Vector2 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Observable } from '@babylonjs/core/Misc/observable';
import { Sound } from '@babylonjs/core/Audio/sound';

export enum CrowdSection {
    HOME_INFIELD = 'home_infield',
    HOME_OUTFIELD = 'home_outfield',
    AWAY_INFIELD = 'away_infield',
    AWAY_OUTFIELD = 'away_outfield',
    BLEACHERS_LEFT = 'bleachers_left',
    BLEACHERS_RIGHT = 'bleachers_right',
    BLEACHERS_CENTER = 'bleachers_center',
    LUXURY_BOXES = 'luxury_boxes',
    CLUB_SEATS = 'club_seats',
    STANDING_ROOM = 'standing_room'
}

export enum CrowdBehavior {
    SITTING = 'sitting',
    STANDING = 'standing',
    CHEERING = 'cheering',
    BOOING = 'booing',
    WAVING = 'waving',
    EATING = 'eating',
    DRINKING = 'drinking',
    TAKING_PHOTO = 'taking_photo',
    USING_PHONE = 'using_phone',
    LEAVING = 'leaving',
    ARRIVING = 'arriving',
    STRETCHING = 'stretching',
    HIGH_FIVING = 'high_fiving'
}

export enum CrowdMood {
    EXCITED = 'excited',
    TENSE = 'tense',
    DISAPPOINTED = 'disappointed',
    BORED = 'bored',
    ANGRY = 'angry',
    CELEBRATING = 'celebrating',
    HOPEFUL = 'hopeful',
    NERVOUS = 'nervous'
}

export enum ChantType {
    LETS_GO_TEAM = 'lets_go_team',
    DEFENSE = 'defense',
    CHARGE = 'charge',
    WE_WILL_ROCK_YOU = 'we_will_rock_you',
    TAKE_ME_OUT = 'take_me_out',
    PLAYER_NAME = 'player_name',
    CUSTOM = 'custom',
    UMPIRE_CHANT = 'umpire_chant',
    RIVAL_TAUNT = 'rival_taunt'
}

export enum CrowdEventResponse {
    NONE = 'none',
    MILD_APPLAUSE = 'mild_applause',
    STRONG_APPLAUSE = 'strong_applause',
    CHEERING = 'cheering',
    ROARING = 'roaring',
    BOOING = 'booing',
    GASPING = 'gasping',
    GROANING = 'groaning',
    SILENCE = 'silence',
    STANDING_OVATION = 'standing_ovation'
}

export interface CrowdMember {
    id: string;
    section: CrowdSection;
    seat: Vector3;
    mesh: InstancedMesh;
    behavior: CrowdBehavior;
    mood: CrowdMood;
    teamAffiliation: 'home' | 'away' | 'neutral';
    enthusiasm: number; // 0-100
    isVIP: boolean;
    isCelebrity: boolean;
    hasSign: boolean;
    signText?: string;
    wearingTeamGear: boolean;
    foodItem?: string;
    drinkItem?: string;
}

export interface CrowdSection Data {
    section: CrowdSection;
    capacity: number;
    currentOccupancy: number;
    members: CrowdMember[];
    homeTeamPercentage: number; // 0-100
    averageEnthusiasm: number;
    dominantMood: CrowdMood;
    isDoingWave: boolean;
    isChanting: boolean;
    currentChant?: ChantType;
}

export interface WaveState {
    isActive: boolean;
    currentSection: number;
    speed: number;
    direction: 'clockwise' | 'counterclockwise';
    participation: number; // 0-100
    startTime: number;
}

export interface ChantData {
    type: ChantType;
    text: string;
    rhythm: number[]; // Beat pattern in milliseconds
    duration: number;
    volume: number;
    sections: CrowdSection[];
    startTime: number;
}

export interface AtmosphereConfig {
    baseNoiseLevel: number; // 0-100
    reactionIntensity: number; // 0-100, how strongly crowd reacts
    homeFieldAdvantage: number; // 0-100
    rivalryBonus: number; // 0-100
    weatherEffect: number; // 0-100, how weather affects crowd
    attendancePercentage: number; // 0-100
}

export interface MascotData {
    id: string;
    name: string;
    teamAffiliation: 'home' | 'away';
    mesh: Mesh;
    position: Vector3;
    isActive: boolean;
    currentAnimation: string;
    routineSchedule: MascotRoutine[];
}

export interface MascotRoutine {
    inning: number;
    duration: number;
    animation: string;
    location: Vector3;
    interactWithCrowd: boolean;
}

export interface VendorData {
    id: string;
    type: 'food' | 'drink' | 'merchandise';
    item: string;
    section: CrowdSection;
    position: Vector3;
    mesh: Mesh;
    isActive: boolean;
    salesCount: number;
}

export interface CrowdNoiseLayer {
    type: 'ambient' | 'reaction' | 'chant' | 'individual';
    sound: Sound;
    baseVolume: number;
    currentVolume: number;
    spatial: boolean;
    position?: Vector3;
}

export class CrowdSystem {
    private scene: Scene;
    private sections: Map<CrowdSection, CrowdSectionData>;
    private totalCapacity: number;
    private currentAttendance: number;
    private atmosphereConfig: AtmosphereConfig;

    // Wave mechanics
    private waveState: WaveState;
    private waveSectionOrder: CrowdSection[];

    // Chant system
    private activeChants: ChantData[];
    private chantCooldowns: Map<ChantType, number>;

    // Mascots and vendors
    private mascots: Map<string, MascotData>;
    private vendors: VendorData[];

    // Audio
    private noiseSlayers: Map<string, CrowdNoiseLayer>;
    private currentNoiseLevel: number;
    private targetNoiseLevel: number;

    // Game state awareness
    private homeTeam: string;
    private awayTeam: string;
    private homeScore: number;
    private awayScore: number;
    private currentInning: number;
    private gameStarted: boolean;
    private isCloseGame: boolean;
    private isRivalry: boolean;

    // Visual effects
    private cameraFlashes: Vector3[];
    private flashDuration: number;

    // Observables for events
    public onWaveStarted: Observable<WaveState>;
    public onChantStarted: Observable<ChantData>;
    public onCrowdReaction: Observable<CrowdEventResponse>;
    public onMascotPerformance: Observable<MascotData>;
    public onAttendanceChanged: Observable<number>;

    constructor(scene: Scene, stadiumCapacity: number) {
        this.scene = scene;
        this.sections = new Map();
        this.totalCapacity = stadiumCapacity;
        this.currentAttendance = 0;

        this.atmosphereConfig = {
            baseNoiseLevel: 50,
            reactionIntensity: 70,
            homeFieldAdvantage: 60,
            rivalryBonus: 0,
            weatherEffect: 50,
            attendancePercentage: 75
        };

        this.waveState = {
            isActive: false,
            currentSection: 0,
            speed: 1000, // ms per section
            direction: 'clockwise',
            participation: 80,
            startTime: 0
        };

        this.waveSectionOrder = [
            CrowdSection.HOME_INFIELD,
            CrowdSection.HOME_OUTFIELD,
            CrowdSection.BLEACHERS_LEFT,
            CrowdSection.AWAY_OUTFIELD,
            CrowdSection.AWAY_INFIELD,
            CrowdSection.BLEACHERS_RIGHT
        ];

        this.activeChants = [];
        this.chantCooldowns = new Map();

        this.mascots = new Map();
        this.vendors = [];

        this.noiseSlayers = new Map();
        this.currentNoiseLevel = 30;
        this.targetNoiseLevel = 30;

        this.homeTeam = '';
        this.awayTeam = '';
        this.homeScore = 0;
        this.awayScore = 0;
        this.currentInning = 1;
        this.gameStarted = false;
        this.isCloseGame = false;
        this.isRivalry = false;

        this.cameraFlashes = [];
        this.flashDuration = 200; // ms

        this.onWaveStarted = new Observable();
        this.onChantStarted = new Observable();
        this.onCrowdReaction = new Observable();
        this.onMascotPerformance = new Observable();
        this.onAttendanceChanged = new Observable();

        this.initializeSections();
        this.initializeAudioLayers();
    }

    private initializeSections(): void {
        const sectionConfigs = [
            { section: CrowdSection.HOME_INFIELD, capacity: 8000, homePercent: 90 },
            { section: CrowdSection.HOME_OUTFIELD, capacity: 6000, homePercent: 85 },
            { section: CrowdSection.AWAY_INFIELD, capacity: 8000, homePercent: 20 },
            { section: CrowdSection.AWAY_OUTFIELD, capacity: 6000, homePercent: 25 },
            { section: CrowdSection.BLEACHERS_LEFT, capacity: 3000, homePercent: 70 },
            { section: CrowdSection.BLEACHERS_RIGHT, capacity: 3000, homePercent: 70 },
            { section: CrowdSection.BLEACHERS_CENTER, capacity: 4000, homePercent: 60 },
            { section: CrowdSection.LUXURY_BOXES, capacity: 1000, homePercent: 75 },
            { section: CrowdSection.CLUB_SEATS, capacity: 2000, homePercent: 80 },
            { section: CrowdSection.STANDING_ROOM, capacity: 1000, homePercent: 65 }
        ];

        for (const config of sectionConfigs) {
            const sectionData: CrowdSectionData = {
                section: config.section,
                capacity: config.capacity,
                currentOccupancy: 0,
                members: [],
                homeTeamPercentage: config.homePercent,
                averageEnthusiasm: 50,
                dominantMood: CrowdMood.HOPEFUL,
                isDoingWave: false,
                isChanting: false
            };
            this.sections.set(config.section, sectionData);
        }
    }

    private initializeAudioLayers(): void {
        // Ambient crowd noise
        this.noiseLayers.set('ambient', {
            type: 'ambient',
            sound: new Sound('crowd_ambient', 'sounds/crowd_ambient.mp3', this.scene, null, {
                loop: true,
                autoplay: true
            }),
            baseVolume: 0.5,
            currentVolume: 0.5,
            spatial: false
        });

        // Reaction sounds
        this.noiseLayers.set('reaction', {
            type: 'reaction',
            sound: new Sound('crowd_reaction', 'sounds/crowd_reaction.mp3', this.scene, null, {
                loop: false
            }),
            baseVolume: 0.8,
            currentVolume: 0,
            spatial: false
        });

        // Chant sounds
        this.noiseLayers.set('chant', {
            type: 'chant',
            sound: new Sound('crowd_chant', 'sounds/crowd_chant.mp3', this.scene, null, {
                loop: true
            }),
            baseVolume: 0.6,
            currentVolume: 0,
            spatial: false
        });
    }

    public populateStadium(attendancePercentage: number): void {
        this.currentAttendance = 0;

        for (const [section, sectionData] of this.sections.entries()) {
            const targetOccupancy = Math.floor(sectionData.capacity * (attendancePercentage / 100));
            this.populateSection(section, targetOccupancy);
        }

        this.onAttendanceChanged.notifyObservers(this.currentAttendance);
    }

    private populateSection(section: CrowdSection, count: number): void {
        const sectionData = this.sections.get(section);
        if (!sectionData) return;

        for (let i = 0; i < count; i++) {
            const member = this.createCrowdMember(section, sectionData);
            sectionData.members.push(member);
        }

        sectionData.currentOccupancy = count;
        this.currentAttendance += count;
    }

    private createCrowdMember(section: CrowdSection, sectionData: CrowdSectionData): CrowdMember {
        const isHomeAffiliated = Math.random() * 100 < sectionData.homeTeamPercentage;
        const teamAffiliation = isHomeAffiliated ? 'home' : Math.random() > 0.9 ? 'away' : 'neutral';

        const member: CrowdMember = {
            id: `crowd_${section}_${Date.now()}_${Math.random()}`,
            section,
            seat: this.getRandomSeatPosition(section),
            mesh: null as any, // Would be set to actual instanced mesh
            behavior: CrowdBehavior.SITTING,
            mood: CrowdMood.HOPEFUL,
            teamAffiliation,
            enthusiasm: 50 + Math.random() * 50,
            isVIP: section === CrowdSection.LUXURY_BOXES || (section === CrowdSection.CLUB_SEATS && Math.random() > 0.7),
            isCelebrity: Math.random() > 0.999, // 0.1% chance
            hasSign: Math.random() > 0.95,
            signText: Math.random() > 0.5 ? this.generateSignText() : undefined,
            wearingTeamGear: teamAffiliation !== 'neutral' && Math.random() > 0.3
        };

        return member;
    }

    private getRandomSeatPosition(section: CrowdSection): Vector3 {
        // This would calculate actual seat positions based on section
        // Placeholder implementation
        const radius = 100;
        const angle = Math.random() * Math.PI * 2;
        const height = 10 + Math.random() * 30;
        return new Vector3(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
    }

    private generateSignText(): string {
        const signs = [
            'WE LOVE OUR TEAM!',
            'GO TEAM GO!',
            '#1 FAN',
            'HOME RUN TIME!',
            'DEFENSE! DEFENSE!',
            'MVP! MVP!',
            'WORLD SERIES HERE WE COME!',
            'SIGN MY BALL!',
            'IT\'S MY BIRTHDAY!',
            'FIRST GAME!'
        ];
        return signs[Math.floor(Math.random() * signs.length)];
    }

    public reactToEvent(event: string, favoringTeam: 'home' | 'away', intensity: number): void {
        const response = this.determineResponse(event, favoringTeam, intensity);

        // Update crowd behavior
        this.updateCrowdBehavior(response, favoringTeam);

        // Play audio response
        this.playAudioResponse(response, intensity);

        // Camera flashes for big moments
        if (intensity > 8) {
            this.triggerCameraFlashes(response);
        }

        // Possible spontaneous chant
        if (intensity > 7 && Math.random() > 0.7) {
            this.startChant(this.selectAppropriateChant(event, favoringTeam));
        }

        // Standing ovation check
        if (response === CrowdEventResponse.STANDING_OVATION) {
            this.triggerStandingOvation(favoringTeam);
        }

        this.onCrowdReaction.notifyObservers(response);
    }

    private determineResponse(event: string, favoringTeam: 'home' | 'away', intensity: number): CrowdEventResponse {
        if (intensity >= 10) {
            return CrowdEventResponse.STANDING_OVATION;
        } else if (intensity >= 8) {
            return CrowdEventResponse.ROARING;
        } else if (intensity >= 6) {
            return CrowdEventResponse.CHEERING;
        } else if (intensity >= 4) {
            return CrowdEventResponse.STRONG_APPLAUSE;
        } else if (intensity >= 2) {
            return CrowdEventResponse.MILD_APPLAUSE;
        } else if (intensity < 0) {
            return CrowdEventResponse.BOOING;
        } else {
            return CrowdEventResponse.NONE;
        }
    }

    private updateCrowdBehavior(response: CrowdEventResponse, favoringTeam: 'home' | 'away'): void {
        for (const sectionData of this.sections.values()) {
            const sectionSupportsTeam = (favoringTeam === 'home' && sectionData.homeTeamPercentage > 50) ||
                                       (favoringTeam === 'away' && sectionData.homeTeamPercentage < 50);

            for (const member of sectionData.members) {
                if ((member.teamAffiliation === favoringTeam) ||
                    (member.teamAffiliation === 'neutral' && sectionSupportsTeam)) {

                    switch (response) {
                        case CrowdEventResponse.ROARING:
                        case CrowdEventResponse.STANDING_OVATION:
                            member.behavior = CrowdBehavior.CHEERING;
                            member.mood = CrowdMood.CELEBRATING;
                            break;
                        case CrowdEventResponse.CHEERING:
                            member.behavior = CrowdBehavior.STANDING;
                            member.mood = CrowdMood.EXCITED;
                            break;
                        case CrowdEventResponse.BOOING:
                            member.behavior = CrowdBehavior.BOOING;
                            member.mood = CrowdMood.ANGRY;
                            break;
                    }
                }
            }
        }
    }

    private playAudioResponse(response: CrowdEventResponse, intensity: number): void {
        const reactionLayer = this.noiseLayers.get('reaction');
        if (!reactionLayer) return;

        const volume = Math.min(1.0, intensity / 10);
        reactionLayer.sound.setVolume(volume);
        reactionLayer.sound.play();

        // Update ambient noise level
        this.targetNoiseLevel = 30 + (intensity * 7);
    }

    private triggerCameraFlashes(response: CrowdEventResponse): void {
        const flashCount = Math.floor(Math.random() * 50) + 20;

        for (let i = 0; i < flashCount; i++) {
            const section = Array.from(this.sections.keys())[Math.floor(Math.random() * this.sections.size)];
            const sectionData = this.sections.get(section)!;

            if (sectionData.members.length > 0) {
                const randomMember = sectionData.members[Math.floor(Math.random() * sectionData.members.length)];
                this.cameraFlashes.push(randomMember.seat.clone());
            }
        }
    }

    public startWave(): boolean {
        if (this.waveState.isActive) return false;

        // Wave more likely when crowd is engaged
        const averageEnthusiasm = this.calculateAverageEnthusiasm();
        if (averageEnthusiasm < 60) return false;

        this.waveState = {
            isActive: true,
            currentSection: 0,
            speed: 800,
            direction: 'clockwise',
            participation: averageEnthusiasm,
            startTime: Date.now()
        };

        this.onWaveStarted.notifyObservers(this.waveState);
        return true;
    }

    private calculateAverageEnthusiasm(): number {
        let total = 0;
        let count = 0;

        for (const sectionData of this.sections.values()) {
            total += sectionData.averageEnthusiasm;
            count++;
        }

        return count > 0 ? total / count : 0;
    }

    public startChant(chantType: ChantType): void {
        // Check cooldown
        const lastUse = this.chantCooldowns.get(chantType) || 0;
        if (Date.now() - lastUse < 60000) return; // 1 minute cooldown

        const chantData: ChantData = {
            type: chantType,
            text: this.getChantText(chantType),
            rhythm: this.getChantRhythm(chantType),
            duration: 15000, // 15 seconds
            volume: 0.7,
            sections: this.selectChantingSections(),
            startTime: Date.now()
        };

        this.activeChants.push(chantData);
        this.chantCooldowns.set(chantType, Date.now());

        // Start chant audio
        const chantLayer = this.noiseLayers.get('chant');
        if (chantLayer) {
            chantLayer.sound.play();
        }

        this.onChantStarted.notifyObservers(chantData);
    }

    private getChantText(chantType: ChantType): string {
        switch (chantType) {
            case ChantType.LETS_GO_TEAM:
                return `Let's go ${this.homeTeam}!`;
            case ChantType.DEFENSE:
                return 'DEFENSE! DEFENSE!';
            case ChantType.CHARGE:
                return 'CHARGE!';
            case ChantType.WE_WILL_ROCK_YOU:
                return 'We will, we will, rock you!';
            case ChantType.TAKE_ME_OUT:
                return 'Take me out to the ball game...';
            default:
                return 'GO TEAM GO!';
        }
    }

    private getChantRhythm(chantType: ChantType): number[] {
        // Return beat pattern in milliseconds
        switch (chantType) {
            case ChantType.LETS_GO_TEAM:
                return [500, 500, 500];
            case ChantType.DEFENSE:
                return [600, 600];
            case ChantType.CHARGE:
                return [400, 400, 400, 1000];
            default:
                return [500, 500, 500, 500];
        }
    }

    private selectChantingSections(): CrowdSection[] {
        // Home sections are more likely to chant
        const sections: CrowdSection[] = [];

        for (const [section, data] of this.sections.entries()) {
            if (data.homeTeamPercentage > 60) {
                sections.push(section);
            }
        }

        return sections;
    }

    private selectAppropriateChant(event: string, favoringTeam: 'home' | 'away'): ChantType {
        if (favoringTeam === 'home') {
            return ChantType.LETS_GO_TEAM;
        } else {
            return ChantType.DEFENSE;
        }
    }

    private triggerStandingOvation(favoringTeam: 'home' | 'away'): void {
        for (const sectionData of this.sections.values()) {
            for (const member of sectionData.members) {
                if (member.teamAffiliation === favoringTeam ||
                    member.teamAffiliation === 'neutral') {
                    member.behavior = CrowdBehavior.STANDING;
                    member.mood = CrowdMood.CELEBRATING;
                }
            }
        }
    }

    public addMascot(mascot: MascotData): void {
        this.mascots.set(mascot.id, mascot);
    }

    public triggerMascotPerformance(mascotId: string, routineIndex: number): void {
        const mascot = this.mascots.get(mascotId);
        if (!mascot || routineIndex >= mascot.routineSchedule.length) return;

        const routine = mascot.routineSchedule[routineIndex];
        mascot.currentAnimation = routine.animation;
        mascot.position = routine.location;
        mascot.isActive = true;

        this.onMascotPerformance.notifyObservers(mascot);

        // Mascot performance ends after duration
        setTimeout(() => {
            mascot.isActive = false;
        }, routine.duration);
    }

    public addVendor(vendor: VendorData): void {
        this.vendors.push(vendor);
    }

    public updateGameState(homeScore: number, awayScore: number, inning: number): void {
        this.homeScore = homeScore;
        this.awayScore = awayScore;
        this.currentInning = inning;

        const scoreDiff = Math.abs(homeScore - awayScore);
        this.isCloseGame = scoreDiff <= 3;

        // Update crowd mood based on game state
        this.updateCrowdMood();
    }

    private updateCrowdMood(): void {
        for (const sectionData of this.sections.values()) {
            const isHomeSection = sectionData.homeTeamPercentage > 50;
            const leading = this.homeScore > this.awayScore;
            const tied = this.homeScore === this.awayScore;

            if (tied) {
                sectionData.dominantMood = CrowdMood.TENSE;
            } else if ((isHomeSection && leading) || (!isHomeSection && !leading)) {
                sectionData.dominantMood = CrowdMood.EXCITED;
            } else {
                sectionData.dominantMood = CrowdMood.DISAPPOINTED;
            }
        }
    }

    public update(deltaTime: number): void {
        // Update wave
        if (this.waveState.isActive) {
            this.updateWave(deltaTime);
        }

        // Update chants
        this.updateChants(deltaTime);

        // Update noise level
        this.updateNoiseLevel(deltaTime);

        // Update camera flashes
        this.updateCameraFlashes(deltaTime);

        // Update vendors
        this.updateVendors(deltaTime);

        // Random crowd behaviors
        if (Math.random() > 0.99) {
            this.triggerRandomCrowdBehavior();
        }
    }

    private updateWave(deltaTime: number): void {
        const elapsed = Date.now() - this.waveState.startTime;
        const sectionIndex = Math.floor(elapsed / this.waveState.speed) % this.waveSectionOrder.length;

        if (sectionIndex !== this.waveState.currentSection) {
            this.waveState.currentSection = sectionIndex;

            // Make section stand and wave
            const section = this.waveSectionOrder[sectionIndex];
            const sectionData = this.sections.get(section);

            if (sectionData) {
                for (const member of sectionData.members) {
                    if (Math.random() * 100 < this.waveState.participation) {
                        member.behavior = CrowdBehavior.WAVING;
                    }
                }

                sectionData.isDoingWave = true;

                // Reset after wave passes
                setTimeout(() => {
                    sectionData.isDoingWave = false;
                    for (const member of sectionData.members) {
                        if (member.behavior === CrowdBehavior.WAVING) {
                            member.behavior = CrowdBehavior.SITTING;
                        }
                    }
                }, this.waveState.speed);
            }
        }

        // Wave ends after 3 full cycles
        if (elapsed > this.waveState.speed * this.waveSectionOrder.length * 3) {
            this.waveState.isActive = false;
        }
    }

    private updateChants(deltaTime: number): void {
        const now = Date.now();

        this.activeChants = this.activeChants.filter(chant => {
            const elapsed = now - chant.startTime;
            return elapsed < chant.duration;
        });

        // Stop chant audio if no active chants
        if (this.activeChants.length === 0) {
            const chantLayer = this.noiseLayers.get('chant');
            if (chantLayer && chantLayer.sound.isPlaying) {
                chantLayer.sound.stop();
            }
        }
    }

    private updateNoiseLevel(deltaTime: number): void {
        // Smooth transition to target noise level
        const diff = this.targetNoiseLevel - this.currentNoiseLevel;
        this.currentNoiseLevel += diff * 0.1;

        // Update ambient sound volume
        const ambientLayer = this.noiseLayers.get('ambient');
        if (ambientLayer) {
            const volume = this.currentNoiseLevel / 100;
            ambientLayer.sound.setVolume(volume * ambientLayer.baseVolume);
        }
    }

    private updateCameraFlashes(deltaTime: number): void {
        // Remove old flashes
        this.cameraFlashes = this.cameraFlashes.filter(flash => {
            // In real implementation, would check age and remove
            return Math.random() > 0.1; // Placeholder
        });
    }

    private updateVendors(deltaTime: number): void {
        for (const vendor of this.vendors) {
            if (vendor.isActive && Math.random() > 0.999) {
                // Vendor makes a sale
                vendor.salesCount++;
            }
        }
    }

    private triggerRandomCrowdBehavior(): void {
        const sections = Array.from(this.sections.values());
        const randomSection = sections[Math.floor(Math.random() * sections.length)];

        if (randomSection.members.length > 0) {
            const randomMember = randomSection.members[Math.floor(Math.random() * randomSection.members.length)];

            const behaviors = [CrowdBehavior.STRETCHING, CrowdBehavior.EATING, CrowdBehavior.DRINKING,
                             CrowdBehavior.USING_PHONE, CrowdBehavior.TAKING_PHOTO];
            randomMember.behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        }
    }

    public setAtmosphereConfig(config: Partial<AtmosphereConfig>): void {
        Object.assign(this.atmosphereConfig, config);
    }

    public setRivalryStatus(isRivalry: boolean): void {
        this.isRivalry = isRivalry;
        if (isRivalry) {
            this.atmosphereConfig.rivalryBonus = 30;
        }
    }

    public dispose(): void {
        this.sections.clear();
        this.activeChants = [];
        this.chantCooldowns.clear();
        this.mascots.clear();
        this.vendors = [];
        this.noiseLayers.clear();
        this.cameraFlashes = [];
    }
}
