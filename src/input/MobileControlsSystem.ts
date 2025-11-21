import { Scene, Vector2, Vector3, Observable, PointerInfo, PointerEventTypes, ActionManager, ExecuteCodeAction } from '@babylonjs/core';

/**
 * Touch control schemes
 */
export enum TouchControlScheme {
    SIMPLE = 'simple',
    ADVANCED = 'advanced',
    CUSTOM = 'custom',
    ONE_HANDED = 'one_handed',
    TWO_HANDED = 'two_handed'
}

/**
 * Gesture types
 */
export enum GestureType {
    TAP = 'tap',
    DOUBLE_TAP = 'double_tap',
    LONG_PRESS = 'long_press',
    SWIPE_UP = 'swipe_up',
    SWIPE_DOWN = 'swipe_down',
    SWIPE_LEFT = 'swipe_left',
    SWIPE_RIGHT = 'swipe_right',
    PINCH = 'pinch',
    SPREAD = 'spread',
    ROTATE = 'rotate',
    TWO_FINGER_TAP = 'two_finger_tap',
    THREE_FINGER_SWIPE = 'three_finger_swipe'
}

/**
 * Touch button types
 */
export enum TouchButtonType {
    SWING = 'swing',
    BUNT = 'bunt',
    STEAL = 'steal',
    SLIDE = 'slide',
    DIVE = 'dive',
    THROW = 'throw',
    PITCH = 'pitch',
    PAUSE = 'pause',
    CAMERA = 'camera'
}

/**
 * Virtual joystick configuration
 */
export interface VirtualJoystickConfig {
    id: string;
    position: Vector2;
    size: number;
    deadzone: number;
    maxDistance: number;
    opacity: number;
    color: string;
    activeColor: string;
    returnToCenter: boolean;
    fixed: boolean;
}

/**
 * Touch button configuration
 */
export interface TouchButtonConfig {
    id: string;
    type: TouchButtonType;
    position: Vector2;
    size: number;
    shape: 'circle' | 'square' | 'rect';
    opacity: number;
    color: string;
    activeColor: string;
    icon?: string;
    label?: string;
    vibration?: number;
}

/**
 * Gesture configuration
 */
export interface GestureConfig {
    type: GestureType;
    enabled: boolean;
    minDistance?: number;
    maxDuration?: number;
    minDuration?: number;
    threshold?: number;
}

/**
 * Touch input state
 */
export interface TouchInputState {
    touches: Map<number, TouchPoint>;
    activeGestures: GestureType[];
    joystickState: Map<string, JoystickState>;
    buttonState: Map<string, ButtonState>;
}

/**
 * Touch point
 */
export interface TouchPoint {
    id: number;
    position: Vector2;
    startPosition: Vector2;
    startTime: number;
    lastPosition: Vector2;
    lastTime: number;
    velocity: Vector2;
    pressure: number;
}

/**
 * Joystick state
 */
export interface JoystickState {
    id: string;
    active: boolean;
    position: Vector2;
    delta: Vector2;
    angle: number;
    magnitude: number;
}

/**
 * Button state
 */
export interface ButtonState {
    id: string;
    pressed: boolean;
    pressTime: number;
    releaseTime: number;
    tapCount: number;
}

/**
 * Swipe data
 */
export interface SwipeData {
    startPosition: Vector2;
    endPosition: Vector2;
    direction: Vector2;
    distance: number;
    duration: number;
    velocity: number;
}

/**
 * Pinch data
 */
export interface PinchData {
    center: Vector2;
    startDistance: number;
    currentDistance: number;
    scale: number;
}

/**
 * Mobile optimization settings
 */
export interface MobileOptimizationSettings {
    reducedGraphics: boolean;
    targetFramerate: number;
    dynamicResolution: boolean;
    minResolutionScale: number;
    maxResolutionScale: number;
    simplifiedPhysics: boolean;
    reducedParticles: boolean;
    touchVibration: boolean;
    hapticFeedback: boolean;
    autoRotate: boolean;
    batteryOptimization: boolean;
}

/**
 * Mobile Controls System
 * Comprehensive touch controls, gestures, and mobile optimization
 */
export class MobileControlsSystem {
    private scene: Scene;
    private canvas: HTMLCanvasElement;

    // Control scheme
    private controlScheme: TouchControlScheme = TouchControlScheme.SIMPLE;

    // Input state
    private inputState: TouchInputState = {
        touches: new Map(),
        activeGestures: [],
        joystickState: new Map(),
        buttonState: new Map()
    };

    // Virtual joysticks
    private joysticks: Map<string, VirtualJoystickConfig> = new Map();
    private joystickElements: Map<string, HTMLElement> = new Map();

    // Touch buttons
    private buttons: Map<string, TouchButtonConfig> = new Map();
    private buttonElements: Map<string, HTMLElement> = new Map();

    // Gestures
    private gestures: Map<GestureType, GestureConfig> = new Map();

    // Touch tracking
    private activeTouches: Map<number, TouchPoint> = new Map();
    private gestureInProgress: GestureType | null = null;

    // Swipe detection
    private swipeMinDistance: number = 50;
    private swipeMaxDuration: number = 500;

    // Tap detection
    private tapMaxDistance: number = 10;
    private tapMaxDuration: number = 300;
    private doubleTapMaxDelay: number = 300;
    private lastTapTime: number = 0;
    private lastTapPosition: Vector2 = Vector2.Zero();

    // Long press
    private longPressTime: number = 500;
    private longPressTimer: any = null;

    // Mobile optimization
    private optimizationSettings: MobileOptimizationSettings = {
        reducedGraphics: false,
        targetFramerate: 60,
        dynamicResolution: true,
        minResolutionScale: 0.5,
        maxResolutionScale: 1.0,
        simplifiedPhysics: false,
        reducedParticles: false,
        touchVibration: true,
        hapticFeedback: true,
        autoRotate: true,
        batteryOptimization: false
    };

    // Performance tracking
    private frameCount: number = 0;
    private lastFrameTime: number = 0;
    private currentFPS: number = 60;
    private resolutionScale: number = 1.0;

    // Observables
    private onGestureObservable: Observable<{ type: GestureType; data?: any }> = new Observable();
    private onButtonPressObservable: Observable<{ button: TouchButtonType; state: boolean }> = new Observable();
    private onJoystickMoveObservable: Observable<{ joystick: string; state: JoystickState }> = new Observable();
    private onSwipeObservable: Observable<SwipeData> = new Observable();
    private onPinchObservable: Observable<PinchData> = new Observable();

    // UI container
    private uiContainer: HTMLElement | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.canvas = scene.getEngine().getRenderingCanvas()!;

        // Initialize
        this.initializeGestures();
        this.setupTouchListeners();
        this.createUIContainer();

        // Auto-detect mobile
        if (this.isMobileDevice()) {
            this.enableMobileOptimizations();
        }
    }

    /**
     * Initialize gesture configurations
     */
    private initializeGestures(): void {
        this.gestures.set(GestureType.TAP, {
            type: GestureType.TAP,
            enabled: true,
            maxDuration: this.tapMaxDuration
        });

        this.gestures.set(GestureType.DOUBLE_TAP, {
            type: GestureType.DOUBLE_TAP,
            enabled: true,
            maxDuration: this.doubleTapMaxDelay
        });

        this.gestures.set(GestureType.LONG_PRESS, {
            type: GestureType.LONG_PRESS,
            enabled: true,
            minDuration: this.longPressTime
        });

        this.gestures.set(GestureType.SWIPE_UP, {
            type: GestureType.SWIPE_UP,
            enabled: true,
            minDistance: this.swipeMinDistance,
            maxDuration: this.swipeMaxDuration
        });

        this.gestures.set(GestureType.SWIPE_DOWN, {
            type: GestureType.SWIPE_DOWN,
            enabled: true,
            minDistance: this.swipeMinDistance,
            maxDuration: this.swipeMaxDuration
        });

        this.gestures.set(GestureType.SWIPE_LEFT, {
            type: GestureType.SWIPE_LEFT,
            enabled: true,
            minDistance: this.swipeMinDistance,
            maxDuration: this.swipeMaxDuration
        });

        this.gestures.set(GestureType.SWIPE_RIGHT, {
            type: GestureType.SWIPE_RIGHT,
            enabled: true,
            minDistance: this.swipeMinDistance,
            maxDuration: this.swipeMaxDuration
        });

        this.gestures.set(GestureType.PINCH, {
            type: GestureType.PINCH,
            enabled: true,
            threshold: 10
        });

        this.gestures.set(GestureType.SPREAD, {
            type: GestureType.SPREAD,
            enabled: true,
            threshold: 10
        });
    }

    /**
     * Setup touch event listeners
     */
    private setupTouchListeners(): void {
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
        this.canvas.addEventListener('touchcancel', this.onTouchCancel.bind(this), { passive: false });

        // Prevent default touch behaviors
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Handle touch start
     */
    private onTouchStart(event: TouchEvent): void {
        event.preventDefault();

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const position = new Vector2(touch.clientX, touch.clientY);

            const touchPoint: TouchPoint = {
                id: touch.identifier,
                position: position.clone(),
                startPosition: position.clone(),
                startTime: Date.now(),
                lastPosition: position.clone(),
                lastTime: Date.now(),
                velocity: Vector2.Zero(),
                pressure: (touch as any).force || 1.0
            };

            this.activeTouches.set(touch.identifier, touchPoint);

            // Check if touch is on a button
            this.checkButtonTouch(position, true);

            // Check if touch is on a joystick
            this.checkJoystickTouch(touch.identifier, position, true);

            // Start long press timer
            if (this.activeTouches.size === 1) {
                this.startLongPressTimer(touchPoint);
            }
        }

        // Detect multi-touch gestures
        if (this.activeTouches.size === 2) {
            this.detectPinchStart();
        }
    }

    /**
     * Handle touch move
     */
    private onTouchMove(event: TouchEvent): void {
        event.preventDefault();

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const touchPoint = this.activeTouches.get(touch.identifier);

            if (!touchPoint) continue;

            const now = Date.now();
            const newPosition = new Vector2(touch.clientX, touch.clientY);
            const deltaTime = (now - touchPoint.lastTime) / 1000;

            if (deltaTime > 0) {
                touchPoint.velocity = newPosition.subtract(touchPoint.lastPosition).scale(1 / deltaTime);
            }

            touchPoint.lastPosition = touchPoint.position.clone();
            touchPoint.position = newPosition;
            touchPoint.lastTime = now;

            // Update joystick
            this.checkJoystickTouch(touch.identifier, newPosition, false);

            // Cancel long press if moved too much
            const moveDistance = Vector2.Distance(newPosition, touchPoint.startPosition);
            if (moveDistance > this.tapMaxDistance && this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        }

        // Update pinch gesture
        if (this.activeTouches.size === 2) {
            this.detectPinch();
        }
    }

    /**
     * Handle touch end
     */
    private onTouchEnd(event: TouchEvent): void {
        event.preventDefault();

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const touchPoint = this.activeTouches.get(touch.identifier);

            if (!touchPoint) continue;

            const duration = Date.now() - touchPoint.startTime;
            const distance = Vector2.Distance(touchPoint.position, touchPoint.startPosition);

            // Clear long press timer
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }

            // Detect tap
            if (duration < this.tapMaxDuration && distance < this.tapMaxDistance) {
                this.handleTap(touchPoint.position);
            }

            // Detect swipe
            if (distance >= this.swipeMinDistance && duration <= this.swipeMaxDuration) {
                this.handleSwipe(touchPoint);
            }

            // Release button
            this.checkButtonTouch(touchPoint.position, false);

            // Release joystick
            this.checkJoystickTouch(touch.identifier, touchPoint.position, false, true);

            this.activeTouches.delete(touch.identifier);
        }
    }

    /**
     * Handle touch cancel
     */
    private onTouchCancel(event: TouchEvent): void {
        this.onTouchEnd(event);
    }

    /**
     * Start long press timer
     */
    private startLongPressTimer(touchPoint: TouchPoint): void {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
        }

        this.longPressTimer = setTimeout(() => {
            const distance = Vector2.Distance(touchPoint.position, touchPoint.startPosition);
            if (distance < this.tapMaxDistance) {
                this.handleLongPress(touchPoint.position);
            }
            this.longPressTimer = null;
        }, this.longPressTime);
    }

    /**
     * Handle tap gesture
     */
    private handleTap(position: Vector2): void {
        const now = Date.now();
        const timeSinceLastTap = now - this.lastTapTime;
        const distanceFromLastTap = Vector2.Distance(position, this.lastTapPosition);

        // Check for double tap
        if (timeSinceLastTap < this.doubleTapMaxDelay && distanceFromLastTap < this.tapMaxDistance) {
            this.onGestureObservable.notifyObservers({
                type: GestureType.DOUBLE_TAP,
                data: { position }
            });
        } else {
            this.onGestureObservable.notifyObservers({
                type: GestureType.TAP,
                data: { position }
            });
        }

        this.lastTapTime = now;
        this.lastTapPosition = position.clone();
    }

    /**
     * Handle long press gesture
     */
    private handleLongPress(position: Vector2): void {
        this.onGestureObservable.notifyObservers({
            type: GestureType.LONG_PRESS,
            data: { position }
        });

        this.triggerHapticFeedback('medium');
    }

    /**
     * Handle swipe gesture
     */
    private handleSwipe(touchPoint: TouchPoint): void {
        const delta = touchPoint.position.subtract(touchPoint.startPosition);
        const distance = delta.length();
        const duration = Date.now() - touchPoint.startTime;

        const swipeData: SwipeData = {
            startPosition: touchPoint.startPosition.clone(),
            endPosition: touchPoint.position.clone(),
            direction: delta.normalize(),
            distance: distance,
            duration: duration,
            velocity: distance / (duration / 1000)
        };

        // Determine swipe direction
        const angle = Math.atan2(delta.y, delta.x);
        let gestureType: GestureType;

        if (Math.abs(angle) < Math.PI / 4) {
            gestureType = GestureType.SWIPE_RIGHT;
        } else if (Math.abs(angle) > (3 * Math.PI) / 4) {
            gestureType = GestureType.SWIPE_LEFT;
        } else if (angle > 0) {
            gestureType = GestureType.SWIPE_DOWN;
        } else {
            gestureType = GestureType.SWIPE_UP;
        }

        this.onGestureObservable.notifyObservers({
            type: gestureType,
            data: swipeData
        });

        this.onSwipeObservable.notifyObservers(swipeData);

        this.triggerHapticFeedback('light');
    }

    /**
     * Detect pinch start
     */
    private detectPinchStart(): void {
        // Pinch detection with two touches
    }

    /**
     * Detect pinch gesture
     */
    private detectPinch(): void {
        if (this.activeTouches.size !== 2) return;

        const touches = Array.from(this.activeTouches.values());
        const touch1 = touches[0];
        const touch2 = touches[1];

        const currentDistance = Vector2.Distance(touch1.position, touch2.position);
        const startDistance = Vector2.Distance(touch1.startPosition, touch2.startPosition);
        const center = touch1.position.add(touch2.position).scale(0.5);

        const pinchData: PinchData = {
            center,
            startDistance,
            currentDistance,
            scale: currentDistance / startDistance
        };

        const gestureType = currentDistance > startDistance ? GestureType.SPREAD : GestureType.PINCH;

        this.onGestureObservable.notifyObservers({
            type: gestureType,
            data: pinchData
        });

        this.onPinchObservable.notifyObservers(pinchData);
    }

    /**
     * Create UI container for touch controls
     */
    private createUIContainer(): void {
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'mobile-controls-container';
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.height = '100%';
        this.uiContainer.style.pointerEvents = 'none';
        this.uiContainer.style.zIndex = '1000';

        document.body.appendChild(this.uiContainer);
    }

    /**
     * Add virtual joystick
     */
    public addJoystick(config: VirtualJoystickConfig): void {
        this.joysticks.set(config.id, config);

        // Create joystick DOM element
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = `${config.position.x}px`;
        container.style.top = `${config.position.y}px`;
        container.style.width = `${config.size}px`;
        container.style.height = `${config.size}px`;
        container.style.pointerEvents = 'auto';

        // Base circle
        const base = document.createElement('div');
        base.style.width = '100%';
        base.style.height = '100%';
        base.style.borderRadius = '50%';
        base.style.backgroundColor = config.color;
        base.style.opacity = config.opacity.toString();
        base.style.position = 'absolute';

        // Stick circle
        const stick = document.createElement('div');
        stick.style.width = '40%';
        stick.style.height = '40%';
        stick.style.borderRadius = '50%';
        stick.style.backgroundColor = config.activeColor;
        stick.style.position = 'absolute';
        stick.style.left = '30%';
        stick.style.top = '30%';
        stick.style.transition = config.returnToCenter ? 'all 0.1s' : 'none';

        container.appendChild(base);
        container.appendChild(stick);

        this.joystickElements.set(config.id, container);
        this.uiContainer?.appendChild(container);

        // Initialize joystick state
        this.inputState.joystickState.set(config.id, {
            id: config.id,
            active: false,
            position: Vector2.Zero(),
            delta: Vector2.Zero(),
            angle: 0,
            magnitude: 0
        });
    }

    /**
     * Add touch button
     */
    public addButton(config: TouchButtonConfig): void {
        this.buttons.set(config.id, config);

        // Create button DOM element
        const button = document.createElement('div');
        button.style.position = 'absolute';
        button.style.left = `${config.position.x}px`;
        button.style.top = `${config.position.y}px`;
        button.style.width = `${config.size}px`;
        button.style.height = `${config.size}px`;
        button.style.backgroundColor = config.color;
        button.style.opacity = config.opacity.toString();
        button.style.pointerEvents = 'auto';
        button.style.borderRadius = config.shape === 'circle' ? '50%' : '0';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.color = 'white';
        button.style.fontSize = '16px';
        button.style.fontWeight = 'bold';
        button.style.userSelect = 'none';

        if (config.label) {
            button.textContent = config.label;
        }

        this.buttonElements.set(config.id, button);
        this.uiContainer?.appendChild(button);

        // Initialize button state
        this.inputState.buttonState.set(config.id, {
            id: config.id,
            pressed: false,
            pressTime: 0,
            releaseTime: 0,
            tapCount: 0
        });
    }

    /**
     * Check if touch is on button
     */
    private checkButtonTouch(position: Vector2, pressed: boolean): void {
        for (const [id, config] of this.buttons) {
            const buttonPos = config.position;
            const distance = Vector2.Distance(position, buttonPos);

            if (distance <= config.size / 2) {
                const state = this.inputState.buttonState.get(id);
                if (!state) continue;

                state.pressed = pressed;

                if (pressed) {
                    state.pressTime = Date.now();
                    state.tapCount++;

                    // Visual feedback
                    const element = this.buttonElements.get(id);
                    if (element) {
                        element.style.backgroundColor = config.activeColor;
                    }

                    // Haptic feedback
                    if (config.vibration) {
                        this.triggerHapticFeedback('light');
                    }
                } else {
                    state.releaseTime = Date.now();

                    // Reset visual
                    const element = this.buttonElements.get(id);
                    if (element) {
                        element.style.backgroundColor = config.color;
                    }
                }

                // Notify observers
                this.onButtonPressObservable.notifyObservers({
                    button: config.type,
                    state: pressed
                });

                break;
            }
        }
    }

    /**
     * Check if touch is on joystick
     */
    private checkJoystickTouch(touchId: number, position: Vector2, start: boolean, end: boolean = false): void {
        for (const [id, config] of this.joysticks) {
            if (!config.fixed && !start) continue;

            const joystickPos = config.position;
            const distance = Vector2.Distance(position, joystickPos);

            if (start && distance <= config.size / 2) {
                const state = this.inputState.joystickState.get(id);
                if (!state) continue;

                state.active = true;
                this.updateJoystickState(id, position);
                break;
            } else if (!start && !end) {
                this.updateJoystickState(id, position);
            } else if (end) {
                const state = this.inputState.joystickState.get(id);
                if (state) {
                    state.active = false;
                    state.delta = Vector2.Zero();
                    state.magnitude = 0;

                    // Return stick to center
                    const element = this.joystickElements.get(id);
                    if (element) {
                        const stick = element.children[1] as HTMLElement;
                        stick.style.left = '30%';
                        stick.style.top = '30%';
                    }
                }
            }
        }
    }

    /**
     * Update joystick state
     */
    private updateJoystickState(joystickId: string, touchPosition: Vector2): void {
        const config = this.joysticks.get(joystickId);
        const state = this.inputState.joystickState.get(joystickId);

        if (!config || !state || !state.active) return;

        const center = config.position;
        let delta = touchPosition.subtract(center);
        const distance = delta.length();
        const maxDistance = config.maxDistance;

        // Apply deadzone
        if (distance < config.deadzone) {
            delta = Vector2.Zero();
        } else {
            // Clamp to max distance
            if (distance > maxDistance) {
                delta = delta.normalize().scale(maxDistance);
            }

            // Normalize delta
            delta = delta.scale(1 / maxDistance);
        }

        state.delta = delta;
        state.magnitude = delta.length();
        state.angle = Math.atan2(delta.y, delta.x);

        // Update visual
        const element = this.joystickElements.get(joystickId);
        if (element) {
            const stick = element.children[1] as HTMLElement;
            const stickOffset = delta.scale(maxDistance * 0.3);
            stick.style.left = `${30 + (stickOffset.x / config.size) * 100}%`;
            stick.style.top = `${30 + (stickOffset.y / config.size) * 100}%`;
        }

        // Notify observers
        this.onJoystickMoveObservable.notifyObservers({
            joystick: joystickId,
            state: state
        });
    }

    /**
     * Set control scheme
     */
    public setControlScheme(scheme: TouchControlScheme): void {
        this.controlScheme = scheme;

        // Clear existing controls
        this.clearControls();

        // Setup controls based on scheme
        switch (scheme) {
            case TouchControlScheme.SIMPLE:
                this.setupSimpleControls();
                break;
            case TouchControlScheme.ADVANCED:
                this.setupAdvancedControls();
                break;
            case TouchControlScheme.ONE_HANDED:
                this.setupOneHandedControls();
                break;
            case TouchControlScheme.TWO_HANDED:
                this.setupTwoHandedControls();
                break;
        }
    }

    /**
     * Setup simple controls
     */
    private setupSimpleControls(): void {
        // Tap to swing/throw
        // Swipe for direction
        // No virtual buttons
    }

    /**
     * Setup advanced controls
     */
    private setupAdvancedControls(): void {
        // Left joystick for movement
        this.addJoystick({
            id: 'movement',
            position: new Vector2(100, window.innerHeight - 150),
            size: 120,
            deadzone: 10,
            maxDistance: 50,
            opacity: 0.5,
            color: '#333333',
            activeColor: '#666666',
            returnToCenter: true,
            fixed: true
        });

        // Right side buttons
        this.addButton({
            id: 'swing',
            type: TouchButtonType.SWING,
            position: new Vector2(window.innerWidth - 150, window.innerHeight - 150),
            size: 80,
            shape: 'circle',
            opacity: 0.7,
            color: '#ff4444',
            activeColor: '#ff6666',
            label: 'SWING',
            vibration: 1
        });

        this.addButton({
            id: 'pitch',
            type: TouchButtonType.PITCH,
            position: new Vector2(window.innerWidth - 250, window.innerHeight - 150),
            size: 80,
            shape: 'circle',
            opacity: 0.7,
            color: '#4444ff',
            activeColor: '#6666ff',
            label: 'PITCH',
            vibration: 1
        });
    }

    /**
     * Setup one-handed controls
     */
    private setupOneHandedControls(): void {
        // Optimize for single-hand operation
        // All controls on one side
    }

    /**
     * Setup two-handed controls
     */
    private setupTwoHandedControls(): void {
        // Optimize for two-hand operation
        // Mirrored controls on both sides
    }

    /**
     * Clear all controls
     */
    private clearControls(): void {
        // Remove joysticks
        for (const element of this.joystickElements.values()) {
            element.remove();
        }
        this.joystickElements.clear();
        this.joysticks.clear();

        // Remove buttons
        for (const element of this.buttonElements.values()) {
            element.remove();
        }
        this.buttonElements.clear();
        this.buttons.clear();
    }

    /**
     * Trigger haptic feedback
     */
    private triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy'): void {
        if (!this.optimizationSettings.hapticFeedback) return;

        if ('vibrate' in navigator) {
            let pattern: number[];

            switch (intensity) {
                case 'light':
                    pattern = [10];
                    break;
                case 'medium':
                    pattern = [20];
                    break;
                case 'heavy':
                    pattern = [50];
                    break;
            }

            navigator.vibrate(pattern);
        }
    }

    /**
     * Check if mobile device
     */
    private isMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Enable mobile optimizations
     */
    private enableMobileOptimizations(): void {
        this.optimizationSettings.reducedGraphics = true;
        this.optimizationSettings.simplifiedPhysics = true;
        this.optimizationSettings.reducedParticles = true;
        this.optimizationSettings.dynamicResolution = true;

        // Apply optimizations to scene
        this.applyOptimizations();
    }

    /**
     * Apply mobile optimizations
     */
    private applyOptimizations(): void {
        const engine = this.scene.getEngine();

        if (this.optimizationSettings.dynamicResolution) {
            // Enable dynamic resolution scaling
            engine.setHardwareScalingLevel(1 / this.resolutionScale);
        }

        if (this.optimizationSettings.reducedGraphics) {
            // Reduce shadow quality, disable certain effects, etc.
        }
    }

    /**
     * Update performance monitoring
     */
    public update(deltaTime: number): void {
        this.frameCount++;
        const now = Date.now();

        if (now - this.lastFrameTime >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = now;

            // Adjust resolution scale based on FPS
            if (this.optimizationSettings.dynamicResolution) {
                this.adjustResolutionScale();
            }
        }
    }

    /**
     * Adjust resolution scale based on performance
     */
    private adjustResolutionScale(): void {
        const targetFPS = this.optimizationSettings.targetFramerate;

        if (this.currentFPS < targetFPS - 10) {
            // Decrease resolution
            this.resolutionScale = Math.max(
                this.optimizationSettings.minResolutionScale,
                this.resolutionScale - 0.1
            );
        } else if (this.currentFPS > targetFPS + 5) {
            // Increase resolution
            this.resolutionScale = Math.min(
                this.optimizationSettings.maxResolutionScale,
                this.resolutionScale + 0.05
            );
        }

        const engine = this.scene.getEngine();
        engine.setHardwareScalingLevel(1 / this.resolutionScale);
    }

    /**
     * Get joystick state
     */
    public getJoystickState(joystickId: string): JoystickState | undefined {
        return this.inputState.joystickState.get(joystickId);
    }

    /**
     * Get button state
     */
    public getButtonState(buttonId: string): ButtonState | undefined {
        return this.inputState.buttonState.get(buttonId);
    }

    /**
     * Is button pressed
     */
    public isButtonPressed(buttonId: string): boolean {
        return this.inputState.buttonState.get(buttonId)?.pressed || false;
    }

    /**
     * Subscribe to gestures
     */
    public onGesture(callback: (data: { type: GestureType; data?: any }) => void): void {
        this.onGestureObservable.add(callback);
    }

    /**
     * Subscribe to button presses
     */
    public onButtonPress(callback: (data: { button: TouchButtonType; state: boolean }) => void): void {
        this.onButtonPressObservable.add(callback);
    }

    /**
     * Subscribe to joystick moves
     */
    public onJoystickMove(callback: (data: { joystick: string; state: JoystickState }) => void): void {
        this.onJoystickMoveObservable.add(callback);
    }

    /**
     * Subscribe to swipes
     */
    public onSwipe(callback: (data: SwipeData) => void): void {
        this.onSwipeObservable.add(callback);
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        // Remove event listeners
        this.canvas.removeEventListener('touchstart', this.onTouchStart.bind(this));
        this.canvas.removeEventListener('touchmove', this.onTouchMove.bind(this));
        this.canvas.removeEventListener('touchend', this.onTouchEnd.bind(this));
        this.canvas.removeEventListener('touchcancel', this.onTouchCancel.bind(this));

        // Clear UI
        this.clearControls();
        this.uiContainer?.remove();

        // Clear observables
        this.onGestureObservable.clear();
        this.onButtonPressObservable.clear();
        this.onJoystickMoveObservable.clear();
        this.onSwipeObservable.clear();
        this.onPinchObservable.clear();
    }
}
