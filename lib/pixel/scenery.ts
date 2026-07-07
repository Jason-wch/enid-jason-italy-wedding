/**
 * MapleStory-style scenery for the Lake Garda scenes: bright blue sky,
 * puffy flat-bottomed clouds, floating grass islands with ladders, chunky
 * round trees, orange mushrooms, wooden arrow signs, grass-over-soil ground,
 * plus the yellow villa (the wedding venue) and its lake.
 */

export const PALETTE = {
  // Bright day sky
  skyTop: "#4fb3ef",
  skyMid: "#8ed3f7",
  skyBottom: "#e3f6ff",
  sun: "#fff3b0",
  cloud: "#ffffff",
  cloudShade: "#d9ecf8",
  // Distant scenery
  mountainFar: "#b8dff0",
  mountainNear: "#8fd0e8",
  hill: "#8ecf6a",
  hillDark: "#6fb54e",
  // Water
  lake: "#3f9fe0",
  lakeDeep: "#2a7cc2",
  lakeShine: "#eaf8ff",
  lakeShineCool: "#bfe6fb",
  // Ground — grass over rich soil, MapleStory style
  grass: "#7cc94f",
  grassDark: "#58a832",
  grassLip: "#94dd66",
  soil: "#a8703d",
  soilDark: "#7c4f28",
  soilSpeck: "#8f6134",
  path: "#e0c089",
  pathEdge: "#c19a5e",
  stone: "#b8a98f",
  stoneDark: "#97866c",
  // Villa
  villaWall: "#f6c95c",
  villaWallShade: "#d9a83e",
  windowGlow: "#fdf3d8",
  shutter: "#3f8a4d",
  roof: "#c9674a",
  // Flora
  cypress: "#3e8a4d",
  cypressDark: "#2f6b3a",
  trunk: "#8a5a33",
  trunkDark: "#6d4525",
  leaf: "#4e9b3c",
  leafMid: "#67b84a",
  leafLight: "#8fd464",
  olive: "#9ec27a",
  oliveDark: "#7da75c",
  lemonLeaf: "#57a13f",
  lemon: "#ffd84d",
  pergolaWood: "#a06b3e",
  wisteria: "#c9a0e0",
  // Props
  mushroomCap: "#f08c2e",
  mushroomSpot: "#ffe9c9",
  mushroomStalk: "#eedec0",
  sign: "#a06b3e",
  signLight: "#c08a52",
  flowerPink: "#ff9fc0",
  flowerWhite: "#ffffff",
};

type Ctx = CanvasRenderingContext2D;

function circle(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    // older Safari fallback
    ctx.rect(x, y, w, h);
  }
  ctx.fill();
}

export function drawSky(ctx: Ctx, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, PALETTE.skyTop);
  grad.addColorStop(0.5, PALETTE.skyMid);
  grad.addColorStop(0.85, PALETTE.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

export function drawSun(ctx: Ctx, x: number, y: number, r: number) {
  ctx.fillStyle = "rgba(255, 250, 220, 0.25)";
  ctx.beginPath();
  ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 250, 220, 0.45)";
  ctx.beginPath();
  ctx.arc(x, y, r * 1.35, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, x, y, r, PALETTE.sun);
  circle(ctx, x - r * 0.25, y - r * 0.25, r * 0.55, "#fffce0");
}

/** Puffy multi-lobed cloud with a flat bottom — the MapleStory cloud. */
export function drawCloud(ctx: Ctx, x: number, y: number, s: number) {
  const w = s * 6;
  // soft shade hugging the underside
  rr(ctx, x - s * 0.4, y + s * 1.4, w + s * 0.8, s * 1.4, s * 0.7, PALETTE.cloudShade);
  // flat base
  rr(ctx, x, y + s * 0.8, w, s * 1.8, s * 0.9, PALETTE.cloud);
  // lobes
  circle(ctx, x + s * 1.2, y + s * 0.8, s * 1.15, PALETTE.cloud);
  circle(ctx, x + s * 2.8, y + s * 0.2, s * 1.5, PALETTE.cloud);
  circle(ctx, x + s * 4.5, y + s * 0.9, s * 1.05, PALETTE.cloud);
}

/**
 * Background ridges. `far` draws hazy blue mountains; near draws the
 * rolling green hills that sit behind the playfield.
 */
export function drawMountains(ctx: Ctx, w: number, y: number, offset: number, far: boolean) {
  if (far) {
    ctx.fillStyle = PALETTE.mountainFar;
    const peakW = 300;
    for (let x = -peakW + (offset % peakW) - peakW; x < w + peakW; x += peakW) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + peakW * 0.5, y - 110, x + peakW, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillRect(0, y, w, 4);
    return;
  }
  // near: overlapping round green hills
  const humpW = 260;
  for (let i = 0; i < Math.ceil(w / humpW) + 3; i++) {
    const x = -humpW + ((offset % humpW) + i * humpW) - humpW;
    ctx.fillStyle = i % 2 === 0 ? PALETTE.hill : PALETTE.hillDark;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.quadraticCurveTo(x + humpW * 0.5, y - 78, x + humpW, y + 8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = PALETTE.hillDark;
  ctx.fillRect(0, y + 4, w, 6);
}

/**
 * Bright cartoon water with white sparkles. Pass `sunX` for a soft
 * light column under the sun.
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
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, PALETTE.lake);
  grad.addColorStop(1, PALETTE.lakeDeep);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
  // surface highlight lip
  ctx.fillStyle = PALETTE.lakeShineCool;
  ctx.fillRect(x, y, w, 3);
  // animated sparkles
  const phase = Math.floor(t / 380);
  for (let i = 0; i < Math.floor(w / 42); i++) {
    const sx = x + i * 42 + ((phase + i) % 3) * 8;
    const sy = y + 8 + ((i * 37) % Math.max(1, h - 16));
    const nearSun = sunX !== undefined && Math.abs(sx - sunX) < 80;
    ctx.fillStyle = nearSun ? PALETTE.lakeShine : PALETTE.lakeShineCool;
    ctx.fillRect(sx, sy, 14, 3);
    ctx.fillRect(sx + 4, sy - 2, 5, 2);
  }
}

/** Chunky MapleStory tree: sturdy trunk + big layered leaf-ball canopy. */
export function drawTree(ctx: Ctx, x: number, baseY: number, s: number) {
  // trunk with a little flare at the roots
  ctx.fillStyle = PALETTE.trunk;
  ctx.beginPath();
  ctx.moveTo(x - 5 * s, baseY);
  ctx.lineTo(x - 3 * s, baseY - 26 * s);
  ctx.lineTo(x + 3 * s, baseY - 26 * s);
  ctx.lineTo(x + 5 * s, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.trunkDark;
  ctx.fillRect(x + 1 * s, baseY - 24 * s, 3 * s, 24 * s);
  // canopy: dark base cluster
  circle(ctx, x, baseY - 40 * s, 17 * s, PALETTE.leaf);
  circle(ctx, x - 13 * s, baseY - 32 * s, 12 * s, PALETTE.leaf);
  circle(ctx, x + 13 * s, baseY - 32 * s, 12 * s, PALETTE.leaf);
  // mid layer
  circle(ctx, x - 7 * s, baseY - 40 * s, 11 * s, PALETTE.leafMid);
  circle(ctx, x + 8 * s, baseY - 38 * s, 10 * s, PALETTE.leafMid);
  circle(ctx, x, baseY - 48 * s, 9 * s, PALETTE.leafMid);
  // highlights catching the sun
  circle(ctx, x - 6 * s, baseY - 48 * s, 5.5 * s, PALETTE.leafLight);
  circle(ctx, x + 4 * s, baseY - 44 * s, 4 * s, PALETTE.leafLight);
  circle(ctx, x - 12 * s, baseY - 38 * s, 3.5 * s, PALETTE.leafLight);
}

/** The iconic orange mushroom. */
export function drawMushroom(ctx: Ctx, x: number, baseY: number, s: number) {
  // stalk
  rr(ctx, x - 4 * s, baseY - 10 * s, 8 * s, 10 * s, 3 * s, PALETTE.mushroomStalk);
  // cap
  ctx.fillStyle = PALETTE.mushroomCap;
  ctx.beginPath();
  ctx.moveTo(x - 11 * s, baseY - 9 * s);
  ctx.quadraticCurveTo(x, baseY - 24 * s, x + 11 * s, baseY - 9 * s);
  ctx.quadraticCurveTo(x, baseY - 5 * s, x - 11 * s, baseY - 9 * s);
  ctx.fill();
  // spots
  circle(ctx, x - 4 * s, baseY - 14 * s, 2 * s, PALETTE.mushroomSpot);
  circle(ctx, x + 4 * s, baseY - 12.5 * s, 1.6 * s, PALETTE.mushroomSpot);
  circle(ctx, x + 0.5 * s, baseY - 18 * s, 1.3 * s, PALETTE.mushroomSpot);
}

/** Floating grass island — the MapleStory sky platform. */
export function drawFloatingIsland(ctx: Ctx, cx: number, topY: number, w: number) {
  const h = w * 0.5;
  // earth blob tapering to a rounded point
  ctx.fillStyle = PALETTE.soil;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, topY + 8);
  ctx.quadraticCurveTo(cx - w * 0.32, topY + h * 0.75, cx, topY + h);
  ctx.quadraticCurveTo(cx + w * 0.32, topY + h * 0.75, cx + w / 2, topY + 8);
  ctx.closePath();
  ctx.fill();
  // darker underside + speckles
  ctx.fillStyle = PALETTE.soilDark;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.3, topY + h * 0.45);
  ctx.quadraticCurveTo(cx, topY + h * 0.95, cx + w * 0.3, topY + h * 0.45);
  ctx.quadraticCurveTo(cx, topY + h * 0.6, cx - w * 0.3, topY + h * 0.45);
  ctx.fill();
  ctx.fillStyle = PALETTE.soilSpeck;
  ctx.fillRect(cx - w * 0.2, topY + h * 0.3, 5, 3);
  ctx.fillRect(cx + w * 0.12, topY + h * 0.42, 4, 3);
  // grass cap with overhanging lip
  rr(ctx, cx - w / 2 - 4, topY, w + 8, 12, 6, PALETTE.grass);
  ctx.fillStyle = PALETTE.grassLip;
  ctx.fillRect(cx - w / 2 - 4, topY, w + 8, 3);
  // grass tufts
  ctx.fillStyle = PALETTE.grassDark;
  for (let i = 0; i < w / 22; i++) {
    ctx.fillRect(cx - w / 2 + 8 + i * 22, topY + 9, 8, 3);
  }
}

/** Wooden ladder (hangs from platforms). */
export function drawLadder(ctx: Ctx, x: number, topY: number, h: number) {
  ctx.fillStyle = PALETTE.pergolaWood;
  ctx.fillRect(x, topY, 3, h);
  ctx.fillRect(x + 13, topY, 3, h);
  for (let y = topY + 5; y < topY + h - 3; y += 9) {
    ctx.fillRect(x, y, 16, 3);
  }
}

export function drawCypress(ctx: Ctx, x: number, baseY: number, height: number) {
  ctx.fillStyle = PALETTE.trunk;
  ctx.fillRect(x - 2, baseY - 8, 4, 8);
  // smooth teardrop silhouette in two greens
  ctx.fillStyle = PALETTE.cypress;
  ctx.beginPath();
  ctx.moveTo(x, baseY - height);
  ctx.quadraticCurveTo(x + height * 0.24, baseY - height * 0.45, x, baseY - 4);
  ctx.quadraticCurveTo(x - height * 0.24, baseY - height * 0.45, x, baseY - height);
  ctx.fill();
  ctx.fillStyle = PALETTE.cypressDark;
  ctx.beginPath();
  ctx.moveTo(x, baseY - height + 6);
  ctx.quadraticCurveTo(x - height * 0.16, baseY - height * 0.45, x, baseY - 6);
  ctx.quadraticCurveTo(x - height * 0.05, baseY - height * 0.45, x, baseY - height + 6);
  ctx.fill();
  // highlight edge
  ctx.fillStyle = PALETTE.leafLight;
  ctx.beginPath();
  ctx.moveTo(x + 1, baseY - height + 8);
  ctx.quadraticCurveTo(x + height * 0.15, baseY - height * 0.5, x + 1, baseY - height * 0.2);
  ctx.quadraticCurveTo(x + height * 0.08, baseY - height * 0.5, x + 1, baseY - height + 8);
  ctx.fill();
}

export function drawOliveTree(ctx: Ctx, x: number, baseY: number, s: number) {
  ctx.fillStyle = PALETTE.trunk;
  ctx.fillRect(x - 2 * s, baseY - 10 * s, 4 * s, 10 * s);
  ctx.fillRect(x - 4 * s, baseY - 14 * s, 4 * s, 5 * s);
  ctx.fillRect(x + 1 * s, baseY - 13 * s, 4 * s, 4 * s);
  circle(ctx, x - 5 * s, baseY - 16 * s, 6.5 * s, PALETTE.oliveDark);
  circle(ctx, x + 5 * s, baseY - 17 * s, 6.5 * s, PALETTE.olive);
  circle(ctx, x, baseY - 21 * s, 7 * s, PALETTE.olive);
  circle(ctx, x - 2 * s, baseY - 23 * s, 3.5 * s, PALETTE.leafLight);
}

export function drawLemonTree(ctx: Ctx, x: number, baseY: number, s: number) {
  ctx.fillStyle = PALETTE.trunk;
  ctx.fillRect(x - 1.5 * s, baseY - 9 * s, 3 * s, 9 * s);
  circle(ctx, x, baseY - 16 * s, 8.5 * s, PALETTE.lemonLeaf);
  circle(ctx, x - 6 * s, baseY - 13 * s, 5 * s, PALETTE.lemonLeaf);
  circle(ctx, x + 6 * s, baseY - 13 * s, 5 * s, PALETTE.lemonLeaf);
  circle(ctx, x - 2 * s, baseY - 20 * s, 4 * s, PALETTE.leafMid);
  // lemons
  const lemons: [number, number][] = [
    [-5, -17],
    [1, -20],
    [5, -14],
    [-2, -12],
    [6, -19],
  ];
  for (const [lx, ly] of lemons) {
    circle(ctx, x + lx * s, baseY + ly * s, 1.6 * s, PALETTE.lemon);
  }
}

export function drawPergola(ctx: Ctx, x: number, baseY: number, w: number) {
  const h = 64;
  const postW = 6;
  ctx.fillStyle = PALETTE.pergolaWood;
  rr(ctx, x, baseY - h, postW, h, 2, PALETTE.pergolaWood);
  rr(ctx, x + w - postW, baseY - h, postW, h, 2, PALETTE.pergolaWood);
  if (w > 140) rr(ctx, x + w / 2 - postW / 2, baseY - h, postW, h, 2, PALETTE.pergolaWood);
  rr(ctx, x - 8, baseY - h, w + 16, 5, 2, PALETTE.pergolaWood);
  for (let bx = x - 4; bx < x + w + 4; bx += 18) {
    ctx.fillStyle = PALETTE.pergolaWood;
    ctx.fillRect(bx, baseY - h - 5, 6, 5);
  }
  // wisteria clusters
  for (let i = 0; i < w / 24; i++) {
    const wx = x + 8 + i * 24;
    const drop = 8 + ((i * 13) % 10);
    circle(ctx, wx + 2, baseY - h + 8, 4, PALETTE.wisteria);
    circle(ctx, wx + 2, baseY - h + 8 + drop * 0.6, 3, PALETTE.wisteria);
  }
  // festoon string lights
  ctx.fillStyle = PALETTE.sun;
  const sag = 8;
  for (let i = 0; i <= 8; i++) {
    const p = i / 8;
    const lx = x + p * w;
    const ly = baseY - h + 16 + Math.sin(p * Math.PI) * sag;
    circle(ctx, lx, ly, 1.8, PALETTE.sun);
  }
}

export function drawTerraceWall(ctx: Ctx, x: number, y: number, w: number) {
  rr(ctx, x, y, w, 10, 3, PALETTE.stone);
  ctx.fillStyle = PALETTE.stoneDark;
  for (let i = 0; i < w / 16; i++) {
    ctx.fillRect(x + i * 16 + (i % 2) * 6, y + 4, 10, 2);
  }
  ctx.fillRect(x, y + 9, w, 1);
}

export function drawBoat(ctx: Ctx, x: number, waterY: number, t: number) {
  const bob = Math.sin(t / 700) * 1.5;
  const y = waterY + bob;
  ctx.fillStyle = PALETTE.pergolaWood;
  ctx.beginPath();
  ctx.moveTo(x - 18, y);
  ctx.lineTo(x + 18, y);
  ctx.lineTo(x + 12, y + 9);
  ctx.lineTo(x - 12, y + 9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.trunkDark;
  ctx.fillRect(x - 1, y - 22, 2, 22);
  ctx.fillStyle = PALETTE.flowerWhite;
  ctx.beginPath();
  ctx.moveTo(x + 1, y - 21);
  ctx.quadraticCurveTo(x + 13, y - 14, x + 9, y - 6);
  ctx.lineTo(x + 1, y - 6);
  ctx.closePath();
  ctx.fill();
}

export function drawBirds(ctx: Ctx, x: number, y: number, t: number) {
  ctx.strokeStyle = "rgba(43, 74, 100, 0.6)";
  ctx.lineWidth = 1.5;
  const flap = Math.floor(t / 300) % 2 ? -2 : 1;
  const bird = (bx: number, by: number) => {
    ctx.beginPath();
    ctx.moveTo(bx - 4, by + flap);
    ctx.quadraticCurveTo(bx, by - 2, bx, by);
    ctx.quadraticCurveTo(bx, by - 2, bx + 4, by + flap);
    ctx.stroke();
  };
  bird(x, y);
  bird(x + 22, y + 6);
  bird(x + 40, y - 4);
}

export function drawVilla(ctx: Ctx, x: number, baseY: number, scale: number) {
  const w = 190 * scale;
  const h = 150 * scale;
  const top = baseY - h;

  // stone base terrace with balustrade
  rr(ctx, x - 14 * scale, baseY - 12 * scale, w + 28 * scale, 12 * scale, 2, PALETTE.stone);
  ctx.fillStyle = PALETTE.stoneDark;
  for (let i = 0; i < (w + 28 * scale) / (14 * scale); i++) {
    ctx.fillRect(x - 14 * scale + i * 14 * scale, baseY - 6 * scale, 10 * scale, 2 * scale);
  }
  ctx.fillStyle = PALETTE.stone;
  for (let i = 0; i < (w + 28 * scale) / (10 * scale); i++) {
    ctx.fillRect(x - 14 * scale + i * 10 * scale, baseY - 18 * scale, 3 * scale, 6 * scale);
  }
  rr(ctx, x - 14 * scale, baseY - 20 * scale, w + 28 * scale, 3 * scale, 1, PALETTE.stone);

  // walls
  ctx.fillStyle = PALETTE.villaWall;
  ctx.fillRect(x, top, w, h - 12 * scale);
  ctx.fillStyle = PALETTE.villaWallShade;
  ctx.fillRect(x + w - 16 * scale, top, 16 * scale, h - 12 * scale);

  // climbing vine
  ctx.fillStyle = PALETTE.leafMid;
  ctx.fillRect(x + 2 * scale, top + 20 * scale, 3 * scale, h - 40 * scale);
  circle(ctx, x + 6 * scale, top + 36 * scale, 4 * scale, PALETTE.leafMid);
  circle(ctx, x + 5 * scale, top + 64 * scale, 5 * scale, PALETTE.leaf);
  circle(ctx, x + 7 * scale, top + 94 * scale, 4 * scale, PALETTE.leafMid);

  // roof
  rr(ctx, x - 8 * scale, top - 10 * scale, w + 16 * scale, 12 * scale, 3, PALETTE.roof);
  rr(ctx, x - 4 * scale, top - 16 * scale, w + 8 * scale, 8 * scale, 3, PALETTE.roof);

  // the tower, rising behind the right side
  const tw = 40 * scale;
  const tx = x + w - 62 * scale;
  const tTop = top - 58 * scale;
  ctx.fillStyle = PALETTE.villaWall;
  ctx.fillRect(tx, tTop, tw, 58 * scale);
  ctx.fillStyle = PALETTE.villaWallShade;
  ctx.fillRect(tx + tw - 8 * scale, tTop, 8 * scale, 58 * scale);
  rr(ctx, tx - 5 * scale, tTop - 8 * scale, tw + 10 * scale, 10 * scale, 3, PALETTE.roof);
  rr(ctx, tx - 2 * scale, tTop - 13 * scale, tw + 4 * scale, 6 * scale, 3, PALETTE.roof);
  // arched tower window
  const twx = tx + tw / 2 - 6 * scale;
  rr(ctx, twx, tTop + 11 * scale, 12 * scale, 19 * scale, 6 * scale, PALETTE.windowGlow);

  // windows with green shutters, 3 floors x 4 columns
  const winW = 14 * scale;
  const winH = 22 * scale;
  for (let fl = 0; fl < 3; fl++) {
    for (let col = 0; col < 4; col++) {
      const wx = x + 14 * scale + col * 42 * scale;
      const wy = top + 12 * scale + fl * 42 * scale;
      ctx.fillStyle = PALETTE.shutter;
      rr(ctx, wx - 5 * scale, wy, 5 * scale, winH, 1, PALETTE.shutter);
      rr(ctx, wx + winW, wy, 5 * scale, winH, 1, PALETTE.shutter);
      rr(ctx, wx, wy - 3 * scale, winW, winH + 3 * scale, 4 * scale, PALETTE.windowGlow);
      ctx.fillStyle = "#d9c391";
      ctx.fillRect(wx, wy + winH / 2 - scale, winW, 2 * scale);
      ctx.fillRect(wx + winW / 2 - scale, wy, 2 * scale, winH);
    }
  }

  // door with little porch arch
  const dx = x + w / 2 - 11 * scale;
  const dy = baseY - 12 * scale - 30 * scale;
  rr(ctx, dx - 6 * scale, dy - 6 * scale, 34 * scale, 6 * scale, 2, PALETTE.roof);
  rr(ctx, dx, dy - 3 * scale, 22 * scale, 33 * scale, 8 * scale, PALETTE.shutter);
  circle(ctx, dx + 17 * scale, dy + 14 * scale, 1.6 * scale, PALETTE.windowGlow);
}

/** Wooden arrow sign pointing right, MapleStory style. */
export function drawSign(ctx: Ctx, x: number, baseY: number, text: string) {
  // post
  rr(ctx, x - 3, baseY - 36, 6, 36, 2, PALETTE.trunkDark);
  // arrow plank
  const w = Math.max(92, text.length * 7 + 26);
  const y = baseY - 58;
  const h = 26;
  ctx.fillStyle = PALETTE.sign;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x + w / 2 - 12, y);
  ctx.lineTo(x + w / 2, y + h / 2);
  ctx.lineTo(x + w / 2 - 12, y + h);
  ctx.lineTo(x - w / 2, y + h);
  ctx.closePath();
  ctx.fill();
  // lighter face inset
  ctx.fillStyle = PALETTE.signLight;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + 3, y + 3);
  ctx.lineTo(x + w / 2 - 13, y + 3);
  ctx.lineTo(x + w / 2 - 5, y + h / 2);
  ctx.lineTo(x + w / 2 - 13, y + h - 3);
  ctx.lineTo(x - w / 2 + 3, y + h - 3);
  ctx.closePath();
  ctx.fill();
  // text
  ctx.fillStyle = "#5b3d20";
  ctx.font = "600 11px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x - 4, y + h / 2 + 0.5);
}

export function drawBush(ctx: Ctx, x: number, baseY: number, s: number) {
  circle(ctx, x + s * 0.7, baseY - s * 0.6, s * 0.8, PALETTE.leaf);
  circle(ctx, x + s * 1.6, baseY - s * 0.7, s * 0.9, PALETTE.leafMid);
  circle(ctx, x + s * 1.1, baseY - s * 1.2, s * 0.7, PALETTE.leafLight);
  circle(ctx, x + s * 0.5, baseY - s * 1.1, s * 0.35, PALETTE.flowerPink);
  circle(ctx, x + s * 1.8, baseY - s * 1.3, s * 0.3, PALETTE.flowerWhite);
}

/** Grass over rich soil, with a bright lip — the MapleStory ground. */
export function drawGrass(ctx: Ctx, x: number, y: number, w: number, h: number) {
  // soil body
  ctx.fillStyle = PALETTE.soil;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.soilSpeck;
  for (let i = 0; i < w / 38; i++) {
    const gx = x + i * 38 + ((i * 13) % 19);
    const gy = y + 24 + ((i * 29) % Math.max(1, h - 30));
    ctx.fillRect(gx, gy, 7, 4);
    ctx.fillRect(gx + 14, gy + 9, 5, 3);
  }
  ctx.fillStyle = PALETTE.soilDark;
  ctx.fillRect(x, y + Math.min(h - 4, 52), w, Math.max(0, h - 52));
  // grass band
  ctx.fillStyle = PALETTE.grass;
  ctx.fillRect(x, y, w, 14);
  ctx.fillStyle = PALETTE.grassLip;
  ctx.fillRect(x, y, w, 3);
  // tufts along the edge
  ctx.fillStyle = PALETTE.grassDark;
  for (let i = 0; i < w / 26; i++) {
    ctx.fillRect(x + i * 26 + ((i * 7) % 9), y + 11, 9, 3);
  }
}

export function drawPath(ctx: Ctx, x: number, y: number, w: number, h: number) {
  rr(ctx, x, y, w, h, 4, PALETTE.path);
  ctx.fillStyle = PALETTE.pathEdge;
  ctx.fillRect(x, y, w, 2);
  ctx.fillRect(x, y + h - 2, w, 2);
  for (let i = 0; i < w / 40; i++) {
    ctx.fillRect(x + i * 40 + 12, y + h / 2 - 1, 16, 2);
  }
}
