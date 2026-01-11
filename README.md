# Premium Three.js Product Viewer

An interactive 3D product showcase built with Three.js, featuring smooth animations, realistic materials, and professional visual quality.

![Product Viewer](https://via.placeholder.com/800x400/1a1a2e/6366f1?text=3D+Product+Viewer)

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Features Overview](#features-overview)
3. [How Each Feature Works](#how-each-feature-works)
4. [The Fallback Product](#the-fallback-product)
5. [Customization](#customization)
6. [Performance Tips](#performance-tips)
7. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Project Structure

```
/src
  /core
    SceneManager.js      # Creates and manages the 3D scene
    CameraManager.js     # Camera setup and intro animation
    RendererManager.js   # WebGL renderer configuration
    AnimationLoop.js     # Main render loop
    AssetManager.js      # Centralized asset loading

  /environment
    EnvironmentMap.js    # HDR lighting and reflections
    Ground.js            # Floor plane with shadows

  /loaders
    ModelLoader.js       # GLTF/GLB model loading

  /interactions
    RaycasterManager.js  # Mouse-to-3D coordinate conversion
    InteractionController.js  # Hover and click handling

  /controls
    Controls.js          # OrbitControls (rotate, zoom)

  /lights
    Lights.js            # Three-point lighting setup

  /ui
    OverlayUI.js         # Loading screen and info panels

  /utils
    ResizeHandler.js     # Responsive canvas sizing
    DebugPanel.js        # Performance stats display

/public
  /models               # Place your .glb/.gltf files here
  /hdr                  # Place your .hdr environment maps here
```

---

## Features Overview

| Feature | What It Does |
|---------|--------------|
| Loading Screen | Shows progress while assets load |
| Camera Intro | Smooth animated camera movement on start |
| Orbit Controls | Drag to rotate, scroll to zoom |
| Hover Effects | Objects glow and scale when mouse hovers |
| Click Selection | Click objects to select with highlight |
| Info Tooltip | Shows object name and description |
| HDR Environment | Realistic reflections on shiny surfaces |
| Soft Shadows | Ground shadows for visual grounding |
| Debug Panel | FPS and render stats (press D) |

---

## How Each Feature Works

### 1. Loading Screen

**File:** `src/ui/OverlayUI.js`

When the app starts, a loading screen appears with a progress bar.

```
How it works:
1. AssetManager tracks all loading assets
2. Each asset reports progress (0-100%)
3. OverlayUI updates the progress bar width
4. When complete, loading screen fades out
```

The loading bar fills as assets load. Once everything is ready, it fades away to reveal the 3D scene.

---

### 2. Camera Intro Animation

**File:** `src/core/CameraManager.js`

The camera starts far away and smoothly flies to the optimal viewing position.

```
How it works:
1. Camera starts at position (8, 6, 12)
2. GSAP animates to calculated "best view" position
3. Animation takes 2.5 seconds with smooth easing
4. Controls are disabled during animation
5. Info panel appears after animation completes
```

This creates a cinematic reveal effect when the page loads.

---

### 3. Orbit Controls

**File:** `src/controls/Controls.js`

Lets users rotate and zoom the camera around the product.

```
How it works:
1. OrbitControls from Three.js handles input
2. Mouse drag = rotate camera around center
3. Scroll wheel = zoom in/out
4. Damping enabled = smooth, inertial movement
5. Constraints prevent going under the ground
```

**Settings:**
- Zoom range: 2 to 12 units
- Vertical angle: 18° to 153° (can't flip upside down)
- Panning disabled (keeps focus on product)

---

### 4. Hover Effects

**File:** `src/interactions/InteractionController.js`

Objects react when you move your mouse over them.

```
How it works:
1. Every frame, a ray is cast from mouse position into 3D scene
2. If ray hits an object, that object is "hovered"
3. Hovered object gets:
   - Emissive glow (material.emissive changes)
   - Slight scale increase (1.02x)
   - Cursor changes to pointer
4. When mouse leaves, effects reverse smoothly
```

GSAP handles the smooth transitions (0.2-0.3 seconds).

---

### 5. Click Selection

**File:** `src/interactions/InteractionController.js`

Click an object to select it with a stronger highlight.

```
How it works:
1. On click, raycast checks what was clicked
2. If object clicked:
   - Previous selection is cleared
   - New object gets purple emissive glow
   - Pulse animation plays (scale up then down)
   - Info tooltip shows "Selected" state
3. Click empty space or same object to deselect
```

Selected objects stay highlighted until you click elsewhere.

---

### 6. Info Tooltip

**File:** `src/interactions/InteractionController.js` + `index.html`

Shows the name and description of hovered/selected objects.

```
How it works:
1. Each mesh has userData.description property
2. On hover/select, tooltip text updates
3. CSS class "visible" triggers fade-in animation
4. Tooltip positioned at bottom center of screen
```

**Example object data:**
```javascript
mesh.name = 'GlassLens';
mesh.userData.description = 'Sapphire crystal lens';
```

---

### 7. HDR Environment Map

**File:** `src/environment/EnvironmentMap.js`

Creates realistic reflections on metallic and glossy surfaces.

```
How it works:
1. Tries to load /hdr/environment.hdr file
2. If not found, creates procedural environment:
   - Gradient sky (dark blue to darker blue)
   - Two colored point lights for reflection spots
3. PMREMGenerator converts to cube map format
4. Scene.environment applies to all PBR materials
```

This is why the metallic surfaces look shiny and realistic - they're reflecting the environment.

---

### 8. Ground Plane with Shadows

**File:** `src/environment/Ground.js`

A subtle floor that catches shadows from the product.

```
How it works:
1. Circular gradient plane (fades at edges)
2. Separate invisible ShadowMaterial plane
3. DirectionalLight casts shadows onto these planes
4. Creates "contact shadow" effect
```

The gradient fade prevents hard edges, making the product appear to float naturally.

---

### 9. Three-Point Lighting

**File:** `src/lights/Lights.js`

Professional lighting setup used in photography and film.

```
┌─────────────────────────────────────┐
│                                     │
│         ☀️ Key Light               │
│         (main, with shadows)        │
│                                     │
│    📦 Product                       │
│                                     │
│  💡 Fill Light      💡 Rim Light   │
│  (soften shadows)   (edge highlight)│
│                                     │
└─────────────────────────────────────┘
```

- **Key Light:** Main light source, casts shadows
- **Fill Light:** Softens harsh shadows on opposite side
- **Rim Light:** Back light that creates edge definition

---

### 10. Debug Panel

**File:** `src/utils/DebugPanel.js`

Shows real-time performance statistics.

```
How it works:
1. Press 'D' key to toggle visibility
2. Every second, calculates:
   - FPS (frames per second)
   - Draw calls (GPU batches)
   - Triangle count
3. Reads from renderer.info object
```

**What the numbers mean:**
- FPS: Should be 60 for smooth animation
- Draw calls: Lower is better (each is a GPU command)
- Triangles: Total geometry complexity

---

## The Fallback Product

When no model file exists at `/public/models/product.glb`, a built-in demo product is shown.

**Name:** PremiumProduct

**Components:**

| Part | Shape | Material | Description |
|------|-------|----------|-------------|
| MainBody | Capsule (tilted 30°) | Dark metal, clearcoat | Premium aluminum body |
| AccentRing | Torus ring | Purple metallic | Anodized accent ring |
| GlassLens | Sphere | Transparent glass | Sapphire crystal lens |
| DisplayBase | Cylinder | Dark metal | Weighted display stand |
| StatusLight | Small sphere | Green emissive | Status indicator LED |

**Visual Style:** Sleek tech device aesthetic, like a premium smart speaker or audio device.

---

## Customization

### Use Your Own 3D Model

1. Export your model as `.glb` or `.gltf`
2. Place it at `public/models/product.glb`
3. Refresh the page

The viewer will automatically load and center your model.

### Use Your Own HDR Environment

1. Download an HDR from [Poly Haven](https://polyhaven.com/hdris)
2. Place it at `public/hdr/environment.hdr`
3. Refresh the page

### Change Colors/Materials

Edit `src/loaders/ModelLoader.js` in the `createFallbackModel()` function:

```javascript
// Change body color
color: 0x2a2a3a  // Hex color

// Change metalness (0 = plastic, 1 = metal)
metalness: 0.9

// Change roughness (0 = mirror, 1 = matte)
roughness: 0.1
```

### Change Lighting

Edit `src/lights/Lights.js`:

```javascript
// Key light intensity
const keyLight = new THREE.DirectionalLight(0xffffff, 2);

// Key light position
keyLight.position.set(5, 8, 5);
```

---

## Performance Tips

| Tip | Why |
|-----|-----|
| Keep triangle count under 100k | More triangles = slower rendering |
| Use compressed textures (KTX2) | Smaller files, faster GPU upload |
| Limit shadow map to 2048x2048 | Higher = better quality but slower |
| Cap pixel ratio at 2 | 4K screens would render 4x pixels |
| Disable shadows on mobile | Significant performance cost |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| D | Toggle debug panel |
| Mouse drag | Rotate camera |
| Scroll | Zoom in/out |
| Click object | Select/deselect |

---

## Tech Stack

- **Three.js** - 3D rendering
- **GSAP** - Smooth animations
- **Vite** - Fast development server and bundler

---

## File Size

| Asset | Size |
|-------|------|
| Three.js | ~150kb gzipped |
| GSAP | ~25kb gzipped |
| App code | ~12kb gzipped |
| **Total** | ~187kb gzipped |

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL 2.0 support.

---

## Deployment (Vercel CI/CD)

This project includes automated deployment to Vercel via GitHub Actions.

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│  Push to main          Push PR                         │
│       │                   │                            │
│       ▼                   ▼                            │
│  ┌─────────┐        ┌─────────┐                       │
│  │  Build  │        │  Build  │                       │
│  └────┬────┘        └────┬────┘                       │
│       │                   │                            │
│       ▼                   ▼                            │
│  ┌─────────┐        ┌─────────────┐                   │
│  │ Deploy  │        │   Deploy    │                   │
│  │  Prod   │        │   Preview   │                   │
│  └─────────┘        └─────────────┘                   │
│       │                   │                            │
│       ▼                   ▼                            │
│  your-app.vercel.app    unique-preview-url.vercel.app │
└─────────────────────────────────────────────────────────┘
```

### Setup Steps

#### 1. Create Vercel Project

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project (run in project root)
vercel link
```

#### 2. Get Vercel Credentials

After linking, find your IDs in `.vercel/project.json`:

```json
{
  "orgId": "your-org-id",
  "projectId": "your-project-id"
}
```

Get your token from: https://vercel.com/account/tokens

#### 3. Add GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | Your Vercel API token |
| `VERCEL_ORG_ID` | From `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` |

#### 4. Push to GitHub

```bash
git add .
git commit -m "Add Vercel CI/CD"
git push origin main
```

### Deployment Triggers

| Event | Action |
|-------|--------|
| Push to `main` | Deploy to production |
| Open/update PR | Deploy preview (unique URL) |

### Manual Deployment

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Vercel Configuration

The `vercel.json` file configures:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

### Workflow File

Located at `.github/workflows/deploy.yml`:

1. **lint-and-build** - Installs deps, builds project
2. **deploy-preview** - Deploys PR to preview URL
3. **deploy-production** - Deploys main branch to production
