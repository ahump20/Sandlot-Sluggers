import { Scene, Mesh, AbstractMesh, Vector3, Color3, Color4, StandardMaterial, PBRMaterial, Texture, Observable, AssetContainer } from '@babylonjs/core';

/**
 * Player positions
 */
export enum Position {
    PITCHER = 'pitcher',
    CATCHER = 'catcher',
    FIRST_BASE = 'first_base',
    SECOND_BASE = 'second_base',
    THIRD_BASE = 'third_base',
    SHORTSTOP = 'shortstop',
    LEFT_FIELD = 'left_field',
    CENTER_FIELD = 'center_field',
    RIGHT_FIELD = 'right_field',
    DESIGNATED_HITTER = 'designated_hitter',
    UTILITY = 'utility'
}

/**
 * Player archetypes
 */
export enum PlayerArchetype {
    POWER_HITTER = 'power_hitter',
    CONTACT_HITTER = 'contact_hitter',
    SPEEDSTER = 'speedster',
    DEFENSIVE_SPECIALIST = 'defensive_specialist',
    BALANCED = 'balanced',
    ACE_PITCHER = 'ace_pitcher',
    CONTROL_PITCHER = 'control_pitcher',
    POWER_PITCHER = 'power_pitcher',
    FINESSE_PITCHER = 'finesse_pitcher',
    CLOSER = 'closer'
}

/**
 * Handedness
 */
export enum Handedness {
    RIGHT = 'right',
    LEFT = 'left',
    SWITCH = 'switch'
}

/**
 * Body types
 */
export enum BodyType {
    SLIM = 'slim',
    ATHLETIC = 'athletic',
    MUSCULAR = 'muscular',
    STOCKY = 'stocky',
    TALL = 'tall',
    LARGE = 'large'
}

/**
 * Player attributes
 */
export interface PlayerAttributes {
    // Batting
    contact: number;            // 0-100
    power: number;              // 0-100
    visionPlate: number;        // Plate discipline
    battingClutch: number;      // Performance in clutch

    // Running
    speed: number;              // 0-100
    baseRunning: number;        // Base running IQ
    stealing: number;           // Steal success rate

    // Fielding
    fieldingAbility: number;    // 0-100
    armStrength: number;        // Throw velocity
    armAccuracy: number;        // Throw accuracy
    reaction: number;           // Reaction time

    // Pitching (if pitcher)
    pitchVelocity: number;      // 0-100
    pitchControl: number;       // Command/control
    pitchMovement: number;      // Break on pitches
    stamina: number;            // Pitch count endurance

    // Mental
    clutch: number;             // Pressure performance
    durability: number;         // Injury resistance
    workEthic: number;          // Training effectiveness

    // Overall
    overall: number;            // Calculated overall rating
}

/**
 * Player appearance customization
 */
export interface PlayerAppearance {
    // Body
    bodyType: BodyType;
    height: number;             // Inches
    weight: number;             // Pounds
    skinTone: Color3;
    muscleMass: number;         // 0-1

    // Face
    facePreset: number;         // Face template index
    eyeColor: Color3;
    eyebrowThickness: number;   // 0-1
    noseSize: number;           // 0-1
    mouthWidth: number;         // 0-1
    jawWidth: number;           // 0-1
    cheekbones: number;         // 0-1

    // Hair
    hairStyle: number;          // Hair style index
    hairColor: Color3;
    facialHairStyle: number;    // 0=none, 1-10=styles
    facialHairColor: Color3;

    // Accessories
    helmet: number;             // Helmet style
    battingGloves: boolean;
    wristbands: boolean;
    eyeBlack: boolean;
    chains: boolean;
    earrings: boolean;
    tattoos: TattooConfig[];
}

/**
 * Tattoo configuration
 */
export interface TattooConfig {
    id: string;
    location: 'left_arm' | 'right_arm' | 'chest' | 'back' | 'neck' | 'leg';
    design: number;             // Design index
    size: number;               // 0-1
    opacity: number;            // 0-1
    color: Color3;
}

/**
 * Equipment customization
 */
export interface PlayerEquipment {
    // Batting
    batModel: string;
    batColor: Color3;
    batMaterial: 'wood' | 'aluminum' | 'composite';
    batLength: number;          // Inches (30-36)
    batWeight: number;          // Ounces (28-34)
    batGrip: 'standard' | 'tape' | 'lizard_skin';
    batGripColor: Color3;

    // Glove
    gloveModel: string;
    gloveColor: Color3;
    gloveWebbing: 'closed' | 'modified_trap' | 'h_web' | 'i_web' | 'basket';
    gloveSize: number;          // Inches (11-13)
    gloveBreakIn: number;       // 0-1 (stiff to broken in)

    // Cleats
    cleatModel: string;
    cleatColor: Color3;
    cleatType: 'metal' | 'molded';

    // Uniform
    jerseyNumber: number;
    jerseyFit: 'tight' | 'regular' | 'loose';
    pantsFit: 'tight' | 'regular' | 'loose';
    pantsLength: 'knee' | 'ankle' | 'high_socks';
    sockStyle: 'low' | 'mid' | 'high';
    sockColor: Color3;

    // Protective
    battingHelmet: string;
    catcherGear?: CatcherGear;
    elbowGuard: boolean;
    shinguard: boolean;
}

/**
 * Catcher-specific equipment
 */
export interface CatcherGear {
    mask: string;
    chestProtector: string;
    legGuards: string;
    gearColor: Color3;
}

/**
 * Player personality traits
 */
export interface PersonalityTraits {
    confidence: number;         // 0-100
    leadership: number;         // Team influence
    composure: number;          // Keeps cool under pressure
    aggression: number;         // Playing style aggression
    teamPlayer: number;         // Selflessness
    showboat: number;           // Celebration tendency
    workEthic: number;          // Training dedication
    clutchGene: number;         // Big moment performance
}

/**
 * Player progression data
 */
export interface PlayerProgression {
    level: number;
    experience: number;
    experienceToNextLevel: number;
    skillPoints: number;
    attributeUpgrades: Map<string, number>;
    unlockedPerks: string[];
    trainingHistory: TrainingSession[];
    performanceHistory: PerformanceData[];
}

/**
 * Training session
 */
export interface TrainingSession {
    date: number;
    type: 'batting' | 'pitching' | 'fielding' | 'conditioning' | 'mental';
    duration: number;           // Minutes
    intensity: number;          // 0-100
    attributesImproved: string[];
    experienceGained: number;
}

/**
 * Performance data
 */
export interface PerformanceData {
    gameId: string;
    date: number;
    opponent: string;
    position: Position;
    stats: {
        atBats?: number;
        hits?: number;
        doubles?: number;
        triples?: number;
        homeRuns?: number;
        rbis?: number;
        runs?: number;
        walks?: number;
        strikeouts?: number;
        inningsPitched?: number;
        pitchesThrown?: number;
        earnedRuns?: number;
        strikeoutsPitched?: number;
        walksAllowed?: number;
        putOuts?: number;
        assists?: number;
        errors?: number;
    };
    highlights: string[];
    rating: number;             // Game performance rating 0-100
}

/**
 * Player perks/abilities
 */
export interface PlayerPerk {
    id: string;
    name: string;
    description: string;
    tier: number;               // 1-5
    category: 'batting' | 'pitching' | 'fielding' | 'baserunning' | 'mental';
    requirements: {
        level?: number;
        attributes?: Map<string, number>;
        position?: Position[];
    };
    effects: PerkEffect[];
    icon: string;
}

/**
 * Perk effect
 */
export interface PerkEffect {
    type: 'attribute_boost' | 'ability_unlock' | 'passive_bonus';
    attribute?: string;
    value: number;
    description: string;
}

/**
 * Complete player character data
 */
export interface PlayerCharacter {
    id: string;
    firstName: string;
    lastName: string;
    nickname?: string;
    position: Position;
    secondaryPositions: Position[];
    archetype: PlayerArchetype;
    handedness: Handedness;
    throwingHand: Handedness;

    // Core data
    attributes: PlayerAttributes;
    appearance: PlayerAppearance;
    equipment: PlayerEquipment;
    personality: PersonalityTraits;
    progression: PlayerProgression;

    // Stats
    careerStats: any;           // Career statistics
    seasonStats: any;           // Current season statistics
    awards: Award[];

    // Meta
    createdDate: number;
    lastUpdated: number;
    isCustom: boolean;
    shareCode?: string;
}

/**
 * Award/achievement
 */
export interface Award {
    id: string;
    name: string;
    description: string;
    dateEarned: number;
    season?: number;
    icon: string;
}

/**
 * Character preset (for quick creation)
 */
export interface CharacterPreset {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    character: Partial<PlayerCharacter>;
    tags: string[];
}

/**
 * Character Customization System
 * Complete character creation, customization, and progression
 */
export class CharacterCustomizationSystem {
    private scene: Scene;

    // Characters
    private characters: Map<string, PlayerCharacter> = new Map();
    private activeCharacter: string | null = null;

    // Meshes and visuals
    private characterMeshes: Map<string, AbstractMesh> = new Map();
    private equipmentMeshes: Map<string, Map<string, Mesh>> = new Map();

    // Presets
    private presets: Map<string, CharacterPreset> = new Map();

    // Perks
    private perks: Map<string, PlayerPerk> = new Map();

    // Materials
    private materials: Map<string, StandardMaterial | PBRMaterial> = new Map();

    // Progression
    private readonly EXPERIENCE_CURVE = [
        0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,          // Levels 1-10
        3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,  // Levels 11-20
        11500, 12600, 13750, 14950, 16200, 17500, 18850, 20250, 21700, 23200 // Levels 21-30
    ];

    private readonly MAX_LEVEL = 30;

    // Observables
    private onCharacterCreatedObservable: Observable<PlayerCharacter> = new Observable();
    private onCharacterUpdatedObservable: Observable<PlayerCharacter> = new Observable();
    private onLevelUpObservable: Observable<{ character: PlayerCharacter; newLevel: number }> = new Observable();
    private onPerkUnlockedObservable: Observable<{ character: PlayerCharacter; perk: PlayerPerk }> = new Observable();

    constructor(scene: Scene) {
        this.scene = scene;
        this.initializePresets();
        this.initializePerks();
    }

    /**
     * Initialize character presets
     */
    private initializePresets(): void {
        // Power Hitter Preset
        const powerHitter: CharacterPreset = {
            id: 'power_hitter_preset',
            name: 'The Slugger',
            description: 'Classic power hitter with massive home run potential',
            thumbnail: '/assets/presets/power_hitter.jpg',
            character: {
                archetype: PlayerArchetype.POWER_HITTER,
                position: Position.RIGHT_FIELD,
                secondaryPositions: [Position.FIRST_BASE, Position.DESIGNATED_HITTER],
                attributes: {
                    contact: 70,
                    power: 95,
                    visionPlate: 65,
                    battingClutch: 80,
                    speed: 40,
                    baseRunning: 50,
                    stealing: 30,
                    fieldingAbility: 60,
                    armStrength: 85,
                    armAccuracy: 70,
                    reaction: 65,
                    pitchVelocity: 0,
                    pitchControl: 0,
                    pitchMovement: 0,
                    stamina: 70,
                    clutch: 80,
                    durability: 75,
                    workEthic: 70,
                    overall: 75
                },
                appearance: {
                    bodyType: BodyType.MUSCULAR,
                    height: 74, // 6'2"
                    weight: 220,
                    skinTone: new Color3(0.8, 0.6, 0.5),
                    muscleMass: 0.9,
                    facePreset: 1,
                    eyeColor: new Color3(0.3, 0.5, 0.7),
                    eyebrowThickness: 0.7,
                    noseSize: 0.6,
                    mouthWidth: 0.5,
                    jawWidth: 0.8,
                    cheekbones: 0.6,
                    hairStyle: 5,
                    hairColor: new Color3(0.2, 0.15, 0.1),
                    facialHairStyle: 3,
                    facialHairColor: new Color3(0.2, 0.15, 0.1),
                    helmet: 1,
                    battingGloves: true,
                    wristbands: true,
                    eyeBlack: true,
                    chains: false,
                    earrings: false,
                    tattoos: []
                },
                personality: {
                    confidence: 85,
                    leadership: 70,
                    composure: 75,
                    aggression: 80,
                    teamPlayer: 65,
                    showboat: 70,
                    workEthic: 75,
                    clutchGene: 85
                }
            },
            tags: ['power', 'offense', 'home_runs', 'slugger']
        };
        this.presets.set('power_hitter_preset', powerHitter);

        // Speedster Preset
        const speedster: CharacterPreset = {
            id: 'speedster_preset',
            name: 'The Speedster',
            description: 'Lightning fast with elite base stealing ability',
            thumbnail: '/assets/presets/speedster.jpg',
            character: {
                archetype: PlayerArchetype.SPEEDSTER,
                position: Position.CENTER_FIELD,
                secondaryPositions: [Position.LEFT_FIELD, Position.SECOND_BASE],
                attributes: {
                    contact: 80,
                    power: 45,
                    visionPlate: 75,
                    battingClutch: 70,
                    speed: 99,
                    baseRunning: 95,
                    stealing: 98,
                    fieldingAbility: 85,
                    armStrength: 70,
                    armAccuracy: 75,
                    reaction: 90,
                    pitchVelocity: 0,
                    pitchControl: 0,
                    pitchMovement: 0,
                    stamina: 85,
                    clutch: 70,
                    durability: 80,
                    workEthic: 85,
                    overall: 78
                },
                appearance: {
                    bodyType: BodyType.ATHLETIC,
                    height: 70, // 5'10"
                    weight: 175,
                    skinTone: new Color3(0.6, 0.4, 0.3),
                    muscleMass: 0.6,
                    facePreset: 2,
                    eyeColor: new Color3(0.2, 0.3, 0.1),
                    eyebrowThickness: 0.5,
                    noseSize: 0.5,
                    mouthWidth: 0.6,
                    jawWidth: 0.5,
                    cheekbones: 0.7,
                    hairStyle: 8,
                    hairColor: new Color3(0.1, 0.1, 0.1),
                    facialHairStyle: 0,
                    facialHairColor: new Color3(0, 0, 0),
                    helmet: 2,
                    battingGloves: true,
                    wristbands: false,
                    eyeBlack: false,
                    chains: true,
                    earrings: true,
                    tattoos: []
                },
                personality: {
                    confidence: 90,
                    leadership: 80,
                    composure: 85,
                    aggression: 75,
                    teamPlayer: 80,
                    showboat: 60,
                    workEthic: 90,
                    clutchGene: 75
                }
            },
            tags: ['speed', 'stealing', 'defense', 'contact']
        };
        this.presets.set('speedster_preset', speedster);

        // Ace Pitcher Preset
        const acePitcher: CharacterPreset = {
            id: 'ace_pitcher_preset',
            name: 'The Ace',
            description: 'Dominant starting pitcher with overpowering stuff',
            thumbnail: '/assets/presets/ace_pitcher.jpg',
            character: {
                archetype: PlayerArchetype.ACE_PITCHER,
                position: Position.PITCHER,
                secondaryPositions: [],
                attributes: {
                    contact: 30,
                    power: 20,
                    visionPlate: 40,
                    battingClutch: 35,
                    speed: 50,
                    baseRunning: 40,
                    stealing: 20,
                    fieldingAbility: 55,
                    armStrength: 95,
                    armAccuracy: 85,
                    reaction: 70,
                    pitchVelocity: 96,
                    pitchControl: 88,
                    pitchMovement: 90,
                    stamina: 92,
                    clutch: 85,
                    durability: 80,
                    workEthic: 90,
                    overall: 85
                },
                appearance: {
                    bodyType: BodyType.ATHLETIC,
                    height: 76, // 6'4"
                    weight: 210,
                    skinTone: new Color3(0.9, 0.7, 0.6),
                    muscleMass: 0.75,
                    facePreset: 3,
                    eyeColor: new Color3(0.4, 0.3, 0.2),
                    eyebrowThickness: 0.6,
                    noseSize: 0.6,
                    mouthWidth: 0.5,
                    jawWidth: 0.7,
                    cheekbones: 0.5,
                    hairStyle: 3,
                    hairColor: new Color3(0.4, 0.3, 0.2),
                    facialHairStyle: 5,
                    facialHairColor: new Color3(0.4, 0.3, 0.2),
                    helmet: 0,
                    battingGloves: false,
                    wristbands: false,
                    eyeBlack: false,
                    chains: false,
                    earrings: false,
                    tattoos: []
                },
                personality: {
                    confidence: 95,
                    leadership: 90,
                    composure: 90,
                    aggression: 85,
                    teamPlayer: 75,
                    showboat: 50,
                    workEthic: 95,
                    clutchGene: 90
                }
            },
            tags: ['pitching', 'ace', 'strikeouts', 'velocity']
        };
        this.presets.set('ace_pitcher_preset', acePitcher);
    }

    /**
     * Initialize player perks
     */
    private initializePerks(): void {
        // Batting perks
        this.perks.set('clutch_hitter', {
            id: 'clutch_hitter',
            name: 'Clutch Hitter',
            description: '+15 contact and +10 power in high-pressure situations',
            tier: 2,
            category: 'batting',
            requirements: {
                level: 5,
                attributes: new Map([['battingClutch', 70]])
            },
            effects: [
                { type: 'passive_bonus', attribute: 'contact', value: 15, description: '+15 contact in clutch' },
                { type: 'passive_bonus', attribute: 'power', value: 10, description: '+10 power in clutch' }
            ],
            icon: '/assets/perks/clutch_hitter.png'
        });

        this.perks.set('power_swing', {
            id: 'power_swing',
            name: 'Power Swing',
            description: 'Unlocks devastating power swing with +25 power but -10 contact',
            tier: 3,
            category: 'batting',
            requirements: {
                level: 10,
                attributes: new Map([['power', 85]])
            },
            effects: [
                { type: 'ability_unlock', value: 1, description: 'Unlock power swing ability' }
            ],
            icon: '/assets/perks/power_swing.png'
        });

        this.perks.set('contact_specialist', {
            id: 'contact_specialist',
            name: 'Contact Specialist',
            description: '+10 contact, larger timing windows on pitches',
            tier: 2,
            category: 'batting',
            requirements: {
                level: 8,
                attributes: new Map([['contact', 80]])
            },
            effects: [
                { type: 'attribute_boost', attribute: 'contact', value: 10, description: '+10 contact' },
                { type: 'passive_bonus', value: 1, description: '20% larger timing window' }
            ],
            icon: '/assets/perks/contact_specialist.png'
        });

        // Baserunning perks
        this.perks.set('stolen_base_artist', {
            id: 'stolen_base_artist',
            name: 'Stolen Base Artist',
            description: '+15 stealing, better leads and jumps',
            tier: 2,
            category: 'baserunning',
            requirements: {
                level: 6,
                attributes: new Map([['stealing', 75], ['speed', 80]])
            },
            effects: [
                { type: 'attribute_boost', attribute: 'stealing', value: 15, description: '+15 stealing' },
                { type: 'passive_bonus', value: 1, description: 'Better jump timing' }
            ],
            icon: '/assets/perks/stolen_base_artist.png'
        });

        // Fielding perks
        this.perks.set('gold_glove', {
            id: 'gold_glove',
            name: 'Gold Glove',
            description: '+10 fielding ability, improved dive catches',
            tier: 3,
            category: 'fielding',
            requirements: {
                level: 12,
                attributes: new Map([['fieldingAbility', 85]])
            },
            effects: [
                { type: 'attribute_boost', attribute: 'fieldingAbility', value: 10, description: '+10 fielding' },
                { type: 'passive_bonus', value: 1, description: '25% better dive success' }
            ],
            icon: '/assets/perks/gold_glove.png'
        });

        this.perks.set('cannon_arm', {
            id: 'cannon_arm',
            name: 'Cannon Arm',
            description: '+15 arm strength, faster throws',
            tier: 2,
            category: 'fielding',
            requirements: {
                level: 7,
                attributes: new Map([['armStrength', 75]])
            },
            effects: [
                { type: 'attribute_boost', attribute: 'armStrength', value: 15, description: '+15 arm strength' }
            ],
            icon: '/assets/perks/cannon_arm.png'
        });

        // Pitching perks
        this.perks.set('strikeout_king', {
            id: 'strikeout_king',
            name: 'Strikeout King',
            description: '+10 velocity, +5 movement, increased K rate',
            tier: 3,
            category: 'pitching',
            requirements: {
                level: 15,
                attributes: new Map([['pitchVelocity', 90]]),
                position: [Position.PITCHER]
            },
            effects: [
                { type: 'attribute_boost', attribute: 'pitchVelocity', value: 10, description: '+10 velocity' },
                { type: 'attribute_boost', attribute: 'pitchMovement', value: 5, description: '+5 movement' }
            ],
            icon: '/assets/perks/strikeout_king.png'
        });

        this.perks.set('control_artist', {
            id: 'control_artist',
            name: 'Control Artist',
            description: '+15 pitch control, pinpoint accuracy',
            tier: 2,
            category: 'pitching',
            requirements: {
                level: 10,
                attributes: new Map([['pitchControl', 80]]),
                position: [Position.PITCHER]
            },
            effects: [
                { type: 'attribute_boost', attribute: 'pitchControl', value: 15, description: '+15 control' },
                { type: 'passive_bonus', value: 1, description: 'Tighter pitch location' }
            ],
            icon: '/assets/perks/control_artist.png'
        });

        this.perks.set('workhorse', {
            id: 'workhorse',
            name: 'Workhorse',
            description: '+20 stamina, slower fatigue rate',
            tier: 2,
            category: 'pitching',
            requirements: {
                level: 8,
                attributes: new Map([['stamina', 75]]),
                position: [Position.PITCHER]
            },
            effects: [
                { type: 'attribute_boost', attribute: 'stamina', value: 20, description: '+20 stamina' },
                { type: 'passive_bonus', value: 1, description: '50% slower fatigue' }
            ],
            icon: '/assets/perks/workhorse.png'
        });

        // Mental perks
        this.perks.set('pressure_performer', {
            id: 'pressure_performer',
            name: 'Pressure Performer',
            description: 'All attributes +5 in clutch situations',
            tier: 4,
            category: 'mental',
            requirements: {
                level: 18,
                attributes: new Map([['clutch', 85]])
            },
            effects: [
                { type: 'passive_bonus', value: 5, description: '+5 all attributes in clutch' }
            ],
            icon: '/assets/perks/pressure_performer.png'
        });

        this.perks.set('iron_man', {
            id: 'iron_man',
            name: 'Iron Man',
            description: '+15 durability, 75% injury resistance',
            tier: 3,
            category: 'mental',
            requirements: {
                level: 15,
                attributes: new Map([['durability', 80]])
            },
            effects: [
                { type: 'attribute_boost', attribute: 'durability', value: 15, description: '+15 durability' },
                { type: 'passive_bonus', value: 1, description: '75% injury resistance' }
            ],
            icon: '/assets/perks/iron_man.png'
        });
    }

    /**
     * Create new character
     */
    public createCharacter(
        firstName: string,
        lastName: string,
        position: Position,
        archetype: PlayerArchetype,
        appearance?: Partial<PlayerAppearance>,
        equipment?: Partial<PlayerEquipment>
    ): PlayerCharacter {
        const id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Generate attributes based on archetype
        const attributes = this.generateAttributesForArchetype(archetype, position);

        // Create default appearance if not provided
        const defaultAppearance = this.createDefaultAppearance();
        const finalAppearance = { ...defaultAppearance, ...appearance };

        // Create default equipment
        const defaultEquipment = this.createDefaultEquipment(position);
        const finalEquipment = { ...defaultEquipment, ...equipment };

        // Create character
        const character: PlayerCharacter = {
            id,
            firstName,
            lastName,
            position,
            secondaryPositions: [],
            archetype,
            handedness: Handedness.RIGHT,
            throwingHand: Handedness.RIGHT,
            attributes,
            appearance: finalAppearance,
            equipment: finalEquipment,
            personality: this.generatePersonality(archetype),
            progression: {
                level: 1,
                experience: 0,
                experienceToNextLevel: this.EXPERIENCE_CURVE[1],
                skillPoints: 0,
                attributeUpgrades: new Map(),
                unlockedPerks: [],
                trainingHistory: [],
                performanceHistory: []
            },
            careerStats: {},
            seasonStats: {},
            awards: [],
            createdDate: Date.now(),
            lastUpdated: Date.now(),
            isCustom: true
        };

        this.characters.set(id, character);
        this.onCharacterCreatedObservable.notifyObservers(character);

        return character;
    }

    /**
     * Generate attributes for archetype
     */
    private generateAttributesForArchetype(archetype: PlayerArchetype, position: Position): PlayerAttributes {
        const base: PlayerAttributes = {
            contact: 50,
            power: 50,
            visionPlate: 50,
            battingClutch: 50,
            speed: 50,
            baseRunning: 50,
            stealing: 50,
            fieldingAbility: 50,
            armStrength: 50,
            armAccuracy: 50,
            reaction: 50,
            pitchVelocity: 0,
            pitchControl: 0,
            pitchMovement: 0,
            stamina: 50,
            clutch: 50,
            durability: 50,
            workEthic: 50,
            overall: 50
        };

        // Modify based on archetype
        switch (archetype) {
            case PlayerArchetype.POWER_HITTER:
                base.power = 85;
                base.contact = 65;
                base.speed = 45;
                base.armStrength = 75;
                break;

            case PlayerArchetype.CONTACT_HITTER:
                base.contact = 90;
                base.power = 55;
                base.visionPlate = 80;
                base.speed = 70;
                break;

            case PlayerArchetype.SPEEDSTER:
                base.speed = 95;
                base.stealing = 90;
                base.baseRunning = 90;
                base.contact = 75;
                base.power = 40;
                break;

            case PlayerArchetype.DEFENSIVE_SPECIALIST:
                base.fieldingAbility = 90;
                base.reaction = 85;
                base.armStrength = 80;
                base.armAccuracy = 85;
                break;

            case PlayerArchetype.ACE_PITCHER:
                base.pitchVelocity = 90;
                base.pitchControl = 85;
                base.pitchMovement = 85;
                base.stamina = 90;
                break;

            case PlayerArchetype.CONTROL_PITCHER:
                base.pitchControl = 95;
                base.pitchMovement = 80;
                base.pitchVelocity = 75;
                base.stamina = 85;
                break;

            case PlayerArchetype.POWER_PITCHER:
                base.pitchVelocity = 98;
                base.pitchMovement = 70;
                base.pitchControl = 70;
                base.stamina = 75;
                break;
        }

        // Calculate overall
        base.overall = this.calculateOverall(base, position);

        return base;
    }

    /**
     * Calculate overall rating
     */
    private calculateOverall(attributes: PlayerAttributes, position: Position): number {
        let total = 0;
        let count = 0;

        // Weight attributes based on position
        if (position === Position.PITCHER) {
            total += attributes.pitchVelocity * 1.5;
            total += attributes.pitchControl * 1.5;
            total += attributes.pitchMovement * 1.3;
            total += attributes.stamina * 1.2;
            total += attributes.fieldingAbility * 0.5;
            count = 6;
        } else {
            total += attributes.contact * 1.3;
            total += attributes.power * 1.2;
            total += attributes.speed * 1.0;
            total += attributes.fieldingAbility * 1.2;
            total += attributes.armStrength * 1.0;
            total += attributes.reaction * 1.0;
            count = 6.7;
        }

        return Math.round(total / count);
    }

    /**
     * Create default appearance
     */
    private createDefaultAppearance(): PlayerAppearance {
        return {
            bodyType: BodyType.ATHLETIC,
            height: 72, // 6'0"
            weight: 190,
            skinTone: new Color3(0.8, 0.6, 0.5),
            muscleMass: 0.6,
            facePreset: 0,
            eyeColor: new Color3(0.3, 0.5, 0.7),
            eyebrowThickness: 0.5,
            noseSize: 0.5,
            mouthWidth: 0.5,
            jawWidth: 0.5,
            cheekbones: 0.5,
            hairStyle: 1,
            hairColor: new Color3(0.2, 0.15, 0.1),
            facialHairStyle: 0,
            facialHairColor: new Color3(0.2, 0.15, 0.1),
            helmet: 1,
            battingGloves: true,
            wristbands: false,
            eyeBlack: false,
            chains: false,
            earrings: false,
            tattoos: []
        };
    }

    /**
     * Create default equipment
     */
    private createDefaultEquipment(position: Position): PlayerEquipment {
        return {
            batModel: 'standard',
            batColor: new Color3(0.4, 0.3, 0.2),
            batMaterial: 'wood',
            batLength: 34,
            batWeight: 32,
            batGrip: 'standard',
            batGripColor: new Color3(0.1, 0.1, 0.1),
            gloveModel: 'standard',
            gloveColor: new Color3(0.5, 0.3, 0.2),
            gloveWebbing: 'closed',
            gloveSize: 12,
            gloveBreakIn: 0.5,
            cleatModel: 'standard',
            cleatColor: new Color3(0, 0, 0),
            cleatType: 'molded',
            jerseyNumber: 0,
            jerseyFit: 'regular',
            pantsFit: 'regular',
            pantsLength: 'high_socks',
            sockStyle: 'high',
            sockColor: new Color3(1, 1, 1),
            battingHelmet: 'standard',
            elbowGuard: false,
            shinguard: false
        };
    }

    /**
     * Generate personality traits
     */
    private generatePersonality(archetype: PlayerArchetype): PersonalityTraits {
        const base: PersonalityTraits = {
            confidence: 50 + Math.random() * 30,
            leadership: 50 + Math.random() * 30,
            composure: 50 + Math.random() * 30,
            aggression: 50 + Math.random() * 30,
            teamPlayer: 50 + Math.random() * 30,
            showboat: 30 + Math.random() * 40,
            workEthic: 60 + Math.random() * 30,
            clutchGene: 50 + Math.random() * 30
        };

        // Modify based on archetype
        if (archetype === PlayerArchetype.ACE_PITCHER || archetype === PlayerArchetype.POWER_PITCHER) {
            base.confidence += 10;
            base.leadership += 10;
        }

        return base;
    }

    /**
     * Load preset character
     */
    public loadPreset(presetId: string): PlayerCharacter | null {
        const preset = this.presets.get(presetId);
        if (!preset) return null;

        const id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const character: PlayerCharacter = {
            id,
            firstName: preset.character.firstName || 'Player',
            lastName: preset.character.lastName || 'Name',
            nickname: preset.character.nickname,
            position: preset.character.position!,
            secondaryPositions: preset.character.secondaryPositions || [],
            archetype: preset.character.archetype!,
            handedness: preset.character.handedness || Handedness.RIGHT,
            throwingHand: preset.character.throwingHand || Handedness.RIGHT,
            attributes: preset.character.attributes!,
            appearance: preset.character.appearance!,
            equipment: this.createDefaultEquipment(preset.character.position!),
            personality: preset.character.personality!,
            progression: {
                level: 1,
                experience: 0,
                experienceToNextLevel: this.EXPERIENCE_CURVE[1],
                skillPoints: 0,
                attributeUpgrades: new Map(),
                unlockedPerks: [],
                trainingHistory: [],
                performanceHistory: []
            },
            careerStats: {},
            seasonStats: {},
            awards: [],
            createdDate: Date.now(),
            lastUpdated: Date.now(),
            isCustom: true
        };

        this.characters.set(id, character);
        return character;
    }

    /**
     * Award experience to character
     */
    public awardExperience(characterId: string, amount: number): void {
        const character = this.characters.get(characterId);
        if (!character) return;

        character.progression.experience += amount;

        // Check for level up
        while (
            character.progression.level < this.MAX_LEVEL &&
            character.progression.experience >= character.progression.experienceToNextLevel
        ) {
            this.levelUp(character);
        }

        character.lastUpdated = Date.now();
        this.onCharacterUpdatedObservable.notifyObservers(character);
    }

    /**
     * Level up character
     */
    private levelUp(character: PlayerCharacter): void {
        character.progression.level++;
        character.progression.skillPoints += 3;

        if (character.progression.level < this.MAX_LEVEL) {
            character.progression.experienceToNextLevel = this.EXPERIENCE_CURVE[character.progression.level];
        }

        this.onLevelUpObservable.notifyObservers({
            character,
            newLevel: character.progression.level
        });
    }

    /**
     * Upgrade attribute
     */
    public upgradeAttribute(characterId: string, attribute: string, points: number = 1): boolean {
        const character = this.characters.get(characterId);
        if (!character) return false;

        if (character.progression.skillPoints < points) return false;

        const currentValue = (character.attributes as any)[attribute];
        if (currentValue >= 99) return false;

        character.progression.skillPoints -= points;
        (character.attributes as any)[attribute] = Math.min(99, currentValue + points);

        // Track upgrade
        const upgrades = character.progression.attributeUpgrades.get(attribute) || 0;
        character.progression.attributeUpgrades.set(attribute, upgrades + points);

        // Recalculate overall
        character.attributes.overall = this.calculateOverall(character.attributes, character.position);

        character.lastUpdated = Date.now();
        this.onCharacterUpdatedObservable.notifyObservers(character);

        return true;
    }

    /**
     * Unlock perk
     */
    public unlockPerk(characterId: string, perkId: string): boolean {
        const character = this.characters.get(characterId);
        const perk = this.perks.get(perkId);

        if (!character || !perk) return false;

        // Check requirements
        if (perk.requirements.level && character.progression.level < perk.requirements.level) {
            return false;
        }

        if (perk.requirements.attributes) {
            for (const [attr, minValue] of perk.requirements.attributes) {
                if ((character.attributes as any)[attr] < minValue) {
                    return false;
                }
            }
        }

        if (perk.requirements.position && !perk.requirements.position.includes(character.position)) {
            return false;
        }

        // Already unlocked?
        if (character.progression.unlockedPerks.includes(perkId)) {
            return false;
        }

        // Unlock perk
        character.progression.unlockedPerks.push(perkId);

        // Apply perk effects
        for (const effect of perk.effects) {
            if (effect.type === 'attribute_boost' && effect.attribute) {
                (character.attributes as any)[effect.attribute] += effect.value;
            }
        }

        // Recalculate overall
        character.attributes.overall = this.calculateOverall(character.attributes, character.position);

        character.lastUpdated = Date.now();
        this.onPerkUnlockedObservable.notifyObservers({ character, perk });
        this.onCharacterUpdatedObservable.notifyObservers(character);

        return true;
    }

    /**
     * Get available perks for character
     */
    public getAvailablePerks(characterId: string): PlayerPerk[] {
        const character = this.characters.get(characterId);
        if (!character) return [];

        const available: PlayerPerk[] = [];

        for (const perk of this.perks.values()) {
            // Skip if already unlocked
            if (character.progression.unlockedPerks.includes(perk.id)) {
                continue;
            }

            // Check requirements
            let meetsRequirements = true;

            if (perk.requirements.level && character.progression.level < perk.requirements.level) {
                meetsRequirements = false;
            }

            if (perk.requirements.attributes) {
                for (const [attr, minValue] of perk.requirements.attributes) {
                    if ((character.attributes as any)[attr] < minValue) {
                        meetsRequirements = false;
                        break;
                    }
                }
            }

            if (perk.requirements.position && !perk.requirements.position.includes(character.position)) {
                meetsRequirements = false;
            }

            if (meetsRequirements) {
                available.push(perk);
            }
        }

        return available.sort((a, b) => a.tier - b.tier);
    }

    /**
     * Record training session
     */
    public recordTraining(characterId: string, session: Omit<TrainingSession, 'date'>): void {
        const character = this.characters.get(characterId);
        if (!character) return;

        const fullSession: TrainingSession = {
            ...session,
            date: Date.now()
        };

        character.progression.trainingHistory.push(fullSession);

        // Award experience
        this.awardExperience(characterId, session.experienceGained);

        character.lastUpdated = Date.now();
    }

    /**
     * Record game performance
     */
    public recordPerformance(characterId: string, performance: Omit<PerformanceData, 'date'>): void {
        const character = this.characters.get(characterId);
        if (!character) return;

        const fullPerformance: PerformanceData = {
            ...performance,
            date: Date.now()
        };

        character.progression.performanceHistory.push(fullPerformance);

        // Award experience based on performance rating
        const experienceGained = Math.round(performance.rating * 2);
        this.awardExperience(characterId, experienceGained);

        character.lastUpdated = Date.now();
    }

    /**
     * Update character appearance
     */
    public updateAppearance(characterId: string, appearance: Partial<PlayerAppearance>): void {
        const character = this.characters.get(characterId);
        if (!character) return;

        character.appearance = { ...character.appearance, ...appearance };
        character.lastUpdated = Date.now();

        // Update visual mesh
        this.updateCharacterMesh(characterId);

        this.onCharacterUpdatedObservable.notifyObservers(character);
    }

    /**
     * Update character equipment
     */
    public updateEquipment(characterId: string, equipment: Partial<PlayerEquipment>): void {
        const character = this.characters.get(characterId);
        if (!character) return;

        character.equipment = { ...character.equipment, ...equipment };
        character.lastUpdated = Date.now();

        // Update equipment mesh
        this.updateEquipmentMesh(characterId);

        this.onCharacterUpdatedObservable.notifyObservers(character);
    }

    /**
     * Update character visual mesh
     */
    private updateCharacterMesh(characterId: string): void {
        // This would rebuild the character's 3D model based on appearance settings
        // Implementation would involve modifying mesh vertices, applying materials, etc.
    }

    /**
     * Update equipment mesh
     */
    private updateEquipmentMesh(characterId: string): void {
        // This would update equipment meshes (bat, glove, cleats, etc.)
        // Implementation would involve swapping meshes and applying colors
    }

    /**
     * Get character
     */
    public getCharacter(characterId: string): PlayerCharacter | undefined {
        return this.characters.get(characterId);
    }

    /**
     * Get all characters
     */
    public getAllCharacters(): PlayerCharacter[] {
        return Array.from(this.characters.values());
    }

    /**
     * Get all presets
     */
    public getAllPresets(): CharacterPreset[] {
        return Array.from(this.presets.values());
    }

    /**
     * Subscribe to character created
     */
    public onCharacterCreated(callback: (character: PlayerCharacter) => void): void {
        this.onCharacterCreatedObservable.add(callback);
    }

    /**
     * Subscribe to character updated
     */
    public onCharacterUpdated(callback: (character: PlayerCharacter) => void): void {
        this.onCharacterUpdatedObservable.add(callback);
    }

    /**
     * Subscribe to level up
     */
    public onLevelUp(callback: (data: { character: PlayerCharacter; newLevel: number }) => void): void {
        this.onLevelUpObservable.add(callback);
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        this.characters.clear();
        this.characterMeshes.clear();
        this.equipmentMeshes.clear();
        this.presets.clear();
        this.perks.clear();
        this.materials.clear();

        this.onCharacterCreatedObservable.clear();
        this.onCharacterUpdatedObservable.clear();
        this.onLevelUpObservable.clear();
        this.onPerkUnlockedObservable.clear();
    }
}
