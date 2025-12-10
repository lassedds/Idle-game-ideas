/**
 * Equipment Genetics Module
 * Handles equipment breeding and genetic traits
 */

const EquipmentGenetics = (function() {
    // Genetic trait categories
    const GENE_TYPES = {
        POWER: 'power',
        EFFICIENCY: 'efficiency',
        AFFINITY: 'affinity',
        RARITY: 'rarity',
        MUTATION: 'mutation'
    };

    // Elemental affinities
    const AFFINITIES = ['fire', 'water', 'earth', 'air', 'light', 'dark', 'chaos', 'nature'];

    // Store genetic data for equipment instances
    let equipmentGenetics = {}; // equipmentInstanceId -> genetic data

    // Breeding history
    let breedingHistory = [];
    let fusionCatalysts = 0;
    let lastFusionTime = 0;
    const FUSION_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

    /**
     * Initialize genetics system
     */
    function init() {
        // Initialize fusion catalysts
        fusionCatalysts = 0;
    }

    /**
     * Generate genetics for new equipment
     */
    function generateGenetics(itemDef, quality = 50) {
        const genetics = {
            id: generateGeneticsId(),
            itemId: itemDef.id,
            generation: 0,
            parents: null,
            traits: {
                power: {
                    quality: quality + randomVariance(20),
                    value: calculatePowerGene(itemDef, quality)
                },
                efficiency: {
                    quality: quality + randomVariance(20),
                    value: calculateEfficiencyGene(itemDef, quality)
                },
                affinity: {
                    quality: quality + randomVariance(20),
                    elements: determineAffinity(itemDef)
                },
                rarity: {
                    quality: quality + randomVariance(15),
                    tier: itemDef.rarity
                },
                mutation: {
                    quality: quality + randomVariance(25),
                    effects: generateMutations(quality)
                }
            },
            purity: 100, // Degrades with inbreeding
            breedingPotential: 10 // How many times can be bred
        };

        // Normalize qualities to 1-100
        Object.keys(genetics.traits).forEach(key => {
            genetics.traits[key].quality = Math.max(1, Math.min(100, genetics.traits[key].quality));
        });

        equipmentGenetics[genetics.id] = genetics;
        return genetics.id;
    }

    /**
     * Breed two equipment pieces
     */
    function breedEquipment(genetics1Id, genetics2Id) {
        const parent1 = equipmentGenetics[genetics1Id];
        const parent2 = equipmentGenetics[genetics2Id];

        if (!parent1 || !parent2) {
            return { error: 'Invalid genetics IDs' };
        }

        // Check if same equipment category
        const item1 = Inventory.getItemDef(parent1.itemId);
        const item2 = Inventory.getItemDef(parent2.itemId);

        if (!item1 || !item2) {
            return { error: 'Invalid items' };
        }

        if (item1.type !== item2.type) {
            return { error: 'Can only breed same equipment type' };
        }

        // Check fusion catalysts
        if (fusionCatalysts < 1) {
            return { error: 'Need Fusion Catalyst to breed equipment' };
        }

        // Check cooldown
        const now = Date.now();
        if (now - lastFusionTime < FUSION_COOLDOWN) {
            const remaining = FUSION_COOLDOWN - (now - lastFusionTime);
            const hours = Math.ceil(remaining / (60 * 60 * 1000));
            return { error: `Fusion Altar on cooldown (${hours}h remaining)` };
        }

        // Check breeding potential
        if (parent1.breedingPotential <= 0 || parent2.breedingPotential <= 0) {
            return { error: 'One or both parents exhausted' };
        }

        // Calculate inbreeding penalty
        const inbreedingPenalty = calculateInbreeding(parent1, parent2);

        // Create offspring genetics
        const offspring = {
            id: generateGeneticsId(),
            itemId: selectOffspringItem(parent1, parent2),
            generation: Math.max(parent1.generation, parent2.generation) + 1,
            parents: [genetics1Id, genetics2Id],
            traits: inheritTraits(parent1, parent2, inbreedingPenalty),
            purity: Math.max(10, (parent1.purity + parent2.purity) / 2 - inbreedingPenalty * 10),
            breedingPotential: 10
        };

        // Consume catalysts and update cooldown
        fusionCatalysts--;
        lastFusionTime = now;

        // Reduce parent breeding potential
        parent1.breedingPotential--;
        parent2.breedingPotential--;

        // Save offspring
        equipmentGenetics[offspring.id] = offspring;

        // Record breeding history
        breedingHistory.push({
            timestamp: now,
            parents: [genetics1Id, genetics2Id],
            offspring: offspring.id,
            generation: offspring.generation
        });

        return {
            success: true,
            offspringId: offspring.id,
            offspring: offspring
        };
    }

    /**
     * Inherit traits from parents
     */
    function inheritTraits(parent1, parent2, inbreedingPenalty) {
        const traits = {};

        Object.keys(parent1.traits).forEach(traitType => {
            const t1 = parent1.traits[traitType];
            const t2 = parent2.traits[traitType];

            // 60% chance to inherit from parents, 40% random mutation
            const inheritChance = Math.random();

            if (inheritChance < 0.3) {
                // Inherit from parent 1
                traits[traitType] = { ...t1 };
            } else if (inheritChance < 0.6) {
                // Inherit from parent 2
                traits[traitType] = { ...t2 };
            } else {
                // Mutation - blend or randomize
                traits[traitType] = mutateTraits(t1, t2, traitType);
            }

            // Apply inbreeding penalty
            if (traits[traitType].quality) {
                traits[traitType].quality = Math.max(1, traits[traitType].quality - inbreedingPenalty);
            }
        });

        return traits;
    }

    /**
     * Mutate traits
     */
    function mutateTraits(trait1, trait2, traitType) {
        if (traitType === 'power') {
            return {
                quality: (trait1.quality + trait2.quality) / 2 + randomVariance(15),
                value: Math.round((trait1.value + trait2.value) / 2 * (1 + randomVariance(30) / 100))
            };
        } else if (traitType === 'efficiency') {
            return {
                quality: (trait1.quality + trait2.quality) / 2 + randomVariance(15),
                value: Math.round((trait1.value + trait2.value) / 2 * (1 + randomVariance(30) / 100))
            };
        } else if (traitType === 'affinity') {
            // Combine or mutate affinities
            const combined = [...new Set([...trait1.elements, ...trait2.elements])];
            if (Math.random() < 0.2) {
                // Rare mutation - add random element
                combined.push(AFFINITIES[Math.floor(Math.random() * AFFINITIES.length)]);
            }
            return {
                quality: (trait1.quality + trait2.quality) / 2 + randomVariance(15),
                elements: combined.slice(0, 3) // Max 3 elements
            };
        } else if (traitType === 'rarity') {
            const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
            const idx1 = rarities.indexOf(trait1.tier);
            const idx2 = rarities.indexOf(trait2.tier);
            let targetIdx = Math.round((idx1 + idx2) / 2);

            // Small chance to increase rarity
            if (Math.random() < 0.1) targetIdx++;

            return {
                quality: (trait1.quality + trait2.quality) / 2 + randomVariance(15),
                tier: rarities[Math.max(0, Math.min(rarities.length - 1, targetIdx))]
            };
        } else if (traitType === 'mutation') {
            // Combine mutation effects
            const allEffects = [...trait1.effects, ...trait2.effects];
            // Chance for new mutation
            if (Math.random() < 0.3) {
                allEffects.push(generateRandomMutation());
            }
            return {
                quality: (trait1.quality + trait2.quality) / 2 + randomVariance(20),
                effects: allEffects.slice(0, 3) // Max 3 mutations
            };
        }

        return trait1;
    }

    /**
     * Calculate inbreeding penalty
     */
    function calculateInbreeding(parent1, parent2) {
        // Check if parents share ancestors
        const ancestors1 = getAncestors(parent1);
        const ancestors2 = getAncestors(parent2);

        const sharedAncestors = ancestors1.filter(a => ancestors2.includes(a)).length;
        return sharedAncestors * 5; // 5 quality points per shared ancestor
    }

    /**
     * Get all ancestors
     */
    function getAncestors(genetics, depth = 5) {
        if (!genetics.parents || depth === 0) return [];

        const ancestors = [...genetics.parents];
        genetics.parents.forEach(parentId => {
            const parent = equipmentGenetics[parentId];
            if (parent) {
                ancestors.push(...getAncestors(parent, depth - 1));
            }
        });

        return [...new Set(ancestors)];
    }

    /**
     * Select offspring item type
     */
    function selectOffspringItem(parent1, parent2) {
        // 70% chance of parent 1's type, 30% parent 2's type
        return Math.random() < 0.7 ? parent1.itemId : parent2.itemId;
    }

    /**
     * Helper functions
     */
    function generateGeneticsId() {
        return 'gen_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function randomVariance(range) {
        return (Math.random() - 0.5) * range;
    }

    function calculatePowerGene(itemDef, quality) {
        if (!itemDef.stats) return 0;
        const totalStats = Object.values(itemDef.stats).reduce((a, b) => a + b, 0);
        return Math.floor(totalStats * (1 + quality / 100));
    }

    function calculateEfficiencyGene(itemDef, quality) {
        // Efficiency = how much it reduces costs/cooldowns
        return Math.floor(10 + quality / 5);
    }

    function determineAffinity(itemDef) {
        // Determine based on item name/type
        const affinities = [];
        const name = itemDef.name.toLowerCase();

        if (name.includes('fire') || name.includes('flame')) affinities.push('fire');
        if (name.includes('ice') || name.includes('frost')) affinities.push('water');
        if (name.includes('dragon')) affinities.push('fire', 'chaos');
        if (name.includes('holy') || name.includes('light')) affinities.push('light');
        if (name.includes('dark') || name.includes('shadow')) affinities.push('dark');

        // Default to random if none found
        if (affinities.length === 0) {
            affinities.push(AFFINITIES[Math.floor(Math.random() * AFFINITIES.length)]);
        }

        return [...new Set(affinities)];
    }

    function generateMutations(quality) {
        const mutations = [];
        const mutationChance = quality / 200; // 0-50% chance

        if (Math.random() < mutationChance) {
            mutations.push(generateRandomMutation());
        }

        return mutations;
    }

    function generateRandomMutation() {
        const possibleMutations = [
            { name: 'Vampiric', effect: 'Heal 5% of damage dealt' },
            { name: 'Lucky Strike', effect: '+10% critical chance' },
            { name: 'Experienced', effect: '+15% EXP gain' },
            { name: 'Greedy', effect: '+20% gold drops' },
            { name: 'Resistant', effect: 'Reduce damage taken by 5%' },
            { name: 'Swift', effect: '+10% attack speed' },
            { name: 'Sturdy', effect: '+50 max HP' },
            { name: 'Chaotic', effect: 'Random element on each attack' },
            { name: 'Corrupted', effect: '+25% damage but gain corruption' },
            { name: 'Pure', effect: 'Slowly cleanse corruption' }
        ];

        return possibleMutations[Math.floor(Math.random() * possibleMutations.length)];
    }

    /**
     * Add fusion catalyst
     */
    function addFusionCatalyst(amount = 1) {
        fusionCatalysts += amount;
    }

    /**
     * Get fusion catalysts
     */
    function getFusionCatalysts() {
        return fusionCatalysts;
    }

    /**
     * Get genetics by ID
     */
    function getGenetics(geneticsId) {
        return equipmentGenetics[geneticsId];
    }

    /**
     * Get all genetics
     */
    function getAllGenetics() {
        return { ...equipmentGenetics };
    }

    /**
     * Get breeding history
     */
    function getBreedingHistory() {
        return [...breedingHistory];
    }

    /**
     * Get state for saving
     */
    function getState() {
        return {
            equipmentGenetics,
            breedingHistory,
            fusionCatalysts,
            lastFusionTime
        };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state) {
            equipmentGenetics = state.equipmentGenetics || {};
            breedingHistory = state.breedingHistory || [];
            fusionCatalysts = state.fusionCatalysts || 0;
            lastFusionTime = state.lastFusionTime || 0;
        }
    }

    /**
     * Reset genetics
     */
    function reset() {
        equipmentGenetics = {};
        breedingHistory = [];
        fusionCatalysts = 0;
        lastFusionTime = 0;
    }

    // Public API
    return {
        init,
        generateGenetics,
        breedEquipment,
        addFusionCatalyst,
        getFusionCatalysts,
        getGenetics,
        getAllGenetics,
        getBreedingHistory,
        getState,
        loadState,
        reset,
        GENE_TYPES,
        AFFINITIES
    };
})();
