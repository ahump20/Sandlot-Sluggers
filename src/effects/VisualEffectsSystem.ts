import {
    Scene,
    ParticleSystem,
    Texture,
    Color4,
    Vector3,
    Mesh,
    TrailMesh,
    StandardMaterial,
    Animation,
    AnimationGroup,
    SpriteManager,
    Sprite,
    GlowLayer,
    HighlightsPostProcess,
    BlurPostProcess,
    PostProcess
} from '@babylonjs/core';

/**
 * Effect types for different game events
 */
export enum EffectType {
    // Ball effects
    BALL_TRAIL = 'BALL_TRAIL',
    BALL_GLOW = 'BALL_GLOW',
    BALL_SPIN_VISUAL = 'BALL_SPIN_VISUAL',

    // Impact effects
    BAT_CONTACT = 'BAT_CONTACT',
    GLOVE_CATCH = 'GLOVE_CATCH',
    GROUND_IMPACT = 'GROUND_IMPACT',
    WALL_IMPACT = 'WALL_IMPACT',

    // Base effects
    SAFE_SLIDE = 'SAFE_SLIDE',
    OUT_TAG = 'OUT_TAG',
    HOMERUN_BURST = 'HOMERUN_BURST',

    // Atmospheric effects
    DUST_CLOUD = 'DUST_CLOUD',
    DIRT_SPRAY = 'DIRT_SPRAY',
    GRASS_PARTICLES = 'GRASS_PARTICLES',

    // UI effects
    STRIKE_INDICATOR = 'STRIKE_INDICATOR',
    BALL_INDICATOR = 'BALL_INDICATOR',
    HIT_QUALITY_BURST = 'HIT_QUALITY_BURST',

    // Special effects
    PERFECT_CONTACT_FLASH = 'PERFECT_CONTACT_FLASH',
    HOMERUN_FIREWORKS = 'HOMERUN_FIREWORKS',
    STRIKEOUT_EFFECT = 'STRIKEOUT_EFFECT',
    CATCH_SPARKLE = 'CATCH_SPARKLE'
}

/**
 * Effect configuration
 */
export interface EffectConfig {
    type: EffectType;
    position: Vector3;
    intensity: number;      // 0-1
    duration: number;       // seconds
    color?: Color4;
    scale?: number;
}

/**
 * Active effect tracking
 */
interface ActiveEffect {
    id: string;
    type: EffectType;
    particles?: ParticleSystem;
    trail?: TrailMesh;
    mesh?: Mesh;
    sprites?: Sprite[];
    startTime: number;
    duration: number;
    cleanup: () => void;
}

/**
 * Advanced visual effects system for baseball game
 */
export class VisualEffectsSystem {
    private scene: Scene;
    private activeEffects: Map<string, ActiveEffect> = new Map();
    private effectIdCounter: number = 0;

    // Particle system pools for performance
    private particlePoolalphabet: Map<EffectType, ParticleSystem[]> = new Map();

    // Sprite managers
    private impactSpriteManager: SpriteManager | null = null;
    private uiEffectSpriteManager: SpriteManager | null = null;

    // Glow layer for highlights
    private glowLayer: GlowLayer | null = null;

    // Post-processing effects
    private highlightPostProcess: HighlightsPostProcess | null = null;

    // Effect settings
    private effectsEnabled: boolean = true;
    private effectQuality: 'low' | 'medium' | 'high' = 'high';

    constructor(scene: Scene) {
        this.scene = scene;
        this.initialize();
    }

    /**
     * Initialize effects system
     */
    private initialize(): void {
        // Create glow layer
        this.glowLayer = new GlowLayer('glowLayer', this.scene);
        this.glowLayer.intensity = 0.5;

        // Create sprite managers
        this.impactSpriteManager = new SpriteManager(
            'impactSprites',
            '', // Would load texture
            500,
            { width: 256, height: 256 },
            this.scene
        );

        this.uiEffectSpriteManager = new SpriteManager(
            'uiSprites',
            '', // Would load texture
            100,
            { width: 128, height: 128 },
            this.scene
        );

        // Initialize particle pools
        this.initializeParticlePools();
    }

    /**
     * Initialize particle system pools
     */
    private initializeParticlePools(): void {
        // Pre-create particle systems for common effects
        const commonEffects = [
            EffectType.BAT_CONTACT,
            EffectType.GLOVE_CATCH,
            EffectType.DUST_CLOUD,
            EffectType.DIRT_SPRAY
        ];

        for (const effectType of commonEffects) {
            this.particlePoolalphabet.set(effectType, []);
        }
    }

    /**
     * Play effect at position
     */
    public playEffect(config: EffectConfig): string {
        if (!this.effectsEnabled) return '';

        const effectId = `effect_${this.effectIdCounter++}`;
        let activeEffect: ActiveEffect | null = null;

        switch (config.type) {
            case EffectType.BAT_CONTACT:
                activeEffect = this.createBatContactEffect(effectId, config);
                break;

            case EffectType.GLOVE_CATCH:
                activeEffect = this.createGloveCatchEffect(effectId, config);
                break;

            case EffectType.GROUND_IMPACT:
                activeEffect = this.createGroundImpactEffect(effectId, config);
                break;

            case EffectType.WALL_IMPACT:
                activeEffect = this.createWallImpactEffect(effectId, config);
                break;

            case EffectType.SAFE_SLIDE:
                activeEffect = this.createSafeSlideEffect(effectId, config);
                break;

            case EffectType.OUT_TAG:
                activeEffect = this.createOutTagEffect(effectId, config);
                break;

            case EffectType.HOMERUN_BURST:
                activeEffect = this.createHomerunBurstEffect(effectId, config);
                break;

            case EffectType.DUST_CLOUD:
                activeEffect = this.createDustCloudEffect(effectId, config);
                break;

            case EffectType.DIRT_SPRAY:
                activeEffect = this.createDirtSprayEffect(effectId, config);
                break;

            case EffectType.GRASS_PARTICLES:
                activeEffect = this.createGrassParticlesEffect(effectId, config);
                break;

            case EffectType.PERFECT_CONTACT_FLASH:
                activeEffect = this.createPerfectContactFlash(effectId, config);
                break;

            case EffectType.HOMERUN_FIREWORKS:
                activeEffect = this.createHomerunFireworks(effectId, config);
                break;

            case EffectType.STRIKEOUT_EFFECT:
                activeEffect = this.createStrikeoutEffect(effectId, config);
                break;

            case EffectType.CATCH_SPARKLE:
                activeEffect = this.createCatchSparkle(effectId, config);
                break;

            case EffectType.BALL_TRAIL:
                activeEffect = this.createBallTrail(effectId, config);
                break;

            case EffectType.BALL_GLOW:
                activeEffect = this.createBallGlow(effectId, config);
                break;

            default:
                console.warn(`Effect type ${config.type} not implemented`);
                return '';
        }

        if (activeEffect) {
            this.activeEffects.set(effectId, activeEffect);
        }

        return effectId;
    }

    /**
     * Create bat contact effect - spark burst on hit
     */
    private createBatContactEffect(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('batContact', 100, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;
        particles.minEmitBox = new Vector3(-0.1, -0.1, -0.1);
        particles.maxEmitBox = new Vector3(0.1, 0.1, 0.1);

        // Explosive burst
        particles.minLifeTime = 0.1;
        particles.maxLifeTime = 0.3;
        particles.minSize = 0.05;
        particles.maxSize = 0.15;
        particles.emitRate = 500;

        // Radial burst
        particles.createDirectedSphereEmitter(1, new Vector3(0, 0, 1), new Vector3(0, 0, 1));

        // Colors - white/yellow spark
        const color = config.color || new Color4(1, 1, 0.8, 1);
        particles.color1 = color;
        particles.color2 = new Color4(1, 0.8, 0.3, 1);
        particles.colorDead = new Color4(0.5, 0.5, 0.5, 0);

        particles.minInitialRotation = 0;
        particles.maxInitialRotation = Math.PI * 2;
        particles.minAngularSpeed = -2;
        particles.maxAngularSpeed = 2;

        particles.start();
        particles.targetStopDuration = config.duration;

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create glove catch effect - puff and sparkle
     */
    private createGloveCatchEffect(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('gloveCatch', 50, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;

        particles.minLifeTime = 0.2;
        particles.maxLifeTime = 0.5;
        particles.minSize = 0.08;
        particles.maxSize = 0.2;
        particles.emitRate = 200;

        // Puff outward
        particles.direction1 = new Vector3(-1, 0.5, -1);
        particles.direction2 = new Vector3(1, 1, 1);
        particles.minEmitPower = 2;
        particles.maxEmitPower = 4;

        // White/leather color
        particles.color1 = new Color4(0.9, 0.85, 0.7, 0.8);
        particles.color2 = new Color4(0.7, 0.6, 0.4, 0.6);
        particles.colorDead = new Color4(0.5, 0.5, 0.5, 0);

        particles.start();
        particles.targetStopDuration = config.duration;

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create ground impact effect - dirt explosion
     */
    private createGroundImpactEffect(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('groundImpact', 150, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;

        particles.minLifeTime = 0.3;
        particles.maxLifeTime = 0.8;
        particles.minSize = 0.1;
        particles.maxSize = 0.3;
        particles.emitRate = 300;

        // Upward spray
        particles.direction1 = new Vector3(-1, 2, -1);
        particles.direction2 = new Vector3(1, 4, 1);
        particles.minEmitPower = 3;
        particles.maxEmitPower = 8;

        particles.gravity = new Vector3(0, -9.81, 0);

        // Brown dirt color
        particles.color1 = new Color4(0.4, 0.3, 0.2, 0.9);
        particles.color2 = new Color4(0.3, 0.25, 0.15, 0.7);
        particles.colorDead = new Color4(0.2, 0.15, 0.1, 0);

        particles.start();
        particles.targetStopDuration = config.duration * 0.3; // Quick burst

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create wall impact effect
     */
    private createWallImpactEffect(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('wallImpact', 80, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;

        particles.minLifeTime = 0.2;
        particles.maxLifeTime = 0.5;
        particles.minSize = 0.05;
        particles.maxSize = 0.15;
        particles.emitRate = 400;

        // Bounce back from wall
        particles.direction1 = new Vector3(-0.5, -0.5, 1);
        particles.direction2 = new Vector3(0.5, 0.5, 3);

        // White/yellow impact
        particles.color1 = new Color4(1, 1, 1, 1);
        particles.color2 = new Color4(1, 0.9, 0.5, 0.8);
        particles.colorDead = new Color4(0.5, 0.5, 0.5, 0);

        particles.start();
        particles.targetStopDuration = 0.1;

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create safe slide effect - dirt trail
     */
    private createSafeSlideEffect(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('safeSlide', 200, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;
        particles.minEmitBox = new Vector3(-0.5, 0, -0.2);
        particles.maxEmitBox = new Vector3(0.5, 0.1, 0.2);

        particles.minLifeTime = 0.5;
        particles.maxLifeTime = 1.2;
        particles.minSize = 0.15;
        particles.maxSize = 0.4;
        particles.emitRate = 250;

        // Spray behind runner
        particles.direction1 = new Vector3(-1, 0.5, -2);
        particles.direction2 = new Vector3(1, 1.5, -1);

        particles.gravity = new Vector3(0, -5, 0);

        // Dirt cloud
        particles.color1 = new Color4(0.5, 0.4, 0.3, 0.7);
        particles.color2 = new Color4(0.4, 0.3, 0.2, 0.5);
        particles.colorDead = new Color4(0.3, 0.25, 0.2, 0);

        particles.start();
        particles.targetStopDuration = config.duration;

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create out tag effect
     */
    private createOutTagEffect(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('outTag', 60, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;

        particles.minLifeTime = 0.3;
        particles.maxLifeTime = 0.6;
        particles.minSize = 0.1;
        particles.maxSize = 0.25;
        particles.emitRate = 300;

        particles.createSphereEmitter(1);

        // Red for out
        particles.color1 = new Color4(1, 0.2, 0.2, 1);
        particles.color2 = new Color4(0.8, 0, 0, 0.8);
        particles.colorDead = new Color4(0.5, 0, 0, 0);

        particles.start();
        particles.targetStopDuration = 0.2;

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create homerun burst effect
     */
    private createHomerunBurstEffect(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('homerunBurst', 300, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;

        particles.minLifeTime = 1.0;
        particles.maxLifeTime = 2.0;
        particles.minSize = 0.2;
        particles.maxSize = 0.5;
        particles.emitRate = 400;

        particles.createSphereEmitter(2);
        particles.minEmitPower = 5;
        particles.maxEmitPower = 10;

        particles.gravity = new Vector3(0, 2, 0); // Float up

        // Gold celebration colors
        particles.color1 = new Color4(1, 0.9, 0, 1);
        particles.color2 = new Color4(1, 0.6, 0, 1);
        particles.colorDead = new Color4(1, 0.8, 0.3, 0);

        particles.start();
        particles.targetStopDuration = 1.0;

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create dust cloud effect
     */
    private createDustCloudEffect(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('dustCloud', 100, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;

        particles.minLifeTime = 0.8;
        particles.maxLifeTime = 1.5;
        particles.minSize = 0.3;
        particles.maxSize = 0.8;
        particles.emitRate = 150;

        particles.direction1 = new Vector3(-0.5, 0.2, -0.5);
        particles.direction2 = new Vector3(0.5, 0.8, 0.5);
        particles.minEmitPower = 1;
        particles.maxEmitPower = 3;

        // Gray/brown dust
        particles.color1 = new Color4(0.6, 0.55, 0.5, 0.4);
        particles.color2 = new Color4(0.5, 0.45, 0.4, 0.3);
        particles.colorDead = new Color4(0.4, 0.35, 0.3, 0);

        particles.start();
        particles.targetStopDuration = config.duration * 0.5;

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create dirt spray effect
     */
    private createDirtSprayEffect(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('dirtSpray', 120, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;

        particles.minLifeTime = 0.4;
        particles.maxLifeTime = 0.9;
        particles.minSize = 0.08;
        particles.maxSize = 0.2;
        particles.emitRate = 300;

        particles.direction1 = new Vector3(-1, 1, -1);
        particles.direction2 = new Vector3(1, 3, 1);
        particles.minEmitPower = 4;
        particles.maxEmitPower = 8;

        particles.gravity = new Vector3(0, -9.81, 0);

        // Dark brown dirt
        particles.color1 = new Color4(0.35, 0.25, 0.15, 0.9);
        particles.color2 = new Color4(0.25, 0.2, 0.1, 0.7);
        particles.colorDead = new Color4(0.15, 0.1, 0.05, 0);

        particles.start();
        particles.targetStopDuration = 0.3;

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create grass particles effect
     */
    private createGrassParticlesEffect(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('grassParticles', 80, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;

        particles.minLifeTime = 0.5;
        particles.maxLifeTime = 1.0;
        particles.minSize = 0.05;
        particles.maxSize = 0.12;
        particles.emitRate = 200;

        particles.direction1 = new Vector3(-0.8, 0.5, -0.8);
        particles.direction2 = new Vector3(0.8, 2, 0.8);

        particles.gravity = new Vector3(0, -7, 0);

        // Green grass
        particles.color1 = new Color4(0.2, 0.6, 0.2, 1);
        particles.color2 = new Color4(0.1, 0.5, 0.1, 0.8);
        particles.colorDead = new Color4(0.1, 0.3, 0.1, 0);

        particles.start();
        particles.targetStopDuration = 0.4;

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create perfect contact flash
     */
    private createPerfectContactFlash(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('perfectFlash', 200, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;

        particles.minLifeTime = 0.15;
        particles.maxLifeTime = 0.35;
        particles.minSize = 0.1;
        particles.maxSize = 0.3;
        particles.emitRate = 800;

        particles.createSphereEmitter(0.5);
        particles.minEmitPower = 8;
        particles.maxEmitPower = 15;

        // Bright white/gold flash
        particles.color1 = new Color4(1, 1, 1, 1);
        particles.color2 = new Color4(1, 0.95, 0.7, 1);
        particles.colorDead = new Color4(1, 1, 0.5, 0);

        particles.start();
        particles.targetStopDuration = 0.1;

        // Add glow to ball
        if (this.glowLayer) {
            this.glowLayer.intensity = 1.5;
            setTimeout(() => {
                if (this.glowLayer) this.glowLayer.intensity = 0.5;
            }, 200);
        }

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create homerun fireworks
     */
    private createHomerunFireworks(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('fireworks', 500, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;

        particles.minLifeTime = 1.5;
        particles.maxLifeTime = 3.0;
        particles.minSize = 0.15;
        particles.maxSize = 0.4;
        particles.emitRate = 300;

        particles.createSphereEmitter(3);
        particles.minEmitPower = 10;
        particles.maxEmitPower = 20;

        particles.gravity = new Vector3(0, -2, 0);

        // Rainbow colors
        particles.color1 = new Color4(Math.random(), Math.random(), Math.random(), 1);
        particles.color2 = new Color4(Math.random(), Math.random(), Math.random(), 1);
        particles.colorDead = new Color4(0.5, 0.5, 0.5, 0);

        particles.start();
        particles.targetStopDuration = 2.0;

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create strikeout effect
     */
    private createStrikeoutEffect(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('strikeout', 100, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;

        particles.minLifeTime = 0.8;
        particles.maxLifeTime = 1.5;
        particles.minSize = 0.2;
        particles.maxSize = 0.5;
        particles.emitRate = 150;

        particles.direction1 = new Vector3(-1, -1, -1);
        particles.direction2 = new Vector3(1, -0.2, 1);

        particles.gravity = new Vector3(0, -3, 0);

        // Red strike color
        particles.color1 = new Color4(1, 0, 0, 0.8);
        particles.color2 = new Color4(0.8, 0, 0, 0.6);
        particles.colorDead = new Color4(0.4, 0, 0, 0);

        particles.start();
        particles.targetStopDuration = 0.5;

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create catch sparkle effect
     */
    private createCatchSparkle(id: string, config: EffectConfig): ActiveEffect {
        const particles = new ParticleSystem('catchSparkle', 80, this.scene);

        particles.particleTexture = new Texture('', this.scene);
        particles.emitter = config.position;

        particles.minLifeTime = 0.4;
        particles.maxLifeTime = 0.8;
        particles.minSize = 0.08;
        particles.maxSize = 0.2;
        particles.emitRate = 250;

        particles.createSphereEmitter(0.8);

        // Sparkle colors
        particles.color1 = new Color4(1, 1, 0.8, 1);
        particles.color2 = new Color4(0.9, 0.9, 1, 0.8);
        particles.colorDead = new Color4(0.7, 0.7, 0.9, 0);

        particles.start();
        particles.targetStopDuration = 0.3;

        return {
            id,
            type: config.type,
            particles,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup: () => {
                particles.dispose();
            }
        };
    }

    /**
     * Create ball trail effect
     */
    private createBallTrail(id: string, config: EffectConfig): ActiveEffect {
        // Trail mesh following ball
        // Note: Would need ball mesh reference in real implementation

        const cleanup = () => {
            // Cleanup trail
        };

        return {
            id,
            type: config.type,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup
        };
    }

    /**
     * Create ball glow effect
     */
    private createBallGlow(id: string, config: EffectConfig): ActiveEffect {
        if (this.glowLayer) {
            this.glowLayer.intensity = config.intensity;
        }

        const cleanup = () => {
            if (this.glowLayer) {
                this.glowLayer.intensity = 0.5;
            }
        };

        return {
            id,
            type: config.type,
            startTime: performance.now() / 1000,
            duration: config.duration,
            cleanup
        };
    }

    /**
     * Update effects system (call each frame)
     */
    public update(deltaTime: number): void {
        const currentTime = performance.now() / 1000;

        // Check for expired effects
        const expiredEffects: string[] = [];

        for (const [id, effect] of this.activeEffects.entries()) {
            const elapsed = currentTime - effect.startTime;

            if (elapsed >= effect.duration) {
                expiredEffects.push(id);
            }
        }

        // Clean up expired effects
        for (const id of expiredEffects) {
            this.stopEffect(id);
        }
    }

    /**
     * Stop and cleanup effect
     */
    public stopEffect(effectId: string): void {
        const effect = this.activeEffects.get(effectId);
        if (!effect) return;

        effect.cleanup();
        this.activeEffects.delete(effectId);
    }

    /**
     * Stop all effects
     */
    public stopAllEffects(): void {
        for (const [id, effect] of this.activeEffects.entries()) {
            effect.cleanup();
        }
        this.activeEffects.clear();
    }

    /**
     * Set effect quality level
     */
    public setEffectQuality(quality: 'low' | 'medium' | 'high'): void {
        this.effectQuality = quality;

        // Adjust particle counts based on quality
        // In real implementation, would modify particle system settings
    }

    /**
     * Enable/disable effects
     */
    public setEffectsEnabled(enabled: boolean): void {
        this.effectsEnabled = enabled;

        if (!enabled) {
            this.stopAllEffects();
        }
    }

    /**
     * Get active effect count
     */
    public getActiveEffectCount(): number {
        return this.activeEffects.size;
    }

    /**
     * Dispose effects system
     */
    public dispose(): void {
        this.stopAllEffects();

        if (this.impactSpriteManager) {
            this.impactSpriteManager.dispose();
        }

        if (this.uiEffectSpriteManager) {
            this.uiEffectSpriteManager.dispose();
        }

        if (this.glowLayer) {
            this.glowLayer.dispose();
        }

        for (const pool of this.particlePoolalphabet.values()) {
            for (const particles of pool) {
                particles.dispose();
            }
        }

        this.particlePoolalphabet.clear();
    }
}
