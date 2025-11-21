/**
 * AdvancedAudioSystem.ts
 * Comprehensive audio system with dynamic music, 3D positional audio, and adaptive soundtracks
 */

import { Vector2 } from '../PhysicsEngine';

export type SoundCategory = 'sfx' | 'music' | 'ambient' | 'voice' | 'ui';
export type MusicTrack =
  | 'menu_theme'
  | 'game_theme'
  | 'victory_theme'
  | 'defeat_theme'
  | 'home_run_theme'
  | 'tension_theme'
  | 'celebration_theme'
  | 'practice_theme';

export interface AudioConfig {
  masterVolume: number; // 0-1
  sfxVolume: number;
  musicVolume: number;
  ambienceVolume: number;
  voiceVolume: number;
  uiVolume: number;
  enable3DAudio: boolean;
  enableDoppler: boolean;
  enableReverb: boolean;
}

export interface Sound {
  id: string;
  category: SoundCategory;
  audioBuffer: AudioBuffer | null;
  url: string;
  volume: number;
  loop: boolean;
  is3D: boolean;
  playbackRate: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}

export interface SoundInstance {
  id: string;
  soundId: string;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  pannerNode: PannerNode | null;
  startTime: number;
  duration: number;
  isPlaying: boolean;
  isFading: boolean;
  position?: Vector2;
}

export interface MusicLayer {
  name: string;
  track: MusicTrack;
  intensity: number; // 0-1
  volume: number;
  audioBuffer: AudioBuffer | null;
  source: AudioBufferSourceNode | null;
}

export interface DynamicMusicState {
  currentTrack: MusicTrack | null;
  intensity: number; // 0-1, affects layering and intensity
  tension: number; // 0-1, game tension level
  energy: number; // 0-1, gameplay energy
  layers: MusicLayer[];
  isTransitioning: boolean;
  transitionDuration: number;
}

export interface AudioEvent {
  type: string;
  position?: Vector2;
  volume?: number;
  pitch?: number;
  delay?: number;
}

export class AdvancedAudioSystem {
  private audioContext: AudioContext;
  private config: AudioConfig;
  private sounds: Map<string, Sound> = new Map();
  private activeSounds: Map<string, SoundInstance> = new Map();
  private musicState: DynamicMusicState;

  // Audio nodes
  private masterGainNode: GainNode;
  private sfxGainNode: GainNode;
  private musicGainNode: GainNode;
  private ambienceGainNode: GainNode;
  private voiceGainNode: GainNode;
  private uiGainNode: GainNode;

  // Effects
  private reverbNode: ConvolverNode | null = null;
  private compressorNode: DynamicsCompressorNode;
  private analyserNode: AnalyserNode;

  // Listener position (for 3D audio)
  private listenerPosition: Vector2 = { x: 0, y: 0 };

  // Sound library
  private readonly SOUND_LIBRARY = {
    // Bat sounds
    swing_normal: { url: '/audio/sfx/swing_normal.mp3', category: 'sfx' as const, volume: 0.7 },
    swing_miss: { url: '/audio/sfx/swing_miss.mp3', category: 'sfx' as const, volume: 0.6 },
    bat_crack: { url: '/audio/sfx/bat_crack.mp3', category: 'sfx' as const, volume: 0.9 },
    bat_crack_homerun: { url: '/audio/sfx/bat_crack_hr.mp3', category: 'sfx' as const, volume: 1.0 },

    // Ball sounds
    pitch_whoosh: { url: '/audio/sfx/pitch_whoosh.mp3', category: 'sfx' as const, volume: 0.5 },
    ball_catch: { url: '/audio/sfx/ball_catch.mp3', category: 'sfx' as const, volume: 0.6 },
    ball_drop: { url: '/audio/sfx/ball_drop.mp3', category: 'sfx' as const, volume: 0.5 },
    ball_bounce: { url: '/audio/sfx/ball_bounce.mp3', category: 'sfx' as const, volume: 0.4 },

    // Crowd sounds
    crowd_cheer: { url: '/audio/ambient/crowd_cheer.mp3', category: 'ambient' as const, volume: 0.7 },
    crowd_applause: { url: '/audio/ambient/crowd_applause.mp3', category: 'ambient' as const, volume: 0.6 },
    crowd_gasp: { url: '/audio/ambient/crowd_gasp.mp3', category: 'ambient' as const, volume: 0.5 },
    crowd_boo: { url: '/audio/ambient/crowd_boo.mp3', category: 'ambient' as const, volume: 0.5 },
    crowd_ambient: { url: '/audio/ambient/crowd_ambient.mp3', category: 'ambient' as const, volume: 0.3, loop: true },

    // Umpire calls
    strike: { url: '/audio/voice/strike.mp3', category: 'voice' as const, volume: 0.8 },
    ball: { url: '/audio/voice/ball.mp3', category: 'voice' as const, volume: 0.8 },
    out: { url: '/audio/voice/out.mp3', category: 'voice' as const, volume: 0.8 },
    safe: { url: '/audio/voice/safe.mp3', category: 'voice' as const, volume: 0.8 },
    foul_ball: { url: '/audio/voice/foul_ball.mp3', category: 'voice' as const, volume: 0.7 },

    // UI sounds
    button_click: { url: '/audio/ui/button_click.mp3', category: 'ui' as const, volume: 0.5 },
    button_hover: { url: '/audio/ui/button_hover.mp3', category: 'ui' as const, volume: 0.3 },
    menu_open: { url: '/audio/ui/menu_open.mp3', category: 'ui' as const, volume: 0.6 },
    menu_close: { url: '/audio/ui/menu_close.mp3', category: 'ui' as const, volume: 0.6 },
    achievement: { url: '/audio/ui/achievement.mp3', category: 'ui' as const, volume: 0.8 },
    level_up: { url: '/audio/ui/level_up.mp3', category: 'ui' as const, volume: 0.9 },

    // Ambient
    birds_chirping: { url: '/audio/ambient/birds.mp3', category: 'ambient' as const, volume: 0.2, loop: true },
    wind_light: { url: '/audio/ambient/wind_light.mp3', category: 'ambient' as const, volume: 0.3, loop: true },
    stadium_ambient: { url: '/audio/ambient/stadium.mp3', category: 'ambient' as const, volume: 0.4, loop: true },

    // Music tracks
    menu_theme: { url: '/audio/music/menu_theme.mp3', category: 'music' as const, volume: 0.6, loop: true },
    game_theme: { url: '/audio/music/game_theme.mp3', category: 'music' as const, volume: 0.5, loop: true },
    victory_theme: { url: '/audio/music/victory.mp3', category: 'music' as const, volume: 0.7 },
    defeat_theme: { url: '/audio/music/defeat.mp3', category: 'music' as const, volume: 0.6 },
    home_run_theme: { url: '/audio/music/home_run.mp3', category: 'music' as const, volume: 0.8 },
    tension_theme: { url: '/audio/music/tension.mp3', category: 'music' as const, volume: 0.5, loop: true }
  };

  constructor(config?: Partial<AudioConfig>) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    this.config = {
      masterVolume: 0.8,
      sfxVolume: 1.0,
      musicVolume: 0.7,
      ambienceVolume: 0.6,
      voiceVolume: 1.0,
      uiVolume: 0.8,
      enable3DAudio: true,
      enableDoppler: true,
      enableReverb: false,
      ...config
    };

    // Create gain nodes
    this.masterGainNode = this.audioContext.createGain();
    this.sfxGainNode = this.audioContext.createGain();
    this.musicGainNode = this.audioContext.createGain();
    this.ambienceGainNode = this.audioContext.createGain();
    this.voiceGainNode = this.audioContext.createGain();
    this.uiGainNode = this.audioContext.createGain();

    // Create effects
    this.compressorNode = this.audioContext.createDynamicsCompressor();
    this.analyserNode = this.audioContext.createAnalyser();

    // Connect audio graph
    this.setupAudioGraph();

    // Apply initial volumes
    this.updateVolumes();

    // Initialize dynamic music state
    this.musicState = {
      currentTrack: null,
      intensity: 0.5,
      tension: 0,
      energy: 0.5,
      layers: [],
      isTransitioning: false,
      transitionDuration: 2000
    };

    // Initialize sound library
    this.initializeSoundLibrary();

    console.log('🔊 Advanced Audio System initialized');
  }

  /**
   * Setup audio graph connections
   */
  private setupAudioGraph(): void {
    // Category gain nodes → Compressor → Master → Destination
    this.sfxGainNode.connect(this.compressorNode);
    this.musicGainNode.connect(this.compressorNode);
    this.ambienceGainNode.connect(this.compressorNode);
    this.voiceGainNode.connect(this.compressorNode);
    this.uiGainNode.connect(this.compressorNode);

    this.compressorNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);
  }

  /**
   * Initialize sound library
   */
  private initializeSoundLibrary(): void {
    Object.entries(this.SOUND_LIBRARY).forEach(([id, soundData]) => {
      const sound: Sound = {
        id,
        category: soundData.category,
        audioBuffer: null,
        url: soundData.url,
        volume: soundData.volume,
        loop: soundData.loop || false,
        is3D: soundData.category === 'sfx' || soundData.category === 'ambient',
        playbackRate: 1.0,
        fadeInDuration: 0,
        fadeOutDuration: 0
      };

      this.sounds.set(id, sound);
    });
  }

  /**
   * Load a sound file
   */
  public async loadSound(soundId: string): Promise<void> {
    const sound = this.sounds.get(soundId);
    if (!sound) {
      console.error(`Sound ${soundId} not found`);
      return;
    }

    if (sound.audioBuffer) {
      return; // Already loaded
    }

    try {
      const response = await fetch(sound.url);
      const arrayBuffer = await response.arrayBuffer();
      sound.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log(`Loaded sound: ${soundId}`);
    } catch (error) {
      console.error(`Failed to load sound ${soundId}:`, error);
    }
  }

  /**
   * Load all sounds
   */
  public async loadAllSounds(): Promise<void> {
    const promises = Array.from(this.sounds.keys()).map(id => this.loadSound(id));
    await Promise.all(promises);
    console.log('All sounds loaded');
  }

  /**
   * Play a sound
   */
  public playSound(
    soundId: string,
    options?: {
      position?: Vector2;
      volume?: number;
      pitch?: number;
      delay?: number;
      loop?: boolean;
    }
  ): string | null {
    const sound = this.sounds.get(soundId);
    if (!sound || !sound.audioBuffer) {
      console.warn(`Sound ${soundId} not loaded`);
      return null;
    }

    // Create source node
    const source = this.audioContext.createBufferSource();
    source.buffer = sound.audioBuffer;
    source.playbackRate.value = options?.pitch || sound.playbackRate;
    source.loop = options?.loop !== undefined ? options.loop : sound.loop;

    // Create gain node for this instance
    const gainNode = this.audioContext.createGain();
    const volume = (options?.volume !== undefined ? options.volume : sound.volume) * this.getCategoryVolume(sound.category);
    gainNode.gain.value = volume;

    // Create panner node for 3D audio
    let pannerNode: PannerNode | null = null;
    if (sound.is3D && this.config.enable3DAudio && options?.position) {
      pannerNode = this.audioContext.createPanner();
      pannerNode.panningModel = 'HRTF';
      pannerNode.distanceModel = 'inverse';
      pannerNode.refDistance = 100;
      pannerNode.maxDistance = 1000;
      pannerNode.rolloffFactor = 1;
      pannerNode.coneInnerAngle = 360;
      pannerNode.coneOuterAngle = 360;
      pannerNode.coneOuterGain = 0;

      // Set position
      pannerNode.setPosition(options.position.x, options.position.y, 0);

      // Connect: source → panner → gain → category gain → ...
      source.connect(pannerNode);
      pannerNode.connect(gainNode);
    } else {
      // Connect: source → gain → category gain → ...
      source.connect(gainNode);
    }

    // Connect to appropriate category gain node
    gainNode.connect(this.getCategoryGainNode(sound.category));

    // Create sound instance
    const instanceId = `${soundId}_${Date.now()}_${Math.random()}`;
    const instance: SoundInstance = {
      id: instanceId,
      soundId,
      source,
      gainNode,
      pannerNode,
      startTime: this.audioContext.currentTime + (options?.delay || 0),
      duration: sound.audioBuffer.duration,
      isPlaying: true,
      isFading: false,
      position: options?.position
    };

    this.activeSounds.set(instanceId, instance);

    // Start playback
    source.start(instance.startTime);

    // Remove from active sounds when finished
    source.onended = () => {
      this.activeSounds.delete(instanceId);
    };

    return instanceId;
  }

  /**
   * Stop a sound instance
   */
  public stopSound(instanceId: string, fadeOut: boolean = false): void {
    const instance = this.activeSounds.get(instanceId);
    if (!instance || !instance.isPlaying) return;

    if (fadeOut) {
      this.fadeOut(instanceId, 0.5);
    } else {
      instance.source.stop();
      instance.isPlaying = false;
      this.activeSounds.delete(instanceId);
    }
  }

  /**
   * Stop all sounds of a category
   */
  public stopAllSounds(category?: SoundCategory): void {
    this.activeSounds.forEach((instance, id) => {
      if (!category || this.sounds.get(instance.soundId)?.category === category) {
        this.stopSound(id);
      }
    });
  }

  /**
   * Fade in a sound
   */
  public fadeIn(instanceId: string, duration: number): void {
    const instance = this.activeSounds.get(instanceId);
    if (!instance) return;

    instance.isFading = true;
    instance.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    instance.gainNode.gain.linearRampToValueAtTime(
      instance.gainNode.gain.value,
      this.audioContext.currentTime + duration
    );

    setTimeout(() => {
      if (instance) instance.isFading = false;
    }, duration * 1000);
  }

  /**
   * Fade out a sound
   */
  public fadeOut(instanceId: string, duration: number): void {
    const instance = this.activeSounds.get(instanceId);
    if (!instance) return;

    instance.isFading = true;
    instance.gainNode.gain.setValueAtTime(
      instance.gainNode.gain.value,
      this.audioContext.currentTime
    );
    instance.gainNode.gain.linearRampToValueAtTime(
      0,
      this.audioContext.currentTime + duration
    );

    setTimeout(() => {
      this.stopSound(instanceId);
    }, duration * 1000);
  }

  /**
   * Play music track
   */
  public playMusic(track: MusicTrack, fadeIn: boolean = true): void {
    // Stop current music
    if (this.musicState.currentTrack) {
      this.stopMusic(true);
    }

    this.musicState.currentTrack = track;
    const instanceId = this.playSound(track, { loop: true, volume: 0 });

    if (instanceId && fadeIn) {
      this.fadeIn(instanceId, 2);
    }

    console.log(`🎵 Playing music: ${track}`);
  }

  /**
   * Stop music
   */
  public stopMusic(fadeOut: boolean = true): void {
    if (!this.musicState.currentTrack) return;

    this.stopAllSounds('music');
    this.musicState.currentTrack = null;
  }

  /**
   * Update dynamic music based on game state
   */
  public updateDynamicMusic(gameState: {
    inning: number;
    outs: number;
    score: { home: number; away: number };
    bases: boolean[];
  }): void {
    // Calculate tension based on game state
    const scoreDiff = Math.abs(gameState.score.home - gameState.score.away);
    const isCloseGame = scoreDiff <= 1;
    const isLateInning = gameState.inning >= 7;
    const runnersOn = gameState.bases.some(b => b);
    const twoOuts = gameState.outs === 2;

    // Update tension (0-1)
    let tension = 0;
    if (isCloseGame) tension += 0.3;
    if (isLateInning) tension += 0.3;
    if (runnersOn) tension += 0.2;
    if (twoOuts) tension += 0.2;

    this.musicState.tension = Math.min(1, tension);

    // Transition music based on tension
    if (this.musicState.tension > 0.7 && this.musicState.currentTrack !== 'tension_theme') {
      this.playMusic('tension_theme');
    } else if (this.musicState.tension < 0.3 && this.musicState.currentTrack !== 'game_theme') {
      this.playMusic('game_theme');
    }
  }

  /**
   * Play crowd reaction
   */
  public playCrowdReaction(type: 'cheer' | 'applause' | 'gasp' | 'boo', intensity: number = 1.0): void {
    const soundId = `crowd_${type}`;
    this.playSound(soundId, { volume: intensity });
  }

  /**
   * Play umpire call
   */
  public playUmpireCall(call: 'strike' | 'ball' | 'out' | 'safe' | 'foul_ball'): void {
    this.playSound(call, { delay: 0.2 });
  }

  /**
   * Play bat crack with variation based on hit quality
   */
  public playBatCrack(exitVelocity: number): void {
    const isHomeRun = exitVelocity > 350;
    const soundId = isHomeRun ? 'bat_crack_homerun' : 'bat_crack';
    const pitch = 0.9 + (Math.random() * 0.2); // 0.9-1.1x

    this.playSound(soundId, { pitch, volume: 0.8 + (exitVelocity / 500) * 0.2 });
  }

  /**
   * Update listener position (for 3D audio)
   */
  public updateListenerPosition(position: Vector2): void {
    this.listenerPosition = position;

    if (this.audioContext.listener.positionX) {
      this.audioContext.listener.positionX.value = position.x;
      this.audioContext.listener.positionY.value = position.y;
      this.audioContext.listener.positionZ.value = 0;
    } else {
      // Fallback for older browsers
      (this.audioContext.listener as any).setPosition(position.x, position.y, 0);
    }
  }

  /**
   * Update sound instance position (for moving sounds)
   */
  public updateSoundPosition(instanceId: string, position: Vector2): void {
    const instance = this.activeSounds.get(instanceId);
    if (!instance || !instance.pannerNode) return;

    instance.position = position;

    if (instance.pannerNode.positionX) {
      instance.pannerNode.positionX.value = position.x;
      instance.pannerNode.positionY.value = position.y;
      instance.pannerNode.positionZ.value = 0;
    } else {
      (instance.pannerNode as any).setPosition(position.x, position.y, 0);
    }
  }

  /**
   * Update all volumes
   */
  private updateVolumes(): void {
    this.masterGainNode.gain.value = this.config.masterVolume;
    this.sfxGainNode.gain.value = this.config.sfxVolume;
    this.musicGainNode.gain.value = this.config.musicVolume;
    this.ambienceGainNode.gain.value = this.config.ambienceVolume;
    this.voiceGainNode.gain.value = this.config.voiceVolume;
    this.uiGainNode.gain.value = this.config.uiVolume;
  }

  /**
   * Set master volume
   */
  public setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * Set category volume
   */
  public setCategoryVolume(category: SoundCategory, volume: number): void {
    volume = Math.max(0, Math.min(1, volume));

    switch (category) {
      case 'sfx':
        this.config.sfxVolume = volume;
        break;
      case 'music':
        this.config.musicVolume = volume;
        break;
      case 'ambient':
        this.config.ambienceVolume = volume;
        break;
      case 'voice':
        this.config.voiceVolume = volume;
        break;
      case 'ui':
        this.config.uiVolume = volume;
        break;
    }

    this.updateVolumes();
  }

  /**
   * Get category volume
   */
  private getCategoryVolume(category: SoundCategory): number {
    switch (category) {
      case 'sfx':
        return this.config.sfxVolume;
      case 'music':
        return this.config.musicVolume;
      case 'ambient':
        return this.config.ambienceVolume;
      case 'voice':
        return this.config.voiceVolume;
      case 'ui':
        return this.config.uiVolume;
      default:
        return 1.0;
    }
  }

  /**
   * Get category gain node
   */
  private getCategoryGainNode(category: SoundCategory): GainNode {
    switch (category) {
      case 'sfx':
        return this.sfxGainNode;
      case 'music':
        return this.musicGainNode;
      case 'ambient':
        return this.ambienceGainNode;
      case 'voice':
        return this.voiceGainNode;
      case 'ui':
        return this.uiGainNode;
      default:
        return this.sfxGainNode;
    }
  }

  /**
   * Get audio analyser data (for visualizations)
   */
  public getAnalyserData(): Uint8Array {
    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Enable/disable reverb
   */
  public setReverbEnabled(enabled: boolean): void {
    this.config.enableReverb = enabled;

    if (enabled && !this.reverbNode) {
      this.reverbNode = this.audioContext.createConvolver();
      // Would load impulse response here
      // For now, just connect it
      this.compressorNode.disconnect();
      this.compressorNode.connect(this.reverbNode);
      this.reverbNode.connect(this.masterGainNode);
    } else if (!enabled && this.reverbNode) {
      this.compressorNode.disconnect();
      this.reverbNode.disconnect();
      this.compressorNode.connect(this.masterGainNode);
      this.reverbNode = null;
    }
  }

  /**
   * Mute/unmute all audio
   */
  public mute(): void {
    this.masterGainNode.gain.value = 0;
  }

  public unmute(): void {
    this.masterGainNode.gain.value = this.config.masterVolume;
  }

  /**
   * Get current config
   */
  public getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * Get music state
   */
  public getMusicState(): DynamicMusicState {
    return { ...this.musicState };
  }

  /**
   * Get active sound count
   */
  public getActiveSoundCount(): number {
    return this.activeSounds.size;
  }

  /**
   * Suspend audio context (for performance/battery)
   */
  public suspend(): void {
    this.audioContext.suspend();
  }

  /**
   * Resume audio context
   */
  public resume(): void {
    this.audioContext.resume();
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.stopAllSounds();
    this.audioContext.close();
  }
}
