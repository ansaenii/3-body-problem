/**
 * Main Application - Cosmic 3-Body Problem Simulation
 * Coordinates all modules and handles the main game loop
 */

class CosmicSimulation {
    constructor() {
        this.isInitialized = false;
        this.isRunning = false;
        this.isPaused = false;
        
        // Core systems
        this.physicsEngine = null;
        this.renderer = null;
        this.particleSystem = null;
        this.trailRenderer = null;
        this.lighting = null;
        this.postProcessing = null;
        
        // UI systems
        this.controls = null;
        this.presets = null;
        this.infoPanel = null;
        
        // Performance monitoring
        this.performance = null;
        this.stats = null;
        
        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.totalTime = 0;
        
        // Settings
        this.settings = {
            timeScale: 1.0,
            trailLength: 300,
            particleDensity: 1.0,
            glowIntensity: 1.0,
            quality: 'high' // 'low', 'medium', 'high', 'ultra'
        };
        
        this.init();
    }

    /**
     * Initialize the simulation
     */
    async init() {
        try {
            this.showLoadingProgress(0.1, 'Initializing core systems...');
            
            // Initialize performance monitoring
            this.performance = new Performance();
            this.stats = new Stats();
            this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb
            document.body.appendChild(this.stats.dom);
            this.stats.dom.style.position = 'absolute';
            this.stats.dom.style.top = '10px';
            this.stats.dom.style.left = '10px';
            this.stats.dom.style.zIndex = '1000';
            
            this.showLoadingProgress(0.2, 'Setting up physics engine...');
            
            // Initialize physics engine
            this.physicsEngine = new PhysicsEngine();
            
            this.showLoadingProgress(0.3, 'Initializing renderer...');
            
            // Initialize renderer
            this.renderer = new Renderer();
            await this.renderer.init();
            
            this.showLoadingProgress(0.4, 'Setting up particle systems...');
            
            // Initialize particle systems
            this.particleSystem = new ParticleSystem(this.renderer.scene);
            this.trailRenderer = new TrailRenderer(this.renderer.scene);
            this.lighting = new Lighting(this.renderer.scene);
            this.postProcessing = new PostProcessing(this.renderer.renderer);
            
            this.showLoadingProgress(0.5, 'Configuring lighting...');
            
            // Setup lighting
            this.lighting.setup();
            
            this.showLoadingProgress(0.6, 'Initializing UI controls...');
            
            // Initialize UI systems
            this.controls = new Controls(this);
            this.presets = new Presets(this);
            this.infoPanel = new InfoPanel(this);
            
            this.showLoadingProgress(0.7, 'Loading presets...');
            
            // Load initial preset
            this.presets.loadPreset('figure8');
            
            this.showLoadingProgress(0.8, 'Setting up event handlers...');
            
            // Setup event handlers
            this.setupEventHandlers();
            
            this.showLoadingProgress(0.9, 'Finalizing initialization...');
            
            // Final setup
            this.setupResizeHandler();
            this.setupKeyboardControls();
            
            this.showLoadingProgress(1.0, 'Ready!');
            
            // Hide loading screen and start
            setTimeout(() => {
                this.hideLoadingScreen();
                this.start();
            }, 500);
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Failed to initialize simulation:', error);
            this.showError('Failed to initialize simulation. Please refresh the page.');
        }
    }

    /**
     * Start the simulation
     */
    start() {
        if (!this.isInitialized) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        
        this.animate();
    }

    /**
     * Stop the simulation
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Pause/unpause the simulation
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? '▶️ Play' : '⏸️ Pause';
        }
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.totalTime += this.deltaTime;
        this.lastTime = currentTime;
        
        // Update stats
        this.stats.begin();
        
        if (!this.isPaused) {
            // Update physics
            this.physicsEngine.update(this.deltaTime);
            
            // Update particle systems
            this.particleSystem.update(this.deltaTime);
            this.trailRenderer.update(this.deltaTime);
            
            // Update lighting
            this.lighting.update(this.deltaTime);
            
            // Update UI
            this.infoPanel.update();
            this.controls.update();
        }
        
        // Update performance monitoring
        this.performance.updateStats(this.deltaTime * 1000, this.renderer.renderer);
        
        // Render scene
        this.renderer.render();
        
        // Update stats
        this.stats.end();
        
        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }

    /**
     * Reset the simulation
     */
    reset() {
        this.physicsEngine.reset();
        this.particleSystem.reset();
        this.trailRenderer.reset();
        this.totalTime = 0;
        
        // Reload current preset
        this.presets.reloadCurrentPreset();
    }

    /**
     * Update simulation settings
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // Apply settings to systems
        if (this.physicsEngine) {
            this.physicsEngine.setTimeScale(this.settings.timeScale);
        }
        
        if (this.trailRenderer) {
            this.trailRenderer.setMaxTrailLength(this.settings.trailLength);
        }
        
        if (this.particleSystem) {
            this.particleSystem.setDensity(this.settings.particleDensity);
        }
        
        if (this.lighting) {
            this.lighting.setGlowIntensity(this.settings.glowIntensity);
        }
        
        // Update quality settings
        this.updateQualitySettings();
    }

    /**
     * Update quality settings
     */
    updateQualitySettings() {
        const qualitySettings = {
            low: {
                particleCount: 100,
                trailLength: 100,
                postProcessing: false,
                shadows: false,
                antialiasing: false
            },
            medium: {
                particleCount: 500,
                trailLength: 200,
                postProcessing: true,
                shadows: false,
                antialiasing: true
            },
            high: {
                particleCount: 1000,
                trailLength: 300,
                postProcessing: true,
                shadows: true,
                antialiasing: true
            },
            ultra: {
                particleCount: 2000,
                trailLength: 500,
                postProcessing: true,
                shadows: true,
                antialiasing: true
            }
        };
        
        const settings = qualitySettings[this.settings.quality];
        
        if (this.particleSystem) {
            this.particleSystem.setMaxParticles(settings.particleCount);
        }
        
        if (this.trailRenderer) {
            this.trailRenderer.setMaxTrailLength(settings.trailLength);
        }
        
        if (this.postProcessing) {
            this.postProcessing.setEnabled(settings.postProcessing);
        }
        
        if (this.renderer) {
            this.renderer.setShadows(settings.shadows);
            this.renderer.setAntialiasing(settings.antialiasing);
        }
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse events
        window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        window.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Touch events for mobile
        window.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        window.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        window.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (this.renderer) {
            this.renderer.resize();
        }
    }

    /**
     * Handle keyboard input
     */
    handleKeyDown(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePause();
                break;
            case 'KeyR':
                event.preventDefault();
                this.reset();
                break;
            case 'KeyC':
                event.preventDefault();
                this.takeScreenshot();
                break;
            case 'Escape':
                event.preventDefault();
                this.togglePause();
                break;
        }
    }

    handleKeyUp(event) {
        // Handle key up events if needed
    }

    /**
     * Handle mouse events
     */
    handleMouseDown(event) {
        if (this.renderer) {
            this.renderer.handleMouseDown(event);
        }
    }

    handleMouseMove(event) {
        if (this.renderer) {
            this.renderer.handleMouseMove(event);
        }
    }

    handleMouseUp(event) {
        if (this.renderer) {
            this.renderer.handleMouseUp(event);
        }
    }

    handleWheel(event) {
        if (this.renderer) {
            this.renderer.handleWheel(event);
        }
    }

    /**
     * Handle touch events
     */
    handleTouchStart(event) {
        if (this.renderer) {
            this.renderer.handleTouchStart(event);
        }
    }

    handleTouchMove(event) {
        if (this.renderer) {
            this.renderer.handleTouchMove(event);
        }
    }

    handleTouchEnd(event) {
        if (this.renderer) {
            this.renderer.handleTouchEnd(event);
        }
    }

    /**
     * Setup resize handler
     */
    setupResizeHandler() {
        const resizeObserver = new ResizeObserver(() => {
            this.handleResize();
        });
        
        resizeObserver.observe(document.body);
    }

    /**
     * Setup keyboard controls
     */
    setupKeyboardControls() {
        // Add keyboard shortcuts help
        const helpText = `
            Keyboard Shortcuts:
            Space - Pause/Resume
            R - Reset
            C - Screenshot
            ESC - Pause
        `;
        
        // Could add a help overlay here
    }

    /**
     * Take a screenshot
     */
    takeScreenshot() {
        if (this.renderer) {
            const canvas = this.renderer.renderer.domElement;
            const link = document.createElement('a');
            link.download = `cosmic-3body-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    }

    /**
     * Show loading progress
     */
    showLoadingProgress(progress, text) {
        const progressBar = document.querySelector('.loading-progress');
        const loadingText = document.querySelector('.loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress * 100}%`;
        }
        
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = `Error: ${message}`;
            loadingText.style.color = '#ef4444';
        }
    }

    /**
     * Get simulation statistics
     */
    getStats() {
        const physicsStats = this.physicsEngine ? this.physicsEngine.getStats() : {};
        const performanceStats = this.performance ? this.performance.getStats() : {};
        
        return {
            physics: physicsStats,
            performance: performanceStats,
            settings: this.settings,
            time: this.totalTime,
            isPaused: this.isPaused
        };
    }

    /**
     * Get bodies for rendering
     */
    getBodies() {
        return this.physicsEngine ? this.physicsEngine.getBodies() : [];
    }

    /**
     * Get current preset
     */
    getCurrentPreset() {
        return this.presets ? this.presets.getCurrentPreset() : null;
    }

    /**
     * Set time scale
     */
    setTimeScale(scale) {
        this.settings.timeScale = scale;
        if (this.physicsEngine) {
            this.physicsEngine.setTimeScale(scale);
        }
    }

    /**
     * Set trail length
     */
    setTrailLength(length) {
        this.settings.trailLength = length;
        if (this.trailRenderer) {
            this.trailRenderer.setMaxTrailLength(length);
        }
    }

    /**
     * Set particle density
     */
    setParticleDensity(density) {
        this.settings.particleDensity = density;
        if (this.particleSystem) {
            this.particleSystem.setDensity(density);
        }
    }

    /**
     * Set glow intensity
     */
    setGlowIntensity(intensity) {
        this.settings.glowIntensity = intensity;
        if (this.lighting) {
            this.lighting.setGlowIntensity(intensity);
        }
    }
}

// Initialize the simulation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cosmicSimulation = new CosmicSimulation();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.cosmicSimulation) {
        if (document.hidden) {
            window.cosmicSimulation.isPaused = true;
        } else {
            window.cosmicSimulation.isPaused = false;
        }
    }
});

// Handle beforeunload
window.addEventListener('beforeunload', () => {
    if (window.cosmicSimulation) {
        window.cosmicSimulation.stop();
    }
});
