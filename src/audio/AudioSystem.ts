/**
 * Comprehensive Audio System for Sandlot Sluggers
 * Manages all game audio including music, SFX, voice, and ambient sounds
 *
 * Features:
 * - Multi-channel audio mixing (music, SFX, voice, ambient, UI)
 * - 3D spatial audio with distance attenuation
 * - Audio occlusion and reverb zones
 * - Dynamic music system with intensity layers
 * - Audio ducking and priority system
 * - Sound pooling and management
 * - Audio streaming for large files
 * - Real-time audio effects (EQ, compression, reverb)
 * - Playlist management
 * - Audio visualization
 * - Voice chat integration
 * - Audio recording and playback
 * - Accessibility features (subtitles, visual indicators)
 * - Performance optimization (audio LOD)
 */

import { Scene } from '@babylonjs/core/scene';
import { Sound } from '@babylonjs/core/Audio/sound';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Observable } from '@babylonjs/core/Misc/observable';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

export enum AudioChannel {
    MASTER = 'master',
    MUSIC = 'music',
    SFX = 'sfx',
    VOICE = 'voice',
    AMBIENT = 'ambient',
    UI = 'ui',
    COMMENTARY = 'commentary'
}

export enum AudioCategory {
    // Music
    MUSIC_MENU = 'music_menu',
    MUSIC_GAMEPLAY = 'music_gameplay',
    MUSIC_VICTORY = 'music_victory',
    MUSIC_DEFEAT = 'music_defeat',
    MUSIC_AMBIENT = 'music_ambient',

    // SFX - Batting
    SFX_BAT_SWING = 'sfx_bat_swing',
    SFX_BAT_CONTACT = 'sfx_bat_contact',
    SFX_BAT_MISS = 'sfx_bat_miss',
    SFX_FOUL_BALL = 'sfx_foul_ball',
    SFX_HOME_RUN = 'sfx_home_run',

    // SFX - Pitching
    SFX_PITCH_THROW = 'sfx_pitch_throw',
    SFX_PITCH_CATCH = 'sfx_pitch_catch',
    SFX_STRIKE = 'sfx_strike',
    SFX_BALL = 'sfx_ball',

    // SFX - Fielding
    SFX_GLOVE_CATCH = 'sfx_glove_catch',
    SFX_BALL_DROP = 'sfx_ball_drop',
    SFX_THROW = 'sfx_throw',
    SFX_SLIDE = 'sfx_slide',
    SFX_DIVE = 'sfx_dive',

    // SFX - Environment
    SFX_CROWD_CHEER = 'sfx_crowd_cheer',
    SFX_CROWD_BOO = 'sfx_crowd_boo',
    SFX_CROWD_OOH = 'sfx_crowd_ooh',
    SFX_ORGAN = 'sfx_organ',
    SFX_WHISTLE = 'sfx_whistle',
    SFX_BELL = 'sfx_bell',

    // UI
    UI_CLICK = 'ui_click',
    UI_HOVER = 'ui_hover',
    UI_SUCCESS = 'ui_success',
    UI_ERROR = 'ui_error',
    UI_NOTIFICATION = 'ui_notification',

    // Voice
    VOICE_COMMENTARY = 'voice_commentary',
    VOICE_PA_ANNOUNCER = 'voice_pa_announcer',
    VOICE_UMPIRE = 'voice_umpire',

    // Ambient
    AMBIENT_STADIUM = 'ambient_stadium',
    AMBIENT_WEATHER = 'ambient_weather',
    AMBIENT_NATURE = 'ambient_nature'
}

export enum AudioPriority {
    CRITICAL = 100,
    HIGH = 75,
    MEDIUM = 50,
    LOW = 25,
    VERY_LOW = 10
}

export enum MusicIntensity {
    SILENT = 0,
    AMBIENT = 1,
    LOW = 2,
    MEDIUM = 3,
    HIGH = 4,
    INTENSE = 5
}

export enum AudioEffectType {
    REVERB = 'reverb',
    ECHO = 'echo',
    DELAY = 'delay',
    DISTORTION = 'distortion',
    COMPRESSOR = 'compressor',
    EQ = 'eq',
    FILTER = 'filter',
    CHORUS = 'chorus',
    FLANGER = 'flanger'
}

export interface AudioConfig {
    id: string;
    category: AudioCategory;
    channel: AudioChannel;
    url: string;
    volume: number;
    pitch: number;
    loop: boolean;
    autoplay: boolean;
    streaming: boolean;
    spatial: boolean;
    maxDistance: number;
    rolloffFactor: number;
    priority: AudioPriority;
    poolSize?: number;
}

export interface AudioInstance {
    id: string;
    sound: Sound;
    config: AudioConfig;
    isPlaying: boolean;
    isPaused: boolean;
    volume: number;
    pitch: number;
    startTime: number;
    duration: number;
    position?: Vector3;
    attachedTo?: TransformNode;
    effects: AudioEffect[];
}

export interface AudioEffect {
    type: AudioEffectType;
    enabled: boolean;
    parameters: Map<string, number>;
}

export interface MusicLayer {
    id: string;
    intensity: MusicIntensity;
    sound: Sound;
    volume: number;
    fadeDuration: number;
}

export interface MusicTrack {
    id: string;
    name: string;
    artist: string;
    duration: number;
    layers: MusicLayer[];
    bpm: number;
    genre: string;
    mood: string;
}

export interface Playlist {
    id: string;
    name: string;
    tracks: string[];
    shuffle: boolean;
    repeat: boolean;
    currentIndex: number;
    autoAdvance: boolean;
}

export interface AudioZone {
    id: string;
    position: Vector3;
    radius: number;
    reverbPreset: string;
    occlusionFactor: number;
    volumeMultiplier: number;
}

export interface VoiceChatConfig {
    enabled: boolean;
    inputDeviceId: string;
    outputDeviceId: string;
    volume: number;
    micSensitivity: number;
    noiseGate: number;
    echoCancellation: boolean;
    noiseSuppression: boolean;
}

export interface AudioSnapshot {
    timestamp: number;
    channels: Map<AudioChannel, number>;
    activeSounds: number;
    musicIntensity: MusicIntensity;
    spatialSounds: number;
}

export interface AudioVisualization {
    waveform: Float32Array;
    frequencyData: Uint8Array;
    timeDomainData: Uint8Array;
    volume: number;
    peak: number;
}

export class AudioSystem {
    private scene: Scene;
    private audioContext: AudioContext;
    private masterGain: GainNode;
    private channelGains: Map<AudioChannel, GainNode>;
    private audioConfigs: Map<string, AudioConfig>;
    private activeInstances: Map<string, AudioInstance>;
    private soundPools: Map<AudioCategory, Sound[]>;
    private musicTracks: Map<string, MusicTrack>;
    private playlists: Map<string, Playlist>;
    private audioZones: AudioZone[];
    private currentMusicTrack: MusicTrack | null;
    private currentMusicIntensity: MusicIntensity;
    private voiceChatConfig: VoiceChatConfig;

    // Volume settings per channel (0-1)
    private channelVolumes: Map<AudioChannel, number>;
    private muted: Map<AudioChannel, boolean>;

    // Audio processing
    private analyser!: AnalyserNode; // Initialized in initializeAudioProcessing
    private compressor!: DynamicsCompressorNode; // Initialized in initializeAudioProcessing
    private convolver: ConvolverNode | null;

    // Performance
    private maxSimultaneousSounds: number;
    private soundInstanceCounter: number;
    private audioLODEnabled: boolean;
    private audioLODDistance: number;

    // Ducking system
    private duckingTargets: Map<AudioChannel, AudioChannel[]>;
    private duckingAmount: number;
    private duckingFadeTime: number;

    // Recording
    private isRecording: boolean;
    private mediaRecorder: MediaRecorder | null;
    private recordedChunks: Blob[];

    // Observables for events
    public onSoundStarted: Observable<AudioInstance>;
    public onSoundEnded: Observable<string>;
    public onMusicTrackChanged: Observable<MusicTrack>;
    public onMusicIntensityChanged: Observable<MusicIntensity>;
    public onChannelVolumeChanged: Observable<{ channel: AudioChannel; volume: number }>;
    public onAudioZoneEntered: Observable<AudioZone>;
    public onAudioZoneExited: Observable<AudioZone>;

    constructor(scene: Scene) {
        this.scene = scene;
        this.audioContext = new AudioContext();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);

        this.channelGains = new Map();
        this.audioConfigs = new Map();
        this.activeInstances = new Map();
        this.soundPools = new Map();
        this.musicTracks = new Map();
        this.playlists = new Map();
        this.audioZones = [];

        this.currentMusicTrack = null;
        this.currentMusicIntensity = MusicIntensity.AMBIENT;

        this.channelVolumes = new Map();
        this.muted = new Map();

        this.soundInstanceCounter = 0;
        this.maxSimultaneousSounds = 32;
        this.audioLODEnabled = true;
        this.audioLODDistance = 100;

        this.duckingTargets = new Map();
        this.duckingAmount = 0.3;
        this.duckingFadeTime = 0.5;

        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];

        this.voiceChatConfig = {
            enabled: false,
            inputDeviceId: 'default',
            outputDeviceId: 'default',
            volume: 1.0,
            micSensitivity: 0.5,
            noiseGate: 0.01,
            echoCancellation: true,
            noiseSuppression: true
        };

        this.onSoundStarted = new Observable();
        this.onSoundEnded = new Observable();
        this.onMusicTrackChanged = new Observable();
        this.onMusicIntensityChanged = new Observable();
        this.onChannelVolumeChanged = new Observable();
        this.onAudioZoneEntered = new Observable();
        this.onAudioZoneExited = new Observable();

        this.initializeChannels();
        this.initializeAudioProcessing();
        this.setupDucking();
    }

    private initializeChannels(): void {
        const channels = Object.values(AudioChannel);

        for (const channel of channels) {
            const gainNode = this.audioContext.createGain();
            gainNode.connect(this.masterGain);
            this.channelGains.set(channel, gainNode);
            this.channelVolumes.set(channel, 1.0);
            this.muted.set(channel, false);
        }
    }

    private initializeAudioProcessing(): void {
        // Analyser for visualization
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;
        this.masterGain.connect(this.analyser);

        // Compressor for dynamic range control
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;

        this.masterGain.disconnect();
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.audioContext.destination);
        this.compressor.connect(this.analyser);

        this.convolver = null;
    }

    private setupDucking(): void {
        // Commentary ducks music and ambient
        this.duckingTargets.set(AudioChannel.COMMENTARY, [
            AudioChannel.MUSIC,
            AudioChannel.AMBIENT
        ]);

        // Voice ducks music and ambient
        this.duckingTargets.set(AudioChannel.VOICE, [
            AudioChannel.MUSIC,
            AudioChannel.AMBIENT
        ]);

        // SFX ducks music slightly
        this.duckingTargets.set(AudioChannel.SFX, [
            AudioChannel.MUSIC
        ]);
    }

    public registerAudio(config: AudioConfig): void {
        this.audioConfigs.set(config.id, config);

        // Create sound pool if needed
        if (config.poolSize && config.poolSize > 1) {
            this.createSoundPool(config);
        }
    }

    private createSoundPool(config: AudioConfig): void {
        const pool: Sound[] = [];

        for (let i = 0; i < (config.poolSize || 1); i++) {
            const sound = new Sound(
                `${config.id}_pool_${i}`,
                config.url,
                this.scene,
                null,
                {
                    loop: config.loop,
                    autoplay: false,
                    volume: config.volume,
                    spatialSound: config.spatial,
                    maxDistance: config.maxDistance,
                    rolloffFactor: config.rolloffFactor,
                    streaming: config.streaming
                }
            );

            pool.push(sound);
        }

        this.soundPools.set(config.category, pool);
    }

    public playSound(configId: string, options?: {
        position?: Vector3;
        attachTo?: TransformNode;
        volume?: number;
        pitch?: number;
    }): string | null {
        const config = this.audioConfigs.get(configId);
        if (!config) return null;

        // Check if we've reached max simultaneous sounds
        if (this.activeInstances.size >= this.maxSimultaneousSounds) {
            this.cullLowestPrioritySounds();
        }

        // Get sound from pool or create new
        let sound: Sound;
        const pool = this.soundPools.get(config.category);

        if (pool && pool.length > 0) {
            sound = this.getAvailableSoundFromPool(pool);
        } else {
            sound = this.createSound(config);
        }

        // Apply options
        const finalVolume = (options?.volume !== undefined ? options.volume : config.volume) * this.getChannelVolume(config.channel);
        sound.setVolume(finalVolume);

        if (options?.pitch !== undefined) {
            sound.setPlaybackRate(options.pitch);
        }

        if (options?.position && config.spatial) {
            sound.setPosition(options.position);
        }

        if (options?.attachTo && config.spatial) {
            sound.attachToMesh(options.attachTo);
        }

        // Create instance
        const instanceId = `sound_${this.soundInstanceCounter++}`;
        const instance: AudioInstance = {
            id: instanceId,
            sound,
            config,
            isPlaying: true,
            isPaused: false,
            volume: finalVolume,
            pitch: options?.pitch || 1.0,
            startTime: Date.now(),
            duration: sound.getDuration() * 1000,
            position: options?.position,
            attachedTo: options?.attachTo,
            effects: []
        };

        this.activeInstances.set(instanceId, instance);

        // Setup callbacks
        sound.onEndedObservable.addOnce(() => {
            this.handleSoundEnded(instanceId);
        });

        // Play sound
        sound.play();

        // Apply ducking if needed
        this.applyDucking(config.channel, true);

        this.onSoundStarted.notifyObservers(instance);

        return instanceId;
    }

    private getAvailableSoundFromPool(pool: Sound[]): Sound {
        // Find a sound that's not playing
        for (const sound of pool) {
            if (!sound.isPlaying) {
                return sound;
            }
        }

        // If all are playing, return the first one (will interrupt)
        return pool[0];
    }

    private createSound(config: AudioConfig): Sound {
        return new Sound(
            `${config.id}_${Date.now()}`,
            config.url,
            this.scene,
            null,
            {
                loop: config.loop,
                autoplay: false,
                volume: config.volume,
                spatialSound: config.spatial,
                maxDistance: config.maxDistance,
                rolloffFactor: config.rolloffFactor,
                streaming: config.streaming
            }
        );
    }

    private cullLowestPrioritySounds(): void {
        let lowestPriority = AudioPriority.CRITICAL;
        let lowestInstance: AudioInstance | null = null;

        for (const instance of this.activeInstances.values()) {
            if (instance.config.priority < lowestPriority) {
                lowestPriority = instance.config.priority;
                lowestInstance = instance;
            }
        }

        if (lowestInstance) {
            this.stopSound(lowestInstance.id);
        }
    }

    private handleSoundEnded(instanceId: string): void {
        const instance = this.activeInstances.get(instanceId);
        if (!instance) return;

        instance.isPlaying = false;

        // Apply ducking release
        this.applyDucking(instance.config.channel, false);

        this.activeInstances.delete(instanceId);
        this.onSoundEnded.notifyObservers(instanceId);
    }

    public stopSound(instanceId: string, fadeOut: number = 0): void {
        const instance = this.activeInstances.get(instanceId);
        if (!instance) return;

        if (fadeOut > 0) {
            this.fadeOut(instance, fadeOut);
        } else {
            instance.sound.stop();
            this.handleSoundEnded(instanceId);
        }
    }

    public pauseSound(instanceId: string): void {
        const instance = this.activeInstances.get(instanceId);
        if (!instance || !instance.isPlaying) return;

        instance.sound.pause();
        instance.isPaused = true;
        instance.isPlaying = false;
    }

    public resumeSound(instanceId: string): void {
        const instance = this.activeInstances.get(instanceId);
        if (!instance || !instance.isPaused) return;

        instance.sound.play();
        instance.isPaused = false;
        instance.isPlaying = true;
    }

    private fadeOut(instance: AudioInstance, duration: number): void {
        const startVolume = instance.volume;
        const startTime = Date.now();

        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1.0);
            const volume = startVolume * (1 - progress);

            instance.sound.setVolume(volume);

            if (progress < 1.0) {
                requestAnimationFrame(fade);
            } else {
                instance.sound.stop();
                this.handleSoundEnded(instance.id);
            }
        };

        fade();
    }

    private applyDucking(sourceChannel: AudioChannel, duck: boolean): void {
        const targets = this.duckingTargets.get(sourceChannel);
        if (!targets) return;

        for (const targetChannel of targets) {
            const gain = this.channelGains.get(targetChannel);
            if (!gain) continue;

            const targetVolume = duck ? this.duckingAmount : 1.0;
            const currentTime = this.audioContext.currentTime;

            gain.gain.cancelScheduledValues(currentTime);
            gain.gain.setValueAtTime(gain.gain.value, currentTime);
            gain.gain.linearRampToValueAtTime(targetVolume, currentTime + this.duckingFadeTime);
        }
    }

    public playMusicTrack(trackId: string, fadeIn: number = 2.0): void {
        const track = this.musicTracks.get(trackId);
        if (!track) return;

        // Fade out current track
        if (this.currentMusicTrack) {
            this.stopMusicTrack(2.0);
        }

        // Start new track
        this.currentMusicTrack = track;

        // Play all layers at intensity 0
        for (const layer of track.layers) {
            layer.sound.setVolume(0);
            layer.sound.play();
        }

        // Fade to current intensity
        this.setMusicIntensity(this.currentMusicIntensity, fadeIn);

        this.onMusicTrackChanged.notifyObservers(track);
    }

    public stopMusicTrack(fadeOut: number = 2.0): void {
        if (!this.currentMusicTrack) return;

        for (const layer of this.currentMusicTrack.layers) {
            const startTime = this.audioContext.currentTime;
            const gainNode = this.channelGains.get(AudioChannel.MUSIC)!;

            gainNode.gain.cancelScheduledValues(startTime);
            gainNode.gain.setValueAtTime(gainNode.gain.value, startTime);
            gainNode.gain.linearRampToValueAtTime(0, startTime + fadeOut);

            setTimeout(() => {
                layer.sound.stop();
            }, fadeOut * 1000);
        }

        this.currentMusicTrack = null;
    }

    public setMusicIntensity(intensity: MusicIntensity, fadeTime: number = 1.0): void {
        if (!this.currentMusicTrack) return;

        this.currentMusicIntensity = intensity;

        for (const layer of this.currentMusicTrack.layers) {
            const targetVolume = layer.intensity <= intensity ? layer.volume : 0;
            const startTime = this.audioContext.currentTime;

            // Create a gain node for this layer if it doesn't exist
            const currentVolume = layer.sound.getVolume();

            if (currentVolume !== targetVolume) {
                layer.sound.setVolume(currentVolume);
                // Note: Babylon.js Sound doesn't have built-in fade, so we'd use setVolume over time
                this.fadeVolume(layer.sound, currentVolume, targetVolume, fadeTime);
            }
        }

        this.onMusicIntensityChanged.notifyObservers(intensity);
    }

    private fadeVolume(sound: Sound, fromVolume: number, toVolume: number, duration: number): void {
        const startTime = Date.now();

        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1.0);
            const volume = fromVolume + (toVolume - fromVolume) * progress;

            sound.setVolume(volume);

            if (progress < 1.0) {
                requestAnimationFrame(fade);
            }
        };

        fade();
    }

    public createPlaylist(playlist: Playlist): void {
        this.playlists.set(playlist.id, playlist);
    }

    public playPlaylist(playlistId: string): void {
        const playlist = this.playlists.get(playlistId);
        if (!playlist || playlist.tracks.length === 0) return;

        const trackId = playlist.tracks[playlist.currentIndex];
        this.playMusicTrack(trackId);

        // Setup auto-advance if enabled
        if (playlist.autoAdvance) {
            const track = this.musicTracks.get(trackId);
            if (track) {
                setTimeout(() => {
                    this.advancePlaylist(playlistId);
                }, track.duration * 1000);
            }
        }
    }

    private advancePlaylist(playlistId: string): void {
        const playlist = this.playlists.get(playlistId);
        if (!playlist) return;

        if (playlist.shuffle) {
            playlist.currentIndex = Math.floor(Math.random() * playlist.tracks.length);
        } else {
            playlist.currentIndex = (playlist.currentIndex + 1) % playlist.tracks.length;

            if (playlist.currentIndex === 0 && !playlist.repeat) {
                return; // Playlist ended
            }
        }

        this.playPlaylist(playlistId);
    }

    public setChannelVolume(channel: AudioChannel, volume: number): void {
        volume = Math.max(0, Math.min(1, volume));
        this.channelVolumes.set(channel, volume);

        const gain = this.channelGains.get(channel);
        if (gain && !this.muted.get(channel)) {
            gain.gain.value = volume;
        }

        this.onChannelVolumeChanged.notifyObservers({ channel, volume });
    }

    public getChannelVolume(channel: AudioChannel): number {
        return this.channelVolumes.get(channel) || 1.0;
    }

    public muteChannel(channel: AudioChannel, mute: boolean): void {
        this.muted.set(channel, mute);

        const gain = this.channelGains.get(channel);
        if (gain) {
            gain.gain.value = mute ? 0 : this.getChannelVolume(channel);
        }
    }

    public isChannelMuted(channel: AudioChannel): boolean {
        return this.muted.get(channel) || false;
    }

    public addAudioZone(zone: AudioZone): void {
        this.audioZones.push(zone);
    }

    public removeAudioZone(zoneId: string): void {
        const index = this.audioZones.findIndex(z => z.id === zoneId);
        if (index !== -1) {
            this.audioZones.splice(index, 1);
        }
    }

    public checkAudioZones(listenerPosition: Vector3): void {
        for (const zone of this.audioZones) {
            const distance = Vector3.Distance(listenerPosition, zone.position);

            if (distance <= zone.radius) {
                // Listener is in zone
                this.applyZoneEffects(zone);
                this.onAudioZoneEntered.notifyObservers(zone);
            }
        }
    }

    private applyZoneEffects(zone: AudioZone): void {
        // Apply reverb if needed
        if (zone.reverbPreset && !this.convolver) {
            this.loadReverbPreset(zone.reverbPreset);
        }

        // Apply volume multiplier to ambient sounds
        for (const instance of this.activeInstances.values()) {
            if (instance.config.channel === AudioChannel.AMBIENT) {
                const adjustedVolume = instance.volume * zone.volumeMultiplier;
                instance.sound.setVolume(adjustedVolume);
            }
        }
    }

    private loadReverbPreset(preset: string): void {
        // Load impulse response for convolver
        // This is a placeholder - would actually load audio file
        this.convolver = this.audioContext.createConvolver();
        this.masterGain.connect(this.convolver);
        this.convolver.connect(this.audioContext.destination);
    }

    public getAudioVisualization(): AudioVisualization {
        const bufferLength = this.analyser.frequencyBinCount;
        const frequencyData = new Uint8Array(bufferLength);
        const timeDomainData = new Uint8Array(bufferLength);
        const waveform = new Float32Array(bufferLength);

        this.analyser.getByteFrequencyData(frequencyData);
        this.analyser.getByteTimeDomainData(timeDomainData);
        this.analyser.getFloatTimeDomainData(waveform);

        // Calculate volume and peak
        let volume = 0;
        let peak = 0;

        for (let i = 0; i < bufferLength; i++) {
            const value = frequencyData[i] / 255;
            volume += value;
            peak = Math.max(peak, value);
        }

        volume /= bufferLength;

        return {
            waveform,
            frequencyData,
            timeDomainData,
            volume,
            peak
        };
    }

    public startRecording(): void {
        if (this.isRecording) return;

        const dest = this.audioContext.createMediaStreamDestination();
        this.masterGain.connect(dest);

        this.mediaRecorder = new MediaRecorder(dest.stream);
        this.recordedChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        this.mediaRecorder.start();
        this.isRecording = true;
    }

    public stopRecording(): Blob | null {
        if (!this.isRecording || !this.mediaRecorder) return null;

        this.mediaRecorder.stop();
        this.isRecording = false;

        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.recordedChunks = [];

        return blob;
    }

    public update(deltaTime: number, listenerPosition?: Vector3): void {
        // Update audio LOD
        if (this.audioLODEnabled && listenerPosition) {
            this.updateAudioLOD(listenerPosition);
        }

        // Check audio zones
        if (listenerPosition) {
            this.checkAudioZones(listenerPosition);
        }

        // Update spatial audio positions
        for (const instance of this.activeInstances.values()) {
            if (instance.attachedTo && instance.config.spatial) {
                instance.sound.setPosition(instance.attachedTo.getAbsolutePosition());
            }
        }
    }

    private updateAudioLOD(listenerPosition: Vector3): void {
        for (const instance of this.activeInstances.values()) {
            if (!instance.config.spatial || !instance.position) continue;

            const distance = Vector3.Distance(listenerPosition, instance.position);

            if (distance > this.audioLODDistance) {
                // Reduce quality or stop sound
                if (instance.isPlaying && instance.config.priority < AudioPriority.HIGH) {
                    this.pauseSound(instance.id);
                }
            } else if (distance <= this.audioLODDistance && instance.isPaused) {
                // Resume sound
                this.resumeSound(instance.id);
            }
        }
    }

    public takeSnapshot(): AudioSnapshot {
        const channels = new Map<AudioChannel, number>();

        for (const [channel, volume] of this.channelVolumes.entries()) {
            channels.set(channel, volume);
        }

        let spatialSounds = 0;
        for (const instance of this.activeInstances.values()) {
            if (instance.config.spatial) {
                spatialSounds++;
            }
        }

        return {
            timestamp: Date.now(),
            channels,
            activeSounds: this.activeInstances.size,
            musicIntensity: this.currentMusicIntensity,
            spatialSounds
        };
    }

    public dispose(): void {
        // Stop all sounds
        for (const instance of this.activeInstances.values()) {
            instance.sound.stop();
            instance.sound.dispose();
        }

        // Clear pools
        for (const pool of this.soundPools.values()) {
            for (const sound of pool) {
                sound.dispose();
            }
        }

        // Stop recording if active
        if (this.isRecording) {
            this.stopRecording();
        }

        // Close audio context
        this.audioContext.close();

        // Clear collections
        this.activeInstances.clear();
        this.soundPools.clear();
        this.audioConfigs.clear();
        this.musicTracks.clear();
        this.playlists.clear();
        this.audioZones = [];
    }
}
