/**
 * Main Game Module - Idle Legends
 * Initializes the game and runs the main game loop
 */

const Game = (function() {
    let lastTick = Date.now();
    let isRunning = false;

    // Current activity state
    let currentActivity = {
        charIndex: -1,
        zoneId: null,
        type: null,
        progress: 0,
        timePerAction: 3
    };

    /**
     * Initialize the game
     */
    function init() {
        console.log('Idle Legends initializing...');

        // Initialize new systems first
        if (typeof Corruption !== 'undefined') {
            Corruption.init();
            console.log('[Game] Corruption system initialized');
        }
        if (typeof EquipmentGenetics !== 'undefined') {
            EquipmentGenetics.init();
            console.log('[Game] Equipment Genetics initialized');
        }
        if (typeof ZoneFatigue !== 'undefined') {
            ZoneFatigue.init();
            console.log('[Game] Zone Fatigue initialized');
        }
        if (typeof SkillFusion !== 'undefined') {
            SkillFusion.init();
            console.log('[Game] Skill Fusion initialized');
        }
        if (typeof Reincarnation !== 'undefined') {
            Reincarnation.init();
            console.log('[Game] Reincarnation initialized');
        }
        if (typeof ClassEvolution !== 'undefined') {
            ClassEvolution.init();
            console.log('[Game] Class Evolution initialized');
        }

        // Initialize UI
        UI.init();

        // Initialize multiplayer
        if (typeof Multiplayer !== 'undefined') {
            Multiplayer.init();
            MultiplayerUI.init();
        }

        // Register modules with StateManager
        if (typeof StateManager !== 'undefined') {
            StateManager.registerModule('Character', Character);
            StateManager.registerModule('Skills', Skills);
            StateManager.registerModule('Inventory', Inventory);
            StateManager.registerModule('World', World);
            StateManager.registerModule('Combat', Combat);
            StateManager.registerModule('BossCombat', BossCombat);
            StateManager.registerModule('Quests', Quests);
            StateManager.registerModule('Talents', Talents);

            // Register new systems
            if (typeof Corruption !== 'undefined') StateManager.registerModule('Corruption', Corruption);
            if (typeof EquipmentGenetics !== 'undefined') StateManager.registerModule('EquipmentGenetics', EquipmentGenetics);
            if (typeof ZoneFatigue !== 'undefined') StateManager.registerModule('ZoneFatigue', ZoneFatigue);
            if (typeof SkillFusion !== 'undefined') StateManager.registerModule('SkillFusion', SkillFusion);
            if (typeof Reincarnation !== 'undefined') StateManager.registerModule('Reincarnation', Reincarnation);
            if (typeof ClassEvolution !== 'undefined') StateManager.registerModule('ClassEvolution', ClassEvolution);

            console.log('[Game] Registered modules with StateManager');
        }

        // Try to load saved game
        const loaded = SaveSystem.load();
        if (!loaded) {
            console.log('Starting new game');
        }

        // Setup stop activity button
        const stopBtn = document.getElementById('stop-activity-btn');
        if (stopBtn) {
            stopBtn.addEventListener('click', stopActivity);
        }

        // Start auto-save
        SaveSystem.startAutoSave();

        // Initial UI render
        UI.renderCharacterSlots();
        UI.updateCharacterInfo();
        UI.renderZones();
        UI.renderInventory();
        UI.renderShop();
        UI.renderQuests();
        UI.renderSkills();
        UI.renderTalents();
        UI.updateGold();

        // Start game loop
        isRunning = true;
        requestAnimationFrame(gameLoop);

        console.log('Idle Legends initialized!');
    }

    /**
     * Start an activity (mining, combat, etc.)
     */
    function startActivity(zoneId, activityType) {
        const char = Character.getActive();
        if (!char) {
            UI.showNotification('Create a character first!', 'error');
            return;
        }

        const charIndex = Character.getAll().indexOf(char);
        const zone = World.getZone(zoneId);
        const activity = zone.activities.find(a => a.type === activityType);

        if (!activity) return;

        currentActivity = {
            charIndex,
            zoneId,
            type: activityType,
            progress: 0,
            timePerAction: activity.timePerAction || 3,
            expPerAction: activity.expPerAction || 10,
            resource: activity.resource,
            monsters: activity.monsters
        };

        Character.setActivity(charIndex, activityType, zoneId);

        if (activityType === 'combat') {
            Combat.startCombat(charIndex, zoneId);
        }

        UI.addLogEntry(`Started ${activityType} in ${zone.name}`);
    }

    /**
     * Stop current activity
     */
    function stopActivity() {
        if (currentActivity.type === 'combat') {
            const result = Combat.stopCombat(currentActivity.charIndex);
            if (result) {
                UI.addLogEntry(`Combat ended: ${result.killCount} kills, ${result.totalExp} XP, ${result.totalGold} gold`);
            }
        }

        currentActivity = {
            charIndex: -1,
            zoneId: null,
            type: null,
            progress: 0,
            timePerAction: 3
        };

        UI.hideActivityDisplay();
        UI.showNotification('Activity stopped');
    }

    /**
     * Accept a quest
     */
    function acceptQuest(questId) {
        if (Quests.acceptQuest(questId)) {
            UI.showNotification('Quest accepted!', 'success');
            UI.renderQuests();
        }
    }

    /**
     * Complete a quest
     */
    function completeQuest(questId) {
        const rewards = Quests.completeQuest(questId);
        if (rewards) {
            UI.showNotification(`Quest complete! +${rewards.exp} XP, +${rewards.gold} gold`, 'success');
            UI.renderQuests();
            UI.updateCharacterInfo();
            UI.updateGold();
            UI.renderInventory();
        }
    }

    /**
     * Process gathering activity
     */
    function processGathering(deltaTime) {
        if (!currentActivity.type || currentActivity.type === 'combat') return;

        const char = Character.getByIndex(currentActivity.charIndex);
        if (!char) return;

        // Get skill efficiency
        const efficiency = Skills.getEfficiency(char.id, currentActivity.type);
        const progressPerSecond = efficiency / currentActivity.timePerAction;

        currentActivity.progress += progressPerSecond * deltaTime;

        // Check if action completed
        if (currentActivity.progress >= 1) {
            currentActivity.progress = 0;

            // Give resource
            if (currentActivity.resource) {
                const yieldBonus = Skills.getYieldBonus(char.id, currentActivity.type);
                let amount = Math.floor(yieldBonus);
                if (Math.random() < (yieldBonus - amount)) amount++;

                Inventory.addItem(currentActivity.resource, Math.max(1, amount));
                UI.addLootItem(currentActivity.resource);

                // Update quest progress
                Quests.updateProgress('gather', currentActivity.resource, Math.max(1, amount));
            }

            // Give skill XP
            Skills.addExp(char.id, currentActivity.type, currentActivity.expPerAction);

            // Update UI
            UI.renderSkills();
            UI.renderInventory();
            UI.renderQuests();
        }

        // Update activity display
        UI.updateActivityDisplay(currentActivity.zoneId, currentActivity.type, currentActivity.progress);
    }

    /**
     * Process combat
     */
    function processCombat(deltaTime) {
        if (currentActivity.type !== 'combat') return;

        const results = Combat.processTick(currentActivity.charIndex, deltaTime);
        if (!results) return;

        for (const result of results) {
            if (result.type === 'playerAttack') {
                const msg = result.isCrit ?
                    `CRIT! You deal ${result.damage} damage!` :
                    `You deal ${result.damage} damage`;
                UI.addCombatMessage(msg, result.isCrit ? 'crit' : 'player-hit');
            } else if (result.type === 'monsterAttack') {
                UI.addCombatMessage(`Enemy deals ${result.damage} damage!`, 'enemy-hit');
            } else if (result.type === 'monsterDeath') {
                UI.addCombatMessage(`Defeated ${result.monster.name}! +${result.exp} XP, +${result.gold} gold`, 'player-hit');

                // Update quest progress
                Quests.updateProgress('kill', result.monster.id, 1);

                // Add loot
                for (const itemId of result.drops) {
                    UI.addLootItem(itemId);
                }

                // Check for zone unlocks
                if (result.newUnlocks && result.newUnlocks.length > 0) {
                    for (const zone of result.newUnlocks) {
                        UI.showNotification(`New zone unlocked: ${zone.name}!`, 'success');
                    }
                    UI.renderZones();
                }
            } else if (result.type === 'monsterSpawn') {
                UI.addCombatMessage(`A ${result.monster.name} appears!`, '');
            } else if (result.type === 'playerDeath') {
                UI.showNotification('You died! Respawning...', 'error');
                Character.respawn(currentActivity.charIndex);
                stopActivity();
            }
        }

        // Update UI
        UI.updateCombat(currentActivity.charIndex);
        UI.updateCharacterInfo();
        UI.updateGold();
        UI.renderInventory();
        UI.renderQuests();
    }

    /**
     * Main game loop
     */
    function gameLoop(timestamp) {
        if (!isRunning) return;

        const now = Date.now();
        const deltaTime = (now - lastTick) / 1000;
        lastTick = now;

        // Process current activity
        if (currentActivity.type) {
            if (currentActivity.type === 'combat') {
                processCombat(deltaTime);
            } else {
                processGathering(deltaTime);
            }
        }

        // Process passive regen for all characters
        Character.getAll().forEach((_, i) => {
            Combat.processRegen(i, deltaTime);
        });

        // Process AFK income for inactive characters
        const afkResults = Character.processAfkIncome(deltaTime);
        if (afkResults && afkResults.length > 0) {
            // Log AFK gains (but not too spammy - only occasionally)
            if (Math.random() < 0.1) {
                const result = afkResults[0];
                if (result.type === 'combat') {
                    UI.addLogEntry(`${result.charName} (AFK): +${result.gold}g, +${result.exp} XP`);
                } else {
                    const item = Inventory.getItemDef(result.resource);
                    UI.addLogEntry(`${result.charName} (AFK): +${result.amount} ${item ? item.name : result.resource}`);
                }
            }
        }

        // Periodic UI updates (every second)
        if (Math.floor(now / 1000) !== Math.floor((now - deltaTime * 1000) / 1000)) {
            UI.updateCharacterInfo();
            UI.updateGold();
            UI.renderInventory();
            UI.updateNewSystems(); // Update corruption, class, etc.

            // Check for zone unlocks based on highest character level
            const chars = Character.getAll();
            if (chars.length > 0) {
                const maxLevel = Math.max(...chars.map(c => c.level));
                const newZones = World.checkUnlocks(maxLevel);
                if (newZones.length > 0) {
                    UI.renderZones();
                }
            }
        }

        requestAnimationFrame(gameLoop);
    }

    /**
     * Stop the game
     */
    function stop() {
        isRunning = false;
        SaveSystem.stopAutoSave();
    }

    // Public API
    return {
        init,
        startActivity,
        stopActivity,
        acceptQuest,
        completeQuest,
        stop
    };
})();

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', Game.init);
