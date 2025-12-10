/**
 * Zone Fatigue Module
 * Handles zone depletion and Zone Guardian mechanics
 */

const ZoneFatigue = (function() {
    // Fatigue tracking per zone
    let zoneFatigue = {}; // zoneId -> fatigue level (0-100)
    let zoneGuardians = {}; // zoneId -> guardian state
    let lastUpdate = {};

    const FATIGUE_THRESHOLDS = {
        FRESH: 20,
        VISITED: 40,
        FATIGUED: 60,
        EXHAUSTED: 80,
        DEPLETED: 100
    };

    const FATIGUE_EFFECTS = {
        FRESH: {
            dropMultiplier: 1.1,
            expMultiplier: 1.1,
            enemyStrength: 1.0,
            color: '#4caf50'
        },
        VISITED: {
            dropMultiplier: 1.0,
            expMultiplier: 1.0,
            enemyStrength: 1.0,
            color: '#8bc34a'
        },
        FATIGUED: {
            dropMultiplier: 0.75,
            expMultiplier: 1.0,
            enemyStrength: 1.1,
            color: '#ff9800'
        },
        EXHAUSTED: {
            dropMultiplier: 0.5,
            expMultiplier: 0.5,
            enemyStrength: 1.3,
            spawnGuardian: true,
            color: '#ff5722'
        },
        DEPLETED: {
            dropMultiplier: 0.25,
            expMultiplier: 0.25,
            enemyStrength: 1.5,
            hostile: true,
            color: '#f44336'
        }
    };

    /**
     * Initialize zone fatigue system
     */
    function init() {
        // Start passive recovery
        setInterval(() => {
            passiveRecovery();
        }, 60 * 60 * 1000); // Every hour
    }

    /**
     * Get fatigue for zone
     */
    function getFatigue(zoneId) {
        return zoneFatigue[zoneId] || 0;
    }

    /**
     * Get fatigue tier
     */
    function getFatigueTier(zoneId) {
        const fatigue = getFatigue(zoneId);

        if (fatigue >= 80) return 'DEPLETED';
        if (fatigue >= 60) return 'EXHAUSTED';
        if (fatigue >= 40) return 'FATIGUED';
        if (fatigue >= 20) return 'VISITED';
        return 'FRESH';
    }

    /**
     * Get fatigue effects for zone
     */
    function getEffects(zoneId) {
        const tier = getFatigueTier(zoneId);
        return FATIGUE_EFFECTS[tier];
    }

    /**
     * Increase fatigue (from killing monsters)
     */
    function increaseFatigue(zoneId, monstersKilled = 1, bossKilled = false) {
        if (!zoneFatigue[zoneId]) {
            zoneFatigue[zoneId] = 0;
        }

        const oldTier = getFatigueTier(zoneId);

        // Calculate fatigue increase
        let increase = monstersKilled * 0.1; // 0.1% per monster (10 monsters = 1%)

        if (bossKilled) {
            increase += 5; // 5% per boss
        }

        // Apply corruption modifier (corrupted players fatigue zones faster)
        if (typeof Corruption !== 'undefined') {
            const corruptionLevel = Corruption.getCorruptionLevel();
            increase *= (1 + corruptionLevel / 100); // Up to 2x at max corruption
        }

        zoneFatigue[zoneId] = Math.min(100, zoneFatigue[zoneId] + increase);
        lastUpdate[zoneId] = Date.now();

        const newTier = getFatigueTier(zoneId);

        // Check if crossed into EXHAUSTED (spawn guardian)
        if (oldTier !== 'EXHAUSTED' && newTier === 'EXHAUSTED' && !zoneGuardians[zoneId]) {
            spawnZoneGuardian(zoneId);
        }

        // Check if hit DEPLETED
        if (newTier === 'DEPLETED' && oldTier !== 'DEPLETED') {
            if (typeof UI !== 'undefined') {
                const zone = World.getZone(zoneId);
                UI.showNotification(`⚠️ ${zone?.name || 'Zone'} is DEPLETED!`, 'error');
            }
        }

        return zoneFatigue[zoneId];
    }

    /**
     * Decrease fatigue
     */
    function decreaseFatigue(zoneId, amount) {
        if (!zoneFatigue[zoneId]) return 0;

        zoneFatigue[zoneId] = Math.max(0, zoneFatigue[zoneId] - amount);
        lastUpdate[zoneId] = Date.now();

        return zoneFatigue[zoneId];
    }

    /**
     * Spawn Zone Guardian
     */
    function spawnZoneGuardian(zoneId) {
        const zone = World.getZone(zoneId);
        if (!zone) return;

        zoneGuardians[zoneId] = {
            active: true,
            spawnTime: Date.now(),
            lastRespawn: Date.now(),
            defeatedCount: 0,
            hp: calculateGuardianHP(zoneId),
            maxHp: calculateGuardianHP(zoneId),
            power: calculateGuardianPower(zoneId)
        };

        if (typeof UI !== 'undefined') {
            UI.showNotification(`🛡️ Zone Guardian has appeared in ${zone.name}!`, 'warning');
        }

        // Notify multiplayer
        if (typeof Multiplayer !== 'undefined' && Multiplayer.isConnected()) {
            const char = Character.getActive();
            if (char) {
                Multiplayer.sendChat(`awakened the ${zone.name} Guardian!`);
            }
        }
    }

    /**
     * Calculate guardian HP based on zone
     */
    function calculateGuardianHP(zoneId) {
        const zone = World.getZone(zoneId);
        if (!zone) return 1000;

        const baseHP = zone.levelRange[1] * 100; // Level * 100
        const fatigueBonus = getFatigue(zoneId) * 10; // More fatigue = stronger guardian

        return baseHP + fatigueBonus;
    }

    /**
     * Calculate guardian power
     */
    function calculateGuardianPower(zoneId) {
        const zone = World.getZone(zoneId);
        if (!zone) return 50;

        return zone.levelRange[1] * 5;
    }

    /**
     * Is Zone Guardian active
     */
    function isGuardianActive(zoneId) {
        return zoneGuardians[zoneId]?.active || false;
    }

    /**
     * Get Zone Guardian
     */
    function getGuardian(zoneId) {
        return zoneGuardians[zoneId];
    }

    /**
     * Damage Zone Guardian
     */
    function damageGuardian(zoneId, damage) {
        const guardian = zoneGuardians[zoneId];
        if (!guardian || !guardian.active) return null;

        guardian.hp -= damage;

        if (guardian.hp <= 0) {
            return defeatGuardian(zoneId);
        }

        return guardian;
    }

    /**
     * Defeat Zone Guardian
     */
    function defeatGuardian(zoneId) {
        const guardian = zoneGuardians[zoneId];
        if (!guardian) return null;

        guardian.defeatedCount++;

        // Generate rewards
        const rewards = generateGuardianRewards(zoneId);

        // Immediately spike fatigue to 100%
        zoneFatigue[zoneId] = 100;

        // Despawn for 30 minutes
        guardian.active = false;
        guardian.lastRespawn = Date.now();

        setTimeout(() => {
            respawnGuardian(zoneId);
        }, 30 * 60 * 1000);

        if (typeof UI !== 'undefined') {
            UI.showNotification('🏆 Zone Guardian defeated! Check your inventory.', 'success');
        }

        return rewards;
    }

    /**
     * Respawn Zone Guardian
     */
    function respawnGuardian(zoneId) {
        const guardian = zoneGuardians[zoneId];
        if (!guardian) return;

        // Only respawn if zone still exhausted
        if (getFatigue(zoneId) >= 80) {
            guardian.active = true;
            guardian.hp = guardian.maxHp;
            guardian.lastRespawn = Date.now();

            if (typeof UI !== 'undefined') {
                const zone = World.getZone(zoneId);
                UI.showNotification(`⚠️ Zone Guardian respawned in ${zone?.name}!`, 'warning');
            }
        }
    }

    /**
     * Generate Guardian rewards
     */
    function generateGuardianRewards(zoneId) {
        const zone = World.getZone(zoneId);
        const rewards = {
            exp: zone.levelRange[1] * 100,
            gold: zone.levelRange[1] * 50,
            items: []
        };

        // Guaranteed rare drops
        rewards.items.push({ id: 'boss_essence', quantity: 1 });
        rewards.items.push({ id: 'crystal_shard', quantity: Math.floor(Math.random() * 5) + 3 });

        // Chance for Fusion Catalyst
        if (Math.random() < 0.3) {
            rewards.items.push({ id: 'fusion_catalyst', quantity: 1 });
        }

        return rewards;
    }

    /**
     * Restore zone ecology (paid service)
     */
    function restoreZone(zoneId) {
        const cost = calculateRestoreCost(zoneId);

        if (Inventory.getGold() < cost) {
            return { error: 'Not enough gold' };
        }

        // Pay cost
        Inventory.removeGold(cost);

        // Reduce fatigue by 50%
        decreaseFatigue(zoneId, 50);

        // Despawn guardian
        if (zoneGuardians[zoneId]) {
            zoneGuardians[zoneId].active = false;
        }

        if (typeof UI !== 'undefined') {
            UI.showNotification('🌱 Zone ecology restored!', 'success');
        }

        return { success: true };
    }

    /**
     * Calculate restoration cost
     */
    function calculateRestoreCost(zoneId) {
        const fatigue = getFatigue(zoneId);
        const zone = World.getZone(zoneId);

        return Math.floor(zone.levelRange[1] * fatigue * 10);
    }

    /**
     * Passive recovery (while not in zone)
     */
    function passiveRecovery() {
        const now = Date.now();

        Object.keys(zoneFatigue).forEach(zoneId => {
            const lastUpdateTime = lastUpdate[zoneId] || 0;
            const hoursSinceUpdate = (now - lastUpdateTime) / (60 * 60 * 1000);

            if (hoursSinceUpdate >= 1) {
                // 0.5% recovery per hour
                decreaseFatigue(zoneId, 0.5);

                // Full reset after 24 hours of not visiting
                if (hoursSinceUpdate >= 24) {
                    decreaseFatigue(zoneId, 10);
                }
            }
        });
    }

    /**
     * Get all zone fatigue levels
     */
    function getAllFatigue() {
        return { ...zoneFatigue };
    }

    /**
     * Get fatigue color
     */
    function getFatigueColor(zoneId) {
        const tier = getFatigueTier(zoneId);
        return FATIGUE_EFFECTS[tier].color;
    }

    /**
     * Get fatigue display text
     */
    function getFatigueDisplay(zoneId) {
        const fatigue = getFatigue(zoneId);
        const tier = getFatigueTier(zoneId);

        return `${tier} (${Math.floor(fatigue)}%)`;
    }

    /**
     * Get state for saving
     */
    function getState() {
        return {
            zoneFatigue,
            zoneGuardians,
            lastUpdate
        };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state) {
            zoneFatigue = state.zoneFatigue || {};
            zoneGuardians = state.zoneGuardians || {};
            lastUpdate = state.lastUpdate || {};
        }
    }

    /**
     * Reset fatigue
     */
    function reset() {
        zoneFatigue = {};
        zoneGuardians = {};
        lastUpdate = {};
    }

    // Public API
    return {
        init,
        getFatigue,
        getFatigueTier,
        getEffects,
        increaseFatigue,
        decreaseFatigue,
        isGuardianActive,
        getGuardian,
        damageGuardian,
        defeatGuardian,
        restoreZone,
        calculateRestoreCost,
        getAllFatigue,
        getFatigueColor,
        getFatigueDisplay,
        getState,
        loadState,
        reset,
        FATIGUE_THRESHOLDS,
        FATIGUE_EFFECTS
    };
})();
