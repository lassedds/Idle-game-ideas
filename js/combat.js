/**
 * Combat Module
 * Handles all combat mechanics, damage calculation, and loot
 */

const Combat = (function() {
    // Active combat state per character
    let combatState = {};

    /**
     * Start combat for a character in a zone
     */
    function startCombat(charIndex, zoneId) {
        const char = Character.getByIndex(charIndex);
        if (!char) return null;

        if (!World.isZoneUnlocked(zoneId)) return null;

        // Spawn a monster
        const monster = World.spawnMonster(zoneId);
        if (!monster) return null;

        combatState[charIndex] = {
            monster: monster,
            zoneId: zoneId,
            lastPlayerAttack: Date.now(),
            lastMonsterAttack: Date.now(),
            combatLog: [],
            killCount: 0,
            totalExp: 0,
            totalGold: 0,
            loot: []
        };

        // Set character activity
        Character.setActivity(charIndex, 'combat', zoneId);

        return combatState[charIndex];
    }

    /**
     * Stop combat for a character
     */
    function stopCombat(charIndex) {
        if (combatState[charIndex]) {
            const result = {
                killCount: combatState[charIndex].killCount,
                totalExp: combatState[charIndex].totalExp,
                totalGold: combatState[charIndex].totalGold,
                loot: combatState[charIndex].loot
            };
            delete combatState[charIndex];
            Character.setActivity(charIndex, null, null);
            return result;
        }
        return null;
    }

    /**
     * Get combat state for a character
     */
    function getCombatState(charIndex) {
        return combatState[charIndex] || null;
    }

    /**
     * Calculate player damage
     */
    function calculatePlayerDamage(charIndex) {
        const char = Character.getByIndex(charIndex);
        if (!char) return 0;

        const power = Character.getCombatPower(charIndex);
        const baseDamage = power * 2;

        // Check for critical hit
        const critChance = Character.getCritChance(charIndex);
        const isCrit = Math.random() < critChance;

        let damage = baseDamage + Math.floor(Math.random() * power);

        if (isCrit) {
            damage = Math.floor(damage * 2);
        }

        return { damage, isCrit };
    }

    /**
     * Calculate monster damage
     */
    function calculateMonsterDamage(monster, charIndex) {
        const char = Character.getByIndex(charIndex);
        if (!char || !monster) return 0;

        // Base monster damage reduced by character defense (from STR)
        const defense = Math.floor(char.stats.str * 0.5);
        const damage = Math.max(1, monster.damage - defense + Math.floor(Math.random() * (monster.damage * 0.3)));

        return damage;
    }

    /**
     * Process a combat tick
     */
    function processTick(charIndex, deltaTime) {
        const state = combatState[charIndex];
        if (!state) return null;

        const char = Character.getByIndex(charIndex);
        if (!char || !Character.isAlive(charIndex)) {
            // Character died
            return { event: 'death', state };
        }

        const now = Date.now();
        const results = [];

        // Player attacks (based on AGI for attack speed)
        const playerAttackSpeed = 1500 - (char.stats.agi * 20); // Min ~500ms
        const clampedSpeed = Math.max(500, playerAttackSpeed);

        if (now - state.lastPlayerAttack >= clampedSpeed) {
            state.lastPlayerAttack = now;

            const { damage, isCrit } = calculatePlayerDamage(charIndex);
            state.monster.currentHp -= damage;

            results.push({
                type: 'playerAttack',
                damage,
                isCrit,
                targetHp: state.monster.currentHp,
                targetMaxHp: state.monster.hp
            });

            // Check if monster died
            if (state.monster.currentHp <= 0) {
                const lootResult = processMonsterDeath(charIndex);
                results.push({
                    type: 'monsterDeath',
                    monster: state.monster,
                    ...lootResult
                });

                // Spawn new monster
                const newMonster = World.spawnMonster(state.zoneId);
                if (newMonster) {
                    state.monster = newMonster;
                    results.push({
                        type: 'monsterSpawn',
                        monster: newMonster
                    });
                }
            }
        }

        // Monster attacks
        const monsterAttackSpeed = state.monster.attackSpeed * 1000;
        if (now - state.lastMonsterAttack >= monsterAttackSpeed && state.monster.currentHp > 0) {
            state.lastMonsterAttack = now;

            const damage = calculateMonsterDamage(state.monster, charIndex);
            const survived = Character.damage(charIndex, damage);

            results.push({
                type: 'monsterAttack',
                damage,
                playerHp: char.hp,
                playerMaxHp: char.maxHp
            });

            if (!survived) {
                results.push({ type: 'playerDeath' });
            }
        }

        return results.length > 0 ? results : null;
    }

    /**
     * Process monster death - give exp, gold, loot
     */
    function processMonsterDeath(charIndex) {
        const state = combatState[charIndex];
        if (!state) return null;

        const monster = state.monster;
        const char = Character.getByIndex(charIndex);

        // Give exp
        Character.addExp(charIndex, monster.exp);
        Skills.addExp(char.id, 'combat', Math.floor(monster.exp * 0.5));

        // Give gold
        Inventory.addGold(monster.gold);

        // Track stats
        state.killCount++;
        state.totalExp += monster.exp;
        state.totalGold += monster.gold;

        // Process loot drops
        const drops = [];
        for (const drop of monster.drops) {
            if (Math.random() < drop.chance) {
                Inventory.addItem(drop.itemId);
                drops.push(drop.itemId);
                state.loot.push(drop.itemId);
            }
        }

        // Check for zone unlocks based on new level
        const newUnlocks = World.checkUnlocks(char.level);

        return {
            exp: monster.exp,
            gold: monster.gold,
            drops,
            newUnlocks
        };
    }

    /**
     * Get combat stats for display
     */
    function getCombatStats(charIndex) {
        const char = Character.getByIndex(charIndex);
        if (!char) return null;

        const power = Character.getCombatPower(charIndex);
        const critChance = Character.getCritChance(charIndex);
        const attackSpeed = Math.max(500, 1500 - (char.stats.agi * 20));
        const defense = Math.floor(char.stats.str * 0.5);

        return {
            power,
            critChance: Math.round(critChance * 100),
            attackSpeed: Math.round(attackSpeed),
            defense,
            hp: char.hp,
            maxHp: char.maxHp,
            mp: char.mp,
            maxMp: char.maxMp
        };
    }

    /**
     * Get active combats
     */
    function getActiveCombats() {
        return { ...combatState };
    }

    /**
     * Check if character is in combat
     */
    function isInCombat(charIndex) {
        return !!combatState[charIndex];
    }

    /**
     * Auto-heal if out of combat (passive regen)
     */
    function processRegen(charIndex, deltaTime) {
        if (isInCombat(charIndex)) return;

        const char = Character.getByIndex(charIndex);
        if (!char) return;

        // Regen 2% HP per second when not in combat
        const regenAmount = Math.floor(char.maxHp * 0.02 * deltaTime);
        if (char.hp < char.maxHp) {
            Character.heal(charIndex, regenAmount);
        }

        // Regen 1% MP per second
        const manaRegen = Math.floor(char.maxMp * 0.01 * deltaTime);
        if (char.mp < char.maxMp) {
            char.mp = Math.min(char.maxMp, char.mp + manaRegen);
        }
    }

    /**
     * Get state for saving
     */
    function getState() {
        // Don't save active combat - player resumes out of combat
        return {};
    }

    /**
     * Load state
     */
    function loadState(state) {
        combatState = {};
    }

    /**
     * Reset
     */
    function reset() {
        combatState = {};
    }

    // Public API
    return {
        startCombat,
        stopCombat,
        getCombatState,
        processTick,
        getCombatStats,
        getActiveCombats,
        isInCombat,
        processRegen,
        getState,
        loadState,
        reset
    };
})();
