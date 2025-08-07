/**
 * InfoPanel - Display simulation information
 */

class InfoPanel {
    constructor(simulation) {
        this.simulation = simulation;
        this.updateInterval = 100; // Update every 100ms
        this.lastUpdate = 0;
    }

    update() {
        const currentTime = performance.now();
        if (currentTime - this.lastUpdate < this.updateInterval) return;
        this.lastUpdate = currentTime;

        const stats = this.simulation.getStats();
        
        // Update energy display
        const totalEnergyElement = document.getElementById('totalEnergy');
        if (totalEnergyElement && stats.physics.totalEnergy !== undefined) {
            totalEnergyElement.textContent = stats.physics.totalEnergy.toFixed(3);
        }

        // Update angular momentum display
        const angularMomentumElement = document.getElementById('angularMomentum');
        if (angularMomentumElement && stats.physics.totalAngularMomentum) {
            const am = stats.physics.totalAngularMomentum;
            const magnitude = MathUtils.magnitude(am);
            angularMomentumElement.textContent = magnitude.toFixed(3);
        }

        // Update time elapsed
        const timeElapsedElement = document.getElementById('timeElapsed');
        if (timeElapsedElement) {
            timeElapsedElement.textContent = stats.time.toFixed(2) + 's';
        }

        // Update FPS
        const fpsElement = document.getElementById('fps');
        if (fpsElement && stats.performance.fps) {
            fpsElement.textContent = stats.performance.fps;
        }

        // Update particle count
        const particleCountElement = document.getElementById('particleCount');
        if (particleCountElement) {
            const bodies = this.simulation.getBodies();
            particleCountElement.textContent = bodies.length;
        }
    }
}

window.InfoPanel = InfoPanel;
