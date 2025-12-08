/**
 * Game State Module
 * Manages the central game state and provides methods to modify it
 */

const GameState = (function() {
    // Default initial state
    const defaultState = {
        resources: {
            crystals: 0,
            gems: 0,
            totalCrystals: 0,
            totalClicks: 0
        },
        // Base values (before upgrades)
        baseClickPower: 1,
        baseProductionMultiplier: 1,
        // Upgrade multipliers (calculated from purchased upgrades)
        clickUpgradeMultiplier: 1,
        productionUpgradeMultiplier: 1,
        // Synergy multiplier (calculated dynamically)
        clickSynergyMultiplier: 1,
        productionSynergyMultiplier: 1,
        // Building-specific multipliers
        buildingMultipliers: {},
        buildings: {},
        upgrades: {},
        achievements: {},
        stats: {
            startTime: Date.now(),
            totalPlayTime: 0,
            highestCrystals: 0,
            highestCPS: 0
        },
        settings: {
            autoSave: true,
            notifications: true
        },
        version: '1.1.0'
    };

    // Current game state
    let state = JSON.parse(JSON.stringify(defaultState));

    // Event listeners for state changes
    const listeners = {
        crystals: [],
        gems: [],
        buildings: [],
        upgrades: [],
        achievements: [],
        stats: []
    };

    /**
     * Subscribe to state changes
     */
    function subscribe(event, callback) {
        if (listeners[event]) {
            listeners[event].push(callback);
        }
    }

    /**
     * Emit an event to all listeners
     */
    function emit(event, data) {
        if (listeners[event]) {
            listeners[event].forEach(callback => callback(data));
        }
    }

    /**
     * Get the current state (returns a copy)
     */
    function getState() {
        return JSON.parse(JSON.stringify(state));
    }

    /**
     * Get crystals count
     */
    function getCrystals() {
        return state.resources.crystals;
    }

    /**
     * Get gems count
     */
    function getGems() {
        return state.resources.gems;
    }

    /**
     * Add crystals to the player's total
     */
    function addCrystals(amount, countAsEarned = true) {
        state.resources.crystals += amount;
        if (countAsEarned) {
            state.resources.totalCrystals += amount;
        }
        if (state.resources.crystals > state.stats.highestCrystals) {
            state.stats.highestCrystals = state.resources.crystals;
        }
        emit('crystals', state.resources.crystals);
    }

    /**
     * Spend crystals
     */
    function spendCrystals(amount) {
        if (state.resources.crystals >= amount) {
            state.resources.crystals -= amount;
            emit('crystals', state.resources.crystals);
            return true;
        }
        return false;
    }

    /**
     * Add gems
     */
    function addGems(amount) {
        state.resources.gems += amount;
        emit('gems', state.resources.gems);
    }

    /**
     * Increment total clicks
     */
    function incrementClicks() {
        state.resources.totalClicks++;
        emit('stats', state.stats);
    }

    /**
     * Get effective click power (base * upgrades * synergy)
     */
    function getClickPower() {
        return state.baseClickPower * state.clickUpgradeMultiplier * state.clickSynergyMultiplier;
    }

    /**
     * Multiply click upgrade multiplier
     */
    function multiplyClickPower(multiplier) {
        state.clickUpgradeMultiplier *= multiplier;
    }

    /**
     * Set click synergy multiplier (recalculated each frame)
     */
    function setClickSynergyMultiplier(multiplier) {
        state.clickSynergyMultiplier = multiplier;
    }

    /**
     * Get effective production multiplier
     */
    function getProductionMultiplier() {
        return state.baseProductionMultiplier * state.productionUpgradeMultiplier * state.productionSynergyMultiplier;
    }

    /**
     * Multiply production upgrade multiplier
     */
    function multiplyProductionMultiplier(multiplier) {
        state.productionUpgradeMultiplier *= multiplier;
    }

    /**
     * Set production synergy multiplier (recalculated each frame)
     */
    function setProductionSynergyMultiplier(multiplier) {
        state.productionSynergyMultiplier = multiplier;
    }

    /**
     * Get building-specific multiplier
     */
    function getBuildingMultiplier(buildingId) {
        return state.buildingMultipliers[buildingId] || 1;
    }

    /**
     * Multiply a building's specific multiplier
     */
    function multiplyBuildingMultiplier(buildingId, multiplier) {
        state.buildingMultipliers[buildingId] = (state.buildingMultipliers[buildingId] || 1) * multiplier;
    }

    /**
     * Get building count
     */
    function getBuildingCount(buildingId) {
        return state.buildings[buildingId] || 0;
    }

    /**
     * Add a building
     */
    function addBuilding(buildingId) {
        state.buildings[buildingId] = (state.buildings[buildingId] || 0) + 1;
        emit('buildings', state.buildings);
    }

    /**
     * Check if upgrade is purchased
     */
    function hasUpgrade(upgradeId) {
        return state.upgrades[upgradeId] === true;
    }

    /**
     * Purchase an upgrade
     */
    function purchaseUpgrade(upgradeId) {
        state.upgrades[upgradeId] = true;
        emit('upgrades', state.upgrades);
    }

    /**
     * Check if achievement is unlocked
     */
    function hasAchievement(achievementId) {
        return state.achievements[achievementId] === true;
    }

    /**
     * Unlock an achievement
     */
    function unlockAchievement(achievementId) {
        if (!state.achievements[achievementId]) {
            state.achievements[achievementId] = true;
            emit('achievements', { id: achievementId, achievements: state.achievements });
            return true;
        }
        return false;
    }

    /**
     * Get stats
     */
    function getStats() {
        return { ...state.stats, ...state.resources };
    }

    /**
     * Update play time
     */
    function updatePlayTime() {
        state.stats.totalPlayTime = Date.now() - state.stats.startTime;
    }

    /**
     * Reset upgrade multipliers (called before reapplying upgrades)
     */
    function resetUpgradeMultipliers() {
        state.clickUpgradeMultiplier = 1;
        state.productionUpgradeMultiplier = 1;
        state.buildingMultipliers = {};
    }

    /**
     * Load a saved state
     */
    function loadState(savedState) {
        if (savedState && savedState.version) {
            // Merge with defaults to handle missing fields from older saves
            state = { ...JSON.parse(JSON.stringify(defaultState)), ...savedState };

            // Ensure nested objects are properly merged
            state.resources = { ...defaultState.resources, ...savedState.resources };
            state.stats = { ...defaultState.stats, ...savedState.stats };
            state.buildings = savedState.buildings || {};
            state.upgrades = savedState.upgrades || {};
            state.achievements = savedState.achievements || {};
            state.buildingMultipliers = savedState.buildingMultipliers || {};

            // Reset multipliers - they will be recalculated by reapplyUpgrades
            state.clickUpgradeMultiplier = 1;
            state.productionUpgradeMultiplier = 1;
            state.buildingMultipliers = {};

            // Recalculate start time based on play time
            state.stats.startTime = Date.now() - state.stats.totalPlayTime;

            emit('crystals', state.resources.crystals);
            emit('gems', state.resources.gems);
            emit('buildings', state.buildings);
            emit('upgrades', state.upgrades);
            emit('achievements', { achievements: state.achievements });
            emit('stats', state.stats);
        }
    }

    /**
     * Reset state to default
     */
    function resetState() {
        state = JSON.parse(JSON.stringify(defaultState));
        state.stats.startTime = Date.now();
        emit('crystals', state.resources.crystals);
        emit('gems', state.resources.gems);
        emit('buildings', state.buildings);
        emit('upgrades', state.upgrades);
        emit('achievements', { achievements: state.achievements });
        emit('stats', state.stats);
    }

    // Public API
    return {
        subscribe,
        getState,
        getCrystals,
        getGems,
        addCrystals,
        spendCrystals,
        addGems,
        incrementClicks,
        getClickPower,
        multiplyClickPower,
        setClickSynergyMultiplier,
        getProductionMultiplier,
        multiplyProductionMultiplier,
        setProductionSynergyMultiplier,
        getBuildingMultiplier,
        multiplyBuildingMultiplier,
        getBuildingCount,
        addBuilding,
        hasUpgrade,
        purchaseUpgrade,
        hasAchievement,
        unlockAchievement,
        getStats,
        updatePlayTime,
        resetUpgradeMultipliers,
        loadState,
        resetState
    };
})();
