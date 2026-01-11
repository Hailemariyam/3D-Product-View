import * as THREE from 'three';

/**
 * InteractionManager - Handles mouse/touch interaction via raycasting.
 * Provides hover and click detection with visual feedback.
 */
export class InteractionManager {
    constructor(camera, domElement, sceneManager) {
        this.camera = camera;
        this.domElement = domElement;
        this.sceneManager = sceneManager;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.hoveredObject = null;
        this.selectedObject = null;

        // Highlight material for hover effect
        this.highlightColor = new THREE.Color(0x00ff88);

        // UI element for displaying object info
        this.infoElement = document.getElementById('object-info');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.boundMouseMove = this.onMouseMove.bind(this);
        this.boundClick = this.onClick.bind(this);

        this.domElement.addEventListener('mousemove', this.boundMouseMove);
        this.domElement.addEventListener('click', this.boundClick);
    }

    updateMousePosition(event) {
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    onMouseMove(event) {
        this.updateMousePosition(event);
        this.checkIntersection();
    }

    onClick(event) {
        this.updateMousePosition(event);

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const meshes = this.sceneManager.getMeshes();
        const intersects = this.raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
            const clicked = intersects[0].object;
            console.log('Clicked:', clicked.name || 'Unnamed mesh');

            // Toggle selection
            if (this.selectedObject === clicked) {
                this.deselectObject();
            } else {
                this.selectObject(clicked);
            }
        } else {
            this.deselectObject();
        }
    }

    checkIntersection() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const meshes = this.sceneManager.getMeshes();
        const intersects = this.raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
            const intersected = intersects[0].object;

            if (this.hoveredObject !== intersected) {
                this.unhoverObject();
                this.hoverObject(intersected);
            }
        } else {
            this.unhoverObject();
        }
    }

    hoverObject(object) {
        if (object === this.selectedObject) return;

        this.hoveredObject = object;
        this.domElement.style.cursor = 'pointer';

        // Apply hover highlight
        if (object.material && !object.userData.isHighlighted) {
            object.userData.preHoverEmissive = object.material.emissive?.clone();
            if (object.material.emissive) {
                object.material.emissive.set(0x333333);
            }
        }

        // Update info panel
        this.showInfo(object.name || 'Mesh');
    }

    unhoverObject() {
        if (!this.hoveredObject) return;

        const object = this.hoveredObject;
        this.domElement.style.cursor = 'default';

        // Restore original emissive
        if (object.material && object.userData.preHoverEmissive) {
            object.material.emissive.copy(object.userData.preHoverEmissive);
        }

        this.hoveredObject = null;
        this.hideInfo();
    }

    selectObject(object) {
        this.deselectObject();

        this.selectedObject = object;
        object.userData.isHighlighted = true;

        // Apply selection highlight
        if (object.material.emissive) {
            object.material.emissive.copy(this.highlightColor);
            object.material.emissiveIntensity = 0.3;
        }

        this.showInfo(`Selected: ${object.name || 'Mesh'}`);
    }

    deselectObject() {
        if (!this.selectedObject) return;

        const object = this.selectedObject;
        object.userData.isHighlighted = false;

        // Restore original material properties
        if (object.userData.originalMaterial && object.material.emissive) {
            object.material.emissive.set(0x000000);
            object.material.emissiveIntensity = 1;
        }

        this.selectedObject = null;
        this.hideInfo();
    }

    showInfo(text) {
        if (this.infoElement) {
            this.infoElement.textContent = text;
            this.infoElement.classList.add('visible');
        }
    }

    hideInfo() {
        if (this.infoElement && !this.selectedObject) {
            this.infoElement.classList.remove('visible');
        }
    }

    dispose() {
        this.domElement.removeEventListener('mousemove', this.boundMouseMove);
        this.domElement.removeEventListener('click', this.boundClick);
    }
}
