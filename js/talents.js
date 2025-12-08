/**
 * Talents Module
 * Talent trees for permanent character upgrades
 */

const Talents = (function() {
    // Talent tree definitions - organized by tab
    const talentTrees = {
        combat: {
            id: 'combat',
            name: 'Combat',
            icon: '⚔️',
            talents: {
                power_strike: {
                    id: 'power_strike',
                    name: 'Power Strike',
                    icon: '💪',
                    description: '+5% damage per level',
                    maxLevel: 20,
                    effect: { type: 'damage_mult', value: 0.05 },
                    cost: (level) => Math.floor(1 + level * 0.5),
                    row: 0, col: 1,
                    prereq: null
                },
                quick_reflexes: {
                    id: 'quick_reflexes',
                    name: 'Quick Reflexes',
                    icon: '⚡',
                    description: '-3% attack cooldown per level',
                    maxLevel: 15,
                    effect: { type: 'attack_speed', value: 0.03 },
                    cost: (level) => Math.floor(1 + level * 0.5),
                    row: 0, col: 2,
                    prereq: null
                },
                thick_skin: {
                    id: 'thick_skin',
                    name: 'Thick Skin',
                    icon: '🛡️',
                    description: '+10 max HP per level',
                    maxLevel: 25,
                    effect: { type: 'max_hp', value: 10 },
                    cost: (level) => Math.floor(1 + level * 0.5),
                    row: 0, col: 0,
                    prereq: null
                },
                critical_eye: {
                    id: 'critical_eye',
                    name: 'Critical Eye',
                    icon: '🎯',
                    description: '+1% crit chance per level',
                    maxLevel: 15,
                    effect: { type: 'crit_chance', value: 0.01 },
                    cost: (level) => Math.floor(2 + level),
                    row: 1, col: 1,
                    prereq: 'power_strike'
                },
                berserker: {
                    id: 'berserker',
                    name: 'Berserker',
                    icon: '😤',
                    description: '+10% damage when below 50% HP',
                    maxLevel: 10,
                    effect: { type: 'berserker', value: 0.1 },
                    cost: (level) => Math.floor(3 + level * 1.5),
                    row: 2, col: 1,
                    prereq: 'critical_eye'
                }
            }
        },
        gathering: {
            id: 'gathering',
            name: 'Gathering',
            icon: '⛏️',
            talents: {
                efficient_mining: {
                    id: 'efficient_mining',
                    name: 'Efficient Mining',
                    icon: '⛏️',
                    description: '+5% mining speed per level',
                    maxLevel: 20,
                    effect: { type: 'mining_speed', value: 0.05 },
                    cost: (level) => Math.floor(1 + level * 0.5),
                    row: 0, col: 0,
                    prereq: null
                },
                sharp_axe: {
                    id: 'sharp_axe',
                    name: 'Sharp Axe',
                    icon: '🪓',
                    description: '+5% woodcutting speed per level',
                    maxLevel: 20,
                    effect: { type: 'woodcutting_speed', value: 0.05 },
                    cost: (level) => Math.floor(1 + level * 0.5),
                    row: 0, col: 1,
                    prereq: null
                },
                lucky_catch: {
                    id: 'lucky_catch',
                    name: 'Lucky Catch',
                    icon: '🎣',
                    description: '+5% fishing speed per level',
                    maxLevel: 20,
                    effect: { type: 'fishing_speed', value: 0.05 },
                    cost: (level) => Math.floor(1 + level * 0.5),
                    row: 0, col: 2,
                    prereq: null
                },
                double_ore: {
                    id: 'double_ore',
                    name: 'Double Ore',
                    icon: '💎',
                    description: '+2% chance for double resources',
                    maxLevel: 15,
                    effect: { type: 'double_gather', value: 0.02 },
                    cost: (level) => Math.floor(2 + level),
                    row: 1, col: 1,
                    prereq: 'sharp_axe'
                },
                rare_finder: {
                    id: 'rare_finder',
                    name: 'Rare Finder',
                    icon: '🌟',
                    description: '+3% rare resource chance per level',
                    maxLevel: 10,
                    effect: { type: 'rare_chance', value: 0.03 },
                    cost: (level) => Math.floor(3 + level * 1.5),
                    row: 2, col: 1,
                    prereq: 'double_ore'
                }
            }
        },
        misc: {
            id: 'misc',
            name: 'Miscellaneous',
            icon: '✨',
            talents: {
                exp_boost: {
                    id: 'exp_boost',
                    name: 'EXP Boost',
                    icon: '📈',
                    description: '+3% experience gain per level',
                    maxLevel: 20,
                    effect: { type: 'exp_mult', value: 0.03 },
                    cost: (level) => Math.floor(2 + level),
                    row: 0, col: 0,
                    prereq: null
                },
                gold_digger: {
                    id: 'gold_digger',
                    name: 'Gold Digger',
                    icon: '💰',
                    description: '+5% gold from monsters per level',
                    maxLevel: 20,
                    effect: { type: 'gold_mult', value: 0.05 },
                    cost: (level) => Math.floor(2 + level),
                    row: 0, col: 1,
                    prereq: null
                },
                drop_rate: {
                    id: 'drop_rate',
                    name: 'Treasure Hunter',
                    icon: '🎁',
                    description: '+2% item drop rate per level',
                    maxLevel: 15,
                    effect: { type: 'drop_rate', value: 0.02 },
                    cost: (level) => Math.floor(3 + level * 1.5),
                    row: 0, col: 2,
                    prereq: null
                },
                quick_learner: {
                    id: 'quick_learner',
                    name: 'Quick Learner',
                    icon: '📚',
                    description: '+5% skill exp gain per level',
                    maxLevel: 15,
                    effect: { type: 'skill_exp_mult', value: 0.05 },
                    cost: (level) => Math.floor(2 + level),
                    row: 1, col: 1,
                    prereq: 'exp_boost'
                }
            }
        }
    };

    // Per-character talent points and allocations
    let characterTalents = {};

    /**
     * Initialize talents for a character
     */
    function initCharacter(charId) {
        if (!characterTalents[charId]) {
            characterTalents[charId] = {
                points: 0,
                allocated: {}
            };
        }
    }

    /**
     * Get talent points for character
     */
    function getPoints(charId) {
        initCharacter(charId);
        return characterTalents[charId].points;
    }

    /**
     * Add talent points (gained on level up)
     */
    function addPoints(charId, amount) {
        initCharacter(charId);
        characterTalents[charId].points += amount;
    }

    /**
     * Get talent level for character
     */
    function getTalentLevel(charId, talentId) {
        initCharacter(charId);
        return characterTalents[charId].allocated[talentId] || 0;
    }

    /**
     * Allocate a talent point
     */
    function allocate(charId, treeId, talentId) {
        initCharacter(charId);

        const tree = talentTrees[treeId];
        if (!tree) return false;

        const talent = tree.talents[talentId];
        if (!talent) return false;

        const currentLevel = getTalentLevel(charId, talentId);
        if (currentLevel >= talent.maxLevel) return false;

        const cost = talent.cost(currentLevel);
        if (characterTalents[charId].points < cost) return false;

        // Check prerequisite
        if (talent.prereq) {
            const prereqLevel = getTalentLevel(charId, talent.prereq);
            if (prereqLevel < 1) return false;
        }

        // Spend points and allocate
        characterTalents[charId].points -= cost;
        characterTalents[charId].allocated[talentId] = currentLevel + 1;

        return true;
    }

    /**
     * Get all talent trees
     */
    function getTrees() {
        return talentTrees;
    }

    /**
     * Get talent bonuses for a character
     */
    function getBonuses(charId) {
        initCharacter(charId);

        const bonuses = {
            damage_mult: 1,
            attack_speed: 1,
            max_hp: 0,
            crit_chance: 0,
            berserker: 0,
            mining_speed: 1,
            woodcutting_speed: 1,
            fishing_speed: 1,
            double_gather: 0,
            rare_chance: 0,
            exp_mult: 1,
            gold_mult: 1,
            drop_rate: 1,
            skill_exp_mult: 1
        };

        for (const treeId in talentTrees) {
            const tree = talentTrees[treeId];
            for (const talentId in tree.talents) {
                const talent = tree.talents[talentId];
                const level = getTalentLevel(charId, talentId);

                if (level > 0) {
                    const effect = talent.effect;
                    if (effect.type.includes('mult') || effect.type.includes('speed') || effect.type === 'drop_rate') {
                        bonuses[effect.type] += effect.value * level;
                    } else {
                        bonuses[effect.type] += effect.value * level;
                    }
                }
            }
        }

        return bonuses;
    }

    /**
     * Get total allocated points for character
     */
    function getTotalAllocated(charId) {
        initCharacter(charId);

        let total = 0;
        for (const talentId in characterTalents[charId].allocated) {
            const level = characterTalents[charId].allocated[talentId];
            // Sum up cost of all levels
            for (let i = 0; i < level; i++) {
                // Find the talent
                for (const treeId in talentTrees) {
                    if (talentTrees[treeId].talents[talentId]) {
                        total += talentTrees[treeId].talents[talentId].cost(i);
                        break;
                    }
                }
            }
        }
        return total;
    }

    /**
     * Get state for saving
     */
    function getState() {
        return { characterTalents };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state && state.characterTalents) {
            characterTalents = state.characterTalents;
        }
    }

    /**
     * Reset
     */
    function reset() {
        characterTalents = {};
    }

    // Public API
    return {
        initCharacter,
        getPoints,
        addPoints,
        getTalentLevel,
        allocate,
        getTrees,
        getBonuses,
        getTotalAllocated,
        getState,
        loadState,
        reset
    };
})();
