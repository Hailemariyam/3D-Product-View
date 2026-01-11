import * as THREE from 'three';

/**
 * Ground - Subtle ground plane with contact shadow effect.
 *
 * Creates visual grounding for the product without being distracting.
 * Uses a gradient fade for soft edges.
 */
export class Ground {
    constructor(scene) {
        this.scene = scene;
        this.ground = null;
        this.shadowPlane = null;

        this.create();
    }

    create() {
        // Main ground plane with gradient material
        const geometry = new THREE.CircleGeometry(8, 64);

        const material = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                color: { value: new THREE.Color(0x1a1a2e) },
                opacity: { value: 0.8 }
            },
            vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - 0.5) * 2.0;
          float alpha = opacity * (1.0 - smoothstep(0.3, 1.0, dist));
          gl_FragColor = vec4(color, alpha);
        }
      `
        });

        this.ground = new THREE.Mesh(geometry, material);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -0.5;
        this.ground.receiveShadow = true;
        this.ground.userData.interactive = false;

        this.scene.add(this.ground);

        // Shadow-receiving plane (invisible but catches shadows)
        const shadowGeometry = new THREE.PlaneGeometry(20, 20);
        const shadowMaterial = new THREE.ShadowMaterial({
            opacity: 0.3
        });

        this.shadowPlane = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadowPlane.rotation.x = -Math.PI / 2;
        this.shadowPlane.position.y = -0.49;
        this.shadowPlane.receiveShadow = true;
        this.shadowPlane.userData.interactive = false;

        this.scene.add(this.shadowPlane);
    }

    setPosition(y) {
        this.ground.position.y = y;
        this.shadowPlane.position.y = y + 0.01;
    }

    dispose() {
        this.ground.geometry.dispose();
        this.ground.material.dispose();
        this.shadowPlane.geometry.dispose();
        this.shadowPlane.material.dispose();
        this.scene.remove(this.ground);
        this.scene.remove(this.shadowPlane);
    }
}
