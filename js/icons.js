/**
 * Icons Module
 * SVG icon generation system for all game elements
 */

const Icons = (function() {
    /**
     * Generate SVG with proper namespace and viewbox
     */
    function createSVG(content, size = 24, className = '') {
        return `<svg xmlns="http://www.w3.org/2000/svg" class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">${content}</svg>`;
    }

    /**
     * Resource Icons
     */
    const resources = {
        // Mining resources
        copper_ore: createSVG('<circle cx="12" cy="12" r="8" fill="#cd7f32"/><circle cx="9" cy="9" r="2" fill="#e09856" opacity="0.6"/><circle cx="15" cy="13" r="1.5" fill="#e09856" opacity="0.6"/>'),
        iron_ore: createSVG('<circle cx="12" cy="12" r="8" fill="#808080"/><circle cx="9" cy="9" r="2" fill="#a9a9a9" opacity="0.7"/><circle cx="15" cy="14" r="1.5" fill="#a9a9a9" opacity="0.7"/>'),
        gold_ore: createSVG('<circle cx="12" cy="12" r="8" fill="#ffd700"/><circle cx="9" cy="9" r="2" fill="#ffed4e" opacity="0.8"/><circle cx="15" cy="13" r="1.5" fill="#ffed4e" opacity="0.8"/><path d="M 12 4 L 14 8 L 18 9 L 15 12 L 16 16 L 12 14 L 8 16 L 9 12 L 6 9 L 10 8 Z" fill="#ffed4e" opacity="0.3"/>'),
        crystal_shard: createSVG('<path d="M 12 2 L 16 8 L 22 12 L 16 16 L 12 22 L 8 16 L 2 12 L 8 8 Z" fill="#00d4ff" stroke="#00a0cc" stroke-width="1"/><path d="M 12 6 L 14 10 L 18 12 L 14 14 L 12 18 L 10 14 L 6 12 L 10 10 Z" fill="#80ebff" opacity="0.6"/>'),
        diamond: createSVG('<path d="M 12 2 L 18 8 L 12 22 L 6 8 Z" fill="#b9f2ff" stroke="#00bfff" stroke-width="1.5"/><path d="M 12 2 L 18 8 L 12 10 Z" fill="#ffffff" opacity="0.8"/><path d="M 12 10 L 18 8 L 12 22 Z" fill="#00d4ff" opacity="0.6"/><path d="M 12 10 L 6 8 L 12 22 Z" fill="#4dd7ff" opacity="0.6"/>'),

        // Woodcutting resources
        oak_log: createSVG('<rect x="6" y="4" width="12" height="16" rx="2" fill="#8b4513"/><ellipse cx="12" cy="12" rx="4" ry="5" fill="#a0522d" opacity="0.6"/><circle cx="10" cy="10" r="1.5" fill="#654321"/><circle cx="14" cy="14" r="1" fill="#654321"/>'),
        maple_log: createSVG('<rect x="6" y="4" width="12" height="16" rx="2" fill="#d2691e"/><ellipse cx="12" cy="12" rx="4" ry="5" fill="#ff6347" opacity="0.4"/><circle cx="10" cy="10" r="1.5" fill="#8b4513"/><circle cx="14" cy="14" r="1" fill="#8b4513"/>'),
        birch_log: createSVG('<rect x="6" y="4" width="12" height="16" rx="2" fill="#f5f5dc"/><line x1="6" y1="8" x2="18" y2="8" stroke="#333" stroke-width="0.5"/><line x1="6" y1="13" x2="18" y2="13" stroke="#333" stroke-width="0.5"/><line x1="6" y1="17" x2="18" y2="17" stroke="#333" stroke-width="0.5"/><ellipse cx="12" cy="12" rx="3" ry="4" fill="#dcdcaa" opacity="0.5"/>'),
        ancient_log: createSVG('<rect x="6" y="4" width="12" height="16" rx="2" fill="#2f4f2f"/><path d="M 8 6 Q 12 10 16 6" stroke="#90ee90" stroke-width="1" fill="none" opacity="0.6"/><path d="M 8 12 Q 12 16 16 12" stroke="#90ee90" stroke-width="1" fill="none" opacity="0.6"/><circle cx="10" cy="9" r="1" fill="#32cd32"/><circle cx="14" cy="15" r="1" fill="#32cd32"/>'),

        // Fishing resources
        small_fish: createSVG('<path d="M 4 12 Q 8 8 12 12 Q 8 16 4 12" fill="#4682b4" stroke="#2f4f7f" stroke-width="1"/><circle cx="6" cy="11" r="1" fill="#fff"/><circle cx="6" cy="11" r="0.5" fill="#000"/><path d="M 12 12 L 16 10 L 16 14 Z" fill="#4682b4"/>'),
        bass: createSVG('<path d="M 3 12 Q 7 8 14 12 Q 7 16 3 12" fill="#228b22" stroke="#1a5f1a" stroke-width="1"/><circle cx="5" cy="11" r="1.2" fill="#fff"/><circle cx="5" cy="11" r="0.6" fill="#000"/><path d="M 14 12 L 19 9 L 19 15 Z" fill="#228b22"/><path d="M 10 8 L 12 12 L 10 12 Z" fill="#1a5f1a"/>'),
        salmon: createSVG('<path d="M 3 12 Q 8 9 15 12 Q 8 15 3 12" fill="#fa8072" stroke="#cd5c5c" stroke-width="1"/><circle cx="5" cy="11.5" r="1" fill="#fff"/><circle cx="5" cy="11.5" r="0.5" fill="#000"/><path d="M 15 12 L 20 10 L 20 14 Z" fill="#fa8072"/><circle cx="7" cy="12" r="0.8" fill="#cd5c5c" opacity="0.6"/><circle cx="10" cy="12" r="0.8" fill="#cd5c5c" opacity="0.6"/>'),
        golden_fish: createSVG('<path d="M 3 12 Q 8 9 15 12 Q 8 15 3 12" fill="#ffd700" stroke="#daa520" stroke-width="1"/><circle cx="5" cy="11.5" r="1" fill="#fff"/><circle cx="5" cy="11.5" r="0.5" fill="#000"/><path d="M 15 12 L 20 10 L 20 14 Z" fill="#ffd700"/><path d="M 7 10 L 9 12 L 7 14" stroke="#ffed4e" stroke-width="0.8" fill="none"/><path d="M 11 10 L 13 12 L 11 14" stroke="#ffed4e" stroke-width="0.8" fill="none"/>'),
        legendary_catch: createSVG('<path d="M 3 12 Q 8 9 16 12 Q 8 15 3 12" fill="url(#legendaryGrad)"/><defs><linearGradient id="legendaryGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#ff00ff;stop-opacity:1"/><stop offset="50%" style="stop-color:#00ffff;stop-opacity:1"/><stop offset="100%" style="stop-color:#ff00ff;stop-opacity:1"/></linearGradient></defs><circle cx="5" cy="11.5" r="1.2" fill="#fff"/><circle cx="5" cy="11.5" r="0.6" fill="#000"/><path d="M 16 12 L 21 10 L 21 14 Z" fill="url(#legendaryGrad)"/><circle cx="9" cy="10" r="1" fill="#fff" opacity="0.6"/><circle cx="12" cy="14" r="1" fill="#fff" opacity="0.6"/>'),

        // Crafting materials
        bronze_bar: createSVG('<rect x="6" y="8" width="12" height="8" rx="1" fill="#cd7f32"/><rect x="6" y="8" width="12" height="2" fill="#e09856" opacity="0.7"/><rect x="6" y="14" width="12" height="2" fill="#8b6914" opacity="0.5"/>'),
        iron_bar: createSVG('<rect x="6" y="8" width="12" height="8" rx="1" fill="#808080"/><rect x="6" y="8" width="12" height="2" fill="#a9a9a9" opacity="0.7"/><rect x="6" y="14" width="12" height="2" fill="#505050" opacity="0.5"/>'),
        steel_bar: createSVG('<rect x="6" y="8" width="12" height="8" rx="1" fill="#b0c4de"/><rect x="6" y="8" width="12" height="2" fill="#d3e4f0" opacity="0.8"/><rect x="6" y="14" width="12" height="2" fill="#708090" opacity="0.5"/><line x1="6" y1="10" x2="18" y2="10" stroke="#4682b4" stroke-width="0.5"/>'),
        mythril_bar: createSVG('<rect x="6" y="8" width="12" height="8" rx="1" fill="#6495ed"/><rect x="6" y="8" width="12" height="2" fill="#87ceeb" opacity="0.8"/><rect x="6" y="14" width="12" height="2" fill="#4169e1" opacity="0.5"/><path d="M 9 10 L 11 12 L 9 14" stroke="#add8e6" stroke-width="0.8" fill="none"/><path d="M 15 10 L 13 12 L 15 14" stroke="#add8e6" stroke-width="0.8" fill="none"/>'),

        // Monster drops
        slime_gel: createSVG('<circle cx="12" cy="13" r="7" fill="#90ee90" opacity="0.7"/><circle cx="10" cy="11" r="2" fill="#7cfc00" opacity="0.5"/><circle cx="14" cy="14" r="1.5" fill="#7cfc00" opacity="0.5"/><circle cx="12" cy="16" r="1" fill="#7cfc00" opacity="0.5"/>'),
        goblin_ear: createSVG('<path d="M 8 8 Q 6 12 8 16 Q 12 18 14 16 Q 12 12 14 10 Q 12 8 8 8" fill="#90ee90"/><path d="M 10 10 Q 9 12 10 14" stroke="#228b22" stroke-width="0.8" fill="none"/><circle cx="11" cy="11" r="0.5" fill="#8b4513"/>'),
        wolf_pelt: createSVG('<rect x="5" y="6" width="14" height="12" rx="2" fill="#8b7355"/><path d="M 7 8 L 9 10 L 7 12 L 9 14 L 7 16" stroke="#654321" stroke-width="0.8" fill="none"/><path d="M 17 8 L 15 10 L 17 12 L 15 14 L 17 16" stroke="#654321" stroke-width="0.8" fill="none"/><circle cx="10" cy="10" r="0.5" fill="#654321"/><circle cx="14" cy="12" r="0.5" fill="#654321"/><circle cx="11" cy="14" r="0.5" fill="#654321"/>'),
        dragon_scale: createSVG('<path d="M 12 4 L 20 12 L 12 20 L 4 12 Z" fill="#dc143c" stroke="#8b0000" stroke-width="1.5"/><path d="M 12 4 L 20 12 L 12 14 Z" fill="#ff4500" opacity="0.6"/><path d="M 12 14 L 20 12 L 12 20 Z" fill="#8b0000" opacity="0.4"/><path d="M 12 14 L 4 12 L 12 20 Z" fill="#b22222" opacity="0.5"/>'),
        boss_essence: createSVG('<circle cx="12" cy="12" r="9" fill="url(#bossGrad)"/><defs><radialGradient id="bossGrad"><stop offset="0%" style="stop-color:#ff00ff;stop-opacity:1"/><stop offset="100%" style="stop-color:#8b008b;stop-opacity:1"/></radialGradient></defs><path d="M 12 6 L 14 10 L 18 10 L 15 13 L 16 17 L 12 15 L 8 17 L 9 13 L 6 10 L 10 10 Z" fill="#fff" opacity="0.7"/><circle cx="12" cy="12" r="3" fill="#ff00ff" opacity="0.5"/>'),
    };

    /**
     * Equipment Icons
     */
    const equipment = {
        // Weapons - Swords
        wooden_sword: createSVG('<path d="M 12 3 L 13 14 L 12 15 L 11 14 Z" fill="#8b4513" stroke="#654321" stroke-width="0.5"/><rect x="10" y="15" width="4" height="3" fill="#654321"/><circle cx="12" cy="17" r="1.5" fill="#8b4513"/>'),
        bronze_sword: createSVG('<path d="M 12 2 L 13.5 14 L 12 16 L 10.5 14 Z" fill="#cd7f32" stroke="#8b6914" stroke-width="0.8"/><rect x="10" y="16" width="4" height="3" fill="#654321"/><circle cx="12" cy="18" r="1.5" fill="#cd7f32"/><path d="M 11 6 L 12 14" stroke="#e09856" stroke-width="0.5"/>'),
        iron_sword: createSVG('<path d="M 12 2 L 13.5 15 L 12 17 L 10.5 15 Z" fill="#c0c0c0" stroke="#808080" stroke-width="1"/><rect x="10" y="17" width="4" height="3" fill="#4a4a4a"/><circle cx="12" cy="19" r="1.5" fill="#808080"/><path d="M 11 5 L 12 15" stroke="#e8e8e8" stroke-width="0.6"/>'),
        steel_blade: createSVG('<path d="M 12 1 L 14 15 L 12 18 L 10 15 Z" fill="#b0c4de" stroke="#4682b4" stroke-width="1"/><rect x="9.5" y="18" width="5" height="3" fill="#2f4f4f"/><circle cx="12" cy="20" r="1.8" fill="#4682b4"/><path d="M 11 4 L 12 15" stroke="#e0f0ff" stroke-width="0.8"/><circle cx="12" cy="10" r="0.8" fill="#4169e1"/>'),
        mythril_sword: createSVG('<path d="M 12 1 L 14 16 L 12 19 L 10 16 Z" fill="#6495ed" stroke="#0000cd" stroke-width="1.2"/><rect x="9" y="19" width="6" height="3" fill="#1e3a5f"/><circle cx="12" cy="21" r="2" fill="#6495ed"/><path d="M 11 3 L 12 16" stroke="#add8e6" stroke-width="1"/><circle cx="12" cy="8" r="1" fill="#00bfff"/><circle cx="12" cy="13" r="0.8" fill="#00bfff"/>'),
        dragon_slayer: createSVG('<path d="M 12 1 L 14.5 16 L 12 20 L 9.5 16 Z" fill="url(#dragonGrad)" stroke="#8b0000" stroke-width="1.5"/><defs><linearGradient id="dragonGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#ff4500;stop-opacity:1"/><stop offset="100%" style="stop-color:#dc143c;stop-opacity:1"/></linearGradient></defs><rect x="8.5" y="20" width="7" height="3" fill="#2f1f1f"/><circle cx="12" cy="22" r="2.2" fill="#ffd700"/><path d="M 10.5 3 L 12 16" stroke="#ff6347" stroke-width="1.2"/><path d="M 13.5 3 L 12 16" stroke="#ff6347" stroke-width="1.2"/>'),

        // Mage weapons
        wooden_staff: createSVG('<line x1="12" y1="22" x2="12" y2="6" stroke="#8b4513" stroke-width="2"/><circle cx="12" cy="4" r="2.5" fill="#8b4513" stroke="#654321" stroke-width="0.8"/><circle cx="12" cy="4" r="1.5" fill="#90ee90" opacity="0.6"/>'),
        crystal_staff: createSVG('<line x1="12" y1="22" x2="12" y2="8" stroke="#654321" stroke-width="2"/><path d="M 12 2 L 15 6 L 12 10 L 9 6 Z" fill="#00d4ff" stroke="#0099cc" stroke-width="1"/><circle cx="12" cy="6" r="2" fill="#80ebff" opacity="0.7"/><circle cx="12" cy="15" r="1" fill="#00d4ff" opacity="0.5"/>'),
        arcane_staff: createSVG('<line x1="12" y1="22" x2="12" y2="8" stroke="#4b0082" stroke-width="2.5"/><path d="M 12 2 L 16 5 L 14 8 L 12 10 L 10 8 L 8 5 Z" fill="url(#arcaneGrad)" stroke="#8b008b" stroke-width="1"/><defs><linearGradient id="arcaneGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#ff00ff;stop-opacity:1"/><stop offset="100%" style="stop-color:#8b008b;stop-opacity:1"/></linearGradient></defs><circle cx="12" cy="6" r="2.5" fill="#ff00ff" opacity="0.6"/><circle cx="10" cy="14" r="0.8" fill="#ff00ff" opacity="0.7"/><circle cx="14" cy="14" r="0.8" fill="#ff00ff" opacity="0.7"/>'),

        // Bows
        short_bow: createSVG('<path d="M 8 4 Q 6 12 8 20" stroke="#8b4513" stroke-width="2" fill="none"/><line x1="8" y1="4" x2="8" y2="20" stroke="#f5deb3" stroke-width="0.8"/>'),
        long_bow: createSVG('<path d="M 7 2 Q 5 12 7 22" stroke="#654321" stroke-width="2.5" fill="none"/><line x1="7" y1="2" x2="7" y2="22" stroke="#daa520" stroke-width="1"/><circle cx="7" cy="12" r="1.5" fill="#8b4513"/>'),
        composite_bow: createSVG('<path d="M 7 2 Q 4 12 7 22" stroke="#2f4f4f" stroke-width="3" fill="none"/><path d="M 7 2 Q 6 12 7 22" stroke="#4682b4" stroke-width="1.5" fill="none"/><line x1="7" y1="2" x2="7" y2="22" stroke="#ffd700" stroke-width="1.2"/><circle cx="7" cy="12" r="2" fill="#4169e1"/>'),

        // Armor
        cloth_armor: createSVG('<rect x="8" y="6" width="8" height="10" rx="1" fill="#dcdcdc"/><path d="M 10 8 L 14 8" stroke="#a9a9a9" stroke-width="0.8"/><path d="M 10 11 L 14 11" stroke="#a9a9a9" stroke-width="0.8"/><path d="M 10 14 L 14 14" stroke="#a9a9a9" stroke-width="0.8"/>'),
        leather_armor: createSVG('<path d="M 8 6 L 16 6 L 16 17 L 12 20 L 8 17 Z" fill="#8b4513" stroke="#654321" stroke-width="1"/><circle cx="10" cy="9" r="0.8" fill="#654321"/><circle cx="14" cy="9" r="0.8" fill="#654321"/><circle cx="10" cy="13" r="0.8" fill="#654321"/><circle cx="14" cy="13" r="0.8" fill="#654321"/>'),
        chainmail: createSVG('<path d="M 8 6 L 16 6 L 16 18 L 12 21 L 8 18 Z" fill="#c0c0c0" stroke="#808080" stroke-width="1"/><circle cx="10" cy="8" r="1.2" fill="none" stroke="#696969" stroke-width="0.6"/><circle cx="13" cy="8" r="1.2" fill="none" stroke="#696969" stroke-width="0.6"/><circle cx="10" cy="11" r="1.2" fill="none" stroke="#696969" stroke-width="0.6"/><circle cx="13" cy="11" r="1.2" fill="none" stroke="#696969" stroke-width="0.6"/><circle cx="10" cy="14" r="1.2" fill="none" stroke="#696969" stroke-width="0.6"/><circle cx="13" cy="14" r="1.2" fill="none" stroke="#696969" stroke-width="0.6"/>'),
        plate_armor: createSVG('<path d="M 7 6 L 17 6 L 17 18 L 12 22 L 7 18 Z" fill="#b0c4de" stroke="#4682b4" stroke-width="1.5"/><rect x="9" y="8" width="6" height="3" fill="#708090"/><rect x="9" y="12" width="6" height="3" fill="#708090"/><rect x="9" y="16" width="6" height="2" fill="#708090"/><circle cx="12" cy="9" r="0.5" fill="#4682b4"/>'),

        // Helmets
        cloth_hood: createSVG('<path d="M 12 4 Q 8 6 8 10 L 8 14 L 16 14 L 16 10 Q 16 6 12 4" fill="#696969"/><path d="M 12 4 Q 9 6 9 10" stroke="#505050" stroke-width="0.8" fill="none"/>'),
        iron_helm: createSVG('<path d="M 12 3 Q 7 5 7 10 L 7 14 L 17 14 L 17 10 Q 17 5 12 3" fill="#c0c0c0" stroke="#808080" stroke-width="1"/><rect x="7" y="13" width="10" height="2" fill="#696969"/><circle cx="12" cy="8" r="1" fill="#ffd700"/>'),

        // Accessories
        copper_ring: createSVG('<circle cx="12" cy="12" r="6" fill="none" stroke="#cd7f32" stroke-width="3"/><circle cx="12" cy="8" r="1.5" fill="#e09856"/>'),
        gold_ring: createSVG('<circle cx="12" cy="12" r="6" fill="none" stroke="#ffd700" stroke-width="3.5"/><circle cx="12" cy="7" r="2" fill="#ff0000"/><path d="M 12 7 L 13 9 L 15 9 L 13.5 10.5 L 14 12.5 L 12 11.5 L 10 12.5 L 10.5 10.5 L 9 9 L 11 9 Z" fill="#ff0000" opacity="0.6"/>'),
        lucky_amulet: createSVG('<circle cx="12" cy="13" r="4" fill="#ffd700" stroke="#daa520" stroke-width="1.5"/><path d="M 12 9 L 13 11 L 15 11 L 13.5 12.5 L 14 15 L 12 13.5 L 10 15 L 10.5 12.5 L 9 11 L 11 11 Z" fill="#ff6347"/><line x1="12" y1="9" x2="12" y2="3" stroke="#8b4513" stroke-width="1.5"/>'),

        // Tools
        bronze_pickaxe: createSVG('<path d="M 6 8 L 18 8 L 17 11 L 7 11 Z" fill="#cd7f32" stroke="#8b6914" stroke-width="1"/><rect x="11" y="11" width="2" height="10" rx="0.5" fill="#654321"/>'),
        iron_pickaxe: createSVG('<path d="M 6 7 L 18 7 L 17 10 L 7 10 Z" fill="#c0c0c0" stroke="#808080" stroke-width="1"/><rect x="11" y="10" width="2" height="11" rx="0.5" fill="#654321"/><line x1="6" y1="8" x2="18" y2="8" stroke="#e8e8e8" stroke-width="0.5"/>'),
        bronze_axe: createSVG('<path d="M 8 6 L 16 6 Q 18 9 16 12 L 13 12 Z" fill="#cd7f32" stroke="#8b6914" stroke-width="1"/><rect x="11" y="12" width="2" height="10" rx="0.5" fill="#654321"/><path d="M 10 7 Q 14 8 15 11" stroke="#e09856" stroke-width="0.6" fill="none"/>'),
        iron_axe: createSVG('<path d="M 8 6 L 17 6 Q 19 9 17 13 L 13 13 Z" fill="#c0c0c0" stroke="#808080" stroke-width="1"/><rect x="11" y="13" width="2" height="10" rx="0.5" fill="#654321"/><path d="M 10 7 Q 14 8 16 12" stroke="#e8e8e8" stroke-width="0.8" fill="none"/>'),
        fishing_rod: createSVG('<line x1="4" y1="20" x2="16" y2="4" stroke="#8b4513" stroke-width="2"/><line x1="16" y1="4" x2="20" y2="8" stroke="#000" stroke-width="0.8"/><circle cx="20" cy="10" r="1" fill="#c0c0c0"/>'),
        pro_fishing_rod: createSVG('<line x1="4" y1="20" x2="16" y2="3" stroke="#4682b4" stroke-width="2.5"/><line x1="16" y1="3" x2="21" y2="8" stroke="#ffd700" stroke-width="1"/><circle cx="21" cy="10" r="1.5" fill="#ff6347"/>'),
    };

    /**
     * Consumable Icons
     */
    const consumables = {
        health_potion: createSVG('<path d="M 8 10 L 8 20 Q 8 22 10 22 L 14 22 Q 16 22 16 20 L 16 10" fill="#dc143c" stroke="#8b0000" stroke-width="1"/><rect x="8" y="8" width="8" height="3" fill="#654321"/><circle cx="12" cy="8" r="1" fill="#654321"/><path d="M 10 14 Q 12 16 14 14" stroke="#ff6b6b" stroke-width="1" fill="none"/>'),
        mana_potion: createSVG('<path d="M 8 10 L 8 20 Q 8 22 10 22 L 14 22 Q 16 22 16 20 L 16 10" fill="#4169e1" stroke="#000080" stroke-width="1"/><rect x="8" y="8" width="8" height="3" fill="#654321"/><circle cx="12" cy="8" r="1" fill="#654321"/><path d="M 10 14 Q 12 16 14 14" stroke="#87ceeb" stroke-width="1" fill="none"/>'),
        exp_potion: createSVG('<path d="M 8 10 L 8 20 Q 8 22 10 22 L 14 22 Q 16 22 16 20 L 16 10" fill="#9370db" stroke="#4b0082" stroke-width="1"/><rect x="8" y="8" width="8" height="3" fill="#654321"/><circle cx="12" cy="8" r="1" fill="#654321"/><path d="M 10 14 Q 12 16 14 14" stroke="#dda0dd" stroke-width="1" fill="none"/><circle cx="10" cy="16" r="0.5" fill="#fff"/><circle cx="14" cy="18" r="0.5" fill="#fff"/>'),
        power_elixir: createSVG('<path d="M 7 10 L 7 20 Q 7 22 9 22 L 15 22 Q 17 22 17 20 L 17 10" fill="url(#powerGrad)" stroke="#8b4513" stroke-width="1"/><defs><linearGradient id="powerGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#ffd700;stop-opacity:1"/><stop offset="100%" style="stop-color:#ff8c00;stop-opacity:1"/></linearGradient></defs><rect x="7" y="8" width="10" height="3" fill="#654321"/><circle cx="12" cy="8" r="1.2" fill="#ffd700"/><path d="M 9 14 Q 12 17 15 14" stroke="#fff" stroke-width="1.2" fill="none"/>'),
    };

    /**
     * Monster Icons
     */
    const monsters = {
        slime: createSVG('<ellipse cx="12" cy="16" rx="8" ry="6" fill="#90ee90" stroke="#228b22" stroke-width="1"/><circle cx="9" cy="14" r="2" fill="#000"/><circle cx="15" cy="14" r="2" fill="#000"/><circle cx="9.5" cy="13.5" r="0.8" fill="#fff"/><circle cx="15.5" cy="13.5" r="0.8" fill="#fff"/><path d="M 9 18 Q 12 20 15 18" stroke="#228b22" stroke-width="1.5" fill="none"/>'),
        wolf: createSVG('<ellipse cx="12" cy="14" rx="6" ry="5" fill="#8b7355" stroke="#654321" stroke-width="1"/><circle cx="9" cy="7" r="2" fill="#8b7355" stroke="#654321" stroke-width="1"/><circle cx="15" cy="7" r="2" fill="#8b7355" stroke="#654321" stroke-width="1"/><circle cx="10" cy="12" r="1.2" fill="#000"/><circle cx="14" cy="12" r="1.2" fill="#000"/><path d="M 12 14 L 12 16" stroke="#000" stroke-width="1"/><path d="M 10 16 Q 12 17 14 16" stroke="#000" stroke-width="1" fill="none"/><path d="M 8 6 L 7 3 L 9 5" fill="#8b7355"/><path d="M 16 6 L 17 3 L 15 5" fill="#8b7355"/>'),
        goblin: createSVG('<circle cx="12" cy="13" r="6" fill="#90ee90" stroke="#228b22" stroke-width="1"/><circle cx="10" cy="12" r="1.5" fill="#000"/><circle cx="14" cy="12" r="1.5" fill="#000"/><path d="M 7 10 Q 6 8 7 6 L 9 8" fill="#90ee90"/><path d="M 17 10 Q 18 8 17 6 L 15 8" fill="#90ee90"/><path d="M 10 15 Q 12 16 14 15" stroke="#000" stroke-width="1" fill="none"/><circle cx="12" cy="10" r="0.5" fill="#654321"/>'),
        skeleton: createSVG('<circle cx="12" cy="10" r="4" fill="#f5f5dc" stroke="#000" stroke-width="1"/><circle cx="10" cy="9" r="1" fill="#000"/><circle cx="14" cy="9" r="1" fill="#000"/><path d="M 9 12 L 15 12" stroke="#000" stroke-width="0.8"/><rect x="10" y="14" width="4" height="6" fill="#f5f5dc" stroke="#000" stroke-width="1"/><line x1="10" y1="16" x2="14" y2="16" stroke="#000" stroke-width="0.5"/><line x1="10" y1="18" x2="14" y2="18" stroke="#000" stroke-width="0.5"/>'),
        ghost: createSVG('<path d="M 12 5 Q 6 8 6 14 L 6 20 L 8 18 L 10 20 L 12 18 L 14 20 L 16 18 L 18 20 L 18 14 Q 18 8 12 5" fill="#e6e6fa" opacity="0.8" stroke="#9370db" stroke-width="1"/><circle cx="10" cy="12" r="1.5" fill="#000"/><circle cx="14" cy="12" r="1.5" fill="#000"/><path d="M 10 15 Q 12 16 14 15" stroke="#9370db" stroke-width="1" fill="none"/>'),
        goblin_chief: createSVG('<circle cx="12" cy="14" r="7" fill="#228b22" stroke="#006400" stroke-width="1.5"/><circle cx="10" cy="13" r="1.8" fill="#ff0000"/><circle cx="14" cy="13" r="1.8" fill="#ff0000"/><path d="M 6 11 Q 5 8 6 5 L 8 9" fill="#228b22"/><path d="M 18 11 Q 19 8 18 5 L 16 9" fill="#228b22"/><path d="M 9 17 Q 12 18 15 17" stroke="#8b0000" stroke-width="1.5" fill="none"/><rect x="10" y="3" width="4" height="3" fill="#ffd700"/><path d="M 10 3 L 12 1 L 14 3" fill="#ffd700"/>'),
        dungeon_boss: createSVG('<circle cx="12" cy="13" r="8" fill="#8b008b" stroke="#4b0082" stroke-width="2"/><circle cx="10" cy="11" r="2" fill="#ff0000"/><circle cx="14" cy="11" r="2" fill="#ff0000"/><path d="M 8 16 Q 12 19 16 16" stroke="#ff0000" stroke-width="2" fill="none"/><path d="M 8 8 L 6 5 L 7 4 L 9 6" fill="#8b008b"/><path d="M 16 8 L 18 5 L 17 4 L 15 6" fill="#8b008b"/><circle cx="12" cy="13" r="3" fill="#ff00ff" opacity="0.5"/>'),
        dragon: createSVG('<ellipse cx="12" cy="15" rx="8" ry="6" fill="#dc143c" stroke="#8b0000" stroke-width="2"/><path d="M 6 12 L 4 8 L 5 10 Q 6 11 7 11" fill="#dc143c"/><path d="M 18 12 L 20 8 L 19 10 Q 18 11 17 11" fill="#dc143c"/><circle cx="9" cy="13" r="2" fill="#ffd700"/><circle cx="15" cy="13" r="2" fill="#ffd700"/><circle cx="9" cy="13" r="1" fill="#000"/><circle cx="15" cy="13" r="1" fill="#000"/><path d="M 12 8 L 12 5 L 14 7 L 12 6 L 10 7 Z" fill="#dc143c"/><path d="M 8 17 Q 12 19 16 17" stroke="#8b0000" stroke-width="1.5" fill="none"/>'),
    };

    /**
     * UI Icons
     */
    const ui = {
        gold: createSVG('<circle cx="12" cy="12" r="8" fill="#ffd700" stroke="#daa520" stroke-width="1.5"/><text x="12" y="16" font-size="10" font-weight="bold" text-anchor="middle" fill="#8b6914">G</text>'),
        exp: createSVG('<path d="M 12 3 L 15 9 L 21 10 L 16 15 L 17 21 L 12 18 L 7 21 L 8 15 L 3 10 L 9 9 Z" fill="#9370db" stroke="#4b0082" stroke-width="1"/>'),
        level_up: createSVG('<path d="M 12 2 L 15 8 L 22 9 L 17 14 L 18 21 L 12 18 L 6 21 L 7 14 L 2 9 L 9 8 Z" fill="#ffd700" stroke="#ff8c00" stroke-width="1.5"/><text x="12" y="15" font-size="8" font-weight="bold" text-anchor="middle" fill="#fff">UP</text>'),
        settings: createSVG('<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M 12 2 L 12 6 M 12 18 L 12 22 M 2 12 L 6 12 M 18 12 L 22 12 M 5 5 L 8 8 M 16 16 L 19 19 M 5 19 L 8 16 M 16 8 L 19 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
        save: createSVG('<rect x="5" y="3" width="14" height="18" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><rect x="7" y="3" width="10" height="6" fill="currentColor"/><rect x="9" y="14" width="6" height="7" fill="currentColor"/>'),
    };

    /**
     * Get icon by ID
     */
    function getIcon(category, id, size = 24) {
        const icons = {
            resources,
            equipment,
            consumables,
            monsters,
            ui
        };

        if (icons[category] && icons[category][id]) {
            return icons[category][id];
        }

        // Return default icon if not found
        return createSVG('<circle cx="12" cy="12" r="10" fill="#ccc"/><text x="12" y="16" font-size="12" text-anchor="middle">?</text>', size);
    }

    /**
     * Get icon for item by item ID
     */
    function getItemIcon(itemId, size = 24) {
        // Try equipment first
        if (equipment[itemId]) return equipment[itemId];
        // Try consumables
        if (consumables[itemId]) return consumables[itemId];
        // Try resources
        if (resources[itemId]) return resources[itemId];

        // Default
        return createSVG('<circle cx="12" cy="12" r="10" fill="#999"/>', size);
    }

    /**
     * Get icon for monster
     */
    function getMonsterIcon(monsterId, size = 32) {
        if (monsters[monsterId]) return monsters[monsterId];
        return createSVG('<circle cx="12" cy="12" r="10" fill="#f00"/>', size);
    }

    // Public API
    return {
        getIcon,
        getItemIcon,
        getMonsterIcon,
        resources,
        equipment,
        consumables,
        monsters,
        ui
    };
})();
