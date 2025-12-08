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
        clickPower: 1,
        clickMultiplier: 1,
        productionMultiplier: 1,
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
        version: '1.0.0'
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
     * @param {string} event - Event type to listen for
     * @param {function} callback - Function to call when event occurs
     */
    function subscribe(event, callback) {
        if (listeners[event]) {
            listeners[event].push(callback);
        }
    }

    /**
     * Emit an event to all listeners
     * @param {string} event - Event type
     * @param {*} data - Data to pass to listeners
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
     * @param {number} amount - Amount to add
     * @param {boolean} countAsEarned - Whether to count towards total earned
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
     * @param {number} amount - Amount to spend
     * @returns {boolean} - Whether the transaction was successful
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
     * @param {number} amount - Amount to add
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
     * Get click power (base + bonuses)
     */
    function getClickPower() {
        return state.clickPower * state.clickMultiplier;
    }

    /**
     * Set click power
     * @param {number} power - New click power
     */
    function setClickPower(power) {
        state.clickPower = power;
    }

    /**
     * Set click multiplier
     * @param {number} multiplier - New multiplier
     */
    function setClickMultiplier(multiplier) {
        state.clickMultiplier = multiplier;
    }

    /**
     * Get production multiplier
     */
    function getProductionMultiplier() {
        return state.productionMultiplier;
    }

    /**
     * Set production multiplier
     * @param {number} multiplier - New multiplier
     */
    function setProductionMultiplier(multiplier) {
        state.productionMultiplier = multiplier;
    }

    /**
     * Get building count
     * @param {string} buildingId - Building identifier
     */
    function getBuildingCount(buildingId) {
        return state.buildings[buildingId] || 0;
    }

    /**
     * Add a building
     * @param {string} buildingId - Building identifier
     */
    function addBuilding(buildingId) {
        state.buildings[buildingId] = (state.buildings[buildingId] || 0) + 1;
        emit('buildings', state.buildings);
    }

    /**
     * Check if upgrade is purchased
     * @param {string} upgradeId - Upgrade identifier
     */
    function hasUpgrade(upgradeId) {
        return state.upgrades[upgradeId] === true;
    }

    /**
     * Purchase an upgrade
     * @param {string} upgradeId - Upgrade identifier
     */
    function purchaseUpgrade(upgradeId) {
        state.upgrades[upgradeId] = true;
        emit('upgrades', state.upgrades);
    }

    /**
     * Check if achievement is unlocked
     * @param {string} achievementId - Achievement identifier
     */
    function hasAchievement(achievementId) {
        return state.achievements[achievementId] === true;
    }

    /**
     * Unlock an achievement
     * @param {string} achievementId - Achievement identifier
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
     * Load a saved state
     * @param {object} savedState - State to load
     */
    function loadState(savedState) {
        if (savedState && savedState.version) {
            state = { ...defaultState, ...savedState };
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
        setClickPower,
        setClickMultiplier,
        getProductionMultiplier,
        setProductionMultiplier,
        getBuildingCount,
        addBuilding,
        hasUpgrade,
        purchaseUpgrade,
        hasAchievement,
        unlockAchievement,
        getStats,
        updatePlayTime,
        loadState,
        resetState
    };
})();
