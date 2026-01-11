import * as THREE from 'three';

/**
 * AssetManager - Centralized asset loading with progress tracking.
 *
 * Why centralized?
 * - Single source of truth for all loaded assets
 * - Unified progress tracking across loaders
 * - Memory management (dispose all assets at once)
 * - Prevents duplicate loads of same asset
 */
export class AssetManager {
    constructor() {
        this.loadingManager = new THREE.LoadingManager();
        this.assets = new Map();
        this.loadingCallbacks = [];

        this.setupLoadingManager();
    }

    setupLoadingManager() {
        this.loadingManager.onStart = (url, loaded, total) => {
            console.log(`Started loading: ${url}`);
        };

        this.loadingManager.onProgress = (url, loaded, total) => {
            const progress = (loaded / total) * 100;
            this.notifyProgress(progress, url);
        };

        this.loadingManager.onLoad = () => {
            console.log('All assets loaded');
            this.notifyComplete();
        };

        this.loadingManager.onError = (url) => {
            console.error(`Failed to load: ${url}`);
            this.notifyError(url);
        };
    }

    onProgress(callback) {
        this.loadingCallbacks.push({ type: 'progress', fn: callback });
    }

    onComplete(callback) {
        this.loadingCallbacks.push({ type: 'complete', fn: callback });
    }

    onError(callback) {
        this.loadingCallbacks.push({ type: 'error', fn: callback });
    }

    notifyProgress(progress, url) {
        this.loadingCallbacks
            .filter(cb => cb.type === 'progress')
            .forEach(cb => cb.fn(progress, url));
    }

    notifyComplete() {
        this.loadingCallbacks
            .filter(cb => cb.type === 'complete')
            .forEach(cb => cb.fn());
    }

    notifyError(url) {
        this.loadingCallbacks
            .filter(cb => cb.type === 'error')
            .forEach(cb => cb.fn(url));
    }

    getLoadingManager() {
        return this.loadingManager;
    }

    store(key, asset) {
        this.assets.set(key, asset);
    }

    get(key) {
        return this.assets.get(key);
    }

    has(key) {
        return this.assets.has(key);
    }

    dispose() {
        this.assets.forEach((asset, key) => {
            if (asset.dispose) asset.dispose();
            if (asset.geometry?.dispose) asset.geometry.dispose();
            if (asset.material?.dispose) asset.material.dispose();
        });
        this.assets.clear();
    }
}
