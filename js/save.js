/**
 * Save Module
 * Handles saving and loading game progress
 */

const SaveSystem = (function() {
    const SAVE_KEY = 'crystal_clicker_save_v2';
    const AUTO_SAVE_INTERVAL = 30000;

    let autoSaveTimer = null;

    /**
     * Gather all game state for saving
     */
    function gatherFullState() {
        const fullState = {
            gameState: GameState.getState(),
            expeditions: typeof Expeditions !== 'undefined' ? Expeditions.getState() : null,
            artifacts: typeof Artifacts !== 'undefined' ? Artifacts.getState() : null,
            events: typeof Events !== 'undefined' ? Events.getState() : null,
            prestige: typeof Prestige !== 'undefined' ? Prestige.getState() : null,
            savedAt: Date.now()
        };
        return fullState;
    }

    /**
     * Save the game to localStorage
     */
    function save() {
        try {
            const fullState = gatherFullState();
            const saveData = JSON.stringify(fullState);
            localStorage.setItem(SAVE_KEY, saveData);
            UI.showNotification('💾 Game saved!');
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            UI.showNotification('❌ Failed to save!');
            return false;
        }
    }

    /**
     * Load the game from localStorage
     */
    function load() {
        try {
            const saveData = localStorage.getItem(SAVE_KEY);
            if (!saveData) {
                console.log('No save data found');
                return false;
            }

            const fullState = JSON.parse(saveData);

            // Load game state
            if (fullState.gameState) {
                GameState.loadState(fullState.gameState);
            }

            // Load expeditions
            if (fullState.expeditions && typeof Expeditions !== 'undefined') {
                Expeditions.loadState(fullState.expeditions);
            }

            // Load artifacts
            if (fullState.artifacts && typeof Artifacts !== 'undefined') {
                Artifacts.loadState(fullState.artifacts);
            }

            // Load events
            if (fullState.events && typeof Events !== 'undefined') {
                Events.loadState(fullState.events);
            }

            // Load prestige
            if (fullState.prestige && typeof Prestige !== 'undefined') {
                Prestige.loadState(fullState.prestige);
            }

            // Reapply upgrade effects
            Upgrades.reapplyUpgrades();

            // Calculate offline progress
            if (fullState.savedAt) {
                calculateOfflineProgress(fullState);
            }

            return true;
        } catch (e) {
            console.error('Failed to load game:', e);
            return false;
        }
    }

    /**
     * Calculate and apply offline progress
     */
    function calculateOfflineProgress(fullState) {
        const now = Date.now();
        const lastPlayed = fullState.savedAt;
        const offlineTime = (now - lastPlayed) / 1000;

        const maxOfflineTime = 8 * 60 * 60;
        const cappedTime = Math.min(offlineTime, maxOfflineTime);

        if (cappedTime > 60) {
            const cps = Resources.calculateCPS();
            const offlineProduction = cps * cappedTime * 0.5;

            if (offlineProduction > 0) {
                GameState.addCrystals(offlineProduction);

                const timeString = formatOfflineTime(cappedTime);
                UI.showNotification(
                    `⏰ Welcome back! Away for ${timeString}.<br>
                     💎 +${Resources.formatNumber(offlineProduction)} crystals!`
                );
            }
        }
    }

    function formatOfflineTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    /**
     * Reset the game
     */
    function reset(confirm = true) {
        if (confirm && !window.confirm('Reset ALL progress including prestige?')) {
            return false;
        }

        localStorage.removeItem(SAVE_KEY);
        GameState.resetState();

        if (typeof Expeditions !== 'undefined') Expeditions.reset();
        if (typeof Artifacts !== 'undefined') Artifacts.reset();
        if (typeof Events !== 'undefined') Events.reset();
        if (typeof Prestige !== 'undefined') Prestige.fullReset();

        // Re-render everything
        UI.renderBuildings();
        UI.renderUpgrades();
        UI.renderAchievements();
        UI.renderExpeditions();
        UI.renderArtifacts();
        UI.renderPrestige();
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
            try {
                const fullState = gatherFullState();
                const saveData = JSON.stringify(fullState);
                localStorage.setItem(SAVE_KEY, saveData);
                console.log('Auto-saved');
            } catch (e) {
                console.error('Auto-save failed:', e);
            }
        }, AUTO_SAVE_INTERVAL);
    }

    function stopAutoSave() {
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
            autoSaveTimer = null;
        }
    }

    function exportSave() {
        try {
            const fullState = gatherFullState();
            return btoa(JSON.stringify(fullState));
        } catch (e) {
            console.error('Failed to export:', e);
            return null;
        }
    }

    function importSave(data) {
        try {
            const fullState = JSON.parse(atob(data));
            localStorage.setItem(SAVE_KEY, JSON.stringify(fullState));
            location.reload();
            return true;
        } catch (e) {
            console.error('Failed to import:', e);
            UI.showNotification('❌ Invalid save data!');
            return false;
        }
    }

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
