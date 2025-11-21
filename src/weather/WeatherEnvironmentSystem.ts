/**
 * WeatherEnvironmentSystem.ts
 * Dynamic weather and environmental effects that impact gameplay
 */

import { Vector2 } from '../PhysicsEngine';

export type WeatherType =
  | 'clear'
  | 'sunny'
  | 'cloudy'
  | 'overcast'
  | 'light_rain'
  | 'rain'
  | 'heavy_rain'
  | 'drizzle'
  | 'fog'
  | 'mist'
  | 'wind'
  | 'snow'
  | 'light_snow'
  | 'storm';

export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'dusk' | 'night';

export interface WeatherConditions {
  type: WeatherType;
  intensity: number; // 0-1
  windSpeed: number; // mph
  windDirection: number; // degrees, 0 = north
  temperature: number; // Fahrenheit
  humidity: number; // 0-100%
  visibility: number; // 0-1, 1 = perfect visibility
  precipitation: number; // 0-1
}

export interface EnvironmentalEffects {
  // Physics modifiers
  ballDragMultiplier: number;
  ballCarryMultiplier: number; // Wind assistance
  batContactMultiplier: number; // Ball comes off bat differently
  fieldFrictionMultiplier: number; // Wet grass affects ball roll

  // Gameplay modifiers
  catchDifficultyModifier: number; // Rain/sun makes catching harder
  visionReduction: number; // Fog/sun reduces vision
  slipChance: number; // Wet field increases slip chance
  errorChanceMultiplier: number; // Weather affects error rate

  // Visual effects
  lightingIntensity: number;
  shadowIntensity: number;
  skyColor: string;
  ambientColor: string;
  fogDensity: number;
}

export interface TimeOfDayEffects {
  time: TimeOfDay;
  hour: number; // 0-23
  lightAngle: number; // Sun angle
  lightIntensity: number;
  shadowLength: number;
  skyGradient: {
    top: string;
    middle: string;
    bottom: string;
  };
  ambientBrightness: number;
  visibilityModifier: number;
}

export interface Particle {
  id: string;
  type: 'rain' | 'snow' | 'dust' | 'leaf' | 'fog';
  position: Vector2;
  velocity: Vector2;
  size: number;
  opacity: number;
  lifetime: number;
  maxLifetime: number;
  rotation: number;
  rotationSpeed: number;
}

export interface WeatherEvent {
  type: 'sun_glare' | 'wind_gust' | 'lightning' | 'fog_bank' | 'rainbow';
  startTime: number;
  duration: number;
  intensity: number;
  affectedArea?: {
    center: Vector2;
    radius: number;
  };
}

export class WeatherEnvironmentSystem {
  private currentWeather: WeatherConditions;
  private currentTime: TimeOfDayEffects;
  private environmentalEffects: EnvironmentalEffects;
  private particles: Particle[] = [];
  private weatherEvents: WeatherEvent[] = [];

  private readonly MAX_PARTICLES = 1000;
  private readonly PARTICLE_SPAWN_RATE = 50; // particles per second

  // Weather transition
  private isTransitioning: boolean = false;
  private transitionProgress: number = 0;
  private transitionDuration: number = 5000; // ms
  private targetWeather: WeatherConditions | null = null;

  // Time progression
  private timeMultiplier: number = 1.0; // Real-time multiplier
  private autoProgressTime: boolean = false;

  constructor() {
    this.currentWeather = this.createClearWeather();
    this.currentTime = this.createTimeOfDay('afternoon', 14);
    this.environmentalEffects = this.calculateEnvironmentalEffects();

    console.log('🌤️ Weather Environment System initialized');
  }

  /**
   * Create clear weather conditions
   */
  private createClearWeather(): WeatherConditions {
    return {
      type: 'clear',
      intensity: 0,
      windSpeed: 5,
      windDirection: 0,
      temperature: 75,
      humidity: 50,
      visibility: 1.0,
      precipitation: 0
    };
  }

  /**
   * Create time of day
   */
  private createTimeOfDay(time: TimeOfDay, hour: number): TimeOfDayEffects {
    const timeConfigs: Record<TimeOfDay, Partial<TimeOfDayEffects>> = {
      dawn: {
        lightAngle: 15,
        lightIntensity: 0.6,
        shadowLength: 2.0,
        skyGradient: {
          top: '#1a1a2e',
          middle: '#ff6b6b',
          bottom: '#ffd93d'
        },
        ambientBrightness: 0.5,
        visibilityModifier: 0.8
      },
      morning: {
        lightAngle: 45,
        lightIntensity: 0.9,
        shadowLength: 1.2,
        skyGradient: {
          top: '#87CEEB',
          middle: '#B0E0E6',
          bottom: '#F0F8FF'
        },
        ambientBrightness: 0.9,
        visibilityModifier: 1.0
      },
      afternoon: {
        lightAngle: 60,
        lightIntensity: 1.0,
        shadowLength: 0.8,
        skyGradient: {
          top: '#4A90E2',
          middle: '#87CEEB',
          bottom: '#E0F6FF'
        },
        ambientBrightness: 1.0,
        visibilityModifier: 1.0
      },
      evening: {
        lightAngle: 30,
        lightIntensity: 0.7,
        shadowLength: 1.5,
        skyGradient: {
          top: '#2C3E50',
          middle: '#E67E22',
          bottom: '#F39C12'
        },
        ambientBrightness: 0.7,
        visibilityModifier: 0.9
      },
      dusk: {
        lightAngle: 10,
        lightIntensity: 0.4,
        shadowLength: 2.5,
        skyGradient: {
          top: '#191970',
          middle: '#4B0082',
          bottom: '#FF4500'
        },
        ambientBrightness: 0.4,
        visibilityModifier: 0.7
      },
      night: {
        lightAngle: 0,
        lightIntensity: 0.2,
        shadowLength: 0,
        skyGradient: {
          top: '#000814',
          middle: '#001D3D',
          bottom: '#003566'
        },
        ambientBrightness: 0.3,
        visibilityModifier: 0.6
      }
    };

    return {
      time,
      hour,
      ...timeConfigs[time]
    } as TimeOfDayEffects;
  }

  /**
   * Calculate environmental effects based on weather and time
   */
  private calculateEnvironmentalEffects(): EnvironmentalEffects {
    const weather = this.currentWeather;
    const time = this.currentTime;

    // Base effects
    let effects: EnvironmentalEffects = {
      ballDragMultiplier: 1.0,
      ballCarryMultiplier: 1.0,
      batContactMultiplier: 1.0,
      fieldFrictionMultiplier: 1.0,
      catchDifficultyModifier: 0,
      visionReduction: 0,
      slipChance: 0,
      errorChanceMultiplier: 1.0,
      lightingIntensity: time.lightIntensity,
      shadowIntensity: time.shadowLength > 0 ? 0.8 : 0,
      skyColor: time.skyGradient.top,
      ambientColor: time.skyGradient.middle,
      fogDensity: 0
    };

    // Weather modifiers
    switch (weather.type) {
      case 'rain':
      case 'heavy_rain':
        effects.ballDragMultiplier = 1.15;
        effects.fieldFrictionMultiplier = 1.4;
        effects.catchDifficultyModifier = 0.3;
        effects.visionReduction = 0.2;
        effects.slipChance = 0.15;
        effects.errorChanceMultiplier = 1.5;
        effects.batContactMultiplier = 0.95;
        break;

      case 'light_rain':
      case 'drizzle':
        effects.ballDragMultiplier = 1.08;
        effects.fieldFrictionMultiplier = 1.2;
        effects.catchDifficultyModifier = 0.15;
        effects.visionReduction = 0.1;
        effects.slipChance = 0.08;
        effects.errorChanceMultiplier = 1.2;
        break;

      case 'fog':
      case 'mist':
        effects.visionReduction = 0.4;
        effects.catchDifficultyModifier = 0.25;
        effects.fogDensity = 0.6;
        effects.ballDragMultiplier = 1.05;
        break;

      case 'wind':
        const windEffect = weather.windSpeed / 30; // Normalize to 0-1
        effects.ballCarryMultiplier = 1 + windEffect * 0.3;
        effects.ballDragMultiplier = 1 + windEffect * 0.1;
        effects.catchDifficultyModifier = windEffect * 0.2;
        break;

      case 'snow':
      case 'light_snow':
        effects.ballDragMultiplier = 1.12;
        effects.fieldFrictionMultiplier = 1.6;
        effects.catchDifficultyModifier = 0.35;
        effects.visionReduction = 0.25;
        effects.slipChance = 0.2;
        effects.errorChanceMultiplier = 1.6;
        effects.batContactMultiplier = 0.9;
        break;

      case 'storm':
        effects.ballDragMultiplier = 1.2;
        effects.ballCarryMultiplier = 0.85;
        effects.fieldFrictionMultiplier = 1.8;
        effects.catchDifficultyModifier = 0.5;
        effects.visionReduction = 0.35;
        effects.slipChance = 0.25;
        effects.errorChanceMultiplier = 2.0;
        effects.batContactMultiplier = 0.88;
        break;

      case 'sunny':
        // Bright sun can cause glare
        if (time.time === 'afternoon') {
          effects.visionReduction = 0.15;
          effects.catchDifficultyModifier = 0.1;
        }
        // Thin air helps ball carry
        if (weather.temperature > 85) {
          effects.ballCarryMultiplier = 1.05;
        }
        break;
    }

    // Wind direction affects ball carry
    if (weather.windSpeed > 10) {
      const windAngle = weather.windDirection;
      // Tailwind (wind blowing toward outfield) helps, headwind hurts
      const windComponent = Math.cos((windAngle * Math.PI) / 180);
      effects.ballCarryMultiplier *= 1 + (windComponent * weather.windSpeed) / 100;
    }

    // Temperature affects ball
    if (weather.temperature > 80) {
      effects.ballCarryMultiplier *= 1.02; // Hot air = more carry
    } else if (weather.temperature < 50) {
      effects.ballCarryMultiplier *= 0.98; // Cold air = less carry
      effects.batContactMultiplier *= 0.97; // Ball doesn't jump off bat as much
    }

    // Humidity affects ball
    if (weather.humidity > 70) {
      effects.ballDragMultiplier *= 1.03;
    }

    // Visibility from time of day
    effects.visionReduction += (1 - time.visibilityModifier) * 0.3;

    return effects;
  }

  /**
   * Set weather
   */
  public setWeather(type: WeatherType, immediate: boolean = false): void {
    const newWeather = this.createWeatherConditions(type);

    if (immediate) {
      this.currentWeather = newWeather;
      this.environmentalEffects = this.calculateEnvironmentalEffects();
      this.updateParticleSystem();
    } else {
      this.targetWeather = newWeather;
      this.isTransitioning = true;
      this.transitionProgress = 0;
    }

    console.log(`🌦️ Weather changed to: ${type}`);
  }

  /**
   * Create weather conditions for a type
   */
  private createWeatherConditions(type: WeatherType): WeatherConditions {
    const baseConditions: Record<WeatherType, Partial<WeatherConditions>> = {
      clear: {
        intensity: 0,
        windSpeed: 5,
        precipitation: 0,
        visibility: 1.0,
        humidity: 45
      },
      sunny: {
        intensity: 0.8,
        windSpeed: 8,
        precipitation: 0,
        visibility: 1.0,
        temperature: 85,
        humidity: 40
      },
      cloudy: {
        intensity: 0.4,
        windSpeed: 12,
        precipitation: 0,
        visibility: 0.9,
        humidity: 60
      },
      overcast: {
        intensity: 0.6,
        windSpeed: 15,
        precipitation: 0,
        visibility: 0.85,
        humidity: 70
      },
      light_rain: {
        intensity: 0.3,
        windSpeed: 10,
        precipitation: 0.3,
        visibility: 0.8,
        humidity: 85
      },
      rain: {
        intensity: 0.6,
        windSpeed: 15,
        precipitation: 0.6,
        visibility: 0.7,
        humidity: 90
      },
      heavy_rain: {
        intensity: 0.9,
        windSpeed: 20,
        precipitation: 0.9,
        visibility: 0.5,
        humidity: 95
      },
      drizzle: {
        intensity: 0.2,
        windSpeed: 8,
        precipitation: 0.2,
        visibility: 0.85,
        humidity: 80
      },
      fog: {
        intensity: 0.7,
        windSpeed: 5,
        precipitation: 0,
        visibility: 0.4,
        humidity: 95
      },
      mist: {
        intensity: 0.4,
        windSpeed: 6,
        precipitation: 0.1,
        visibility: 0.6,
        humidity: 90
      },
      wind: {
        intensity: 0.5,
        windSpeed: 25,
        precipitation: 0,
        visibility: 0.9,
        humidity: 50
      },
      snow: {
        intensity: 0.6,
        windSpeed: 12,
        precipitation: 0.5,
        visibility: 0.6,
        temperature: 32,
        humidity: 80
      },
      light_snow: {
        intensity: 0.3,
        windSpeed: 8,
        precipitation: 0.3,
        visibility: 0.75,
        temperature: 35,
        humidity: 75
      },
      storm: {
        intensity: 1.0,
        windSpeed: 30,
        precipitation: 1.0,
        visibility: 0.4,
        humidity: 98
      }
    };

    return {
      type,
      windDirection: Math.random() * 360,
      temperature: 72,
      ...baseConditions[type]
    } as WeatherConditions;
  }

  /**
   * Set time of day
   */
  public setTimeOfDay(time: TimeOfDay, immediate: boolean = false): void {
    const hourMap: Record<TimeOfDay, number> = {
      dawn: 6,
      morning: 9,
      afternoon: 14,
      evening: 18,
      dusk: 20,
      night: 22
    };

    this.currentTime = this.createTimeOfDay(time, hourMap[time]);
    this.environmentalEffects = this.calculateEnvironmentalEffects();

    console.log(`🕐 Time set to: ${time}`);
  }

  /**
   * Update weather (called every frame)
   */
  public update(deltaTime: number): void {
    // Handle weather transition
    if (this.isTransitioning && this.targetWeather) {
      this.transitionProgress += deltaTime * 1000;

      if (this.transitionProgress >= this.transitionDuration) {
        this.currentWeather = this.targetWeather;
        this.isTransitioning = false;
        this.targetWeather = null;
        this.transitionProgress = 0;
      } else {
        // Interpolate weather values
        const t = this.transitionProgress / this.transitionDuration;
        this.currentWeather = this.interpolateWeather(
          this.currentWeather,
          this.targetWeather,
          t
        );
      }

      this.environmentalEffects = this.calculateEnvironmentalEffects();
    }

    // Update time progression
    if (this.autoProgressTime) {
      this.progressTime(deltaTime * this.timeMultiplier);
    }

    // Update particles
    this.updateParticles(deltaTime);

    // Update weather events
    this.updateWeatherEvents(deltaTime);

    // Randomly spawn new particles based on weather
    if (this.currentWeather.precipitation > 0) {
      this.spawnWeatherParticles(deltaTime);
    }
  }

  /**
   * Interpolate between two weather conditions
   */
  private interpolateWeather(
    from: WeatherConditions,
    to: WeatherConditions,
    t: number
  ): WeatherConditions {
    return {
      type: t < 0.5 ? from.type : to.type,
      intensity: from.intensity + (to.intensity - from.intensity) * t,
      windSpeed: from.windSpeed + (to.windSpeed - from.windSpeed) * t,
      windDirection: from.windDirection + (to.windDirection - from.windDirection) * t,
      temperature: from.temperature + (to.temperature - from.temperature) * t,
      humidity: from.humidity + (to.humidity - from.humidity) * t,
      visibility: from.visibility + (to.visibility - from.visibility) * t,
      precipitation: from.precipitation + (to.precipitation - from.precipitation) * t
    };
  }

  /**
   * Progress time
   */
  private progressTime(deltaTime: number): void {
    this.currentTime.hour += (deltaTime / 3600); // Convert seconds to hours

    if (this.currentTime.hour >= 24) {
      this.currentTime.hour -= 24;
    }

    // Update time of day based on hour
    if (this.currentTime.hour >= 5 && this.currentTime.hour < 7) {
      if (this.currentTime.time !== 'dawn') this.setTimeOfDay('dawn', true);
    } else if (this.currentTime.hour >= 7 && this.currentTime.hour < 12) {
      if (this.currentTime.time !== 'morning') this.setTimeOfDay('morning', true);
    } else if (this.currentTime.hour >= 12 && this.currentTime.hour < 17) {
      if (this.currentTime.time !== 'afternoon') this.setTimeOfDay('afternoon', true);
    } else if (this.currentTime.hour >= 17 && this.currentTime.hour < 19) {
      if (this.currentTime.time !== 'evening') this.setTimeOfDay('evening', true);
    } else if (this.currentTime.hour >= 19 && this.currentTime.hour < 21) {
      if (this.currentTime.time !== 'dusk') this.setTimeOfDay('dusk', true);
    } else {
      if (this.currentTime.time !== 'night') this.setTimeOfDay('night', true);
    }
  }

  /**
   * Spawn weather particles
   */
  private spawnWeatherParticles(deltaTime: number): void {
    if (this.particles.length >= this.MAX_PARTICLES) return;

    const spawnCount = Math.floor(
      this.PARTICLE_SPAWN_RATE * this.currentWeather.precipitation * deltaTime
    );

    for (let i = 0; i < spawnCount; i++) {
      let particleType: 'rain' | 'snow' | 'dust' | 'leaf' | 'fog';

      if (this.currentWeather.type.includes('rain')) {
        particleType = 'rain';
      } else if (this.currentWeather.type.includes('snow')) {
        particleType = 'snow';
      } else if (this.currentWeather.type.includes('fog') || this.currentWeather.type === 'mist') {
        particleType = 'fog';
      } else {
        continue;
      }

      const particle: Particle = {
        id: `particle_${Date.now()}_${Math.random()}`,
        type: particleType,
        position: {
          x: Math.random() * 800,
          y: -10
        },
        velocity: {
          x: (this.currentWeather.windSpeed / 10) * (Math.random() - 0.5) * 2,
          y: particleType === 'rain' ? 200 + Math.random() * 100 : particleType === 'snow' ? 50 + Math.random() * 50 : 20
        },
        size: particleType === 'rain' ? 2 + Math.random() * 2 : particleType === 'snow' ? 3 + Math.random() * 4 : 10 + Math.random() * 20,
        opacity: particleType === 'fog' ? 0.3 + Math.random() * 0.3 : 0.6 + Math.random() * 0.4,
        lifetime: 0,
        maxLifetime: particleType === 'fog' ? 10 : 5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2
      };

      this.particles.push(particle);
    }
  }

  /**
   * Update particles
   */
  private updateParticles(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update position
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;

      // Update rotation
      particle.rotation += particle.rotationSpeed * deltaTime;

      // Update lifetime
      particle.lifetime += deltaTime;

      // Remove if off-screen or lifetime expired
      if (
        particle.position.y > 600 ||
        particle.position.x < -50 ||
        particle.position.x > 850 ||
        particle.lifetime > particle.maxLifetime
      ) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Update particle system when weather changes
   */
  private updateParticleSystem(): void {
    // Clear all non-persistent particles when weather changes dramatically
    if (this.currentWeather.precipitation === 0) {
      this.particles = this.particles.filter(p => p.type === 'fog');
    }
  }

  /**
   * Update weather events
   */
  private updateWeatherEvents(deltaTime: number): void {
    const now = Date.now();

    // Remove expired events
    this.weatherEvents = this.weatherEvents.filter(event => {
      return (now - event.startTime) < event.duration;
    });

    // Randomly trigger weather events
    if (Math.random() < 0.001) { // 0.1% chance per frame
      this.triggerRandomWeatherEvent();
    }
  }

  /**
   * Trigger a random weather event
   */
  private triggerRandomWeatherEvent(): void {
    const events: WeatherEvent['type'][] = ['sun_glare', 'wind_gust', 'fog_bank'];

    if (this.currentWeather.type === 'storm') {
      events.push('lightning');
    }

    if (this.currentWeather.type === 'rain' && this.currentTime.time === 'afternoon') {
      events.push('rainbow');
    }

    const eventType = events[Math.floor(Math.random() * events.length)];

    const event: WeatherEvent = {
      type: eventType,
      startTime: Date.now(),
      duration: 2000 + Math.random() * 3000,
      intensity: 0.5 + Math.random() * 0.5
    };

    this.weatherEvents.push(event);
    console.log(`⚡ Weather event: ${eventType}`);
  }

  /**
   * Check if weather affects gameplay at a position
   */
  public getWeatherEffectAtPosition(position: Vector2): {
    windEffect: Vector2;
    visibilityReduction: number;
    slipperyGround: boolean;
  } {
    return {
      windEffect: {
        x: Math.cos((this.currentWeather.windDirection * Math.PI) / 180) *
          this.currentWeather.windSpeed,
        y: Math.sin((this.currentWeather.windDirection * Math.PI) / 180) *
          this.currentWeather.windSpeed
      },
      visibilityReduction: this.environmentalEffects.visionReduction,
      slipperyGround: this.environmentalEffects.slipChance > 0.1
    };
  }

  /**
   * Public getters
   */
  public getCurrentWeather(): WeatherConditions {
    return { ...this.currentWeather };
  }

  public getCurrentTime(): TimeOfDayEffects {
    return { ...this.currentTime };
  }

  public getEnvironmentalEffects(): EnvironmentalEffects {
    return { ...this.environmentalEffects };
  }

  public getParticles(): Particle[] {
    return [...this.particles];
  }

  public getWeatherEvents(): WeatherEvent[] {
    return [...this.weatherEvents];
  }

  public setTimeMultiplier(multiplier: number): void {
    this.timeMultiplier = Math.max(0, multiplier);
  }

  public setAutoProgressTime(enabled: boolean): void {
    this.autoProgressTime = enabled;
  }

  public isWeatherActive(): boolean {
    return this.currentWeather.precipitation > 0 || this.currentWeather.windSpeed > 15;
  }

  public getWeatherSummary(): string {
    return `${this.currentWeather.type} at ${this.currentTime.time}, ${this.currentWeather.temperature}°F, Wind: ${this.currentWeather.windSpeed}mph`;
  }
}
