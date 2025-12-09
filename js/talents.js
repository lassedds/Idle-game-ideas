/**
 * Talents Module
 * Redesigned talent trees with build variety and specialization lanes
 * Players can focus on one or two paths but cannot max everything
 */

const Talents = (function() {
    // Talent tree definitions - 4 main paths with branching specializations
    const talentTrees = {
        warrior: {
            id: 'warrior',
            name: 'Warrior',
            icon: '⚔️',
            description: 'Master of physical combat',
            color: '#e53935',
            // 3 lanes within this tree
            lanes: {
                berserker: {
                    id: 'berserker',
                    name: 'Berserker',
                    description: 'Raw damage and fury',
                    talents: [
                        {
                            id: 'raw_power', name: 'Raw Power', icon: '💪',
                            description: '+4% physical damage per level',
                            maxLevel: 25, effect: { type: 'phys_damage', value: 0.04 },
                            row: 0, prereq: null
                        },
                        {
                            id: 'bloodlust', name: 'Bloodlust', icon: '🩸',
                            description: '+2% damage when below 50% HP per level',
                            maxLevel: 20, effect: { type: 'low_hp_damage', value: 0.02 },
                            row: 1, prereq: 'raw_power'
                        },
                        {
                            id: 'frenzy', name: 'Frenzy', icon: '😤',
                            description: '+3% attack speed per level',
                            maxLevel: 15, effect: { type: 'attack_speed', value: 0.03 },
                            row: 2, prereq: 'bloodlust'
                        },
                        {
                            id: 'unstoppable', name: 'Unstoppable', icon: '🔥',
                            description: '+5% damage, -5% defense per level (risky!)',
                            maxLevel: 10, effect: { type: 'glass_cannon', value: 0.05 },
                            row: 3, prereq: 'frenzy'
                        }
                    ]
                },
                guardian: {
                    id: 'guardian',
                    name: 'Guardian',
                    description: 'Defensive mastery',
                    talents: [
                        {
                            id: 'iron_skin', name: 'Iron Skin', icon: '🛡️',
                            description: '+15 defense per level',
                            maxLevel: 25, effect: { type: 'defense', value: 15 },
                            row: 0, prereq: null
                        },
                        {
                            id: 'vitality', name: 'Vitality', icon: '❤️',
                            description: '+25 max HP per level',
                            maxLevel: 20, effect: { type: 'max_hp', value: 25 },
                            row: 1, prereq: 'iron_skin'
                        },
                        {
                            id: 'regeneration', name: 'Regeneration', icon: '💚',
                            description: '+1 HP regen per second per level',
                            maxLevel: 15, effect: { type: 'hp_regen', value: 1 },
                            row: 2, prereq: 'vitality'
                        },
                        {
                            id: 'last_stand', name: 'Last Stand', icon: '🏴',
                            description: 'Survive fatal blow with 1 HP (cooldown reduces per level)',
                            maxLevel: 5, effect: { type: 'last_stand', value: 1 },
                            row: 3, prereq: 'regeneration'
                        }
                    ]
                },
                weaponmaster: {
                    id: 'weaponmaster',
                    name: 'Weaponmaster',
                    description: 'Critical strikes and precision',
                    talents: [
                        {
                            id: 'keen_eye', name: 'Keen Eye', icon: '👁️',
                            description: '+1.5% critical chance per level',
                            maxLevel: 25, effect: { type: 'crit_chance', value: 0.015 },
                            row: 0, prereq: null
                        },
                        {
                            id: 'deadly_strikes', name: 'Deadly Strikes', icon: '⚡',
                            description: '+10% critical damage per level',
                            maxLevel: 20, effect: { type: 'crit_damage', value: 0.1 },
                            row: 1, prereq: 'keen_eye'
                        },
                        {
                            id: 'armor_pierce', name: 'Armor Pierce', icon: '🗡️',
                            description: 'Ignore 2% enemy defense per level',
                            maxLevel: 15, effect: { type: 'armor_pen', value: 0.02 },
                            row: 2, prereq: 'deadly_strikes'
                        },
                        {
                            id: 'execute', name: 'Execute', icon: '💀',
                            description: 'Deal 5% more damage to enemies below 25% HP per level',
                            maxLevel: 10, effect: { type: 'execute', value: 0.05 },
                            row: 3, prereq: 'armor_pierce'
                        }
                    ]
                }
            }
        },

        mage: {
            id: 'mage',
            name: 'Mage',
            icon: '🧙',
            description: 'Master of arcane arts',
            color: '#7b1fa2',
            lanes: {
                elementalist: {
                    id: 'elementalist',
                    name: 'Elementalist',
                    description: 'Elemental damage mastery',
                    talents: [
                        {
                            id: 'arcane_power', name: 'Arcane Power', icon: '✨',
                            description: '+5% magic damage per level',
                            maxLevel: 25, effect: { type: 'magic_damage', value: 0.05 },
                            row: 0, prereq: null
                        },
                        {
                            id: 'spell_crit', name: 'Spell Crit', icon: '💫',
                            description: '+1.5% spell critical chance per level',
                            maxLevel: 20, effect: { type: 'spell_crit', value: 0.015 },
                            row: 1, prereq: 'arcane_power'
                        },
                        {
                            id: 'elemental_fury', name: 'Elemental Fury', icon: '🌪️',
                            description: '+8% elemental damage per level',
                            maxLevel: 15, effect: { type: 'elemental_damage', value: 0.08 },
                            row: 2, prereq: 'spell_crit'
                        },
                        {
                            id: 'meteor_strike', name: 'Meteor Strike', icon: '☄️',
                            description: 'Chance to deal massive bonus damage per level',
                            maxLevel: 10, effect: { type: 'meteor', value: 0.02 },
                            row: 3, prereq: 'elemental_fury'
                        }
                    ]
                },
                enchanter: {
                    id: 'enchanter',
                    name: 'Enchanter',
                    description: 'Mana and utility',
                    talents: [
                        {
                            id: 'mana_well', name: 'Mana Well', icon: '💧',
                            description: '+20 max MP per level',
                            maxLevel: 25, effect: { type: 'max_mp', value: 20 },
                            row: 0, prereq: null
                        },
                        {
                            id: 'mana_regen', name: 'Mana Regen', icon: '🔵',
                            description: '+1 MP regen per second per level',
                            maxLevel: 20, effect: { type: 'mp_regen', value: 1 },
                            row: 1, prereq: 'mana_well'
                        },
                        {
                            id: 'spell_echo', name: 'Spell Echo', icon: '🔊',
                            description: 'Chance to cast spell twice per level',
                            maxLevel: 10, effect: { type: 'spell_echo', value: 0.02 },
                            row: 2, prereq: 'mana_regen'
                        },
                        {
                            id: 'enchant_weapons', name: 'Enchant Weapons', icon: '⚗️',
                            description: '+5% bonus to crafted item stats per level',
                            maxLevel: 10, effect: { type: 'craft_bonus', value: 0.05 },
                            row: 3, prereq: 'spell_echo'
                        }
                    ]
                },
                scholar: {
                    id: 'scholar',
                    name: 'Scholar',
                    description: 'Wisdom and learning',
                    talents: [
                        {
                            id: 'quick_study', name: 'Quick Study', icon: '📚',
                            description: '+4% experience gain per level',
                            maxLevel: 25, effect: { type: 'exp_mult', value: 0.04 },
                            row: 0, prereq: null
                        },
                        {
                            id: 'skill_mastery', name: 'Skill Mastery', icon: '📖',
                            description: '+5% skill experience per level',
                            maxLevel: 20, effect: { type: 'skill_exp_mult', value: 0.05 },
                            row: 1, prereq: 'quick_study'
                        },
                        {
                            id: 'knowledge_is_power', name: 'Knowledge Power', icon: '🎓',
                            description: '+1% damage per 5 skill levels total',
                            maxLevel: 10, effect: { type: 'skill_power', value: 0.01 },
                            row: 2, prereq: 'skill_mastery'
                        },
                        {
                            id: 'enlightenment', name: 'Enlightenment', icon: '💡',
                            description: '+1 talent point every 10 levels (retroactive)',
                            maxLevel: 5, effect: { type: 'bonus_talent_points', value: 1 },
                            row: 3, prereq: 'knowledge_is_power'
                        }
                    ]
                }
            }
        },

        gatherer: {
            id: 'gatherer',
            name: 'Gatherer',
            icon: '⛏️',
            description: 'Master of resource collection',
            color: '#4caf50',
            lanes: {
                miner: {
                    id: 'miner',
                    name: 'Miner',
                    description: 'Mining specialization',
                    talents: [
                        {
                            id: 'efficient_mining', name: 'Efficient Mining', icon: '⛏️',
                            description: '+6% mining speed per level',
                            maxLevel: 25, effect: { type: 'mining_speed', value: 0.06 },
                            row: 0, prereq: null
                        },
                        {
                            id: 'ore_sense', name: 'Ore Sense', icon: '👃',
                            description: '+3% rare ore chance per level',
                            maxLevel: 20, effect: { type: 'rare_ore', value: 0.03 },
                            row: 1, prereq: 'efficient_mining'
                        },
                        {
                            id: 'double_strike', name: 'Double Strike', icon: '⚒️',
                            description: '+3% chance for double resources per level',
                            maxLevel: 15, effect: { type: 'double_mine', value: 0.03 },
                            row: 2, prereq: 'ore_sense'
                        },
                        {
                            id: 'motherlode', name: 'Motherlode', icon: '💎',
                            description: 'Chance to find gem clusters per level',
                            maxLevel: 10, effect: { type: 'gem_cluster', value: 0.02 },
                            row: 3, prereq: 'double_strike'
                        }
                    ]
                },
                lumberjack: {
                    id: 'lumberjack',
                    name: 'Lumberjack',
                    description: 'Woodcutting specialization',
                    talents: [
                        {
                            id: 'sharp_axe', name: 'Sharp Axe', icon: '🪓',
                            description: '+6% woodcutting speed per level',
                            maxLevel: 25, effect: { type: 'woodcutting_speed', value: 0.06 },
                            row: 0, prereq: null
                        },
                        {
                            id: 'timber', name: 'Timber!', icon: '🌲',
                            description: '+3% extra wood per level',
                            maxLevel: 20, effect: { type: 'wood_yield', value: 0.03 },
                            row: 1, prereq: 'sharp_axe'
                        },
                        {
                            id: 'forest_friend', name: 'Forest Friend', icon: '🐿️',
                            description: '+4% rare drop from trees per level',
                            maxLevel: 15, effect: { type: 'rare_wood', value: 0.04 },
                            row: 2, prereq: 'timber'
                        },
                        {
                            id: 'ancient_tree', name: 'Ancient Tree', icon: '🌳',
                            description: 'Chance to find ancient materials per level',
                            maxLevel: 10, effect: { type: 'ancient_mats', value: 0.02 },
                            row: 3, prereq: 'forest_friend'
                        }
                    ]
                },
                angler: {
                    id: 'angler',
                    name: 'Angler',
                    description: 'Fishing specialization',
                    talents: [
                        {
                            id: 'patient_fisher', name: 'Patient Fisher', icon: '🎣',
                            description: '+6% fishing speed per level',
                            maxLevel: 25, effect: { type: 'fishing_speed', value: 0.06 },
                            row: 0, prereq: null
                        },
                        {
                            id: 'lucky_catch', name: 'Lucky Catch', icon: '🐟',
                            description: '+3% rare fish chance per level',
                            maxLevel: 20, effect: { type: 'rare_fish', value: 0.03 },
                            row: 1, prereq: 'patient_fisher'
                        },
                        {
                            id: 'big_fish', name: 'Big Fish', icon: '🐋',
                            description: '+4% chance for double catch per level',
                            maxLevel: 15, effect: { type: 'double_fish', value: 0.04 },
                            row: 2, prereq: 'lucky_catch'
                        },
                        {
                            id: 'legendary_lure', name: 'Legendary Lure', icon: '🌟',
                            description: 'Chance to catch legendary fish per level',
                            maxLevel: 10, effect: { type: 'legendary_fish', value: 0.01 },
                            row: 3, prereq: 'big_fish'
                        }
                    ]
                }
            }
        },

        fortune: {
            id: 'fortune',
            name: 'Fortune',
            icon: '🍀',
            description: 'Luck and riches',
            color: '#ffc107',
            lanes: {
                treasure_hunter: {
                    id: 'treasure_hunter',
                    name: 'Treasure Hunter',
                    description: 'Find more loot',
                    talents: [
                        {
                            id: 'lucky', name: 'Lucky', icon: '🍀',
                            description: '+2% drop rate per level',
                            maxLevel: 25, effect: { type: 'drop_rate', value: 0.02 },
                            row: 0, prereq: null
                        },
                        {
                            id: 'treasure_sense', name: 'Treasure Sense', icon: '🗺️',
                            description: '+3% rare drop chance per level',
                            maxLevel: 20, effect: { type: 'rare_drop', value: 0.03 },
                            row: 1, prereq: 'lucky'
                        },
                        {
                            id: 'quality_finds', name: 'Quality Finds', icon: '💍',
                            description: '+2% equipment quality per level',
                            maxLevel: 15, effect: { type: 'equip_quality', value: 0.02 },
                            row: 2, prereq: 'treasure_sense'
                        },
                        {
                            id: 'jackpot', name: 'Jackpot', icon: '🎰',
                            description: 'Chance for massive loot multiplier per level',
                            maxLevel: 10, effect: { type: 'jackpot', value: 0.01 },
                            row: 3, prereq: 'quality_finds'
                        }
                    ]
                },
                merchant: {
                    id: 'merchant',
                    name: 'Merchant',
                    description: 'Gold and trade',
                    talents: [
                        {
                            id: 'gold_finder', name: 'Gold Finder', icon: '💰',
                            description: '+5% gold from monsters per level',
                            maxLevel: 25, effect: { type: 'gold_mult', value: 0.05 },
                            row: 0, prereq: null
                        },
                        {
                            id: 'haggler', name: 'Haggler', icon: '🤝',
                            description: '+3% better shop prices per level',
                            maxLevel: 20, effect: { type: 'shop_discount', value: 0.03 },
                            row: 1, prereq: 'gold_finder'
                        },
                        {
                            id: 'appraiser', name: 'Appraiser', icon: '🔍',
                            description: '+5% sell price per level',
                            maxLevel: 15, effect: { type: 'sell_bonus', value: 0.05 },
                            row: 2, prereq: 'haggler'
                        },
                        {
                            id: 'tax_exempt', name: 'Tax Exempt', icon: '📜',
                            description: 'Reduce gold loss on death per level',
                            maxLevel: 10, effect: { type: 'death_save', value: 0.1 },
                            row: 3, prereq: 'appraiser'
                        }
                    ]
                },
                alchemist: {
                    id: 'alchemist',
                    name: 'Alchemist',
                    description: 'Potions and crafting',
                    talents: [
                        {
                            id: 'brew_master', name: 'Brew Master', icon: '⚗️',
                            description: '+6% alchemy speed per level',
                            maxLevel: 25, effect: { type: 'alchemy_speed', value: 0.06 },
                            row: 0, prereq: null
                        },
                        {
                            id: 'potent_potions', name: 'Potent Potions', icon: '🧪',
                            description: '+4% potion effectiveness per level',
                            maxLevel: 20, effect: { type: 'potion_power', value: 0.04 },
                            row: 1, prereq: 'brew_master'
                        },
                        {
                            id: 'double_brew', name: 'Double Brew', icon: '🍾',
                            description: '+3% chance to create extra potion per level',
                            maxLevel: 15, effect: { type: 'double_potion', value: 0.03 },
                            row: 2, prereq: 'potent_potions'
                        },
                        {
                            id: 'philosophers_stone', name: "Philosopher's Stone", icon: '🔮',
                            description: 'Chance to transmute items to gold per level',
                            maxLevel: 5, effect: { type: 'transmute', value: 0.01 },
                            row: 3, prereq: 'double_brew'
                        }
                    ]
                }
            }
        }
    };

    // Maximum total talent points a player can spend (limits build variety)
    const MAX_TOTAL_POINTS = 100;

    // Per-character talent points and allocations
    let characterTalents = {};

    /**
     * Initialize talents for a character
     */
    function initCharacter(charId) {
        if (!characterTalents[charId]) {
            characterTalents[charId] = {
                points: 3, // Start with 3 points
                allocated: {},
                totalSpent: 0
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
     * Get total spent points
     */
    function getTotalSpent(charId) {
        initCharacter(charId);
        return characterTalents[charId].totalSpent || 0;
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
     * Find talent definition by ID
     */
    function findTalent(talentId) {
        for (const treeId in talentTrees) {
            const tree = talentTrees[treeId];
            for (const laneId in tree.lanes) {
                const lane = tree.lanes[laneId];
                const talent = lane.talents.find(t => t.id === talentId);
                if (talent) {
                    return { tree, lane, talent };
                }
            }
        }
        return null;
    }

    /**
     * Calculate cost for next level of talent
     */
    function getTalentCost(talentId, currentLevel) {
        // Cost increases with level: 1, 1, 2, 2, 3, 3, etc.
        return Math.ceil((currentLevel + 1) / 2);
    }

    /**
     * Check if prereq is met
     */
    function isPrereqMet(charId, prereqId) {
        if (!prereqId) return true;
        return getTalentLevel(charId, prereqId) >= 1;
    }

    /**
     * Allocate a talent point
     */
    function allocate(charId, talentId) {
        initCharacter(charId);

        const found = findTalent(talentId);
        if (!found) return false;

        const { talent } = found;
        const currentLevel = getTalentLevel(charId, talentId);

        if (currentLevel >= talent.maxLevel) return false;

        // Check prereq
        if (!isPrereqMet(charId, talent.prereq)) return false;

        // Check max total points
        if (characterTalents[charId].totalSpent >= MAX_TOTAL_POINTS) return false;

        const cost = getTalentCost(talentId, currentLevel);
        if (characterTalents[charId].points < cost) return false;

        // Spend points and allocate
        characterTalents[charId].points -= cost;
        characterTalents[charId].totalSpent += cost;
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
            // Combat
            phys_damage: 1,
            magic_damage: 1,
            low_hp_damage: 0,
            attack_speed: 1,
            glass_cannon: 0,
            defense: 0,
            max_hp: 0,
            hp_regen: 0,
            last_stand: 0,
            crit_chance: 0,
            crit_damage: 1,
            armor_pen: 0,
            execute: 0,
            spell_crit: 0,
            elemental_damage: 1,
            meteor: 0,
            max_mp: 0,
            mp_regen: 0,
            spell_echo: 0,
            craft_bonus: 0,
            // Experience
            exp_mult: 1,
            skill_exp_mult: 1,
            skill_power: 0,
            bonus_talent_points: 0,
            // Gathering
            mining_speed: 1,
            rare_ore: 0,
            double_mine: 0,
            gem_cluster: 0,
            woodcutting_speed: 1,
            wood_yield: 0,
            rare_wood: 0,
            ancient_mats: 0,
            fishing_speed: 1,
            rare_fish: 0,
            double_fish: 0,
            legendary_fish: 0,
            // Fortune
            drop_rate: 1,
            rare_drop: 0,
            equip_quality: 0,
            jackpot: 0,
            gold_mult: 1,
            shop_discount: 0,
            sell_bonus: 0,
            death_save: 0,
            alchemy_speed: 1,
            potion_power: 0,
            double_potion: 0,
            transmute: 0
        };

        for (const treeId in talentTrees) {
            const tree = talentTrees[treeId];
            for (const laneId in tree.lanes) {
                const lane = tree.lanes[laneId];
                for (const talent of lane.talents) {
                    const level = getTalentLevel(charId, talent.id);
                    if (level > 0) {
                        const effect = talent.effect;
                        if (bonuses[effect.type] !== undefined) {
                            if (effect.type.includes('mult') || effect.type.includes('speed') ||
                                effect.type.includes('damage') || effect.type === 'drop_rate' ||
                                effect.type === 'crit_damage' || effect.type === 'elemental_damage') {
                                bonuses[effect.type] += effect.value * level;
                            } else {
                                bonuses[effect.type] += effect.value * level;
                            }
                        }
                    }
                }
            }
        }

        return bonuses;
    }

    /**
     * Get lane progress for a character
     */
    function getLaneProgress(charId, treeId, laneId) {
        initCharacter(charId);

        const tree = talentTrees[treeId];
        if (!tree || !tree.lanes[laneId]) return { current: 0, max: 0 };

        const lane = tree.lanes[laneId];
        let current = 0;
        let max = 0;

        for (const talent of lane.talents) {
            current += getTalentLevel(charId, talent.id);
            max += talent.maxLevel;
        }

        return { current, max };
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
        getTotalSpent,
        addPoints,
        getTalentLevel,
        findTalent,
        getTalentCost,
        isPrereqMet,
        allocate,
        getTrees,
        getBonuses,
        getLaneProgress,
        getState,
        loadState,
        reset,
        MAX_TOTAL_POINTS
    };
})();
