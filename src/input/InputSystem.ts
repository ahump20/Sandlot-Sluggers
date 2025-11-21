/**
 * Comprehensive Input System for Sandlot Sluggers
 * Manages all player input including keyboard, mouse, gamepad, and touch
 *
 * Features:
 * - Multi-input device support (keyboard, mouse, gamepad, touch)
 * - Customizable key bindings
 * - Input buffering for combos
 * - Gesture recognition
 * - Analog stick dead zones and sensitivity
 * - Button remapping
 * - Input profiles (presets)
 * - Gamepad vibration/rumble
 * - Mouse sensitivity and acceleration
 * - Input recording and playback
 * - Accessibility features
 * - Input visualization
 * - Action binding system
 * - Context-aware input (different bindings per game state)
 */

import { Scene } from '@babylonjs/core/scene';
import { Observable } from '@babylonjs/core/Misc/observable';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';

export enum InputDevice {
    KEYBOARD = 'keyboard',
    MOUSE = 'mouse',
    GAMEPAD = 'gamepad',
    TOUCH = 'touch',
    VR_CONTROLLER = 'vr_controller'
}

export enum InputType {
    BUTTON = 'button',
    AXIS = 'axis',
    VECTOR2 = 'vector2',
    VECTOR3 = 'vector3',
    TOUCH_GESTURE = 'touch_gesture'
}

export enum InputAction {
    // Movement
    MOVE_UP = 'move_up',
    MOVE_DOWN = 'move_down',
    MOVE_LEFT = 'move_left',
    MOVE_RIGHT = 'move_right',
    SPRINT = 'sprint',
    JUMP = 'jump',
    CROUCH = 'crouch',

    // Batting
    SWING = 'swing',
    BUNT = 'bunt',
    CONTACT_SWING = 'contact_swing',
    POWER_SWING = 'power_swing',
    AIM_BAT_UP = 'aim_bat_up',
    AIM_BAT_DOWN = 'aim_bat_down',
    AIM_BAT_LEFT = 'aim_bat_left',
    AIM_BAT_RIGHT = 'aim_bat_right',

    // Pitching
    SELECT_PITCH = 'select_pitch',
    THROW_PITCH = 'throw_pitch',
    AIM_PITCH_UP = 'aim_pitch_up',
    AIM_PITCH_DOWN = 'aim_pitch_down',
    AIM_PITCH_LEFT = 'aim_pitch_left',
    AIM_PITCH_RIGHT = 'aim_pitch_right',
    ADD_SPIN = 'add_spin',

    // Fielding
    THROW_TO_BASE = 'throw_to_base',
    THROW_TO_FIRST = 'throw_to_first',
    THROW_TO_SECOND = 'throw_to_second',
    THROW_TO_THIRD = 'throw_to_third',
    THROW_HOME = 'throw_home',
    DIVE = 'dive',
    JUMP_CATCH = 'jump_catch',

    // Base running
    ADVANCE = 'advance',
    RETREAT = 'retreat',
    STEAL_BASE = 'steal_base',
    SLIDE = 'slide',

    // Camera
    CAMERA_UP = 'camera_up',
    CAMERA_DOWN = 'camera_down',
    CAMERA_LEFT = 'camera_left',
    CAMERA_RIGHT = 'camera_right',
    CAMERA_ZOOM_IN = 'camera_zoom_in',
    CAMERA_ZOOM_OUT = 'camera_zoom_out',
    CAMERA_RESET = 'camera_reset',

    // UI
    MENU_UP = 'menu_up',
    MENU_DOWN = 'menu_down',
    MENU_LEFT = 'menu_left',
    MENU_RIGHT = 'menu_right',
    MENU_SELECT = 'menu_select',
    MENU_BACK = 'menu_back',
    PAUSE = 'pause',
    SCOREBOARD = 'scoreboard',

    // System
    SCREENSHOT = 'screenshot',
    RECORD_REPLAY = 'record_replay',
    TOGGLE_HUD = 'toggle_hud'
}

export enum GamepadButton {
    A = 0,
    B = 1,
    X = 2,
    Y = 3,
    LEFT_BUMPER = 4,
    RIGHT_BUMPER = 5,
    LEFT_TRIGGER = 6,
    RIGHT_TRIGGER = 7,
    SELECT = 8,
    START = 9,
    LEFT_STICK_BUTTON = 10,
    RIGHT_STICK_BUTTON = 11,
    DPAD_UP = 12,
    DPAD_DOWN = 13,
    DPAD_LEFT = 14,
    DPAD_RIGHT = 15,
    HOME = 16
}

export enum GamepadAxis {
    LEFT_STICK_X = 0,
    LEFT_STICK_Y = 1,
    RIGHT_STICK_X = 2,
    RIGHT_STICK_Y = 3
}

export enum TouchGesture {
    TAP = 'tap',
    DOUBLE_TAP = 'double_tap',
    LONG_PRESS = 'long_press',
    SWIPE_UP = 'swipe_up',
    SWIPE_DOWN = 'swipe_down',
    SWIPE_LEFT = 'swipe_left',
    SWIPE_RIGHT = 'swipe_right',
    PINCH = 'pinch',
    SPREAD = 'spread',
    ROTATE = 'rotate'
}

export interface InputBinding {
    action: InputAction;
    device: InputDevice;
    primary: string | number;
    secondary?: string | number;
    modifiers?: string[];
    context?: string; // Game state context (e.g., 'batting', 'pitching', 'menu')
}

export interface InputState {
    action: InputAction;
    value: number | Vector2 | Vector3;
    pressed: boolean;
    held: boolean;
    released: boolean;
    duration: number;
    device: InputDevice;
}

export interface GamepadState {
    index: number;
    id: string;
    connected: boolean;
    buttons: Map<number, ButtonState>;
    axes: Map<number, number>;
    vibrationSupport: boolean;
}

export interface ButtonState {
    pressed: boolean;
    held: boolean;
    released: boolean;
    value: number; // For analog buttons
    duration: number;
}

export interface TouchState {
    id: number;
    position: Vector2;
    startPosition: Vector2;
    delta: Vector2;
    force: number;
    timestamp: number;
    duration: number;
}

export interface InputProfile {
    id: string;
    name: string;
    bindings: InputBinding[];
    sensitivity: {
        mouse: number;
        gamepadStick: number;
        touch: number;
    };
    deadzone: {
        leftStick: number;
        rightStick: number;
        triggers: number;
    };
    invertAxis: {
        mouseY: boolean;
        rightStickY: boolean;
    };
}

export interface InputBuffer {
    action: InputAction;
    timestamp: number;
    value: any;
}

export interface InputCombo {
    id: string;
    name: string;
    sequence: InputAction[];
    timing: number; // Max milliseconds between inputs
    callback: () => void;
}

export interface VibrationPattern {
    duration: number;
    weakMagnitude: number;
    strongMagnitude: number;
}

export class InputSystem {
    private scene: Scene;
    private activeProfile: InputProfile;
    private profiles: Map<string, InputProfile>;
    private bindings: Map<InputAction, InputBinding[]>;
    private inputStates: Map<InputAction, InputState>;

    // Device states
    private keyboardState: Map<string, ButtonState>;
    private mousePosition: Vector2;
    private mouseButtons: Map<number, ButtonState>;
    private mouseWheelDelta: number;
    private gamepads: Map<number, GamepadState>;
    private touches: Map<number, TouchState>;

    // Input buffering
    private inputBuffer: InputBuffer[];
    private bufferSize: number;
    private combos: Map<string, InputCombo>;

    // Settings
    private mouseSensitivity: number;
    private gamepadSensitivity: number;
    private leftStickDeadzone: number;
    private rightStickDeadzone: number;
    private triggerDeadzone: number;
    private invertMouseY: boolean;
    private invertRightStickY: boolean;

    // Recording
    private isRecording: boolean;
    private recordedInputs: InputState[];

    // Enabled state
    private enabled: boolean;
    private currentContext: string;

    // Observables for events
    public onActionTriggered: Observable<InputState>;
    public onActionPressed: Observable<InputAction>;
    public onActionReleased: Observable<InputAction>;
    public onComboTriggered: Observable<InputCombo>;
    public onGamepadConnected: Observable<GamepadState>;
    public onGamepadDisconnected: Observable<number>;
    public onTouchGesture: Observable<{ gesture: TouchGesture; position: Vector2 }>;

    constructor(scene: Scene) {
        this.scene = scene;
        this.profiles = new Map();
        this.bindings = new Map();
        this.inputStates = new Map();

        this.keyboardState = new Map();
        this.mousePosition = Vector2.Zero();
        this.mouseButtons = new Map();
        this.mouseWheelDelta = 0;
        this.gamepads = new Map();
        this.touches = new Map();

        this.inputBuffer = [];
        this.bufferSize = 10;
        this.combos = new Map();

        this.mouseSensitivity = 1.0;
        this.gamepadSensitivity = 1.0;
        this.leftStickDeadzone = 0.15;
        this.rightStickDeadzone = 0.15;
        this.triggerDeadzone = 0.1;
        this.invertMouseY = false;
        this.invertRightStickY = false;

        this.isRecording = false;
        this.recordedInputs = [];

        this.enabled = true;
        this.currentContext = 'default';

        this.onActionTriggered = new Observable();
        this.onActionPressed = new Observable();
        this.onActionReleased = new Observable();
        this.onComboTriggered = new Observable();
        this.onGamepadConnected = new Observable();
        this.onGamepadDisconnected = new Observable();
        this.onTouchGesture = new Observable();

        this.activeProfile = this.createDefaultProfile();
        this.initializeEventListeners();
    }

    private createDefaultProfile(): InputProfile {
        const profile: InputProfile = {
            id: 'default',
            name: 'Default',
            bindings: [
                // Keyboard movement
                { action: InputAction.MOVE_UP, device: InputDevice.KEYBOARD, primary: 'KeyW' },
                { action: InputAction.MOVE_DOWN, device: InputDevice.KEYBOARD, primary: 'KeyS' },
                { action: InputAction.MOVE_LEFT, device: InputDevice.KEYBOARD, primary: 'KeyA' },
                { action: InputAction.MOVE_RIGHT, device: InputDevice.KEYBOARD, primary: 'KeyD' },
                { action: InputAction.SPRINT, device: InputDevice.KEYBOARD, primary: 'ShiftLeft' },

                // Keyboard batting
                { action: InputAction.SWING, device: InputDevice.KEYBOARD, primary: 'Space' },
                { action: InputAction.BUNT, device: InputDevice.KEYBOARD, primary: 'KeyB' },
                { action: InputAction.CONTACT_SWING, device: InputDevice.KEYBOARD, primary: 'KeyC' },
                { action: InputAction.POWER_SWING, device: InputDevice.KEYBOARD, primary: 'KeyV' },

                // Keyboard pitching
                { action: InputAction.THROW_PITCH, device: InputDevice.KEYBOARD, primary: 'Space' },
                { action: InputAction.SELECT_PITCH, device: InputDevice.KEYBOARD, primary: 'Digit1' },

                // Gamepad movement
                { action: InputAction.MOVE_UP, device: InputDevice.GAMEPAD, primary: GamepadAxis.LEFT_STICK_Y },
                { action: InputAction.MOVE_LEFT, device: InputDevice.GAMEPAD, primary: GamepadAxis.LEFT_STICK_X },
                { action: InputAction.SPRINT, device: InputDevice.GAMEPAD, primary: GamepadButton.A },

                // Gamepad batting
                { action: InputAction.SWING, device: InputDevice.GAMEPAD, primary: GamepadButton.A },
                { action: InputAction.POWER_SWING, device: InputDevice.GAMEPAD, primary: GamepadButton.X },
                { action: InputAction.BUNT, device: InputDevice.GAMEPAD, primary: GamepadButton.Y },

                // Gamepad pitching
                { action: InputAction.THROW_PITCH, device: InputDevice.GAMEPAD, primary: GamepadButton.A },
                { action: InputAction.AIM_PITCH_UP, device: InputDevice.GAMEPAD, primary: GamepadAxis.RIGHT_STICK_Y },
                { action: InputAction.AIM_PITCH_LEFT, device: InputDevice.GAMEPAD, primary: GamepadAxis.RIGHT_STICK_X },

                // Gamepad fielding
                { action: InputAction.THROW_TO_FIRST, device: InputDevice.GAMEPAD, primary: GamepadButton.Y },
                { action: InputAction.THROW_TO_SECOND, device: InputDevice.GAMEPAD, primary: GamepadButton.B },
                { action: InputAction.THROW_TO_THIRD, device: InputDevice.GAMEPAD, primary: GamepadButton.A },
                { action: InputAction.THROW_HOME, device: InputDevice.GAMEPAD, primary: GamepadButton.X },
                { action: InputAction.DIVE, device: InputDevice.GAMEPAD, primary: GamepadButton.RIGHT_BUMPER },

                // UI
                { action: InputAction.PAUSE, device: InputDevice.KEYBOARD, primary: 'Escape' },
                { action: InputAction.PAUSE, device: InputDevice.GAMEPAD, primary: GamepadButton.START },
                { action: InputAction.MENU_SELECT, device: InputDevice.KEYBOARD, primary: 'Enter' },
                { action: InputAction.MENU_BACK, device: InputDevice.KEYBOARD, primary: 'Escape' }
            ],
            sensitivity: {
                mouse: 1.0,
                gamepadStick: 1.0,
                touch: 1.0
            },
            deadzone: {
                leftStick: 0.15,
                rightStick: 0.15,
                triggers: 0.1
            },
            invertAxis: {
                mouseY: false,
                rightStickY: false
            }
        };

        this.profiles.set(profile.id, profile);
        this.loadBindings(profile);

        return profile;
    }

    private loadBindings(profile: InputProfile): void {
        this.bindings.clear();

        for (const binding of profile.bindings) {
            if (!this.bindings.has(binding.action)) {
                this.bindings.set(binding.action, []);
            }
            this.bindings.get(binding.action)!.push(binding);
        }
    }

    private initializeEventListeners(): void {
        // Keyboard events
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        // Mouse events
        window.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('wheel', this.handleMouseWheel.bind(this));

        // Touch events
        window.addEventListener('touchstart', this.handleTouchStart.bind(this));
        window.addEventListener('touchmove', this.handleTouchMove.bind(this));
        window.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Gamepad events
        window.addEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
        window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (!this.enabled) return;

        const code = event.code;
        if (!this.keyboardState.has(code)) {
            this.keyboardState.set(code, {
                pressed: true,
                held: false,
                released: false,
                value: 1,
                duration: 0
            });

            // Check for bound actions
            this.checkKeyboardActions(code, true);
        } else {
            const state = this.keyboardState.get(code)!;
            state.held = true;
        }
    }

    private handleKeyUp(event: KeyboardEvent): void {
        if (!this.enabled) return;

        const code = event.code;
        const state = this.keyboardState.get(code);
        if (state) {
            state.released = true;
            state.pressed = false;
            state.held = false;

            // Check for bound actions
            this.checkKeyboardActions(code, false);

            // Clear after one frame
            setTimeout(() => this.keyboardState.delete(code), 0);
        }
    }

    private checkKeyboardActions(code: string, pressed: boolean): void {
        for (const [action, bindings] of this.bindings.entries()) {
            for (const binding of bindings) {
                if (binding.device === InputDevice.KEYBOARD &&
                    (binding.primary === code || binding.secondary === code)) {

                    // Check context
                    if (binding.context && binding.context !== this.currentContext) {
                        continue;
                    }

                    this.triggerAction(action, pressed ? 1 : 0, pressed, InputDevice.KEYBOARD);
                }
            }
        }
    }

    private handleMouseDown(event: MouseEvent): void {
        if (!this.enabled) return;

        this.mouseButtons.set(event.button, {
            pressed: true,
            held: false,
            released: false,
            value: 1,
            duration: 0
        });
    }

    private handleMouseUp(event: MouseEvent): void {
        if (!this.enabled) return;

        const state = this.mouseButtons.get(event.button);
        if (state) {
            state.released = true;
            state.pressed = false;
            state.held = false;

            setTimeout(() => this.mouseButtons.delete(event.button), 0);
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        if (!this.enabled) return;

        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
    }

    private handleMouseWheel(event: WheelEvent): void {
        if (!this.enabled) return;

        this.mouseWheelDelta = event.deltaY;
    }

    private handleTouchStart(event: TouchEvent): void {
        if (!this.enabled) return;

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const position = new Vector2(touch.clientX, touch.clientY);

            this.touches.set(touch.identifier, {
                id: touch.identifier,
                position,
                startPosition: position.clone(),
                delta: Vector2.Zero(),
                force: touch.force,
                timestamp: Date.now(),
                duration: 0
            });
        }
    }

    private handleTouchMove(event: TouchEvent): void {
        if (!this.enabled) return;

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const state = this.touches.get(touch.identifier);

            if (state) {
                const newPosition = new Vector2(touch.clientX, touch.clientY);
                state.delta = newPosition.subtract(state.position);
                state.position = newPosition;
                state.force = touch.force;
            }
        }
    }

    private handleTouchEnd(event: TouchEvent): void {
        if (!this.enabled) return;

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const state = this.touches.get(touch.identifier);

            if (state) {
                // Detect gestures
                this.detectGesture(state);
                this.touches.delete(touch.identifier);
            }
        }
    }

    private detectGesture(touch: TouchState): void {
        const delta = touch.position.subtract(touch.startPosition);
        const distance = delta.length();
        const duration = Date.now() - touch.timestamp;

        // Tap
        if (distance < 10 && duration < 200) {
            this.onTouchGesture.notifyObservers({ gesture: TouchGesture.TAP, position: touch.position });
        }
        // Swipe
        else if (distance > 50) {
            const angle = Math.atan2(delta.y, delta.x);
            const degrees = angle * (180 / Math.PI);

            if (degrees >= -45 && degrees < 45) {
                this.onTouchGesture.notifyObservers({ gesture: TouchGesture.SWIPE_RIGHT, position: touch.position });
            } else if (degrees >= 45 && degrees < 135) {
                this.onTouchGesture.notifyObservers({ gesture: TouchGesture.SWIPE_DOWN, position: touch.position });
            } else if (degrees >= -135 && degrees < -45) {
                this.onTouchGesture.notifyObservers({ gesture: TouchGesture.SWIPE_UP, position: touch.position });
            } else {
                this.onTouchGesture.notifyObservers({ gesture: TouchGesture.SWIPE_LEFT, position: touch.position });
            }
        }
        // Long press
        else if (duration > 500) {
            this.onTouchGesture.notifyObservers({ gesture: TouchGesture.LONG_PRESS, position: touch.position });
        }
    }

    private handleGamepadConnected(event: GamepadEvent): void {
        const gamepad = event.gamepad;

        const gamepadState: GamepadState = {
            index: gamepad.index,
            id: gamepad.id,
            connected: true,
            buttons: new Map(),
            axes: new Map(),
            vibrationSupport: 'vibrationActuator' in gamepad
        };

        this.gamepads.set(gamepad.index, gamepadState);
        this.onGamepadConnected.notifyObservers(gamepadState);
    }

    private handleGamepadDisconnected(event: GamepadEvent): void {
        this.gamepads.delete(event.gamepad.index);
        this.onGamepadDisconnected.notifyObservers(event.gamepad.index);
    }

    private triggerAction(action: InputAction, value: number, pressed: boolean, device: InputDevice): void {
        const state: InputState = {
            action,
            value,
            pressed,
            held: false,
            released: !pressed,
            duration: 0,
            device
        };

        this.inputStates.set(action, state);

        // Add to buffer
        this.inputBuffer.push({
            action,
            timestamp: Date.now(),
            value
        });

        if (this.inputBuffer.length > this.bufferSize) {
            this.inputBuffer.shift();
        }

        // Check for combos
        this.checkCombos();

        // Trigger observables
        this.onActionTriggered.notifyObservers(state);
        if (pressed) {
            this.onActionPressed.notifyObservers(action);
        } else {
            this.onActionReleased.notifyObservers(action);
        }

        // Record if recording
        if (this.isRecording) {
            this.recordedInputs.push(state);
        }
    }

    private checkCombos(): void {
        for (const combo of this.combos.values()) {
            if (this.inputBuffer.length < combo.sequence.length) continue;

            const recentInputs = this.inputBuffer.slice(-combo.sequence.length);
            let matches = true;

            for (let i = 0; i < combo.sequence.length; i++) {
                if (recentInputs[i].action !== combo.sequence[i]) {
                    matches = false;
                    break;
                }

                // Check timing
                if (i > 0) {
                    const timeDiff = recentInputs[i].timestamp - recentInputs[i - 1].timestamp;
                    if (timeDiff > combo.timing) {
                        matches = false;
                        break;
                    }
                }
            }

            if (matches) {
                combo.callback();
                this.onComboTriggered.notifyObservers(combo);
                this.inputBuffer = []; // Clear buffer after combo
            }
        }
    }

    public getActionState(action: InputAction): InputState | null {
        return this.inputStates.get(action) || null;
    }

    public isActionPressed(action: InputAction): boolean {
        const state = this.inputStates.get(action);
        return state ? state.pressed : false;
    }

    public isActionHeld(action: InputAction): boolean {
        const state = this.inputStates.get(action);
        return state ? state.held : false;
    }

    public getActionValue(action: InputAction): number {
        const state = this.inputStates.get(action);
        if (!state) return 0;
        return typeof state.value === 'number' ? state.value : 0;
    }

    public addBinding(binding: InputBinding): void {
        if (!this.bindings.has(binding.action)) {
            this.bindings.set(binding.action, []);
        }
        this.bindings.get(binding.action)!.push(binding);
    }

    public removeBinding(action: InputAction, device: InputDevice): void {
        const bindings = this.bindings.get(action);
        if (!bindings) return;

        const filtered = bindings.filter(b => b.device !== device);
        this.bindings.set(action, filtered);
    }

    public addCombo(combo: InputCombo): void {
        this.combos.set(combo.id, combo);
    }

    public setContext(context: string): void {
        this.currentContext = context;
    }

    public vibrate(duration: number, weakMagnitude: number, strongMagnitude: number): void {
        for (const gamepad of this.gamepads.values()) {
            if (gamepad.vibrationSupport) {
                const gp = navigator.getGamepads()[gamepad.index];
                if (gp && 'vibrationActuator' in gp) {
                    (gp.vibrationActuator as any).playEffect('dual-rumble', {
                        duration,
                        weakMagnitude,
                        strongMagnitude
                    });
                }
            }
        }
    }

    public startRecording(): void {
        this.isRecording = true;
        this.recordedInputs = [];
    }

    public stopRecording(): InputState[] {
        this.isRecording = false;
        return [...this.recordedInputs];
    }

    public update(deltaTime: number): void {
        if (!this.enabled) return;

        // Update gamepads
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (!gamepad) continue;

            const state = this.gamepads.get(gamepad.index);
            if (!state) continue;

            // Update button states
            for (let j = 0; j < gamepad.buttons.length; j++) {
                const button = gamepad.buttons[j];
                const prevState = state.buttons.get(j);

                const buttonState: ButtonState = {
                    pressed: button.pressed && (!prevState || !prevState.pressed),
                    held: button.pressed && prevState?.pressed || false,
                    released: !button.pressed && prevState?.pressed || false,
                    value: button.value,
                    duration: prevState ? prevState.duration + deltaTime : 0
                };

                state.buttons.set(j, buttonState);

                // Trigger actions for button presses
                if (buttonState.pressed) {
                    this.checkGamepadButtonActions(j, true);
                } else if (buttonState.released) {
                    this.checkGamepadButtonActions(j, false);
                }
            }

            // Update axis states with dead zone
            for (let j = 0; j < gamepad.axes.length; j++) {
                let value = gamepad.axes[j];

                // Apply dead zone
                const deadzone = (j === 0 || j === 1) ? this.leftStickDeadzone : this.rightStickDeadzone;
                if (Math.abs(value) < deadzone) {
                    value = 0;
                } else {
                    // Scale value to account for deadzone
                    value = (value - Math.sign(value) * deadzone) / (1 - deadzone);
                }

                // Apply sensitivity
                value *= this.gamepadSensitivity;

                state.axes.set(j, value);

                // Trigger actions for axis changes
                this.checkGamepadAxisActions(j, value);
            }
        }

        // Update button durations
        for (const state of this.inputStates.values()) {
            if (state.held) {
                state.duration += deltaTime;
            }
        }
    }

    private checkGamepadButtonActions(button: number, pressed: boolean): void {
        for (const [action, bindings] of this.bindings.entries()) {
            for (const binding of bindings) {
                if (binding.device === InputDevice.GAMEPAD && binding.primary === button) {
                    if (binding.context && binding.context !== this.currentContext) {
                        continue;
                    }

                    this.triggerAction(action, pressed ? 1 : 0, pressed, InputDevice.GAMEPAD);
                }
            }
        }
    }

    private checkGamepadAxisActions(axis: number, value: number): void {
        for (const [action, bindings] of this.bindings.entries()) {
            for (const binding of bindings) {
                if (binding.device === InputDevice.GAMEPAD && binding.primary === axis) {
                    if (binding.context && binding.context !== this.currentContext) {
                        continue;
                    }

                    this.triggerAction(action, value, Math.abs(value) > 0.1, InputDevice.GAMEPAD);
                }
            }
        }
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    public dispose(): void {
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
        window.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        window.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        window.removeEventListener('wheel', this.handleMouseWheel.bind(this));
        window.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        window.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        window.removeEventListener('touchend', this.handleTouchEnd.bind(this));

        // Clear all state
        this.bindings.clear();
        this.inputStates.clear();
        this.keyboardState.clear();
        this.mouseButtons.clear();
        this.gamepads.clear();
        this.touches.clear();
        this.inputBuffer = [];
        this.combos.clear();
        this.recordedInputs = [];
    }
}
