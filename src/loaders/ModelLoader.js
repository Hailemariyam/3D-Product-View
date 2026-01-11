import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class ModelLoader {
    constructor(assetManager) {
        this.assetManager = assetManager;
        this.loader = new GLTFLoader(assetManager.getLoadingManager());
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        this.loader.setDRACOLoader(this.dracoLoader);
    }

    async load(url, name = 'model') {
        return new Promise((resolve, reject) => {
            this.loader.load(url, (gltf) => {
                const model = gltf.scene;
                this.processModel(model);
                this.assetManager.store(name, model);
                resolve(model);
            }, undefined, (error) => {
                console.error('Model load failed:', url, error);
                reject(error);
            });
        });
    }

    processModel(model) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.userData.originalMaterial = child.material.clone();
                if (child.material.map) {
                    child.material.map.colorSpace = THREE.SRGBColorSpace;
                }
            }
        });
    }

    createFallbackModel(envMap) {
        const group = new THREE.Group();
        group.name = 'PremiumProduct';

        const bodyGeo = new THREE.CapsuleGeometry(0.5, 1.2, 32, 64);
        const bodyMat = new THREE.MeshPhysicalMaterial({
            color: 0x2a2a3a, metalness: 0.9, roughness: 0.1,
            envMap, envMapIntensity: 1.5, clearcoat: 1.0, clearcoatRoughness: 0.1
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.name = 'MainBody';
        body.rotation.z = Math.PI / 6;
        body.castShadow = true;
        body.receiveShadow = true;
        body.userData.originalMaterial = bodyMat.clone();
        body.userData.description = 'Premium aluminum body';
        group.add(body);

        const ringGeo = new THREE.TorusGeometry(0.55, 0.05, 32, 100);
        const ringMat = new THREE.MeshPhysicalMaterial({
            color: 0x6366f1, metalness: 1.0, roughness: 0.2, envMap, envMapIntensity: 2.0
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.name = 'AccentRing';
        ring.rotation.x = Math.PI / 2;
        ring.rotation.z = Math.PI / 6;
        ring.position.y = 0.3;
        ring.castShadow = true;
        ring.userData.originalMaterial = ringMat.clone();
        ring.userData.description = 'Anodized accent ring';
        group.add(ring);

        const lensGeo = new THREE.SphereGeometry(0.25, 64, 64);
        const lensMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff, metalness: 0, roughness: 0,
            transmission: 0.95, thickness: 0.5, envMap, envMapIntensity: 1.0, ior: 1.5
        });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.name = 'GlassLens';
        lens.position.set(0.35, 0.5, 0.35);
        lens.userData.originalMaterial = lensMat.clone();
        lens.userData.description = 'Sapphire crystal lens';
        group.add(lens);

        const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.08, 64);
        const baseMat = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a1a, metalness: 0.8, roughness: 0.3, envMap
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.name = 'DisplayBase';
        base.position.y = -1.0;
        base.receiveShadow = true;
        base.userData.originalMaterial = baseMat.clone();
        base.userData.description = 'Weighted display stand';
        group.add(base);

        const ledGeo = new THREE.SphereGeometry(0.06, 32, 32);
        const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.name = 'StatusLight';
        led.position.set(0.3, -0.2, 0.45);
        led.userData.originalMaterial = ledMat.clone();
        led.userData.description = 'Status indicator LED';
        group.add(led);

        return group;
    }

    dispose() {
        this.dracoLoader.dispose();
    }
}
