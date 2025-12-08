/**
 * Main Game Module
 * Initializes the game and runs the main game loop
 */

const Game = (function() {
    let lastTick = Date.now();
    let lastPassiveParticle = 0;
    let lastUIUpdate = 0;
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
        UI.renderAchievements();
        UI.renderExpeditions();
        UI.renderArtifacts();
        UI.renderPrestige();

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
     * Start an expedition
     * @param {string} destinationId - Destination identifier
     */
    function startExpedition(destinationId) {
        if (typeof Expeditions !== 'undefined' && Expeditions.start(destinationId)) {
            UI.renderExpeditions();
            UI.updateResources();
            UI.showNotification('🚀 Expedition started!');
        }
    }

    /**
     * Claim an expedition reward
     * @param {number} index - Reward index
     */
    function claimExpeditionReward(index) {
        if (typeof Expeditions === 'undefined') return;

        const reward = Expeditions.claimReward(index);
        if (reward) {
            UI.renderExpeditions();
            UI.renderArtifacts();
            UI.updateResources();
            UI.updateActiveBonuses();

            // Show reward notification
            let message = `🎉 Expedition Complete!<br>💎 +${Resources.formatNumber(reward.rewards.crystals)} crystals`;
            if (reward.rewards.gems > 0) {
                message += `<br>💠 +${reward.rewards.gems} gems`;
            }
            if (reward.rewards.artifact) {
                message += `<br>🎁 Found: ${reward.rewards.artifact.name}!`;
            }
            if (reward.rewards.bonus) {
                message += `<br>✨ ${reward.rewards.bonus.type} bonus activated!`;
            }
            UI.showNotification(message);

            checkAndShowAchievements();
        }
    }

    /**
     * Buy a prestige upgrade
     * @param {string} upgradeId - Prestige upgrade identifier
     */
    function buyPrestigeUpgrade(upgradeId) {
        if (typeof Prestige !== 'undefined' && Prestige.buyUpgrade(upgradeId)) {
            UI.renderPrestige();
            UI.showNotification('⭐ Prestige upgrade purchased!');
        }
    }

    /**
     * Perform prestige reset
     */
    function performPrestige() {
        if (typeof Prestige === 'undefined') return;

        const earned = Prestige.calculateStardustEarned();
        if (earned <= 0) {
            UI.showNotification('❌ Not enough crystals to prestige!');
            return;
        }

        if (!window.confirm(`Prestige for ${earned} Stardust? This will reset your progress but keep artifacts.`)) {
            return;
        }

        if (Prestige.performPrestige()) {
            // Re-render everything after prestige
            UI.renderBuildings();
            UI.renderUpgrades();
            UI.renderAchievements();
            UI.renderExpeditions();
            UI.renderPrestige();
            UI.updateResources();
            UI.updateStats();
            UI.showNotification(`✨ Prestige complete! Earned ${earned} Stardust!`);
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

        // Check for random events
        if (typeof Events !== 'undefined') {
            const newEvent = Events.checkForEvent();
            if (newEvent) {
                UI.updateEventBanner();
                UI.showNotification(`${newEvent.icon} ${newEvent.name}!<br>${newEvent.description}`);
            }
        }

        // Check for completed expeditions
        if (typeof Expeditions !== 'undefined') {
            if (Expeditions.checkCompletions()) {
                UI.renderExpeditions();
                UI.showNotification('📦 An expedition has returned!');
            }
        }

        // Update UI (throttled)
        UI.updateResources();

        // Update event banner and active bonuses frequently
        if (now - lastUIUpdate > 500) {
            lastUIUpdate = now;
            UI.updateEventBanner();
            UI.updateActiveBonuses();
        }

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

            // Update expeditions display (progress bars)
            if (typeof Expeditions !== 'undefined') {
                UI.renderExpeditions();
            }

            // Update prestige display
            if (typeof Prestige !== 'undefined') {
                UI.renderPrestige();
            }
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
        startExpedition,
        claimExpeditionReward,
        buyPrestigeUpgrade,
        performPrestige,
        stop
    };
})();

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', Game.init);
