/**
 * Renderer - Three.js rendering system for the 3-body simulation
 * Handles scene setup, camera controls, and rendering pipeline
 */

class Renderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Camera settings
        this.cameraSettings = {
            fov: 75,
            near: 0.1,
            far: 10000,
            position: { x: 0, y: 0, z: 50 },
            target: { x: 0, y: 0, z: 0 }
        };
        
        // Renderer settings
        this.rendererSettings = {
            antialiasing: true,
            shadows: true,
            pixelRatio: window.devicePixelRatio || 1
        };
        
        // Controls
        this.mouseControls = {
            isMouseDown: false,
            lastMouseX: 0,
            lastMouseY: 0,
            sensitivity: 0.01
        };
        
        // Scene objects
        this.bodies = new Map();
        this.trails = new Map();
    }

    /**
     * Initialize the renderer
     */
    async init() {
        try {
            // Create scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0a0a2a);
            
            // Create camera
            this.camera = new THREE.PerspectiveCamera(
                this.cameraSettings.fov,
                window.innerWidth / window.innerHeight,
                this.cameraSettings.near,
                this.cameraSettings.far
            );
            
            this.camera.position.set(
                this.cameraSettings.position.x,
                this.cameraSettings.position.y,
                this.cameraSettings.position.z
            );
            
            // Create renderer
            this.renderer = new THREE.WebGLRenderer({
                antialias: this.rendererSettings.antialiasing,
                alpha: true,
                powerPreference: "high-performance"
            });
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(this.rendererSettings.pixelRatio);
            this.renderer.shadowMap.enabled = this.rendererSettings.shadows;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.outputEncoding = THREE.sRGBEncoding;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.2;
            
            // Add renderer to DOM
            const container = document.getElementById('canvas-container');
            container.appendChild(this.renderer.domElement);
            
            // Setup controls
            this.setupControls();
            
            // Setup scene
            this.setupScene();
            
            return true;
            
        } catch (error) {
            console.error('Failed to initialize renderer:', error);
            throw error;
        }
    }

    /**
     * Setup camera controls
     */
    setupControls() {
        // Simple orbit controls
        this.controls = {
            rotation: { x: 0, y: 0 },
            distance: 50,
            target: { x: 0, y: 0, z: 0 },
            
            update: () => {
                const x = this.controls.distance * Math.cos(this.controls.rotation.y) * Math.cos(this.controls.rotation.x);
                const y = this.controls.distance * Math.sin(this.controls.rotation.x);
                const z = this.controls.distance * Math.sin(this.controls.rotation.y) * Math.cos(this.controls.rotation.x);
                
                this.camera.position.set(x, y, z);
                this.camera.lookAt(
                    this.controls.target.x,
                    this.controls.target.y,
                    this.controls.target.z
                );
            }
        };
        
        this.controls.update();
    }

    /**
     * Setup scene elements
     */
    setupScene() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = this.rendererSettings.shadows;
        if (this.rendererSettings.shadows) {
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 500;
        }
        this.scene.add(directionalLight);
        
        // Add star field background
        this.createStarField();
    }

    /**
     * Create star field background
     */
    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 10000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Random position in a sphere
            const radius = 1000 + Math.random() * 2000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Random star color
            const color = new THREE.Color();
            color.setHSL(Math.random(), 0.2, 0.8 + Math.random() * 0.2);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const starField = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(starField);
    }

    /**
     * Add a body to the scene
     */
    addBody(body) {
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(body.radius, 32, 32);
        
        // Create material with glow effect
        const material = new THREE.MeshPhongMaterial({
            color: body.color,
            emissive: body.color,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.9
        });
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(body.position.x, body.position.y, body.position.z);
        mesh.castShadow = this.rendererSettings.shadows;
        mesh.receiveShadow = this.rendererSettings.shadows;
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(body.radius * 1.2, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: body.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glowMesh);
        
        // Store reference
        this.bodies.set(body.id, mesh);
        this.scene.add(mesh);
        
        return mesh;
    }

    /**
     * Update body position and appearance
     */
    updateBody(body) {
        const mesh = this.bodies.get(body.id);
        if (!mesh) {
            this.addBody(body);
            return;
        }
        
        // Update position
        mesh.position.set(body.position.x, body.position.y, body.position.z);
        
        // Update color based on velocity
        const speed = MathUtils.magnitude(body.velocity);
        const maxSpeed = 1000; // Adjust based on your simulation
        const colorIntensity = MathUtils.clamp(speed / maxSpeed, 0, 1);
        
        const material = mesh.material;
        const color = new THREE.Color(body.color);
        color.multiplyScalar(1 + colorIntensity * 0.5);
        material.color = color;
        material.emissive = color;
        material.emissiveIntensity = 0.2 + colorIntensity * 0.3;
        
        // Update glow
        const glowMesh = mesh.children[0];
        if (glowMesh) {
            glowMesh.material.color = color;
            glowMesh.material.opacity = 0.3 + colorIntensity * 0.2;
        }
    }

    /**
     * Remove body from scene
     */
    removeBody(bodyId) {
        const mesh = this.bodies.get(bodyId);
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.bodies.delete(bodyId);
        }
    }

    /**
     * Update trail for a body
     */
    updateTrail(body) {
        if (body.trail.length < 2) return;
        
        // Remove old trail
        const oldTrail = this.trails.get(body.id);
        if (oldTrail) {
            this.scene.remove(oldTrail);
            oldTrail.geometry.dispose();
            oldTrail.material.dispose();
        }
        
        // Create new trail
        const trailGeometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        for (let i = 0; i < body.trail.length; i++) {
            const point = body.trail[i];
            const alpha = i / body.trail.length;
            
            positions.push(point.x, point.y, point.z);
            
            const color = new THREE.Color(body.color);
            color.multiplyScalar(0.5 + alpha * 0.5);
            colors.push(color.r, color.g, color.b);
        }
        
        trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const trailMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });
        
        const trail = new THREE.Line(trailGeometry, trailMaterial);
        this.trails.set(body.id, trail);
        this.scene.add(trail);
    }

    /**
     * Render the scene
     */
    render() {
        if (!this.renderer || !this.scene || !this.camera) return;
        
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Handle window resize
     */
    resize() {
        if (!this.camera || !this.renderer) return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    /**
     * Handle mouse events for camera controls
     */
    handleMouseDown(event) {
        this.mouseControls.isMouseDown = true;
        this.mouseControls.lastMouseX = event.clientX;
        this.mouseControls.lastMouseY = event.clientY;
    }

    handleMouseMove(event) {
        if (!this.mouseControls.isMouseDown) return;
        
        const deltaX = event.clientX - this.mouseControls.lastMouseX;
        const deltaY = event.clientY - this.mouseControls.lastMouseY;
        
        this.controls.rotation.y += deltaX * this.mouseControls.sensitivity;
        this.controls.rotation.x += deltaY * this.mouseControls.sensitivity;
        
        // Clamp vertical rotation
        this.controls.rotation.x = MathUtils.clamp(this.controls.rotation.x, -Math.PI/2, Math.PI/2);
        
        this.controls.update();
        
        this.mouseControls.lastMouseX = event.clientX;
        this.mouseControls.lastMouseY = event.clientY;
    }

    handleMouseUp(event) {
        this.mouseControls.isMouseDown = false;
    }

    handleWheel(event) {
        const delta = event.deltaY * 0.001;
        this.controls.distance += delta;
        this.controls.distance = MathUtils.clamp(this.controls.distance, 10, 200);
        this.controls.update();
    }

    /**
     * Handle touch events for mobile
     */
    handleTouchStart(event) {
        if (event.touches.length === 1) {
            this.mouseControls.isMouseDown = true;
            this.mouseControls.lastMouseX = event.touches[0].clientX;
            this.mouseControls.lastMouseY = event.touches[0].clientY;
        }
    }

    handleTouchMove(event) {
        if (event.touches.length === 1 && this.mouseControls.isMouseDown) {
            const deltaX = event.touches[0].clientX - this.mouseControls.lastMouseX;
            const deltaY = event.touches[0].clientY - this.mouseControls.lastMouseY;
            
            this.controls.rotation.y += deltaX * this.mouseControls.sensitivity * 2;
            this.controls.rotation.x += deltaY * this.mouseControls.sensitivity * 2;
            
            this.controls.rotation.x = MathUtils.clamp(this.controls.rotation.x, -Math.PI/2, Math.PI/2);
            this.controls.update();
            
            this.mouseControls.lastMouseX = event.touches[0].clientX;
            this.mouseControls.lastMouseY = event.touches[0].clientY;
        }
    }

    handleTouchEnd(event) {
        this.mouseControls.isMouseDown = false;
    }

    /**
     * Set renderer settings
     */
    setAntialiasing(enabled) {
        this.rendererSettings.antialiasing = enabled;
        // Note: Changing antialiasing requires recreating the renderer
    }

    setShadows(enabled) {
        this.rendererSettings.shadows = enabled;
        this.renderer.shadowMap.enabled = enabled;
        
        // Update all meshes
        this.bodies.forEach(mesh => {
            mesh.castShadow = enabled;
            mesh.receiveShadow = enabled;
        });
    }

    /**
     * Focus camera on a specific body
     */
    focusOnBody(bodyId) {
        const body = this.bodies.get(bodyId);
        if (body) {
            this.controls.target = body.position;
            this.controls.update();
        }
    }

    /**
     * Reset camera to default position
     */
    resetCamera() {
        this.controls.rotation = { x: 0, y: 0 };
        this.controls.distance = 50;
        this.controls.target = { x: 0, y: 0, z: 0 };
        this.controls.update();
    }

    /**
     * Get camera information
     */
    getCameraInfo() {
        return {
            position: this.camera.position,
            target: this.controls.target,
            distance: this.controls.distance,
            rotation: this.controls.rotation
        };
    }

    /**
     * Clean up resources
     */
    dispose() {
        // Dispose of all geometries and materials
        this.bodies.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        
        this.trails.forEach(trail => {
            trail.geometry.dispose();
            trail.material.dispose();
        });
        
        this.bodies.clear();
        this.trails.clear();
        
        // Dispose of renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Export for use in other modules
window.Renderer = Renderer;
