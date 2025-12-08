/**
 * Buildings Module
 * Defines and manages buildings that produce resources automatically
 */

const Buildings = (function() {
    // Building definitions
    const buildings = [
        {
            id: 'miner',
            name: 'Crystal Miner',
            icon: '⛏️',
            description: 'A basic miner that extracts crystals from the earth.',
            baseCost: 15,
            costMultiplier: 1.15,
            production: 0.1,
            unlockAt: 0
        },
        {
            id: 'drill',
            name: 'Crystal Drill',
            icon: '🔧',
            description: 'A powered drill that mines crystals faster.',
            baseCost: 100,
            costMultiplier: 1.15,
            production: 0.5,
            unlockAt: 50
        },
        {
            id: 'excavator',
            name: 'Excavator',
            icon: '🚜',
            description: 'Heavy machinery for serious crystal extraction.',
            baseCost: 500,
            costMultiplier: 1.15,
            production: 2,
            unlockAt: 250
        },
        {
            id: 'quarry',
            name: 'Crystal Quarry',
            icon: '🏗️',
            description: 'An open-pit mine dedicated to crystal harvesting.',
            baseCost: 2000,
            costMultiplier: 1.15,
            production: 8,
            unlockAt: 1000
        },
        {
            id: 'refinery',
            name: 'Refinery',
            icon: '🏭',
            description: 'Processes raw crystals for maximum yield.',
            baseCost: 10000,
            costMultiplier: 1.15,
            production: 30,
            unlockAt: 5000
        },
        {
            id: 'lab',
            name: 'Crystal Lab',
            icon: '🔬',
            description: 'Scientists grow synthetic crystals here.',
            baseCost: 50000,
            costMultiplier: 1.15,
            production: 100,
            unlockAt: 25000
        },
        {
            id: 'reactor',
            name: 'Fusion Reactor',
            icon: '⚛️',
            description: 'Harnesses fusion power to create crystals from energy.',
            baseCost: 250000,
            costMultiplier: 1.15,
            production: 400,
            unlockAt: 100000
        },
        {
            id: 'portal',
            name: 'Crystal Portal',
            icon: '🌀',
            description: 'Opens a gateway to a dimension made entirely of crystals.',
            baseCost: 1000000,
            costMultiplier: 1.15,
            production: 1500,
            unlockAt: 500000
        },
        {
            id: 'dyson',
            name: 'Dyson Harvester',
            icon: '☀️',
            description: 'A megastructure that converts stellar energy into crystals.',
            baseCost: 5000000,
            costMultiplier: 1.15,
            production: 5000,
            unlockAt: 2500000
        },
        {
            id: 'universe',
            name: 'Universe Factory',
            icon: '🌌',
            description: 'Creates pocket universes optimized for crystal generation.',
            baseCost: 25000000,
            costMultiplier: 1.15,
            production: 20000,
            unlockAt: 10000000
        }
    ];

    /**
     * Get all buildings
     * @returns {Array} - Array of building definitions
     */
    function getAll() {
        return buildings;
    }

    /**
     * Get a specific building by ID
     * @param {string} buildingId - Building identifier
     * @returns {Object|null} - Building definition or null
     */
    function getById(buildingId) {
        return buildings.find(b => b.id === buildingId) || null;
    }

    /**
     * Calculate the cost for the next building
     * @param {string} buildingId - Building identifier
     * @returns {number} - Cost for next purchase
     */
    function getCost(buildingId) {
        const building = getById(buildingId);
        if (!building) return Infinity;

        const owned = GameState.getBuildingCount(buildingId);
        return Math.floor(building.baseCost * Math.pow(building.costMultiplier, owned));
    }

    /**
     * Check if a building is unlocked (visible to player)
     * @param {string} buildingId - Building identifier
     * @returns {boolean} - Whether building is unlocked
     */
    function isUnlocked(buildingId) {
        const building = getById(buildingId);
        if (!building) return false;

        const stats = GameState.getStats();
        return stats.totalCrystals >= building.unlockAt;
    }

    /**
     * Check if player can afford a building
     * @param {string} buildingId - Building identifier
     * @returns {boolean} - Whether player can afford it
     */
    function canAfford(buildingId) {
        const cost = getCost(buildingId);
        return GameState.getCrystals() >= cost;
    }

    /**
     * Purchase a building
     * @param {string} buildingId - Building identifier
     * @returns {boolean} - Whether purchase was successful
     */
    function purchase(buildingId) {
        const building = getById(buildingId);
        if (!building) return false;

        const cost = getCost(buildingId);
        if (GameState.spendCrystals(cost)) {
            GameState.addBuilding(buildingId);
            return true;
        }
        return false;
    }

    /**
     * Get total production from a building type
     * @param {string} buildingId - Building identifier
     * @returns {number} - Total production per second
     */
    function getProduction(buildingId) {
        const building = getById(buildingId);
        if (!building) return 0;

        const count = GameState.getBuildingCount(buildingId);
        return building.production * count * GameState.getProductionMultiplier();
    }

    /**
     * Get total number of buildings owned
     * @returns {number} - Total buildings
     */
    function getTotalOwned() {
        return buildings.reduce((total, building) => {
            return total + GameState.getBuildingCount(building.id);
        }, 0);
    }

    // Public API
    return {
        getAll,
        getById,
        getCost,
        isUnlocked,
        canAfford,
        purchase,
        getProduction,
        getTotalOwned
    };
})();
