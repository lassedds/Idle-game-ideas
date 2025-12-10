/**
 * Game Utilities
 * Common helper functions used across modules
 */

const GameUtils = (function() {
    /**
     * Format number with K/M/B suffixes
     * @param {number} num - Number to format
     * @returns {string} Formatted number string
     */
    function formatNumber(num) {
        if (num === null || num === undefined) return '0';

        const absNum = Math.abs(num);
        if (absNum >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        }
        if (absNum >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        }
        if (absNum >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toString();
    }

    /**
     * Clamp number between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Generate random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generate random float between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random float
     */
    function randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Roll probability (returns true if random roll succeeds)
     * @param {number} chance - Probability (0-100 for percentage, or 0-1 for decimal)
     * @returns {boolean} True if roll succeeds
     */
    function rollChance(chance) {
        const threshold = chance > 1 ? chance / 100 : chance;
        return Math.random() < threshold;
    }

    /**
     * Pick random element from array
     * @param {Array} array - Array to pick from
     * @returns {*} Random element
     */
    function randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Shuffle array in place
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => deepClone(item));

        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }

    /**
     * Generate unique ID
     * @param {string} prefix - Optional prefix
     * @returns {string} Unique ID
     */
    function generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Format time duration (milliseconds to readable string)
     * @param {number} ms - Milliseconds
     * @returns {string} Formatted time
     */
    function formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    /**
     * Calculate percentage
     * @param {number} value - Current value
     * @param {number} max - Maximum value
     * @returns {number} Percentage (0-100)
     */
    function percentage(value, max) {
        if (max === 0) return 0;
        return clamp((value / max) * 100, 0, 100);
    }

    /**
     * Linear interpolation
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    function lerp(start, end, t) {
        return start + (end - start) * clamp(t, 0, 1);
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Calculate weighted random choice
     * @param {Array} items - Array of {item, weight} objects
     * @returns {*} Selected item
     */
    function weightedRandom(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (const item of items) {
            random -= item.weight;
            if (random <= 0) {
                return item.item;
            }
        }

        return items[items.length - 1].item;
    }

    /**
     * Calculate exponential growth
     * @param {number} base - Base value
     * @param {number} level - Current level
     * @param {number} multiplier - Growth multiplier
     * @returns {number} Calculated value
     */
    function expGrowth(base, level, multiplier = 1.1) {
        return Math.floor(base * Math.pow(multiplier, level - 1));
    }

    /**
     * Calculate linear growth
     * @param {number} base - Base value
     * @param {number} level - Current level
     * @param {number} increment - Growth per level
     * @returns {number} Calculated value
     */
    function linearGrowth(base, level, increment) {
        return base + (level - 1) * increment;
    }

    /**
     * Get color for rarity
     * @param {string} rarity - Rarity tier
     * @returns {string} Color hex code
     */
    function getRarityColor(rarity) {
        const colors = {
            common: '#9e9e9e',
            uncommon: '#4caf50',
            rare: '#2196f3',
            epic: '#9c27b0',
            legendary: '#ff9800',
            mythic: '#f44336'
        };
        return colors[rarity] || colors.common;
    }

    /**
     * Format stat value with + prefix if positive
     * @param {number} value - Stat value
     * @returns {string} Formatted stat
     */
    function formatStat(value) {
        if (value > 0) return `+${value}`;
        return value.toString();
    }

    /**
     * Calculate distance between two points
     * @param {number} x1 - X coordinate 1
     * @param {number} y1 - Y coordinate 1
     * @param {number} x2 - X coordinate 2
     * @param {number} y2 - Y coordinate 2
     * @returns {number} Distance
     */
    function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    /**
     * Group array by property
     * @param {Array} array - Array to group
     * @param {string} key - Property to group by
     * @returns {Object} Grouped object
     */
    function groupBy(array, key) {
        return array.reduce((result, item) => {
            const groupKey = item[key];
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(item);
            return result;
        }, {});
    }

    /**
     * Sleep/delay function
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} Promise that resolves after delay
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Convert camelCase to Title Case
     * @param {string} str - camelCase string
     * @returns {string} Title Case string
     */
    function camelToTitle(str) {
        return str
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, s => s.toUpperCase())
            .trim();
    }

    // Public API
    return {
        formatNumber,
        clamp,
        randomInt,
        randomFloat,
        rollChance,
        randomChoice,
        shuffle,
        deepClone,
        generateId,
        formatDuration,
        percentage,
        lerp,
        escapeHtml,
        debounce,
        throttle,
        weightedRandom,
        expGrowth,
        linearGrowth,
        getRarityColor,
        formatStat,
        distance,
        groupBy,
        sleep,
        capitalize,
        camelToTitle
    };
})();

// Also expose formatNumber globally for convenience (used in many places)
if (typeof window !== 'undefined') {
    window.formatNumber = GameUtils.formatNumber;
}
