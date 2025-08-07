/**
 * PhysicsEngine - Core physics simulation for 3-body problem
 * Handles gravitational forces, integration, and energy conservation
 */

class PhysicsEngine {
    constructor() {
        this.bodies = [];
        this.timeStep = 1/60; // Default 60 FPS
        this.timeScale = 1.0;
        this.gravity = 6.67430e-11; // Gravitational constant
        this.softening = 1e-6; // Softening parameter to prevent singularities
        
        // Integration method
        this.integrationMethod = 'rk4'; // 'rk4', 'verlet', 'euler'
        
        // Performance settings
        this.maxBodies = 1000;
        this.spatialHash = new Map();
        this.hashCellSize = 1000;
        
        // Energy tracking
        this.initialEnergy = 0;
        this.energyConservation = true;
        
        // Collision detection
        this.collisionDetection = false;
        this.collisionRadius = 0.1;
        
        // Statistics
        this.stats = {
            forceCalculations: 0,
            integrationSteps: 0,
            collisions: 0,
            energyError: 0
        };
    }

    /**
     * Add a body to the simulation
     */
    addBody(mass, position, velocity, color = null, type = 'body') {
        if (this.bodies.length >= this.maxBodies) {
            console.warn('Maximum number of bodies reached');
            return false;
        }

        const body = {
            id: this.bodies.length,
            mass: mass,
            position: { ...position },
            velocity: { ...velocity },
            acceleration: { x: 0, y: 0, z: 0 },
            color: color || this.getRandomColor(),
            type: type,
            radius: this.calculateRadius(mass),
            trail: [],
            maxTrailLength: 200
        };

        this.bodies.push(body);
        this.updateSpatialHash();
        
        return body.id;
    }

    /**
     * Remove a body from the simulation
     */
    removeBody(bodyId) {
        const index = this.bodies.findIndex(body => body.id === bodyId);
        if (index !== -1) {
            this.bodies.splice(index, 1);
            this.updateSpatialHash();
            return true;
        }
        return false;
    }

    /**
     * Calculate gravitational forces between all bodies
     */
    calculateForces() {
        this.stats.forceCalculations = 0;
        
        // Reset accelerations
        for (let body of this.bodies) {
            body.acceleration = { x: 0, y: 0, z: 0 };
        }

        // Calculate forces using spatial partitioning for efficiency
        const cells = this.getNearbyCells();
        
        for (let cell of cells) {
            const bodiesInCell = this.spatialHash.get(cell) || [];
            
            // Forces within the cell
            for (let i = 0; i < bodiesInCell.length; i++) {
                for (let j = i + 1; j < bodiesInCell.length; j++) {
                    this.calculateForceBetween(bodiesInCell[i], bodiesInCell[j]);
                }
            }
            
            // Forces with neighboring cells
            const neighbors = this.getNeighboringCells(cell);
            for (let neighbor of neighbors) {
                const bodiesInNeighbor = this.spatialHash.get(neighbor) || [];
                for (let body1 of bodiesInCell) {
                    for (let body2 of bodiesInNeighbor) {
                        this.calculateForceBetween(body1, body2);
                    }
                }
            }
        }
    }

    /**
     * Calculate force between two bodies
     */
    calculateForceBetween(body1, body2) {
        const r = MathUtils.subtract(body2.position, body1.position);
        const distance = MathUtils.magnitude(r);
        
        if (distance < this.softening) return;
        
        const forceMagnitude = this.gravity * body1.mass * body2.mass / 
                              (distance * distance + this.softening * this.softening);
        
        const forceDirection = MathUtils.normalize(r);
        const force = MathUtils.multiply(forceDirection, forceMagnitude);
        
        // Apply force to both bodies (Newton's third law)
        body1.acceleration = MathUtils.add(body1.acceleration, 
                                         MathUtils.divide(force, body1.mass));
        body2.acceleration = MathUtils.add(body2.acceleration, 
                                         MathUtils.multiply(force, -1 / body2.mass));
        
        this.stats.forceCalculations++;
    }

    /**
     * Update positions and velocities using integration
     */
    update(deltaTime) {
        const dt = deltaTime * this.timeScale;
        
        if (dt <= 0) return;
        
        this.stats.integrationSteps++;
        
        switch (this.integrationMethod) {
            case 'rk4':
                this.updateRK4(dt);
                break;
            case 'verlet':
                this.updateVerlet(dt);
                break;
            case 'euler':
                this.updateEuler(dt);
                break;
            default:
                this.updateRK4(dt);
        }
        
        // Update trails
        this.updateTrails();
        
        // Handle collisions
        if (this.collisionDetection) {
            this.handleCollisions();
        }
        
        // Update spatial hash
        this.updateSpatialHash();
        
        // Track energy conservation
        this.trackEnergyConservation();
    }

    /**
     * Runge-Kutta 4th order integration
     */
    updateRK4(dt) {
        const state = this.getStateVector();
        const newState = MathUtils.rk4Step(this.derivativeFunction.bind(this), 0, state, dt);
        this.setStateVector(newState);
    }

    /**
     * Verlet integration
     */
    updateVerlet(dt) {
        for (let body of this.bodies) {
            const newPosition = MathUtils.verletStep(body.position, body.velocity, body.acceleration, dt);
            const newVelocity = MathUtils.add(body.velocity, 
                                           MathUtils.multiply(body.acceleration, dt));
            
            body.position = newPosition;
            body.velocity = newVelocity;
        }
    }

    /**
     * Euler integration (simple but less accurate)
     */
    updateEuler(dt) {
        for (let body of this.bodies) {
            body.velocity = MathUtils.add(body.velocity, 
                                        MathUtils.multiply(body.acceleration, dt));
            body.position = MathUtils.add(body.position, 
                                        MathUtils.multiply(body.velocity, dt));
        }
    }

    /**
     * Get state vector for RK4 integration
     */
    getStateVector() {
        const state = [];
        for (let body of this.bodies) {
            state.push(body.position.x, body.position.y, body.position.z,
                      body.velocity.x, body.velocity.y, body.velocity.z);
        }
        return state;
    }

    /**
     * Set state vector from RK4 integration
     */
    setStateVector(state) {
        let index = 0;
        for (let body of this.bodies) {
            body.position.x = state[index++];
            body.position.y = state[index++];
            body.position.z = state[index++];
            body.velocity.x = state[index++];
            body.velocity.y = state[index++];
            body.velocity.z = state[index++];
        }
    }

    /**
     * Derivative function for RK4 integration
     */
    derivativeFunction(t, state) {
        // Set positions and velocities from state
        this.setStateVector(state);
        
        // Calculate forces
        this.calculateForces();
        
        // Build derivative vector
        const derivative = [];
        for (let body of this.bodies) {
            derivative.push(body.velocity.x, body.velocity.y, body.velocity.z,
                          body.acceleration.x, body.acceleration.y, body.acceleration.z);
        }
        
        return derivative;
    }

    /**
     * Update particle trails
     */
    updateTrails() {
        for (let body of this.bodies) {
            // Add current position to trail
            body.trail.push({ ...body.position, time: performance.now() });
            
            // Remove old trail points
            while (body.trail.length > body.maxTrailLength) {
                body.trail.shift();
            }
        }
    }

    /**
     * Handle collisions between bodies
     */
    handleCollisions() {
        this.stats.collisions = 0;
        
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];
                
                const distance = MathUtils.distance(body1.position, body2.position);
                const collisionDistance = body1.radius + body2.radius;
                
                if (distance < collisionDistance) {
                    this.resolveCollision(body1, body2);
                    this.stats.collisions++;
                }
            }
        }
    }

    /**
     * Resolve collision between two bodies
     */
    resolveCollision(body1, body2) {
        // Simple elastic collision
        const normal = MathUtils.normalize(
            MathUtils.subtract(body2.position, body1.position)
        );
        
        const relativeVelocity = MathUtils.subtract(body2.velocity, body1.velocity);
        const velocityAlongNormal = MathUtils.dot(relativeVelocity, normal);
        
        if (velocityAlongNormal > 0) return; // Bodies are moving apart
        
        const restitution = 0.8; // Elasticity factor
        const impulse = -(1 + restitution) * velocityAlongNormal;
        const impulseVector = MathUtils.multiply(normal, impulse);
        
        body1.velocity = MathUtils.add(body1.velocity, 
                                     MathUtils.multiply(impulseVector, -1 / body1.mass));
        body2.velocity = MathUtils.add(body2.velocity, 
                                     MathUtils.multiply(impulseVector, 1 / body2.mass));
    }

    /**
     * Spatial partitioning for performance
     */
    updateSpatialHash() {
        this.spatialHash.clear();
        
        for (let body of this.bodies) {
            const cell = this.getCellKey(body.position);
            if (!this.spatialHash.has(cell)) {
                this.spatialHash.set(cell, []);
            }
            this.spatialHash.get(cell).push(body);
        }
    }

    /**
     * Get cell key for spatial partitioning
     */
    getCellKey(position) {
        const x = Math.floor(position.x / this.hashCellSize);
        const y = Math.floor(position.y / this.hashCellSize);
        const z = Math.floor(position.z / this.hashCellSize);
        return `${x},${y},${z}`;
    }

    /**
     * Get nearby cells for force calculation
     */
    getNearbyCells() {
        return Array.from(this.spatialHash.keys());
    }

    /**
     * Get neighboring cells
     */
    getNeighboringCells(cell) {
        const [x, y, z] = cell.split(',').map(Number);
        const neighbors = [];
        
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    if (dx === 0 && dy === 0 && dz === 0) continue;
                    neighbors.push(`${x + dx},${y + dy},${z + dz}`);
                }
            }
        }
        
        return neighbors;
    }

    /**
     * Calculate body radius based on mass
     */
    calculateRadius(mass) {
        return Math.pow(mass, 1/3) * 0.1; // Scale with cube root of mass
    }

    /**
     * Get random color for bodies
     */
    getRandomColor() {
        const colors = [
            '#4ecdc4', '#8b5cf6', '#f97316', '#ef4444',
            '#22c55e', '#3b82f6', '#eab308', '#ec4899'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Track energy conservation
     */
    trackEnergyConservation() {
        if (!this.energyConservation) return;
        
        const currentEnergy = MathUtils.totalEnergy(this.bodies);
        
        if (this.initialEnergy === 0) {
            this.initialEnergy = currentEnergy;
        } else {
            this.stats.energyError = Math.abs(currentEnergy - this.initialEnergy) / this.initialEnergy;
        }
    }

    /**
     * Reset simulation
     */
    reset() {
        this.bodies = [];
        this.spatialHash.clear();
        this.initialEnergy = 0;
        this.stats = {
            forceCalculations: 0,
            integrationSteps: 0,
            collisions: 0,
            energyError: 0
        };
    }

    /**
     * Get simulation statistics
     */
    getStats() {
        return {
            ...this.stats,
            bodyCount: this.bodies.length,
            totalEnergy: MathUtils.totalEnergy(this.bodies),
            totalAngularMomentum: MathUtils.totalAngularMomentum(this.bodies)
        };
    }

    /**
     * Set integration method
     */
    setIntegrationMethod(method) {
        if (['rk4', 'verlet', 'euler'].includes(method)) {
            this.integrationMethod = method;
        }
    }

    /**
     * Set time scale
     */
    setTimeScale(scale) {
        this.timeScale = MathUtils.clamp(scale, 0.01, 100);
    }

    /**
     * Set collision detection
     */
    setCollisionDetection(enabled) {
        this.collisionDetection = enabled;
    }

    /**
     * Get all bodies
     */
    getBodies() {
        return this.bodies;
    }

    /**
     * Get body by ID
     */
    getBody(id) {
        return this.bodies.find(body => body.id === id);
    }
}

// Export for use in other modules
window.PhysicsEngine = PhysicsEngine;
