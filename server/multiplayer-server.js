/**
 * Local Multiplayer Server
 * WebSocket server for local network multiplayer, leaderboards, and chat
 */

const WebSocket = require('ws');
const http = require('http');
const os = require('os');

const PORT = 8080;

// Server state
const players = new Map(); // playerId -> player data
const connections = new Map(); // playerId -> WebSocket

// Create HTTP server for health checks
const httpServer = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'running',
            players: players.size,
            uptime: process.uptime()
        }));
    } else if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <html>
                <head><title>Idle Legends Multiplayer Server</title></head>
                <body>
                    <h1>🎮 Idle Legends Multiplayer Server</h1>
                    <p>Status: <strong style="color: green;">Running</strong></p>
                    <p>Connected Players: <strong>${players.size}</strong></p>
                    <p>WebSocket Port: <strong>${PORT}</strong></p>
                    <hr>
                    <h3>How to Connect:</h3>
                    <p>Open the game and it will automatically connect to this server if on the same network.</p>
                    <p>Server Address: <code>${getLocalIP()}:${PORT}</code></p>
                </body>
            </html>
        `);
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server: httpServer });

console.log('='.repeat(50));
console.log('🎮 Idle Legends Multiplayer Server');
console.log('='.repeat(50));
console.log(`Server starting on port ${PORT}...`);
console.log(`Local IP: ${getLocalIP()}`);
console.log('='.repeat(50));

wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    console.log(`[CONNECT] New connection from ${clientIP}`);

    let playerId = null;

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleMessage(ws, message);
        } catch (err) {
            console.error('[ERROR] Failed to parse message:', err);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    });

    ws.on('close', () => {
        if (playerId) {
            console.log(`[DISCONNECT] Player ${playerId} (${players.get(playerId)?.name}) disconnected`);
            players.delete(playerId);
            connections.delete(playerId);
            broadcastLeaderboard();
            broadcastSystemMessage(`${players.get(playerId)?.name || 'A player'} left the server`);
        }
    });

    ws.on('error', (err) => {
        console.error('[ERROR] WebSocket error:', err);
    });

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Idle Legends Multiplayer Server!',
        serverInfo: {
            version: '1.0.0',
            players: players.size
        }
    }));

    function handleMessage(ws, message) {
        const { type, data } = message;

        switch (type) {
            case 'register':
                // Register new player
                playerId = data.playerId;
                players.set(playerId, {
                    id: playerId,
                    name: data.name,
                    level: data.level || 1,
                    class: data.class || 'Warrior',
                    totalExp: data.totalExp || 0,
                    gold: data.gold || 0,
                    combatPower: data.combatPower || 0,
                    lastUpdate: Date.now()
                });
                connections.set(playerId, ws);

                console.log(`[REGISTER] Player ${playerId} (${data.name}) joined - Lv.${data.level} ${data.class}`);

                // Send registration confirmation
                ws.send(JSON.stringify({
                    type: 'registered',
                    playerId: playerId,
                    message: 'Successfully registered!'
                }));

                // Broadcast updated leaderboard
                broadcastLeaderboard();
                broadcastSystemMessage(`${data.name} joined the server!`);
                break;

            case 'update':
                // Update player data
                if (playerId && players.has(playerId)) {
                    const player = players.get(playerId);
                    Object.assign(player, {
                        level: data.level || player.level,
                        totalExp: data.totalExp || player.totalExp,
                        gold: data.gold || player.gold,
                        combatPower: data.combatPower || player.combatPower,
                        lastUpdate: Date.now()
                    });

                    // Broadcast leaderboard if significant change
                    if (data.level > player.level || data.totalExp > player.totalExp) {
                        broadcastLeaderboard();
                    }
                }
                break;

            case 'chat':
                // Broadcast chat message
                if (playerId && players.has(playerId)) {
                    const player = players.get(playerId);
                    broadcastMessage({
                        type: 'chat',
                        data: {
                            playerId: playerId,
                            playerName: player.name,
                            message: data.message,
                            timestamp: Date.now()
                        }
                    });
                    console.log(`[CHAT] ${player.name}: ${data.message}`);
                }
                break;

            case 'request_leaderboard':
                // Send current leaderboard to requesting player
                if (playerId) {
                    ws.send(JSON.stringify({
                        type: 'leaderboard',
                        data: getLeaderboardData()
                    }));
                }
                break;

            case 'ping':
                // Respond to ping
                ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                break;

            default:
                console.log(`[UNKNOWN] Unknown message type: ${type}`);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: `Unknown message type: ${type}`
                }));
        }
    }
});

/**
 * Broadcast leaderboard to all connected players
 */
function broadcastLeaderboard() {
    const leaderboard = getLeaderboardData();
    broadcastMessage({
        type: 'leaderboard',
        data: leaderboard
    });
}

/**
 * Get leaderboard data sorted by level and exp
 */
function getLeaderboardData() {
    const leaderboard = Array.from(players.values())
        .sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            return b.totalExp - a.totalExp;
        })
        .map((player, index) => ({
            rank: index + 1,
            id: player.id,
            name: player.name,
            level: player.level,
            class: player.class,
            totalExp: player.totalExp,
            gold: player.gold,
            combatPower: player.combatPower,
            lastUpdate: player.lastUpdate
        }));

    return {
        players: leaderboard,
        timestamp: Date.now(),
        totalPlayers: players.size
    };
}

/**
 * Broadcast system message to all players
 */
function broadcastSystemMessage(message) {
    broadcastMessage({
        type: 'system',
        data: {
            message: message,
            timestamp: Date.now()
        }
    });
}

/**
 * Broadcast message to all connected players
 */
function broadcastMessage(message) {
    const messageStr = JSON.stringify(message);
    connections.forEach((ws, playerId) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(messageStr);
        }
    });
}

/**
 * Get local IP address
 */
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

/**
 * Cleanup inactive players (haven't updated in 5 minutes)
 */
setInterval(() => {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    players.forEach((player, playerId) => {
        if (now - player.lastUpdate > timeout) {
            console.log(`[CLEANUP] Removing inactive player ${playerId} (${player.name})`);
            players.delete(playerId);
            connections.delete(playerId);
        }
    });
}, 60000); // Check every minute

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://${getLocalIP()}:${PORT}`);
    console.log(`✅ WebSocket server ready`);
    console.log(`\nPlayers can connect by opening the game on the same network!`);
    console.log('='.repeat(50));
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n[SHUTDOWN] Closing server...');
    broadcastSystemMessage('Server is shutting down!');
    wss.close(() => {
        httpServer.close(() => {
            console.log('[SHUTDOWN] Server closed');
            process.exit(0);
        });
    });
});
