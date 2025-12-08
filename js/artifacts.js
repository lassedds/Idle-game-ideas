/**
 * Artifacts Module
 * Collectible items that provide permanent bonuses
 */

const Artifacts = (function() {
    // Artifact definitions by rarity
    const artifactPool = {
        common: [
            {
                id: 'lucky_pebble',
                name: 'Lucky Pebble',
                icon: '🪨',
                description: 'A simple stone that brings fortune.',
                rarity: 'common',
                effect: { type: 'click', value: 1.05 }
            },
            {
                id: 'old_pickaxe',
                name: 'Old Pickaxe',
                icon: '⛏️',
                description: 'A worn but still effective tool.',
                rarity: 'common',
                effect: { type: 'production', value: 1.05 }
            },
            {
                id: 'crystal_shard',
                name: 'Crystal Shard',
                icon: '🔹',
                description: 'A tiny fragment of pure crystal.',
                rarity: 'common',
                effect: { type: 'production', value: 1.03 }
            },
            {
                id: 'miners_gloves',
                name: "Miner's Gloves",
                icon: '🧤',
                description: 'Protects hands and improves grip.',
                rarity: 'common',
                effect: { type: 'click', value: 1.08 }
            }
        ],
        uncommon: [
            {
                id: 'enchanted_lantern',
                name: 'Enchanted Lantern',
                icon: '🏮',
                description: 'Illuminates hidden crystal veins.',
                rarity: 'uncommon',
                effect: { type: 'production', value: 1.15 }
            },
            {
                id: 'crystal_compass',
                name: 'Crystal Compass',
                icon: '🧭',
                description: 'Points toward the richest deposits.',
                rarity: 'uncommon',
                effect: { type: 'expedition', value: 0.9 }
            },
            {
                id: 'golden_hammer',
                name: 'Golden Hammer',
                icon: '🔨',
                description: 'Strikes true every time.',
                rarity: 'uncommon',
                effect: { type: 'click', value: 1.2 }
            },
            {
                id: 'spirit_bottle',
                name: 'Spirit Bottle',
                icon: '🧴',
                description: 'Contains a helpful mining spirit.',
                rarity: 'uncommon',
                effect: { type: 'production', value: 1.1 }
            }
        ],
        rare: [
            {
                id: 'phoenix_feather',
                name: 'Phoenix Feather',
                icon: '🪶',
                description: 'Burns with eternal fire.',
                rarity: 'rare',
                effect: { type: 'production', value: 1.25 }
            },
            {
                id: 'dragon_scale',
                name: 'Dragon Scale',
                icon: '🐉',
                description: 'Hardened by ancient dragon fire.',
                rarity: 'rare',
                effect: { type: 'click', value: 1.35 }
            },
            {
                id: 'time_crystal',
                name: 'Time Crystal',
                icon: '⏳',
                description: 'Bends time around itself.',
                rarity: 'rare',
                effect: { type: 'expedition', value: 0.75 }
            },
            {
                id: 'void_shard',
                name: 'Void Shard',
                icon: '🌑',
                description: 'A piece of pure nothingness.',
                rarity: 'rare',
                effect: { type: 'production', value: 1.3 }
            }
        ],
        epic: [
            {
                id: 'starfall_gem',
                name: 'Starfall Gem',
                icon: '💫',
                description: 'Fell from the heavens eons ago.',
                rarity: 'epic',
                effect: { type: 'all', value: 1.25 }
            },
            {
                id: 'infinity_prism',
                name: 'Infinity Prism',
                icon: '🔮',
                description: 'Contains infinite reflections.',
                rarity: 'epic',
                effect: { type: 'production', value: 1.5 }
            },
            {
                id: 'cosmic_anvil',
                name: 'Cosmic Anvil',
                icon: '⚒️',
                description: 'Forged in the heart of a star.',
                rarity: 'epic',
                effect: { type: 'click', value: 1.75 }
            },
            {
                id: 'ethereal_crown',
                name: 'Ethereal Crown',
                icon: '👑',
                description: 'Worn by the Crystal King himself.',
                rarity: 'epic',
                effect: { type: 'all', value: 1.2 }
            }
        ],
        legendary: [
            {
                id: 'heart_of_creation',
                name: 'Heart of Creation',
                icon: '💎',
                description: 'The source of all crystals.',
                rarity: 'legendary',
                effect: { type: 'production', value: 2.0 }
            },
            {
                id: 'hand_of_midas',
                name: 'Hand of Midas',
                icon: '✋',
                description: 'Everything it touches turns to crystal.',
                rarity: 'legendary',
                effect: { type: 'click', value: 3.0 }
            },
            {
                id: 'universe_core',
                name: 'Universe Core',
                icon: '🌟',
                description: 'Contains an entire universe.',
                rarity: 'legendary',
                effect: { type: 'all', value: 1.5 }
            },
            {
                id: 'eternal_flame',
                name: 'Eternal Flame',
                icon: '🔥',
                description: 'Burns without consuming.',
                rarity: 'legendary',
                effect: { type: 'all', value: 1.75 }
            }
        ]
    };

    // Rarity weights based on expedition risk level
    const rarityWeights = {
        1: { common: 85, uncommon: 14, rare: 1, epic: 0, legendary: 0 },
        2: { common: 70, uncommon: 25, rare: 4, epic: 1, legendary: 0 },
        3: { common: 50, uncommon: 35, rare: 12, epic: 3, legendary: 0 },
        4: { common: 30, uncommon: 40, rare: 22, epic: 7, legendary: 1 },
        5: { common: 15, uncommon: 35, rare: 30, epic: 15, legendary: 5 },
        6: { common: 5, uncommon: 20, rare: 40, epic: 25, legendary: 10 },
        7: { common: 0, uncommon: 10, rare: 35, epic: 35, legendary: 20 }
    };

    // Owned artifacts
    let ownedArtifacts = [];

    /**
     * Roll a random artifact based on expedition risk level
     */
    function rollRandomArtifact(riskLevel) {
        const weights = rarityWeights[riskLevel] || rarityWeights[1];

        // Roll for rarity
        const roll = Math.random() * 100;
        let cumulative = 0;
        let selectedRarity = 'common';

        for (const [rarity, weight] of Object.entries(weights)) {
            cumulative += weight;
            if (roll < cumulative) {
                selectedRarity = rarity;
                break;
            }
        }

        // Pick random artifact of that rarity
        const pool = artifactPool[selectedRarity];
        const artifact = pool[Math.floor(Math.random() * pool.length)];

        return { ...artifact };
    }

    /**
     * Add an artifact to collection
     */
    function addArtifact(artifact) {
        // Check for duplicates - increase power if duplicate
        const existing = ownedArtifacts.find(a => a.id === artifact.id);
        if (existing) {
            existing.count = (existing.count || 1) + 1;
            // Slightly increase effect for duplicates
            existing.effect.value = existing.effect.value * 1.05;
        } else {
            ownedArtifacts.push({ ...artifact, count: 1 });
        }
    }

    /**
     * Get all owned artifacts
     */
    function getOwned() {
        return ownedArtifacts;
    }

    /**
     * Get production bonus from artifacts
     */
    function getProductionBonus() {
        let bonus = 1;
        ownedArtifacts.forEach(artifact => {
            if (artifact.effect.type === 'production' || artifact.effect.type === 'all') {
                bonus *= artifact.effect.value;
            }
        });
        return bonus;
    }

    /**
     * Get click bonus from artifacts
     */
    function getClickBonus() {
        let bonus = 1;
        ownedArtifacts.forEach(artifact => {
            if (artifact.effect.type === 'click' || artifact.effect.type === 'all') {
                bonus *= artifact.effect.value;
            }
        });
        return bonus;
    }

    /**
     * Get expedition time reduction from artifacts
     */
    function getExpeditionBonus() {
        let multiplier = 1;
        ownedArtifacts.forEach(artifact => {
            if (artifact.effect.type === 'expedition') {
                multiplier *= artifact.effect.value;
            }
        });
        return multiplier;
    }

    /**
     * Get rarity color
     */
    function getRarityColor(rarity) {
        const colors = {
            common: '#9e9e9e',
            uncommon: '#4caf50',
            rare: '#2196f3',
            epic: '#9c27b0',
            legendary: '#ff9800'
        };
        return colors[rarity] || colors.common;
    }

    /**
     * Get state for saving
     */
    function getState() {
        return { owned: ownedArtifacts };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state && state.owned) {
            ownedArtifacts = state.owned;
        }
    }

    /**
     * Reset artifacts
     */
    function reset() {
        ownedArtifacts = [];
    }

    // Public API
    return {
        rollRandomArtifact,
        addArtifact,
        getOwned,
        getProductionBonus,
        getClickBonus,
        getExpeditionBonus,
        getRarityColor,
        getState,
        loadState,
        reset
    };
})();
