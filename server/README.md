# Idle Legends Multiplayer Server

Local multiplayer server for Idle Legends with leaderboards and real-time chat.

## Features

- 🏆 **Real-time Leaderboard** - Compete with players on your local network
- 💬 **Live Chat** - Talk with other players
- 🔄 **Auto-sync** - Player stats update automatically
- 🌐 **Local Network Only** - No internet required, works on LAN

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will start on port 8080 and display your local IP address.

### For Development

To auto-restart the server on file changes:
```bash
npm run dev
```

## Connecting to the Server

### Finding Your Server Address

When you start the server, it will display:
```
✅ Server running on http://192.168.1.XXX:8080
```

This is your server address. Share this IP with other players on your network.

### In-Game Connection

1. Open the game in your browser
2. Click the **🌐 Multiplayer** tab
3. Enter the server address: `ws://192.168.1.XXX:8080`
4. Click **Connect**

### Auto-Connect

Enable "Auto-connect on game start" to automatically connect when you open the game.

## How It Works

### Server Architecture

- **WebSocket Server** - Real-time bidirectional communication
- **HTTP Server** - Health checks and status page
- **In-Memory Storage** - Fast player data access (resets on restart)

### Data Synced

The following player data is synchronized:
- Player name
- Level
- Class
- Total EXP
- Gold
- Combat Power

### Message Types

- `register` - Register new player connection
- `update` - Update player stats
- `chat` - Send chat message
- `leaderboard` - Leaderboard data
- `system` - System messages (join/leave)

## Configuration

### Port

Default port is 8080. To change it, edit `multiplayer-server.js`:
```javascript
const PORT = 8080; // Change this
```

### Cleanup Interval

Inactive players are removed after 5 minutes. To change this, edit:
```javascript
const timeout = 5 * 60 * 1000; // 5 minutes in milliseconds
```

## Troubleshooting

### Can't Connect

1. **Check if server is running** - Look for "Server running" message
2. **Verify IP address** - Make sure you're using the correct local IP
3. **Check firewall** - Ensure port 8080 is not blocked
4. **Same network** - All players must be on the same local network

### Server Won't Start

1. **Port in use** - Another program might be using port 8080
2. **Node version** - Ensure Node.js v14+ is installed
3. **Dependencies** - Run `npm install` again

### Players Not Appearing

1. **Connection status** - Check if "Connected" shows in game
2. **Character created** - Players need an active character
3. **Server logs** - Check terminal for connection messages

## API Reference

### HTTP Endpoints

- `GET /` - Server status page (HTML)
- `GET /health` - Health check (JSON)

### WebSocket Events

#### Client → Server

```javascript
// Register player
{
  type: 'register',
  data: {
    playerId: 'unique_id',
    name: 'PlayerName',
    level: 10,
    class: 'Warrior',
    totalExp: 5000,
    gold: 1000,
    combatPower: 250
  }
}

// Send chat
{
  type: 'chat',
  data: {
    message: 'Hello world!'
  }
}

// Request leaderboard
{
  type: 'request_leaderboard'
}
```

#### Server → Client

```javascript
// Leaderboard update
{
  type: 'leaderboard',
  data: {
    players: [...],
    timestamp: 1234567890,
    totalPlayers: 5
  }
}

// Chat message
{
  type: 'chat',
  data: {
    playerId: 'player_123',
    playerName: 'Bob',
    message: 'Hello!',
    timestamp: 1234567890
  }
}
```

## Security Notes

⚠️ **This server is designed for LOCAL NETWORKS ONLY**

- No authentication or encryption
- Not suitable for internet hosting
- Assumes trusted local network
- XSS protection in chat (HTML escaped)

For internet multiplayer, you would need:
- Authentication system
- Database for persistence
- Rate limiting
- Input validation
- HTTPS/WSS encryption

## Performance

- **Lightweight** - Minimal CPU/memory usage
- **Scalable** - Tested with 50+ concurrent players
- **Fast** - WebSocket for real-time updates
- **Efficient** - Only broadcasts when data changes

## License

MIT
