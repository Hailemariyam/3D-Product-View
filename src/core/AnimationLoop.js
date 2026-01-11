/**
 * AnimationLoop - Uses renderer.setAnimationLoop for optimal performance.
 *
 * Why setAnimationLoop over manual requestAnimationFrame?
 * - Automatically handles WebXR sessions
 * - Properly pauses when tab is hidden
 * - Integrated with Three.js render pipeline
 * - Cleaner API for start/stop
 */
export class AnimationLoop {
    constructor(renderer) {
        this.renderer = renderer;
        this.callbacks = [];
        this.isRunning = false;
        this.clock = null;
    }

    addCallback(callback) {
        this.callbacks.push(callback);
    }

    removeCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) this.callbacks.splice(index, 1);
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = performance.now();

        this.renderer.setAnimationLoop((time) => {
            const deltaTime = (time - this.lastTime) / 1000;
            this.lastTime = time;

            // Cap delta to prevent huge jumps after tab switch
            const cappedDelta = Math.min(deltaTime, 0.1);

            for (const callback of this.callbacks) {
                callback(cappedDelta, time);
            }
        });
    }

    stop() {
        this.isRunning = false;
        this.renderer.setAnimationLoop(null);
    }
}
