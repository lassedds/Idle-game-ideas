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
        STATUS: 'status'
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
            moves: ['slash', 'brick_break', 'bite', 'sword_dance'],
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
            moves: ['shadow_ball', 'psychic', 'dark_pulse', 'calm_mind', 'recover'],
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
            moves: ['dragon_claw', 'flamethrower', 'fire_blast', 'outrage', 'draco_meteor'],
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
     * Calculate damage
     */
    function calculateDamage(attacker, defender, move) {
        if (move.category === MOVE_CATEGORIES.STATUS) return 0;
        if (move.fixedDamage) return move.fixedDamage;

        const level = attacker.level;
        const attack = move.category === MOVE_CATEGORIES.PHYSICAL ? attacker.stats.atk : attacker.stats.spatk;
        const defense = move.category === MOVE_CATEGORIES.PHYSICAL ? defender.stats.def : defender.stats.spdef;

        const power = move.power;
        const effectiveness = getTypeEffectiveness(move.type, defender.types);

        // STAB (Same Type Attack Bonus)
        const stab = attacker.types.includes(move.type) ? 1.5 : 1.0;

        // Critical hit (10% chance, 1.5x damage)
        const critical = Math.random() < 0.1 ? 1.5 : 1.0;

        // Random factor (0.85 - 1.0)
        const random = 0.85 + Math.random() * 0.15;

        const baseDamage = ((((2 * level) / 5) + 2) * power * (attack / defense)) / 50 + 2;
        const damage = Math.floor(baseDamage * stab * effectiveness * critical * random);

        return {
            damage,
            effectiveness,
            critical: critical > 1,
            stab: stab > 1
        };
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

        currentBattle = {
            boss: bossInstance,
            player,
            turn: 1,
            playerTurn: true,
            log: [],
            charIndex
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
     * Execute a turn
     */
    function executeTurn(moveId) {
        if (!currentBattle || !currentBattle.playerTurn) return null;

        const move = MOVES[moveId];
        if (!move) return null;

        const { player, boss } = currentBattle;

        // Check PP
        if (player.ppRemaining[moveId] <= 0) {
            return { error: 'No PP remaining for this move!' };
        }

        // Player attacks
        player.ppRemaining[moveId]--;
        const playerResult = calculateDamage(player, boss, move);
        boss.currentHp = Math.max(0, boss.currentHp - playerResult.damage);

        currentBattle.log.push({
            attacker: 'player',
            move: move.name,
            ...playerResult
        });

        // Check if boss defeated
        if (boss.currentHp <= 0) {
            return endBattle(true);
        }

        // Boss attacks
        currentBattle.playerTurn = false;
        setTimeout(() => {
            const bossMove = chooseBossMove();
            if (bossMove) {
                boss.ppRemaining[bossMove.id]--;
                const bossResult = calculateDamage(boss, player, bossMove);
                player.currentHp = Math.max(0, player.currentHp - bossResult.damage);

                currentBattle.log.push({
                    attacker: 'boss',
                    move: bossMove.name,
                    ...bossResult
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
     * Boss AI - choose a move
     */
    function chooseBossMove() {
        const { boss, player } = currentBattle;
        const availableMoves = boss.moves
            .map(moveId => ({ id: moveId, ...MOVES[moveId] }))
            .filter(move => boss.ppRemaining[move.id] > 0);

        if (availableMoves.length === 0) return null;

        // Simple AI: prefer super-effective moves
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
        } else {
            // Player defeated - maybe lose some gold or items
            const goldLost = Math.floor(Inventory.getGold() * 0.1);
            if (goldLost > 0) {
                Inventory.removeGold(goldLost);
                result.goldLost = goldLost;
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
