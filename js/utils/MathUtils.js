/**
 * MathUtils - Mathematical utilities for 3-body problem simulation
 * Optimized for performance and accuracy
 */

class MathUtils {
    constructor() {
        this.G = 6.67430e-11; // Gravitational constant
        this.PI = Math.PI;
        this.TWO_PI = 2 * Math.PI;
        this.HALF_PI = Math.PI / 2;
        
        // Pre-computed values for performance
        this.DEG_TO_RAD = Math.PI / 180;
        this.RAD_TO_DEG = 180 / Math.PI;
    }

    /**
     * Vector operations
     */
    static add(v1, v2) {
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y,
            z: v1.z + v2.z
        };
    }

    static subtract(v1, v2) {
        return {
            x: v1.x - v2.x,
            y: v1.y - v2.y,
            z: v1.z - v2.z
        };
    }

    static multiply(v, scalar) {
        return {
            x: v.x * scalar,
            y: v.y * scalar,
            z: v.z * scalar
        };
    }

    static divide(v, scalar) {
        return {
            x: v.x / scalar,
            y: v.y / scalar,
            z: v.z / scalar
        };
    }

    static magnitude(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    static normalize(v) {
        const mag = this.magnitude(v);
        if (mag === 0) return { x: 0, y: 0, z: 0 };
        return this.divide(v, mag);
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    static cross(v1, v2) {
        return {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        };
    }

    static distance(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        const dz = v1.z - v2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    static distanceSquared(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        const dz = v1.z - v2.z;
        return dx * dx + dy * dy + dz * dz;
    }

    /**
     * Physics calculations
     */
    static gravitationalForce(m1, m2, r1, r2) {
        const r = this.subtract(r2, r1);
        const distance = this.magnitude(r);
        
        if (distance === 0) return { x: 0, y: 0, z: 0 };
        
        const forceMagnitude = this.G * m1 * m2 / (distance * distance);
        const forceDirection = this.normalize(r);
        
        return this.multiply(forceDirection, forceMagnitude);
    }

    static kineticEnergy(mass, velocity) {
        const speed = this.magnitude(velocity);
        return 0.5 * mass * speed * speed;
    }

    static gravitationalPotentialEnergy(m1, m2, r1, r2) {
        const distance = this.distance(r1, r2);
        if (distance === 0) return 0;
        return -this.G * m1 * m2 / distance;
    }

    static angularMomentum(mass, position, velocity) {
        return this.cross(position, this.multiply(velocity, mass));
    }

    static totalEnergy(bodies) {
        let totalEnergy = 0;
        
        // Kinetic energy
        for (let body of bodies) {
            totalEnergy += this.kineticEnergy(body.mass, body.velocity);
        }
        
        // Gravitational potential energy
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                totalEnergy += this.gravitationalPotentialEnergy(
                    bodies[i].mass, bodies[j].mass,
                    bodies[i].position, bodies[j].position
                );
            }
        }
        
        return totalEnergy;
    }

    static totalAngularMomentum(bodies) {
        let totalAngularMomentum = { x: 0, y: 0, z: 0 };
        
        for (let body of bodies) {
            const angularMomentum = this.angularMomentum(
                body.mass, body.position, body.velocity
            );
            totalAngularMomentum = this.add(totalAngularMomentum, angularMomentum);
        }
        
        return totalAngularMomentum;
    }

    /**
     * Integration methods
     */
    static rk4Step(f, t, y, h) {
        const k1 = f(t, y);
        const k2 = f(t + h/2, this.add(y, this.multiply(k1, h/2)));
        const k3 = f(t + h/2, this.add(y, this.multiply(k2, h/2)));
        const k4 = f(t + h, this.add(y, this.multiply(k3, h)));
        
        return this.add(y, this.multiply(
            this.add(k1, this.multiply(this.add(k2, k3), 2), k4),
            h/6
        ));
    }

    static verletStep(position, velocity, acceleration, dt) {
        const newPosition = this.add(
            position,
            this.add(
                this.multiply(velocity, dt),
                this.multiply(acceleration, 0.5 * dt * dt)
            )
        );
        
        return newPosition;
    }

    /**
     * Coordinate transformations
     */
    static sphericalToCartesian(r, theta, phi) {
        return {
            x: r * Math.sin(theta) * Math.cos(phi),
            y: r * Math.sin(theta) * Math.sin(phi),
            z: r * Math.cos(theta)
        };
    }

    static cartesianToSpherical(x, y, z) {
        const r = Math.sqrt(x * x + y * y + z * z);
        const theta = Math.acos(z / r);
        const phi = Math.atan2(y, x);
        
        return { r, theta, phi };
    }

    /**
     * Random number generation
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomGaussian(mean = 0, stdDev = 1) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return mean + z * stdDev;
    }

    static randomVector(minMagnitude = 0, maxMagnitude = 1) {
        const magnitude = this.random(minMagnitude, maxMagnitude);
        const theta = this.random(0, this.TWO_PI);
        const phi = Math.acos(this.random(-1, 1));
        
        return this.sphericalToCartesian(magnitude, phi, theta);
    }

    /**
     * Clamping and interpolation
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    static smoothstep(edge0, edge1, x) {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    }

    /**
     * Trigonometric utilities
     */
    static sin(angle) {
        return Math.sin(angle);
    }

    static cos(angle) {
        return Math.cos(angle);
    }

    static tan(angle) {
        return Math.tan(angle);
    }

    static asin(value) {
        return Math.asin(this.clamp(value, -1, 1));
    }

    static acos(value) {
        return Math.acos(this.clamp(value, -1, 1));
    }

    static atan2(y, x) {
        return Math.atan2(y, x);
    }

    /**
     * Performance optimizations
     */
    static fastInverseSquareRoot(number) {
        // Quake III Arena fast inverse square root approximation
        const buffer = new ArrayBuffer(4);
        const floatView = new Float32Array(buffer);
        const intView = new Uint32Array(buffer);
        
        floatView[0] = number;
        intView[0] = 0x5f3759df - (intView[0] >> 1);
        floatView[0] = floatView[0] * (1.5 - 0.5 * number * floatView[0] * floatView[0]);
        
        return floatView[0];
    }

    /**
     * Vector array operations for performance
     */
    static addArrays(a, b, result) {
        result[0] = a[0] + b[0];
        result[1] = a[1] + b[1];
        result[2] = a[2] + b[2];
        return result;
    }

    static multiplyArray(a, scalar, result) {
        result[0] = a[0] * scalar;
        result[1] = a[1] * scalar;
        result[2] = a[2] * scalar;
        return result;
    }

    static magnitudeArray(a) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    }

    /**
     * Constants for common calculations
     */
    static get EARTH_MASS() { return 5.972e24; }
    static get SOLAR_MASS() { return 1.989e30; }
    static get AU() { return 1.496e11; } // Astronomical Unit
    static get LIGHT_YEAR() { return 9.461e15; }
    static get GRAVITATIONAL_CONSTANT() { return 6.67430e-11; }
}

// Export for use in other modules
window.MathUtils = MathUtils;
