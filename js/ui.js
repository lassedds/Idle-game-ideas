/**
 * UI Module
 * Handles all UI rendering and interactions for Idle Legends
 */

const UI = (function() {
    let currentTab = 'world';
    let currentQuestFilter = 'active';
    let currentInventoryFilter = 'all';
    let currentTalentTree = 'combat';
    let selectedClass = null;

    /**
     * Initialize UI
     */
    function init() {
        setupTabNavigation();
        setupCharacterCreation();
        setupInventoryFilters();
        setupQuestFilters();
        setupTalentTabs();
        setupSaveButton();
        renderClassSelection();
    }

    /**
     * Setup save button
     */
    function setupSaveButton() {
        document.getElementById('save-btn').addEventListener('click', () => {
            SaveSystem.save();
            showNotification('Game saved!', 'success');
        });
    }

    /**
     * Setup main tab navigation
     */
    function setupTabNavigation() {
        document.querySelectorAll('.main-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                switchTab(tabName);
            });
        });
    }

    /**
     * Switch main content tab
     */
    function switchTab(tabName) {
        currentTab = tabName;

        document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.main-content').forEach(c => c.classList.remove('active'));

        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const tabContent = document.getElementById(`${tabName}-tab`);

        if (tabBtn) tabBtn.classList.add('active');
        if (tabContent) tabContent.classList.add('active');
    }

    /**
     * Setup character creation modal
     */
    function setupCharacterCreation() {
        const modal = document.getElementById('create-character-modal');
        const createBtn = document.getElementById('create-character-btn');
        const confirmBtn = document.getElementById('confirm-create-btn');
        const cancelBtn = document.getElementById('cancel-create-btn');

        if (createBtn) {
            createBtn.addEventListener('click', () => {
                if (Character.getAll().length >= Character.MAX_CHARACTERS) {
                    showNotification('Maximum characters reached!', 'error');
                    return;
                }
                modal.classList.remove('hidden');
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
                selectedClass = null;
                document.getElementById('char-name').value = '';
                renderClassSelection();
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                const name = document.getElementById('char-name').value.trim();
                if (!name) {
                    showNotification('Please enter a name!', 'error');
                    return;
                }
                if (!selectedClass) {
                    showNotification('Please select a class!', 'error');
                    return;
                }

                const char = Character.createCharacter(name, selectedClass);
                if (char) {
                    Skills.initCharacter(char.id);
                    Talents.initCharacter(char.id);
                    modal.classList.add('hidden');
                    selectedClass = null;
                    document.getElementById('char-name').value = '';
                    renderCharacterSlots();
                    updateCharacterInfo();
                    showNotification(`${name} the ${Character.getClass(selectedClass).name} created!`, 'success');
                }
            });
        }
    }

    /**
     * Render class selection in modal
     */
    function renderClassSelection() {
        const container = document.getElementById('class-selection');
        if (!container) return;

        const classes = Character.getClasses();
        container.innerHTML = '';

        for (const classId in classes) {
            const cls = classes[classId];
            const div = document.createElement('div');
            div.className = `class-option ${selectedClass === classId ? 'selected' : ''}`;
            div.innerHTML = `
                <span class="class-icon">${cls.icon}</span>
                <div class="class-name">${cls.name}</div>
                <div class="class-desc">${cls.description}</div>
            `;
            div.addEventListener('click', () => {
                selectedClass = classId;
                renderClassSelection();
            });
            container.appendChild(div);
        }
    }

    /**
     * Render character slots in top bar
     */
    function renderCharacterSlots() {
        const container = document.getElementById('character-slots');
        if (!container) return;

        const characters = Character.getAll();
        const activeChar = Character.getActive();

        container.innerHTML = '';

        characters.forEach((char, index) => {
            const cls = Character.getClass(char.class);
            const div = document.createElement('div');
            div.className = `char-slot ${activeChar && activeChar.id === char.id ? 'active' : ''}`;
            div.innerHTML = `
                <span class="class-icon">${cls.icon}</span>
                <div class="char-info">
                    <span class="char-name">${char.name}</span>
                    <span class="char-level">Lv. ${char.level} ${cls.name}</span>
                </div>
            `;
            div.addEventListener('click', () => {
                Character.setActive(index);
                renderCharacterSlots();
                updateCharacterInfo();
                renderSkills();
                renderTalents();
            });
            container.appendChild(div);
        });
    }

    /**
     * Update character info panel
     */
    function updateCharacterInfo() {
        const char = Character.getActive();
        const infoPanel = document.getElementById('character-info');
        const equipPanel = document.getElementById('equipment-panel');
        const statsPanel = document.getElementById('stats-panel');

        if (!infoPanel) return;

        if (!char) {
            infoPanel.innerHTML = '<h3>No Character</h3><p class="hint">Create a character to begin!</p>';
            if (equipPanel) equipPanel.classList.add('hidden');
            if (statsPanel) statsPanel.classList.add('hidden');
            return;
        }

        const cls = Character.getClass(char.class);
        const charIndex = Character.getAll().indexOf(char);
        const expPercent = (char.exp / char.expToLevel) * 100;

        infoPanel.innerHTML = `
            <div class="char-portrait">${cls.icon}</div>
            <h3>${char.name}</h3>
            <div class="char-class">${cls.name}</div>
            <div class="level-display">
                <span class="level">Level ${char.level}</span>
            </div>
            <div class="exp-bar">
                <div class="fill" style="width: ${expPercent}%"></div>
                <span>${char.exp}/${char.expToLevel} XP</span>
            </div>
            <div class="hp-bar">
                <div class="hp-fill" style="width: ${(char.hp / char.maxHp) * 100}%"></div>
                <span>❤️ ${char.hp}/${char.maxHp}</span>
            </div>
        `;

        if (equipPanel) equipPanel.classList.remove('hidden');
        if (statsPanel) statsPanel.classList.remove('hidden');

        // Update stats
        const statStr = document.getElementById('stat-str');
        const statAgi = document.getElementById('stat-agi');
        const statWis = document.getElementById('stat-wis');
        const statLuk = document.getElementById('stat-luk');

        if (statStr) statStr.textContent = Math.floor(char.stats.str);
        if (statAgi) statAgi.textContent = Math.floor(char.stats.agi);
        if (statWis) statWis.textContent = Math.floor(char.stats.wis);
        if (statLuk) statLuk.textContent = Math.floor(char.stats.luk);

        const combatStats = Combat.getCombatStats(charIndex);
        if (combatStats) {
            const combatPower = document.getElementById('combat-power');
            const critChance = document.getElementById('crit-chance');
            const defense = document.getElementById('defense');

            if (combatPower) combatPower.textContent = combatStats.power;
            if (critChance) critChance.textContent = combatStats.critChance + '%';
            if (defense) defense.textContent = combatStats.defense;
        }

        updateEquipmentSlots();
    }

    /**
     * Update equipment slot display
     */
    function updateEquipmentSlots() {
        const char = Character.getActive();
        if (!char) return;

        document.querySelectorAll('.equip-slot').forEach(slot => {
            const slotName = slot.dataset.slot;
            const itemId = char.equipment[slotName];

            if (itemId) {
                const item = Inventory.getItemDef(itemId);
                slot.innerHTML = item ? item.icon : '❓';
                slot.classList.add('equipped');
            } else {
                const defaultIcons = {
                    helmet: '🪖', weapon: '⚔️', armor: '🛡️',
                    gloves: '🧤', boots: '👢', ring: '💍', amulet: '📿'
                };
                slot.innerHTML = defaultIcons[slotName] || '◻️';
                slot.classList.remove('equipped');
            }
        });
    }

    /**
     * Render world map zones
     */
    function renderZones() {
        const container = document.getElementById('zones-grid');
        if (!container) return;

        const zones = World.getAllZones();
        container.innerHTML = '';

        for (const zoneId in zones) {
            const zone = zones[zoneId];
            const unlocked = World.isZoneUnlocked(zoneId);

            const div = document.createElement('div');
            div.className = `zone-card ${unlocked ? '' : 'locked'}`;
            div.innerHTML = `
                <span class="zone-icon">${zone.icon}</span>
                <div class="zone-name">${zone.name}</div>
                <div class="zone-level">Req. Lv. ${zone.reqLevel}</div>
                <div class="zone-activities">
                    ${zone.activities.map(a => getActivityIcon(a.type)).join('')}
                </div>
            `;

            if (unlocked) {
                div.addEventListener('click', () => showZoneActivities(zoneId));
            }

            container.appendChild(div);
        }
    }

    /**
     * Get icon for activity type
     */
    function getActivityIcon(type) {
        const icons = {
            mining: '⛏️',
            woodcutting: '🪓',
            fishing: '🎣',
            combat: '⚔️'
        };
        return icons[type] || '❓';
    }

    /**
     * Show zone activities
     */
    function showZoneActivities(zoneId) {
        const zone = World.getZone(zoneId);
        const char = Character.getActive();

        if (!char) {
            showNotification('Create a character first!', 'error');
            return;
        }

        const activityArea = document.getElementById('current-activity');
        if (!activityArea) return;

        activityArea.classList.remove('hidden');

        let html = `<h4>${zone.name} - Choose Activity:</h4><div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">`;

        zone.activities.forEach(activity => {
            const icon = getActivityIcon(activity.type);
            const label = activity.type.charAt(0).toUpperCase() + activity.type.slice(1);
            html += `<button class="btn-primary" style="padding: 15px 25px;" onclick="Game.startActivity('${zoneId}', '${activity.type}')">${icon} ${label}</button>`;
        });

        html += '</div>';

        document.getElementById('activity-content').innerHTML = html;
        document.getElementById('activity-title').textContent = zone.name;
    }

    /**
     * Update activity display
     */
    function updateActivityDisplay(zoneId, activityType, progress) {
        const activityArea = document.getElementById('current-activity');
        const activityContent = document.getElementById('activity-content');
        const activityTitle = document.getElementById('activity-title');

        if (!activityArea || !activityContent) return;

        activityArea.classList.remove('hidden');

        const zone = World.getZone(zoneId);
        const icon = getActivityIcon(activityType);

        activityTitle.textContent = `${zone.name} - ${activityType}`;

        activityContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <span style="font-size: 3rem;">${icon}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress * 100}%"></div>
                <span>${Math.floor(progress * 100)}%</span>
            </div>
        `;
    }

    /**
     * Hide activity display
     */
    function hideActivityDisplay() {
        const activityArea = document.getElementById('current-activity');
        if (activityArea) activityArea.classList.add('hidden');
    }

    /**
     * Setup inventory filters
     */
    function setupInventoryFilters() {
        document.querySelectorAll('.inventory-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentInventoryFilter = btn.dataset.filter;
                document.querySelectorAll('.inventory-filters .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderInventory();
            });
        });
    }

    /**
     * Render inventory
     */
    function renderInventory() {
        const container = document.getElementById('inventory-grid');
        if (!container) return;

        const items = Inventory.getAll();
        const allDefs = Inventory.getAllItemDefs();

        container.innerHTML = '';

        for (const itemId in items) {
            const quantity = items[itemId];
            const def = allDefs[itemId];

            if (!def) continue;
            if (currentInventoryFilter !== 'all' && def.type !== currentInventoryFilter) continue;

            const div = document.createElement('div');
            div.className = `inventory-slot rarity-${def.rarity}`;
            div.innerHTML = `
                ${def.icon}
                ${quantity > 1 ? `<span class="quantity">${quantity}</span>` : ''}
            `;
            div.addEventListener('mouseenter', (e) => showItemTooltip(e, def));
            div.addEventListener('mouseleave', hideTooltip);
            div.addEventListener('click', () => handleItemClick(itemId));
            container.appendChild(div);
        }
    }

    /**
     * Handle item click
     */
    function handleItemClick(itemId) {
        const def = Inventory.getItemDef(itemId);
        if (!def) return;

        const charIndex = Character.getAll().indexOf(Character.getActive());
        if (charIndex < 0) return;

        if (def.type === 'equipment') {
            if (Inventory.equipItem(itemId, charIndex)) {
                showNotification(`Equipped ${def.name}!`, 'success');
                updateCharacterInfo();
                renderInventory();
            }
        } else if (def.type === 'consumable') {
            const effects = Inventory.useItem(itemId, charIndex);
            if (effects) {
                showNotification(`Used ${def.name}!`, 'success');
                updateCharacterInfo();
                renderInventory();
            }
        }
    }

    /**
     * Show item tooltip
     */
    function showItemTooltip(event, item) {
        const tooltip = document.getElementById('item-tooltip');
        if (!tooltip) return;

        tooltip.classList.remove('hidden');

        let statsHtml = '';
        if (item.stats) {
            statsHtml = '<div class="item-stats">';
            for (const stat in item.stats) {
                statsHtml += `<div>+${item.stats[stat]} ${stat.toUpperCase()}</div>`;
            }
            statsHtml += '</div>';
        }

        tooltip.innerHTML = `
            <div class="item-name" style="color: ${Inventory.getRarityColor(item.rarity)}">${item.name}</div>
            <div class="item-type">${item.type} - ${item.rarity}</div>
            ${statsHtml}
            <div class="item-value">💰 ${item.value}</div>
        `;

        tooltip.style.left = event.pageX + 10 + 'px';
        tooltip.style.top = event.pageY + 10 + 'px';
    }

    /**
     * Hide tooltip
     */
    function hideTooltip() {
        const tooltip = document.getElementById('item-tooltip');
        if (tooltip) tooltip.classList.add('hidden');
    }

    /**
     * Setup quest filters
     */
    function setupQuestFilters() {
        document.querySelectorAll('.quest-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentQuestFilter = btn.dataset.filter;
                document.querySelectorAll('.quest-filters .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderQuests();
            });
        });
    }

    /**
     * Render quests
     */
    function renderQuests() {
        const container = document.getElementById('quests-list');
        if (!container) return;

        let quests = Quests.getAllQuests();

        if (currentQuestFilter === 'active') {
            quests = quests.filter(q => q.status === 'active');
        } else if (currentQuestFilter === 'available') {
            quests = quests.filter(q => q.status === 'available' && !q.completed);
        } else if (currentQuestFilter === 'completed') {
            quests = quests.filter(q => q.completed);
        }

        container.innerHTML = '';

        if (quests.length === 0) {
            container.innerHTML = '<p class="hint">No quests found.</p>';
            return;
        }

        quests.forEach(quest => {
            const div = document.createElement('div');
            div.className = `quest-card ${quest.status === 'complete' ? 'complete' : ''}`;

            let objectivesHtml = quest.objectives.map(obj => {
                const complete = obj.current >= obj.amount;
                return `<div class="quest-objective ${complete ? 'complete' : ''}">
                    ${complete ? '✓' : '○'} ${getObjectiveText(obj)} (${obj.current}/${obj.amount})
                </div>`;
            }).join('');

            let buttonHtml = '';
            if (quest.status === 'available' && !quest.completed) {
                buttonHtml = `<button class="quest-btn accept" onclick="Game.acceptQuest('${quest.id}')">Accept Quest</button>`;
            } else if (quest.status === 'complete') {
                buttonHtml = `<button class="quest-btn complete" onclick="Game.completeQuest('${quest.id}')">Complete Quest</button>`;
            }

            div.innerHTML = `
                <div class="quest-header">
                    <span class="quest-name">${quest.name}</span>
                    <span class="quest-type">${quest.type}</span>
                </div>
                <div class="quest-description">${quest.description}</div>
                <div class="quest-objectives">${objectivesHtml}</div>
                <div class="quest-rewards">
                    ${quest.rewards.exp ? `📈 ${quest.rewards.exp} XP` : ''}
                    ${quest.rewards.gold ? `💰 ${quest.rewards.gold}` : ''}
                </div>
                ${buttonHtml}
            `;

            container.appendChild(div);
        });
    }

    /**
     * Get objective text
     */
    function getObjectiveText(obj) {
        if (obj.type === 'kill') {
            const monster = World.getMonster(obj.monsterId);
            return `Defeat ${monster ? monster.name : obj.monsterId}`;
        } else if (obj.type === 'gather') {
            const item = Inventory.getItemDef(obj.itemId);
            return `Collect ${item ? item.name : obj.itemId}`;
        } else if (obj.type === 'skill_level') {
            return `Reach ${obj.skillId} level ${obj.amount}`;
        }
        return 'Unknown objective';
    }

    /**
     * Render skills
     */
    function renderSkills() {
        const container = document.getElementById('skills-grid');
        if (!container) return;

        const char = Character.getActive();

        if (!char) {
            container.innerHTML = '<p class="hint">Create a character to view skills.</p>';
            return;
        }

        const skillDefs = Skills.getSkillDefs();
        const charSkills = Skills.getAllSkills(char.id);

        container.innerHTML = '';

        for (const skillId in skillDefs) {
            const def = skillDefs[skillId];
            const skill = charSkills[skillId];
            const expPercent = (skill.exp / skill.expToLevel) * 100;

            const div = document.createElement('div');
            div.className = 'skill-card';
            div.innerHTML = `
                <div class="skill-header">
                    <span class="skill-icon">${def.icon}</span>
                    <span class="skill-name">${def.name}</span>
                    <span class="skill-level">Lv. ${skill.level}</span>
                </div>
                <div class="skill-exp-bar">
                    <div class="fill" style="width: ${expPercent}%"></div>
                </div>
            `;
            container.appendChild(div);
        }
    }

    /**
     * Setup talent tabs
     */
    function setupTalentTabs() {
        document.querySelectorAll('.tree-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                currentTalentTree = btn.dataset.tree;
                document.querySelectorAll('.tree-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderTalents();
            });
        });
    }

    /**
     * Render talents
     */
    function renderTalents() {
        const container = document.getElementById('talent-tree-content');
        if (!container) return;

        const char = Character.getActive();

        if (!char) {
            container.innerHTML = '<p class="hint">Create a character to view talents.</p>';
            return;
        }

        const trees = Talents.getTrees();
        const tree = trees[currentTalentTree];
        const points = Talents.getPoints(char.id);

        const pointsDisplay = document.getElementById('talent-points');
        if (pointsDisplay) pointsDisplay.textContent = points;

        container.innerHTML = '';

        for (const talentId in tree.talents) {
            const talent = tree.talents[talentId];
            const level = Talents.getTalentLevel(char.id, talentId);
            const cost = talent.cost(level);
            const isMaxed = level >= talent.maxLevel;
            const canAfford = points >= cost;
            const prereqMet = !talent.prereq || Talents.getTalentLevel(char.id, talent.prereq) > 0;

            const div = document.createElement('div');
            div.className = `talent-node ${isMaxed ? 'maxed' : ''} ${!prereqMet ? 'locked' : ''}`;
            div.innerHTML = `
                <div class="talent-icon">${talent.icon}</div>
                <div class="talent-name">${talent.name}</div>
                <div class="talent-level">${level}/${talent.maxLevel}</div>
                ${!isMaxed ? `<div class="talent-cost">Cost: ${cost}</div>` : ''}
            `;
            div.title = talent.description;

            if (!isMaxed && prereqMet && canAfford) {
                div.style.cursor = 'pointer';
                div.addEventListener('click', () => {
                    if (Talents.allocate(char.id, currentTalentTree, talentId)) {
                        renderTalents();
                        updateCharacterInfo();
                    }
                });
            }

            container.appendChild(div);
        }
    }

    /**
     * Update gold display
     */
    function updateGold() {
        const goldDisplay = document.getElementById('gold-display');
        if (goldDisplay) {
            goldDisplay.textContent = formatNumber(Inventory.getGold());
        }
    }

    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        if (!container) return;

        const div = document.createElement('div');
        div.className = `notification ${type}`;
        div.innerHTML = message;
        container.appendChild(div);

        setTimeout(() => div.remove(), 3000);
    }

    /**
     * Add log entry
     */
    function addLogEntry(message) {
        const log = document.getElementById('log-content');
        if (!log) return;

        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `<span class="time">${new Date().toLocaleTimeString()}</span> ${message}`;
        log.insertBefore(entry, log.firstChild);

        while (log.children.length > 50) {
            log.removeChild(log.lastChild);
        }
    }

    /**
     * Update combat display
     */
    function updateCombat(charIndex) {
        const state = Combat.getCombatState(charIndex);
        const combatPanel = document.getElementById('combat-panel');

        if (!combatPanel) return;

        if (!state) {
            combatPanel.classList.add('hidden');
            return;
        }

        combatPanel.classList.remove('hidden');

        const monster = state.monster;
        const char = Character.getByIndex(charIndex);

        const enemyIcon = document.getElementById('enemy-icon');
        const enemyName = document.getElementById('enemy-name');
        const enemyLevel = document.getElementById('enemy-level');
        const enemyHpFill = document.getElementById('enemy-hp-fill');
        const enemyHpText = document.getElementById('enemy-hp-text');
        const playerHpFill = document.getElementById('player-hp-fill');
        const playerHpText = document.getElementById('player-hp-text');

        if (enemyIcon) enemyIcon.textContent = monster.icon;
        if (enemyName) enemyName.textContent = monster.name;
        if (enemyLevel) enemyLevel.textContent = `Lv. ${monster.level}`;
        if (enemyHpFill) enemyHpFill.style.width = `${(monster.currentHp / monster.hp) * 100}%`;
        if (enemyHpText) enemyHpText.textContent = `${Math.max(0, monster.currentHp)}/${monster.hp}`;

        if (char && playerHpFill) playerHpFill.style.width = `${(char.hp / char.maxHp) * 100}%`;
        if (char && playerHpText) playerHpText.textContent = `${char.hp}/${char.maxHp}`;
    }

    /**
     * Add combat message
     */
    function addCombatMessage(message, type) {
        const log = document.getElementById('combat-log');
        if (!log) return;

        const div = document.createElement('div');
        div.className = `combat-msg ${type}`;
        div.textContent = message;
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;

        while (log.children.length > 50) {
            log.removeChild(log.firstChild);
        }
    }

    /**
     * Add loot item display
     */
    function addLootItem(itemId) {
        const def = Inventory.getItemDef(itemId);
        if (!def) return;

        const list = document.getElementById('loot-list');
        if (!list) return;

        const div = document.createElement('div');
        div.className = 'loot-item';
        div.innerHTML = `${def.icon} ${def.name}`;
        list.insertBefore(div, list.firstChild);

        while (list.children.length > 10) {
            list.removeChild(list.lastChild);
        }
    }

    /**
     * Format large numbers
     */
    function formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return Math.floor(num).toString();
    }

    // Public API
    return {
        init,
        renderCharacterSlots,
        updateCharacterInfo,
        renderZones,
        renderInventory,
        renderQuests,
        renderSkills,
        renderTalents,
        updateGold,
        showNotification,
        addLogEntry,
        updateCombat,
        addCombatMessage,
        addLootItem,
        switchTab,
        showZoneActivities,
        updateActivityDisplay,
        hideActivityDisplay,
        formatNumber
    };
})();
