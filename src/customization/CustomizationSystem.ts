/**
 * Comprehensive Customization System for Sandlot Sluggers
 * Provides player, team, stadium, and equipment customization
 *
 * Features:
 * - Player appearance customization (face, hair, body type, skin tone)
 * - Player equipment customization (bat, glove, cleats, helmet, accessories)
 * - Team uniform customization (jerseys, pants, socks, caps)
 * - Team logo and branding editor
 * - Stadium customization (field dimensions, wall heights, surface type)
 * - Stadium aesthetics (seating, scoreboard, lighting, decorations)
 * - Custom color palettes and patterns
 * - Decal and emblem system
 * - Preset and template library
 * - Import/export designs
 * - Sharing and community designs
 * - Seasonal and special event themes
 * - Unlockable customization options
 * - Real-time preview system
 */

import { Scene } from '@babylonjs/core/scene';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Observable } from '@babylonjs/core/Misc/observable';

export enum CustomizationCategory {
    PLAYER_APPEARANCE = 'player_appearance',
    PLAYER_EQUIPMENT = 'player_equipment',
    TEAM_UNIFORM = 'team_uniform',
    TEAM_BRANDING = 'team_branding',
    STADIUM_FIELD = 'stadium_field',
    STADIUM_AESTHETICS = 'stadium_aesthetics',
    ACCESSORIES = 'accessories',
    CELEBRATIONS = 'celebrations'
}

export enum PlayerAppearanceSlot {
    FACE_SHAPE = 'face_shape',
    SKIN_TONE = 'skin_tone',
    HAIR_STYLE = 'hair_style',
    HAIR_COLOR = 'hair_color',
    FACIAL_HAIR = 'facial_hair',
    EYE_COLOR = 'eye_color',
    EYEBROWS = 'eyebrows',
    NOSE = 'nose',
    MOUTH = 'mouth',
    EARS = 'ears',
    BODY_TYPE = 'body_type',
    HEIGHT = 'height',
    MUSCLE_MASS = 'muscle_mass',
    TATTOOS = 'tattoos',
    ACCESSORIES = 'accessories'
}

export enum EquipmentSlot {
    BAT = 'bat',
    GLOVE = 'glove',
    HELMET = 'helmet',
    BATTING_GLOVES = 'batting_gloves',
    CLEATS = 'cleats',
    WRIST_BAND = 'wrist_band',
    ELBOW_GUARD = 'elbow_guard',
    SHIN_GUARD = 'shin_guard',
    CHEST_PROTECTOR = 'chest_protector',
    CATCHERS_MASK = 'catchers_mask',
    SUNGLASSES = 'sunglasses',
    NECKLACE = 'necklace',
    ARM_SLEEVE = 'arm_sleeve'
}

export enum UniformSlot {
    JERSEY_HOME = 'jersey_home',
    JERSEY_AWAY = 'jersey_away',
    JERSEY_ALTERNATE = 'jersey_alternate',
    PANTS = 'pants',
    SOCKS = 'socks',
    CAP = 'cap',
    UNDERSHIRT = 'undershirt',
    BELT = 'belt'
}

export enum StadiumFieldElement {
    GRASS_TYPE = 'grass_type',
    DIRT_COLOR = 'dirt_color',
    BASE_PATH_LENGTH = 'base_path_length',
    OUTFIELD_WALL_HEIGHT = 'outfield_wall_height',
    FOUL_TERRITORY = 'foul_territory',
    WARNING_TRACK = 'warning_track',
    MOUND_HEIGHT = 'mound_height',
    FIELD_PATTERN = 'field_pattern',
    FOUL_LINES = 'foul_lines',
    BATTERS_BOXES = 'batters_boxes'
}

export enum StadiumAestheticElement {
    SEATING_STYLE = 'seating_style',
    SEATING_COLOR = 'seating_color',
    SCOREBOARD = 'scoreboard',
    VIDEO_BOARD = 'video_board',
    LIGHT_TOWERS = 'light_towers',
    DUGOUT_STYLE = 'dugout_style',
    BULLPEN_LOCATION = 'bullpen_location',
    WALL_PADDING = 'wall_padding',
    ADVERTISEMENTS = 'advertisements',
    ROOF_TYPE = 'roof_type',
    FACADE = 'facade',
    CONCOURSE = 'concourse'
}

export interface CustomizationOption {
    id: string;
    name: string;
    description: string;
    category: CustomizationCategory;
    slot: string;
    thumbnail: string;
    cost: number;
    currency: 'coins' | 'gems' | 'tickets';
    unlockRequirement?: {
        level?: number;
        achievement?: string;
        quest?: string;
        seasonPass?: boolean;
    };
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    isUnlocked: boolean;
    isPremium: boolean;
    isLimited: boolean;
    expirationDate?: Date;
}

export interface PlayerAppearance {
    faceShape: string;
    skinTone: Color3;
    hairStyle: string;
    hairColor: Color3;
    facialHair: string;
    eyeColor: Color3;
    eyebrows: string;
    nose: string;
    mouth: string;
    ears: string;
    bodyType: 'slim' | 'average' | 'athletic' | 'muscular' | 'heavy';
    height: number; // in cm
    muscleMass: number; // 0-100
    tattoos: TattooData[];
    accessories: string[];
}

export interface TattooData {
    id: string;
    design: string;
    location: 'arm_left' | 'arm_right' | 'chest' | 'back' | 'leg_left' | 'leg_right' | 'neck';
    size: number;
    rotation: number;
    opacity: number;
}

export interface EquipmentLoadout {
    bat: EquipmentItem;
    glove: EquipmentItem;
    helmet: EquipmentItem;
    battingGloves: EquipmentItem;
    cleats: EquipmentItem;
    wristBand?: EquipmentItem;
    elbowGuard?: EquipmentItem;
    shinGuard?: EquipmentItem;
    chestProtector?: EquipmentItem;
    catchersMask?: EquipmentItem;
    sunglasses?: EquipmentItem;
    necklace?: EquipmentItem;
    armSleeve?: EquipmentItem;
}

export interface EquipmentItem {
    id: string;
    name: string;
    model: string;
    brand: string;
    primaryColor: Color3;
    secondaryColor: Color3;
    accentColor: Color3;
    pattern?: string;
    decals: DecalData[];
    stats?: {
        power?: number;
        contact?: number;
        speed?: number;
        fielding?: number;
    };
}

export interface DecalData {
    id: string;
    texture: string;
    position: Vector2;
    size: number;
    rotation: number;
    color: Color3;
}

export interface TeamUniform {
    home: UniformSet;
    away: UniformSet;
    alternate: UniformSet[];
}

export interface UniformSet {
    id: string;
    name: string;
    jersey: JerseyData;
    pants: PantsData;
    socks: SocksData;
    cap: CapData;
    undershirt?: UndershirtData;
    belt: BeltData;
}

export interface JerseyData {
    style: 'button_up' | 'pullover' | 'vest';
    baseColor: Color3;
    trimColor: Color3;
    accentColor: Color3;
    pattern?: string;
    numberColor: Color3;
    numberFont: string;
    numberSize: number;
    nameColor: Color3;
    nameFont: string;
    patches: PatchData[];
    sponsor?: string;
}

export interface PantsData {
    style: 'full_length' | 'knickers' | 'shorts';
    baseColor: Color3;
    stripeColor: Color3;
    stripeStyle: 'none' | 'single' | 'double' | 'triple' | 'piping';
    beltLoops: boolean;
}

export interface SocksData {
    style: 'low' | 'mid' | 'high' | 'stirrups';
    baseColor: Color3;
    stripeColor: Color3;
    stripePattern: 'none' | 'horizontal' | 'vertical' | 'argyle';
}

export interface CapData {
    style: 'fitted' | 'snapback' | 'adjustable' | 'flat_brim';
    baseColor: Color3;
    billColor: Color3;
    buttonColor: Color3;
    logo: string;
}

export interface UndershirtData {
    style: 'short_sleeve' | 'long_sleeve' | 'sleeveless';
    color: Color3;
}

export interface BeltData {
    color: Color3;
    buckleStyle: string;
}

export interface PatchData {
    id: string;
    design: string;
    location: 'sleeve_left' | 'sleeve_right' | 'chest' | 'back';
    size: number;
}

export interface TeamBranding {
    teamName: string;
    teamAbbreviation: string;
    primaryLogo: LogoData;
    secondaryLogo?: LogoData;
    wordmark: LogoData;
    primaryColor: Color3;
    secondaryColor: Color3;
    tertiaryColor: Color3;
    accentColor: Color3;
    fonts: {
        primary: string;
        secondary: string;
        numbers: string;
    };
}

export interface LogoData {
    id: string;
    design: string;
    colors: Color3[];
    layers: LogoLayer[];
}

export interface LogoLayer {
    id: string;
    shape: string;
    color: Color3;
    position: Vector2;
    size: Vector2;
    rotation: number;
    opacity: number;
}

export interface StadiumCustomization {
    name: string;
    location: string;
    capacity: number;
    field: StadiumField;
    aesthetics: StadiumAesthetics;
    features: StadiumFeature[];
}

export interface StadiumField {
    grassType: 'natural' | 'artificial' | 'hybrid';
    grassPattern: 'checkerboard' | 'stripes' | 'diamonds' | 'custom';
    dirtColor: Color3;
    basePathLength: number; // feet
    outfieldDimensions: {
        leftField: number;
        leftCenter: number;
        center: number;
        rightCenter: number;
        rightField: number;
    };
    wallHeights: {
        leftField: number;
        leftCenter: number;
        center: number;
        rightCenter: number;
        rightField: number;
    };
    foulTerritorySize: 'small' | 'medium' | 'large';
    warningTrack: {
        enabled: boolean;
        width: number;
        color: Color3;
    };
    moundHeight: number; // inches
    foulLineColor: Color3;
    batterBoxColor: Color3;
}

export interface StadiumAesthetics {
    seatingStyle: 'modern' | 'classic' | 'retro' | 'futuristic';
    seatingColors: Color3[];
    scoreboard: {
        type: 'manual' | 'led' | 'video';
        size: 'small' | 'medium' | 'large' | 'massive';
        location: 'center_field' | 'left_field' | 'right_field';
    };
    videoBoard?: {
        size: Vector2;
        resolution: Vector2;
        location: string;
    };
    lightTowers: {
        count: number;
        style: 'classic' | 'modern' | 'integrated';
        brightness: number;
    };
    dugoutStyle: 'sunken' | 'ground_level' | 'raised';
    bullpenLocation: 'field_level' | 'below_stands' | 'separate_area';
    wallPadding: {
        enabled: boolean;
        color: Color3;
        thickness: number;
    };
    roofType: 'open' | 'retractable' | 'fixed_dome';
    facade: {
        style: string;
        color: Color3;
        material: 'brick' | 'concrete' | 'glass' | 'steel';
    };
}

export interface StadiumFeature {
    id: string;
    name: string;
    type: 'decorative' | 'functional' | 'interactive';
    position: Vector3;
    model: string;
    enabled: boolean;
}

export interface ColorPalette {
    id: string;
    name: string;
    colors: Color3[];
    category: 'team' | 'seasonal' | 'special' | 'user';
}

export interface DesignTemplate {
    id: string;
    name: string;
    description: string;
    category: CustomizationCategory;
    thumbnail: string;
    data: any;
    author: string;
    rating: number;
    downloads: number;
    tags: string[];
}

export class CustomizationSystem {
    private scene: Scene;
    private availableOptions: Map<CustomizationCategory, Map<string, CustomizationOption>>;
    private unlockedOptions: Set<string>;
    private playerAppearances: Map<string, PlayerAppearance>;
    private equipmentLoadouts: Map<string, EquipmentLoadout>;
    private teamUniforms: Map<string, TeamUniform>;
    private teamBranding: Map<string, TeamBranding>;
    private stadiumCustomizations: Map<string, StadiumCustomization>;
    private colorPalettes: Map<string, ColorPalette>;
    private designTemplates: Map<string, DesignTemplate>;
    private userDesigns: Map<string, any>;

    // Current customization state
    private activePlayer: string | null;
    private activeTeam: string | null;
    private activeStadium: string | null;
    private previewMeshes: Map<string, Mesh>;

    // Observables for events
    public onCustomizationApplied: Observable<{ category: CustomizationCategory; target: string }>;
    public onOptionUnlocked: Observable<CustomizationOption>;
    public onDesignSaved: Observable<{ category: CustomizationCategory; id: string }>;
    public onDesignShared: Observable<{ id: string; category: CustomizationCategory }>;
    public onTemplateDownloaded: Observable<DesignTemplate>;

    constructor(scene: Scene) {
        this.scene = scene;
        this.availableOptions = new Map();
        this.unlockedOptions = new Set();
        this.playerAppearances = new Map();
        this.equipmentLoadouts = new Map();
        this.teamUniforms = new Map();
        this.teamBranding = new Map();
        this.stadiumCustomizations = new Map();
        this.colorPalettes = new Map();
        this.designTemplates = new Map();
        this.userDesigns = new Map();

        this.activePlayer = null;
        this.activeTeam = null;
        this.activeStadium = null;
        this.previewMeshes = new Map();

        this.onCustomizationApplied = new Observable();
        this.onOptionUnlocked = new Observable();
        this.onDesignSaved = new Observable();
        this.onDesignShared = new Observable();
        this.onTemplateDownloaded = new Observable();

        this.initializeDefaultOptions();
        this.initializeColorPalettes();
    }

    private initializeDefaultOptions(): void {
        // Initialize player appearance options
        this.addCustomizationOptions(CustomizationCategory.PLAYER_APPEARANCE, [
            {
                id: 'face_oval',
                name: 'Oval Face',
                description: 'Classic oval face shape',
                category: CustomizationCategory.PLAYER_APPEARANCE,
                slot: PlayerAppearanceSlot.FACE_SHAPE,
                thumbnail: 'faces/oval.png',
                cost: 0,
                currency: 'coins',
                rarity: 'common',
                isUnlocked: true,
                isPremium: false,
                isLimited: false
            },
            {
                id: 'face_square',
                name: 'Square Face',
                description: 'Strong square jawline',
                category: CustomizationCategory.PLAYER_APPEARANCE,
                slot: PlayerAppearanceSlot.FACE_SHAPE,
                thumbnail: 'faces/square.png',
                cost: 100,
                currency: 'coins',
                rarity: 'common',
                isUnlocked: false,
                isPremium: false,
                isLimited: false
            },
            {
                id: 'face_round',
                name: 'Round Face',
                description: 'Soft round features',
                category: CustomizationCategory.PLAYER_APPEARANCE,
                slot: PlayerAppearanceSlot.FACE_SHAPE,
                thumbnail: 'faces/round.png',
                cost: 100,
                currency: 'coins',
                rarity: 'common',
                isUnlocked: false,
                isPremium: false,
                isLimited: false
            }
        ]);

        // Initialize equipment options
        this.addCustomizationOptions(CustomizationCategory.PLAYER_EQUIPMENT, [
            {
                id: 'bat_wood_maple',
                name: 'Maple Wood Bat',
                description: 'Classic maple wood construction',
                category: CustomizationCategory.PLAYER_EQUIPMENT,
                slot: EquipmentSlot.BAT,
                thumbnail: 'equipment/bat_maple.png',
                cost: 0,
                currency: 'coins',
                rarity: 'common',
                isUnlocked: true,
                isPremium: false,
                isLimited: false
            },
            {
                id: 'bat_aluminum_pro',
                name: 'Pro Aluminum Bat',
                description: 'Lightweight aluminum alloy',
                category: CustomizationCategory.PLAYER_EQUIPMENT,
                slot: EquipmentSlot.BAT,
                thumbnail: 'equipment/bat_aluminum.png',
                cost: 500,
                currency: 'coins',
                rarity: 'uncommon',
                isUnlocked: false,
                isPremium: false,
                isLimited: false
            },
            {
                id: 'bat_composite_elite',
                name: 'Elite Composite Bat',
                description: 'High-tech composite material',
                category: CustomizationCategory.PLAYER_EQUIPMENT,
                slot: EquipmentSlot.BAT,
                thumbnail: 'equipment/bat_composite.png',
                cost: 1000,
                currency: 'coins',
                rarity: 'rare',
                isUnlocked: false,
                isPremium: true,
                isLimited: false
            }
        ]);

        // Initialize more options for other categories...
    }

    private initializeColorPalettes(): void {
        // Standard MLB team color palettes
        this.addColorPalette({
            id: 'palette_classic_red_white',
            name: 'Classic Red & White',
            colors: [
                new Color3(0.8, 0, 0),
                new Color3(1, 1, 1),
                new Color3(0.1, 0.1, 0.1)
            ],
            category: 'team'
        });

        this.addColorPalette({
            id: 'palette_royal_blue_gold',
            name: 'Royal Blue & Gold',
            colors: [
                new Color3(0, 0.2, 0.8),
                new Color3(1, 0.84, 0),
                new Color3(1, 1, 1)
            ],
            category: 'team'
        });

        this.addColorPalette({
            id: 'palette_forest_green_yellow',
            name: 'Forest Green & Yellow',
            colors: [
                new Color3(0, 0.4, 0.2),
                new Color3(1, 1, 0),
                new Color3(1, 1, 1)
            ],
            category: 'team'
        });

        // Seasonal palettes
        this.addColorPalette({
            id: 'palette_summer',
            name: 'Summer Vibes',
            colors: [
                new Color3(1, 0.6, 0),
                new Color3(0.2, 0.8, 1),
                new Color3(1, 1, 0.8)
            ],
            category: 'seasonal'
        });

        this.addColorPalette({
            id: 'palette_halloween',
            name: 'Halloween',
            colors: [
                new Color3(1, 0.5, 0),
                new Color3(0.1, 0.1, 0.1),
                new Color3(0.5, 0, 0.8)
            ],
            category: 'seasonal'
        });

        this.addColorPalette({
            id: 'palette_christmas',
            name: 'Holiday Spirit',
            colors: [
                new Color3(0.8, 0, 0),
                new Color3(0, 0.6, 0.2),
                new Color3(1, 1, 1)
            ],
            category: 'seasonal'
        });
    }

    private addCustomizationOptions(category: CustomizationCategory, options: CustomizationOption[]): void {
        if (!this.availableOptions.has(category)) {
            this.availableOptions.set(category, new Map());
        }

        const categoryOptions = this.availableOptions.get(category)!;
        for (const option of options) {
            categoryOptions.set(option.id, option);
            if (option.isUnlocked) {
                this.unlockedOptions.add(option.id);
            }
        }
    }

    public createPlayerAppearance(playerId: string, appearance: Partial<PlayerAppearance>): PlayerAppearance {
        const defaultAppearance: PlayerAppearance = {
            faceShape: 'face_oval',
            skinTone: new Color3(0.8, 0.6, 0.5),
            hairStyle: 'short',
            hairColor: new Color3(0.2, 0.1, 0),
            facialHair: 'none',
            eyeColor: new Color3(0.3, 0.2, 0.1),
            eyebrows: 'normal',
            nose: 'medium',
            mouth: 'medium',
            ears: 'medium',
            bodyType: 'athletic',
            height: 180,
            muscleMass: 60,
            tattoos: [],
            accessories: []
        };

        const finalAppearance = { ...defaultAppearance, ...appearance };
        this.playerAppearances.set(playerId, finalAppearance);

        this.onCustomizationApplied.notifyObservers({
            category: CustomizationCategory.PLAYER_APPEARANCE,
            target: playerId
        });

        return finalAppearance;
    }

    public updatePlayerAppearance(playerId: string, updates: Partial<PlayerAppearance>): void {
        const appearance = this.playerAppearances.get(playerId);
        if (!appearance) return;

        Object.assign(appearance, updates);

        this.onCustomizationApplied.notifyObservers({
            category: CustomizationCategory.PLAYER_APPEARANCE,
            target: playerId
        });
    }

    public createEquipmentLoadout(playerId: string, loadout: Partial<EquipmentLoadout>): EquipmentLoadout {
        const defaultLoadout: EquipmentLoadout = {
            bat: this.createDefaultEquipment(EquipmentSlot.BAT),
            glove: this.createDefaultEquipment(EquipmentSlot.GLOVE),
            helmet: this.createDefaultEquipment(EquipmentSlot.HELMET),
            battingGloves: this.createDefaultEquipment(EquipmentSlot.BATTING_GLOVES),
            cleats: this.createDefaultEquipment(EquipmentSlot.CLEATS)
        };

        const finalLoadout = { ...defaultLoadout, ...loadout };
        this.equipmentLoadouts.set(playerId, finalLoadout);

        this.onCustomizationApplied.notifyObservers({
            category: CustomizationCategory.PLAYER_EQUIPMENT,
            target: playerId
        });

        return finalLoadout;
    }

    private createDefaultEquipment(slot: EquipmentSlot): EquipmentItem {
        return {
            id: `default_${slot}`,
            name: `Default ${slot}`,
            model: `models/${slot}/default.glb`,
            brand: 'Generic',
            primaryColor: new Color3(0, 0, 0),
            secondaryColor: new Color3(1, 1, 1),
            accentColor: new Color3(0.5, 0.5, 0.5),
            decals: []
        };
    }

    public createTeamUniform(teamId: string, uniform: Partial<TeamUniform>): TeamUniform {
        const defaultUniform: TeamUniform = {
            home: this.createDefaultUniformSet('home'),
            away: this.createDefaultUniformSet('away'),
            alternate: []
        };

        const finalUniform = { ...defaultUniform, ...uniform };
        this.teamUniforms.set(teamId, finalUniform);

        this.onCustomizationApplied.notifyObservers({
            category: CustomizationCategory.TEAM_UNIFORM,
            target: teamId
        });

        return finalUniform;
    }

    private createDefaultUniformSet(type: 'home' | 'away'): UniformSet {
        const isHome = type === 'home';

        return {
            id: `${type}_default`,
            name: `Default ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            jersey: {
                style: 'button_up',
                baseColor: isHome ? new Color3(1, 1, 1) : new Color3(0.5, 0.5, 0.5),
                trimColor: new Color3(0, 0, 0),
                accentColor: new Color3(0.8, 0, 0),
                numberColor: new Color3(0, 0, 0),
                numberFont: 'Athletic',
                numberSize: 1.0,
                nameColor: new Color3(0, 0, 0),
                nameFont: 'Athletic',
                patches: []
            },
            pants: {
                style: 'full_length',
                baseColor: isHome ? new Color3(1, 1, 1) : new Color3(0.5, 0.5, 0.5),
                stripeColor: new Color3(0, 0, 0),
                stripeStyle: 'single',
                beltLoops: true
            },
            socks: {
                style: 'high',
                baseColor: new Color3(0, 0, 0),
                stripeColor: new Color3(1, 1, 1),
                stripePattern: 'horizontal'
            },
            cap: {
                style: 'fitted',
                baseColor: isHome ? new Color3(0, 0, 0) : new Color3(0.5, 0.5, 0.5),
                billColor: new Color3(0, 0, 0),
                buttonColor: new Color3(1, 1, 1),
                logo: 'default_logo'
            },
            belt: {
                color: new Color3(0, 0, 0),
                buckleStyle: 'standard'
            }
        };
    }

    public createTeamBranding(teamId: string, branding: Partial<TeamBranding>): TeamBranding {
        const defaultBranding: TeamBranding = {
            teamName: 'New Team',
            teamAbbreviation: 'NT',
            primaryLogo: this.createDefaultLogo(),
            wordmark: this.createDefaultLogo(), // Use same default for now
            primaryColor: new Color3(0.8, 0, 0),
            secondaryColor: new Color3(0, 0, 0),
            tertiaryColor: new Color3(1, 1, 1),
            accentColor: new Color3(1, 0.84, 0),
            fonts: {
                primary: 'Athletic',
                secondary: 'Script',
                numbers: 'Block'
            }
        };

        const finalBranding = { ...defaultBranding, ...branding };
        this.teamBranding.set(teamId, finalBranding);

        this.onCustomizationApplied.notifyObservers({
            category: CustomizationCategory.TEAM_BRANDING,
            target: teamId
        });

        return finalBranding;
    }

    private createDefaultLogo(): LogoData {
        return {
            id: 'default_logo',
            design: 'circle',
            colors: [new Color3(0.8, 0, 0), new Color3(1, 1, 1)],
            layers: [
                {
                    id: 'background',
                    shape: 'circle',
                    color: new Color3(0.8, 0, 0),
                    position: new Vector2(0, 0),
                    size: new Vector2(1, 1),
                    rotation: 0,
                    opacity: 1
                },
                {
                    id: 'foreground',
                    shape: 'circle',
                    color: new Color3(1, 1, 1),
                    position: new Vector2(0, 0),
                    size: new Vector2(0.8, 0.8),
                    rotation: 0,
                    opacity: 1
                }
            ]
        };
    }

    public createStadiumCustomization(stadiumId: string, customization: Partial<StadiumCustomization>): StadiumCustomization {
        const defaultCustomization: StadiumCustomization = {
            name: 'New Stadium',
            location: 'Unknown',
            capacity: 40000,
            field: this.createDefaultStadiumField(),
            aesthetics: this.createDefaultStadiumAesthetics(),
            features: []
        };

        const finalCustomization = { ...defaultCustomization, ...customization };
        this.stadiumCustomizations.set(stadiumId, finalCustomization);

        this.onCustomizationApplied.notifyObservers({
            category: CustomizationCategory.STADIUM_FIELD,
            target: stadiumId
        });

        return finalCustomization;
    }

    private createDefaultStadiumField(): StadiumField {
        return {
            grassType: 'natural',
            grassPattern: 'stripes',
            dirtColor: new Color3(0.6, 0.4, 0.2),
            basePathLength: 90,
            outfieldDimensions: {
                leftField: 330,
                leftCenter: 375,
                center: 400,
                rightCenter: 375,
                rightField: 330
            },
            wallHeights: {
                leftField: 8,
                leftCenter: 8,
                center: 10,
                rightCenter: 8,
                rightField: 8
            },
            foulTerritorySize: 'medium',
            warningTrack: {
                enabled: true,
                width: 15,
                color: new Color3(0.7, 0.5, 0.3)
            },
            moundHeight: 10,
            foulLineColor: new Color3(1, 1, 1),
            batterBoxColor: new Color3(1, 1, 1)
        };
    }

    private createDefaultStadiumAesthetics(): StadiumAesthetics {
        return {
            seatingStyle: 'modern',
            seatingColors: [new Color3(0.2, 0.4, 0.8), new Color3(0.8, 0, 0)],
            scoreboard: {
                type: 'led',
                size: 'large',
                location: 'center_field'
            },
            lightTowers: {
                count: 6,
                style: 'modern',
                brightness: 1.0
            },
            dugoutStyle: 'sunken',
            bullpenLocation: 'field_level',
            wallPadding: {
                enabled: true,
                color: new Color3(0, 0.4, 0),
                thickness: 0.3
            },
            roofType: 'open',
            facade: {
                style: 'modern',
                color: new Color3(0.8, 0.8, 0.8),
                material: 'concrete'
            }
        };
    }

    public unlockOption(optionId: string): boolean {
        for (const categoryOptions of this.availableOptions.values()) {
            const option = categoryOptions.get(optionId);
            if (option && !option.isUnlocked) {
                option.isUnlocked = true;
                this.unlockedOptions.add(optionId);
                this.onOptionUnlocked.notifyObservers(option);
                return true;
            }
        }
        return false;
    }

    public isOptionUnlocked(optionId: string): boolean {
        return this.unlockedOptions.has(optionId);
    }

    public getAvailableOptions(category: CustomizationCategory, slot?: string): CustomizationOption[] {
        const categoryOptions = this.availableOptions.get(category);
        if (!categoryOptions) return [];

        let options = Array.from(categoryOptions.values());

        if (slot) {
            options = options.filter(opt => opt.slot === slot);
        }

        return options;
    }

    public getUnlockedOptions(category: CustomizationCategory, slot?: string): CustomizationOption[] {
        return this.getAvailableOptions(category, slot).filter(opt => opt.isUnlocked);
    }

    public addColorPalette(palette: ColorPalette): void {
        this.colorPalettes.set(palette.id, palette);
    }

    public getColorPalettes(category?: 'team' | 'seasonal' | 'special' | 'user'): ColorPalette[] {
        const palettes = Array.from(this.colorPalettes.values());
        if (category) {
            return palettes.filter(p => p.category === category);
        }
        return palettes;
    }

    public saveDesignTemplate(template: DesignTemplate): void {
        this.designTemplates.set(template.id, template);
        this.onDesignSaved.notifyObservers({
            category: template.category,
            id: template.id
        });
    }

    public loadDesignTemplate(templateId: string): DesignTemplate | null {
        return this.designTemplates.get(templateId) || null;
    }

    public searchDesignTemplates(query: {
        category?: CustomizationCategory;
        tags?: string[];
        minRating?: number;
        author?: string;
    }): DesignTemplate[] {
        let results = Array.from(this.designTemplates.values());

        if (query.category) {
            results = results.filter(t => t.category === query.category);
        }

        if (query.tags && query.tags.length > 0) {
            results = results.filter(t => query.tags!.some(tag => t.tags.includes(tag)));
        }

        if (query.minRating !== undefined) {
            results = results.filter(t => t.rating >= query.minRating!);
        }

        if (query.author) {
            results = results.filter(t => t.author === query.author);
        }

        return results;
    }

    public shareDesign(designId: string, category: CustomizationCategory): void {
        this.onDesignShared.notifyObservers({ id: designId, category });
    }

    public downloadTemplate(templateId: string): void {
        const template = this.designTemplates.get(templateId);
        if (template) {
            template.downloads++;
            this.onTemplateDownloaded.notifyObservers(template);
        }
    }

    public rateTemplate(templateId: string, rating: number): void {
        const template = this.designTemplates.get(templateId);
        if (template) {
            template.rating = Math.max(0, Math.min(5, rating));
        }
    }

    public dispose(): void {
        this.availableOptions.clear();
        this.unlockedOptions.clear();
        this.playerAppearances.clear();
        this.equipmentLoadouts.clear();
        this.teamUniforms.clear();
        this.teamBranding.clear();
        this.stadiumCustomizations.clear();
        this.colorPalettes.clear();
        this.designTemplates.clear();
        this.userDesigns.clear();
        this.previewMeshes.clear();
    }

    // Export/Import for save system
    public exportCustomizationData(): any {
        return {
            unlockedOptions: Array.from(this.unlockedOptions),
            playerAppearances: Array.from(this.playerAppearances.entries()),
            equipmentLoadouts: Array.from(this.equipmentLoadouts.entries()),
            teamUniforms: Array.from(this.teamUniforms.entries()),
            teamBranding: Array.from(this.teamBranding.entries()),
            stadiumCustomizations: Array.from(this.stadiumCustomizations.entries()),
            userDesigns: Array.from(this.userDesigns.entries())
        };
    }

    public importCustomizationData(data: any): void {
        if (data.unlockedOptions) {
            this.unlockedOptions = new Set(data.unlockedOptions);
        }
        if (data.playerAppearances) {
            this.playerAppearances = new Map(data.playerAppearances);
        }
        if (data.equipmentLoadouts) {
            this.equipmentLoadouts = new Map(data.equipmentLoadouts);
        }
        if (data.teamUniforms) {
            this.teamUniforms = new Map(data.teamUniforms);
        }
        if (data.teamBranding) {
            this.teamBranding = new Map(data.teamBranding);
        }
        if (data.stadiumCustomizations) {
            this.stadiumCustomizations = new Map(data.stadiumCustomizations);
        }
        if (data.userDesigns) {
            this.userDesigns = new Map(data.userDesigns);
        }
    }
}
