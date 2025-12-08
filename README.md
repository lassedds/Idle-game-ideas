# Crystal Clicker

A fun idle/incremental game where you collect crystals, build an empire, and unlock achievements!

![Game Preview](https://img.shields.io/badge/Genre-Idle%20Game-blue) ![Status](https://img.shields.io/badge/Status-Playable-green)

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

# Python 2
python -m SimpleHTTPServer 8000
```
Then open http://localhost:8000

**Using Node.js:**
```bash
# Install a simple server (one-time)
npm install -g http-server

# Run it
http-server -p 8000
```
Then open http://localhost:8000

**Using PHP:**
```bash
php -S localhost:8000
```
Then open http://localhost:8000

**Using VS Code:**
Install the "Live Server" extension, then right-click `index.html` and select "Open with Live Server"

## How to Play

### Basic Gameplay

1. **Click the Crystal** - Click the big crystal in the center to collect crystals
2. **Buy Buildings** - Use crystals to purchase buildings that generate crystals automatically
3. **Purchase Upgrades** - Boost your click power and production with upgrades
4. **Unlock Achievements** - Complete milestones to earn gems

### Controls

| Action | Control |
|--------|---------|
| Collect crystals | Click/tap the crystal |
| Quick click | Press `Spacebar` |
| Save game | Press `Ctrl+S` or click Save button |
| Navigate tabs | Click Buildings/Upgrades/Achievements |

### Tips for Progression

- **Early game**: Focus on clicking and buying Crystal Miners
- **Mid game**: Prioritize production multiplier upgrades
- **Late game**: Unlock synergy upgrades for exponential growth
- **Always**: Keep an eye on achievements for bonus gems!

## Features

- **10 Building Types** - From basic miners to universe factories
- **15+ Upgrades** - Click power, production multipliers, and synergies
- **25+ Achievements** - Milestones with gem rewards
- **Auto-Save** - Progress saves every 30 seconds
- **Offline Progress** - Earn crystals while away (50% rate, up to 8 hours)
- **Visual Effects** - Particles, animations, and satisfying feedback

## Project Structure

```
Idle-game-ideas/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Game styling and animations
└── js/
    ├── main.js         # Game initialization and loop
    ├── state.js        # Central state management
    ├── resources.js    # Resource calculations
    ├── buildings.js    # Building definitions
    ├── upgrades.js     # Upgrade system
    ├── achievements.js # Achievement tracking
    ├── particles.js    # Visual effects
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

Your progress is saved to your browser's localStorage. To manage saves:

- **Manual Save**: Click the 💾 Save button
- **Reset Progress**: Click the 🔄 Reset button
- **Export/Import**: Available via browser console:
  ```javascript
  // Export your save
  console.log(SaveSystem.exportSave());

  // Import a save
  SaveSystem.importSave('your-save-string-here');
  ```

## Troubleshooting

**Game won't load?**
- Try using a local server instead of opening the file directly
- Check browser console (F12) for errors
- Make sure JavaScript is enabled

**Save not working?**
- Ensure localStorage is enabled in your browser
- Check if you're in private/incognito mode (localStorage may be disabled)

**Performance issues?**
- Close other browser tabs
- Disable browser extensions temporarily
- Try a different browser

## License

MIT License - Feel free to modify and share!
