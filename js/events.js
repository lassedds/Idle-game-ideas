/**
 * Events Module
 * Random events that occur during gameplay
 */

const Events = (function() {
    // Event definitions
    const eventPool = [
        {
            id: 'crystal_rain',
            name: 'Crystal Rain!',
            icon: '🌧️💎',
            description: 'Crystals are falling from the sky!',
            duration: 30,
            effect: { type: 'production', multiplier: 3 },
            rarity: 'uncommon'
        },
        {
            id: 'golden_hour',
            name: 'Golden Hour',
            icon: '🌅',
            description: 'The golden light enhances all crystals!',
            duration: 45,
            effect: { type: 'all', multiplier: 2 },
            rarity: 'rare'
        },
        {
            id: 'clicking_frenzy',
            name: 'Clicking Frenzy!',
            icon: '⚡',
            description: 'Your clicks are supercharged!',
            duration: 20,
            effect: { type: 'click', multiplier: 10 },
            rarity: 'uncommon'
        },
        {
            id: 'lucky_streak',
            name: 'Lucky Streak',
            icon: '🍀',
            description: 'Fortune smiles upon you!',
            duration: 60,
            effect: { type: 'gems', amount: 5 },
            rarity: 'rare'
        },
        {
            id: 'mining_surge',
            name: 'Mining Surge',
            icon: '⛏️✨',
            description: 'All miners work at double speed!',
            duration: 40,
            effect: { type: 'production', multiplier: 2.5 },
            rarity: 'common'
        },
        {
            id: 'crystal_comet',
            name: 'Crystal Comet!',
            icon: '☄️',
            description: 'A comet made of pure crystal crashes nearby!',
            duration: 0,
            effect: { type: 'instant_crystals', multiplier: 100 },
            rarity: 'epic'
        },
        {
            id: 'time_warp',
            name: 'Time Warp',
            icon: '⏰',
            description: 'Time moves faster for your empire!',
            duration: 30,
            effect: { type: 'production', multiplier: 5 },
            rarity: 'epic'
        },
        {
            id: 'treasure_goblin',
            name: 'Treasure Goblin!',
            icon: '👺💰',
            description: 'A treasure goblin appeared! Click fast!',
            duration: 10,
            effect: { type: 'click', multiplier: 25 },
            rarity: 'rare',
            special: 'clickable'
        },
        {
            id: 'crystal_bloom',
            name: 'Crystal Bloom',
            icon: '🌸💎',
            description: 'Crystals are blooming everywhere!',
            duration: 50,
            effect: { type: 'production', multiplier: 2 },
            rarity: 'common'
        },
        {
            id: 'cosmic_alignment',
            name: 'Cosmic Alignment!',
            icon: '🌌✨',
            description: 'The stars align in your favor!',
            duration: 90,
            effect: { type: 'all', multiplier: 3 },
            rarity: 'legendary'
        }
    ];

    // Rarity weights
    const rarityWeights = {
        common: 50,
        uncommon: 30,
        rare: 15,
        epic: 4,
        legendary: 1
    };

    // Current active event
    let activeEvent = null;
    let eventEndTime = 0;

    // Event check timing
    let lastEventCheck = Date.now();
    const EVENT_CHECK_INTERVAL = 30000; // Check every 30 seconds
    const EVENT_CHANCE = 0.15; // 15% chance per check

    /**
     * Check for random event trigger
     */
    function checkForEvent() {
        const now = Date.now();

        // Don't check if event is active
        if (activeEvent) {
            if (now >= eventEndTime) {
                endEvent();
            }
            return null;
        }

        // Check interval
        if (now - lastEventCheck < EVENT_CHECK_INTERVAL) {
            return null;
        }

        lastEventCheck = now;

        // Roll for event
        if (Math.random() < EVENT_CHANCE) {
            return triggerRandomEvent();
        }

        return null;
    }

    /**
     * Trigger a random event
     */
    function triggerRandomEvent() {
        // Roll for rarity
        const roll = Math.random() * 100;
        let cumulative = 0;
        let selectedRarity = 'common';

        for (const [rarity, weight] of Object.entries(rarityWeights)) {
            cumulative += weight;
            if (roll < cumulative) {
                selectedRarity = rarity;
                break;
            }
        }

        // Get events of selected rarity
        const pool = eventPool.filter(e => e.rarity === selectedRarity);
        const event = pool[Math.floor(Math.random() * pool.length)];

        return startEvent(event);
    }

    /**
     * Start an event
     */
    function startEvent(event) {
        activeEvent = { ...event };
        eventEndTime = Date.now() + (event.duration * 1000);

        // Apply instant effects
        if (event.effect.type === 'instant_crystals') {
            const cps = Resources.calculateCPS();
            const bonus = cps * event.effect.multiplier;
            GameState.addCrystals(bonus);
        }

        if (event.effect.type === 'gems') {
            GameState.addGems(event.effect.amount);
        }

        return activeEvent;
    }

    /**
     * End current event
     */
    function endEvent() {
        activeEvent = null;
        eventEndTime = 0;
    }

    /**
     * Get active event
     */
    function getActiveEvent() {
        if (!activeEvent) return null;

        const remaining = Math.max(0, (eventEndTime - Date.now()) / 1000);
        if (remaining === 0 && activeEvent.duration > 0) {
            endEvent();
            return null;
        }

        return {
            ...activeEvent,
            remaining,
            progress: activeEvent.duration > 0 ? 1 - (remaining / activeEvent.duration) : 1
        };
    }

    /**
     * Get production multiplier from active event
     */
    function getProductionMultiplier() {
        if (!activeEvent) return 1;
        if (activeEvent.effect.type === 'production' || activeEvent.effect.type === 'all') {
            return activeEvent.effect.multiplier;
        }
        return 1;
    }

    /**
     * Get click multiplier from active event
     */
    function getClickMultiplier() {
        if (!activeEvent) return 1;
        if (activeEvent.effect.type === 'click' || activeEvent.effect.type === 'all') {
            return activeEvent.effect.multiplier;
        }
        return 1;
    }

    /**
     * Force trigger an event (for testing or special occasions)
     */
    function forceEvent(eventId) {
        const event = eventPool.find(e => e.id === eventId);
        if (event) {
            return startEvent(event);
        }
        return null;
    }

    /**
     * Get state for saving
     */
    function getState() {
        return {
            active: activeEvent,
            endTime: eventEndTime,
            lastCheck: lastEventCheck
        };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state) {
            // Only restore if event hasn't expired
            if (state.active && state.endTime > Date.now()) {
                activeEvent = state.active;
                eventEndTime = state.endTime;
            }
            lastEventCheck = state.lastCheck || Date.now();
        }
    }

    /**
     * Reset events
     */
    function reset() {
        activeEvent = null;
        eventEndTime = 0;
        lastEventCheck = Date.now();
    }

    // Public API
    return {
        checkForEvent,
        triggerRandomEvent,
        getActiveEvent,
        getProductionMultiplier,
        getClickMultiplier,
        forceEvent,
        getState,
        loadState,
        reset
    };
})();
