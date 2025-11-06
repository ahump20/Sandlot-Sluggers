import { Scene, Sound, Vector3 } from "@babylonjs/core";

/**
 * Audio management system
 * Handles sound effects, ambient sounds, and music
 * Inspired by Backyard Baseball's iconic sound design
 */

export type SoundEffect =
  | "bat_crack"          // Bat hitting ball
  | "bat_crack_homerun"  // Powerful home run hit
  | "bat_miss"           // Swing and miss
  | "catch"              // Ball caught
  | "ball_land"          // Ball hits ground
  | "crowd_cheer"        // Crowd celebrates
  | "crowd_aww"          // Crowd disappointed
  | "umpire_strike"      // Strike call
  | "umpire_ball"        // Ball call
  | "umpire_out"         // Out call
  | "umpire_safe"        // Safe call
  | "whistle"            // Referee whistle
  | "glove_pound"        // Pitcher hitting glove
  | "dirt_slide"         // Player sliding
  | "fence_hit"          // Ball hitting fence
  | "footsteps_dirt"     // Running on dirt
  | "footsteps_grass"    // Running on grass
  | "button_click"       // UI button click
  | "power_up"           // Special ability activated
  | "level_up"           // Player levels up
  | "achievement"        // Achievement unlocked
  | "coin"               // Collect coin/points
  | "menu_select";       // Menu selection

export type MusicTrack =
  | "main_menu"
  | "game_intro"
  | "gameplay_upbeat"
  | "gameplay_intense"
  | "victory"
  | "defeat"
  | "credits";

export type AmbienceTrack =
  | "stadium_crowd"
  | "birds"
  | "wind"
  | "night_crickets";

export class AudioManager {
  private scene: Scene;
  private audioContext: AudioContext | null = null;
  private soundEffects: Map<SoundEffect, Sound> = new Map();
  private musicTracks: Map<MusicTrack, Sound> = new Map();
  private ambienceTracks: Map<AmbienceTrack, Sound> = new Map();

  private currentMusic: Sound | null = null;
  private currentAmbience: Sound | null = null;

  private masterVolume: number = 1.0;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.6;
  private ambienceVolume: number = 0.4;

  private muted: boolean = false;

  // Asset paths (would come from R2 in production)
  private readonly SOUND_BASE_PATH = "/audio/sfx/";
  private readonly MUSIC_BASE_PATH = "/audio/music/";
  private readonly AMBIENCE_BASE_PATH = "/audio/ambience/";

  constructor(scene: Scene) {
    this.scene = scene;
    this.initAudioContext();
  }

  /**
   * Initialize Web Audio Context
   */
  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  /**
   * Load all audio assets
   */
  public async loadAudio(): Promise<void> {
    // Load sound effects
    await this.loadSoundEffect("bat_crack", "bat_crack.mp3");
    await this.loadSoundEffect("bat_crack_homerun", "bat_crack_homerun.mp3");
    await this.loadSoundEffect("bat_miss", "bat_miss.mp3");
    await this.loadSoundEffect("catch", "catch.mp3");
    await this.loadSoundEffect("ball_land", "ball_land.mp3");
    await this.loadSoundEffect("crowd_cheer", "crowd_cheer.mp3");
    await this.loadSoundEffect("crowd_aww", "crowd_aww.mp3");
    await this.loadSoundEffect("umpire_strike", "umpire_strike.mp3");
    await this.loadSoundEffect("umpire_ball", "umpire_ball.mp3");
    await this.loadSoundEffect("umpire_out", "umpire_out.mp3");
    await this.loadSoundEffect("umpire_safe", "umpire_safe.mp3");
    await this.loadSoundEffect("whistle", "whistle.mp3");
    await this.loadSoundEffect("glove_pound", "glove_pound.mp3");
    await this.loadSoundEffect("dirt_slide", "dirt_slide.mp3");
    await this.loadSoundEffect("fence_hit", "fence_hit.mp3");
    await this.loadSoundEffect("footsteps_dirt", "footsteps_dirt.mp3");
    await this.loadSoundEffect("footsteps_grass", "footsteps_grass.mp3");
    await this.loadSoundEffect("button_click", "button_click.mp3");
    await this.loadSoundEffect("power_up", "power_up.mp3");
    await this.loadSoundEffect("level_up", "level_up.mp3");
    await this.loadSoundEffect("achievement", "achievement.mp3");
    await this.loadSoundEffect("coin", "coin.mp3");
    await this.loadSoundEffect("menu_select", "menu_select.mp3");

    // Load music
    await this.loadMusic("main_menu", "main_menu.mp3");
    await this.loadMusic("game_intro", "game_intro.mp3");
    await this.loadMusic("gameplay_upbeat", "gameplay_upbeat.mp3");
    await this.loadMusic("gameplay_intense", "gameplay_intense.mp3");
    await this.loadMusic("victory", "victory.mp3");
    await this.loadMusic("defeat", "defeat.mp3");
    await this.loadMusic("credits", "credits.mp3");

    // Load ambience
    await this.loadAmbience("stadium_crowd", "stadium_crowd.mp3");
    await this.loadAmbience("birds", "birds.mp3");
    await this.loadAmbience("wind", "wind.mp3");
    await this.loadAmbience("night_crickets", "night_crickets.mp3");
  }

  /**
   * Load a sound effect
   */
  private async loadSoundEffect(name: SoundEffect, filename: string): Promise<void> {
    try {
      const sound = new Sound(
        name,
        this.SOUND_BASE_PATH + filename,
        this.scene,
        null,
        {
          loop: false,
          autoplay: false,
          volume: this.sfxVolume * this.masterVolume
        }
      );

      this.soundEffects.set(name, sound);
    } catch (error) {
      console.warn(`Failed to load sound effect: ${name}`, error);
      // Create silent fallback
      this.createSilentSound(name, this.soundEffects);
    }
  }

  /**
   * Load a music track
   */
  private async loadMusic(name: MusicTrack, filename: string): Promise<void> {
    try {
      const sound = new Sound(
        name,
        this.MUSIC_BASE_PATH + filename,
        this.scene,
        null,
        {
          loop: true,
          autoplay: false,
          volume: this.musicVolume * this.masterVolume
        }
      );

      this.musicTracks.set(name, sound);
    } catch (error) {
      console.warn(`Failed to load music: ${name}`, error);
      this.createSilentSound(name, this.musicTracks);
    }
  }

  /**
   * Load an ambience track
   */
  private async loadAmbience(name: AmbienceTrack, filename: string): Promise<void> {
    try {
      const sound = new Sound(
        name,
        this.AMBIENCE_BASE_PATH + filename,
        this.scene,
        null,
        {
          loop: true,
          autoplay: false,
          volume: this.ambienceVolume * this.masterVolume
        }
      );

      this.ambienceTracks.set(name, sound);
    } catch (error) {
      console.warn(`Failed to load ambience: ${name}`, error);
      this.createSilentSound(name, this.ambienceTracks);
    }
  }

  /**
   * Create silent fallback sound
   */
  private createSilentSound(name: string, map: Map<any, Sound>): void {
    // Create empty audio buffer as fallback
    const sound = new Sound(
      name,
      new ArrayBuffer(0),
      this.scene,
      null,
      { loop: false, autoplay: false }
    );
    map.set(name as any, sound);
  }

  /**
   * Play a sound effect
   */
  public playSFX(effect: SoundEffect, volume: number = 1.0, position?: Vector3): void {
    if (this.muted) return;

    const sound = this.soundEffects.get(effect);
    if (!sound) return;

    sound.setVolume(this.sfxVolume * this.masterVolume * volume);

    if (position) {
      sound.setPosition(position);
      sound.spatialSound = true;
      sound.maxDistance = 100;
    } else {
      sound.spatialSound = false;
    }

    sound.play();
  }

  /**
   * Play music track
   */
  public playMusic(track: MusicTrack, fadeIn: boolean = true): void {
    if (this.muted) return;

    // Stop current music
    if (this.currentMusic) {
      if (fadeIn) {
        this.fadeOut(this.currentMusic, 1000);
      } else {
        this.currentMusic.stop();
      }
    }

    // Play new music
    const music = this.musicTracks.get(track);
    if (!music) return;

    this.currentMusic = music;

    if (fadeIn) {
      music.setVolume(0);
      music.play();
      this.fadeIn(music, this.musicVolume * this.masterVolume, 1000);
    } else {
      music.setVolume(this.musicVolume * this.masterVolume);
      music.play();
    }
  }

  /**
   * Stop music
   */
  public stopMusic(fadeOut: boolean = true): void {
    if (!this.currentMusic) return;

    if (fadeOut) {
      this.fadeOut(this.currentMusic, 1000);
    } else {
      this.currentMusic.stop();
    }

    this.currentMusic = null;
  }

  /**
   * Play ambience track
   */
  public playAmbience(track: AmbienceTrack): void {
    if (this.muted) return;

    // Stop current ambience
    if (this.currentAmbience) {
      this.currentAmbience.stop();
    }

    // Play new ambience
    const ambience = this.ambienceTracks.get(track);
    if (!ambience) return;

    this.currentAmbience = ambience;
    ambience.setVolume(this.ambienceVolume * this.masterVolume);
    ambience.play();
  }

  /**
   * Stop ambience
   */
  public stopAmbience(): void {
    if (this.currentAmbience) {
      this.currentAmbience.stop();
      this.currentAmbience = null;
    }
  }

  /**
   * Fade in sound
   */
  private fadeIn(sound: Sound, targetVolume: number, duration: number): void {
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;

    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      sound.setVolume(volumeStep * currentStep);

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  }

  /**
   * Fade out sound
   */
  private fadeOut(sound: Sound, duration: number): void {
    const startVolume = sound.getVolume();
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = startVolume / steps;

    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      sound.setVolume(startVolume - (volumeStep * currentStep));

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        sound.stop();
      }
    }, stepDuration);
  }

  /**
   * Set master volume
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Set SFX volume
   */
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.soundEffects.forEach(sound => {
      sound.setVolume(this.sfxVolume * this.masterVolume);
    });
  }

  /**
   * Set music volume
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume * this.masterVolume);
    }
  }

  /**
   * Set ambience volume
   */
  public setAmbienceVolume(volume: number): void {
    this.ambienceVolume = Math.max(0, Math.min(1, volume));
    if (this.currentAmbience) {
      this.currentAmbience.setVolume(this.ambienceVolume * this.masterVolume);
    }
  }

  /**
   * Update all volumes
   */
  private updateAllVolumes(): void {
    this.soundEffects.forEach(sound => {
      sound.setVolume(this.sfxVolume * this.masterVolume);
    });

    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume * this.masterVolume);
    }

    if (this.currentAmbience) {
      this.currentAmbience.setVolume(this.ambienceVolume * this.masterVolume);
    }
  }

  /**
   * Mute all audio
   */
  public mute(): void {
    this.muted = true;
    this.soundEffects.forEach(sound => sound.setVolume(0));
    if (this.currentMusic) this.currentMusic.setVolume(0);
    if (this.currentAmbience) this.currentAmbience.setVolume(0);
  }

  /**
   * Unmute all audio
   */
  public unmute(): void {
    this.muted = false;
    this.updateAllVolumes();
  }

  /**
   * Toggle mute
   */
  public toggleMute(): boolean {
    if (this.muted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.muted;
  }

  /**
   * Get current mute state
   */
  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Play commentator call (special SFX with voice)
   */
  public playCommentary(type: "homerun" | "strikeout" | "great_catch" | "game_over"): void {
    // These would be special voice-over files
    // For now, combine multiple SFX to simulate
    switch (type) {
      case "homerun":
        this.playSFX("bat_crack_homerun");
        setTimeout(() => this.playSFX("crowd_cheer"), 500);
        break;

      case "strikeout":
        this.playSFX("bat_miss");
        setTimeout(() => this.playSFX("umpire_strike"), 200);
        setTimeout(() => this.playSFX("crowd_aww"), 800);
        break;

      case "great_catch":
        this.playSFX("catch");
        setTimeout(() => this.playSFX("crowd_cheer"), 300);
        break;

      case "game_over":
        this.playSFX("whistle");
        setTimeout(() => this.playSFX("crowd_cheer"), 500);
        break;
    }
  }

  /**
   * Dispose all audio
   */
  public dispose(): void {
    this.soundEffects.forEach(sound => sound.dispose());
    this.musicTracks.forEach(sound => sound.dispose());
    this.ambienceTracks.forEach(sound => sound.dispose());

    this.soundEffects.clear();
    this.musicTracks.clear();
    this.ambienceTracks.clear();

    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
