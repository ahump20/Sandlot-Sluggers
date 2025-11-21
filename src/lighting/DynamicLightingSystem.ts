import { Scene, Light, HemisphericLight, DirectionalLight, PointLight, SpotLight, ShadowGenerator, Vector3, Color3, Animation, AnimationGroup, Observable, Mesh, CascadedShadowGenerator, AbstractMesh } from '@babylonjs/core';

/**
 * Time of day
 */
export enum TimeOfDay {
    DAWN = 'dawn',          // 5-7 AM
    MORNING = 'morning',    // 7-10 AM
    NOON = 'noon',          // 10 AM-2 PM
    AFTERNOON = 'afternoon', // 2-5 PM
    DUSK = 'dusk',          // 5-7 PM
    EVENING = 'evening',    // 7-9 PM
    NIGHT = 'night'         // 9 PM-5 AM
}

/**
 * Weather lighting preset
 */
export enum WeatherLighting {
    CLEAR = 'clear',
    CLOUDY = 'cloudy',
    OVERCAST = 'overcast',
    RAINY = 'rainy',
    STORMY = 'stormy',
    FOGGY = 'foggy',
    SNOWY = 'snowy'
}

/**
 * Light configuration
 */
export interface LightConfig {
    name: string;
    type: 'hemispheric' | 'directional' | 'point' | 'spot';
    position?: Vector3;
    direction?: Vector3;
    intensity: number;
    color: Color3;
    enabled?: boolean;
    shadowsEnabled?: boolean;
    shadowMapSize?: number;
    shadowQuality?: 'low' | 'medium' | 'high' | 'ultra';
}

/**
 * Lighting preset
 */
export interface LightingPreset {
    name: string;
    timeOfDay: TimeOfDay;
    weather: WeatherLighting;
    sunPosition: Vector3;
    sunColor: Color3;
    sunIntensity: number;
    ambientColor: Color3;
    ambientIntensity: number;
    fogColor: Color3;
    fogDensity: number;
    fogStart: number;
    fogEnd: number;
    shadowDarkness: number;
    lightShaftsIntensity?: number;
    godraysIntensity?: number;
}

/**
 * Stadium light configuration
 */
export interface StadiumLight {
    id: string;
    mesh?: AbstractMesh;
    light: PointLight | SpotLight;
    position: Vector3;
    intensity: number;
    range: number;
    color: Color3;
    flickerEnabled?: boolean;
    flickerSpeed?: number;
    flickerIntensity?: number;
}

/**
 * Light animation
 */
export interface LightAnimation {
    id: string;
    light: Light;
    property: 'intensity' | 'color' | 'position' | 'direction';
    startValue: any;
    endValue: any;
    duration: number;
    loop?: boolean;
    animationGroup?: AnimationGroup;
}

/**
 * Dynamic Lighting System
 * Comprehensive lighting management with time of day and weather
 */
export class DynamicLightingSystem {
    private scene: Scene;

    // Main lights
    private sunLight?: DirectionalLight;
    private ambientLight?: HemisphericLight;
    private moonLight?: DirectionalLight;

    // Stadium lights
    private stadiumLights: Map<string, StadiumLight> = new Map();
    private stadiumLightPoles: AbstractMesh[] = [];

    // Shadow generators
    private sunShadowGenerator?: CascadedShadowGenerator | ShadowGenerator;
    private shadowCasters: Set<AbstractMesh> = new Set();

    // Lighting presets
    private presets: Map<string, LightingPreset> = new Map();
    private currentPreset?: LightingPreset;

    // Time of day
    private currentTime: number = 12; // 24-hour format
    private timeSpeed: number = 0; // 0 = paused, 1 = real-time, higher = faster
    private autoTimeOfDay: boolean = false;

    // Active animations
    private activeAnimations: Map<string, LightAnimation> = new Map();
    private animationIdCounter: number = 0;

    // Dynamic effects
    private lightningEnabled: boolean = false;
    private lightningIntensity: number = 1.0;
    private lightningFrequency: number = 0.1; // 0-1
    private lastLightningTime: number = 0;

    // Settings
    private shadowsEnabled: boolean = true;
    private dynamicShadows: boolean = true;
    private shadowQuality: 'low' | 'medium' | 'high' | 'ultra' = 'medium';
    private volumetricLighting: boolean = false;

    // Observables
    private onTimeOfDayChangedObservable: Observable<TimeOfDay> = new Observable();
    private onLightningStrikeObservable: Observable<void> = new Observable();

    constructor(scene: Scene) {
        this.scene = scene;
        this.initializePresets();
        this.createMainLights();
        this.applyPreset(TimeOfDay.AFTERNOON, WeatherLighting.CLEAR);
    }

    /**
     * Initialize lighting presets
     */
    private initializePresets(): void {
        // Dawn - Clear
        this.presets.set('dawn_clear', {
            name: 'Dawn Clear',
            timeOfDay: TimeOfDay.DAWN,
            weather: WeatherLighting.CLEAR,
            sunPosition: new Vector3(-50, 10, 0),
            sunColor: new Color3(1, 0.8, 0.6),
            sunIntensity: 0.6,
            ambientColor: new Color3(0.5, 0.6, 0.8),
            ambientIntensity: 0.4,
            fogColor: new Color3(0.8, 0.7, 0.6),
            fogDensity: 0.01,
            fogStart: 50,
            fogEnd: 300,
            shadowDarkness: 0.3
        });

        // Morning - Clear
        this.presets.set('morning_clear', {
            name: 'Morning Clear',
            timeOfDay: TimeOfDay.MORNING,
            weather: WeatherLighting.CLEAR,
            sunPosition: new Vector3(-30, 30, 0),
            sunColor: new Color3(1, 0.95, 0.8),
            sunIntensity: 0.9,
            ambientColor: new Color3(0.6, 0.7, 0.9),
            ambientIntensity: 0.5,
            fogColor: new Color3(0.9, 0.9, 0.95),
            fogDensity: 0.005,
            fogStart: 100,
            fogEnd: 500,
            shadowDarkness: 0.4
        });

        // Noon - Clear
        this.presets.set('noon_clear', {
            name: 'Noon Clear',
            timeOfDay: TimeOfDay.NOON,
            weather: WeatherLighting.CLEAR,
            sunPosition: new Vector3(0, 50, 0),
            sunColor: new Color3(1, 1, 0.95),
            sunIntensity: 1.2,
            ambientColor: new Color3(0.7, 0.8, 1),
            ambientIntensity: 0.6,
            fogColor: new Color3(0.95, 0.95, 1),
            fogDensity: 0.002,
            fogStart: 150,
            fogEnd: 800,
            shadowDarkness: 0.5,
            lightShaftsIntensity: 0.3
        });

        // Afternoon - Clear
        this.presets.set('afternoon_clear', {
            name: 'Afternoon Clear',
            timeOfDay: TimeOfDay.AFTERNOON,
            weather: WeatherLighting.CLEAR,
            sunPosition: new Vector3(30, 35, 0),
            sunColor: new Color3(1, 0.95, 0.85),
            sunIntensity: 1.0,
            ambientColor: new Color3(0.65, 0.75, 0.95),
            ambientIntensity: 0.55,
            fogColor: new Color3(0.9, 0.9, 0.95),
            fogDensity: 0.003,
            fogStart: 100,
            fogEnd: 600,
            shadowDarkness: 0.45
        });

        // Dusk - Clear
        this.presets.set('dusk_clear', {
            name: 'Dusk Clear',
            timeOfDay: TimeOfDay.DUSK,
            weather: WeatherLighting.CLEAR,
            sunPosition: new Vector3(50, 5, 0),
            sunColor: new Color3(1, 0.6, 0.3),
            sunIntensity: 0.5,
            ambientColor: new Color3(0.4, 0.5, 0.7),
            ambientIntensity: 0.3,
            fogColor: new Color3(0.7, 0.5, 0.4),
            fogDensity: 0.015,
            fogStart: 30,
            fogEnd: 200,
            shadowDarkness: 0.6,
            godraysIntensity: 0.5
        });

        // Evening - Clear
        this.presets.set('evening_clear', {
            name: 'Evening Clear',
            timeOfDay: TimeOfDay.EVENING,
            weather: WeatherLighting.CLEAR,
            sunPosition: new Vector3(50, -5, 0),
            sunColor: new Color3(0.3, 0.3, 0.5),
            sunIntensity: 0.2,
            ambientColor: new Color3(0.2, 0.3, 0.5),
            ambientIntensity: 0.2,
            fogColor: new Color3(0.3, 0.3, 0.4),
            fogDensity: 0.02,
            fogStart: 20,
            fogEnd: 150,
            shadowDarkness: 0.7
        });

        // Night - Clear
        this.presets.set('night_clear', {
            name: 'Night Clear',
            timeOfDay: TimeOfDay.NIGHT,
            weather: WeatherLighting.CLEAR,
            sunPosition: new Vector3(0, -50, 0),
            sunColor: new Color3(0.1, 0.1, 0.2),
            sunIntensity: 0.05,
            ambientColor: new Color3(0.05, 0.05, 0.15),
            ambientIntensity: 0.1,
            fogColor: new Color3(0.1, 0.1, 0.2),
            fogDensity: 0.025,
            fogStart: 10,
            fogEnd: 100,
            shadowDarkness: 0.9
        });

        // Cloudy presets
        this.presets.set('noon_cloudy', {
            name: 'Noon Cloudy',
            timeOfDay: TimeOfDay.NOON,
            weather: WeatherLighting.CLOUDY,
            sunPosition: new Vector3(0, 50, 0),
            sunColor: new Color3(0.9, 0.9, 0.9),
            sunIntensity: 0.8,
            ambientColor: new Color3(0.6, 0.6, 0.7),
            ambientIntensity: 0.5,
            fogColor: new Color3(0.8, 0.8, 0.85),
            fogDensity: 0.01,
            fogStart: 100,
            fogEnd: 400,
            shadowDarkness: 0.3
        });

        // Overcast presets
        this.presets.set('noon_overcast', {
            name: 'Noon Overcast',
            timeOfDay: TimeOfDay.NOON,
            weather: WeatherLighting.OVERCAST,
            sunPosition: new Vector3(0, 50, 0),
            sunColor: new Color3(0.7, 0.7, 0.7),
            sunIntensity: 0.5,
            ambientColor: new Color3(0.5, 0.5, 0.6),
            ambientIntensity: 0.4,
            fogColor: new Color3(0.6, 0.6, 0.65),
            fogDensity: 0.02,
            fogStart: 50,
            fogEnd: 250,
            shadowDarkness: 0.2
        });

        // Rainy presets
        this.presets.set('noon_rainy', {
            name: 'Noon Rainy',
            timeOfDay: TimeOfDay.NOON,
            weather: WeatherLighting.RAINY,
            sunPosition: new Vector3(0, 50, 0),
            sunColor: new Color3(0.6, 0.6, 0.65),
            sunIntensity: 0.4,
            ambientColor: new Color3(0.4, 0.4, 0.5),
            ambientIntensity: 0.3,
            fogColor: new Color3(0.5, 0.5, 0.55),
            fogDensity: 0.03,
            fogStart: 30,
            fogEnd: 200,
            shadowDarkness: 0.15
        });

        // Stormy presets
        this.presets.set('noon_stormy', {
            name: 'Noon Stormy',
            timeOfDay: TimeOfDay.NOON,
            weather: WeatherLighting.STORMY,
            sunPosition: new Vector3(0, 50, 0),
            sunColor: new Color3(0.4, 0.4, 0.5),
            sunIntensity: 0.3,
            ambientColor: new Color3(0.3, 0.3, 0.4),
            ambientIntensity: 0.2,
            fogColor: new Color3(0.3, 0.3, 0.35),
            fogDensity: 0.04,
            fogStart: 20,
            fogEnd: 150,
            shadowDarkness: 0.1
        });

        // Snowy presets
        this.presets.set('noon_snowy', {
            name: 'Noon Snowy',
            timeOfDay: TimeOfDay.NOON,
            weather: WeatherLighting.SNOWY,
            sunPosition: new Vector3(0, 50, 0),
            sunColor: new Color3(0.9, 0.9, 1),
            sunIntensity: 0.7,
            ambientColor: new Color3(0.8, 0.8, 0.9),
            ambientIntensity: 0.6,
            fogColor: new Color3(0.9, 0.9, 0.95),
            fogDensity: 0.015,
            fogStart: 50,
            fogEnd: 300,
            shadowDarkness: 0.25
        });

        // Foggy presets
        this.presets.set('morning_foggy', {
            name: 'Morning Foggy',
            timeOfDay: TimeOfDay.MORNING,
            weather: WeatherLighting.FOGGY,
            sunPosition: new Vector3(-30, 30, 0),
            sunColor: new Color3(0.8, 0.8, 0.85),
            sunIntensity: 0.5,
            ambientColor: new Color3(0.6, 0.6, 0.7),
            ambientIntensity: 0.4,
            fogColor: new Color3(0.7, 0.7, 0.75),
            fogDensity: 0.05,
            fogStart: 10,
            fogEnd: 100,
            shadowDarkness: 0.1
        });
    }

    /**
     * Create main lights
     */
    private createMainLights(): void {
        // Sun (directional light)
        this.sunLight = new DirectionalLight('sunLight', new Vector3(0, -1, 0), this.scene);
        this.sunLight.position = new Vector3(0, 50, 0);
        this.sunLight.intensity = 1.0;
        this.sunLight.diffuse = new Color3(1, 1, 0.95);
        this.sunLight.specular = new Color3(1, 1, 0.95);

        // Ambient light
        this.ambientLight = new HemisphericLight('ambientLight', new Vector3(0, 1, 0), this.scene);
        this.ambientLight.intensity = 0.5;
        this.ambientLight.diffuse = new Color3(0.7, 0.8, 1);
        this.ambientLight.groundColor = new Color3(0.3, 0.4, 0.5);

        // Moon light (for night time)
        this.moonLight = new DirectionalLight('moonLight', new Vector3(0, -1, 0), this.scene);
        this.moonLight.position = new Vector3(0, 50, 0);
        this.moonLight.intensity = 0.1;
        this.moonLight.diffuse = new Color3(0.5, 0.6, 0.8);
        this.moonLight.setEnabled(false);

        // Setup shadows
        if (this.shadowsEnabled) {
            this.setupShadows();
        }
    }

    /**
     * Setup shadow system
     */
    private setupShadows(): void {
        if (!this.sunLight) return;

        // Use cascaded shadows for better quality
        if (this.shadowQuality === 'high' || this.shadowQuality === 'ultra') {
            const cascadedGenerator = new CascadedShadowGenerator(2048, this.sunLight);
            cascadedGenerator.numCascades = this.shadowQuality === 'ultra' ? 4 : 3;
            cascadedGenerator.shadowMaxZ = 200;
            cascadedGenerator.stabilizeCascades = true;
            cascadedGenerator.lambda = 0.9;
            this.sunShadowGenerator = cascadedGenerator;
        } else {
            const mapSize = this.shadowQuality === 'medium' ? 1024 : 512;
            this.sunShadowGenerator = new ShadowGenerator(mapSize, this.sunLight);
        }

        // Shadow settings
        this.sunShadowGenerator.useBlurExponentialShadowMap = true;
        this.sunShadowGenerator.blurKernel = 32;
        this.sunShadowGenerator.depthScale = 100;

        // Apply to existing shadow casters
        for (const mesh of this.shadowCasters) {
            this.sunShadowGenerator.addShadowCaster(mesh);
        }
    }

    /**
     * Create stadium lights
     */
    public createStadiumLights(fieldCenter: Vector3, stadiumSize: number = 100): void {
        const lightHeight = 30;
        const lightDistance = stadiumSize * 0.7;
        const lightIntensity = 50;
        const lightRange = 100;

        // Four corner lights
        const positions = [
            new Vector3(-lightDistance, lightHeight, -lightDistance),
            new Vector3(lightDistance, lightHeight, -lightDistance),
            new Vector3(-lightDistance, lightHeight, lightDistance),
            new Vector3(lightDistance, lightHeight, lightDistance)
        ];

        positions.forEach((pos, index) => {
            const id = `stadium_light_${index}`;
            const position = fieldCenter.add(pos);

            // Create spotlight
            const light = new SpotLight(
                id,
                position,
                fieldCenter.subtract(position).normalize(),
                Math.PI / 3,
                2,
                this.scene
            );

            light.intensity = lightIntensity;
            light.range = lightRange;
            light.diffuse = new Color3(1, 1, 0.95);
            light.specular = new Color3(1, 1, 0.95);

            // Initially disabled (daytime)
            light.setEnabled(false);

            const stadiumLight: StadiumLight = {
                id,
                light,
                position,
                intensity: lightIntensity,
                range: lightRange,
                color: new Color3(1, 1, 0.95)
            };

            this.stadiumLights.set(id, stadiumLight);
        });
    }

    /**
     * Apply lighting preset
     */
    public applyPreset(timeOfDay: TimeOfDay, weather: WeatherLighting): void {
        const presetKey = `${timeOfDay}_${weather}`;
        let preset = this.presets.get(presetKey);

        // Fallback to clear weather if specific combo doesn't exist
        if (!preset) {
            preset = this.presets.get(`${timeOfDay}_clear`);
        }

        if (!preset) {
            console.warn(`No preset found for ${timeOfDay} ${weather}`);
            return;
        }

        this.currentPreset = preset;

        // Apply sun settings
        if (this.sunLight) {
            this.sunLight.direction = preset.sunPosition.normalize().scale(-1);
            this.sunLight.position = preset.sunPosition;
            this.sunLight.intensity = preset.sunIntensity;
            this.sunLight.diffuse = preset.sunColor.clone();
            this.sunLight.specular = preset.sunColor.clone();
        }

        // Apply ambient settings
        if (this.ambientLight) {
            this.ambientLight.intensity = preset.ambientIntensity;
            this.ambientLight.diffuse = preset.ambientColor.clone();
        }

        // Apply fog
        this.scene.fogMode = Scene.FOGMODE_EXP2;
        this.scene.fogColor = preset.fogColor;
        this.scene.fogDensity = preset.fogDensity;

        // Enable/disable moon light for night
        if (this.moonLight) {
            this.moonLight.setEnabled(timeOfDay === TimeOfDay.NIGHT || timeOfDay === TimeOfDay.EVENING);
        }

        // Enable/disable stadium lights
        const needsStadiumLights =
            timeOfDay === TimeOfDay.EVENING ||
            timeOfDay === TimeOfDay.NIGHT ||
            timeOfDay === TimeOfDay.DUSK;

        this.setStadiumLightsEnabled(needsStadiumLights);

        // Update shadow darkness
        if (this.sunShadowGenerator) {
            this.sunShadowGenerator.darkness = preset.shadowDarkness;
        }

        // Notify observers
        this.onTimeOfDayChangedObservable.notifyObservers(timeOfDay);
    }

    /**
     * Set stadium lights enabled/disabled
     */
    public setStadiumLightsEnabled(enabled: boolean): void {
        for (const stadiumLight of this.stadiumLights.values()) {
            stadiumLight.light.setEnabled(enabled);
        }
    }

    /**
     * Animate transition to new lighting
     */
    public async transitionToPreset(
        timeOfDay: TimeOfDay,
        weather: WeatherLighting,
        duration: number = 2000
    ): Promise<void> {
        const targetPresetKey = `${timeOfDay}_${weather}`;
        let targetPreset = this.presets.get(targetPresetKey);

        if (!targetPreset) {
            targetPreset = this.presets.get(`${timeOfDay}_clear`);
        }

        if (!targetPreset || !this.sunLight || !this.ambientLight) {
            return;
        }

        // Store current values
        const startSunIntensity = this.sunLight.intensity;
        const startSunColor = this.sunLight.diffuse.clone();
        const startAmbientIntensity = this.ambientLight.intensity;
        const startAmbientColor = this.ambientLight.diffuse.clone();
        const startFogDensity = this.scene.fogDensity;

        // Animate over duration
        const startTime = Date.now();

        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Smooth easing
                const eased = this.easeInOutCubic(progress);

                // Interpolate sun
                if (this.sunLight) {
                    this.sunLight.intensity = this.lerp(startSunIntensity, targetPreset.sunIntensity, eased);
                    this.sunLight.diffuse = Color3.Lerp(startSunColor, targetPreset.sunColor, eased);
                    this.sunLight.specular = this.sunLight.diffuse.clone();

                    // Interpolate direction
                    const targetDir = targetPreset.sunPosition.normalize().scale(-1);
                    const currentDir = this.sunLight.direction;
                    this.sunLight.direction = Vector3.Lerp(currentDir, targetDir, eased);
                }

                // Interpolate ambient
                if (this.ambientLight) {
                    this.ambientLight.intensity = this.lerp(startAmbientIntensity, targetPreset.ambientIntensity, eased);
                    this.ambientLight.diffuse = Color3.Lerp(startAmbientColor, targetPreset.ambientColor, eased);
                }

                // Interpolate fog
                this.scene.fogDensity = this.lerp(startFogDensity, targetPreset.fogDensity, eased);
                this.scene.fogColor = Color3.Lerp(this.scene.fogColor, targetPreset.fogColor, eased);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.applyPreset(timeOfDay, weather);
                    resolve();
                }
            };

            animate();
        });
    }

    /**
     * Add shadow caster
     */
    public addShadowCaster(mesh: AbstractMesh): void {
        this.shadowCasters.add(mesh);

        if (this.sunShadowGenerator) {
            this.sunShadowGenerator.addShadowCaster(mesh);
        }
    }

    /**
     * Remove shadow caster
     */
    public removeShadowCaster(mesh: AbstractMesh): void {
        this.shadowCasters.delete(mesh);

        if (this.sunShadowGenerator) {
            this.sunShadowGenerator.removeShadowCaster(mesh);
        }
    }

    /**
     * Trigger lightning strike
     */
    public triggerLightning(): void {
        if (!this.ambientLight) return;

        // Store original values
        const originalIntensity = this.ambientLight.intensity;
        const flashIntensity = originalIntensity * (3 + this.lightningIntensity);

        // Flash bright
        this.ambientLight.intensity = flashIntensity;

        // Return to normal
        setTimeout(() => {
            if (this.ambientLight) {
                this.ambientLight.intensity = originalIntensity;
            }
        }, 100);

        // Second flash (optional)
        setTimeout(() => {
            if (this.ambientLight) {
                this.ambientLight.intensity = flashIntensity * 0.7;
            }
        }, 200);

        setTimeout(() => {
            if (this.ambientLight) {
                this.ambientLight.intensity = originalIntensity;
            }
        }, 250);

        this.lastLightningTime = Date.now();
        this.onLightningStrikeObservable.notifyObservers();
    }

    /**
     * Update system
     */
    public update(deltaTime: number): void {
        // Auto time of day progression
        if (this.autoTimeOfDay && this.timeSpeed > 0) {
            this.currentTime += (deltaTime / 1000) * (this.timeSpeed / 3600);
            if (this.currentTime >= 24) {
                this.currentTime -= 24;
            }

            const timeOfDay = this.getTimeOfDayFromHour(this.currentTime);
            if (this.currentPreset && timeOfDay !== this.currentPreset.timeOfDay) {
                this.applyPreset(timeOfDay, this.currentPreset.weather);
            }
        }

        // Random lightning for stormy weather
        if (this.lightningEnabled && this.currentPreset?.weather === WeatherLighting.STORMY) {
            const timeSinceLightning = Date.now() - this.lastLightningTime;
            if (timeSinceLightning > 5000) { // Min 5 seconds between strikes
                if (Math.random() < this.lightningFrequency * deltaTime / 1000) {
                    this.triggerLightning();
                }
            }
        }

        // Update flickering stadium lights
        for (const stadiumLight of this.stadiumLights.values()) {
            if (stadiumLight.flickerEnabled && stadiumLight.light.isEnabled()) {
                const flicker = Math.sin(Date.now() * (stadiumLight.flickerSpeed || 0.01)) *
                               (stadiumLight.flickerIntensity || 0.1);
                stadiumLight.light.intensity = stadiumLight.intensity * (1 + flicker);
            }
        }
    }

    /**
     * Get time of day from hour
     */
    private getTimeOfDayFromHour(hour: number): TimeOfDay {
        if (hour >= 5 && hour < 7) return TimeOfDay.DAWN;
        if (hour >= 7 && hour < 10) return TimeOfDay.MORNING;
        if (hour >= 10 && hour < 14) return TimeOfDay.NOON;
        if (hour >= 14 && hour < 17) return TimeOfDay.AFTERNOON;
        if (hour >= 17 && hour < 19) return TimeOfDay.DUSK;
        if (hour >= 19 && hour < 21) return TimeOfDay.EVENING;
        return TimeOfDay.NIGHT;
    }

    /**
     * Set current time
     */
    public setTime(hour: number): void {
        this.currentTime = Math.max(0, Math.min(24, hour));
        const timeOfDay = this.getTimeOfDayFromHour(this.currentTime);

        if (this.currentPreset) {
            this.applyPreset(timeOfDay, this.currentPreset.weather);
        }
    }

    /**
     * Enable auto time progression
     */
    public setAutoTimeOfDay(enabled: boolean, speed: number = 1): void {
        this.autoTimeOfDay = enabled;
        this.timeSpeed = speed;
    }

    /**
     * Enable lightning
     */
    public setLightningEnabled(enabled: boolean, frequency: number = 0.1, intensity: number = 1.0): void {
        this.lightningEnabled = enabled;
        this.lightningFrequency = Math.max(0, Math.min(1, frequency));
        this.lightningIntensity = Math.max(0, Math.min(2, intensity));
    }

    /**
     * Set shadow quality
     */
    public setShadowQuality(quality: 'low' | 'medium' | 'high' | 'ultra'): void {
        this.shadowQuality = quality;

        // Recreate shadows
        if (this.sunShadowGenerator) {
            this.sunShadowGenerator.dispose();
        }

        this.setupShadows();
    }

    /**
     * Enable/disable shadows
     */
    public setShadowsEnabled(enabled: boolean): void {
        this.shadowsEnabled = enabled;

        if (enabled && !this.sunShadowGenerator) {
            this.setupShadows();
        } else if (!enabled && this.sunShadowGenerator) {
            this.sunShadowGenerator.dispose();
            this.sunShadowGenerator = undefined;
        }
    }

    /**
     * Get current sun position
     */
    public getSunPosition(): Vector3 {
        return this.sunLight ? this.sunLight.position.clone() : Vector3.Zero();
    }

    /**
     * Get current sun direction
     */
    public getSunDirection(): Vector3 {
        return this.sunLight ? this.sunLight.direction.clone() : Vector3.Down();
    }

    /**
     * Subscribe to time of day changes
     */
    public onTimeOfDayChanged(callback: (timeOfDay: TimeOfDay) => void): void {
        this.onTimeOfDayChangedObservable.add(callback);
    }

    /**
     * Subscribe to lightning strikes
     */
    public onLightningStrike(callback: () => void): void {
        this.onLightningStrikeObservable.add(callback);
    }

    /**
     * Linear interpolation
     */
    private lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    /**
     * Ease in-out cubic
     */
    private easeInOutCubic(t: number): number {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        if (this.sunLight) {
            this.sunLight.dispose();
        }

        if (this.ambientLight) {
            this.ambientLight.dispose();
        }

        if (this.moonLight) {
            this.moonLight.dispose();
        }

        if (this.sunShadowGenerator) {
            this.sunShadowGenerator.dispose();
        }

        for (const stadiumLight of this.stadiumLights.values()) {
            stadiumLight.light.dispose();
        }

        this.stadiumLights.clear();
        this.shadowCasters.clear();

        this.onTimeOfDayChangedObservable.clear();
        this.onLightningStrikeObservable.clear();
    }
}
