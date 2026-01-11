import gsap from 'gsap';

/**
 * OverlayUI - Manages HTML overlay elements and transitions.
 *
 * Handles:
 * - Loading screen with progress
 * - Info panel animations
 * - Smooth reveal transitions
 */
export class OverlayUI {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingBar = document.getElementById('loading-bar');
        this.loadingText = document.getElementById('loading-text');
        this.infoPanel = document.getElementById('info-panel');
    }

    updateLoadingProgress(progress) {
        if (this.loadingBar) {
            this.loadingBar.style.width = `${progress}%`;
        }
        if (this.loadingText) {
            this.loadingText.textContent = `Loading... ${Math.round(progress)}%`;
        }
    }

    hideLoadingScreen() {
        return new Promise((resolve) => {
            if (this.loadingScreen) {
                this.loadingScreen.classList.add('hidden');
                setTimeout(resolve, 600); // Match CSS transition
            } else {
                resolve();
            }
        });
    }

    showInfoPanel() {
        if (this.infoPanel) {
            gsap.to(this.infoPanel, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.3,
                ease: 'power3.out'
            });
        }
    }

    hideInfoPanel() {
        if (this.infoPanel) {
            gsap.to(this.infoPanel, {
                opacity: 0,
                y: -20,
                duration: 0.4,
                ease: 'power2.in'
            });
        }
    }
}
