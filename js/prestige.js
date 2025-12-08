/**
 * Prestige Module
 * Reset progress for permanent multipliers and special upgrades
 */

const Prestige = (function() {
    // Prestige state
    let prestigeLevel = 0;
    let stardust = 0; // Prestige currency
    let totalStardust = 0;

    // Prestige upgrades
    const prestigeUpgrades = [
        {
            id: 'stardust_production',
            name: 'Stardust Infusion',
            icon: '✨',
            description: 'Each Stardust gives +1% production.',
            maxLevel: -1, // Unlimited
            baseCost: 1,
            costScale: 1.5,
            effect: (level) => 1 + (stardust * 0.01)
        },
        {
            id: 'starting_crystals',
            name: 'Head Start',
            icon: '🎁',
            description: 'Start with bonus crystals after prestige.',
            maxLevel: 10,
            baseCost: 5,
            costScale: 2,
            effect: (level) => level * 1000
        },
        {
            id: 'click_mastery',
            name: 'Click Mastery',
            icon: '👆',
            description: '+25% click power per level.',
            maxLevel: 10,
            baseCost: 3,
            costScale: 1.8,
            effect: (level) => 1 + (level * 0.25)
        },
        {
            id: 'production_mastery',
            name: 'Production Mastery',
            icon: '⚙️',
            description: '+20% production per level.',
            maxLevel: 10,
            baseCost: 3,
            costScale: 1.8,
            effect: (level) => 1 + (level * 0.2)
        },
        {
            id: 'expedition_mastery',
            name: 'Expedition Mastery',
            icon: '🗺️',
            description: '-10% expedition time per level.',
            maxLevel: 5,
            baseCost: 10,
            costScale: 2.5,
            effect: (level) => 1 - (level * 0.1)
        },
        {
            id: 'artifact_luck',
            name: 'Artifact Luck',
            icon: '🍀',
            description: '+15% better artifact rarity per level.',
            maxLevel: 5,
            baseCost: 15,
            costScale: 3,
            effect: (level) => level * 0.15
        },
        {
            id: 'event_frequency',
            name: 'Lucky Stars',
            icon: '⭐',
            description: 'Events occur more frequently.',
            maxLevel: 5,
            baseCost: 20,
            costScale: 2.5,
            effect: (level) => 1 + (level * 0.2)
        },
        {
            id: 'gem_bonus',
            name: 'Gem Affinity',
            icon: '💎',
            description: '+20% gems from all sources per level.',
            maxLevel: 10,
            baseCost: 8,
            costScale: 2,
            effect: (level) => 1 + (level * 0.2)
        }
    ];

    // Purchased prestige upgrade levels
    let purchasedUpgrades = {};

    /**
     * Calculate stardust earned from current run
     */
    function calculateStardustEarned() {
        const totalCrystals = GameState.getStats().totalCrystals;
        // Logarithmic scaling: more crystals = more stardust, but diminishing returns
        if (totalCrystals < 10000) return 0;
        return Math.floor(Math.pow(totalCrystals / 10000, 0.5));
    }

    /**
     * Get prestige info
     */
    function getPrestigeInfo() {
        const earned = calculateStardustEarned();
        return {
            level: prestigeLevel,
            stardust: stardust,
            totalStardust: totalStardust,
            potentialStardust: earned,
            canPrestige: earned > 0
        };
    }

    /**
     * Perform prestige reset
     */
    function performPrestige() {
        const earned = calculateStardustEarned();
        if (earned <= 0) return false;

        // Award stardust
        stardust += earned;
        totalStardust += earned;
        prestigeLevel++;

        // Reset game state but keep prestige progress
        resetGameProgress();

        return {
            stardustEarned: earned,
            newLevel: prestigeLevel,
            totalStardust: stardust
        };
    }

    /**
     * Reset game progress (keeping prestige)
     */
    function resetGameProgress() {
        // Reset main game state
        GameState.resetState();

        // Reset other modules
        if (typeof Expeditions !== 'undefined') {
            Expeditions.reset();
        }
        if (typeof Events !== 'undefined') {
            Events.reset();
        }
        // Note: Artifacts persist through prestige!

        // Apply starting crystals bonus
        const startingLevel = purchasedUpgrades['starting_crystals'] || 0;
        if (startingLevel > 0) {
            const upgrade = prestigeUpgrades.find(u => u.id === 'starting_crystals');
            const bonus = upgrade.effect(startingLevel);
            GameState.addCrystals(bonus, false);
        }
    }

    /**
     * Get prestige upgrades
     */
    function getUpgrades() {
        return prestigeUpgrades.map(upgrade => {
            const currentLevel = purchasedUpgrades[upgrade.id] || 0;
            const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costScale, currentLevel));
            const canAfford = stardust >= cost;
            const maxed = upgrade.maxLevel !== -1 && currentLevel >= upgrade.maxLevel;

            return {
                ...upgrade,
                currentLevel,
                cost,
                canAfford,
                maxed,
                currentEffect: upgrade.effect(currentLevel)
            };
        });
    }

    /**
     * Purchase a prestige upgrade
     */
    function purchaseUpgrade(upgradeId) {
        const upgrade = prestigeUpgrades.find(u => u.id === upgradeId);
        if (!upgrade) return false;

        const currentLevel = purchasedUpgrades[upgradeId] || 0;
        if (upgrade.maxLevel !== -1 && currentLevel >= upgrade.maxLevel) return false;

        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costScale, currentLevel));
        if (stardust < cost) return false;

        stardust -= cost;
        purchasedUpgrades[upgradeId] = currentLevel + 1;

        return true;
    }

    /**
     * Get production multiplier from prestige
     */
    function getProductionMultiplier() {
        let multiplier = 1;

        // Stardust infusion (if purchased)
        if (purchasedUpgrades['stardust_production']) {
            multiplier *= (1 + stardust * 0.01);
        }

        // Production mastery
        const prodLevel = purchasedUpgrades['production_mastery'] || 0;
        if (prodLevel > 0) {
            multiplier *= (1 + prodLevel * 0.2);
        }

        return multiplier;
    }

    /**
     * Get click multiplier from prestige
     */
    function getClickMultiplier() {
        const clickLevel = purchasedUpgrades['click_mastery'] || 0;
        return 1 + (clickLevel * 0.25);
    }

    /**
     * Get expedition time multiplier
     */
    function getExpeditionTimeMultiplier() {
        const expLevel = purchasedUpgrades['expedition_mastery'] || 0;
        return Math.max(0.5, 1 - (expLevel * 0.1));
    }

    /**
     * Get artifact rarity bonus
     */
    function getArtifactRarityBonus() {
        const artLevel = purchasedUpgrades['artifact_luck'] || 0;
        return artLevel * 0.15;
    }

    /**
     * Get gem multiplier
     */
    function getGemMultiplier() {
        const gemLevel = purchasedUpgrades['gem_bonus'] || 0;
        return 1 + (gemLevel * 0.2);
    }

    /**
     * Get state for saving
     */
    function getState() {
        return {
            level: prestigeLevel,
            stardust: stardust,
            totalStardust: totalStardust,
            upgrades: purchasedUpgrades
        };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state) {
            prestigeLevel = state.level || 0;
            stardust = state.stardust || 0;
            totalStardust = state.totalStardust || 0;
            purchasedUpgrades = state.upgrades || {};
        }
    }

    /**
     * Full reset (including prestige)
     */
    function fullReset() {
        prestigeLevel = 0;
        stardust = 0;
        totalStardust = 0;
        purchasedUpgrades = {};
    }

    // Public API
    return {
        calculateStardustEarned,
        getPrestigeInfo,
        performPrestige,
        getUpgrades,
        purchaseUpgrade,
        getProductionMultiplier,
        getClickMultiplier,
        getExpeditionTimeMultiplier,
        getArtifactRarityBonus,
        getGemMultiplier,
        getState,
        loadState,
        fullReset
    };
})();
