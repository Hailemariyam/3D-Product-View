import * as THREE from 'three';
import gsap from 'gsap';
import { RaycasterManager } from './RaycasterManager.js';

/**
 * InteractionController - High-level interaction handling.
 *
 * Features:
 * - Hover detection with visual feedback
 * - Click selection with highlight effect
 * - Smooth GSAP-powered transitions
 * - UI overlay updates
 */
export class InteractionController {
    constructor(camera, domElement, sceneManager) {
        this.camera = camera;
        this.domElement = domElement;
        this.sceneManager = sceneManager;

        this.raycasterManager = new RaycasterManager();

        this.hoveredObject = null;
        this.selectedObject = null;

        // Visual feedback colors
        this.hoverEmissive = new THREE.Color(0x333344);
        this.selectEmissive = new THREE.Color(0x6366f1);

        // UI elements
        this.objectInfo = document.getElementById('object-info');
        this.objectName = this.objectInfo?.querySelector('.name');
        this.objectDesc = this.objectInfo?.querySelector('.description');

        this.setupEvents();
    }

    setupEvents() {
        this.boundMouseMove = this.onMouseMove.bind(this);
        this.boundClick = this.onClick.bind(this);
        this.boundMouseLeave = this.onMouseLeave.bind(this);

        this.domElement.addEventListener('mousemove', this.boundMouseMove);
        this.domElement.addEventListener('click', this.boundClick);
        this.domElement.addEventListener('mouseleave', this.boundMouseLeave);
    }

    onMouseMove(event) {
        this.raycasterManager.updateMousePosition(event, this.domElement);
        this.raycasterManager.setFromCamera(this.camera);

        const meshes = this.sceneManager.getMeshes();
        const intersection = this.raycasterManager.getFirstIntersection(meshes);

        if (intersection) {
            const object = intersection.object;
            if (this.hoveredObject !== object) {
                this.unhover();
                this.hover(object);
            }
        } else {
            this.unhover();
        }
    }

    onClick(event) {
        this.raycasterManager.updateMousePosition(event, this.domElement);
        this.raycasterManager.setFromCamera(this.camera);

        const meshes = this.sceneManager.getMeshes();
        const intersection = this.raycasterManager.getFirstIntersection(meshes);

        if (intersection) {
            const object = intersection.object;
            if (this.selectedObject === object) {
                this.deselect();
            } else {
                this.select(object);
            }
        } else {
            this.deselect();
        }
    }

    onMouseLeave() {
        this.unhover();
    }

    hover(object) {
        if (object === this.selectedObject) return;

        this.hoveredObject = object;
        this.domElement.style.cursor = 'pointer';

        // Apply hover effect
        if (object.material?.emissive) {
            object.userData.preHoverEmissive = object.material.emissive.clone();
            gsap.to(object.material.emissive, {
                r: this.hoverEmissive.r,
                g: this.hoverEmissive.g,
                b: this.hoverEmissive.b,
                duration: 0.2
            });
        }

        // Subtle scale effect
        gsap.to(object.scale, {
            x: 1.02,
            y: 1.02,
            z: 1.02,
            duration: 0.3,
            ease: 'power2.out'
        });

        this.showInfo(object);
    }

    unhover() {
        if (!this.hoveredObject) return;

        const object = this.hoveredObject;
        this.domElement.style.cursor = 'default';

        // Restore emissive
        if (object.material?.emissive && object.userData.preHoverEmissive) {
            gsap.to(object.material.emissive, {
                r: object.userData.preHoverEmissive.r,
                g: object.userData.preHoverEmissive.g,
                b: object.userData.preHoverEmissive.b,
                duration: 0.2
            });
        }

        // Restore scale
        gsap.to(object.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.3,
            ease: 'power2.out'
        });

        this.hoveredObject = null;

        if (!this.selectedObject) {
            this.hideInfo();
        }
    }

    select(object) {
        this.deselect();

        this.selectedObject = object;
        console.log('Selected:', object.name || 'Unnamed');

        // Apply selection highlight
        if (object.material?.emissive) {
            gsap.to(object.material.emissive, {
                r: this.selectEmissive.r,
                g: this.selectEmissive.g,
                b: this.selectEmissive.b,
                duration: 0.3
            });
        }

        // Pulse animation
        gsap.to(object.scale, {
            x: 1.05,
            y: 1.05,
            z: 1.05,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
        });

        this.showInfo(object, true);
    }

    deselect() {
        if (!this.selectedObject) return;

        const object = this.selectedObject;

        // Restore original emissive
        if (object.material?.emissive) {
            gsap.to(object.material.emissive, {
                r: 0,
                g: 0,
                b: 0,
                duration: 0.3
            });
        }

        this.selectedObject = null;
        this.hideInfo();
    }

    showInfo(object, isSelected = false) {
        if (!this.objectInfo) return;

        const name = object.name || 'Component';
        const desc = object.userData.description || (isSelected ? 'Selected' : 'Click to select');

        if (this.objectName) this.objectName.textContent = name;
        if (this.objectDesc) this.objectDesc.textContent = desc;

        this.objectInfo.classList.add('visible');
    }

    hideInfo() {
        if (this.objectInfo) {
            this.objectInfo.classList.remove('visible');
        }
    }

    dispose() {
        this.domElement.removeEventListener('mousemove', this.boundMouseMove);
        this.domElement.removeEventListener('click', this.boundClick);
        this.domElement.removeEventListener('mouseleave', this.boundMouseLeave);
    }
}
