import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

/**
 * EnvironmentMap - HDR environment loading for realistic reflections.
 *
 * Why HDR environment maps?
 * - Provides realistic reflections on metallic/glossy surfaces
 * - Acts as image-based lighting (IBL) for natural illumination
 * - Single HDR can replace multiple lights for ambient lighting
 */
export class EnvironmentMap {
    constructor(assetManager) {
        this.assetManager = assetManager;
        this.loader = new RGBELoader(assetManager.getLoadingManager());
        this.pmremGenerator = null;
    }

    async load(renderer, url) {
        this.pmremGenerator = new THREE.PMREMGenerator(renderer);
        this.pmremGenerator.compileEquirectangularShader();

        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (texture) => {
                    const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
                    texture.dispose();
                    this.pmremGenerator.dispose();

                    this.assetManager.store('envMap', envMap);
                    resolve(envMap);
                },
                undefined,
                (error) => {
                    console.warn('HDR load failed, using fallback environment');
                    resolve(this.createFallbackEnvironment(renderer));
                }
            );
        });
    }

    /**
     * Create a procedural environment when no HDR is available
     */
    createFallbackEnvironment(renderer) {
        this.pmremGenerator = new THREE.PMREMGenerator(renderer);

        // Create a simple gradient environment
        const scene = new THREE.Scene();

        // Gradient background using a large sphere
        const geometry = new THREE.SphereGeometry(50, 32, 32);
        const material = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            uniforms: {
                topColor: { value: new THREE.Color(0x1a1a2e) },
                bottomColor: { value: new THREE.Color(0x0f0f1a) },
                offset: { value: 20 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `
        });

        const sky = new THREE.Mesh(geometry, material);
        scene.add(sky);

        // Add some ambient light sources for reflections
        const light1 = new THREE.PointLight(0x6366f1, 100, 100);
        light1.position.set(10, 10, 10);
        scene.add(light1);

        const light2 = new THREE.PointLight(0x8b5cf6, 80, 100);
        light2.position.set(-10, 5, -10);
        scene.add(light2);

        const envMap = this.pmremGenerator.fromScene(scene).texture;
        this.pmremGenerator.dispose();

        this.assetManager.store('envMap', envMap);
        return envMap;
    }

    dispose() {
        if (this.pmremGenerator) {
            this.pmremGenerator.dispose();
        }
    }
}
