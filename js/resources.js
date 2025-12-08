/**
 * Resources Module
 * Handles resource calculations and formatting
 */

const Resources = (function() {
    // Number suffixes for large numbers
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

    /**
     * Format a number with suffixes for readability
     * @param {number} num - Number to format
     * @returns {string} - Formatted number string
     */
    function formatNumber(num) {
        if (num < 1000) {
            return Math.floor(num).toString();
        }

        let suffixIndex = 0;
        let value = num;

        while (value >= 1000 && suffixIndex < suffixes.length - 1) {
            value /= 1000;
            suffixIndex++;
        }

        // Show decimal places for values like 1.5K
        if (value < 10) {
            return value.toFixed(2) + suffixes[suffixIndex];
        } else if (value < 100) {
            return value.toFixed(1) + suffixes[suffixIndex];
        } else {
            return Math.floor(value) + suffixes[suffixIndex];
        }
    }

    /**
     * Format time in mm:ss or hh:mm:ss
     * @param {number} milliseconds - Time in milliseconds
     * @returns {string} - Formatted time string
     */
    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Calculate crystals per second from all sources
     * @returns {number} - Total CPS
     */
    function calculateCPS() {
        let cps = 0;
        const multiplier = GameState.getProductionMultiplier();

        // Add production from each building
        Buildings.getAll().forEach(building => {
            const count = GameState.getBuildingCount(building.id);
            if (count > 0) {
                cps += building.production * count;
            }
        });

        return cps * multiplier;
    }

    /**
     * Calculate click value including all bonuses
     * @returns {number} - Value per click
     */
    function calculateClickValue() {
        let baseClick = GameState.getClickPower();

        // Add bonus from CPS (1% of CPS per click)
        const cps = calculateCPS();
        const cpsBonus = cps * 0.01;

        return baseClick + cpsBonus;
    }

    /**
     * Process a click event
     */
    function processClick() {
        const clickValue = calculateClickValue();
        GameState.addCrystals(clickValue);
        GameState.incrementClicks();
        return clickValue;
    }

    /**
     * Process passive income tick
     * @param {number} deltaTime - Time since last tick in seconds
     */
    function processTick(deltaTime) {
        const cps = calculateCPS();
        if (cps > 0) {
            GameState.addCrystals(cps * deltaTime);
        }
    }

    // Public API
    return {
        formatNumber,
        formatTime,
        calculateCPS,
        calculateClickValue,
        processClick,
        processTick
    };
})();
