/**
 * UI Module
 * Handles all UI rendering and updates
 */

const UI = (function() {
    // DOM element references
    const elements = {};

    /**
     * Initialize UI elements
     */
    function init() {
        // Cache DOM elements
        elements.crystalCount = document.getElementById('crystal-count');
        elements.gemCount = document.getElementById('gem-count');
        elements.cps = document.getElementById('crystals-per-second');
        elements.clickValue = document.getElementById('click-value');
        elements.totalClicks = document.getElementById('total-clicks');
        elements.totalCrystals = document.getElementById('total-crystals');
        elements.playTime = document.getElementById('play-time');
        elements.prestigeLevel = document.getElementById('prestige-level');
        elements.buildingsList = document.getElementById('buildings-list');
        elements.upgradesList = document.getElementById('upgrades-list');
        elements.achievementsList = document.getElementById('achievements-list');
        elements.notifications = document.getElementById('notifications');

        // New elements
        elements.eventBanner = document.getElementById('event-banner');
        elements.eventIcon = document.getElementById('event-icon');
        elements.eventName = document.getElementById('event-name');
        elements.eventTimer = document.getElementById('event-timer');
        elements.eventProgressFill = document.getElementById('event-progress-fill');
        elements.activeBonuses = document.getElementById('active-bonuses');
        elements.expeditionCount = document.getElementById('expedition-count');
        elements.activeExpeditionsList = document.getElementById('active-expeditions-list');
        elements.pendingRewards = document.getElementById('pending-rewards');
        elements.pendingRewardsList = document.getElementById('pending-rewards-list');
        elements.destinationsList = document.getElementById('destinations-list');
        elements.artifactBonuses = document.getElementById('artifact-bonuses');
        elements.artifactsList = document.getElementById('artifacts-list');
        elements.currentStardust = document.getElementById('current-stardust');
        elements.potentialStardust = document.getElementById('potential-stardust');
        elements.prestigeBtn = document.getElementById('prestige-btn');
        elements.prestigeUpgradesList = document.getElementById('prestige-upgrades-list');
        elements.stardustDisplay = document.getElementById('stardust-display');
        elements.stardustCount = document.getElementById('stardust-count');

        // Setup tab navigation
        setupTabs();

        // Setup prestige button
        if (elements.prestigeBtn) {
            elements.prestigeBtn.addEventListener('click', () => {
                Game.performPrestige();
            });
        }

        // Initial render
        renderBuildings();
        renderUpgrades();
        renderAchievements();
        renderExpeditions();
        renderArtifacts();
        renderPrestige();
    }

    /**
     * Setup tab navigation
     */
    function setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                const tabId = btn.dataset.tab + '-tab';
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    /**
     * Update resource displays
     */
    function updateResources() {
        const crystals = GameState.getCrystals();
        const gems = GameState.getGems();
        const cps = Resources.calculateCPS();
        const clickValue = Resources.calculateClickValue();

        elements.crystalCount.textContent = Resources.formatNumber(crystals);
        elements.gemCount.textContent = Resources.formatNumber(gems);
        elements.cps.textContent = Resources.formatNumber(cps);
        elements.clickValue.textContent = Resources.formatNumber(clickValue);

        // Update stardust display
        if (typeof Prestige !== 'undefined') {
            const prestigeInfo = Prestige.getPrestigeInfo();
            if (prestigeInfo.totalStardust > 0 || prestigeInfo.level > 0) {
                elements.stardustDisplay.style.display = 'flex';
                elements.stardustCount.textContent = prestigeInfo.stardust;
            }
        }

        updateAffordability();
    }

    /**
     * Update stats display
     */
    function updateStats() {
        const stats = GameState.getStats();
        elements.totalClicks.textContent = Resources.formatNumber(stats.totalClicks);
        elements.totalCrystals.textContent = Resources.formatNumber(stats.totalCrystals);
        elements.playTime.textContent = Resources.formatTime(stats.totalPlayTime);

        if (typeof Prestige !== 'undefined') {
            elements.prestigeLevel.textContent = Prestige.getPrestigeInfo().level;
        }
    }

    /**
     * Render buildings list
     */
    function renderBuildings() {
        const buildings = Buildings.getAll();
        let html = '';

        buildings.forEach(building => {
            const owned = GameState.getBuildingCount(building.id);
            const cost = Buildings.getCost(building.id);
            const production = Buildings.getProduction(building.id);
            const isUnlocked = Buildings.isUnlocked(building.id);
            const canAfford = Buildings.canAfford(building.id);

            if (!isUnlocked && owned === 0) return;

            html += `
                <div class="item-card ${canAfford ? 'affordable' : ''} ${!isUnlocked ? 'locked' : ''}"
                     data-building="${building.id}"
                     onclick="Game.buyBuilding('${building.id}')">
                    <div class="item-header">
                        <span class="item-icon">${building.icon}</span>
                        <span class="item-name">${building.name}</span>
                        <span class="item-owned">${owned}</span>
                    </div>
                    <div class="item-description">${building.description}</div>
                    <div class="item-stats">
                        <span class="item-production">
                            ${owned > 0 ? Resources.formatNumber(production) + '/s' : '+' + building.production + '/s each'}
                        </span>
                        <span class="item-cost ${canAfford ? 'can-afford' : 'cannot-afford'}">
                            💎 ${Resources.formatNumber(cost)}
                        </span>
                    </div>
                </div>
            `;
        });

        elements.buildingsList.innerHTML = html || '<div class="empty-state"><div class="empty-state-icon">🏗️</div>Keep clicking to unlock buildings!</div>';
    }

    /**
     * Render upgrades list
     */
    function renderUpgrades() {
        const upgrades = Upgrades.getAll();
        let html = '';

        upgrades.forEach(upgrade => {
            const isUnlocked = Upgrades.isUnlocked(upgrade.id);
            const isPurchased = GameState.hasUpgrade(upgrade.id);
            const canAfford = Upgrades.canAfford(upgrade.id);

            if (!isUnlocked) return;

            html += `
                <div class="item-card ${isPurchased ? 'purchased' : ''} ${canAfford && !isPurchased ? 'affordable' : ''}"
                     data-upgrade="${upgrade.id}"
                     onclick="Game.buyUpgrade('${upgrade.id}')">
                    <div class="item-header">
                        <span class="item-icon">${upgrade.icon}</span>
                        <span class="item-name">${upgrade.name}</span>
                        ${isPurchased ? '<span class="item-owned">✓</span>' : ''}
                    </div>
                    <div class="item-description">${upgrade.description}</div>
                    ${!isPurchased ? `
                        <div class="item-stats">
                            <span class="item-production">${upgrade.type}</span>
                            <span class="item-cost ${canAfford ? 'can-afford' : 'cannot-afford'}">
                                💎 ${Resources.formatNumber(upgrade.cost)}
                            </span>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        elements.upgradesList.innerHTML = html || '<div class="empty-state"><div class="empty-state-icon">⬆️</div>Keep playing to unlock upgrades!</div>';
    }

    /**
     * Render achievements list
     */
    function renderAchievements() {
        const achievements = Achievements.getAll();
        let html = `<p style="margin-bottom:15px;color:#888;">${Achievements.getUnlockedCount()}/${Achievements.getTotalCount()} unlocked</p>`;

        achievements.forEach(achievement => {
            const isUnlocked = GameState.hasAchievement(achievement.id);

            html += `
                <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                    <span class="achievement-icon">${achievement.icon}</span>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-description">${achievement.description}</div>
                        <div class="achievement-reward">+${achievement.reward} ✨ Gems</div>
                    </div>
                </div>
            `;
        });

        elements.achievementsList.innerHTML = html;
    }

    /**
     * Render expeditions tab
     */
    function renderExpeditions() {
        if (typeof Expeditions === 'undefined') return;

        // Active expeditions
        const active = Expeditions.getActive();
        elements.expeditionCount.textContent = active.length;

        let activeHtml = '';
        active.forEach((exp) => {
            activeHtml += `
                <div class="expedition-card active">
                    <div class="expedition-header">
                        <span class="expedition-name">
                            <span class="expedition-icon">${exp.destination.icon}</span>
                            ${exp.destination.name}
                        </span>
                    </div>
                    <div class="expedition-progress">
                        <div class="expedition-progress-bar">
                            <div class="expedition-progress-fill" style="width: ${exp.progress * 100}%"></div>
                        </div>
                        <div class="expedition-timer">
                            ${exp.isComplete ? '✅ Complete!' : Resources.formatTimeRemaining(exp.remaining / 1000)}
                        </div>
                    </div>
                </div>
            `;
        });
        elements.activeExpeditionsList.innerHTML = activeHtml || '<p style="color:#888;text-align:center;padding:10px;">No active expeditions</p>';

        // Pending rewards
        const pending = Expeditions.getPendingRewards();
        if (pending.length > 0) {
            elements.pendingRewards.classList.remove('hidden');
            let pendingHtml = '';
            pending.forEach((reward, index) => {
                pendingHtml += `
                    <div class="reward-card" onclick="Game.claimExpeditionReward(${index})">
                        <div class="reward-header">${reward.destination.icon} ${reward.destination.name}</div>
                        <div class="reward-items">
                            <span class="reward-item crystals">💎 ${Resources.formatNumber(reward.rewards.crystals)}</span>
                            ${reward.rewards.gems > 0 ? `<span class="reward-item gems">✨ ${reward.rewards.gems}</span>` : ''}
                            ${reward.rewards.artifact ? `<span class="reward-item artifact">🏺 ${reward.rewards.artifact.name}</span>` : ''}
                            ${reward.rewards.bonus ? `<span class="reward-item bonus">⚡ ${reward.rewards.bonus.type} boost!</span>` : ''}
                        </div>
                        <p style="font-size:0.75rem;color:#ffd700;margin-top:8px;">Click to claim!</p>
                    </div>
                `;
            });
            elements.pendingRewardsList.innerHTML = pendingHtml;
        } else {
            elements.pendingRewards.classList.add('hidden');
        }

        // Available destinations
        const destinations = Expeditions.getDestinations();
        let destHtml = '';
        destinations.forEach(dest => {
            const isUnlocked = Expeditions.isUnlocked(dest.id);
            const canStart = Expeditions.canStart(dest.id);
            const canAfford = GameState.getCrystals() >= dest.cost;

            if (!isUnlocked) return;

            let riskDots = '';
            for (let i = 1; i <= 7; i++) {
                riskDots += `<span class="risk-dot ${i <= dest.riskLevel ? 'active' : ''}"></span>`;
            }

            destHtml += `
                <div class="expedition-card ${canStart ? 'affordable' : ''} ${!canAfford ? 'locked' : ''}"
                     onclick="Game.startExpedition('${dest.id}')">
                    <div class="expedition-header">
                        <span class="expedition-name">
                            <span class="expedition-icon">${dest.icon}</span>
                            ${dest.name}
                        </span>
                        <span class="expedition-duration">${Resources.formatTimeRemaining(dest.duration)}</span>
                    </div>
                    <div class="expedition-description">${dest.description}</div>
                    <div class="expedition-rewards">
                        <span>💎 ${Resources.formatNumber(dest.rewards.crystals.min)}-${Resources.formatNumber(dest.rewards.crystals.max)}</span>
                        <span>🏺 ${Math.floor(dest.rewards.artifactChance * 100)}%</span>
                        <div class="risk-level">${riskDots}</div>
                    </div>
                    <div class="item-stats" style="margin-top:8px;">
                        <span></span>
                        <span class="expedition-cost">💎 ${Resources.formatNumber(dest.cost)}</span>
                    </div>
                </div>
            `;
        });
        elements.destinationsList.innerHTML = destHtml || '<div class="empty-state">Unlock destinations by earning crystals!</div>';
    }

    /**
     * Render artifacts tab
     */
    function renderArtifacts() {
        if (typeof Artifacts === 'undefined') return;

        const prodBonus = Artifacts.getProductionBonus();
        const clickBonus = Artifacts.getClickBonus();

        let bonusHtml = '';
        if (prodBonus > 1 || clickBonus > 1) {
            bonusHtml = `
                <div class="artifact-bonus-row">
                    <span>Production:</span>
                    <span class="artifact-bonus-value">x${prodBonus.toFixed(2)}</span>
                </div>
                <div class="artifact-bonus-row">
                    <span>Click Power:</span>
                    <span class="artifact-bonus-value">x${clickBonus.toFixed(2)}</span>
                </div>
            `;
        } else {
            bonusHtml = '<p style="color:#888;text-align:center;">Find artifacts from expeditions!</p>';
        }
        elements.artifactBonuses.innerHTML = bonusHtml;

        const artifacts = Artifacts.getOwned();
        let artifactsHtml = '';

        if (artifacts.length === 0) {
            artifactsHtml = '<div class="empty-state"><div class="empty-state-icon">🏺</div>No artifacts yet. Complete expeditions!</div>';
        } else {
            const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
            const sorted = [...artifacts].sort((a, b) =>
                rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
            );

            sorted.forEach(artifact => {
                const effectText = getArtifactEffectText(artifact);
                artifactsHtml += `
                    <div class="artifact-card ${artifact.rarity}">
                        <span class="artifact-icon">${artifact.icon}</span>
                        <div class="artifact-info">
                            <div class="artifact-name">${artifact.name}</div>
                            <div class="artifact-rarity ${artifact.rarity}">${artifact.rarity}</div>
                            <div class="artifact-effect">${effectText}</div>
                        </div>
                        ${artifact.count > 1 ? `<span class="artifact-count">x${artifact.count}</span>` : ''}
                    </div>
                `;
            });
        }
        elements.artifactsList.innerHTML = artifactsHtml;
    }

    function getArtifactEffectText(artifact) {
        const effect = artifact.effect;
        const value = ((effect.value - 1) * 100).toFixed(0);
        switch (effect.type) {
            case 'production': return `+${value}% production`;
            case 'click': return `+${value}% click power`;
            case 'all': return `+${value}% all stats`;
            case 'expedition': return `-${Math.abs(value)}% expedition time`;
            default: return '';
        }
    }

    /**
     * Render prestige tab
     */
    function renderPrestige() {
        if (typeof Prestige === 'undefined') return;

        const info = Prestige.getPrestigeInfo();

        elements.currentStardust.textContent = `${info.stardust} ⭐`;
        elements.potentialStardust.textContent = `+${info.potentialStardust} ⭐`;
        elements.prestigeBtn.disabled = !info.canPrestige;

        const upgrades = Prestige.getUpgrades();
        let html = '';

        upgrades.forEach(upgrade => {
            const levelText = upgrade.maxLevel === -1
                ? `Lv.${upgrade.currentLevel}`
                : `${upgrade.currentLevel}/${upgrade.maxLevel}`;

            html += `
                <div class="prestige-upgrade-card ${upgrade.canAfford ? 'affordable' : ''} ${upgrade.maxed ? 'maxed' : ''}"
                     onclick="Game.buyPrestigeUpgrade('${upgrade.id}')">
                    <div class="prestige-upgrade-header">
                        <span class="prestige-upgrade-name">
                            ${upgrade.icon} ${upgrade.name}
                        </span>
                        <span class="prestige-upgrade-level">${levelText}</span>
                    </div>
                    <div class="prestige-upgrade-description">${upgrade.description}</div>
                    ${!upgrade.maxed ? `
                        <div class="prestige-upgrade-cost">⭐ ${upgrade.cost} Stardust</div>
                    ` : '<div style="color:#00b894;">MAXED</div>'}
                </div>
            `;
        });

        elements.prestigeUpgradesList.innerHTML = html;
    }

    /**
     * Update event banner
     */
    function updateEventBanner() {
        if (typeof Events === 'undefined') return;

        const event = Events.getActiveEvent();

        if (event) {
            elements.eventBanner.classList.remove('hidden');
            elements.eventIcon.textContent = event.icon;
            elements.eventName.textContent = event.name;
            elements.eventTimer.textContent = Resources.formatTimeRemaining(event.remaining);
            elements.eventProgressFill.style.width = `${(1 - event.progress) * 100}%`;
        } else {
            elements.eventBanner.classList.add('hidden');
        }
    }

    /**
     * Update active bonuses display
     */
    function updateActiveBonuses() {
        if (typeof Expeditions === 'undefined') return;

        const expeditionBonuses = Expeditions.getActiveBonuses();
        let html = '';

        expeditionBonuses.forEach(bonus => {
            html += `
                <div class="bonus-badge">
                    <span>${bonus.type.toUpperCase()}</span>
                    <span>x${bonus.multiplier}</span>
                    <span>${Resources.formatTimeRemaining(bonus.remaining)}</span>
                </div>
            `;
        });

        elements.activeBonuses.innerHTML = html;
    }

    /**
     * Update affordability styling
     */
    function updateAffordability() {
        document.querySelectorAll('[data-building]').forEach(card => {
            const buildingId = card.dataset.building;
            const canAfford = Buildings.canAfford(buildingId);
            card.classList.toggle('affordable', canAfford);
            const costEl = card.querySelector('.item-cost');
            if (costEl) {
                costEl.classList.toggle('can-afford', canAfford);
                costEl.classList.toggle('cannot-afford', !canAfford);
            }
        });

        document.querySelectorAll('[data-upgrade]').forEach(card => {
            const upgradeId = card.dataset.upgrade;
            if (!GameState.hasUpgrade(upgradeId)) {
                const canAfford = Upgrades.canAfford(upgradeId);
                card.classList.toggle('affordable', canAfford);
                const costEl = card.querySelector('.item-cost');
                if (costEl) {
                    costEl.classList.toggle('can-afford', canAfford);
                    costEl.classList.toggle('cannot-afford', !canAfford);
                }
            }
        });
    }

    function showNotification(message, type = 'default') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = message;
        elements.notifications.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    function showAchievementNotification(achievement) {
        showNotification(
            `<span style="font-size:1.5rem;">${achievement.icon}</span>
             <div>
                <strong>Achievement!</strong><br>
                ${achievement.name} (+${achievement.reward} ✨)
             </div>`,
            'achievement'
        );
        renderAchievements();
    }

    function showEventNotification(event) {
        showNotification(
            `<span style="font-size:1.5rem;">${event.icon}</span>
             <div>
                <strong>${event.name}</strong><br>
                ${event.description}
             </div>`,
            'event'
        );
    }

    function showExpeditionNotification(message) {
        showNotification(message, 'expedition');
    }

    function showArtifactNotification(artifact) {
        showNotification(
            `<span style="font-size:1.5rem;">${artifact.icon}</span>
             <div>
                <strong>Artifact Found!</strong><br>
                ${artifact.name} (${artifact.rarity})
             </div>`,
            'artifact'
        );
    }

    function crystalClickAnimation() {
        const crystal = document.getElementById('main-crystal');
        crystal.classList.add('clicked');
        setTimeout(() => crystal.classList.remove('clicked'), 150);
    }

    return {
        init,
        updateResources,
        updateStats,
        renderBuildings,
        renderUpgrades,
        renderAchievements,
        renderExpeditions,
        renderArtifacts,
        renderPrestige,
        updateEventBanner,
        updateActiveBonuses,
        showNotification,
        showAchievementNotification,
        showEventNotification,
        showExpeditionNotification,
        showArtifactNotification,
        crystalClickAnimation
    };
})();
