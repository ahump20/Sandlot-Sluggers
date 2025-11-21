import { Scene, Vector2, Vector3, PointerInfo, PointerEventTypes, GamepadManager, Gamepad, Observable, ActionManager, ExecuteCodeAction } from '@babylonjs/core';

/**
 * Input device types
 */
export enum InputDevice {
    KEYBOARD_MOUSE = 'keyboard_mouse',
    GAMEPAD = 'gamepad',
    TOUCH = 'touch',
    MOTION = 'motion',
    VOICE = 'voice'
}

/**
 * Input action types
 */
export enum InputAction {
    // Batting
    SWING = 'swing',
    BUNT = 'bunt',
    POWER_SWING = 'power_swing',
    CONTACT_SWING = 'contact_swing',
    CHECK_SWING = 'check_swing',
    TAKE_PITCH = 'take_pitch',
    
    // Pitching
    PITCH = 'pitch',
    CHANGE_PITCH_TYPE = 'change_pitch_type',
    AIM_PITCH = 'aim_pitch',
    PITCH_POWER = 'pitch_power',
    PITCH_LOCATION = 'pitch_location',
    
    // Base running
    RUN = 'run',
    SLIDE = 'slide',
    DIVE = 'dive',
    STEAL = 'steal',
    ADVANCE = 'advance',
    RETREAT = 'retreat',
    
    // Fielding
    CATCH = 'catch',
    THROW = 'throw',
    DIVE_CATCH = 'dive_catch',
    JUMP_CATCH = 'jump_catch',
    SWITCH_FIELDER = 'switch_fielder',
    
    // Camera
    CAMERA_ZOOM_IN = 'camera_zoom_in',
    CAMERA_ZOOM_OUT = 'camera_zoom_out',
    CAMERA_ROTATE = 'camera_rotate',
    CAMERA_RESET = 'camera_reset',
    CHANGE_CAMERA = 'change_camera',
    
    // Menu
    PAUSE = 'pause',
    MENU_UP = 'menu_up',
    MENU_DOWN = 'menu_down',
    MENU_LEFT = 'menu_left',
    MENU_RIGHT = 'menu_right',
    MENU_SELECT = 'menu_select',
    MENU_BACK = 'menu_back',
    
    // Other
    CONFIRM = 'confirm',
    CANCEL = 'cancel',
    REPLAY = 'replay',
    SKIP = 'skip'
}

/**
 * Input binding
 */
export interface InputBinding {
    action: InputAction;
    device: InputDevice;
    primary: InputKey;
    secondary?: InputKey;
    modifiers?: string[];
    deadzone?: number;
    sensitivity?: number;
}

/**
 * Input key (can be keyboard key, gamepad button, or touch gesture)
 */
export interface InputKey {
    type: 'key' | 'button' | 'axis' | 'gesture';
    code: string | number;
    threshold?: number;
}

/**
 * Input state
 */
export interface InputState {
    pressed: boolean;
    justPressed: boolean;
    justReleased: boolean;
    value: number;
    duration: number;
    timestamp: number;
}

/**
 * Advanced Input System
 * Comprehensive input handling with rebindable controls and multiple device support
 */
export class AdvancedInputSystem {
    private scene: Scene;
    private canvas: HTMLCanvasElement;
    
    // Device managers
    private gamepadManager: GamepadManager;
    private activeGamepad: Gamepad | null = null;
    
    // Input bindings
    private bindings: Map<InputAction, InputBinding> = new Map();
    private customBindings: Map<string, InputBinding> = new Map();
    
    // Input states
    private actionStates: Map<InputAction, InputState> = new Map();
    private keyStates: Map<string, boolean> = new Map();
    private buttonStates: Map<number, boolean> = new Map();
    
    // Input buffer for combo detection
    private inputBuffer: Array<{ action: InputAction; timestamp: number }> = [];
    private bufferWindow: number = 500; // ms
    
    // Observables
    private onActionPressedObservable: Observable<InputAction> = new Observable();
    private onActionReleasedObservable: Observable<InputAction> = new Observable();
    private onDeviceChangedObservable: Observable<InputDevice> = new Observable();
    
    // Active device
    private activeDevice: InputDevice = InputDevice.KEYBOARD_MOUSE;
    
    // Settings
    private enabled: boolean = true;
    private vibrationEnabled: boolean = true;
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.canvas = scene.getEngine().getRenderingCanvas()!;
        this.gamepadManager = new GamepadManager();
        
        this.initializeDefaultBindings();
        this.setupEventListeners();
        this.setupGamepadManager();
    }
    
    /**
     * Initialize default control bindings
     */
    private initializeDefaultBindings(): void {
        // Keyboard + Mouse bindings
        this.bindings.set(InputAction.SWING, {
            action: InputAction.SWING,
            device: InputDevice.KEYBOARD_MOUSE,
            primary: { type: 'key', code: 'Space' },
            secondary: { type: 'button', code: 0 } // Left mouse button
        });
        
        this.bindings.set(InputAction.PITCH, {
            action: InputAction.PITCH,
            device: InputDevice.KEYBOARD_MOUSE,
            primary: { type: 'key', code: 'Space' }
        });
        
        // Gamepad bindings
        this.bindings.set(InputAction.SWING, {
            action: InputAction.SWING,
            device: InputDevice.GAMEPAD,
            primary: { type: 'button', code: 0 } // A button
        });
        
        // Initialize all action states
        for (const action of Object.values(InputAction)) {
            this.actionStates.set(action as InputAction, {
                pressed: false,
                justPressed: false,
                justReleased: false,
                value: 0,
                duration: 0,
                timestamp: 0
            });
        }
    }
    
    /**
     * Setup event listeners
     */
    private setupEventListeners(): void {
        // Keyboard events
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Mouse events  
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    /**
     * Setup gamepad manager
     */
    private setupGamepadManager(): void {
        this.gamepadManager.onGamepadConnectedObservable.add((gamepad) => {
            console.log(`Gamepad connected: ${gamepad.id}`);
            this.activeGamepad = gamepad;
            this.activeDevice = InputDevice.GAMEPAD;
            this.onDeviceChangedObservable.notifyObservers(InputDevice.GAMEPAD);
        });
        
        this.gamepadManager.onGamepadDisconnectedObservable.add((gamepad) => {
            console.log(`Gamepad disconnected: ${gamepad.id}`);
            if (this.activeGamepad === gamepad) {
                this.activeGamepad = null;
                this.activeDevice = InputDevice.KEYBOARD_MOUSE;
                this.onDeviceChangedObservable.notifyObservers(InputDevice.KEYBOARD_MOUSE);
            }
        });
    }
    
    /**
     * Handle key down
     */
    private onKeyDown(event: KeyboardEvent): void {
        if (!this.enabled) return;
        
        this.keyStates.set(event.code, true);
        this.activeDevice = InputDevice.KEYBOARD_MOUSE;
        
        // Check for action bindings
        this.checkActionTriggers('key', event.code);
    }
    
    /**
     * Handle key up
     */
    private onKeyUp(event: KeyboardEvent): void {
        if (!this.enabled) return;
        
        this.keyStates.set(event.code, false);
        this.checkActionReleases('key', event.code);
    }
    
    /**
     * Handle mouse down
     */
    private onMouseDown(event: MouseEvent): void {
        if (!this.enabled) return;
        
        this.buttonStates.set(event.button, true);
        this.activeDevice = InputDevice.KEYBOARD_MOUSE;
        this.checkActionTriggers('button', event.button);
    }
    
    /**
     * Handle mouse up
     */
    private onMouseUp(event: MouseEvent): void {
        if (!this.enabled) return;
        
        this.buttonStates.set(event.button, false);
        this.checkActionReleases('button', event.button);
    }
    
    /**
     * Handle mouse move
     */
    private onMouseMove(event: MouseEvent): void {
        if (!this.enabled) return;
        // Handle mouse movement for aiming, etc.
    }
    
    /**
     * Check if actions are triggered
     */
    private checkActionTriggers(type: string, code: string | number): void {
        for (const [action, binding] of this.bindings) {
            if (binding.device !== this.activeDevice) continue;
            
            if (binding.primary.type === type && binding.primary.code === code) {
                this.triggerAction(action);
            }
            
            if (binding.secondary && binding.secondary.type === type && binding.secondary.code === code) {
                this.triggerAction(action);
            }
        }
    }
    
    /**
     * Check if actions are released
     */
    private checkActionReleases(type: string, code: string | number): void {
        for (const [action, binding] of this.bindings) {
            if (binding.device !== this.activeDevice) continue;
            
            if (binding.primary.type === type && binding.primary.code === code) {
                this.releaseAction(action);
            }
            
            if (binding.secondary && binding.secondary.type === type && binding.secondary.code === code) {
                this.releaseAction(action);
            }
        }
    }
    
    /**
     * Trigger action
     */
    private triggerAction(action: InputAction): void {
        const state = this.actionStates.get(action);
        if (!state) return;
        
        if (!state.pressed) {
            state.justPressed = true;
            state.timestamp = Date.now();
            
            // Add to input buffer
            this.inputBuffer.push({ action, timestamp: state.timestamp });
            
            // Notify observers
            this.onActionPressedObservable.notifyObservers(action);
        }
        
        state.pressed = true;
        state.value = 1;
    }
    
    /**
     * Release action
     */
    private releaseAction(action: InputAction): void {
        const state = this.actionStates.get(action);
        if (!state) return;
        
        if (state.pressed) {
            state.justReleased = true;
            state.duration = Date.now() - state.timestamp;
            
            // Notify observers
            this.onActionReleasedObservable.notifyObservers(action);
        }
        
        state.pressed = false;
        state.value = 0;
    }
    
    /**
     * Update input system
     */
    public update(deltaTime: number): void {
        // Update gamepad
        if (this.activeGamepad) {
            this.updateGamepad();
        }
        
        // Update action durations
        for (const [action, state] of this.actionStates) {
            if (state.pressed) {
                state.duration = Date.now() - state.timestamp;
            }
            
            // Clear just pressed/released flags
            state.justPressed = false;
            state.justReleased = false;
        }
        
        // Clean up input buffer
        const now = Date.now();
        this.inputBuffer = this.inputBuffer.filter(input => now - input.timestamp < this.bufferWindow);
    }
    
    /**
     * Update gamepad input
     */
    private updateGamepad(): void {
        if (!this.activeGamepad) return;
        
        // Update button states
        for (let i = 0; i < this.activeGamepad.browserGamepad.buttons.length; i++) {
            const button = this.activeGamepad.browserGamepad.buttons[i];
            const wasPressed = this.buttonStates.get(i) || false;
            const isPressed = button.pressed;
            
            if (isPressed && !wasPressed) {
                this.buttonStates.set(i, true);
                this.checkActionTriggers('button', i);
            } else if (!isPressed && wasPressed) {
                this.buttonStates.set(i, false);
                this.checkActionReleases('button', i);
            }
        }
        
        // Update axis states (for analog sticks, triggers)
        // Axis handling would go here
    }
    
    /**
     * Check if action is pressed
     */
    public isActionPressed(action: InputAction): boolean {
        return this.actionStates.get(action)?.pressed || false;
    }
    
    /**
     * Check if action was just pressed
     */
    public wasActionJustPressed(action: InputAction): boolean {
        return this.actionStates.get(action)?.justPressed || false;
    }
    
    /**
     * Check if action was just released
     */
    public wasActionJustReleased(action: InputAction): boolean {
        return this.actionStates.get(action)?.justReleased || false;
    }
    
    /**
     * Get action value (0-1 for analog inputs)
     */
    public getActionValue(action: InputAction): number {
        return this.actionStates.get(action)?.value || 0;
    }
    
    /**
     * Get action duration (how long it's been held)
     */
    public getActionDuration(action: InputAction): number {
        return this.actionStates.get(action)?.duration || 0;
    }
    
    /**
     * Rebind action
     */
    public rebindAction(action: InputAction, device: InputDevice, key: InputKey): void {
        const binding = this.bindings.get(action);
        if (binding && binding.device === device) {
            binding.primary = key;
        }
    }
    
    /**
     * Get binding for action
     */
    public getBinding(action: InputAction): InputBinding | undefined {
        return this.bindings.get(action);
    }
    
    /**
     * Subscribe to action pressed events
     */
    public onActionPressed(callback: (action: InputAction) => void): void {
        this.onActionPressedObservable.add(callback);
    }
    
    /**
     * Subscribe to action released events
     */
    public onActionReleased(callback: (action: InputAction) => void): void {
        this.onActionReleasedObservable.add(callback);
    }
    
    /**
     * Trigger vibration (gamepad rumble)
     */
    public vibrate(duration: number, weakMagnitude: number = 0.5, strongMagnitude: number = 0.5): void {
        if (!this.vibrationEnabled || !this.activeGamepad) return;
        
        // Gamepad vibration would use the Vibration API
        // Implementation depends on browser support
    }
    
    /**
     * Dispose system
     */
    public dispose(): void {
        window.removeEventListener('keydown', this.onKeyDown.bind(this));
        window.removeEventListener('keyup', this.onKeyUp.bind(this));
        
        this.onActionPressedObservable.clear();
        this.onActionReleasedObservable.clear();
        this.onDeviceChangedObservable.clear();
    }
}
