/**
 * MapleStory-style Lake Garda scenery, drawn as smooth vector art — no pixel
 * grids. Stars the yellow Villa Sostaga (green shutters, terracotta hip roof,
 * arched porch), its cream garden gazebo, cypress and olive trees, and the
 * lake — plus Maple staples: puffy clouds, floating grass islands, ladders,
 * glossy orange mushrooms and wooden arrow signs.
 */

export const PALETTE = {
  // Bright day sky
  skyTop: "#57b6f2",
  skyMid: "#8fd4f8",
  skyBottom: "#eaf9ff",
  sun: "#fff3b8",
  cloud: "#ffffff",
  cloudShade: "#d8ecf9",
  // Distant scenery
  mountainFar: "#b7d0e4",
  mountainNear: "#8fb8d6",
  hill: "#83c95e",
  hillDark: "#5fae3d",
  // Water
  lake: "#3d9be0",
  lakeDeep: "#1f6cb4",
  lakeShine: "#eaf8ff",
  lakeShineCool: "#bfe6fb",
  // Ground — bright grass over rich soil
  grass: "#7ccb52",
  grassDark: "#55a234",
  grassLip: "#a5e37c",
  soil: "#a9713d",
  soilDark: "#7c4e26",
  gravel: "#e7dabd",
  gravelEdge: "#c9b28a",
  stone: "#c3b49a",
  stoneDark: "#a08e72",
  // Villa Sostaga
  villaWall: "#f0bc45",
  villaWallShade: "#d69e2f",
  villaTrim: "#fdf3d6",
  windowGlow: "#fbeec9",
  shutter: "#2e6041",
  shutterDark: "#224731",
  roof: "#b25a3d",
  roofDark: "#8e4229",
  roofLight: "#c96e4d",
  // Gazebo
  canopy: "#f3e9d4",
  canopyShade: "#d9c8a5",
  gazeboFrame: "#3a614b",
  glass: "#d3e9f5",
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
  outline: "rgba(66, 44, 24, 0.45)",
};

type Ctx = CanvasRenderingContext2D;

function circle(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();
}

function outlineLast(ctx: Ctx, lw = 1.2) {
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = lw;
  ctx.stroke();
}

/* ---------------------------------------------------------------------------
   Sky & backdrop
--------------------------------------------------------------------------- */

export function drawSky(ctx: Ctx, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, PALETTE.skyTop);
  grad.addColorStop(0.55, PALETTE.skyMid);
  grad.addColorStop(0.9, PALETTE.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

export function drawSun(ctx: Ctx, x: number, y: number, r: number) {
  const glow = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.4);
  glow.addColorStop(0, "rgba(255, 248, 214, 0.85)");
  glow.addColorStop(1, "rgba(255, 248, 214, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, x, y, r, PALETTE.sun);
  circle(ctx, x - r * 0.22, y - r * 0.22, r * 0.55, "#fffdea");
}

/** Puffy multi-lobed cloud with a soft flat bottom — the Maple cloud. */
export function drawCloud(ctx: Ctx, x: number, y: number, s: number) {
  const w = s * 6;
  ctx.fillStyle = PALETTE.cloudShade;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + s * 2.2, w * 0.55, s * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.cloud;
  ctx.beginPath();
  ctx.ellipse(x + s * 1.2, y + s * 1.2, s * 1.35, s * 1.1, 0, 0, Math.PI * 2);
  ctx.ellipse(x + s * 2.9, y + s * 0.6, s * 1.7, s * 1.4, 0, 0, Math.PI * 2);
  ctx.ellipse(x + s * 4.6, y + s * 1.3, s * 1.25, s * 1.0, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w / 2, y + s * 1.8, w * 0.5, s * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawBirds(ctx: Ctx, x: number, y: number, t: number) {
  ctx.strokeStyle = "rgba(43, 74, 100, 0.55)";
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  const flap = Math.sin(t / 220) * 2.4;
  const bird = (bx: number, by: number) => {
    ctx.beginPath();
    ctx.moveTo(bx - 5, by + flap);
    ctx.quadraticCurveTo(bx - 1, by - 2, bx, by);
    ctx.quadraticCurveTo(bx + 1, by - 2, bx + 5, by + flap);
    ctx.stroke();
  };
  bird(x, y);
  bird(x + 24, y + 7);
  bird(x + 44, y - 5);
}

/**
 * Background ridges. `far` = hazy blue pre-Alps; otherwise rolling green
 * hills that sit right behind the playfield.
 */
export function drawMountains(ctx: Ctx, w: number, y: number, offset: number, far: boolean) {
  if (far) {
    ctx.fillStyle = PALETTE.mountainFar;
    const peakW = 340;
    for (let x = (offset % peakW) - peakW * 2; x < w + peakW; x += peakW) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + peakW * 0.28, y - 120, x + peakW * 0.52, y - 78);
      ctx.quadraticCurveTo(x + peakW * 0.74, y - 128, x + peakW, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillRect(0, y - 2, w, 6);
    // haze at the waterline
    const haze = ctx.createLinearGradient(0, y - 40, 0, y + 4);
    haze.addColorStop(0, "rgba(234, 249, 255, 0)");
    haze.addColorStop(1, "rgba(234, 249, 255, 0.5)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, y - 40, w, 44);
    return;
  }
  const humpW = 300;
  for (let i = -2; i < Math.ceil(w / humpW) + 2; i++) {
    const x = (offset % humpW) + i * humpW;
    ctx.fillStyle = i % 2 === 0 ? PALETTE.hill : PALETTE.hillDark;
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.quadraticCurveTo(x + humpW * 0.5, y - 82, x + humpW, y + 10);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = PALETTE.hillDark;
  ctx.fillRect(0, y + 4, w, 8);
}

/* ---------------------------------------------------------------------------
   Water
--------------------------------------------------------------------------- */

/** Bright cartoon lake with animated glints and a light column under the sun. */
export function drawWater(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  sunX?: number
) {
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, PALETTE.lake);
  grad.addColorStop(1, PALETTE.lakeDeep);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // sun column — soft horizontal falloff so it melts into the water
  if (sunX !== undefined && sunX > x - 120 && sunX < x + w + 120) {
    const col = ctx.createLinearGradient(sunX - 70, 0, sunX + 70, 0);
    col.addColorStop(0, "rgba(255, 244, 200, 0)");
    col.addColorStop(0.5, "rgba(255, 244, 200, 0.38)");
    col.addColorStop(1, "rgba(255, 244, 200, 0)");
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = col;
    ctx.fillRect(sunX - 70, y, 140, h);
    ctx.restore();
  }

  // surface lip
  ctx.fillStyle = PALETTE.lakeShineCool;
  ctx.fillRect(x, y, w, 2.5);

  // animated soft glints
  for (let i = 0; i < Math.floor(w / 46); i++) {
    const gx = x + i * 46 + 10 + Math.sin(t / 900 + i * 1.7) * 7;
    const gy = y + 10 + ((i * 41) % Math.max(1, h - 20));
    const nearSun = sunX !== undefined && Math.abs(gx - sunX) < 90;
    ctx.globalAlpha = 0.5 + Math.sin(t / 700 + i * 2.1) * 0.25;
    rr(ctx, gx, gy, 20, 3, 1.5, nearSun ? PALETTE.lakeShine : PALETTE.lakeShineCool);
    rr(ctx, gx + 6, gy - 3.5, 8, 2.4, 1.2, PALETTE.lakeShineCool);
    ctx.globalAlpha = 1;
  }
}

/* ---------------------------------------------------------------------------
   Ground
--------------------------------------------------------------------------- */

/** Bright grass with a glowing lip over rich soil — the Maple ground block. */
export function drawGrass(ctx: Ctx, x: number, y: number, w: number, h: number) {
  // soil
  const soil = ctx.createLinearGradient(0, y, 0, y + h);
  soil.addColorStop(0, PALETTE.soil);
  soil.addColorStop(1, PALETTE.soilDark);
  ctx.fillStyle = soil;
  ctx.fillRect(x, y, w, h);
  // buried stones
  ctx.fillStyle = "rgba(255, 235, 200, 0.18)";
  for (let i = 0; i < w / 46; i++) {
    const gx = x + i * 46 + ((i * 17) % 23);
    const gy = y + 26 + ((i * 31) % Math.max(1, h - 34));
    ctx.beginPath();
    ctx.ellipse(gx, gy, 6, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // grass band with soft rounded tufts hanging over the edge
  ctx.fillStyle = PALETTE.grass;
  ctx.beginPath();
  ctx.moveTo(x, y + 15);
  ctx.lineTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + 15);
  for (let gx = x + w; gx > x; gx -= 26) {
    ctx.quadraticCurveTo(gx - 7, y + 21, gx - 14, y + 15);
    ctx.quadraticCurveTo(gx - 20, y + 19, gx - 26, y + 15);
  }
  ctx.closePath();
  ctx.fill();
  // bright lip
  ctx.fillStyle = PALETTE.grassLip;
  ctx.fillRect(x, y, w, 3.5);
  // darker blade clumps
  ctx.fillStyle = PALETTE.grassDark;
  for (let i = 0; i < w / 34; i++) {
    const gx = x + i * 34 + ((i * 11) % 13);
    ctx.beginPath();
    ctx.ellipse(gx, y + 12, 6, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Warm gravel driveway strip (Villa Sostaga's forecourt). */
export function drawGravel(ctx: Ctx, x: number, y: number, w: number, h: number) {
  rr(ctx, x, y, w, h, 6, PALETTE.gravel);
  ctx.fillStyle = PALETTE.gravelEdge;
  ctx.fillRect(x, y, w, 2);
  ctx.fillRect(x, y + h - 2, w, 2);
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < w / 26; i++) {
    const gx = x + i * 26 + ((i * 13) % 17);
    const gy = y + 4 + ((i * 7) % Math.max(1, h - 8));
    ellipse(ctx, gx, gy, 2.2, 1.2, PALETTE.gravelEdge);
  }
  ctx.globalAlpha = 1;
}

/* ---------------------------------------------------------------------------
   Villa Sostaga — the iconic yellow villa
--------------------------------------------------------------------------- */

/**
 * The yellow villa from the photos: three floors of green-shuttered windows,
 * wide terracotta hip roof, arched entrance porch with curved stone steps and
 * potted olive trees. Width ~240*s, height ~185*s above baseY.
 */
export function drawVilla(ctx: Ctx, x: number, baseY: number, s: number) {
  const W = 240 * s;
  const wallH = 150 * s;
  const top = baseY - wallH;

  // ---- walls
  const wall = ctx.createLinearGradient(0, top, 0, baseY);
  wall.addColorStop(0, PALETTE.villaWall);
  wall.addColorStop(1, "#e6ad35");
  ctx.fillStyle = wall;
  ctx.fillRect(x, top, W, wallH);
  // right-side shade
  ctx.fillStyle = PALETTE.villaWallShade;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(x + W - 20 * s, top, 20 * s, wallH);
  // sun dapple
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x + W * 0.3, top + 40 * s, 44 * s, 26 * s, -0.4, 0, Math.PI * 2);
  ctx.ellipse(x + W * 0.62, top + 90 * s, 36 * s, 22 * s, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // string courses between floors + stone plinth
  ctx.fillStyle = "rgba(253, 243, 214, 0.75)";
  ctx.fillRect(x, top + 48 * s, W, 2.5 * s);
  ctx.fillRect(x, top + 98 * s, W, 2.5 * s);
  ctx.fillStyle = "#d9c8a3";
  ctx.fillRect(x, baseY - 7 * s, W, 7 * s);

  // ---- wide hip roof with eaves
  ctx.fillStyle = PALETTE.roofDark;
  ctx.fillRect(x - 13 * s, top - 3 * s, W + 26 * s, 5 * s); // eave shadow board
  ctx.beginPath();
  ctx.moveTo(x - 14 * s, top - 2 * s);
  ctx.lineTo(x + 34 * s, top - 26 * s);
  ctx.lineTo(x + W - 34 * s, top - 26 * s);
  ctx.lineTo(x + W + 14 * s, top - 2 * s);
  ctx.closePath();
  const roofG = ctx.createLinearGradient(0, top - 26 * s, 0, top);
  roofG.addColorStop(0, PALETTE.roofLight);
  roofG.addColorStop(1, PALETTE.roof);
  ctx.fillStyle = roofG;
  ctx.fill();
  outlineLast(ctx, 1.4 * s);
  // tile lines
  ctx.strokeStyle = "rgba(120, 52, 30, 0.3)";
  ctx.lineWidth = 1 * s;
  for (let i = 1; i < 4; i++) {
    const ry = top - 2 * s - i * 6 * s;
    const inset = 14 * s - i * 11 * s;
    ctx.beginPath();
    ctx.moveTo(x - inset, ry);
    ctx.lineTo(x + W + inset, ry);
    ctx.stroke();
  }
  // ridge cap
  ctx.strokeStyle = PALETTE.roofDark;
  ctx.lineWidth = 2.4 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + 33 * s, top - 26 * s);
  ctx.lineTo(x + W - 33 * s, top - 26 * s);
  ctx.stroke();
  // chimney
  rr(ctx, x + W - 62 * s, top - 44 * s, 11 * s, 20 * s, 1.5 * s, PALETTE.villaWall);
  rr(ctx, x + W - 64.5 * s, top - 48 * s, 16 * s, 5 * s, 1.5 * s, PALETTE.roof);
  // eave brackets
  ctx.fillStyle = PALETTE.roofDark;
  for (let i = 0; i <= 10; i++) {
    ctx.fillRect(x - 6 * s + (i * (W + 12 * s)) / 10, top + 1 * s, 3 * s, 4 * s);
  }

  // ---- windows: 5 bays x 3 floors, green shutters + white trim
  const bays = 5;
  const winW = 15 * s;
  const winHs = [24 * s, 26 * s, 26 * s]; // attic slightly shorter
  const floorTops = [top + 10 * s, top + 56 * s, top + 106 * s];
  const bayStep = (W - 44 * s) / (bays - 1);
  for (let fl = 0; fl < 3; fl++) {
    const winH = winHs[fl];
    for (let col = 0; col < bays; col++) {
      // the ground-floor center bay is the entrance
      if (fl === 2 && col === 2) continue;
      const wx = x + 22 * s + col * bayStep - winW / 2;
      const wy = floorTops[fl];
      // shutters
      rr(ctx, wx - 6 * s, wy - 1 * s, 5.5 * s, winH + 2 * s, 1 * s, PALETTE.shutter);
      rr(ctx, wx + winW + 0.5 * s, wy - 1 * s, 5.5 * s, winH + 2 * s, 1 * s, PALETTE.shutter);
      // louvres
      ctx.strokeStyle = PALETTE.shutterDark;
      ctx.lineWidth = 0.8 * s;
      for (let l = 1; l < 5; l++) {
        const ly = wy + (l * winH) / 5;
        ctx.beginPath();
        ctx.moveTo(wx - 5.4 * s, ly);
        ctx.lineTo(wx - 1.2 * s, ly);
        ctx.moveTo(wx + winW + 1.2 * s, ly);
        ctx.lineTo(wx + winW + 5.4 * s, ly);
        ctx.stroke();
      }
      // white surround + warm glass
      rr(ctx, wx - 1.5 * s, wy - 2.5 * s, winW + 3 * s, winH + 4 * s, 1.5 * s, PALETTE.villaTrim);
      const glass = ctx.createLinearGradient(0, wy, 0, wy + winH);
      glass.addColorStop(0, "#fdf6dd");
      glass.addColorStop(1, PALETTE.windowGlow);
      ctx.fillStyle = glass;
      ctx.beginPath();
      ctx.roundRect?.(wx, wy, winW, winH, 1 * s);
      if (!ctx.roundRect) ctx.rect(wx, wy, winW, winH);
      ctx.fill();
      // mullions
      ctx.strokeStyle = "rgba(140, 110, 60, 0.5)";
      ctx.lineWidth = 0.9 * s;
      ctx.beginPath();
      ctx.moveTo(wx, wy + winH / 2);
      ctx.lineTo(wx + winW, wy + winH / 2);
      ctx.moveTo(wx + winW / 2, wy);
      ctx.lineTo(wx + winW / 2, wy + winH);
      ctx.stroke();
      // sill
      rr(ctx, wx - 3 * s, wy + winH + 1 * s, winW + 6 * s, 2.2 * s, 1 * s, PALETTE.villaTrim);
    }
  }

  // ---- entrance: porch canopy, arched green door, curved steps
  const cx = x + W / 2;
  // canopy
  ctx.beginPath();
  ctx.moveTo(cx - 26 * s, baseY - 42 * s);
  ctx.lineTo(cx, baseY - 52 * s);
  ctx.lineTo(cx + 26 * s, baseY - 42 * s);
  ctx.lineTo(cx + 22 * s, baseY - 38 * s);
  ctx.lineTo(cx - 22 * s, baseY - 38 * s);
  ctx.closePath();
  ctx.fillStyle = PALETTE.roof;
  ctx.fill();
  outlineLast(ctx, 1.2 * s);
  // slender columns
  rr(ctx, cx - 20 * s, baseY - 38 * s, 3.5 * s, 31 * s, 1 * s, PALETTE.villaTrim);
  rr(ctx, cx + 16.5 * s, baseY - 38 * s, 3.5 * s, 31 * s, 1 * s, PALETTE.villaTrim);
  // arched double door
  ctx.beginPath();
  ctx.moveTo(cx - 9 * s, baseY - 7 * s);
  ctx.lineTo(cx - 9 * s, baseY - 30 * s);
  ctx.quadraticCurveTo(cx, baseY - 40 * s, cx + 9 * s, baseY - 30 * s);
  ctx.lineTo(cx + 9 * s, baseY - 7 * s);
  ctx.closePath();
  ctx.fillStyle = PALETTE.shutter;
  ctx.fill();
  outlineLast(ctx, 1.2 * s);
  // fanlight + door split + handles
  ctx.beginPath();
  ctx.moveTo(cx - 6 * s, baseY - 30 * s);
  ctx.quadraticCurveTo(cx, baseY - 36.5 * s, cx + 6 * s, baseY - 30 * s);
  ctx.closePath();
  ctx.fillStyle = PALETTE.windowGlow;
  ctx.fill();
  ctx.strokeStyle = PALETTE.shutterDark;
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - 29 * s);
  ctx.lineTo(cx, baseY - 7 * s);
  ctx.stroke();
  circle(ctx, cx - 2 * s, baseY - 19 * s, 1 * s, "#e8c15a");
  circle(ctx, cx + 2 * s, baseY - 19 * s, 1 * s, "#e8c15a");
  // curved stone steps
  rr(ctx, cx - 14 * s, baseY - 7 * s, 28 * s, 4 * s, 2 * s, PALETTE.stone);
  rr(ctx, cx - 18 * s, baseY - 3.5 * s, 36 * s, 4 * s, 2 * s, "#d5c6ab");
  // potted olive trees flanking the door
  drawPottedOlive(ctx, cx - 30 * s, baseY, s * 1.05);
  drawPottedOlive(ctx, cx + 30 * s, baseY, s * 1.05);
}

/** Little olive tree in a terracotta pot. */
export function drawPottedOlive(ctx: Ctx, x: number, baseY: number, s: number) {
  // pot
  ctx.beginPath();
  ctx.moveTo(x - 6 * s, baseY - 11 * s);
  ctx.lineTo(x + 6 * s, baseY - 11 * s);
  ctx.lineTo(x + 4.5 * s, baseY);
  ctx.lineTo(x - 4.5 * s, baseY);
  ctx.closePath();
  ctx.fillStyle = PALETTE.pot;
  ctx.fill();
  outlineLast(ctx, 1 * s);
  rr(ctx, x - 6.5 * s, baseY - 12.5 * s, 13 * s, 3 * s, 1.5 * s, PALETTE.potDark);
  // trunk + olive puffs
  ctx.strokeStyle = PALETTE.trunk;
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(x, baseY - 12 * s);
  ctx.quadraticCurveTo(x + 1 * s, baseY - 17 * s, x, baseY - 20 * s);
  ctx.stroke();
  ellipse(ctx, x - 3.5 * s, baseY - 21 * s, 4 * s, 3.2 * s, PALETTE.oliveDark);
  ellipse(ctx, x + 3.5 * s, baseY - 21.5 * s, 4 * s, 3.2 * s, PALETTE.olive);
  ellipse(ctx, x, baseY - 25 * s, 4.5 * s, 3.6 * s, PALETTE.olive);
  ellipse(ctx, x - 1.5 * s, baseY - 26.5 * s, 2.2 * s, 1.6 * s, "#c3d9a4");
}

/* ---------------------------------------------------------------------------
   Garden gazebo (the cream-canopied pavilion on the terrace)
--------------------------------------------------------------------------- */

export function drawGazebo(ctx: Ctx, x: number, baseY: number, s: number) {
  const W = 96 * s;
  const postH = 40 * s;
  const canopyBase = baseY - postH;

  // warm interior glow behind the glass
  rr(ctx, x + 6 * s, canopyBase, W - 12 * s, postH, 3 * s, "rgba(247, 234, 208, 0.6)");
  // glass panels
  ctx.fillStyle = PALETTE.glass;
  ctx.globalAlpha = 0.75;
  ctx.fillRect(x + 9 * s, canopyBase + 4 * s, W - 18 * s, postH - 4 * s);
  ctx.globalAlpha = 1;
  // silhouettes of café tables inside
  ctx.fillStyle = "rgba(120, 100, 70, 0.35)";
  for (let i = 0; i < 3; i++) {
    const tx = x + 20 * s + i * 24 * s;
    ctx.fillRect(tx, baseY - 14 * s, 12 * s, 2 * s);
    ctx.fillRect(tx + 5 * s, baseY - 12 * s, 2 * s, 12 * s);
  }
  // glazing bars
  ctx.strokeStyle = "rgba(58, 97, 75, 0.5)";
  ctx.lineWidth = 1 * s;
  for (let i = 1; i < 5; i++) {
    const gx = x + 9 * s + (i * (W - 18 * s)) / 5;
    ctx.beginPath();
    ctx.moveTo(gx, canopyBase + 4 * s);
    ctx.lineTo(gx, baseY);
    ctx.stroke();
  }
  // corner posts
  rr(ctx, x + 6 * s, canopyBase, 3.5 * s, postH, 1 * s, PALETTE.gazeboFrame);
  rr(ctx, x + W - 9.5 * s, canopyBase, 3.5 * s, postH, 1 * s, PALETTE.gazeboFrame);

  // cream tent canopy with scalloped hem
  ctx.beginPath();
  ctx.moveTo(x - 4 * s, canopyBase);
  ctx.quadraticCurveTo(x + W * 0.16, canopyBase - 26 * s, x + W / 2, canopyBase - 30 * s);
  ctx.quadraticCurveTo(x + W - W * 0.16, canopyBase - 26 * s, x + W + 4 * s, canopyBase);
  // scallops back along the hem
  const scallops = 5;
  for (let i = scallops; i > 0; i--) {
    const x1 = x - 4 * s + ((i - 1) * (W + 8 * s)) / scallops;
    const x2 = x - 4 * s + (i * (W + 8 * s)) / scallops;
    ctx.quadraticCurveTo((x1 + x2) / 2, canopyBase + 6 * s, x1, canopyBase);
  }
  ctx.closePath();
  const can = ctx.createLinearGradient(0, canopyBase - 30 * s, 0, canopyBase + 6 * s);
  can.addColorStop(0, "#fbf4e4");
  can.addColorStop(1, PALETTE.canopy);
  ctx.fillStyle = can;
  ctx.fill();
  outlineLast(ctx, 1.3 * s);
  // canopy seams
  ctx.strokeStyle = PALETTE.canopyShade;
  ctx.lineWidth = 1 * s;
  for (const p of [0.22, 0.5, 0.78]) {
    ctx.beginPath();
    ctx.moveTo(x + W / 2, canopyBase - 29 * s);
    ctx.quadraticCurveTo(
      x + W / 2 + (p - 0.5) * W * 0.8,
      canopyBase - 14 * s,
      x + p * W,
      canopyBase + 2 * s
    );
    ctx.stroke();
  }
  // finial
  ctx.strokeStyle = PALETTE.gazeboFrame;
  ctx.lineWidth = 1.4 * s;
  ctx.beginPath();
  ctx.moveTo(x + W / 2, canopyBase - 30 * s);
  ctx.lineTo(x + W / 2, canopyBase - 36 * s);
  ctx.stroke();
  circle(ctx, x + W / 2, canopyBase - 37.5 * s, 2 * s, PALETTE.gazeboFrame);
  // flowers at the base
  drawFlowerBed(ctx, x - 2 * s, baseY, 18 * s);
  drawFlowerBed(ctx, x + W - 16 * s, baseY, 18 * s);
}

/* ---------------------------------------------------------------------------
   Flora
--------------------------------------------------------------------------- */

export function drawCypress(ctx: Ctx, x: number, baseY: number, height: number) {
  ctx.fillStyle = PALETTE.trunk;
  ctx.fillRect(x - 2, baseY - 9, 4, 9);
  // layered flame silhouette
  const layer = (rx: number, color: string, dx: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + dx, baseY - height);
    ctx.bezierCurveTo(
      x + dx + rx,
      baseY - height * 0.72,
      x + dx + rx * 1.15,
      baseY - height * 0.3,
      x + dx,
      baseY - 5
    );
    ctx.bezierCurveTo(
      x + dx - rx * 1.15,
      baseY - height * 0.3,
      x + dx - rx,
      baseY - height * 0.72,
      x + dx,
      baseY - height
    );
    ctx.fill();
  };
  layer(height * 0.17, PALETTE.cypressDark, 0);
  layer(height * 0.13, PALETTE.cypress, -height * 0.015);
  layer(height * 0.06, PALETTE.cypressLight, -height * 0.045);
  // texture nicks
  ctx.strokeStyle = "rgba(23, 56, 32, 0.35)";
  ctx.lineWidth = 1.2;
  for (let i = 1; i < 4; i++) {
    const ny = baseY - (height * i) / 4.4;
    ctx.beginPath();
    ctx.moveTo(x + height * 0.08, ny);
    ctx.quadraticCurveTo(x, ny + 5, x - height * 0.08, ny + 2);
    ctx.stroke();
  }
}

/** Gnarled silver-green olive tree. */
export function drawOliveTree(ctx: Ctx, x: number, baseY: number, s: number) {
  ctx.strokeStyle = PALETTE.trunk;
  ctx.lineWidth = 4.5 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x - 2 * s, baseY - 8 * s, x - 1 * s, baseY - 13 * s);
  ctx.stroke();
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(x - 1 * s, baseY - 11 * s);
  ctx.quadraticCurveTo(x - 6 * s, baseY - 14 * s, x - 7 * s, baseY - 17 * s);
  ctx.moveTo(x - 1 * s, baseY - 12 * s);
  ctx.quadraticCurveTo(x + 4 * s, baseY - 15 * s, x + 6 * s, baseY - 18 * s);
  ctx.stroke();
  // silvery clusters
  ellipse(ctx, x - 7 * s, baseY - 20 * s, 7 * s, 5 * s, PALETTE.oliveDark);
  ellipse(ctx, x + 7 * s, baseY - 20.5 * s, 7 * s, 5 * s, PALETTE.olive);
  ellipse(ctx, x, baseY - 25 * s, 8 * s, 6 * s, PALETTE.olive);
  ellipse(ctx, x - 2 * s, baseY - 27.5 * s, 4 * s, 2.6 * s, "#c3d9a4");
  ellipse(ctx, x + 8 * s, baseY - 23 * s, 3 * s, 2 * s, "#c3d9a4");
}

/** Chunky Maple tree: flared trunk + stacked leaf-ball canopy. */
export function drawTree(ctx: Ctx, x: number, baseY: number, s: number) {
  ctx.fillStyle = PALETTE.trunk;
  ctx.beginPath();
  ctx.moveTo(x - 7 * s, baseY);
  ctx.quadraticCurveTo(x - 4 * s, baseY - 10 * s, x - 3.5 * s, baseY - 26 * s);
  ctx.lineTo(x + 3.5 * s, baseY - 26 * s);
  ctx.quadraticCurveTo(x + 4 * s, baseY - 10 * s, x + 7 * s, baseY);
  ctx.closePath();
  ctx.fill();
  outlineLast(ctx, 1.2 * s);
  ctx.fillStyle = PALETTE.trunkDark;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(x + 0.5 * s, baseY - 25 * s, 2.6 * s, 25 * s);
  ctx.globalAlpha = 1;
  // canopy
  ellipse(ctx, x - 13 * s, baseY - 33 * s, 12 * s, 10 * s, PALETTE.leaf);
  ellipse(ctx, x + 13 * s, baseY - 33 * s, 12 * s, 10 * s, PALETTE.leaf);
  ellipse(ctx, x, baseY - 42 * s, 17 * s, 14 * s, PALETTE.leaf);
  ellipse(ctx, x - 7 * s, baseY - 42 * s, 10 * s, 8.5 * s, PALETTE.leafMid);
  ellipse(ctx, x + 8 * s, baseY - 39 * s, 9 * s, 8 * s, PALETTE.leafMid);
  ellipse(ctx, x, baseY - 49 * s, 9 * s, 7 * s, PALETTE.leafMid);
  ellipse(ctx, x - 6 * s, baseY - 49 * s, 5.5 * s, 4.5 * s, PALETTE.leafLight);
  ellipse(ctx, x + 4 * s, baseY - 45 * s, 4 * s, 3.2 * s, PALETTE.leafLight);
}

/** Flowering bush — oleander pinks and begonia reds from the terrace photos. */
export function drawFlowerBed(ctx: Ctx, x: number, baseY: number, w: number) {
  const h = w * 0.55;
  ellipse(ctx, x + w * 0.28, baseY - h * 0.4, w * 0.3, h * 0.42, PALETTE.leaf);
  ellipse(ctx, x + w * 0.68, baseY - h * 0.45, w * 0.32, h * 0.46, PALETTE.leafMid);
  ellipse(ctx, x + w * 0.48, baseY - h * 0.72, w * 0.26, h * 0.36, PALETTE.leafLight);
  const flowers: [number, number, string][] = [
    [0.2, 0.55, PALETTE.flowerRed],
    [0.42, 0.85, PALETTE.flowerPink],
    [0.6, 0.6, PALETTE.flowerRed],
    [0.8, 0.8, PALETTE.flowerPink],
    [0.32, 0.95, PALETTE.flowerWhite],
    [0.72, 1.0, PALETTE.flowerRed],
  ];
  for (const [fx, fy, color] of flowers) {
    circle(ctx, x + fx * w, baseY - fy * h, w * 0.055, color);
    circle(ctx, x + fx * w + w * 0.015, baseY - fy * h - w * 0.015, w * 0.02, "#fff3c9");
  }
}

/** Low stone balustrade wall (the villa's lake terraces). */
export function drawTerraceWall(ctx: Ctx, x: number, y: number, w: number) {
  rr(ctx, x, y - 3, w, 5, 2.5, PALETTE.stone);
  ctx.fillStyle = PALETTE.stone;
  for (let i = 0; i <= w / 14; i++) {
    rr(ctx, x + i * 14, y + 1, 4, 8, 2, PALETTE.stone);
  }
  rr(ctx, x, y + 8, w, 4, 2, PALETTE.stoneDark);
}

/* ---------------------------------------------------------------------------
   Maple props
--------------------------------------------------------------------------- */

/** The iconic glossy orange mushroom (with a friendly face). */
export function drawMushroom(ctx: Ctx, x: number, baseY: number, s: number) {
  // stalk
  rr(ctx, x - 4.5 * s, baseY - 11 * s, 9 * s, 11 * s, 4 * s, PALETTE.mushroomStalk);
  outlineLast(ctx, 1 * s);
  // face
  ctx.fillStyle = "#4a3222";
  ellipse(ctx, x - 1.8 * s, baseY - 5.5 * s, 0.7 * s, 1 * s, "#4a3222");
  ellipse(ctx, x + 1.8 * s, baseY - 5.5 * s, 0.7 * s, 1 * s, "#4a3222");
  // cap
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, baseY - 9 * s);
  ctx.quadraticCurveTo(x - 11 * s, baseY - 22 * s, x, baseY - 23 * s);
  ctx.quadraticCurveTo(x + 11 * s, baseY - 22 * s, x + 12 * s, baseY - 9 * s);
  ctx.quadraticCurveTo(x, baseY - 4.5 * s, x - 12 * s, baseY - 9 * s);
  ctx.closePath();
  const cap = ctx.createLinearGradient(0, baseY - 23 * s, 0, baseY - 6 * s);
  cap.addColorStop(0, "#ffb14e");
  cap.addColorStop(1, PALETTE.mushroomCap);
  ctx.fillStyle = cap;
  ctx.fill();
  outlineLast(ctx, 1.2 * s);
  // spots + shine
  ellipse(ctx, x - 4.5 * s, baseY - 14 * s, 2.2 * s, 1.8 * s, PALETTE.mushroomSpot);
  ellipse(ctx, x + 4 * s, baseY - 12.5 * s, 1.8 * s, 1.5 * s, PALETTE.mushroomSpot);
  ellipse(ctx, x + 0.5 * s, baseY - 18 * s, 1.5 * s, 1.2 * s, PALETTE.mushroomSpot);
  ctx.strokeStyle = "rgba(255, 240, 210, 0.8)";
  ctx.lineWidth = 1.6 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 7 * s, baseY - 18.5 * s);
  ctx.quadraticCurveTo(x - 3 * s, baseY - 21.5 * s, x + 1 * s, baseY - 21 * s);
  ctx.stroke();
}

/** Floating grass island with hanging vines — the Maple sky platform. */
export function drawFloatingIsland(ctx: Ctx, cx: number, topY: number, w: number) {
  const h = w * 0.52;
  // earth cone
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, topY + 9);
  ctx.quadraticCurveTo(cx - w * 0.3, topY + h * 0.8, cx, topY + h);
  ctx.quadraticCurveTo(cx + w * 0.3, topY + h * 0.8, cx + w / 2, topY + 9);
  ctx.closePath();
  const earth = ctx.createLinearGradient(0, topY, 0, topY + h);
  earth.addColorStop(0, PALETTE.soil);
  earth.addColorStop(1, PALETTE.soilDark);
  ctx.fillStyle = earth;
  ctx.fill();
  outlineLast(ctx, 1.2);
  // strata
  ctx.strokeStyle = "rgba(60, 36, 16, 0.35)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.34, topY + h * 0.36);
  ctx.quadraticCurveTo(cx, topY + h * 0.5, cx + w * 0.34, topY + h * 0.36);
  ctx.moveTo(cx - w * 0.2, topY + h * 0.62);
  ctx.quadraticCurveTo(cx, topY + h * 0.74, cx + w * 0.2, topY + h * 0.62);
  ctx.stroke();
  // grass cap with drooping lip
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 - 5, topY + 4);
  ctx.quadraticCurveTo(cx, topY - 7, cx + w / 2 + 5, topY + 4);
  ctx.quadraticCurveTo(cx + w / 2 + 7, topY + 12, cx + w / 2 - 2, topY + 13);
  for (let gx = cx + w / 2 - 2; gx > cx - w / 2 + 2; gx -= 22) {
    ctx.quadraticCurveTo(gx - 6, topY + 18, gx - 11, topY + 13);
    ctx.quadraticCurveTo(gx - 17, topY + 16, gx - 22, topY + 13);
  }
  ctx.quadraticCurveTo(cx - w / 2 - 7, topY + 12, cx - w / 2 - 5, topY + 4);
  ctx.closePath();
  ctx.fillStyle = PALETTE.grass;
  ctx.fill();
  outlineLast(ctx, 1.2);
  ctx.strokeStyle = PALETTE.grassLip;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + 2, topY + 3);
  ctx.quadraticCurveTo(cx, topY - 4, cx + w / 2 - 2, topY + 3);
  ctx.stroke();
  // hanging vines
  ctx.strokeStyle = PALETTE.leafMid;
  ctx.lineWidth = 1.6;
  for (const p of [-0.28, 0.05, 0.34]) {
    const vx = cx + p * w;
    ctx.beginPath();
    ctx.moveTo(vx, topY + h * 0.5);
    ctx.quadraticCurveTo(vx + 4, topY + h * 0.75, vx - 2, topY + h * 0.95);
    ctx.stroke();
    circle(ctx, vx - 2, topY + h * 0.97, 2.2, PALETTE.leafMid);
  }
  // tiny flowers on top
  circle(ctx, cx - w * 0.24, topY + 2, 2.2, PALETTE.flowerPink);
  circle(ctx, cx + w * 0.3, topY + 4, 2.2, PALETTE.flowerWhite);
}

/** Wooden ladder hanging from a platform. */
export function drawLadder(ctx: Ctx, x: number, topY: number, h: number) {
  ctx.strokeStyle = PALETTE.wood;
  ctx.lineWidth = 3.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + 1.5, topY);
  ctx.lineTo(x + 1.5, topY + h);
  ctx.moveTo(x + 15.5, topY);
  ctx.lineTo(x + 15.5, topY + h);
  ctx.stroke();
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = PALETTE.woodLight;
  for (let y = topY + 6; y < topY + h - 3; y += 9) {
    ctx.beginPath();
    ctx.moveTo(x + 1, y);
    ctx.lineTo(x + 16, y);
    ctx.stroke();
  }
}

/** Wooden arrow sign pointing right. */
export function drawSign(ctx: Ctx, x: number, baseY: number, text: string) {
  // post
  ctx.strokeStyle = PALETTE.trunkDark;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.lineTo(x, baseY - 38);
  ctx.stroke();
  // arrow plank
  const w = Math.max(94, text.length * 7.2 + 30);
  const y = baseY - 60;
  const h = 27;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + 3, y);
  ctx.lineTo(x + w / 2 - 13, y);
  ctx.lineTo(x + w / 2, y + h / 2);
  ctx.lineTo(x + w / 2 - 13, y + h);
  ctx.lineTo(x - w / 2 + 3, y + h);
  ctx.quadraticCurveTo(x - w / 2 - 2, y + h / 2, x - w / 2 + 3, y);
  ctx.closePath();
  const plank = ctx.createLinearGradient(0, y, 0, y + h);
  plank.addColorStop(0, PALETTE.woodLight);
  plank.addColorStop(1, PALETTE.wood);
  ctx.fillStyle = plank;
  ctx.fill();
  outlineLast(ctx, 1.6);
  // wood grain
  ctx.strokeStyle = "rgba(90, 58, 28, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + 8, y + 6);
  ctx.quadraticCurveTo(x, y + 8, x + w / 2 - 18, y + 6);
  ctx.stroke();
  // nails
  circle(ctx, x - w / 2 + 8, y + h - 5, 1.4, "#6d4a26");
  circle(ctx, x + w / 2 - 16, y + h - 5, 1.4, "#6d4a26");
  // text
  ctx.fillStyle = "#503319";
  ctx.font = "600 11px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x - 4, y + h / 2 + 0.5);
}

/** Little wooden boat with a white sail, bobbing on the lake. */
export function drawBoat(ctx: Ctx, x: number, waterY: number, t: number) {
  const bob = Math.sin(t / 750) * 2;
  const y = waterY + bob;
  const tilt = Math.sin(t / 900) * 0.03;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  // hull
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(20, 0);
  ctx.quadraticCurveTo(17, 9, 11, 10);
  ctx.lineTo(-11, 10);
  ctx.quadraticCurveTo(-17, 9, -20, 0);
  ctx.closePath();
  const hull = ctx.createLinearGradient(0, 0, 0, 10);
  hull.addColorStop(0, PALETTE.woodLight);
  hull.addColorStop(1, PALETTE.trunkDark);
  ctx.fillStyle = hull;
  ctx.fill();
  outlineLast(ctx, 1.4);
  // rim
  ctx.strokeStyle = PALETTE.trunkDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(20, 0);
  ctx.stroke();
  // mast + sail
  ctx.strokeStyle = PALETTE.trunkDark;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.lineTo(0, -26);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(2, -24);
  ctx.quadraticCurveTo(16, -16, 11, -5);
  ctx.quadraticCurveTo(6, -6, 2, -5);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  outlineLast(ctx, 1.1);
  ctx.restore();
  // reflection
  ctx.globalAlpha = 0.25;
  ellipse(ctx, x, waterY + 14, 20, 3, "#ffffff");
  ctx.globalAlpha = 1;
}
