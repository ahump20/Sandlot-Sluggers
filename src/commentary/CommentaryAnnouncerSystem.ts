/**
 * Commentary and Announcer System
 *
 * Dynamic play-by-play and color commentary system with context-aware dialogue,
 * player-specific callouts, excitement modulation, multiple announcer personalities,
 * and intelligent audio mixing.
 */

// ============================================================================
// Interfaces and Types
// ============================================================================

/**
 * Announcer personality type
 */
export type AnnouncerPersonality =
  | 'professional' // Neutral, informative
  | 'enthusiastic' // High energy, excited
  | 'analytical' // Stats-focused, technical
  | 'homer' // Biased toward home team
  | 'legendary' // Iconic, catchphrases
  | 'comedic'; // Humorous, witty

/**
 * Commentary type
 */
export type CommentaryType =
  | 'play_by_play' // Real-time play description
  | 'color' // Analysis and background
  | 'reaction' // Emotional reactions
  | 'intro' // Game/inning introductions
  | 'outro' // Game/inning conclusions
  | 'filler' // Between-play banter
  | 'statistics' // Stats and records
  | 'player_spotlight' // Player info
  | 'crowd_noise'; // Crowd reactions

/**
 * Game situation for context
 */
export interface CommentarySituation {
  inning: number;
  outs: number;
  balls: number;
  strikes: number;
  score: { home: number; away: number };
  runners: { first: boolean; second: boolean; third: boolean };

  // Current play
  currentEvent?: string;
  lastEvent?: string;
  eventImportance: number; // 0-100

  // Players
  batterId?: string;
  pitcherId?: string;
  fielderId?: string;

  // Game state
  gameTime: number; // seconds elapsed
  isClutch: boolean; // High-pressure situation
  momentum: 'home' | 'away' | 'neutral';
}

/**
 * Commentary line
 */
export interface CommentaryLine {
  id: string;
  text: string;
  audioFile?: string; // Path to pre-recorded audio
  duration: number; // seconds
  type: CommentaryType;
  personality: AnnouncerPersonality;

  // Triggers
  triggers: {
    events: string[]; // Event types that trigger this line
    minExcitement?: number; // 0-100
    maxExcitement?: number;
    situations?: string[]; // Specific game situations
    playerIds?: string[]; // Specific players
  };

  // Metadata
  priority: number; // 0-100 (higher = more important)
  cooldown: number; // seconds before can be used again
  lastUsed: number; // timestamp
  usageCount: number;
  maxUsagePerGame: number; // Max times per game (0 = unlimited)

  // Variables (for dynamic text)
  variables: Map<string, string>; // e.g., {player}: "John Doe"
}

/**
 * Announcer voice configuration
 */
export interface AnnouncerVoice {
  id: string;
  name: string;
  personality: AnnouncerPersonality;

  // Voice characteristics
  pitch: number; // 0.5 to 2.0
  rate: number; // 0.5 to 2.0 (speed)
  volume: number; // 0.0 to 1.0

  // Commentary style
  verbosity: number; // 0-100 (how much they talk)
  excitementMultiplier: number; // 1.0 = normal
  favoriteTeam?: string; // For homer personalities
  catchphrases: string[]; // Signature phrases

  // Audio
  audioEnabled: boolean;
  ttsEnabled: boolean; // Text-to-speech if no audio file
}

/**
 * Commentary queue entry
 */
export interface CommentaryQueueEntry {
  line: CommentaryLine;
  priority: number;
  timestamp: number;
  delay: number; // seconds to wait before playing
  interrupt: boolean; // Can interrupt current commentary
}

/**
 * Commentary analytics
 */
export interface CommentaryAnalytics {
  totalLinesPlayed: number;
  totalDuration: number; // seconds
  linesByType: Map<CommentaryType, number>;
  linesByPersonality: Map<AnnouncerPersonality, number>;

  // Popular lines
  mostUsedLines: Array<{
    lineId: string;
    text: string;
    count: number;
  }>;

  // Timing
  avgTimeBetweenLines: number; // seconds
  silencePeriods: number; // Times with no commentary

  // Quality metrics
  interruptionCount: number;
  queueOverflows: number; // Times queue was full
  contextualAccuracy: number; // 0-100 (how relevant the commentary was)
}

/**
 * Crowd reaction configuration
 */
export interface CrowdReaction {
  type: 'cheer' | 'boo' | 'gasp' | 'chant' | 'applause' | 'silence';
  intensity: number; // 0-100
  duration: number; // seconds
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  audioFile: string;
  volume: number; // 0-1
}

// ============================================================================
// Commentary and Announcer System Class
// ============================================================================

export class CommentaryAnnouncerSystem {
  private announcers: Map<string, AnnouncerVoice>;
  private commentaryLines: Map<string, CommentaryLine>;
  private commentaryQueue: CommentaryQueueEntry[];
  private analytics: CommentaryAnalytics;

  // Active state
  private currentAnnouncer: AnnouncerVoice | null;
  private currentLine: CommentaryLine | null;
  private isPlaying: boolean;
  private isMuted: boolean;
  private lastCommentaryTime: number;

  // Configuration
  private readonly MAX_QUEUE_SIZE = 10;
  private readonly MIN_TIME_BETWEEN_LINES = 1.0; // seconds
  private readonly MAX_LINE_AGE = 5.0; // seconds (discard if older)

  // Audio context (for TTS and mixing)
  private audioContext: AudioContext | null;
  private currentAudioSource: AudioBufferSourceNode | null;

  constructor() {
    this.announcers = new Map();
    this.commentaryLines = new Map();
    this.commentaryQueue = [];
    this.currentAnnouncer = null;
    this.currentLine = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.lastCommentaryTime = 0;
    this.audioContext = null;
    this.currentAudioSource = null;

    this.analytics = {
      totalLinesPlayed: 0,
      totalDuration: 0,
      linesByType: new Map(),
      linesByPersonality: new Map(),
      mostUsedLines: [],
      avgTimeBetweenLines: 0,
      silencePeriods: 0,
      interruptionCount: 0,
      queueOverflows: 0,
      contextualAccuracy: 0
    };

    this.initialize();
  }

  // ========================================================================
  // Public API - Initialization
  // ========================================================================

  /**
   * Initialize the system
   */
  public initialize(): void {
    this.initializeAnnouncers();
    this.initializeCommentaryLines();
    this.initializeAudioContext();
  }

  /**
   * Set current announcer
   */
  public setAnnouncer(announcerId: string): boolean {
    const announcer = this.announcers.get(announcerId);
    if (!announcer) return false;

    this.currentAnnouncer = announcer;
    return true;
  }

  /**
   * Get current announcer
   */
  public getCurrentAnnouncer(): AnnouncerVoice | null {
    return this.currentAnnouncer;
  }

  /**
   * Get all announcers
   */
  public getAnnouncers(): AnnouncerVoice[] {
    return Array.from(this.announcers.values());
  }

  // ========================================================================
  // Public API - Commentary Triggering
  // ========================================================================

  /**
   * Trigger commentary for game event
   */
  public triggerCommentary(
    eventType: string,
    situation: CommentarySituation,
    forceImmediate: boolean = false
  ): void {
    if (this.isMuted) return;

    // Find appropriate commentary lines
    const candidates = this.findMatchingLines(eventType, situation);

    if (candidates.length === 0) return;

    // Select best line
    const selectedLine = this.selectBestLine(candidates, situation);

    if (!selectedLine) return;

    // Populate variables
    this.populateLineVariables(selectedLine, situation);

    // Add to queue
    this.queueCommentary(selectedLine, situation.eventImportance, forceImmediate);
  }

  /**
   * Trigger play-by-play commentary
   */
  public triggerPlayByPlay(
    playDescription: string,
    situation: CommentarySituation
  ): void {
    // Create on-the-fly play-by-play line
    const line: CommentaryLine = {
      id: `pbp_${Date.now()}`,
      text: playDescription,
      duration: this.estimateDuration(playDescription),
      type: 'play_by_play',
      personality: this.currentAnnouncer?.personality || 'professional',
      triggers: { events: [] },
      priority: 80,
      cooldown: 0,
      lastUsed: 0,
      usageCount: 0,
      maxUsagePerGame: 0,
      variables: new Map()
    };

    this.queueCommentary(line, situation.eventImportance, true);
  }

  /**
   * Trigger color commentary
   */
  public triggerColorCommentary(
    topic: string,
    situation: CommentarySituation
  ): void {
    const colorLines = this.findLinesByType('color');
    const relevantLines = colorLines.filter(line =>
      line.triggers.situations?.includes(topic)
    );

    if (relevantLines.length > 0) {
      const selected = this.selectRandomLine(relevantLines);
      this.populateLineVariables(selected, situation);
      this.queueCommentary(selected, 30, false); // Lower priority for color
    }
  }

  /**
   * Trigger crowd reaction
   */
  public triggerCrowdReaction(
    reactionType: CrowdReaction['type'],
    intensity: number
  ): void {
    // Would play crowd sound effects
    // Integration with audio system
  }

  // ========================================================================
  // Public API - Playback Control
  // ========================================================================

  /**
   * Update commentary system (call in game loop)
   */
  public update(deltaTime: number): void {
    // Check if current line finished
    if (this.isPlaying && this.currentLine) {
      // Would check audio playback status
      // For now, use estimated duration
      const elapsed = Date.now() - this.lastCommentaryTime;

      if (elapsed >= this.currentLine.duration * 1000) {
        this.onLineFinished();
      }
    }

    // Try to play next line in queue
    if (!this.isPlaying && this.commentaryQueue.length > 0) {
      this.playNextInQueue();
    }

    // Clean old entries from queue
    this.cleanQueue();
  }

  /**
   * Mute commentary
   */
  public mute(): void {
    this.isMuted = true;
    this.stopCurrent();
  }

  /**
   * Unmute commentary
   */
  public unmute(): void {
    this.isMuted = false;
  }

  /**
   * Stop current commentary
   */
  public stopCurrent(): void {
    if (this.currentAudioSource) {
      this.currentAudioSource.stop();
      this.currentAudioSource = null;
    }

    this.isPlaying = false;
    this.currentLine = null;
  }

  /**
   * Clear commentary queue
   */
  public clearQueue(): void {
    this.commentaryQueue = [];
  }

  // ========================================================================
  // Public API - Custom Lines
  // ========================================================================

  /**
   * Add custom commentary line
   */
  public addCommentaryLine(line: CommentaryLine): void {
    this.commentaryLines.set(line.id, line);
  }

  /**
   * Remove commentary line
   */
  public removeCommentaryLine(lineId: string): boolean {
    return this.commentaryLines.delete(lineId);
  }

  /**
   * Get all commentary lines
   */
  public getCommentaryLines(): CommentaryLine[] {
    return Array.from(this.commentaryLines.values());
  }

  /**
   * Get lines by type
   */
  public getLinesByType(type: CommentaryType): CommentaryLine[] {
    return Array.from(this.commentaryLines.values()).filter(l => l.type === type);
  }

  // ========================================================================
  // Public API - Analytics
  // ========================================================================

  /**
   * Get commentary analytics
   */
  public getAnalytics(): CommentaryAnalytics {
    return { ...this.analytics };
  }

  /**
   * Reset analytics
   */
  public resetAnalytics(): void {
    this.analytics = {
      totalLinesPlayed: 0,
      totalDuration: 0,
      linesByType: new Map(),
      linesByPersonality: new Map(),
      mostUsedLines: [],
      avgTimeBetweenLines: 0,
      silencePeriods: 0,
      interruptionCount: 0,
      queueOverflows: 0,
      contextualAccuracy: 0
    };
  }

  // ========================================================================
  // Private Helper Methods - Line Selection
  // ========================================================================

  private findMatchingLines(
    eventType: string,
    situation: CommentarySituation
  ): CommentaryLine[] {
    const matches: CommentaryLine[] = [];

    this.commentaryLines.forEach(line => {
      // Check if event matches
      if (!line.triggers.events.includes(eventType)) return;

      // Check excitement range
      if (line.triggers.minExcitement && situation.eventImportance < line.triggers.minExcitement) return;
      if (line.triggers.maxExcitement && situation.eventImportance > line.triggers.maxExcitement) return;

      // Check cooldown
      const timeSinceLastUse = Date.now() - line.lastUsed;
      if (timeSinceLastUse < line.cooldown * 1000) return;

      // Check usage limit
      if (line.maxUsagePerGame > 0 && line.usageCount >= line.maxUsagePerGame) return;

      // Check personality match
      if (this.currentAnnouncer && line.personality !== this.currentAnnouncer.personality) {
        // Allow some cross-personality usage
        if (Math.random() > 0.3) return;
      }

      matches.push(line);
    });

    return matches;
  }

  private selectBestLine(
    candidates: CommentaryLine[],
    situation: CommentarySituation
  ): CommentaryLine | null {
    if (candidates.length === 0) return null;

    // Score each candidate
    const scored = candidates.map(line => ({
      line,
      score: this.scoreLineRelevance(line, situation)
    }));

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    // Return best with some randomness
    const topCandidates = scored.slice(0, Math.min(3, scored.length));
    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];

    return selected.line;
  }

  private scoreLineRelevance(
    line: CommentaryLine,
    situation: CommentarySituation
  ): number {
    let score = line.priority;

    // Boost for freshness (haven't used recently)
    const timeSinceLastUse = Date.now() - line.lastUsed;
    score += Math.min(20, (timeSinceLastUse / 60000) * 5); // Up to +20 for 4+ min

    // Penalty for high usage
    score -= line.usageCount * 2;

    // Situational bonuses
    if (situation.isClutch && line.triggers.situations?.includes('clutch')) {
      score += 25;
    }

    if (situation.eventImportance > 80 && line.triggers.minExcitement && line.triggers.minExcitement >= 70) {
      score += 15;
    }

    return score;
  }

  private selectRandomLine(lines: CommentaryLine[]): CommentaryLine {
    return lines[Math.floor(Math.random() * lines.length)];
  }

  private findLinesByType(type: CommentaryType): CommentaryLine[] {
    return Array.from(this.commentaryLines.values()).filter(l => l.type === type);
  }

  // ========================================================================
  // Private Helper Methods - Queue Management
  // ========================================================================

  private queueCommentary(
    line: CommentaryLine,
    priority: number,
    interrupt: boolean
  ): void {
    // Check if queue is full
    if (this.commentaryQueue.length >= this.MAX_QUEUE_SIZE) {
      this.analytics.queueOverflows++;

      // Remove lowest priority item
      this.commentaryQueue.sort((a, b) => a.priority - b.priority);
      this.commentaryQueue.shift();
    }

    // Create queue entry
    const entry: CommentaryQueueEntry = {
      line,
      priority,
      timestamp: Date.now(),
      delay: 0,
      interrupt
    };

    // Add to queue
    this.commentaryQueue.push(entry);

    // Sort by priority
    this.commentaryQueue.sort((a, b) => b.priority - a.priority);

    // If interrupt and not currently playing something more important
    if (interrupt && this.isPlaying && this.currentLine) {
      if (priority > this.currentLine.priority) {
        this.stopCurrent();
        this.analytics.interruptionCount++;
      }
    }
  }

  private playNextInQueue(): void {
    if (this.commentaryQueue.length === 0) return;

    // Check min time between lines
    const timeSinceLastLine = (Date.now() - this.lastCommentaryTime) / 1000;
    if (timeSinceLastLine < this.MIN_TIME_BETWEEN_LINES) return;

    // Get next entry
    const entry = this.commentaryQueue.shift()!;

    // Check if too old
    const age = (Date.now() - entry.timestamp) / 1000;
    if (age > this.MAX_LINE_AGE) {
      // Too old, skip
      return;
    }

    // Play the line
    this.playLine(entry.line);
  }

  private cleanQueue(): void {
    const now = Date.now();

    this.commentaryQueue = this.commentaryQueue.filter(entry => {
      const age = (now - entry.timestamp) / 1000;
      return age <= this.MAX_LINE_AGE;
    });
  }

  // ========================================================================
  // Private Helper Methods - Playback
  // ========================================================================

  private playLine(line: CommentaryLine): void {
    this.currentLine = line;
    this.isPlaying = true;
    this.lastCommentaryTime = Date.now();

    // Update line metadata
    line.lastUsed = Date.now();
    line.usageCount++;

    // Update analytics
    this.analytics.totalLinesPlayed++;
    this.analytics.totalDuration += line.duration;

    const typeCount = this.analytics.linesByType.get(line.type) || 0;
    this.analytics.linesByType.set(line.type, typeCount + 1);

    const personalityCount = this.analytics.linesByPersonality.get(line.personality) || 0;
    this.analytics.linesByPersonality.set(line.personality, personalityCount + 1);

    // Play audio
    if (line.audioFile && this.currentAnnouncer?.audioEnabled) {
      this.playAudioFile(line.audioFile);
    } else if (this.currentAnnouncer?.ttsEnabled) {
      this.speakText(line.text);
    } else {
      // Just display text, no audio
      console.log(`[Commentary] ${line.text}`);
    }
  }

  private onLineFinished(): void {
    this.isPlaying = false;
    this.currentLine = null;
  }

  private playAudioFile(audioFile: string): void {
    // Load and play audio file
    // Would integrate with game's audio system
    // For now, just log
    console.log(`Playing audio: ${audioFile}`);
  }

  private speakText(text: string): void {
    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);

      if (this.currentAnnouncer) {
        utterance.pitch = this.currentAnnouncer.pitch;
        utterance.rate = this.currentAnnouncer.rate;
        utterance.volume = this.currentAnnouncer.volume;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      console.log(`[TTS] ${text}`);
    }
  }

  // ========================================================================
  // Private Helper Methods - Variables
  // ========================================================================

  private populateLineVariables(
    line: CommentaryLine,
    situation: CommentarySituation
  ): void {
    // Clear existing variables
    line.variables.clear();

    // Populate with current situation data
    if (situation.batterId) {
      line.variables.set('batter', situation.batterId);
    }

    if (situation.pitcherId) {
      line.variables.set('pitcher', situation.pitcherId);
    }

    if (situation.fielderId) {
      line.variables.set('fielder', situation.fielderId);
    }

    line.variables.set('inning', situation.inning.toString());
    line.variables.set('outs', situation.outs.toString());
    line.variables.set('balls', situation.balls.toString());
    line.variables.set('strikes', situation.strikes.toString());

    line.variables.set('home_score', situation.score.home.toString());
    line.variables.set('away_score', situation.score.away.toString());

    // Replace variables in text
    let text = line.text;

    line.variables.forEach((value, key) => {
      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });

    line.text = text;
  }

  private estimateDuration(text: string): number {
    // Rough estimate: ~150 words per minute = 2.5 words per second
    const words = text.split(' ').length;
    return words / 2.5;
  }

  // ========================================================================
  // Private Helper Methods - Initialization
  // ========================================================================

  private initializeAnnouncers(): void {
    // Professional announcer
    this.announcers.set('professional', {
      id: 'professional',
      name: 'Pro Announcer',
      personality: 'professional',
      pitch: 1.0,
      rate: 1.0,
      volume: 0.8,
      verbosity: 70,
      excitementMultiplier: 1.0,
      catchphrases: [
        'And here we go!',
        'What a play!',
        'Unbelievable!'
      ],
      audioEnabled: false,
      ttsEnabled: true
    });

    // Enthusiastic announcer
    this.announcers.set('enthusiastic', {
      id: 'enthusiastic',
      name: 'Hype Guy',
      personality: 'enthusiastic',
      pitch: 1.2,
      rate: 1.3,
      volume: 0.9,
      verbosity: 85,
      excitementMultiplier: 1.5,
      catchphrases: [
        'OH MY GOODNESS!',
        'ARE YOU KIDDING ME?!',
        'THIS IS INSANE!',
        'WHAT A MOMENT!'
      ],
      audioEnabled: false,
      ttsEnabled: true
    });

    // Analytical announcer
    this.announcers.set('analytical', {
      id: 'analytical',
      name: 'The Analyst',
      personality: 'analytical',
      pitch: 0.9,
      rate: 0.9,
      volume: 0.7,
      verbosity: 90,
      excitementMultiplier: 0.7,
      catchphrases: [
        'Looking at the numbers...',
        'Statistically speaking...',
        'From a strategic standpoint...'
      ],
      audioEnabled: false,
      ttsEnabled: true
    });

    // Homer announcer
    this.announcers.set('homer', {
      id: 'homer',
      name: 'Home Team Fan',
      personality: 'homer',
      pitch: 1.1,
      rate: 1.2,
      volume: 0.85,
      verbosity: 80,
      excitementMultiplier: 2.0, // Very excited for home team
      favoriteTeam: 'home',
      catchphrases: [
        'That\'s our boys!',
        'How about that!',
        'They can do it!'
      ],
      audioEnabled: false,
      ttsEnabled: true
    });

    // Set default
    this.currentAnnouncer = this.announcers.get('professional')!;
  }

  private initializeCommentaryLines(): void {
    // Play-by-play lines
    this.addLine({
      id: 'pbp_strike',
      text: 'Strike! {balls}-{strikes}',
      type: 'play_by_play',
      personality: 'professional',
      events: ['strike'],
      priority: 60
    });

    this.addLine({
      id: 'pbp_ball',
      text: 'Ball. {balls}-{strikes}',
      type: 'play_by_play',
      personality: 'professional',
      events: ['ball'],
      priority: 50
    });

    this.addLine({
      id: 'pbp_hit',
      text: 'Base hit for {batter}!',
      type: 'play_by_play',
      personality: 'professional',
      events: ['hit'],
      priority: 75
    });

    this.addLine({
      id: 'pbp_home_run',
      text: 'IT\'S GONE! HOME RUN for {batter}!',
      type: 'play_by_play',
      personality: 'enthusiastic',
      events: ['home_run'],
      priority: 100,
      minExcitement: 80
    });

    this.addLine({
      id: 'pbp_strikeout',
      text: 'Strikeout! {pitcher} gets {batter} looking!',
      type: 'play_by_play',
      personality: 'professional',
      events: ['strikeout'],
      priority: 70
    });

    this.addLine({
      id: 'pbp_double_play',
      text: 'Double play! What a defensive gem!',
      type: 'play_by_play',
      personality: 'enthusiastic',
      events: ['double_play'],
      priority: 90,
      minExcitement: 70
    });

    // Color commentary
    this.addLine({
      id: 'color_clutch',
      text: 'This is a huge moment in the game. The pressure is on.',
      type: 'color',
      personality: 'analytical',
      events: [],
      priority: 40,
      situations: ['clutch']
    });

    this.addLine({
      id: 'color_momentum',
      text: 'You can feel the momentum shifting here.',
      type: 'color',
      personality: 'professional',
      events: [],
      priority: 35,
      situations: ['momentum_shift']
    });

    // Reactions
    this.addLine({
      id: 'reaction_amazing',
      text: 'WOW! What an incredible play!',
      type: 'reaction',
      personality: 'enthusiastic',
      events: ['amazing_catch', 'amazing_hit'],
      priority: 95,
      minExcitement: 85
    });

    this.addLine({
      id: 'reaction_close',
      text: 'That was close! Very close!',
      type: 'reaction',
      personality: 'professional',
      events: ['close_play'],
      priority: 65
    });

    // Intros
    this.addLine({
      id: 'intro_game',
      text: 'Welcome to today\'s game! It\'s going to be a good one!',
      type: 'intro',
      personality: 'professional',
      events: ['game_start'],
      priority: 80,
      maxUsagePerGame: 1
    });

    this.addLine({
      id: 'intro_inning',
      text: 'We\'re heading to the {inning} inning!',
      type: 'intro',
      personality: 'professional',
      events: ['inning_start'],
      priority: 50
    });

    // Statistics
    this.addLine({
      id: 'stats_batting',
      text: '{batter} is batting .300 this season. Very impressive.',
      type: 'statistics',
      personality: 'analytical',
      events: ['batter_up'],
      priority: 30
    });

    this.addLine({
      id: 'stats_pitching',
      text: '{pitcher} has a 2.50 ERA. One of the best in the league.',
      type: 'statistics',
      personality: 'analytical',
      events: ['pitcher_start'],
      priority: 30
    });
  }

  private addLine(config: {
    id: string;
    text: string;
    type: CommentaryType;
    personality: AnnouncerPersonality;
    events: string[];
    priority: number;
    minExcitement?: number;
    maxExcitement?: number;
    situations?: string[];
    maxUsagePerGame?: number;
  }): void {
    const line: CommentaryLine = {
      id: config.id,
      text: config.text,
      duration: this.estimateDuration(config.text),
      type: config.type,
      personality: config.personality,
      triggers: {
        events: config.events,
        minExcitement: config.minExcitement,
        maxExcitement: config.maxExcitement,
        situations: config.situations
      },
      priority: config.priority,
      cooldown: 30, // 30 seconds default
      lastUsed: 0,
      usageCount: 0,
      maxUsagePerGame: config.maxUsagePerGame || 0,
      variables: new Map()
    };

    this.commentaryLines.set(line.id, line);
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new AudioContext();
    } catch (error) {
      console.warn('AudioContext not available:', error);
    }
  }
}
