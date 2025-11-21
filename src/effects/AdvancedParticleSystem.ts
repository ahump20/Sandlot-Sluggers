import { Scene, ParticleSystem, Texture, Vector3, Color4, AbstractMesh, Animation, Mesh, StandardMaterial, GPUParticleSystem, VertexBuffer, VertexData, Matrix, Quaternion, Observable } from '@babylonjs/core';

/**
 * Particle effect types
 */
export enum ParticleEffectType {
    // Ball effects
    BALL_TRAIL = 'ball_trail',
    BALL_IMPACT = 'ball_impact',
    BALL_SPARKS = 'ball_sparks',
    SONIC_BOOM = 'sonic_boom',

    // Field effects
    DIRT_EXPLOSION = 'dirt_explosion',
    DIRT_SLIDE = 'dirt_slide',
    GRASS_PARTICLES = 'grass_particles',
    CHALK_PUFF = 'chalk_puff',

    // Weather effects
    RAIN = 'rain',
    SNOW = 'snow',
    FOG = 'fog',
    DUST_DEVIL = 'dust_devil',
    LEAVES = 'leaves',
    CONFETTI = 'confetti',

    // Action effects
    SWEAT_DROPS = 'sweat_drops',
    FATIGUE_STARS = 'fatigue_stars',
    POWER_AURA = 'power_aura',
    SPEED_LINES = 'speed_lines',

    // Impact effects
    BAT_CONTACT_PERFECT = 'bat_contact_perfect',
    BAT_CONTACT_SOLID = 'bat_contact_solid',
    BAT_CONTACT_WEAK = 'bat_contact_weak',
    GLOVE_CATCH = 'glove_catch',
    WALL_IMPACT = 'wall_impact',

    // Celebration effects
    FIREWORKS = 'fireworks',
    SPARKLERS = 'sparklers',
    BALLOONS = 'balloons',
    STREAMERS = 'streamers',
    SMOKE_TRAILS = 'smoke_trails',

    // Magic/Special effects
    TELEPORT = 'teleport',
    LIGHTNING = 'lightning',
    ENERGY_BURST = 'energy_burst',
    SHOCKWAVE = 'shockwave',
    PORTAL = 'portal',

    // Environmental
    STADIUM_SMOKE = 'stadium_smoke',
    DUST_CLOUDS = 'dust_clouds',
    WATER_SPLASH = 'water_splash',
    MUD_SPLATTER = 'mud_splatter'
}

/**
 * Particle emitter shape
 */
export enum EmitterShape {
    POINT = 'point',
    SPHERE = 'sphere',
    HEMISPHERE = 'hemisphere',
    CONE = 'cone',
    BOX = 'box',
    CYLINDER = 'cylinder',
    RING = 'ring',
    DISC = 'disc',
    MESH = 'mesh'
}

/**
 * Particle blend mode
 */
export enum ParticleBlendMode {
    ALPHA = 'alpha',
    ADD = 'add',
    MULTIPLY = 'multiply',
    SCREEN = 'screen'
}

/**
 * Particle update behavior
 */
export enum ParticleUpdateBehavior {
    GRAVITY = 'gravity',
    WIND = 'wind',
    TURBULENCE = 'turbulence',
    VORTEX = 'vortex',
    ATTRACTOR = 'attractor',
    REPULSOR = 'repulsor',
    ORBIT = 'orbit',
    VELOCITY_OVER_LIFETIME = 'velocity_over_lifetime',
    SIZE_OVER_LIFETIME = 'size_over_lifetime',
    COLOR_OVER_LIFETIME = 'color_over_lifetime',
    ROTATION_OVER_LIFETIME = 'rotation_over_lifetime'
}

/**
 * Particle configuration
 */
export interface ParticleConfig {
    // Basic properties
    type: ParticleEffectType;
    capacity: number;
    emitRate: number;
    duration?: number;
    loop?: boolean;

    // Emitter
    emitterShape: EmitterShape;
    emitterSize: Vector3;
    emitterMesh?: AbstractMesh;

    // Particle appearance
    texture?: string;
    startColor: Color4;
    endColor: Color4;
    colorGradient?: Array<{ gradient: number; color: Color4 }>;

    // Size
    minSize: number;
    maxSize: number;
    startSize: number;
    endSize: number;

    // Lifetime
    minLifeTime: number;
    maxLifeTime: number;

    // Velocity
    minEmitPower: number;
    maxEmitPower: number;
    direction1: Vector3;
    direction2: Vector3;

    // Physics
    gravity: Vector3;
    wind?: Vector3;

    // Rotation
    minAngularSpeed?: number;
    maxAngularSpeed?: number;
    minInitialRotation?: number;
    maxInitialRotation?: number;

    // Rendering
    blendMode: ParticleBlendMode;
    billboardMode?: boolean;
    isLocal?: boolean;

    // Advanced
    behaviors?: ParticleUpdateBehavior[];
    customUpdateFunction?: (particles: any[]) => void;

    // GPU particle system
    useGPU?: boolean;

    // Sub emitters
    subEmitters?: ParticleConfig[];
}

/**
 * Active particle effect
 */
export interface ActiveEffect {
    id: string;
    type: ParticleEffectType;
    system: ParticleSystem | GPUParticleSystem;
    startTime: number;
    duration: number;
    loop: boolean;
    position: Vector3;
    attachedMesh?: AbstractMesh;
}

/**
 * Particle effect preset
 */
export interface EffectPreset {
    name: string;
    type: ParticleEffectType;
    config: ParticleConfig;
    description: string;
}

/**
 * Advanced Particle System
 * Comprehensive particle effects library for all game scenarios
 */
export class AdvancedParticleSystem {
    private scene: Scene;

    // Active effects
    private activeEffects: Map<string, ActiveEffect> = new Map();
    private effectIdCounter: number = 0;

    // Effect presets
    private presets: Map<ParticleEffectType, ParticleConfig> = new Map();

    // Texture cache
    private textureCache: Map<string, Texture> = new Map();

    // Performance settings
    private maxActiveEffects: number = 50;
    private useGPUParticles: boolean = true;
    private qualityLevel: number = 1.0; // 0.5 = low, 1.0 = medium, 2.0 = high

    // Observables
    private onEffectStartedObservable: Observable<ActiveEffect> = new Observable();
    private onEffectEndedObservable: Observable<string> = new Observable();

    // Global wind
    private globalWind: Vector3 = Vector3.Zero();

    constructor(scene: Scene) {
        this.scene = scene;
        this.initializePresets();
        this.detectGPUSupport();
    }

    /**
     * Detect GPU particle system support
     */
    private detectGPUSupport(): void {
        try {
            const testSystem = new GPUParticleSystem('test', { capacity: 1 }, this.scene);
            testSystem.dispose();
            this.useGPUParticles = true;
        } catch (e) {
            console.warn('GPU particles not supported, falling back to CPU particles');
            this.useGPUParticles = false;
        }
    }

    /**
     * Initialize effect presets
     */
    private initializePresets(): void {
        // Ball trail effect
        this.presets.set(ParticleEffectType.BALL_TRAIL, {
            type: ParticleEffectType.BALL_TRAIL,
            capacity: 500,
            emitRate: 100,
            emitterShape: EmitterShape.POINT,
            emitterSize: new Vector3(0.05, 0.05, 0.05),
            texture: 'particle_smoke.png',
            startColor: new Color4(1, 1, 1, 0.8),
            endColor: new Color4(1, 1, 1, 0),
            minSize: 0.1,
            maxSize: 0.2,
            startSize: 0.1,
            endSize: 0.05,
            minLifeTime: 0.2,
            maxLifeTime: 0.4,
            minEmitPower: 0.1,
            maxEmitPower: 0.2,
            direction1: new Vector3(-0.1, -0.1, -0.1),
            direction2: new Vector3(0.1, 0.1, 0.1),
            gravity: new Vector3(0, -2, 0),
            blendMode: ParticleBlendMode.ALPHA,
            billboardMode: true,
            useGPU: true
        });

        // Ball impact effect
        this.presets.set(ParticleEffectType.BALL_IMPACT, {
            type: ParticleEffectType.BALL_IMPACT,
            capacity: 100,
            emitRate: 200,
            duration: 0.3,
            emitterShape: EmitterShape.HEMISPHERE,
            emitterSize: new Vector3(0.2, 0.2, 0.2),
            texture: 'particle_spark.png',
            startColor: new Color4(1, 0.9, 0.7, 1),
            endColor: new Color4(1, 0.5, 0, 0),
            minSize: 0.05,
            maxSize: 0.15,
            startSize: 0.1,
            endSize: 0.02,
            minLifeTime: 0.2,
            maxLifeTime: 0.5,
            minEmitPower: 2,
            maxEmitPower: 5,
            direction1: new Vector3(-1, 0, -1),
            direction2: new Vector3(1, 2, 1),
            gravity: new Vector3(0, -9.81, 0),
            blendMode: ParticleBlendMode.ADD,
            billboardMode: true
        });

        // Dirt explosion
        this.presets.set(ParticleEffectType.DIRT_EXPLOSION, {
            type: ParticleEffectType.DIRT_EXPLOSION,
            capacity: 200,
            emitRate: 400,
            duration: 0.5,
            emitterShape: EmitterShape.HEMISPHERE,
            emitterSize: new Vector3(0.3, 0.1, 0.3),
            texture: 'particle_dirt.png',
            startColor: new Color4(0.4, 0.3, 0.2, 1),
            endColor: new Color4(0.3, 0.2, 0.1, 0),
            minSize: 0.1,
            maxSize: 0.3,
            startSize: 0.2,
            endSize: 0.1,
            minLifeTime: 0.5,
            maxLifeTime: 1.5,
            minEmitPower: 3,
            maxEmitPower: 8,
            direction1: new Vector3(-1, 1, -1),
            direction2: new Vector3(1, 3, 1),
            gravity: new Vector3(0, -9.81, 0),
            blendMode: ParticleBlendMode.ALPHA,
            billboardMode: true
        });

        // Dirt slide
        this.presets.set(ParticleEffectType.DIRT_SLIDE, {
            type: ParticleEffectType.DIRT_SLIDE,
            capacity: 300,
            emitRate: 150,
            emitterShape: EmitterShape.BOX,
            emitterSize: new Vector3(0.5, 0.1, 0.2),
            texture: 'particle_dirt.png',
            startColor: new Color4(0.4, 0.3, 0.2, 0.8),
            endColor: new Color4(0.3, 0.2, 0.1, 0),
            minSize: 0.05,
            maxSize: 0.2,
            startSize: 0.1,
            endSize: 0.05,
            minLifeTime: 0.5,
            maxLifeTime: 1.0,
            minEmitPower: 1,
            maxEmitPower: 3,
            direction1: new Vector3(-1, 0.2, -0.5),
            direction2: new Vector3(1, 1, 0.5),
            gravity: new Vector3(0, -5, 0),
            blendMode: ParticleBlendMode.ALPHA,
            billboardMode: true
        });

        // Rain
        this.presets.set(ParticleEffectType.RAIN, {
            type: ParticleEffectType.RAIN,
            capacity: 5000,
            emitRate: 1000,
            loop: true,
            emitterShape: EmitterShape.BOX,
            emitterSize: new Vector3(200, 50, 200),
            texture: 'particle_raindrop.png',
            startColor: new Color4(0.7, 0.7, 0.9, 0.6),
            endColor: new Color4(0.7, 0.7, 0.9, 0.3),
            minSize: 0.05,
            maxSize: 0.08,
            startSize: 0.06,
            endSize: 0.06,
            minLifeTime: 2,
            maxLifeTime: 3,
            minEmitPower: 15,
            maxEmitPower: 20,
            direction1: new Vector3(-0.2, -1, -0.2),
            direction2: new Vector3(0.2, -1, 0.2),
            gravity: new Vector3(0, -20, 0),
            blendMode: ParticleBlendMode.ALPHA,
            billboardMode: false,
            useGPU: true
        });

        // Snow
        this.presets.set(ParticleEffectType.SNOW, {
            type: ParticleEffectType.SNOW,
            capacity: 3000,
            emitRate: 500,
            loop: true,
            emitterShape: EmitterShape.BOX,
            emitterSize: new Vector3(200, 50, 200),
            texture: 'particle_snowflake.png',
            startColor: new Color4(1, 1, 1, 0.8),
            endColor: new Color4(1, 1, 1, 0.4),
            minSize: 0.1,
            maxSize: 0.3,
            startSize: 0.2,
            endSize: 0.2,
            minLifeTime: 8,
            maxLifeTime: 12,
            minEmitPower: 0.5,
            maxEmitPower: 1,
            direction1: new Vector3(-0.5, -1, -0.5),
            direction2: new Vector3(0.5, -0.8, 0.5),
            gravity: new Vector3(0, -1, 0),
            minAngularSpeed: -Math.PI,
            maxAngularSpeed: Math.PI,
            blendMode: ParticleBlendMode.ALPHA,
            billboardMode: true,
            useGPU: true,
            behaviors: [ParticleUpdateBehavior.TURBULENCE]
        });

        // Confetti
        this.presets.set(ParticleEffectType.CONFETTI, {
            type: ParticleEffectType.CONFETTI,
            capacity: 1000,
            emitRate: 500,
            duration: 3,
            emitterShape: EmitterShape.BOX,
            emitterSize: new Vector3(10, 20, 10),
            texture: 'particle_confetti.png',
            startColor: new Color4(1, 1, 1, 1),
            endColor: new Color4(1, 1, 1, 0.5),
            colorGradient: [
                { gradient: 0, color: new Color4(1, 0, 0, 1) },
                { gradient: 0.33, color: new Color4(0, 1, 0, 1) },
                { gradient: 0.66, color: new Color4(0, 0, 1, 1) },
                { gradient: 1, color: new Color4(1, 1, 0, 1) }
            ],
            minSize: 0.1,
            maxSize: 0.2,
            startSize: 0.15,
            endSize: 0.15,
            minLifeTime: 3,
            maxLifeTime: 5,
            minEmitPower: 5,
            maxEmitPower: 15,
            direction1: new Vector3(-1, 1, -1),
            direction2: new Vector3(1, 2, 1),
            gravity: new Vector3(0, -5, 0),
            minAngularSpeed: -Math.PI * 4,
            maxAngularSpeed: Math.PI * 4,
            blendMode: ParticleBlendMode.ALPHA,
            billboardMode: false
        });

        // Perfect bat contact
        this.presets.set(ParticleEffectType.BAT_CONTACT_PERFECT, {
            type: ParticleEffectType.BAT_CONTACT_PERFECT,
            capacity: 150,
            emitRate: 300,
            duration: 0.4,
            emitterShape: EmitterShape.SPHERE,
            emitterSize: new Vector3(0.3, 0.3, 0.3),
            texture: 'particle_star.png',
            startColor: new Color4(1, 1, 0, 1),
            endColor: new Color4(1, 0.5, 0, 0),
            minSize: 0.1,
            maxSize: 0.3,
            startSize: 0.2,
            endSize: 0.05,
            minLifeTime: 0.3,
            maxLifeTime: 0.6,
            minEmitPower: 5,
            maxEmitPower: 10,
            direction1: new Vector3(-1, -1, -1),
            direction2: new Vector3(1, 1, 1),
            gravity: Vector3.Zero(),
            minAngularSpeed: -Math.PI * 2,
            maxAngularSpeed: Math.PI * 2,
            blendMode: ParticleBlendMode.ADD,
            billboardMode: true
        });

        // Fireworks
        this.presets.set(ParticleEffectType.FIREWORKS, {
            type: ParticleEffectType.FIREWORKS,
            capacity: 500,
            emitRate: 1000,
            duration: 0.5,
            emitterShape: EmitterShape.POINT,
            emitterSize: new Vector3(0.1, 0.1, 0.1),
            texture: 'particle_spark.png',
            startColor: new Color4(1, 1, 1, 1),
            endColor: new Color4(1, 0, 0, 0),
            colorGradient: [
                { gradient: 0, color: new Color4(1, 1, 1, 1) },
                { gradient: 0.5, color: new Color4(1, 0.5, 0, 1) },
                { gradient: 1, color: new Color4(1, 0, 0, 0) }
            ],
            minSize: 0.05,
            maxSize: 0.15,
            startSize: 0.1,
            endSize: 0.02,
            minLifeTime: 1,
            maxLifeTime: 2,
            minEmitPower: 15,
            maxEmitPower: 25,
            direction1: new Vector3(-1, -1, -1),
            direction2: new Vector3(1, 1, 1),
            gravity: new Vector3(0, -9.81, 0),
            blendMode: ParticleBlendMode.ADD,
            billboardMode: true
        });

        // Power aura
        this.presets.set(ParticleEffectType.POWER_AURA, {
            type: ParticleEffectType.POWER_AURA,
            capacity: 200,
            emitRate: 50,
            loop: true,
            emitterShape: EmitterShape.CYLINDER,
            emitterSize: new Vector3(1, 2, 1),
            texture: 'particle_energy.png',
            startColor: new Color4(1, 0.5, 0, 0.6),
            endColor: new Color4(1, 0, 0, 0),
            minSize: 0.2,
            maxSize: 0.4,
            startSize: 0.3,
            endSize: 0.1,
            minLifeTime: 1,
            maxLifeTime: 2,
            minEmitPower: 0.5,
            maxEmitPower: 1.5,
            direction1: new Vector3(-0.5, 0.5, -0.5),
            direction2: new Vector3(0.5, 1.5, 0.5),
            gravity: new Vector3(0, 2, 0),
            minAngularSpeed: -Math.PI,
            maxAngularSpeed: Math.PI,
            blendMode: ParticleBlendMode.ADD,
            billboardMode: true,
            behaviors: [ParticleUpdateBehavior.VORTEX]
        });

        // Speed lines
        this.presets.set(ParticleEffectType.SPEED_LINES, {
            type: ParticleEffectType.SPEED_LINES,
            capacity: 100,
            emitRate: 50,
            emitterShape: EmitterShape.BOX,
            emitterSize: new Vector3(2, 2, 2),
            texture: 'particle_line.png',
            startColor: new Color4(1, 1, 1, 0.8),
            endColor: new Color4(1, 1, 1, 0),
            minSize: 0.1,
            maxSize: 0.2,
            startSize: 0.15,
            endSize: 0.1,
            minLifeTime: 0.2,
            maxLifeTime: 0.4,
            minEmitPower: 10,
            maxEmitPower: 20,
            direction1: new Vector3(-1, -0.2, -1),
            direction2: new Vector3(-0.8, 0.2, -0.8),
            gravity: Vector3.Zero(),
            blendMode: ParticleBlendMode.ADD,
            billboardMode: false
        });

        // Shockwave
        this.presets.set(ParticleEffectType.SHOCKWAVE, {
            type: ParticleEffectType.SHOCKWAVE,
            capacity: 50,
            emitRate: 100,
            duration: 0.5,
            emitterShape: EmitterShape.RING,
            emitterSize: new Vector3(0.5, 0.1, 0.5),
            texture: 'particle_ring.png',
            startColor: new Color4(1, 1, 1, 0.8),
            endColor: new Color4(1, 1, 1, 0),
            minSize: 0.5,
            maxSize: 1,
            startSize: 0.5,
            endSize: 3,
            minLifeTime: 0.5,
            maxLifeTime: 0.8,
            minEmitPower: 0,
            maxEmitPower: 0.1,
            direction1: new Vector3(-1, 0, -1),
            direction2: new Vector3(1, 0, 1),
            gravity: Vector3.Zero(),
            blendMode: ParticleBlendMode.ADD,
            billboardMode: true,
            behaviors: [ParticleUpdateBehavior.SIZE_OVER_LIFETIME]
        });

        // Water splash
        this.presets.set(ParticleEffectType.WATER_SPLASH, {
            type: ParticleEffectType.WATER_SPLASH,
            capacity: 200,
            emitRate: 400,
            duration: 0.5,
            emitterShape: EmitterShape.HEMISPHERE,
            emitterSize: new Vector3(0.5, 0.2, 0.5),
            texture: 'particle_water.png',
            startColor: new Color4(0.5, 0.7, 1, 0.8),
            endColor: new Color4(0.5, 0.7, 1, 0),
            minSize: 0.05,
            maxSize: 0.15,
            startSize: 0.1,
            endSize: 0.05,
            minLifeTime: 0.5,
            maxLifeTime: 1,
            minEmitPower: 3,
            maxEmitPower: 8,
            direction1: new Vector3(-1, 1, -1),
            direction2: new Vector3(1, 2, 1),
            gravity: new Vector3(0, -15, 0),
            blendMode: ParticleBlendMode.ALPHA,
            billboardMode: true
        });

        // Lightning
        this.presets.set(ParticleEffectType.LIGHTNING, {
            type: ParticleEffectType.LIGHTNING,
            capacity: 100,
            emitRate: 200,
            duration: 0.3,
            emitterShape: EmitterShape.CYLINDER,
            emitterSize: new Vector3(0.2, 5, 0.2),
            texture: 'particle_lightning.png',
            startColor: new Color4(0.7, 0.9, 1, 1),
            endColor: new Color4(1, 1, 1, 0),
            minSize: 0.3,
            maxSize: 0.6,
            startSize: 0.4,
            endSize: 0.2,
            minLifeTime: 0.1,
            maxLifeTime: 0.3,
            minEmitPower: 1,
            maxEmitPower: 2,
            direction1: new Vector3(-0.5, -1, -0.5),
            direction2: new Vector3(0.5, -0.5, 0.5),
            gravity: Vector3.Zero(),
            blendMode: ParticleBlendMode.ADD,
            billboardMode: false
        });

        // Smoke trails
        this.presets.set(ParticleEffectType.SMOKE_TRAILS, {
            type: ParticleEffectType.SMOKE_TRAILS,
            capacity: 300,
            emitRate: 100,
            emitterShape: EmitterShape.POINT,
            emitterSize: new Vector3(0.1, 0.1, 0.1),
            texture: 'particle_smoke.png',
            startColor: new Color4(0.5, 0.5, 0.5, 0.6),
            endColor: new Color4(0.3, 0.3, 0.3, 0),
            minSize: 0.3,
            maxSize: 0.5,
            startSize: 0.3,
            endSize: 1.5,
            minLifeTime: 2,
            maxLifeTime: 4,
            minEmitPower: 0.5,
            maxEmitPower: 1,
            direction1: new Vector3(-0.5, 0.5, -0.5),
            direction2: new Vector3(0.5, 1.5, 0.5),
            gravity: new Vector3(0, 1, 0),
            minAngularSpeed: -Math.PI / 4,
            maxAngularSpeed: Math.PI / 4,
            blendMode: ParticleBlendMode.ALPHA,
            billboardMode: true,
            behaviors: [ParticleUpdateBehavior.SIZE_OVER_LIFETIME]
        });
    }

    /**
     * Create particle system from config
     */
    private createParticleSystem(config: ParticleConfig): ParticleSystem | GPUParticleSystem {
        const capacity = Math.floor(config.capacity * this.qualityLevel);

        let system: ParticleSystem | GPUParticleSystem;

        if (config.useGPU && this.useGPUParticles) {
            system = new GPUParticleSystem(`effect_${this.effectIdCounter}`, { capacity }, this.scene);
        } else {
            system = new ParticleSystem(`effect_${this.effectIdCounter}`, capacity, this.scene);
        }

        // Load texture
        if (config.texture) {
            system.particleTexture = this.loadTexture(config.texture);
        }

        // Emitter
        if (config.emitterMesh) {
            system.emitter = config.emitterMesh;
        } else {
            system.emitter = Vector3.Zero();
        }

        // Emitter shape
        this.setupEmitterShape(system, config);

        // Colors
        system.color1 = config.startColor;
        system.color2 = config.endColor;
        system.colorDead = config.endColor;

        // Color gradients
        if (config.colorGradient && system instanceof ParticleSystem) {
            config.colorGradient.forEach(g => {
                system.addColorGradient(g.gradient, g.color);
            });
        }

        // Size
        system.minSize = config.minSize;
        system.maxSize = config.maxSize;

        // Lifetime
        system.minLifeTime = config.minLifeTime;
        system.maxLifeTime = config.maxLifeTime;

        // Emit rate
        system.emitRate = Math.floor(config.emitRate * this.qualityLevel);

        // Power
        system.minEmitPower = config.minEmitPower;
        system.maxEmitPower = config.maxEmitPower;

        // Direction
        system.direction1 = config.direction1;
        system.direction2 = config.direction2;

        // Gravity
        system.gravity = config.gravity;

        // Rotation
        if (config.minAngularSpeed !== undefined) {
            system.minAngularSpeed = config.minAngularSpeed;
            system.maxAngularSpeed = config.maxAngularSpeed || 0;
        }

        if (config.minInitialRotation !== undefined) {
            system.minInitialRotation = config.minInitialRotation;
            system.maxInitialRotation = config.maxInitialRotation || 0;
        }

        // Blend mode
        this.setupBlendMode(system, config.blendMode);

        // Billboard
        if (config.billboardMode !== undefined) {
            system.isBillboardBased = config.billboardMode;
        }

        // Behaviors
        if (config.behaviors) {
            this.setupBehaviors(system, config.behaviors);
        }

        // Custom update
        if (config.customUpdateFunction && system instanceof ParticleSystem) {
            system.updateFunction = config.customUpdateFunction;
        }

        return system;
    }

    /**
     * Setup emitter shape
     */
    private setupEmitterShape(system: ParticleSystem | GPUParticleSystem, config: ParticleConfig): void {
        const size = config.emitterSize;

        switch (config.emitterShape) {
            case EmitterShape.POINT:
                // Default point emitter
                break;

            case EmitterShape.SPHERE:
                if (system instanceof ParticleSystem) {
                    const sphereEmitter = system.createSphereEmitter(size.x);
                }
                break;

            case EmitterShape.HEMISPHERE:
                if (system instanceof ParticleSystem) {
                    const hemisphereEmitter = system.createHemisphericEmitter(size.x);
                }
                break;

            case EmitterShape.CONE:
                if (system instanceof ParticleSystem) {
                    const coneEmitter = system.createConeEmitter(size.x, Math.PI / 4);
                }
                break;

            case EmitterShape.BOX:
                if (system instanceof ParticleSystem) {
                    const boxEmitter = system.createBoxEmitter(
                        new Vector3(-size.x / 2, -size.y / 2, -size.z / 2),
                        new Vector3(size.x / 2, size.y / 2, size.z / 2),
                        config.direction1,
                        config.direction2
                    );
                }
                break;

            case EmitterShape.CYLINDER:
                if (system instanceof ParticleSystem) {
                    const cylinderEmitter = system.createCylinderEmitter(size.x, size.y);
                }
                break;
        }
    }

    /**
     * Setup blend mode
     */
    private setupBlendMode(system: ParticleSystem | GPUParticleSystem, mode: ParticleBlendMode): void {
        switch (mode) {
            case ParticleBlendMode.ALPHA:
                system.blendMode = ParticleSystem.BLENDMODE_STANDARD;
                break;
            case ParticleBlendMode.ADD:
                system.blendMode = ParticleSystem.BLENDMODE_ADD;
                break;
            case ParticleBlendMode.MULTIPLY:
                system.blendMode = ParticleSystem.BLENDMODE_MULTIPLY;
                break;
        }
    }

    /**
     * Setup particle behaviors
     */
    private setupBehaviors(system: ParticleSystem | GPUParticleSystem, behaviors: ParticleUpdateBehavior[]): void {
        // Behaviors would be implemented as update functions or gradients
        for (const behavior of behaviors) {
            switch (behavior) {
                case ParticleUpdateBehavior.SIZE_OVER_LIFETIME:
                    if (system instanceof ParticleSystem) {
                        system.addSizeGradient(0, 0.5);
                        system.addSizeGradient(0.5, 1);
                        system.addSizeGradient(1, 0.5);
                    }
                    break;

                case ParticleUpdateBehavior.VELOCITY_OVER_LIFETIME:
                    // Custom velocity modulation
                    break;

                case ParticleUpdateBehavior.TURBULENCE:
                    // Add random turbulence to particle movement
                    break;
            }
        }
    }

    /**
     * Load texture with caching
     */
    private loadTexture(texturePath: string): Texture {
        if (this.textureCache.has(texturePath)) {
            return this.textureCache.get(texturePath)!;
        }

        const texture = new Texture(`assets/particles/${texturePath}`, this.scene);
        this.textureCache.set(texturePath, texture);
        return texture;
    }

    /**
     * Play effect
     */
    public playEffect(
        type: ParticleEffectType,
        position: Vector3,
        options?: Partial<ParticleConfig>
    ): string {
        // Clean up old effects if we're at capacity
        if (this.activeEffects.size >= this.maxActiveEffects) {
            this.cleanupOldestEffect();
        }

        // Get base config
        let config = this.presets.get(type);
        if (!config) {
            console.warn(`No preset found for effect type: ${type}`);
            return '';
        }

        // Merge with options
        if (options) {
            config = { ...config, ...options };
        }

        // Create system
        const system = this.createParticleSystem(config);

        // Set position
        if (system.emitter instanceof Vector3) {
            system.emitter = position.clone();
        }

        // Create effect record
        const effectId = `effect_${this.effectIdCounter++}`;
        const effect: ActiveEffect = {
            id: effectId,
            type,
            system,
            startTime: Date.now(),
            duration: config.duration || -1,
            loop: config.loop || false,
            position: position.clone()
        };

        this.activeEffects.set(effectId, effect);

        // Start the system
        system.start();

        // Auto-stop if duration specified
        if (config.duration && config.duration > 0 && !config.loop) {
            setTimeout(() => {
                this.stopEffect(effectId);
            }, config.duration * 1000);
        }

        // Notify
        this.onEffectStartedObservable.notifyObservers(effect);

        return effectId;
    }

    /**
     * Play effect attached to mesh
     */
    public playEffectAttached(
        type: ParticleEffectType,
        mesh: AbstractMesh,
        options?: Partial<ParticleConfig>
    ): string {
        const effectId = this.playEffect(type, mesh.position, options);
        const effect = this.activeEffects.get(effectId);

        if (effect) {
            effect.attachedMesh = mesh;
            effect.system.emitter = mesh;
        }

        return effectId;
    }

    /**
     * Stop effect
     */
    public stopEffect(effectId: string): void {
        const effect = this.activeEffects.get(effectId);
        if (!effect) return;

        effect.system.stop();

        // Wait for particles to die before disposing
        setTimeout(() => {
            effect.system.dispose();
            this.activeEffects.delete(effectId);
            this.onEffectEndedObservable.notifyObservers(effectId);
        }, effect.system.maxLifeTime * 1000);
    }

    /**
     * Stop all effects
     */
    public stopAllEffects(): void {
        const effectIds = Array.from(this.activeEffects.keys());
        effectIds.forEach(id => this.stopEffect(id));
    }

    /**
     * Stop effects of type
     */
    public stopEffectsOfType(type: ParticleEffectType): void {
        for (const [id, effect] of this.activeEffects) {
            if (effect.type === type) {
                this.stopEffect(id);
            }
        }
    }

    /**
     * Cleanup oldest effect
     */
    private cleanupOldestEffect(): void {
        let oldestId: string | null = null;
        let oldestTime = Infinity;

        for (const [id, effect] of this.activeEffects) {
            if (effect.startTime < oldestTime) {
                oldestTime = effect.startTime;
                oldestId = id;
            }
        }

        if (oldestId) {
            this.stopEffect(oldestId);
        }
    }

    /**
     * Update all active effects
     */
    public update(deltaTime: number): void {
        const now = Date.now();

        for (const [id, effect] of this.activeEffects) {
            // Update position if attached to mesh
            if (effect.attachedMesh) {
                effect.position = effect.attachedMesh.position.clone();
            }

            // Apply global wind
            if (!this.globalWind.equals(Vector3.Zero())) {
                effect.system.gravity = effect.system.gravity.add(this.globalWind.scale(0.1));
            }

            // Check if non-looping effect has finished
            if (!effect.loop && effect.duration > 0) {
                const elapsed = (now - effect.startTime) / 1000;
                if (elapsed >= effect.duration && effect.system.getActiveCount() === 0) {
                    this.stopEffect(id);
                }
            }
        }
    }

    /**
     * Set global wind
     */
    public setGlobalWind(wind: Vector3): void {
        this.globalWind = wind.clone();
    }

    /**
     * Set quality level
     */
    public setQualityLevel(level: number): void {
        this.qualityLevel = Math.max(0.1, Math.min(2.0, level));
    }

    /**
     * Get active effect count
     */
    public getActiveEffectCount(): number {
        return this.activeEffects.size;
    }

    /**
     * Get effect by ID
     */
    public getEffect(effectId: string): ActiveEffect | undefined {
        return this.activeEffects.get(effectId);
    }

    /**
     * Check if effect is playing
     */
    public isEffectPlaying(effectId: string): boolean {
        return this.activeEffects.has(effectId);
    }

    /**
     * Subscribe to effect started
     */
    public onEffectStarted(callback: (effect: ActiveEffect) => void): void {
        this.onEffectStartedObservable.add(callback);
    }

    /**
     * Subscribe to effect ended
     */
    public onEffectEnded(callback: (effectId: string) => void): void {
        this.onEffectEndedObservable.add(callback);
    }

    /**
     * Create custom effect
     */
    public createCustomEffect(config: ParticleConfig): string {
        const effectId = `custom_${this.effectIdCounter++}`;
        const system = this.createParticleSystem(config);

        const effect: ActiveEffect = {
            id: effectId,
            type: config.type,
            system,
            startTime: Date.now(),
            duration: config.duration || -1,
            loop: config.loop || false,
            position: Vector3.Zero()
        };

        this.activeEffects.set(effectId, effect);
        return effectId;
    }

    /**
     * Register custom preset
     */
    public registerPreset(type: ParticleEffectType, config: ParticleConfig): void {
        this.presets.set(type, config);
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        this.stopAllEffects();

        // Clear texture cache
        for (const texture of this.textureCache.values()) {
            texture.dispose();
        }
        this.textureCache.clear();

        this.onEffectStartedObservable.clear();
        this.onEffectEndedObservable.clear();
    }
}
