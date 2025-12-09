/**
 * Multiplayer UI Module
 * Handles UI for leaderboard and chat
 */

const MultiplayerUI = (function() {
    /**
     * Initialize multiplayer UI
     */
    function init() {
        setupConnectionControls();
        setupChatInput();
        renderConnectionStatus();
    }

    /**
     * Setup connection controls
     */
    function setupConnectionControls() {
        const connectBtn = document.getElementById('mp-connect-btn');
        const disconnectBtn = document.getElementById('mp-disconnect-btn');
        const serverInput = document.getElementById('mp-server-input');
        const autoConnectCheckbox = document.getElementById('mp-auto-connect');

        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                const address = serverInput.value.trim() || 'ws://localhost:8080';
                Multiplayer.connect(address);
            });
        }

        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => {
                Multiplayer.disconnect();
            });
        }

        if (autoConnectCheckbox) {
            // Load saved preference
            autoConnectCheckbox.checked = localStorage.getItem('mp_autoConnect') === 'true';

            autoConnectCheckbox.addEventListener('change', (e) => {
                Multiplayer.setAutoConnect(e.target.checked);
            });
        }

        // Load saved server address
        if (serverInput) {
            const saved = localStorage.getItem('mp_server');
            if (saved) {
                serverInput.value = saved;
            }
        }
    }

    /**
     * Setup chat input
     */
    function setupChatInput() {
        const chatInput = document.getElementById('mp-chat-input');
        const sendBtn = document.getElementById('mp-chat-send');

        function sendMessage() {
            const message = chatInput.value.trim();
            if (message && Multiplayer.sendChat(message)) {
                chatInput.value = '';
            } else if (!Multiplayer.isConnected()) {
                showError('Not connected to server!');
            }
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
    }

    /**
     * Render connection status
     */
    function renderConnectionStatus() {
        const statusEl = document.getElementById('mp-status');
        const connectBtn = document.getElementById('mp-connect-btn');
        const disconnectBtn = document.getElementById('mp-disconnect-btn');

        if (!statusEl) return;

        if (Multiplayer.isConnected()) {
            statusEl.innerHTML = '<span class="status-connected">🟢 Connected</span>';
            if (connectBtn) connectBtn.disabled = true;
            if (disconnectBtn) disconnectBtn.disabled = false;
        } else {
            statusEl.innerHTML = '<span class="status-disconnected">🔴 Disconnected</span>';
            if (connectBtn) connectBtn.disabled = false;
            if (disconnectBtn) disconnectBtn.disabled = true;
        }
    }

    /**
     * Update leaderboard display
     */
    function updateLeaderboard(data) {
        const container = document.getElementById('mp-leaderboard');
        if (!container) return;

        const { players, totalPlayers } = data;

        if (!players || players.length === 0) {
            container.innerHTML = '<p class="hint">No players online. Be the first!</p>';
            return;
        }

        const myPlayerId = Multiplayer.getPlayerId();

        container.innerHTML = `
            <div class="leaderboard-header">
                <h4>🏆 Leaderboard</h4>
                <span class="player-count">${totalPlayers} player${totalPlayers !== 1 ? 's' : ''} online</span>
            </div>
            <div class="leaderboard-list">
                ${players.map(player => {
                    const isMe = player.id === myPlayerId;
                    const rankIcon = player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`;

                    return `
                        <div class="leaderboard-entry ${isMe ? 'is-me' : ''}">
                            <span class="rank">${rankIcon}</span>
                            <div class="player-info">
                                <div class="player-name">${player.name}${isMe ? ' (You)' : ''}</div>
                                <div class="player-details">
                                    Lv.${player.level} ${player.class} • ⚔️${player.combatPower}
                                </div>
                            </div>
                            <div class="player-stats">
                                <div>💰 ${formatNumber(player.gold)}</div>
                                <div>📈 ${formatNumber(player.totalExp)} XP</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Add chat message
     */
    function addChatMessage(data) {
        const container = document.getElementById('mp-chat-messages');
        if (!container) return;

        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message';

        const time = new Date(data.timestamp).toLocaleTimeString();
        messageEl.innerHTML = `
            <span class="chat-time">[${time}]</span>
            <span class="chat-name">${data.playerName}:</span>
            <span class="chat-text">${escapeHtml(data.message)}</span>
        `;

        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;

        // Keep only last 50 messages
        while (container.children.length > 50) {
            container.removeChild(container.firstChild);
        }
    }

    /**
     * Add system message
     */
    function addSystemMessage(message) {
        const container = document.getElementById('mp-chat-messages');
        if (!container) return;

        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message system';

        const time = new Date().toLocaleTimeString();
        messageEl.innerHTML = `
            <span class="chat-time">[${time}]</span>
            <span class="chat-text system">📢 ${escapeHtml(message)}</span>
        `;

        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;
    }

    /**
     * Show error message
     */
    function showError(message) {
        const errorEl = document.getElementById('mp-error');
        if (!errorEl) return;

        errorEl.textContent = message;
        errorEl.classList.remove('hidden');

        setTimeout(() => {
            errorEl.classList.add('hidden');
        }, 3000);
    }

    /**
     * On connect callback
     */
    function onConnect() {
        renderConnectionStatus();
        showError('Connected to multiplayer server!');

        // Clear chat
        const chatContainer = document.getElementById('mp-chat-messages');
        if (chatContainer) {
            chatContainer.innerHTML = '<div class="chat-message system"><span class="chat-text system">📢 Connected to server!</span></div>';
        }
    }

    /**
     * On disconnect callback
     */
    function onDisconnect() {
        renderConnectionStatus();

        const chatContainer = document.getElementById('mp-chat-messages');
        if (chatContainer) {
            const messageEl = document.createElement('div');
            messageEl.className = 'chat-message system';
            messageEl.innerHTML = '<span class="chat-text system">📢 Disconnected from server</span>';
            chatContainer.appendChild(messageEl);
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Format number with commas
     */
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Public API
    return {
        init,
        updateLeaderboard,
        addChatMessage,
        addSystemMessage,
        showError,
        onConnect,
        onDisconnect
    };
})();
