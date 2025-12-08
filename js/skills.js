/**
 * Skills Module
 * IdleOn-style skills that level up through use
 */

const Skills = (function() {
    // Skill definitions
    const skillDefs = {
        mining: {
            id: 'mining',
            name: 'Mining',
            icon: '⛏️',
            description: 'Extract ores and gems from rocks',
            statBonus: 'str',
            color: '#795548',
            resources: ['copper_ore', 'iron_ore', 'gold_ore', 'crystal_shard', 'diamond']
        },
        woodcutting: {
            id: 'woodcutting',
            name: 'Woodcutting',
            icon: '🪓',
            description: 'Chop down trees for wood',
            statBonus: 'str',
            color: '#4caf50',
            resources: ['oak_log', 'maple_log', 'birch_log', 'ancient_log']
        },
        fishing: {
            id: 'fishing',
            name: 'Fishing',
            icon: '🎣',
            description: 'Catch fish from various waters',
            statBonus: 'luk',
            color: '#2196f3',
            resources: ['small_fish', 'bass', 'salmon', 'golden_fish', 'legendary_catch']
        },
        combat: {
            id: 'combat',
            name: 'Combat',
            icon: '⚔️',
            description: 'Fight monsters for loot and exp',
            statBonus: 'str',
            color: '#f44336',
            resources: ['monster_parts', 'rare_drops']
        },
        smithing: {
            id: 'smithing',
            name: 'Smithing',
            icon: '🔨',
            description: 'Craft weapons and armor from metals',
            statBonus: 'str',
            color: '#ff5722',
            resources: ['bronze_bar', 'iron_bar', 'steel_bar', 'mythril_bar']
        },
        alchemy: {
            id: 'alchemy',
            name: 'Alchemy',
            icon: '⚗️',
            description: 'Brew potions and elixirs',
            statBonus: 'wis',
            color: '#9c27b0',
            resources: ['health_potion', 'mana_potion', 'exp_potion', 'power_elixir']
        },
        crafting: {
            id: 'crafting',
            name: 'Crafting',
            icon: '🔧',
            description: 'Create tools and equipment',
            statBonus: 'agi',
            color: '#607d8b',
            resources: ['basic_tool', 'improved_tool', 'master_tool']
        },
        enchanting: {
            id: 'enchanting',
            name: 'Enchanting',
            icon: '✨',
            description: 'Imbue items with magical properties',
            statBonus: 'wis',
            color: '#e91e63',
            resources: ['enchant_scroll', 'magic_essence']
        }
    };

    // Per-character skill data
    let characterSkills = {};

    /**
     * Initialize skills for a character
     */
    function initCharacter(charId) {
        if (!characterSkills[charId]) {
            characterSkills[charId] = {};
            for (const skillId in skillDefs) {
                characterSkills[charId][skillId] = {
                    level: 1,
                    exp: 0,
                    expToLevel: 100,
                    totalExp: 0
                };
            }
        }
    }

    /**
     * Get skill data for a character
     */
    function getSkill(charId, skillId) {
        initCharacter(charId);
        return characterSkills[charId][skillId];
    }

    /**
     * Get all skills for a character
     */
    function getAllSkills(charId) {
        initCharacter(charId);
        return characterSkills[charId];
    }

    /**
     * Calculate exp needed for skill level
     */
    function expForLevel(level) {
        return Math.floor(100 * Math.pow(1.4, level - 1));
    }

    /**
     * Add experience to a skill
     */
    function addExp(charId, skillId, amount) {
        initCharacter(charId);

        const skill = characterSkills[charId][skillId];
        if (!skill) return false;

        // Get character efficiency bonus
        const char = Character.getAll().find(c => c.id === charId);
        const charIndex = Character.getAll().indexOf(char);
        const efficiency = charIndex >= 0 ? Character.getSkillEfficiency(charIndex, skillId) : 1;

        const finalExp = Math.floor(amount * efficiency);
        skill.exp += finalExp;
        skill.totalExp += finalExp;

        // Check for level up
        while (skill.exp >= skill.expToLevel && skill.level < 100) {
            skill.exp -= skill.expToLevel;
            skill.level++;
            skill.expToLevel = expForLevel(skill.level);
        }

        return finalExp;
    }

    /**
     * Get skill efficiency (affects resource gathering speed)
     */
    function getEfficiency(charId, skillId) {
        const skill = getSkill(charId, skillId);
        if (!skill) return 1;

        // Higher level = faster gathering
        return 1 + (skill.level - 1) * 0.05;
    }

    /**
     * Get resource yield bonus (affects amount gathered)
     */
    function getYieldBonus(charId, skillId) {
        const skill = getSkill(charId, skillId);
        if (!skill) return 1;

        // Every 10 levels gives 10% more resources
        return 1 + Math.floor(skill.level / 10) * 0.1;
    }

    /**
     * Get chance for rare resources
     */
    function getRareChance(charId, skillId) {
        const skill = getSkill(charId, skillId);
        if (!skill) return 0.01;

        // Base 1% + 0.5% per 10 levels
        return 0.01 + Math.floor(skill.level / 10) * 0.005;
    }

    /**
     * Get skill definitions
     */
    function getSkillDefs() {
        return skillDefs;
    }

    /**
     * Get skill definition by ID
     */
    function getSkillDef(skillId) {
        return skillDefs[skillId] || null;
    }

    /**
     * Get highest skill level across all characters
     */
    function getHighestLevel(skillId) {
        let highest = 0;
        for (const charId in characterSkills) {
            if (characterSkills[charId][skillId]) {
                highest = Math.max(highest, characterSkills[charId][skillId].level);
            }
        }
        return highest;
    }

    /**
     * Get total skill levels for a character
     */
    function getTotalLevels(charId) {
        initCharacter(charId);
        let total = 0;
        for (const skillId in characterSkills[charId]) {
            total += characterSkills[charId][skillId].level;
        }
        return total;
    }

    /**
     * Get state for saving
     */
    function getState() {
        return { characterSkills };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state && state.characterSkills) {
            characterSkills = state.characterSkills;
        }
    }

    /**
     * Reset
     */
    function reset() {
        characterSkills = {};
    }

    // Public API
    return {
        initCharacter,
        getSkill,
        getAllSkills,
        addExp,
        getEfficiency,
        getYieldBonus,
        getRareChance,
        getSkillDefs,
        getSkillDef,
        getHighestLevel,
        getTotalLevels,
        getState,
        loadState,
        reset
    };
})();
