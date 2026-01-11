import * as THREE from 'three';

/**
 * SceneManager - Central scene graph management.
 *
 * Responsibilities:
 * - Scene creation and configuration
 * - Object addition/removal
 * - Mesh traversal for raycasting
 */
export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    getScene() {
        return this.scene;
    }

    setEnvironment(envMap) {
        this.scene.environment = envMap;
    }

    setBackground(background) {
        this.scene.background = background;
    }

    getMeshes() {
        const meshes = [];
        this.scene.traverse((child) => {
            if (child.isMesh && child.userData.interactive !== false) {
                meshes.push(child);
            }
        });
        return meshes;
    }

    getObjectByName(name) {
        return this.scene.getObjectByName(name);
    }
}
