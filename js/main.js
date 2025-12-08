/**
 * Main Game Module
 * Initializes the game and runs the main game loop
 */

const Game = (function() {
    let lastTick = Date.now();
    let lastPassiveParticle = 0;
    let isRunning = false;

    /**
     * Initialize the game
     */
    function init() {
        console.log('Crystal Clicker initializing...');

        // Initialize UI
        UI.init();

        // Try to load saved game
        const loaded = SaveSystem.load();
        if (!loaded) {
            console.log('Starting new game');
        }

        // Setup event listeners
        setupEventListeners();

        // Start auto-save
        SaveSystem.startAutoSave();

        // Initial UI update
        UI.updateResources();
        UI.updateStats();
        UI.renderBuildings();
        UI.renderUpgrades();

        // Start game loop
        isRunning = true;
        requestAnimationFrame(gameLoop);

        console.log('Crystal Clicker initialized!');
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Main crystal click
        const crystal = document.getElementById('main-crystal');
        crystal.addEventListener('click', handleCrystalClick);

        // Also handle touch for mobile
        crystal.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleCrystalClick(e.touches[0]);
        });

        // Save button
        document.getElementById('save-btn').addEventListener('click', () => {
            SaveSystem.save();
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            SaveSystem.reset();
        });

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            SaveSystem.save();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Space to click
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
                const rect = crystal.getBoundingClientRect();
                const fakeEvent = {
                    clientX: rect.left + rect.width / 2,
                    clientY: rect.top + rect.height / 2
                };
                handleCrystalClick(fakeEvent);
            }

            // S to save
            if (e.code === 'KeyS' && e.ctrlKey) {
                e.preventDefault();
                SaveSystem.save();
            }
        });
    }

    /**
     * Handle crystal click
     * @param {Event} event - Click or touch event
     */
    function handleCrystalClick(event) {
        // Process the click
        const clickValue = Resources.processClick();

        // Visual feedback
        UI.crystalClickAnimation();
        Particles.createClickEffect(clickValue, event);

        // Check achievements
        checkAndShowAchievements();
    }

    /**
     * Buy a building
     * @param {string} buildingId - Building identifier
     */
    function buyBuilding(buildingId) {
        if (Buildings.purchase(buildingId)) {
            UI.renderBuildings();
            UI.updateResources();
            checkAndShowAchievements();
        }
    }

    /**
     * Buy an upgrade
     * @param {string} upgradeId - Upgrade identifier
     */
    function buyUpgrade(upgradeId) {
        if (Upgrades.purchase(upgradeId)) {
            UI.renderUpgrades();
            UI.renderBuildings(); // Update building production display
            UI.updateResources();
            checkAndShowAchievements();
        }
    }

    /**
     * Check achievements and show notifications
     */
    function checkAndShowAchievements() {
        const newAchievements = Achievements.checkAchievements();
        newAchievements.forEach(achievement => {
            UI.showAchievementNotification(achievement);
            Particles.createAchievementEffect();
        });
    }

    /**
     * Main game loop
     */
    function gameLoop(timestamp) {
        if (!isRunning) return;

        const now = Date.now();
        const deltaTime = (now - lastTick) / 1000; // Convert to seconds
        lastTick = now;

        // Process passive income
        Resources.processTick(deltaTime);

        // Update play time
        GameState.updatePlayTime();

        // Apply synergy bonuses
        Upgrades.applySynergyBonuses();

        // Update UI (throttled)
        UI.updateResources();

        // Update stats every second
        if (Math.floor(now / 1000) !== Math.floor((now - deltaTime * 1000) / 1000)) {
            UI.updateStats();

            // Check for new buildings to unlock
            const visibleBuildings = document.querySelectorAll('[data-building]').length;
            const totalUnlocked = Buildings.getAll().filter(b => Buildings.isUnlocked(b.id)).length;
            if (totalUnlocked > visibleBuildings) {
                UI.renderBuildings();
            }

            // Check for new upgrades to unlock
            UI.renderUpgrades();

            // Check achievements periodically
            checkAndShowAchievements();
        }

        // Passive particles (when CPS > 0)
        const cps = Resources.calculateCPS();
        if (cps > 0 && now - lastPassiveParticle > Math.max(100, 1000 / Math.min(cps, 10))) {
            Particles.createPassiveParticle();
            lastPassiveParticle = now;
        }

        // Continue loop
        requestAnimationFrame(gameLoop);
    }

    /**
     * Stop the game loop
     */
    function stop() {
        isRunning = false;
        SaveSystem.stopAutoSave();
    }

    // Public API
    return {
        init,
        buyBuilding,
        buyUpgrade,
        stop
    };
})();

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', Game.init);
