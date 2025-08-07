/**
 * Performance - Performance monitoring and optimization utilities
 * Tracks FPS, memory usage, GPU performance, and provides optimization suggestions
 */

class Performance {
    constructor() {
        this.stats = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            gpuUsage: 0,
            cpuUsage: 0,
            particleCount: 0,
            drawCalls: 0,
            triangles: 0
        };

        this.history = {
            fps: [],
            memory: [],
            gpu: [],
            cpu: []
        };

        this.maxHistoryLength = 60; // Keep 60 frames of history
        
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        // Performance thresholds
        this.thresholds = {
            fps: { low: 30, medium: 45, high: 60 },
            memory: { low: 0.3, medium: 0.6, high: 0.8 },
            gpu: { low: 0.5, medium: 0.7, high: 0.9 },
            cpu: { low: 0.5, medium: 0.7, high: 0.9 }
        };

        // Performance monitoring
        this.monitoring = {
            enabled: true,
            interval: 1000, // Update every second
            lastUpdate: 0
        };

        this.initPerformanceMonitoring();
    }

    /**
     * Initialize performance monitoring
     */
    initPerformanceMonitoring() {
        // Check if performance monitoring is supported
        if ('performance' in window && 'memory' in performance) {
            this.memorySupported = true;
        }

        // Check for WebGL support and capabilities
        this.checkWebGLSupport();
    }

    /**
     * Check WebGL support and capabilities
     */
    checkWebGLSupport() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
            this.webglSupported = true;
            this.webglInfo = {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
                maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)
            };
        } else {
            this.webglSupported = false;
            console.warn('WebGL not supported');
        }
    }

    /**
     * Update performance statistics
     */
    updateStats(deltaTime, renderer = null) {
        const currentTime = performance.now();
        
        // Update frame timing
        this.stats.frameTime = deltaTime;
        this.frameCount++;
        
        // Calculate FPS
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.stats.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
            
            // Add to history
            this.addToHistory('fps', this.stats.fps);
        }

        // Update memory usage
        if (this.memorySupported) {
            const memory = performance.memory;
            this.stats.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
            this.addToHistory('memory', this.stats.memoryUsage);
        }

        // Update GPU usage (estimated)
        if (renderer && renderer.info) {
            this.stats.drawCalls = renderer.info.render.calls;
            this.stats.triangles = renderer.info.render.triangles;
            
            // Estimate GPU usage based on draw calls and triangles
            this.stats.gpuUsage = Math.min(1, (this.stats.drawCalls / 1000 + this.stats.triangles / 100000));
            this.addToHistory('gpu', this.stats.gpuUsage);
        }

        // Estimate CPU usage based on frame time
        const targetFrameTime = 1000 / 60; // 60 FPS target
        this.stats.cpuUsage = Math.min(1, this.stats.frameTime / targetFrameTime);
        this.addToHistory('cpu', this.stats.cpuUsage);

        // Update monitoring
        if (this.monitoring.enabled && currentTime - this.monitoring.lastUpdate >= this.monitoring.interval) {
            this.updatePerformanceMonitoring();
            this.monitoring.lastUpdate = currentTime;
        }
    }

    /**
     * Add value to history
     */
    addToHistory(type, value) {
        if (!this.history[type]) {
            this.history[type] = [];
        }
        
        this.history[type].push(value);
        
        // Keep only the last N values
        if (this.history[type].length > this.maxHistoryLength) {
            this.history[type].shift();
        }
    }

    /**
     * Get average value from history
     */
    getAverage(type) {
        if (!this.history[type] || this.history[type].length === 0) {
            return 0;
        }
        
        const sum = this.history[type].reduce((a, b) => a + b, 0);
        return sum / this.history[type].length;
    }

    /**
     * Get performance status
     */
    getPerformanceStatus() {
        const status = {
            fps: this.getStatusLevel(this.stats.fps, this.thresholds.fps),
            memory: this.getStatusLevel(this.stats.memoryUsage, this.thresholds.memory),
            gpu: this.getStatusLevel(this.stats.gpuUsage, this.thresholds.gpu),
            cpu: this.getStatusLevel(this.stats.cpuUsage, this.thresholds.cpu)
        };

        return status;
    }

    /**
     * Get status level (low, medium, high, critical)
     */
    getStatusLevel(value, thresholds) {
        if (value >= thresholds.high) return 'excellent';
        if (value >= thresholds.medium) return 'good';
        if (value >= thresholds.low) return 'fair';
        return 'poor';
    }

    /**
     * Get optimization suggestions
     */
    getOptimizationSuggestions() {
        const suggestions = [];
        const status = this.getPerformanceStatus();

        if (status.fps === 'poor') {
            suggestions.push('Reduce particle count or trail length');
            suggestions.push('Lower visual quality settings');
            suggestions.push('Close other applications');
        }

        if (status.memory === 'poor') {
            suggestions.push('Reduce trail length');
            suggestions.push('Clear browser cache');
            suggestions.push('Restart browser');
        }

        if (status.gpu === 'poor') {
            suggestions.push('Reduce glow intensity');
            suggestions.push('Disable post-processing effects');
            suggestions.push('Update graphics drivers');
        }

        if (status.cpu === 'poor') {
            suggestions.push('Reduce time scale');
            suggestions.push('Simplify physics calculations');
            suggestions.push('Close background applications');
        }

        return suggestions;
    }

    /**
     * Update performance monitoring display
     */
    updatePerformanceMonitoring() {
        // Update UI elements if they exist
        const fpsElement = document.getElementById('fps');
        const gpuElement = document.getElementById('gpuUsage');
        const cpuElement = document.getElementById('cpuUsage');
        const memoryElement = document.getElementById('memoryUsage');

        if (fpsElement) {
            fpsElement.textContent = this.stats.fps;
            fpsElement.style.color = this.getPerformanceColor(this.stats.fps, 60);
        }

        if (gpuElement) {
            const gpuPercent = Math.round(this.stats.gpuUsage * 100);
            gpuElement.style.width = `${gpuPercent}%`;
            gpuElement.style.backgroundColor = this.getPerformanceColor(this.stats.gpuUsage, 1);
        }

        if (cpuElement) {
            const cpuPercent = Math.round(this.stats.cpuUsage * 100);
            cpuElement.style.width = `${cpuPercent}%`;
            cpuElement.style.backgroundColor = this.getPerformanceColor(this.stats.cpuUsage, 1);
        }

        if (memoryElement) {
            const memoryPercent = Math.round(this.stats.memoryUsage * 100);
            memoryElement.style.width = `${memoryPercent}%`;
            memoryElement.style.backgroundColor = this.getPerformanceColor(this.stats.memoryUsage, 1);
        }
    }

    /**
     * Get color for performance indicators
     */
    getPerformanceColor(value, maxValue) {
        const normalized = MathUtils.clamp(value / maxValue, 0, 1);
        
        if (normalized < 0.5) return '#22c55e'; // Green
        if (normalized < 0.8) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    }

    /**
     * Get detailed performance report
     */
    getPerformanceReport() {
        return {
            current: this.stats,
            averages: {
                fps: this.getAverage('fps'),
                memory: this.getAverage('memory'),
                gpu: this.getAverage('gpu'),
                cpu: this.getAverage('cpu')
            },
            status: this.getPerformanceStatus(),
            suggestions: this.getOptimizationSuggestions(),
            system: {
                webglSupported: this.webglSupported,
                webglInfo: this.webglInfo,
                memorySupported: this.memorySupported
            }
        };
    }

    /**
     * Enable/disable performance monitoring
     */
    setMonitoringEnabled(enabled) {
        this.monitoring.enabled = enabled;
    }

    /**
     * Set monitoring interval
     */
    setMonitoringInterval(interval) {
        this.monitoring.interval = interval;
    }

    /**
     * Get memory usage in MB
     */
    getMemoryUsageMB() {
        if (this.memorySupported) {
            const memory = performance.memory;
            return {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
                percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
            };
        }
        return null;
    }

    /**
     * Check if performance is acceptable
     */
    isPerformanceAcceptable() {
        const status = this.getPerformanceStatus();
        return status.fps !== 'poor' && status.memory !== 'poor';
    }

    /**
     * Get performance score (0-100)
     */
    getPerformanceScore() {
        const fpsScore = MathUtils.clamp(this.stats.fps / 60, 0, 1) * 25;
        const memoryScore = MathUtils.clamp(1 - this.stats.memoryUsage, 0, 1) * 25;
        const gpuScore = MathUtils.clamp(1 - this.stats.gpuUsage, 0, 1) * 25;
        const cpuScore = MathUtils.clamp(1 - this.stats.cpuUsage, 0, 1) * 25;
        
        return Math.round(fpsScore + memoryScore + gpuScore + cpuScore);
    }

    /**
     * Benchmark performance
     */
    async benchmark(duration = 5000) {
        const startTime = performance.now();
        const measurements = [];
        
        return new Promise((resolve) => {
            const measure = () => {
                const currentTime = performance.now();
                const elapsed = currentTime - startTime;
                
                measurements.push({
                    time: elapsed,
                    fps: this.stats.fps,
                    memory: this.stats.memoryUsage,
                    gpu: this.stats.gpuUsage,
                    cpu: this.stats.cpuUsage
                });
                
                if (elapsed < duration) {
                    requestAnimationFrame(measure);
                } else {
                    resolve(this.analyzeBenchmark(measurements));
                }
            };
            
            requestAnimationFrame(measure);
        });
    }

    /**
     * Analyze benchmark results
     */
    analyzeBenchmark(measurements) {
        const avgFps = measurements.reduce((sum, m) => sum + m.fps, 0) / measurements.length;
        const avgMemory = measurements.reduce((sum, m) => sum + m.memory, 0) / measurements.length;
        const avgGpu = measurements.reduce((sum, m) => sum + m.gpu, 0) / measurements.length;
        const avgCpu = measurements.reduce((sum, m) => sum + m.cpu, 0) / measurements.length;
        
        return {
            duration: measurements[measurements.length - 1].time,
            samples: measurements.length,
            averages: {
                fps: Math.round(avgFps),
                memory: Math.round(avgMemory * 100) / 100,
                gpu: Math.round(avgGpu * 100) / 100,
                cpu: Math.round(avgCpu * 100) / 100
            },
            score: this.getPerformanceScore()
        };
    }
}

// Export for use in other modules
window.Performance = Performance;
