/**
 * Simulation - Coordinates physics and rendering
 */

class Simulation {
    constructor() {
        this.physicsEngine = null;
        this.renderer = null;
        this.bodies = [];
    }

    update(deltaTime) {
        // Update physics
        if (this.physicsEngine) {
            this.physicsEngine.update(deltaTime);
            this.bodies = this.physicsEngine.getBodies();
        }

        // Update rendering
        if (this.renderer) {
            this.bodies.forEach(body => {
                this.renderer.updateBody(body);
                this.renderer.updateTrail(body);
            });
        }
    }

    getBodies() {
        return this.bodies;
    }
}

window.Simulation = Simulation;
