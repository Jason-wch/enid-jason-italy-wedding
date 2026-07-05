/**
 * Procedural pixel-art scenery for the Lake Garda scenes: sky, mountains,
 * lake water, the yellow villa with green shutters, cypress trees, signs.
 * All drawing uses chunky rects on a low-res canvas scaled up (pixelated).
 */

export const PALETTE = {
  skyTop: "#aed7f0",
  skyBottom: "#e8f4ea",
  sun: "#ffe9a8",
  cloud: "#ffffff",
  mountainFar: "#b9c9d6",
  mountainNear: "#8fa8b8",
  lake: "#6fa8c9",
  lakeDeep: "#4a86ab",
  lakeShine: "#a8d2e8",
  grass: "#8fb56a",
  grassDark: "#6f9450",
  path: "#d9c9a3",
  pathEdge: "#bfa87c",
  stone: "#a89a88",
  stoneDark: "#8a7d6c",
  villaWall: "#e8b64c",
  villaWallShade: "#cf9c38",
  shutter: "#3e6b4f",
  roof: "#b3593e",
  cypress: "#3d5a3a",
  cypressDark: "#2e4630",
  trunk: "#6b4a2f",
  sign: "#8a6b47",
  flowerPink: "#e88ab8",
  flowerWhite: "#f7f3ea",
};

type Ctx = CanvasRenderingContext2D;

export function drawSky(ctx: Ctx, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, PALETTE.skyTop);
  grad.addColorStop(1, PALETTE.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

export function drawSun(ctx: Ctx, x: number, y: number, r: number) {
  ctx.fillStyle = PALETTE.sun;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,233,168,0.35)";
  ctx.beginPath();
  ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCloud(ctx: Ctx, x: number, y: number, s: number) {
  ctx.fillStyle = PALETTE.cloud;
  ctx.fillRect(x, y + s, s * 5, s * 2);
  ctx.fillRect(x + s, y, s * 3, s);
  ctx.fillRect(x + s * 0.5, y + s * 0.5, s * 4, s);
}

export function drawMountains(ctx: Ctx, w: number, y: number, offset: number, far: boolean) {
  ctx.fillStyle = far ? PALETTE.mountainFar : PALETTE.mountainNear;
  const peakW = far ? 260 : 340;
  const peakH = far ? 90 : 130;
  for (let x = -peakW + (offset % peakW) - peakW; x < w + peakW; x += peakW) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + peakW / 2, y - peakH);
    ctx.lineTo(x + peakW, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillRect(0, y, w, 4);
}

export function drawWater(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  ctx.fillStyle = PALETTE.lake;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.lakeDeep;
  ctx.fillRect(x, y + h * 0.45, w, h * 0.55);
  // animated shimmer stripes
  ctx.fillStyle = PALETTE.lakeShine;
  const phase = Math.floor(t / 400);
  for (let i = 0; i < Math.floor(w / 46); i++) {
    const sx = x + i * 46 + ((phase + i) % 2) * 10;
    const sy = y + 8 + ((i * 37) % Math.max(1, h - 16));
    ctx.fillRect(sx, sy, 18, 3);
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
  }
  ctx.fillStyle = PALETTE.cypress;
  ctx.fillRect(x - 2, baseY - height - 4, 4, 6);
}

export function drawVilla(ctx: Ctx, x: number, baseY: number, scale: number) {
  const w = 190 * scale;
  const h = 150 * scale;
  const top = baseY - h;

  // stone base terrace
  ctx.fillStyle = PALETTE.stone;
  ctx.fillRect(x - 14 * scale, baseY - 12 * scale, w + 28 * scale, 12 * scale);
  ctx.fillStyle = PALETTE.stoneDark;
  for (let i = 0; i < (w + 28 * scale) / (14 * scale); i++) {
    ctx.fillRect(x - 14 * scale + i * 14 * scale, baseY - 6 * scale, 10 * scale, 2 * scale);
  }

  // walls
  ctx.fillStyle = PALETTE.villaWall;
  ctx.fillRect(x, top, w, h - 12 * scale);
  ctx.fillStyle = PALETTE.villaWallShade;
  ctx.fillRect(x + w - 16 * scale, top, 16 * scale, h - 12 * scale);

  // roof
  ctx.fillStyle = PALETTE.roof;
  ctx.fillRect(x - 8 * scale, top - 10 * scale, w + 16 * scale, 12 * scale);
  ctx.fillRect(x - 4 * scale, top - 16 * scale, w + 8 * scale, 8 * scale);

  // windows with green shutters, 3 floors x 4 columns
  const winW = 14 * scale;
  const winH = 22 * scale;
  for (let fl = 0; fl < 3; fl++) {
    for (let col = 0; col < 4; col++) {
      const wx = x + 14 * scale + col * 42 * scale;
      const wy = top + 12 * scale + fl * 42 * scale;
      ctx.fillStyle = PALETTE.shutter;
      ctx.fillRect(wx - 5 * scale, wy, 5 * scale, winH);
      ctx.fillRect(wx + winW, wy, 5 * scale, winH);
      ctx.fillStyle = "#e6f2f7";
      ctx.fillRect(wx, wy, winW, winH);
      ctx.fillStyle = "#9db8c6";
      ctx.fillRect(wx, wy + winH / 2 - scale, winW, 2 * scale);
      ctx.fillRect(wx + winW / 2 - scale, wy, 2 * scale, winH);
    }
  }

  // door with little porch roof
  const dx = x + w / 2 - 11 * scale;
  const dy = baseY - 12 * scale - 30 * scale;
  ctx.fillStyle = PALETTE.roof;
  ctx.fillRect(dx - 6 * scale, dy - 6 * scale, 34 * scale, 6 * scale);
  ctx.fillStyle = PALETTE.shutter;
  ctx.fillRect(dx, dy, 22 * scale, 30 * scale);
  ctx.fillStyle = "#f5e9c8";
  ctx.fillRect(dx + 16 * scale, dy + 13 * scale, 3 * scale, 3 * scale);
}

export function drawSign(ctx: Ctx, x: number, baseY: number, text: string) {
  ctx.fillStyle = PALETTE.trunk;
  ctx.fillRect(x - 3, baseY - 34, 6, 34);
  ctx.fillStyle = PALETTE.sign;
  const w = Math.max(84, text.length * 7 + 16);
  ctx.fillRect(x - w / 2, baseY - 56, w, 24);
  ctx.fillStyle = "#f5ecd8";
  ctx.font = "600 13px 'Playfair Display', Georgia, serif";
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
