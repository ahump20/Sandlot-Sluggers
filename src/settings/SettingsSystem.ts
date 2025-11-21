/**
 * Comprehensive Settings and Configuration System
 * Manages all game settings, preferences, and configurations
 */

export interface GraphicsSettings {
    // Quality presets
    qualityPreset: 'low' | 'medium' | 'high' | 'ultra' | 'custom';

    // Resolution
    resolution: {
        width: number;
        height: number;
    };
    fullscreen: boolean;
    vsync: boolean;
    frameRateLimit: number; // 0 = unlimited

    // Rendering
    renderScale: number; // 0.5-2.0
    antiAliasing: 'none' | 'fxaa' | 'msaa2x' | 'msaa4x' | 'msaa8x';
    anisotropicFiltering: 0 | 2 | 4 | 8 | 16;

    // Shadows
    shadowQuality: 'off' | 'low' | 'medium' | 'high' | 'ultra';
    shadowResolution: 512 | 1024 | 2048 | 4096;
    shadowDistance: number;

    // Post-processing
    bloom: boolean;
    bloomIntensity: number; // 0-1
    motionBlur: boolean;
    motionBlurAmount: number; // 0-1
    depthOfField: boolean;
    dofIntensity: number; // 0-1
    colorGrading: boolean;
    vignette: boolean;
    chromaticAberration: boolean;
    filmGrain: boolean;
    filmGrainAmount: number; // 0-1

    // Particles
    particleQuality: 'low' | 'medium' | 'high';
    maxParticles: number;

    // Field/Stadium
    grassQuality: 'low' | 'medium' | 'high' | 'ultra';
    crowdDensity: 'off' | 'low' | 'medium' | 'high';
    stadiumDetails: 'low' | 'medium' | 'high';

    // Weather
    weatherEffects: boolean;
    weatherParticleDensity: number; // 0-1

    // Performance
    dynamicResolution: boolean;
    targetFrameRate: number;
}

export interface AudioSettings {
    // Master volume
    masterVolume: number; // 0-100

    // Individual volumes
    musicVolume: number; // 0-100
    sfxVolume: number; // 0-100
    ambienceVolume: number; // 0-100
    voiceVolume: number; // 0-100
    announcerVolume: number; // 0-100
    crowdVolume: number; // 0-100

    // Audio quality
    audioQuality: 'low' | 'medium' | 'high';
    sampleRate: 22050 | 44100 | 48000;

    // 3D Audio
    spatialAudio: boolean;
    reverbQuality: 'off' | 'low' | 'medium' | 'high';

    // Mute options
    muteWhenUnfocused: boolean;
    muteAll: boolean;

    // Voice chat (for multiplayer)
    voiceChatEnabled: boolean;
    voiceChatVolume: number; // 0-100
    pushToTalk: boolean;
    voiceActivation: boolean;
    voiceActivationThreshold: number; // 0-100
}

export interface GameplaySettings {
    // Difficulty
    difficulty: 'rookie' | 'pro' | 'all_star' | 'legend' | 'dynamic';
    adaptiveDifficulty: boolean;
    difficultyAdjustmentSpeed: number; // 0-1

    // Batting
    battingAssists: {
        timingIndicator: boolean;
        contactZoneHighlight: boolean;
        pitchPrediction: boolean;
        swingAnalysis: boolean;
    };
    battingCameraAngle: 'behind_pitcher' | 'behind_batter' | 'side_view' | 'broadcast';
    strikeZoneDisplay: 'always' | 'after_pitch' | 'never';

    // Pitching
    pitchingAssists: {
        accuracyGuide: boolean;
        powerMeter: boolean;
        pitchRecommendation: boolean;
        batterAnalysis: boolean;
    };
    pitchingCameraAngle: 'behind_pitcher' | 'behind_batter' | 'side_view';
    pitchingInterface: 'classic' | 'meter' | 'analog' | 'pulse';

    // Fielding
    fieldingAssists: {
        autoFielder Selection: boolean;
        throwingArcs: boolean;
        catchRadar: boolean;
        autoThrow: boolean;
    };
    fieldingCameraAngle: 'broadcast' | 'behind_fielder' | 'follow_ball';
    autoFielding: boolean;

    // Base running
    baseRunningAssists: {
        autoAdvance: boolean;
        autoReturn: boolean;
        leadOffGuide: boolean;
        stealingIndicator: boolean;
    };
    baseRunningControl: 'auto' | 'semi_auto' | 'manual';

    // Game speed
    gameSpeed: number; // 0.5-2.0, 1.0 = normal
    pitchSpeed: number; // 0.5-2.0, 1.0 = normal
    animationSpeed: number; // 0.5-2.0, 1.0 = normal

    // Realism
    injuries: boolean;
    fatigue: boolean;
    weather: boolean;
    playerMorale: boolean;

    // Rules
    designatedHitter: boolean;
    inningCount: 9 | 7 | 5 | 3;
    mercyRule: boolean;
    mercyRunDifference: number;
    mercyInning: number;
}

export interface ControlSettings {
    // Input device
    primaryInputDevice: 'keyboard' | 'mouse' | 'gamepad' | 'touch';

    // Keyboard bindings
    keyboardBindings: Map<string, string>; // action -> key

    // Mouse settings
    mouseSensitivity: number; // 0-100
    mouseInvertY: boolean;
    mouseSmoothing: boolean;

    // Gamepad settings
    gamepadLayout: 'xbox' | 'playstation' | 'nintendo' | 'custom';
    gamepadSensitivity: number; // 0-100
    gamepadDeadzone: number; // 0-100
    gamepadVibration: boolean;
    gamepadVibrationStrength: number; // 0-100
    gamepadInvertY: boolean;

    // Touch controls (mobile)
    touchSensitivity: number; // 0-100
    touchButtonSize: 'small' | 'medium' | 'large';
    touchButtonOpacity: number; // 0-100
    touchSwipeGestures: boolean;

    // Control schemes
    battingControlScheme: 'simple' | 'classic' | 'advanced';
    pitchingControlScheme: 'simple' | 'classic' | 'advanced';
    fieldingControlScheme: 'simple' | 'classic' | 'advanced';
}

export interface InterfaceSettings {
    // HUD
    hudScale: number; // 0.5-2.0
    hudOpacity: number; // 0-100
    hudElements: {
        scoreboard: boolean;
        count: boolean;
        bases: boolean;
        powerMeter: boolean;
        playerInfo: boolean;
        minimap: boolean;
        notifications: boolean;
    };

    // UI theme
    uiTheme: 'classic' | 'modern' | 'minimal' | 'retro';
    uiColorScheme: 'default' | 'dark' | 'light' | 'colorblind';
    uiScale: number; // 0.5-2.0

    // Text
    subtitles: boolean;
    subtitleSize: 'small' | 'medium' | 'large';
    subtitleBackground: boolean;
    language: string;

    // Notifications
    notificationDuration: number; // seconds
    notificationPosition: 'top_left' | 'top_center' | 'top_right' | 'bottom_left' | 'bottom_center' | 'bottom_right';
    notificationStyle: 'minimal' | 'default' | 'detailed';

    // Tutorial
    tutorialEnabled: boolean;
    showHints: boolean;
    hintFrequency: 'always' | 'often' | 'sometimes' | 'rarely' | 'never';

    // Replays
    autoReplay: boolean;
    replayHighlights: 'all' | 'important' | 'none';
    replaySpeed: number; // 0.25-2.0

    // Camera
    cameraShake: boolean;
    cameraShakeIntensity: number; // 0-100
    fieldOfView: number; // 60-120
}

export interface NetworkSettings {
    // Online
    onlineMode: boolean;
    autoConnect: boolean;

    // Matchmaking
    preferredRegion: 'auto' | 'na_east' | 'na_west' | 'eu_west' | 'eu_east' | 'asia' | 'oceania' | 'south_america';
    crossPlatformPlay: boolean;
    skillBasedMatchmaking: boolean;

    // Connection
    maxPing: number; // milliseconds
    connectionQuality: 'low' | 'medium' | 'high';
    packetSendRate: number; // Hz

    // Privacy
    showOnlineStatus: boolean;
    allowInvites: boolean;
    allowSpectators: boolean;
    shareGameStats: boolean;

    // Communication
    textChat: boolean;
    voiceChat: boolean;
    allowFriendRequests: boolean;
    chatFilter: 'off' | 'mild' | 'moderate' | 'strict';
}

export interface AccessibilitySettings {
    // Visual
    colorBlindMode: 'off' | 'protanopia' | 'deuteranopia' | 'tritanopia';
    highContrast: boolean;
    textSize: 'small' | 'medium' | 'large' | 'extra_large';
    cursorSize: 'small' | 'medium' | 'large' | 'extra_large';
    screenReader: boolean;

    // Audio
    monoAudio: boolean;
    audioDescriptions: boolean;
    visualSoundIndicators: boolean;

    // Input
    holdToConfirm: boolean;
    holdDuration: number; // milliseconds
    autoAdvanceDialogs: boolean;
    autoAdvanceDelay: number; // seconds
    reduceMotion: boolean;
    simplifiedControls: boolean;

    // Timing
    extendedTimingWindows: boolean;
    timingWindowMultiplier: number; // 1.0-3.0
    pauseOnFocusLoss: boolean;
}

export interface AdvancedSettings {
    // Performance
    threadCount: number; // 0 = auto
    memoryLimit: number; // MB, 0 = unlimited
    cacheBehavior: 'aggressive' | 'moderate' | 'conservative';

    // Debugging
    showFPS: boolean;
    showPerformanceMetrics: boolean;
    showNetworkStats: boolean;
    logLevel: 'none' | 'error' | 'warning' | 'info' | 'debug';

    // Experimental
    enableExperimentalFeatures: boolean;
    betaFeatures: string[];

    // Data
    telemetryEnabled: boolean;
    crashReporting: boolean;
    automaticUpdates: boolean;
}

/**
 * Complete settings configuration
 */
export interface GameSettings {
    graphics: GraphicsSettings;
    audio: AudioSettings;
    gameplay: GameplaySettings;
    controls: ControlSettings;
    interface: InterfaceSettings;
    network: NetworkSettings;
    accessibility: AccessibilitySettings;
    advanced: AdvancedSettings;
}

/**
 * Settings profiles for quick switching
 */
export interface SettingsProfile {
    profileId: string;
    name: string;
    description: string;
    settings: GameSettings;
    isDefault: boolean;
    lastModified: Date;
}

/**
 * Comprehensive Settings System
 */
export class SettingsSystem {
    private currentSettings: GameSettings;
    private defaultSettings: GameSettings;
    private profiles: Map<string, SettingsProfile> = new Map();
    private currentProfile: string = 'default';

    // Settings change callbacks
    private settingsChangeCallbacks: Map<string, ((value: any) => void)[]> = new Map();

    // Dirty flags for settings that need application
    private dirtySettings: Set<string> = new Set();

    constructor() {
        // Initialize default settings
        this.defaultSettings = this.createDefaultSettings();
        this.currentSettings = JSON.parse(JSON.stringify(this.defaultSettings));

        // Create default profile
        this.createProfile('default', 'Default Settings', 'Standard game settings', true);

        // Create preset profiles
        this.createPresetProfiles();
    }

    /**
     * Create default settings
     */
    private createDefaultSettings(): GameSettings {
        return {
            graphics: {
                qualityPreset: 'high',
                resolution: { width: 1920, height: 1080 },
                fullscreen: false,
                vsync: true,
                frameRateLimit: 60,
                renderScale: 1.0,
                antiAliasing: 'fxaa',
                anisotropicFiltering: 8,
                shadowQuality: 'high',
                shadowResolution: 2048,
                shadowDistance: 100,
                bloom: true,
                bloomIntensity: 0.3,
                motionBlur: false,
                motionBlurAmount: 0.5,
                depthOfField: false,
                dofIntensity: 0.5,
                colorGrading: true,
                vignette: true,
                chromaticAberration: false,
                filmGrain: true,
                filmGrainAmount: 0.05,
                particleQuality: 'high',
                maxParticles: 1000,
                grassQuality: 'high',
                crowdDensity: 'medium',
                stadiumDetails: 'high',
                weatherEffects: true,
                weatherParticleDensity: 0.8,
                dynamicResolution: false,
                targetFrameRate: 60
            },
            audio: {
                masterVolume: 80,
                musicVolume: 70,
                sfxVolume: 85,
                ambienceVolume: 60,
                voiceVolume: 80,
                announcerVolume: 75,
                crowdVolume: 70,
                audioQuality: 'high',
                sampleRate: 44100,
                spatialAudio: true,
                reverbQuality: 'medium',
                muteWhenUnfocused: false,
                muteAll: false,
                voiceChatEnabled: true,
                voiceChatVolume: 80,
                pushToTalk: false,
                voiceActivation: true,
                voiceActivationThreshold: 50
            },
            gameplay: {
                difficulty: 'pro',
                adaptiveDifficulty: false,
                difficultyAdjustmentSpeed: 0.5,
                battingAssists: {
                    timingIndicator: true,
                    contactZoneHighlight: true,
                    pitchPrediction: false,
                    swingAnalysis: true
                },
                battingCameraAngle: 'behind_pitcher',
                strikeZoneDisplay: 'after_pitch',
                pitchingAssists: {
                    accuracyGuide: true,
                    powerMeter: true,
                    pitchRecommendation: false,
                    batterAnalysis: true
                },
                pitchingCameraAngle: 'behind_pitcher',
                pitchingInterface: 'meter',
                fieldingAssists: {
                    autoFielderSelection: true,
                    throwingArcs: true,
                    catchRadar: true,
                    autoThrow: false
                },
                fieldingCameraAngle: 'broadcast',
                autoFielding: false,
                baseRunningAssists: {
                    autoAdvance: true,
                    autoReturn: true,
                    leadOffGuide: true,
                    stealingIndicator: true
                },
                baseRunningControl: 'semi_auto',
                gameSpeed: 1.0,
                pitchSpeed: 1.0,
                animationSpeed: 1.0,
                injuries: true,
                fatigue: true,
                weather: true,
                playerMorale: true,
                designatedHitter: true,
                inningCount: 9,
                mercyRule: true,
                mercyRunDifference: 10,
                mercyInning: 5
            },
            controls: {
                primaryInputDevice: 'keyboard',
                keyboardBindings: this.createDefaultKeyboardBindings(),
                mouseSensitivity: 50,
                mouseInvertY: false,
                mouseSmoothing: true,
                gamepadLayout: 'xbox',
                gamepadSensitivity: 50,
                gamepadDeadzone: 10,
                gamepadVibration: true,
                gamepadVibrationStrength: 80,
                gamepadInvertY: false,
                touchSensitivity: 50,
                touchButtonSize: 'medium',
                touchButtonOpacity: 70,
                touchSwipeGestures: true,
                battingControlScheme: 'classic',
                pitchingControlScheme: 'classic',
                fieldingControlScheme: 'classic'
            },
            interface: {
                hudScale: 1.0,
                hudOpacity: 90,
                hudElements: {
                    scoreboard: true,
                    count: true,
                    bases: true,
                    powerMeter: true,
                    playerInfo: true,
                    minimap: false,
                    notifications: true
                },
                uiTheme: 'modern',
                uiColorScheme: 'default',
                uiScale: 1.0,
                subtitles: true,
                subtitleSize: 'medium',
                subtitleBackground: true,
                language: 'en',
                notificationDuration: 3,
                notificationPosition: 'top_center',
                notificationStyle: 'default',
                tutorialEnabled: true,
                showHints: true,
                hintFrequency: 'often',
                autoReplay: true,
                replayHighlights: 'important',
                replaySpeed: 0.5,
                cameraShake: true,
                cameraShakeIntensity: 50,
                fieldOfView: 75
            },
            network: {
                onlineMode: true,
                autoConnect: true,
                preferredRegion: 'auto',
                crossPlatformPlay: true,
                skillBasedMatchmaking: true,
                maxPing: 100,
                connectionQuality: 'high',
                packetSendRate: 60,
                showOnlineStatus: true,
                allowInvites: true,
                allowSpectators: true,
                shareGameStats: true,
                textChat: true,
                voiceChat: true,
                allowFriendRequests: true,
                chatFilter: 'moderate'
            },
            accessibility: {
                colorBlindMode: 'off',
                highContrast: false,
                textSize: 'medium',
                cursorSize: 'medium',
                screenReader: false,
                monoAudio: false,
                audioDescriptions: false,
                visualSoundIndicators: false,
                holdToConfirm: false,
                holdDuration: 500,
                autoAdvanceDialogs: false,
                autoAdvanceDelay: 3,
                reduceMotion: false,
                simplifiedControls: false,
                extendedTimingWindows: false,
                timingWindowMultiplier: 1.0,
                pauseOnFocusLoss: true
            },
            advanced: {
                threadCount: 0,
                memoryLimit: 0,
                cacheBehavior: 'moderate',
                showFPS: false,
                showPerformanceMetrics: false,
                showNetworkStats: false,
                logLevel: 'warning',
                enableExperimentalFeatures: false,
                betaFeatures: [],
                telemetryEnabled: true,
                crashReporting: true,
                automaticUpdates: true
            }
        };
    }

    /**
     * Create default keyboard bindings
     */
    private createDefaultKeyboardBindings(): Map<string, string> {
        const bindings = new Map<string, string>();

        // Batting
        bindings.set('swing', 'Space');
        bindings.set('power_swing', 'Shift');
        bindings.set('bunt', 'B');

        // Pitching
        bindings.set('pitch', 'Space');
        bindings.set('fastball', '1');
        bindings.set('curveball', '2');
        bindings.set('slider', '3');
        bindings.set('changeup', '4');

        // Fielding
        bindings.set('catch', 'Space');
        bindings.set('dive', 'Shift');
        bindings.set('throw_first', '1');
        bindings.set('throw_second', '2');
        bindings.set('throw_third', '3');
        bindings.set('throw_home', '4');

        // Base running
        bindings.set('advance_all', 'Space');
        bindings.set('return_all', 'Backspace');
        bindings.set('steal', 'S');
        bindings.set('slide', 'Shift');

        // Camera
        bindings.set('camera_zoom_in', 'Equal');
        bindings.set('camera_zoom_out', 'Minus');
        bindings.set('camera_rotate_left', 'Q');
        bindings.set('camera_rotate_right', 'E');

        // Menu
        bindings.set('pause', 'Escape');
        bindings.set('menu_up', 'ArrowUp');
        bindings.set('menu_down', 'ArrowDown');
        bindings.set('menu_left', 'ArrowLeft');
        bindings.set('menu_right', 'ArrowRight');
        bindings.set('menu_confirm', 'Enter');
        bindings.set('menu_back', 'Escape');

        return bindings;
    }

    /**
     * Create preset profiles
     */
    private createPresetProfiles(): void {
        // Performance profile
        const performanceSettings = JSON.parse(JSON.stringify(this.defaultSettings));
        performanceSettings.graphics.qualityPreset = 'low';
        performanceSettings.graphics.shadowQuality = 'low';
        performanceSettings.graphics.particleQuality = 'low';
        performanceSettings.graphics.crowdDensity = 'low';
        performanceSettings.graphics.bloom = false;
        performanceSettings.graphics.motionBlur = false;
        performanceSettings.graphics.depthOfField = false;
        performanceSettings.graphics.dynamicResolution = true;

        this.profiles.set('performance', {
            profileId: 'performance',
            name: 'Performance',
            description: 'Optimized for maximum frame rate',
            settings: performanceSettings,
            isDefault: false,
            lastModified: new Date()
        });

        // Quality profile
        const qualitySettings = JSON.parse(JSON.stringify(this.defaultSettings));
        qualitySettings.graphics.qualityPreset = 'ultra';
        qualitySettings.graphics.shadowQuality = 'ultra';
        qualitySettings.graphics.shadowResolution = 4096;
        qualitySettings.graphics.particleQuality = 'high';
        qualitySettings.graphics.crowdDensity = 'high';
        qualitySettings.graphics.grassQuality = 'ultra';
        qualitySettings.graphics.antiAliasing = 'msaa4x';

        this.profiles.set('quality', {
            profileId: 'quality',
            name: 'Maximum Quality',
            description: 'Best visual quality, may impact performance',
            settings: qualitySettings,
            isDefault: false,
            lastModified: new Date()
        });

        // Competitive profile
        const competitiveSettings = JSON.parse(JSON.stringify(this.defaultSettings));
        competitiveSettings.graphics.motionBlur = false;
        competitiveSettings.graphics.depthOfField = false;
        competitiveSettings.graphics.filmGrain = false;
        competitiveSettings.gameplay.battingAssists.timingIndicator = true;
        competitiveSettings.gameplay.pitchingAssists.accuracyGuide = true;
        competitiveSettings.gameplay.adaptiveDifficulty = false;
        competitiveSettings.interface.hudElements.notifications = false;

        this.profiles.set('competitive', {
            profileId: 'competitive',
            name: 'Competitive',
            description: 'Optimized for competitive play',
            settings: competitiveSettings,
            isDefault: false,
            lastModified: new Date()
        });

        // Casual profile
        const casualSettings = JSON.parse(JSON.stringify(this.defaultSettings));
        casualSettings.gameplay.difficulty = 'rookie';
        casualSettings.gameplay.adaptiveDifficulty = true;
        casualSettings.gameplay.battingAssists.pitchPrediction = true;
        casualSettings.gameplay.pitchingAssists.pitchRecommendation = true;
        casualSettings.gameplay.autoFielding = true;
        casualSettings.interface.tutorialEnabled = true;
        casualSettings.interface.showHints = true;

        this.profiles.set('casual', {
            profileId: 'casual',
            name: 'Casual',
            description: 'Easy, relaxed gameplay with maximum assists',
            settings: casualSettings,
            isDefault: false,
            lastModified: new Date()
        });

        // Accessibility profile
        const accessibilitySettings = JSON.parse(JSON.stringify(this.defaultSettings));
        accessibilitySettings.accessibility.highContrast = true;
        accessibilitySettings.accessibility.textSize = 'large';
        accessibilitySettings.accessibility.visualSoundIndicators = true;
        accessibilitySettings.accessibility.extendedTimingWindows = true;
        accessibilitySettings.accessibility.timingWindowMultiplier = 2.0;
        accessibilitySettings.accessibility.simplifiedControls = true;
        accessibilitySettings.gameplay.gameSpeed = 0.75;

        this.profiles.set('accessibility', {
            profileId: 'accessibility',
            name: 'Accessibility',
            description: 'Enhanced accessibility features enabled',
            settings: accessibilitySettings,
            isDefault: false,
            lastModified: new Date()
        });
    }

    /**
     * Get current settings
     */
    public getSettings(): GameSettings {
        return JSON.parse(JSON.stringify(this.currentSettings));
    }

    /**
     * Get specific setting value
     */
    public getSetting(path: string): any {
        const parts = path.split('.');
        let value: any = this.currentSettings;

        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return undefined;
            }
        }

        return value;
    }

    /**
     * Set specific setting value
     */
    public setSetting(path: string, value: any): boolean {
        const parts = path.split('.');
        const lastPart = parts.pop();

        if (!lastPart) return false;

        let obj: any = this.currentSettings;

        for (const part of parts) {
            if (!(part in obj)) {
                console.error(`Invalid settings path: ${path}`);
                return false;
            }
            obj = obj[part];
        }

        if (!(lastPart in obj)) {
            console.error(`Invalid settings path: ${path}`);
            return false;
        }

        // Validate value type matches
        const currentValue = obj[lastPart];
        if (typeof value !== typeof currentValue) {
            console.error(`Type mismatch for ${path}: expected ${typeof currentValue}, got ${typeof value}`);
            return false;
        }

        // Set value
        obj[lastPart] = value;

        // Mark as dirty
        this.dirtySettings.add(path);

        // Trigger callbacks
        this.triggerCallbacks(path, value);

        return true;
    }

    /**
     * Apply graphics preset
     */
    public applyGraphicsPreset(preset: GraphicsSettings['qualityPreset']): void {
        switch (preset) {
            case 'low':
                this.setSetting('graphics.shadowQuality', 'low');
                this.setSetting('graphics.shadowResolution', 1024);
                this.setSetting('graphics.particleQuality', 'low');
                this.setSetting('graphics.grassQuality', 'low');
                this.setSetting('graphics.crowdDensity', 'off');
                this.setSetting('graphics.bloom', false);
                this.setSetting('graphics.motionBlur', false);
                this.setSetting('graphics.depthOfField', false);
                this.setSetting('graphics.antiAliasing', 'none');
                break;

            case 'medium':
                this.setSetting('graphics.shadowQuality', 'medium');
                this.setSetting('graphics.shadowResolution', 1024);
                this.setSetting('graphics.particleQuality', 'medium');
                this.setSetting('graphics.grassQuality', 'medium');
                this.setSetting('graphics.crowdDensity', 'low');
                this.setSetting('graphics.bloom', true);
                this.setSetting('graphics.motionBlur', false);
                this.setSetting('graphics.depthOfField', false);
                this.setSetting('graphics.antiAliasing', 'fxaa');
                break;

            case 'high':
                this.setSetting('graphics.shadowQuality', 'high');
                this.setSetting('graphics.shadowResolution', 2048);
                this.setSetting('graphics.particleQuality', 'high');
                this.setSetting('graphics.grassQuality', 'high');
                this.setSetting('graphics.crowdDensity', 'medium');
                this.setSetting('graphics.bloom', true);
                this.setSetting('graphics.motionBlur', false);
                this.setSetting('graphics.depthOfField', false);
                this.setSetting('graphics.antiAliasing', 'fxaa');
                break;

            case 'ultra':
                this.setSetting('graphics.shadowQuality', 'ultra');
                this.setSetting('graphics.shadowResolution', 4096);
                this.setSetting('graphics.particleQuality', 'high');
                this.setSetting('graphics.grassQuality', 'ultra');
                this.setSetting('graphics.crowdDensity', 'high');
                this.setSetting('graphics.bloom', true);
                this.setSetting('graphics.motionBlur', true);
                this.setSetting('graphics.depthOfField', true);
                this.setSetting('graphics.antiAliasing', 'msaa4x');
                break;
        }

        this.setSetting('graphics.qualityPreset', preset);
    }

    /**
     * Reset to default settings
     */
    public resetToDefaults(): void {
        this.currentSettings = JSON.parse(JSON.stringify(this.defaultSettings));
        this.dirtySettings.clear();

        // Trigger all callbacks
        this.triggerAllCallbacks();
    }

    /**
     * Create new profile
     */
    public createProfile(profileId: string, name: string, description: string, isDefault: boolean = false): SettingsProfile {
        const profile: SettingsProfile = {
            profileId,
            name,
            description,
            settings: JSON.parse(JSON.stringify(this.currentSettings)),
            isDefault,
            lastModified: new Date()
        };

        this.profiles.set(profileId, profile);

        return profile;
    }

    /**
     * Load profile
     */
    public loadProfile(profileId: string): boolean {
        const profile = this.profiles.get(profileId);
        if (!profile) return false;

        this.currentSettings = JSON.parse(JSON.stringify(profile.settings));
        this.currentProfile = profileId;
        this.dirtySettings.clear();

        // Trigger all callbacks
        this.triggerAllCallbacks();

        return true;
    }

    /**
     * Save current settings to profile
     */
    public saveToProfile(profileId: string): boolean {
        const profile = this.profiles.get(profileId);
        if (!profile) return false;

        profile.settings = JSON.parse(JSON.stringify(this.currentSettings));
        profile.lastModified = new Date();

        return true;
    }

    /**
     * Delete profile
     */
    public deleteProfile(profileId: string): boolean {
        const profile = this.profiles.get(profileId);
        if (!profile || profile.isDefault) return false;

        return this.profiles.delete(profileId);
    }

    /**
     * Get all profiles
     */
    public getProfiles(): SettingsProfile[] {
        return Array.from(this.profiles.values());
    }

    /**
     * Get current profile ID
     */
    public getCurrentProfile(): string {
        return this.currentProfile;
    }

    /**
     * Register callback for setting change
     */
    public onSettingChange(path: string, callback: (value: any) => void): void {
        if (!this.settingsChangeCallbacks.has(path)) {
            this.settingsChangeCallbacks.set(path, []);
        }

        this.settingsChangeCallbacks.get(path)!.push(callback);
    }

    /**
     * Trigger callbacks for setting
     */
    private triggerCallbacks(path: string, value: any): void {
        const callbacks = this.settingsChangeCallbacks.get(path);
        if (!callbacks) return;

        for (const callback of callbacks) {
            try {
                callback(value);
            } catch (error) {
                console.error(`Error in settings callback for ${path}:`, error);
            }
        }
    }

    /**
     * Trigger all callbacks (after reset or profile load)
     */
    private triggerAllCallbacks(): void {
        for (const [path, callbacks] of this.settingsChangeCallbacks.entries()) {
            const value = this.getSetting(path);

            for (const callback of callbacks) {
                try {
                    callback(value);
                } catch (error) {
                    console.error(`Error in settings callback for ${path}:`, error);
                }
            }
        }
    }

    /**
     * Get dirty settings (need to be applied)
     */
    public getDirtySettings(): Set<string> {
        return new Set(this.dirtySettings);
    }

    /**
     * Clear dirty flags
     */
    public clearDirtyFlags(): void {
        this.dirtySettings.clear();
    }

    /**
     * Export settings to JSON
     */
    public exportSettings(): string {
        return JSON.stringify(this.currentSettings, null, 2);
    }

    /**
     * Import settings from JSON
     */
    public importSettings(json: string): boolean {
        try {
            const imported = JSON.parse(json);

            // Validate structure (basic check)
            if (!imported.graphics || !imported.audio || !imported.gameplay) {
                throw new Error('Invalid settings structure');
            }

            this.currentSettings = imported;
            this.dirtySettings.clear();
            this.triggerAllCallbacks();

            return true;
        } catch (error) {
            console.error('Failed to import settings:', error);
            return false;
        }
    }

    /**
     * Save settings to local storage
     */
    public saveToStorage(): void {
        try {
            const data = {
                settings: this.currentSettings,
                profile: this.currentProfile,
                profiles: Array.from(this.profiles.entries())
            };

            localStorage.setItem('sandlot_sluggers_settings', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save settings to storage:', error);
        }
    }

    /**
     * Load settings from local storage
     */
    public loadFromStorage(): boolean {
        try {
            const stored = localStorage.getItem('sandlot_sluggers_settings');
            if (!stored) return false;

            const data = JSON.parse(stored);

            if (data.settings) {
                this.currentSettings = data.settings;
            }

            if (data.profile) {
                this.currentProfile = data.profile;
            }

            if (data.profiles) {
                this.profiles = new Map(data.profiles);
            }

            this.dirtySettings.clear();
            this.triggerAllCallbacks();

            return true;
        } catch (error) {
            console.error('Failed to load settings from storage:', error);
            return false;
        }
    }

    /**
     * Dispose settings system
     */
    public dispose(): void {
        this.saveToStorage();
        this.settingsChangeCallbacks.clear();
        this.profiles.clear();
        this.dirtySettings.clear();
    }
}
