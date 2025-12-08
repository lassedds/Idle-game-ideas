/**
 * Achievements Module
 * Defines and tracks player achievements
 */

const Achievements = (function() {
    // Achievement definitions
    const achievements = [
        // Click Achievements
        {
            id: 'click_10',
            name: 'First Steps',
            icon: '👆',
            description: 'Click the crystal 10 times.',
            reward: 1,
            condition: () => GameState.getStats().totalClicks >= 10
        },
        {
            id: 'click_100',
            name: 'Getting Warmed Up',
            icon: '✋',
            description: 'Click the crystal 100 times.',
            reward: 2,
            condition: () => GameState.getStats().totalClicks >= 100
        },
        {
            id: 'click_500',
            name: 'Click Master',
            icon: '🖐️',
            description: 'Click the crystal 500 times.',
            reward: 3,
            condition: () => GameState.getStats().totalClicks >= 500
        },
        {
            id: 'click_1000',
            name: 'Click Champion',
            icon: '🏆',
            description: 'Click the crystal 1,000 times.',
            reward: 5,
            condition: () => GameState.getStats().totalClicks >= 1000
        },
        {
            id: 'click_5000',
            name: 'Click Legend',
            icon: '👑',
            description: 'Click the crystal 5,000 times.',
            reward: 10,
            condition: () => GameState.getStats().totalClicks >= 5000
        },

        // Crystal Achievements
        {
            id: 'crystals_100',
            name: 'Crystal Collector',
            icon: '💎',
            description: 'Earn 100 total crystals.',
            reward: 1,
            condition: () => GameState.getStats().totalCrystals >= 100
        },
        {
            id: 'crystals_1000',
            name: 'Crystal Hoarder',
            icon: '💠',
            description: 'Earn 1,000 total crystals.',
            reward: 2,
            condition: () => GameState.getStats().totalCrystals >= 1000
        },
        {
            id: 'crystals_10000',
            name: 'Crystal Baron',
            icon: '🔷',
            description: 'Earn 10,000 total crystals.',
            reward: 5,
            condition: () => GameState.getStats().totalCrystals >= 10000
        },
        {
            id: 'crystals_100000',
            name: 'Crystal Tycoon',
            icon: '🔶',
            description: 'Earn 100,000 total crystals.',
            reward: 10,
            condition: () => GameState.getStats().totalCrystals >= 100000
        },
        {
            id: 'crystals_1000000',
            name: 'Crystal Magnate',
            icon: '⭐',
            description: 'Earn 1,000,000 total crystals.',
            reward: 25,
            condition: () => GameState.getStats().totalCrystals >= 1000000
        },
        {
            id: 'crystals_10000000',
            name: 'Crystal Overlord',
            icon: '🌟',
            description: 'Earn 10,000,000 total crystals.',
            reward: 50,
            condition: () => GameState.getStats().totalCrystals >= 10000000
        },

        // Building Achievements
        {
            id: 'buildings_1',
            name: 'First Purchase',
            icon: '🏠',
            description: 'Buy your first building.',
            reward: 1,
            condition: () => Buildings.getTotalOwned() >= 1
        },
        {
            id: 'buildings_10',
            name: 'Growing Empire',
            icon: '🏘️',
            description: 'Own 10 buildings.',
            reward: 2,
            condition: () => Buildings.getTotalOwned() >= 10
        },
        {
            id: 'buildings_50',
            name: 'Industrial Complex',
            icon: '🏙️',
            description: 'Own 50 buildings.',
            reward: 5,
            condition: () => Buildings.getTotalOwned() >= 50
        },
        {
            id: 'buildings_100',
            name: 'Mega Corporation',
            icon: '🌆',
            description: 'Own 100 buildings.',
            reward: 10,
            condition: () => Buildings.getTotalOwned() >= 100
        },
        {
            id: 'buildings_200',
            name: 'Global Domination',
            icon: '🌍',
            description: 'Own 200 buildings.',
            reward: 25,
            condition: () => Buildings.getTotalOwned() >= 200
        },

        // CPS Achievements
        {
            id: 'cps_1',
            name: 'Passive Income',
            icon: '📊',
            description: 'Reach 1 crystal per second.',
            reward: 2,
            condition: () => Resources.calculateCPS() >= 1
        },
        {
            id: 'cps_10',
            name: 'Steady Flow',
            icon: '📈',
            description: 'Reach 10 crystals per second.',
            reward: 3,
            condition: () => Resources.calculateCPS() >= 10
        },
        {
            id: 'cps_100',
            name: 'Crystal Stream',
            icon: '🌊',
            description: 'Reach 100 crystals per second.',
            reward: 5,
            condition: () => Resources.calculateCPS() >= 100
        },
        {
            id: 'cps_1000',
            name: 'Crystal River',
            icon: '🏞️',
            description: 'Reach 1,000 crystals per second.',
            reward: 10,
            condition: () => Resources.calculateCPS() >= 1000
        },
        {
            id: 'cps_10000',
            name: 'Crystal Ocean',
            icon: '🌊',
            description: 'Reach 10,000 crystals per second.',
            reward: 25,
            condition: () => Resources.calculateCPS() >= 10000
        },

        // Special Achievements
        {
            id: 'upgrade_first',
            name: 'Upgraded',
            icon: '⬆️',
            description: 'Purchase your first upgrade.',
            reward: 2,
            condition: () => {
                return Upgrades.getAll().some(u => GameState.hasUpgrade(u.id));
            }
        },
        {
            id: 'variety',
            name: 'Diverse Portfolio',
            icon: '🎨',
            description: 'Own at least 5 different building types.',
            reward: 5,
            condition: () => {
                let types = 0;
                Buildings.getAll().forEach(b => {
                    if (GameState.getBuildingCount(b.id) > 0) types++;
                });
                return types >= 5;
            }
        },
        {
            id: 'speed_demon',
            name: 'Speed Demon',
            icon: '⚡',
            description: 'Reach 100 crystals within 5 minutes.',
            reward: 5,
            condition: () => {
                const stats = GameState.getStats();
                return stats.totalCrystals >= 100 && stats.totalPlayTime <= 300000;
            }
        },
        {
            id: 'dedicated',
            name: 'Dedicated Player',
            icon: '⏰',
            description: 'Play for 30 minutes.',
            reward: 5,
            condition: () => GameState.getStats().totalPlayTime >= 1800000
        },
        {
            id: 'veteran',
            name: 'Veteran',
            icon: '🎖️',
            description: 'Play for 1 hour.',
            reward: 10,
            condition: () => GameState.getStats().totalPlayTime >= 3600000
        }
    ];

    /**
     * Get all achievements
     * @returns {Array} - Array of achievement definitions
     */
    function getAll() {
        return achievements;
    }

    /**
     * Get a specific achievement by ID
     * @param {string} achievementId - Achievement identifier
     * @returns {Object|null} - Achievement definition or null
     */
    function getById(achievementId) {
        return achievements.find(a => a.id === achievementId) || null;
    }

    /**
     * Check and unlock any newly completed achievements
     * @returns {Array} - Array of newly unlocked achievements
     */
    function checkAchievements() {
        const newlyUnlocked = [];

        achievements.forEach(achievement => {
            if (!GameState.hasAchievement(achievement.id) && achievement.condition()) {
                if (GameState.unlockAchievement(achievement.id)) {
                    GameState.addGems(achievement.reward);
                    newlyUnlocked.push(achievement);
                }
            }
        });

        return newlyUnlocked;
    }

    /**
     * Get count of unlocked achievements
     * @returns {number} - Number of unlocked achievements
     */
    function getUnlockedCount() {
        return achievements.filter(a => GameState.hasAchievement(a.id)).length;
    }

    /**
     * Get total number of achievements
     * @returns {number} - Total achievements
     */
    function getTotalCount() {
        return achievements.length;
    }

    /**
     * Get total gems from achievements
     * @returns {number} - Total gems earned from achievements
     */
    function getTotalGems() {
        return achievements
            .filter(a => GameState.hasAchievement(a.id))
            .reduce((total, a) => total + a.reward, 0);
    }

    // Public API
    return {
        getAll,
        getById,
        checkAchievements,
        getUnlockedCount,
        getTotalCount,
        getTotalGems
    };
})();
