/**
 * Reincarnation Module (Reverse Progression)
 * Handles prestige, soul essence, and soul tree progression
 */

const Reincarnation = (function() {
    let soulEssence = 0; // Permanent currency
    let reincarnationCount = 0;
    let soulTree = {}; // Purchased soul tree nodes
    let currentGeneration = 1;
    let preservedData = {}; // Data that persists across lives

    const MIN_REINCARNATION_LEVEL = 50;

    // Soul Tree structure
    const SOUL_TREE = {
        // Rebirth Boons
        heirloom_weapon: {
            category: 'rebirth_boons',
            name: 'Heirloom Weapon',
            description: 'Start each life with a basic weapon',
            cost: 100,
            maxLevel: 1
        },
        fast_learner: {
            category: 'rebirth_boons',
            name: 'Fast Learner',
            description: '+50% EXP gain up to level 20',
            cost: 200,
            maxLevel: 5,
            perLevel: 10 // Additional 10% per level
        },
        wealthy_soul: {
            category: 'rebirth_boons',
            name: 'Wealthy Soul',
            description: 'Start with 10% of previous life\'s gold',
            cost: 300,
            maxLevel: 5,
            perLevel: 5 // Additional 5% per level
        },
        soul_memory: {
            category: 'rebirth_boons',
            name: 'Soul Memory',
            description: 'Retain 1 random equipment blueprint',
            cost: 500,
            maxLevel: 3
        },

        // Power Growth
        eternal_strength: {
            category: 'power_growth',
            name: 'Eternal Strength',
            description: '+1% damage permanently',
            cost: 50,
            maxLevel: 100,
            perLevel: 1
        },
        eternal_vitality: {
            category: 'power_growth',
            name: 'Eternal Vitality',
            description: '+1% HP permanently',
            cost: 50,
            maxLevel: 100,
            perLevel: 1
        },
        eternal_fortune: {
            category: 'power_growth',
            name: 'Eternal Fortune',
            description: '+0.5% critical chance permanently',
            cost: 75,
            maxLevel: 50,
            perLevel: 0.5
        },
        eternal_wisdom: {
            category: 'power_growth',
            name: 'Eternal Wisdom',
            description: '+1% EXP gain permanently',
            cost: 100,
            maxLevel: 50,
            perLevel: 1
        },

        // Soul Abilities
        soul_link: {
            category: 'soul_abilities',
            name: 'Soul Link',
            description: 'Trade Soul Essence with other players',
            cost: 1000,
            maxLevel: 1
        },
        memory_recall: {
            category: 'soul_abilities',
            name: 'Memory Recall',
            description: 'Temporarily access a previous life skill (1 hour cooldown)',
            cost: 1500,
            maxLevel: 3,
            perLevel: 1 // Additional skill per level
        },
        phantom_equipment: {
            category: 'soul_abilities',
            name: 'Phantom Equipment',
            description: 'Summon ghostly version of lost equipment (24h cooldown)',
            cost: 2000,
            maxLevel: 1
        },
        corruption_mastery: {
            category: 'soul_abilities',
            name: 'Corruption Mastery',
            description: 'Keep corruption benefits without drawbacks',
            cost: 2500,
            maxLevel: 1
        },

        // Cycle Mastery
        quick_rebirth: {
            category: 'cycle_mastery',
            name: 'Quick Rebirth',
            description: 'Reduce reincarnation level requirement by 5',
            cost: 800,
            maxLevel: 5,
            perLevel: 5
        },
        essence_amplifier: {
            category: 'cycle_mastery',
            name: 'Essence Amplifier',
            description: '+10% Soul Essence gain per reincarnation',
            cost: 1000,
            maxLevel: 10,
            perLevel: 10
        },
        multi_rebirth: {
            category: 'cycle_mastery',
            name: 'Multi-Rebirth',
            description: 'Skip to level 10/20/30 on reincarnation',
            cost: 3000,
            maxLevel: 3,
            levels: [10, 20, 30]
        },
        zone_amnesia: {
            category: 'cycle_mastery',
            name: 'Zone Amnesia',
            description: 'Reset one zone\'s fatigue per cycle',
            cost: 1500,
            maxLevel: 5,
            perLevel: 1
        },
        eternal_fusion: {
            category: 'cycle_mastery',
            name: 'Eternal Fusion',
            description: 'Keep one fusion skill active across lives',
            cost: 2000,
            maxLevel: 3,
            perLevel: 1
        }
    };

    /**
     * Initialize reincarnation system
     */
    function init() {
        currentGeneration = reincarnationCount + 1;
    }

    /**
     * Check if can reincarnate
     */
    function canReincarnate() {
        const char = Character.getActive();
        if (!char) return false;

        const minLevel = getMinReincarnationLevel();
        return char.level >= minLevel;
    }

    /**
     * Get minimum reincarnation level (can be reduced by soul tree)
     */
    function getMinReincarnationLevel() {
        let minLevel = MIN_REINCARNATION_LEVEL;

        const quickRebirth = soulTree.quick_rebirth || 0;
        minLevel -= quickRebirth * (SOUL_TREE.quick_rebirth.perLevel || 0);

        return Math.max(1, minLevel);
    }

    /**
     * Calculate Soul Essence gained from reincarnation
     */
    function calculateSoulEssence() {
        const char = Character.getActive();
        if (!char) return 0;

        const level = char.level;
        const gold = Inventory.getTotalValue();
        const bossKills = 10; // Would track this
        const corruptionLevel = typeof Corruption !== 'undefined' ? Corruption.getCorruptionLevel() : 0;

        // Formula: (Level × Gold × Boss Kills × Corruption) / 1000
        let essence = Math.floor((level * gold * bossKills * (1 + corruptionLevel / 100)) / 1000);

        // Apply essence amplifier from soul tree
        const amplifier = soulTree.essence_amplifier || 0;
        const bonus = amplifier * (SOUL_TREE.essence_amplifier.perLevel || 0) / 100;
        essence = Math.floor(essence * (1 + bonus));

        return essence;
    }

    /**
     * Perform reincarnation
     */
    function reincarnate() {
        if (!canReincarnate()) {
            return { error: 'Cannot reincarnate yet' };
        }

        const char = Character.getActive();
        if (!char) return { error: 'No active character' };

        // Calculate gained Soul Essence
        const gainedEssence = calculateSoulEssence();
        soulEssence += gainedEssence;
        reincarnationCount++;
        currentGeneration = reincarnationCount + 1;

        // Preserve certain data based on soul tree
        preserveData(char);

        // Reset character
        resetForReincarnation(char);

        // Apply rebirth boons
        applyRebirthBoons(char);

        // Notify
        if (typeof UI !== 'undefined') {
            UI.showNotification(`🔄 Reincarnated! Gained ${gainedEssence} Soul Essence!`, 'success');
        }

        // Notify multiplayer
        if (typeof Multiplayer !== 'undefined' && Multiplayer.isConnected()) {
            Multiplayer.sendChat(`has been reincarnated! (Generation ${currentGeneration})`);
            Multiplayer.sendPlayerUpdate();
        }

        return {
            success: true,
            soulEssence: gainedEssence,
            generation: currentGeneration
        };
    }

    /**
     * Preserve data before reincarnation
     */
    function preserveData(char) {
        // Preserve fusion recipes
        if (typeof SkillFusion !== 'undefined') {
            preservedData.fusionRecipes = SkillFusion.getKnownRecipes();
        }

        // Preserve genetic blueprints (if soul tree unlocked)
        if (soulTree.soul_memory) {
            const level = soulTree.soul_memory;
            if (typeof EquipmentGenetics !== 'undefined') {
                const allGenetics = EquipmentGenetics.getAllGenetics();
                const geneticsArray = Object.values(allGenetics);
                preservedData.savedBlueprints = geneticsArray
                    .sort((a, b) => b.purity - a.purity)
                    .slice(0, level);
            }
        }

        // Preserve eternal fusion slots
        if (soulTree.eternal_fusion) {
            const level = soulTree.eternal_fusion;
            if (typeof SkillFusion !== 'undefined') {
                const active = SkillFusion.getActiveFusions();
                preservedData.eternalFusions = active.slice(0, level);
            }
        }

        // Store previous life stats for wealthy soul
        if (soulTree.wealthy_soul) {
            preservedData.previousGold = Inventory.getGold();
        }
    }

    /**
     * Reset character for reincarnation
     */
    function resetForReincarnation(char) {
        // Reset to level 1
        char.level = 1;
        char.exp = 0;
        char.totalExp = 0;

        // Clear equipment
        const slots = ['weapon', 'armor', 'helmet', 'ring', 'amulet', 'gloves', 'boots'];
        slots.forEach(slot => {
            if (char.equipment && char.equipment[slot]) {
                Inventory.unequipItem(slot);
            }
        });

        // Clear gold
        const currentGold = Inventory.getGold();
        Inventory.removeGold(currentGold);

        // Reset skills (but preserve knowledge)
        // This would depend on Skills module implementation

        // Reset inventory (but preserve some items based on soul tree)
        Inventory.reset();

        // Reset corruption to 0
        if (typeof Corruption !== 'undefined') {
            Corruption.reset();
        }

        // DON'T reset zone fatigue (it persists)
        // DON'T reset equipment genetics (knowledge persists)
        // DON'T reset fusion recipes (knowledge persists)
    }

    /**
     * Apply rebirth boons
     */
    function applyRebirthBoons(char) {
        // Heirloom Weapon
        if (soulTree.heirloom_weapon) {
            Inventory.addItem('wooden_sword', 1);
            Inventory.equipItem('wooden_sword');
        }

        // Wealthy Soul
        if (soulTree.wealthy_soul && preservedData.previousGold) {
            const level = soulTree.wealthy_soul;
            const percentage = 10 + (level - 1) * (SOUL_TREE.wealthy_soul.perLevel || 0);
            const startGold = Math.floor(preservedData.previousGold * percentage / 100);
            Inventory.addGold(startGold);
        }

        // Multi-Rebirth (skip levels)
        if (soulTree.multi_rebirth) {
            const level = soulTree.multi_rebirth;
            const skipTo = SOUL_TREE.multi_rebirth.levels[level - 1];
            char.level = skipTo;
        }

        // Restore eternal fusions
        if (preservedData.eternalFusions && typeof SkillFusion !== 'undefined') {
            preservedData.eternalFusions.forEach(fusion => {
                SkillFusion.equipFusion(fusion.id);
            });
        }
    }

    /**
     * Purchase soul tree node
     */
    function purchaseSoulNode(nodeId) {
        const node = SOUL_TREE[nodeId];
        if (!node) {
            return { error: 'Invalid node' };
        }

        const currentLevel = soulTree[nodeId] || 0;

        if (currentLevel >= node.maxLevel) {
            return { error: 'Already at max level' };
        }

        const cost = node.cost * (currentLevel + 1); // Cost increases per level

        if (soulEssence < cost) {
            return { error: `Need ${cost} Soul Essence` };
        }

        soulEssence -= cost;
        soulTree[nodeId] = currentLevel + 1;

        if (typeof UI !== 'undefined') {
            UI.showNotification(`Unlocked ${node.name} (Level ${currentLevel + 1})!`, 'success');
        }

        return {
            success: true,
            nodeId,
            level: currentLevel + 1
        };
    }

    /**
     * Get soul tree node level
     */
    function getSoulNodeLevel(nodeId) {
        return soulTree[nodeId] || 0;
    }

    /**
     * Get all soul tree nodes
     */
    function getSoulTree() {
        return { ...SOUL_TREE };
    }

    /**
     * Get purchased nodes
     */
    function getPurchasedNodes() {
        return { ...soulTree };
    }

    /**
     * Get soul essence
     */
    function getSoulEssence() {
        return soulEssence;
    }

    /**
     * Add soul essence (from special events/trades)
     */
    function addSoulEssence(amount) {
        soulEssence += amount;
    }

    /**
     * Get reincarnation count
     */
    function getReincarnationCount() {
        return reincarnationCount;
    }

    /**
     * Get current generation
     */
    function getCurrentGeneration() {
        return currentGeneration;
    }

    /**
     * Get power growth bonuses
     */
    function getPowerBonuses() {
        const bonuses = {
            damageMultiplier: 1.0,
            hpMultiplier: 1.0,
            critBonus: 0,
            expMultiplier: 1.0
        };

        if (soulTree.eternal_strength) {
            const level = soulTree.eternal_strength;
            bonuses.damageMultiplier += level * (SOUL_TREE.eternal_strength.perLevel || 0) / 100;
        }

        if (soulTree.eternal_vitality) {
            const level = soulTree.eternal_vitality;
            bonuses.hpMultiplier += level * (SOUL_TREE.eternal_vitality.perLevel || 0) / 100;
        }

        if (soulTree.eternal_fortune) {
            const level = soulTree.eternal_fortune;
            bonuses.critBonus += level * (SOUL_TREE.eternal_fortune.perLevel || 0);
        }

        if (soulTree.eternal_wisdom) {
            const level = soulTree.eternal_wisdom;
            bonuses.expMultiplier += level * (SOUL_TREE.eternal_wisdom.perLevel || 0) / 100;
        }

        // Fast learner bonus (only up to level 20)
        if (soulTree.fast_learner) {
            const char = Character.getActive();
            if (char && char.level <= 20) {
                const level = soulTree.fast_learner;
                const bonus = 50 + (level - 1) * (SOUL_TREE.fast_learner.perLevel || 0);
                bonuses.expMultiplier += bonus / 100;
            }
        }

        return bonuses;
    }

    /**
     * Get preserved data
     */
    function getPreservedData() {
        return { ...preservedData };
    }

    /**
     * Get state for saving
     */
    function getState() {
        return {
            soulEssence,
            reincarnationCount,
            soulTree,
            currentGeneration,
            preservedData
        };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state) {
            soulEssence = state.soulEssence || 0;
            reincarnationCount = state.reincarnationCount || 0;
            soulTree = state.soulTree || {};
            currentGeneration = state.currentGeneration || 1;
            preservedData = state.preservedData || {};
        }
    }

    /**
     * Reset (full wipe, not reincarnation)
     */
    function reset() {
        soulEssence = 0;
        reincarnationCount = 0;
        soulTree = {};
        currentGeneration = 1;
        preservedData = {};
    }

    // Public API
    return {
        init,
        canReincarnate,
        getMinReincarnationLevel,
        calculateSoulEssence,
        reincarnate,
        purchaseSoulNode,
        getSoulNodeLevel,
        getSoulTree,
        getPurchasedNodes,
        getSoulEssence,
        addSoulEssence,
        getReincarnationCount,
        getCurrentGeneration,
        getPowerBonuses,
        getPreservedData,
        getState,
        loadState,
        reset
    };
})();
