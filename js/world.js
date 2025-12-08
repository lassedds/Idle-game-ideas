/**
 * World Module
 * World map with zones, activities, and monsters
 */

const World = (function() {
    // Zone definitions
    const zones = {
        // Starting area
        town: {
            id: 'town',
            name: 'Starter Town',
            icon: '🏘️',
            description: 'A peaceful town where adventurers begin their journey',
            background: '#87ceeb',
            unlocked: true,
            reqLevel: 1,
            activities: [],
            monsters: [],
            npcs: ['shopkeeper', 'questgiver']
        },

        // Forest area
        forest_edge: {
            id: 'forest_edge',
            name: 'Forest Edge',
            icon: '🌲',
            description: 'The outskirts of Evergreen Forest',
            background: '#228b22',
            unlocked: true,
            reqLevel: 1,
            activities: [
                { type: 'woodcutting', resource: 'oak_log', expPerAction: 10, timePerAction: 3 },
                { type: 'combat', monsters: ['slime', 'forest_bug'] }
            ],
            monsters: ['slime', 'forest_bug']
        },

        deep_forest: {
            id: 'deep_forest',
            name: 'Deep Forest',
            icon: '🌳',
            description: 'Dense woodland with stronger creatures',
            background: '#1a5c1a',
            unlocked: false,
            reqLevel: 5,
            activities: [
                { type: 'woodcutting', resource: 'maple_log', expPerAction: 25, timePerAction: 4 },
                { type: 'combat', monsters: ['wolf', 'goblin'] }
            ],
            monsters: ['wolf', 'goblin']
        },

        ancient_grove: {
            id: 'ancient_grove',
            name: 'Ancient Grove',
            icon: '🌿',
            description: 'Mystical forest with ancient trees',
            background: '#0d3d0d',
            unlocked: false,
            reqLevel: 20,
            activities: [
                { type: 'woodcutting', resource: 'ancient_log', expPerAction: 100, timePerAction: 8 },
                { type: 'combat', monsters: ['forest_guardian', 'treant'] }
            ],
            monsters: ['forest_guardian', 'treant']
        },

        // Mining areas
        copper_mine: {
            id: 'copper_mine',
            name: 'Copper Mine',
            icon: '⛏️',
            description: 'Shallow mine with copper deposits',
            background: '#8b4513',
            unlocked: true,
            reqLevel: 1,
            activities: [
                { type: 'mining', resource: 'copper_ore', expPerAction: 10, timePerAction: 3 },
                { type: 'combat', monsters: ['cave_bat', 'rock_crab'] }
            ],
            monsters: ['cave_bat', 'rock_crab']
        },

        iron_mine: {
            id: 'iron_mine',
            name: 'Iron Mine',
            icon: '🔩',
            description: 'Deeper mine with iron ore',
            background: '#5c4033',
            unlocked: false,
            reqLevel: 8,
            activities: [
                { type: 'mining', resource: 'iron_ore', expPerAction: 30, timePerAction: 4 },
                { type: 'mining', resource: 'gold_ore', expPerAction: 50, timePerAction: 6, chance: 0.2 },
                { type: 'combat', monsters: ['mine_spider', 'goblin_miner'] }
            ],
            monsters: ['mine_spider', 'goblin_miner']
        },

        crystal_caverns: {
            id: 'crystal_caverns',
            name: 'Crystal Caverns',
            icon: '💎',
            description: 'Sparkling caves filled with precious crystals',
            background: '#4a148c',
            unlocked: false,
            reqLevel: 25,
            activities: [
                { type: 'mining', resource: 'crystal_shard', expPerAction: 80, timePerAction: 5 },
                { type: 'mining', resource: 'diamond', expPerAction: 200, timePerAction: 10, chance: 0.1 },
                { type: 'combat', monsters: ['crystal_golem', 'shadow_lurker'] }
            ],
            monsters: ['crystal_golem', 'shadow_lurker']
        },

        // Water areas
        pond: {
            id: 'pond',
            name: 'Town Pond',
            icon: '🎣',
            description: 'A small pond near town',
            background: '#4fc3f7',
            unlocked: true,
            reqLevel: 1,
            activities: [
                { type: 'fishing', resource: 'small_fish', expPerAction: 8, timePerAction: 4 }
            ],
            monsters: []
        },

        river: {
            id: 'river',
            name: 'Flowing River',
            icon: '🏞️',
            description: 'A wide river with diverse fish',
            background: '#0288d1',
            unlocked: false,
            reqLevel: 10,
            activities: [
                { type: 'fishing', resource: 'bass', expPerAction: 25, timePerAction: 5 },
                { type: 'fishing', resource: 'salmon', expPerAction: 45, timePerAction: 7, chance: 0.3 }
            ],
            monsters: ['water_sprite']
        },

        mystic_lake: {
            id: 'mystic_lake',
            name: 'Mystic Lake',
            icon: '✨🌊',
            description: 'A magical lake with rare fish',
            background: '#1565c0',
            unlocked: false,
            reqLevel: 30,
            activities: [
                { type: 'fishing', resource: 'golden_fish', expPerAction: 150, timePerAction: 10 },
                { type: 'fishing', resource: 'legendary_catch', expPerAction: 500, timePerAction: 30, chance: 0.05 }
            ],
            monsters: ['lake_serpent']
        },

        // Combat zones
        goblin_camp: {
            id: 'goblin_camp',
            name: 'Goblin Camp',
            icon: '⛺',
            description: 'A camp filled with goblins',
            background: '#4e342e',
            unlocked: false,
            reqLevel: 10,
            activities: [
                { type: 'combat', monsters: ['goblin', 'goblin_shaman', 'goblin_chief'] }
            ],
            monsters: ['goblin', 'goblin_shaman', 'goblin_chief']
        },

        dark_dungeon: {
            id: 'dark_dungeon',
            name: 'Dark Dungeon',
            icon: '🏚️',
            description: 'An ancient dungeon with powerful enemies',
            background: '#212121',
            unlocked: false,
            reqLevel: 25,
            activities: [
                { type: 'combat', monsters: ['skeleton', 'ghost', 'dungeon_boss'] }
            ],
            monsters: ['skeleton', 'ghost', 'dungeon_boss']
        },

        dragon_lair: {
            id: 'dragon_lair',
            name: 'Dragon Lair',
            icon: '🐉',
            description: 'Home of the legendary dragon',
            background: '#b71c1c',
            unlocked: false,
            reqLevel: 50,
            activities: [
                { type: 'combat', monsters: ['dragon_wyrmling', 'dragon'] }
            ],
            monsters: ['dragon_wyrmling', 'dragon']
        }
    };

    // Monster definitions
    const monsters = {
        // Forest monsters (Level 1-5)
        slime: {
            id: 'slime',
            name: 'Slime',
            icon: '🟢',
            level: 1,
            hp: 20,
            damage: 3,
            defense: 1,
            exp: 15,
            gold: 5,
            drops: [
                { itemId: 'slime_gel', chance: 0.5 }
            ],
            attackSpeed: 2
        },
        forest_bug: {
            id: 'forest_bug',
            name: 'Forest Bug',
            icon: '🐛',
            level: 2,
            hp: 15,
            damage: 5,
            defense: 0,
            exp: 18,
            gold: 7,
            drops: [],
            attackSpeed: 1.5
        },

        // Cave monsters (Level 3-8)
        cave_bat: {
            id: 'cave_bat',
            name: 'Cave Bat',
            icon: '🦇',
            level: 3,
            hp: 25,
            damage: 8,
            defense: 2,
            exp: 25,
            gold: 10,
            drops: [],
            attackSpeed: 1.2
        },
        rock_crab: {
            id: 'rock_crab',
            name: 'Rock Crab',
            icon: '🦀',
            level: 4,
            hp: 50,
            damage: 6,
            defense: 8,
            exp: 30,
            gold: 15,
            drops: [
                { itemId: 'copper_ore', chance: 0.3 }
            ],
            attackSpeed: 2.5
        },

        // Forest monsters (Level 5-12)
        wolf: {
            id: 'wolf',
            name: 'Wolf',
            icon: '🐺',
            level: 6,
            hp: 60,
            damage: 15,
            defense: 5,
            exp: 50,
            gold: 20,
            drops: [
                { itemId: 'wolf_pelt', chance: 0.4 }
            ],
            attackSpeed: 1.5
        },
        goblin: {
            id: 'goblin',
            name: 'Goblin',
            icon: '👺',
            level: 7,
            hp: 45,
            damage: 12,
            defense: 4,
            exp: 45,
            gold: 25,
            drops: [
                { itemId: 'goblin_ear', chance: 0.5 },
                { itemId: 'copper_ring', chance: 0.05 }
            ],
            attackSpeed: 1.8
        },

        // Mine monsters (Level 8-15)
        mine_spider: {
            id: 'mine_spider',
            name: 'Mine Spider',
            icon: '🕷️',
            level: 10,
            hp: 70,
            damage: 20,
            defense: 6,
            exp: 80,
            gold: 35,
            drops: [],
            attackSpeed: 1.3
        },
        goblin_miner: {
            id: 'goblin_miner',
            name: 'Goblin Miner',
            icon: '⛏️👺',
            level: 12,
            hp: 90,
            damage: 18,
            defense: 10,
            exp: 100,
            gold: 50,
            drops: [
                { itemId: 'iron_ore', chance: 0.4 },
                { itemId: 'bronze_pickaxe', chance: 0.1 }
            ],
            attackSpeed: 2
        },

        // Goblin camp (Level 10-18)
        goblin_shaman: {
            id: 'goblin_shaman',
            name: 'Goblin Shaman',
            icon: '🧙👺',
            level: 14,
            hp: 80,
            damage: 30,
            defense: 5,
            exp: 150,
            gold: 80,
            drops: [
                { itemId: 'mana_potion', chance: 0.3 }
            ],
            attackSpeed: 2.5
        },
        goblin_chief: {
            id: 'goblin_chief',
            name: 'Goblin Chief',
            icon: '👑👺',
            level: 18,
            hp: 200,
            damage: 35,
            defense: 15,
            exp: 300,
            gold: 150,
            drops: [
                { itemId: 'iron_sword', chance: 0.2 },
                { itemId: 'gold_ring', chance: 0.1 }
            ],
            attackSpeed: 2,
            isBoss: true
        },

        // Forest guardians (Level 20-30)
        forest_guardian: {
            id: 'forest_guardian',
            name: 'Forest Guardian',
            icon: '🌲👁️',
            level: 22,
            hp: 180,
            damage: 40,
            defense: 20,
            exp: 250,
            gold: 100,
            drops: [
                { itemId: 'ancient_log', chance: 0.3 }
            ],
            attackSpeed: 2.2
        },
        treant: {
            id: 'treant',
            name: 'Treant',
            icon: '🌳',
            level: 28,
            hp: 350,
            damage: 50,
            defense: 30,
            exp: 450,
            gold: 200,
            drops: [
                { itemId: 'ancient_log', chance: 0.6 },
                { itemId: 'lucky_amulet', chance: 0.1 }
            ],
            attackSpeed: 3,
            isBoss: true
        },

        // Crystal caverns (Level 25-35)
        crystal_golem: {
            id: 'crystal_golem',
            name: 'Crystal Golem',
            icon: '💎🤖',
            level: 28,
            hp: 300,
            damage: 45,
            defense: 35,
            exp: 400,
            gold: 150,
            drops: [
                { itemId: 'crystal_shard', chance: 0.5 }
            ],
            attackSpeed: 3
        },
        shadow_lurker: {
            id: 'shadow_lurker',
            name: 'Shadow Lurker',
            icon: '👤',
            level: 32,
            hp: 250,
            damage: 60,
            defense: 20,
            exp: 500,
            gold: 200,
            drops: [
                { itemId: 'diamond', chance: 0.15 }
            ],
            attackSpeed: 1.5
        },

        // Dungeon (Level 25-40)
        skeleton: {
            id: 'skeleton',
            name: 'Skeleton',
            icon: '💀',
            level: 26,
            hp: 150,
            damage: 35,
            defense: 10,
            exp: 280,
            gold: 90,
            drops: [],
            attackSpeed: 1.8
        },
        ghost: {
            id: 'ghost',
            name: 'Ghost',
            icon: '👻',
            level: 30,
            hp: 120,
            damage: 50,
            defense: 5,
            exp: 350,
            gold: 120,
            drops: [
                { itemId: 'boss_essence', chance: 0.05 }
            ],
            attackSpeed: 1.2
        },
        dungeon_boss: {
            id: 'dungeon_boss',
            name: 'Lich King',
            icon: '👑💀',
            level: 40,
            hp: 800,
            damage: 80,
            defense: 40,
            exp: 1500,
            gold: 500,
            drops: [
                { itemId: 'boss_essence', chance: 0.5 },
                { itemId: 'arcane_staff', chance: 0.2 }
            ],
            attackSpeed: 2,
            isBoss: true
        },

        // Water monsters
        water_sprite: {
            id: 'water_sprite',
            name: 'Water Sprite',
            icon: '💧',
            level: 12,
            hp: 60,
            damage: 20,
            defense: 8,
            exp: 100,
            gold: 40,
            drops: [
                { itemId: 'mana_potion', chance: 0.2 }
            ],
            attackSpeed: 1.5
        },
        lake_serpent: {
            id: 'lake_serpent',
            name: 'Lake Serpent',
            icon: '🐍',
            level: 35,
            hp: 450,
            damage: 65,
            defense: 25,
            exp: 600,
            gold: 250,
            drops: [
                { itemId: 'golden_fish', chance: 0.3 }
            ],
            attackSpeed: 1.8,
            isBoss: true
        },

        // Dragon lair (Level 50+)
        dragon_wyrmling: {
            id: 'dragon_wyrmling',
            name: 'Dragon Wyrmling',
            icon: '🐲',
            level: 50,
            hp: 600,
            damage: 100,
            defense: 50,
            exp: 1200,
            gold: 400,
            drops: [
                { itemId: 'dragon_scale', chance: 0.3 }
            ],
            attackSpeed: 1.5
        },
        dragon: {
            id: 'dragon',
            name: 'Ancient Dragon',
            icon: '🐉',
            level: 75,
            hp: 5000,
            damage: 200,
            defense: 100,
            exp: 10000,
            gold: 5000,
            drops: [
                { itemId: 'dragon_scale', chance: 1 },
                { itemId: 'dragon_slayer', chance: 0.05 },
                { itemId: 'boss_essence', chance: 0.5 }
            ],
            attackSpeed: 2.5,
            isBoss: true
        }
    };

    // Track unlocked zones
    let unlockedZones = { town: true, forest_edge: true, copper_mine: true, pond: true };

    /**
     * Get zone by ID
     */
    function getZone(zoneId) {
        return zones[zoneId] || null;
    }

    /**
     * Get all zones
     */
    function getAllZones() {
        return zones;
    }

    /**
     * Get unlocked zones
     */
    function getUnlockedZones() {
        const result = [];
        for (const zoneId in zones) {
            if (isZoneUnlocked(zoneId)) {
                result.push(zones[zoneId]);
            }
        }
        return result;
    }

    /**
     * Check if zone is unlocked
     */
    function isZoneUnlocked(zoneId) {
        return unlockedZones[zoneId] || false;
    }

    /**
     * Unlock zone
     */
    function unlockZone(zoneId) {
        if (zones[zoneId]) {
            unlockedZones[zoneId] = true;
            return true;
        }
        return false;
    }

    /**
     * Check and unlock zones based on level
     */
    function checkUnlocks(level) {
        const newUnlocks = [];
        for (const zoneId in zones) {
            if (!unlockedZones[zoneId] && zones[zoneId].reqLevel <= level) {
                unlockedZones[zoneId] = true;
                newUnlocks.push(zones[zoneId]);
            }
        }
        return newUnlocks;
    }

    /**
     * Get monster by ID
     */
    function getMonster(monsterId) {
        return monsters[monsterId] || null;
    }

    /**
     * Get all monsters
     */
    function getAllMonsters() {
        return monsters;
    }

    /**
     * Get monsters in zone
     */
    function getZoneMonsters(zoneId) {
        const zone = zones[zoneId];
        if (!zone) return [];

        return zone.monsters.map(id => monsters[id]).filter(m => m);
    }

    /**
     * Get activities in zone
     */
    function getZoneActivities(zoneId) {
        const zone = zones[zoneId];
        if (!zone) return [];
        return zone.activities;
    }

    /**
     * Spawn random monster from zone
     */
    function spawnMonster(zoneId) {
        const zoneMonsters = getZoneMonsters(zoneId);
        if (zoneMonsters.length === 0) return null;

        // Random monster from zone
        const monster = zoneMonsters[Math.floor(Math.random() * zoneMonsters.length)];

        // Return a copy with current HP
        return {
            ...monster,
            currentHp: monster.hp
        };
    }

    /**
     * Get state for saving
     */
    function getState() {
        return { unlockedZones };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state && state.unlockedZones) {
            unlockedZones = state.unlockedZones;
        }
    }

    /**
     * Reset
     */
    function reset() {
        unlockedZones = { town: true, forest_edge: true, copper_mine: true, pond: true };
    }

    // Public API
    return {
        getZone,
        getAllZones,
        getUnlockedZones,
        isZoneUnlocked,
        unlockZone,
        checkUnlocks,
        getMonster,
        getAllMonsters,
        getZoneMonsters,
        getZoneActivities,
        spawnMonster,
        getState,
        loadState,
        reset
    };
})();
