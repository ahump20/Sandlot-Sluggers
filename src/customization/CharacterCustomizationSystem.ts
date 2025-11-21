/**
 * CharacterCustomizationSystem.ts
 * Comprehensive character customization with appearance, equipment, and attributes
 */

export interface CharacterAppearance {
  // Body
  bodyType: 'slim' | 'average' | 'muscular' | 'heavy';
  height: number; // 60-84 inches
  skinTone: string; // Hex color

  // Face
  faceShape: 'round' | 'oval' | 'square' | 'heart' | 'diamond';
  eyeColor: string;
  eyeShape: 'normal' | 'wide' | 'narrow' | 'almond';
  eyebrows: 'thin' | 'normal' | 'thick' | 'bushy';
  nose: 'small' | 'medium' | 'large' | 'wide' | 'pointed';
  mouth: 'small' | 'medium' | 'large' | 'wide';
  ears: 'small' | 'medium' | 'large' | 'pointed';

  // Hair
  hairstyle: string; // ID of hairstyle
  hairColor: string;
  facialHair: 'none' | 'stubble' | 'goatee' | 'beard' | 'mustache' | 'full_beard';
  facialHairColor: string;

  // Accessories
  glasses: 'none' | 'sunglasses' | 'reading' | 'sports' | 'goggles';
  headband: 'none' | 'normal' | 'sweatband' | 'bandana';
  wristbands: boolean;
  necklace: 'none' | 'chain' | 'pendant' | 'dog_tags';
  earrings: boolean;
  tattoos: Tattoo[];
  piercings: Piercing[];
}

export interface Tattoo {
  id: string;
  position: 'arm_left' | 'arm_right' | 'chest' | 'back' | 'leg_left' | 'leg_right';
  design: string; // Tattoo design ID
  size: 'small' | 'medium' | 'large';
  color: 'black' | 'colored';
}

export interface Piercing {
  type: 'ear' | 'nose' | 'eyebrow' | 'lip';
  position: 'left' | 'right' | 'center';
  style: string; // Piercing style ID
}

export interface UniformCustomization {
  // Jersey
  jerseyStyle: 'classic' | 'modern' | 'retro' | 'raglan' | 'sleeveless';
  jerseyColor: string;
  jerseySecondaryColor: string;
  jerseyPattern: 'solid' | 'pinstripe' | 'two_tone' | 'gradient';
  jerseyNumber: number;
  jerseyName: string;
  jerseyFit: 'tight' | 'normal' | 'loose';

  // Pants
  pantsStyle: 'classic' | 'modern' | 'knickers' | 'shorts';
  pantsColor: string;
  pantsPattern: 'solid' | 'pinstripe' | 'piping';
  beltColor: string;

  // Socks
  socksStyle: 'low' | 'mid' | 'high' | 'stirrups';
  socksColor: string;
  sockPattern: 'solid' | 'striped' | 'argyle';

  // Cleats
  cleatsStyle: 'low' | 'mid' | 'high';
  cleatsColor: string;
  cleatsBrand: string;

  // Cap
  capStyle: 'fitted' | 'snapback' | 'flex' | 'bucket';
  capColor: string;
  capLogo: string;
  capVisorStyle: 'flat' | 'curved';

  // Batting gloves
  battingGlovesStyle: 'standard' | 'fingerless' | 'wristguard';
  battingGlovesColor: string;

  // Accessories
  sleeves: 'none' | 'short' | 'long' | 'compression';
  sleeveColor: string;
}

export interface Equipment {
  // Bat
  bat: {
    id: string;
    name: string;
    brand: string;
    model: string;
    material: 'wood' | 'aluminum' | 'composite';
    length: number; // inches
    weight: number; // ounces
    color: string;
    grip: string; // Grip style
    stats: {
      power: number;
      contact: number;
      durability: number;
    };
  };

  // Glove
  glove: {
    id: string;
    name: string;
    brand: string;
    model: string;
    position: string; // Position-specific glove
    material: 'leather' | 'synthetic' | 'mesh';
    webbing: string; // Web style
    color: string;
    size: number; // inches
    stats: {
      fielding: number;
      range: number;
      durability: number;
    };
  };

  // Helmet
  helmet: {
    id: string;
    style: 'standard' | 'jawguard' | 'faceguard' | 'matte';
    color: string;
    visor: 'none' | 'clear' | 'tinted' | 'mirrored';
    decals: string[];
  };

  // Catcher gear (if catcher)
  catcherGear?: {
    mask: { style: string; color: string };
    chestProtector: { style: string; color: string };
    legGuards: { style: string; color: string };
  };
}

export interface CharacterStats {
  // Offensive
  contact: number; // 0-100
  power: number;
  speed: number;
  plateVision: number;
  plateDiscipline: number;

  // Pitching
  velocity: number;
  control: number;
  movement: number;
  stamina: number;

  // Defensive
  fielding: number;
  armStrength: number;
  armAccuracy: number;
  reactionTime: number;

  // Baserunning
  baserunningSpeed: number;
  baserunningAggressiveness: number;
  slidingAbility: number;

  // Mental
  clutch: number;
  durability: number;
  confidence: number;
}

export interface CharacterPersonality {
  traits: PersonalityTrait[];
  battingStance: string; // Stance ID
  pitchingWindup: string; // Windup ID
  celebrationStyle: string; // Celebration animation ID
  walkupSong?: string; // Audio file ID
  catchphrase?: string;
  nickname?: string;
}

export interface PersonalityTrait {
  id: string;
  name: string;
  description: string;
  effect: {
    stat: string;
    modifier: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CustomCharacter {
  id: string;
  name: string;
  appearance: CharacterAppearance;
  uniform: UniformCustomization;
  equipment: Equipment;
  stats: CharacterStats;
  personality: CharacterPersonality;
  createdDate: Date;
  lastModified: Date;
}

export class CharacterCustomizationSystem {
  private characters: Map<string, CustomCharacter> = new Map();
  private currentCharacter: CustomCharacter | null = null;

  // Customization options
  private readonly hairstyles: string[] = [
    'bald', 'buzz_cut', 'crew_cut', 'short', 'medium', 'long',
    'afro', 'dreads', 'cornrows', 'mohawk', 'ponytail', 'man_bun',
    'fade', 'undercut', 'slicked_back', 'messy', 'curly', 'wavy'
  ];

  private readonly battingStances: string[] = [
    'standard', 'open', 'closed', 'crouch', 'upright',
    'wide', 'narrow', 'high_hands', 'low_hands', 'bat_waggle',
    'toe_tap', 'leg_kick', 'no_stride', 'one_handed'
  ];

  private readonly pitchingWindups: string[] = [
    'full_windup', 'stretch', 'slide_step', 'no_windup',
    'high_leg_kick', 'quick_pitch', 'submarine', 'sidearm',
    'three_quarters', 'overhand'
  ];

  private readonly celebrationStyles: string[] = [
    'bat_flip', 'fist_pump', 'point_sky', 'helmet_tap',
    'chest_bump', 'slide', 'backflip', 'cartwheel',
    'dance', 'pose', 'salute', 'bow'
  ];

  constructor() {
    this.loadSavedCharacters();
    console.log('👤 Character Customization System initialized');
  }

  /**
   * Create new character
   */
  public createCharacter(name: string): CustomCharacter {
    const character: CustomCharacter = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      appearance: this.createDefaultAppearance(),
      uniform: this.createDefaultUniform(),
      equipment: this.createDefaultEquipment(),
      stats: this.createDefaultStats(),
      personality: this.createDefaultPersonality(),
      createdDate: new Date(),
      lastModified: new Date()
    };

    this.characters.set(character.id, character);
    this.currentCharacter = character;

    console.log(`Created character: ${name}`);
    return character;
  }

  /**
   * Create default appearance
   */
  private createDefaultAppearance(): CharacterAppearance {
    return {
      bodyType: 'average',
      height: 72,
      skinTone: '#F5D7B1',
      faceShape: 'oval',
      eyeColor: '#8B4513',
      eyeShape: 'normal',
      eyebrows: 'normal',
      nose: 'medium',
      mouth: 'medium',
      ears: 'medium',
      hairstyle: 'short',
      hairColor: '#2C1B18',
      facialHair: 'none',
      facialHairColor: '#2C1B18',
      glasses: 'none',
      headband: 'none',
      wristbands: false,
      necklace: 'none',
      earrings: false,
      tattoos: [],
      piercings: []
    };
  }

  /**
   * Create default uniform
   */
  private createDefaultUniform(): UniformCustomization {
    return {
      jerseyStyle: 'classic',
      jerseyColor: '#FFFFFF',
      jerseySecondaryColor: '#000000',
      jerseyPattern: 'solid',
      jerseyNumber: 0,
      jerseyName: '',
      jerseyFit: 'normal',
      pantsStyle: 'classic',
      pantsColor: '#808080',
      pantsPattern: 'solid',
      beltColor: '#000000',
      socksStyle: 'high',
      socksColor: '#FFFFFF',
      sockPattern: 'solid',
      cleatsStyle: 'mid',
      cleatsColor: '#000000',
      cleatsBrand: 'Generic',
      capStyle: 'fitted',
      capColor: '#000000',
      capLogo: 'default',
      capVisorStyle: 'curved',
      battingGlovesStyle: 'standard',
      battingGlovesColor: '#000000',
      sleeves: 'short',
      sleeveColor: '#FFFFFF'
    };
  }

  /**
   * Create default equipment
   */
  private createDefaultEquipment(): Equipment {
    return {
      bat: {
        id: 'bat_default',
        name: 'Standard Bat',
        brand: 'Generic',
        model: 'Basic',
        material: 'wood',
        length: 34,
        weight: 32,
        color: '#8B4513',
        grip: 'standard',
        stats: {
          power: 50,
          contact: 50,
          durability: 50
        }
      },
      glove: {
        id: 'glove_default',
        name: 'Standard Glove',
        brand: 'Generic',
        model: 'Basic',
        position: 'all',
        material: 'leather',
        webbing: 'standard',
        color: '#8B4513',
        size: 12,
        stats: {
          fielding: 50,
          range: 50,
          durability: 50
        }
      },
      helmet: {
        id: 'helmet_default',
        style: 'standard',
        color: '#000000',
        visor: 'none',
        decals: []
      }
    };
  }

  /**
   * Create default stats
   */
  private createDefaultStats(): CharacterStats {
    return {
      contact: 50,
      power: 50,
      speed: 50,
      plateVision: 50,
      plateDiscipline: 50,
      velocity: 50,
      control: 50,
      movement: 50,
      stamina: 50,
      fielding: 50,
      armStrength: 50,
      armAccuracy: 50,
      reactionTime: 50,
      baserunningSpeed: 50,
      baserunningAggressiveness: 50,
      slidingAbility: 50,
      clutch: 50,
      durability: 50,
      confidence: 50
    };
  }

  /**
   * Create default personality
   */
  private createDefaultPersonality(): CharacterPersonality {
    return {
      traits: [],
      battingStance: 'standard',
      pitchingWindup: 'full_windup',
      celebrationStyle: 'fist_pump',
      walkupSong: undefined,
      catchphrase: undefined,
      nickname: undefined
    };
  }

  /**
   * Update appearance
   */
  public updateAppearance(characterId: string, appearance: Partial<CharacterAppearance>): void {
    const character = this.characters.get(characterId);
    if (!character) return;

    Object.assign(character.appearance, appearance);
    character.lastModified = new Date();

    console.log(`Updated appearance for ${character.name}`);
  }

  /**
   * Update uniform
   */
  public updateUniform(characterId: string, uniform: Partial<UniformCustomization>): void {
    const character = this.characters.get(characterId);
    if (!character) return;

    Object.assign(character.uniform, uniform);
    character.lastModified = new Date();

    console.log(`Updated uniform for ${character.name}`);
  }

  /**
   * Equip item
   */
  public equipItem(characterId: string, itemType: 'bat' | 'glove' | 'helmet', item: any): void {
    const character = this.characters.get(characterId);
    if (!character) return;

    character.equipment[itemType] = item;
    character.lastModified = new Date();

    // Apply stat bonuses from equipment
    this.applyEquipmentStats(character);

    console.log(`Equipped ${itemType} for ${character.name}`);
  }

  /**
   * Apply equipment stat bonuses
   */
  private applyEquipmentStats(character: CustomCharacter): void {
    // Bat bonuses
    const batBonus = (character.equipment.bat.stats.power / 100) * 10;
    character.stats.power = Math.min(100, character.stats.power + batBonus);

    // Glove bonuses
    const gloveBonus = (character.equipment.glove.stats.fielding / 100) * 10;
    character.stats.fielding = Math.min(100, character.stats.fielding + gloveBonus);
  }

  /**
   * Add personality trait
   */
  public addPersonalityTrait(characterId: string, trait: PersonalityTrait): void {
    const character = this.characters.get(characterId);
    if (!character) return;

    // Check if trait already exists
    if (character.personality.traits.find(t => t.id === trait.id)) {
      console.log('Trait already exists');
      return;
    }

    // Max 5 traits
    if (character.personality.traits.length >= 5) {
      console.log('Maximum traits reached');
      return;
    }

    character.personality.traits.push(trait);
    character.lastModified = new Date();

    // Apply trait effect
    this.applyTraitEffect(character, trait);

    console.log(`Added trait ${trait.name} to ${character.name}`);
  }

  /**
   * Apply trait effect to stats
   */
  private applyTraitEffect(character: CustomCharacter, trait: PersonalityTrait): void {
    const stat = trait.effect.stat as keyof CharacterStats;
    if (stat in character.stats) {
      const currentValue = character.stats[stat] as number;
      character.stats[stat] = Math.max(0, Math.min(100, currentValue + trait.effect.modifier)) as any;
    }
  }

  /**
   * Remove personality trait
   */
  public removePersonalityTrait(characterId: string, traitId: string): void {
    const character = this.characters.get(characterId);
    if (!character) return;

    const traitIndex = character.personality.traits.findIndex(t => t.id === traitId);
    if (traitIndex === -1) return;

    const trait = character.personality.traits[traitIndex];
    character.personality.traits.splice(traitIndex, 1);
    character.lastModified = new Date();

    // Remove trait effect
    const stat = trait.effect.stat as keyof CharacterStats;
    if (stat in character.stats) {
      const currentValue = character.stats[stat] as number;
      character.stats[stat] = Math.max(0, Math.min(100, currentValue - trait.effect.modifier)) as any;
    }

    console.log(`Removed trait ${trait.name} from ${character.name}`);
  }

  /**
   * Add tattoo
   */
  public addTattoo(characterId: string, tattoo: Tattoo): void {
    const character = this.characters.get(characterId);
    if (!character) return;

    // Max 10 tattoos
    if (character.appearance.tattoos.length >= 10) {
      console.log('Maximum tattoos reached');
      return;
    }

    character.appearance.tattoos.push(tattoo);
    character.lastModified = new Date();

    console.log(`Added tattoo to ${character.name}`);
  }

  /**
   * Remove tattoo
   */
  public removeTattoo(characterId: string, tattooId: string): void {
    const character = this.characters.get(characterId);
    if (!character) return;

    character.appearance.tattoos = character.appearance.tattoos.filter(t => t.id !== tattooId);
    character.lastModified = new Date();
  }

  /**
   * Randomize appearance
   */
  public randomizeAppearance(characterId: string): void {
    const character = this.characters.get(characterId);
    if (!character) return;

    character.appearance = {
      bodyType: this.randomChoice(['slim', 'average', 'muscular', 'heavy']),
      height: 60 + Math.floor(Math.random() * 24),
      skinTone: this.randomSkinTone(),
      faceShape: this.randomChoice(['round', 'oval', 'square', 'heart', 'diamond']),
      eyeColor: this.randomEyeColor(),
      eyeShape: this.randomChoice(['normal', 'wide', 'narrow', 'almond']),
      eyebrows: this.randomChoice(['thin', 'normal', 'thick', 'bushy']),
      nose: this.randomChoice(['small', 'medium', 'large', 'wide', 'pointed']),
      mouth: this.randomChoice(['small', 'medium', 'large', 'wide']),
      ears: this.randomChoice(['small', 'medium', 'large', 'pointed']),
      hairstyle: this.randomChoice(this.hairstyles),
      hairColor: this.randomHairColor(),
      facialHair: this.randomChoice(['none', 'stubble', 'goatee', 'beard', 'mustache', 'full_beard']),
      facialHairColor: this.randomHairColor(),
      glasses: this.randomChoice(['none', 'sunglasses', 'reading', 'sports', 'goggles']),
      headband: this.randomChoice(['none', 'normal', 'sweatband', 'bandana']),
      wristbands: Math.random() > 0.5,
      necklace: this.randomChoice(['none', 'chain', 'pendant', 'dog_tags']),
      earrings: Math.random() > 0.7,
      tattoos: [],
      piercings: []
    };

    character.lastModified = new Date();
    console.log(`Randomized appearance for ${character.name}`);
  }

  /**
   * Randomize uniform
   */
  public randomizeUniform(characterId: string): void {
    const character = this.characters.get(characterId);
    if (!character) return;

    character.uniform = {
      jerseyStyle: this.randomChoice(['classic', 'modern', 'retro', 'raglan', 'sleeveless']),
      jerseyColor: this.randomColor(),
      jerseySecondaryColor: this.randomColor(),
      jerseyPattern: this.randomChoice(['solid', 'pinstripe', 'two_tone', 'gradient']),
      jerseyNumber: Math.floor(Math.random() * 100),
      jerseyName: character.name.toUpperCase(),
      jerseyFit: this.randomChoice(['tight', 'normal', 'loose']),
      pantsStyle: this.randomChoice(['classic', 'modern', 'knickers', 'shorts']),
      pantsColor: this.randomColor(),
      pantsPattern: this.randomChoice(['solid', 'pinstripe', 'piping']),
      beltColor: this.randomColor(),
      socksStyle: this.randomChoice(['low', 'mid', 'high', 'stirrups']),
      socksColor: this.randomColor(),
      sockPattern: this.randomChoice(['solid', 'striped', 'argyle']),
      cleatsStyle: this.randomChoice(['low', 'mid', 'high']),
      cleatsColor: this.randomColor(),
      cleatsBrand: this.randomChoice(['Nike', 'Adidas', 'Under Armour', 'New Balance']),
      capStyle: this.randomChoice(['fitted', 'snapback', 'flex', 'bucket']),
      capColor: this.randomColor(),
      capLogo: 'default',
      capVisorStyle: this.randomChoice(['flat', 'curved']),
      battingGlovesStyle: this.randomChoice(['standard', 'fingerless', 'wristguard']),
      battingGlovesColor: this.randomColor(),
      sleeves: this.randomChoice(['none', 'short', 'long', 'compression']),
      sleeveColor: this.randomColor()
    };

    character.lastModified = new Date();
    console.log(`Randomized uniform for ${character.name}`);
  }

  /**
   * Save character
   */
  public saveCharacter(characterId: string): void {
    const character = this.characters.get(characterId);
    if (!character) return;

    // Save to localStorage
    const saved = Array.from(this.characters.values());
    localStorage.setItem('custom_characters', JSON.stringify(saved));

    console.log(`Saved character: ${character.name}`);
  }

  /**
   * Load saved characters
   */
  private loadSavedCharacters(): void {
    const saved = localStorage.getItem('custom_characters');
    if (saved) {
      try {
        const characters: CustomCharacter[] = JSON.parse(saved);
        characters.forEach(char => {
          this.characters.set(char.id, char);
        });
        console.log(`Loaded ${characters.length} saved characters`);
      } catch (e) {
        console.error('Failed to load saved characters:', e);
      }
    }
  }

  /**
   * Delete character
   */
  public deleteCharacter(characterId: string): void {
    const character = this.characters.get(characterId);
    if (!character) return;

    this.characters.delete(characterId);

    if (this.currentCharacter?.id === characterId) {
      this.currentCharacter = null;
    }

    // Update localStorage
    const saved = Array.from(this.characters.values());
    localStorage.setItem('custom_characters', JSON.stringify(saved));

    console.log(`Deleted character: ${character.name}`);
  }

  /**
   * Clone character
   */
  public cloneCharacter(characterId: string): CustomCharacter | null {
    const original = this.characters.get(characterId);
    if (!original) return null;

    const clone: CustomCharacter = {
      ...JSON.parse(JSON.stringify(original)),
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${original.name} (Copy)`,
      createdDate: new Date(),
      lastModified: new Date()
    };

    this.characters.set(clone.id, clone);
    console.log(`Cloned character: ${original.name}`);

    return clone;
  }

  /**
   * Helper methods
   */
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomColor(): string {
    const colors = [
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
      '#FFA500', '#800080', '#008000', '#000080', '#FFD700', '#C0C0C0',
      '#000000', '#FFFFFF', '#808080', '#FF69B4', '#4169E1', '#32CD32'
    ];
    return this.randomChoice(colors);
  }

  private randomSkinTone(): string {
    const tones = ['#FFDFC4', '#F0D5BE', '#EECEB3', '#E1B899', '#E5C298', '#FFCD94', '#EAC086',
                   '#FFAD60', '#C68642', '#8D5524', '#C58C85', '#AE6A47', '#A57257', '#6B3410'];
    return this.randomChoice(tones);
  }

  private randomEyeColor(): string {
    const colors = ['#8B4513', '#A0522D', '#2E4053', '#1C2833', '#2C5F2D', '#27AE60',
                    '#3498DB', '#2980B9', '#95A5A6', '#34495E'];
    return this.randomChoice(colors);
  }

  private randomHairColor(): string {
    const colors = ['#000000', '#2C1B18', '#4E3B31', '#8B4513', '#A0522D', '#D2691E',
                    '#DAA520', '#FFD700', '#FFA500', '#DC143C', '#8E44AD', '#2980B9'];
    return this.randomChoice(colors);
  }

  /**
   * Public getters
   */
  public getCharacter(characterId: string): CustomCharacter | undefined {
    return this.characters.get(characterId);
  }

  public getAllCharacters(): CustomCharacter[] {
    return Array.from(this.characters.values());
  }

  public getCurrentCharacter(): CustomCharacter | null {
    return this.currentCharacter;
  }

  public setCurrentCharacter(characterId: string): void {
    const character = this.characters.get(characterId);
    if (character) {
      this.currentCharacter = character;
    }
  }

  public getAvailableHairstyles(): string[] {
    return [...this.hairstyles];
  }

  public getAvailableBattingStances(): string[] {
    return [...this.battingStances];
  }

  public getAvailablePitchingWindups(): string[] {
    return [...this.pitchingWindups];
  }

  public getAvailableCelebrations(): string[] {
    return [...this.celebrationStyles];
  }

  public getCharacterCount(): number {
    return this.characters.size;
  }
}
