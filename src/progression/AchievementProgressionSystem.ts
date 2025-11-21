/**
 * AchievementProgressionSystem.ts
 * Comprehensive achievement and player progression system with unlockables and rewards
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category:
    | 'batting'
    | 'pitching'
    | 'fielding'
    | 'baserunning'
    | 'career'
    | 'team'
    | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  icon: string;

  // Requirements
  requirements: AchievementRequirement[];
  isSecret: boolean; // Hidden until unlocked

  // Progress tracking
  progress: number; // 0-100
  isUnlocked: boolean;
  unlockedDate?: Date;

  // Rewards
  rewards: AchievementReward[];

  // Point value
  points: number; // Achievement points awarded
}

export interface AchievementRequirement {
  type:
    | 'stat_milestone'
    | 'game_event'
    | 'streak'
    | 'collection'
    | 'difficulty'
    | 'time_based';
  description: string;
  target: number | string;
  current: number | string;
  isCompleted: boolean;
}

export interface AchievementReward {
  type:
    | 'experience'
    | 'currency'
    | 'unlock_character'
    | 'unlock_stadium'
    | 'unlock_equipment'
    | 'unlock_ability'
    | 'cosmetic'
    | 'title';
  id: string;
  name: string;
  description: string;
  quantity?: number;
}

export interface PlayerProgression {
  playerName: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;

  // Prestige system
  prestigeLevel: number;
  prestigePoints: number;

  // Achievement progress
  achievements: Achievement[];
  unlockedAchievements: number;
  totalAchievements: number;
  achievementPoints: number;

  // Unlockables
  unlockedCharacters: string[];
  unlockedStadiums: string[];
  unlockedEquipment: string[];
  unlockedAbilities: string[];
  unlockedCosmetics: string[];
  unlockedTitles: string[];

  // Player stats for progression
  gamesPlayed: number;
  careerHomeRuns: number;
  careerHits: number;
  careerWins: number;
  careerStrikeouts: number;
  perfectGames: number;
  noHitters: number;

  // Skill points
  skillPoints: number;
  allocatedSkills: Map<string, number>;

  // Daily/Weekly challenges
  dailyStreak: number;
  lastPlayedDate: Date;
  weeklyProgress: WeeklyChallenges;

  // Seasonal rewards
  currentSeason: number;
  seasonalTier: 'rookie' | 'pro' | 'all-star' | 'mvp' | 'legend';
  seasonalProgress: number;
  seasonalRewards: SeasonalReward[];
}

export interface WeeklyChallenges {
  weekNumber: number;
  challenges: Challenge[];
  completedChallenges: number;
  weeklyReward: AchievementReward;
  isWeeklyRewardClaimed: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  requirement: AchievementRequirement;
  reward: AchievementReward;
  expiresAt: Date;
  isCompleted: boolean;
}

export interface SeasonalReward {
  tier: number;
  requiredProgress: number;
  reward: AchievementReward;
  isClaimed: boolean;
}

export interface SkillTree {
  categoryid: string;
  name: string;
  description: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'batting' | 'pitching' | 'fielding' | 'baserunning' | 'general';
  tier: 1 | 2 | 3 | 4 | 5;
  maxLevel: number;
  currentLevel: number;
  requiredSkillPoints: number;
  prerequisites: string[]; // Skill IDs required
  effects: SkillEffect[];
  icon: string;
}

export interface SkillEffect {
  stat: string;
  modifier: number;
  type: 'additive' | 'multiplicative' | 'special';
  description: string;
}

export interface MilestoneTracker {
  category: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  isCompleted: boolean;
  reward: AchievementReward;
  nextMilestone?: Milestone;
}

export class AchievementProgressionSystem {
  private progression: PlayerProgression;
  private allAchievements: Achievement[];
  private skillTrees: SkillTree[];
  private milestoneTrackers: Map<string, MilestoneTracker> = new Map();

  // XP Constants
  private readonly BASE_XP_PER_LEVEL = 1000;
  private readonly XP_MULTIPLIER_PER_LEVEL = 1.15;

  // Points Constants
  private readonly SKILL_POINTS_PER_LEVEL = 1;
  private readonly PRESTIGE_LEVEL_REQUIREMENT = 100;

  constructor(playerName: string) {
    this.progression = this.initializeProgression(playerName);
    this.allAchievements = this.createAllAchievements();
    this.skillTrees = this.createSkillTrees();
    this.initializeMilestoneTrackers();
  }

  /**
   * Initialize player progression
   */
  private initializeProgression(playerName: string): PlayerProgression {
    return {
      playerName,
      level: 1,
      currentXP: 0,
      xpToNextLevel: this.calculateXPForLevel(2),
      totalXP: 0,
      prestigeLevel: 0,
      prestigePoints: 0,
      achievements: this.createAllAchievements(),
      unlockedAchievements: 0,
      totalAchievements: 0,
      achievementPoints: 0,
      unlockedCharacters: ['default'],
      unlockedStadiums: ['sandlot'],
      unlockedEquipment: ['wooden_bat'],
      unlockedAbilities: [],
      unlockedCosmetics: [],
      unlockedTitles: ['rookie'],
      gamesPlayed: 0,
      careerHomeRuns: 0,
      careerHits: 0,
      careerWins: 0,
      careerStrikeouts: 0,
      perfectGames: 0,
      noHitters: 0,
      skillPoints: 0,
      allocatedSkills: new Map(),
      dailyStreak: 0,
      lastPlayedDate: new Date(),
      weeklyProgress: this.initializeWeeklyChallenges(),
      currentSeason: 1,
      seasonalTier: 'rookie',
      seasonalProgress: 0,
      seasonalRewards: this.createSeasonalRewards()
    };
  }

  /**
   * Award XP and check for level ups
   */
  public awardXP(amount: number, reason: string): LevelUpResult | null {
    this.progression.currentXP += amount;
    this.progression.totalXP += amount;

    console.log(`+${amount} XP: ${reason}`);

    // Check for level up
    if (this.progression.currentXP >= this.progression.xpToNextLevel) {
      return this.levelUp();
    }

    return null;
  }

  /**
   * Level up the player
   */
  private levelUp(): LevelUpResult {
    const oldLevel = this.progression.level;
    this.progression.level++;

    // Award skill points
    this.progression.skillPoints += this.SKILL_POINTS_PER_LEVEL;

    // Calculate new XP requirement
    const overflow = this.progression.currentXP - this.progression.xpToNextLevel;
    this.progression.currentXP = overflow;
    this.progression.xpToNextLevel = this.calculateXPForLevel(this.progression.level + 1);

    // Check for prestige
    if (this.progression.level >= this.PRESTIGE_LEVEL_REQUIREMENT) {
      this.progression.prestigeLevel++;
      this.progression.prestigePoints += 10;
      this.progression.level = 1;
    }

    // Unlock rewards for reaching this level
    const rewards = this.getRewardsForLevel(this.progression.level);

    console.log(`🎉 Level Up! ${oldLevel} → ${this.progression.level}`);
    console.log(`+${this.SKILL_POINTS_PER_LEVEL} Skill Point(s)`);

    return {
      newLevel: this.progression.level,
      oldLevel,
      skillPointsAwarded: this.SKILL_POINTS_PER_LEVEL,
      unlockedRewards: rewards,
      didPrestige: this.progression.prestigeLevel > 0
    };
  }

  /**
   * Calculate XP required for a level
   */
  private calculateXPForLevel(level: number): number {
    return Math.floor(this.BASE_XP_PER_LEVEL * Math.pow(this.XP_MULTIPLIER_PER_LEVEL, level - 1));
  }

  /**
   * Track game event for achievements
   */
  public trackGameEvent(
    eventType: string,
    data: any
  ): { newAchievements: Achievement[]; xpAwarded: number } {
    const unlockedAchievements: Achievement[] = [];
    let totalXP = 0;

    // Update progression stats
    this.updateProgressionStats(eventType, data);

    // Check all achievements
    this.progression.achievements.forEach(achievement => {
      if (!achievement.isUnlocked) {
        const wasCompleted = this.checkAchievementRequirements(achievement, eventType, data);

        if (wasCompleted) {
          achievement.isUnlocked = true;
          achievement.unlockedDate = new Date();
          achievement.progress = 100;

          // Award points
          this.progression.achievementPoints += achievement.points;
          this.progression.unlockedAchievements++;

          // Award rewards
          achievement.rewards.forEach(reward => {
            this.awardReward(reward);

            if (reward.type === 'experience') {
              totalXP += reward.quantity || 0;
            }
          });

          unlockedAchievements.push(achievement);

          console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
        } else {
          // Update progress
          this.updateAchievementProgress(achievement, eventType, data);
        }
      }
    });

    // Check challenges
    this.checkChallenges(eventType, data);

    return { newAchievements: unlockedAchievements, xpAwarded: totalXP };
  }

  /**
   * Update progression stats from game events
   */
  private updateProgressionStats(eventType: string, data: any): void {
    switch (eventType) {
      case 'game_completed':
        this.progression.gamesPlayed++;
        break;
      case 'home_run':
        this.progression.careerHomeRuns++;
        break;
      case 'hit':
        this.progression.careerHits++;
        break;
      case 'win':
        this.progression.careerWins++;
        break;
      case 'strikeout_pitched':
        this.progression.careerStrikeouts++;
        break;
      case 'perfect_game':
        this.progression.perfectGames++;
        break;
      case 'no_hitter':
        this.progression.noHitters++;
        break;
    }

    // Update daily streak
    const today = new Date();
    const lastPlayed = this.progression.lastPlayedDate;
    const daysDiff = Math.floor(
      (today.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      this.progression.dailyStreak++;
    } else if (daysDiff > 1) {
      this.progression.dailyStreak = 1;
    }

    this.progression.lastPlayedDate = today;
  }

  /**
   * Check if achievement requirements are met
   */
  private checkAchievementRequirements(
    achievement: Achievement,
    eventType: string,
    data: any
  ): boolean {
    return achievement.requirements.every(req => {
      switch (req.type) {
        case 'stat_milestone':
          return this.checkStatMilestone(req, eventType, data);
        case 'game_event':
          return this.checkGameEvent(req, eventType, data);
        case 'streak':
          return this.checkStreak(req);
        case 'collection':
          return this.checkCollection(req);
        case 'difficulty':
          return this.checkDifficulty(req, data);
        case 'time_based':
          return this.checkTimeBased(req);
        default:
          return false;
      }
    });
  }

  /**
   * Check stat milestone requirement
   */
  private checkStatMilestone(
    req: AchievementRequirement,
    eventType: string,
    data: any
  ): boolean {
    // Check various stat milestones
    if (req.description.includes('home runs')) {
      req.current = this.progression.careerHomeRuns;
      return this.progression.careerHomeRuns >= (req.target as number);
    }
    if (req.description.includes('hits')) {
      req.current = this.progression.careerHits;
      return this.progression.careerHits >= (req.target as number);
    }
    if (req.description.includes('wins')) {
      req.current = this.progression.careerWins;
      return this.progression.careerWins >= (req.target as number);
    }
    if (req.description.includes('strikeouts')) {
      req.current = this.progression.careerStrikeouts;
      return this.progression.careerStrikeouts >= (req.target as number);
    }

    return false;
  }

  /**
   * Check game event requirement
   */
  private checkGameEvent(
    req: AchievementRequirement,
    eventType: string,
    data: any
  ): boolean {
    return eventType === req.target;
  }

  /**
   * Check streak requirement
   */
  private checkStreak(req: AchievementRequirement): boolean {
    if (req.description.includes('daily')) {
      req.current = this.progression.dailyStreak;
      return this.progression.dailyStreak >= (req.target as number);
    }
    return false;
  }

  /**
   * Check collection requirement
   */
  private checkCollection(req: AchievementRequirement): boolean {
    if (req.description.includes('characters')) {
      req.current = this.progression.unlockedCharacters.length;
      return this.progression.unlockedCharacters.length >= (req.target as number);
    }
    if (req.description.includes('stadiums')) {
      req.current = this.progression.unlockedStadiums.length;
      return this.progression.unlockedStadiums.length >= (req.target as number);
    }
    return false;
  }

  /**
   * Check difficulty requirement
   */
  private checkDifficulty(req: AchievementRequirement, data: any): boolean {
    return data.difficulty === req.target;
  }

  /**
   * Check time-based requirement
   */
  private checkTimeBased(req: AchievementRequirement): boolean {
    // Check if current season matches, etc.
    return true; // Simplified
  }

  /**
   * Update achievement progress
   */
  private updateAchievementProgress(
    achievement: Achievement,
    eventType: string,
    data: any
  ): void {
    let totalProgress = 0;
    let completedReqs = 0;

    achievement.requirements.forEach(req => {
      if (req.type === 'stat_milestone' && typeof req.target === 'number') {
        const current = req.current as number;
        const target = req.target;
        const progress = Math.min(100, (current / target) * 100);
        totalProgress += progress;
        if (current >= target) completedReqs++;
      } else if (req.isCompleted) {
        totalProgress += 100;
        completedReqs++;
      }
    });

    achievement.progress = totalProgress / achievement.requirements.length;
  }

  /**
   * Award a reward to the player
   */
  private awardReward(reward: AchievementReward): void {
    switch (reward.type) {
      case 'unlock_character':
        if (!this.progression.unlockedCharacters.includes(reward.id)) {
          this.progression.unlockedCharacters.push(reward.id);
          console.log(`🎭 Character Unlocked: ${reward.name}`);
        }
        break;
      case 'unlock_stadium':
        if (!this.progression.unlockedStadiums.includes(reward.id)) {
          this.progression.unlockedStadiums.push(reward.id);
          console.log(`🏟️ Stadium Unlocked: ${reward.name}`);
        }
        break;
      case 'unlock_equipment':
        if (!this.progression.unlockedEquipment.includes(reward.id)) {
          this.progression.unlockedEquipment.push(reward.id);
          console.log(`⚾ Equipment Unlocked: ${reward.name}`);
        }
        break;
      case 'unlock_ability':
        if (!this.progression.unlockedAbilities.includes(reward.id)) {
          this.progression.unlockedAbilities.push(reward.id);
          console.log(`✨ Ability Unlocked: ${reward.name}`);
        }
        break;
      case 'cosmetic':
        if (!this.progression.unlockedCosmetics.includes(reward.id)) {
          this.progression.unlockedCosmetics.push(reward.id);
          console.log(`🎨 Cosmetic Unlocked: ${reward.name}`);
        }
        break;
      case 'title':
        if (!this.progression.unlockedTitles.includes(reward.id)) {
          this.progression.unlockedTitles.push(reward.id);
          console.log(`📜 Title Unlocked: ${reward.name}`);
        }
        break;
      case 'currency':
        // Would add currency (coins, gems, etc.)
        console.log(`💰 +${reward.quantity} ${reward.name}`);
        break;
    }
  }

  /**
   * Allocate skill point
   */
  public allocateSkillPoint(skillId: string): boolean {
    const skill = this.findSkill(skillId);

    if (!skill) {
      console.error(`Skill ${skillId} not found`);
      return false;
    }

    // Check if player has enough skill points
    if (this.progression.skillPoints < skill.requiredSkillPoints) {
      console.error('Not enough skill points');
      return false;
    }

    // Check prerequisites
    if (!this.checkSkillPrerequisites(skill)) {
      console.error('Prerequisites not met');
      return false;
    }

    // Check if already at max level
    if (skill.currentLevel >= skill.maxLevel) {
      console.error('Skill already at max level');
      return false;
    }

    // Allocate point
    skill.currentLevel++;
    this.progression.skillPoints -= skill.requiredSkillPoints;
    this.progression.allocatedSkills.set(skillId, skill.currentLevel);

    console.log(`📈 Skill Upgraded: ${skill.name} (Level ${skill.currentLevel})`);
    return true;
  }

  /**
   * Find a skill by ID
   */
  private findSkill(skillId: string): Skill | undefined {
    for (const tree of this.skillTrees) {
      const skill = tree.skills.find(s => s.id === skillId);
      if (skill) return skill;
    }
    return undefined;
  }

  /**
   * Check skill prerequisites
   */
  private checkSkillPrerequisites(skill: Skill): boolean {
    return skill.prerequisites.every(prereqId => {
      const prereq = this.findSkill(prereqId);
      return prereq && prereq.currentLevel > 0;
    });
  }

  /**
   * Check challenges
   */
  private checkChallenges(eventType: string, data: any): void {
    const now = new Date();

    this.progression.weeklyProgress.challenges.forEach(challenge => {
      if (!challenge.isCompleted && challenge.expiresAt > now) {
        const completed = this.checkAchievementRequirements(
          { requirements: [challenge.requirement] } as any,
          eventType,
          data
        );

        if (completed) {
          challenge.isCompleted = true;
          this.progression.weeklyProgress.completedChallenges++;
          this.awardReward(challenge.reward);
          console.log(`✅ Challenge Completed: ${challenge.name}`);
        }
      }
    });
  }

  /**
   * Initialize weekly challenges
   */
  private initializeWeeklyChallenges(): WeeklyChallenges {
    const weekNumber = this.getCurrentWeekNumber();
    const challenges: Challenge[] = [];

    // Generate 3 weekly challenges
    for (let i = 0; i < 3; i++) {
      challenges.push(this.generateRandomChallenge('weekly'));
    }

    return {
      weekNumber,
      challenges,
      completedChallenges: 0,
      weeklyReward: {
        type: 'currency',
        id: 'coins',
        name: 'Coins',
        quantity: 1000
      },
      isWeeklyRewardClaimed: false
    };
  }

  /**
   * Generate random challenge
   */
  private generateRandomChallenge(type: 'daily' | 'weekly' | 'special'): Challenge {
    const challenges: Challenge[] = [
      {
        id: `challenge_${Date.now()}_${Math.random()}`,
        name: 'Home Run Derby',
        description: 'Hit 5 home runs in a single game',
        type,
        difficulty: 'medium',
        requirement: {
          type: 'game_event',
          description: 'Hit 5 home runs',
          target: 5,
          current: 0,
          isCompleted: false
        },
        reward: {
          type: 'experience',
          id: 'xp',
          name: 'XP',
          quantity: 500
        },
        expiresAt: new Date(Date.now() + (type === 'daily' ? 24 : 168) * 60 * 60 * 1000),
        isCompleted: false
      },
      {
        id: `challenge_${Date.now()}_${Math.random()}`,
        name: 'Strikeout King',
        description: 'Strike out 10 batters in a game',
        type,
        difficulty: 'hard',
        requirement: {
          type: 'game_event',
          description: 'Strike out 10 batters',
          target: 10,
          current: 0,
          isCompleted: false
        },
        reward: {
          type: 'experience',
          id: 'xp',
          name: 'XP',
          quantity: 750
        },
        expiresAt: new Date(Date.now() + (type === 'daily' ? 24 : 168) * 60 * 60 * 1000),
        isCompleted: false
      },
      {
        id: `challenge_${Date.now()}_${Math.random()}`,
        name: 'Perfect Inning',
        description: 'Pitch a perfect inning (3 up, 3 down)',
        type,
        difficulty: 'easy',
        requirement: {
          type: 'game_event',
          description: 'Perfect inning',
          target: 'perfect_inning',
          current: 0,
          isCompleted: false
        },
        reward: {
          type: 'experience',
          id: 'xp',
          name: 'XP',
          quantity: 250
        },
        expiresAt: new Date(Date.now() + (type === 'daily' ? 24 : 168) * 60 * 60 * 1000),
        isCompleted: false
      }
    ];

    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  /**
   * Get current week number
   */
  private getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  }

  /**
   * Get rewards for reaching a level
   */
  private getRewardsForLevel(level: number): AchievementReward[] {
    const rewards: AchievementReward[] = [];

    // Every 5 levels: unlock cosmetic
    if (level % 5 === 0) {
      rewards.push({
        type: 'cosmetic',
        id: `cosmetic_level_${level}`,
        name: `Level ${level} Uniform`,
        description: `Special uniform for reaching level ${level}`
      });
    }

    // Every 10 levels: unlock character
    if (level % 10 === 0) {
      rewards.push({
        type: 'unlock_character',
        id: `character_level_${level}`,
        name: `Level ${level} Character`,
        description: `Special character for reaching level ${level}`
      });
    }

    // Every 20 levels: unlock stadium
    if (level % 20 === 0) {
      rewards.push({
        type: 'unlock_stadium',
        id: `stadium_level_${level}`,
        name: `Level ${level} Stadium`,
        description: `Special stadium for reaching level ${level}`
      });
    }

    return rewards;
  }

  /**
   * Create all achievements (samples)
   */
  private createAllAchievements(): Achievement[] {
    return [
      {
        id: 'first_homer',
        name: 'First Blood',
        description: 'Hit your first home run',
        category: 'batting',
        tier: 'bronze',
        icon: 'homerun_bronze',
        requirements: [
          {
            type: 'stat_milestone',
            description: 'Hit 1 home run',
            target: 1,
            current: 0,
            isCompleted: false
          }
        ],
        isSecret: false,
        progress: 0,
        isUnlocked: false,
        rewards: [
          {
            type: 'experience',
            id: 'xp',
            name: 'XP',
            quantity: 100
          }
        ],
        points: 10
      },
      {
        id: 'century_club',
        name: 'Century Club',
        description: 'Hit 100 career home runs',
        category: 'batting',
        tier: 'gold',
        icon: 'homerun_gold',
        requirements: [
          {
            type: 'stat_milestone',
            description: 'Hit 100 home runs',
            target: 100,
            current: 0,
            isCompleted: false
          }
        ],
        isSecret: false,
        progress: 0,
        isUnlocked: false,
        rewards: [
          {
            type: 'experience',
            id: 'xp',
            name: 'XP',
            quantity: 2000
          },
          {
            type: 'title',
            id: 'slugger',
            name: 'Slugger',
            description: 'Title for hitting 100 home runs'
          }
        ],
        points: 100
      },
      {
        id: 'perfect_game',
        name: 'Perfection',
        description: 'Pitch a perfect game',
        category: 'pitching',
        tier: 'platinum',
        icon: 'perfect_game',
        requirements: [
          {
            type: 'game_event',
            description: 'Pitch a perfect game',
            target: 'perfect_game',
            current: 0,
            isCompleted: false
          }
        ],
        isSecret: false,
        progress: 0,
        isUnlocked: false,
        rewards: [
          {
            type: 'experience',
            id: 'xp',
            name: 'XP',
            quantity: 5000
          },
          {
            type: 'unlock_ability',
            id: 'ace_ability',
            name: 'Ace',
            description: '+10% strikeout rate'
          }
        ],
        points: 250
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Play for 7 consecutive days',
        category: 'special',
        tier: 'silver',
        icon: 'calendar_silver',
        requirements: [
          {
            type: 'streak',
            description: 'Play 7 days in a row',
            target: 7,
            current: 0,
            isCompleted: false
          }
        ],
        isSecret: false,
        progress: 0,
        isUnlocked: false,
        rewards: [
          {
            type: 'currency',
            id: 'coins',
            name: 'Coins',
            quantity: 500
          }
        ],
        points: 50
      }
    ];
  }

  /**
   * Create skill trees
   */
  private createSkillTrees(): SkillTree[] {
    return [
      {
        categoryId: 'batting',
        name: 'Batting Skills',
        description: 'Improve your hitting prowess',
        skills: [
          {
            id: 'power_hitting_1',
            name: 'Power Hitting I',
            description: '+5% home run chance',
            category: 'batting',
            tier: 1,
            maxLevel: 5,
            currentLevel: 0,
            requiredSkillPoints: 1,
            prerequisites: [],
            effects: [
              {
                stat: 'power',
                modifier: 5,
                type: 'additive',
                description: '+5 power rating'
              }
            ],
            icon: 'power_bat'
          },
          {
            id: 'contact_hitting_1',
            name: 'Contact Hitting I',
            description: '+5% batting average',
            category: 'batting',
            tier: 1,
            maxLevel: 5,
            currentLevel: 0,
            requiredSkillPoints: 1,
            prerequisites: [],
            effects: [
              {
                stat: 'contact',
                modifier: 5,
                type: 'additive',
                description: '+5 contact rating'
              }
            ],
            icon: 'contact_bat'
          }
        ]
      },
      {
        categoryId: 'pitching',
        name: 'Pitching Skills',
        description: 'Dominate on the mound',
        skills: [
          {
            id: 'velocity_1',
            name: 'Velocity I',
            description: '+3 MPH fastball',
            category: 'pitching',
            tier: 1,
            maxLevel: 5,
            currentLevel: 0,
            requiredSkillPoints: 1,
            prerequisites: [],
            effects: [
              {
                stat: 'pitchVelocity',
                modifier: 3,
                type: 'additive',
                description: '+3 MPH fastball velocity'
              }
            ],
            icon: 'fastball'
          },
          {
            id: 'control_1',
            name: 'Control I',
            description: '+5% strike rate',
            category: 'pitching',
            tier: 1,
            maxLevel: 5,
            currentLevel: 0,
            requiredSkillPoints: 1,
            prerequisites: [],
            effects: [
              {
                stat: 'pitchControl',
                modifier: 5,
                type: 'additive',
                description: '+5 control rating'
              }
            ],
            icon: 'control'
          }
        ]
      }
    ];
  }

  /**
   * Initialize milestone trackers
   */
  private initializeMilestoneTrackers(): void {
    this.milestoneTrackers.set('home_runs', {
      category: 'Home Runs',
      milestones: [
        {
          id: 'hr_10',
          name: '10 Home Runs',
          description: 'Hit 10 career home runs',
          target: 10,
          current: 0,
          isCompleted: false,
          reward: { type: 'experience', id: 'xp', name: 'XP', quantity: 100 }
        },
        {
          id: 'hr_50',
          name: '50 Home Runs',
          description: 'Hit 50 career home runs',
          target: 50,
          current: 0,
          isCompleted: false,
          reward: { type: 'experience', id: 'xp', name: 'XP', quantity: 500 }
        },
        {
          id: 'hr_100',
          name: '100 Home Runs',
          description: 'Hit 100 career home runs',
          target: 100,
          current: 0,
          isCompleted: false,
          reward: { type: 'unlock_equipment', id: 'golden_bat', name: 'Golden Bat', description: 'Legendary bat' }
        }
      ]
    });
  }

  /**
   * Create seasonal rewards
   */
  private createSeasonalRewards(): SeasonalReward[] {
    return [
      {
        tier: 1,
        requiredProgress: 1000,
        reward: { type: 'cosmetic', id: 'seasonal_uniform_1', name: 'Seasonal Uniform Tier 1', description: 'Basic seasonal uniform' },
        isClaimed: false
      },
      {
        tier: 2,
        requiredProgress: 2500,
        reward: { type: 'unlock_equipment', id: 'seasonal_bat', name: 'Seasonal Bat', description: 'Special seasonal bat' },
        isClaimed: false
      },
      {
        tier: 3,
        requiredProgress: 5000,
        reward: { type: 'unlock_character', id: 'seasonal_character', name: 'Seasonal Character', description: 'Exclusive seasonal character' },
        isClaimed: false
      }
    ];
  }

  /**
   * Public getters
   */
  public getProgression(): PlayerProgression {
    return this.progression;
  }

  public getAchievements(): Achievement[] {
    return this.progression.achievements;
  }

  public getUnlockedAchievements(): Achievement[] {
    return this.progression.achievements.filter(a => a.isUnlocked);
  }

  public getSkillTrees(): SkillTree[] {
    return this.skillTrees;
  }

  public getDailyChallenges(): Challenge[] {
    return this.progression.weeklyProgress.challenges.filter(c => c.type === 'daily');
  }

  public getWeeklyChallenges(): Challenge[] {
    return this.progression.weeklyProgress.challenges.filter(c => c.type === 'weekly');
  }
}

/**
 * Supporting interfaces
 */
export interface LevelUpResult {
  newLevel: number;
  oldLevel: number;
  skillPointsAwarded: number;
  unlockedRewards: AchievementReward[];
  didPrestige: boolean;
}
