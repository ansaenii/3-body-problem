/**
 * Controls - UI controls management
 */

class Controls {
    constructor(simulation) {
        this.simulation = simulation;
        this.setupControls();
    }

    setupControls() {
        // Time scale control
        const timeScaleSlider = document.getElementById('timeScale');
        const timeScaleValue = document.getElementById('timeScaleValue');
        if (timeScaleSlider) {
            timeScaleSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.simulation.setTimeScale(value);
                if (timeScaleValue) {
                    timeScaleValue.textContent = value.toFixed(2) + 'x';
                }
            });
        }

        // Trail length control
        const trailLengthSlider = document.getElementById('trailLength');
        const trailLengthValue = document.getElementById('trailLengthValue');
        if (trailLengthSlider) {
            trailLengthSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.simulation.setTrailLength(value);
                if (trailLengthValue) {
                    trailLengthValue.textContent = value;
                }
            });
        }

        // Particle density control
        const particleDensitySlider = document.getElementById('particleDensity');
        const particleDensityValue = document.getElementById('particleDensityValue');
        if (particleDensitySlider) {
            particleDensitySlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.simulation.setParticleDensity(value);
                if (particleDensityValue) {
                    particleDensityValue.textContent = value.toFixed(1);
                }
            });
        }

        // Glow intensity control
        const glowIntensitySlider = document.getElementById('glowIntensity');
        const glowIntensityValue = document.getElementById('glowIntensityValue');
        if (glowIntensitySlider) {
            glowIntensitySlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.simulation.setGlowIntensity(value);
                if (glowIntensityValue) {
                    glowIntensityValue.textContent = value.toFixed(1);
                }
            });
        }

        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.simulation.reset();
            });
        }

        // Pause button
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.simulation.togglePause();
            });
        }

        // Screenshot button
        const screenshotBtn = document.getElementById('screenshotBtn');
        if (screenshotBtn) {
            screenshotBtn.addEventListener('click', () => {
                this.simulation.takeScreenshot();
            });
        }

        // Panel toggle
        const panelToggle = document.getElementById('panelToggle');
        if (panelToggle) {
            panelToggle.addEventListener('click', () => {
                const panelContent = document.querySelector('.panel-content');
                if (panelContent) {
                    panelContent.classList.toggle('collapsed');
                    panelToggle.classList.toggle('collapsed');
                }
            });
        }
    }

    update() {
        // Update controls if needed
    }
}

window.Controls = Controls;
