import * as THREE from 'three';

/**
 * RendererManager - Production-grade WebGL renderer configuration.
 *
 * Key decisions:
 * - sRGB output for correct color display
 * - Pixel ratio capped at 2 (4K would be 4x GPU cost for minimal gain)
 * - PCFSoftShadowMap for quality soft shadows
 * - ACESFilmic tone mapping for cinematic look
 * - physicallyCorrectLights for realistic light falloff
 */
export class RendererManager {
    constructor(container) {
        this.container = container;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false // Disable if not using stencil buffer
        });

        this.configure();
        container.appendChild(this.renderer.domElement);
    }

    configure() {
        const { renderer } = this;

        // Color space for accurate color reproduction
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        // Pixel ratio: cap at 2 for performance
        // devicePixelRatio 3 = 9x pixels vs 1, diminishing returns
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(this.container.clientWidth, this.container.clientHeight);

        // Shadow configuration
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Tone mapping for HDR → SDR conversion
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;

        // Enable physically correct lighting (inverse square falloff)
        renderer.useLegacyLights = false;
    }

    getRenderer() {
        return this.renderer;
    }

    getDomElement() {
        return this.renderer.domElement;
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    getInfo() {
        return this.renderer.info;
    }

    dispose() {
        this.renderer.dispose();
    }
}
