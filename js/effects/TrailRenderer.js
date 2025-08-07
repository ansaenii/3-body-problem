/**
 * TrailRenderer - Motion trails for bodies
 */

class TrailRenderer {
    constructor(scene) {
        this.scene = scene;
        this.trails = new Map();
        this.maxTrailLength = 200;
    }

    update(deltaTime) {
        // Trails are updated by the physics engine
    }

    setMaxTrailLength(length) {
        this.maxTrailLength = length;
    }

    reset() {
        // Clear all trails
        this.trails.forEach(trail => {
            if (trail.geometry) trail.geometry.dispose();
            if (trail.material) trail.material.dispose();
            this.scene.remove(trail);
        });
        this.trails.clear();
    }
}

window.TrailRenderer = TrailRenderer;
