/**
 * Save Module - Idle Legends
 * Handles saving and loading game progress
 */

const SaveSystem = (function() {
    const SAVE_KEY = 'idle_legends_save_v1';
    const AUTO_SAVE_INTERVAL = 30000;

    let autoSaveTimer = null;

    /**
     * Gather all game state for saving
     */
    function gatherFullState() {
        return {
            character: Character.getState(),
            skills: Skills.getState(),
            inventory: Inventory.getState(),
            world: World.getState(),
            quests: Quests.getState(),
            talents: Talents.getState(),
            savedAt: Date.now()
        };
    }

    /**
     * Save the game to localStorage
     */
    function save() {
        try {
            const fullState = gatherFullState();
            const saveData = JSON.stringify(fullState);
            localStorage.setItem(SAVE_KEY, saveData);
            console.log('Game saved');
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
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
                return false;
            }

            const fullState = JSON.parse(saveData);

            // Load each module's state
            if (fullState.character) {
                Character.loadState(fullState.character);
            }

            if (fullState.skills) {
                Skills.loadState(fullState.skills);
            }

            if (fullState.inventory) {
                Inventory.loadState(fullState.inventory);
            }

            if (fullState.world) {
                World.loadState(fullState.world);
            }

            if (fullState.quests) {
                Quests.loadState(fullState.quests);
            }

            if (fullState.talents) {
                Talents.loadState(fullState.talents);
            }

            console.log('Game loaded from save');
            return true;
        } catch (e) {
            console.error('Failed to load game:', e);
            return false;
        }
    }

    /**
     * Reset the game
     */
    function reset() {
        if (!confirm('Are you sure you want to reset? All progress will be lost!')) {
            return false;
        }

        localStorage.removeItem(SAVE_KEY);

        // Reset all modules
        Character.reset();
        Skills.reset();
        Inventory.reset();
        World.reset();
        Quests.reset();
        Talents.reset();
        Combat.reset();

        // Reload page
        location.reload();
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
            save();
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
     * Export save as string (for backup)
     */
    function exportSave() {
        const state = gatherFullState();
        return btoa(JSON.stringify(state));
    }

    /**
     * Import save from string
     */
    function importSave(saveString) {
        try {
            const state = JSON.parse(atob(saveString));
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
            location.reload();
            return true;
        } catch (e) {
            console.error('Invalid save data:', e);
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
