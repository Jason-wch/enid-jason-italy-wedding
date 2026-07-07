/**
 * Procedural pixel-art scenery for the Lake Garda scenes: golden-hour sky,
 * mountains, lake water with a sun reflection, the yellow villa (with its
 * tower), cypress/olive/lemon trees, pergola with festoon lights, signs.
 * All drawing uses chunky rects on a low-res canvas scaled up (pixelated).
 */

export const PALETTE = {
  // Golden-hour sky
  skyTop: "#a9c3d6",
  skyMid: "#efd3a8",
  skyBottom: "#f6c48f", // horizon
  sun: "#ffe3a1",
  cloud: "#fdf3e0",
  mountainFar: "#c3b0b6",
  mountainNear: "#8f8496",
  // Water
  lake: "#6f9ab5",
  lakeDeep: "#4d7690",
  lakeShine: "#f2d5a0", // warm, under the sun
  lakeShineCool: "#a9cede",
  // Ground
  grass: "#9aab6d",
  grassDark: "#75894f",
  path: "#dcc79d",
  pathEdge: "#bfa678",
  stone: "#b3a48c",
  stoneDark: "#94856d",
  // Villa
  villaWall: "#e6b95e",
  villaWallShade: "#c99a43",
  windowGlow: "#ffe2a3",
  shutter: "#3f6247",
  roof: "#b45a3c",
  // Flora
  cypress: "#3c5438",
  cypressDark: "#2c4029",
  trunk: "#6f5136",
  olive: "#9aa87e",
  oliveDark: "#7d8b60",
  lemonLeaf: "#5d7a4a",
  lemon: "#ecc954",
  pergolaWood: "#8a6a48",
  wisteria: "#b79ac6",
  sign: "#8a6a48",
  flowerPink: "#d8a48f",
  flowerWhite: "#f9f5ea",
};

type Ctx = CanvasRenderingContext2D;

/** A 2px checkered dither row blending two color bands. */
function ditherRow(ctx: Ctx, x: number, y: number, w: number, color: string, px = 3) {
  ctx.fillStyle = color;
  for (let i = 0; i < w / (px * 2); i++) {
    ctx.fillRect(x + i * px * 2, y, px, px);
    ctx.fillRect(x + i * px * 2 + px, y + px, px, px);
  }
}

export function drawSky(ctx: Ctx, w: number, h: number) {
  const midY = h * 0.42;
  const horizonY = h * 0.62;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, PALETTE.skyTop);
  grad.addColorStop(midY / h, PALETTE.skyMid);
  grad.addColorStop(Math.min(1, horizonY / h), PALETTE.skyBottom);
  grad.addColorStop(1, PALETTE.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  // pixel dither bands between the gradient stops keep it looking hand-made
  ditherRow(ctx, 0, midY - 10, w, PALETTE.skyTop);
  ditherRow(ctx, 0, midY + 8, w, PALETTE.skyMid);
  ditherRow(ctx, 0, horizonY - 8, w, PALETTE.skyMid);
}

export function drawSun(ctx: Ctx, x: number, y: number, r: number) {
  // layered golden-hour glow
  ctx.fillStyle = "rgba(255, 227, 161, 0.16)";
  ctx.beginPath();
  ctx.arc(x, y, r * 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 227, 161, 0.3)";
  ctx.beginPath();
  ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 227, 161, 0.5)";
  ctx.beginPath();
  ctx.arc(x, y, r * 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.sun;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCloud(ctx: Ctx, x: number, y: number, s: number) {
  ctx.fillStyle = PALETTE.cloud;
  ctx.fillRect(x, y + s, s * 5, s * 2);
  ctx.fillRect(x + s, y, s * 3, s);
  ctx.fillRect(x + s * 0.5, y + s * 0.5, s * 4, s);
  // warm underside catching the low sun
  ctx.fillStyle = "rgba(246, 196, 143, 0.55)";
  ctx.fillRect(x + s * 0.5, y + s * 2.6, s * 4, s * 0.4);
}

export function drawMountains(ctx: Ctx, w: number, y: number, offset: number, far: boolean) {
  const base = far ? PALETTE.mountainFar : PALETTE.mountainNear;
  const peakW = far ? 260 : 340;
  const peakH = far ? 90 : 130;
  for (let x = -peakW + (offset % peakW) - peakW; x < w + peakW; x += peakW) {
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + peakW / 2, y - peakH);
    ctx.lineTo(x + peakW, y);
    ctx.closePath();
    ctx.fill();
    // sun-facing ridge highlight (light comes from the right)
    ctx.fillStyle = "rgba(246, 196, 143, 0.35)";
    ctx.beginPath();
    ctx.moveTo(x + peakW / 2, y - peakH);
    ctx.lineTo(x + peakW / 2 + peakW * 0.12, y - peakH * 0.55);
    ctx.lineTo(x + peakW / 2 + peakW * 0.05, y - peakH * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = base;
  ctx.fillRect(0, y, w, 4);
}

/**
 * Water with animated shimmer. Pass `sunX` (canvas-space) to add a warm
 * reflection column under the sun; elsewhere the shimmer stays cool.
 */
export function drawWater(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  sunX?: number
) {
  ctx.fillStyle = PALETTE.lake;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.lakeDeep;
  ctx.fillRect(x, y + h * 0.45, w, h * 0.55);
  ditherRow(ctx, x, y + h * 0.45 - 3, w, PALETTE.lake);
  // animated shimmer stripes
  const phase = Math.floor(t / 400);
  for (let i = 0; i < Math.floor(w / 46); i++) {
    const sx = x + i * 46 + ((phase + i) % 2) * 10;
    const sy = y + 8 + ((i * 37) % Math.max(1, h - 16));
    const nearSun = sunX !== undefined && Math.abs(sx - sunX) < 70;
    ctx.fillStyle = nearSun ? PALETTE.lakeShine : PALETTE.lakeShineCool;
    ctx.fillRect(sx, sy, 18, 3);
  }
  // dense golden reflection column directly under the sun
  if (sunX !== undefined && sunX + 40 > x && sunX - 40 < x + w) {
    ctx.fillStyle = PALETTE.lakeShine;
    for (let row = 0; row < Math.floor(h / 9); row++) {
      const wobble = ((phase + row) % 3) * 4 - 4;
      const rw = Math.max(6, 34 - row * 2);
      ctx.fillRect(sunX - rw / 2 + wobble, y + 4 + row * 9, rw, 3);
    }
  }
}

export function drawCypress(ctx: Ctx, x: number, baseY: number, height: number) {
  const w = Math.max(10, height * 0.22);
  ctx.fillStyle = PALETTE.trunk;
  ctx.fillRect(x - 2, baseY - 8, 4, 8);
  const layers = 6;
  for (let i = 0; i < layers; i++) {
    const ly = baseY - 8 - ((height - 8) / layers) * (i + 1);
    const lw = w * (1 - i / layers) + 4;
    ctx.fillStyle = i % 2 === 0 ? PALETTE.cypress : PALETTE.cypressDark;
    ctx.fillRect(x - lw / 2, ly, lw, (height - 8) / layers + 2);
    // warm rim light on the sun side
    ctx.fillStyle = "rgba(246, 196, 143, 0.25)";
    ctx.fillRect(x + lw / 2 - 2, ly + 1, 2, (height - 8) / layers - 2);
  }
  ctx.fillStyle = PALETTE.cypress;
  ctx.fillRect(x - 2, baseY - height - 4, 4, 6);
}

export function drawOliveTree(ctx: Ctx, x: number, baseY: number, s: number) {
  // gnarled trunk
  ctx.fillStyle = PALETTE.trunk;
  ctx.fillRect(x - 2 * s, baseY - 10 * s, 4 * s, 10 * s);
  ctx.fillRect(x - 4 * s, baseY - 14 * s, 4 * s, 5 * s);
  ctx.fillRect(x + 1 * s, baseY - 13 * s, 4 * s, 4 * s);
  // three overlapping silvery canopies
  const blob = (bx: number, by: number, bw: number, bh: number, dark: boolean) => {
    ctx.fillStyle = dark ? PALETTE.oliveDark : PALETTE.olive;
    ctx.fillRect(bx - bw / 2, by - bh / 2, bw, bh);
    ctx.fillRect(bx - bw / 2 + 2 * s, by - bh / 2 - 2 * s, bw - 4 * s, 2 * s);
    ctx.fillRect(bx - bw / 2 + 2 * s, by + bh / 2, bw - 4 * s, 2 * s);
  };
  blob(x - 5 * s, baseY - 16 * s, 12 * s, 8 * s, true);
  blob(x + 5 * s, baseY - 17 * s, 12 * s, 8 * s, false);
  blob(x, baseY - 21 * s, 13 * s, 8 * s, false);
  // dapple
  ctx.fillStyle = PALETTE.oliveDark;
  ctx.fillRect(x - 3 * s, baseY - 22 * s, 2 * s, s);
  ctx.fillRect(x + 3 * s, baseY - 19 * s, 2 * s, s);
  ctx.fillRect(x - 6 * s, baseY - 17 * s, 2 * s, s);
}

export function drawLemonTree(ctx: Ctx, x: number, baseY: number, s: number) {
  ctx.fillStyle = PALETTE.trunk;
  ctx.fillRect(x - 1.5 * s, baseY - 9 * s, 3 * s, 9 * s);
  // dense dark canopy
  ctx.fillStyle = PALETTE.lemonLeaf;
  ctx.fillRect(x - 7 * s, baseY - 19 * s, 14 * s, 11 * s);
  ctx.fillRect(x - 5 * s, baseY - 22 * s, 10 * s, 4 * s);
  ctx.fillRect(x - 9 * s, baseY - 16 * s, 2 * s, 6 * s);
  ctx.fillRect(x + 7 * s, baseY - 16 * s, 2 * s, 6 * s);
  // lemons
  ctx.fillStyle = PALETTE.lemon;
  const lemons: [number, number][] = [
    [-5, -18],
    [1, -20],
    [5, -16],
    [-2, -13],
    [4, -11],
    [-6, -11],
  ];
  for (const [lx, ly] of lemons) {
    ctx.fillRect(x + lx * s, baseY + ly * s, 2 * s, 2 * s);
  }
}

export function drawPergola(ctx: Ctx, x: number, baseY: number, w: number) {
  const h = 64;
  const postW = 6;
  // posts
  ctx.fillStyle = PALETTE.pergolaWood;
  ctx.fillRect(x, baseY - h, postW, h);
  ctx.fillRect(x + w - postW, baseY - h, postW, h);
  if (w > 140) ctx.fillRect(x + w / 2 - postW / 2, baseY - h, postW, h);
  // beams
  ctx.fillRect(x - 8, baseY - h, w + 16, 5);
  for (let bx = x - 4; bx < x + w + 4; bx += 18) {
    ctx.fillRect(bx, baseY - h - 5, 6, 5);
  }
  // wisteria clusters hanging from the beam
  ctx.fillStyle = PALETTE.wisteria;
  for (let i = 0; i < w / 24; i++) {
    const wx = x + 8 + i * 24;
    const drop = 8 + ((i * 13) % 10);
    ctx.fillRect(wx, baseY - h + 5, 4, drop);
    ctx.fillRect(wx - 2, baseY - h + 5, 8, drop * 0.5);
  }
  // festoon string lights between the posts
  ctx.fillStyle = PALETTE.windowGlow;
  const sag = 8;
  for (let i = 0; i <= 8; i++) {
    const p = i / 8;
    const lx = x + p * w;
    const ly = baseY - h + 16 + Math.sin(p * Math.PI) * sag;
    ctx.fillRect(lx, ly, 3, 3);
  }
}

export function drawTerraceWall(ctx: Ctx, x: number, y: number, w: number) {
  ctx.fillStyle = PALETTE.stone;
  ctx.fillRect(x, y, w, 10);
  ctx.fillStyle = PALETTE.stoneDark;
  for (let i = 0; i < w / 16; i++) {
    ctx.fillRect(x + i * 16 + (i % 2) * 6, y + 4, 10, 2);
  }
  ctx.fillRect(x, y + 9, w, 1);
}

export function drawBoat(ctx: Ctx, x: number, waterY: number, t: number) {
  const bob = Math.sin(t / 700) > 0 ? 1 : 0;
  const y = waterY + bob;
  // hull
  ctx.fillStyle = PALETTE.pergolaWood;
  ctx.fillRect(x - 16, y, 32, 6);
  ctx.fillRect(x - 12, y + 6, 24, 3);
  // mast + furled sail
  ctx.fillStyle = PALETTE.trunk;
  ctx.fillRect(x - 1, y - 22, 2, 22);
  ctx.fillStyle = PALETTE.flowerWhite;
  ctx.fillRect(x + 1, y - 20, 10, 12);
  ctx.fillRect(x + 1, y - 8, 6, 3);
}

export function drawBirds(ctx: Ctx, x: number, y: number, t: number) {
  ctx.fillStyle = "rgba(37, 46, 32, 0.55)";
  const flap = Math.floor(t / 300) % 2;
  const bird = (bx: number, by: number) => {
    ctx.fillRect(bx - 3, by + (flap ? -1 : 1), 3, 1);
    ctx.fillRect(bx + 1, by + (flap ? -1 : 1), 3, 1);
    ctx.fillRect(bx - 1, by, 2, 1);
  };
  bird(x, y);
  bird(x + 22, y + 6);
  bird(x + 40, y - 4);
  bird(x + 12, y + 14);
}

export function drawVilla(ctx: Ctx, x: number, baseY: number, scale: number) {
  const w = 190 * scale;
  const h = 150 * scale;
  const top = baseY - h;

  // stone base terrace with balustrade
  ctx.fillStyle = PALETTE.stone;
  ctx.fillRect(x - 14 * scale, baseY - 12 * scale, w + 28 * scale, 12 * scale);
  ctx.fillStyle = PALETTE.stoneDark;
  for (let i = 0; i < (w + 28 * scale) / (14 * scale); i++) {
    ctx.fillRect(x - 14 * scale + i * 14 * scale, baseY - 6 * scale, 10 * scale, 2 * scale);
  }
  // balustrade posts along the terrace edge
  ctx.fillStyle = PALETTE.stone;
  for (let i = 0; i < (w + 28 * scale) / (10 * scale); i++) {
    ctx.fillRect(x - 14 * scale + i * 10 * scale, baseY - 18 * scale, 3 * scale, 6 * scale);
  }
  ctx.fillRect(x - 14 * scale, baseY - 20 * scale, w + 28 * scale, 3 * scale);

  // walls
  ctx.fillStyle = PALETTE.villaWall;
  ctx.fillRect(x, top, w, h - 12 * scale);
  ctx.fillStyle = PALETTE.villaWallShade;
  ctx.fillRect(x + w - 16 * scale, top, 16 * scale, h - 12 * scale);

  // climbing vine on the left wall
  ctx.fillStyle = PALETTE.oliveDark;
  ctx.fillRect(x + 2 * scale, top + 20 * scale, 3 * scale, h - 40 * scale);
  ctx.fillRect(x + 5 * scale, top + 34 * scale, 5 * scale, 3 * scale);
  ctx.fillRect(x + 5 * scale, top + 62 * scale, 7 * scale, 3 * scale);
  ctx.fillRect(x + 5 * scale, top + 92 * scale, 5 * scale, 3 * scale);

  // roof
  ctx.fillStyle = PALETTE.roof;
  ctx.fillRect(x - 8 * scale, top - 10 * scale, w + 16 * scale, 12 * scale);
  ctx.fillRect(x - 4 * scale, top - 16 * scale, w + 8 * scale, 8 * scale);

  // the tower (Villa Sostaga's signature), rising behind the right side
  const tw = 40 * scale;
  const tx = x + w - 62 * scale;
  const tTop = top - 58 * scale;
  ctx.fillStyle = PALETTE.villaWall;
  ctx.fillRect(tx, tTop, tw, 58 * scale);
  ctx.fillStyle = PALETTE.villaWallShade;
  ctx.fillRect(tx + tw - 8 * scale, tTop, 8 * scale, 58 * scale);
  ctx.fillStyle = PALETTE.roof;
  ctx.fillRect(tx - 5 * scale, tTop - 8 * scale, tw + 10 * scale, 10 * scale);
  ctx.fillRect(tx - 2 * scale, tTop - 13 * scale, tw + 4 * scale, 6 * scale);
  // arched tower window, glowing
  const twx = tx + tw / 2 - 6 * scale;
  ctx.fillStyle = PALETTE.windowGlow;
  ctx.fillRect(twx, tTop + 14 * scale, 12 * scale, 16 * scale);
  ctx.fillRect(twx + 2 * scale, tTop + 11 * scale, 8 * scale, 3 * scale);

  // windows with green shutters, 3 floors x 4 columns — golden hour glow
  const winW = 14 * scale;
  const winH = 22 * scale;
  for (let fl = 0; fl < 3; fl++) {
    for (let col = 0; col < 4; col++) {
      const wx = x + 14 * scale + col * 42 * scale;
      const wy = top + 12 * scale + fl * 42 * scale;
      ctx.fillStyle = PALETTE.shutter;
      ctx.fillRect(wx - 5 * scale, wy, 5 * scale, winH);
      ctx.fillRect(wx + winW, wy, 5 * scale, winH);
      // lit window
      ctx.fillStyle = PALETTE.windowGlow;
      ctx.fillRect(wx, wy, winW, winH);
      // arched top (stepped pixels)
      ctx.fillRect(wx + 2 * scale, wy - 3 * scale, winW - 4 * scale, 3 * scale);
      // mullions
      ctx.fillStyle = "#d9b26a";
      ctx.fillRect(wx, wy + winH / 2 - scale, winW, 2 * scale);
      ctx.fillRect(wx + winW / 2 - scale, wy, 2 * scale, winH);
    }
  }

  // door with little porch arch
  const dx = x + w / 2 - 11 * scale;
  const dy = baseY - 12 * scale - 30 * scale;
  ctx.fillStyle = PALETTE.roof;
  ctx.fillRect(dx - 6 * scale, dy - 6 * scale, 34 * scale, 6 * scale);
  ctx.fillStyle = PALETTE.shutter;
  ctx.fillRect(dx, dy, 22 * scale, 30 * scale);
  ctx.fillRect(dx + 3 * scale, dy - 3 * scale, 16 * scale, 3 * scale);
  ctx.fillStyle = PALETTE.windowGlow;
  ctx.fillRect(dx + 16 * scale, dy + 13 * scale, 3 * scale, 3 * scale);
}

export function drawSign(ctx: Ctx, x: number, baseY: number, text: string) {
  ctx.fillStyle = PALETTE.trunk;
  ctx.fillRect(x - 3, baseY - 34, 6, 34);
  ctx.fillStyle = PALETTE.sign;
  const w = Math.max(84, text.length * 7 + 16);
  ctx.fillRect(x - w / 2, baseY - 56, w, 24);
  ctx.fillStyle = "#f5ecd8";
  ctx.font = "500 13px 'Cormorant', Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, baseY - 43);
}

export function drawBush(ctx: Ctx, x: number, baseY: number, s: number) {
  ctx.fillStyle = PALETTE.grassDark;
  ctx.fillRect(x, baseY - s, s * 2.2, s);
  ctx.fillRect(x + s * 0.4, baseY - s * 1.5, s * 1.4, s * 0.7);
  ctx.fillStyle = PALETTE.flowerPink;
  ctx.fillRect(x + s * 0.3, baseY - s * 0.8, 3, 3);
  ctx.fillRect(x + s * 1.6, baseY - s * 1.2, 3, 3);
  ctx.fillStyle = PALETTE.flowerWhite;
  ctx.fillRect(x + s, baseY - s * 0.5, 3, 3);
}

export function drawGrass(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = PALETTE.grass;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.grassDark;
  for (let i = 0; i < w / 34; i++) {
    const gx = x + i * 34 + ((i * 13) % 17);
    const gy = y + 6 + ((i * 29) % Math.max(1, h - 12));
    ctx.fillRect(gx, gy, 8, 2);
  }
}

export function drawPath(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = PALETTE.path;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.pathEdge;
  ctx.fillRect(x, y, w, 3);
  ctx.fillRect(x, y + h - 3, w, 3);
  for (let i = 0; i < w / 40; i++) {
    ctx.fillRect(x + i * 40 + 12, y + h / 2 - 1, 16, 2);
  }
}
