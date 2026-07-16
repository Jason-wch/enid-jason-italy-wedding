/**
 * Voxel-extruded pixel characters.
 *
 * Every opaque pixel of the classic 16x22 sprite (drawn by the untouched
 * `drawCharacter` in lib/maple/characters.ts) becomes a small cube, so saved
 * CharacterConfigs render pixel-identical to the old flat sprites — just with
 * real depth. The walk cycle only ever produces two distinct poses (the old
 * renderer rounds the sine swing to whole pixels), so a character bakes into
 * six tiny voxel frames: {stand, walkA, walkB} x {eyes open, blink}.
 */

import * as THREE from "three";
import {
  drawCharacter,
  normalizeCharacter,
  SPRITE_H,
  SPRITE_W,
  type CharacterConfig,
} from "@/lib/maple/characters";
import { srgbColor } from "./engine";

/** Depth of each pixel-cube, in sprite units (1 unit = 1 sprite pixel). */
export const VOXEL_DEPTH = 2.6;

type Voxel = { x: number; y: number; color: THREE.Color };
type FrameKey = "stand" | "walkA" | "walkB" | "stand+b" | "walkA+b" | "walkB+b";

const FRAME_DEFS: { key: FrameKey; walk: boolean; phase: number; blink: boolean }[] = [
  { key: "stand", walk: false, phase: 0, blink: false },
  { key: "walkA", walk: true, phase: 0, blink: false }, // |sin| rounds to 0 → narrow scissor
  { key: "walkB", walk: true, phase: Math.PI / 2, blink: false }, // |sin| rounds to 1 → wide scissor
  { key: "stand+b", walk: false, phase: 0, blink: true },
  { key: "walkA+b", walk: true, phase: 0, blink: true },
  { key: "walkB+b", walk: true, phase: Math.PI / 2, blink: true },
];

/** Shared scratch canvas the sprite is rasterized into for voxel extraction. */
let scratch: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null = null;
function getScratch() {
  if (!scratch) {
    const canvas = document.createElement("canvas");
    canvas.width = SPRITE_W;
    canvas.height = SPRITE_H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    scratch = { canvas, ctx };
  }
  return scratch;
}

/** Color cache: identical pixels across frames/configs share THREE.Color objects. */
const colorCache = new Map<number, THREE.Color>();

function extractVoxels(
  config: CharacterConfig,
  frame: "stand" | "walk",
  phase: number,
  blink: boolean
): Voxel[] {
  const { canvas, ctx } = getScratch();
  ctx.clearRect(0, 0, SPRITE_W, SPRITE_H);
  drawCharacter(ctx, config, {
    x: 0,
    y: 0,
    scale: 1,
    frame,
    phase,
    blink,
    flip: false,
    shadow: false,
  });
  const data = ctx.getImageData(0, 0, SPRITE_W, SPRITE_H).data;
  const voxels: Voxel[] = [];
  for (let y = 0; y < SPRITE_H; y++) {
    for (let x = 0; x < SPRITE_W; x++) {
      const i = (y * SPRITE_W + x) * 4;
      const a = data[i + 3];
      if (a < 128) continue;
      const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
      let color = colorCache.get(key);
      if (!color) {
        color = new THREE.Color().setRGB(
          data[i] / 255,
          data[i + 1] / 255,
          data[i + 2] / 255,
          THREE.SRGBColorSpace
        );
        colorCache.set(key, color);
      }
      voxels.push({ x, y, color });
    }
  }
  return voxels;
}

const tmpMatrix = new THREE.Matrix4();

/**
 * A voxel character in the scene. Anchored at the feet: `setFeet(xCenter,
 * feetY)` takes 2D world coords (y down). Facing left rotates the group 180°
 * about Y — the voxel stack is depth-symmetric, so the back face IS the
 * mirrored sprite, exactly like the old `flip`.
 */
export class VoxelCharacter {
  readonly group = new THREE.Group();
  private mesh: THREE.InstancedMesh;
  private frames = new Map<FrameKey, Voxel[]>();
  private currentKey: FrameKey | null = null;

  constructor(scale: number) {
    const geometry = new THREE.BoxGeometry(1, 1, VOXEL_DEPTH);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.mesh = new THREE.InstancedMesh(geometry, material, SPRITE_W * SPRITE_H);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // instances span the whole sprite box; the unit-cube bounds would mis-cull
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.group.add(this.mesh);
    this.group.scale.setScalar(scale);
  }

  setConfig(config: CharacterConfig) {
    const c = normalizeCharacter(config);
    this.frames.clear();
    for (const def of FRAME_DEFS) {
      this.frames.set(
        def.key,
        extractVoxels(c, def.walk ? "walk" : "stand", def.phase, def.blink)
      );
    }
    const key = this.currentKey ?? "stand";
    this.currentKey = null;
    this.applyFrame(key);
  }

  /** Mirrors the old draw call: walking picks the rounded-sine pose. */
  setPose(walking: boolean, phase: number, blink: boolean) {
    const wide = Math.round(Math.abs(Math.sin(phase))) === 1;
    const base: "stand" | "walkA" | "walkB" = walking ? (wide ? "walkB" : "walkA") : "stand";
    this.applyFrame((blink ? `${base}+b` : base) as FrameKey);
  }

  setFacing(facing: number) {
    this.group.rotation.y = facing < 0 ? Math.PI : 0;
  }

  /** 2D world coords: x of the sprite center, y of the feet line. */
  setFeet(xCenter2d: number, feetY2d: number, z = 0) {
    this.group.position.set(xCenter2d, -feetY2d, z);
  }

  private applyFrame(key: FrameKey) {
    if (key === this.currentKey) return;
    const voxels = this.frames.get(key);
    if (!voxels) return;
    this.currentKey = key;
    for (let i = 0; i < voxels.length; i++) {
      const v = voxels[i];
      tmpMatrix.makeTranslation(v.x - SPRITE_W / 2 + 0.5, SPRITE_H - 1 - v.y + 0.5, 0);
      this.mesh.setMatrixAt(i, tmpMatrix);
      this.mesh.setColorAt(i, v.color);
    }
    this.mesh.count = voxels.length;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  dispose() {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    this.mesh.dispose();
  }
}

/** Soft ground shadow — the voxel-world stand-in for the old 1px shadow row. */
export function makeShadowQuad(widthPx: number): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(widthPx, 12),
    new THREE.MeshBasicMaterial({
      color: srgbColor("#50370f"),
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

/** Navy MMO nametag pill, baked crisp at 3x. */
export function makeNameTag(name: string): { mesh: THREE.Mesh; w: number; h: number } {
  const label = name.length > 14 ? `${name.slice(0, 13)}…` : name;
  const bake = 3;
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = "500 11px 'Inter', sans-serif";
  const w = Math.ceil(measure.measureText(label).width) + 14;
  const h = 18;

  const canvas = document.createElement("canvas");
  canvas.width = w * bake;
  canvas.height = h * bake;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(bake, 0, 0, bake, 0, 0);
  ctx.fillStyle = "rgba(23, 42, 63, 0.85)";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(0, 0, w, h, 9);
  else ctx.rect(0, 0, w, h);
  ctx.fill();
  ctx.font = "500 11px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(label, w / 2, h / 2 + 0.5);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
  );
  return { mesh, w, h };
}
