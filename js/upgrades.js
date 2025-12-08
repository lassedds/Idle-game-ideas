/**
 * Upgrades Module
 * Defines and manages upgrades that improve production
 */

const Upgrades = (function() {
    // Upgrade definitions
    const upgrades = [
        // Click Power Upgrades
        {
            id: 'click1',
            name: 'Reinforced Pickaxe',
            icon: '⛏️',
            description: 'Double your click power.',
            cost: 100,
            type: 'click',
            multiplier: 2,
            effect: () => {
                GameState.multiplyClickPower(2);
            },
            unlockCondition: () => GameState.getStats().totalClicks >= 50
        },
        {
            id: 'click2',
            name: 'Crystal-Tipped Tools',
            icon: '💎',
            description: 'Triple your click power.',
            cost: 1000,
            type: 'click',
            multiplier: 3,
            effect: () => {
                GameState.multiplyClickPower(3);
            },
            unlockCondition: () => GameState.hasUpgrade('click1')
        },
        {
            id: 'click3',
            name: 'Laser Precision',
            icon: '🔴',
            description: 'Clicks are 5x more powerful.',
            cost: 10000,
            type: 'click',
            multiplier: 5,
            effect: () => {
                GameState.multiplyClickPower(5);
            },
            unlockCondition: () => GameState.hasUpgrade('click2')
        },
        {
            id: 'click4',
            name: 'Quantum Extraction',
            icon: '⚡',
            description: 'Clicks are 10x more powerful.',
            cost: 100000,
            type: 'click',
            multiplier: 10,
            effect: () => {
                GameState.multiplyClickPower(10);
            },
            unlockCondition: () => GameState.hasUpgrade('click3')
        },

        // Building Multiplier Upgrades
        {
            id: 'prod1',
            name: 'Efficient Mining',
            icon: '📈',
            description: 'All buildings produce 25% more.',
            cost: 500,
            type: 'production',
            multiplier: 1.25,
            effect: () => {
                GameState.multiplyProductionMultiplier(1.25);
            },
            unlockCondition: () => Buildings.getTotalOwned() >= 10
        },
        {
            id: 'prod2',
            name: 'Advanced Techniques',
            icon: '🔧',
            description: 'All buildings produce 50% more.',
            cost: 5000,
            type: 'production',
            multiplier: 1.5,
            effect: () => {
                GameState.multiplyProductionMultiplier(1.5);
            },
            unlockCondition: () => GameState.hasUpgrade('prod1')
        },
        {
            id: 'prod3',
            name: 'Industrial Revolution',
            icon: '🏭',
            description: 'Double all production.',
            cost: 50000,
            type: 'production',
            multiplier: 2,
            effect: () => {
                GameState.multiplyProductionMultiplier(2);
            },
            unlockCondition: () => GameState.hasUpgrade('prod2')
        },
        {
            id: 'prod4',
            name: 'Technological Singularity',
            icon: '🤖',
            description: 'Triple all production.',
            cost: 500000,
            type: 'production',
            multiplier: 3,
            effect: () => {
                GameState.multiplyProductionMultiplier(3);
            },
            unlockCondition: () => GameState.hasUpgrade('prod3')
        },

        // Special Building Upgrades
        {
            id: 'miner_boost',
            name: 'Miner Training',
            icon: '👷',
            description: 'Miners produce double crystals.',
            cost: 300,
            type: 'building',
            buildingId: 'miner',
            multiplier: 2,
            effect: () => {
                GameState.multiplyBuildingMultiplier('miner', 2);
            },
            unlockCondition: () => GameState.getBuildingCount('miner') >= 10
        },
        {
            id: 'drill_boost',
            name: 'Diamond Drill Bits',
            icon: '💠',
            description: 'Drills produce double crystals.',
            cost: 2000,
            type: 'building',
            buildingId: 'drill',
            multiplier: 2,
            effect: () => {
                GameState.multiplyBuildingMultiplier('drill', 2);
            },
            unlockCondition: () => GameState.getBuildingCount('drill') >= 10
        },
        {
            id: 'excavator_boost',
            name: 'Heavy Duty Upgrades',
            icon: '🔩',
            description: 'Excavators produce double crystals.',
            cost: 10000,
            type: 'building',
            buildingId: 'excavator',
            multiplier: 2,
            effect: () => {
                GameState.multiplyBuildingMultiplier('excavator', 2);
            },
            unlockCondition: () => GameState.getBuildingCount('excavator') >= 10
        },
        {
            id: 'quarry_boost',
            name: 'Expansion Project',
            icon: '📐',
            description: 'Quarries produce double crystals.',
            cost: 40000,
            type: 'building',
            buildingId: 'quarry',
            multiplier: 2,
            effect: () => {
                GameState.multiplyBuildingMultiplier('quarry', 2);
            },
            unlockCondition: () => GameState.getBuildingCount('quarry') >= 10
        },
        {
            id: 'refinery_boost',
            name: 'Purity Enhancement',
            icon: '✨',
            description: 'Refineries produce double crystals.',
            cost: 200000,
            type: 'building',
            buildingId: 'refinery',
            multiplier: 2,
            effect: () => {
                GameState.multiplyBuildingMultiplier('refinery', 2);
            },
            unlockCondition: () => GameState.getBuildingCount('refinery') >= 10
        },

        // Synergy Upgrades (effects applied dynamically in applySynergyBonuses)
        {
            id: 'synergy1',
            name: 'Crystal Synergy',
            icon: '🔗',
            description: 'Each building type boosts click power by 5%.',
            cost: 25000,
            type: 'synergy',
            effect: () => {
                // Applied dynamically in applySynergyBonuses
            },
            unlockCondition: () => Buildings.getTotalOwned() >= 50
        },
        {
            id: 'synergy2',
            name: 'Perfect Harmony',
            icon: '☯️',
            description: 'Each 10 buildings adds +5% to all production.',
            cost: 250000,
            type: 'synergy',
            effect: () => {
                // Applied dynamically in applySynergyBonuses
            },
            unlockCondition: () => Buildings.getTotalOwned() >= 100
        }
    ];

    /**
     * Get all upgrades
     */
    function getAll() {
        return upgrades;
    }

    /**
     * Get a specific upgrade by ID
     */
    function getById(upgradeId) {
        return upgrades.find(u => u.id === upgradeId) || null;
    }

    /**
     * Check if an upgrade is unlocked (visible to player)
     */
    function isUnlocked(upgradeId) {
        const upgrade = getById(upgradeId);
        if (!upgrade) return false;
        if (GameState.hasUpgrade(upgradeId)) return true;
        return upgrade.unlockCondition();
    }

    /**
     * Check if player can afford an upgrade
     */
    function canAfford(upgradeId) {
        const upgrade = getById(upgradeId);
        if (!upgrade) return false;
        return GameState.getCrystals() >= upgrade.cost;
    }

    /**
     * Purchase an upgrade
     */
    function purchase(upgradeId) {
        const upgrade = getById(upgradeId);
        if (!upgrade || GameState.hasUpgrade(upgradeId)) return false;

        if (GameState.spendCrystals(upgrade.cost)) {
            GameState.purchaseUpgrade(upgradeId);
            upgrade.effect();
            return true;
        }
        return false;
    }

    /**
     * Get available (unlocked but not purchased) upgrades
     */
    function getAvailable() {
        return upgrades.filter(upgrade =>
            isUnlocked(upgrade.id) && !GameState.hasUpgrade(upgrade.id)
        );
    }

    /**
     * Apply synergy bonuses (called during game loop)
     */
    function applySynergyBonuses() {
        // Synergy 1: Building types boost click power
        if (GameState.hasUpgrade('synergy1')) {
            let buildingTypes = 0;
            Buildings.getAll().forEach(building => {
                if (GameState.getBuildingCount(building.id) > 0) {
                    buildingTypes++;
                }
            });
            // Each building type gives +5% click power
            GameState.setClickSynergyMultiplier(1 + (buildingTypes * 0.05));
        } else {
            GameState.setClickSynergyMultiplier(1);
        }

        // Synergy 2: Total buildings boost production
        if (GameState.hasUpgrade('synergy2')) {
            const totalBuildings = Buildings.getTotalOwned();
            // Each 10 buildings gives +5% production
            const bonus = Math.floor(totalBuildings / 10) * 0.05;
            GameState.setProductionSynergyMultiplier(1 + bonus);
        } else {
            GameState.setProductionSynergyMultiplier(1);
        }
    }

    /**
     * Reapply all purchased upgrade effects (for loading saves)
     */
    function reapplyUpgrades() {
        // Reset multipliers first to avoid stacking
        GameState.resetUpgradeMultipliers();

        // Reapply each purchased upgrade's effect
        upgrades.forEach(upgrade => {
            if (GameState.hasUpgrade(upgrade.id) && upgrade.type !== 'synergy') {
                upgrade.effect();
            }
        });

        // Synergy bonuses are applied dynamically each frame
    }

    // Public API
    return {
        getAll,
        getById,
        isUnlocked,
        canAfford,
        purchase,
        getAvailable,
        applySynergyBonuses,
        reapplyUpgrades
    };
})();
