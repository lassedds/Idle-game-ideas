# Idle Legends - Game Systems Documentation

## Table of Contents
1. [Core Systems](#core-systems)
2. [New Advanced Systems](#new-advanced-systems)
3. [Architecture](#architecture)
4. [Module Structure](#module-structure)
5. [Adding New Features](#adding-new-features)

---

## Core Systems

### Character System (`js/character.js`)
- Multi-character support (up to 3 characters)
- Stats: STR, AGI, WIS, LUK
- Level-up system with stat point allocation
- Equipment slots: Weapon, Armor, Helmet, Gloves, Boots, Ring, Amulet

### Combat System (`js/combat.js` & `js/boss-combat.js`)
- Standard idle combat for regular monsters
- Pokemon-style turn-based combat for bosses
- Type effectiveness system
- Unique mechanics: Chaos Energy, Corruption, Terrain effects, Resonance

### Skills & Talents (`js/skills.js` & `js/talents.js`)
- Three skill lanes: Combat, Support, Balanced
- Talent trees for character specialization
- Active and passive abilities

### World & Zones (`js/world.js`)
- Multiple zones with level ranges
- Zone-specific monsters and bosses
- Activities: Farming, Mining, Combat

### Inventory (`js/inventory.js`)
- Item management and storage
- Equipment system
- Gold and resource tracking

---

## New Advanced Systems

### 1. Corruption System (`js/corruption.js`)

**Purpose**: Persistent corruption tracking that affects gameplay and offers risk/reward choices.

**Key Features**:
- Corruption meter (0-100%)
- Thresholds: Low (25%), Medium (50%), High (75%), Transformed (100%)
- Benefits: Increased damage and gold at higher corruption
- Drawbacks: NPCs refuse trade, can't enter towns, attracts hunters
- Transformation: At 100%, become a boss that other players can hunt

**Configuration**: `GameConfig.CORRUPTION`

**API**:
```javascript
Corruption.increaseCorruption(amount)
Corruption.decreaseCorruption(amount)
Corruption.getCorruptionLevel()
Corruption.getCorruptionTier()
Corruption.getEffects()
```

**Integration Points**:
- Boss combat inflicts corruption
- Multiplayer shows corruption status
- Equipment can have corruption effects

---

### 2. Equipment Genetics (`js/equipment-genetics.js`)

**Purpose**: Breed equipment to create offspring with inherited traits and mutations.

**Key Features**:
- 5 genetic trait categories: Power, Efficiency, Affinity, Rarity, Mutation
- Breeding combines two equipment pieces (consumed in process)
- Offspring inherits 60% from parents, 40% random mutations
- Inbreeding penalty for repeated same-type breeding
- Quality degradation tracking

**Configuration**: `GameConfig.GENETICS`

**API**:
```javascript
EquipmentGenetics.generateGenetics(itemDef, quality)
EquipmentGenetics.breedEquipment(genetics1Id, genetics2Id)
EquipmentGenetics.addFusionCatalyst(amount)
EquipmentGenetics.getGenetics(geneticsId)
```

**Resources**:
- **Fusion Catalysts**: Consumed when breeding (rare drops)

---

### 3. Zone Fatigue (`js/zone-fatigue.js`)

**Purpose**: Zones get depleted from over-farming, forcing zone rotation.

**Key Features**:
- Per-zone fatigue tracking (0-100%)
- Tiers: Fresh, Visited, Fatigued, Exhausted, Depleted
- Effects: Reduced drops/XP, stronger monsters at high fatigue
- Zone Guardians spawn at 80%+ fatigue
- Passive recovery over time (0.5%/hour, full reset after 24h)

**Configuration**: `GameConfig.ZONE_FATIGUE`

**API**:
```javascript
ZoneFatigue.getFatigue(zoneId)
ZoneFatigue.increaseFatigue(zoneId, monstersKilled, bossKilled)
ZoneFatigue.getGuardian(zoneId)
ZoneFatigue.restoreZone(zoneId) // Paid service
```

**Zone Guardian**:
- Special boss that spawns when zone reaches 80% fatigue
- Hunts the player actively
- Drops exclusive rewards
- Respawns every 30 minutes while fatigue > 80%

---

### 4. Skill Fusion (`js/skill-fusion.js`)

**Purpose**: Combine skills to create hybrid abilities with mixed effects.

**Key Features**:
- Fuse 2 skills → Basic Fusion
- Fuse hybrid + skill → Advanced Fusion
- Fuse 2 hybrids → Ultimate Fusion
- Compatibility system (high/medium/low based on elements)
- Limited active slots (3 max)

**Configuration**: `GameConfig.SKILL_FUSION`

**API**:
```javascript
SkillFusion.fuseSkills(skill1Id, skill2Id)
SkillFusion.advancedFusion(fusionId, skillId)
SkillFusion.ultimateFusion(fusion1Id, fusion2Id)
SkillFusion.equipFusion(fusionId)
SkillFusion.unequipFusion(fusionId)
```

**Resources**:
- **Fusion Essence**: Currency for creating fusions
  - Basic: 50 essence
  - Advanced: 150 essence
  - Ultimate: 500 essence

---

### 5. Reincarnation System (`js/reincarnation.js`)

**Purpose**: Prestige system with permanent account-wide upgrades.

**Key Features**:
- Reset to level 1, lose equipment/gold
- Gain Soul Essence (SE) based on total progress
- Soul Tree: Permanent upgrades across 4 categories
  - Rebirth Boons: Starting bonuses for new lives
  - Power Growth: Permanent stat increases
  - Soul Abilities: Unique powers
  - Cycle Mastery: Reincarnation improvements
- Preserved data: Fusion recipes, genetic blueprints, skill knowledge

**Configuration**: `GameConfig.REINCARNATION`

**API**:
```javascript
Reincarnation.canReincarnate()
Reincarnation.calculateSoulEssence()
Reincarnation.reincarnate()
Reincarnation.purchaseSoulNode(nodeId)
Reincarnation.getSoulEssence()
Reincarnation.getPowerBonuses()
```

**Soul Essence Formula**:
```
SE = (Level × Gold × Boss Kills × Corruption Multiplier) / 1000
```

**Key Nodes**:
- `heirloom_weapon`: Start with basic weapon
- `fast_learner`: +50% XP up to level 20
- `eternal_strength`: +1% damage per level (stackable)
- `corruption_mastery`: Keep corruption benefits without penalties

---

### 6. Class Evolution (`js/class-evolution.js`)

**Purpose**: Dynamic class system that emerges from playstyle.

**Key Features**:
- Start as "Wanderer", evolve based on actions
- 8 tracked dimensions: Aggression, Element Affinity, Combat Style, Support, Risk-Taking, Exploration, Crafting, Social
- Evolution opportunities every 20 levels
- 3-tier evolution paths (Wanderer → Tier 1 → Tier 2 → Tier 3)
- Hidden classes with special unlock requirements

**Configuration**: `GameConfig.CLASS_EVOLUTION`

**API**:
```javascript
ClassEvolution.trackAction(actionType, data)
ClassEvolution.getAvailableEvolutions()
ClassEvolution.evolveClass(className)
ClassEvolution.getCurrentClass()
ClassEvolution.getClassTraits()
```

**Action Tracking**:
```javascript
// Examples
ClassEvolution.trackAction('damage_dealt', { amount: 100, type: 'fire' })
ClassEvolution.trackAction('equipment_bred', {})
ClassEvolution.trackAction('zone_visited', {})
```

**Hidden Classes**:
- **Void Walker**: High corruption + zone fatigue + exploration + reincarnations
- **Phoenix Lord**: Many deaths + risk-taking + fire affinity
- **Genetic Savant**: High crafting + many breedings + low combat
- **Chaos Healer**: Corruption + support + boss kills

---

## Architecture

### Module Pattern
All modules use the Revealing Module Pattern:
```javascript
const ModuleName = (function() {
    // Private variables
    let privateVar = 0;

    // Private functions
    function privateFunction() {
        // ...
    }

    // Public functions
    function publicFunction() {
        // ...
    }

    // State management
    function getState() {
        return { privateVar };
    }

    function loadState(state) {
        if (state) {
            privateVar = state.privateVar || 0;
        }
    }

    // Public API
    return {
        publicFunction,
        getState,
        loadState
    };
})();
```

### State Management
All modules must implement:
- `getState()`: Returns serializable state object
- `loadState(state)`: Loads state object
- `reset()`: (Optional) Resets module to initial state

Register modules with StateManager:
```javascript
StateManager.registerModule('moduleName', ModuleName);
```

### Configuration
All constants in `js/config.js`:
- Easy to find and modify values
- Prevents magic numbers
- Centralized balance tweaking

### Utilities
Common functions in `js/utils.js`:
- `GameUtils.formatNumber(num)`: Format with K/M/B suffixes
- `GameUtils.randomInt(min, max)`: Random integer
- `GameUtils.rollChance(percentage)`: Probability rolls
- And many more...

---

## Module Structure

### Required Files
```
js/
├── config.js           # Game configuration
├── utils.js            # Utility functions
├── state-manager.js    # State coordination
├── [module].js         # Game module
└── main.js             # Initialization
```

### Module Template
```javascript
/**
 * Module Name
 * Brief description
 */

const ModuleName = (function() {
    // === PRIVATE STATE ===
    let moduleState = {};

    /**
     * Initialize module
     */
    function init() {
        console.log('[ModuleName] Initialized');
    }

    /**
     * Get state for saving
     */
    function getState() {
        return {
            moduleState
        };
    }

    /**
     * Load state
     */
    function loadState(state) {
        if (state) {
            moduleState = state.moduleState || {};
        }
    }

    /**
     * Reset module
     */
    function reset() {
        moduleState = {};
    }

    // === PUBLIC API ===
    return {
        init,
        getState,
        loadState,
        reset
    };
})();

// Register with StateManager
if (typeof StateManager !== 'undefined') {
    StateManager.registerModule('ModuleName', ModuleName);
}
```

---

## Adding New Features

### Step 1: Plan the Module
1. Define purpose and key features
2. Identify integration points with existing systems
3. Design data structure
4. Determine configuration values

### Step 2: Add Configuration
In `js/config.js`:
```javascript
GameConfig.NEW_SYSTEM = {
    CONSTANT_NAME: value,
    THRESHOLD: 50
};
```

### Step 3: Create Module File
1. Create `js/new-system.js`
2. Use module template
3. Implement `init()`, `getState()`, `loadState()`, `reset()`
4. Register with StateManager

### Step 4: Add to index.html
```html
<script src="js/new-system.js"></script>
```

### Step 5: Initialize in main.js
```javascript
if (typeof NewSystem !== 'undefined') {
    NewSystem.init();
}
```

### Step 6: Integrate with Multiplayer (if needed)
In `js/multiplayer.js`:
```javascript
// In register() and sendPlayerUpdate()
if (typeof NewSystem !== 'undefined') {
    playerData.newSystemData = NewSystem.getSomeValue();
}
```

### Step 7: Add UI
1. Add HTML structure in `index.html`
2. Create update functions in your module
3. Hook up event listeners
4. Display data in appropriate locations

### Step 8: Save Integration
StateManager handles this automatically if you implemented `getState()` and `loadState()`.

---

## Best Practices

### Code Style
- Use JSDoc comments for public functions
- Descriptive variable names
- Constants in ALL_CAPS
- Use GameConfig for magic numbers
- Prefer GameUtils functions over custom implementations

### Performance
- Avoid DOM manipulation in loops
- Use debounce/throttle for frequent events
- Cache DOM queries
- Minimize save/load operations

### Testing
- Test save/load cycle
- Test with empty/corrupted save data
- Test integration with other systems
- Test multiplayer data sync

### Documentation
- Update this file when adding features
- Comment complex algorithms
- Explain "why" not just "what"
- Keep examples up to date

---

## File Organization

```
Idle-game-ideas/
├── index.html              # Main HTML
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── config.js           # Configuration
│   ├── utils.js            # Utilities
│   ├── state-manager.js    # State management
│   ├── icons.js            # SVG icons
│   ├── character.js        # Character system
│   ├── skills.js           # Skills system
│   ├── inventory.js        # Inventory system
│   ├── world.js            # World/zones
│   ├── combat.js           # Regular combat
│   ├── boss-combat.js      # Boss battles
│   ├── boss-battle-ui.js   # Boss UI
│   ├── quests.js           # Quest system
│   ├── talents.js          # Talent trees
│   ├── corruption.js       # ⭐ NEW: Corruption system
│   ├── equipment-genetics.js # ⭐ NEW: Equipment breeding
│   ├── zone-fatigue.js     # ⭐ NEW: Zone depletion
│   ├── skill-fusion.js     # ⭐ NEW: Skill combining
│   ├── reincarnation.js    # ⭐ NEW: Prestige system
│   ├── class-evolution.js  # ⭐ NEW: Dynamic classes
│   ├── multiplayer.js      # Multiplayer client
│   ├── multiplayer-ui.js   # Multiplayer UI
│   ├── ui.js               # UI management
│   ├── save.js             # Save/load (legacy)
│   └── main.js             # Initialization
├── server/
│   ├── multiplayer-server.js # WebSocket server
│   ├── package.json
│   └── README.md
├── SYSTEMS.md              # This file
└── README.md               # Project readme
```

---

## Common Patterns

### Event Broadcasting
```javascript
// Trigger event
if (typeof UI !== 'undefined') {
    UI.showNotification('Something happened!', 'success');
}

// Notify multiplayer
if (typeof Multiplayer !== 'undefined' && Multiplayer.isConnected()) {
    Multiplayer.sendPlayerUpdate();
}
```

### Error Handling
```javascript
function doSomething() {
    if (!precondition) {
        return { error: 'Precondition failed' };
    }

    try {
        // Do work
        return { success: true, data: result };
    } catch (err) {
        console.error('[ModuleName] Error:', err);
        return { error: err.message };
    }
}
```

### Configuration Access
```javascript
// Good
const maxValue = GameConfig.SYSTEM_NAME.MAX_VALUE;

// Bad
const maxValue = 100; // Magic number
```

### Utility Usage
```javascript
// Good
const formatted = GameUtils.formatNumber(12345);
const random = GameUtils.randomInt(1, 10);

// Avoid
const formatted = num >= 1000 ? (num/1000).toFixed(2) + 'K' : num;
```

---

## Integration Checklist

When adding a new system, ensure:

- [ ] Configuration added to `GameConfig`
- [ ] Module implements required methods
- [ ] Registered with `StateManager`
- [ ] Script tag added to `index.html`
- [ ] Initialized in `main.js`
- [ ] UI elements added (if needed)
- [ ] Multiplayer integration (if applicable)
- [ ] Documentation updated
- [ ] Save/load tested
- [ ] Integration with existing systems tested

---

## Troubleshooting

### Module not loading
- Check script order in `index.html`
- Verify no JavaScript errors in console
- Ensure dependencies loaded first

### State not saving
- Check `getState()` returns serializable data (no functions/circular refs)
- Verify module registered with `StateManager`
- Check localStorage not full

### Multiplayer not syncing
- Ensure data added to `register()` and `sendPlayerUpdate()`
- Check server is running and reachable
- Verify client connected before sending

### Performance issues
- Check for unintended DOM manipulation loops
- Verify intervals/timeouts are cleared properly
- Use browser profiler to identify bottlenecks

---

## Version History

### v2.0.0 - Advanced Systems Update
- Added 6 new interconnected systems
- Centralized configuration system
- Utility library for common functions
- State management coordinator
- Full documentation

### v1.0.0 - Initial Release
- Basic idle RPG systems
- Boss combat with Pokemon mechanics
- Local multiplayer
- SVG icon system
