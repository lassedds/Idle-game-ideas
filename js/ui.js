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
        elements.buildingsList = document.getElementById('buildings-list');
        elements.upgradesList = document.getElementById('upgrades-list');
        elements.achievementsList = document.getElementById('achievements-list');
        elements.notifications = document.getElementById('notifications');

        // Setup tab navigation
        setupTabs();

        // Initial render
        renderBuildings();
        renderUpgrades();
        renderAchievements();
    }

    /**
     * Setup tab navigation
     */
    function setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active from all
                tabBtns.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

                // Add active to clicked
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

        // Update affordability of items
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

            if (!isUnlocked && owned === 0) return; // Hide locked buildings

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

        elements.buildingsList.innerHTML = html || '<p style="text-align:center;color:#888;">Keep clicking to unlock buildings!</p>';
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

            if (!isUnlocked) return; // Hide locked upgrades

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

        elements.upgradesList.innerHTML = html || '<p style="text-align:center;color:#888;">Keep playing to unlock upgrades!</p>';
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
     * Update affordability styling
     */
    function updateAffordability() {
        // Update buildings
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

        // Update upgrades
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

    /**
     * Show a notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (default, achievement)
     */
    function showNotification(message, type = 'default') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = message;

        elements.notifications.appendChild(notification);

        // Remove after animation
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Show achievement notification
     * @param {Object} achievement - Achievement that was unlocked
     */
    function showAchievementNotification(achievement) {
        showNotification(
            `<span style="font-size:1.5rem;">${achievement.icon}</span>
             <div>
                <strong>Achievement Unlocked!</strong><br>
                ${achievement.name} (+${achievement.reward} ✨)
             </div>`,
            'achievement'
        );
        renderAchievements();
    }

    /**
     * Crystal click animation
     */
    function crystalClickAnimation() {
        const crystal = document.getElementById('main-crystal');
        crystal.classList.add('clicked');
        setTimeout(() => crystal.classList.remove('clicked'), 150);
    }

    // Public API
    return {
        init,
        updateResources,
        updateStats,
        renderBuildings,
        renderUpgrades,
        renderAchievements,
        showNotification,
        showAchievementNotification,
        crystalClickAnimation
    };
})();
