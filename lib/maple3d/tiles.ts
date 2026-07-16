/**
 * MapleStory-style tiled terrain: grass-capped dirt platforms and ground
 * blocks as real 3D boxes, plus the flat-lying animated lake surface.
 * All face textures are generated on canvases from the shared PALETTE on the
 * same 6px texel grid the 2D art uses — no image assets.
 */

import * as THREE from "three";
import { drawWater, PALETTE } from "@/lib/maple/scenery";
import { makeCanvasTexture, srgbColor } from "./engine";

const PX = 6;
const TILE = 48;

/** Platform slab thickness / depth in world px. */
export const PLATFORM_THICK = 22;
export const PLATFORM_DEPTH = 60;

function tileTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): THREE.CanvasTexture {
  const baked = makeCanvasTexture(w, h, 1);
  baked.repaint(draw);
  baked.texture.wrapS = THREE.RepeatWrapping;
  baked.texture.wrapT = THREE.RepeatWrapping;
  return baked.texture;
}

/* ------------------------------------------------------------------------ */

function grassTopTexture(): THREE.CanvasTexture {
  return tileTexture(TILE, TILE, (ctx) => {
    ctx.fillStyle = PALETTE.grass;
    ctx.fillRect(0, 0, TILE, TILE);
    // mottled clumps, deterministic
    for (let i = 0; i < 9; i++) {
      const gx = ((i * 17) % 8) * PX;
      const gy = ((i * 29) % 8) * PX;
      ctx.fillStyle = i % 3 === 0 ? PALETTE.grassDark : PALETTE.grassLip;
      ctx.fillRect(gx, gy, i % 3 === 0 ? PX * 2 : PX, PX);
    }
  });
}

function soilSideTexture(dark = false): THREE.CanvasTexture {
  return tileTexture(TILE, TILE, (ctx) => {
    ctx.fillStyle = dark ? PALETTE.soilDark : PALETTE.soil;
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 6; i++) {
      const gx = ((i * 19) % 8) * PX;
      const gy = ((i * 23) % 8) * PX;
      ctx.fillStyle = i % 2 === 0 ? "#e8cfa0" : PALETTE.soilDark;
      ctx.fillRect(gx, gy, PX * 2, PX);
    }
    ctx.globalAlpha = 1;
  });
}

/** Front of a floating platform slab: bright grass lip over a soil band,
    with dark Maple-style rims so slabs pop against the green hills behind. */
function platformFrontTexture(thick: number): THREE.CanvasTexture {
  return tileTexture(TILE, thick, (ctx) => {
    ctx.fillStyle = PALETTE.soil;
    ctx.fillRect(0, 0, TILE, thick);
    ctx.fillStyle = PALETTE.grass;
    ctx.fillRect(0, 0, TILE, 12);
    ctx.fillStyle = PALETTE.grassLip;
    ctx.fillRect(0, 0, TILE, PX);
    // hanging grass tufts
    ctx.fillStyle = PALETTE.grass;
    for (let gx = 0; gx < TILE; gx += 12) ctx.fillRect(gx + 3, 12, PX, 3);
    // dark shadow line right under the grass cap
    ctx.fillStyle = "rgba(50, 28, 14, 0.45)";
    ctx.fillRect(0, 12, TILE, 3);
    // dark top rim + bottom edge
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(0, 0, TILE, 2);
    ctx.fillStyle = PALETTE.soilDark;
    ctx.fillRect(0, thick - PX, TILE, PX);
    ctx.fillStyle = "rgba(50, 28, 14, 0.6)";
    ctx.fillRect(0, thick - 2, TILE, 2);
  });
}

/** Front of the main ground block — matches the old drawGrass cross-section. */
function groundFrontTexture(h: number, sand: boolean): THREE.CanvasTexture {
  return tileTexture(TILE * 2, h, (ctx) => {
    const w = TILE * 2;
    if (sand) {
      ctx.fillStyle = "#e0c089";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c9a06b";
      ctx.fillRect(0, Math.round(h * 0.35), w, h);
      ctx.globalAlpha = 0.35;
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = "#f0d9ab";
        ctx.fillRect(((i * 31) % 15) * PX, (2 + ((i * 13) % 10)) * PX, PX * 2, PX);
      }
      ctx.globalAlpha = 1;
      return;
    }
    // soil, darker with depth
    ctx.fillStyle = PALETTE.soil;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.soilDark;
    ctx.fillRect(0, Math.round(h * 0.45), w, h);
    // buried stones
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#e8cfa0";
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(((i * 17) % 14) * PX, 26 + ((i * 31) % Math.max(PX, h - 40)), PX * 2, PX);
    }
    ctx.globalAlpha = 1;
    // grass band + lip + tufts + dark clumps
    ctx.fillStyle = PALETTE.grass;
    ctx.fillRect(0, 0, w, 15);
    for (let gx = 0; gx < w; gx += 12) ctx.fillRect(gx + 3, 15, PX, 3);
    ctx.fillStyle = PALETTE.grassLip;
    ctx.fillRect(0, 0, w, PX);
    ctx.fillStyle = PALETTE.grassDark;
    for (let i = 0; i < 3; i++) ctx.fillRect(i * 34 + ((i * 11) % 13), 9, 9, PX);
  });
}

function sandTopTexture(): THREE.CanvasTexture {
  return tileTexture(TILE, TILE, (ctx) => {
    ctx.fillStyle = "#e0c089";
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#c9a06b" : "#f0d9ab";
      ctx.fillRect(((i * 19) % 8) * PX, ((i * 23) % 8) * PX, PX, PX);
    }
    ctx.globalAlpha = 1;
  });
}

/* ------------------------------------------------------------------------ */

export type TiledBox = {
  mesh: THREE.Mesh;
  w: number;
  /** Position by 2D world coords of the LEFT edge and the TOP surface. */
  placeTop: (x2d: number, top2d: number, zCenter?: number) => void;
};

function repeatOf(texture: THREE.CanvasTexture, rx: number, ry: number): THREE.CanvasTexture {
  const t = texture.clone();
  t.repeat.set(Math.max(rx, 0.001), Math.max(ry, 0.001));
  t.needsUpdate = true;
  return t;
}

function tiledBox(
  w: number,
  h: number,
  d: number,
  faces: { top: THREE.CanvasTexture; side: THREE.CanvasTexture; front: THREE.CanvasTexture }
): TiledBox {
  const geometry = new THREE.BoxGeometry(w, h, d);
  const mat = (map: THREE.CanvasTexture) => new THREE.MeshBasicMaterial({ map });
  const materials = [
    mat(repeatOf(faces.side, d / TILE, h / TILE)), // +x
    mat(repeatOf(faces.side, d / TILE, h / TILE)), // -x
    mat(repeatOf(faces.top, w / TILE, d / TILE)), // +y
    mat(repeatOf(faces.side, w / TILE, d / TILE)), // -y
    mat(repeatOf(faces.front, w / (faces.front.image.width as number), 1)), // +z
    mat(repeatOf(faces.side, w / TILE, h / TILE)), // -z
  ];
  const mesh = new THREE.Mesh(geometry, materials);
  return {
    mesh,
    w,
    placeTop(x2d, top2d, zCenter = 0) {
      mesh.position.set(x2d + w / 2, -(top2d + h / 2), zCenter);
    },
  };
}

// Shared base textures (module-lazy so they're only built in the browser).
let baseTex: {
  grassTop: THREE.CanvasTexture;
  soil: THREE.CanvasTexture;
  soilDark: THREE.CanvasTexture;
  sandTop: THREE.CanvasTexture;
  platFront: THREE.CanvasTexture;
} | null = null;

function textures() {
  if (!baseTex) {
    baseTex = {
      grassTop: grassTopTexture(),
      soil: soilSideTexture(false),
      soilDark: soilSideTexture(true),
      sandTop: sandTopTexture(),
      platFront: platformFrontTexture(PLATFORM_THICK),
    };
  }
  return baseTex;
}

/** One-way floating platform slab (the jumpable Maple tile). */
export function makePlatform(w: number): TiledBox {
  const t = textures();
  return tiledBox(w, PLATFORM_THICK, PLATFORM_DEPTH, {
    top: t.grassTop,
    side: t.soilDark,
    front: t.platFront,
  });
}

/** Solid ground block (grass lawn or underwater sand). */
export function makeGround(
  w: number,
  kind: "grass" | "sand",
  h = 150,
  depth = 300
): TiledBox {
  const t = textures();
  return tiledBox(w, h, depth, {
    top: kind === "grass" ? t.grassTop : t.sandTop,
    side: t.soilDark,
    front: groundFrontTexture(h, kind === "sand"),
  });
}

/* ------------------------------------------------------------------------ */

/**
 * The lake as a flat-lying plane: the old front-view water band maps onto the
 * surface so the golden sun column and ticking glints streak away into depth.
 * Repaints only when the retro glint clock (240ms) ticks.
 */
export class WaterSurface {
  readonly mesh: THREE.Mesh;
  private baked;
  private lastTick = -1;
  private w2d: number;
  private rows: number;

  constructor(w2d: number, depth: number, rows = 96) {
    this.w2d = w2d;
    this.rows = rows;
    this.baked = makeCanvasTexture(w2d, rows, 1);
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w2d, depth),
      new THREE.MeshBasicMaterial({ map: this.baked.texture })
    );
    this.mesh.rotation.x = -Math.PI / 2;
  }

  /** (x2d, surfaceY2d) = left edge + waterline; zFront = near edge depth. */
  place(x2d: number, surfaceY2d: number, zFront: number) {
    const depth = (this.mesh.geometry as THREE.PlaneGeometry).parameters.height;
    this.mesh.position.set(x2d + this.w2d / 2, -surfaceY2d, zFront - depth / 2);
  }

  /** sunLocalX is in this strip's own x space (world x minus strip left). */
  repaint(t: number, sunLocalX?: number) {
    const tick = Math.floor(t / 240);
    if (tick === this.lastTick) return;
    this.lastTick = tick;
    this.baked.repaint((ctx) => drawWater(ctx, 0, 0, this.w2d, this.rows, t, sunLocalX));
  }
}

/** Deep-water skirt: plain vertical fill below the surface's near edge. */
export function makeWaterSkirt(w: number, h: number): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ color: srgbColor(PALETTE.lakeDeep) })
  );
}
