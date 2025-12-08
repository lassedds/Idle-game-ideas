/**
 * Expeditions Module
 * Send teams on timed expeditions to discover treasures, artifacts, and bonuses
 */

const Expeditions = (function() {
    // Expedition destinations
    const destinations = [
        {
            id: 'crystal_caves',
            name: 'Crystal Caves',
            icon: '🕳️',
            description: 'Shallow caves with common crystals.',
            duration: 60, // 1 minute
            cost: 100,
            unlockAt: 0,
            rewards: {
                crystals: { min: 50, max: 150 },
                gems: { min: 0, max: 1, chance: 0.1 },
                artifactChance: 0.05
            },
            riskLevel: 1
        },
        {
            id: 'ancient_mines',
            name: 'Ancient Mines',
            icon: '⛏️',
            description: 'Abandoned mines with hidden treasures.',
            duration: 180, // 3 minutes
            cost: 500,
            unlockAt: 500,
            rewards: {
                crystals: { min: 300, max: 800 },
                gems: { min: 1, max: 3, chance: 0.3 },
                artifactChance: 0.15
            },
            riskLevel: 2
        },
        {
            id: 'frozen_peaks',
            name: 'Frozen Peaks',
            icon: '🏔️',
            description: 'Icy mountains with rare ice crystals.',
            duration: 300, // 5 minutes
            cost: 2000,
            unlockAt: 2500,
            rewards: {
                crystals: { min: 1500, max: 4000 },
                gems: { min: 2, max: 5, chance: 0.4 },
                artifactChance: 0.25,
                bonusType: 'frost',
                bonusDuration: 120,
                bonusMultiplier: 1.5
            },
            riskLevel: 3
        },
        {
            id: 'volcanic_depths',
            name: 'Volcanic Depths',
            icon: '🌋',
            description: 'Dangerous but rich in fire crystals.',
            duration: 600, // 10 minutes
            cost: 10000,
            unlockAt: 15000,
            rewards: {
                crystals: { min: 8000, max: 20000 },
                gems: { min: 5, max: 10, chance: 0.5 },
                artifactChance: 0.35,
                bonusType: 'fire',
                bonusDuration: 180,
                bonusMultiplier: 2.0
            },
            riskLevel: 4
        },
        {
            id: 'ethereal_realm',
            name: 'Ethereal Realm',
            icon: '✨',
            description: 'A dimension between worlds.',
            duration: 900, // 15 minutes
            cost: 50000,
            unlockAt: 75000,
            rewards: {
                crystals: { min: 40000, max: 100000 },
                gems: { min: 10, max: 25, chance: 0.7 },
                artifactChance: 0.5,
                bonusType: 'ethereal',
                bonusDuration: 300,
                bonusMultiplier: 2.5
            },
            riskLevel: 5
        },
        {
            id: 'void_rift',
            name: 'Void Rift',
            icon: '🌀',
            description: 'A tear in reality itself. Extreme risk, extreme reward.',
            duration: 1800, // 30 minutes
            cost: 250000,
            unlockAt: 500000,
            rewards: {
                crystals: { min: 200000, max: 500000 },
                gems: { min: 25, max: 50, chance: 0.9 },
                artifactChance: 0.75,
                bonusType: 'void',
                bonusDuration: 600,
                bonusMultiplier: 3.0
            },
            riskLevel: 6
        },
        {
            id: 'cosmic_nexus',
            name: 'Cosmic Nexus',
            icon: '🌌',
            description: 'The heart of crystal creation itself.',
            duration: 3600, // 1 hour
            cost: 1000000,
            unlockAt: 2500000,
            rewards: {
                crystals: { min: 1000000, max: 3000000 },
                gems: { min: 50, max: 100, chance: 1.0 },
                artifactChance: 1.0,
                bonusType: 'cosmic',
                bonusDuration: 900,
                bonusMultiplier: 5.0
            },
            riskLevel: 7
        }
    ];

    // Active expeditions (max 3)
    let activeExpeditions = [];

    // Completed expedition rewards waiting to be claimed
    let pendingRewards = [];

    // Active bonuses from expeditions
    let activeBonuses = [];

    // Maximum concurrent expeditions
    const MAX_EXPEDITIONS = 3;

    /**
     * Get all destinations
     */
    function getDestinations() {
        return destinations;
    }

    /**
     * Check if destination is unlocked
     */
    function isUnlocked(destinationId) {
        const dest = destinations.find(d => d.id === destinationId);
        if (!dest) return false;
        return GameState.getStats().totalCrystals >= dest.unlockAt;
    }

    /**
     * Check if can start expedition
     */
    function canStart(destinationId) {
        if (activeExpeditions.length >= MAX_EXPEDITIONS) return false;
        const dest = destinations.find(d => d.id === destinationId);
        if (!dest) return false;
        if (!isUnlocked(destinationId)) return false;
        return GameState.getCrystals() >= dest.cost;
    }

    /**
     * Start an expedition
     */
    function start(destinationId) {
        if (!canStart(destinationId)) return false;

        const dest = destinations.find(d => d.id === destinationId);
        if (GameState.spendCrystals(dest.cost)) {
            activeExpeditions.push({
                destinationId: dest.id,
                startTime: Date.now(),
                duration: dest.duration * 1000, // Convert to ms
                rewards: dest.rewards
            });
            return true;
        }
        return false;
    }

    /**
     * Get active expeditions
     */
    function getActive() {
        return activeExpeditions.map(exp => {
            const dest = destinations.find(d => d.id === exp.destinationId);
            const elapsed = Date.now() - exp.startTime;
            const remaining = Math.max(0, exp.duration - elapsed);
            const progress = Math.min(1, elapsed / exp.duration);
            const isComplete = remaining === 0;

            return {
                ...exp,
                destination: dest,
                elapsed,
                remaining,
                progress,
                isComplete
            };
        });
    }

    /**
     * Check for completed expeditions and generate rewards
     */
    function checkCompletions() {
        const completed = [];
        const stillActive = [];

        activeExpeditions.forEach(exp => {
            const elapsed = Date.now() - exp.startTime;
            if (elapsed >= exp.duration) {
                // Generate rewards
                const dest = destinations.find(d => d.id === exp.destinationId);
                const rewards = generateRewards(dest);
                pendingRewards.push({
                    destinationId: exp.destinationId,
                    destination: dest,
                    rewards,
                    completedAt: Date.now()
                });
                completed.push(exp);
            } else {
                stillActive.push(exp);
            }
        });

        activeExpeditions = stillActive;
        return completed.length > 0;
    }

    /**
     * Generate rewards for a completed expedition
     */
    function generateRewards(destination) {
        const rewards = {
            crystals: 0,
            gems: 0,
            artifact: null,
            bonus: null
        };

        // Crystal rewards
        const crystalRange = destination.rewards.crystals;
        rewards.crystals = Math.floor(
            crystalRange.min + Math.random() * (crystalRange.max - crystalRange.min)
        );

        // Gem rewards
        if (Math.random() < destination.rewards.gems.chance) {
            const gemRange = destination.rewards.gems;
            rewards.gems = Math.floor(
                gemRange.min + Math.random() * (gemRange.max - gemRange.min)
            );
        }

        // Artifact chance
        if (Math.random() < destination.rewards.artifactChance) {
            if (typeof Artifacts !== 'undefined') {
                rewards.artifact = Artifacts.rollRandomArtifact(destination.riskLevel);
            }
        }

        // Bonus effect
        if (destination.rewards.bonusType && Math.random() < 0.5) {
            rewards.bonus = {
                type: destination.rewards.bonusType,
                duration: destination.rewards.bonusDuration,
                multiplier: destination.rewards.bonusMultiplier
            };
        }

        return rewards;
    }

    /**
     * Get pending rewards
     */
    function getPendingRewards() {
        return pendingRewards;
    }

    /**
     * Claim a pending reward
     */
    function claimReward(index) {
        if (index < 0 || index >= pendingRewards.length) return null;

        const reward = pendingRewards[index];
        pendingRewards.splice(index, 1);

        // Apply rewards
        GameState.addCrystals(reward.rewards.crystals);
        if (reward.rewards.gems > 0) {
            GameState.addGems(reward.rewards.gems);
        }

        // Add artifact
        if (reward.rewards.artifact && typeof Artifacts !== 'undefined') {
            Artifacts.addArtifact(reward.rewards.artifact);
        }

        // Apply bonus
        if (reward.rewards.bonus) {
            activeBonuses.push({
                ...reward.rewards.bonus,
                startTime: Date.now()
            });
        }

        return reward;
    }

    /**
     * Update bonuses (remove expired ones)
     */
    function updateBonuses() {
        const now = Date.now();
        activeBonuses = activeBonuses.filter(bonus => {
            const elapsed = (now - bonus.startTime) / 1000;
            return elapsed < bonus.duration;
        });
    }

    /**
     * Get current production bonus from expeditions
     */
    function getProductionBonus() {
        updateBonuses();
        let bonus = 1;
        activeBonuses.forEach(b => {
            bonus *= b.multiplier;
        });
        return bonus;
    }

    /**
     * Get active bonuses for display
     */
    function getActiveBonuses() {
        updateBonuses();
        return activeBonuses.map(bonus => {
            const elapsed = (Date.now() - bonus.startTime) / 1000;
            const remaining = Math.max(0, bonus.duration - elapsed);
            return {
                ...bonus,
                remaining
            };
        });
    }

    /**
     * Get expedition state for saving
     */
    function getState() {
        return {
            active: activeExpeditions,
            pending: pendingRewards,
            bonuses: activeBonuses
        };
    }

    /**
     * Load expedition state
     */
    function loadState(state) {
        if (state) {
            activeExpeditions = state.active || [];
            pendingRewards = state.pending || [];
            activeBonuses = state.bonuses || [];
        }
    }

    /**
     * Reset expeditions
     */
    function reset() {
        activeExpeditions = [];
        pendingRewards = [];
        activeBonuses = [];
    }

    // Public API
    return {
        getDestinations,
        isUnlocked,
        canStart,
        start,
        getActive,
        checkCompletions,
        getPendingRewards,
        claimReward,
        getProductionBonus,
        getActiveBonuses,
        getState,
        loadState,
        reset,
        MAX_EXPEDITIONS
    };
})();
