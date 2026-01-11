import * as THREE from 'three';

/**
 * Lights - Physically-based lighting setup.
 *
 * Three-point lighting approach:
 * - Key light: Main directional light with shadows
 * - Fill light: Softer light from opposite side
 * - Rim light: Back light for edge definition
 *
 * With HDR environment, these lights complement IBL rather than replace it.
 */
export class Lights {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];

        this.setup();
    }

    setup() {
        // Ambient light - low intensity since we have environment map
        const ambient = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambient);
        this.lights.push(ambient);

        // Key light - main shadow-casting light
        const keyLight = new THREE.DirectionalLight(0xffffff, 2);
        keyLight.position.set(5, 8, 5);
        keyLight.castShadow = true;

        // High-quality shadow settings
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 30;
        keyLight.shadow.camera.left = -10;
        keyLight.shadow.camera.right = 10;
        keyLight.shadow.camera.top = 10;
        keyLight.shadow.camera.bottom = -10;
        keyLight.shadow.bias = -0.0001;
        keyLight.shadow.normalBias = 0.02;
        keyLight.shadow.radius = 2; // Soft shadow edges

        this.scene.add(keyLight);
        this.lights.push(keyLight);
        this.keyLight = keyLight;

        // Fill light - softer, no shadows
        const fillLight = new THREE.DirectionalLight(0xb4c6fc, 0.8);
        fillLight.position.set(-5, 3, -3);
        this.scene.add(fillLight);
        this.lights.push(fillLight);

        // Rim light - back lighting for edge definition
        const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
        rimLight.position.set(0, 5, -8);
        this.scene.add(rimLight);
        this.lights.push(rimLight);
    }

    getKeyLight() {
        return this.keyLight;
    }

    dispose() {
        for (const light of this.lights) {
            this.scene.remove(light);
            if (light.dispose) light.dispose();
        }
    }
}
