/**
 * 8-bit Lake Garda scenery at golden hour, drawn CryptoPunks-style: fat
 * pixels, flat colors, hard edges. A bright yellow-glow sky over amber
 * mountains, sparkling blue water, and the sunny Villa Sostaga — plus Maple
 * staples: stepped clouds, floating grass islands, ladders, glossy orange
 * mushrooms and wooden arrow signs.
 *
 * Everything snaps to a PX-sized texel grid (≈160x90 virtual resolution).
 */

export const PALETTE = {
  // Golden-hour sky (top → horizon glow)
  skyTop: "#ffb84d",
  skyMid: "#ffd985",
  skyBottom: "#fff9d6",
  sun: "#fff3b0",
  cloud: "#fff4dd",
  cloudShade: "#f2d5a4",
  cloudLit: "#fffcf0",
  // Distant scenery — amber haze mountains, sunlit hills
  mountainFar: "#d99a4e",
  mountainNear: "#c07f3e",
  hill: "#7dbb4f",
  hillDark: "#5f9c3a",
  // Water — bright blue with golden glints
  lake: "#4aa3d8",
  lakeDeep: "#2a7ab8",
  lakeShine: "#fff3b0",
  lakeShineCool: "#bfe4f8",
  // Ground — sunlit grass over warm soil
  grass: "#85c554",
  grassDark: "#5da23c",
  grassLip: "#c6e07a",
  soil: "#a9713d",
  soilDark: "#7c4e26",
  gravel: "#ecd9ac",
  gravelEdge: "#c8a878",
  stone: "#c3b49a",
  stoneDark: "#a08e72",
  // Villa Sostaga — golden walls in the evening light
  villaWall: "#f7c454",
  villaWallShade: "#d69e2f",
  villaTrim: "#fff3d6",
  windowGlow: "#ffe9a8",
  shutter: "#2e6041",
  shutterDark: "#224731",
  roof: "#c26a45",
  roofDark: "#96482c",
  roofLight: "#d98a5f",
  // Gazebo
  canopy: "#f7edd6",
  canopyShade: "#dcc79e",
  gazeboFrame: "#3a614b",
  glass: "#ffe2a0",
  // Flora
  cypress: "#2f6b40",
  cypressDark: "#245231",
  cypressLight: "#4b8f57",
  trunk: "#8a5a33",
  trunkDark: "#68431f",
  leaf: "#4e9b3c",
  leafMid: "#67b84a",
  leafLight: "#93d666",
  olive: "#9dbb77",
  oliveDark: "#7b9c58",
  pot: "#c26744",
  potDark: "#9c4c2f",
  flowerRed: "#e0484b",
  flowerPink: "#f08aa8",
  flowerWhite: "#ffffff",
  // Props
  wood: "#a9713d",
  woodLight: "#c99257",
  mushroomCap: "#f5921e",
  mushroomSpot: "#ffe3b8",
  mushroomStalk: "#f6e7c8",
  outline: "rgba(80, 50, 20, 0.5)",
};

type Ctx = CanvasRenderingContext2D;

/** Texel size — fat 8-bit pixels on a 6px grid (≈160x90 virtual). */
const PX = 6;

const snap = (v: number) => Math.round(v / PX) * PX;

/** Fills a rect snapped to the texel grid (always at least one texel). */
function px(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  const x0 = snap(x);
  const y0 = snap(y);
  const x1 = snap(x + w);
  const y1 = snap(y + h);
  ctx.fillStyle = color;
  ctx.fillRect(x0, y0, Math.max(PX, x1 - x0), Math.max(PX, y1 - y0));
}

/** Rect with 1-texel stepped corners — the pixel "rounded block". */
function block(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  px(ctx, x + PX, y, w - 2 * PX, h, color);
  px(ctx, x, y + PX, w, h - 2 * PX, color);
}

/* ---------------------------------------------------------------------------
   Sky & backdrop
--------------------------------------------------------------------------- */

const SKY_BANDS: [number, string][] = [
  [0.0, "#ffb84d"],
  [0.2, "#ffc766"],
  [0.42, "#ffd985"],
  [0.62, "#ffe8a4"],
  [0.8, "#fff3bd"],
  [0.92, "#fff9d6"],
];

/** Flat banded golden-hour sky — hard 8-bit seams, no dithering. */
export function drawSky(ctx: Ctx, w: number, h: number) {
  for (let i = 0; i < SKY_BANDS.length; i++) {
    const [f, color] = SKY_BANDS[i];
    const next = i + 1 < SKY_BANDS.length ? SKY_BANDS[i + 1][0] : 1;
    const y0 = snap(f * h);
    const y1 = i + 1 < SKY_BANDS.length ? snap(next * h) : h;
    ctx.fillStyle = color;
    ctx.fillRect(0, y0, w, Math.max(PX, y1 - y0));
  }
}

/** Big bright pixel sun pouring yellow glow across the sky. */
export function drawSun(ctx: Ctx, x: number, y: number, r: number) {
  // wide banded glow
  ctx.globalAlpha = 0.2;
  pixelCircle(ctx, x, y, r * 2.4, "#fff3b0");
  ctx.globalAlpha = 0.3;
  pixelCircle(ctx, x, y, r * 1.6, "#fff7c9");
  ctx.globalAlpha = 1;
  pixelCircle(ctx, x, y, r, PALETTE.sun);
  pixelCircle(ctx, x - r * 0.2, y - r * 0.25, r * 0.55, "#fffbe0");
  // golden rim on the lower edge
  for (let yy = r * 0.55; yy < r; yy += PX) {
    const hw = Math.sqrt(Math.max(0, r * r - yy * yy));
    px(ctx, x - hw, y + yy, hw * 2, PX, "#ffd95e");
  }
}

function pixelCircle(ctx: Ctx, x: number, y: number, r: number, color: string) {
  for (let yy = -r; yy < r; yy += PX) {
    const mid = yy + PX / 2;
    const hw = Math.sqrt(Math.max(0, r * r - mid * mid));
    if (hw < PX / 2) continue;
    px(ctx, x - hw, y + yy, hw * 2, PX, color);
  }
}

/** Stepped Maple cloud — bright cream lit by the golden sun. */
export function drawCloud(ctx: Ctx, x: number, y: number, s: number) {
  px(ctx, x + s * 1.8, y, s * 2.6, s * 0.9, PALETTE.cloudLit);
  px(ctx, x + s * 0.6, y + s * 0.9, s * 4.6, s, PALETTE.cloud);
  px(ctx, x + s * 3.6, y + s * 0.9, s * 1.6, s, PALETTE.cloudLit);
  px(ctx, x, y + s * 1.9, s * 6, s, PALETTE.cloud);
  px(ctx, x + s * 0.4, y + s * 2.9, s * 5.2, s * 0.7, PALETTE.cloudShade);
}

/** Two-frame pixel birds crossing the golden sky. */
export function drawBirds(ctx: Ctx, x: number, y: number, t: number) {
  const up = Math.floor(t / 260) % 2 === 0;
  const c = "rgba(90, 60, 30, 0.75)";
  const bird = (bx: number, by: number) => {
    if (up) {
      px(ctx, bx - 6, by - 3, 3, 3, c);
      px(ctx, bx - 3, by, 6, 3, c);
      px(ctx, bx + 3, by - 3, 3, 3, c);
    } else {
      px(ctx, bx - 6, by + 2, 3, 3, c);
      px(ctx, bx - 3, by, 6, 3, c);
      px(ctx, bx + 3, by + 2, 3, 3, c);
    }
  };
  bird(x, y);
  bird(x + 24, y + 7);
  bird(x + 44, y - 5);
}

/**
 * Background ridges. `far` = amber-hazed pre-Alps with a bright rim light;
 * otherwise rolling sunlit hills right behind the playfield.
 */
export function drawMountains(ctx: Ctx, w: number, y: number, offset: number, far: boolean) {
  if (far) {
    const peakW = 340;
    for (let x = (offset % peakW) - peakW * 2; x < w + peakW; x += peakW) {
      steppedPeak(ctx, x + peakW * 0.38, y, 118, peakW * 0.62, PALETTE.mountainFar);
      steppedPeak(ctx, x + peakW * 0.82, y, 86, peakW * 0.5, PALETTE.mountainFar);
    }
    ctx.fillStyle = PALETTE.mountainFar;
    ctx.fillRect(0, snap(y) - PX, w, PX * 2);
    // golden haze where the sky meets the water
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#fff3bd";
    ctx.fillRect(0, snap(y) - PX * 3, w, PX * 3);
    ctx.globalAlpha = 0.18;
    ctx.fillRect(0, snap(y) - PX * 6, w, PX * 3);
    ctx.globalAlpha = 1;
    return;
  }
  const humpW = 300;
  for (let i = -2; i < Math.ceil(w / humpW) + 2; i++) {
    const x = (offset % humpW) + i * humpW;
    const color = i % 2 === 0 ? PALETTE.hill : PALETTE.hillDark;
    for (let yy = y - 80; yy < y + 10; yy += PX) {
      const frac = (yy - (y - 80)) / 90;
      const hw = (humpW / 2) * Math.sqrt(Math.max(0, 1 - (1 - frac) * (1 - frac)));
      px(ctx, x + humpW / 2 - hw, yy, hw * 2, PX, color);
    }
  }
  ctx.fillStyle = PALETTE.hillDark;
  ctx.fillRect(0, snap(y) + PX, w, PX * 3);
}

/** Stepped pixel triangle with a sunlit rim on the top rows. */
function steppedPeak(ctx: Ctx, apexX: number, baseY: number, h: number, baseW: number, color: string) {
  for (let yy = baseY - h; yy < baseY; yy += PX) {
    const frac = (yy - (baseY - h)) / h;
    const hw = Math.max(PX / 2, (baseW / 2) * frac);
    px(ctx, apexX - hw, yy, hw * 2, PX, frac < 0.16 ? "#ffe9a0" : color);
  }
}

/* ---------------------------------------------------------------------------
   Water
--------------------------------------------------------------------------- */

/** Bright blue lake with a golden sun column and stepped retro glints. */
export function drawWater(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  sunX?: number
) {
  // flat banded depth — hard 8-bit seams
  px(ctx, x, y, w, h * 0.3, PALETTE.lake);
  px(ctx, x, y + h * 0.3, w, h * 0.32, "#3a8fc9");
  px(ctx, x, y + h * 0.62, w, h - h * 0.62, PALETTE.lakeDeep);

  // golden column under the sun
  if (sunX !== undefined && sunX > x - 120 && sunX < x + w + 120) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.globalAlpha = 0.2;
    px(ctx, sunX - 45, y, 90, h, "#fff3b0");
    ctx.globalAlpha = 0.35;
    px(ctx, sunX - 18, y, 36, h, "#ffe79e");
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // surface lip
  px(ctx, x, y, w, PX, PALETTE.lakeShineCool);

  // stepped glints that tick like retro water
  const tt = Math.floor(t / 240);
  for (let i = 0; i < Math.floor(w / 46); i++) {
    const gx = x + i * 46 + 8 + (((i * 17 + tt) % 5) - 2) * PX;
    const gy = y + PX * 2 + ((i * 41) % Math.max(PX, h - PX * 4));
    const nearSun = sunX !== undefined && Math.abs(gx - sunX) < 90;
    ctx.globalAlpha = (i + tt) % 3 === 0 ? 0.4 : 0.75;
    px(ctx, gx, gy, 15, PX, nearSun ? PALETTE.lakeShine : PALETTE.lakeShineCool);
    px(ctx, gx + 18, gy - PX, 9, PX, PALETTE.lakeShineCool);
    ctx.globalAlpha = 1;
  }
}

/* ---------------------------------------------------------------------------
   Ground
--------------------------------------------------------------------------- */

/** Sunlit grass with a bright lip over warm soil — the Maple ground block. */
export function drawGrass(ctx: Ctx, x: number, y: number, w: number, h: number) {
  // soil, darker with depth — flat 8-bit bands
  px(ctx, x, y, w, h, PALETTE.soil);
  px(ctx, x, y + h * 0.45, w, h - h * 0.45, PALETTE.soilDark);
  // buried stones
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < w / 46; i++) {
    const gx = x + i * 46 + ((i * 17) % 23);
    const gy = y + 26 + ((i * 31) % Math.max(PX, h - 34));
    px(ctx, gx, gy, PX * 2, PX, "#e8cfa0");
  }
  ctx.globalAlpha = 1;
  // grass band with pixel tufts hanging over the soil
  px(ctx, x, y, w, 15, PALETTE.grass);
  for (let gx = snap(x); gx < x + w - 6; gx += 12) {
    px(ctx, gx + 3, y + 15, 6, 3, PALETTE.grass);
  }
  // bright sunset lip
  px(ctx, x, y, w, PX, PALETTE.grassLip);
  // darker blade clumps
  for (let i = 0; i < w / 34; i++) {
    const gx = x + i * 34 + ((i * 11) % 13);
    px(ctx, gx, y + 9, 9, PX, PALETTE.grassDark);
  }
}

/** Warm gravel driveway strip (Villa Sostaga's forecourt). */
export function drawGravel(ctx: Ctx, x: number, y: number, w: number, h: number) {
  px(ctx, x, y, w, h, PALETTE.gravel);
  px(ctx, x, y, w, PX, PALETTE.gravelEdge);
  px(ctx, x, y + h - PX, w, PX, PALETTE.gravelEdge);
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < w / 26; i++) {
    const gx = x + i * 26 + ((i * 13) % 17);
    const gy = y + 4 + ((i * 7) % Math.max(PX, h - 8));
    px(ctx, gx, gy, PX, PX, PALETTE.gravelEdge);
  }
  ctx.globalAlpha = 1;
}

/* ---------------------------------------------------------------------------
   Villa Sostaga — the iconic yellow villa, windows lit at dusk
--------------------------------------------------------------------------- */

/**
 * The yellow villa from the photos: three floors of green-shuttered windows,
 * wide terracotta hip roof, porch with steps and potted olive trees.
 * Width ~240*s, height ~185*s above baseY.
 */
export function drawVilla(ctx: Ctx, x: number, baseY: number, s: number) {
  const W = 240 * s;
  const wallH = 150 * s;
  const top = baseY - wallH;
  const cx = x + W / 2;

  // ---- walls (sunlit face, flat shaded right edge)
  px(ctx, x, top, W, wallH, PALETTE.villaWall);
  px(ctx, x + W - 20 * s, top, 20 * s, wallH, PALETTE.villaWallShade);

  // string courses between floors + stone plinth
  ctx.globalAlpha = 0.8;
  px(ctx, x, top + 48 * s, W, PX, PALETTE.villaTrim);
  px(ctx, x, top + 98 * s, W, PX, PALETTE.villaTrim);
  ctx.globalAlpha = 1;
  px(ctx, x, baseY - 7 * s, W, 7 * s, "#c4ad84");

  // ---- stepped hip roof with banded tiles
  px(ctx, x - 13 * s, top - 3 * s, W + 26 * s, 5 * s, PALETTE.roofDark);
  const roofH = 26 * s;
  for (let yy = 0; yy < roofH; yy += PX) {
    const frac = yy / roofH;
    const hw = W / 2 - 34 * s + (48 * s) * frac;
    px(
      ctx,
      cx - hw,
      top - roofH + yy,
      hw * 2,
      PX,
      Math.round(yy / PX) % 2 === 0 ? PALETTE.roofLight : PALETTE.roof
    );
  }
  px(ctx, cx - (W / 2 - 33 * s), top - roofH - PX, W - 66 * s, PX, PALETTE.roofDark);
  // chimney
  px(ctx, x + W - 62 * s, top - 44 * s, 11 * s, 20 * s, PALETTE.villaWall);
  px(ctx, x + W - 64.5 * s, top - 48 * s, 16 * s, 5 * s, PALETTE.roof);
  // eave brackets
  for (let i = 0; i <= 10; i++) {
    px(ctx, x - 6 * s + (i * (W + 12 * s)) / 10, top + 1 * s, PX, 4 * s, PALETTE.roofDark);
  }

  // ---- windows: 5 bays x 3 floors, green shutters, warm evening glow
  const bays = 5;
  const winW = 15 * s;
  const winHs = [24 * s, 26 * s, 26 * s];
  const floorTops = [top + 10 * s, top + 56 * s, top + 106 * s];
  const bayStep = (W - 44 * s) / (bays - 1);
  for (let fl = 0; fl < 3; fl++) {
    const winH = winHs[fl];
    for (let col = 0; col < bays; col++) {
      if (fl === 2 && col === 2) continue; // entrance bay
      const wx = x + 22 * s + col * bayStep - winW / 2;
      const wy = floorTops[fl];
      // shutters + slats
      px(ctx, wx - 6 * s, wy - 1 * s, 5.5 * s, winH + 2 * s, PALETTE.shutter);
      px(ctx, wx + winW + 0.5 * s, wy - 1 * s, 5.5 * s, winH + 2 * s, PALETTE.shutter);
      px(ctx, wx - 6 * s, wy + winH / 3, 5.5 * s, PX, PALETTE.shutterDark);
      px(ctx, wx + winW + 0.5 * s, wy + winH / 3, 5.5 * s, PX, PALETTE.shutterDark);
      px(ctx, wx - 6 * s, wy + (winH * 2) / 3, 5.5 * s, PX, PALETTE.shutterDark);
      px(ctx, wx + winW + 0.5 * s, wy + (winH * 2) / 3, 5.5 * s, PX, PALETTE.shutterDark);
      // white surround + sun-warmed glass
      px(ctx, wx - 1.5 * s, wy - 2.5 * s, winW + 3 * s, winH + 4 * s, PALETTE.villaTrim);
      px(ctx, wx, wy, winW, winH, PALETTE.windowGlow);
      px(ctx, wx, wy, winW, winH / 3, "#fff6cc");
      // mullions
      px(ctx, wx, wy + winH / 2, winW, PX, "rgba(140, 90, 40, 0.55)");
      px(ctx, wx + winW / 2, wy, PX, winH, "rgba(140, 90, 40, 0.55)");
      // sill
      px(ctx, wx - 3 * s, wy + winH + 1 * s, winW + 6 * s, 2.5 * s, PALETTE.villaTrim);
    }
  }

  // ---- entrance: porch canopy, stepped-arch green door, stone steps
  px(ctx, cx - 8 * s, baseY - 52 * s, 16 * s, 4 * s, PALETTE.roof);
  px(ctx, cx - 17 * s, baseY - 48 * s, 34 * s, 4 * s, PALETTE.roof);
  px(ctx, cx - 26 * s, baseY - 44 * s, 52 * s, 5 * s, PALETTE.roofDark);
  // slender columns
  px(ctx, cx - 20 * s, baseY - 38 * s, 3.5 * s, 31 * s, PALETTE.villaTrim);
  px(ctx, cx + 16.5 * s, baseY - 38 * s, 3.5 * s, 31 * s, PALETTE.villaTrim);
  // door with a stepped arch top
  px(ctx, cx - 9 * s, baseY - 30 * s, 18 * s, 23 * s, PALETTE.shutter);
  px(ctx, cx - 7 * s, baseY - 34 * s, 14 * s, 4 * s, PALETTE.shutter);
  px(ctx, cx - 5 * s, baseY - 37 * s, 10 * s, 3 * s, PALETTE.shutter);
  // glowing fanlight + door split + handles
  px(ctx, cx - 5 * s, baseY - 33 * s, 10 * s, 3 * s, PALETTE.windowGlow);
  px(ctx, cx - 1, baseY - 29 * s, 2, 22 * s, PALETTE.shutterDark);
  px(ctx, cx - 3 * s, baseY - 19 * s, 2, 2, "#e8c15a");
  px(ctx, cx + 1.5 * s, baseY - 19 * s, 2, 2, "#e8c15a");
  // stone steps
  px(ctx, cx - 14 * s, baseY - 7 * s, 28 * s, 4 * s, PALETTE.stone);
  px(ctx, cx - 18 * s, baseY - 3.5 * s, 36 * s, 3.5 * s, "#c8b490");
  // potted olive trees flanking the door
  drawPottedOlive(ctx, cx - 30 * s, baseY, s * 1.05);
  drawPottedOlive(ctx, cx + 30 * s, baseY, s * 1.05);
}

/** Little olive tree in a terracotta pot. */
export function drawPottedOlive(ctx: Ctx, x: number, baseY: number, s: number) {
  px(ctx, x - 6 * s, baseY - 11 * s, 12 * s, 7 * s, PALETTE.pot);
  px(ctx, x - 4.5 * s, baseY - 4 * s, 9 * s, 4 * s, PALETTE.potDark);
  px(ctx, x - 6.5 * s, baseY - 12.5 * s, 13 * s, 3 * s, PALETTE.potDark);
  px(ctx, x - 1 * s, baseY - 20 * s, 2 * s, 8 * s, PALETTE.trunk);
  px(ctx, x - 7 * s, baseY - 24 * s, 8 * s, 6 * s, PALETTE.oliveDark);
  px(ctx, x - 1 * s, baseY - 25 * s, 8 * s, 6 * s, PALETTE.olive);
  px(ctx, x - 4 * s, baseY - 28 * s, 8 * s, 5 * s, PALETTE.olive);
  px(ctx, x - 3 * s, baseY - 27.5 * s, 4 * s, 2, "#c2ce8f");
}

/* ---------------------------------------------------------------------------
   Garden gazebo (the cream-canopied pavilion on the terrace)
--------------------------------------------------------------------------- */

export function drawGazebo(ctx: Ctx, x: number, baseY: number, s: number) {
  const W = 96 * s;
  const postH = 40 * s;
  const canopyBase = baseY - postH;
  const cx = x + W / 2;

  // warm interior glow + sunset-reflecting glass
  px(ctx, x + 6 * s, canopyBase, W - 12 * s, postH, "rgba(255, 214, 138, 0.55)");
  ctx.globalAlpha = 0.8;
  px(ctx, x + 9 * s, canopyBase + 4 * s, W - 18 * s, postH - 4 * s, PALETTE.glass);
  ctx.globalAlpha = 1;
  // silhouettes of café tables inside
  ctx.fillStyle = "rgba(90, 60, 40, 0.45)";
  for (let i = 0; i < 3; i++) {
    const tx = x + 20 * s + i * 24 * s;
    px(ctx, tx, baseY - 14 * s, 12 * s, 2, "rgba(90, 60, 40, 0.45)");
    px(ctx, tx + 5 * s, baseY - 12 * s, 2, 12 * s, "rgba(90, 60, 40, 0.45)");
  }
  // glazing bars
  for (let i = 1; i < 5; i++) {
    const gx = x + 9 * s + (i * (W - 18 * s)) / 5;
    px(ctx, gx, canopyBase + 4 * s, PX, postH - 4 * s, "rgba(53, 89, 74, 0.6)");
  }
  // corner posts
  px(ctx, x + 6 * s, canopyBase, 3.5 * s, postH, PALETTE.gazeboFrame);
  px(ctx, x + W - 9.5 * s, canopyBase, 3.5 * s, postH, PALETTE.gazeboFrame);

  // stepped cream dome with a scalloped hem
  const domeH = 30 * s;
  for (let yy = 0; yy < domeH; yy += PX) {
    const frac = yy / domeH;
    const hw = 6 * s + (W / 2 - 2 * s) * Math.pow(frac, 0.8);
    px(ctx, cx - hw, canopyBase - domeH + yy, hw * 2, PX, frac > 0.85 ? PALETTE.canopyShade : PALETTE.canopy);
  }
  for (let k = 0; k < 5; k++) {
    const seg = (W + 8 * s) / 5;
    px(ctx, x - 4 * s + k * seg + seg * 0.18, canopyBase, seg * 0.64, 5 * s, PALETTE.canopy);
  }
  // finial
  px(ctx, cx - 1, canopyBase - domeH - 6 * s, 2, 6 * s, PALETTE.gazeboFrame);
  px(ctx, cx - 2.5, canopyBase - domeH - 9 * s, 5, 4, PALETTE.gazeboFrame);
  // flowers at the base
  drawFlowerBed(ctx, x - 2 * s, baseY, 18 * s);
  drawFlowerBed(ctx, x + W - 16 * s, baseY, 18 * s);
}

/* ---------------------------------------------------------------------------
   Flora
--------------------------------------------------------------------------- */

export function drawCypress(ctx: Ctx, x: number, baseY: number, height: number) {
  px(ctx, x - 2, baseY - 9, 4, 9, PALETTE.trunk);
  for (let yy = baseY - height; yy < baseY - 4; yy += PX) {
    const frac = (yy - (baseY - height)) / (height - 4);
    const hw = Math.max(
      PX / 2,
      height * 0.17 * (frac < 0.6 ? Math.pow(frac / 0.6, 0.7) : 1 - (frac - 0.6) * 0.35)
    );
    px(ctx, x - hw, yy, hw * 2, PX, PALETTE.cypress);
    // shaded right edge + occasional sunset-lit left flecks
    px(ctx, x + hw - Math.max(PX, hw * 0.4), yy, Math.max(PX, hw * 0.4), PX, PALETTE.cypressDark);
    if (Math.round(yy / PX) % 3 === 0 && hw > PX * 2) {
      px(ctx, x - hw + PX, yy, PX, PX, PALETTE.cypressLight);
    }
  }
}

/** Gnarled silver-green olive tree. */
export function drawOliveTree(ctx: Ctx, x: number, baseY: number, s: number) {
  px(ctx, x - 2 * s, baseY - 13 * s, 4 * s, 13 * s, PALETTE.trunk);
  px(ctx, x - 6 * s, baseY - 17 * s, 5 * s, 4 * s, PALETTE.trunk);
  px(ctx, x + 2 * s, baseY - 18 * s, 5 * s, 4 * s, PALETTE.trunk);
  block(ctx, x - 14 * s, baseY - 25 * s, 14 * s, 10 * s, PALETTE.oliveDark);
  block(ctx, x, baseY - 25.5 * s, 14 * s, 10 * s, PALETTE.olive);
  block(ctx, x - 8 * s, baseY - 31 * s, 16 * s, 11 * s, PALETTE.olive);
  px(ctx, x - 4 * s, baseY - 29 * s, 6 * s, 2, "#c2ce8f");
  px(ctx, x + 6 * s, baseY - 24 * s, 4 * s, 2, "#c2ce8f");
}

/** Chunky Maple tree: flared trunk + stacked leaf-block canopy. */
export function drawTree(ctx: Ctx, x: number, baseY: number, s: number) {
  px(ctx, x - 3.5 * s, baseY - 26 * s, 7 * s, 26 * s, PALETTE.trunk);
  px(ctx, x - 6 * s, baseY - 5 * s, 12 * s, 5 * s, PALETTE.trunk);
  px(ctx, x + 1 * s, baseY - 25 * s, 2.5 * s, 25 * s, PALETTE.trunkDark);
  // canopy
  block(ctx, x - 25 * s, baseY - 43 * s, 24 * s, 20 * s, PALETTE.leaf);
  block(ctx, x + 1 * s, baseY - 43 * s, 24 * s, 20 * s, PALETTE.leaf);
  block(ctx, x - 17 * s, baseY - 56 * s, 34 * s, 28 * s, PALETTE.leaf);
  block(ctx, x - 17 * s, baseY - 50 * s, 20 * s, 17 * s, PALETTE.leafMid);
  block(ctx, x - 1 * s, baseY - 47 * s, 18 * s, 16 * s, PALETTE.leafMid);
  block(ctx, x - 9 * s, baseY - 56 * s, 18 * s, 14 * s, PALETTE.leafMid);
  block(ctx, x - 11 * s, baseY - 53.5 * s, 11 * s, 9 * s, PALETTE.leafLight);
  px(ctx, x, baseY - 47 * s, 8 * s, PX, PALETTE.leafLight);
  // dusk shadow under the canopy
  px(ctx, x - 20 * s, baseY - 27 * s, 40 * s, PX, "rgba(30, 40, 26, 0.35)");
}

/** Flowering bush — oleander pinks and begonia reds from the terrace photos. */
export function drawFlowerBed(ctx: Ctx, x: number, baseY: number, w: number) {
  const h = w * 0.55;
  block(ctx, x, baseY - h * 0.8, w * 0.58, h * 0.8, PALETTE.leaf);
  block(ctx, x + w * 0.38, baseY - h * 0.9, w * 0.62, h * 0.9, PALETTE.leafMid);
  block(ctx, x + w * 0.24, baseY - h * 1.05, w * 0.5, h * 0.5, PALETTE.leafLight);
  const flowers: [number, number, string][] = [
    [0.16, 0.55, PALETTE.flowerRed],
    [0.4, 0.85, PALETTE.flowerPink],
    [0.58, 0.6, PALETTE.flowerRed],
    [0.78, 0.8, PALETTE.flowerPink],
    [0.3, 0.95, PALETTE.flowerWhite],
    [0.68, 1.0, PALETTE.flowerRed],
  ];
  for (const [fx, fy, color] of flowers) {
    px(ctx, x + fx * w, baseY - fy * h, PX, PX, color);
  }
}

/** Low stone balustrade wall (the villa's lake terraces). */
export function drawTerraceWall(ctx: Ctx, x: number, y: number, w: number) {
  px(ctx, x, y - 3, w, 5, PALETTE.stone);
  for (let i = 0; i <= w / 14; i++) {
    px(ctx, x + i * 14, y + 1, 4, 8, PALETTE.stone);
  }
  px(ctx, x, y + 8, w, 4, PALETTE.stoneDark);
}

/* ---------------------------------------------------------------------------
   Maple props
--------------------------------------------------------------------------- */

/** The iconic glossy orange mushroom (with a friendly face). */
export function drawMushroom(ctx: Ctx, x: number, baseY: number, s: number) {
  // stalk + face
  block(ctx, x - 4.5 * s, baseY - 11 * s, 9 * s, 11 * s, PALETTE.mushroomStalk);
  px(ctx, x - 2.5 * s, baseY - 6 * s, 1.5, 2, "#4a3222");
  px(ctx, x + 1 * s, baseY - 6 * s, 1.5, 2, "#4a3222");
  // stepped dome cap
  const capH = 15 * s;
  for (let yy = 0; yy < capH; yy += PX) {
    const frac = yy / capH;
    const hw = 4 * s + 8 * s * Math.pow(frac, 0.7);
    px(
      ctx,
      x - hw,
      baseY - 23 * s + yy,
      hw * 2,
      PX,
      frac < 0.35 ? "#ffb14e" : PALETTE.mushroomCap
    );
  }
  px(ctx, x - 12 * s, baseY - 9 * s, 24 * s, 2.5 * s, "#c96a1a");
  // spots + shine
  px(ctx, x - 6 * s, baseY - 14 * s, 4 * s, 3 * s, PALETTE.mushroomSpot);
  px(ctx, x + 3 * s, baseY - 13 * s, 3.5 * s, 3 * s, PALETTE.mushroomSpot);
  px(ctx, x - 1 * s, baseY - 18 * s, 3 * s, 2.5 * s, PALETTE.mushroomSpot);
  px(ctx, x - 7 * s, baseY - 20 * s, 7 * s, PX, "#ffe9c4");
}

/** Floating grass island with hanging vines — the Maple sky platform. */
export function drawFloatingIsland(ctx: Ctx, cx: number, topY: number, w: number) {
  const h = w * 0.52;
  // stepped earth cone
  for (let yy = topY + 9; yy < topY + h; yy += PX) {
    const frac = (yy - (topY + 9)) / (h - 9);
    const hw = Math.max(PX, (w / 2) * Math.sqrt(Math.max(0, 1 - frac)));
    px(ctx, cx - hw, yy, hw * 2, PX, frac < 0.45 ? PALETTE.soil : PALETTE.soilDark);
  }
  // strata lines
  px(ctx, cx - w * 0.3, topY + h * 0.38, w * 0.6, PX, "rgba(50, 28, 14, 0.4)");
  px(ctx, cx - w * 0.18, topY + h * 0.62, w * 0.36, PX, "rgba(50, 28, 14, 0.4)");
  // grass cap with hanging tufts
  px(ctx, cx - w / 2 - 2, topY, w + 4, PX, PALETTE.grassLip);
  px(ctx, cx - w / 2 - 5, topY + PX, w + 10, 9 - PX, PALETTE.grass);
  for (let gx = snap(cx - w / 2 - 3); gx < cx + w / 2; gx += 12) {
    px(ctx, gx, topY + 9, 6, 3, PALETTE.grass);
  }
  // hanging vines
  for (const p of [-0.28, 0.05, 0.34]) {
    const vx = cx + p * w;
    px(ctx, vx, topY + h * 0.42, 2, h * 0.4, PALETTE.leafMid);
    px(ctx, vx - 1, topY + h * 0.82, 4, 4, PALETTE.leafMid);
  }
  // tiny flowers on top
  px(ctx, cx - w * 0.24, topY + 2, PX, PX, PALETTE.flowerPink);
  px(ctx, cx + w * 0.3, topY + 4, PX, PX, PALETTE.flowerWhite);
}

/** Wooden ladder hanging from a platform. */
export function drawLadder(ctx: Ctx, x: number, topY: number, h: number) {
  px(ctx, x, topY, PX, h, PALETTE.wood);
  px(ctx, x + 14, topY, PX, h, PALETTE.wood);
  for (let y = topY + 6; y < topY + h - 3; y += 9) {
    px(ctx, x, y, 17, PX, PALETTE.woodLight);
  }
}

/** Wooden arrow sign pointing right. */
export function drawSign(ctx: Ctx, x: number, baseY: number, text: string) {
  px(ctx, x - 2.5, baseY - 38, 5, 38, PALETTE.trunkDark);
  const w = Math.max(94, text.length * 7.2 + 30);
  const y = baseY - 60;
  const h = 27;
  // plank + stepped arrow tip
  px(ctx, x - w / 2, y, w - 10, h, PALETTE.wood);
  px(ctx, x - w / 2, y, w - 10, PX, PALETTE.woodLight);
  px(ctx, x - w / 2, y + h - PX, w - 10, PX, PALETTE.trunkDark);
  px(ctx, x + w / 2 - 13, y + 4, 7, h - 8, PALETTE.wood);
  px(ctx, x + w / 2 - 6, y + 9, 6, h - 18, PALETTE.wood);
  // nails
  px(ctx, x - w / 2 + 6, y + h - 8, 2, 2, "#5a3a1c");
  px(ctx, x + w / 2 - 18, y + h - 8, 2, 2, "#5a3a1c");
  // text
  ctx.fillStyle = "#3d2612";
  ctx.font = "700 11px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x - 4, y + h / 2 + 1);
}

/** Little wooden boat with a bright white sail, bobbing on the lake. */
export function drawBoat(ctx: Ctx, x: number, waterY: number, t: number) {
  const bob = Math.round(Math.sin(t / 750)) * PX;
  const y = waterY + bob;
  // hull
  px(ctx, x - 20, y, 40, 3, "#5e3d20");
  px(ctx, x - 19, y + 3, 38, 4, PALETTE.woodLight);
  px(ctx, x - 14, y + 7, 28, 3, PALETTE.trunkDark);
  // mast
  px(ctx, x - 1, y - 26, PX, 26, PALETTE.trunkDark);
  // stepped sail catching the golden light
  for (let yy = 0; yy < 19; yy += PX) {
    px(ctx, x + 2, y - 24 + yy, 4 + yy * 0.55, PX, "#fff6e0");
  }
  // golden reflection
  ctx.globalAlpha = 0.35;
  px(ctx, x - 18, waterY + 13, 36, PX, "#ffd977");
  ctx.globalAlpha = 1;
}
