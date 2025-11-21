import { Scene, ParticleSystem, Texture, Color3, Color4, Vector3, StandardMaterial, Mesh, HemisphericLight, DirectionalLight } from '@babylonjs/core';

/**
 * Weather conditions that affect gameplay
 */
export enum WeatherCondition {
    CLEAR = 'CLEAR',
    PARTLY_CLOUDY = 'PARTLY_CLOUDY',
    OVERCAST = 'OVERCAST',
    LIGHT_RAIN = 'LIGHT_RAIN',
    HEAVY_RAIN = 'HEAVY_RAIN',
    DRIZZLE = 'DRIZZLE',
    FOG = 'FOG',
    LIGHT_SNOW = 'LIGHT_SNOW',
    HEAVY_SNOW = 'HEAVY_SNOW',
    WINDY = 'WINDY',
    SCORCHING = 'SCORCHING',
    COLD = 'COLD'
}

/**
 * Time of day affecting visibility and gameplay
 */
export enum TimeOfDay {
    DAWN = 'DAWN',
    MORNING = 'MORNING',
    MIDDAY = 'MIDDAY',
    AFTERNOON = 'AFTERNOON',
    DUSK = 'DUSK',
    NIGHT = 'NIGHT'
}

/**
 * Wind configuration affecting ball physics
 */
export interface WindConfig {
    direction: Vector3; // Normalized direction vector
    speed: number; // m/s
    gusts: boolean; // Random variations
    gustStrength: number; // 0-1 multiplier for gusts
    gustFrequency: number; // How often gusts occur (seconds)
}

/**
 * Complete weather state
 */
export interface WeatherState {
    condition: WeatherCondition;
    timeOfDay: TimeOfDay;
    temperature: number; // Celsius
    humidity: number; // 0-100%
    wind: WindConfig;
    visibility: number; // 0-1, affects fog density
    precipitation: number; // 0-1 intensity
}

/**
 * Physics modifiers applied by weather
 */
export interface WeatherPhysicsModifiers {
    airDensityMultiplier: number; // Affects drag
    frictionMultiplier: number; // Affects ball roll/bounce
    windForce: Vector3; // Applied to ball in flight
    visibilityMultiplier: number; // Affects player reaction time
    ballSpinDecayMultiplier: number; // Wet ball loses spin faster
    launchAngleVariance: number; // Weather-induced uncertainty
}

/**
 * Advanced weather system affecting gameplay physics and visuals
 */
export class WeatherSystem {
    private scene: Scene;
    private weatherState: WeatherState;

    // Particle systems for weather effects
    private rainParticles: ParticleSystem | null = null;
    private snowParticles: ParticleSystem | null = null;
    private fogMesh: Mesh | null = null;

    // Lighting components
    private sunLight: DirectionalLight | null = null;
    private ambientLight: HemisphericLight | null = null;

    // Dynamic wind simulation
    private windTimer: number = 0;
    private currentGustMultiplier: number = 1.0;
    private nextGustTime: number = 0;

    // Weather change system
    private weatherChangeTimer: number = 0;
    private weatherChangeDuration: number = 300; // 5 minutes default
    private isTransitioning: boolean = false;
    private transitionProgress: number = 0;
    private targetWeather: WeatherCondition | null = null;

    constructor(scene: Scene, initialCondition: WeatherCondition = WeatherCondition.CLEAR, timeOfDay: TimeOfDay = TimeOfDay.AFTERNOON) {
        this.scene = scene;

        // Initialize weather state
        this.weatherState = this.createDefaultWeatherState(initialCondition, timeOfDay);

        // Setup lighting
        this.setupLighting();

        // Apply initial weather effects
        this.applyWeatherEffects();
    }

    /**
     * Creates default weather state for a given condition
     */
    private createDefaultWeatherState(condition: WeatherCondition, timeOfDay: TimeOfDay): WeatherState {
        const baseState: WeatherState = {
            condition,
            timeOfDay,
            temperature: 22,
            humidity: 50,
            wind: {
                direction: new Vector3(1, 0, 0),
                speed: 3,
                gusts: false,
                gustStrength: 0.3,
                gustFrequency: 8
            },
            visibility: 1.0,
            precipitation: 0
        };

        // Apply condition-specific modifications
        switch (condition) {
            case WeatherCondition.CLEAR:
                baseState.temperature = 25;
                baseState.humidity = 40;
                baseState.wind.speed = 2;
                baseState.visibility = 1.0;
                break;

            case WeatherCondition.PARTLY_CLOUDY:
                baseState.temperature = 23;
                baseState.humidity = 50;
                baseState.wind.speed = 4;
                baseState.visibility = 0.95;
                break;

            case WeatherCondition.OVERCAST:
                baseState.temperature = 20;
                baseState.humidity = 60;
                baseState.wind.speed = 5;
                baseState.visibility = 0.85;
                break;

            case WeatherCondition.LIGHT_RAIN:
                baseState.temperature = 18;
                baseState.humidity = 85;
                baseState.wind.speed = 6;
                baseState.wind.gusts = true;
                baseState.visibility = 0.7;
                baseState.precipitation = 0.3;
                break;

            case WeatherCondition.HEAVY_RAIN:
                baseState.temperature = 16;
                baseState.humidity = 95;
                baseState.wind.speed = 10;
                baseState.wind.gusts = true;
                baseState.wind.gustStrength = 0.5;
                baseState.visibility = 0.5;
                baseState.precipitation = 0.8;
                break;

            case WeatherCondition.DRIZZLE:
                baseState.temperature = 19;
                baseState.humidity = 80;
                baseState.wind.speed = 3;
                baseState.visibility = 0.8;
                baseState.precipitation = 0.15;
                break;

            case WeatherCondition.FOG:
                baseState.temperature = 15;
                baseState.humidity = 95;
                baseState.wind.speed = 1;
                baseState.visibility = 0.4;
                break;

            case WeatherCondition.LIGHT_SNOW:
                baseState.temperature = -2;
                baseState.humidity = 70;
                baseState.wind.speed = 4;
                baseState.visibility = 0.7;
                baseState.precipitation = 0.25;
                break;

            case WeatherCondition.HEAVY_SNOW:
                baseState.temperature = -5;
                baseState.humidity = 80;
                baseState.wind.speed = 8;
                baseState.wind.gusts = true;
                baseState.visibility = 0.5;
                baseState.precipitation = 0.7;
                break;

            case WeatherCondition.WINDY:
                baseState.temperature = 22;
                baseState.humidity = 45;
                baseState.wind.speed = 15;
                baseState.wind.gusts = true;
                baseState.wind.gustStrength = 0.6;
                baseState.wind.gustFrequency = 5;
                baseState.visibility = 0.9;
                break;

            case WeatherCondition.SCORCHING:
                baseState.temperature = 38;
                baseState.humidity = 25;
                baseState.wind.speed = 1;
                baseState.visibility = 0.85; // Heat haze
                break;

            case WeatherCondition.COLD:
                baseState.temperature = 5;
                baseState.humidity = 40;
                baseState.wind.speed = 8;
                baseState.wind.gusts = true;
                baseState.visibility = 0.9;
                break;
        }

        // Apply time of day modifications
        this.applyTimeOfDayModifications(baseState, timeOfDay);

        return baseState;
    }

    /**
     * Modifies weather based on time of day
     */
    private applyTimeOfDayModifications(state: WeatherState, timeOfDay: TimeOfDay): void {
        switch (timeOfDay) {
            case TimeOfDay.DAWN:
                state.temperature -= 3;
                state.humidity += 10;
                state.wind.speed *= 0.7;
                break;

            case TimeOfDay.MORNING:
                state.temperature -= 2;
                state.humidity += 5;
                break;

            case TimeOfDay.MIDDAY:
                state.temperature += 3;
                state.humidity -= 5;
                break;

            case TimeOfDay.AFTERNOON:
                // Base values
                break;

            case TimeOfDay.DUSK:
                state.temperature -= 2;
                state.humidity += 8;
                state.wind.speed *= 0.8;
                break;

            case TimeOfDay.NIGHT:
                state.temperature -= 5;
                state.humidity += 15;
                state.wind.speed *= 0.6;
                state.visibility *= 0.7;
                break;
        }
    }

    /**
     * Setup scene lighting based on time of day
     */
    private setupLighting(): void {
        // Find or create sun light
        this.sunLight = this.scene.lights.find(l => l instanceof DirectionalLight) as DirectionalLight;
        if (!this.sunLight) {
            this.sunLight = new DirectionalLight('sunLight', new Vector3(-1, -2, -1), this.scene);
        }

        // Find or create ambient light
        this.ambientLight = this.scene.lights.find(l => l instanceof HemisphericLight) as HemisphericLight;
        if (!this.ambientLight) {
            this.ambientLight = new HemisphericLight('ambientLight', new Vector3(0, 1, 0), this.scene);
        }

        this.updateLighting();
    }

    /**
     * Update lighting based on weather and time
     */
    private updateLighting(): void {
        if (!this.sunLight || !this.ambientLight) return;

        const { condition, timeOfDay } = this.weatherState;

        // Base intensity by time of day
        let sunIntensity = 1.0;
        let ambientIntensity = 0.4;
        let sunColor = new Color4(1, 0.95, 0.9, 1);
        let ambientColor = new Color4(0.5, 0.6, 0.8, 1);

        switch (timeOfDay) {
            case TimeOfDay.DAWN:
                sunIntensity = 0.4;
                ambientIntensity = 0.2;
                sunColor = new Color4(1, 0.7, 0.5, 1); // Orange dawn
                ambientColor = new Color4(0.4, 0.3, 0.5, 1);
                break;

            case TimeOfDay.MORNING:
                sunIntensity = 0.7;
                ambientIntensity = 0.3;
                sunColor = new Color4(1, 0.9, 0.8, 1);
                break;

            case TimeOfDay.MIDDAY:
                sunIntensity = 1.2;
                ambientIntensity = 0.5;
                sunColor = new Color4(1, 1, 0.95, 1); // Bright white
                break;

            case TimeOfDay.AFTERNOON:
                sunIntensity = 1.0;
                ambientIntensity = 0.4;
                break;

            case TimeOfDay.DUSK:
                sunIntensity = 0.5;
                ambientIntensity = 0.25;
                sunColor = new Color4(1, 0.6, 0.3, 1); // Orange dusk
                ambientColor = new Color4(0.3, 0.2, 0.4, 1);
                break;

            case TimeOfDay.NIGHT:
                sunIntensity = 0.1; // Moonlight
                ambientIntensity = 0.15;
                sunColor = new Color4(0.7, 0.7, 1, 1); // Blue moonlight
                ambientColor = new Color4(0.1, 0.1, 0.2, 1);
                break;
        }

        // Weather modifications
        switch (condition) {
            case WeatherCondition.OVERCAST:
                sunIntensity *= 0.5;
                ambientIntensity *= 1.2;
                break;

            case WeatherCondition.LIGHT_RAIN:
            case WeatherCondition.DRIZZLE:
                sunIntensity *= 0.4;
                ambientIntensity *= 1.3;
                break;

            case WeatherCondition.HEAVY_RAIN:
                sunIntensity *= 0.2;
                ambientIntensity *= 1.5;
                break;

            case WeatherCondition.FOG:
                sunIntensity *= 0.3;
                ambientIntensity *= 1.8;
                break;

            case WeatherCondition.SCORCHING:
                sunIntensity *= 1.3;
                ambientIntensity *= 0.8;
                break;
        }

        this.sunLight.intensity = sunIntensity;
        this.ambientLight.intensity = ambientIntensity;
        this.sunLight.diffuse = new Color3(sunColor.r, sunColor.g, sunColor.b);
        this.ambientLight.diffuse = new Color3(ambientColor.r, ambientColor.g, ambientColor.b);
    }

    /**
     * Apply visual weather effects (particles, fog, etc.)
     */
    private applyWeatherEffects(): void {
        // Clear existing effects
        this.clearWeatherEffects();

        const { condition, precipitation } = this.weatherState;

        switch (condition) {
            case WeatherCondition.LIGHT_RAIN:
            case WeatherCondition.HEAVY_RAIN:
            case WeatherCondition.DRIZZLE:
                this.createRainParticles(precipitation);
                break;

            case WeatherCondition.LIGHT_SNOW:
            case WeatherCondition.HEAVY_SNOW:
                this.createSnowParticles(precipitation);
                break;

            case WeatherCondition.FOG:
                this.createFog();
                break;
        }
    }

    /**
     * Create rain particle system
     */
    private createRainParticles(intensity: number): void {
        this.rainParticles = new ParticleSystem('rain', 2000 * intensity, this.scene);

        // Particle appearance
        this.rainParticles.particleTexture = new Texture('', this.scene);
        this.rainParticles.emitter = new Vector3(0, 30, 0); // High above field
        this.rainParticles.minEmitBox = new Vector3(-100, 0, -100);
        this.rainParticles.maxEmitBox = new Vector3(100, 0, 100);

        // Particle behavior
        this.rainParticles.direction1 = new Vector3(-1, -10, 0);
        this.rainParticles.direction2 = new Vector3(1, -10, 0);
        this.rainParticles.minSize = 0.1;
        this.rainParticles.maxSize = 0.3;
        this.rainParticles.minLifeTime = 0.5;
        this.rainParticles.maxLifeTime = 1.5;
        this.rainParticles.emitRate = 1000 * intensity;
        this.rainParticles.gravity = new Vector3(0, -20, 0);
        this.rainParticles.color1 = new Color4(0.7, 0.7, 1, 0.6);
        this.rainParticles.color2 = new Color4(0.8, 0.8, 1, 0.4);
        this.rainParticles.colorDead = new Color4(0.8, 0.8, 1, 0);

        // Add wind influence
        const wind = this.weatherState.wind;
        this.rainParticles.direction1.x += wind.direction.x * wind.speed * 0.2;
        this.rainParticles.direction2.x += wind.direction.x * wind.speed * 0.2;
        this.rainParticles.direction1.z += wind.direction.z * wind.speed * 0.2;
        this.rainParticles.direction2.z += wind.direction.z * wind.speed * 0.2;

        this.rainParticles.start();
    }

    /**
     * Create snow particle system
     */
    private createSnowParticles(intensity: number): void {
        this.snowParticles = new ParticleSystem('snow', 1500 * intensity, this.scene);

        // Particle appearance
        this.snowParticles.particleTexture = new Texture('', this.scene);
        this.snowParticles.emitter = new Vector3(0, 30, 0);
        this.snowParticles.minEmitBox = new Vector3(-100, 0, -100);
        this.snowParticles.maxEmitBox = new Vector3(100, 0, 100);

        // Particle behavior - slower falling, more drift
        this.snowParticles.direction1 = new Vector3(-1, -2, -0.5);
        this.snowParticles.direction2 = new Vector3(1, -2, 0.5);
        this.snowParticles.minSize = 0.2;
        this.snowParticles.maxSize = 0.8;
        this.snowParticles.minLifeTime = 3;
        this.snowParticles.maxLifeTime = 8;
        this.snowParticles.emitRate = 500 * intensity;
        this.snowParticles.gravity = new Vector3(0, -1, 0); // Gentle fall
        this.snowParticles.color1 = new Color4(1, 1, 1, 0.9);
        this.snowParticles.color2 = new Color4(0.95, 0.95, 1, 0.8);
        this.snowParticles.colorDead = new Color4(1, 1, 1, 0);

        // Add wind drift
        const wind = this.weatherState.wind;
        this.snowParticles.direction1.x += wind.direction.x * wind.speed * 0.3;
        this.snowParticles.direction2.x += wind.direction.x * wind.speed * 0.3;
        this.snowParticles.direction1.z += wind.direction.z * wind.speed * 0.3;
        this.snowParticles.direction2.z += wind.direction.z * wind.speed * 0.3;

        this.snowParticles.start();
    }

    /**
     * Create fog effect
     */
    private createFog(): void {
        const visibility = this.weatherState.visibility;

        // Use Babylon's built-in fog
        this.scene.fogMode = Scene.FOGMODE_EXP2;
        this.scene.fogDensity = (1 - visibility) * 0.05;
        this.scene.fogColor = new Color3(0.8, 0.8, 0.85);
    }

    /**
     * Clear all weather effects
     */
    private clearWeatherEffects(): void {
        if (this.rainParticles) {
            this.rainParticles.dispose();
            this.rainParticles = null;
        }

        if (this.snowParticles) {
            this.snowParticles.dispose();
            this.snowParticles = null;
        }

        if (this.fogMesh) {
            this.fogMesh.dispose();
            this.fogMesh = null;
        }

        // Clear scene fog
        this.scene.fogMode = Scene.FOGMODE_NONE;
    }

    /**
     * Update weather system (call each frame)
     */
    public update(deltaTime: number): void {
        this.updateWind(deltaTime);
        this.updateWeatherTransition(deltaTime);
        this.updateWeatherChange(deltaTime);
    }

    /**
     * Update wind with gust simulation
     */
    private updateWind(deltaTime: number): void {
        if (!this.weatherState.wind.gusts) {
            this.currentGustMultiplier = 1.0;
            return;
        }

        this.windTimer += deltaTime;

        // Check if it's time for a new gust
        if (this.windTimer >= this.nextGustTime) {
            // Generate gust
            const gustStrength = this.weatherState.wind.gustStrength;
            this.currentGustMultiplier = 1.0 + (Math.random() - 0.5) * gustStrength * 2;

            // Schedule next gust
            const frequency = this.weatherState.wind.gustFrequency;
            this.nextGustTime = this.windTimer + frequency * (0.5 + Math.random());
        }

        // Smooth gust transitions
        const targetGust = this.currentGustMultiplier;
        const smoothingFactor = 0.95;
        this.currentGustMultiplier = this.currentGustMultiplier * smoothingFactor + targetGust * (1 - smoothingFactor);
    }

    /**
     * Update weather transition animation
     */
    private updateWeatherTransition(deltaTime: number): void {
        if (!this.isTransitioning || !this.targetWeather) return;

        this.transitionProgress += deltaTime / 30; // 30 second transition

        if (this.transitionProgress >= 1.0) {
            // Complete transition
            this.weatherState.condition = this.targetWeather;
            this.isTransitioning = false;
            this.transitionProgress = 0;
            this.targetWeather = null;

            // Apply new weather effects
            this.applyWeatherEffects();
            this.updateLighting();
        }
    }

    /**
     * Automatic weather changes over time
     */
    private updateWeatherChange(deltaTime: number): void {
        this.weatherChangeTimer += deltaTime;

        if (this.weatherChangeTimer >= this.weatherChangeDuration && !this.isTransitioning) {
            this.changeWeatherRandomly();
            this.weatherChangeTimer = 0;
        }
    }

    /**
     * Change to random weather condition
     */
    private changeWeatherRandomly(): void {
        const conditions = Object.values(WeatherCondition);
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

        if (randomCondition !== this.weatherState.condition) {
            this.changeWeather(randomCondition);
        }
    }

    /**
     * Change weather condition with smooth transition
     */
    public changeWeather(newCondition: WeatherCondition): void {
        if (this.isTransitioning) return;

        this.targetWeather = newCondition;
        this.isTransitioning = true;
        this.transitionProgress = 0;
    }

    /**
     * Change time of day
     */
    public changeTimeOfDay(newTime: TimeOfDay): void {
        this.weatherState.timeOfDay = newTime;
        const currentCondition = this.weatherState.condition;
        this.weatherState = this.createDefaultWeatherState(currentCondition, newTime);
        this.updateLighting();
        this.applyWeatherEffects();
    }

    /**
     * Get physics modifiers for current weather
     */
    public getPhysicsModifiers(): WeatherPhysicsModifiers {
        const { condition, temperature, humidity, wind, precipitation } = this.weatherState;

        // Base modifiers
        let airDensityMultiplier = 1.0;
        let frictionMultiplier = 1.0;
        let windForce = wind.direction.scale(wind.speed * this.currentGustMultiplier);
        let visibilityMultiplier = this.weatherState.visibility;
        let ballSpinDecayMultiplier = 1.0;
        let launchAngleVariance = 0;

        // Temperature affects air density
        // Cold air is denser (more drag), hot air is less dense (less drag)
        const tempFactor = (temperature - 20) / 20; // Normalized around 20°C
        airDensityMultiplier = 1.0 - tempFactor * 0.1;

        // Humidity affects air density slightly
        const humidityFactor = humidity / 100;
        airDensityMultiplier += humidityFactor * 0.05;

        // Weather-specific modifiers
        switch (condition) {
            case WeatherCondition.LIGHT_RAIN:
            case WeatherCondition.DRIZZLE:
                frictionMultiplier = 0.85; // Wet ground, less friction
                ballSpinDecayMultiplier = 1.3; // Wet ball loses spin faster
                launchAngleVariance = 2; // Slightly less predictable
                break;

            case WeatherCondition.HEAVY_RAIN:
                airDensityMultiplier *= 1.1; // Rain adds drag
                frictionMultiplier = 0.7;
                ballSpinDecayMultiplier = 1.6;
                launchAngleVariance = 5;
                break;

            case WeatherCondition.LIGHT_SNOW:
                frictionMultiplier = 0.75;
                ballSpinDecayMultiplier = 1.2;
                launchAngleVariance = 3;
                break;

            case WeatherCondition.HEAVY_SNOW:
                airDensityMultiplier *= 1.15;
                frictionMultiplier = 0.6;
                ballSpinDecayMultiplier = 1.5;
                launchAngleVariance = 6;
                break;

            case WeatherCondition.FOG:
                visibilityMultiplier *= 0.6; // Major visibility impact
                break;

            case WeatherCondition.WINDY:
                launchAngleVariance = 4;
                break;

            case WeatherCondition.SCORCHING:
                airDensityMultiplier *= 0.85; // Thin hot air, ball travels farther
                frictionMultiplier = 1.1; // Dry hard ground
                break;

            case WeatherCondition.COLD:
                airDensityMultiplier *= 1.1; // Dense cold air
                frictionMultiplier = 1.05;
                break;
        }

        return {
            airDensityMultiplier,
            frictionMultiplier,
            windForce,
            visibilityMultiplier,
            ballSpinDecayMultiplier,
            launchAngleVariance
        };
    }

    /**
     * Get current weather state
     */
    public getWeatherState(): WeatherState {
        return { ...this.weatherState };
    }

    /**
     * Set weather change interval
     */
    public setWeatherChangeDuration(seconds: number): void {
        this.weatherChangeDuration = seconds;
    }

    /**
     * Dispose weather system
     */
    public dispose(): void {
        this.clearWeatherEffects();
    }
}
