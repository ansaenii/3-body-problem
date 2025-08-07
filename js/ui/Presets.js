/**
 * Presets - Famous 3-body problem configurations
 */

class Presets {
    constructor(simulation) {
        this.simulation = simulation;
        this.currentPreset = null;
        this.setupPresets();
    }

    setupPresets() {
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.loadPreset(preset);
                
                // Update active state
                presetButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    loadPreset(presetName) {
        this.currentPreset = presetName;
        
        // Clear existing bodies
        this.simulation.physicsEngine.reset();
        
        switch (presetName) {
            case 'figure8':
                this.loadFigure8();
                break;
            case 'lagrange':
                this.loadLagrange();
                break;
            case 'chaos':
                this.loadChaos();
                break;
            case 'orbit':
                this.loadOrbit();
                break;
        }
    }

    loadFigure8() {
        // Figure-8 solution (famous stable 3-body configuration)
        const mass = 1.0;
        
        // Body 1
        this.simulation.physicsEngine.addBody(
            mass,
            { x: -1, y: 0, z: 0 },
            { x: 0, y: 0.5, z: 0 },
            '#4ecdc4'
        );
        
        // Body 2
        this.simulation.physicsEngine.addBody(
            mass,
            { x: 1, y: 0, z: 0 },
            { x: 0, y: -0.5, z: 0 },
            '#8b5cf6'
        );
        
        // Body 3
        this.simulation.physicsEngine.addBody(
            mass,
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 0, z: 0 },
            '#f97316'
        );
    }

    loadLagrange() {
        // Lagrange point configuration
        const mass = 1.0;
        const distance = 10;
        
        // Central body
        this.simulation.physicsEngine.addBody(
            mass * 2,
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 0, z: 0 },
            '#f97316'
        );
        
        // Orbiting bodies at Lagrange points
        this.simulation.physicsEngine.addBody(
            mass,
            { x: distance, y: 0, z: 0 },
            { x: 0, y: Math.sqrt(2 * mass * 2 / distance), z: 0 },
            '#4ecdc4'
        );
        
        this.simulation.physicsEngine.addBody(
            mass,
            { x: -distance, y: 0, z: 0 },
            { x: 0, y: -Math.sqrt(2 * mass * 2 / distance), z: 0 },
            '#8b5cf6'
        );
    }

    loadChaos() {
        // Chaotic configuration
        const mass = 1.0;
        
        this.simulation.physicsEngine.addBody(
            mass,
            { x: -2, y: 0, z: 0 },
            { x: 0, y: 1, z: 0 },
            '#ef4444'
        );
        
        this.simulation.physicsEngine.addBody(
            mass,
            { x: 2, y: 0, z: 0 },
            { x: 0, y: -1, z: 0 },
            '#22c55e'
        );
        
        this.simulation.physicsEngine.addBody(
            mass,
            { x: 0, y: 2, z: 0 },
            { x: -1, y: 0, z: 0 },
            '#eab308'
        );
    }

    loadOrbit() {
        // Simple orbital configuration
        const mass = 1.0;
        
        // Central star
        this.simulation.physicsEngine.addBody(
            mass * 3,
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 0, z: 0 },
            '#f97316'
        );
        
        // Orbiting planets
        this.simulation.physicsEngine.addBody(
            mass,
            { x: 8, y: 0, z: 0 },
            { x: 0, y: 2, z: 0 },
            '#4ecdc4'
        );
        
        this.simulation.physicsEngine.addBody(
            mass,
            { x: -6, y: 0, z: 0 },
            { x: 0, y: -1.5, z: 0 },
            '#8b5cf6'
        );
    }

    reloadCurrentPreset() {
        if (this.currentPreset) {
            this.loadPreset(this.currentPreset);
        }
    }

    getCurrentPreset() {
        return this.currentPreset;
    }
}

window.Presets = Presets;
