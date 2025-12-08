/**
 * Quests Module
 * Quest system with objectives and rewards
 */

const Quests = (function() {
    // Quest definitions
    const questDefs = {
        // Tutorial quests
        first_steps: {
            id: 'first_steps',
            name: 'First Steps',
            description: 'Begin your adventure by mining some copper',
            type: 'tutorial',
            objectives: [
                { type: 'gather', itemId: 'copper_ore', amount: 5, current: 0 }
            ],
            rewards: { exp: 50, gold: 20, items: [{ itemId: 'bronze_pickaxe', quantity: 1 }] },
            unlocked: true,
            prereq: null
        },
        first_blood: {
            id: 'first_blood',
            name: 'First Blood',
            description: 'Defeat your first monsters',
            type: 'tutorial',
            objectives: [
                { type: 'kill', monsterId: 'slime', amount: 5, current: 0 }
            ],
            rewards: { exp: 75, gold: 30, items: [{ itemId: 'wooden_sword', quantity: 1 }] },
            unlocked: true,
            prereq: null
        },
        woodcutter: {
            id: 'woodcutter',
            name: 'Aspiring Woodcutter',
            description: 'Chop some oak logs',
            type: 'tutorial',
            objectives: [
                { type: 'gather', itemId: 'oak_log', amount: 10, current: 0 }
            ],
            rewards: { exp: 60, gold: 25, items: [{ itemId: 'bronze_axe', quantity: 1 }] },
            unlocked: true,
            prereq: null
        },
        gone_fishing: {
            id: 'gone_fishing',
            name: 'Gone Fishing',
            description: 'Catch some fish from the pond',
            type: 'tutorial',
            objectives: [
                { type: 'gather', itemId: 'small_fish', amount: 5, current: 0 }
            ],
            rewards: { exp: 50, gold: 20, items: [{ itemId: 'fishing_rod', quantity: 1 }] },
            unlocked: true,
            prereq: null
        },

        // Early game quests
        slime_hunter: {
            id: 'slime_hunter',
            name: 'Slime Hunter',
            description: 'Clear out the slime infestation',
            type: 'combat',
            objectives: [
                { type: 'kill', monsterId: 'slime', amount: 25, current: 0 }
            ],
            rewards: { exp: 200, gold: 100, items: [{ itemId: 'health_potion', quantity: 3 }] },
            unlocked: false,
            prereq: 'first_blood'
        },
        iron_age: {
            id: 'iron_age',
            name: 'Iron Age',
            description: 'Gather iron ore from the deeper mines',
            type: 'gathering',
            objectives: [
                { type: 'gather', itemId: 'iron_ore', amount: 20, current: 0 }
            ],
            rewards: { exp: 300, gold: 150, items: [{ itemId: 'iron_pickaxe', quantity: 1 }] },
            unlocked: false,
            prereq: 'first_steps',
            reqLevel: 8
        },
        wolf_pack: {
            id: 'wolf_pack',
            name: 'Wolf Pack',
            description: 'Hunt wolves in the deep forest',
            type: 'combat',
            objectives: [
                { type: 'kill', monsterId: 'wolf', amount: 15, current: 0 },
                { type: 'gather', itemId: 'wolf_pelt', amount: 5, current: 0 }
            ],
            rewards: { exp: 400, gold: 200, items: [{ itemId: 'leather_armor', quantity: 1 }] },
            unlocked: false,
            prereq: 'slime_hunter',
            reqLevel: 6
        },
        goblin_menace: {
            id: 'goblin_menace',
            name: 'Goblin Menace',
            description: 'Deal with the goblin threat',
            type: 'combat',
            objectives: [
                { type: 'kill', monsterId: 'goblin', amount: 20, current: 0 },
                { type: 'gather', itemId: 'goblin_ear', amount: 10, current: 0 }
            ],
            rewards: { exp: 500, gold: 250, items: [{ itemId: 'bronze_sword', quantity: 1 }] },
            unlocked: false,
            prereq: 'wolf_pack',
            reqLevel: 7
        },

        // Mid game quests
        master_miner: {
            id: 'master_miner',
            name: 'Master Miner',
            description: 'Prove your mining skills',
            type: 'gathering',
            objectives: [
                { type: 'skill_level', skillId: 'mining', level: 20, current: 0 }
            ],
            rewards: { exp: 1000, gold: 500, items: [{ itemId: 'steel_bar', quantity: 5 }] },
            unlocked: false,
            prereq: 'iron_age',
            reqLevel: 15
        },
        crystal_seeker: {
            id: 'crystal_seeker',
            name: 'Crystal Seeker',
            description: 'Find precious crystals in the caverns',
            type: 'gathering',
            objectives: [
                { type: 'gather', itemId: 'crystal_shard', amount: 10, current: 0 }
            ],
            rewards: { exp: 800, gold: 400, items: [{ itemId: 'crystal_staff', quantity: 1 }] },
            unlocked: false,
            prereq: 'master_miner',
            reqLevel: 25
        },
        goblin_chief_bounty: {
            id: 'goblin_chief_bounty',
            name: 'Goblin Chief Bounty',
            description: 'Defeat the Goblin Chief',
            type: 'boss',
            objectives: [
                { type: 'kill', monsterId: 'goblin_chief', amount: 1, current: 0 }
            ],
            rewards: { exp: 1500, gold: 750, items: [{ itemId: 'iron_sword', quantity: 1 }, { itemId: 'gold_ring', quantity: 1 }] },
            unlocked: false,
            prereq: 'goblin_menace',
            reqLevel: 15
        },

        // Late game quests
        dungeon_delver: {
            id: 'dungeon_delver',
            name: 'Dungeon Delver',
            description: 'Explore the dark dungeon',
            type: 'combat',
            objectives: [
                { type: 'kill', monsterId: 'skeleton', amount: 30, current: 0 },
                { type: 'kill', monsterId: 'ghost', amount: 15, current: 0 }
            ],
            rewards: { exp: 2000, gold: 1000, items: [{ itemId: 'steel_blade', quantity: 1 }] },
            unlocked: false,
            prereq: 'goblin_chief_bounty',
            reqLevel: 26
        },
        lich_slayer: {
            id: 'lich_slayer',
            name: 'Lich Slayer',
            description: 'Defeat the Lich King',
            type: 'boss',
            objectives: [
                { type: 'kill', monsterId: 'dungeon_boss', amount: 1, current: 0 }
            ],
            rewards: { exp: 5000, gold: 2500, items: [{ itemId: 'mythril_sword', quantity: 1 }] },
            unlocked: false,
            prereq: 'dungeon_delver',
            reqLevel: 40
        },
        diamond_hunter: {
            id: 'diamond_hunter',
            name: 'Diamond Hunter',
            description: 'Find the rarest gems',
            type: 'gathering',
            objectives: [
                { type: 'gather', itemId: 'diamond', amount: 5, current: 0 }
            ],
            rewards: { exp: 3000, gold: 2000, items: [{ itemId: 'lucky_amulet', quantity: 1 }] },
            unlocked: false,
            prereq: 'crystal_seeker',
            reqLevel: 30
        },

        // End game
        dragon_hunter: {
            id: 'dragon_hunter',
            name: 'Dragon Hunter',
            description: 'Slay the Ancient Dragon',
            type: 'boss',
            objectives: [
                { type: 'kill', monsterId: 'dragon', amount: 1, current: 0 }
            ],
            rewards: { exp: 25000, gold: 10000, items: [{ itemId: 'dragon_slayer', quantity: 1 }] },
            unlocked: false,
            prereq: 'lich_slayer',
            reqLevel: 60
        }
    };

    // Quest state
    let questState = {};
    let completedQuests = {};

    /**
     * Initialize quest state
     */
    function init() {
        for (const questId in questDefs) {
            if (!questState[questId]) {
                questState[questId] = {
                    status: questDefs[questId].unlocked ? 'available' : 'locked',
                    objectives: questDefs[questId].objectives.map(obj => ({ ...obj, current: 0 }))
                };
            }
        }
    }

    /**
     * Get quest by ID
     */
    function getQuest(questId) {
        const def = questDefs[questId];
        if (!def) return null;

        return {
            ...def,
            ...questState[questId],
            completed: !!completedQuests[questId]
        };
    }

    /**
     * Get all quests
     */
    function getAllQuests() {
        const result = [];
        for (const questId in questDefs) {
            result.push(getQuest(questId));
        }
        return result;
    }

    /**
     * Get available quests (unlocked and not completed)
     */
    function getAvailableQuests() {
        return getAllQuests().filter(q =>
            q.status === 'available' && !q.completed
        );
    }

    /**
     * Get active quests (in progress)
     */
    function getActiveQuests() {
        return getAllQuests().filter(q => q.status === 'active');
    }

    /**
     * Accept a quest
     */
    function acceptQuest(questId) {
        const quest = getQuest(questId);
        if (!quest || quest.status !== 'available' || quest.completed) {
            return false;
        }

        // Check level requirement
        const char = Character.getActive();
        if (quest.reqLevel && (!char || char.level < quest.reqLevel)) {
            return false;
        }

        questState[questId].status = 'active';
        return true;
    }

    /**
     * Update quest progress
     */
    function updateProgress(type, targetId, amount = 1) {
        const activeQuests = getActiveQuests();
        const updated = [];

        for (const quest of activeQuests) {
            let questUpdated = false;

            for (let i = 0; i < quest.objectives.length; i++) {
                const obj = quest.objectives[i];

                // Check if this objective matches
                let matches = false;
                if (type === 'kill' && obj.type === 'kill' && obj.monsterId === targetId) {
                    matches = true;
                } else if (type === 'gather' && obj.type === 'gather' && obj.itemId === targetId) {
                    matches = true;
                } else if (type === 'skill_level' && obj.type === 'skill_level' && obj.skillId === targetId) {
                    // For skill level, amount is the current level
                    questState[quest.id].objectives[i].current = amount;
                    questUpdated = true;
                    continue;
                }

                if (matches) {
                    questState[quest.id].objectives[i].current += amount;
                    questUpdated = true;
                }
            }

            if (questUpdated) {
                updated.push(quest.id);

                // Check if quest is complete
                const allComplete = questState[quest.id].objectives.every(
                    obj => obj.current >= obj.amount
                );

                if (allComplete) {
                    questState[quest.id].status = 'complete';
                }
            }
        }

        return updated;
    }

    /**
     * Complete a quest and claim rewards
     */
    function completeQuest(questId) {
        const quest = getQuest(questId);
        if (!quest || questState[questId].status !== 'complete') {
            return null;
        }

        const rewards = quest.rewards;

        // Give rewards
        if (rewards.exp) {
            const charIndex = Character.getAll().indexOf(Character.getActive());
            if (charIndex >= 0) {
                Character.addExp(charIndex, rewards.exp);
            }
        }

        if (rewards.gold) {
            Inventory.addGold(rewards.gold);
        }

        if (rewards.items) {
            for (const item of rewards.items) {
                Inventory.addItem(item.itemId, item.quantity);
            }
        }

        // Mark as completed
        completedQuests[questId] = true;
        questState[questId].status = 'completed';

        // Unlock dependent quests
        unlockDependentQuests(questId);

        return rewards;
    }

    /**
     * Unlock quests that depend on completed quest
     */
    function unlockDependentQuests(completedQuestId) {
        const unlocked = [];

        for (const questId in questDefs) {
            const quest = questDefs[questId];
            if (quest.prereq === completedQuestId && questState[questId].status === 'locked') {
                questState[questId].status = 'available';
                unlocked.push(questId);
            }
        }

        return unlocked;
    }

    /**
     * Check if a quest is completed
     */
    function isCompleted(questId) {
        return !!completedQuests[questId];
    }

    /**
     * Get completion count
     */
    function getCompletionCount() {
        return Object.keys(completedQuests).length;
    }

    /**
     * Get state for saving
     */
    function getState() {
        return {
            questState,
            completedQuests
        };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state) {
            questState = state.questState || {};
            completedQuests = state.completedQuests || {};
        }
        init(); // Ensure all quests have state
    }

    /**
     * Reset
     */
    function reset() {
        questState = {};
        completedQuests = {};
        init();
    }

    // Initialize on load
    init();

    // Public API
    return {
        getQuest,
        getAllQuests,
        getAvailableQuests,
        getActiveQuests,
        acceptQuest,
        updateProgress,
        completeQuest,
        isCompleted,
        getCompletionCount,
        getState,
        loadState,
        reset
    };
})();
