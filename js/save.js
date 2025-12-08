/**
 * Save Module
 * Handles saving and loading game progress
 */

const SaveSystem = (function() {
    const SAVE_KEY = 'crystal_clicker_save';
    const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

    let autoSaveTimer = null;

    /**
     * Save the game to localStorage
     * @returns {boolean} - Whether save was successful
     */
    function save() {
        try {
            const state = GameState.getState();
            const saveData = JSON.stringify(state);
            localStorage.setItem(SAVE_KEY, saveData);

            UI.showNotification('💾 Game saved!');
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            UI.showNotification('❌ Failed to save game!');
            return false;
        }
    }

    /**
     * Load the game from localStorage
     * @returns {boolean} - Whether load was successful
     */
    function load() {
        try {
            const saveData = localStorage.getItem(SAVE_KEY);
            if (!saveData) {
                console.log('No save data found');
                return false;
            }

            const state = JSON.parse(saveData);
            GameState.loadState(state);

            // Reapply upgrade effects
            Upgrades.reapplyUpgrades();

            // Calculate offline progress
            calculateOfflineProgress(state);

            return true;
        } catch (e) {
            console.error('Failed to load game:', e);
            return false;
        }
    }

    /**
     * Calculate and apply offline progress
     * @param {Object} state - Loaded state
     */
    function calculateOfflineProgress(state) {
        const now = Date.now();
        const lastPlayed = state.stats.startTime + state.stats.totalPlayTime;
        const offlineTime = (now - lastPlayed) / 1000; // Convert to seconds

        // Cap offline time at 8 hours
        const maxOfflineTime = 8 * 60 * 60;
        const cappedTime = Math.min(offlineTime, maxOfflineTime);

        if (cappedTime > 60) { // At least 1 minute offline
            const cps = Resources.calculateCPS();
            // Offline production is 50% of normal
            const offlineProduction = cps * cappedTime * 0.5;

            if (offlineProduction > 0) {
                GameState.addCrystals(offlineProduction);

                const timeString = formatOfflineTime(cappedTime);
                UI.showNotification(
                    `⏰ Welcome back! You were away for ${timeString}.<br>
                     💎 Earned ${Resources.formatNumber(offlineProduction)} crystals while away!`
                );
            }
        }
    }

    /**
     * Format offline time for display
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    function formatOfflineTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    /**
     * Reset the game (delete save)
     * @param {boolean} confirm - Whether to confirm reset
     */
    function reset(confirm = true) {
        if (confirm && !window.confirm('Are you sure you want to reset? All progress will be lost!')) {
            return false;
        }

        localStorage.removeItem(SAVE_KEY);
        GameState.resetState();

        // Re-render UI
        UI.renderBuildings();
        UI.renderUpgrades();
        UI.renderAchievements();
        UI.updateResources();
        UI.updateStats();

        UI.showNotification('🔄 Game reset!');
        return true;
    }

    /**
     * Start auto-save timer
     */
    function startAutoSave() {
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
        }

        autoSaveTimer = setInterval(() => {
            const state = GameState.getState();
            if (state.settings.autoSave) {
                // Silent save (no notification)
                try {
                    const saveData = JSON.stringify(GameState.getState());
                    localStorage.setItem(SAVE_KEY, saveData);
                    console.log('Auto-saved');
                } catch (e) {
                    console.error('Auto-save failed:', e);
                }
            }
        }, AUTO_SAVE_INTERVAL);
    }

    /**
     * Stop auto-save timer
     */
    function stopAutoSave() {
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
            autoSaveTimer = null;
        }
    }

    /**
     * Export save as string (for manual backup)
     * @returns {string} - Base64 encoded save data
     */
    function exportSave() {
        try {
            const state = GameState.getState();
            const saveData = JSON.stringify(state);
            return btoa(saveData);
        } catch (e) {
            console.error('Failed to export save:', e);
            return null;
        }
    }

    /**
     * Import save from string
     * @param {string} data - Base64 encoded save data
     * @returns {boolean} - Whether import was successful
     */
    function importSave(data) {
        try {
            const saveData = atob(data);
            const state = JSON.parse(saveData);

            if (!state.version) {
                throw new Error('Invalid save data');
            }

            GameState.loadState(state);
            Upgrades.reapplyUpgrades();
            save(); // Save imported data

            UI.renderBuildings();
            UI.renderUpgrades();
            UI.renderAchievements();

            UI.showNotification('📥 Save imported successfully!');
            return true;
        } catch (e) {
            console.error('Failed to import save:', e);
            UI.showNotification('❌ Failed to import save!');
            return false;
        }
    }

    // Public API
    return {
        save,
        load,
        reset,
        startAutoSave,
        stopAutoSave,
        exportSave,
        importSave
    };
})();
