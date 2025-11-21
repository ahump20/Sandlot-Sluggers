/**
 * Team Chemistry and Morale System
 *
 * Comprehensive team dynamics system tracking player relationships, chemistry,
 * morale, personality conflicts, clubhouse atmosphere, and performance impacts.
 * Includes leadership mechanics, team events, and momentum systems.
 */

// ============================================================================
// Interfaces and Types
// ============================================================================

/**
 * Player personality types
 */
export type PersonalityType =
  | 'leader'
  | 'veteran'
  | 'hothead'
  | 'joker'
  | 'quiet'
  | 'professional'
  | 'rebel'
  | 'clutch'
  | 'showboat'
  | 'team_player';

/**
 * Player personality traits
 */
export interface PersonalityTraits {
  type: PersonalityType;
  confidence: number; // 0-100
  ego: number; // 0-100 (high ego can cause conflicts)
  workEthic: number; // 0-100
  leadership: number; // 0-100 (ability to inspire teammates)
  adaptability: number; // 0-100 (how well they handle change)
  temperament: number; // 0-100 (100 = calm, 0 = volatile)
  charisma: number; // 0-100 (likability)
  competitiveness: number; // 0-100

  // Preferences
  likesAttention: boolean;
  prefersRoutine: boolean;
  valuesTradition: boolean;
}

/**
 * Relationship between two players
 */
export interface PlayerRelationship {
  player1Id: string;
  player2Id: string;
  chemistry: number; // -100 to 100 (negative = conflict, positive = bond)
  trust: number; // 0-100
  respect: number; // 0-100
  friendship: number; // 0-100

  // Relationship status
  status: 'best_friends' | 'friends' | 'teammates' | 'neutral' | 'tense' | 'enemies';

  // History
  posit iveInteractions: number;
  negativeInteractions: number;
  gamesPlayedTogether: number;
  sharedAchievements: string[];
  conflicts: Array<{
    timestamp: number;
    reason: string;
    severity: 'minor' | 'moderate' | 'major';
  }>;
}

/**
 * Player morale state
 */
export interface PlayerMorale {
  playerId: string;
  overall: number; // 0-100 (composite morale score)

  // Morale components
  performance: number; // 0-100 (based on recent stats)
  teamSuccess: number; // 0-100 (based on team record)
  playingTime: number; // 0-100 (satisfaction with playing time)
  relationships: number; // 0-100 (quality of team relationships)
  confidence: number; // 0-100 (belief in abilities)
  health: number; // 0-100 (physical condition)

  // Trends
  trend: 'rising' | 'stable' | 'declining';
  recentChanges: Array<{
    timestamp: number;
    change: number;
    reason: string;
  }>;

  // Thresholds
  isElated: boolean; // Morale > 85
  isContent: boolean; // Morale 50-85
  isFrustrated: boolean; // Morale 25-50
  isDemoralized: boolean; // Morale < 25
}

/**
 * Team morale and chemistry state
 */
export interface TeamMorale {
  teamId: string;
  overall: number; // 0-100 (team average)

  // Team chemistry
  chemistry: number; // 0-100 (how well team works together)
  cohesion: number; // 0-100 (unity and togetherness)
  trust: number; // 0-100 (mutual trust)
  communication: number; // 0-100 (how well they communicate)

  // Clubhouse atmosphere
  atmosphere: 'electric' | 'positive' | 'professional' | 'tense' | 'toxic';
  energy: number; // 0-100
  focus: number; // 0-100
  resilience: number; // 0-100 (ability to bounce back)

  // Momentum
  momentum: number; // -100 to 100
  confidence: number; // 0-100
  winStreak: number;
  lossStreak: number;

  // Issues
  activeConflicts: number;
  cliques: number; // Number of cliques/subgroups
  problemPlayers: string[]; // Players causing issues
}

/**
 * Team event (affects morale and chemistry)
 */
export interface TeamEvent {
  type:
    | 'team_meeting'
    | 'bonding_activity'
    | 'team_dinner'
    | 'practice'
    | 'film_session'
    | 'charity_event'
    | 'celebration'
    | 'confrontation'
    | 'trade'
    | 'injury'
    | 'milestone'
    | 'win'
    | 'loss'
    | 'comeback'
    | 'blowout';

  timestamp: number;
  description: string;
  participantIds: string[]; // Players involved

  // Impact
  moraleImpact: number; // -50 to 50
  chemistryImpact: number; // -50 to 50
  affectedPlayers: Map<string, number>; // Player-specific impacts

  // Outcomes
  outcomes: string[];
}

/**
 * Leadership influence
 */
export interface LeadershipInfluence {
  leaderId: string;
  leadershipRating: number; // 0-100

  // Influence areas
  moraleBoost: number; // % boost to team morale
  chemistryBoost: number; // % boost to chemistry
  performanceBoost: number; // % boost to performance
  conflictResolution: number; // 0-100 (ability to resolve conflicts)

  // Actions
  canCallTeamMeeting: boolean;
  canMentorPlayers: boolean;
  canMediateConflicts: boolean;

  // Followers
  followers: string[]; // Players who look up to this leader
  influence: Map<string, number>; // Influence on each player (0-100)
}

/**
 * Chemistry bonus effects on performance
 */
export interface ChemistryBonus {
  teamId: string;

  // Performance multipliers (1.0 = no effect)
  battingBonus: number; // 0.8 to 1.2
  pitchingBonus: number; // 0.8 to 1.2
  fieldingBonus: number; // 0.8 to 1.2
  baseRunningBonus: number; // 0.8 to 1.2

  // Special bonuses
  clutchBonus: number; // Bonus in clutch situations
  rallyCaps: boolean; // Team rallies more effectively
  defensiveSynergy: boolean; // Better defensive coordination

  // Penalty if chemistry is poor
  isPenalty: boolean;
}

/**
 * Clique or subgroup within team
 */
export interface TeamClique {
  id: string;
  memberIds: string[];
  chemistry: number; // 0-100 (chemistry within clique)
  exclusivity: number; // 0-100 (how exclusive/exclusive they are)
  influence: number; // 0-100 (influence on team)

  // Clique type
  type: 'positive' | 'neutral' | 'negative';

  // Effects
  isHelpful: boolean; // Positive cliques can boost morale
  isHarmful: boolean; // Negative cliques can divide team
}

/**
 * Conflict between players
 */
export interface PlayerConflict {
  id: string;
  player1Id: string;
  player2Id: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  startTime: number;
  isResolved: boolean;

  // Conflict details
  reason: string;
  triggeringEvent: string;
  publicKnowledge: boolean; // Is it known to whole team?

  // Impact
  moraleImpact: number; // -50 to 0
  chemistryImpact: number; // -50 to 0
  affectedPlayers: string[]; // Other players affected

  // Resolution
  resolutionAttempts: number;
  resolutionMethod?: 'mediation' | 'time' | 'trade' | 'apology';
  resolvedBy?: string; // Player or coach who resolved it
}

// ============================================================================
// Team Chemistry and Morale System Class
// ============================================================================

export class TeamChemistryMoraleSystem {
  private players: Map<string, PersonalityTraits>;
  private relationships: Map<string, PlayerRelationship>; // Key: "player1_player2"
  private playerMorale: Map<string, PlayerMorale>;
  private teamMorale: Map<string, TeamMorale>;
  private leaders: Map<string, LeadershipInfluence>;
  private conflicts: Map<string, PlayerConflict>;
  private cliques: Map<string, TeamClique>;
  private teamEvents: Map<string, TeamEvent[]>; // Team ID -> events

  // Configuration
  private readonly MORALE_DECAY_RATE = 0.5; // Points per day without positive events
  private readonly CHEMISTRY_BUILD_RATE = 1.0; // Points per shared positive experience
  private readonly CONFLICT_THRESHOLD = -30; // Chemistry level that creates conflict

  constructor() {
    this.players = new Map();
    this.relationships = new Map();
    this.playerMorale = new Map();
    this.teamMorale = new Map();
    this.leaders = new Map();
    this.conflicts = new Map();
    this.cliques = new Map();
    this.teamEvents = new Map();
  }

  // ========================================================================
  // Public API - Initialization
  // ========================================================================

  /**
   * Register player personality
   */
  public registerPlayer(playerId: string, personality: PersonalityTraits): void {
    this.players.set(playerId, personality);

    // Initialize morale
    if (!this.playerMorale.has(playerId)) {
      this.playerMorale.set(playerId, this.createInitialMorale(playerId));
    }

    // Check if player is a leader
    if (personality.leadership > 75) {
      this.initializeLeader(playerId, personality);
    }
  }

  /**
   * Initialize team
   */
  public initializeTeam(teamId: string, playerIds: string[]): void {
    // Create team morale
    const morale: TeamMorale = {
      teamId,
      overall: 70,
      chemistry: 60,
      cohesion: 60,
      trust: 60,
      communication: 60,
      atmosphere: 'professional',
      energy: 70,
      focus: 70,
      resilience: 60,
      momentum: 0,
      confidence: 70,
      winStreak: 0,
      lossStreak: 0,
      activeConflicts: 0,
      cliques: 0,
      problemPlayers: []
    };

    this.teamMorale.set(teamId, morale);
    this.teamEvents.set(teamId, []);

    // Create initial relationships between all players
    for (let i = 0; i < playerIds.length; i++) {
      for (let j = i + 1; j < playerIds.length; j++) {
        this.initializeRelationship(playerIds[i], playerIds[j]);
      }
    }
  }

  // ========================================================================
  // Public API - Relationships
  // ========================================================================

  /**
   * Get relationship between two players
   */
  public getRelationship(player1Id: string, player2Id: string): PlayerRelationship | null {
    const key = this.getRelationshipKey(player1Id, player2Id);
    return this.relationships.get(key) || null;
  }

  /**
   * Update relationship based on interaction
   */
  public recordInteraction(
    player1Id: string,
    player2Id: string,
    isPositive: boolean,
    magnitude: number = 5
  ): void {
    const relationship = this.getOrCreateRelationship(player1Id, player2Id);

    if (isPositive) {
      relationship.positiveInteractions++;
      relationship.chemistry += magnitude;
      relationship.friendship += magnitude * 0.5;
      relationship.trust += magnitude * 0.3;
    } else {
      relationship.negativeInteractions++;
      relationship.chemistry -= magnitude;
      relationship.respect -= magnitude * 0.3;

      // Check if this creates a conflict
      if (relationship.chemistry < this.CONFLICT_THRESHOLD) {
        this.createConflict(player1Id, player2Id, 'Poor chemistry', 'moderate');
      }
    }

    // Update relationship status
    this.updateRelationshipStatus(relationship);

    // Clamp values
    relationship.chemistry = Math.max(-100, Math.min(100, relationship.chemistry));
    relationship.trust = Math.max(0, Math.min(100, relationship.trust));
    relationship.respect = Math.max(0, Math.min(100, relationship.respect));
    relationship.friendship = Math.max(0, Math.min(100, relationship.friendship));
  }

  /**
   * Get all relationships for a player
   */
  public getPlayerRelationships(playerId: string): PlayerRelationship[] {
    const relationships: PlayerRelationship[] = [];

    this.relationships.forEach((rel) => {
      if (rel.player1Id === playerId || rel.player2Id === playerId) {
        relationships.push(rel);
      }
    });

    return relationships;
  }

  // ========================================================================
  // Public API - Morale
  // ========================================================================

  /**
   * Get player morale
   */
  public getPlayerMorale(playerId: string): PlayerMorale | null {
    return this.playerMorale.get(playerId) || null;
  }

  /**
   * Get team morale
   */
  public getTeamMorale(teamId: string): TeamMorale | null {
    return this.teamMorale.get(teamId) || null;
  }

  /**
   * Update player morale based on performance
   */
  public updateMoraleFromPerformance(
    playerId: string,
    performanceRating: number, // 0-100
    reason: string
  ): void {
    const morale = this.playerMorale.get(playerId);
    if (!morale) return;

    const oldPerformance = morale.performance;
    morale.performance = (oldPerformance * 0.7 + performanceRating * 0.3);

    // Calculate change
    const change = performanceRating - 50; // -50 to +50

    morale.recentChanges.push({
      timestamp: Date.now(),
      change: change * 0.2,
      reason
    });

    // Keep last 10 changes
    if (morale.recentChanges.length > 10) {
      morale.recentChanges.shift();
    }

    // Recalculate overall morale
    this.recalculatePlayerMorale(morale);
  }

  /**
   * Update team morale from game result
   */
  public updateTeamMoraleFromGame(
    teamId: string,
    won: boolean,
    scoreDiff: number,
    wasClutch: boolean = false
  ): void {
    const morale = this.teamMorale.get(teamId);
    if (!morale) return;

    if (won) {
      morale.winStreak++;
      morale.lossStreak = 0;

      // Momentum boost
      const momentumChange = 10 + (scoreDiff > 5 ? 10 : 0) + (wasClutch ? 15 : 0);
      morale.momentum = Math.min(100, morale.momentum + momentumChange);

      // Confidence boost
      morale.confidence = Math.min(100, morale.confidence + 3);

      // Chemistry boost
      morale.chemistry = Math.min(100, morale.chemistry + 2);

      // Record event
      this.recordTeamEvent(teamId, {
        type: wasClutch ? 'comeback' : scoreDiff > 5 ? 'blowout' : 'win',
        timestamp: Date.now(),
        description: `Team won by ${scoreDiff} runs`,
        participantIds: [],
        moraleImpact: 10 + momentumChange,
        chemistryImpact: 5,
        affectedPlayers: new Map(),
        outcomes: ['Boosted team morale', 'Increased momentum']
      });
    } else {
      morale.lossStreak++;
      morale.winStreak = 0;

      // Momentum loss
      const momentumChange = -10 - (scoreDiff > 5 ? -10 : 0);
      morale.momentum = Math.max(-100, morale.momentum + momentumChange);

      // Confidence drop
      morale.confidence = Math.max(0, morale.confidence - 2);

      // Record event
      this.recordTeamEvent(teamId, {
        type: scoreDiff > 5 ? 'blowout' : 'loss',
        timestamp: Date.now(),
        description: `Team lost by ${scoreDiff} runs`,
        participantIds: [],
        moraleImpact: -10 + momentumChange,
        chemistryImpact: -2,
        affectedPlayers: new Map(),
        outcomes: ['Decreased morale', 'Lost momentum']
      });
    }

    // Update atmosphere based on morale
    this.updateTeamAtmosphere(morale);

    // Recalculate overall
    this.recalculateTeamMorale(teamId);
  }

  // ========================================================================
  // Public API - Events
  // ========================================================================

  /**
   * Hold team meeting
   */
  public holdTeamMeeting(
    teamId: string,
    leaderId: string,
    focus: 'motivation' | 'accountability' | 'strategy'
  ): TeamEvent {
    const leader = this.leaders.get(leaderId);
    const effectiveness = leader ? leader.leadershipRating : 50;

    let moraleImpact = 0;
    let chemistryImpact = 0;
    const outcomes: string[] = [];

    switch (focus) {
      case 'motivation':
        moraleImpact = (effectiveness / 100) * 15;
        outcomes.push('Team feels motivated');
        break;
      case 'accountability':
        chemistryImpact = (effectiveness / 100) * 10;
        outcomes.push('Team holds each other accountable');
        break;
      case 'strategy':
        moraleImpact = (effectiveness / 100) * 5;
        chemistryImpact = (effectiveness / 100) * 5;
        outcomes.push('Team aligned on strategy');
        break;
    }

    const event: TeamEvent = {
      type: 'team_meeting',
      timestamp: Date.now(),
      description: `Team meeting led by ${leaderId} focusing on ${focus}`,
      participantIds: [],
      moraleImpact,
      chemistryImpact,
      affectedPlayers: new Map(),
      outcomes
    };

    this.applyTeamEvent(teamId, event);
    return event;
  }

  /**
   * Organize team bonding activity
   */
  public organizeBondingActivity(
    teamId: string,
    activityType: 'dinner' | 'outing' | 'practice' | 'charity',
    participantIds: string[]
  ): TeamEvent {
    let chemistryImpact = 10;
    let moraleImpact = 5;
    const outcomes: string[] = [];

    // Build relationships between participants
    for (let i = 0; i < participantIds.length; i++) {
      for (let j = i + 1; j < participantIds.length; j++) {
        this.recordInteraction(participantIds[i], participantIds[j], true, 3);
      }
    }

    outcomes.push(`${participantIds.length} players bonded`);
    outcomes.push('Team chemistry improved');

    const event: TeamEvent = {
      type: 'bonding_activity',
      timestamp: Date.now(),
      description: `Team ${activityType} with ${participantIds.length} players`,
      participantIds,
      moraleImpact,
      chemistryImpact,
      affectedPlayers: new Map(),
      outcomes
    };

    this.applyTeamEvent(teamId, event);
    return event;
  }

  /**
   * Handle player injury
   */
  public handleInjury(
    teamId: string,
    playerId: string,
    severity: 'minor' | 'moderate' | 'major'
  ): TeamEvent {
    let moraleImpact = 0;
    let chemistryImpact = 0;

    switch (severity) {
      case 'minor':
        moraleImpact = -5;
        break;
      case 'moderate':
        moraleImpact = -10;
        chemistryImpact = -5;
        break;
      case 'major':
        moraleImpact = -20;
        chemistryImpact = -10;
        break;
    }

    // Check if injured player is a leader
    const leader = this.leaders.get(playerId);
    if (leader) {
      moraleImpact *= 1.5; // Bigger impact if leader is injured
    }

    const event: TeamEvent = {
      type: 'injury',
      timestamp: Date.now(),
      description: `${playerId} suffered ${severity} injury`,
      participantIds: [playerId],
      moraleImpact,
      chemistryImpact,
      affectedPlayers: new Map([[playerId, -30]]),
      outcomes: ['Team morale decreased', 'Player sidelined']
    };

    this.applyTeamEvent(teamId, event);

    // Update injured player's morale
    const morale = this.playerMorale.get(playerId);
    if (morale) {
      morale.health = severity === 'major' ? 20 : severity === 'moderate' ? 50 : 70;
      this.recalculatePlayerMorale(morale);
    }

    return event;
  }

  // ========================================================================
  // Public API - Conflicts
  // ========================================================================

  /**
   * Get active conflicts
   */
  public getActiveConflicts(teamId?: string): PlayerConflict[] {
    const conflicts: PlayerConflict[] = [];

    this.conflicts.forEach((conflict) => {
      if (!conflict.isResolved) {
        conflicts.push(conflict);
      }
    });

    return conflicts;
  }

  /**
   * Attempt to resolve conflict
   */
  public resolveConflict(
    conflictId: string,
    mediatorId?: string
  ): { success: boolean; outcome: string } {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      return { success: false, outcome: 'Conflict not found' };
    }

    conflict.resolutionAttempts++;

    let successChance = 50; // Base 50% chance

    // Mediator bonus
    if (mediatorId) {
      const mediator = this.leaders.get(mediatorId);
      if (mediator) {
        successChance += mediator.conflictResolution * 0.5;
        conflict.resolvedBy = mediatorId;
        conflict.resolutionMethod = 'mediation';
      }
    }

    // Severity penalty
    switch (conflict.severity) {
      case 'minor':
        successChance += 20;
        break;
      case 'moderate':
        successChance += 0;
        break;
      case 'major':
        successChance -= 20;
        break;
      case 'critical':
        successChance -= 40;
        break;
    }

    // Check personalities
    const player1 = this.players.get(conflict.player1Id);
    const player2 = this.players.get(conflict.player2Id);

    if (player1 && player2) {
      const avgTemperament = (player1.temperament + player2.temperament) / 2;
      successChance += (avgTemperament - 50) * 0.3;
    }

    // Roll for success
    const success = Math.random() * 100 < successChance;

    if (success) {
      conflict.isResolved = true;

      // Improve relationship
      const relationship = this.getRelationship(conflict.player1Id, conflict.player2Id);
      if (relationship) {
        relationship.chemistry += 20;
        relationship.trust += 10;
        relationship.respect += 15;
        this.updateRelationshipStatus(relationship);
      }

      return {
        success: true,
        outcome: 'Conflict resolved successfully'
      };
    } else {
      return {
        success: false,
        outcome: 'Conflict remains unresolved'
      };
    }
  }

  // ========================================================================
  // Public API - Leadership
  // ========================================================================

  /**
   * Get team leaders
   */
  public getTeamLeaders(teamId: string): LeadershipInfluence[] {
    const leaders: LeadershipInfluence[] = [];

    this.leaders.forEach((leader) => {
      leaders.push(leader);
    });

    return leaders.sort((a, b) => b.leadershipRating - a.leadershipRating);
  }

  /**
   * Mentor player (leader -> mentee)
   */
  public mentorPlayer(
    leaderId: string,
    menteeId: string
  ): { success: boolean; impact: number } {
    const leader = this.leaders.get(leaderId);
    if (!leader || !leader.canMentorPlayers) {
      return { success: false, impact: 0 };
    }

    const mentee = this.playerMorale.get(menteeId);
    if (!mentee) {
      return { success: false, impact: 0 };
    }

    // Calculate impact
    const impact = (leader.leadershipRating / 100) * 10;

    // Boost mentee morale
    mentee.confidence = Math.min(100, mentee.confidence + impact);
    this.recalculatePlayerMorale(mentee);

    // Build relationship
    this.recordInteraction(leaderId, menteeId, true, 5);

    // Add to followers if not already
    if (!leader.followers.includes(menteeId)) {
      leader.followers.push(menteeId);
      leader.influence.set(menteeId, 50);
    } else {
      const currentInfluence = leader.influence.get(menteeId) || 0;
      leader.influence.set(menteeId, Math.min(100, currentInfluence + 10));
    }

    return { success: true, impact };
  }

  // ========================================================================
  // Public API - Performance Impact
  // ========================================================================

  /**
   * Get chemistry bonus for team
   */
  public getChemistryBonus(teamId: string): ChemistryBonus {
    const morale = this.teamMorale.get(teamId);
    if (!morale) {
      return this.createNeutralBonus(teamId);
    }

    // Calculate multipliers based on chemistry and morale
    const chemistryFactor = morale.chemistry / 100;
    const moraleFactor = morale.overall / 100;
    const avgFactor = (chemistryFactor + moraleFactor) / 2;

    // Bonuses range from 0.8 (poor chemistry) to 1.2 (great chemistry)
    const baseMultiplier = 0.8 + (avgFactor * 0.4);

    const battingBonus = baseMultiplier;
    const pitchingBonus = baseMultiplier;
    const fieldingBonus = baseMultiplier * 1.1; // Chemistry affects fielding more
    const baseRunningBonus = baseMultiplier;

    // Clutch bonus
    const clutchBonus = morale.confidence / 100;

    // Special bonuses
    const rallyCaps = morale.chemistry > 80 && morale.momentum > 50;
    const defensiveSynergy = morale.chemistry > 75;

    const isPenalty = avgFactor < 0.5;

    return {
      teamId,
      battingBonus,
      pitchingBonus,
      fieldingBonus,
      baseRunningBonus,
      clutchBonus,
      rallyCaps,
      defensiveSynergy,
      isPenalty
    };
  }

  /**
   * Get player performance multiplier based on morale
   */
  public getPlayerPerformanceMultiplier(playerId: string): number {
    const morale = this.playerMorale.get(playerId);
    if (!morale) return 1.0;

    // Morale affects performance: 0.7 to 1.3 multiplier
    return 0.7 + (morale.overall / 100) * 0.6;
  }

  // ========================================================================
  // Public API - Updates
  // ========================================================================

  /**
   * Daily update (call once per in-game day)
   */
  public dailyUpdate(teamId: string): void {
    // Decay morale slightly
    this.playerMorale.forEach((morale) => {
      morale.overall = Math.max(0, morale.overall - this.MORALE_DECAY_RATE);
      this.recalculatePlayerMorale(morale);
    });

    // Attempt to auto-resolve minor conflicts
    this.conflicts.forEach((conflict) => {
      if (conflict.severity === 'minor' && !conflict.isResolved) {
        if (Math.random() > 0.9) {
          // 10% chance per day for minor conflicts to resolve naturally
          conflict.isResolved = true;
          conflict.resolutionMethod = 'time';
        }
      }
    });

    // Recalculate team morale
    this.recalculateTeamMorale(teamId);
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  private createInitialMorale(playerId: string): PlayerMorale {
    return {
      playerId,
      overall: 70,
      performance: 70,
      teamSuccess: 70,
      playingTime: 70,
      relationships: 70,
      confidence: 70,
      health: 100,
      trend: 'stable',
      recentChanges: [],
      isElated: false,
      isContent: true,
      isFrustrated: false,
      isDemoralized: false
    };
  }

  private initializeLeader(playerId: string, personality: PersonalityTraits): void {
    const leader: LeadershipInfluence = {
      leaderId: playerId,
      leadershipRating: personality.leadership,
      moraleBoost: (personality.leadership / 100) * 10,
      chemistryBoost: (personality.leadership / 100) * 5,
      performanceBoost: (personality.leadership / 100) * 3,
      conflictResolution: personality.temperament,
      canCallTeamMeeting: personality.leadership > 80,
      canMentorPlayers: personality.leadership > 70,
      canMediateConflicts: personality.temperament > 70,
      followers: [],
      influence: new Map()
    };

    this.leaders.set(playerId, leader);
  }

  private getRelationshipKey(player1Id: string, player2Id: string): string {
    // Always use same order to ensure consistency
    return player1Id < player2Id
      ? `${player1Id}_${player2Id}`
      : `${player2Id}_${player1Id}`;
  }

  private initializeRelationship(player1Id: string, player2Id: string): void {
    const key = this.getRelationshipKey(player1Id, player2Id);

    if (this.relationships.has(key)) return;

    const player1 = this.players.get(player1Id);
    const player2 = this.players.get(player2Id);

    // Calculate initial chemistry based on personalities
    let initialChemistry = 50;

    if (player1 && player2) {
      // Similar personalities often get along better
      const personalityCompatibility = this.calculatePersonalityCompatibility(player1, player2);
      initialChemistry += personalityCompatibility;
    }

    const relationship: PlayerRelationship = {
      player1Id,
      player2Id,
      chemistry: initialChemistry,
      trust: 50,
      respect: 50,
      friendship: 40,
      status: 'teammates',
      positiveInteractions: 0,
      negativeInteractions: 0,
      gamesPlayedTogether: 0,
      sharedAchievements: [],
      conflicts: []
    };

    this.relationships.set(key, relationship);
  }

  private getOrCreateRelationship(player1Id: string, player2Id: string): PlayerRelationship {
    const key = this.getRelationshipKey(player1Id, player2Id);
    let relationship = this.relationships.get(key);

    if (!relationship) {
      this.initializeRelationship(player1Id, player2Id);
      relationship = this.relationships.get(key)!;
    }

    return relationship;
  }

  private updateRelationshipStatus(relationship: PlayerRelationship): void {
    const chem = relationship.chemistry;

    if (chem > 80) {
      relationship.status = 'best_friends';
    } else if (chem > 50) {
      relationship.status = 'friends';
    } else if (chem > 20) {
      relationship.status = 'teammates';
    } else if (chem > -20) {
      relationship.status = 'neutral';
    } else if (chem > -50) {
      relationship.status = 'tense';
    } else {
      relationship.status = 'enemies';
    }
  }

  private calculatePersonalityCompatibility(
    p1: PersonalityTraits,
    p2: PersonalityTraits
  ): number {
    let compatibility = 0;

    // Leaders get along with team players
    if (p1.type === 'leader' && p2.type === 'team_player') compatibility += 10;
    if (p2.type === 'leader' && p1.type === 'team_player') compatibility += 10;

    // Hotheads and showboats may clash
    if (p1.type === 'hothead' && p2.type === 'hothead') compatibility -= 15;
    if (p1.type === 'showboat' && p2.type === 'showboat') compatibility -= 10;

    // High ego players may clash
    if (p1.ego > 80 && p2.ego > 80) compatibility -= 10;

    // Temperament compatibility
    const temperamentDiff = Math.abs(p1.temperament - p2.temperament);
    compatibility -= temperamentDiff * 0.1;

    // Work ethic compatibility
    const workEthicDiff = Math.abs(p1.workEthic - p2.workEthic);
    if (workEthicDiff > 30) compatibility -= 5;

    return compatibility;
  }

  private recalculatePlayerMorale(morale: PlayerMorale): void {
    // Weighted average of components
    morale.overall =
      morale.performance * 0.25 +
      morale.teamSuccess * 0.20 +
      morale.playingTime * 0.15 +
      morale.relationships * 0.15 +
      morale.confidence * 0.15 +
      morale.health * 0.10;

    // Update thresholds
    morale.isElated = morale.overall > 85;
    morale.isContent = morale.overall >= 50 && morale.overall <= 85;
    morale.isFrustrated = morale.overall >= 25 && morale.overall < 50;
    morale.isDemoralized = morale.overall < 25;

    // Determine trend
    if (morale.recentChanges.length >= 3) {
      const recent = morale.recentChanges.slice(-3);
      const totalChange = recent.reduce((sum, c) => sum + c.change, 0);

      if (totalChange > 10) morale.trend = 'rising';
      else if (totalChange < -10) morale.trend = 'declining';
      else morale.trend = 'stable';
    }
  }

  private recalculateTeamMorale(teamId: string): void {
    const morale = this.teamMorale.get(teamId);
    if (!morale) return;

    // Calculate average player morale
    let totalMorale = 0;
    let count = 0;

    this.playerMorale.forEach((playerMorale) => {
      totalMorale += playerMorale.overall;
      count++;
    });

    morale.overall = count > 0 ? totalMorale / count : 70;

    // Calculate average chemistry from relationships
    let totalChemistry = 0;
    let chemCount = 0;

    this.relationships.forEach((rel) => {
      totalChemistry += Math.max(0, rel.chemistry); // Only count positive chemistry
      chemCount++;
    });

    morale.chemistry = chemCount > 0 ? totalChemistry / chemCount : 60;

    // Count active conflicts
    morale.activeConflicts = this.getActiveConflicts().length;

    // Update cohesion based on chemistry and conflicts
    morale.cohesion = morale.chemistry - (morale.activeConflicts * 5);
    morale.cohesion = Math.max(0, Math.min(100, morale.cohesion));
  }

  private updateTeamAtmosphere(morale: TeamMorale): void {
    const overall = morale.overall;
    const chemistry = morale.chemistry;

    if (overall > 85 && chemistry > 80) {
      morale.atmosphere = 'electric';
    } else if (overall > 70 && chemistry > 65) {
      morale.atmosphere = 'positive';
    } else if (overall > 50 && chemistry > 50) {
      morale.atmosphere = 'professional';
    } else if (overall > 30 || chemistry > 30) {
      morale.atmosphere = 'tense';
    } else {
      morale.atmosphere = 'toxic';
    }
  }

  private createConflict(
    player1Id: string,
    player2Id: string,
    reason: string,
    severity: PlayerConflict['severity']
  ): void {
    const id = `conflict_${player1Id}_${player2Id}_${Date.now()}`;

    const conflict: PlayerConflict = {
      id,
      player1Id,
      player2Id,
      severity,
      startTime: Date.now(),
      isResolved: false,
      reason,
      triggeringEvent: reason,
      publicKnowledge: severity === 'major' || severity === 'critical',
      moraleImpact: severity === 'critical' ? -30 : severity === 'major' ? -20 : severity === 'moderate' ? -10 : -5,
      chemistryImpact: severity === 'critical' ? -25 : severity === 'major' ? -15 : severity === 'moderate' ? -10 : -5,
      affectedPlayers: [player1Id, player2Id],
      resolutionAttempts: 0
    };

    this.conflicts.set(id, conflict);

    // Record in relationship
    const relationship = this.getRelationship(player1Id, player2Id);
    if (relationship) {
      relationship.conflicts.push({
        timestamp: Date.now(),
        reason,
        severity
      });
    }
  }

  private applyTeamEvent(teamId: string, event: TeamEvent): void {
    // Store event
    const events = this.teamEvents.get(teamId) || [];
    events.push(event);
    this.teamEvents.set(teamId, events);

    // Keep last 50 events
    if (events.length > 50) {
      events.shift();
    }

    // Apply morale impact to team
    const morale = this.teamMorale.get(teamId);
    if (morale) {
      morale.overall = Math.max(0, Math.min(100, morale.overall + event.moraleImpact));
      morale.chemistry = Math.max(0, Math.min(100, morale.chemistry + event.chemistryImpact));
    }

    // Apply individual impacts
    event.affectedPlayers.forEach((impact, playerId) => {
      const playerMorale = this.playerMorale.get(playerId);
      if (playerMorale) {
        playerMorale.overall = Math.max(0, Math.min(100, playerMorale.overall + impact));
        this.recalculatePlayerMorale(playerMorale);
      }
    });

    // Recalculate team morale
    this.recalculateTeamMorale(teamId);
  }

  private recordTeamEvent(teamId: string, event: TeamEvent): void {
    this.applyTeamEvent(teamId, event);
  }

  private createNeutralBonus(teamId: string): ChemistryBonus {
    return {
      teamId,
      battingBonus: 1.0,
      pitchingBonus: 1.0,
      fieldingBonus: 1.0,
      baseRunningBonus: 1.0,
      clutchBonus: 0.5,
      rallyCaps: false,
      defensiveSynergy: false,
      isPenalty: false
    };
  }

  // ========================================================================
  // Public API - Cliques
  // ========================================================================

  /**
   * Form a clique
   */
  public formClique(
    memberIds: string[],
    type: TeamClique['type']
  ): TeamClique {
    const id = `clique_${Date.now()}`;

    // Calculate chemistry within clique
    let totalChemistry = 0;
    let count = 0;

    for (let i = 0; i < memberIds.length; i++) {
      for (let j = i + 1; j < memberIds.length; j++) {
        const rel = this.getRelationship(memberIds[i], memberIds[j]);
        if (rel) {
          totalChemistry += rel.chemistry;
          count++;
        }
      }
    }

    const chemistry = count > 0 ? totalChemistry / count : 50;

    const clique: TeamClique = {
      id,
      memberIds,
      chemistry,
      exclusivity: type === 'negative' ? 70 : 40,
      influence: memberIds.length * 10,
      type,
      isHelpful: type === 'positive',
      isHarmful: type === 'negative'
    };

    this.cliques.set(id, clique);

    return clique;
  }

  /**
   * Get all cliques
   */
  public getCliques(): TeamClique[] {
    return Array.from(this.cliques.values());
  }
}
