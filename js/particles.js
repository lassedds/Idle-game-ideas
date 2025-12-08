/**
 * Particles Module
 * Handles visual effects and particle animations
 */

const Particles = (function() {
    const container = () => document.getElementById('particles-container');

    /**
     * Create a floating number particle
     * @param {number} value - Value to display
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    function createNumberParticle(value, x, y) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = '+' + Resources.formatNumber(value);

        // Random horizontal offset
        const offsetX = (Math.random() - 0.5) * 80;
        particle.style.left = (x + offsetX) + 'px';
        particle.style.top = y + 'px';

        container().appendChild(particle);

        // Remove after animation
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }

    /**
     * Create sparkle particles around a point
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} count - Number of sparkles
     */
    function createSparkles(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';

            // Random position in circle around click
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const distance = 30 + Math.random() * 40;
            const sparkleX = x + Math.cos(angle) * distance;
            const sparkleY = y + Math.sin(angle) * distance;

            sparkle.style.left = sparkleX + 'px';
            sparkle.style.top = sparkleY + 'px';

            // Random size
            const size = 5 + Math.random() * 10;
            sparkle.style.width = size + 'px';
            sparkle.style.height = size + 'px';

            // Random color variation
            const hue = 180 + Math.random() * 40; // Cyan to blue
            sparkle.style.background = `hsl(${hue}, 100%, 70%)`;

            container().appendChild(sparkle);

            // Remove after animation
            setTimeout(() => {
                sparkle.remove();
            }, 600);
        }
    }

    /**
     * Create a burst effect for big numbers
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     */
    function createBurst(x, y) {
        const colors = ['#00d4ff', '#00ffff', '#ff79c6', '#f1fa8c'];

        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'sparkle';

            const angle = (Math.PI * 2 * i) / 12;
            const distance = 60 + Math.random() * 30;

            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.width = '8px';
            particle.style.height = '8px';

            // Animate outward
            particle.animate([
                {
                    transform: 'scale(1)',
                    left: x + 'px',
                    top: y + 'px',
                    opacity: 1
                },
                {
                    transform: 'scale(0)',
                    left: (x + Math.cos(angle) * distance) + 'px',
                    top: (y + Math.sin(angle) * distance) + 'px',
                    opacity: 0
                }
            ], {
                duration: 500,
                easing: 'ease-out'
            });

            container().appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 500);
        }
    }

    /**
     * Create click effect with number and sparkles
     * @param {number} value - Click value
     * @param {MouseEvent} event - Click event
     */
    function createClickEffect(value, event) {
        const rect = container().getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Always show number
        createNumberParticle(value, x, y);

        // Sparkles for normal clicks
        if (Math.random() > 0.3) {
            createSparkles(x, y, 5 + Math.floor(Math.random() * 5));
        }

        // Burst for big values
        if (value >= 100) {
            createBurst(x, y);
        }
    }

    /**
     * Create passive income particle (for auto-generated crystals)
     */
    function createPassiveParticle() {
        const crystalEl = document.getElementById('main-crystal');
        if (!crystalEl) return;

        const rect = crystalEl.getBoundingClientRect();
        const containerRect = container().getBoundingClientRect();

        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top;

        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = (x + (Math.random() - 0.5) * 100) + 'px';
        sparkle.style.top = y + 'px';
        sparkle.style.background = '#ffd700';
        sparkle.style.width = '6px';
        sparkle.style.height = '6px';

        sparkle.animate([
            { transform: 'translateY(0) scale(1)', opacity: 1 },
            { transform: 'translateY(-50px) scale(0)', opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });

        container().appendChild(sparkle);

        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    }

    /**
     * Create achievement unlock effect
     */
    function createAchievementEffect() {
        const crystalEl = document.getElementById('main-crystal');
        if (!crystalEl) return;

        const rect = crystalEl.getBoundingClientRect();
        const containerRect = container().getBoundingClientRect();

        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top + rect.height / 2;

        // Golden burst
        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';

            const angle = (Math.PI * 2 * i) / 20;
            const distance = 100 + Math.random() * 50;

            sparkle.style.left = x + 'px';
            sparkle.style.top = y + 'px';
            sparkle.style.background = '#ffd700';
            sparkle.style.width = '12px';
            sparkle.style.height = '12px';
            sparkle.style.boxShadow = '0 0 10px #ffd700';

            sparkle.animate([
                {
                    transform: 'scale(1)',
                    left: x + 'px',
                    top: y + 'px',
                    opacity: 1
                },
                {
                    transform: 'scale(0)',
                    left: (x + Math.cos(angle) * distance) + 'px',
                    top: (y + Math.sin(angle) * distance) + 'px',
                    opacity: 0
                }
            ], {
                duration: 800,
                easing: 'ease-out',
                delay: i * 20
            });

            container().appendChild(sparkle);

            setTimeout(() => {
                sparkle.remove();
            }, 1000);
        }
    }

    // Public API
    return {
        createNumberParticle,
        createSparkles,
        createBurst,
        createClickEffect,
        createPassiveParticle,
        createAchievementEffect
    };
})();
