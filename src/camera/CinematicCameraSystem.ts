import { Scene, Vector3, ArcRotateCamera, FreeCamera, FollowCamera, Animation, CubicEase, EasingFunction, Quaternion, Camera, Color3, PostProcess, Effect } from '@babylonjs/core';

/**
 * Camera modes for different game situations
 */
export enum CameraMode {
    BATTING = 'batting',
    PITCHING = 'pitching',
    FIELDING = 'fielding',
    BASE_RUNNING = 'base_running',
    FLY_BALL = 'fly_ball',
    REPLAY = 'replay',
    CINEMATIC = 'cinematic',
    FREE = 'free',
    BROADCAST = 'broadcast',
    BEHIND_PITCHER = 'behind_pitcher',
    BEHIND_BATTER = 'behind_batter',
    FIRST_BASE_SIDE = 'first_base_side',
    THIRD_BASE_SIDE = 'third_base_side',
    CENTER_FIELD = 'center_field',
    DUGOUT = 'dugout',
    OVERHEAD = 'overhead',
    CATCHER_POV = 'catcher_pov',
    PITCHER_POV = 'pitcher_pov',
    BATTER_POV = 'batter_pov',
    RUNNER_POV = 'runner_pov',
    OUTFIELD_POV = 'outfield_pov',
    CUSTOM = 'custom'
}

/**
 * Camera animation types
 */
export enum CameraAnimationType {
    LINEAR = 'linear',
    EASE_IN = 'ease_in',
    EASE_OUT = 'ease_out',
    EASE_IN_OUT = 'ease_in_out',
    SPRING = 'spring',
    BOUNCE = 'bounce',
    ELASTIC = 'elastic'
}

/**
 * Camera shake intensity
 */
export enum ShakeIntensity {
    SUBTLE = 'subtle',
    LIGHT = 'light',
    MEDIUM = 'medium',
    HEAVY = 'heavy',
    EXTREME = 'extreme'
}

/**
 * Camera configuration for different modes
 */
export interface CameraConfiguration {
    mode: CameraMode;
    position: Vector3;
    target: Vector3;
    fov?: number;
    radius?: number;
    alpha?: number;
    beta?: number;
    minZ?: number;
    maxZ?: number;
    speed?: number;
    inertia?: number;
    angularSensibility?: number;
    wheelPrecision?: number;
    pinchPrecision?: number;
    panningSensibility?: number;
    lowerRadiusLimit?: number;
    upperRadiusLimit?: number;
    lowerBetaLimit?: number;
    upperBetaLimit?: number;
    checkCollisions?: boolean;
    collisionRadius?: Vector3;
    heightOffset?: number;
    rotationOffset?: number;
    cameraAcceleration?: number;
    maxCameraSpeed?: number;
}

/**
 * Camera transition configuration
 */
export interface CameraTransition {
    from: CameraConfiguration;
    to: CameraConfiguration;
    duration: number;
    animationType: CameraAnimationType;
    onComplete?: () => void;
    onUpdate?: (progress: number) => void;
}

/**
 * Camera shake configuration
 */
export interface CameraShakeConfig {
    intensity: ShakeIntensity;
    duration: number;
    frequency?: number;
    decay?: number;
    axes?: {
        x?: boolean;
        y?: boolean;
        z?: boolean;
    };
}

/**
 * Camera focus target
 */
export interface CameraFocusTarget {
    position: Vector3;
    priority: number;
    weight: number;
    radius: number;
    name?: string;
}

/**
 * Camera path point
 */
export interface CameraPathPoint {
    position: Vector3;
    target: Vector3;
    time: number;
    fov?: number;
}

/**
 * Camera path configuration
 */
export interface CameraPath {
    points: CameraPathPoint[];
    duration: number;
    loop: boolean;
    animationType: CameraAnimationType;
}

/**
 * Dynamic camera settings
 */
export interface DynamicCameraSettings {
    enableAutoZoom: boolean;
    enableAutoFollow: boolean;
    enableSmoothing: boolean;
    enablePrediction: boolean;
    enableCollisionAvoidance: boolean;
    smoothingFactor: number;
    predictionTime: number;
    autoZoomSpeed: number;
    autoZoomMinDistance: number;
    autoZoomMaxDistance: number;
    lookAheadDistance: number;
    velocityInfluence: number;
}

/**
 * Cinematic camera event
 */
export interface CinematicEvent {
    type: string;
    cameraMode: CameraMode;
    duration: number;
    priority: number;
    data?: any;
}

/**
 * Camera state
 */
export interface CameraState {
    mode: CameraMode;
    position: Vector3;
    target: Vector3;
    fov: number;
    isTransitioning: boolean;
    isShaking: boolean;
    isFollowing: boolean;
    followTarget?: Vector3;
    customData?: any;
}

/**
 * Comprehensive cinematic camera system with dynamic views and smooth transitions
 */
export class CinematicCameraSystem {
    private scene: Scene;
    private activeCamera: Camera;
    private cameras: Map<string, Camera> = new Map();
    private currentMode: CameraMode = CameraMode.BROADCAST;
    private previousMode: CameraMode = CameraMode.BROADCAST;

    // Camera configurations
    private configurations: Map<CameraMode, CameraConfiguration> = new Map();
    private customConfigurations: Map<string, CameraConfiguration> = new Map();

    // Transition state
    private isTransitioning: boolean = false;
    private transitionStartTime: number = 0;
    private transitionDuration: number = 0;
    private transitionAnimation: Animation | null = null;

    // Shake state
    private isShaking: boolean = false;
    private shakeStartTime: number = 0;
    private shakeDuration: number = 0;
    private shakeIntensity: number = 0;
    private shakeFrequency: number = 0;
    private shakeDecay: number = 1.0;
    private shakeOriginalPosition: Vector3 = Vector3.Zero();
    private shakeAxes = { x: true, y: true, z: true };

    // Follow state
    private isFollowing: boolean = false;
    private followTarget: Vector3 | null = null;
    private followTargets: CameraFocusTarget[] = [];
    private followOffset: Vector3 = Vector3.Zero();
    private followSmoothing: number = 0.1;

    // Path state
    private isFollowingPath: boolean = false;
    private currentPath: CameraPath | null = null;
    private pathStartTime: number = 0;
    private pathProgress: number = 0;

    // Dynamic settings
    private dynamicSettings: DynamicCameraSettings = {
        enableAutoZoom: true,
        enableAutoFollow: true,
        enableSmoothing: true,
        enablePrediction: false,
        enableCollisionAvoidance: true,
        smoothingFactor: 0.15,
        predictionTime: 0.3,
        autoZoomSpeed: 2.0,
        autoZoomMinDistance: 10,
        autoZoomMaxDistance: 100,
        lookAheadDistance: 5,
        velocityInfluence: 0.5
    };

    // Cinematic events
    private eventQueue: CinematicEvent[] = [];
    private currentEvent: CinematicEvent | null = null;

    // Post-processing effects
    private postProcesses: Map<string, PostProcess> = new Map();
    private enableDepthOfField: boolean = false;
    private enableMotionBlur: boolean = false;
    private enableVignette: boolean = true;
    private enableFilmGrain: boolean = false;

    // Camera settings
    private defaultFOV: number = 0.8;
    private minFOV: number = 0.3;
    private maxFOV: number = 1.5;

    // MLB field dimensions (in game units)
    private readonly FIELD_DIMENSIONS = {
        pitcherMound: new Vector3(0, 0, 0),
        homePlate: new Vector3(0, 0, 18.44),  // 60.5 feet
        firstBase: new Vector3(27.432, 0, 45.872),  // 90 feet from home
        secondBase: new Vector3(0, 0, -27.432),  // 90 feet from first
        thirdBase: new Vector3(-27.432, 0, 45.872),  // 90 feet from second
        centerField: new Vector3(0, 0, -122),  // ~400 feet
        leftField: new Vector3(-91.5, 0, -76.2),  // ~330 feet
        rightField: new Vector3(91.5, 0, -76.2),  // ~330 feet
        backstop: new Vector3(0, 0, 30.5)  // 60 feet behind home
    };

    constructor(scene: Scene) {
        this.scene = scene;

        // Initialize default camera configurations
        this.initializeDefaultConfigurations();

        // Create cameras
        this.initializeCameras();

        // Set initial camera
        this.setCamera(CameraMode.BROADCAST);
    }

    /**
     * Initialize default camera configurations for all modes
     */
    private initializeDefaultConfigurations(): void {
        // Broadcast camera (center field elevated view)
        this.configurations.set(CameraMode.BROADCAST, {
            mode: CameraMode.BROADCAST,
            position: new Vector3(0, 25, -60),
            target: new Vector3(0, 1, 10),
            fov: 0.8,
            minZ: 0.1,
            maxZ: 500
        });

        // Behind pitcher camera
        this.configurations.set(CameraMode.BEHIND_PITCHER, {
            mode: CameraMode.BEHIND_PITCHER,
            position: new Vector3(0, 2, -8),
            target: this.FIELD_DIMENSIONS.homePlate.add(new Vector3(0, 1, 0)),
            fov: 0.9,
            minZ: 0.1,
            maxZ: 200
        });

        // Behind batter camera
        this.configurations.set(CameraMode.BEHIND_BATTER, {
            mode: CameraMode.BEHIND_BATTER,
            position: new Vector3(0, 2.5, 25),
            target: this.FIELD_DIMENSIONS.pitcherMound.add(new Vector3(0, 1.5, 0)),
            fov: 0.85,
            minZ: 0.1,
            maxZ: 200
        });

        // Catcher POV
        this.configurations.set(CameraMode.CATCHER_POV, {
            mode: CameraMode.CATCHER_POV,
            position: this.FIELD_DIMENSIONS.homePlate.add(new Vector3(0, 1.2, 2)),
            target: this.FIELD_DIMENSIONS.pitcherMound.add(new Vector3(0, 1.5, 0)),
            fov: 1.0,
            minZ: 0.1,
            maxZ: 100
        });

        // Pitcher POV
        this.configurations.set(CameraMode.PITCHER_POV, {
            mode: CameraMode.PITCHER_POV,
            position: this.FIELD_DIMENSIONS.pitcherMound.add(new Vector3(0, 1.7, -0.5)),
            target: this.FIELD_DIMENSIONS.homePlate.add(new Vector3(0, 1, 0)),
            fov: 0.9,
            minZ: 0.1,
            maxZ: 100
        });

        // Batter POV
        this.configurations.set(CameraMode.BATTER_POV, {
            mode: CameraMode.BATTER_POV,
            position: this.FIELD_DIMENSIONS.homePlate.add(new Vector3(-0.5, 1.6, 0.5)),
            target: this.FIELD_DIMENSIONS.pitcherMound.add(new Vector3(0, 1.5, 0)),
            fov: 0.95,
            minZ: 0.1,
            maxZ: 100
        });

        // First base side camera
        this.configurations.set(CameraMode.FIRST_BASE_SIDE, {
            mode: CameraMode.FIRST_BASE_SIDE,
            position: new Vector3(40, 15, 20),
            target: this.FIELD_DIMENSIONS.firstBase.add(new Vector3(0, 1, 0)),
            fov: 0.8,
            minZ: 0.1,
            maxZ: 300
        });

        // Third base side camera
        this.configurations.set(CameraMode.THIRD_BASE_SIDE, {
            mode: CameraMode.THIRD_BASE_SIDE,
            position: new Vector3(-40, 15, 20),
            target: this.FIELD_DIMENSIONS.thirdBase.add(new Vector3(0, 1, 0)),
            fov: 0.8,
            minZ: 0.1,
            maxZ: 300
        });

        // Center field camera
        this.configurations.set(CameraMode.CENTER_FIELD, {
            mode: CameraMode.CENTER_FIELD,
            position: new Vector3(0, 20, -100),
            target: new Vector3(0, 2, 0),
            fov: 0.75,
            minZ: 0.1,
            maxZ: 400
        });

        // Dugout camera
        this.configurations.set(CameraMode.DUGOUT, {
            mode: CameraMode.DUGOUT,
            position: new Vector3(20, 3, 25),
            target: this.FIELD_DIMENSIONS.homePlate.add(new Vector3(0, 1, 0)),
            fov: 0.85,
            minZ: 0.1,
            maxZ: 200
        });

        // Overhead camera
        this.configurations.set(CameraMode.OVERHEAD, {
            mode: CameraMode.OVERHEAD,
            position: new Vector3(0, 80, 0),
            target: Vector3.Zero(),
            fov: 1.2,
            minZ: 0.1,
            maxZ: 500
        });

        // Batting camera (optimized for batting gameplay)
        this.configurations.set(CameraMode.BATTING, {
            mode: CameraMode.BATTING,
            position: new Vector3(2, 3, 22),
            target: this.FIELD_DIMENSIONS.pitcherMound.add(new Vector3(0, 1.5, 0)),
            fov: 0.85,
            minZ: 0.1,
            maxZ: 150
        });

        // Pitching camera (optimized for pitching gameplay)
        this.configurations.set(CameraMode.PITCHING, {
            mode: CameraMode.PITCHING,
            position: new Vector3(1, 2.5, -5),
            target: this.FIELD_DIMENSIONS.homePlate.add(new Vector3(0, 1, 0)),
            fov: 0.9,
            minZ: 0.1,
            maxZ: 150
        });

        // Fielding camera (dynamic, follows ball)
        this.configurations.set(CameraMode.FIELDING, {
            mode: CameraMode.FIELDING,
            position: new Vector3(0, 20, -30),
            target: Vector3.Zero(),
            fov: 0.8,
            minZ: 0.1,
            maxZ: 300
        });

        // Base running camera
        this.configurations.set(CameraMode.BASE_RUNNING, {
            mode: CameraMode.BASE_RUNNING,
            position: new Vector3(0, 15, 10),
            target: Vector3.Zero(),
            fov: 0.85,
            minZ: 0.1,
            maxZ: 250
        });

        // Fly ball camera (tracks high balls)
        this.configurations.set(CameraMode.FLY_BALL, {
            mode: CameraMode.FLY_BALL,
            position: new Vector3(0, 10, 20),
            target: new Vector3(0, 15, -20),
            fov: 0.75,
            minZ: 0.1,
            maxZ: 400
        });

        // Replay camera (versatile for replays)
        this.configurations.set(CameraMode.REPLAY, {
            mode: CameraMode.REPLAY,
            position: new Vector3(10, 8, 15),
            target: Vector3.Zero(),
            fov: 0.8,
            minZ: 0.1,
            maxZ: 300
        });

        // Free camera (user-controlled)
        this.configurations.set(CameraMode.FREE, {
            mode: CameraMode.FREE,
            position: new Vector3(0, 10, 30),
            target: Vector3.Zero(),
            fov: 0.8,
            speed: 1.0,
            inertia: 0.9,
            minZ: 0.1,
            maxZ: 500
        });
    }

    /**
     * Initialize cameras
     */
    private initializeCameras(): void {
        // Create main ArcRotate camera
        const arcCamera = new ArcRotateCamera(
            'arcCamera',
            Math.PI / 2,
            Math.PI / 4,
            50,
            Vector3.Zero(),
            this.scene
        );
        arcCamera.minZ = 0.1;
        arcCamera.maxZ = 500;
        arcCamera.wheelPrecision = 50;
        arcCamera.pinchPrecision = 50;
        this.cameras.set('arc', arcCamera);

        // Create free camera
        const freeCamera = new FreeCamera(
            'freeCamera',
            new Vector3(0, 10, 30),
            this.scene
        );
        freeCamera.minZ = 0.1;
        freeCamera.maxZ = 500;
        freeCamera.speed = 1.0;
        freeCamera.keysUp = [87]; // W
        freeCamera.keysDown = [83]; // S
        freeCamera.keysLeft = [65]; // A
        freeCamera.keysRight = [68]; // D
        this.cameras.set('free', freeCamera);

        // Create follow camera
        const followCamera = new FollowCamera(
            'followCamera',
            new Vector3(0, 10, 30),
            this.scene
        );
        followCamera.minZ = 0.1;
        followCamera.maxZ = 500;
        followCamera.radius = 20;
        followCamera.heightOffset = 8;
        followCamera.rotationOffset = 0;
        followCamera.cameraAcceleration = 0.05;
        followCamera.maxCameraSpeed = 10;
        this.cameras.set('follow', followCamera);

        // Set default active camera
        this.activeCamera = arcCamera;
        this.scene.activeCamera = arcCamera;
    }

    /**
     * Set camera mode
     */
    public setCamera(mode: CameraMode, transitionDuration: number = 1.0, animationType: CameraAnimationType = CameraAnimationType.EASE_IN_OUT): void {
        const config = this.configurations.get(mode);
        if (!config) {
            console.warn(`Camera configuration not found for mode: ${mode}`);
            return;
        }

        this.previousMode = this.currentMode;
        this.currentMode = mode;

        if (transitionDuration > 0) {
            this.transitionToConfiguration(config, transitionDuration, animationType);
        } else {
            this.applyConfiguration(config);
        }
    }

    /**
     * Apply camera configuration immediately
     */
    private applyConfiguration(config: CameraConfiguration): void {
        if (this.activeCamera instanceof ArcRotateCamera) {
            this.activeCamera.setPosition(config.position);
            this.activeCamera.setTarget(config.target);
            if (config.fov !== undefined) {
                this.activeCamera.fov = config.fov;
            }
            if (config.minZ !== undefined) {
                this.activeCamera.minZ = config.minZ;
            }
            if (config.maxZ !== undefined) {
                this.activeCamera.maxZ = config.maxZ;
            }
        } else if (this.activeCamera instanceof FreeCamera) {
            this.activeCamera.position = config.position.clone();
            this.activeCamera.setTarget(config.target);
            if (config.fov !== undefined) {
                this.activeCamera.fov = config.fov;
            }
            if (config.speed !== undefined) {
                this.activeCamera.speed = config.speed;
            }
            if (config.inertia !== undefined) {
                this.activeCamera.inertia = config.inertia;
            }
        }
    }

    /**
     * Transition to camera configuration
     */
    private transitionToConfiguration(config: CameraConfiguration, duration: number, animationType: CameraAnimationType): void {
        this.isTransitioning = true;
        this.transitionStartTime = Date.now();
        this.transitionDuration = duration * 1000;

        const startPosition = this.activeCamera.position.clone();
        const endPosition = config.position.clone();

        let startTarget: Vector3;
        if (this.activeCamera instanceof ArcRotateCamera) {
            startTarget = this.activeCamera.target.clone();
        } else if (this.activeCamera instanceof FreeCamera) {
            startTarget = this.activeCamera.getTarget().clone();
        } else {
            startTarget = Vector3.Zero();
        }
        const endTarget = config.target.clone();

        const startFOV = this.activeCamera.fov;
        const endFOV = config.fov !== undefined ? config.fov : startFOV;

        // Create animation
        const frameRate = 60;
        const totalFrames = Math.floor(duration * frameRate);

        // Position animation
        const positionAnimation = new Animation(
            'cameraPositionTransition',
            'position',
            frameRate,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const positionKeys = [
            { frame: 0, value: startPosition },
            { frame: totalFrames, value: endPosition }
        ];
        positionAnimation.setKeys(positionKeys);

        // Apply easing
        this.applyEasingToAnimation(positionAnimation, animationType);

        // Target animation
        const targetAnimation = new Animation(
            'cameraTargetTransition',
            this.activeCamera instanceof ArcRotateCamera ? 'target' : 'lockedTarget',
            frameRate,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const targetKeys = [
            { frame: 0, value: startTarget },
            { frame: totalFrames, value: endTarget }
        ];
        targetAnimation.setKeys(targetKeys);
        this.applyEasingToAnimation(targetAnimation, animationType);

        // FOV animation
        const fovAnimation = new Animation(
            'cameraFOVTransition',
            'fov',
            frameRate,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const fovKeys = [
            { frame: 0, value: startFOV },
            { frame: totalFrames, value: endFOV }
        ];
        fovAnimation.setKeys(fovKeys);
        this.applyEasingToAnimation(fovAnimation, animationType);

        // Start animations
        this.scene.beginDirectAnimation(
            this.activeCamera,
            [positionAnimation, targetAnimation, fovAnimation],
            0,
            totalFrames,
            false,
            1.0,
            () => {
                this.isTransitioning = false;
                this.applyConfiguration(config);
            }
        );
    }

    /**
     * Apply easing function to animation
     */
    private applyEasingToAnimation(animation: Animation, type: CameraAnimationType): void {
        const easing = new CubicEase();

        switch (type) {
            case CameraAnimationType.EASE_IN:
                easing.setEasingMode(EasingFunction.EASINGMODE_EASEIN);
                break;
            case CameraAnimationType.EASE_OUT:
                easing.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
                break;
            case CameraAnimationType.EASE_IN_OUT:
                easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
                break;
            case CameraAnimationType.LINEAR:
                // No easing
                return;
            default:
                easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        }

        animation.setEasingFunction(easing);
    }

    /**
     * Shake camera
     */
    public shake(config: CameraShakeConfig): void {
        this.isShaking = true;
        this.shakeStartTime = Date.now();
        this.shakeDuration = config.duration * 1000;
        this.shakeOriginalPosition = this.activeCamera.position.clone();

        // Set intensity
        switch (config.intensity) {
            case ShakeIntensity.SUBTLE:
                this.shakeIntensity = 0.02;
                break;
            case ShakeIntensity.LIGHT:
                this.shakeIntensity = 0.05;
                break;
            case ShakeIntensity.MEDIUM:
                this.shakeIntensity = 0.1;
                break;
            case ShakeIntensity.HEAVY:
                this.shakeIntensity = 0.2;
                break;
            case ShakeIntensity.EXTREME:
                this.shakeIntensity = 0.4;
                break;
        }

        this.shakeFrequency = config.frequency || 30;
        this.shakeDecay = config.decay || 1.0;
        this.shakeAxes = config.axes || { x: true, y: true, z: true };
    }

    /**
     * Follow target
     */
    public followTarget(target: Vector3, offset?: Vector3, smoothing?: number): void {
        this.isFollowing = true;
        this.followTarget = target;
        this.followOffset = offset || Vector3.Zero();
        this.followSmoothing = smoothing || 0.1;
    }

    /**
     * Stop following target
     */
    public stopFollowing(): void {
        this.isFollowing = false;
        this.followTarget = null;
    }

    /**
     * Add focus target
     */
    public addFocusTarget(target: CameraFocusTarget): void {
        this.followTargets.push(target);
    }

    /**
     * Remove focus target
     */
    public removeFocusTarget(name: string): void {
        this.followTargets = this.followTargets.filter(t => t.name !== name);
    }

    /**
     * Clear all focus targets
     */
    public clearFocusTargets(): void {
        this.followTargets = [];
    }

    /**
     * Calculate weighted focus point
     */
    private calculateWeightedFocus(): Vector3 {
        if (this.followTargets.length === 0) {
            return this.followTarget || Vector3.Zero();
        }

        let totalWeight = 0;
        const weightedSum = new Vector3(0, 0, 0);

        for (const target of this.followTargets) {
            const weight = target.weight * target.priority;
            weightedSum.addInPlace(target.position.scale(weight));
            totalWeight += weight;
        }

        if (totalWeight > 0) {
            return weightedSum.scale(1 / totalWeight);
        }

        return this.followTarget || Vector3.Zero();
    }

    /**
     * Follow path
     */
    public followPath(path: CameraPath): void {
        this.isFollowingPath = true;
        this.currentPath = path;
        this.pathStartTime = Date.now();
        this.pathProgress = 0;
    }

    /**
     * Stop following path
     */
    public stopPath(): void {
        this.isFollowingPath = false;
        this.currentPath = null;
        this.pathProgress = 0;
    }

    /**
     * Queue cinematic event
     */
    public queueEvent(event: CinematicEvent): void {
        this.eventQueue.push(event);
        this.eventQueue.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Clear event queue
     */
    public clearEvents(): void {
        this.eventQueue = [];
        this.currentEvent = null;
    }

    /**
     * Set dynamic camera settings
     */
    public setDynamicSettings(settings: Partial<DynamicCameraSettings>): void {
        this.dynamicSettings = { ...this.dynamicSettings, ...settings };
    }

    /**
     * Get current camera state
     */
    public getState(): CameraState {
        let target: Vector3;
        if (this.activeCamera instanceof ArcRotateCamera) {
            target = this.activeCamera.target.clone();
        } else if (this.activeCamera instanceof FreeCamera) {
            target = this.activeCamera.getTarget().clone();
        } else {
            target = Vector3.Zero();
        }

        return {
            mode: this.currentMode,
            position: this.activeCamera.position.clone(),
            target: target,
            fov: this.activeCamera.fov,
            isTransitioning: this.isTransitioning,
            isShaking: this.isShaking,
            isFollowing: this.isFollowing,
            followTarget: this.followTarget?.clone()
        };
    }

    /**
     * Create custom camera configuration
     */
    public createCustomConfiguration(name: string, config: CameraConfiguration): void {
        this.customConfigurations.set(name, config);
    }

    /**
     * Load custom configuration
     */
    public loadCustomConfiguration(name: string, transitionDuration: number = 1.0): void {
        const config = this.customConfigurations.get(name);
        if (!config) {
            console.warn(`Custom configuration not found: ${name}`);
            return;
        }

        if (transitionDuration > 0) {
            this.transitionToConfiguration(config, transitionDuration, CameraAnimationType.EASE_IN_OUT);
        } else {
            this.applyConfiguration(config);
        }
    }

    /**
     * Enable depth of field
     */
    public enableDepthOfFieldEffect(focalLength: number, focalDepth: number, aperture: number): void {
        this.enableDepthOfField = true;
        // Depth of field implementation would go here
        // This requires additional shaders and post-processing
    }

    /**
     * Disable depth of field
     */
    public disableDepthOfFieldEffect(): void {
        this.enableDepthOfField = false;
    }

    /**
     * Enable motion blur
     */
    public enableMotionBlurEffect(strength: number): void {
        this.enableMotionBlur = true;
        // Motion blur implementation would go here
    }

    /**
     * Disable motion blur
     */
    public disableMotionBlurEffect(): void {
        this.enableMotionBlur = false;
    }

    /**
     * Set FOV
     */
    public setFOV(fov: number, duration: number = 0): void {
        const clampedFOV = Math.max(this.minFOV, Math.min(this.maxFOV, fov));

        if (duration > 0) {
            const frameRate = 60;
            const totalFrames = Math.floor(duration * frameRate);

            const fovAnimation = new Animation(
                'fovChange',
                'fov',
                frameRate,
                Animation.ANIMATIONTYPE_FLOAT,
                Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            const keys = [
                { frame: 0, value: this.activeCamera.fov },
                { frame: totalFrames, value: clampedFOV }
            ];
            fovAnimation.setKeys(keys);

            this.scene.beginDirectAnimation(this.activeCamera, [fovAnimation], 0, totalFrames, false);
        } else {
            this.activeCamera.fov = clampedFOV;
        }
    }

    /**
     * Zoom to target
     */
    public zoomToTarget(target: Vector3, distance: number, duration: number = 1.0): void {
        const direction = this.activeCamera.position.subtract(target).normalize();
        const newPosition = target.add(direction.scale(distance));

        const config: CameraConfiguration = {
            mode: CameraMode.CUSTOM,
            position: newPosition,
            target: target,
            fov: this.activeCamera.fov
        };

        this.transitionToConfiguration(config, duration, CameraAnimationType.EASE_IN_OUT);
    }

    /**
     * Look at target
     */
    public lookAt(target: Vector3, duration: number = 0.5): void {
        if (this.activeCamera instanceof ArcRotateCamera) {
            if (duration > 0) {
                const frameRate = 60;
                const totalFrames = Math.floor(duration * frameRate);

                const targetAnimation = new Animation(
                    'lookAt',
                    'target',
                    frameRate,
                    Animation.ANIMATIONTYPE_VECTOR3,
                    Animation.ANIMATIONLOOPMODE_CONSTANT
                );

                const keys = [
                    { frame: 0, value: this.activeCamera.target.clone() },
                    { frame: totalFrames, value: target }
                ];
                targetAnimation.setKeys(keys);

                this.scene.beginDirectAnimation(this.activeCamera, [targetAnimation], 0, totalFrames, false);
            } else {
                this.activeCamera.setTarget(target);
            }
        } else if (this.activeCamera instanceof FreeCamera) {
            this.activeCamera.setTarget(target);
        }
    }

    /**
     * Orbit around target
     */
    public orbitAround(target: Vector3, radius: number, speed: number, duration: number): void {
        // This would create a circular orbit animation around the target
        const frameRate = 60;
        const totalFrames = Math.floor(duration * frameRate);
        const startAngle = Math.atan2(
            this.activeCamera.position.x - target.x,
            this.activeCamera.position.z - target.z
        );

        const keys: any[] = [];
        for (let frame = 0; frame <= totalFrames; frame++) {
            const progress = frame / totalFrames;
            const angle = startAngle + (speed * progress * Math.PI * 2);
            const x = target.x + Math.sin(angle) * radius;
            const z = target.z + Math.cos(angle) * radius;
            const y = this.activeCamera.position.y;

            keys.push({
                frame: frame,
                value: new Vector3(x, y, z)
            });
        }

        const orbitAnimation = new Animation(
            'orbit',
            'position',
            frameRate,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        orbitAnimation.setKeys(keys);

        this.scene.beginDirectAnimation(this.activeCamera, [orbitAnimation], 0, totalFrames, false);
    }

    /**
     * Update camera system (call every frame)
     */
    public update(deltaTime: number): void {
        // Update camera shake
        if (this.isShaking) {
            this.updateShake(deltaTime);
        }

        // Update follow target
        if (this.isFollowing && this.dynamicSettings.enableAutoFollow) {
            this.updateFollow(deltaTime);
        }

        // Update path following
        if (this.isFollowingPath) {
            this.updatePath(deltaTime);
        }

        // Update cinematic events
        this.updateEvents(deltaTime);

        // Update dynamic camera adjustments
        if (this.dynamicSettings.enableSmoothing) {
            this.updateSmoothing(deltaTime);
        }
    }

    /**
     * Update camera shake
     */
    private updateShake(deltaTime: number): void {
        const elapsed = Date.now() - this.shakeStartTime;
        const progress = elapsed / this.shakeDuration;

        if (progress >= 1) {
            this.isShaking = false;
            this.activeCamera.position = this.shakeOriginalPosition.clone();
            return;
        }

        // Apply decay
        const decayFactor = Math.pow(1 - progress, this.shakeDecay);
        const currentIntensity = this.shakeIntensity * decayFactor;

        // Generate shake offset
        const time = elapsed / 1000;
        const frequency = this.shakeFrequency;

        const offsetX = this.shakeAxes.x ? Math.sin(time * frequency) * currentIntensity : 0;
        const offsetY = this.shakeAxes.y ? Math.sin(time * frequency * 0.9) * currentIntensity : 0;
        const offsetZ = this.shakeAxes.z ? Math.sin(time * frequency * 1.1) * currentIntensity : 0;

        this.activeCamera.position = this.shakeOriginalPosition.add(new Vector3(offsetX, offsetY, offsetZ));
    }

    /**
     * Update follow target
     */
    private updateFollow(deltaTime: number): void {
        const targetPosition = this.calculateWeightedFocus();
        if (!targetPosition) return;

        const desiredPosition = targetPosition.add(this.followOffset);
        const currentPosition = this.activeCamera.position;

        // Smooth interpolation
        const smoothedPosition = Vector3.Lerp(
            currentPosition,
            desiredPosition,
            this.followSmoothing
        );

        this.activeCamera.position = smoothedPosition;

        // Update target
        if (this.activeCamera instanceof ArcRotateCamera) {
            const smoothedTarget = Vector3.Lerp(
                this.activeCamera.target,
                targetPosition,
                this.followSmoothing
            );
            this.activeCamera.setTarget(smoothedTarget);
        } else if (this.activeCamera instanceof FreeCamera) {
            this.activeCamera.setTarget(targetPosition);
        }
    }

    /**
     * Update path following
     */
    private updatePath(deltaTime: number): void {
        if (!this.currentPath) return;

        const elapsed = Date.now() - this.pathStartTime;
        this.pathProgress = elapsed / (this.currentPath.duration * 1000);

        if (this.pathProgress >= 1) {
            if (this.currentPath.loop) {
                this.pathStartTime = Date.now();
                this.pathProgress = 0;
            } else {
                this.isFollowingPath = false;
                return;
            }
        }

        // Find current segment
        const points = this.currentPath.points;
        let currentIndex = 0;
        for (let i = 0; i < points.length - 1; i++) {
            if (this.pathProgress >= points[i].time && this.pathProgress < points[i + 1].time) {
                currentIndex = i;
                break;
            }
        }

        const startPoint = points[currentIndex];
        const endPoint = points[currentIndex + 1] || points[0];

        const segmentProgress = (this.pathProgress - startPoint.time) / (endPoint.time - startPoint.time);

        // Interpolate position and target
        const position = Vector3.Lerp(startPoint.position, endPoint.position, segmentProgress);
        const target = Vector3.Lerp(startPoint.target, endPoint.target, segmentProgress);

        this.activeCamera.position = position;
        if (this.activeCamera instanceof ArcRotateCamera) {
            this.activeCamera.setTarget(target);
        } else if (this.activeCamera instanceof FreeCamera) {
            this.activeCamera.setTarget(target);
        }

        // Interpolate FOV if specified
        if (startPoint.fov !== undefined && endPoint.fov !== undefined) {
            this.activeCamera.fov = startPoint.fov + (endPoint.fov - startPoint.fov) * segmentProgress;
        }
    }

    /**
     * Update cinematic events
     */
    private updateEvents(deltaTime: number): void {
        // Process current event
        if (this.currentEvent) {
            // Event processing logic would go here
        }

        // Check for new events
        if (this.eventQueue.length > 0 && !this.currentEvent) {
            this.currentEvent = this.eventQueue.shift() || null;
            if (this.currentEvent) {
                this.setCamera(this.currentEvent.cameraMode, this.currentEvent.duration);
            }
        }
    }

    /**
     * Update smoothing
     */
    private updateSmoothing(deltaTime: number): void {
        // Additional smoothing logic for camera movements
        // This helps reduce jitter and creates more cinematic motion
    }

    /**
     * Get current camera mode
     */
    public getCurrentMode(): CameraMode {
        return this.currentMode;
    }

    /**
     * Get previous camera mode
     */
    public getPreviousMode(): CameraMode {
        return this.previousMode;
    }

    /**
     * Is transitioning
     */
    public isInTransition(): boolean {
        return this.isTransitioning;
    }

    /**
     * Get camera for game situation
     */
    public getCameraForSituation(situation: string, ballPosition?: Vector3, playerPosition?: Vector3): CameraMode {
        switch (situation) {
            case 'batting':
                return CameraMode.BATTING;
            case 'pitching':
                return CameraMode.PITCHING;
            case 'hit':
                if (ballPosition && ballPosition.y > 10) {
                    return CameraMode.FLY_BALL;
                }
                return CameraMode.FIELDING;
            case 'homerun':
                return CameraMode.FLY_BALL;
            case 'running':
                return CameraMode.BASE_RUNNING;
            case 'replay':
                return CameraMode.REPLAY;
            default:
                return CameraMode.BROADCAST;
        }
    }

    /**
     * Dispose camera system
     */
    public dispose(): void {
        this.cameras.forEach(camera => camera.dispose());
        this.cameras.clear();
        this.configurations.clear();
        this.customConfigurations.clear();
        this.followTargets = [];
        this.eventQueue = [];
        this.postProcesses.forEach(pp => pp.dispose());
        this.postProcesses.clear();
    }
}
