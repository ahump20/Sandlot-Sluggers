import { Scene, Mesh, Vector3, Color3, Color4, StandardMaterial, PBRMaterial, Texture, DynamicTexture, MeshBuilder, TransformNode, InstancedMesh, SceneLoader, AssetContainer } from '@babylonjs/core';

/**
 * Stadium types
 */
export enum StadiumType {
    CLASSIC_BALLPARK = 'classic_ballpark',
    MODERN_STADIUM = 'modern_stadium',
    RETRO_FIELD = 'retro_field',
    DOME_STADIUM = 'dome_stadium',
    SPRING_TRAINING = 'spring_training',
    LITTLE_LEAGUE = 'little_league',
    SANDLOT = 'sandlot',
    COLLEGE_FIELD = 'college_field',
    MINOR_LEAGUE = 'minor_league',
    WORLD_SERIES_VENUE = 'world_series_venue'
}

/**
 * Field surface types
 */
export enum FieldSurface {
    NATURAL_GRASS = 'natural_grass',
    ARTIFICIAL_TURF = 'artificial_turf',
    HYBRID_GRASS = 'hybrid_grass',
    DIRT = 'dirt',
    CLAY = 'clay'
}

/**
 * Wall types
 */
export enum WallType {
    BRICK = 'brick',
    PADDING = 'padding',
    METAL = 'metal',
    IVY = 'ivy',
    SCOREBOARD = 'scoreboard',
    GLASS = 'glass',
    CUSTOM = 'custom'
}

/**
 * Lighting configuration
 */
export enum LightingType {
    DAY_CLEAR = 'day_clear',
    DAY_OVERCAST = 'day_overcast',
    DAY_SUNSET = 'day_sunset',
    NIGHT_STADIUM_LIGHTS = 'night_stadium_lights',
    NIGHT_BRIGHT = 'night_bright',
    NIGHT_DIM = 'night_dim',
    TWILIGHT = 'twilight'
}

/**
 * Weather conditions
 */
export enum WeatherCondition {
    CLEAR = 'clear',
    PARTLY_CLOUDY = 'partly_cloudy',
    OVERCAST = 'overcast',
    LIGHT_RAIN = 'light_rain',
    HEAVY_RAIN = 'heavy_rain',
    FOG = 'fog',
    SNOW = 'snow',
    WINDY = 'windy'
}

/**
 * Stadium features
 */
export interface StadiumFeatures {
    retractableRoof: boolean;
    videoScoreboard: boolean;
    ribbonBoards: boolean;
    manualScoreboard: boolean;
    fountains: boolean;
    fireworks: boolean;
    monumentPark: boolean;
    bullpen: 'open' | 'dugout' | 'beyond_outfield';
    dugoutStyle: 'ground_level' | 'below_ground' | 'raised';
    battersEye: boolean;
    cupHolders: boolean;
    luxuryBoxes: boolean;
    partyDeck: boolean;
}

/**
 * Stadium dimensions
 */
export interface StadiumDimensions {
    leftFieldLine: number;      // Distance to left field foul pole
    leftCenter: number;          // Distance to left-center power alley
    centerField: number;         // Distance to center field
    rightCenter: number;         // Distance to right-center power alley
    rightFieldLine: number;      // Distance to right field foul pole
    leftFieldWallHeight: number;
    centerFieldWallHeight: number;
    rightFieldWallHeight: number;
    foulTerritory: 'small' | 'medium' | 'large';
    backstopDistance: number;    // Distance from home to backstop
}

/**
 * Field customization
 */
export interface FieldCustomization {
    surface: FieldSurface;
    grassColor: Color3;
    dirtColor: Color3;
    basePathColor: Color3;
    moundColor: Color3;
    foulLineColor: Color3;
    batterBoxColor: Color3;
    patternType: 'checkerboard' | 'stripes' | 'diagonal' | 'none';
    patternDirection: number;
    logoAtSecondBase: boolean;
    logoTexture?: string;
}

/**
 * Wall customization
 */
export interface WallCustomization {
    leftFieldWallType: WallType;
    centerFieldWallType: WallType;
    rightFieldWallType: WallType;
    wallColor: Color3;
    paddingColor: Color3;
    advertisingBoards: boolean;
    customDecals: DecalConfig[];
}

/**
 * Decal configuration
 */
export interface DecalConfig {
    id: string;
    texture: string;
    position: Vector3;
    rotation: number;
    scale: Vector3;
    wall: 'left' | 'center' | 'right';
}

/**
 * Seating configuration
 */
export interface SeatingConfig {
    capacity: number;
    deckLevels: number;
    seatColor: Color3;
    aisleColor: Color3;
    standingRoomOnly: boolean;
    bleachers: boolean;
    bleacherSections: number;
}

/**
 * Scoreboard configuration
 */
export interface ScoreboardConfig {
    type: 'modern_led' | 'classic_manual' | 'hybrid';
    size: 'small' | 'medium' | 'large' | 'massive';
    position: 'center_field' | 'left_field' | 'right_field' | 'above_home';
    showReplays: boolean;
    showStats: boolean;
    showAdvertisements: boolean;
}

/**
 * Environment settings
 */
export interface EnvironmentSettings {
    skybox: string;
    weatherCondition: WeatherCondition;
    lighting: LightingType;
    timeOfDay: number; // 0-24
    ambientLightIntensity: number;
    sunIntensity: number;
    shadowQuality: 'low' | 'medium' | 'high' | 'ultra';
    fogEnabled: boolean;
    fogDensity: number;
    fogColor: Color3;
}

/**
 * Custom prop configuration
 */
export interface CustomProp {
    id: string;
    name: string;
    meshName: string;
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
    visible: boolean;
}

/**
 * Stadium configuration
 */
export interface StadiumConfiguration {
    id: string;
    name: string;
    type: StadiumType;
    dimensions: StadiumDimensions;
    features: StadiumFeatures;
    field: FieldCustomization;
    walls: WallCustomization;
    seating: SeatingConfig;
    scoreboard: ScoreboardConfig;
    environment: EnvironmentSettings;
    customProps: CustomProp[];
    timestamp: number;
}

/**
 * Stadium template (predefined configurations)
 */
export interface StadiumTemplate {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    config: StadiumConfiguration;
    tags: string[];
    popularity: number;
}

/**
 * Stadium Customization System
 * Comprehensive stadium building and customization with procedural generation
 */
export class StadiumCustomizationSystem {
    private scene: Scene;

    // Current stadium
    private currentConfig: StadiumConfiguration | null = null;
    private stadiumRoot: TransformNode | null = null;

    // Stadium components
    private fieldMesh: Mesh | null = null;
    private walls: Map<string, Mesh> = new Map();
    private seating: Mesh[] = [];
    private scoreboard: Mesh | null = null;
    private props: Map<string, Mesh> = new Map();

    // Templates
    private templates: Map<string, StadiumTemplate> = new Map();

    // Asset containers
    private assetContainers: Map<string, AssetContainer> = new Map();

    // Materials
    private materials: Map<string, StandardMaterial | PBRMaterial> = new Map();

    // MLB-accurate dimensions
    private readonly MLB_REGULATIONS = {
        minLeftFieldLine: 325,      // feet
        minCenterField: 400,
        minRightFieldLine: 325,
        pitcherMoundDistance: 60.5, // feet from home plate
        basePath: 90,               // feet between bases
        pitcherMoundHeight: 10,     // inches
        battingBoxWidth: 4,         // feet
        battingBoxLength: 6,        // feet
        foulLineWidth: 0.25        // feet (3 inches)
    };

    constructor(scene: Scene) {
        this.scene = scene;
        this.initializeTemplates();
        this.initializeMaterials();
    }

    /**
     * Initialize stadium templates
     */
    private initializeTemplates(): void {
        // Classic Ballpark (Fenway-inspired)
        const fenway: StadiumTemplate = {
            id: 'fenway_classic',
            name: 'Green Monster Classic',
            description: 'Intimate classic ballpark with iconic left field wall',
            thumbnail: '/assets/thumbnails/fenway.jpg',
            config: {
                id: 'fenway_classic',
                name: 'Green Monster Classic',
                type: StadiumType.CLASSIC_BALLPARK,
                dimensions: {
                    leftFieldLine: 310,
                    leftCenter: 379,
                    centerField: 390,
                    rightCenter: 420,
                    rightFieldLine: 302,
                    leftFieldWallHeight: 37.167, // The Green Monster: 37'2"
                    centerFieldWallHeight: 17,
                    rightFieldWallHeight: 3,
                    foulTerritory: 'small',
                    backstopDistance: 60
                },
                features: {
                    retractableRoof: false,
                    videoScoreboard: false,
                    ribbonBoards: false,
                    manualScoreboard: true,
                    fountains: false,
                    fireworks: false,
                    monumentPark: false,
                    bullpen: 'beyond_outfield',
                    dugoutStyle: 'below_ground',
                    battersEye: true,
                    cupHolders: true,
                    luxuryBoxes: true,
                    partyDeck: false
                },
                field: {
                    surface: FieldSurface.NATURAL_GRASS,
                    grassColor: new Color3(0.1, 0.6, 0.1),
                    dirtColor: new Color3(0.6, 0.4, 0.2),
                    basePathColor: new Color3(0.7, 0.5, 0.3),
                    moundColor: new Color3(0.65, 0.45, 0.25),
                    foulLineColor: new Color3(1, 1, 1),
                    batterBoxColor: new Color3(0.9, 0.9, 0.9),
                    patternType: 'stripes',
                    patternDirection: 45,
                    logoAtSecondBase: true
                },
                walls: {
                    leftFieldWallType: WallType.PADDING,
                    centerFieldWallType: WallType.PADDING,
                    rightFieldWallType: WallType.BRICK,
                    wallColor: new Color3(0.1, 0.4, 0.1), // Green
                    paddingColor: new Color3(0.1, 0.5, 0.1),
                    advertisingBoards: true,
                    customDecals: []
                },
                seating: {
                    capacity: 37755,
                    deckLevels: 3,
                    seatColor: new Color3(0.0, 0.2, 0.6),
                    aisleColor: new Color3(0.5, 0.5, 0.5),
                    standingRoomOnly: false,
                    bleachers: true,
                    bleacherSections: 2
                },
                scoreboard: {
                    type: 'classic_manual',
                    size: 'large',
                    position: 'center_field',
                    showReplays: false,
                    showStats: true,
                    showAdvertisements: false
                },
                environment: {
                    skybox: 'boston_day',
                    weatherCondition: WeatherCondition.CLEAR,
                    lighting: LightingType.DAY_CLEAR,
                    timeOfDay: 14,
                    ambientLightIntensity: 0.8,
                    sunIntensity: 1.0,
                    shadowQuality: 'high',
                    fogEnabled: false,
                    fogDensity: 0,
                    fogColor: new Color3(0.8, 0.8, 0.8)
                },
                customProps: [],
                timestamp: Date.now()
            },
            tags: ['classic', 'iconic', 'historic', 'green_monster'],
            popularity: 95
        };
        this.templates.set('fenway_classic', fenway);

        // Modern Stadium (Yankee Stadium-inspired)
        const yankee: StadiumTemplate = {
            id: 'yankee_modern',
            name: 'Monument Park Stadium',
            description: 'Modern stadium honoring baseball history',
            thumbnail: '/assets/thumbnails/yankee.jpg',
            config: {
                id: 'yankee_modern',
                name: 'Monument Park Stadium',
                type: StadiumType.MODERN_STADIUM,
                dimensions: {
                    leftFieldLine: 318,
                    leftCenter: 399,
                    centerField: 408,
                    rightCenter: 385,
                    rightFieldLine: 314,
                    leftFieldWallHeight: 8,
                    centerFieldWallHeight: 8,
                    rightFieldWallHeight: 8,
                    foulTerritory: 'large',
                    backstopDistance: 52
                },
                features: {
                    retractableRoof: false,
                    videoScoreboard: true,
                    ribbonBoards: true,
                    manualScoreboard: false,
                    fountains: false,
                    fireworks: true,
                    monumentPark: true,
                    bullpen: 'beyond_outfield',
                    dugoutStyle: 'below_ground',
                    battersEye: true,
                    cupHolders: true,
                    luxuryBoxes: true,
                    partyDeck: true
                },
                field: {
                    surface: FieldSurface.NATURAL_GRASS,
                    grassColor: new Color3(0.15, 0.6, 0.15),
                    dirtColor: new Color3(0.7, 0.5, 0.3),
                    basePathColor: new Color3(0.75, 0.55, 0.35),
                    moundColor: new Color3(0.7, 0.5, 0.3),
                    foulLineColor: new Color3(1, 1, 1),
                    batterBoxColor: new Color3(1, 1, 1),
                    patternType: 'checkerboard',
                    patternDirection: 0,
                    logoAtSecondBase: true
                },
                walls: {
                    leftFieldWallType: WallType.PADDING,
                    centerFieldWallType: WallType.PADDING,
                    rightFieldWallType: WallType.PADDING,
                    wallColor: new Color3(0.1, 0.1, 0.3),
                    paddingColor: new Color3(0.1, 0.2, 0.5),
                    advertisingBoards: true,
                    customDecals: []
                },
                seating: {
                    capacity: 46537,
                    deckLevels: 4,
                    seatColor: new Color3(0.1, 0.2, 0.5),
                    aisleColor: new Color3(0.5, 0.5, 0.5),
                    standingRoomOnly: false,
                    bleachers: true,
                    bleacherSections: 1
                },
                scoreboard: {
                    type: 'modern_led',
                    size: 'massive',
                    position: 'center_field',
                    showReplays: true,
                    showStats: true,
                    showAdvertisements: true
                },
                environment: {
                    skybox: 'new_york_day',
                    weatherCondition: WeatherCondition.CLEAR,
                    lighting: LightingType.DAY_CLEAR,
                    timeOfDay: 13,
                    ambientLightIntensity: 0.9,
                    sunIntensity: 1.2,
                    shadowQuality: 'ultra',
                    fogEnabled: false,
                    fogDensity: 0,
                    fogColor: new Color3(0.9, 0.9, 0.9)
                },
                customProps: [],
                timestamp: Date.now()
            },
            tags: ['modern', 'iconic', 'historic', 'monument'],
            popularity: 98
        };
        this.templates.set('yankee_modern', yankee);

        // Sandlot Field
        const sandlot: StadiumTemplate = {
            id: 'sandlot_field',
            name: 'Backyard Sandlot',
            description: 'Nostalgic neighborhood sandlot with makeshift equipment',
            thumbnail: '/assets/thumbnails/sandlot.jpg',
            config: {
                id: 'sandlot_field',
                name: 'Backyard Sandlot',
                type: StadiumType.SANDLOT,
                dimensions: {
                    leftFieldLine: 200,
                    leftCenter: 250,
                    centerField: 280,
                    rightCenter: 250,
                    rightFieldLine: 200,
                    leftFieldWallHeight: 0,
                    centerFieldWallHeight: 0,
                    rightFieldWallHeight: 0,
                    foulTerritory: 'small',
                    backstopDistance: 40
                },
                features: {
                    retractableRoof: false,
                    videoScoreboard: false,
                    ribbonBoards: false,
                    manualScoreboard: false,
                    fountains: false,
                    fireworks: false,
                    monumentPark: false,
                    bullpen: 'open',
                    dugoutStyle: 'ground_level',
                    battersEye: false,
                    cupHolders: false,
                    luxuryBoxes: false,
                    partyDeck: false
                },
                field: {
                    surface: FieldSurface.DIRT,
                    grassColor: new Color3(0.3, 0.5, 0.2),
                    dirtColor: new Color3(0.5, 0.35, 0.2),
                    basePathColor: new Color3(0.5, 0.35, 0.2),
                    moundColor: new Color3(0.5, 0.35, 0.2),
                    foulLineColor: new Color3(0.9, 0.9, 0.9),
                    batterBoxColor: new Color3(0.8, 0.8, 0.8),
                    patternType: 'none',
                    patternDirection: 0,
                    logoAtSecondBase: false
                },
                walls: {
                    leftFieldWallType: WallType.CUSTOM,
                    centerFieldWallType: WallType.CUSTOM,
                    rightFieldWallType: WallType.CUSTOM,
                    wallColor: new Color3(0.4, 0.3, 0.2),
                    paddingColor: new Color3(0.4, 0.3, 0.2),
                    advertisingBoards: false,
                    customDecals: []
                },
                seating: {
                    capacity: 50,
                    deckLevels: 1,
                    seatColor: new Color3(0.6, 0.4, 0.2),
                    aisleColor: new Color3(0.5, 0.4, 0.3),
                    standingRoomOnly: true,
                    bleachers: true,
                    bleacherSections: 2
                },
                scoreboard: {
                    type: 'classic_manual',
                    size: 'small',
                    position: 'center_field',
                    showReplays: false,
                    showStats: false,
                    showAdvertisements: false
                },
                environment: {
                    skybox: 'suburban_summer',
                    weatherCondition: WeatherCondition.CLEAR,
                    lighting: LightingType.DAY_SUNSET,
                    timeOfDay: 17,
                    ambientLightIntensity: 0.7,
                    sunIntensity: 0.9,
                    shadowQuality: 'medium',
                    fogEnabled: false,
                    fogDensity: 0,
                    fogColor: new Color3(0.9, 0.8, 0.7)
                },
                customProps: [],
                timestamp: Date.now()
            },
            tags: ['sandlot', 'casual', 'nostalgic', 'vintage'],
            popularity: 75
        };
        this.templates.set('sandlot_field', sandlot);
    }

    /**
     * Initialize materials
     */
    private initializeMaterials(): void {
        // Grass material
        const grassMat = new PBRMaterial('grass_material', this.scene);
        grassMat.albedoColor = new Color3(0.15, 0.6, 0.15);
        grassMat.metallic = 0.0;
        grassMat.roughness = 0.9;
        this.materials.set('grass', grassMat);

        // Dirt material
        const dirtMat = new PBRMaterial('dirt_material', this.scene);
        dirtMat.albedoColor = new Color3(0.6, 0.4, 0.2);
        dirtMat.metallic = 0.0;
        dirtMat.roughness = 0.95;
        this.materials.set('dirt', dirtMat);

        // Wall padding material
        const paddingMat = new PBRMaterial('padding_material', this.scene);
        paddingMat.albedoColor = new Color3(0.1, 0.4, 0.1);
        paddingMat.metallic = 0.1;
        paddingMat.roughness = 0.7;
        this.materials.set('padding', paddingMat);

        // Seat material
        const seatMat = new StandardMaterial('seat_material', this.scene);
        seatMat.diffuseColor = new Color3(0.1, 0.2, 0.6);
        seatMat.specularColor = new Color3(0.2, 0.2, 0.2);
        this.materials.set('seat', seatMat);
    }

    /**
     * Build stadium from configuration
     */
    public buildStadium(config: StadiumConfiguration): void {
        // Clear existing stadium
        this.clearStadium();

        this.currentConfig = config;
        this.stadiumRoot = new TransformNode('stadium_root', this.scene);

        // Build components
        this.buildField(config.field, config.dimensions);
        this.buildWalls(config.walls, config.dimensions);
        this.buildSeating(config.seating, config.dimensions);
        this.buildScoreboard(config.scoreboard, config.dimensions);
        this.buildProps(config.customProps);

        // Apply environment
        this.applyEnvironment(config.environment);
    }

    /**
     * Build field
     */
    private buildField(field: FieldCustomization, dimensions: StadiumDimensions): void {
        // Create field base
        const fieldSize = Math.max(dimensions.centerField, 500);

        // Main grass/turf area
        const grass = MeshBuilder.CreateGround('field_grass', {
            width: fieldSize * 2,
            height: fieldSize * 2,
            subdivisions: 50
        }, this.scene);

        grass.parent = this.stadiumRoot;

        // Apply material
        const grassMat = this.materials.get('grass')?.clone('field_grass_mat') as PBRMaterial;
        if (grassMat) {
            grassMat.albedoColor = field.grassColor.clone();

            // Add pattern if specified
            if (field.patternType !== 'none') {
                this.applyFieldPattern(grassMat, field.patternType, field.patternDirection);
            }

            grass.material = grassMat;
        }

        // Create dirt areas
        this.buildInfieldDirt(field, grass);
        this.buildWarningTrack(field, dimensions, grass);
        this.buildBasePaths(field);
        this.buildPitcherMound(field);
        this.buildBatterBoxes(field);
        this.buildFoulLines(field, dimensions);

        this.fieldMesh = grass;
    }

    /**
     * Apply field pattern (stripes, checkerboard, etc.)
     */
    private applyFieldPattern(material: PBRMaterial, patternType: string, direction: number): void {
        const dynamicTexture = new DynamicTexture('field_pattern', 512, this.scene, false);
        const ctx = dynamicTexture.getContext();

        ctx.fillStyle = 'rgb(20, 100, 20)';
        ctx.fillRect(0, 0, 512, 512);

        ctx.fillStyle = 'rgb(15, 90, 15)';

        if (patternType === 'stripes') {
            // Draw stripes
            const stripeWidth = 32;
            for (let i = 0; i < 512; i += stripeWidth * 2) {
                ctx.fillRect(i, 0, stripeWidth, 512);
            }
        } else if (patternType === 'checkerboard') {
            // Draw checkerboard
            const squareSize = 64;
            for (let y = 0; y < 512; y += squareSize) {
                for (let x = 0; x < 512; x += squareSize) {
                    if ((x / squareSize + y / squareSize) % 2 === 0) {
                        ctx.fillRect(x, y, squareSize, squareSize);
                    }
                }
            }
        }

        dynamicTexture.update();
        material.albedoTexture = dynamicTexture;
    }

    /**
     * Build infield dirt
     */
    private buildInfieldDirt(field: FieldCustomization, grass: Mesh): void {
        // Create dirt circle for infield
        const dirt = MeshBuilder.CreateDisc('infield_dirt', {
            radius: 95, // 95 feet radius
            tessellation: 64
        }, this.scene);

        dirt.rotation.x = Math.PI / 2;
        dirt.position.y = 0.01;
        dirt.parent = this.stadiumRoot;

        const dirtMat = this.materials.get('dirt')?.clone('infield_dirt_mat') as PBRMaterial;
        if (dirtMat) {
            dirtMat.albedoColor = field.dirtColor.clone();
            dirt.material = dirtMat;
        }
    }

    /**
     * Build warning track
     */
    private buildWarningTrack(field: FieldCustomization, dimensions: StadiumDimensions, grass: Mesh): void {
        // Create warning track around outfield
        const trackWidth = 15; // 15 feet wide

        // Simplified warning track as a ring
        const track = MeshBuilder.CreateTorus('warning_track', {
            diameter: dimensions.centerField * 1.8,
            thickness: trackWidth,
            tessellation: 64
        }, this.scene);

        track.rotation.x = Math.PI / 2;
        track.position.y = 0.01;
        track.parent = this.stadiumRoot;

        const trackMat = this.materials.get('dirt')?.clone('warning_track_mat') as PBRMaterial;
        if (trackMat) {
            trackMat.albedoColor = new Color3(0.5, 0.35, 0.2);
            track.material = trackMat;
        }
    }

    /**
     * Build base paths
     */
    private buildBasePaths(field: FieldCustomization): void {
        // Create dirt paths between bases
        const pathWidth = 6; // feet
        const baseDistance = this.MLB_REGULATIONS.basePath;

        // First to second base path
        this.createBasePath(
            new Vector3(baseDistance, 0, baseDistance),
            new Vector3(0, 0, -baseDistance),
            pathWidth,
            field.basePathColor
        );

        // Second to third base path
        this.createBasePath(
            new Vector3(0, 0, -baseDistance),
            new Vector3(-baseDistance, 0, baseDistance),
            pathWidth,
            field.basePathColor
        );

        // Third to home path
        this.createBasePath(
            new Vector3(-baseDistance, 0, baseDistance),
            new Vector3(0, 0, baseDistance),
            pathWidth,
            field.basePathColor
        );

        // Home to first path
        this.createBasePath(
            new Vector3(0, 0, baseDistance),
            new Vector3(baseDistance, 0, baseDistance),
            pathWidth,
            field.basePathColor
        );
    }

    /**
     * Create a base path between two points
     */
    private createBasePath(start: Vector3, end: Vector3, width: number, color: Color3): void {
        const path = MeshBuilder.CreateBox('base_path', {
            width: width,
            height: 0.05,
            depth: Vector3.Distance(start, end)
        }, this.scene);

        path.position = Vector3.Lerp(start, end, 0.5);
        path.position.y = 0.02;
        path.parent = this.stadiumRoot;

        // Rotate to face correct direction
        const direction = end.subtract(start).normalize();
        const angle = Math.atan2(direction.x, direction.z);
        path.rotation.y = angle;

        const pathMat = new StandardMaterial('base_path_mat', this.scene);
        pathMat.diffuseColor = color.clone();
        path.material = pathMat;
    }

    /**
     * Build pitcher mound
     */
    private buildPitcherMound(field: FieldCustomization): void {
        const moundRadius = 9; // 18 feet diameter
        const moundHeight = 10 / 12; // 10 inches to feet

        const mound = MeshBuilder.CreateCylinder('pitcher_mound', {
            diameterTop: moundRadius * 2,
            diameterBottom: moundRadius * 2.5,
            height: moundHeight,
            tessellation: 32
        }, this.scene);

        mound.position = new Vector3(0, moundHeight / 2, 0);
        mound.parent = this.stadiumRoot;

        const moundMat = new StandardMaterial('mound_mat', this.scene);
        moundMat.diffuseColor = field.moundColor.clone();
        mound.material = moundMat;

        // Pitcher's plate (rubber)
        const rubber = MeshBuilder.CreateBox('pitchers_rubber', {
            width: 2,
            height: 0.5,
            depth: 0.5
        }, this.scene);

        rubber.position = new Vector3(0, moundHeight + 0.25, 0);
        rubber.parent = this.stadiumRoot;

        const rubberMat = new StandardMaterial('rubber_mat', this.scene);
        rubberMat.diffuseColor = new Color3(0.9, 0.9, 0.9);
        rubber.material = rubberMat;
    }

    /**
     * Build batter boxes
     */
    private buildBatterBoxes(field: FieldCustomization): void {
        const boxWidth = this.MLB_REGULATIONS.battingBoxWidth;
        const boxLength = this.MLB_REGULATIONS.battingBoxLength;
        const homePlateZ = this.MLB_REGULATIONS.pitcherMoundDistance;

        // Left batter box
        this.createBatterBox(
            new Vector3(-3, 0, homePlateZ),
            boxWidth,
            boxLength,
            field.batterBoxColor
        );

        // Right batter box
        this.createBatterBox(
            new Vector3(3, 0, homePlateZ),
            boxWidth,
            boxLength,
            field.batterBoxColor
        );
    }

    /**
     * Create a batter box
     */
    private createBatterBox(position: Vector3, width: number, length: number, color: Color3): void {
        const box = MeshBuilder.CreateGround('batter_box', {
            width: width,
            height: length,
            subdivisions: 1
        }, this.scene);

        box.position = position.clone();
        box.position.y = 0.03;
        box.parent = this.stadiumRoot;

        const boxMat = new StandardMaterial('batter_box_mat', this.scene);
        boxMat.diffuseColor = color.clone();
        boxMat.alpha = 0.5;
        box.material = boxMat;
    }

    /**
     * Build foul lines
     */
    private buildFoulLines(field: FieldCustomization, dimensions: StadiumDimensions): void {
        const lineWidth = this.MLB_REGULATIONS.foulLineWidth;
        const lineLength = dimensions.leftFieldLine * 1.5;

        // Left foul line
        this.createFoulLine(
            new Vector3(0, 0, this.MLB_REGULATIONS.pitcherMoundDistance),
            new Vector3(-lineLength, 0, -lineLength + this.MLB_REGULATIONS.pitcherMoundDistance),
            lineWidth,
            field.foulLineColor
        );

        // Right foul line
        this.createFoulLine(
            new Vector3(0, 0, this.MLB_REGULATIONS.pitcherMoundDistance),
            new Vector3(lineLength, 0, -lineLength + this.MLB_REGULATIONS.pitcherMoundDistance),
            lineWidth,
            field.foulLineColor
        );
    }

    /**
     * Create foul line
     */
    private createFoulLine(start: Vector3, end: Vector3, width: number, color: Color3): void {
        const line = MeshBuilder.CreateBox('foul_line', {
            width: width,
            height: 0.05,
            depth: Vector3.Distance(start, end)
        }, this.scene);

        line.position = Vector3.Lerp(start, end, 0.5);
        line.position.y = 0.04;
        line.parent = this.stadiumRoot;

        const direction = end.subtract(start).normalize();
        const angle = Math.atan2(direction.x, direction.z);
        line.rotation.y = angle;

        const lineMat = new StandardMaterial('foul_line_mat', this.scene);
        lineMat.diffuseColor = color.clone();
        lineMat.emissiveColor = color.scale(0.2);
        line.material = lineMat;
    }

    /**
     * Build outfield walls
     */
    private buildWalls(walls: WallCustomization, dimensions: StadiumDimensions): void {
        // Left field wall
        this.createWall(
            'left',
            walls.leftFieldWallType,
            new Vector3(-dimensions.leftFieldLine * 0.7, 0, -dimensions.leftFieldLine * 0.7),
            dimensions.leftFieldWallHeight,
            100,
            walls.wallColor,
            walls.paddingColor
        );

        // Center field wall
        this.createWall(
            'center',
            walls.centerFieldWallType,
            new Vector3(0, 0, -dimensions.centerField),
            dimensions.centerFieldWallHeight,
            150,
            walls.wallColor,
            walls.paddingColor
        );

        // Right field wall
        this.createWall(
            'right',
            walls.rightFieldWallType,
            new Vector3(dimensions.rightFieldLine * 0.7, 0, -dimensions.rightFieldLine * 0.7),
            dimensions.rightFieldWallHeight,
            100,
            walls.wallColor,
            walls.paddingColor
        );
    }

    /**
     * Create a wall section
     */
    private createWall(
        section: string,
        type: WallType,
        position: Vector3,
        height: number,
        width: number,
        wallColor: Color3,
        paddingColor: Color3
    ): void {
        const wall = MeshBuilder.CreateBox(`wall_${section}`, {
            width: width,
            height: height,
            depth: 2
        }, this.scene);

        wall.position = position.clone();
        wall.position.y = height / 2;
        wall.parent = this.stadiumRoot;

        const wallMat = this.materials.get('padding')?.clone(`wall_${section}_mat`) as PBRMaterial;
        if (wallMat) {
            wallMat.albedoColor = type === WallType.PADDING ? paddingColor.clone() : wallColor.clone();
            wall.material = wallMat;
        }

        this.walls.set(section, wall);
    }

    /**
     * Build seating
     */
    private buildSeating(seating: SeatingConfig, dimensions: StadiumDimensions): void {
        const sectionCount = 20;
        const rowsPerSection = 30;
        const stadiumRadius = dimensions.centerField * 1.2;

        for (let i = 0; i < sectionCount; i++) {
            const angle = (i / sectionCount) * Math.PI * 2;
            const x = Math.cos(angle) * stadiumRadius;
            const z = Math.sin(angle) * stadiumRadius;

            const section = MeshBuilder.CreateBox(`seating_section_${i}`, {
                width: 30,
                height: rowsPerSection * 0.5,
                depth: 20
            }, this.scene);

            section.position = new Vector3(x, rowsPerSection * 0.25, z);
            section.rotation.y = -angle;
            section.parent = this.stadiumRoot;

            const seatMat = this.materials.get('seat')?.clone(`seat_mat_${i}`) as StandardMaterial;
            if (seatMat) {
                seatMat.diffuseColor = seating.seatColor.clone();
                section.material = seatMat;
            }

            this.seating.push(section);
        }
    }

    /**
     * Build scoreboard
     */
    private buildScoreboard(scoreboard: ScoreboardConfig, dimensions: StadiumDimensions): void {
        let size = 50;
        if (scoreboard.size === 'large') size = 80;
        if (scoreboard.size === 'massive') size = 120;

        const board = MeshBuilder.CreateBox('scoreboard', {
            width: size * 2,
            height: size,
            depth: 5
        }, this.scene);

        // Position based on config
        if (scoreboard.position === 'center_field') {
            board.position = new Vector3(0, size / 2 + 20, -dimensions.centerField - 10);
        }

        board.parent = this.stadiumRoot;

        const boardMat = new StandardMaterial('scoreboard_mat', this.scene);
        boardMat.diffuseColor = new Color3(0.1, 0.1, 0.1);
        boardMat.emissiveColor = new Color3(0.2, 0.2, 0.2);
        board.material = boardMat;

        this.scoreboard = board;
    }

    /**
     * Build custom props
     */
    private buildProps(props: CustomProp[]): void {
        for (const prop of props) {
            // Load or create prop mesh
            const mesh = MeshBuilder.CreateBox(prop.meshName, {
                size: 1
            }, this.scene);

            mesh.position = prop.position.clone();
            mesh.rotation = prop.rotation.clone();
            mesh.scaling = prop.scale.clone();
            mesh.isVisible = prop.visible;
            mesh.parent = this.stadiumRoot;

            this.props.set(prop.id, mesh);
        }
    }

    /**
     * Apply environment settings
     */
    private applyEnvironment(environment: EnvironmentSettings): void {
        // Set skybox
        // Set lighting
        // Set weather effects
        // Set fog

        if (environment.fogEnabled) {
            this.scene.fogMode = Scene.FOGMODE_EXP;
            this.scene.fogDensity = environment.fogDensity;
            this.scene.fogColor = environment.fogColor;
        } else {
            this.scene.fogMode = Scene.FOGMODE_NONE;
        }
    }

    /**
     * Load template
     */
    public loadTemplate(templateId: string): void {
        const template = this.templates.get(templateId);
        if (!template) {
            console.warn(`Template not found: ${templateId}`);
            return;
        }

        this.buildStadium(template.config);
    }

    /**
     * Get all templates
     */
    public getTemplates(): StadiumTemplate[] {
        return Array.from(this.templates.values());
    }

    /**
     * Update field customization
     */
    public updateFieldCustomization(field: Partial<FieldCustomization>): void {
        if (!this.currentConfig) return;

        this.currentConfig.field = { ...this.currentConfig.field, ...field };
        this.buildField(this.currentConfig.field, this.currentConfig.dimensions);
    }

    /**
     * Update wall customization
     */
    public updateWallCustomization(walls: Partial<WallCustomization>): void {
        if (!this.currentConfig) return;

        this.currentConfig.walls = { ...this.currentConfig.walls, ...walls };
        this.buildWalls(this.currentConfig.walls, this.currentConfig.dimensions);
    }

    /**
     * Export configuration
     */
    public exportConfiguration(): StadiumConfiguration | null {
        return this.currentConfig ? { ...this.currentConfig } : null;
    }

    /**
     * Import configuration
     */
    public importConfiguration(config: StadiumConfiguration): void {
        this.buildStadium(config);
    }

    /**
     * Clear stadium
     */
    private clearStadium(): void {
        if (this.stadiumRoot) {
            this.stadiumRoot.dispose();
            this.stadiumRoot = null;
        }

        this.fieldMesh = null;
        this.walls.clear();
        this.seating = [];
        this.scoreboard = null;
        this.props.clear();
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        this.clearStadium();

        for (const material of this.materials.values()) {
            material.dispose();
        }

        this.materials.clear();
        this.templates.clear();
        this.assetContainers.clear();
    }
}
