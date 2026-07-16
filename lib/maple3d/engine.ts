/**
 * Shared Three.js plumbing for the MapleStory-style 2.5D surfaces.
 *
 * Coordinate convention: the game keeps its original 2D world coordinates
 * (x right, y DOWN, in world pixels). Anything placed in the scene converts
 * with `three_y = -game_y`, so all gameplay math stays byte-identical to the
 * old canvas renderer. The camera looks straight down -z at the z=0 gameplay
 * plane, and its distance is chosen so one world pixel on that plane is one
 * screen pixel — the old draw coordinates carry over 1:1.
 */

import * as THREE from "three";

/** Perspective strength. 38° keeps pixels honest but lets platforms read as boxes. */
export const CAM_FOV = 38;

/** Camera distance so the frustum height at z=0 equals `viewH` world px. */
export function camDistance(viewH: number): number {
  return viewH / 2 / Math.tan((CAM_FOV / 2) * (Math.PI / 180));
}

/** Integer supersample, same rule as the old canvas renderer. */
export function pixelRES(): number {
  if (typeof window === "undefined") return 1;
  return (window.devicePixelRatio || 1) >= 1.5 ? 2 : 1;
}

/** WebGL renderer tuned for crisp fat-pixel art; null when WebGL is missing. */
export function createRenderer(
  canvas: HTMLCanvasElement,
  opts?: { alpha?: boolean }
): THREE.WebGLRenderer | null {
  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: opts?.alpha ?? false,
      powerPreference: "high-performance",
      stencil: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setPixelRatio(pixelRES());
    return renderer;
  } catch {
    return null;
  }
}

/** Warm golden-hour light rig: near-white ambient keeps palette hexes honest,
    a soft directional from the lake-side sun models the voxel faces. */
export function addGoldenLights(scene: THREE.Scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.86);
  const sun = new THREE.DirectionalLight(0xffe9b0, 0.42);
  sun.position.set(0.55, 0.85, 0.65);
  scene.add(ambient, sun);
}

export type Baked = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  /** Repaint helper: clears, runs draw, flags the texture. */
  repaint: (draw: (ctx: CanvasRenderingContext2D) => void) => void;
};

/**
 * Canvas-backed texture in "world pixel" units. `bake` supersamples the
 * canvas (text and fine art keep the crispness the old 2x canvases had)
 * while draw code still works in world px.
 */
export function makeCanvasTexture(w: number, h: number, bake = 2): Baked {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * bake));
  canvas.height = Math.max(1, Math.round(h * bake));
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(bake, 0, 0, bake, 0, 0);
  ctx.imageSmoothingEnabled = false;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;

  return {
    canvas,
    ctx,
    texture,
    repaint(draw) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      ctx.imageSmoothingEnabled = false;
      draw(ctx);
      texture.needsUpdate = true;
    },
  };
}

export type Billboard = {
  mesh: THREE.Mesh;
  w: number;
  h: number;
  /** Position using 2D world coords; (x2d, y2d) is where the anchor lands. */
  place: (x2d: number, y2d: number, z?: number) => void;
};

/**
 * Flat scenery card baked from one of the old canvas draw functions.
 * The anchor is in canvas-local 2D coords (e.g. a tree's trunk base), so
 * `place()` accepts the exact same coordinates the 2D code used.
 */
export function makeBillboard(
  w: number,
  h: number,
  anchorX: number,
  anchorY: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  opts?: { bake?: number }
): Billboard {
  const baked = makeCanvasTexture(w, h, opts?.bake ?? 2);
  baked.repaint(draw);
  const material = new THREE.MeshBasicMaterial({
    map: baked.texture,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  const place = (x2d: number, y2d: number, z = 0) => {
    mesh.position.set(x2d - anchorX + w / 2, -(y2d - anchorY + h / 2), z);
  };
  place(0, 0);
  return { mesh, w, h, place };
}

/**
 * Parallax layer with a legacy scroll factor `p` (0 < p <= 1).
 *
 * Derivation: with the camera at distance D, a layer at depth z projects with
 * factor k = D / (D - z). Choosing z = D(1 - 1/p) makes k = p, and scaling
 * the layer by 1/p restores its on-screen size. The offsets below make the
 * layer's own 2D coordinates land on the exact same screen pixels the old
 * renderer produced — for every camera position.
 */
export function layoutParallaxLayer(
  layer: THREE.Group,
  p: number,
  D: number,
  viewW: number,
  viewH: number
) {
  if (p === 1) {
    layer.position.set(0, 0, 0);
    layer.scale.setScalar(1);
    return;
  }
  const inv = 1 / p;
  layer.scale.setScalar(inv);
  layer.position.set(-(viewW / 2) * (inv - 1), (viewH / 2) * (inv - 1), D * (1 - inv));
}

/** Recursively dispose geometries, materials and textures under `root`. */
export function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = (mesh as THREE.Mesh).material as
      | THREE.Material
      | THREE.Material[]
      | undefined;
    if (Array.isArray(material)) material.forEach(disposeMaterial);
    else if (material) disposeMaterial(material);
  });
}

function disposeMaterial(material: THREE.Material) {
  const map = (material as THREE.MeshBasicMaterial).map;
  if (map) map.dispose();
  material.dispose();
}

/** Convert a CSS hex/rgb color into a linear-space THREE.Color. */
export function srgbColor(css: string): THREE.Color {
  return new THREE.Color().setStyle(css, THREE.SRGBColorSpace);
}
