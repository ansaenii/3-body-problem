/**
 * PostProcessing - Post-processing effects
 */

class PostProcessing {
    constructor(renderer) {
        this.renderer = renderer;
        this.enabled = true;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

window.PostProcessing = PostProcessing;
