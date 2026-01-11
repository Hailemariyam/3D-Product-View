/**
 * DebugPanel - Performance monitoring overlay.
 *
 * Displays real-time stats useful for optimization:
 * - FPS (frames per second)
 * - Draw calls (GPU batches)
 * - Triangle count
 *
 * Toggle with 'D' key in development.
 */
export class DebugPanel {
    constructor(renderer) {
        this.renderer = renderer;
        this.panel = document.getElementById('debug-panel');
        this.fpsElement = document.getElementById('debug-fps');
        this.drawsElement = document.getElementById('debug-draws');
        this.trisElement = document.getElementById('debug-tris');

        this.frames = 0;
        this.lastTime = performance.now();
        this.fps = 60;

        this.visible = false;
        this.setupKeyToggle();
    }

    setupKeyToggle() {
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.metaKey) {
                this.toggle();
            }
        });
    }

    toggle() {
        this.visible = !this.visible;
        if (this.panel) {
            this.panel.classList.toggle('visible', this.visible);
        }
    }

    update() {
        if (!this.visible) return;

        this.frames++;
        const now = performance.now();

        if (now - this.lastTime >= 1000) {
            this.fps = Math.round(this.frames * 1000 / (now - this.lastTime));
            this.frames = 0;
            this.lastTime = now;

            const info = this.renderer.info;

            if (this.fpsElement) this.fpsElement.textContent = this.fps;
            if (this.drawsElement) this.drawsElement.textContent = info.render.calls;
            if (this.trisElement) this.trisElement.textContent = info.render.triangles.toLocaleString();
        }
    }
}
