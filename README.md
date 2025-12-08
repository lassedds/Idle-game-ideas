# Idle Legends

An idle RPG inspired by IdleOn and MapleStory! Create characters, explore zones, fight monsters, level up skills, and progress through an expansive world.

![Game Preview](https://img.shields.io/badge/Genre-Idle%20RPG-purple) ![Status](https://img.shields.io/badge/Status-Playable-green)

## Quick Start

### Option 1: Open Directly (Simplest)

Simply double-click `index.html` or open it in your web browser:

```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

### Option 2: Local Development Server

For the best experience, run a local server:

**Using Python:**
```bash
# Python 3
python -m http.server 8000
```
Then open http://localhost:8000

**Using Node.js:**
```bash
npx http-server -p 8000
```
Then open http://localhost:8000

**Using VS Code:**
Install the "Live Server" extension, then right-click `index.html` and select "Open with Live Server"

## How to Play

### Getting Started

1. **Create a Character** - Click "+ New Character" and choose a class
2. **Pick a Zone** - Go to the World tab and select a starting area
3. **Start an Activity** - Choose to mine, chop wood, fish, or fight monsters
4. **Level Up** - Gain experience to unlock new zones and become stronger
5. **Complete Quests** - Accept quests for bonus rewards

### Character Classes

| Class | Icon | Specialty | Best Stats |
|-------|------|-----------|------------|
| Warrior | ⚔️ | Melee combat, high HP | STR |
| Mage | 🔮 | Magic damage, high mana | WIS |
| Archer | 🏹 | Ranged attacks, crits | AGI, LUK |
| Beginner | 👤 | Balanced, versatile | All |

### Skills

Your character has 8 skills that level up through use:

- **Mining** ⛏️ - Extract ores and gems from rocks
- **Woodcutting** 🪓 - Chop down trees for wood
- **Fishing** 🎣 - Catch fish from various waters
- **Combat** ⚔️ - Fight monsters for loot and XP
- **Smithing** 🔨 - Craft weapons and armor
- **Alchemy** ⚗️ - Brew potions and elixirs
- **Crafting** 🔧 - Create tools and equipment
- **Enchanting** ✨ - Imbue items with magic

### World Zones

Progress through increasingly challenging areas:

**Starter Zones** (Level 1)
- Starter Town, Forest Edge, Copper Mine, Town Pond

**Early Game** (Level 5-15)
- Deep Forest, Iron Mine, Goblin Camp, Flowing River

**Mid Game** (Level 20-35)
- Ancient Grove, Crystal Caverns, Mystic Lake, Dark Dungeon

**End Game** (Level 50+)
- Dragon Lair - Home of the legendary Ancient Dragon!

### Combat

Combat is automatic - your character attacks based on their stats:
- **Damage** scales with STR (warriors), WIS (mages), or AGI (archers)
- **Attack Speed** improves with AGI
- **Critical Hits** chance increases with LUK
- **Defense** reduces incoming damage based on STR

### Equipment

Equip items to boost your stats:
- **Weapon** - Main source of damage
- **Armor** - Body protection
- **Helmet** - Head protection
- **Gloves, Boots** - Additional stats
- **Ring, Amulet** - Accessory bonuses

Item rarities: Common (gray) → Uncommon (green) → Rare (blue) → Epic (purple) → Legendary (orange)

### Quests

Complete quests for XP, gold, and item rewards:
- **Tutorial Quests** - Learn the basics and get starter gear
- **Combat Quests** - Defeat specific monsters
- **Gathering Quests** - Collect resources
- **Boss Bounties** - Take down powerful enemies

### Talents

Spend talent points (earned on level up) to permanently boost your character:
- **Combat Tree** - Damage, crit chance, attack speed, HP
- **Gathering Tree** - Mining/woodcutting/fishing speed, double resources
- **Misc Tree** - XP boost, gold bonus, drop rates

## Features

- **Multiple Characters** - Create up to 6 characters per account
- **8 Skill Trees** - Each skill levels independently
- **15 World Zones** - From starter areas to endgame content
- **30+ Monster Types** - Each with unique drops
- **50+ Items** - Equipment, resources, consumables
- **Quest System** - Objectives with meaningful rewards
- **Talent Trees** - Permanent character upgrades
- **Auto-Save** - Progress saves every 30 seconds

## Project Structure

```
Idle-game-ideas/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # RPG-themed styling
└── js/
    ├── main.js         # Game loop and activity processing
    ├── character.js    # Character creation and stats
    ├── skills.js       # Skill leveling system
    ├── inventory.js    # Items and equipment
    ├── world.js        # Zones and monsters
    ├── combat.js       # Battle mechanics
    ├── quests.js       # Quest objectives and rewards
    ├── talents.js      # Talent tree system
    ├── ui.js           # UI rendering
    └── save.js         # Save/load functionality
```

## Browser Support

Works in all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Save Data

Your progress is saved to your browser's localStorage.

- **Auto-Save**: Every 30 seconds
- **Manual Save**: Click the 💾 button
- **Export/Import**: Via browser console:
  ```javascript
  // Export your save
  console.log(SaveSystem.exportSave());

  // Import a save
  SaveSystem.importSave('your-save-string-here');
  ```

## Tips for New Players

1. **Start with gathering** - Mining and woodcutting are safe ways to get resources
2. **Accept tutorial quests** - They give you starter equipment
3. **Check your level** - Don't fight monsters too far above your level
4. **Upgrade equipment** - Better gear makes a huge difference
5. **Use consumables** - Health potions can save you in tough fights
6. **Invest in talents** - Permanent bonuses help long-term

## Troubleshooting

**Game won't load?**
- Try using a local server instead of opening the file directly
- Check browser console (F12) for errors

**Character not gaining XP?**
- Make sure you're actively doing an activity (mining, combat, etc.)
- Check the activity log for updates

**Can't equip an item?**
- Check the level requirement on the item
- Make sure you have the item in your inventory

## License

MIT License - Feel free to modify and share!
