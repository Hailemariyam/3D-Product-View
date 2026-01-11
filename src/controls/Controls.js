import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Controls - OrbitControls wrapper with product-viewer optimizations.
 *
 * Constraints prevent disorienting camera angles while
 * maintaining smooth, intuitive interaction.
 */
export class Controls {
    constructor(camera, domElement) {
        this.controls = new OrbitControls(camera, domElement);

        this.configure();
    }

    configure() {
        const { controls } = this;

        // Smooth damping for professional feel
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Zoom constraints
        controls.minDistance = 2;
        controls.maxDistance = 12;

        // Vertical rotation limits (prevent going under the ground)
        controls.minPolarAngle = Math.PI * 0.1;
        controls.maxPolarAngle = Math.PI * 0.85;

        // Smooth interaction speeds
        controls.rotateSpeed = 0.8;
        controls.zoomSpeed = 1.0;
        controls.panSpeed = 0.8;

        // Disable panning for focused product view
        controls.enablePan = false;

        // Auto-rotate (disabled by default)
        controls.autoRotate = false;
        controls.autoRotateSpeed = 0.5;
    }

    update() {
        this.controls.update();
    }

    setTarget(x, y, z) {
        this.controls.target.set(x, y, z);
    }

    enableAutoRotate(enabled) {
        this.controls.autoRotate = enabled;
    }

    enable(enabled) {
        this.controls.enabled = enabled;
    }

    dispose() {
        this.controls.dispose();
    }
}
