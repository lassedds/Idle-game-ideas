/**
 * Corruption System Module
 * Handles persistent corruption tracking and consequences
 */

const Corruption = (function() {
    let corruptionLevel = 0; // 0-100
    let transformationActive = false;
    let transformationTimer = null;
    let corruptionHuntersActive = false;

    const CORRUPTION_THRESHOLDS = {
        LOW: 25,
        MEDIUM: 50,
        HIGH: 75,
        TRANSFORMED: 100
    };

    const CORRUPTION_EFFECTS = {
        LOW: {
            damageBonus: 1.10,
            goldBonus: 1.0,
            huntersActive: true,
            tradeBlocked: false,
            nameColor: '#ffeb3b'
        },
        MEDIUM: {
            damageBonus: 1.25,
            goldBonus: 1.15,
            huntersActive: true,
            tradeBlocked: true,
            nameColor: '#ff9800'
        },
        HIGH: {
            damageBonus: 1.40,
            goldBonus: 1.30,
            huntersActive: true,
            tradeBlocked: true,
            cannotEnterTowns: true,
            nameColor: '#f44336'
        },
        TRANSFORMED: {
            damageBonus: 2.0,
            goldBonus: 2.0,
            huntersActive: true,
            tradeBlocked: true,
            cannotEnterTowns: true,
            transformedToBoss: true,
            nameColor: '#9c27b0'
        }
    };

    /**
     * Initialize corruption system
     */
    function init() {
        // Auto-decrease corruption when offline
        setInterval(() => {
            if (corruptionLevel > 0 && !transformationActive) {
                decreaseCorruption(0.1); // Passive reduction
            }
        }, 60000); // Every minute
    }

    /**
     * Increase corruption
     */
    function increaseCorruption(amount) {
        const oldLevel = corruptionLevel;
        corruptionLevel = Math.min(100, corruptionLevel + amount);

        // Check for transformation
        if (corruptionLevel >= 100 && !transformationActive) {
            triggerTransformation();
        }

        // Notify multiplayer if crossed threshold
        if (getCorruptionTier(oldLevel) !== getCorruptionTier(corruptionLevel)) {
            if (typeof Multiplayer !== 'undefined') {
                Multiplayer.sendPlayerUpdate();
            }
        }

        return corruptionLevel;
    }

    /**
     * Decrease corruption
     */
    function decreaseCorruption(amount) {
        const oldLevel = corruptionLevel;
        corruptionLevel = Math.max(0, corruptionLevel - amount);

        if (getCorruptionTier(oldLevel) !== getCorruptionTier(corruptionLevel)) {
            if (typeof Multiplayer !== 'undefined') {
                Multiplayer.sendPlayerUpdate();
            }
        }

        return corruptionLevel;
    }

    /**
     * Get current corruption level
     */
    function getCorruptionLevel() {
        return corruptionLevel;
    }

    /**
     * Get corruption tier
     */
    function getCorruptionTier(level = corruptionLevel) {
        if (level >= 100) return 'TRANSFORMED';
        if (level >= 75) return 'HIGH';
        if (level >= 50) return 'MEDIUM';
        if (level >= 25) return 'LOW';
        return 'NONE';
    }

    /**
     * Get current corruption effects
     */
    function getEffects() {
        const tier = getCorruptionTier();
        if (tier === 'NONE') {
            return { damageBonus: 1.0, goldBonus: 1.0 };
        }
        return CORRUPTION_EFFECTS[tier];
    }

    /**
     * Check if can trade
     */
    function canTrade() {
        return !getEffects().tradeBlocked;
    }

    /**
     * Check if can enter towns
     */
    function canEnterTowns() {
        return !getEffects().cannotEnterTowns;
    }

    /**
     * Trigger corruption transformation
     */
    function triggerTransformation() {
        transformationActive = true;

        // Notify UI
        if (typeof UI !== 'undefined') {
            UI.showNotification('⚠️ CORRUPTION TRANSFORMATION! You have become a Boss for 30 minutes!', 'error');
        }

        // Notify multiplayer
        if (typeof Multiplayer !== 'undefined') {
            Multiplayer.sendChat('has been consumed by corruption and transformed into a boss!');
            Multiplayer.sendPlayerUpdate();
        }

        // Set 30-minute timer
        transformationTimer = setTimeout(() => {
            endTransformation();
        }, 30 * 60 * 1000);
    }

    /**
     * End transformation
     */
    function endTransformation(defeated = false) {
        transformationActive = false;

        if (transformationTimer) {
            clearTimeout(transformationTimer);
            transformationTimer = null;
        }

        if (defeated) {
            // Defeated by players - lose 50% corruption
            decreaseCorruption(50);
            if (typeof UI !== 'undefined') {
                UI.showNotification('Defeated! Corruption reduced by 50%.', 'success');
            }
        } else {
            // Survived 30 minutes
            if (typeof UI !== 'undefined') {
                UI.showNotification('Transformation ended. Corruption remains at 100%.', 'info');
            }
        }

        if (typeof Multiplayer !== 'undefined') {
            Multiplayer.sendPlayerUpdate();
        }
    }

    /**
     * Is currently transformed
     */
    function isTransformed() {
        return transformationActive;
    }

    /**
     * Get corruption color
     */
    function getCorruptionColor() {
        const tier = getCorruptionTier();
        return tier === 'NONE' ? '#4caf50' : CORRUPTION_EFFECTS[tier].nameColor;
    }

    /**
     * Get corruption display text
     */
    function getDisplayText() {
        const tier = getCorruptionTier();
        const tierNames = {
            NONE: 'Pure',
            LOW: 'Tainted',
            MEDIUM: 'Corrupted',
            HIGH: 'Deeply Corrupted',
            TRANSFORMED: 'TRANSFORMED'
        };
        return `${tierNames[tier]} (${Math.floor(corruptionLevel)}%)`;
    }

    /**
     * Get state for saving
     */
    function getState() {
        return {
            corruptionLevel,
            transformationActive,
            corruptionHuntersActive
        };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state) {
            corruptionLevel = state.corruptionLevel || 0;
            transformationActive = state.transformationActive || false;
            corruptionHuntersActive = state.corruptionHuntersActive || false;
        }
    }

    /**
     * Reset corruption
     */
    function reset() {
        corruptionLevel = 0;
        transformationActive = false;
        if (transformationTimer) {
            clearTimeout(transformationTimer);
            transformationTimer = null;
        }
    }

    // Public API
    return {
        init,
        increaseCorruption,
        decreaseCorruption,
        getCorruptionLevel,
        getCorruptionTier,
        getEffects,
        canTrade,
        canEnterTowns,
        isTransformed,
        getCorruptionColor,
        getDisplayText,
        getState,
        loadState,
        reset,
        CORRUPTION_THRESHOLDS
    };
})();
