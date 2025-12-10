/**
 * Boss Combat Module
 * Pokemon-style turn-based combat system for boss encounters
 */

const BossCombat = (function() {
    // Element Types (Pokemon-style)
    const TYPES = {
        NORMAL: 'normal',
        FIRE: 'fire',
        WATER: 'water',
        GRASS: 'grass',
        ELECTRIC: 'electric',
        ICE: 'ice',
        FIGHTING: 'fighting',
        POISON: 'poison',
        GROUND: 'ground',
        FLYING: 'flying',
        PSYCHIC: 'psychic',
        BUG: 'bug',
        ROCK: 'rock',
        GHOST: 'ghost',
        DRAGON: 'dragon',
        DARK: 'dark',
        STEEL: 'steel',
        FAIRY: 'fairy'
    };

    // Type effectiveness chart (attacker type -> defender type -> multiplier)
    const TYPE_CHART = {
        [TYPES.NORMAL]: { [TYPES.ROCK]: 0.5, [TYPES.GHOST]: 0, [TYPES.STEEL]: 0.5 },
        [TYPES.FIRE]: { [TYPES.FIRE]: 0.5, [TYPES.WATER]: 0.5, [TYPES.GRASS]: 2, [TYPES.ICE]: 2, [TYPES.BUG]: 2, [TYPES.ROCK]: 0.5, [TYPES.DRAGON]: 0.5, [TYPES.STEEL]: 2 },
        [TYPES.WATER]: { [TYPES.FIRE]: 2, [TYPES.WATER]: 0.5, [TYPES.GRASS]: 0.5, [TYPES.GROUND]: 2, [TYPES.ROCK]: 2, [TYPES.DRAGON]: 0.5 },
        [TYPES.GRASS]: { [TYPES.FIRE]: 0.5, [TYPES.WATER]: 2, [TYPES.GRASS]: 0.5, [TYPES.POISON]: 0.5, [TYPES.GROUND]: 2, [TYPES.FLYING]: 0.5, [TYPES.BUG]: 0.5, [TYPES.ROCK]: 2, [TYPES.DRAGON]: 0.5, [TYPES.STEEL]: 0.5 },
        [TYPES.ELECTRIC]: { [TYPES.WATER]: 2, [TYPES.ELECTRIC]: 0.5, [TYPES.GRASS]: 0.5, [TYPES.GROUND]: 0, [TYPES.FLYING]: 2, [TYPES.DRAGON]: 0.5 },
        [TYPES.ICE]: { [TYPES.FIRE]: 0.5, [TYPES.WATER]: 0.5, [TYPES.GRASS]: 2, [TYPES.ICE]: 0.5, [TYPES.GROUND]: 2, [TYPES.FLYING]: 2, [TYPES.DRAGON]: 2, [TYPES.STEEL]: 0.5 },
        [TYPES.FIGHTING]: { [TYPES.NORMAL]: 2, [TYPES.ICE]: 2, [TYPES.POISON]: 0.5, [TYPES.FLYING]: 0.5, [TYPES.PSYCHIC]: 0.5, [TYPES.BUG]: 0.5, [TYPES.ROCK]: 2, [TYPES.GHOST]: 0, [TYPES.DARK]: 2, [TYPES.STEEL]: 2, [TYPES.FAIRY]: 0.5 },
        [TYPES.POISON]: { [TYPES.GRASS]: 2, [TYPES.POISON]: 0.5, [TYPES.GROUND]: 0.5, [TYPES.ROCK]: 0.5, [TYPES.GHOST]: 0.5, [TYPES.STEEL]: 0, [TYPES.FAIRY]: 2 },
        [TYPES.GROUND]: { [TYPES.FIRE]: 2, [TYPES.ELECTRIC]: 2, [TYPES.GRASS]: 0.5, [TYPES.POISON]: 2, [TYPES.FLYING]: 0, [TYPES.BUG]: 0.5, [TYPES.ROCK]: 2, [TYPES.STEEL]: 2 },
        [TYPES.FLYING]: { [TYPES.ELECTRIC]: 0.5, [TYPES.GRASS]: 2, [TYPES.FIGHTING]: 2, [TYPES.BUG]: 2, [TYPES.ROCK]: 0.5, [TYPES.STEEL]: 0.5 },
        [TYPES.PSYCHIC]: { [TYPES.FIGHTING]: 2, [TYPES.POISON]: 2, [TYPES.PSYCHIC]: 0.5, [TYPES.DARK]: 0, [TYPES.STEEL]: 0.5 },
        [TYPES.BUG]: { [TYPES.FIRE]: 0.5, [TYPES.GRASS]: 2, [TYPES.FIGHTING]: 0.5, [TYPES.POISON]: 0.5, [TYPES.FLYING]: 0.5, [TYPES.PSYCHIC]: 2, [TYPES.GHOST]: 0.5, [TYPES.DARK]: 2, [TYPES.STEEL]: 0.5, [TYPES.FAIRY]: 0.5 },
        [TYPES.ROCK]: { [TYPES.FIRE]: 2, [TYPES.ICE]: 2, [TYPES.FIGHTING]: 0.5, [TYPES.GROUND]: 0.5, [TYPES.FLYING]: 2, [TYPES.BUG]: 2, [TYPES.STEEL]: 0.5 },
        [TYPES.GHOST]: { [TYPES.NORMAL]: 0, [TYPES.PSYCHIC]: 2, [TYPES.GHOST]: 2, [TYPES.DARK]: 0.5 },
        [TYPES.DRAGON]: { [TYPES.DRAGON]: 2, [TYPES.STEEL]: 0.5, [TYPES.FAIRY]: 0 },
        [TYPES.DARK]: { [TYPES.FIGHTING]: 0.5, [TYPES.PSYCHIC]: 2, [TYPES.GHOST]: 2, [TYPES.DARK]: 0.5, [TYPES.FAIRY]: 0.5 },
        [TYPES.STEEL]: { [TYPES.FIRE]: 0.5, [TYPES.WATER]: 0.5, [TYPES.ELECTRIC]: 0.5, [TYPES.ICE]: 2, [TYPES.ROCK]: 2, [TYPES.STEEL]: 0.5, [TYPES.FAIRY]: 2 },
        [TYPES.FAIRY]: { [TYPES.FIRE]: 0.5, [TYPES.FIGHTING]: 2, [TYPES.POISON]: 0.5, [TYPES.DRAGON]: 2, [TYPES.DARK]: 2, [TYPES.STEEL]: 0.5 }
    };

    // Move/Spell categories
    const MOVE_CATEGORIES = {
        PHYSICAL: 'physical',
        SPECIAL: 'special',
        STATUS: 'status',
        CHAOS: 'chaos',        // 🎪 UNIQUE: Requires Chaos Energy
        FUSION: 'fusion',      // 🎪 UNIQUE: Combines two moves
        TEMPORAL: 'temporal'   // 🎪 UNIQUE: Time manipulation
    };

    // 🎪 UNIQUE MECHANIC: Terrain Effects
    const TERRAINS = {
        NORMAL: { name: 'Normal Arena', effects: {} },
        VOLCANIC: { name: 'Volcanic Wasteland', effects: { fire: 1.5, water: 0.5, ice: 0.25 } },
        FLOODED: { name: 'Flooded Ruins', effects: { water: 1.5, electric: 1.3, fire: 0.5 } },
        CORRUPTED: { name: 'Corrupted Zone', effects: { dark: 1.5, ghost: 1.5, fairy: 0.5, corruption_gain: 2 } },
        FROZEN: { name: 'Frozen Tundra', effects: { ice: 1.5, fire: 0.7, speed_penalty: 0.8 } },
        ETHEREAL: { name: 'Ethereal Plane', effects: { psychic: 1.5, ghost: 1.5, physical_penalty: 0.7 } },
        CHAOTIC: { name: 'Chaotic Vortex', effects: { random: true, chaos_gain: 2 } }
    };

    // Move definitions
    const MOVES = {
        // Normal type moves
        tackle: { name: 'Tackle', type: TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 40, accuracy: 100, pp: 35 },
        scratch: { name: 'Scratch', type: TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 40, accuracy: 100, pp: 35 },
        slash: { name: 'Slash', type: TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 70, accuracy: 100, pp: 20 },
        hyper_beam: { name: 'Hyper Beam', type: TYPES.NORMAL, category: MOVE_CATEGORIES.SPECIAL, power: 150, accuracy: 90, pp: 5, recharge: true },

        // Fire moves
        ember: { name: 'Ember', type: TYPES.FIRE, category: MOVE_CATEGORIES.SPECIAL, power: 40, accuracy: 100, pp: 25 },
        flamethrower: { name: 'Flamethrower', type: TYPES.FIRE, category: MOVE_CATEGORIES.SPECIAL, power: 90, accuracy: 100, pp: 15 },
        fire_blast: { name: 'Fire Blast', type: TYPES.FIRE, category: MOVE_CATEGORIES.SPECIAL, power: 110, accuracy: 85, pp: 5 },
        inferno: { name: 'Inferno', type: TYPES.FIRE, category: MOVE_CATEGORIES.SPECIAL, power: 100, accuracy: 50, pp: 5, effect: 'burn' },

        // Water moves
        water_gun: { name: 'Water Gun', type: TYPES.WATER, category: MOVE_CATEGORIES.SPECIAL, power: 40, accuracy: 100, pp: 25 },
        bubble_beam: { name: 'Bubble Beam', type: TYPES.WATER, category: MOVE_CATEGORIES.SPECIAL, power: 65, accuracy: 100, pp: 20 },
        surf: { name: 'Surf', type: TYPES.WATER, category: MOVE_CATEGORIES.SPECIAL, power: 90, accuracy: 100, pp: 15 },
        hydro_pump: { name: 'Hydro Pump', type: TYPES.WATER, category: MOVE_CATEGORIES.SPECIAL, power: 110, accuracy: 80, pp: 5 },

        // Grass moves
        vine_whip: { name: 'Vine Whip', type: TYPES.GRASS, category: MOVE_CATEGORIES.PHYSICAL, power: 45, accuracy: 100, pp: 25 },
        razor_leaf: { name: 'Razor Leaf', type: TYPES.GRASS, category: MOVE_CATEGORIES.PHYSICAL, power: 55, accuracy: 95, pp: 25 },
        solar_beam: { name: 'Solar Beam', type: TYPES.GRASS, category: MOVE_CATEGORIES.SPECIAL, power: 120, accuracy: 100, pp: 10, charge: true },
        leaf_storm: { name: 'Leaf Storm', type: TYPES.GRASS, category: MOVE_CATEGORIES.SPECIAL, power: 130, accuracy: 90, pp: 5 },

        // Electric moves
        thunder_shock: { name: 'Thunder Shock', type: TYPES.ELECTRIC, category: MOVE_CATEGORIES.SPECIAL, power: 40, accuracy: 100, pp: 30 },
        thunderbolt: { name: 'Thunderbolt', type: TYPES.ELECTRIC, category: MOVE_CATEGORIES.SPECIAL, power: 90, accuracy: 100, pp: 15 },
        thunder: { name: 'Thunder', type: TYPES.ELECTRIC, category: MOVE_CATEGORIES.SPECIAL, power: 110, accuracy: 70, pp: 10, effect: 'paralyze' },
        volt_tackle: { name: 'Volt Tackle', type: TYPES.ELECTRIC, category: MOVE_CATEGORIES.PHYSICAL, power: 120, accuracy: 100, pp: 15, recoil: 0.33 },

        // Ice moves
        ice_shard: { name: 'Ice Shard', type: TYPES.ICE, category: MOVE_CATEGORIES.PHYSICAL, power: 40, accuracy: 100, pp: 30, priority: 1 },
        ice_beam: { name: 'Ice Beam', type: TYPES.ICE, category: MOVE_CATEGORIES.SPECIAL, power: 90, accuracy: 100, pp: 10 },
        blizzard: { name: 'Blizzard', type: TYPES.ICE, category: MOVE_CATEGORIES.SPECIAL, power: 110, accuracy: 70, pp: 5, effect: 'freeze' },

        // Fighting moves
        karate_chop: { name: 'Karate Chop', type: TYPES.FIGHTING, category: MOVE_CATEGORIES.PHYSICAL, power: 50, accuracy: 100, pp: 25 },
        brick_break: { name: 'Brick Break', type: TYPES.FIGHTING, category: MOVE_CATEGORIES.PHYSICAL, power: 75, accuracy: 100, pp: 15 },
        close_combat: { name: 'Close Combat', type: TYPES.FIGHTING, category: MOVE_CATEGORIES.PHYSICAL, power: 120, accuracy: 100, pp: 5, statChange: { def: -1, spdef: -1 } },

        // Poison moves
        poison_sting: { name: 'Poison Sting', type: TYPES.POISON, category: MOVE_CATEGORIES.PHYSICAL, power: 15, accuracy: 100, pp: 35, effect: 'poison' },
        sludge_bomb: { name: 'Sludge Bomb', type: TYPES.POISON, category: MOVE_CATEGORIES.SPECIAL, power: 90, accuracy: 100, pp: 10 },
        toxic: { name: 'Toxic', type: TYPES.POISON, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 90, pp: 10, effect: 'badly_poison' },

        // Psychic moves
        confusion: { name: 'Confusion', type: TYPES.PSYCHIC, category: MOVE_CATEGORIES.SPECIAL, power: 50, accuracy: 100, pp: 25 },
        psychic: { name: 'Psychic', type: TYPES.PSYCHIC, category: MOVE_CATEGORIES.SPECIAL, power: 90, accuracy: 100, pp: 10 },
        future_sight: { name: 'Future Sight', type: TYPES.PSYCHIC, category: MOVE_CATEGORIES.SPECIAL, power: 120, accuracy: 100, pp: 10, delayed: 2 },

        // Dragon moves
        dragon_rage: { name: 'Dragon Rage', type: TYPES.DRAGON, category: MOVE_CATEGORIES.SPECIAL, power: 0, accuracy: 100, pp: 10, fixedDamage: 40 },
        dragon_claw: { name: 'Dragon Claw', type: TYPES.DRAGON, category: MOVE_CATEGORIES.PHYSICAL, power: 80, accuracy: 100, pp: 15 },
        draco_meteor: { name: 'Draco Meteor', type: TYPES.DRAGON, category: MOVE_CATEGORIES.SPECIAL, power: 130, accuracy: 90, pp: 5, statChange: { spatk: -2 } },
        outrage: { name: 'Outrage', type: TYPES.DRAGON, category: MOVE_CATEGORIES.PHYSICAL, power: 120, accuracy: 100, pp: 10, rampage: 3 },

        // Dark moves
        bite: { name: 'Bite', type: TYPES.DARK, category: MOVE_CATEGORIES.PHYSICAL, power: 60, accuracy: 100, pp: 25 },
        crunch: { name: 'Crunch', type: TYPES.DARK, category: MOVE_CATEGORIES.PHYSICAL, power: 80, accuracy: 100, pp: 15 },
        dark_pulse: { name: 'Dark Pulse', type: TYPES.DARK, category: MOVE_CATEGORIES.SPECIAL, power: 80, accuracy: 100, pp: 15 },

        // Ghost moves
        shadow_ball: { name: 'Shadow Ball', type: TYPES.GHOST, category: MOVE_CATEGORIES.SPECIAL, power: 80, accuracy: 100, pp: 15 },
        shadow_claw: { name: 'Shadow Claw', type: TYPES.GHOST, category: MOVE_CATEGORIES.PHYSICAL, power: 70, accuracy: 100, pp: 15 },
        phantom_force: { name: 'Phantom Force', type: TYPES.GHOST, category: MOVE_CATEGORIES.PHYSICAL, power: 90, accuracy: 100, pp: 10, vanish: true },

        // Status moves
        sword_dance: { name: 'Sword Dance', type: TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100, pp: 20, statChange: { atk: 2 } },
        iron_defense: { name: 'Iron Defense', type: TYPES.STEEL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100, pp: 15, statChange: { def: 2 } },
        calm_mind: { name: 'Calm Mind', type: TYPES.PSYCHIC, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100, pp: 20, statChange: { spatk: 1, spdef: 1 } },
        recover: { name: 'Recover', type: TYPES.NORMAL, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100, pp: 10, heal: 0.5 },

        // 🎪 UNIQUE: Chaos Moves (require Chaos Energy)
        reality_break: { name: 'Reality Break', type: TYPES.PSYCHIC, category: MOVE_CATEGORIES.CHAOS, power: 100, accuracy: 100, pp: 5, chaosRequired: 50, effect: 'Randomly changes terrain' },
        void_rend: { name: 'Void Rend', type: TYPES.DARK, category: MOVE_CATEGORIES.CHAOS, power: 120, accuracy: 90, pp: 5, chaosRequired: 75, effect: 'Steals 20% of enemy max HP permanently' },
        time_fracture: { name: 'Time Fracture', type: TYPES.PSYCHIC, category: MOVE_CATEGORIES.TEMPORAL, power: 80, accuracy: 100, pp: 3, chaosRequired: 100, effect: 'Next turn happens twice' },
        chaos_storm: { name: 'Chaos Storm', type: TYPES.NORMAL, category: MOVE_CATEGORIES.CHAOS, power: 0, accuracy: 100, pp: 8, chaosRequired: 40, effect: 'Hits with random type at random power (50-150)' },

        // 🎪 UNIQUE: Corruption Moves (gain power, risk corruption)
        soul_drain: { name: 'Soul Drain', type: TYPES.GHOST, category: MOVE_CATEGORIES.SPECIAL, power: 60, accuracy: 100, pp: 10, corruption: 10, effect: 'Heals 50% of damage dealt, +10 corruption' },
        dark_pact: { name: 'Dark Pact', type: TYPES.DARK, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100, pp: 5, corruption: 25, effect: 'Double attack for 3 turns, +25 corruption' },
        forbidden_art: { name: 'Forbidden Art', type: TYPES.DARK, category: MOVE_CATEGORIES.SPECIAL, power: 200, accuracy: 80, pp: 1, corruption: 50, effect: 'Massive damage but 50% HP recoil and +50 corruption' },

        // 🎪 UNIQUE: Resonance Moves (combo chains)
        resonance_strike: { name: 'Resonance Strike', type: TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 60, accuracy: 100, pp: 20, resonance: 1.5, effect: 'Next move deals 1.5x damage' },
        echo_wave: { name: 'Echo Wave', type: TYPES.PSYCHIC, category: MOVE_CATEGORIES.SPECIAL, power: 70, accuracy: 100, pp: 15, echo: 2, effect: 'Repeats this move for 2 more turns' },
        chain_lightning: { name: 'Chain Lightning', type: TYPES.ELECTRIC, category: MOVE_CATEGORIES.SPECIAL, power: 40, accuracy: 100, pp: 15, chain: true, effect: 'Hits 1-5 times, each hit increases power by 10' },

        // 🎪 UNIQUE: Terrain Manipulation
        summon_volcano: { name: 'Summon Volcano', type: TYPES.FIRE, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100, pp: 3, effect: 'Changes terrain to Volcanic for 5 turns' },
        flood_arena: { name: 'Flood Arena', type: TYPES.WATER, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100, pp: 3, effect: 'Changes terrain to Flooded for 5 turns' },
        corrupt_reality: { name: 'Corrupt Reality', type: TYPES.DARK, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 100, pp: 2, corruption: 15, effect: 'Changes terrain to Corrupted for 5 turns' },

        // 🎪 UNIQUE: Stat Theft (permanent!)
        devour_strength: { name: 'Devour Strength', type: TYPES.DARK, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 90, pp: 5, corruption: 10, effect: 'Permanently steal 10% enemy ATK' },
        consume_essence: { name: 'Consume Essence', type: TYPES.GHOST, category: MOVE_CATEGORIES.STATUS, power: 0, accuracy: 85, pp: 3, corruption: 20, effect: 'Permanently steal 15% enemy SPATK' },

        // 🎪 UNIQUE: Gamble Moves (high risk, high reward)
        all_or_nothing: { name: 'All or Nothing', type: TYPES.NORMAL, category: MOVE_CATEGORIES.PHYSICAL, power: 0, accuracy: 50, pp: 5, effect: 'Either deals 250 damage or misses completely' },
        fate_dice: { name: 'Fate Dice', type: TYPES.PSYCHIC, category: MOVE_CATEGORIES.SPECIAL, power: 0, accuracy: 100, pp: 10, effect: 'Random effect: heal 50%, deal 150 dmg, lose turn, or gain 50 chaos' },
    };

    // Boss definitions with types and movesets
    const BOSSES = {
        goblin_chief: {
            id: 'goblin_chief',
            name: 'Goblin Chief',
            icon: Icons.monsters.goblin_chief,
            level: 15,
            types: [TYPES.FIGHTING, TYPES.DARK],
            baseStats: { hp: 500, atk: 80, def: 60, spatk: 40, spdef: 50, speed: 70 },
            moves: ['slash', 'brick_break', 'bite', 'sword_dance', 'resonance_strike', 'all_or_nothing'],
            terrain: TERRAINS.NORMAL,
            drops: [
                { itemId: 'goblin_ear', quantity: 5, chance: 1.0 },
                { itemId: 'iron_sword', quantity: 1, chance: 0.3 },
                { itemId: 'gold_ring', quantity: 1, chance: 0.2 }
            ],
            exp: 1500,
            gold: 750
        },

        dungeon_boss: {
            id: 'dungeon_boss',
            name: 'Lich King',
            icon: Icons.monsters.dungeon_boss,
            level: 40,
            types: [TYPES.GHOST, TYPES.PSYCHIC],
            baseStats: { hp: 1200, atk: 60, def: 80, spatk: 140, spdef: 120, speed: 85 },
            moves: ['shadow_ball', 'psychic', 'soul_drain', 'consume_essence', 'corrupt_reality', 'echo_wave', 'recover'],
            terrain: TERRAINS.CORRUPTED,
            drops: [
                { itemId: 'boss_essence', quantity: 1, chance: 1.0 },
                { itemId: 'mythril_sword', quantity: 1, chance: 0.5 },
                { itemId: 'power_elixir', quantity: 3, chance: 0.8 }
            ],
            exp: 5000,
            gold: 2500
        },

        dragon: {
            id: 'dragon',
            name: 'Ancient Dragon',
            icon: Icons.monsters.dragon,
            level: 60,
            types: [TYPES.DRAGON, TYPES.FIRE],
            baseStats: { hp: 2000, atk: 150, def: 120, spatk: 160, spdef: 110, speed: 100 },
            moves: ['dragon_claw', 'flamethrower', 'fire_blast', 'outrage', 'draco_meteor', 'summon_volcano', 'reality_break', 'chaos_storm'],
            terrain: TERRAINS.VOLCANIC,
            drops: [
                { itemId: 'dragon_scale', quantity: 5, chance: 1.0 },
                { itemId: 'dragon_slayer', quantity: 1, chance: 0.15 },
                { itemId: 'boss_essence', quantity: 3, chance: 1.0 },
                { itemId: 'diamond', quantity: 3, chance: 0.5 }
            ],
            exp: 25000,
            gold: 10000
        }
    };

    // Combat state
    let currentBattle = null;

    /**
     * Calculate type effectiveness
     */
    function getTypeEffectiveness(attackType, defenderTypes) {
        let effectiveness = 1.0;

        defenderTypes.forEach(defType => {
            if (TYPE_CHART[attackType] && TYPE_CHART[attackType][defType] !== undefined) {
                effectiveness *= TYPE_CHART[attackType][defType];
            }
        });

        return effectiveness;
    }

    /**
     * Calculate damage with UNIQUE mechanics
     */
    function calculateDamage(attacker, defender, move, isPlayer) {
        const attackerKey = isPlayer ? 'player' : 'boss';
        const defenderKey = isPlayer ? 'boss' : 'player';

        // Handle STATUS moves separately
        if (move.category === MOVE_CATEGORIES.STATUS) {
            return { damage: 0, statusOnly: true };
        }

        // 🎪 UNIQUE: Gamble moves
        if (move.id === 'all_or_nothing') {
            const hit = Math.random() < 0.5;
            return {
                damage: hit ? 250 : 0,
                hit,
                critical: false,
                effectiveness: 1,
                special: `All or Nothing ${hit ? 'HIT!' : 'MISSED!'}`
            };
        }

        if (move.id === 'fate_dice') {
            const roll = Math.floor(Math.random() * 4);
            const effects = [
                { damage: 0, special: 'Fate Dice: Healed 50%!', heal: 0.5 },
                { damage: 150, special: 'Fate Dice: Struck for 150!' },
                { damage: 0, special: 'Fate Dice: Lost turn!', lostTurn: true },
                { damage: 0, special: 'Fate Dice: Gained 50 Chaos!', chaos: 50 }
            ];
            const result = effects[roll];

            if (result.heal) {
                attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + Math.floor(attacker.maxHp * result.heal));
            }
            if (result.chaos) {
                currentBattle.chaosEnergy[attackerKey] += result.chaos;
            }

            return { ...result, critical: false, effectiveness: 1 };
        }

        // 🎪 UNIQUE: Chaos Storm (random type and power)
        if (move.id === 'chaos_storm') {
            const randomTypes = Object.values(TYPES);
            const randomType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
            const randomPower = 50 + Math.floor(Math.random() * 101); // 50-150
            move = { ...move, type: randomType, power: randomPower };
        }

        // Base damage calculation
        const level = attacker.level;
        let attack = move.category === MOVE_CATEGORIES.PHYSICAL ? attacker.stats.atk : attacker.stats.spatk;
        let defense = move.category === MOVE_CATEGORIES.PHYSICAL ? defender.stats.def : defender.stats.spdef;

        // 🎪 UNIQUE: Apply stolen stats
        if (currentBattle.stolenStats[attackerKey].atk) {
            attack += currentBattle.stolenStats[attackerKey].atk;
        }
        if (currentBattle.stolenStats[attackerKey].spatk) {
            attack += currentBattle.stolenStats[attackerKey].spatk;
        }
        if (currentBattle.stolenStats[defenderKey].atk) {
            defense -= currentBattle.stolenStats[defenderKey].atk;
        }
        if (currentBattle.stolenStats[defenderKey].spatk) {
            defense -= currentBattle.stolenStats[defenderKey].spatk;
        }

        let power = move.power;
        let effectiveness = getTypeEffectiveness(move.type, defender.types);

        // 🎪 UNIQUE: Apply terrain effects
        const terrain = currentBattle.terrain;
        if (terrain && terrain.effects) {
            // Type bonuses/penalties
            if (terrain.effects[move.type]) {
                power *= terrain.effects[move.type];
            }

            // Physical penalty (Ethereal Plane)
            if (terrain.effects.physical_penalty && move.category === MOVE_CATEGORIES.PHYSICAL) {
                power *= terrain.effects.physical_penalty;
            }

            // Chaotic Vortex - random effects
            if (terrain.effects.random) {
                power *= 0.5 + Math.random(); // 0.5x to 1.5x
                effectiveness *= 0.5 + Math.random(); // random effectiveness
            }
        }

        // STAB (Same Type Attack Bonus)
        const stab = attacker.types.includes(move.type) ? 1.5 : 1.0;

        // Critical hit (10% chance, 1.5x damage)
        const critical = Math.random() < 0.1 ? 1.5 : 1.0;

        // Random factor (0.85 - 1.0)
        const random = 0.85 + Math.random() * 0.15;

        // 🎪 UNIQUE: Resonance multiplier (from previous turn)
        const resonance = currentBattle.resonanceMultiplier[attackerKey];

        // 🎪 UNIQUE: Combo chain multiplier
        const comboBonus = 1 + (currentBattle.comboChain[attackerKey] * 0.1); // +10% per combo

        const baseDamage = ((((2 * level) / 5) + 2) * power * (attack / defense)) / 50 + 2;
        let damage = Math.floor(baseDamage * stab * effectiveness * critical * random * resonance * comboBonus);

        // 🎪 UNIQUE: Chain Lightning - multi-hit
        if (move.chain) {
            const hits = 1 + Math.floor(Math.random() * 5); // 1-5 hits
            let totalDamage = 0;
            for (let i = 0; i < hits; i++) {
                totalDamage += damage + (i * 10); // Each hit +10 damage
            }
            damage = totalDamage;
            return {
                damage,
                effectiveness,
                critical: critical > 1,
                stab: stab > 1,
                special: `Chain Lightning hit ${hits} times!`,
                hits
            };
        }

        return {
            damage,
            effectiveness,
            critical: critical > 1,
            stab: stab > 1,
            resonance: resonance > 1,
            combo: currentBattle.comboChain[attackerKey] > 0
        };
    }

    /**
     * 🎪 UNIQUE: Process special move effects
     */
    function processMoveEffects(move, attacker, defender, isPlayer, damageResult) {
        const attackerKey = isPlayer ? 'player' : 'boss';
        const defenderKey = isPlayer ? 'boss' : 'player';
        const effects = [];

        // 🎪 Corruption moves
        if (move.corruption) {
            currentBattle.corruption[attackerKey] += move.corruption;
            effects.push(`+${move.corruption} Corruption!`);

            // Corruption consequences at high levels
            if (currentBattle.corruption[attackerKey] >= 100) {
                effects.push('⚠️ FULLY CORRUPTED! Taking damage!');
                attacker.currentHp -= Math.floor(attacker.maxHp * 0.1);
            }
        }

        // 🎪 Chaos energy generation
        if (move.category === MOVE_CATEGORIES.CHAOS) {
            // Chaos moves consume energy
            currentBattle.chaosEnergy[attackerKey] -= move.chaosRequired || 0;
        } else {
            // Normal moves generate small chaos
            currentBattle.chaosEnergy[attackerKey] += 5;
        }

        // Terrain effects generate chaos/corruption
        const terrain = currentBattle.terrain;
        if (terrain && terrain.effects) {
            if (terrain.effects.chaos_gain) {
                currentBattle.chaosEnergy[attackerKey] += terrain.effects.chaos_gain;
            }
            if (terrain.effects.corruption_gain) {
                currentBattle.corruption[attackerKey] += terrain.effects.corruption_gain;
                effects.push(`+${terrain.effects.corruption_gain} Corruption from terrain!`);
            }
        }

        // 🎪 Resonance effect (boosts next move)
        if (move.resonance) {
            currentBattle.resonanceMultiplier[attackerKey] = move.resonance;
            effects.push(`Next move deals ${Math.floor((move.resonance - 1) * 100)}% more damage!`);
        } else {
            // Reset resonance after using it
            currentBattle.resonanceMultiplier[attackerKey] = 1.0;
        }

        // 🎪 Combo chain
        if (move.chain || currentBattle.comboChain[attackerKey] > 0) {
            currentBattle.comboChain[attackerKey]++;
            effects.push(`Combo x${currentBattle.comboChain[attackerKey]}!`);
        } else {
            currentBattle.comboChain[attackerKey] = 0;
        }

        // 🎪 Echo moves (repeat for multiple turns)
        if (move.echo) {
            currentBattle.echoMoves[attackerKey].push({ moveId: move.id, turnsLeft: move.echo });
            effects.push(`Echo: will repeat ${move.echo} more times!`);
        }

        // 🎪 Stat theft (PERMANENT!)
        if (move.effect && move.effect.includes('steal')) {
            if (move.effect.includes('ATK')) {
                const stolen = Math.floor(defender.stats.atk * 0.1);
                currentBattle.stolenStats[attackerKey].atk += stolen;
                currentBattle.stolenStats[defenderKey].atk += stolen; // Defender loses it
                effects.push(`Stole ${stolen} ATK permanently!`);
            }
            if (move.effect.includes('SPATK')) {
                const stolen = Math.floor(defender.stats.spatk * 0.15);
                currentBattle.stolenStats[attackerKey].spatk += stolen;
                currentBattle.stolenStats[defenderKey].spatk += stolen;
                effects.push(`Stole ${stolen} SPATK permanently!`);
            }
        }

        // 🎪 Terrain changes
        if (move.effect && move.effect.includes('terrain')) {
            if (move.id === 'summon_volcano') {
                currentBattle.terrain = TERRAINS.VOLCANIC;
                currentBattle.terrainTurnsLeft = 5;
                effects.push('🌋 The arena becomes a VOLCANIC WASTELAND!');
            } else if (move.id === 'flood_arena') {
                currentBattle.terrain = TERRAINS.FLOODED;
                currentBattle.terrainTurnsLeft = 5;
                effects.push('🌊 The arena FLOODS with water!');
            } else if (move.id === 'corrupt_reality') {
                currentBattle.terrain = TERRAINS.CORRUPTED;
                currentBattle.terrainTurnsLeft = 5;
                effects.push('💀 Reality becomes CORRUPTED!');
            } else if (move.id === 'reality_break') {
                // Random terrain
                const terrains = [TERRAINS.VOLCANIC, TERRAINS.FLOODED, TERRAINS.FROZEN, TERRAINS.ETHEREAL, TERRAINS.CHAOTIC];
                currentBattle.terrain = terrains[Math.floor(Math.random() * terrains.length)];
                currentBattle.terrainTurnsLeft = 5;
                effects.push(`🎲 Reality BREAKS! Terrain: ${currentBattle.terrain.name}!`);
            }
        }

        // 🎪 Healing effects
        if (move.heal) {
            const healAmount = Math.floor(attacker.maxHp * move.heal);
            attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + healAmount);
            effects.push(`Healed ${healAmount} HP!`);
        }

        // Soul Drain - heals based on damage
        if (move.id === 'soul_drain' && damageResult.damage > 0) {
            const healAmount = Math.floor(damageResult.damage * 0.5);
            attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + healAmount);
            effects.push(`Drained ${healAmount} HP!`);
        }

        // 🎪 Void Rend - steals max HP
        if (move.id === 'void_rend') {
            const stolen = Math.floor(defender.maxHp * 0.2);
            defender.maxHp -= stolen;
            defender.currentHp = Math.min(defender.currentHp, defender.maxHp);
            attacker.maxHp += stolen;
            effects.push(`⚫ Stole ${stolen} MAX HP permanently!`);
        }

        // 🎪 Dark Pact - double attack buff
        if (move.id === 'dark_pact') {
            attacker.stats.atk *= 2;
            attacker.stats.spatk *= 2;
            effects.push('💥 Attack DOUBLED for 3 turns!');
            // TODO: Track duration and remove after 3 turns
        }

        // 🎪 Forbidden Art - massive recoil
        if (move.id === 'forbidden_art') {
            const recoil = Math.floor(attacker.maxHp * 0.5);
            attacker.currentHp -= recoil;
            effects.push(`💔 Suffered ${recoil} recoil damage!`);
        }

        return effects;
    }

    /**
     * Start a boss battle
     */
    function startBossBattle(bossId, charIndex) {
        const boss = BOSSES[bossId];
        if (!boss) return null;

        const character = Character.getByIndex(charIndex);
        if (!character) return null;

        // Initialize boss stats
        const bossInstance = {
            ...boss,
            stats: { ...boss.baseStats },
            currentHp: boss.baseStats.hp,
            maxHp: boss.baseStats.hp,
            statStages: { atk: 0, def: 0, spatk: 0, spdef: 0, speed: 0 },
            status: null,
            ppRemaining: {}
        };

        // Initialize PP for boss moves
        boss.moves.forEach(moveId => {
            const move = MOVES[moveId];
            if (move) {
                bossInstance.ppRemaining[moveId] = move.pp;
            }
        });

        // Initialize player based on equipment and class
        const playerTypes = getPlayerTypes(character);
        const playerMoves = getPlayerMoves(character);

        const player = {
            name: character.name,
            level: character.level,
            types: playerTypes,
            stats: getPlayerCombatStats(character),
            currentHp: character.hp,
            maxHp: character.maxHp,
            statStages: { atk: 0, def: 0, spatk: 0, spdef: 0, speed: 0 },
            status: null,
            moves: playerMoves,
            ppRemaining: {}
        };

        // Initialize PP for player moves
        playerMoves.forEach(moveId => {
            const move = MOVES[moveId];
            if (move) {
                player.ppRemaining[moveId] = move.pp;
            }
        });

        // 🎪 UNIQUE: Initialize battle state with unique mechanics
        currentBattle = {
            boss: bossInstance,
            player,
            turn: 1,
            playerTurn: true,
            log: [],
            charIndex,
            // Unique mechanics tracking
            chaosEnergy: { player: 0, boss: 0 },
            corruption: { player: 0, boss: 0 },
            terrain: boss.terrain,
            terrainTurnsLeft: 999, // Initial terrain lasts whole battle
            resonanceMultiplier: { player: 1.0, boss: 1.0 },
            echoMoves: { player: [], boss: [] },
            comboChain: { player: 0, boss: 0 },
            stolenStats: { player: { atk: 0, spatk: 0 }, boss: { atk: 0, spatk: 0 } }
        };

        return currentBattle;
    }

    /**
     * Get player combat types based on class and equipment
     */
    function getPlayerTypes(character) {
        const cls = Character.getClass(character.class);
        const types = [];

        // Base type from class
        if (cls.id === 'warrior') types.push(TYPES.FIGHTING);
        else if (cls.id === 'mage') types.push(TYPES.PSYCHIC);
        else if (cls.id === 'ranger') types.push(TYPES.FLYING);
        else types.push(TYPES.NORMAL);

        // Secondary type from equipment
        const weapon = character.equipment.weapon;
        if (weapon) {
            if (weapon.includes('fire') || weapon.includes('flame')) types.push(TYPES.FIRE);
            else if (weapon.includes('ice') || weapon.includes('frost')) types.push(TYPES.ICE);
            else if (weapon.includes('dragon')) types.push(TYPES.DRAGON);
            else if (weapon.includes('shadow') || weapon.includes('dark')) types.push(TYPES.DARK);
        }

        if (types.length === 0) types.push(TYPES.NORMAL);
        return types.slice(0, 2); // Max 2 types
    }

    /**
     * Get player available moves based on class and equipment
     */
    function getPlayerMoves(character) {
        const cls = Character.getClass(character.class);
        const moves = [];

        // Basic move
        moves.push('tackle');

        // Class-based moves
        if (cls.id === 'warrior') {
            moves.push('slash', 'brick_break', 'sword_dance');
        } else if (cls.id === 'mage') {
            moves.push('flamethrower', 'psychic', 'calm_mind');
        } else if (cls.id === 'ranger') {
            moves.push('razor_leaf', 'ice_beam', 'thunderbolt');
        }

        return moves.slice(0, 4); // Max 4 moves
    }

    /**
     * Get player combat stats
     */
    function getPlayerCombatStats(character) {
        const baseStats = character.stats;

        return {
            hp: character.maxHp,
            atk: Math.floor(baseStats.str * 2 + baseStats.agi * 0.5),
            def: Math.floor(baseStats.str + baseStats.agi * 0.5),
            spatk: Math.floor(baseStats.wis * 2),
            spdef: Math.floor(baseStats.wis + baseStats.luk * 0.5),
            speed: Math.floor(baseStats.agi * 2 + baseStats.luk * 0.5)
        };
    }

    /**
     * Execute a turn with UNIQUE mechanics
     */
    function executeTurn(moveId) {
        if (!currentBattle || !currentBattle.playerTurn) return null;

        const move = MOVES[moveId];
        if (!move) return null;

        const { player, boss } = currentBattle;

        // 🎪 Check PP
        if (player.ppRemaining[moveId] <= 0) {
            return { error: 'No PP remaining for this move!' };
        }

        // 🎪 Check Chaos Energy requirement
        if (move.chaosRequired && currentBattle.chaosEnergy.player < move.chaosRequired) {
            return { error: `Need ${move.chaosRequired} Chaos Energy! (Current: ${currentBattle.chaosEnergy.player})` };
        }

        // 🎪 Process echo moves first
        const echoResults = [];
        if (currentBattle.echoMoves.player.length > 0) {
            currentBattle.echoMoves.player = currentBattle.echoMoves.player.filter(echo => {
                if (echo.turnsLeft > 0) {
                    const echoMove = MOVES[echo.moveId];
                    const echoResult = calculateDamage(player, boss, echoMove, true);
                    boss.currentHp = Math.max(0, boss.currentHp - echoResult.damage);
                    echoResults.push({ move: echoMove.name, ...echoResult });
                    echo.turnsLeft--;
                    return echo.turnsLeft > 0;
                }
                return false;
            });
        }

        // Player attacks
        player.ppRemaining[moveId]--;
        const playerResult = calculateDamage(player, boss, { ...move, id: moveId }, true);
        boss.currentHp = Math.max(0, boss.currentHp - playerResult.damage);

        // 🎪 Process special effects
        const playerEffects = processMoveEffects({ ...move, id: moveId }, player, boss, true, playerResult);

        currentBattle.log.push({
            attacker: 'player',
            move: move.name,
            ...playerResult,
            effects: playerEffects,
            echoResults
        });

        // 🎪 Decrease terrain duration
        if (currentBattle.terrainTurnsLeft > 0) {
            currentBattle.terrainTurnsLeft--;
            if (currentBattle.terrainTurnsLeft === 0) {
                currentBattle.terrain = TERRAINS.NORMAL;
            }
        }

        // Check if boss defeated
        if (boss.currentHp <= 0) {
            return endBattle(true);
        }

        // Boss attacks
        currentBattle.playerTurn = false;
        setTimeout(() => {
            const bossMove = chooseBossMove();
            if (bossMove) {
                // 🎪 Process boss echo moves
                const bossEchoResults = [];
                if (currentBattle.echoMoves.boss.length > 0) {
                    currentBattle.echoMoves.boss = currentBattle.echoMoves.boss.filter(echo => {
                        if (echo.turnsLeft > 0) {
                            const echoMove = MOVES[echo.moveId];
                            const echoResult = calculateDamage(boss, player, echoMove, false);
                            player.currentHp = Math.max(0, player.currentHp - echoResult.damage);
                            bossEchoResults.push({ move: echoMove.name, ...echoResult });
                            echo.turnsLeft--;
                            return echo.turnsLeft > 0;
                        }
                        return false;
                    });
                }

                boss.ppRemaining[bossMove.id]--;
                const bossResult = calculateDamage(boss, player, bossMove, false);
                player.currentHp = Math.max(0, player.currentHp - bossResult.damage);

                // 🎪 Process boss special effects
                const bossEffects = processMoveEffects(bossMove, boss, player, false, bossResult);

                currentBattle.log.push({
                    attacker: 'boss',
                    move: bossMove.name,
                    ...bossResult,
                    effects: bossEffects,
                    echoResults: bossEchoResults
                });

                // Check if player defeated
                if (player.currentHp <= 0) {
                    return endBattle(false);
                }

                currentBattle.turn++;
                currentBattle.playerTurn = true;
            }
        }, 1500);

        return currentBattle;
    }

    /**
     * 🎪 Boss AI - choose a move with UNIQUE mechanics awareness
     */
    function chooseBossMove() {
        const { boss, player } = currentBattle;
        let availableMoves = boss.moves
            .map(moveId => ({ id: moveId, ...MOVES[moveId] }))
            .filter(move => boss.ppRemaining[move.id] > 0);

        if (availableMoves.length === 0) return null;

        // 🎪 Filter out chaos moves if not enough energy
        availableMoves = availableMoves.filter(move => {
            if (move.chaosRequired) {
                return currentBattle.chaosEnergy.boss >= move.chaosRequired;
            }
            return true;
        });

        // 🎪 Prioritize healing if low HP
        if (boss.currentHp < boss.maxHp * 0.3) {
            const healMoves = availableMoves.filter(move => move.heal || move.id === 'soul_drain');
            if (healMoves.length > 0) {
                return healMoves[0];
            }
        }

        // 🎪 Use terrain-changing moves strategically
        const currentTerrain = currentBattle.terrain;
        if (currentTerrain === TERRAINS.NORMAL || currentBattle.terrainTurnsLeft < 2) {
            const terrainMoves = availableMoves.filter(move =>
                move.id === 'summon_volcano' || move.id === 'corrupt_reality' || move.id === 'reality_break'
            );
            if (terrainMoves.length > 0 && Math.random() < 0.4) {
                return terrainMoves[Math.floor(Math.random() * terrainMoves.length)];
            }
        }

        // 🎪 Use resonance to set up big moves
        if (currentBattle.resonanceMultiplier.boss === 1.0) {
            const resonanceMoves = availableMoves.filter(move => move.resonance);
            if (resonanceMoves.length > 0 && Math.random() < 0.3) {
                return resonanceMoves[0];
            }
        }

        // 🎪 Use chaos moves when energy is high
        if (currentBattle.chaosEnergy.boss >= 75) {
            const chaosMoves = availableMoves.filter(move =>
                move.category === MOVE_CATEGORIES.CHAOS && move.chaosRequired <= currentBattle.chaosEnergy.boss
            );
            if (chaosMoves.length > 0 && Math.random() < 0.5) {
                return chaosMoves[Math.floor(Math.random() * chaosMoves.length)];
            }
        }

        // 🎪 Use corruption moves if corruption is low
        if (currentBattle.corruption.boss < 50) {
            const corruptionMoves = availableMoves.filter(move => move.corruption);
            if (corruptionMoves.length > 0 && Math.random() < 0.4) {
                return corruptionMoves[Math.floor(Math.random() * corruptionMoves.length)];
            }
        }

        // Standard AI: prefer super-effective moves
        const effectiveMoves = availableMoves.filter(move => {
            const effectiveness = getTypeEffectiveness(move.type, player.types);
            return effectiveness > 1.0;
        });

        if (effectiveMoves.length > 0 && Math.random() < 0.7) {
            return effectiveMoves[Math.floor(Math.random() * effectiveMoves.length)];
        }

        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    /**
     * End the battle
     */
    function endBattle(playerWon) {
        const { boss, player, charIndex } = currentBattle;

        const result = {
            won: playerWon,
            boss: boss.name,
            turns: currentBattle.turn,
            log: currentBattle.log
        };

        if (playerWon) {
            // Award exp and gold
            Character.addExp(charIndex, boss.exp);
            Inventory.addGold(boss.gold);

            // Award drops
            result.drops = [];
            boss.drops.forEach(drop => {
                if (Math.random() < drop.chance) {
                    Inventory.addItem(drop.itemId, drop.quantity);
                    result.drops.push({ itemId: drop.itemId, quantity: drop.quantity });
                }
            });

            // Track zone fatigue (boss kill)
            if (typeof ZoneFatigue !== 'undefined' && currentBattle.zoneId) {
                ZoneFatigue.increaseFatigue(currentBattle.zoneId, 0, true);
            }

            // Track class evolution (boss kill)
            if (typeof ClassEvolution !== 'undefined') {
                ClassEvolution.trackAction('damage_dealt', { amount: 1000, type: boss.types[0] });
            }
        } else {
            // Player defeated - maybe lose some gold or items
            const goldLost = Math.floor(Inventory.getGold() * 0.1);
            if (goldLost > 0) {
                Inventory.removeGold(goldLost);
                result.goldLost = goldLost;
            }
        }

        // Apply corruption from battle
        if (typeof Corruption !== 'undefined' && currentBattle.corruption) {
            const corruptionGain = currentBattle.corruption.player;
            if (corruptionGain > 0) {
                Corruption.increaseCorruption(corruptionGain);
                result.corruptionGained = corruptionGain;
            }
        }

        currentBattle = null;
        return result;
    }

    /**
     * Get current battle state
     */
    function getCurrentBattle() {
        return currentBattle;
    }

    /**
     * Get all moves
     */
    function getAllMoves() {
        return MOVES;
    }

    /**
     * Get all boss definitions
     */
    function getAllBosses() {
        return BOSSES;
    }

    // Public API
    return {
        TYPES,
        MOVE_CATEGORIES,
        startBossBattle,
        executeTurn,
        getCurrentBattle,
        getTypeEffectiveness,
        getAllMoves,
        getAllBosses,
        BOSSES
    };
})();
