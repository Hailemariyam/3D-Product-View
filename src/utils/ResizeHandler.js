/**
 * ResizeHandler - Responsive canvas management with debouncing.
 *
 * Debouncing prevents excessive recalculations during
 * continuous resize events (like dragging window edge).
 */
export class ResizeHandler {
    constructor(container, cameraManager, rendererManager) {
        this.container = container;
        this.cameraManager = cameraManager;
        this.rendererManager = rendererManager;
        this.resizeTimeout = null;

        this.boundHandler = this.onResize.bind(this);
        window.addEventListener('resize', this.boundHandler);

        // Initial size
        this.onResize();
    }

    onResize() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        this.resizeTimeout = setTimeout(() => {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;

            this.cameraManager.updateAspect(width, height);
            this.rendererManager.setSize(width, height);
        }, 100);
    }

    dispose() {
        window.removeEventListener('resize', this.boundHandler);
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
    }
}
