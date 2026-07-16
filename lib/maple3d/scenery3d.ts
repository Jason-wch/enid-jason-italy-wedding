/**
 * The old procedural canvas scenery, re-staged in 3D: every draw function in
 * lib/maple/scenery.ts gets baked onto a crisp canvas texture and mounted as
 * a flat card ("billboard") standing in the world — MapleStory's own trick.
 * Anchors match the original draw-call coordinates, so scene layouts read
 * exactly like the old buildForeground()/buildBackground() code.
 */

import * as THREE from "three";
import {
  drawBirds,
  drawBoat,
  drawCloud,
  drawCypress,
  drawFlowerBed,
  drawFloatingIsland,
  drawGazebo,
  drawLadder,
  drawMountains,
  drawMushroom,
  drawOliveTree,
  drawSign,
  drawSky,
  drawSun,
  drawTree,
  drawVilla,
  drawWater,
} from "@/lib/maple/scenery";
import { makeBillboard, makeCanvasTexture, type Billboard } from "./engine";

export type { Billboard } from "./engine";

export function villa(s: number): Billboard {
  const w = 240 * s + 32 * s;
  const h = 212 * s;
  return makeBillboard(w, h, 16 * s, h - 4, (ctx) => drawVilla(ctx, 16 * s, h - 4, s));
}

export function gazebo(s: number): Billboard {
  const w = 96 * s + 12 * s;
  const h = 88 * s + 8;
  return makeBillboard(w, h, 6 * s, h - 4, (ctx) => drawGazebo(ctx, 6 * s, h - 4, s));
}

export function cypress(height: number): Billboard {
  const w = height * 0.4 + 10;
  const h = height + 6;
  return makeBillboard(w, h, w / 2, h - 2, (ctx) => drawCypress(ctx, w / 2, h - 2, height));
}

export function tree(s: number): Billboard {
  const w = 52 * s + 10;
  const h = 58 * s + 6;
  return makeBillboard(w, h, w / 2, h - 2, (ctx) => drawTree(ctx, w / 2, h - 2, s));
}

export function oliveTree(s: number): Billboard {
  const w = 32 * s + 10;
  const h = 33 * s + 6;
  return makeBillboard(w, h, w / 2, h - 2, (ctx) => drawOliveTree(ctx, w / 2, h - 2, s));
}

export function flowerBed(bedW: number): Billboard {
  const w = bedW + 8;
  const h = bedW * 0.62 + 6;
  return makeBillboard(w, h, 3, h - 2, (ctx) => drawFlowerBed(ctx, 3, h - 2, bedW));
}

export function mushroom(s: number): Billboard {
  const w = 26 * s + 10;
  const h = 24 * s + 8;
  return makeBillboard(w, h, w / 2, h - 2, (ctx) => drawMushroom(ctx, w / 2, h - 2, s));
}

export function sign(text: string): Billboard {
  const plankW = Math.max(94, text.length * 7.2 + 30);
  const w = plankW + 12;
  const h = 66;
  return makeBillboard(w, h, w / 2, h - 2, (ctx) => drawSign(ctx, w / 2, h - 2, text));
}

export function cloud(s: number): Billboard {
  const w = 6 * s + 8;
  const h = 3.7 * s + 8;
  return makeBillboard(w, h, 4, 4, (ctx) => drawCloud(ctx, 4, 4, s));
}

export function sun(r: number): Billboard {
  const size = r * 5;
  return makeBillboard(size, size, size / 2, size / 2, (ctx) =>
    drawSun(ctx, size / 2, size / 2, r)
  );
}

export function ladder(len: number): Billboard {
  const w = 26;
  const h = len + 6;
  return makeBillboard(w, h, 3, 3, (ctx) => drawLadder(ctx, 3, 3, len));
}

/** Wide repeating mountain strip; place(0, yBaseline) like the 2D call. */
export function mountains(width: number, far: boolean): Billboard {
  if (far) {
    const h = 140;
    const base = 126;
    return makeBillboard(width, h, 0, base, (ctx) => drawMountains(ctx, width, base, 0, true));
  }
  const h = 110;
  const base = 84;
  return makeBillboard(width, h, 0, base, (ctx) => drawMountains(ctx, width, base, 0, false));
}

/* --------------------------- composite pieces --------------------------- */

export type IslandDeco =
  | { kind: "ladder"; dx: number; dy: number; len: number }
  | { kind: "mushroom"; dx: number; dy: number; s: number }
  | { kind: "tree"; dx: number; dy: number; s: number };

/** Floating grass island (+ its ladder/mushroom/tree) baked as one card.
    Anchored at (island center x, island top y), like drawFloatingIsland. */
export function floatingIsland(w: number, deco: IslandDeco[] = []): Billboard {
  const headroom = 42;
  const cw = w + 20;
  const ch = headroom + w * 0.52 + 10;
  const cx = cw / 2;
  return makeBillboard(cw, ch, cx, headroom, (ctx) => {
    drawFloatingIsland(ctx, cx, headroom, w);
    for (const d of deco) {
      if (d.kind === "ladder") drawLadder(ctx, cx + d.dx, headroom + d.dy, d.len);
      else if (d.kind === "mushroom") drawMushroom(ctx, cx + d.dx, headroom + d.dy, d.s);
      else drawTree(ctx, cx + d.dx, headroom + d.dy, d.s);
    }
  });
}

/** Two-frame flapping birds. */
export function birds(): { billboard: Billboard; update: (t: number) => void } {
  const w = 64;
  const h = 30;
  const frameA = makeCanvasTexture(w, h, 2);
  frameA.repaint((ctx) => drawBirds(ctx, 12, 15, 0));
  const frameB = makeCanvasTexture(w, h, 2);
  frameB.repaint((ctx) => drawBirds(ctx, 12, 15, 260));

  const billboard = makeBillboard(w, h, 12, 15, (ctx) => drawBirds(ctx, 12, 15, 0));
  const material = billboard.mesh.material as THREE.MeshBasicMaterial;
  let current = 0;
  return {
    billboard,
    update(t) {
      const frame = Math.floor(t / 260) % 2;
      if (frame !== current) {
        current = frame;
        material.map = frame === 0 ? frameA.texture : frameB.texture;
        material.needsUpdate = true;
      }
    },
  };
}

/** Bobbing sailboat; place with the 2D (x, waterY) anchor. */
export function boat(): {
  billboard: Billboard;
  place: (x2d: number, waterY2d: number, z?: number) => void;
  update: (t: number) => void;
} {
  const bb = makeBillboard(52, 52, 26, 30, (ctx) => drawBoat(ctx, 26, 30, 0));
  let baseY = 0;
  return {
    billboard: bb,
    place(x2d, waterY2d, z = 0) {
      bb.place(x2d, waterY2d, z);
      baseY = bb.mesh.position.y;
    },
    update(t) {
      bb.mesh.position.y = baseY - Math.round(Math.sin(t / 750)) * 6;
    },
  };
}

/* ------------------------------ backdrops ------------------------------- */

/** Golden-hour banded sky as a scene background texture. */
export function skyTexture(viewH: number): THREE.CanvasTexture {
  const baked = makeCanvasTexture(16, viewH, 1);
  baked.repaint((ctx) => {
    drawSky(ctx, 16, Math.round(viewH * 0.74));
    ctx.fillStyle = "#fff9d6";
    ctx.fillRect(0, Math.round(viewH * 0.74) - 2, 16, viewH);
  });
  return baked.texture;
}

/**
 * The screen-fixed distant lake band (the old parallax-0 water strip behind
 * the mountains' feet). Mounted as a camera child so it never scrolls, at a
 * depth chosen by the caller to slot in front of the mountain layers.
 */
export class BackdropWater {
  readonly mesh: THREE.Mesh;
  private baked;
  private lastTick = -1;
  private texW = 1024;
  private texH: number;
  private screenTop: number;

  /** Band covers screen rows screenTop..screenTop+bandH of a viewH-tall view. */
  constructor(D: number, dist: number, viewH: number, screenTop: number, bandH: number) {
    this.texH = bandH;
    this.screenTop = screenTop;
    this.baked = makeCanvasTexture(this.texW, bandH, 1);
    const k = dist / D;
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(this.texW * k, bandH * k),
      new THREE.MeshBasicMaterial({ map: this.baked.texture })
    );
    const centerOffset = screenTop + bandH / 2 - viewH / 2; // px below screen center
    this.mesh.position.set(0, -centerOffset * k, -dist);
  }

  /** sunScreenX is in screen space (0 = left edge of a viewW-wide view). */
  repaint(t: number, sunScreenX: number, viewW: number) {
    const tick = Math.floor(t / 240);
    if (tick === this.lastTick) return;
    this.lastTick = tick;
    const sunLocal = sunScreenX - viewW / 2 + this.texW / 2;
    this.baked.repaint((ctx) => drawWater(ctx, 0, 0, this.texW, this.texH, t, sunLocal));
  }
}
