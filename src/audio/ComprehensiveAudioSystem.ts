import { Scene, Sound, Vector3, Observable, SoundTrack, Analyser, Node } from '@babylonjs/core';

/**
 * Audio categories for organization and mixing
 */
export enum AudioCategory {
    MASTER = 'master',
    MUSIC = 'music',
    SFX = 'sfx',
    AMBIENCE = 'ambience',
    VOICE = 'voice',
    UI = 'ui',
    CROWD = 'crowd',
    COMMENTARY = 'commentary',
    UMPIRE = 'umpire'
}

/**
 * Audio priority levels
 */
export enum AudioPriority {
    LOW = 0,
    NORMAL = 1,
    HIGH = 2,
    CRITICAL = 3,
    ALWAYS = 4
}

/**
 * Music track types
 */
export enum MusicTrack {
    MAIN_MENU = 'main_menu',
    GAMEPLAY = 'gameplay',
    GAMEPLAY_INTENSE = 'gameplay_intense',
    VICTORY = 'victory',
    DEFEAT = 'defeat',
    LOADING = 'loading',
    CREDITS = 'credits',
    TUTORIAL = 'tutorial',
    CAREER_MODE = 'career_mode',
    PLAYOFFS = 'playoffs',
    WORLD_SERIES = 'world_series'
}

/**
 * Sound effect types
 */
export enum SFXType {
    // Ball sounds
    BAT_CONTACT_WEAK = 'bat_contact_weak',
    BAT_CONTACT_SOLID = 'bat_contact_solid',
    BAT_CONTACT_PERFECT = 'bat_contact_perfect',
    BAT_CONTACT_FOUL = 'bat_contact_foul',
    BAT_SWING_MISS = 'bat_swing_miss',
    BAT_BUNT = 'bat_bunt',
    BALL_CATCH_GLOVE = 'ball_catch_glove',
    BALL_CATCH_MITT = 'ball_catch_mitt',
    BALL_DROP = 'ball_drop',
    BALL_GROUND_BOUNCE = 'ball_ground_bounce',
    BALL_WALL_HIT = 'ball_wall_hit',
    BALL_DIRT_IMPACT = 'ball_dirt_impact',
    BALL_GRASS_IMPACT = 'ball_grass_impact',

    // Pitching sounds
    PITCH_RELEASE = 'pitch_release',
    PITCH_WHOOSH_FAST = 'pitch_whoosh_fast',
    PITCH_WHOOSH_SLOW = 'pitch_whoosh_slow',
    PITCH_GRUNT = 'pitch_grunt',

    // Fielding sounds
    GLOVE_POP = 'glove_pop',
    GLOVE_CATCH_DIVE = 'glove_catch_dive',
    THROW_GRUNT = 'throw_grunt',
    THROW_RELEASE = 'throw_release',

    // Running sounds
    FOOTSTEPS_DIRT = 'footsteps_dirt',
    FOOTSTEPS_GRASS = 'footsteps_grass',
    SLIDE_DIRT = 'slide_dirt',
    SLIDE_GRASS = 'slide_grass',
    BASE_TAG = 'base_tag',
    COLLISION = 'collision',

    // Equipment sounds
    BAT_CRACK = 'bat_crack',
    BAT_BREAK = 'bat_break',
    HELMET_TAP = 'helmet_tap',
    GLOVE_ADJUST = 'glove_adjust',
    UNIFORM_RUSTLE = 'uniform_rustle',

    // Stadium sounds
    GATE_OPEN = 'gate_open',
    TURNSTILE = 'turnstile',
    SEAT_CREAK = 'seat_creak',
    VENDOR_CALL = 'vendor_call',

    // UI sounds
    UI_CLICK = 'ui_click',
    UI_HOVER = 'ui_hover',
    UI_SUCCESS = 'ui_success',
    UI_ERROR = 'ui_error',
    UI_NOTIFICATION = 'ui_notification',
    UI_MENU_OPEN = 'ui_menu_open',
    UI_MENU_CLOSE = 'ui_menu_close',
    UI_TAB_SWITCH = 'ui_tab_switch',

    // Umpire calls
    UMPIRE_STRIKE = 'umpire_strike',
    UMPIRE_BALL = 'umpire_ball',
    UMPIRE_OUT = 'umpire_out',
    UMPIRE_SAFE = 'umpire_safe',
    UMPIRE_FOUL = 'umpire_foul',
    UMPIRE_FAIR = 'umpire_fair'
}

/**
 * Ambience types
 */
export enum AmbienceType {
    STADIUM_DAY = 'stadium_day',
    STADIUM_NIGHT = 'stadium_night',
    STADIUM_RAIN = 'stadium_rain',
    CROWD_IDLE = 'crowd_idle',
    CROWD_CHEER = 'crowd_cheer',
    CROWD_BOO = 'crowd_boo',
    CROWD_GASP = 'crowd_gasp',
    CROWD_APPLAUSE = 'crowd_applause',
    CROWD_WAVE = 'crowd_wave',
    WIND = 'wind',
    RAIN = 'rain',
    THUNDER = 'thunder',
    BIRDS = 'birds'
}

/**
 * Voice line types
 */
export enum VoiceLineType {
    PLAY_BY_PLAY = 'play_by_play',
    COLOR_COMMENTARY = 'color_commentary',
    PLAYER_INTRODUCTION = 'player_introduction',
    GAME_START = 'game_start',
    INNING_CHANGE = 'inning_change',
    SCORE_UPDATE = 'score_update',
    HOMERUN_CALL = 'homerun_call',
    STRIKEOUT_CALL = 'strikeout_call',
    DOUBLE_PLAY = 'double_play',
    AMAZING_CATCH = 'amazing_catch',
    CLOSE_PLAY = 'close_play',
    GAME_END = 'game_end'
}

/**
 * Audio configuration
 */
export interface AudioConfig {
    category: AudioCategory;
    priority: AudioPriority;
    volume: number;
    loop: boolean;
    autoplay?: boolean;
    spatialSound?: boolean;
    maxDistance?: number;
    rolloffFactor?: number;
    distanceModel?: 'linear' | 'inverse' | 'exponential';
    panningModel?: 'equalpower' | 'HRTF';
    refDistance?: number;
    fadeInDuration?: number;
    fadeOutDuration?: number;
}

/**
 * Sound instance
 */
export interface SoundInstance {
    id: string;
    sound: Sound;
    config: AudioConfig;
    isPlaying: boolean;
    isPaused: boolean;
    startTime: number;
    pauseTime: number;
    volume: number;
    category: AudioCategory;
}

/**
 * Audio mixer channel
 */
export interface MixerChannel {
    category: AudioCategory;
    volume: number;
    muted: boolean;
    solo: boolean;
    sounds: SoundInstance[];
}

/**
 * Audio snapshot (mixer state preset)
 */
export interface AudioSnapshot {
    name: string;
    channels: Map<AudioCategory, { volume: number; muted: boolean }>;
    transitionDuration: number;
}

/**
 * Dynamic audio event
 */
export interface DynamicAudioEvent {
    type: string;
    intensity: number;
    position?: Vector3;
    data?: any;
}

/**
 * Music playlist
 */
export interface MusicPlaylist {
    name: string;
    tracks: MusicTrack[];
    shuffle: boolean;
    repeat: boolean;
    crossfadeDuration: number;
}

/**
 * Audio occlusion settings
 */
export interface AudioOcclusion {
    enabled: boolean;
    wallAttenuation: number;
    distanceAttenuation: number;
    lowPassFilter: number;
}

/**
 * Reverb settings
 */
export interface ReverbSettings {
    enabled: boolean;
    roomSize: number;
    damping: number;
    wetLevel: number;
    dryLevel: number;
    width: number;
    freezeMode: boolean;
}

/**
 * Compressor settings (for dynamic range control)
 */
export interface CompressorSettings {
    enabled: boolean;
    threshold: number;
    knee: number;
    ratio: number;
    attack: number;
    release: number;
}

/**
 * Comprehensive Audio System
 * Manages all game audio including music, SFX, ambience, voice, and spatial audio
 */
export class ComprehensiveAudioSystem {
    private scene: Scene;

    // Sound storage
    private sounds: Map<string, SoundInstance> = new Map();
    private soundLibrary: Map<string, string> = new Map(); // name -> file path
    private loadedSounds: Map<string, Sound> = new Map();

    // Mixer
    private channels: Map<AudioCategory, MixerChannel> = new Map();
    private masterVolume: number = 1.0;
    private snapshots: Map<string, AudioSnapshot> = new Map();
    private currentSnapshot: string | null = null;

    // Music system
    private currentMusic: Sound | null = null;
    private musicQueue: MusicTrack[] = [];
    private musicPlaylist: MusicPlaylist | null = null;
    private musicFading: boolean = false;
    private currentMusicTrack: MusicTrack | null = null;

    // Voice system
    private commentaryQueue: string[] = [];
    private currentCommentary: Sound | null = null;
    private commentaryEnabled: boolean = true;
    private commentaryCooldown: number = 0;
    private commentaryMinInterval: number = 2.0;

    // Crowd system
    private crowdVolume: number = 0.5;
    private crowdIntensity: number = 0.5;
    private crowdCheerLevel: number = 0;
    private crowdBaseAmbience: Sound | null = null;

    // Spatial audio
    private listener: any = null; // AudioListener
    private spatialSoundsEnabled: boolean = true;
    private maxSpatialSounds: number = 32;
    private activeSpatialSounds: number = 0;

    // Audio effects
    private reverbSettings: ReverbSettings = {
        enabled: false,
        roomSize: 0.5,
        damping: 0.5,
        wetLevel: 0.3,
        dryLevel: 1.0,
        width: 1.0,
        freezeMode: false
    };

    private compressorSettings: CompressorSettings = {
        enabled: true,
        threshold: -24,
        knee: 30,
        ratio: 12,
        attack: 0.003,
        release: 0.25
    };

    private occlusionSettings: AudioOcclusion = {
        enabled: true,
        wallAttenuation: 0.5,
        distanceAttenuation: 0.8,
        lowPassFilter: 0.7
    };

    // Performance
    private maxConcurrentSounds: number = 64;
    private voicePoolSize: number = 32;
    private soundPool: Sound[] = [];

    // Observables
    private onMusicChangeObservable: Observable<MusicTrack> = new Observable();
    private onSoundPlayObservable: Observable<string> = new Observable();
    private onVolumeChangeObservable: Observable<AudioCategory> = new Observable();

    // State
    private muted: boolean = false;
    private paused: boolean = false;
    private time: number = 0;

    constructor(scene: Scene) {
        this.scene = scene;
        this.initializeChannels();
        this.initializeSnapshots();
        this.loadSoundLibrary();
    }

    /**
     * Initialize mixer channels
     */
    private initializeChannels(): void {
        const categories = Object.values(AudioCategory);

        for (const category of categories) {
            this.channels.set(category, {
                category,
                volume: 1.0,
                muted: false,
                solo: false,
                sounds: []
            });
        }
    }

    /**
     * Initialize audio snapshots
     */
    private initializeSnapshots(): void {
        // Gameplay snapshot
        const gameplaySnapshot: AudioSnapshot = {
            name: 'gameplay',
            channels: new Map([
                [AudioCategory.MASTER, { volume: 1.0, muted: false }],
                [AudioCategory.MUSIC, { volume: 0.5, muted: false }],
                [AudioCategory.SFX, { volume: 0.8, muted: false }],
                [AudioCategory.AMBIENCE, { volume: 0.6, muted: false }],
                [AudioCategory.CROWD, { volume: 0.7, muted: false }],
                [AudioCategory.COMMENTARY, { volume: 0.8, muted: false }],
                [AudioCategory.UI, { volume: 0.6, muted: false }]
            ]),
            transitionDuration: 1.0
        };
        this.snapshots.set('gameplay', gameplaySnapshot);

        // Menu snapshot
        const menuSnapshot: AudioSnapshot = {
            name: 'menu',
            channels: new Map([
                [AudioCategory.MASTER, { volume: 1.0, muted: false }],
                [AudioCategory.MUSIC, { volume: 0.7, muted: false }],
                [AudioCategory.SFX, { volume: 0.5, muted: false }],
                [AudioCategory.AMBIENCE, { volume: 0.0, muted: true }],
                [AudioCategory.CROWD, { volume: 0.0, muted: true }],
                [AudioCategory.COMMENTARY, { volume: 0.0, muted: true }],
                [AudioCategory.UI, { volume: 0.8, muted: false }]
            ]),
            transitionDuration: 0.5
        };
        this.snapshots.set('menu', menuSnapshot);

        // Replay snapshot (reduced game sounds, boosted commentary)
        const replaySnapshot: AudioSnapshot = {
            name: 'replay',
            channels: new Map([
                [AudioCategory.MASTER, { volume: 1.0, muted: false }],
                [AudioCategory.MUSIC, { volume: 0.3, muted: false }],
                [AudioCategory.SFX, { volume: 0.6, muted: false }],
                [AudioCategory.AMBIENCE, { volume: 0.4, muted: false }],
                [AudioCategory.CROWD, { volume: 0.5, muted: false }],
                [AudioCategory.COMMENTARY, { volume: 1.0, muted: false }],
                [AudioCategory.UI, { volume: 0.3, muted: false }]
            ]),
            transitionDuration: 0.3
        };
        this.snapshots.set('replay', replaySnapshot);

        // Pause snapshot
        const pauseSnapshot: AudioSnapshot = {
            name: 'pause',
            channels: new Map([
                [AudioCategory.MASTER, { volume: 0.5, muted: false }],
                [AudioCategory.MUSIC, { volume: 0.4, muted: false }],
                [AudioCategory.SFX, { volume: 0.2, muted: false }],
                [AudioCategory.AMBIENCE, { volume: 0.2, muted: false }],
                [AudioCategory.CROWD, { volume: 0.2, muted: false }],
                [AudioCategory.COMMENTARY, { volume: 0.0, muted: true }],
                [AudioCategory.UI, { volume: 0.8, muted: false }]
            ]),
            transitionDuration: 0.2
        };
        this.snapshots.set('pause', pauseSnapshot);
    }

    /**
     * Load sound library (map sound names to file paths)
     */
    private loadSoundLibrary(): void {
        // Music tracks
        this.soundLibrary.set('music_main_menu', '/assets/audio/music/main_menu.mp3');
        this.soundLibrary.set('music_gameplay', '/assets/audio/music/gameplay.mp3');
        this.soundLibrary.set('music_gameplay_intense', '/assets/audio/music/gameplay_intense.mp3');
        this.soundLibrary.set('music_victory', '/assets/audio/music/victory.mp3');
        this.soundLibrary.set('music_defeat', '/assets/audio/music/defeat.mp3');

        // Bat contact sounds
        this.soundLibrary.set('bat_contact_weak', '/assets/audio/sfx/bat_contact_weak.wav');
        this.soundLibrary.set('bat_contact_solid', '/assets/audio/sfx/bat_contact_solid.wav');
        this.soundLibrary.set('bat_contact_perfect', '/assets/audio/sfx/bat_contact_perfect.wav');
        this.soundLibrary.set('bat_swing_miss', '/assets/audio/sfx/bat_swing_miss.wav');

        // Ball sounds
        this.soundLibrary.set('ball_catch_glove', '/assets/audio/sfx/ball_catch_glove.wav');
        this.soundLibrary.set('ball_ground_bounce', '/assets/audio/sfx/ball_ground_bounce.wav');
        this.soundLibrary.set('ball_wall_hit', '/assets/audio/sfx/ball_wall_hit.wav');

        // Crowd ambience
        this.soundLibrary.set('crowd_idle', '/assets/audio/ambience/crowd_idle.wav');
        this.soundLibrary.set('crowd_cheer', '/assets/audio/ambience/crowd_cheer.wav');
        this.soundLibrary.set('crowd_boo', '/assets/audio/ambience/crowd_boo.wav');
        this.soundLibrary.set('crowd_gasp', '/assets/audio/ambience/crowd_gasp.wav');

        // Stadium ambience
        this.soundLibrary.set('stadium_day', '/assets/audio/ambience/stadium_day.wav');
        this.soundLibrary.set('stadium_night', '/assets/audio/ambience/stadium_night.wav');

        // UI sounds
        this.soundLibrary.set('ui_click', '/assets/audio/ui/click.wav');
        this.soundLibrary.set('ui_hover', '/assets/audio/ui/hover.wav');
        this.soundLibrary.set('ui_success', '/assets/audio/ui/success.wav');
        this.soundLibrary.set('ui_error', '/assets/audio/ui/error.wav');
    }

    /**
     * Preload sound
     */
    public async preloadSound(name: string): Promise<void> {
        if (this.loadedSounds.has(name)) return;

        const path = this.soundLibrary.get(name);
        if (!path) {
            console.warn(`Sound not found in library: ${name}`);
            return;
        }

        return new Promise((resolve, reject) => {
            const sound = new Sound(
                name,
                path,
                this.scene,
                () => {
                    this.loadedSounds.set(name, sound);
                    resolve();
                },
                {
                    autoplay: false
                }
            );
        });
    }

    /**
     * Preload multiple sounds
     */
    public async preloadSounds(names: string[]): Promise<void> {
        const promises = names.map(name => this.preloadSound(name));
        await Promise.all(promises);
    }

    /**
     * Play sound effect
     */
    public playSFX(
        type: SFXType,
        config?: Partial<AudioConfig>,
        position?: Vector3
    ): string | null {
        // Check concurrent sound limit
        if (this.sounds.size >= this.maxConcurrentSounds) {
            this.cullLowPrioritySounds();
        }

        const soundName = type as string;
        const defaultConfig: AudioConfig = {
            category: AudioCategory.SFX,
            priority: AudioPriority.NORMAL,
            volume: 1.0,
            loop: false,
            spatialSound: position !== undefined,
            maxDistance: 100,
            rolloffFactor: 1.0,
            distanceModel: 'linear',
            refDistance: 1.0
        };

        const finalConfig = { ...defaultConfig, ...config };

        // Get or load sound
        let sound = this.loadedSounds.get(soundName);
        if (!sound) {
            const path = this.soundLibrary.get(soundName);
            if (!path) {
                console.warn(`Sound not found: ${soundName}`);
                return null;
            }

            sound = new Sound(soundName, path, this.scene, null, {
                loop: finalConfig.loop,
                autoplay: false,
                spatialSound: finalConfig.spatialSound,
                maxDistance: finalConfig.maxDistance,
                rolloffFactor: finalConfig.rolloffFactor,
                distanceModel: finalConfig.distanceModel
            });

            this.loadedSounds.set(soundName, sound);
        }

        // Set position for spatial sound
        if (position && finalConfig.spatialSound) {
            sound.setPosition(position);
        }

        // Apply volume from mixer
        const channel = this.channels.get(finalConfig.category);
        const finalVolume = finalConfig.volume * (channel?.volume || 1.0) * this.masterVolume;
        sound.setVolume(finalVolume);

        // Play sound
        sound.play();

        // Create instance
        const id = `${soundName}_${Date.now()}_${Math.random()}`;
        const instance: SoundInstance = {
            id,
            sound,
            config: finalConfig,
            isPlaying: true,
            isPaused: false,
            startTime: this.time,
            pauseTime: 0,
            volume: finalVolume,
            category: finalConfig.category
        };

        this.sounds.set(id, instance);

        // Add to channel
        channel?.sounds.push(instance);

        // Notify observers
        this.onSoundPlayObservable.notifyObservers(soundName);

        // Auto-cleanup when sound finishes
        if (!finalConfig.loop) {
            sound.onEndedObservable.addOnce(() => {
                this.stopSound(id);
            });
        }

        return id;
    }

    /**
     * Play music track
     */
    public playMusic(track: MusicTrack, fadeDuration: number = 2.0): void {
        const trackName = `music_${track}`;

        // Fade out current music
        if (this.currentMusic) {
            this.fadeOutMusic(fadeDuration);
        }

        // Load and play new music
        const path = this.soundLibrary.get(trackName);
        if (!path) {
            console.warn(`Music track not found: ${trackName}`);
            return;
        }

        const music = new Sound(trackName, path, this.scene, () => {
            // Fade in
            this.currentMusic = music;
            this.currentMusicTrack = track;
            this.musicFading = true;

            music.setVolume(0);
            music.play();

            this.fadeInMusic(fadeDuration);

            this.onMusicChangeObservable.notifyObservers(track);
        }, {
            loop: true,
            autoplay: false
        });
    }

    /**
     * Fade in music
     */
    private fadeInMusic(duration: number): void {
        if (!this.currentMusic) return;

        const channel = this.channels.get(AudioCategory.MUSIC);
        const targetVolume = (channel?.volume || 1.0) * this.masterVolume;

        const startTime = Date.now();
        const startVolume = 0;

        const fade = () => {
            if (!this.currentMusic || !this.musicFading) return;

            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1.0);

            const volume = startVolume + (targetVolume - startVolume) * progress;
            this.currentMusic.setVolume(volume);

            if (progress < 1.0) {
                requestAnimationFrame(fade);
            } else {
                this.musicFading = false;
            }
        };

        fade();
    }

    /**
     * Fade out music
     */
    private fadeOutMusic(duration: number): void {
        if (!this.currentMusic) return;

        const startTime = Date.now();
        const startVolume = this.currentMusic.getVolume();
        const music = this.currentMusic;

        const fade = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1.0);

            const volume = startVolume * (1.0 - progress);
            music.setVolume(volume);

            if (progress < 1.0) {
                requestAnimationFrame(fade);
            } else {
                music.stop();
                music.dispose();
            }
        };

        fade();
        this.currentMusic = null;
    }

    /**
     * Play ambience
     */
    public playAmbience(type: AmbienceType, volume: number = 0.5, loop: boolean = true): string | null {
        return this.playSFX(type as any, {
            category: AudioCategory.AMBIENCE,
            volume,
            loop,
            priority: AudioPriority.LOW
        });
    }

    /**
     * Play commentary line
     */
    public playCommentary(lineType: VoiceLineType, variation: number = 0): void {
        if (!this.commentaryEnabled) return;
        if (this.commentaryCooldown > 0) return;

        const lineName = `${lineType}_${variation}`;
        const path = this.soundLibrary.get(lineName);
        if (!path) return;

        // Stop current commentary
        if (this.currentCommentary) {
            this.currentCommentary.stop();
        }

        this.currentCommentary = new Sound(lineName, path, this.scene, () => {
            const channel = this.channels.get(AudioCategory.COMMENTARY);
            const volume = (channel?.volume || 1.0) * this.masterVolume;
            this.currentCommentary!.setVolume(volume);
            this.currentCommentary!.play();

            // Set cooldown
            this.commentaryCooldown = this.commentaryMinInterval;
        }, {
            loop: false,
            autoplay: false
        });
    }

    /**
     * Set crowd intensity (0-1)
     */
    public setCrowdIntensity(intensity: number): void {
        this.crowdIntensity = Math.max(0, Math.min(1, intensity));
        this.updateCrowdVolume();
    }

    /**
     * Trigger crowd reaction
     */
    public triggerCrowdReaction(reaction: 'cheer' | 'boo' | 'gasp' | 'applause', intensity: number = 1.0): void {
        const type = `crowd_${reaction}` as AmbienceType;
        this.playSFX(type as any, {
            category: AudioCategory.CROWD,
            volume: intensity,
            loop: false,
            priority: AudioPriority.HIGH
        });
    }

    /**
     * Update crowd volume based on intensity
     */
    private updateCrowdVolume(): void {
        const baseVolume = 0.3;
        const intensityBoost = this.crowdIntensity * 0.7;
        this.crowdVolume = baseVolume + intensityBoost;

        if (this.crowdBaseAmbience) {
            const channel = this.channels.get(AudioCategory.CROWD);
            const finalVolume = this.crowdVolume * (channel?.volume || 1.0) * this.masterVolume;
            this.crowdBaseAmbience.setVolume(finalVolume);
        }
    }

    /**
     * Set master volume
     */
    public setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    /**
     * Set category volume
     */
    public setCategoryVolume(category: AudioCategory, volume: number): void {
        const channel = this.channels.get(category);
        if (!channel) return;

        channel.volume = Math.max(0, Math.min(1, volume));
        this.updateCategoryVolumes(category);
        this.onVolumeChangeObservable.notifyObservers(category);
    }

    /**
     * Mute category
     */
    public muteCategory(category: AudioCategory, muted: boolean): void {
        const channel = this.channels.get(category);
        if (!channel) return;

        channel.muted = muted;
        this.updateCategoryVolumes(category);
    }

    /**
     * Update all sound volumes
     */
    private updateAllVolumes(): void {
        for (const category of this.channels.keys()) {
            this.updateCategoryVolumes(category);
        }

        if (this.currentMusic) {
            const channel = this.channels.get(AudioCategory.MUSIC);
            const volume = (channel?.volume || 1.0) * this.masterVolume;
            this.currentMusic.setVolume(volume);
        }
    }

    /**
     * Update category volumes
     */
    private updateCategoryVolumes(category: AudioCategory): void {
        const channel = this.channels.get(category);
        if (!channel) return;

        const categoryVolume = channel.muted ? 0 : channel.volume;

        for (const instance of channel.sounds) {
            const finalVolume = instance.config.volume * categoryVolume * this.masterVolume;
            instance.sound.setVolume(finalVolume);
            instance.volume = finalVolume;
        }
    }

    /**
     * Apply audio snapshot
     */
    public applySnapshot(snapshotName: string): void {
        const snapshot = this.snapshots.get(snapshotName);
        if (!snapshot) {
            console.warn(`Snapshot not found: ${snapshotName}`);
            return;
        }

        this.currentSnapshot = snapshotName;

        // Transition to snapshot volumes
        for (const [category, settings] of snapshot.channels) {
            const channel = this.channels.get(category);
            if (!channel) continue;

            // Animate volume change
            const startVolume = channel.volume;
            const targetVolume = settings.volume;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / snapshot.transitionDuration, 1.0);

                channel.volume = startVolume + (targetVolume - startVolume) * progress;
                channel.muted = settings.muted;

                this.updateCategoryVolumes(category);

                if (progress < 1.0) {
                    requestAnimationFrame(animate);
                }
            };

            animate();
        }
    }

    /**
     * Create custom snapshot
     */
    public createSnapshot(name: string, transitionDuration: number = 1.0): void {
        const channels = new Map<AudioCategory, { volume: number; muted: boolean }>();

        for (const [category, channel] of this.channels) {
            channels.set(category, {
                volume: channel.volume,
                muted: channel.muted
            });
        }

        const snapshot: AudioSnapshot = {
            name,
            channels,
            transitionDuration
        };

        this.snapshots.set(name, snapshot);
    }

    /**
     * Stop sound
     */
    public stopSound(id: string): void {
        const instance = this.sounds.get(id);
        if (!instance) return;

        instance.sound.stop();
        instance.isPlaying = false;

        // Remove from channel
        const channel = this.channels.get(instance.category);
        if (channel) {
            const index = channel.sounds.indexOf(instance);
            if (index >= 0) {
                channel.sounds.splice(index, 1);
            }
        }

        this.sounds.delete(id);
    }

    /**
     * Stop all sounds in category
     */
    public stopCategory(category: AudioCategory): void {
        const channel = this.channels.get(category);
        if (!channel) return;

        for (const instance of [...channel.sounds]) {
            this.stopSound(instance.id);
        }
    }

    /**
     * Stop all sounds
     */
    public stopAll(): void {
        for (const instance of this.sounds.values()) {
            instance.sound.stop();
        }

        this.sounds.clear();

        for (const channel of this.channels.values()) {
            channel.sounds = [];
        }

        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }

    /**
     * Pause all audio
     */
    public pause(): void {
        if (this.paused) return;

        this.paused = true;

        for (const instance of this.sounds.values()) {
            if (instance.isPlaying) {
                instance.sound.pause();
                instance.isPaused = true;
                instance.pauseTime = this.time;
            }
        }

        if (this.currentMusic && this.currentMusic.isPlaying) {
            this.currentMusic.pause();
        }
    }

    /**
     * Resume all audio
     */
    public resume(): void {
        if (!this.paused) return;

        this.paused = false;

        for (const instance of this.sounds.values()) {
            if (instance.isPaused) {
                instance.sound.play();
                instance.isPaused = false;
            }
        }

        if (this.currentMusic) {
            this.currentMusic.play();
        }
    }

    /**
     * Mute all audio
     */
    public mute(): void {
        this.muted = true;
        this.setMasterVolume(0);
    }

    /**
     * Unmute all audio
     */
    public unmute(): void {
        this.muted = false;
        this.setMasterVolume(1.0);
    }

    /**
     * Cull low priority sounds to stay within limit
     */
    private cullLowPrioritySounds(): void {
        const sortedSounds = Array.from(this.sounds.values())
            .sort((a, b) => a.config.priority - b.config.priority);

        // Remove lowest priority sounds
        const toRemove = sortedSounds.slice(0, 10);
        for (const instance of toRemove) {
            this.stopSound(instance.id);
        }
    }

    /**
     * Update audio system
     */
    public update(deltaTime: number): void {
        this.time += deltaTime;

        // Update commentary cooldown
        if (this.commentaryCooldown > 0) {
            this.commentaryCooldown -= deltaTime;
        }

        // Cleanup finished sounds
        for (const [id, instance] of this.sounds) {
            if (!instance.sound.isPlaying && !instance.isPaused && !instance.config.loop) {
                this.stopSound(id);
            }
        }

        // Update crowd intensity (could be tied to game events)
        this.updateCrowdVolume();
    }

    /**
     * Get mixer info
     */
    public getMixerInfo(): Map<AudioCategory, { volume: number; soundCount: number; muted: boolean }> {
        const info = new Map();

        for (const [category, channel] of this.channels) {
            info.set(category, {
                volume: channel.volume,
                soundCount: channel.sounds.length,
                muted: channel.muted
            });
        }

        return info;
    }

    /**
     * Get statistics
     */
    public getStatistics(): {
        totalSounds: number;
        playingSounds: number;
        pausedSounds: number;
        masterVolume: number;
        muted: boolean;
        paused: boolean;
        currentMusic: MusicTrack | null;
    } {
        let playing = 0;
        let paused = 0;

        for (const instance of this.sounds.values()) {
            if (instance.isPlaying) playing++;
            if (instance.isPaused) paused++;
        }

        return {
            totalSounds: this.sounds.size,
            playingSounds: playing,
            pausedSounds: paused,
            masterVolume: this.masterVolume,
            muted: this.muted,
            paused: this.paused,
            currentMusic: this.currentMusicTrack
        };
    }

    /**
     * Subscribe to music changes
     */
    public onMusicChange(callback: (track: MusicTrack) => void): void {
        this.onMusicChangeObservable.add(callback);
    }

    /**
     * Subscribe to sound plays
     */
    public onSoundPlay(callback: (soundName: string) => void): void {
        this.onSoundPlayObservable.add(callback);
    }

    /**
     * Dispose audio system
     */
    public dispose(): void {
        this.stopAll();

        for (const sound of this.loadedSounds.values()) {
            sound.dispose();
        }

        this.loadedSounds.clear();
        this.sounds.clear();
        this.channels.clear();
        this.snapshots.clear();
        this.soundLibrary.clear();

        this.onMusicChangeObservable.clear();
        this.onSoundPlayObservable.clear();
        this.onVolumeChangeObservable.clear();
    }
}
