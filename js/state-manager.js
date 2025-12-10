/**
 * State Manager
 * Central coordinator for game state management across all modules
 */

const StateManager = (function() {
    // Registry of all modules that need state management
    const modules = [];

    /**
     * Register a module for state management
     * @param {string} name - Module name
     * @param {Object} module - Module with getState() and loadState() methods
     */
    function registerModule(name, module) {
        if (!module.getState || !module.loadState) {
            console.warn(`[StateManager] Module "${name}" missing getState/loadState methods`);
            return;
        }

        modules.push({ name, module });
        console.log(`[StateManager] Registered module: ${name}`);
    }

    /**
     * Get complete game state from all modules
     * @returns {Object} Complete game state
     */
    function getCompleteState() {
        const state = {
            version: GameConfig.VERSION,
            timestamp: Date.now(),
            modules: {}
        };

        modules.forEach(({ name, module }) => {
            try {
                state.modules[name] = module.getState();
            } catch (err) {
                console.error(`[StateManager] Error getting state from ${name}:`, err);
            }
        });

        return state;
    }

    /**
     * Load complete game state into all modules
     * @param {Object} state - Complete game state
     * @returns {boolean} Success status
     */
    function loadCompleteState(state) {
        if (!state || !state.modules) {
            console.error('[StateManager] Invalid state object');
            return false;
        }

        console.log(`[StateManager] Loading state (version: ${state.version})`);

        let successCount = 0;
        let failCount = 0;

        modules.forEach(({ name, module }) => {
            try {
                if (state.modules[name]) {
                    module.loadState(state.modules[name]);
                    successCount++;
                } else {
                    console.warn(`[StateManager] No saved state for module: ${name}`);
                }
            } catch (err) {
                console.error(`[StateManager] Error loading state into ${name}:`, err);
                failCount++;
            }
        });

        console.log(`[StateManager] Load complete: ${successCount} success, ${failCount} failed`);
        return failCount === 0;
    }

    /**
     * Save game state to localStorage
     * @returns {boolean} Success status
     */
    function saveToLocalStorage() {
        try {
            const state = getCompleteState();
            const json = JSON.stringify(state);
            localStorage.setItem(GameConfig.SAVE_KEY, json);
            console.log('[StateManager] Game saved to localStorage');
            return true;
        } catch (err) {
            console.error('[StateManager] Error saving to localStorage:', err);
            return false;
        }
    }

    /**
     * Load game state from localStorage
     * @returns {boolean} Success status
     */
    function loadFromLocalStorage() {
        try {
            const json = localStorage.getItem(GameConfig.SAVE_KEY);
            if (!json) {
                console.log('[StateManager] No save data found');
                return false;
            }

            const state = JSON.parse(json);
            return loadCompleteState(state);
        } catch (err) {
            console.error('[StateManager] Error loading from localStorage:', err);
            return false;
        }
    }

    /**
     * Export game state as downloadable JSON file
     * @returns {string} JSON string
     */
    function exportState() {
        const state = getCompleteState();
        const json = JSON.stringify(state, null, 2);

        // Create download link
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `idle_legends_save_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('[StateManager] Game exported');
        return json;
    }

    /**
     * Import game state from JSON string
     * @param {string} json - JSON string
     * @returns {boolean} Success status
     */
    function importState(json) {
        try {
            const state = JSON.parse(json);
            const success = loadCompleteState(state);

            if (success) {
                saveToLocalStorage(); // Save imported state
            }

            return success;
        } catch (err) {
            console.error('[StateManager] Error importing state:', err);
            return false;
        }
    }

    /**
     * Clear all game data
     */
    function clearAllData() {
        localStorage.removeItem(GameConfig.SAVE_KEY);

        modules.forEach(({ name, module }) => {
            try {
                if (module.reset) {
                    module.reset();
                }
            } catch (err) {
                console.error(`[StateManager] Error resetting module ${name}:`, err);
            }
        });

        console.log('[StateManager] All data cleared');
    }

    /**
     * Get list of registered modules
     * @returns {Array} Module names
     */
    function getRegisteredModules() {
        return modules.map(m => m.name);
    }

    /**
     * Check if save data exists
     * @returns {boolean} True if save exists
     */
    function hasSaveData() {
        return localStorage.getItem(GameConfig.SAVE_KEY) !== null;
    }

    /**
     * Get save data info
     * @returns {Object|null} Save info or null
     */
    function getSaveInfo() {
        try {
            const json = localStorage.getItem(GameConfig.SAVE_KEY);
            if (!json) return null;

            const state = JSON.parse(json);
            return {
                version: state.version,
                timestamp: state.timestamp,
                date: new Date(state.timestamp).toLocaleString(),
                size: (json.length / 1024).toFixed(2) + ' KB'
            };
        } catch (err) {
            return null;
        }
    }

    // Public API
    return {
        registerModule,
        getCompleteState,
        loadCompleteState,
        saveToLocalStorage,
        loadFromLocalStorage,
        exportState,
        importState,
        clearAllData,
        getRegisteredModules,
        hasSaveData,
        getSaveInfo
    };
})();
