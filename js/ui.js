/**
 * UI Module
 * Handles all UI rendering and interactions for Idle Legends
 */

const UI = (function() {
    let currentTab = 'world';
    let currentTalentTree = 'combat';
    let selectedClass = null;

    /**
     * Initialize UI
     */
    function init() {
        setupTabNavigation();
        setupCharacterCreation();
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
        const bonuses = Character.getMultiCharBonuses();

        container.innerHTML = '';

        // Show multi-char bonus indicator if more than 1 character
        if (characters.length > 1) {
            const bonusDiv = document.createElement('div');
            bonusDiv.className = 'multi-char-bonus';
            bonusDiv.innerHTML = `<span title="Multi-character bonuses active!">✨${characters.length}x</span>`;
            bonusDiv.addEventListener('click', () => showMultiCharBonuses());
            container.appendChild(bonusDiv);
        }

        characters.forEach((char, index) => {
            const cls = Character.getClass(char.class);
            const isActive = activeChar && activeChar.id === char.id;
            const hasAfkActivity = !isActive && char.activity && char.activityZone;

            const div = document.createElement('div');
            div.className = `char-slot ${isActive ? 'active' : ''} ${hasAfkActivity ? 'afk-active' : ''}`;

            let afkStatus = '';
            if (hasAfkActivity) {
                const zone = World.getZone(char.activityZone);
                afkStatus = `<span class="afk-status">💤 ${char.activity} @ ${zone ? zone.name : 'Unknown'}</span>`;
            }

            div.innerHTML = `
                <span class="class-icon">${cls.icon}</span>
                <div class="char-info">
                    <span class="char-name">${char.name}</span>
                    <span class="char-level">Lv. ${char.level} ${cls.name}</span>
                    ${afkStatus}
                </div>
            `;

            div.addEventListener('click', () => {
                Character.setActive(index);
                renderCharacterSlots();
                updateCharacterInfo();
                renderSkills();
                renderTalents();
            });

            // Right-click to set AFK activity (only for non-active characters)
            if (!isActive) {
                div.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    showAfkActivityMenu(e.pageX, e.pageY, index);
                });
            }

            container.appendChild(div);
        });
    }

    /**
     * Show multi-character bonuses popup
     */
    function showMultiCharBonuses() {
        const bonuses = Character.getMultiCharBonuses();
        const count = Character.getAll().length;

        showNotification(`
            <strong>Multi-Character Bonuses (${count} chars):</strong><br>
            +${Math.round((bonuses.expBonus - 1) * 100)}% EXP<br>
            +${Math.round((bonuses.goldBonus - 1) * 100)}% Gold<br>
            +${Math.round((bonuses.dropBonus - 1) * 100)}% Drop Rate<br>
            +${Math.round((bonuses.skillExpBonus - 1) * 100)}% Skill EXP<br>
            ${Math.round(bonuses.afkEfficiency * 100)}% AFK Efficiency
        `, 'info');
    }

    /**
     * Show AFK activity menu for a character
     */
    function showAfkActivityMenu(x, y, charIndex) {
        const char = Character.getByIndex(charIndex);
        if (!char) return;

        const unlockedZones = World.getUnlockedZones();
        const options = [
            { label: '⏹️ Stop AFK', action: () => {
                char.activity = null;
                char.activityZone = null;
                renderCharacterSlots();
                showNotification(`${char.name} stopped AFK activity`, 'info');
                hideContextMenu();
            }}
        ];

        unlockedZones.forEach(zone => {
            if (zone.activities && zone.activities.length > 0) {
                zone.activities.forEach(activity => {
                    if (activity.type !== 'combat' || zone.monsters.length > 0) {
                        options.push({
                            label: `${zone.icon} ${zone.name} - ${activity.type}`,
                            action: () => {
                                Character.setAfkActivity(charIndex, activity.type, zone.id);
                                renderCharacterSlots();
                                showNotification(`${char.name} now AFK ${activity.type} at ${zone.name}`, 'success');
                                hideContextMenu();
                            }
                        });
                    }
                });
            }
        });

        showContextMenu(x, y, options);
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

        const charIndex = Character.getAll().indexOf(char);

        document.querySelectorAll('.equip-slot').forEach(slot => {
            const slotName = slot.dataset.slot;
            const itemId = char.equipment[slotName];

            // Remove old listeners
            const newSlot = slot.cloneNode(true);
            slot.parentNode.replaceChild(newSlot, slot);

            if (itemId) {
                const item = Inventory.getItemDef(itemId);
                newSlot.innerHTML = item ? item.icon : '❓';
                newSlot.classList.add('equipped');
                newSlot.title = item ? `${item.name} (click to unequip)` : slotName;

                // Add click to unequip
                newSlot.addEventListener('click', () => {
                    if (Inventory.unequipItem(slotName, charIndex)) {
                        showNotification(`Unequipped ${item.name}!`, 'success');
                        updateCharacterInfo();
                        renderInventory();
                    }
                });

                // Show item tooltip on hover
                if (item) {
                    newSlot.addEventListener('mouseenter', (e) => showItemTooltip(e, item));
                    newSlot.addEventListener('mouseleave', hideTooltip);
                }
            } else {
                const defaultIcons = {
                    helmet: '🪖', weapon: '⚔️', armor: '🛡️',
                    gloves: '🧤', boots: '👢', ring: '💍', amulet: '📿'
                };
                newSlot.innerHTML = defaultIcons[slotName] || '◻️';
                newSlot.classList.remove('equipped');
                newSlot.title = `${slotName} (empty)`;
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
        const char = Character.getActive();
        container.innerHTML = '';

        for (const zoneId in zones) {
            const zone = zones[zoneId];
            const reqs = World.getZoneRequirements(zoneId);
            const unlocked = reqs.unlocked && reqs.meetsLevel && reqs.meetsSkill;

            // Determine lock reason
            let lockReason = '';
            if (!reqs.unlocked) {
                lockReason = '🔒 Locked';
            } else if (!reqs.meetsLevel) {
                lockReason = `🔒 Lv. ${zone.reqLevel}`;
            } else if (!reqs.meetsSkill && reqs.skillReq) {
                const skillDef = Skills.getSkillDef(reqs.skillReq.skillId);
                lockReason = `🔒 ${skillDef ? skillDef.name : reqs.skillReq.skillId} Lv.${reqs.skillReq.level}`;
            }

            const div = document.createElement('div');
            div.className = `zone-card ${unlocked ? '' : 'locked'}`;

            let reqsHtml = `<div class="zone-level">Lv. ${zone.reqLevel}`;
            if (zone.reqSkill) {
                const skillDef = Skills.getSkillDef(zone.reqSkill.skillId);
                const skillName = skillDef ? skillDef.name : zone.reqSkill.skillId;
                reqsHtml += ` | ${skillDef ? skillDef.icon : ''} ${zone.reqSkill.level}`;
            }
            reqsHtml += '</div>';

            div.innerHTML = `
                <span class="zone-icon">${zone.icon}</span>
                <div class="zone-name">${zone.name}</div>
                ${reqsHtml}
                <div class="zone-activities">
                    ${zone.activities.map(a => getActivityIcon(a.type)).join('')}
                </div>
                ${!unlocked ? `<div class="zone-lock-reason">${lockReason}</div>` : ''}
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
     * Render inventory - Sectioned view showing all item types at once
     */
    function renderInventory() {
        const container = document.getElementById('inventory-grid');
        if (!container) return;

        const items = Inventory.getAll();
        const allDefs = Inventory.getAllItemDefs();

        container.innerHTML = '';

        // Categorize inventory items
        const categories = {
            equipment: { name: '⚔️ Equipment', items: [] },
            consumables: { name: '🧪 Consumables', items: [] },
            tools: { name: '⛏️ Tools', items: [] },
            resources: { name: '📦 Resources', items: [] }
        };

        // Categorize items
        for (const itemId in items) {
            const quantity = items[itemId];
            const def = allDefs[itemId];
            if (!def) continue;

            const itemData = { def, quantity, itemId };

            if (def.type === 'equipment') {
                categories.equipment.items.push(itemData);
            } else if (def.type === 'consumable') {
                categories.consumables.items.push(itemData);
            } else if (def.type === 'tool') {
                categories.tools.items.push(itemData);
            } else if (def.type === 'resource') {
                categories.resources.items.push(itemData);
            }
        }

        // Render each category
        let hasItems = false;
        Object.values(categories).forEach(category => {
            if (category.items.length === 0) return;
            hasItems = true;

            const section = document.createElement('div');
            section.className = 'inventory-section';
            section.innerHTML = `<h4 class="section-header">${category.name}</h4>`;

            const itemsGrid = document.createElement('div');
            itemsGrid.className = 'inventory-items-grid';

            category.items.forEach(({ def, quantity, itemId }) => {
                const div = document.createElement('div');
                div.className = `inventory-slot rarity-${def.rarity}`;
                div.innerHTML = `
                    ${def.icon}
                    ${quantity > 1 ? `<span class="quantity">${quantity}</span>` : ''}
                `;
                div.addEventListener('mouseenter', (e) => showItemTooltip(e, def));
                div.addEventListener('mouseleave', hideTooltip);
                div.addEventListener('click', () => handleItemClick(itemId));
                div.addEventListener('contextmenu', (e) => handleItemRightClick(e, itemId));
                itemsGrid.appendChild(div);
            });

            section.appendChild(itemsGrid);
            container.appendChild(section);
        });

        if (!hasItems) {
            container.innerHTML = '<p class="hint">Your inventory is empty. Gather resources or buy items from the shop!</p>';
        }
    }

    /**
     * Handle item click (left click)
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
     * Handle item right-click (sell)
     */
    function handleItemRightClick(e, itemId) {
        e.preventDefault();
        const def = Inventory.getItemDef(itemId);
        if (!def) return;

        showContextMenu(e.pageX, e.pageY, [
            {
                label: `Sell 1 for ${Math.floor(def.value * 0.5)}g`,
                action: () => sellItems(itemId, 1)
            },
            {
                label: `Sell 10 for ${Math.floor(def.value * 0.5 * 10)}g`,
                action: () => sellItems(itemId, 10)
            },
            {
                label: `Sell All for ${Math.floor(def.value * 0.5 * Inventory.getQuantity(itemId))}g`,
                action: () => sellItems(itemId, Inventory.getQuantity(itemId))
            }
        ]);
    }

    /**
     * Sell items
     */
    function sellItems(itemId, quantity) {
        const def = Inventory.getItemDef(itemId);
        if (!def) return;

        const available = Inventory.getQuantity(itemId);
        const toSell = Math.min(quantity, available);

        if (toSell > 0 && Inventory.sellItem(itemId, toSell)) {
            const gold = Math.floor(def.value * 0.5) * toSell;
            showNotification(`Sold ${toSell}x ${def.name} for ${gold}g!`, 'success');
            renderInventory();
            updateGold();
        }
        hideContextMenu();
    }

    /**
     * Show context menu
     */
    function showContextMenu(x, y, options) {
        hideContextMenu();

        const menu = document.createElement('div');
        menu.id = 'context-menu';
        menu.className = 'context-menu';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';

        options.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'context-item';
            item.textContent = opt.label;
            item.addEventListener('click', opt.action);
            menu.appendChild(item);
        });

        document.body.appendChild(menu);

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', hideContextMenu, { once: true });
        }, 10);
    }

    /**
     * Hide context menu
     */
    function hideContextMenu() {
        const menu = document.getElementById('context-menu');
        if (menu) menu.remove();
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
     * Render shop - Sectioned view showing all categories at once
     */
    function renderShop() {
        const container = document.getElementById('shop-grid');
        if (!container) return;

        const allDefs = Inventory.getAllItemDefs();
        const char = Character.getActive();
        const charLevel = char ? char.level : 1;
        const gold = Inventory.getGold();

        container.innerHTML = '';

        // Categorize shop items
        const categories = {
            weapons: { name: '⚔️ Weapons', items: [] },
            armor: { name: '🛡️ Armor & Helmets', items: [] },
            accessories: { name: '💍 Accessories', items: [] },
            consumables: { name: '🧪 Consumables', items: [] },
            tools: { name: '⛏️ Tools', items: [] }
        };

        // Filter and categorize items
        Object.values(allDefs).forEach(item => {
            if (item.type === 'resource') return; // Don't sell raw resources

            if (item.type === 'equipment') {
                if (item.slot === 'weapon') {
                    categories.weapons.items.push(item);
                } else if (['armor', 'helmet', 'gloves', 'boots'].includes(item.slot)) {
                    categories.armor.items.push(item);
                } else if (['ring', 'amulet'].includes(item.slot)) {
                    categories.accessories.items.push(item);
                }
            } else if (item.type === 'consumable') {
                categories.consumables.items.push(item);
            } else if (item.type === 'tool') {
                categories.tools.items.push(item);
            }
        });

        // Sort items in each category
        Object.values(categories).forEach(category => {
            category.items.sort((a, b) => {
                const levelA = a.reqLevel || 0;
                const levelB = b.reqLevel || 0;
                if (levelA !== levelB) return levelA - levelB;
                return a.value - b.value;
            });
        });

        // Render each category
        Object.values(categories).forEach(category => {
            if (category.items.length === 0) return;

            const section = document.createElement('div');
            section.className = 'shop-section';
            section.innerHTML = `<h4 class="section-header">${category.name}</h4>`;

            const itemsGrid = document.createElement('div');
            itemsGrid.className = 'shop-items-grid';

            category.items.forEach(item => {
                const itemDiv = createShopItem(item, gold, charLevel);
                itemsGrid.appendChild(itemDiv);
            });

            section.appendChild(itemsGrid);
            container.appendChild(section);
        });
    }

    /**
     * Create a shop item element
     */
    function createShopItem(item, gold, charLevel) {
        const canAfford = gold >= item.value;
        const meetsLevel = !item.reqLevel || charLevel >= item.reqLevel;

        const div = document.createElement('div');
        div.className = `shop-item rarity-${item.rarity} ${!canAfford || !meetsLevel ? 'disabled' : ''}`;
        div.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-info">
                <div class="shop-item-name" style="color: ${Inventory.getRarityColor(item.rarity)}">${item.name}</div>
                <div class="shop-item-type">${item.type}${item.reqLevel ? ` • Lv.${item.reqLevel}` : ''}</div>
                ${item.stats ? `<div class="shop-item-stats">${Object.entries(item.stats).map(([k,v]) => `+${v} ${k.toUpperCase()}`).join(', ')}</div>` : ''}
            </div>
            <div class="shop-item-price ${!canAfford ? 'too-expensive' : ''}">
                💰 ${item.value}
            </div>
        `;

        if (canAfford && meetsLevel) {
            div.addEventListener('click', () => buyItem(item.id));
        }

        div.addEventListener('mouseenter', (e) => showItemTooltip(e, item));
        div.addEventListener('mouseleave', hideTooltip);

        return div;
    }

    /**
     * Buy item from shop
     */
    function buyItem(itemId) {
        const item = Inventory.getItemDef(itemId);
        if (!item) return;

        const gold = Inventory.getGold();
        if (gold < item.value) {
            showNotification('Not enough gold!', 'error');
            return;
        }

        const char = Character.getActive();
        if (item.reqLevel && char && char.level < item.reqLevel) {
            showNotification(`Requires level ${item.reqLevel}!`, 'error');
            return;
        }

        if (Inventory.removeGold(item.value)) {
            Inventory.addItem(itemId, 1);
            showNotification(`Bought ${item.name}!`, 'success');
            renderShop();
            renderInventory();
            updateGold();
        }
    }


    /**
     * Render quests - Sectioned view showing all quest types at once
     */
    function renderQuests() {
        const container = document.getElementById('quests-list');
        if (!container) return;

        const allQuests = Quests.getAllQuests();
        const char = Character.getActive();
        const charLevel = char ? char.level : 1;

        // Group quests by status
        const activeQuests = allQuests.filter(q => q.status === 'active' || q.status === 'complete');
        const availableQuests = allQuests.filter(q => {
            if (q.status !== 'available' || q.completed) return false;
            return true;
        });
        const completedQuests = allQuests.filter(q => q.completed);

        container.innerHTML = '';

        // Active Quests Section
        if (activeQuests.length > 0) {
            const activeSection = document.createElement('div');
            activeSection.className = 'quest-section';
            activeSection.innerHTML = '<h4 class="section-header">⚡ Active Quests</h4>';

            activeQuests.forEach(quest => {
                activeSection.appendChild(createQuestCard(quest, charLevel));
            });

            container.appendChild(activeSection);
        }

        // Available Quests Section
        if (availableQuests.length > 0) {
            const availableSection = document.createElement('div');
            availableSection.className = 'quest-section';
            availableSection.innerHTML = '<h4 class="section-header">📋 Available Quests</h4>';

            availableQuests.forEach(quest => {
                availableSection.appendChild(createQuestCard(quest, charLevel));
            });

            container.appendChild(availableSection);
        }

        // Completed Quests Section (collapsed by default)
        if (completedQuests.length > 0) {
            const completedSection = document.createElement('div');
            completedSection.className = 'quest-section';
            completedSection.innerHTML = `
                <h4 class="section-header collapsible" onclick="this.parentElement.classList.toggle('collapsed')">
                    ✅ Completed Quests (${completedQuests.length}) <span class="collapse-arrow">▼</span>
                </h4>
                <div class="section-content"></div>
            `;
            completedSection.classList.add('collapsed');

            const contentDiv = completedSection.querySelector('.section-content');
            completedQuests.forEach(quest => {
                contentDiv.appendChild(createQuestCard(quest, charLevel));
            });

            container.appendChild(completedSection);
        }

        // Show hint if no quests at all
        if (activeQuests.length === 0 && availableQuests.length === 0 && completedQuests.length === 0) {
            container.innerHTML = '<p class="hint">No quests available. Complete activities to unlock quests!</p>';
        }
    }

    /**
     * Create a quest card element
     */
    function createQuestCard(quest, charLevel) {
        const div = document.createElement('div');
        const isReady = quest.status === 'complete';
        div.className = `quest-card ${isReady ? 'complete' : ''}`;

        let objectivesHtml = quest.objectives.map(obj => {
            const complete = obj.current >= obj.amount;
            return `<div class="quest-objective ${complete ? 'complete' : ''}">
                ${complete ? '✓' : '○'} ${getObjectiveText(obj)} (${Math.min(obj.current, obj.amount)}/${obj.amount})
            </div>`;
        }).join('');

        let buttonHtml = '';
        let statusHtml = '';
        if (quest.status === 'available' && !quest.completed) {
            const meetsLevel = !quest.reqLevel || charLevel >= quest.reqLevel;
            if (meetsLevel) {
                buttonHtml = `<button class="quest-btn accept" onclick="Game.acceptQuest('${quest.id}')">Accept Quest</button>`;
            } else {
                statusHtml = `<div class="quest-requirement">🔒 Requires Level ${quest.reqLevel}</div>`;
            }
        } else if (quest.status === 'complete') {
            buttonHtml = `<button class="quest-btn complete" onclick="Game.completeQuest('${quest.id}')">🎉 Claim Reward!</button>`;
        } else if (quest.status === 'active') {
            statusHtml = `<div class="quest-status">📋 In Progress</div>`;
        } else if (quest.completed) {
            statusHtml = `<div class="quest-status completed">✅ Completed</div>`;
        }

        div.innerHTML = `
            <div class="quest-header">
                <span class="quest-name">${quest.name}</span>
                <span class="quest-type">${quest.type}</span>
            </div>
            <div class="quest-description">${quest.description}</div>
            <div class="quest-objectives">${objectivesHtml}</div>
            ${statusHtml}
            <div class="quest-rewards">
                ${quest.rewards.exp ? `📈 ${quest.rewards.exp} XP` : ''}
                ${quest.rewards.gold ? `💰 ${quest.rewards.gold}` : ''}
                ${quest.rewards.items ? `🎁 ${quest.rewards.items.length} items` : ''}
            </div>
            ${buttonHtml}
        `;

        return div;
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
        // Tabs are now dynamically rendered in renderTalents
    }

    /**
     * Render talents - New lane-based system
     */
    function renderTalents() {
        const container = document.getElementById('talent-tree-content');
        const pointsDisplay = document.getElementById('talent-points');
        const treeTabs = document.getElementById('talent-tree-tabs');
        if (!container) return;

        const char = Character.getActive();

        if (!char) {
            container.innerHTML = '<p class="hint">Create a character to view talents.</p>';
            return;
        }

        const trees = Talents.getTrees();
        const points = Talents.getPoints(char.id);
        const totalSpent = Talents.getTotalSpent(char.id);

        // Update points display
        if (pointsDisplay) {
            pointsDisplay.textContent = `${points} (${totalSpent}/${Talents.MAX_TOTAL_POINTS} spent)`;
        }

        // Render tree tabs
        if (treeTabs) {
            treeTabs.innerHTML = '';
            for (const treeId in trees) {
                const tree = trees[treeId];
                const btn = document.createElement('button');
                btn.className = `tree-tab ${currentTalentTree === treeId ? 'active' : ''}`;
                btn.innerHTML = `${tree.icon} ${tree.name}`;
                if (currentTalentTree === treeId) {
                    btn.style.background = tree.color;
                    btn.style.borderColor = tree.color;
                }
                btn.addEventListener('click', () => {
                    currentTalentTree = treeId;
                    renderTalents();
                });
                treeTabs.appendChild(btn);
            }
        }

        const activeTree = trees[currentTalentTree];
        if (!activeTree) {
            container.innerHTML = '<p class="hint">No talents available.</p>';
            return;
        }

        // Build talent content
        container.innerHTML = `
            <div class="tree-header" style="border-left: 4px solid ${activeTree.color}">
                <h4>${activeTree.icon} ${activeTree.name}</h4>
                <p class="tree-desc">${activeTree.description}</p>
            </div>
            <div class="lanes-container"></div>
        `;

        const lanesContainer = container.querySelector('.lanes-container');

        // Render each lane
        for (const laneId in activeTree.lanes) {
            const lane = activeTree.lanes[laneId];
            const progress = Talents.getLaneProgress(char.id, currentTalentTree, laneId);

            const laneDiv = document.createElement('div');
            laneDiv.className = 'talent-lane';
            laneDiv.innerHTML = `
                <div class="lane-header">
                    <span class="lane-name">${lane.name}</span>
                    <span class="lane-progress">${progress.current}/${progress.max}</span>
                </div>
                <p class="lane-desc">${lane.description}</p>
                <div class="lane-talents"></div>
            `;

            const talentsDiv = laneDiv.querySelector('.lane-talents');

            // Render talents in this lane
            for (const talent of lane.talents) {
                const level = Talents.getTalentLevel(char.id, talent.id);
                const cost = Talents.getTalentCost(talent.id, level);
                const canAfford = points >= cost;
                const maxed = level >= talent.maxLevel;
                const prereqMet = Talents.isPrereqMet(char.id, talent.prereq);
                const atMax = totalSpent >= Talents.MAX_TOTAL_POINTS;

                const div = document.createElement('div');
                div.className = `talent-node ${maxed ? 'maxed' : ''} ${!prereqMet ? 'locked' : ''} ${level > 0 ? 'invested' : ''}`;
                div.innerHTML = `
                    <div class="talent-icon">${talent.icon}</div>
                    <div class="talent-info">
                        <div class="talent-name">${talent.name}</div>
                        <div class="talent-desc">${talent.description}</div>
                        <div class="talent-level">${level}/${talent.maxLevel}</div>
                    </div>
                    ${!maxed && prereqMet && !atMax ? `<div class="talent-cost ${!canAfford ? 'cant-afford' : ''}">Cost: ${cost}</div>` : ''}
                `;

                if (!maxed && prereqMet && canAfford && !atMax) {
                    div.style.cursor = 'pointer';
                    div.addEventListener('click', () => {
                        if (Talents.allocate(char.id, talent.id)) {
                            renderTalents();
                            updateCharacterInfo();
                            showNotification(`Upgraded ${talent.name}!`, 'success');
                        }
                    });
                }

                talentsDiv.appendChild(div);
            }

            lanesContainer.appendChild(laneDiv);
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

    /**
     * Update corruption display
     */
    function updateCorruptionDisplay() {
        if (typeof Corruption === 'undefined') return;

        const corruptionFill = document.getElementById('corruption-fill');
        const corruptionText = document.getElementById('corruption-text');
        const corruptionStatus = document.getElementById('corruption-status');
        const corruptionEffects = document.getElementById('corruption-effects');

        if (!corruptionFill || !corruptionText || !corruptionStatus || !corruptionEffects) return;

        const level = Corruption.getCorruptionLevel();
        const effects = Corruption.getEffects();
        const displayText = Corruption.getDisplayText();
        const color = Corruption.getCorruptionColor();

        corruptionFill.style.width = `${level}%`;
        corruptionFill.style.background = color;
        corruptionText.textContent = `${Math.floor(level)}%`;
        corruptionStatus.textContent = displayText;
        corruptionStatus.style.color = color;

        // Update effects display
        if (effects.damageBonus > 1 || effects.goldBonus > 1) {
            let html = '<div class="corruption-bonuses">';
            if (effects.damageBonus > 1) {
                html += `<div>+${Math.round((effects.damageBonus - 1) * 100)}% Damage</div>`;
            }
            if (effects.goldBonus > 1) {
                html += `<div>+${Math.round((effects.goldBonus - 1) * 100)}% Gold</div>`;
            }
            if (effects.tradeBlocked) {
                html += `<div style="color: #f44336;">✗ Cannot trade</div>`;
            }
            if (effects.cannotEnterTowns) {
                html += `<div style="color: #f44336;">✗ Cannot enter towns</div>`;
            }
            if (effects.transformedToBoss) {
                html += `<div style="color: #9c27b0; font-weight: bold;">👹 BOSS FORM</div>`;
            }
            html += '</div>';
            corruptionEffects.innerHTML = html;
        } else {
            corruptionEffects.innerHTML = '<p class="hint">No corruption effects</p>';
        }
    }

    /**
     * Update class display
     */
    function updateClassDisplay() {
        if (typeof ClassEvolution === 'undefined') return;

        const currentClassEl = document.getElementById('current-class');
        const classTierEl = document.getElementById('class-tier');
        const evolutionFillEl = document.getElementById('evolution-progress-fill');
        const evolutionTextEl = document.getElementById('evolution-progress-text');

        if (!currentClassEl || !classTierEl || !evolutionFillEl || !evolutionTextEl) return;

        const className = ClassEvolution.getCurrentClass();
        const classData = ClassEvolution.getCurrentClassData();
        const progress = ClassEvolution.getEvolutionProgress();

        currentClassEl.textContent = className;
        classTierEl.textContent = classData?.tier || 0;
        evolutionFillEl.style.width = `${progress}%`;
        evolutionTextEl.textContent = `${progress}%`;
    }

    /**
     * Update all new system displays
     */
    function updateNewSystems() {
        updateCorruptionDisplay();
        updateClassDisplay();
    }

    // Public API
    return {
        init,
        renderCharacterSlots,
        updateCharacterInfo,
        renderZones,
        renderInventory,
        renderShop,
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
        formatNumber,
        updateNewSystems,
        updateCorruptionDisplay,
        updateClassDisplay
    };
})();
