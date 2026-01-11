import * as THREE from 'three';
import gsap from 'gsap';

/**
 * CameraManager - Camera setup with GSAP-powered intro animation.
 *
 * Features:
 * - Perspective camera with sensible defaults
 * - Smooth intro animation from dramatic angle
 * - Auto-focus on model bounding box
 */
export class CameraManager {
    constructor(container) {
        const aspect = container.clientWidth / container.clientHeight;

        this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);

        // Start position for intro animation (will animate to final position)
        this.camera.position.set(8, 6, 12);
        this.camera.lookAt(0, 0, 0);

        this.introComplete = false;
    }

    getCamera() {
        return this.camera;
    }

    updateAspect(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Smooth intro animation using GSAP
     */
    playIntroAnimation(targetPosition, lookAtTarget, onComplete) {
        const { camera } = this;

        // Animate camera position
        gsap.to(camera.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 2.5,
            ease: 'power3.inOut',
            onUpdate: () => {
                camera.lookAt(lookAtTarget);
            },
            onComplete: () => {
                this.introComplete = true;
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * Calculate optimal camera position to frame a model
     */
    frameObject(object, controls) {
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        let distance = maxDim / (2 * Math.tan(fov / 2));
        distance *= 1.5; // Add some padding

        const targetPosition = new THREE.Vector3(
            center.x + distance * 0.5,
            center.y + distance * 0.3,
            center.z + distance
        );

        if (controls) {
            controls.target.copy(center);
        }

        return { position: targetPosition, target: center };
    }
}
