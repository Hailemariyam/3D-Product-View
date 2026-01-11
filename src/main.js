/**
 * Premium 3D Product Viewer - Main Entry Point
 *
 * Architecture Overview:
 * ─────────────────────────────────────────────────────────────
 * /core         → Foundation classes (Scene, Camera, Renderer, Loop, Assets)
 * /environment  → Visual environment (HDR maps, ground plane)
 * /loaders      → Asset loading (GLTF with DRACO support)
 * /interactions → User input handling (Raycaster, selection logic)
 * /controls     → Camera controls (OrbitControls wrapper)
 * /lights       → Lighting configuration (three-point setup)
 * /ui           → HTML overlay management
 * /utils        → Cross-cutting concerns (resize, debug)
 * ─────────────────────────────────────────────────────────────
 *
 * This separation enables:
 * - Single responsibility per module
 * - Easy testing and mocking
 * - Scalable architecture for complex scenes
 */

import * as THREE from 'three';
import gsap from 'gsap';

// Core
import { SceneManager } from './core/SceneManager.js';
import { CameraManager } from './core/CameraManager.js';
import { RendererManager } from './core/RendererManager.js';
import { AnimationLoop } from './core/AnimationLoop.js';
import { AssetManager } from './core/AssetManager.js';

// Environment
import { EnvironmentMap } from './environment/EnvironmentMap.js';
import { Ground } from './environment/Ground.js';

// Loaders
import { ModelLoader } from './loaders/ModelLoader.js';

// Interactions
import { InteractionController } from './interactions/InteractionController.js';

// Controls
import { Controls } from './controls/Controls.js';

// Lights
import { Lights } from './lights/Lights.js';

// UI
import { OverlayUI } from './ui/OverlayUI.js';

// Utils
import { ResizeHandler } from './utils/ResizeHandler.js';
import { DebugPanel } from './utils/DebugPanel.js';

class PremiumProductViewer {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.model = null;

        this.init();
    }

    async init() {
        // Initialize UI first for loading feedback
        this.ui = new OverlayUI();

        // Core systems
        this.assetManager = new AssetManager();
        this.sceneManager = new SceneManager();
        this.cameraManager = new CameraManager(this.container);
        this.rendererManager = new RendererManager(this.container);

        // Setup loading progress
        this.assetManager.onProgress((progress) => {
            this.ui.updateLoadingProgress(progress);
        });

        // Animation loop (using setAnimationLoop)
        this.animationLoop = new AnimationLoop(this.rendererManager.getRenderer());

        // Debug panel
        this.debugPanel = new DebugPanel(this.rendererManager.getRenderer());

        // Load environment and assets
        await this.setupEnvironment();
        await this.loadModel();

        // Setup scene components
        this.setupScene();

        // Start experience
        await this.startExperience();
    }

    async setupEnvironment() {
        const envMapLoader = new EnvironmentMap(this.assetManager);

        // Try to load HDR, fall back to procedural
        try {
            this.envMap = await envMapLoader.load(
                this.rendererManager.getRenderer(),
                '/hdr/environment.hdr'
            );
        } catch {
            this.envMap = envMapLoader.createFallbackEnvironment(
                this.rendererManager.getRenderer()
            );
        }

        this.sceneManager.setEnvironment(this.envMap);
    }

    async loadModel() {
        const loader = new ModelLoader(this.assetManager);

        try {
            this.model = await loader.load('/models/product.glb', 'product');
        } catch {
            console.log('Using premium fallback model');
            this.model = loader.createFallbackModel(this.envMap);
        }

        this.centerModel(this.model);
        this.sceneManager.add(this.model);
    }

    centerModel(model) {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.sub(center);
        model.position.y += size.y / 2;

        // Scale if too large
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 3) {
            const scale = 3 / maxDim;
            model.scale.setScalar(scale);
        }
    }

    setupScene() {
        // Lighting
        this.lights = new Lights(this.sceneManager.getScene());

        // Ground plane
        this.ground = new Ground(this.sceneManager.getScene());

        // Controls
        this.controls = new Controls(
            this.cameraManager.getCamera(),
            this.rendererManager.getDomElement()
        );

        // Interactions
        this.interactionController = new InteractionController(
            this.cameraManager.getCamera(),
            this.rendererManager.getDomElement(),
            this.sceneManager
        );

        // Resize handling
        this.resizeHandler = new ResizeHandler(
            this.container,
            this.cameraManager,
            this.rendererManager
        );
    }

    async startExperience() {
        // Hide loading screen
        await this.ui.hideLoadingScreen();

        // Calculate optimal camera position
        const { position, target } = this.cameraManager.frameObject(
            this.model,
            this.controls.controls
        );

        // Disable controls during intro
        this.controls.enable(false);

        // Play intro animation
        this.cameraManager.playIntroAnimation(position, target, () => {
            this.controls.enable(true);
            this.ui.showInfoPanel();
        });

        // Start render loop
        this.animationLoop.addCallback(this.update.bind(this));
        this.animationLoop.start();
    }

    update(deltaTime) {
        // Update controls (required for damping)
        this.controls.update();

        // Update debug stats
        this.debugPanel.update();

        // Render
        this.rendererManager.render(
            this.sceneManager.getScene(),
            this.cameraManager.getCamera()
        );
    }

    dispose() {
        this.animationLoop.stop();
        this.controls.dispose();
        this.resizeHandler.dispose();
        this.interactionController.dispose();
        this.lights.dispose();
        this.ground.dispose();
        this.assetManager.dispose();
        this.rendererManager.dispose();
    }
}

// Initialize
const viewer = new PremiumProductViewer();

// Cleanup
window.addEventListener('beforeunload', () => viewer.dispose());
