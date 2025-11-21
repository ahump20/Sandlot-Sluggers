/**
 * Equipment and Gear System
 *
 * Comprehensive equipment management with bats, gloves, cleats, helmets,
 * stat bonuses, rarity tiers, durability, upgrading, crafting, and shops.
 * Includes customization, collections, and progression rewards.
 */

// ============================================================================
// Interfaces and Types
// ============================================================================

/**
 * Equipment slot types
 */
export type EquipmentSlot =
  | 'bat'
  | 'glove'
  | 'cleats'
  | 'helmet'
  | 'batting_gloves'
  | 'jersey'
  | 'pants'
  | 'socks'
  | 'wristband'
  | 'elbow_guard'
  | 'shin_guard'
  | 'chest_protector'; // For catchers

/**
 * Equipment rarity
 */
export type EquipmentRarity =
  | 'common' // Gray
  | 'uncommon' // Green
  | 'rare' // Blue
  | 'epic' // Purple
  | 'legendary' // Orange
  | 'mythic'; // Red

/**
 * Stat boost type
 */
export interface StatBoost {
  statName: string; // e.g., 'power', 'contact', 'speed', 'fielding'
  value: number; // +/- value
  isPercentage: boolean; // true = 10%, false = +10
}

/**
 * Equipment item
 */
export interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;

  // Visual
  iconPath: string;
  modelPath?: string; // 3D model
  colorOptions: string[]; // Hex colors
  currentColor: string;

  // Stats
  level: number; // 1-100
  statBoosts: StatBoost[];
  setBonus?: string; // Set ID if part of a set

  // Durability
  durability: number; // 0-100
  maxDurability: number;
  degradationRate: number; // Per game/use

  // Requirements
  requiredLevel: number;
  requiredStats?: Map<string, number>; // e.g., power >= 50

  // Metadata
  isEquipped: boolean;
  isLocked: boolean; // Locked items can't be sold/deleted
  isFavorite: boolean;
  acquiredDate: number; // timestamp
  timesUsed: number;

  // Value
  buyPrice: number; // In-game currency
  sellPrice: number;
  upgradePrice: number; // To upgrade to next level

  // Special properties
  specialAbilities: SpecialAbility[];
  tags: string[]; // e.g., 'power_hitter', 'speedster', 'defensive'
}

/**
 * Special ability granted by equipment
 */
export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active' | 'conditional';

  // Effect
  effect: {
    statBoosts?: StatBoost[];
    gameplayEffect?: string; // e.g., 'increased_clutch', 'better_bunts'
    activationCondition?: string; // e.g., 'bases_loaded', 'bottom_9th'
  };

  // Trigger
  triggerChance?: number; // 0-100 (for conditional abilities)
  cooldown?: number; // seconds (for active abilities)
}

/**
 * Equipment set (matching items give bonus)
 */
export interface EquipmentSet {
  id: string;
  name: string;
  description: string;
  rarity: EquipmentRarity;

  // Set items
  items: string[]; // Equipment IDs
  requiredItems: number; // How many needed for bonus

  // Set bonuses
  bonuses: {
    2: StatBoost[]; // 2-piece bonus
    3?: StatBoost[]; // 3-piece bonus
    4?: StatBoost[]; // 4-piece bonus
    full?: StatBoost[]; // Full set bonus
  };

  // Reward
  completionReward?: {
    currency: number;
    experience: number;
    unlocks?: string[]; // IDs of unlocked items
  };
}

/**
 * Player loadout (equipped items)
 */
export interface PlayerLoadout {
  playerId: string;
  loadoutName: string;

  // Equipped items by slot
  equipped: Map<EquipmentSlot, EquipmentItem | null>;

  // Derived stats
  totalStatBoosts: Map<string, number>;
  activeSetBonuses: EquipmentSet[];
  activeAbilities: SpecialAbility[];

  // Performance
  gamesPlayed: number;
  avgStatIncrease: number; // % stat increase from equipment
}

/**
 * Equipment shop
 */
export interface EquipmentShop {
  shopId: string;
  name: string;
  description: string;
  shopkeeper: string;

  // Inventory
  inventory: ShopItem[];
  refreshInterval: number; // seconds until inventory refreshes
  lastRefreshTime: number;

  // Currency
  acceptedCurrency: 'coins' | 'tokens' | 'premium';

  // Restrictions
  minPlayerLevel: number;
  unlockCondition?: string;
}

/**
 * Shop item listing
 */
export interface ShopItem {
  equipment: EquipmentItem;
  price: number;
  discount: number; // 0-100 (% off)
  stock: number; // -1 = unlimited
  isPurchased: boolean;
  expiresAt?: number; // timestamp for limited-time offers
}

/**
 * Crafting recipe
 */
export interface CraftingRecipe {
  id: string;
  result: EquipmentItem;
  resultQuantity: number;

  // Requirements
  ingredients: Array<{
    itemId: string;
    quantity: number;
  }>;

  currency: number;
  requiredLevel: number;
  craftingTime: number; // seconds

  // Unlocking
  isUnlocked: boolean;
  unlockCondition?: string;
}

/**
 * Equipment collection (achievements)
 */
export interface EquipmentCollection {
  collectionId: string;
  name: string;
  description: string;

  // Requirements
  requiredItems: string[]; // Equipment IDs
  collectedItems: string[];
  isComplete: boolean;

  // Rewards
  rewards: {
    currency: number;
    experience: number;
    title?: string;
    exclusiveItem?: EquipmentItem;
  };
}

/**
 * Upgrade system
 */
export interface UpgradeResult {
  success: boolean;
  newLevel: number;
  newStatBoosts: StatBoost[];
  cost: number;
  message: string;
}

// ============================================================================
// Equipment and Gear System Class
// ============================================================================

export class EquipmentGearSystem {
  private equipment: Map<string, EquipmentItem>;
  private loadouts: Map<string, PlayerLoadout>;
  private sets: Map<string, EquipmentSet>;
  private shops: Map<string, EquipmentShop>;
  private recipes: Map<string, CraftingRecipe>;
  private collections: Map<string, EquipmentCollection>;

  // Player inventory
  private playerInventory: Map<string, EquipmentItem[]>; // playerId -> items

  // Currency
  private playerCurrency: Map<string, {
    coins: number;
    tokens: number;
    premium: number;
  }>;

  // Configuration
  private readonly DURABILITY_LOSS_PER_GAME = 2;
  private readonly MAX_INVENTORY_SIZE = 500;
  private readonly SHOP_REFRESH_INTERVAL = 86400; // 24 hours

  constructor() {
    this.equipment = new Map();
    this.loadouts = new Map();
    this.sets = new Map();
    this.shops = new Map();
    this.recipes = new Map();
    this.collections = new Map();
    this.playerInventory = new Map();
    this.playerCurrency = new Map();

    this.initialize();
  }

  // ========================================================================
  // Public API - Initialization
  // ========================================================================

  /**
   * Initialize the system
   */
  public initialize(): void {
    this.initializeEquipmentDatabase();
    this.initializeEquipmentSets();
    this.initializeShops();
    this.initializeCraftingRecipes();
    this.initializeCollections();
  }

  /**
   * Initialize player
   */
  public initializePlayer(playerId: string): void {
    // Create default loadout
    const loadout: PlayerLoadout = {
      playerId,
      loadoutName: 'Default',
      equipped: new Map(),
      totalStatBoosts: new Map(),
      activeSetBonuses: [],
      activeAbilities: [],
      gamesPlayed: 0,
      avgStatIncrease: 0
    };

    this.loadouts.set(playerId, loadout);

    // Initialize inventory
    if (!this.playerInventory.has(playerId)) {
      this.playerInventory.set(playerId, []);
    }

    // Initialize currency
    if (!this.playerCurrency.has(playerId)) {
      this.playerCurrency.set(playerId, {
        coins: 1000,
        tokens: 10,
        premium: 0
      });
    }

    // Give starter equipment
    this.giveStarterEquipment(playerId);
  }

  // ========================================================================
  // Public API - Equipment Management
  // ========================================================================

  /**
   * Get player inventory
   */
  public getInventory(playerId: string): EquipmentItem[] {
    return this.playerInventory.get(playerId) || [];
  }

  /**
   * Add item to inventory
   */
  public addToInventory(playerId: string, item: EquipmentItem): boolean {
    const inventory = this.playerInventory.get(playerId);
    if (!inventory) return false;

    if (inventory.length >= this.MAX_INVENTORY_SIZE) {
      return false; // Inventory full
    }

    inventory.push(item);
    return true;
  }

  /**
   * Remove item from inventory
   */
  public removeFromInventory(playerId: string, itemId: string): boolean {
    const inventory = this.playerInventory.get(playerId);
    if (!inventory) return false;

    const index = inventory.findIndex(item => item.id === itemId);
    if (index === -1) return false;

    const item = inventory[index];
    if (item.isLocked || item.isEquipped) return false;

    inventory.splice(index, 1);
    return true;
  }

  /**
   * Equip item
   */
  public equipItem(playerId: string, itemId: string): boolean {
    const loadout = this.loadouts.get(playerId);
    const inventory = this.playerInventory.get(playerId);

    if (!loadout || !inventory) return false;

    const item = inventory.find(i => i.id === itemId);
    if (!item) return false;

    // Check requirements
    if (!this.meetsRequirements(playerId, item)) {
      return false;
    }

    // Unequip current item in slot if any
    const currentItem = loadout.equipped.get(item.slot);
    if (currentItem) {
      currentItem.isEquipped = false;
    }

    // Equip new item
    item.isEquipped = true;
    loadout.equipped.set(item.slot, item);

    // Recalculate stats
    this.recalculateLoadoutStats(loadout);

    return true;
  }

  /**
   * Unequip item
   */
  public unequipItem(playerId: string, slot: EquipmentSlot): boolean {
    const loadout = this.loadouts.get(playerId);
    if (!loadout) return false;

    const item = loadout.equipped.get(slot);
    if (!item) return false;

    item.isEquipped = false;
    loadout.equipped.set(slot, null);

    // Recalculate stats
    this.recalculateLoadoutStats(loadout);

    return true;
  }

  /**
   * Get equipped items for player
   */
  public getEquippedItems(playerId: string): Map<EquipmentSlot, EquipmentItem | null> {
    const loadout = this.loadouts.get(playerId);
    return loadout ? loadout.equipped : new Map();
  }

  /**
   * Get total stat boosts for player
   */
  public getTotalStatBoosts(playerId: string): Map<string, number> {
    const loadout = this.loadouts.get(playerId);
    return loadout ? loadout.totalStatBoosts : new Map();
  }

  // ========================================================================
  // Public API - Upgrading
  // ========================================================================

  /**
   * Upgrade equipment item
   */
  public upgradeItem(
    playerId: string,
    itemId: string
  ): UpgradeResult {
    const inventory = this.playerInventory.get(playerId);
    const currency = this.playerCurrency.get(playerId);

    if (!inventory || !currency) {
      return {
        success: false,
        newLevel: 0,
        newStatBoosts: [],
        cost: 0,
        message: 'Player not found'
      };
    }

    const item = inventory.find(i => i.id === itemId);
    if (!item) {
      return {
        success: false,
        newLevel: 0,
        newStatBoosts: [],
        cost: 0,
        message: 'Item not found'
      };
    }

    // Check max level
    if (item.level >= 100) {
      return {
        success: false,
        newLevel: item.level,
        newStatBoosts: item.statBoosts,
        cost: 0,
        message: 'Already at max level'
      };
    }

    // Calculate cost
    const cost = this.calculateUpgradeCost(item);

    // Check currency
    if (currency.coins < cost) {
      return {
        success: false,
        newLevel: item.level,
        newStatBoosts: item.statBoosts,
        cost,
        message: 'Insufficient funds'
      };
    }

    // Perform upgrade
    currency.coins -= cost;
    item.level++;

    // Increase stats
    item.statBoosts = item.statBoosts.map(boost => ({
      ...boost,
      value: boost.value * 1.05 // 5% increase per level
    }));

    // Recalculate if equipped
    if (item.isEquipped) {
      const loadout = this.loadouts.get(playerId);
      if (loadout) {
        this.recalculateLoadoutStats(loadout);
      }
    }

    return {
      success: true,
      newLevel: item.level,
      newStatBoosts: item.statBoosts,
      cost,
      message: `Upgraded to level ${item.level}!`
    };
  }

  /**
   * Repair equipment
   */
  public repairItem(playerId: string, itemId: string): boolean {
    const inventory = this.playerInventory.get(playerId);
    const currency = this.playerCurrency.get(playerId);

    if (!inventory || !currency) return false;

    const item = inventory.find(i => i.id === itemId);
    if (!item) return false;

    // Calculate repair cost
    const damagePercent = (item.maxDurability - item.durability) / item.maxDurability;
    const cost = Math.floor(item.buyPrice * 0.2 * damagePercent);

    if (currency.coins < cost) return false;

    // Repair
    currency.coins -= cost;
    item.durability = item.maxDurability;

    return true;
  }

  // ========================================================================
  // Public API - Shopping
  // ========================================================================

  /**
   * Get shop inventory
   */
  public getShopInventory(shopId: string): ShopItem[] {
    const shop = this.shops.get(shopId);
    return shop ? shop.inventory : [];
  }

  /**
   * Buy item from shop
   */
  public buyItem(
    playerId: string,
    shopId: string,
    shopItemIndex: number
  ): boolean {
    const shop = this.shops.get(shopId);
    const currency = this.playerCurrency.get(playerId);

    if (!shop || !currency) return false;

    const shopItem = shop.inventory[shopItemIndex];
    if (!shopItem || shopItem.isPurchased) return false;

    // Check stock
    if (shopItem.stock === 0) return false;

    // Calculate final price with discount
    const finalPrice = Math.floor(
      shopItem.price * (1 - shopItem.discount / 100)
    );

    // Check currency
    const currencyType = shop.acceptedCurrency;
    if (currency[currencyType] < finalPrice) return false;

    // Purchase
    currency[currencyType] -= finalPrice;
    shopItem.isPurchased = true;

    if (shopItem.stock > 0) {
      shopItem.stock--;
    }

    // Clone item and add to inventory
    const newItem = this.cloneEquipmentItem(shopItem.equipment);
    this.addToInventory(playerId, newItem);

    return true;
  }

  /**
   * Sell item to shop
   */
  public sellItem(playerId: string, itemId: string): boolean {
    const inventory = this.playerInventory.get(playerId);
    const currency = this.playerCurrency.get(playerId);

    if (!inventory || !currency) return false;

    const index = inventory.findIndex(i => i.id === itemId);
    if (index === -1) return false;

    const item = inventory[index];
    if (item.isLocked || item.isEquipped) return false;

    // Sell
    currency.coins += item.sellPrice;
    inventory.splice(index, 1);

    return true;
  }

  /**
   * Refresh shop inventory
   */
  public refreshShop(shopId: string): void {
    const shop = this.shops.get(shopId);
    if (!shop) return;

    // Generate new inventory
    shop.inventory = this.generateShopInventory(shop);
    shop.lastRefreshTime = Date.now();
  }

  // ========================================================================
  // Public API - Crafting
  // ========================================================================

  /**
   * Get available recipes
   */
  public getAvailableRecipes(playerId: string): CraftingRecipe[] {
    return Array.from(this.recipes.values()).filter(r => r.isUnlocked);
  }

  /**
   * Craft item
   */
  public craftItem(playerId: string, recipeId: string): boolean {
    const recipe = this.recipes.get(recipeId);
    const inventory = this.playerInventory.get(playerId);
    const currency = this.playerCurrency.get(playerId);

    if (!recipe || !inventory || !currency) return false;

    // Check if unlocked
    if (!recipe.isUnlocked) return false;

    // Check ingredients
    for (const ingredient of recipe.ingredients) {
      const count = inventory.filter(i => i.id === ingredient.itemId).length;
      if (count < ingredient.quantity) {
        return false; // Missing ingredients
      }
    }

    // Check currency
    if (currency.coins < recipe.currency) return false;

    // Consume ingredients
    for (const ingredient of recipe.ingredients) {
      for (let i = 0; i < ingredient.quantity; i++) {
        const index = inventory.findIndex(i => i.id === ingredient.itemId);
        if (index !== -1) {
          inventory.splice(index, 1);
        }
      }
    }

    // Consume currency
    currency.coins -= recipe.currency;

    // Create result
    const craftedItem = this.cloneEquipmentItem(recipe.result);
    this.addToInventory(playerId, craftedItem);

    return true;
  }

  // ========================================================================
  // Public API - Collections
  // ========================================================================

  /**
   * Get collections progress
   */
  public getCollections(playerId: string): EquipmentCollection[] {
    return Array.from(this.collections.values());
  }

  /**
   * Check collection completion
   */
  public checkCollectionCompletion(
    playerId: string,
    collectionId: string
  ): boolean {
    const collection = this.collections.get(collectionId);
    const inventory = this.playerInventory.get(playerId);

    if (!collection || !inventory) return false;

    // Check if all required items are owned
    const ownedItems = inventory.map(i => i.id);
    const hasAllItems = collection.requiredItems.every(id =>
      ownedItems.includes(id)
    );

    if (hasAllItems && !collection.isComplete) {
      collection.isComplete = true;
      collection.collectedItems = [...collection.requiredItems];

      // Grant rewards
      this.grantCollectionRewards(playerId, collection);

      return true;
    }

    return false;
  }

  // ========================================================================
  // Public API - Durability
  // ========================================================================

  /**
   * Degrade equipment durability after game
   */
  public degradeEquipmentDurability(playerId: string): void {
    const loadout = this.loadouts.get(playerId);
    if (!loadout) return;

    loadout.equipped.forEach(item => {
      if (item) {
        item.durability = Math.max(
          0,
          item.durability - this.DURABILITY_LOSS_PER_GAME * item.degradationRate
        );
        item.timesUsed++;
      }
    });

    loadout.gamesPlayed++;
  }

  // ========================================================================
  // Public API - Currency
  // ========================================================================

  /**
   * Get player currency
   */
  public getCurrency(playerId: string) {
    return this.playerCurrency.get(playerId);
  }

  /**
   * Add currency
   */
  public addCurrency(
    playerId: string,
    type: 'coins' | 'tokens' | 'premium',
    amount: number
  ): void {
    const currency = this.playerCurrency.get(playerId);
    if (currency) {
      currency[type] += amount;
    }
  }

  // ========================================================================
  // Private Helper Methods - Calculations
  // ========================================================================

  private recalculateLoadoutStats(loadout: PlayerLoadout): void {
    loadout.totalStatBoosts.clear();
    loadout.activeSetBonuses = [];
    loadout.activeAbilities = [];

    // Sum all stat boosts from equipped items
    loadout.equipped.forEach(item => {
      if (item) {
        item.statBoosts.forEach(boost => {
          const current = loadout.totalStatBoosts.get(boost.statName) || 0;
          loadout.totalStatBoosts.set(boost.statName, current + boost.value);
        });

        // Add special abilities
        loadout.activeAbilities.push(...item.specialAbilities);
      }
    });

    // Check for set bonuses
    this.sets.forEach(set => {
      const equippedSetItems = Array.from(loadout.equipped.values())
        .filter(item => item && item.setBonus === set.id)
        .length;

      if (equippedSetItems >= set.requiredItems) {
        loadout.activeSetBonuses.push(set);

        // Apply set bonuses
        let bonuses: StatBoost[] = [];
        if (equippedSetItems >= 4 && set.bonuses.full) {
          bonuses = set.bonuses.full;
        } else if (equippedSetItems >= 4 && set.bonuses[4]) {
          bonuses = set.bonuses[4];
        } else if (equippedSetItems >= 3 && set.bonuses[3]) {
          bonuses = set.bonuses[3];
        } else if (equippedSetItems >= 2) {
          bonuses = set.bonuses[2];
        }

        bonuses.forEach(boost => {
          const current = loadout.totalStatBoosts.get(boost.statName) || 0;
          loadout.totalStatBoosts.set(boost.statName, current + boost.value);
        });
      }
    });
  }

  private calculateUpgradeCost(item: EquipmentItem): number {
    // Base cost increases with level
    const baseCost = item.buyPrice * 0.1;
    const levelMultiplier = 1 + (item.level * 0.1);
    const rarityMultiplier = this.getRarityMultiplier(item.rarity);

    return Math.floor(baseCost * levelMultiplier * rarityMultiplier);
  }

  private getRarityMultiplier(rarity: EquipmentRarity): number {
    const multipliers: Record<EquipmentRarity, number> = {
      common: 1.0,
      uncommon: 1.5,
      rare: 2.0,
      epic: 3.0,
      legendary: 5.0,
      mythic: 10.0
    };

    return multipliers[rarity];
  }

  private meetsRequirements(playerId: string, item: EquipmentItem): boolean {
    // Check level requirement
    // (Would check actual player level from game state)

    // Check stat requirements
    if (item.requiredStats) {
      // Would check actual player stats
    }

    return true;
  }

  // ========================================================================
  // Private Helper Methods - Shop
  // ========================================================================

  private generateShopInventory(shop: EquipmentShop): ShopItem[] {
    const inventory: ShopItem[] = [];

    // Generate 10-20 random items
    const itemCount = 10 + Math.floor(Math.random() * 10);

    for (let i = 0; i < itemCount; i++) {
      // Select random equipment
      const allEquipment = Array.from(this.equipment.values());
      const randomItem = allEquipment[Math.floor(Math.random() * allEquipment.length)];

      // Clone it
      const shopEquipment = this.cloneEquipmentItem(randomItem);

      // Random discount (0-30%)
      const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0;

      // Random stock
      const stock = Math.random() > 0.8 ? Math.floor(Math.random() * 5) + 1 : -1;

      inventory.push({
        equipment: shopEquipment,
        price: shopEquipment.buyPrice,
        discount,
        stock,
        isPurchased: false
      });
    }

    return inventory;
  }

  private cloneEquipmentItem(item: EquipmentItem): EquipmentItem {
    return {
      ...item,
      id: `${item.id}_${Date.now()}_${Math.random()}`,
      statBoosts: item.statBoosts.map(b => ({ ...b })),
      specialAbilities: item.specialAbilities.map(a => ({ ...a })),
      isEquipped: false,
      acquiredDate: Date.now(),
      timesUsed: 0
    };
  }

  // ========================================================================
  // Private Helper Methods - Rewards
  // ========================================================================

  private grantCollectionRewards(
    playerId: string,
    collection: EquipmentCollection
  ): void {
    const currency = this.playerCurrency.get(playerId);
    if (!currency) return;

    // Grant currency
    currency.coins += collection.rewards.currency;

    // Grant exclusive item if any
    if (collection.rewards.exclusiveItem) {
      const item = this.cloneEquipmentItem(collection.rewards.exclusiveItem);
      item.isLocked = true; // Lock collection rewards
      this.addToInventory(playerId, item);
    }
  }

  private giveStarterEquipment(playerId: string): void {
    // Give basic bat
    const starterBat = this.createBasicEquipment('bat', 'Wooden Bat', 'common');
    this.addToInventory(playerId, starterBat);

    // Give basic glove
    const starterGlove = this.createBasicEquipment('glove', 'Leather Glove', 'common');
    this.addToInventory(playerId, starterGlove);

    // Give basic cleats
    const starterCleats = this.createBasicEquipment('cleats', 'Basic Cleats', 'common');
    this.addToInventory(playerId, starterCleats);

    // Give basic helmet
    const starterHelmet = this.createBasicEquipment('helmet', 'Batting Helmet', 'common');
    this.addToInventory(playerId, starterHelmet);
  }

  // ========================================================================
  // Private Helper Methods - Initialization
  // ========================================================================

  private initializeEquipmentDatabase(): void {
    // Create sample equipment items
    // Bats
    this.addEquipmentToDatabase(
      this.createEquipment('wooden_bat', 'Wooden Bat', 'bat', 'common', [
        { statName: 'power', value: 5, isPercentage: false },
        { statName: 'contact', value: 10, isPercentage: false }
      ])
    );

    this.addEquipmentToDatabase(
      this.createEquipment('aluminum_bat', 'Aluminum Bat', 'bat', 'uncommon', [
        { statName: 'power', value: 10, isPercentage: false },
        { statName: 'contact', value: 8, isPercentage: false }
      ])
    );

    this.addEquipmentToDatabase(
      this.createEquipment('composite_bat', 'Composite Bat', 'bat', 'rare', [
        { statName: 'power', value: 15, isPercentage: false },
        { statName: 'contact', value: 12, isPercentage: false },
        { statName: 'bat_speed', value: 5, isPercentage: true }
      ])
    );

    // Gloves
    this.addEquipmentToDatabase(
      this.createEquipment('leather_glove', 'Leather Glove', 'glove', 'common', [
        { statName: 'fielding', value: 10, isPercentage: false }
      ])
    );

    this.addEquipmentToDatabase(
      this.createEquipment('pro_glove', 'Pro Glove', 'glove', 'rare', [
        { statName: 'fielding', value: 20, isPercentage: false },
        { statName: 'reaction_time', value: 10, isPercentage: true }
      ])
    );

    // Cleats
    this.addEquipmentToDatabase(
      this.createEquipment('basic_cleats', 'Basic Cleats', 'cleats', 'common', [
        { statName: 'speed', value: 5, isPercentage: false }
      ])
    );

    this.addEquipmentToDatabase(
      this.createEquipment('speed_cleats', 'Speed Cleats', 'cleats', 'epic', [
        { statName: 'speed', value: 15, isPercentage: false },
        { statName: 'acceleration', value: 20, isPercentage: true }
      ])
    );
  }

  private createEquipment(
    id: string,
    name: string,
    slot: EquipmentSlot,
    rarity: EquipmentRarity,
    statBoosts: StatBoost[]
  ): EquipmentItem {
    return {
      id,
      name,
      description: `A ${rarity} ${slot}`,
      slot,
      rarity,
      iconPath: `/icons/${id}.png`,
      colorOptions: ['#FFFFFF', '#000000', '#FF0000', '#0000FF'],
      currentColor: '#FFFFFF',
      level: 1,
      statBoosts,
      durability: 100,
      maxDurability: 100,
      degradationRate: 1.0,
      requiredLevel: 1,
      isEquipped: false,
      isLocked: false,
      isFavorite: false,
      acquiredDate: Date.now(),
      timesUsed: 0,
      buyPrice: this.getRarityMultiplier(rarity) * 100,
      sellPrice: this.getRarityMultiplier(rarity) * 50,
      upgradePrice: this.getRarityMultiplier(rarity) * 20,
      specialAbilities: [],
      tags: []
    };
  }

  private createBasicEquipment(
    slot: EquipmentSlot,
    name: string,
    rarity: EquipmentRarity
  ): EquipmentItem {
    return this.createEquipment(
      `starter_${slot}`,
      name,
      slot,
      rarity,
      [{ statName: slot, value: 5, isPercentage: false }]
    );
  }

  private addEquipmentToDatabase(item: EquipmentItem): void {
    this.equipment.set(item.id, item);
  }

  private initializeEquipmentSets(): void {
    // Power Hitter Set
    const powerSet: EquipmentSet = {
      id: 'power_hitter_set',
      name: 'Power Hitter Set',
      description: 'Equipment for power hitters',
      rarity: 'epic',
      items: ['composite_bat', 'power_gloves', 'heavy_cleats'],
      requiredItems: 2,
      bonuses: {
        2: [{ statName: 'power', value: 10, isPercentage: true }],
        3: [
          { statName: 'power', value: 20, isPercentage: true },
          { statName: 'home_run_distance', value: 15, isPercentage: true }
        ]
      }
    };

    this.sets.set(powerSet.id, powerSet);
  }

  private initializeShops(): void {
    // General equipment shop
    const generalShop: EquipmentShop = {
      shopId: 'general_shop',
      name: 'General Equipment Store',
      description: 'Buy basic equipment',
      shopkeeper: 'Bob the Vendor',
      inventory: [],
      refreshInterval: this.SHOP_REFRESH_INTERVAL,
      lastRefreshTime: Date.now(),
      acceptedCurrency: 'coins',
      minPlayerLevel: 1
    };

    this.shops.set(generalShop.shopId, generalShop);
    this.refreshShop(generalShop.shopId);
  }

  private initializeCraftingRecipes(): void {
    // Example recipe
    const recipe: CraftingRecipe = {
      id: 'craft_pro_bat',
      result: this.createEquipment('pro_bat', 'Pro Bat', 'bat', 'rare', [
        { statName: 'power', value: 20, isPercentage: false }
      ]),
      resultQuantity: 1,
      ingredients: [
        { itemId: 'wooden_bat', quantity: 2 },
        { itemId: 'metal_ingot', quantity: 5 }
      ],
      currency: 500,
      requiredLevel: 10,
      craftingTime: 60,
      isUnlocked: true
    };

    this.recipes.set(recipe.id, recipe);
  }

  private initializeCollections(): void {
    // Example collection
    const collection: EquipmentCollection = {
      collectionId: 'bats_collection',
      name: 'Bat Collector',
      description: 'Collect all bat types',
      requiredItems: ['wooden_bat', 'aluminum_bat', 'composite_bat'],
      collectedItems: [],
      isComplete: false,
      rewards: {
        currency: 1000,
        experience: 500,
        title: 'Bat Master'
      }
    };

    this.collections.set(collection.collectionId, collection);
  }
}
