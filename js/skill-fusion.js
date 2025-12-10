/**
 * Skill Fusion Module
 * Handles skill combination and hybrid ability creation
 */

const SkillFusion = (function() {
    // Fusion data storage
    let fusedSkills = {}; // fusionId -> fusion data
    let fusionRecipes = []; // Known recipes
    let activeFusions = []; // Currently equipped fusions (max 3)
    let fusionEssence = 0;

    const MAX_ACTIVE_FUSIONS = 3;

    // Skill compatibility categories
    const SKILL_CATEGORIES = {
        FIRE: ['fire', 'flame', 'burn', 'inferno'],
        WATER: ['water', 'ice', 'frost', 'freeze'],
        EARTH: ['earth', 'stone', 'rock', 'ground'],
        AIR: ['air', 'wind', 'lightning', 'storm'],
        LIGHT: ['light', 'holy', 'divine', 'radiant'],
        DARK: ['dark', 'shadow', 'curse', 'void'],
        PHYSICAL: ['strike', 'slash', 'pierce', 'crush'],
        MAGIC: ['arcane', 'mystic', 'spell', 'magic'],
        SUPPORT: ['heal', 'buff', 'shield', 'protect'],
        DOT: ['poison', 'bleed', 'burn', 'corruption']
    };

    /**
     * Initialize fusion system
     */
    function init() {
        fusionEssence = 0;
    }

    /**
     * Fuse two skills
     */
    function fuseSkills(skill1Id, skill2Id) {
        // Get skill definitions (this would come from Skills module)
        // For now, creating placeholder structure

        if (!skill1Id || !skill2Id) {
            return { error: 'Invalid skill IDs' };
        }

        if (skill1Id === skill2Id) {
            return { error: 'Cannot fuse skill with itself' };
        }

        // Check fusion essence cost
        const cost = 50; // Base cost
        if (fusionEssence < cost) {
            return { error: `Need ${cost} Fusion Essence` };
        }

        // Calculate compatibility
        const compatibility = calculateCompatibility(skill1Id, skill2Id);

        // Create fusion
        const fusion = {
            id: generateFusionId(),
            parent1: skill1Id,
            parent2: skill2Id,
            name: generateFusionName(skill1Id, skill2Id, compatibility),
            description: generateFusionDescription(skill1Id, skill2Id, compatibility),
            compatibility: compatibility,
            tier: 'basic', // basic, advanced, ultimate
            power: calculateFusionPower(skill1Id, skill2Id, compatibility),
            cooldown: calculateFusionCooldown(skill1Id, skill2Id),
            manaCost: calculateFusionManaCost(skill1Id, skill2Id),
            effects: generateFusionEffects(skill1Id, skill2Id, compatibility),
            createdAt: Date.now()
        };

        // Consume fusion essence
        fusionEssence -= cost;

        // Save fusion
        fusedSkills[fusion.id] = fusion;

        // Record recipe
        const recipeKey = [skill1Id, skill2Id].sort().join('_');
        if (!fusionRecipes.includes(recipeKey)) {
            fusionRecipes.push(recipeKey);
        }

        return {
            success: true,
            fusion: fusion
        };
    }

    /**
     * Fuse hybrid with normal skill (advanced fusion)
     */
    function advancedFusion(fusionId, skillId) {
        const fusion = fusedSkills[fusionId];
        if (!fusion) {
            return { error: 'Invalid fusion ID' };
        }

        const cost = 150; // Higher cost
        if (fusionEssence < cost) {
            return { error: `Need ${cost} Fusion Essence` };
        }

        // Create advanced fusion (3 skills combined)
        const advancedFusion = {
            id: generateFusionId(),
            parent1: fusionId,
            parent2: skillId,
            parents: [fusion.parent1, fusion.parent2, skillId],
            name: `Ultimate ${fusion.name}`,
            description: `Advanced fusion combining three distinct skills`,
            compatibility: 'complex',
            tier: 'advanced',
            power: fusion.power * 1.5,
            cooldown: fusion.cooldown * 1.2,
            manaCost: fusion.manaCost * 1.3,
            effects: [...fusion.effects, generateRandomEffect()],
            createdAt: Date.now()
        };

        fusionEssence -= cost;
        fusedSkills[advancedFusion.id] = advancedFusion;

        return {
            success: true,
            fusion: advancedFusion
        };
    }

    /**
     * Ultimate fusion (combine two hybrids)
     */
    function ultimateFusion(fusion1Id, fusion2Id) {
        const fusion1 = fusedSkills[fusion1Id];
        const fusion2 = fusedSkills[fusion2Id];

        if (!fusion1 || !fusion2) {
            return { error: 'Invalid fusion IDs' };
        }

        const cost = 500; // Very high cost
        if (fusionEssence < cost) {
            return { error: `Need ${cost} Fusion Essence` };
        }

        // Get all parent skills
        const allParents = [
            ...(fusion1.parents || [fusion1.parent1, fusion1.parent2]),
            ...(fusion2.parents || [fusion2.parent1, fusion2.parent2])
        ];

        const ultimate = {
            id: generateFusionId(),
            parent1: fusion1Id,
            parent2: fusion2Id,
            parents: allParents,
            name: generateUltimateName(),
            description: 'The ultimate fusion of four distinct skills',
            compatibility: 'ultimate',
            tier: 'ultimate',
            power: (fusion1.power + fusion2.power) * 2,
            cooldown: Math.max(fusion1.cooldown, fusion2.cooldown) * 1.5,
            manaCost: fusion1.manaCost + fusion2.manaCost,
            effects: [...fusion1.effects, ...fusion2.effects, generateUltimateEffect()],
            createdAt: Date.now()
        };

        fusionEssence -= cost;
        fusedSkills[ultimate.id] = ultimate;

        return {
            success: true,
            fusion: ultimate
        };
    }

    /**
     * Calculate skill compatibility
     */
    function calculateCompatibility(skill1Id, skill2Id) {
        const cat1 = getSkillCategory(skill1Id);
        const cat2 = getSkillCategory(skill2Id);

        // Same category = high compatibility
        if (cat1 === cat2) {
            return 'high';
        }

        // Related categories = medium
        const related = {
            FIRE: ['AIR'],
            WATER: ['EARTH'],
            LIGHT: ['MAGIC'],
            DARK: ['MAGIC'],
            PHYSICAL: ['EARTH'],
            SUPPORT: ['MAGIC', 'LIGHT']
        };

        if (related[cat1]?.includes(cat2) || related[cat2]?.includes(cat1)) {
            return 'medium';
        }

        // Opposite categories = low
        const opposites = {
            FIRE: 'WATER',
            LIGHT: 'DARK',
            PHYSICAL: 'MAGIC'
        };

        if (opposites[cat1] === cat2 || opposites[cat2] === cat1) {
            return 'low';
        }

        return 'medium';
    }

    /**
     * Get skill category
     */
    function getSkillCategory(skillId) {
        const name = skillId.toLowerCase();

        for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
            if (keywords.some(kw => name.includes(kw))) {
                return category;
            }
        }

        return 'PHYSICAL'; // Default
    }

    /**
     * Generate fusion name
     */
    function generateFusionName(skill1Id, skill2Id, compatibility) {
        const prefixes = {
            high: ['Perfect', 'Supreme', 'Pure'],
            medium: ['Hybrid', 'Mixed', 'Dual'],
            low: ['Chaotic', 'Unstable', 'Wild']
        };

        const prefix = prefixes[compatibility][Math.floor(Math.random() * 3)];

        // Extract meaningful parts from skill names
        const part1 = skill1Id.split('_')[0];
        const part2 = skill2Id.split('_')[0];

        return `${prefix} ${part1}-${part2}`;
    }

    /**
     * Generate fusion description
     */
    function generateFusionDescription(skill1Id, skill2Id, compatibility) {
        const descriptions = {
            high: 'A harmonious fusion of complementary skills, creating focused power.',
            medium: 'A balanced combination retaining the best of both skills.',
            low: 'An unpredictable fusion with chaotic but potentially powerful effects.'
        };

        return descriptions[compatibility];
    }

    /**
     * Calculate fusion power
     */
    function calculateFusionPower(skill1Id, skill2Id, compatibility) {
        const base1 = 50; // Base skill powers (would come from Skills module)
        const base2 = 50;

        const multipliers = {
            high: 1.8,
            medium: 1.5,
            low: 1.3
        };

        return Math.floor((base1 + base2) * multipliers[compatibility]);
    }

    /**
     * Calculate fusion cooldown
     */
    function calculateFusionCooldown(skill1Id, skill2Id) {
        // Average of parent cooldowns
        const cd1 = 10; // Would come from Skills module
        const cd2 = 15;

        return Math.floor((cd1 + cd2) / 2);
    }

    /**
     * Calculate fusion mana cost
     */
    function calculateFusionManaCost(skill1Id, skill2Id) {
        // Slightly less than sum of parents
        const mana1 = 30;
        const mana2 = 40;

        return Math.floor((mana1 + mana2) * 0.8);
    }

    /**
     * Generate fusion effects
     */
    function generateFusionEffects(skill1Id, skill2Id, compatibility) {
        const effects = [];

        // Inherit some parent effects
        effects.push({ type: 'damage', value: calculateFusionPower(skill1Id, skill2Id, compatibility) });

        if (compatibility === 'high') {
            effects.push({ type: 'bonus', value: 'Bonus damage on same-type enemies' });
        } else if (compatibility === 'low') {
            effects.push({ type: 'random', value: 'Random elemental effect each cast' });
        }

        return effects;
    }

    /**
     * Generate random effect
     */
    function generateRandomEffect() {
        const effects = [
            { type: 'lifesteal', value: '10% of damage as healing' },
            { type: 'aoe', value: 'Hits up to 3 enemies' },
            { type: 'dot', value: 'Apply damage over time' },
            { type: 'slow', value: 'Slow enemy attack speed' },
            { type: 'crit', value: '+20% critical chance' }
        ];

        return effects[Math.floor(Math.random() * effects.length)];
    }

    /**
     * Generate ultimate name
     */
    function generateUltimateName() {
        const names = [
            'Prismatic Annihilation',
            'Celestial Devastation',
            'Void Ascension',
            'Eternal Cataclysm',
            'Cosmic Reckoning',
            'Divine Oblivion'
        ];

        return names[Math.floor(Math.random() * names.length)];
    }

    /**
     * Generate ultimate effect
     */
    function generateUltimateEffect() {
        return {
            type: 'ultimate',
            value: 'Massive damage to all enemies with multiple elemental effects'
        };
    }

    /**
     * Generate fusion ID
     */
    function generateFusionId() {
        return 'fusion_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Equip fusion to active slot
     */
    function equipFusion(fusionId) {
        const fusion = fusedSkills[fusionId];
        if (!fusion) {
            return { error: 'Invalid fusion ID' };
        }

        if (activeFusions.length >= MAX_ACTIVE_FUSIONS) {
            return { error: `Maximum ${MAX_ACTIVE_FUSIONS} fusions can be active` };
        }

        if (activeFusions.includes(fusionId)) {
            return { error: 'Fusion already equipped' };
        }

        activeFusions.push(fusionId);

        return { success: true };
    }

    /**
     * Unequip fusion
     */
    function unequipFusion(fusionId) {
        const index = activeFusions.indexOf(fusionId);
        if (index === -1) {
            return { error: 'Fusion not equipped' };
        }

        activeFusions.splice(index, 1);

        return { success: true };
    }

    /**
     * Get active fusions
     */
    function getActiveFusions() {
        return activeFusions.map(id => fusedSkills[id]).filter(f => f);
    }

    /**
     * Get all fused skills
     */
    function getAllFusedSkills() {
        return { ...fusedSkills };
    }

    /**
     * Get fusion by ID
     */
    function getFusion(fusionId) {
        return fusedSkills[fusionId];
    }

    /**
     * Add fusion essence
     */
    function addFusionEssence(amount) {
        fusionEssence += amount;
    }

    /**
     * Get fusion essence
     */
    function getFusionEssence() {
        return fusionEssence;
    }

    /**
     * Get known recipes
     */
    function getKnownRecipes() {
        return [...fusionRecipes];
    }

    /**
     * Get state for saving
     */
    function getState() {
        return {
            fusedSkills,
            fusionRecipes,
            activeFusions,
            fusionEssence
        };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state) {
            fusedSkills = state.fusedSkills || {};
            fusionRecipes = state.fusionRecipes || [];
            activeFusions = state.activeFusions || [];
            fusionEssence = state.fusionEssence || 0;
        }
    }

    /**
     * Reset fusion system
     */
    function reset() {
        fusedSkills = {};
        fusionRecipes = [];
        activeFusions = [];
        fusionEssence = 0;
    }

    // Public API
    return {
        init,
        fuseSkills,
        advancedFusion,
        ultimateFusion,
        equipFusion,
        unequipFusion,
        getActiveFusions,
        getAllFusedSkills,
        getFusion,
        addFusionEssence,
        getFusionEssence,
        getKnownRecipes,
        getState,
        loadState,
        reset,
        MAX_ACTIVE_FUSIONS
    };
})();
