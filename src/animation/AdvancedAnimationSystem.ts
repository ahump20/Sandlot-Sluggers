import { Scene, AbstractMesh, AnimationGroup, Skeleton, Bone, Vector3, Quaternion, Animation, Observable, IAnimationKey, AnimationPropertiesOverride, EasingFunction, CubicEase, QuadraticEase, BounceEase, ElasticEase } from '@babylonjs/core';

/**
 * Comprehensive Animation States for Baseball Game
 */
export enum AnimationState {
    // Locomotion
    IDLE = 'idle',
    WALK = 'walk',
    JOG = 'jog',
    RUN = 'run',
    SPRINT = 'sprint',
    BACKPEDAL = 'backpedal',
    SHUFFLE_LEFT = 'shuffle_left',
    SHUFFLE_RIGHT = 'shuffle_right',
    TURN_LEFT = 'turn_left',
    TURN_RIGHT = 'turn_right',
    STOP_SUDDEN = 'stop_sudden',
    START_RUNNING = 'start_running',

    // Batting
    BATTING_STANCE = 'batting_stance',
    BATTING_READY = 'batting_ready',
    BATTING_PRACTICE_SWING = 'batting_practice_swing',
    SWING_NORMAL = 'swing_normal',
    SWING_POWER = 'swing_power',
    SWING_CONTACT = 'swing_contact',
    SWING_BUNT = 'swing_bunt',
    SWING_DRAG_BUNT = 'swing_drag_bunt',
    SWING_SACRIFICE = 'swing_sacrifice',
    SWING_MISS = 'swing_miss',
    SWING_CHECK = 'swing_check',
    SWING_LATE = 'swing_late',
    SWING_EARLY = 'swing_early',
    SWING_FOLLOW_THROUGH = 'swing_follow_through',
    BATTING_HIT_REACTION = 'batting_hit_reaction',
    BATTING_FOUL = 'batting_foul',
    BATTING_HOMERUN_TROT = 'batting_homerun_trot',
    BATTING_TAKE_PITCH = 'batting_take_pitch',
    BATTING_DODGE_INSIDE = 'batting_dodge_inside',
    BATTING_HIT_BY_PITCH = 'batting_hit_by_pitch',

    // Pitching
    PITCHING_STANCE = 'pitching_stance',
    PITCHING_WINDUP = 'pitching_windup',
    PITCHING_STRETCH = 'pitching_stretch',
    PITCHING_SET_POSITION = 'pitching_set_position',
    PITCHING_LEG_KICK = 'pitching_leg_kick',
    PITCHING_THROW_FASTBALL = 'pitching_throw_fastball',
    PITCHING_THROW_CURVEBALL = 'pitching_throw_curveball',
    PITCHING_THROW_SLIDER = 'pitching_throw_slider',
    PITCHING_THROW_CHANGEUP = 'pitching_throw_changeup',
    PITCHING_THROW_KNUCKLEBALL = 'pitching_throw_knuckleball',
    PITCHING_FOLLOW_THROUGH = 'pitching_follow_through',
    PITCHING_PICK_OFF_FIRST = 'pitching_pick_off_first',
    PITCHING_PICK_OFF_SECOND = 'pitching_pick_off_second',
    PITCHING_PICK_OFF_THIRD = 'pitching_pick_off_third',
    PITCHING_STEP_OFF = 'pitching_step_off',
    PITCHING_DELIVERY_PAUSE = 'pitching_delivery_pause',
    PITCHING_FIELDING_POSITION = 'pitching_fielding_position',

    // Catching
    CATCHING_STANCE = 'catching_stance',
    CATCHING_READY = 'catching_ready',
    CATCHING_CROUCH = 'catching_crouch',
    CATCHING_FRAMING = 'catching_framing',
    CATCH_HIGH = 'catch_high',
    CATCH_LOW = 'catch_low',
    CATCH_LEFT = 'catch_left',
    CATCH_RIGHT = 'catch_right',
    CATCH_DIVE_FORWARD = 'catch_dive_forward',
    CATCH_DIVE_LEFT = 'catch_dive_left',
    CATCH_DIVE_RIGHT = 'catch_dive_right',
    CATCH_DIVE_BACK = 'catch_dive_back',
    CATCH_JUMP = 'catch_jump',
    CATCH_SLIDE = 'catch_slide',
    CATCH_WALL_CLIMB = 'catch_wall_climb',
    CATCH_OVER_SHOULDER = 'catch_over_shoulder',
    CATCH_BASKET = 'catch_basket',
    CATCH_ONE_HAND = 'catch_one_hand',
    CATCH_SNOW_CONE = 'catch_snow_cone',
    CATCH_ROBBING_HOMERUN = 'catch_robbing_homerun',

    // Fielding
    FIELDING_READY = 'fielding_ready',
    FIELDING_CREEP_FORWARD = 'fielding_creep_forward',
    FIELD_GROUND_BALL = 'field_ground_ball',
    FIELD_GROUND_BALL_BACKHAND = 'field_ground_ball_backhand',
    FIELD_POP_FLY = 'field_pop_fly',
    FIELD_LINE_DRIVE = 'field_line_drive',
    FIELD_SLOW_ROLLER = 'field_slow_roller',
    FIELD_CHARGE_BALL = 'field_charge_ball',
    FIELD_BAREHANDED_PICKUP = 'field_barehanded_pickup',
    THROW_OVERHAND = 'throw_overhand',
    THROW_SIDEARM = 'throw_sidearm',
    THROW_UNDERHAND = 'throw_underhand',
    THROW_JUMP_THROW = 'throw_jump_throw',
    THROW_CROW_HOP = 'throw_crow_hop',
    THROW_OFF_BALANCE = 'throw_off_balance',
    RELAY_CATCH = 'relay_catch',
    RELAY_THROW = 'relay_throw',

    // Base Running
    RUNNING_TO_FIRST = 'running_to_first',
    RUNNING_TO_SECOND = 'running_to_second',
    RUNNING_TO_THIRD = 'running_to_third',
    RUNNING_TO_HOME = 'running_to_home',
    RUNNING_FULL_SPRINT = 'running_full_sprint',
    SLIDE_FEET_FIRST = 'slide_feet_first',
    SLIDE_HEAD_FIRST = 'slide_head_first',
    SLIDE_HOOK_LEFT = 'slide_hook_left',
    SLIDE_HOOK_RIGHT = 'slide_hook_right',
    SLIDE_POP_UP = 'slide_pop_up',
    STEAL_START = 'steal_start',
    STEAL_JUMP = 'steal_jump',
    LEAD_OFF = 'lead_off',
    LEAD_OFF_SECONDARY = 'lead_off_secondary',
    RETURN_TO_BASE = 'return_to_base',
    RETURN_TO_BASE_DIVE = 'return_to_base_dive',
    TAG_UP = 'tag_up',
    TAG_UP_ADVANCE = 'tag_up_advance',
    ROUND_BASE = 'round_base',
    OVERRUN_FIRST = 'overrun_first',
    AVOID_TAG = 'avoid_tag',

    // Tagging
    TAG_RUNNER_STANDING = 'tag_runner_standing',
    TAG_RUNNER_SLIDING = 'tag_runner_sliding',
    TAG_BASE = 'tag_base',
    RECEIVE_THROW_AT_BASE = 'receive_throw_at_base',
    STRETCH_FOR_THROW = 'stretch_for_throw',
    DOUBLE_PLAY_PIVOT = 'double_play_pivot',
    DOUBLE_PLAY_THROW = 'double_play_throw',

    // Celebrations
    CELEBRATE_HOMERUN = 'celebrate_homerun',
    CELEBRATE_HOMERUN_BAT_FLIP = 'celebrate_homerun_bat_flip',
    CELEBRATE_WIN = 'celebrate_win',
    CELEBRATE_STRIKEOUT = 'celebrate_strikeout',
    CELEBRATE_STRIKEOUT_PUNCH_OUT = 'celebrate_strikeout_punch_out',
    CELEBRATE_CATCH = 'celebrate_catch',
    CELEBRATE_TEAM = 'celebrate_team',
    CELEBRATE_FIST_PUMP = 'celebrate_fist_pump',
    CELEBRATE_POINT_SKY = 'celebrate_point_sky',
    CELEBRATE_DUGOUT_HIGH_FIVE = 'celebrate_dugout_high_five',
    CELEBRATE_CHEST_BUMP = 'celebrate_chest_bump',
    CELEBRATE_HELMET_TAP = 'celebrate_helmet_tap',

    // Reactions & Emotions
    FRUSTRATION = 'frustration',
    FRUSTRATION_HELMET_THROW = 'frustration_helmet_throw',
    FRUSTRATION_BAT_SLAM = 'frustration_bat_slam',
    DISAPPOINTMENT = 'disappointment',
    DISAPPOINTMENT_HANDS_ON_HIPS = 'disappointment_hands_on_hips',
    DISAPPOINTMENT_HEAD_DOWN = 'disappointment_head_down',
    INJURY = 'injury',
    INJURY_LIMP = 'injury_limp',
    INJURY_HOLDING_HAMSTRING = 'injury_holding_hamstring',
    COLLISION = 'collision',
    COLLISION_RECOVERY = 'collision_recovery',
    ARGUING_WITH_UMPIRE = 'arguing_with_umpire',
    EJECTION_REACTION = 'ejection_reaction',

    // Umpire Signals
    UMPIRE_STRIKE = 'umpire_strike',
    UMPIRE_STRIKE_PUNCH_OUT = 'umpire_strike_punch_out',
    UMPIRE_BALL = 'umpire_ball',
    UMPIRE_OUT = 'umpire_out',
    UMPIRE_OUT_EMPHATIC = 'umpire_out_emphatic',
    UMPIRE_SAFE = 'umpire_safe',
    UMPIRE_SAFE_EMPHATIC = 'umpire_safe_emphatic',
    UMPIRE_FOUL = 'umpire_foul',
    UMPIRE_FAIR = 'umpire_fair',
    UMPIRE_TIME_OUT = 'umpire_time_out',
    UMPIRE_PLAY = 'umpire_play',
    UMPIRE_HOMERUN = 'umpire_homerun',

    // Miscellaneous
    WARMUP_STRETCH = 'warmup_stretch',
    WARMUP_THROWING = 'warmup_throwing',
    ON_DECK = 'on_deck',
    DUGOUT_SIT = 'dugout_sit',
    DUGOUT_STAND = 'dugout_stand',
    COACHING_SIGNAL = 'coaching_signal',
    DRINKING_WATER = 'drinking_water',
    ADJUSTING_GLOVE = 'adjusting_glove',
    ADJUSTING_HELMET = 'adjusting_helmet',
    ADJUSTING_BATTING_GLOVES = 'adjusting_batting_gloves',
    SPITTING = 'spitting',

    // Custom
    CUSTOM = 'custom'
}

/**
 * Animation priority levels
 */
export enum AnimationPriority {
    IDLE = 0,
    LOW = 1,
    NORMAL = 2,
    HIGH = 3,
    CRITICAL = 4,
    OVERRIDE = 5
}

/**
 * Animation blend modes
 */
export enum AnimationBlendMode {
    OVERRIDE = 'override',
    ADDITIVE = 'additive',
    BLEND = 'blend',
    LAYERED = 'layered',
    MASKED = 'masked'
}

/**
 * Animation transition
 */
export interface AnimationTransition {
    from: AnimationState;
    to: AnimationState;
    duration: number;
    blendMode: AnimationBlendMode;
    conditions?: AnimationCondition[];
    priority?: AnimationPriority;
    exitTime?: number;
    hasFixedDuration?: boolean;
    offset?: number;
    curve?: EasingFunction;
}

/**
 * Animation condition
 */
export interface AnimationCondition {
    parameter: string;
    operator: 'equals' | 'notEquals' | 'greater' | 'less' | 'greaterOrEqual' | 'lessOrEqual';
    value: any;
}

/**
 * Animation layer
 */
export interface AnimationLayer {
    name: string;
    index: number;
    weight: number;
    blendMode: AnimationBlendMode;
    mask?: BoneMask;
    currentState?: AnimationState;
    targetState?: AnimationState;
    enabled: boolean;
    avatarMask?: string[];
}

/**
 * Bone mask for layered animations
 */
export interface BoneMask {
    includedBones: string[];
    excludedBones: string[];
    includeChildren: boolean;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
    state: AnimationState;
    animationName: string;
    clip?: AnimationGroup;
    loop: boolean;
    speed: number;
    weight?: number;
    startFrame?: number;
    endFrame?: number;
    blendInTime?: number;
    blendOutTime?: number;
    priority?: AnimationPriority;
    interruptible?: boolean;
    rootMotion?: boolean;
    mirrorX?: boolean;
    mirrorZ?: boolean;
    events?: AnimationEventConfig[];
    layer?: string;
    wrapMode?: 'loop' | 'once' | 'pingpong' | 'clamp';
}

/**
 * Animation event configuration
 */
export interface AnimationEventConfig {
    frame: number;
    normalizedTime?: number;
    name: string;
    stringParameter?: string;
    intParameter?: number;
    floatParameter?: number;
    objectParameter?: any;
}

/**
 * State machine state
 */
export interface StateMachineState {
    name: AnimationState;
    animation: AnimationConfig;
    transitions: AnimationTransition[];
    speed: number;
    speedParameter?: string;
    timeParameter?: string;
    onEnter?: () => void;
    onExit?: () => void;
    onUpdate?: (normalizedTime: number) => void;
}

/**
 * Blend tree (1D or 2D)
 */
export interface BlendTree {
    type: '1D' | '2D';
    parameter: string;
    parameter2?: string;
    children: BlendTreeChild[];
}

/**
 * Blend tree child
 */
export interface BlendTreeChild {
    threshold: number;
    threshold2?: number;
    animation: AnimationConfig;
    position?: Vector2D;
}

/**
 * 2D position for blend trees
 */
export interface Vector2D {
    x: number;
    y: number;
}

/**
 * IK (Inverse Kinematics) constraint
 */
export interface IKConstraint {
    boneName: string;
    target: Vector3;
    weight: number;
    positionWeight?: number;
    rotationWeight?: number;
    chainLength?: number;
    iterations?: number;
    tolerance?: number;
    poleTarget?: Vector3;
}

/**
 * Look-at constraint
 */
export interface LookAtConstraint {
    boneName: string;
    target: Vector3;
    weight: number;
    upVector?: Vector3;
    forwardVector?: Vector3;
    clampWeight?: number;
    bodyWeight?: number;
    headWeight?: number;
    eyesWeight?: number;
}

/**
 * Procedural animation settings
 */
export interface ProceduralSettings {
    headLookAt?: {
        enabled: boolean;
        target: Vector3;
        weight: number;
        speed: number;
        maxAngle: number;
        bodyWeight: number;
        headWeight: number;
        eyeWeight: number;
    };
    breathing?: {
        enabled: boolean;
        amplitude: number;
        frequency: number;
        chestWeight: number;
        shoulderWeight: number;
    };
    eyeBlink?: {
        enabled: boolean;
        minInterval: number;
        maxInterval: number;
        duration: number;
    };
    secondaryMotion?: {
        enabled: boolean;
        bones: string[];
        damping: number;
        stiffness: number;
        gravity: Vector3;
        inertia: number;
    };
    footIK?: {
        enabled: boolean;
        leftFootBone: string;
        rightFootBone: string;
        footOffset: number;
        adaptationSpeed: number;
    };
}

/**
 * Root motion data
 */
export interface RootMotionData {
    position: Vector3;
    rotation: Quaternion;
    velocity: Vector3;
    angularVelocity: Vector3;
}

/**
 * Animation event
 */
export class AnimationEvent {
    public name: string;
    public time: number;
    public data: any;

    constructor(name: string, time: number, data?: any) {
        this.name = name;
        this.time = time;
        this.data = data;
    }
}

/**
 * Advanced Animation System
 * Comprehensive animation management with state machines, blending, IK, and procedural animation
 */
export class AdvancedAnimationSystem {
    private scene: Scene;
    private meshes: Map<string, AbstractMesh> = new Map();
    private skeletons: Map<string, Skeleton> = new Map();

    // State machines
    private stateMachines: Map<string, Map<string, StateMachineState>> = new Map();
    private currentStates: Map<string, Map<string, AnimationState>> = new Map();
    private previousStates: Map<string, Map<string, AnimationState>> = new Map();

    // Animation configurations
    private animations: Map<string, Map<AnimationState, AnimationConfig>> = new Map();
    private activeAnimations: Map<string, Map<string, AnimationGroup>> = new Map();

    // Transitions
    private transitions: Map<string, AnimationTransition[]> = new Map();
    private activeTransitions: Map<string, AnimationTransition> = new Map();
    private transitionProgress: Map<string, number> = new Map();

    // Layers
    private layers: Map<string, AnimationLayer[]> = new Map();
    private layerWeights: Map<string, Map<string, number>> = new Map();

    // Blend trees
    private blendTrees: Map<string, BlendTree> = new Map();

    // Parameters
    private parameters: Map<string, Map<string, any>> = new Map();

    // IK
    private ikConstraints: Map<string, IKConstraint[]> = new Map();
    private lookAtConstraints: Map<string, LookAtConstraint[]> = new Map();

    // Procedural
    private proceduralSettings: Map<string, ProceduralSettings> = new Map();

    // Root motion
    private rootMotionEnabled: Map<string, boolean> = new Map();
    private rootMotionData: Map<string, RootMotionData> = new Map();

    // Events
    private eventObservables: Map<string, Observable<AnimationEvent>> = new Map();

    // Time
    private time: number = 0;
    private deltaTime: number = 0;

    // Global settings
    private globalSpeed: number = 1.0;
    private cullingEnabled: boolean = true;
    private cullingDistance: number = 100;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * Register character for animation
     */
    public registerCharacter(characterId: string, mesh: AbstractMesh): void {
        this.meshes.set(characterId, mesh);

        if (mesh.skeleton) {
            this.skeletons.set(characterId, mesh.skeleton);
        }

        // Initialize maps
        this.animations.set(characterId, new Map());
        this.activeAnimations.set(characterId, new Map());
        this.stateMachines.set(characterId, new Map());
        this.currentStates.set(characterId, new Map());
        this.previousStates.set(characterId, new Map());
        this.parameters.set(characterId, new Map());
        this.ikConstraints.set(characterId, []);
        this.lookAtConstraints.set(characterId, []);
        this.eventObservables.set(characterId, new Observable());
        this.rootMotionEnabled.set(characterId, false);
        this.rootMotionData.set(characterId, {
            position: Vector3.Zero(),
            rotation: Quaternion.Identity(),
            velocity: Vector3.Zero(),
            angularVelocity: Vector3.Zero()
        });

        // Initialize layers
        this.initializeLayers(characterId);

        // Set initial state
        this.setCurrentState(characterId, 'base', AnimationState.IDLE);
    }

    /**
     * Initialize animation layers
     */
    private initializeLayers(characterId: string): void {
        const layers: AnimationLayer[] = [
            {
                name: 'base',
                index: 0,
                weight: 1.0,
                blendMode: AnimationBlendMode.OVERRIDE,
                enabled: true,
                currentState: AnimationState.IDLE
            },
            {
                name: 'upper_body',
                index: 1,
                weight: 0.0,
                blendMode: AnimationBlendMode.LAYERED,
                enabled: true,
                avatarMask: [
                    'spine', 'spine1', 'spine2', 'spine3',
                    'neck', 'head',
                    'left_shoulder', 'left_arm', 'left_forearm', 'left_hand',
                    'right_shoulder', 'right_arm', 'right_forearm', 'right_hand'
                ]
            },
            {
                name: 'lower_body',
                index: 2,
                weight: 0.0,
                blendMode: AnimationBlendMode.LAYERED,
                enabled: true,
                avatarMask: [
                    'hips', 'pelvis',
                    'left_upleg', 'left_leg', 'left_foot', 'left_toe',
                    'right_upleg', 'right_leg', 'right_foot', 'right_toe'
                ]
            },
            {
                name: 'additive',
                index: 3,
                weight: 1.0,
                blendMode: AnimationBlendMode.ADDITIVE,
                enabled: true
            },
            {
                name: 'override',
                index: 4,
                weight: 0.0,
                blendMode: AnimationBlendMode.OVERRIDE,
                enabled: true
            }
        ];

        this.layers.set(characterId, layers);

        const weights = new Map<string, number>();
        layers.forEach(layer => weights.set(layer.name, layer.weight));
        this.layerWeights.set(characterId, weights);
    }

    /**
     * Register animation configuration
     */
    public registerAnimation(characterId: string, config: AnimationConfig): void {
        const animations = this.animations.get(characterId);
        if (!animations) return;

        animations.set(config.state, config);
    }

    /**
     * Register multiple animations
     */
    public registerAnimations(characterId: string, configs: AnimationConfig[]): void {
        configs.forEach(config => this.registerAnimation(characterId, config));
    }

    /**
     * Create state machine state
     */
    public createState(
        characterId: string,
        state: AnimationState,
        animation: AnimationConfig,
        onEnter?: () => void,
        onExit?: () => void,
        onUpdate?: (normalizedTime: number) => void
    ): void {
        const stateMachine = this.stateMachines.get(characterId);
        if (!stateMachine) return;

        stateMachine.set(state, {
            name: state,
            animation,
            transitions: [],
            speed: animation.speed || 1.0,
            onEnter,
            onExit,
            onUpdate
        });
    }

    /**
     * Add transition between states
     */
    public addTransition(
        characterId: string,
        from: AnimationState,
        to: AnimationState,
        duration: number = 0.3,
        conditions?: AnimationCondition[],
        exitTime?: number
    ): void {
        const stateMachine = this.stateMachines.get(characterId);
        if (!stateMachine) return;

        const state = stateMachine.get(from);
        if (!state) return;

        const transition: AnimationTransition = {
            from,
            to,
            duration,
            blendMode: AnimationBlendMode.BLEND,
            conditions,
            exitTime,
            hasFixedDuration: true
        };

        state.transitions.push(transition);

        // Also add to global transitions map
        const key = `${characterId}_${from}`;
        if (!this.transitions.has(key)) {
            this.transitions.set(key, []);
        }
        this.transitions.get(key)!.push(transition);
    }

    /**
     * Set current animation state
     */
    public setCurrentState(characterId: string, layerName: string, state: AnimationState, forceTransition: boolean = false): void {
        const currentStatesMap = this.currentStates.get(characterId);
        if (!currentStatesMap) return;

        const previousState = currentStatesMap.get(layerName);

        // Don't transition if already in this state
        if (previousState === state && !forceTransition) return;

        // Check if transition is valid
        if (previousState && !forceTransition) {
            const validTransition = this.checkTransitions(characterId, previousState, state);
            if (!validTransition) return;
        }

        // Update states
        const previousStatesMap = this.previousStates.get(characterId);
        if (previousState && previousStatesMap) {
            previousStatesMap.set(layerName, previousState);
        }
        currentStatesMap.set(layerName, state);

        // Trigger state callbacks
        const stateMachine = this.stateMachines.get(characterId);
        if (stateMachine) {
            const prevStateData = previousState ? stateMachine.get(previousState) : null;
            const newStateData = stateMachine.get(state);

            if (prevStateData?.onExit) {
                prevStateData.onExit();
            }

            if (newStateData?.onEnter) {
                newStateData.onEnter();
            }
        }

        // Start playing animation
        this.playAnimation(characterId, state, layerName);
    }

    /**
     * Check if transition is valid
     */
    private checkTransitions(characterId: string, from: AnimationState, to: AnimationState): boolean {
        const key = `${characterId}_${from}`;
        const transitions = this.transitions.get(key);

        if (!transitions) return true; // Allow transition if no transitions defined

        for (const transition of transitions) {
            if (transition.to === to) {
                // Check conditions
                if (this.evaluateConditions(characterId, transition.conditions || [])) {
                    // Start transition
                    this.activeTransitions.set(characterId, transition);
                    this.transitionProgress.set(characterId, 0);
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Evaluate transition conditions
     */
    private evaluateConditions(characterId: string, conditions: AnimationCondition[]): boolean {
        if (conditions.length === 0) return true;

        const params = this.parameters.get(characterId);
        if (!params) return false;

        for (const condition of conditions) {
            const value = params.get(condition.parameter);

            switch (condition.operator) {
                case 'equals':
                    if (value !== condition.value) return false;
                    break;
                case 'notEquals':
                    if (value === condition.value) return false;
                    break;
                case 'greater':
                    if (value <= condition.value) return false;
                    break;
                case 'less':
                    if (value >= condition.value) return false;
                    break;
                case 'greaterOrEqual':
                    if (value < condition.value) return false;
                    break;
                case 'lessOrEqual':
                    if (value > condition.value) return false;
                    break;
            }
        }

        return true;
    }

    /**
     * Play animation
     */
    private playAnimation(characterId: string, state: AnimationState, layerName: string = 'base'): void {
        const animations = this.animations.get(characterId);
        if (!animations) return;

        const config = animations.get(state);
        if (!config) {
            console.warn(`Animation config not found for state: ${state}`);
            return;
        }

        // Get animation group
        const animGroup = this.scene.getAnimationGroupByName(config.animationName);
        if (!animGroup) {
            console.warn(`Animation group not found: ${config.animationName}`);
            return;
        }

        // Configure animation
        animGroup.speedRatio = config.speed * this.globalSpeed;
        animGroup.loopAnimation = config.loop;

        if (config.startFrame !== undefined && config.endFrame !== undefined) {
            animGroup.play(config.loop);
        } else {
            animGroup.play(config.loop);
        }

        // Store active animation
        const activeAnims = this.activeAnimations.get(characterId);
        if (activeAnims) {
            activeAnims.set(layerName, animGroup);
        }

        // Setup events
        if (config.events) {
            this.setupAnimationEvents(characterId, animGroup, config.events);
        }

        // Handle animation end
        if (!config.loop) {
            animGroup.onAnimationGroupEndObservable.addOnce(() => {
                this.onAnimationComplete(characterId, state);
            });
        }
    }

    /**
     * Setup animation events
     */
    private setupAnimationEvents(characterId: string, animGroup: AnimationGroup, events: AnimationEventConfig[]): void {
        const duration = (animGroup.to - animGroup.from) / 60; // Assuming 60fps

        for (const event of events) {
            const time = event.normalizedTime !== undefined
                ? event.normalizedTime * duration
                : (event.frame / 60);

            setTimeout(() => {
                this.triggerEvent(characterId, event.name, event.objectParameter);
            }, time * 1000);
        }
    }

    /**
     * Trigger animation event
     */
    private triggerEvent(characterId: string, eventName: string, data?: any): void {
        const observable = this.eventObservables.get(characterId);
        if (observable) {
            observable.notifyObservers(new AnimationEvent(eventName, this.time, data));
        }
    }

    /**
     * Handle animation completion
     */
    private onAnimationComplete(characterId: string, state: AnimationState): void {
        // Transition to idle or next queued state
        this.setCurrentState(characterId, 'base', AnimationState.IDLE);
    }

    /**
     * Set parameter value
     */
    public setParameter(characterId: string, name: string, value: any): void {
        const params = this.parameters.get(characterId);
        if (params) {
            params.set(name, value);
        }
    }

    /**
     * Get parameter value
     */
    public getParameter(characterId: string, name: string): any {
        const params = this.parameters.get(characterId);
        return params?.get(name);
    }

    /**
     * Set layer weight
     */
    public setLayerWeight(characterId: string, layerName: string, weight: number, transitionTime: number = 0): void {
        const layers = this.layers.get(characterId);
        if (!layers) return;

        const layer = layers.find(l => l.name === layerName);
        if (!layer) return;

        if (transitionTime > 0) {
            // Animate weight change
            const startWeight = layer.weight;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / transitionTime, 1);

                layer.weight = startWeight + (weight - startWeight) * progress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            animate();
        } else {
            layer.weight = weight;
        }
    }

    /**
     * Add IK constraint
     */
    public addIKConstraint(characterId: string, constraint: IKConstraint): void {
        const constraints = this.ikConstraints.get(characterId);
        if (constraints) {
            constraints.push(constraint);
        }
    }

    /**
     * Remove IK constraint
     */
    public removeIKConstraint(characterId: string, boneName: string): void {
        const constraints = this.ikConstraints.get(characterId);
        if (constraints) {
            const index = constraints.findIndex(c => c.boneName === boneName);
            if (index >= 0) {
                constraints.splice(index, 1);
            }
        }
    }

    /**
     * Add look-at constraint
     */
    public addLookAtConstraint(characterId: string, constraint: LookAtConstraint): void {
        const constraints = this.lookAtConstraints.get(characterId);
        if (constraints) {
            constraints.push(constraint);
        }
    }

    /**
     * Apply IK constraints
     */
    private applyIK(characterId: string): void {
        const skeleton = this.skeletons.get(characterId);
        if (!skeleton) return;

        const constraints = this.ikConstraints.get(characterId);
        if (!constraints || constraints.length === 0) return;

        for (const constraint of constraints) {
            const bone = skeleton.bones.find(b => b.name === constraint.boneName);
            if (!bone) continue;

            // Simplified FABRIK IK
            this.solveFABRIK(bone, constraint);
        }
    }

    /**
     * Solve FABRIK (Forward And Backward Reaching Inverse Kinematics)
     */
    private solveFABRIK(endEffector: Bone, constraint: IKConstraint): void {
        const chainLength = constraint.chainLength || 2;
        const iterations = constraint.iterations || 10;
        const tolerance = constraint.tolerance || 0.01;

        // Build bone chain
        const chain: Bone[] = [endEffector];
        let currentBone = endEffector.getParent() as Bone;

        for (let i = 0; i < chainLength - 1 && currentBone; i++) {
            chain.unshift(currentBone);
            currentBone = currentBone.getParent() as Bone;
        }

        if (chain.length < 2) return;

        // Get initial positions
        const positions = chain.map(bone => bone.getAbsolutePosition());
        const lengths = [];

        for (let i = 0; i < positions.length - 1; i++) {
            lengths.push(positions[i].subtract(positions[i + 1]).length());
        }

        // FABRIK algorithm
        for (let iter = 0; iter < iterations; iter++) {
            // Forward reach
            positions[positions.length - 1] = constraint.target.clone();

            for (let i = positions.length - 2; i >= 0; i--) {
                const direction = positions[i].subtract(positions[i + 1]).normalize();
                positions[i] = positions[i + 1].add(direction.scale(lengths[i]));
            }

            // Backward reach
            positions[0] = chain[0].getAbsolutePosition();

            for (let i = 1; i < positions.length; i++) {
                const direction = positions[i].subtract(positions[i - 1]).normalize();
                positions[i] = positions[i - 1].add(direction.scale(lengths[i - 1]));
            }

            // Check if close enough to target
            const distance = positions[positions.length - 1].subtract(constraint.target).length();
            if (distance < tolerance) break;
        }

        // Apply positions with weight
        for (let i = 0; i < chain.length; i++) {
            const currentPos = chain[i].getAbsolutePosition();
            const targetPos = positions[i];
            const newPos = Vector3.Lerp(currentPos, targetPos, constraint.weight);
            chain[i].setAbsolutePosition(newPos);
        }
    }

    /**
     * Apply look-at constraints
     */
    private applyLookAt(characterId: string): void {
        const skeleton = this.skeletons.get(characterId);
        if (!skeleton) return;

        const constraints = this.lookAtConstraints.get(characterId);
        if (!constraints || constraints.length === 0) return;

        for (const constraint of constraints) {
            const bone = skeleton.bones.find(b => b.name === constraint.boneName);
            if (!bone) continue;

            const bonePos = bone.getAbsolutePosition();
            const direction = constraint.target.subtract(bonePos).normalize();

            const upVector = constraint.upVector || Vector3.Up();
            const targetRotation = Quaternion.FromLookDirectionLH(direction, upVector);

            const currentRotation = bone.getRotationQuaternion() || Quaternion.Identity();
            const newRotation = Quaternion.Slerp(currentRotation, targetRotation, constraint.weight);

            bone.setRotationQuaternion(newRotation);
        }
    }

    /**
     * Set procedural settings
     */
    public setProceduralSettings(characterId: string, settings: ProceduralSettings): void {
        this.proceduralSettings.set(characterId, settings);
    }

    /**
     * Apply procedural animations
     */
    private applyProceduralAnimations(characterId: string): void {
        const settings = this.proceduralSettings.get(characterId);
        if (!settings) return;

        if (settings.headLookAt?.enabled) {
            this.applyHeadLookAt(characterId, settings.headLookAt);
        }

        if (settings.breathing?.enabled) {
            this.applyBreathing(characterId, settings.breathing);
        }

        if (settings.secondaryMotion?.enabled) {
            this.applySecondaryMotion(characterId, settings.secondaryMotion);
        }

        if (settings.footIK?.enabled) {
            this.applyFootIK(characterId, settings.footIK);
        }
    }

    /**
     * Apply head look-at
     */
    private applyHeadLookAt(characterId: string, settings: any): void {
        this.addLookAtConstraint(characterId, {
            boneName: 'head',
            target: settings.target,
            weight: settings.weight,
            bodyWeight: settings.bodyWeight,
            headWeight: settings.headWeight,
            eyesWeight: settings.eyeWeight
        });
    }

    /**
     * Apply breathing motion
     */
    private applyBreathing(characterId: string, settings: any): void {
        const skeleton = this.skeletons.get(characterId);
        if (!skeleton) return;

        const spineBone = skeleton.bones.find(b => b.name === 'spine' || b.name === 'spine1');
        if (!spineBone) return;

        const breathingOffset = Math.sin(this.time * settings.frequency * Math.PI * 2) * settings.amplitude;
        const currentScale = spineBone.scaling.clone();

        spineBone.scaling = new Vector3(
            currentScale.x,
            currentScale.y + breathingOffset * settings.chestWeight,
            currentScale.z
        );
    }

    /**
     * Apply secondary motion (spring physics)
     */
    private applySecondaryMotion(characterId: string, settings: any): void {
        // Simplified spring physics for secondary motion
        // This would apply subtle delayed motion to specified bones
    }

    /**
     * Apply foot IK for ground adaptation
     */
    private applyFootIK(characterId: string, settings: any): void {
        // Ground adaptation IK for feet
        // Would raycast down from feet and adjust positions
    }

    /**
     * Enable root motion
     */
    public enableRootMotion(characterId: string): void {
        this.rootMotionEnabled.set(characterId, true);
    }

    /**
     * Disable root motion
     */
    public disableRootMotion(characterId: string): void {
        this.rootMotionEnabled.set(characterId, false);
    }

    /**
     * Get root motion data
     */
    public getRootMotionData(characterId: string): RootMotionData | undefined {
        return this.rootMotionData.get(characterId);
    }

    /**
     * Calculate root motion
     */
    private calculateRootMotion(characterId: string): void {
        const skeleton = this.skeletons.get(characterId);
        if (!skeleton) return;

        const rootBone = skeleton.bones[0];
        if (!rootBone) return;

        const data = this.rootMotionData.get(characterId);
        if (!data) return;

        // Calculate position and rotation delta
        const currentPos = rootBone.getAbsolutePosition();
        const currentRot = rootBone.getRotationQuaternion() || Quaternion.Identity();

        data.velocity = currentPos.subtract(data.position).scale(1 / this.deltaTime);
        data.position = currentPos.clone();
        data.rotation = currentRot.clone();
    }

    /**
     * Set global animation speed
     */
    public setGlobalSpeed(speed: number): void {
        this.globalSpeed = speed;
    }

    /**
     * Get current state
     */
    public getCurrentState(characterId: string, layerName: string = 'base'): AnimationState | undefined {
        const states = this.currentStates.get(characterId);
        return states?.get(layerName);
    }

    /**
     * Subscribe to animation events
     */
    public onAnimationEvent(characterId: string, callback: (event: AnimationEvent) => void): void {
        const observable = this.eventObservables.get(characterId);
        if (observable) {
            observable.add(callback);
        }
    }

    /**
     * Update animation system
     */
    public update(deltaTime: number): void {
        this.deltaTime = deltaTime;
        this.time += deltaTime;

        // Update all characters
        for (const [characterId, mesh] of this.meshes) {
            // Culling check
            if (this.cullingEnabled && !this.isInView(mesh)) {
                continue;
            }

            // Update transitions
            this.updateTransitions(characterId);

            // Apply IK
            this.applyIK(characterId);

            // Apply look-at
            this.applyLookAt(characterId);

            // Apply procedural animations
            this.applyProceduralAnimations(characterId);

            // Calculate root motion
            if (this.rootMotionEnabled.get(characterId)) {
                this.calculateRootMotion(characterId);
            }

            // Update state machine
            this.updateStateMachine(characterId);
        }
    }

    /**
     * Check if mesh is in view
     */
    private isInView(mesh: AbstractMesh): boolean {
        const camera = this.scene.activeCamera;
        if (!camera) return true;

        const distance = Vector3.Distance(mesh.position, camera.position);
        return distance <= this.cullingDistance;
    }

    /**
     * Update transitions
     */
    private updateTransitions(characterId: string): void {
        const transition = this.activeTransitions.get(characterId);
        if (!transition) return;

        const progress = this.transitionProgress.get(characterId) || 0;
        const newProgress = progress + (this.deltaTime / transition.duration);

        if (newProgress >= 1.0) {
            // Transition complete
            this.activeTransitions.delete(characterId);
            this.transitionProgress.delete(characterId);
        } else {
            this.transitionProgress.set(characterId, newProgress);
        }
    }

    /**
     * Update state machine
     */
    private updateStateMachine(characterId: string): void {
        const stateMachine = this.stateMachines.get(characterId);
        if (!stateMachine) return;

        const currentStatesMap = this.currentStates.get(characterId);
        if (!currentStatesMap) return;

        for (const [layerName, state] of currentStatesMap) {
            const stateData = stateMachine.get(state);
            if (stateData?.onUpdate) {
                // Calculate normalized time
                const activeAnims = this.activeAnimations.get(characterId);
                const animGroup = activeAnims?.get(layerName);

                if (animGroup) {
                    const normalizedTime = animGroup.animatables[0]?.masterFrame || 0;
                    stateData.onUpdate(normalizedTime);
                }
            }
        }
    }

    /**
     * Cross-fade to state
     */
    public crossFade(characterId: string, state: AnimationState, duration: number = 0.3): void {
        this.setCurrentState(characterId, 'base', state, true);
    }

    /**
     * Stop all animations for character
     */
    public stopAll(characterId: string): void {
        const activeAnims = this.activeAnimations.get(characterId);
        if (activeAnims) {
            for (const animGroup of activeAnims.values()) {
                animGroup.stop();
            }
            activeAnims.clear();
        }
    }

    /**
     * Reset character to idle
     */
    public reset(characterId: string): void {
        this.stopAll(characterId);
        this.setCurrentState(characterId, 'base', AnimationState.IDLE);
    }

    /**
     * Dispose character
     */
    public disposeCharacter(characterId: string): void {
        this.stopAll(characterId);

        this.meshes.delete(characterId);
        this.skeletons.delete(characterId);
        this.animations.delete(characterId);
        this.activeAnimations.delete(characterId);
        this.stateMachines.delete(characterId);
        this.currentStates.delete(characterId);
        this.previousStates.delete(characterId);
        this.parameters.delete(characterId);
        this.ikConstraints.delete(characterId);
        this.lookAtConstraints.delete(characterId);
        this.proceduralSettings.delete(characterId);
        this.rootMotionEnabled.delete(characterId);
        this.rootMotionData.delete(characterId);
        this.eventObservables.delete(characterId);
    }

    /**
     * Dispose entire system
     */
    public dispose(): void {
        for (const characterId of this.meshes.keys()) {
            this.disposeCharacter(characterId);
        }
    }
}
