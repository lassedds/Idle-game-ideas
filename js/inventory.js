/**
 * Inventory Module
 * Handles items, equipment, and resources
 */

const Inventory = (function() {
    // Item definitions - now using SVG icons
    const itemDefs = {
        // Resources - Mining
        copper_ore: { id: 'copper_ore', name: 'Copper Ore', icon: Icons.resources.copper_ore, type: 'resource', category: 'mining', rarity: 'common', value: 5 },
        iron_ore: { id: 'iron_ore', name: 'Iron Ore', icon: Icons.resources.iron_ore, type: 'resource', category: 'mining', rarity: 'common', value: 15 },
        gold_ore: { id: 'gold_ore', name: 'Gold Ore', icon: Icons.resources.gold_ore, type: 'resource', category: 'mining', rarity: 'uncommon', value: 50 },
        crystal_shard: { id: 'crystal_shard', name: 'Crystal Shard', icon: Icons.resources.crystal_shard, type: 'resource', category: 'mining', rarity: 'rare', value: 150 },
        diamond: { id: 'diamond', name: 'Diamond', icon: Icons.resources.diamond, type: 'resource', category: 'mining', rarity: 'epic', value: 500 },

        // Resources - Woodcutting
        oak_log: { id: 'oak_log', name: 'Oak Log', icon: Icons.resources.oak_log, type: 'resource', category: 'woodcutting', rarity: 'common', value: 5 },
        maple_log: { id: 'maple_log', name: 'Maple Log', icon: Icons.resources.maple_log, type: 'resource', category: 'woodcutting', rarity: 'common', value: 15 },
        birch_log: { id: 'birch_log', name: 'Birch Log', icon: Icons.resources.birch_log, type: 'resource', category: 'woodcutting', rarity: 'uncommon', value: 40 },
        ancient_log: { id: 'ancient_log', name: 'Ancient Log', icon: Icons.resources.ancient_log, type: 'resource', category: 'woodcutting', rarity: 'rare', value: 200 },

        // Resources - Fishing
        small_fish: { id: 'small_fish', name: 'Small Fish', icon: Icons.resources.small_fish, type: 'resource', category: 'fishing', rarity: 'common', value: 8 },
        bass: { id: 'bass', name: 'Bass', icon: Icons.resources.bass, type: 'resource', category: 'fishing', rarity: 'common', value: 20 },
        salmon: { id: 'salmon', name: 'Salmon', icon: Icons.resources.salmon, type: 'resource', category: 'fishing', rarity: 'uncommon', value: 45 },
        golden_fish: { id: 'golden_fish', name: 'Golden Fish', icon: Icons.resources.golden_fish, type: 'resource', category: 'fishing', rarity: 'rare', value: 200 },
        legendary_catch: { id: 'legendary_catch', name: 'Legendary Catch', icon: Icons.resources.legendary_catch, type: 'resource', category: 'fishing', rarity: 'legendary', value: 1000 },

        // Crafting materials
        bronze_bar: { id: 'bronze_bar', name: 'Bronze Bar', icon: Icons.resources.bronze_bar, type: 'resource', category: 'smithing', rarity: 'common', value: 25 },
        iron_bar: { id: 'iron_bar', name: 'Iron Bar', icon: Icons.resources.iron_bar, type: 'resource', category: 'smithing', rarity: 'common', value: 75 },
        steel_bar: { id: 'steel_bar', name: 'Steel Bar', icon: Icons.resources.steel_bar, type: 'resource', category: 'smithing', rarity: 'uncommon', value: 200 },
        mythril_bar: { id: 'mythril_bar', name: 'Mythril Bar', icon: Icons.resources.mythril_bar, type: 'resource', category: 'smithing', rarity: 'rare', value: 500 },

        // Consumables
        health_potion: { id: 'health_potion', name: 'Health Potion', icon: Icons.consumables.health_potion, type: 'consumable', effect: { heal: 50 }, rarity: 'common', value: 30 },
        mana_potion: { id: 'mana_potion', name: 'Mana Potion', icon: Icons.consumables.mana_potion, type: 'consumable', effect: { mana: 30 }, rarity: 'common', value: 30 },
        exp_potion: { id: 'exp_potion', name: 'EXP Potion', icon: Icons.consumables.exp_potion, type: 'consumable', effect: { expBoost: 1.5, duration: 300 }, rarity: 'uncommon', value: 100 },
        power_elixir: { id: 'power_elixir', name: 'Power Elixir', icon: Icons.consumables.power_elixir, type: 'consumable', effect: { heal: 200, mana: 100 }, rarity: 'rare', value: 250 },

        // Monster drops
        slime_gel: { id: 'slime_gel', name: 'Slime Gel', icon: Icons.resources.slime_gel, type: 'resource', category: 'monster', rarity: 'common', value: 10 },
        goblin_ear: { id: 'goblin_ear', name: 'Goblin Ear', icon: Icons.resources.goblin_ear, type: 'resource', category: 'monster', rarity: 'common', value: 15 },
        wolf_pelt: { id: 'wolf_pelt', name: 'Wolf Pelt', icon: Icons.resources.wolf_pelt, type: 'resource', category: 'monster', rarity: 'uncommon', value: 40 },
        dragon_scale: { id: 'dragon_scale', name: 'Dragon Scale', icon: Icons.resources.dragon_scale, type: 'resource', category: 'monster', rarity: 'epic', value: 500 },
        boss_essence: { id: 'boss_essence', name: 'Boss Essence', icon: Icons.resources.boss_essence, type: 'resource', category: 'monster', rarity: 'legendary', value: 2000 },

        // Equipment - Weapons
        wooden_sword: { id: 'wooden_sword', name: 'Wooden Sword', icon: Icons.equipment.wooden_sword, type: 'equipment', slot: 'weapon', stats: { str: 2 }, rarity: 'common', value: 50, reqLevel: 1 },
        bronze_sword: { id: 'bronze_sword', name: 'Bronze Sword', icon: Icons.equipment.bronze_sword, type: 'equipment', slot: 'weapon', stats: { str: 5, agi: 1 }, rarity: 'common', value: 150, reqLevel: 5 },
        iron_sword: { id: 'iron_sword', name: 'Iron Sword', icon: Icons.equipment.iron_sword, type: 'equipment', slot: 'weapon', stats: { str: 10, agi: 2 }, rarity: 'uncommon', value: 400, reqLevel: 10 },
        steel_blade: { id: 'steel_blade', name: 'Steel Blade', icon: Icons.equipment.steel_blade, type: 'equipment', slot: 'weapon', stats: { str: 18, agi: 5 }, rarity: 'rare', value: 1000, reqLevel: 20 },
        mythril_sword: { id: 'mythril_sword', name: 'Mythril Sword', icon: Icons.equipment.mythril_sword, type: 'equipment', slot: 'weapon', stats: { str: 30, agi: 10, luk: 5 }, rarity: 'epic', value: 3000, reqLevel: 35 },
        dragon_slayer: { id: 'dragon_slayer', name: 'Dragon Slayer', icon: Icons.equipment.dragon_slayer, type: 'equipment', slot: 'weapon', stats: { str: 50, agi: 15, luk: 10 }, rarity: 'legendary', value: 10000, reqLevel: 50 },

        // Mage weapons
        wooden_staff: { id: 'wooden_staff', name: 'Wooden Staff', icon: Icons.equipment.wooden_staff, type: 'equipment', slot: 'weapon', stats: { wis: 3 }, rarity: 'common', value: 50, reqLevel: 1 },
        crystal_staff: { id: 'crystal_staff', name: 'Crystal Staff', icon: Icons.equipment.crystal_staff, type: 'equipment', slot: 'weapon', stats: { wis: 12, luk: 3 }, rarity: 'uncommon', value: 500, reqLevel: 10 },
        arcane_staff: { id: 'arcane_staff', name: 'Arcane Staff', icon: Icons.equipment.arcane_staff, type: 'equipment', slot: 'weapon', stats: { wis: 25, luk: 8 }, rarity: 'rare', value: 1500, reqLevel: 25 },

        // Archer weapons
        short_bow: { id: 'short_bow', name: 'Short Bow', icon: Icons.equipment.short_bow, type: 'equipment', slot: 'weapon', stats: { agi: 3, luk: 1 }, rarity: 'common', value: 50, reqLevel: 1 },
        long_bow: { id: 'long_bow', name: 'Long Bow', icon: Icons.equipment.long_bow, type: 'equipment', slot: 'weapon', stats: { agi: 10, luk: 4 }, rarity: 'uncommon', value: 400, reqLevel: 10 },
        composite_bow: { id: 'composite_bow', name: 'Composite Bow', icon: Icons.equipment.composite_bow, type: 'equipment', slot: 'weapon', stats: { agi: 22, luk: 10 }, rarity: 'rare', value: 1200, reqLevel: 22 },

        // Armor
        cloth_armor: { id: 'cloth_armor', name: 'Cloth Armor', icon: Icons.equipment.cloth_armor, type: 'equipment', slot: 'armor', stats: { str: 1, wis: 2 }, rarity: 'common', value: 40, reqLevel: 1 },
        leather_armor: { id: 'leather_armor', name: 'Leather Armor', icon: Icons.equipment.leather_armor, type: 'equipment', slot: 'armor', stats: { str: 4, agi: 2 }, rarity: 'common', value: 120, reqLevel: 5 },
        chainmail: { id: 'chainmail', name: 'Chainmail', icon: Icons.equipment.chainmail, type: 'equipment', slot: 'armor', stats: { str: 8, agi: 3 }, rarity: 'uncommon', value: 350, reqLevel: 12 },
        plate_armor: { id: 'plate_armor', name: 'Plate Armor', icon: Icons.equipment.plate_armor, type: 'equipment', slot: 'armor', stats: { str: 15, agi: 5 }, rarity: 'rare', value: 900, reqLevel: 25 },

        // Helmets
        cloth_hood: { id: 'cloth_hood', name: 'Cloth Hood', icon: Icons.equipment.cloth_hood, type: 'equipment', slot: 'helmet', stats: { wis: 2 }, rarity: 'common', value: 30, reqLevel: 1 },
        iron_helm: { id: 'iron_helm', name: 'Iron Helm', icon: Icons.equipment.iron_helm, type: 'equipment', slot: 'helmet', stats: { str: 4 }, rarity: 'uncommon', value: 200, reqLevel: 10 },

        // Accessories
        copper_ring: { id: 'copper_ring', name: 'Copper Ring', icon: Icons.equipment.copper_ring, type: 'equipment', slot: 'ring', stats: { luk: 2 }, rarity: 'common', value: 50, reqLevel: 1 },
        gold_ring: { id: 'gold_ring', name: 'Gold Ring', icon: Icons.equipment.gold_ring, type: 'equipment', slot: 'ring', stats: { luk: 5, str: 2 }, rarity: 'uncommon', value: 200, reqLevel: 10 },
        lucky_amulet: { id: 'lucky_amulet', name: 'Lucky Amulet', icon: Icons.equipment.lucky_amulet, type: 'equipment', slot: 'amulet', stats: { luk: 8 }, rarity: 'rare', value: 500, reqLevel: 15 },

        // Tools
        bronze_pickaxe: { id: 'bronze_pickaxe', name: 'Bronze Pickaxe', icon: Icons.equipment.bronze_pickaxe, type: 'tool', skill: 'mining', bonus: 1.1, rarity: 'common', value: 100, reqLevel: 1 },
        iron_pickaxe: { id: 'iron_pickaxe', name: 'Iron Pickaxe', icon: Icons.equipment.iron_pickaxe, type: 'tool', skill: 'mining', bonus: 1.25, rarity: 'uncommon', value: 300, reqLevel: 10 },
        bronze_axe: { id: 'bronze_axe', name: 'Bronze Axe', icon: Icons.equipment.bronze_axe, type: 'tool', skill: 'woodcutting', bonus: 1.1, rarity: 'common', value: 100, reqLevel: 1 },
        iron_axe: { id: 'iron_axe', name: 'Iron Axe', icon: Icons.equipment.iron_axe, type: 'tool', skill: 'woodcutting', bonus: 1.25, rarity: 'uncommon', value: 300, reqLevel: 10 },
        fishing_rod: { id: 'fishing_rod', name: 'Fishing Rod', icon: Icons.equipment.fishing_rod, type: 'tool', skill: 'fishing', bonus: 1.1, rarity: 'common', value: 100, reqLevel: 1 },
        pro_fishing_rod: { id: 'fishing_rod', name: 'Fishing Rod', icon: Icons.equipment.fishing_rod, type: 'tool', skill: 'fishing', bonus: 1.25, rarity: 'uncommon', value: 300, reqLevel: 10 }
    };

    // Rarity colors
    const rarityColors = {
        common: '#9e9e9e',
        uncommon: '#4caf50',
        rare: '#2196f3',
        epic: '#9c27b0',
        legendary: '#ff9800'
    };

    // Inventory storage
    let inventory = {}; // { itemId: quantity }
    let gold = 0;
    let maxSlots = 50;

    /**
     * Add item to inventory
     */
    function addItem(itemId, quantity = 1) {
        if (!itemDefs[itemId]) return false;

        inventory[itemId] = (inventory[itemId] || 0) + quantity;
        return true;
    }

    /**
     * Remove item from inventory
     */
    function removeItem(itemId, quantity = 1) {
        if (!inventory[itemId] || inventory[itemId] < quantity) {
            return false;
        }

        inventory[itemId] -= quantity;
        if (inventory[itemId] <= 0) {
            delete inventory[itemId];
        }
        return true;
    }

    /**
     * Get item quantity
     */
    function getQuantity(itemId) {
        return inventory[itemId] || 0;
    }

    /**
     * Check if has item
     */
    function hasItem(itemId, quantity = 1) {
        return (inventory[itemId] || 0) >= quantity;
    }

    /**
     * Get all inventory
     */
    function getAll() {
        return { ...inventory };
    }

    /**
     * Get items by type
     */
    function getByType(type) {
        const items = [];
        for (const itemId in inventory) {
            const def = itemDefs[itemId];
            if (def && def.type === type) {
                items.push({ ...def, quantity: inventory[itemId] });
            }
        }
        return items;
    }

    /**
     * Get item definition
     */
    function getItemDef(itemId) {
        return itemDefs[itemId] || null;
    }

    /**
     * Get all item definitions
     */
    function getAllItemDefs() {
        return itemDefs;
    }

    /**
     * Add gold
     */
    function addGold(amount) {
        gold += amount;
        return gold;
    }

    /**
     * Remove gold
     */
    function removeGold(amount) {
        if (gold < amount) return false;
        gold -= amount;
        return true;
    }

    /**
     * Get gold
     */
    function getGold() {
        return gold;
    }

    /**
     * Sell item
     */
    function sellItem(itemId, quantity = 1) {
        if (!hasItem(itemId, quantity)) return false;

        const def = itemDefs[itemId];
        if (!def) return false;

        removeItem(itemId, quantity);
        addGold(Math.floor(def.value * 0.5) * quantity);
        return true;
    }

    /**
     * Use consumable item
     */
    function useItem(itemId, charIndex) {
        if (!hasItem(itemId)) return null;

        const def = itemDefs[itemId];
        if (!def || def.type !== 'consumable') return null;

        const effects = [];

        if (def.effect.heal) {
            const healed = Character.heal(charIndex, def.effect.heal);
            effects.push({ type: 'heal', amount: healed });
        }

        if (def.effect.mana) {
            const char = Character.getByIndex(charIndex);
            if (char) {
                const restored = Math.min(def.effect.mana, char.maxMp - char.mp);
                char.mp += restored;
                effects.push({ type: 'mana', amount: restored });
            }
        }

        removeItem(itemId);
        return effects;
    }

    /**
     * Equip item to character
     */
    function equipItem(itemId, charIndex) {
        const def = itemDefs[itemId];
        if (!def || def.type !== 'equipment') return false;
        if (!hasItem(itemId)) return false;

        const char = Character.getByIndex(charIndex);
        if (!char) return false;

        // Check level requirement
        if (def.reqLevel && char.level < def.reqLevel) return false;

        // Unequip current item in slot if any
        if (char.equipment[def.slot]) {
            addItem(char.equipment[def.slot]);
        }

        // Equip new item
        removeItem(itemId);
        char.equipment[def.slot] = itemId;

        // Recalculate stats
        Character.recalculateStats(charIndex);

        return true;
    }

    /**
     * Unequip item from character
     */
    function unequipItem(slot, charIndex) {
        const char = Character.getByIndex(charIndex);
        if (!char || !char.equipment[slot]) return false;

        const itemId = char.equipment[slot];
        char.equipment[slot] = null;
        addItem(itemId);

        Character.recalculateStats(charIndex);
        return true;
    }

    /**
     * Get rarity color
     */
    function getRarityColor(rarity) {
        return rarityColors[rarity] || rarityColors.common;
    }

    /**
     * Get total inventory value
     */
    function getTotalValue() {
        let total = gold;
        for (const itemId in inventory) {
            const def = itemDefs[itemId];
            if (def) {
                total += def.value * inventory[itemId];
            }
        }
        return total;
    }

    /**
     * Get state for saving
     */
    function getState() {
        return {
            inventory,
            gold,
            maxSlots
        };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state) {
            inventory = state.inventory || {};
            gold = state.gold || 0;
            maxSlots = state.maxSlots || 50;
        }
    }

    /**
     * Reset
     */
    function reset() {
        inventory = {};
        gold = 0;
    }

    // Public API
    return {
        addItem,
        removeItem,
        getQuantity,
        hasItem,
        getAll,
        getByType,
        getItemDef,
        getAllItemDefs,
        addGold,
        removeGold,
        getGold,
        sellItem,
        useItem,
        equipItem,
        unequipItem,
        getRarityColor,
        getTotalValue,
        getState,
        loadState,
        reset
    };
})();
