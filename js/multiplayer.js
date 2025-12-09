/**
 * Multiplayer Module
 * Handles WebSocket connection to local multiplayer server
 */

const Multiplayer = (function() {
    let ws = null;
    let connected = false;
    let playerId = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    let reconnectTimeout = null;
    let updateInterval = null;

    // Server configuration
    const DEFAULT_SERVER = 'ws://localhost:8080';
    let serverAddress = DEFAULT_SERVER;

    // Leaderboard data
    let leaderboardData = null;
    let chatHistory = [];

    /**
     * Initialize multiplayer
     */
    function init() {
        // Try to load saved server address
        const saved = localStorage.getItem('mp_server');
        if (saved) {
            serverAddress = saved;
        }

        // Generate or load player ID
        playerId = localStorage.getItem('mp_playerId');
        if (!playerId) {
            playerId = generatePlayerId();
            localStorage.setItem('mp_playerId', playerId);
        }

        // Auto-connect if enabled
        const autoConnect = localStorage.getItem('mp_autoConnect');
        if (autoConnect === 'true') {
            setTimeout(() => connect(), 1000);
        }
    }

    /**
     * Connect to multiplayer server
     */
    function connect(address = null) {
        if (connected || ws) {
            console.log('[MP] Already connected or connecting');
            return;
        }

        if (address) {
            serverAddress = address;
            localStorage.setItem('mp_server', address);
        }

        console.log(`[MP] Connecting to ${serverAddress}...`);

        try {
            ws = new WebSocket(serverAddress);

            ws.onopen = () => {
                console.log('[MP] ✅ Connected to multiplayer server!');
                connected = true;
                reconnectAttempts = 0;

                // Register player
                const char = Character.getActive();
                if (char) {
                    register(char);
                }

                // Start sending updates every 10 seconds
                updateInterval = setInterval(() => {
                    sendPlayerUpdate();
                }, 10000);

                // Notify UI
                if (window.MultiplayerUI) {
                    MultiplayerUI.onConnect();
                }
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    handleMessage(message);
                } catch (err) {
                    console.error('[MP] Failed to parse message:', err);
                }
            };

            ws.onerror = (error) => {
                console.error('[MP] ❌ WebSocket error:', error);
                if (window.MultiplayerUI) {
                    MultiplayerUI.showError('Connection error. Is the server running?');
                }
            };

            ws.onclose = () => {
                console.log('[MP] 🔌 Disconnected from server');
                connected = false;
                ws = null;

                if (updateInterval) {
                    clearInterval(updateInterval);
                    updateInterval = null;
                }

                if (window.MultiplayerUI) {
                    MultiplayerUI.onDisconnect();
                }

                // Attempt to reconnect
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
                    console.log(`[MP] Reconnecting in ${delay/1000}s... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
                    reconnectTimeout = setTimeout(() => connect(), delay);
                } else {
                    console.log('[MP] Max reconnect attempts reached. Please reconnect manually.');
                }
            };

        } catch (err) {
            console.error('[MP] Failed to connect:', err);
            if (window.MultiplayerUI) {
                MultiplayerUI.showError('Failed to connect to server');
            }
        }
    }

    /**
     * Disconnect from server
     */
    function disconnect() {
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }

        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }

        if (ws) {
            ws.close();
            ws = null;
        }

        connected = false;
        reconnectAttempts = 0;
    }

    /**
     * Register player with server
     */
    function register(character) {
        if (!connected || !ws) return;

        const stats = Character.getCombatStats();

        send({
            type: 'register',
            data: {
                playerId: playerId,
                name: character.name,
                level: character.level,
                class: character.class,
                totalExp: character.totalExp || 0,
                gold: Inventory.getGold(),
                combatPower: stats.power || 0
            }
        });
    }

    /**
     * Send player update to server
     */
    function sendPlayerUpdate() {
        if (!connected || !ws) return;

        const char = Character.getActive();
        if (!char) return;

        const stats = Character.getCombatStats();

        send({
            type: 'update',
            data: {
                level: char.level,
                totalExp: char.totalExp || 0,
                gold: Inventory.getGold(),
                combatPower: stats.power || 0
            }
        });
    }

    /**
     * Send chat message
     */
    function sendChat(message) {
        if (!connected || !ws) {
            console.log('[MP] Not connected to server');
            return false;
        }

        if (!message || message.trim().length === 0) {
            return false;
        }

        send({
            type: 'chat',
            data: {
                message: message.trim()
            }
        });

        return true;
    }

    /**
     * Request leaderboard update
     */
    function requestLeaderboard() {
        if (!connected || !ws) return;

        send({
            type: 'request_leaderboard'
        });
    }

    /**
     * Handle incoming message from server
     */
    function handleMessage(message) {
        const { type, data } = message;

        switch (type) {
            case 'welcome':
                console.log(`[MP] ${message.message}`);
                break;

            case 'registered':
                console.log(`[MP] ✅ ${message.message}`);
                requestLeaderboard(); // Request initial leaderboard
                break;

            case 'leaderboard':
                leaderboardData = data;
                if (window.MultiplayerUI) {
                    MultiplayerUI.updateLeaderboard(data);
                }
                break;

            case 'chat':
                chatHistory.push(data);
                if (chatHistory.length > 100) {
                    chatHistory.shift();
                }
                if (window.MultiplayerUI) {
                    MultiplayerUI.addChatMessage(data);
                }
                break;

            case 'system':
                chatHistory.push({
                    type: 'system',
                    message: data.message,
                    timestamp: data.timestamp
                });
                if (window.MultiplayerUI) {
                    MultiplayerUI.addSystemMessage(data.message);
                }
                break;

            case 'error':
                console.error('[MP] Server error:', message.message);
                if (window.MultiplayerUI) {
                    MultiplayerUI.showError(message.message);
                }
                break;

            case 'pong':
                // Ping response
                break;

            default:
                console.log('[MP] Unknown message type:', type);
        }
    }

    /**
     * Send message to server
     */
    function send(message) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        } else {
            console.error('[MP] Cannot send message - not connected');
        }
    }

    /**
     * Generate unique player ID
     */
    function generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get connection status
     */
    function isConnected() {
        return connected;
    }

    /**
     * Get current leaderboard
     */
    function getLeaderboard() {
        return leaderboardData;
    }

    /**
     * Get chat history
     */
    function getChatHistory() {
        return chatHistory;
    }

    /**
     * Get player ID
     */
    function getPlayerId() {
        return playerId;
    }

    /**
     * Set auto-connect
     */
    function setAutoConnect(enabled) {
        localStorage.setItem('mp_autoConnect', enabled ? 'true' : 'false');
    }

    // Public API
    return {
        init,
        connect,
        disconnect,
        sendChat,
        requestLeaderboard,
        isConnected,
        getLeaderboard,
        getChatHistory,
        getPlayerId,
        setAutoConnect
    };
})();
