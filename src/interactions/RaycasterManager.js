import * as THREE from 'three';

/**
 * RaycasterManager - Low-level raycasting utilities.
 *
 * Separated from interaction logic for:
 * - Reusability across different interaction types
 * - Easier testing
 * - Performance optimization (single raycaster instance)
 */
export class RaycasterManager {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    updateMousePosition(event, domElement) {
        const rect = domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    setFromCamera(camera) {
        this.raycaster.setFromCamera(this.mouse, camera);
    }

    intersectObjects(objects, recursive = false) {
        return this.raycaster.intersectObjects(objects, recursive);
    }

    getFirstIntersection(objects, recursive = false) {
        const intersects = this.intersectObjects(objects, recursive);
        return intersects.length > 0 ? intersects[0] : null;
    }
}
