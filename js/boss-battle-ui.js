/**
 * Boss Battle UI Module
 * Handles the visual display and interactions for boss battles
 */

const BossBattleUI = (function() {
    let currentBattleState = null;

    /**
     * Show the boss battle screen
     */
    function show(battle) {
        currentBattleState = battle;
        const screen = document.getElementById('boss-battle-screen');
        screen.classList.remove('hidden');

        // Initialize UI with battle data
        updateUI();
        renderMoves();
    }

    /**
     * Hide the boss battle screen
     */
    function hide() {
        const screen = document.getElementById('boss-battle-screen');
        screen.classList.add('hidden');
        currentBattleState = null;
    }

    /**
     * Update all UI elements with current battle state
     */
    function updateUI() {
        if (!currentBattleState) return;

        const { boss, player, terrain, chaosEnergy, corruption, turn, resonanceMultiplier, comboChain } = currentBattleState;

        // Update boss info
        document.getElementById('boss-battle-name').textContent = boss.name;
        document.getElementById('boss-battle-level').textContent = `Lv. ${boss.level}`;
        document.getElementById('boss-battle-icon').innerHTML = boss.icon;
        updateTypeBadges('boss-battle-types', boss.types);
        updateHP('boss', boss.currentHp, boss.maxHp);
        updateChaos('boss', chaosEnergy.boss);
        updateCorruption('boss', corruption.boss);

        // Update player info
        document.getElementById('player-battle-name').textContent = player.name;
        document.getElementById('player-battle-level').textContent = `Lv. ${player.level}`;
        updateTypeBadges('player-battle-types', player.types);
        updateHP('player', player.currentHp, player.maxHp);
        updateChaos('player', chaosEnergy.player);
        updateCorruption('player', corruption.player);

        // Update terrain
        updateTerrain(terrain);

        // Update turn
        document.getElementById('battle-turn').textContent = turn;

        // Update indicators
        updateIndicators(resonanceMultiplier.player, comboChain.player);
    }

    /**
     * Update type badges
     */
    function updateTypeBadges(elementId, types) {
        const container = document.getElementById(elementId);
        container.innerHTML = types.map(type =>
            `<span class="type-badge type-${type}">${type}</span>`
        ).join('');
    }

    /**
     * Update HP bar
     */
    function updateHP(target, current, max) {
        const percent = Math.max(0, Math.min(100, (current / max) * 100));
        const fill = document.getElementById(`${target}-battle-hp-fill`);
        const text = document.getElementById(`${target}-battle-hp-text`);

        fill.style.width = `${percent}%`;
        text.textContent = `${Math.floor(current)}/${max}`;

        // Add damage animation
        if (fill.dataset.lastValue && current < fill.dataset.lastValue) {
            const card = target === 'boss' ? document.querySelector('.boss-info-card') : document.querySelector('.player-info-card');
            card.classList.add('damage-animation');
            setTimeout(() => card.classList.remove('damage-animation'), 300);
        }
        fill.dataset.lastValue = current;
    }

    /**
     * Update chaos energy bar
     */
    function updateChaos(target, value) {
        const percent = Math.min(100, (value / 150) * 100); // Max 150 chaos
        const fill = document.getElementById(`${target}-chaos-fill`);
        const text = document.getElementById(`${target}-chaos-text`);

        fill.style.width = `${percent}%`;
        text.textContent = Math.floor(value);
    }

    /**
     * Update corruption bar
     */
    function updateCorruption(target, value) {
        const percent = Math.min(100, value); // Max 100 corruption
        const fill = document.getElementById(`${target}-corruption-fill`);
        const text = document.getElementById(`${target}-corruption-text`);

        fill.style.width = `${percent}%`;
        text.textContent = Math.floor(value);

        // Warning glow at high corruption
        if (value >= 80) {
            fill.parentElement.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.8)';
        } else {
            fill.parentElement.style.boxShadow = '';
        }
    }

    /**
     * Update terrain display
     */
    function updateTerrain(terrain) {
        if (!terrain) return;

        document.getElementById('terrain-name').textContent = terrain.name;

        if (currentBattleState.terrainTurnsLeft < 999) {
            document.getElementById('terrain-turns').textContent = `(${currentBattleState.terrainTurnsLeft} turns)`;
        } else {
            document.getElementById('terrain-turns').textContent = '';
        }

        // Set terrain-specific background effects
        const arena = document.querySelector('.battle-arena');
        arena.className = 'battle-arena';
        if (terrain.name === 'Volcanic Wasteland') {
            arena.classList.add('terrain-volcanic');
        } else if (terrain.name === 'Flooded Ruins') {
            arena.classList.add('terrain-flooded');
        } else if (terrain.name === 'Corrupted Zone') {
            arena.classList.add('terrain-corrupted');
        } else if (terrain.name === 'Chaotic Vortex') {
            arena.classList.add('terrain-chaotic');
        }
    }

    /**
     * Update special indicators (resonance, combo)
     */
    function updateIndicators(resonance, combo) {
        const resonanceEl = document.getElementById('battle-resonance');
        const comboEl = document.getElementById('battle-combo');

        if (resonance > 1) {
            resonanceEl.classList.remove('hidden');
        } else {
            resonanceEl.classList.add('hidden');
        }

        if (combo > 0) {
            comboEl.classList.remove('hidden');
            document.getElementById('combo-count').textContent = combo;
        } else {
            comboEl.classList.add('hidden');
        }
    }

    /**
     * Render move buttons
     */
    function renderMoves() {
        if (!currentBattleState) return;

        const container = document.getElementById('battle-moves');
        const { player } = currentBattleState;
        const allMoves = BossCombat.getAllMoves();

        container.innerHTML = player.moves.map(moveId => {
            const move = allMoves[moveId];
            const pp = player.ppRemaining[moveId];
            const disabled = pp <= 0 || (move.chaosRequired && currentBattleState.chaosEnergy.player < move.chaosRequired);

            return `
                <button class="battle-move-btn" data-move="${moveId}" ${disabled ? 'disabled' : ''}>
                    <span class="move-name">${move.name}</span>
                    <div class="move-info">
                        <span class="move-pp">PP: ${pp}/${move.pp}</span>
                        ${move.power ? `<span class="move-power">PWR: ${move.power}</span>` : '<span>Status</span>'}
                    </div>
                    ${move.chaosRequired ? `<div class="move-chaos">⚡ ${move.chaosRequired} Chaos</div>` : ''}
                </button>
            `;
        }).join('');

        // Add event listeners
        container.querySelectorAll('.battle-move-btn').forEach(btn => {
            btn.addEventListener('click', handleMoveClick);
        });
    }

    /**
     * Handle move button click
     */
    function handleMoveClick(event) {
        const moveId = event.currentTarget.dataset.move;
        if (!moveId) return;

        // Disable all buttons during processing
        const buttons = document.querySelectorAll('.battle-move-btn');
        buttons.forEach(btn => btn.disabled = true);

        // Execute the move
        const result = BossCombat.executeTurn(moveId);

        if (result && result.error) {
            addBattleMessage(result.error, 'error');
            buttons.forEach(btn => btn.disabled = false);
            return;
        }

        // Update battle state
        currentBattleState = BossCombat.getCurrentBattle();

        if (!currentBattleState) {
            // Battle ended
            handleBattleEnd(result);
            return;
        }

        // Display battle messages
        displayTurnResults();

        // Update UI
        setTimeout(() => {
            updateUI();
            renderMoves();
        }, 500);
    }

    /**
     * Display turn results in battle log
     */
    function displayTurnResults() {
        if (!currentBattleState || !currentBattleState.log) return;

        const recentLogs = currentBattleState.log.slice(-2); // Last 2 entries (player + boss)

        recentLogs.forEach(log => {
            const isPlayer = log.attacker === 'player';
            const name = isPlayer ? currentBattleState.player.name : currentBattleState.boss.name;

            let message = `${name} used ${log.move}!`;

            // Add damage info
            if (log.damage) {
                message += ` ${Math.floor(log.damage)} damage!`;

                if (log.effectiveness > 1) {
                    message += ' Super effective!';
                } else if (log.effectiveness < 1 && log.effectiveness > 0) {
                    message += ' Not very effective...';
                } else if (log.effectiveness === 0) {
                    message += ' No effect...';
                }

                if (log.critical) {
                    message += ' Critical hit!';
                }
            }

            // Add special messages
            if (log.special) {
                message += ` ${log.special}`;
            }

            // Add effects
            if (log.effects && log.effects.length > 0) {
                log.effects.forEach(effect => {
                    addBattleMessage(effect, 'special');
                });
            }

            // Add echo results
            if (log.echoResults && log.echoResults.length > 0) {
                log.echoResults.forEach(echo => {
                    addBattleMessage(`Echo: ${echo.move} hit for ${Math.floor(echo.damage)} damage!`, 'special');
                });
            }

            addBattleMessage(message, isPlayer ? 'player' : 'boss');
        });
    }

    /**
     * Add a message to the battle log
     */
    function addBattleMessage(text, type = 'player') {
        const messagesContainer = document.getElementById('battle-messages');
        const messageEl = document.createElement('div');
        messageEl.className = `battle-message ${type === 'boss' ? 'boss-action' : ''} ${type === 'special' ? 'special' : ''}`;
        messageEl.textContent = text;

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Keep only last 10 messages
        while (messagesContainer.children.length > 10) {
            messagesContainer.removeChild(messagesContainer.firstChild);
        }
    }

    /**
     * Handle battle end
     */
    function handleBattleEnd(result) {
        if (!result) return;

        // Show results
        const messagesContainer = document.getElementById('battle-messages');
        messagesContainer.innerHTML = '';

        if (result.won) {
            addBattleMessage('🎉 Victory!', 'special');
            addBattleMessage(`Defeated ${result.boss} in ${result.turns} turns!`, 'special');
            addBattleMessage(`Gained ${currentBattleState.boss.exp} EXP and ${currentBattleState.boss.gold} gold!`, 'special');

            if (result.drops && result.drops.length > 0) {
                result.drops.forEach(drop => {
                    const item = Inventory.getItemById(drop.itemId);
                    addBattleMessage(`Obtained ${drop.quantity}x ${item.name}!`, 'special');
                });
            }
        } else {
            addBattleMessage('💀 Defeated...', 'error');
            if (result.goldLost) {
                addBattleMessage(`Lost ${result.goldLost} gold...`, 'error');
            }
        }

        // Add close button
        setTimeout(() => {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'flee-btn';
            closeBtn.textContent = 'Continue';
            closeBtn.onclick = () => {
                hide();
                // Return to world
                UI.switchTab('world');
            };
            document.querySelector('.move-selection').innerHTML = '';
            document.querySelector('.move-selection').appendChild(closeBtn);
        }, 1000);
    }

    /**
     * Handle flee button
     */
    document.addEventListener('DOMContentLoaded', () => {
        const fleeBtn = document.getElementById('flee-battle-btn');
        if (fleeBtn) {
            fleeBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to flee? You will lose some gold!')) {
                    // End battle as defeat
                    const result = { won: false, goldLost: Math.floor(Inventory.getGold() * 0.1) };
                    Inventory.removeGold(result.goldLost);
                    handleBattleEnd(result);
                }
            });
        }
    });

    // Public API
    return {
        show,
        hide,
        updateUI,
        addBattleMessage
    };
})();
