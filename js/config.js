/**
 * Game Configuration
 * Central location for all game constants and configuration values
 */

const GameConfig = {
    // Game metadata
    VERSION: '2.0.0',
    SAVE_KEY: 'idle_legends_save',
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds

    // Character
    MAX_CHARACTERS: 3,
    BASE_HP: 100,
    BASE_MANA: 100,
    LEVEL_UP_STAT_POINTS: 3,
    MAX_LEVEL: 100,

    // Combat
    BASE_ATTACK_INTERVAL: 2000, // 2 seconds
    CRIT_BASE_CHANCE: 5, // 5%
    CRIT_DAMAGE_MULTIPLIER: 1.5,

    // Corruption System
    CORRUPTION: {
        MAX: 100,
        THRESHOLDS: {
            LOW: 25,
            MEDIUM: 50,
            HIGH: 75,
            TRANSFORMED: 100
        },
        TRANSFORMATION_DURATION: 30 * 60 * 1000, // 30 minutes
        PASSIVE_DECAY_RATE: 0.1, // Per minute
        PASSIVE_DECAY_INTERVAL: 60000 // 1 minute
    },

    // Equipment Genetics
    GENETICS: {
        FUSION_COOLDOWN: 24 * 60 * 60 * 1000, // 24 hours
        MAX_BREEDING_POTENTIAL: 10,
        INHERIT_CHANCE: 0.6, // 60% from parents
        MUTATION_CHANCE: 0.4, // 40% random
        MAX_MUTATIONS: 3,
        MAX_AFFINITIES: 3,
        INBREEDING_PENALTY: 5 // Quality loss per shared ancestor
    },

    // Zone Fatigue
    ZONE_FATIGUE: {
        MAX: 100,
        THRESHOLDS: {
            FRESH: 20,
            VISITED: 40,
            FATIGUED: 60,
            EXHAUSTED: 80,
            DEPLETED: 100
        },
        MONSTER_KILL_FATIGUE: 0.1, // 0.1% per 10 monsters
        BOSS_KILL_FATIGUE: 5, // 5% per boss
        PASSIVE_RECOVERY_RATE: 0.5, // Per hour
        FULL_RESET_TIME: 24 * 60 * 60 * 1000, // 24 hours
        GUARDIAN_RESPAWN_TIME: 30 * 60 * 1000 // 30 minutes
    },

    // Skill Fusion
    SKILL_FUSION: {
        MAX_ACTIVE_FUSIONS: 3,
        BASIC_FUSION_COST: 50,
        ADVANCED_FUSION_COST: 150,
        ULTIMATE_FUSION_COST: 500,
        ADVANCED_POWER_MULTIPLIER: 1.5,
        ULTIMATE_POWER_MULTIPLIER: 2.0
    },

    // Reincarnation
    REINCARNATION: {
        MIN_LEVEL: 50,
        SE_CALCULATION_DIVISOR: 1000,
        SOUL_TREE_CATEGORIES: [
            'rebirth_boons',
            'power_growth',
            'soul_abilities',
            'cycle_mastery'
        ]
    },

    // Class Evolution
    CLASS_EVOLUTION: {
        FIRST_EVOLUTION_TIME: 10 * 60 * 60 * 1000, // 10 hours
        EVOLUTION_LEVEL_INTERVAL: 20, // Every 20 levels
        MAX_CLASS_TIER: 3
    },

    // Multiplayer
    MULTIPLAYER: {
        DEFAULT_SERVER: 'ws://localhost:8080',
        MAX_RECONNECT_ATTEMPTS: 5,
        UPDATE_INTERVAL: 10000, // 10 seconds
        CHAT_HISTORY_LIMIT: 100,
        PLAYER_TIMEOUT: 5 * 60 * 1000 // 5 minutes
    },

    // Boss Combat
    BOSS_COMBAT: {
        MAX_PP: 20,
        STAB_MULTIPLIER: 1.5,
        MAX_STAT_STAGES: 6,
        STAT_STAGE_MULTIPLIER: 0.2, // 20% per stage
        MAX_CHAOS: 100,
        MAX_CORRUPTION_STACKS: 10,
        TERRAIN_DURATION: 5, // turns
        RESONANCE_THRESHOLD: 3, // moves
        COMBO_MULTIPLIER: 0.1 // 10% per combo
    },

    // UI
    UI: {
        NOTIFICATION_DURATION: 3000, // 3 seconds
        TOOLTIP_DELAY: 200, // milliseconds
        MAX_LOG_ENTRIES: 50
    }
};

// Freeze config to prevent accidental modification
Object.freeze(GameConfig);
Object.freeze(GameConfig.CORRUPTION);
Object.freeze(GameConfig.GENETICS);
Object.freeze(GameConfig.ZONE_FATIGUE);
Object.freeze(GameConfig.SKILL_FUSION);
Object.freeze(GameConfig.REINCARNATION);
Object.freeze(GameConfig.CLASS_EVOLUTION);
Object.freeze(GameConfig.MULTIPLAYER);
Object.freeze(GameConfig.BOSS_COMBAT);
Object.freeze(GameConfig.UI);
