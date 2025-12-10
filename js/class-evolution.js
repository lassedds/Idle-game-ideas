/**
 * Dynamic Class Evolution Module
 * Classes emerge organically from playstyle tracking
 */

const ClassEvolution = (function() {
    let currentClass = 'Wanderer'; // Starting class
    let classHistory = []; // Record of all classes held
    let playstyleStats = {}; // Tracked playstyle metrics
    let classEvolutionProgress = 0;
    let evolutionUnlockTime = 0;
    let hiddenClassesUnlocked = [];

    // Playstyle dimensions
    const PLAYSTYLE_DIMENSIONS = {
        aggression: 0, // Damage dealt vs taken ratio
        elementAffinity: {}, // Which elements used most
        combatStyle: { melee: 0, ranged: 0, magic: 0 },
        supportTendency: 0, // Healing/buffing vs damage
        riskTaking: 0, // Fighting above level
        exploration: 0, // Zone variety
        crafting: 0, // Equipment breeding/fusion
        social: 0 // Multiplayer participation
    };

    // Class evolution trees
    const CLASS_TREES = {
        Wanderer: {
            name: 'Wanderer',
            description: 'A soul yet to find their path',
            tier: 0,
            traits: {},
            evolutions: {
                high_aggression: 'Brawler',
                high_support: 'Guardian',
                high_magic: 'Mystic',
                high_exploration: 'Nomad',
                high_crafting: 'Artisan',
                high_corruption: 'Shade'
            }
        },
        Brawler: {
            name: 'Brawler',
            description: 'A warrior who thrives in close combat',
            tier: 1,
            traits: {
                damageBonus: 1.15,
                meleeDamage: 1.2
            },
            signatureMove: 'Devastating Strike',
            evolutions: {
                fire_affinity: 'Berserker',
                high_defense: 'Juggernaut',
                critical_focus: 'Duelist'
            }
        },
        Guardian: {
            name: 'Guardian',
            description: 'A protector who shields allies',
            tier: 1,
            traits: {
                hpBonus: 1.25,
                damageReduction: 0.85
            },
            signatureMove: 'Protective Barrier',
            evolutions: {
                holy_affinity: 'Lightbringer',
                corruption_resist: 'Purifier',
                tank_focus: 'Fortress'
            }
        },
        Mystic: {
            name: 'Mystic',
            description: 'A wielder of arcane energies',
            tier: 1,
            traits: {
                magicDamage: 1.3,
                manaCost: 0.9
            },
            signatureMove: 'Arcane Burst',
            evolutions: {
                elemental_master: 'Elementalist',
                fusion_focus: 'Fusion Sage',
                chaos_affinity: 'Chaos Mage'
            }
        },
        Nomad: {
            name: 'Nomad',
            description: 'A wanderer who masters all terrains',
            tier: 1,
            traits: {
                zoneFatigueReduction: 0.5,
                expBonus: 1.15
            },
            signatureMove: 'Swift Journey',
            evolutions: {
                zone_mastery: 'World Walker',
                treasure_hunter: 'Fortune Seeker',
                speed_focus: 'Wind Dancer'
            }
        },
        Artisan: {
            name: 'Artisan',
            description: 'A master crafter and creator',
            tier: 1,
            traits: {
                breedingBonus: 1.5,
                fusionCostReduction: 0.75
            },
            signatureMove: 'Perfect Creation',
            evolutions: {
                genetics_focus: 'Genetic Savant',
                fusion_focus: 'Fusion Master',
                quality_focus: 'Perfectionist'
            }
        },
        Shade: {
            name: 'Shade',
            description: 'One who embraces corruption',
            tier: 1,
            traits: {
                corruptionBenefits: 1.5,
                corruptionPenalties: 0.5
            },
            signatureMove: 'Corrupted Strike',
            evolutions: {
                full_corruption: 'Corruption Lord',
                balance_corruption: 'Twilight Walker',
                chaos_focus: 'Chaos Herald'
            }
        },
        // Tier 2 Classes
        Berserker: {
            name: 'Berserker',
            description: 'A warrior consumed by battle fury',
            tier: 2,
            traits: {
                damageBonus: 1.3,
                critChance: 15,
                fireAffinity: 1.5
            },
            signatureMove: 'Rage of Flames',
            evolutions: {
                inferno_master: 'Inferno Warlord',
                dual_wield: 'Blade Storm',
                berserker_rage: 'Avatar of War'
            }
        },
        Lightbringer: {
            name: 'Lightbringer',
            description: 'A beacon of purity and hope',
            tier: 2,
            traits: {
                corruptionResist: 2.0,
                healingPower: 1.5,
                holyDamage: 1.4
            },
            signatureMove: 'Divine Radiance',
            evolutions: {
                support_master: 'Eternal Saint',
                offense_focus: 'Holy Crusader',
                purification: 'Corruption Slayer'
            }
        },
        'Fusion Sage': {
            name: 'Fusion Sage',
            description: 'Master of skill combination arts',
            tier: 2,
            traits: {
                fusionPower: 1.5,
                fusionSlots: 5, // +2 slots
                fusionCost: 0.5
            },
            signatureMove: 'Quad Fusion',
            evolutions: {
                ultimate_fusion: 'Fusion Ascendant',
                passive_essence: 'Essence Generator'
            }
        }
    };

    // Hidden classes with special unlock requirements
    const HIDDEN_CLASSES = {
        'Void Walker': {
            name: 'Void Walker',
            description: 'One who walks between depleted zones',
            tier: 3,
            requirements: {
                corruption: 60,
                zoneFatigue: 100,
                exploration: 50,
                reincarnations: 5
            },
            traits: {
                depletedZoneImmunity: true,
                guardianImmunity: true,
                teleportBetweenZones: true
            },
            signatureMove: 'Void Step'
        },
        'Phoenix Lord': {
            name: 'Phoenix Lord',
            description: 'Reborn from death itself',
            tier: 3,
            requirements: {
                deaths: 100,
                riskTaking: 80,
                fireAffinity: 90,
                reincarnations: 10
            },
            traits: {
                autoResurrect: true,
                powerPerDeath: 1.01, // 1% stronger per death
                fireImmunity: true
            },
            signatureMove: 'Phoenix Rebirth'
        },
        'Genetic Savant': {
            name: 'Genetic Savant',
            description: 'Master of equipment evolution',
            tier: 3,
            requirements: {
                crafting: 90,
                breedingCount: 500,
                lowCombat: true
            },
            traits: {
                guaranteedMutations: true,
                noInbreeding: true,
                seGainFromBreeding: true
            },
            signatureMove: 'Perfect Genesis'
        },
        'Chaos Healer': {
            name: 'Chaos Healer',
            description: 'Heals through corruption',
            tier: 3,
            requirements: {
                corruption: 75,
                support: 80,
                bossKills: 100
            },
            traits: {
                corruptionHeals: true,
                chaosSupport: 1.5,
                corruptionTransfer: true
            },
            signatureMove: 'Corrupted Restoration'
        }
    };

    /**
     * Initialize class evolution system
     */
    function init() {
        playstyleStats = { ...PLAYSTYLE_DIMENSIONS };

        // First evolution unlocks after 10 hours of gameplay
        evolutionUnlockTime = Date.now() + (10 * 60 * 60 * 1000);
    }

    /**
     * Track playstyle action
     */
    function trackAction(actionType, data = {}) {
        switch (actionType) {
            case 'damage_dealt':
                playstyleStats.aggression += data.amount / 100;
                updateCombatStyle(data.type || 'melee');
                break;

            case 'damage_taken':
                playstyleStats.aggression -= data.amount / 200;
                break;

            case 'healing':
                playstyleStats.supportTendency += data.amount / 50;
                break;

            case 'monster_killed':
                if (data.levelDifference > 5) {
                    playstyleStats.riskTaking += data.levelDifference;
                }
                break;

            case 'zone_visited':
                playstyleStats.exploration += 1;
                break;

            case 'equipment_bred':
                playstyleStats.crafting += 10;
                break;

            case 'skill_fused':
                playstyleStats.crafting += 5;
                break;

            case 'multiplayer_action':
                playstyleStats.social += 1;
                break;

            case 'element_used':
                const element = data.element;
                if (!playstyleStats.elementAffinity[element]) {
                    playstyleStats.elementAffinity[element] = 0;
                }
                playstyleStats.elementAffinity[element] += 1;
                break;
        }

        // Check for evolution eligibility
        checkEvolution();
        checkHiddenClasses();
    }

    /**
     * Update combat style tracking
     */
    function updateCombatStyle(type) {
        if (type === 'melee' || type === 'physical') {
            playstyleStats.combatStyle.melee += 1;
        } else if (type === 'ranged') {
            playstyleStats.combatStyle.ranged += 1;
        } else if (type === 'magic') {
            playstyleStats.combatStyle.magic += 1;
        }
    }

    /**
     * Check if ready for evolution
     */
    function checkEvolution() {
        if (Date.now() < evolutionUnlockTime) return;
        if (classEvolutionProgress >= 100) return; // Already ready

        const char = Character.getActive();
        if (!char) return;

        // Evolution unlock every 20 levels
        const evolutionLevel = Math.floor(char.level / 20) * 20;
        if (char.level >= evolutionLevel && evolutionLevel > 0) {
            classEvolutionProgress = 100;

            if (typeof UI !== 'undefined') {
                UI.showNotification('⚡ Class Evolution Available!', 'success');
            }
        }
    }

    /**
     * Get available evolutions
     */
    function getAvailableEvolutions() {
        const currentClassData = CLASS_TREES[currentClass];
        if (!currentClassData || !currentClassData.evolutions) {
            return [];
        }

        const options = [];

        // Analyze playstyle to determine best fits
        Object.entries(currentClassData.evolutions).forEach(([requirement, className]) => {
            let matches = false;

            switch (requirement) {
                case 'high_aggression':
                    matches = playstyleStats.aggression > 100;
                    break;
                case 'high_support':
                    matches = playstyleStats.supportTendency > 100;
                    break;
                case 'high_magic':
                    matches = playstyleStats.combatStyle.magic > 50;
                    break;
                case 'high_exploration':
                    matches = playstyleStats.exploration > 50;
                    break;
                case 'high_crafting':
                    matches = playstyleStats.crafting > 100;
                    break;
                case 'high_corruption':
                    if (typeof Corruption !== 'undefined') {
                        matches = Corruption.getCorruptionLevel() > 50;
                    }
                    break;
                case 'fire_affinity':
                    matches = (playstyleStats.elementAffinity.fire || 0) > 30;
                    break;
                case 'holy_affinity':
                    matches = (playstyleStats.elementAffinity.light || 0) > 30;
                    break;
                case 'corruption_resist':
                    if (typeof Corruption !== 'undefined') {
                        matches = Corruption.getCorruptionLevel() < 10;
                    }
                    break;
                case 'fusion_focus':
                    if (typeof SkillFusion !== 'undefined') {
                        matches = Object.keys(SkillFusion.getAllFusedSkills()).length > 5;
                    }
                    break;
                case 'genetics_focus':
                    if (typeof EquipmentGenetics !== 'undefined') {
                        matches = EquipmentGenetics.getBreedingHistory().length > 10;
                    }
                    break;
            }

            if (matches) {
                options.push({
                    className,
                    classData: CLASS_TREES[className],
                    matchReason: requirement
                });
            }
        });

        // Always offer at least 3 options
        while (options.length < 3 && currentClassData.evolutions) {
            const allEvolutions = Object.values(currentClassData.evolutions);
            const randomClass = allEvolutions[Math.floor(Math.random() * allEvolutions.length)];

            if (!options.find(o => o.className === randomClass)) {
                options.push({
                    className: randomClass,
                    classData: CLASS_TREES[randomClass],
                    matchReason: 'alternate_path'
                });
            }
        }

        return options.slice(0, 3);
    }

    /**
     * Evolve to new class
     */
    function evolveClass(className) {
        if (classEvolutionProgress < 100) {
            return { error: 'Not ready for evolution' };
        }

        const classData = CLASS_TREES[className];
        if (!classData) {
            return { error: 'Invalid class' };
        }

        const oldClass = currentClass;
        currentClass = className;
        classEvolutionProgress = 0;

        // Record history
        classHistory.push({
            className,
            timestamp: Date.now(),
            level: Character.getActive()?.level || 1
        });

        // Reset evolution timer for next evolution (20 more levels)
        const char = Character.getActive();
        if (char) {
            evolutionUnlockTime = Date.now();
        }

        if (typeof UI !== 'undefined') {
            UI.showNotification(`⚡ Evolved to ${className}!`, 'success');
        }

        // Notify multiplayer
        if (typeof Multiplayer !== 'undefined' && Multiplayer.isConnected()) {
            Multiplayer.sendChat(`evolved from ${oldClass} to ${className}!`);
            Multiplayer.sendPlayerUpdate();
        }

        return {
            success: true,
            className,
            traits: classData.traits
        };
    }

    /**
     * Check for hidden class unlocks
     */
    function checkHiddenClasses() {
        Object.entries(HIDDEN_CLASSES).forEach(([className, classData]) => {
            if (hiddenClassesUnlocked.includes(className)) return;

            const reqs = classData.requirements;
            let unlocked = true;

            // Check all requirements
            if (reqs.corruption !== undefined) {
                if (typeof Corruption === 'undefined' || Corruption.getCorruptionLevel() < reqs.corruption) {
                    unlocked = false;
                }
            }

            if (reqs.zoneFatigue !== undefined) {
                if (typeof ZoneFatigue === 'undefined') {
                    unlocked = false;
                } else {
                    const allFatigue = ZoneFatigue.getAllFatigue();
                    const hasHighFatigue = Object.values(allFatigue).some(f => f >= reqs.zoneFatigue);
                    if (!hasHighFatigue) unlocked = false;
                }
            }

            if (reqs.reincarnations !== undefined) {
                if (typeof Reincarnation === 'undefined' || Reincarnation.getReincarnationCount() < reqs.reincarnations) {
                    unlocked = false;
                }
            }

            if (reqs.crafting !== undefined) {
                if (playstyleStats.crafting < reqs.crafting) unlocked = false;
            }

            if (unlocked) {
                hiddenClassesUnlocked.push(className);

                if (typeof UI !== 'undefined') {
                    UI.showNotification(`🌟 Hidden Class Unlocked: ${className}!`, 'legendary');
                }
            }
        });
    }

    /**
     * Get current class
     */
    function getCurrentClass() {
        return currentClass;
    }

    /**
     * Get current class data
     */
    function getCurrentClassData() {
        return CLASS_TREES[currentClass] || HIDDEN_CLASSES[currentClass];
    }

    /**
     * Get class traits
     */
    function getClassTraits() {
        const classData = getCurrentClassData();
        return classData?.traits || {};
    }

    /**
     * Get playstyle stats
     */
    function getPlaystyleStats() {
        return { ...playstyleStats };
    }

    /**
     * Get class history
     */
    function getClassHistory() {
        return [...classHistory];
    }

    /**
     * Get evolution progress
     */
    function getEvolutionProgress() {
        return classEvolutionProgress;
    }

    /**
     * Get dominant playstyle
     */
    function getDominantPlaystyle() {
        const styles = {
            aggressive: playstyleStats.aggression,
            supportive: playstyleStats.supportTendency,
            melee: playstyleStats.combatStyle.melee,
            magic: playstyleStats.combatStyle.magic,
            explorer: playstyleStats.exploration,
            crafter: playstyleStats.crafting
        };

        return Object.entries(styles).sort((a, b) => b[1] - a[1])[0][0];
    }

    /**
     * Reset class (for reincarnation)
     */
    function resetClass() {
        currentClass = 'Wanderer';
        classEvolutionProgress = 0;
        playstyleStats = { ...PLAYSTYLE_DIMENSIONS };
        evolutionUnlockTime = Date.now() + (10 * 60 * 60 * 1000);
    }

    /**
     * Get state for saving
     */
    function getState() {
        return {
            currentClass,
            classHistory,
            playstyleStats,
            classEvolutionProgress,
            evolutionUnlockTime,
            hiddenClassesUnlocked
        };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state) {
            currentClass = state.currentClass || 'Wanderer';
            classHistory = state.classHistory || [];
            playstyleStats = state.playstyleStats || { ...PLAYSTYLE_DIMENSIONS };
            classEvolutionProgress = state.classEvolutionProgress || 0;
            evolutionUnlockTime = state.evolutionUnlockTime || Date.now();
            hiddenClassesUnlocked = state.hiddenClassesUnlocked || [];
        }
    }

    /**
     * Reset (full wipe)
     */
    function reset() {
        currentClass = 'Wanderer';
        classHistory = [];
        playstyleStats = { ...PLAYSTYLE_DIMENSIONS };
        classEvolutionProgress = 0;
        evolutionUnlockTime = Date.now();
        hiddenClassesUnlocked = [];
    }

    // Public API
    return {
        init,
        trackAction,
        checkEvolution,
        getAvailableEvolutions,
        evolveClass,
        getCurrentClass,
        getCurrentClassData,
        getClassTraits,
        getPlaystyleStats,
        getClassHistory,
        getEvolutionProgress,
        getDominantPlaystyle,
        resetClass,
        getState,
        loadState,
        reset,
        CLASS_TREES,
        HIDDEN_CLASSES
    };
})();
