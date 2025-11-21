import { Observable } from '@babylonjs/core';

/**
 * Item types
 */
export enum ItemType {
    EQUIPMENT = 'equipment',
    CONSUMABLE = 'consumable',
    MATERIAL = 'material',
    COSMETIC = 'cosmetic',
    CURRENCY = 'currency',
    COLLECTIBLE = 'collectible',
    QUEST_ITEM = 'quest_item',
    UPGRADE = 'upgrade'
}

/**
 * Item rarity
 */
export enum ItemRarity {
    COMMON = 'common',
    UNCOMMON = 'uncommon',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary',
    MYTHIC = 'mythic'
}

/**
 * Equipment slot
 */
export enum EquipmentSlot {
    BAT = 'bat',
    GLOVE = 'glove',
    CLEATS = 'cleats',
    HELMET = 'helmet',
    JERSEY = 'jersey',
    PANTS = 'pants',
    ACCESSORY_1 = 'accessory_1',
    ACCESSORY_2 = 'accessory_2'
}

/**
 * Item stat modifier
 */
export interface StatModifier {
    stat: string;
    value: number;
    type: 'flat' | 'percentage';
}

/**
 * Item definition
 */
export interface Item {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: ItemRarity;
    icon: string;
    maxStack: number;
    tradeable: boolean;
    sellable: boolean;
    sellPrice?: number;
    buyPrice?: number;
    level?: number;
    slot?: EquipmentSlot;
    stats?: StatModifier[];
    effects?: string[];
    metadata?: { [key: string]: any };
}

/**
 * Inventory item instance
 */
export interface InventoryItem {
    instanceId: string;
    itemId: string;
    quantity: number;
    equipped?: boolean;
    slot?: EquipmentSlot;
    acquiredDate: number;
    durability?: number;
    maxDurability?: number;
    enchantments?: string[];
    customData?: { [key: string]: any };
}

/**
 * Equipment loadout
 */
export interface EquipmentLoadout {
    id: string;
    name: string;
    equipment: Map<EquipmentSlot, string>; // slot -> instanceId
    stats?: Map<string, number>;
}

/**
 * Crafting recipe
 */
export interface CraftingRecipe {
    id: string;
    result: {
        itemId: string;
        quantity: number;
    };
    ingredients: Array<{
        itemId: string;
        quantity: number;
    }>;
    craftingTime?: number;
    level?: number;
    unlocked?: boolean;
}

/**
 * Shop item
 */
export interface ShopItem {
    itemId: string;
    price: number;
    currency: 'coins' | 'gems' | 'tickets';
    stock?: number;
    discount?: number;
    featured?: boolean;
    available?: boolean;
    expiryDate?: number;
}

/**
 * Trade offer
 */
export interface TradeOffer {
    id: string;
    fromPlayerId: string;
    toPlayerId: string;
    offeredItems: Array<{ instanceId: string; quantity: number }>;
    requestedItems: Array<{ instanceId: string; quantity: number }>;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    timestamp: number;
}

/**
 * Inventory transaction
 */
export interface InventoryTransaction {
    id: string;
    type: 'add' | 'remove' | 'move' | 'equip' | 'unequip' | 'craft' | 'buy' | 'sell' | 'trade';
    itemId: string;
    quantity: number;
    timestamp: number;
    metadata?: { [key: string]: any };
}

/**
 * Inventory System
 * Comprehensive item and equipment management
 */
export class InventorySystem {
    // Item definitions
    private items: Map<string, Item> = new Map();

    // Player inventory
    private inventory: Map<string, InventoryItem> = new Map();
    private maxInventorySize: number = 200;

    // Equipment
    private equippedItems: Map<EquipmentSlot, string> = new Map();
    private loadouts: Map<string, EquipmentLoadout> = new Map();
    private activeLoadoutId?: string;

    // Crafting
    private craftingRecipes: Map<string, CraftingRecipe> = new Map();
    private activeCrafting: Map<string, { recipeId: string; startTime: number; duration: number }> = new Map();

    // Shop
    private shopItems: Map<string, ShopItem> = new Map();

    // Trading
    private tradeOffers: Map<string, TradeOffer> = new Map();

    // Transaction history
    private transactionHistory: InventoryTransaction[] = [];
    private maxHistorySize: number = 1000;

    // Currency
    private currency: Map<string, number> = new Map();

    // Observables
    private onItemAddedObservable: Observable<InventoryItem> = new Observable();
    private onItemRemovedObservable: Observable<InventoryItem> = new Observable();
    private onItemEquippedObservable: Observable<InventoryItem> = new Observable();
    private onItemUnequippedObservable: Observable<InventoryItem> = new Observable();
    private onCurrencyChangedObservable: Observable<{ currency: string; amount: number; total: number }> = new Observable();

    // Settings
    private enabled: boolean = true;
    private autoSort: boolean = false;

    constructor() {
        this.initializeItems();
        this.initializeCurrency();
    }

    /**
     * Initialize item definitions
     */
    private initializeItems(): void {
        // Bats
        this.registerItem({
            id: 'wooden_bat',
            name: 'Wooden Bat',
            description: 'A standard wooden baseball bat',
            type: ItemType.EQUIPMENT,
            rarity: ItemRarity.COMMON,
            icon: 'bat_wooden.png',
            maxStack: 1,
            tradeable: true,
            sellable: true,
            sellPrice: 50,
            buyPrice: 100,
            slot: EquipmentSlot.BAT,
            stats: [
                { stat: 'power', value: 5, type: 'flat' },
                { stat: 'contact', value: 10, type: 'flat' }
            ]
        });

        this.registerItem({
            id: 'aluminum_bat',
            name: 'Aluminum Bat',
            description: 'A lightweight aluminum bat',
            type: ItemType.EQUIPMENT,
            rarity: ItemRarity.UNCOMMON,
            icon: 'bat_aluminum.png',
            maxStack: 1,
            tradeable: true,
            sellable: true,
            sellPrice: 150,
            buyPrice: 300,
            level: 5,
            slot: EquipmentSlot.BAT,
            stats: [
                { stat: 'power', value: 10, type: 'flat' },
                { stat: 'contact', value: 15, type: 'flat' },
                { stat: 'swing_speed', value: 5, type: 'percentage' }
            ]
        });

        this.registerItem({
            id: 'power_bat',
            name: 'Power Bat',
            description: 'A bat designed for maximum power',
            type: ItemType.EQUIPMENT,
            rarity: ItemRarity.RARE,
            icon: 'bat_power.png',
            maxStack: 1,
            tradeable: true,
            sellable: true,
            sellPrice: 500,
            buyPrice: 1000,
            level: 10,
            slot: EquipmentSlot.BAT,
            stats: [
                { stat: 'power', value: 25, type: 'flat' },
                { stat: 'contact', value: 10, type: 'flat' },
                { stat: 'home_run_chance', value: 10, type: 'percentage' }
            ]
        });

        // Gloves
        this.registerItem({
            id: 'basic_glove',
            name: 'Basic Glove',
            description: 'A standard fielding glove',
            type: ItemType.EQUIPMENT,
            rarity: ItemRarity.COMMON,
            icon: 'glove_basic.png',
            maxStack: 1,
            tradeable: true,
            sellable: true,
            sellPrice: 50,
            buyPrice: 100,
            slot: EquipmentSlot.GLOVE,
            stats: [
                { stat: 'fielding', value: 5, type: 'flat' },
                { stat: 'catch_radius', value: 10, type: 'percentage' }
            ]
        });

        this.registerItem({
            id: 'gold_glove',
            name: 'Gold Glove',
            description: 'An elite fielding glove',
            type: ItemType.EQUIPMENT,
            rarity: ItemRarity.EPIC,
            icon: 'glove_gold.png',
            maxStack: 1,
            tradeable: true,
            sellable: true,
            sellPrice: 2000,
            buyPrice: 4000,
            level: 15,
            slot: EquipmentSlot.GLOVE,
            stats: [
                { stat: 'fielding', value: 30, type: 'flat' },
                { stat: 'catch_radius', value: 25, type: 'percentage' },
                { stat: 'reaction_time', value: 15, type: 'percentage' }
            ]
        });

        // Cleats
        this.registerItem({
            id: 'speed_cleats',
            name: 'Speed Cleats',
            description: 'Lightweight cleats for maximum speed',
            type: ItemType.EQUIPMENT,
            rarity: ItemRarity.RARE,
            icon: 'cleats_speed.png',
            maxStack: 1,
            tradeable: true,
            sellable: true,
            sellPrice: 400,
            buyPrice: 800,
            level: 8,
            slot: EquipmentSlot.CLEATS,
            stats: [
                { stat: 'speed', value: 20, type: 'flat' },
                { stat: 'stealing', value: 15, type: 'percentage' },
                { stat: 'acceleration', value: 10, type: 'percentage' }
            ]
        });

        // Consumables
        this.registerItem({
            id: 'energy_drink',
            name: 'Energy Drink',
            description: 'Restores stamina',
            type: ItemType.CONSUMABLE,
            rarity: ItemRarity.COMMON,
            icon: 'consumable_energy.png',
            maxStack: 99,
            tradeable: true,
            sellable: true,
            sellPrice: 10,
            buyPrice: 25,
            effects: ['restore_stamina_50']
        });

        this.registerItem({
            id: 'focus_pills',
            name: 'Focus Pills',
            description: 'Temporarily increases batting accuracy',
            type: ItemType.CONSUMABLE,
            rarity: ItemRarity.UNCOMMON,
            icon: 'consumable_focus.png',
            maxStack: 99,
            tradeable: true,
            sellable: true,
            sellPrice: 25,
            buyPrice: 50,
            effects: ['increase_contact_20_duration_300']
        });

        // Materials
        this.registerItem({
            id: 'leather',
            name: 'Leather',
            description: 'Quality leather for crafting',
            type: ItemType.MATERIAL,
            rarity: ItemRarity.COMMON,
            icon: 'material_leather.png',
            maxStack: 999,
            tradeable: true,
            sellable: true,
            sellPrice: 5,
            buyPrice: 10
        });

        this.registerItem({
            id: 'metal_alloy',
            name: 'Metal Alloy',
            description: 'Strong metal for bat crafting',
            type: ItemType.MATERIAL,
            rarity: ItemRarity.UNCOMMON,
            icon: 'material_metal.png',
            maxStack: 999,
            tradeable: true,
            sellable: true,
            sellPrice: 15,
            buyPrice: 30
        });

        // Cosmetics
        this.registerItem({
            id: 'red_cap',
            name: 'Red Cap',
            description: 'A stylish red baseball cap',
            type: ItemType.COSMETIC,
            rarity: ItemRarity.COMMON,
            icon: 'cosmetic_cap_red.png',
            maxStack: 1,
            tradeable: true,
            sellable: true,
            sellPrice: 100,
            buyPrice: 200,
            slot: EquipmentSlot.HELMET
        });

        // Collectibles
        this.registerItem({
            id: 'rookie_card',
            name: 'Rookie Trading Card',
            description: 'A collectible trading card',
            type: ItemType.COLLECTIBLE,
            rarity: ItemRarity.RARE,
            icon: 'collectible_card.png',
            maxStack: 1,
            tradeable: true,
            sellable: true,
            sellPrice: 500
        });

        // Initialize crafting recipes
        this.registerRecipe({
            id: 'craft_leather_glove',
            result: { itemId: 'basic_glove', quantity: 1 },
            ingredients: [
                { itemId: 'leather', quantity: 5 }
            ],
            craftingTime: 60000, // 1 minute
            level: 1
        });

        this.registerRecipe({
            id: 'craft_aluminum_bat',
            result: { itemId: 'aluminum_bat', quantity: 1 },
            ingredients: [
                { itemId: 'metal_alloy', quantity: 10 },
                { itemId: 'leather', quantity: 2 }
            ],
            craftingTime: 120000, // 2 minutes
            level: 5
        });
    }

    /**
     * Initialize currency
     */
    private initializeCurrency(): void {
        this.currency.set('coins', 1000);
        this.currency.set('gems', 50);
        this.currency.set('tickets', 0);
    }

    /**
     * Register item definition
     */
    public registerItem(item: Item): void {
        this.items.set(item.id, item);
    }

    /**
     * Register crafting recipe
     */
    public registerRecipe(recipe: CraftingRecipe): void {
        this.craftingRecipes.set(recipe.id, recipe);
    }

    /**
     * Add item to inventory
     */
    public addItem(itemId: string, quantity: number = 1, customData?: { [key: string]: any }): InventoryItem | null {
        if (!this.enabled) return null;

        const item = this.items.get(itemId);
        if (!item) {
            console.error(`Item not found: ${itemId}`);
            return null;
        }

        // Check inventory space
        if (this.inventory.size >= this.maxInventorySize) {
            console.warn('Inventory full');
            return null;
        }

        // Check if stackable and exists
        if (item.maxStack > 1) {
            const existing = Array.from(this.inventory.values())
                .find(invItem => invItem.itemId === itemId && invItem.quantity < item.maxStack);

            if (existing) {
                const newQuantity = Math.min(existing.quantity + quantity, item.maxStack);
                const added = newQuantity - existing.quantity;
                existing.quantity = newQuantity;

                this.recordTransaction({
                    id: this.generateTransactionId(),
                    type: 'add',
                    itemId,
                    quantity: added,
                    timestamp: Date.now()
                });

                return existing;
            }
        }

        // Create new inventory item
        const instanceId = this.generateInstanceId();
        const inventoryItem: InventoryItem = {
            instanceId,
            itemId,
            quantity: Math.min(quantity, item.maxStack),
            acquiredDate: Date.now(),
            customData
        };

        if (item.type === ItemType.EQUIPMENT) {
            inventoryItem.durability = 100;
            inventoryItem.maxDurability = 100;
        }

        this.inventory.set(instanceId, inventoryItem);

        this.recordTransaction({
            id: this.generateTransactionId(),
            type: 'add',
            itemId,
            quantity: inventoryItem.quantity,
            timestamp: Date.now()
        });

        this.onItemAddedObservable.notifyObservers(inventoryItem);

        return inventoryItem;
    }

    /**
     * Remove item from inventory
     */
    public removeItem(instanceId: string, quantity: number = 1): boolean {
        if (!this.enabled) return false;

        const inventoryItem = this.inventory.get(instanceId);
        if (!inventoryItem) return false;

        if (quantity >= inventoryItem.quantity) {
            // Remove entirely
            this.inventory.delete(instanceId);

            // Unequip if equipped
            if (inventoryItem.equipped && inventoryItem.slot) {
                this.unequipItem(instanceId);
            }
        } else {
            // Reduce quantity
            inventoryItem.quantity -= quantity;
        }

        this.recordTransaction({
            id: this.generateTransactionId(),
            type: 'remove',
            itemId: inventoryItem.itemId,
            quantity,
            timestamp: Date.now()
        });

        this.onItemRemovedObservable.notifyObservers(inventoryItem);

        return true;
    }

    /**
     * Equip item
     */
    public equipItem(instanceId: string): boolean {
        if (!this.enabled) return false;

        const inventoryItem = this.inventory.get(instanceId);
        if (!inventoryItem) return false;

        const item = this.items.get(inventoryItem.itemId);
        if (!item || !item.slot) return false;

        // Unequip current item in slot
        const currentEquipped = this.equippedItems.get(item.slot);
        if (currentEquipped) {
            this.unequipItem(currentEquipped);
        }

        // Equip new item
        inventoryItem.equipped = true;
        inventoryItem.slot = item.slot;
        this.equippedItems.set(item.slot, instanceId);

        this.recordTransaction({
            id: this.generateTransactionId(),
            type: 'equip',
            itemId: inventoryItem.itemId,
            quantity: 1,
            timestamp: Date.now(),
            metadata: { slot: item.slot }
        });

        this.onItemEquippedObservable.notifyObservers(inventoryItem);

        return true;
    }

    /**
     * Unequip item
     */
    public unequipItem(instanceId: string): boolean {
        const inventoryItem = this.inventory.get(instanceId);
        if (!inventoryItem || !inventoryItem.equipped || !inventoryItem.slot) return false;

        this.equippedItems.delete(inventoryItem.slot);
        inventoryItem.equipped = false;

        const slot = inventoryItem.slot;
        delete inventoryItem.slot;

        this.recordTransaction({
            id: this.generateTransactionId(),
            type: 'unequip',
            itemId: inventoryItem.itemId,
            quantity: 1,
            timestamp: Date.now(),
            metadata: { slot }
        });

        this.onItemUnequippedObservable.notifyObservers(inventoryItem);

        return true;
    }

    /**
     * Use consumable item
     */
    public useItem(instanceId: string): boolean {
        const inventoryItem = this.inventory.get(instanceId);
        if (!inventoryItem) return false;

        const item = this.items.get(inventoryItem.itemId);
        if (!item || item.type !== ItemType.CONSUMABLE) return false;

        // Apply effects
        if (item.effects) {
            for (const effect of item.effects) {
                this.applyItemEffect(effect);
            }
        }

        // Remove one from inventory
        this.removeItem(instanceId, 1);

        return true;
    }

    /**
     * Apply item effect
     */
    private applyItemEffect(effect: string): void {
        // Effect would be parsed and applied
        console.log(`Applied effect: ${effect}`);
    }

    /**
     * Craft item
     */
    public async craftItem(recipeId: string): Promise<boolean> {
        const recipe = this.craftingRecipes.get(recipeId);
        if (!recipe) return false;

        // Check if player has required ingredients
        for (const ingredient of recipe.ingredients) {
            const totalQuantity = this.getItemQuantity(ingredient.itemId);
            if (totalQuantity < ingredient.quantity) {
                console.warn(`Insufficient materials: ${ingredient.itemId}`);
                return false;
            }
        }

        // Remove ingredients
        for (const ingredient of recipe.ingredients) {
            this.removeItemByItemId(ingredient.itemId, ingredient.quantity);
        }

        // Start crafting
        if (recipe.craftingTime) {
            this.activeCrafting.set(recipeId, {
                recipeId,
                startTime: Date.now(),
                duration: recipe.craftingTime
            });

            // Wait for crafting to complete
            await new Promise(resolve => setTimeout(resolve, recipe.craftingTime));

            this.activeCrafting.delete(recipeId);
        }

        // Add result
        this.addItem(recipe.result.itemId, recipe.result.quantity);

        this.recordTransaction({
            id: this.generateTransactionId(),
            type: 'craft',
            itemId: recipe.result.itemId,
            quantity: recipe.result.quantity,
            timestamp: Date.now(),
            metadata: { recipeId }
        });

        return true;
    }

    /**
     * Buy item from shop
     */
    public buyItem(itemId: string, quantity: number = 1): boolean {
        const item = this.items.get(itemId);
        if (!item || !item.buyPrice) return false;

        const totalCost = item.buyPrice * quantity;

        // Check currency
        const coins = this.getCurrency('coins');
        if (coins < totalCost) {
            console.warn('Insufficient coins');
            return false;
        }

        // Deduct currency
        this.addCurrency('coins', -totalCost);

        // Add item
        this.addItem(itemId, quantity);

        this.recordTransaction({
            id: this.generateTransactionId(),
            type: 'buy',
            itemId,
            quantity,
            timestamp: Date.now(),
            metadata: { cost: totalCost }
        });

        return true;
    }

    /**
     * Sell item
     */
    public sellItem(instanceId: string, quantity: number = 1): boolean {
        const inventoryItem = this.inventory.get(instanceId);
        if (!inventoryItem) return false;

        const item = this.items.get(inventoryItem.itemId);
        if (!item || !item.sellable || !item.sellPrice) return false;

        const totalValue = item.sellPrice * quantity;

        // Remove item
        this.removeItem(instanceId, quantity);

        // Add currency
        this.addCurrency('coins', totalValue);

        this.recordTransaction({
            id: this.generateTransactionId(),
            type: 'sell',
            itemId: inventoryItem.itemId,
            quantity,
            timestamp: Date.now(),
            metadata: { value: totalValue }
        });

        return true;
    }

    /**
     * Get currency
     */
    public getCurrency(type: string): number {
        return this.currency.get(type) || 0;
    }

    /**
     * Add currency
     */
    public addCurrency(type: string, amount: number): void {
        const current = this.getCurrency(type);
        const newTotal = Math.max(0, current + amount);
        this.currency.set(type, newTotal);

        this.onCurrencyChangedObservable.notifyObservers({
            currency: type,
            amount,
            total: newTotal
        });
    }

    /**
     * Get item quantity
     */
    public getItemQuantity(itemId: string): number {
        return Array.from(this.inventory.values())
            .filter(item => item.itemId === itemId)
            .reduce((sum, item) => sum + item.quantity, 0);
    }

    /**
     * Remove item by item ID
     */
    private removeItemByItemId(itemId: string, quantity: number): void {
        let remaining = quantity;

        for (const [instanceId, inventoryItem] of this.inventory) {
            if (inventoryItem.itemId === itemId && remaining > 0) {
                const toRemove = Math.min(remaining, inventoryItem.quantity);
                this.removeItem(instanceId, toRemove);
                remaining -= toRemove;
            }
        }
    }

    /**
     * Get inventory item
     */
    public getInventoryItem(instanceId: string): InventoryItem | undefined {
        return this.inventory.get(instanceId);
    }

    /**
     * Get all inventory items
     */
    public getAllItems(): InventoryItem[] {
        return Array.from(this.inventory.values());
    }

    /**
     * Get items by type
     */
    public getItemsByType(type: ItemType): InventoryItem[] {
        return Array.from(this.inventory.values())
            .filter(invItem => {
                const item = this.items.get(invItem.itemId);
                return item && item.type === type;
            });
    }

    /**
     * Get equipped items
     */
    public getEquippedItems(): Map<EquipmentSlot, InventoryItem> {
        const equipped = new Map<EquipmentSlot, InventoryItem>();

        for (const [slot, instanceId] of this.equippedItems) {
            const item = this.inventory.get(instanceId);
            if (item) {
                equipped.set(slot, item);
            }
        }

        return equipped;
    }

    /**
     * Calculate total stats from equipment
     */
    public calculateEquipmentStats(): Map<string, number> {
        const stats = new Map<string, number>();

        for (const instanceId of this.equippedItems.values()) {
            const inventoryItem = this.inventory.get(instanceId);
            if (!inventoryItem) continue;

            const item = this.items.get(inventoryItem.itemId);
            if (!item || !item.stats) continue;

            for (const modifier of item.stats) {
                const current = stats.get(modifier.stat) || 0;

                if (modifier.type === 'flat') {
                    stats.set(modifier.stat, current + modifier.value);
                } else {
                    // Percentage modifiers would be applied multiplicatively
                    stats.set(modifier.stat, current + modifier.value);
                }
            }
        }

        return stats;
    }

    /**
     * Record transaction
     */
    private recordTransaction(transaction: InventoryTransaction): void {
        this.transactionHistory.push(transaction);

        // Trim history
        if (this.transactionHistory.length > this.maxHistorySize) {
            this.transactionHistory.shift();
        }
    }

    /**
     * Get transaction history
     */
    public getTransactionHistory(limit?: number): InventoryTransaction[] {
        const history = [...this.transactionHistory].reverse();
        return limit ? history.slice(0, limit) : history;
    }

    /**
     * Generate instance ID
     */
    private generateInstanceId(): string {
        return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate transaction ID
     */
    private generateTransactionId(): string {
        return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Subscribe to item added
     */
    public onItemAdded(callback: (item: InventoryItem) => void): void {
        this.onItemAddedObservable.add(callback);
    }

    /**
     * Subscribe to item removed
     */
    public onItemRemoved(callback: (item: InventoryItem) => void): void {
        this.onItemRemovedObservable.add(callback);
    }

    /**
     * Subscribe to item equipped
     */
    public onItemEquipped(callback: (item: InventoryItem) => void): void {
        this.onItemEquippedObservable.add(callback);
    }

    /**
     * Subscribe to currency changed
     */
    public onCurrencyChanged(callback: (data: { currency: string; amount: number; total: number }) => void): void {
        this.onCurrencyChangedObservable.add(callback);
    }

    /**
     * Enable/disable system
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Export inventory data
     */
    public exportData(): string {
        const data = {
            inventory: Array.from(this.inventory.entries()),
            equipped: Array.from(this.equippedItems.entries()),
            currency: Array.from(this.currency.entries()),
            transactionHistory: this.transactionHistory.slice(-100)
        };

        return JSON.stringify(data);
    }

    /**
     * Import inventory data
     */
    public importData(data: string): void {
        try {
            const parsed = JSON.parse(data);

            this.inventory = new Map(parsed.inventory);
            this.equippedItems = new Map(parsed.equipped);
            this.currency = new Map(parsed.currency);
            this.transactionHistory = parsed.transactionHistory || [];
        } catch (error) {
            console.error('Failed to import inventory data:', error);
        }
    }

    /**
     * Dispose system
     */
    public dispose(): void {
        this.inventory.clear();
        this.equippedItems.clear();
        this.items.clear();
        this.craftingRecipes.clear();

        this.onItemAddedObservable.clear();
        this.onItemRemovedObservable.clear();
        this.onItemEquippedObservable.clear();
        this.onItemUnequippedObservable.clear();
        this.onCurrencyChangedObservable.clear();
    }
}
