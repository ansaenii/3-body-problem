/**
 * ColorUtils - Color management and visual effects for the simulation
 * Handles color schemes, gradients, and dynamic color generation
 */

class ColorUtils {
    constructor() {
        // Cosmic color palette
        this.palette = {
            primary: {
                cyan: '#4ecdc4',
                purple: '#8b5cf6',
                orange: '#f97316',
                red: '#ef4444',
                green: '#22c55e',
                blue: '#3b82f6',
                yellow: '#eab308',
                pink: '#ec4899'
            },
            cosmic: {
                deepSpace: '#0a0a2a',
                nebula: '#1a1a3a',
                starLight: '#f8fafc',
                cosmicPurple: '#8b5cf6',
                stellarBlue: '#4ecdc4',
                solarOrange: '#f97316',
                galacticPink: '#ec4899',
                void: '#000000'
            },
            energy: {
                low: '#22c55e',    // Green
                medium: '#eab308',  // Yellow
                high: '#f97316',    // Orange
                extreme: '#ef4444'  // Red
            }
        };

        // Pre-computed color gradients
        this.gradients = this.precomputeGradients();
    }

    /**
     * Pre-compute common gradients for performance
     */
    precomputeGradients() {
        return {
            cosmic: this.createGradient([
                this.palette.cosmic.deepSpace,
                this.palette.cosmic.nebula,
                this.palette.cosmic.cosmicPurple,
                this.palette.cosmic.stellarBlue
            ]),
            energy: this.createGradient([
                this.palette.energy.low,
                this.palette.energy.medium,
                this.palette.energy.high,
                this.palette.energy.extreme
            ]),
            stellar: this.createGradient([
                this.palette.cosmic.stellarBlue,
                this.palette.cosmic.cosmicPurple,
                this.palette.cosmic.solarOrange,
                this.palette.cosmic.galacticPink
            ])
        };
    }

    /**
     * Create a gradient from an array of colors
     */
    createGradient(colors) {
        const stops = [];
        const step = 1 / (colors.length - 1);
        
        for (let i = 0; i < colors.length; i++) {
            stops.push({
                position: i * step,
                color: this.hexToRgb(colors[i])
            });
        }
        
        return stops;
    }

    /**
     * Get color from gradient at position (0-1)
     */
    getGradientColor(gradient, position) {
        position = Math.max(0, Math.min(1, position));
        
        // Find the two stops to interpolate between
        let startStop = gradient[0];
        let endStop = gradient[gradient.length - 1];
        
        for (let i = 0; i < gradient.length - 1; i++) {
            if (position >= gradient[i].position && position <= gradient[i + 1].position) {
                startStop = gradient[i];
                endStop = gradient[i + 1];
                break;
            }
        }
        
        // Interpolate between the two stops
        const t = (position - startStop.position) / (endStop.position - startStop.position);
        return this.interpolateColor(startStop.color, endStop.color, t);
    }

    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    /**
     * Convert RGB to hex
     */
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    /**
     * Interpolate between two colors
     */
    interpolateColor(color1, color2, t) {
        return {
            r: Math.round(color1.r + (color2.r - color1.r) * t),
            g: Math.round(color1.g + (color2.g - color1.g) * t),
            b: Math.round(color1.b + (color2.b - color1.b) * t)
        };
    }

    /**
     * Get color based on mass
     */
    getMassColor(mass, minMass, maxMass) {
        const normalizedMass = MathUtils.clamp((mass - minMass) / (maxMass - minMass), 0, 1);
        return this.getGradientColor(this.gradients.energy, normalizedMass);
    }

    /**
     * Get color based on velocity
     */
    getVelocityColor(velocity, maxVelocity) {
        const speed = MathUtils.magnitude(velocity);
        const normalizedSpeed = MathUtils.clamp(speed / maxVelocity, 0, 1);
        return this.getGradientColor(this.gradients.stellar, normalizedSpeed);
    }

    /**
     * Get color based on energy
     */
    getEnergyColor(energy, minEnergy, maxEnergy) {
        const normalizedEnergy = MathUtils.clamp((energy - minEnergy) / (maxEnergy - minEnergy), 0, 1);
        return this.getGradientColor(this.gradients.cosmic, normalizedEnergy);
    }

    /**
     * Generate random cosmic color
     */
    getRandomCosmicColor() {
        const colors = Object.values(this.palette.cosmic);
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        return this.hexToRgb(randomColor);
    }

    /**
     * Get color with alpha transparency
     */
    getColorWithAlpha(color, alpha) {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    }

    /**
     * Create a pulsing color effect
     */
    getPulsingColor(baseColor, time, frequency = 1, amplitude = 0.3) {
        const pulse = Math.sin(time * frequency) * amplitude + 1;
        return {
            r: MathUtils.clamp(baseColor.r * pulse, 0, 255),
            g: MathUtils.clamp(baseColor.g * pulse, 0, 255),
            b: MathUtils.clamp(baseColor.b * pulse, 0, 255)
        };
    }

    /**
     * Create a rainbow color effect
     */
    getRainbowColor(time, speed = 1) {
        const hue = (time * speed * 360) % 360;
        return this.hsvToRgb(hue, 1, 1);
    }

    /**
     * Convert HSV to RGB
     */
    hsvToRgb(h, s, v) {
        const c = v * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = v - c;
        
        let r, g, b;
        
        if (h >= 0 && h < 60) {
            r = c; g = x; b = 0;
        } else if (h >= 60 && h < 120) {
            r = x; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0; g = c; b = x;
        } else if (h >= 180 && h < 240) {
            r = 0; g = x; b = c;
        } else if (h >= 240 && h < 300) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }
        
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    /**
     * Get color for different body types
     */
    getBodyColor(bodyType, mass, velocity) {
        switch (bodyType) {
            case 'star':
                return this.getMassColor(mass, 1e30, 2e30);
            case 'planet':
                return this.getMassColor(mass, 1e24, 1e26);
            case 'asteroid':
                return this.getVelocityColor(velocity, 10000);
            case 'comet':
                return this.getRandomCosmicColor();
            default:
                return this.getEnergyColor(mass * MathUtils.magnitude(velocity), 0, 1e35);
        }
    }

    /**
     * Create a glow effect color
     */
    getGlowColor(baseColor, intensity = 1) {
        const glowColor = { ...baseColor };
        const glowFactor = 1 + intensity * 0.5;
        
        glowColor.r = MathUtils.clamp(glowColor.r * glowFactor, 0, 255);
        glowColor.g = MathUtils.clamp(glowColor.g * glowFactor, 0, 255);
        glowColor.b = MathUtils.clamp(glowColor.b * glowFactor, 0, 255);
        
        return glowColor;
    }

    /**
     * Get trail color with fade effect
     */
    getTrailColor(baseColor, age, maxAge) {
        const alpha = 1 - (age / maxAge);
        return this.getColorWithAlpha(baseColor, alpha);
    }

    /**
     * Create a color scheme for UI elements
     */
    getUIScheme() {
        return {
            primary: this.palette.primary.cyan,
            secondary: this.palette.primary.purple,
            accent: this.palette.primary.orange,
            background: this.palette.cosmic.deepSpace,
            surface: this.palette.cosmic.nebula,
            text: this.palette.cosmic.starLight,
            textSecondary: '#cccccc',
            border: 'rgba(255, 255, 255, 0.1)',
            success: this.palette.primary.green,
            warning: this.palette.primary.yellow,
            error: this.palette.primary.red
        };
    }

    /**
     * Get color for performance indicators
     */
    getPerformanceColor(value, maxValue) {
        const normalized = MathUtils.clamp(value / maxValue, 0, 1);
        
        if (normalized < 0.5) {
            return this.palette.primary.green;
        } else if (normalized < 0.8) {
            return this.palette.primary.yellow;
        } else {
            return this.palette.primary.red;
        }
    }

    /**
     * Create a color transition
     */
    createColorTransition(fromColor, toColor, duration) {
        return {
            from: fromColor,
            to: toColor,
            duration: duration,
            startTime: performance.now()
        };
    }

    /**
     * Update color transition
     */
    updateColorTransition(transition, currentTime) {
        const elapsed = currentTime - transition.startTime;
        const progress = MathUtils.clamp(elapsed / transition.duration, 0, 1);
        
        return this.interpolateColor(transition.from, transition.to, progress);
    }

    /**
     * Get complementary color
     */
    getComplementaryColor(color) {
        return {
            r: 255 - color.r,
            g: 255 - color.g,
            b: 255 - color.b
        };
    }

    /**
     * Check if color is dark
     */
    isDarkColor(color) {
        const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
        return brightness < 128;
    }

    /**
     * Get contrasting text color
     */
    getContrastColor(backgroundColor) {
        return this.isDarkColor(backgroundColor) ? '#ffffff' : '#000000';
    }
}

// Export for use in other modules
window.ColorUtils = ColorUtils;
