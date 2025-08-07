/**
 * ParticleSystem - Particle effects for the simulation
 */

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 1000;
        this.density = 1.0;
        
        // Particle geometry and material
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
        
        this.updateGeometry();
    }

    update(deltaTime) {
        // Update particle positions
        for (let particle of this.particles) {
            particle.life -= deltaTime;
            if (particle.life <= 0) {
                this.removeParticle(particle);
            } else {
                particle.position.x += particle.velocity.x * deltaTime;
                particle.position.y += particle.velocity.y * deltaTime;
                particle.position.z += particle.velocity.z * deltaTime;
            }
        }
        
        this.updateGeometry();
    }

    addParticle(position, velocity, color, life = 3.0) {
        if (this.particles.length >= this.maxParticles) return;
        
        const particle = {
            position: { ...position },
            velocity: { ...velocity },
            color: color || 0xffffff,
            life: life,
            maxLife: life
        };
        
        this.particles.push(particle);
    }

    removeParticle(particle) {
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
        }
    }

    updateGeometry() {
        const positions = new Float32Array(this.particles.length * 3);
        const colors = new Float32Array(this.particles.length * 3);
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const i3 = i * 3;
            
            positions[i3] = particle.position.x;
            positions[i3 + 1] = particle.position.y;
            positions[i3 + 2] = particle.position.z;
            
            const color = new THREE.Color(particle.color);
            const alpha = particle.life / particle.maxLife;
            color.multiplyScalar(alpha);
            
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    setMaxParticles(count) {
        this.maxParticles = count;
    }

    setDensity(density) {
        this.density = density;
    }

    reset() {
        this.particles = [];
        this.updateGeometry();
    }
}

window.ParticleSystem = ParticleSystem;
