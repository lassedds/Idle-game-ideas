/**
 * Character Module
 * Handles character creation, stats, classes, and leveling
 */

const Character = (function() {
    // Class definitions
    const classes = {
        warrior: {
            id: 'warrior',
            name: 'Warrior',
            icon: '⚔️',
            description: 'Strong melee fighter with high HP',
            baseStats: { str: 8, agi: 4, wis: 2, luk: 3 },
            statGrowth: { str: 3, agi: 1.5, wis: 0.5, luk: 1 },
            skills: ['mining', 'combat', 'smithing'],
            color: '#e74c3c'
        },
        mage: {
            id: 'mage',
            name: 'Mage',
            icon: '🔮',
            description: 'Powerful spellcaster with high mana',
            baseStats: { str: 2, agi: 3, wis: 8, luk: 4 },
            statGrowth: { str: 0.5, agi: 1, wis: 3, luk: 1.5 },
            skills: ['alchemy', 'combat', 'enchanting'],
            color: '#9b59b6'
        },
        archer: {
            id: 'archer',
            name: 'Archer',
            icon: '🏹',
            description: 'Swift ranged attacker with high crit',
            baseStats: { str: 4, agi: 8, wis: 3, luk: 5 },
            statGrowth: { str: 1.5, agi: 3, wis: 1, luk: 2 },
            skills: ['woodcutting', 'combat', 'crafting'],
            color: '#27ae60'
        },
        beginner: {
            id: 'beginner',
            name: 'Beginner',
            icon: '👤',
            description: 'Jack of all trades, master of none',
            baseStats: { str: 4, agi: 4, wis: 4, luk: 5 },
            statGrowth: { str: 1.5, agi: 1.5, wis: 1.5, luk: 2 },
            skills: ['mining', 'woodcutting', 'fishing'],
            color: '#95a5a6'
        }
    };

    // Character slots (can have multiple characters like IdleOn)
    let characters = [];
    let activeCharacterIndex = 0;
    const MAX_CHARACTERS = 6;

    /**
     * Create a new character
     */
    function createCharacter(name, classId) {
        if (characters.length >= MAX_CHARACTERS) {
            return null;
        }

        const charClass = classes[classId] || classes.beginner;

        const character = {
            id: Date.now().toString(),
            name: name,
            class: classId,
            level: 1,
            exp: 0,
            expToLevel: 100,

            // Base stats from class
            baseStats: { ...charClass.baseStats },

            // Current calculated stats (base + gear + buffs)
            stats: { ...charClass.baseStats },

            // HP and MP
            maxHp: 100 + charClass.baseStats.str * 10,
            hp: 100 + charClass.baseStats.str * 10,
            maxMp: 50 + charClass.baseStats.wis * 5,
            mp: 50 + charClass.baseStats.wis * 5,

            // Equipment slots
            equipment: {
                weapon: null,
                helmet: null,
                armor: null,
                gloves: null,
                boots: null,
                ring: null,
                amulet: null
            },

            // Current activity
            activity: null,      // 'mining', 'combat', 'fishing', etc.
            activityZone: null,  // Which zone they're in
            activityProgress: 0,

            // Timestamps
            createdAt: Date.now(),
            playTime: 0
        };

        characters.push(character);

        if (characters.length === 1) {
            activeCharacterIndex = 0;
        }

        return character;
    }

    /**
     * Get active character
     */
    function getActive() {
        return characters[activeCharacterIndex] || null;
    }

    /**
     * Set active character
     */
    function setActive(index) {
        if (index >= 0 && index < characters.length) {
            activeCharacterIndex = index;
            return true;
        }
        return false;
    }

    /**
     * Get all characters
     */
    function getAll() {
        return characters;
    }

    /**
     * Get character by index
     */
    function getByIndex(index) {
        return characters[index] || null;
    }

    /**
     * Calculate experience needed for level
     * MapleStory-style harsh scaling - early levels are quick,
     * but later levels require exponentially more exp
     */
    function expForLevel(level) {
        // Base exp with polynomial growth like MapleStory
        // Level 1-10: Quick progression to get started
        // Level 11-30: Moderate grind
        // Level 31-50: Serious grind
        // Level 51+: End-game dedication required
        if (level <= 10) {
            return Math.floor(50 * Math.pow(level, 1.8));
        } else if (level <= 30) {
            return Math.floor(50 * Math.pow(10, 1.8) + (level - 10) * 500 * Math.pow(1.15, level - 10));
        } else if (level <= 50) {
            const base30 = 50 * Math.pow(10, 1.8) + 20 * 500 * Math.pow(1.15, 20);
            return Math.floor(base30 + (level - 30) * 5000 * Math.pow(1.2, level - 30));
        } else {
            const base30 = 50 * Math.pow(10, 1.8) + 20 * 500 * Math.pow(1.15, 20);
            const base50 = base30 + 20 * 5000 * Math.pow(1.2, 20);
            return Math.floor(base50 + (level - 50) * 50000 * Math.pow(1.25, level - 50));
        }
    }

    /**
     * Add experience to character
     */
    function addExp(charIndex, amount) {
        const char = characters[charIndex];
        if (!char) return false;

        char.exp += amount;

        // Check for level up
        while (char.exp >= char.expToLevel) {
            char.exp -= char.expToLevel;
            levelUp(charIndex);
        }

        return true;
    }

    /**
     * Level up a character
     */
    function levelUp(charIndex) {
        const char = characters[charIndex];
        if (!char) return false;

        const charClass = classes[char.class];

        char.level++;
        char.expToLevel = expForLevel(char.level);

        // Apply stat growth
        char.baseStats.str += charClass.statGrowth.str;
        char.baseStats.agi += charClass.statGrowth.agi;
        char.baseStats.wis += charClass.statGrowth.wis;
        char.baseStats.luk += charClass.statGrowth.luk;

        // Recalculate derived stats
        recalculateStats(charIndex);

        // Heal to full on level up
        char.hp = char.maxHp;
        char.mp = char.maxMp;

        // Grant talent point every 5 levels
        if (char.level % 5 === 0 && typeof Talents !== 'undefined') {
            Talents.addPoints(char.id, 1);
        }

        // Trigger UI update for character slots
        if (typeof UI !== 'undefined' && UI.renderCharacterSlots) {
            UI.renderCharacterSlots();
        }

        return true;
    }

    /**
     * Recalculate all stats including equipment bonuses
     */
    function recalculateStats(charIndex) {
        const char = characters[charIndex];
        if (!char) return;

        // Start with base stats
        char.stats = { ...char.baseStats };

        // Add equipment bonuses
        if (typeof Inventory !== 'undefined') {
            for (const slot in char.equipment) {
                const itemId = char.equipment[slot];
                if (itemId) {
                    const item = Inventory.getItemDef(itemId);
                    if (item && item.stats) {
                        for (const stat in item.stats) {
                            char.stats[stat] = (char.stats[stat] || 0) + item.stats[stat];
                        }
                    }
                }
            }
        }

        // Calculate derived stats
        char.maxHp = 100 + Math.floor(char.stats.str * 10) + (char.level - 1) * 20;
        char.maxMp = 50 + Math.floor(char.stats.wis * 5) + (char.level - 1) * 10;

        // Cap current HP/MP
        char.hp = Math.min(char.hp, char.maxHp);
        char.mp = Math.min(char.mp, char.maxMp);
    }

    /**
     * Set character activity
     */
    function setActivity(charIndex, activity, zone = null) {
        const char = characters[charIndex];
        if (!char) return false;

        char.activity = activity;
        char.activityZone = zone;
        char.activityProgress = 0;

        return true;
    }

    /**
     * Get combat power (used for damage calculations)
     */
    function getCombatPower(charIndex) {
        const char = characters[charIndex];
        if (!char) return 0;

        const charClass = classes[char.class];
        let power = 0;

        // Different classes scale differently
        switch (char.class) {
            case 'warrior':
                power = char.stats.str * 2 + char.stats.agi * 0.5;
                break;
            case 'mage':
                power = char.stats.wis * 2 + char.stats.agi * 0.5;
                break;
            case 'archer':
                power = char.stats.agi * 1.5 + char.stats.str * 0.5 + char.stats.luk * 0.5;
                break;
            default:
                power = (char.stats.str + char.stats.agi + char.stats.wis) / 2;
        }

        return Math.floor(power + char.level * 2);
    }

    /**
     * Get critical chance (based on luck)
     */
    function getCritChance(charIndex) {
        const char = characters[charIndex];
        if (!char) return 0.05;

        return Math.min(0.5, 0.05 + char.stats.luk * 0.01);
    }

    /**
     * Get skill efficiency bonus
     */
    function getSkillEfficiency(charIndex, skillId) {
        const char = characters[charIndex];
        if (!char) return 1;

        const charClass = classes[char.class];

        // Classes get bonus to their preferred skills
        if (charClass.skills.includes(skillId)) {
            return 1.25 + char.level * 0.02;
        }

        return 1 + char.level * 0.01;
    }

    /**
     * Heal character
     */
    function heal(charIndex, amount) {
        const char = characters[charIndex];
        if (!char) return 0;

        const healed = Math.min(amount, char.maxHp - char.hp);
        char.hp += healed;
        return healed;
    }

    /**
     * Damage character
     */
    function damage(charIndex, amount) {
        const char = characters[charIndex];
        if (!char) return false;

        char.hp = Math.max(0, char.hp - amount);
        return char.hp > 0;
    }

    /**
     * Check if character is alive
     */
    function isAlive(charIndex) {
        const char = characters[charIndex];
        return char && char.hp > 0;
    }

    /**
     * Respawn character (restore HP but lose some progress)
     */
    function respawn(charIndex) {
        const char = characters[charIndex];
        if (!char) return false;

        char.hp = Math.floor(char.maxHp * 0.5);
        char.mp = Math.floor(char.maxMp * 0.5);
        char.activity = null;
        char.activityZone = null;
        char.activityProgress = 0;

        return true;
    }

    /**
     * Get class definitions
     */
    function getClasses() {
        return classes;
    }

    /**
     * Get class by ID
     */
    function getClass(classId) {
        return classes[classId] || null;
    }

    /**
     * Get multi-character bonuses based on total characters
     * More characters = better bonuses for everyone
     */
    function getMultiCharBonuses() {
        const count = characters.length;
        return {
            expBonus: 1 + (count - 1) * 0.05,       // +5% EXP per extra character
            goldBonus: 1 + (count - 1) * 0.03,     // +3% gold per extra character
            dropBonus: 1 + (count - 1) * 0.02,     // +2% drop rate per extra character
            skillExpBonus: 1 + (count - 1) * 0.04, // +4% skill exp per extra character
            afkEfficiency: 0.2 + count * 0.05      // Base 20% + 5% per character for AFK
        };
    }

    /**
     * Get AFK income for inactive characters
     * Each inactive character earns resources at reduced rate
     */
    function processAfkIncome(deltaTime) {
        const bonuses = getMultiCharBonuses();
        const afkResults = [];

        characters.forEach((char, index) => {
            // Skip active character
            if (index === activeCharacterIndex) return;

            // If character has an activity set, process AFK income
            if (char.activity && char.activityZone) {
                const zone = World.getZone(char.activityZone);
                if (!zone) return;

                const activity = zone.activities.find(a => a.type === char.activity);
                if (!activity) return;

                // AFK efficiency is reduced
                const efficiency = bonuses.afkEfficiency * Skills.getEfficiency(char.id, char.activity);
                const timePerAction = activity.timePerAction || 3;
                const progressPerSecond = efficiency / timePerAction;

                char.activityProgress = (char.activityProgress || 0) + progressPerSecond * deltaTime;

                // Check if action completed
                if (char.activityProgress >= 1) {
                    char.activityProgress = 0;

                    if (char.activity === 'combat') {
                        // AFK combat gives reduced gold and exp, no drops
                        const monster = World.getRandomMonster(char.activityZone);
                        if (monster) {
                            const goldEarned = Math.floor(monster.gold * 0.5 * bonuses.goldBonus);
                            const expEarned = Math.floor(monster.exp * 0.3 * bonuses.expBonus);
                            Inventory.addGold(goldEarned);
                            addExp(index, expEarned);
                            afkResults.push({
                                charName: char.name,
                                type: 'combat',
                                gold: goldEarned,
                                exp: expEarned
                            });
                        }
                    } else if (activity.resource) {
                        // AFK gathering gives reduced resources
                        const yieldBonus = Skills.getYieldBonus(char.id, char.activity);
                        const baseAmount = Math.floor(yieldBonus * 0.5);
                        const amount = Math.max(1, baseAmount);

                        // 50% chance to get resource per action
                        if (Math.random() < 0.5) {
                            Inventory.addItem(activity.resource, amount);
                            Skills.addExp(char.id, char.activity, Math.floor((activity.expPerAction || 10) * 0.5 * bonuses.skillExpBonus));
                            afkResults.push({
                                charName: char.name,
                                type: char.activity,
                                resource: activity.resource,
                                amount: amount
                            });
                        }
                    }
                }
            }
        });

        return afkResults;
    }

    /**
     * Set AFK activity for a character
     */
    function setAfkActivity(charIndex, activity, zone) {
        const char = characters[charIndex];
        if (!char || charIndex === activeCharacterIndex) return false;

        char.activity = activity;
        char.activityZone = zone;
        char.activityProgress = 0;
        return true;
    }

    /**
     * Get state for saving
     */
    function getState() {
        return {
            characters: characters,
            activeIndex: activeCharacterIndex
        };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state) {
            characters = state.characters || [];
            activeCharacterIndex = state.activeIndex || 0;

            // Recalculate all stats
            characters.forEach((_, i) => recalculateStats(i));
        }
    }

    /**
     * Reset
     */
    function reset() {
        characters = [];
        activeCharacterIndex = 0;
    }

    // Public API
    return {
        createCharacter,
        getActive,
        setActive,
        getAll,
        getByIndex,
        addExp,
        levelUp,
        recalculateStats,
        setActivity,
        getCombatPower,
        getCritChance,
        getSkillEfficiency,
        heal,
        damage,
        isAlive,
        respawn,
        getClasses,
        getClass,
        getMultiCharBonuses,
        processAfkIncome,
        setAfkActivity,
        getState,
        loadState,
        reset,
        MAX_CHARACTERS
    };
})();
