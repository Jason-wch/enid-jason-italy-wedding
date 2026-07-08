/**
 * MapleStory-style chibi characters drawn as smooth vector art on canvas —
 * big glossy head, huge sparkly eyes, tiny body. No pixel grids.
 *
 * Characters use the same CharacterConfig shape stored in Supabase and
 * localStorage, so previously saved characters keep working.
 *
 * Coordinate system: a 16 x 22 "unit" box multiplied by `scale`, matching
 * the footprint of the old pixel sprites so all layout math stays valid.
 */

export const SPRITE_W = 16;
export const SPRITE_H = 22;

export type CharacterConfig = {
  skin: number;
  hairStyle: number;
  hairColor: number;
  outfit: number;
  outfitColor: number;
};

export const SKINS: { label: string; colors: [string, string] }[] = [
  { label: "Porcelain", colors: ["#ffdcb8", "#eab88a"] },
  { label: "Warm", colors: ["#f0c092", "#d49a63"] },
  { label: "Tan", colors: ["#c98a5b", "#a86b40"] },
  { label: "Deep", colors: ["#8d5a3b", "#6f4227"] },
];

export const HAIR_COLORS: { label: string; colors: [string, string] }[] = [
  { label: "Black", colors: ["#332d30", "#4d444a"] },
  { label: "Brown", colors: ["#5b3a21", "#7a5233"] },
  { label: "Blonde", colors: ["#e7c95f", "#c2a244"] },
  { label: "Auburn", colors: ["#a8432c", "#c25c40"] },
  { label: "Pink", colors: ["#d8a48f", "#c07f6a"] },
  { label: "Blue", colors: ["#5f8496", "#83aebe"] },
];

/* Kept in sync with PALETTE_SWATCHES in app/dress-code/page.tsx. */
export const OUTFIT_COLORS: { label: string; colors: [string, string] }[] = [
  { label: "Ivory", colors: ["#f2ead8", "#cfc09a"] },
  { label: "Sage", colors: ["#97a383", "#6e8058"] },
  { label: "Dusty Blue", colors: ["#83aebe", "#5f8496"] },
  { label: "Terracotta", colors: ["#c76b4b", "#a4553a"] },
  { label: "Plum", colors: ["#8a5f8f", "#6f4a75"] },
  { label: "Navy", colors: ["#3f5a78", "#2e4863"] },
];

export const HAIR_STYLES: string[] = ["Short & Neat", "Long", "Ponytail", "Bob", "Spiky"];
export const OUTFITS: string[] = ["Suit", "Sundress", "Tee & Shorts", "Overalls", "Gown"];

export const DEFAULT_CHARACTER: CharacterConfig = {
  skin: 0,
  hairStyle: 0,
  hairColor: 1,
  outfit: 0,
  outfitColor: 5,
};

export function randomCharacter(): CharacterConfig {
  const r = (n: number) => Math.floor(Math.random() * n);
  return {
    skin: r(SKINS.length),
    hairStyle: r(HAIR_STYLES.length),
    hairColor: r(HAIR_COLORS.length),
    outfit: r(OUTFITS.length),
    outfitColor: r(OUTFIT_COLORS.length),
  };
}

export function normalizeCharacter(raw: unknown): CharacterConfig {
  const c = (raw ?? {}) as Partial<Record<keyof CharacterConfig, unknown>>;
  const pick = (v: unknown, max: number) => {
    const n = typeof v === "number" ? Math.floor(v) : 0;
    return n >= 0 && n < max ? n : 0;
  };
  return {
    skin: pick(c.skin, SKINS.length),
    hairStyle: pick(c.hairStyle, HAIR_STYLES.length),
    hairColor: pick(c.hairColor, HAIR_COLORS.length),
    outfit: pick(c.outfit, OUTFITS.length),
    outfitColor: pick(c.outfitColor, OUTFIT_COLORS.length),
  };
}

/** Stable tiny hash for deterministic per-guest animation offsets. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/* ---------------------------------------------------------------------------
   Color helpers
--------------------------------------------------------------------------- */

type Ctx = CanvasRenderingContext2D;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)}, ${Math.round(
    A[1] + (B[1] - A[1]) * t
  )}, ${Math.round(A[2] + (B[2] - A[2]) * t)})`;
}

const light = (c: string, t: number) => mix(c, "#ffffff", t);
const dark = (c: string, t: number) => mix(c, "#241209", t);

/* ---------------------------------------------------------------------------
   Small vector helpers (all in the 16x22 unit space)
--------------------------------------------------------------------------- */

function fillStroke(ctx: Ctx, fill: string, outline?: string, lw = 0.26) {
  ctx.fillStyle = fill;
  ctx.fill();
  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

/** Rounded limb between two points, with a thin darker outline. */
function capsule(
  ctx: Ctx,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: number,
  fill: string,
  outline?: string
) {
  ctx.lineCap = "round";
  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = r * 2 + 0.44;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.strokeStyle = fill;
  ctx.lineWidth = r * 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function ellipsePath(ctx: Ctx, cx: number, cy: number, rx: number, ry: number) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}

/* ---------------------------------------------------------------------------
   Head & face
--------------------------------------------------------------------------- */

const HEAD = { cx: 8, cy: 6.35, rx: 5.7, ry: 5.3 };

function drawHead(ctx: Ctx, skin: [string, string]) {
  ellipsePath(ctx, HEAD.cx, HEAD.cy, HEAD.rx, HEAD.ry);
  fillStroke(ctx, skin[0], dark(skin[0], 0.45), 0.3);
  // soft cheek/jaw shading
  ctx.globalAlpha = 0.4;
  ellipsePath(ctx, 8, 10.9, 3.1, 0.85);
  ctx.fillStyle = skin[1];
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawFace(ctx: Ctx, blink?: boolean) {
  const eyes: number[] = [5.85, 10.15];

  // brows
  ctx.strokeStyle = "rgba(58, 39, 26, 0.65)";
  ctx.lineWidth = 0.22;
  ctx.lineCap = "round";
  for (const cx of eyes) {
    ctx.beginPath();
    ctx.moveTo(cx - 1.0, 5.6);
    ctx.quadraticCurveTo(cx, 5.1, cx + 1.0, 5.55);
    ctx.stroke();
  }

  if (blink) {
    // closed lashes — happy arcs
    ctx.strokeStyle = "#2b1d13";
    ctx.lineWidth = 0.34;
    for (const cx of eyes) {
      ctx.beginPath();
      ctx.moveTo(cx - 1.0, 7.5);
      ctx.quadraticCurveTo(cx, 8.5, cx + 1.0, 7.5);
      ctx.stroke();
    }
  } else {
    for (const cx of eyes) {
      // sclera
      ellipsePath(ctx, cx, 7.75, 1.06, 1.6);
      fillStroke(ctx, "#ffffff", "rgba(43, 28, 18, 0.5)", 0.16);
      // iris — warm brown gradient, MapleStory style
      const grad = ctx.createLinearGradient(0, 6.3, 0, 9.3);
      grad.addColorStop(0, "#31221a");
      grad.addColorStop(1, "#7a5136");
      ctx.fillStyle = grad;
      ellipsePath(ctx, cx, 7.85, 0.8, 1.36);
      ctx.fill();
      // pupil
      ctx.fillStyle = "#1a0f09";
      ellipsePath(ctx, cx, 7.95, 0.4, 0.72);
      ctx.fill();
      // sparkle glints
      ctx.fillStyle = "#ffffff";
      ellipsePath(ctx, cx - 0.28, 7.05, 0.34, 0.4);
      ctx.fill();
      ctx.globalAlpha = 0.85;
      ellipsePath(ctx, cx + 0.3, 8.55, 0.17, 0.2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // top lash line
      ctx.strokeStyle = "#20140c";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(cx - 1.12, 7.0);
      ctx.quadraticCurveTo(cx, 6.1, cx + 1.12, 7.0);
      ctx.stroke();
    }
  }

  // little open smile
  ctx.beginPath();
  ctx.moveTo(7.15, 10.0);
  ctx.quadraticCurveTo(8, 10.95, 8.85, 10.0);
  ctx.quadraticCurveTo(8, 10.35, 7.15, 10.0);
  ctx.closePath();
  ctx.fillStyle = "#a34b40";
  ctx.fill();
  ctx.strokeStyle = "#8c4034";
  ctx.lineWidth = 0.16;
  ctx.stroke();

  // blush
  ctx.globalAlpha = 0.26;
  ctx.fillStyle = "#ef8a6f";
  ellipsePath(ctx, 4.7, 9.35, 0.85, 0.5);
  ctx.fill();
  ellipsePath(ctx, 11.3, 9.35, 0.85, 0.5);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/* ---------------------------------------------------------------------------
   Hair — back layer (behind body/head) and front layer (over the face)
--------------------------------------------------------------------------- */

function hairTones(hair: [string, string]) {
  return {
    base: hair[0],
    shade: dark(hair[0], 0.22),
    shine: light(hair[0], 0.32),
    outline: dark(hair[0], 0.42),
  };
}

function drawHairBack(ctx: Ctx, style: number, hair: [string, string]) {
  const t = hairTones(hair);
  if (style === 1) {
    // Long — flowing mane behind the body with a wavy hem
    ctx.beginPath();
    ctx.moveTo(2.5, 4.4);
    ctx.quadraticCurveTo(1.4, 9.0, 1.9, 13.2);
    ctx.quadraticCurveTo(2.1, 14.6, 3.1, 13.8);
    ctx.quadraticCurveTo(3.9, 15.4, 4.9, 14.2);
    ctx.quadraticCurveTo(5.7, 15.6, 6.7, 14.4);
    ctx.lineTo(9.3, 14.4);
    ctx.quadraticCurveTo(10.3, 15.6, 11.1, 14.2);
    ctx.quadraticCurveTo(12.1, 15.4, 12.9, 13.8);
    ctx.quadraticCurveTo(13.9, 14.6, 14.1, 13.2);
    ctx.quadraticCurveTo(14.6, 9.0, 13.5, 4.4);
    ctx.quadraticCurveTo(8, 0.6, 2.5, 4.4);
    ctx.closePath();
    fillStroke(ctx, t.shade, t.outline, 0.24);
  } else if (style === 2) {
    // Ponytail — swooping tail behind the head
    ctx.beginPath();
    ctx.moveTo(10.6, 2.0);
    ctx.quadraticCurveTo(15.4, 3.2, 15.2, 8.0);
    ctx.quadraticCurveTo(15.05, 11.4, 13.6, 13.4);
    ctx.quadraticCurveTo(13.4, 11.2, 12.6, 9.6);
    ctx.quadraticCurveTo(13.4, 6.4, 11.4, 4.2);
    ctx.closePath();
    fillStroke(ctx, t.shade, t.outline, 0.24);
    // hair tie
    ellipsePath(ctx, 12.35, 3.35, 0.62, 0.62);
    fillStroke(ctx, "#c14b45", dark("#c14b45", 0.35), 0.18);
  } else if (style === 3) {
    // Bob — rounded volume behind the head
    ctx.beginPath();
    ctx.moveTo(2.0, 6.0);
    ctx.quadraticCurveTo(1.5, 11.0, 3.6, 11.6);
    ctx.lineTo(12.4, 11.6);
    ctx.quadraticCurveTo(14.5, 11.0, 14.0, 6.0);
    ctx.quadraticCurveTo(8, 2.0, 2.0, 6.0);
    ctx.closePath();
    fillStroke(ctx, t.shade, t.outline, 0.24);
  }
}

function drawHairFront(ctx: Ctx, style: number, hair: [string, string]) {
  const t = hairTones(hair);

  const shineArc = (y1: number, ymid: number) => {
    ctx.strokeStyle = t.shine;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 0.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(4.4, y1);
    ctx.quadraticCurveTo(8, ymid, 11.6, y1);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  if (style === 0) {
    // Short & Neat — glossy cap with a softly pointed fringe
    ctx.beginPath();
    ctx.moveTo(2.35, 7.3);
    ctx.quadraticCurveTo(1.7, 2.4, 5.4, 1.0);
    ctx.quadraticCurveTo(8, 0.2, 10.6, 1.0);
    ctx.quadraticCurveTo(14.3, 2.4, 13.65, 7.3);
    // fringe: rounded dips across the forehead, right to left
    ctx.quadraticCurveTo(13.2, 4.9, 12.1, 4.7);
    ctx.quadraticCurveTo(11.4, 5.9, 10.4, 4.5);
    ctx.quadraticCurveTo(9.2, 5.9, 8.0, 4.4);
    ctx.quadraticCurveTo(6.8, 5.9, 5.6, 4.5);
    ctx.quadraticCurveTo(4.6, 5.9, 3.9, 4.7);
    ctx.quadraticCurveTo(2.8, 4.9, 2.35, 7.3);
    ctx.closePath();
    fillStroke(ctx, t.base, t.outline, 0.26);
    // sideburns
    ctx.beginPath();
    ctx.moveTo(2.4, 6.4);
    ctx.quadraticCurveTo(2.2, 8.6, 2.9, 9.2);
    ctx.quadraticCurveTo(3.5, 8.0, 3.4, 6.6);
    ctx.closePath();
    ctx.moveTo(13.6, 6.4);
    ctx.quadraticCurveTo(13.8, 8.6, 13.1, 9.2);
    ctx.quadraticCurveTo(12.5, 8.0, 12.6, 6.6);
    ctx.closePath();
    fillStroke(ctx, t.base, t.outline, 0.2);
    shineArc(2.6, 1.2);
  } else if (style === 1) {
    // Long — middle-parted curtain bangs + face-framing locks
    ctx.beginPath();
    ctx.moveTo(2.3, 7.0);
    ctx.quadraticCurveTo(1.8, 2.2, 5.6, 0.9);
    ctx.quadraticCurveTo(8, 0.1, 10.4, 0.9);
    ctx.quadraticCurveTo(14.2, 2.2, 13.7, 7.0);
    // right lock down the face
    ctx.quadraticCurveTo(13.9, 9.4, 12.9, 11.0);
    ctx.quadraticCurveTo(12.3, 9.2, 12.4, 7.2);
    ctx.quadraticCurveTo(12.2, 4.6, 10.6, 3.6);
    // parted fringe sweeping from the center
    ctx.quadraticCurveTo(9.0, 4.9, 8.35, 3.4);
    ctx.quadraticCurveTo(8.0, 3.0, 7.65, 3.4);
    ctx.quadraticCurveTo(7.0, 4.9, 5.4, 3.6);
    ctx.quadraticCurveTo(3.8, 4.6, 3.6, 7.2);
    ctx.quadraticCurveTo(3.7, 9.2, 3.1, 11.0);
    ctx.quadraticCurveTo(2.1, 9.4, 2.3, 7.0);
    ctx.closePath();
    fillStroke(ctx, t.base, t.outline, 0.26);
    shineArc(2.4, 1.0);
  } else if (style === 2) {
    // Ponytail — swept-back cap with a side-swooped fringe
    ctx.beginPath();
    ctx.moveTo(2.35, 7.2);
    ctx.quadraticCurveTo(1.75, 2.4, 5.5, 1.0);
    ctx.quadraticCurveTo(8, 0.2, 10.5, 1.0);
    ctx.quadraticCurveTo(14.25, 2.4, 13.65, 7.2);
    // one big swoop across the forehead
    ctx.quadraticCurveTo(13.4, 4.4, 11.6, 4.1);
    ctx.quadraticCurveTo(7.4, 5.9, 4.4, 4.5);
    ctx.quadraticCurveTo(3.0, 4.9, 2.35, 7.2);
    ctx.closePath();
    fillStroke(ctx, t.base, t.outline, 0.26);
    // small side strand
    ctx.beginPath();
    ctx.moveTo(2.5, 6.2);
    ctx.quadraticCurveTo(2.2, 8.8, 3.0, 9.6);
    ctx.quadraticCurveTo(3.6, 8.2, 3.5, 6.4);
    ctx.closePath();
    fillStroke(ctx, t.base, t.outline, 0.2);
    shineArc(2.5, 1.15);
  } else if (style === 3) {
    // Bob — face-framing curve with a straight fringe
    ctx.beginPath();
    ctx.moveTo(1.95, 6.2);
    ctx.quadraticCurveTo(1.6, 2.2, 5.5, 0.95);
    ctx.quadraticCurveTo(8, 0.15, 10.5, 0.95);
    ctx.quadraticCurveTo(14.4, 2.2, 14.05, 6.2);
    ctx.quadraticCurveTo(13.95, 10.2, 12.2, 11.3);
    ctx.quadraticCurveTo(11.6, 11.6, 11.9, 10.4);
    ctx.quadraticCurveTo(12.4, 8.6, 12.35, 6.9);
    // straight fringe with soft dips
    ctx.quadraticCurveTo(12.3, 5.2, 11.4, 4.7);
    ctx.quadraticCurveTo(10.2, 5.5, 9.1, 4.9);
    ctx.quadraticCurveTo(8.0, 5.6, 6.9, 4.9);
    ctx.quadraticCurveTo(5.8, 5.5, 4.6, 4.7);
    ctx.quadraticCurveTo(3.7, 5.2, 3.65, 6.9);
    ctx.quadraticCurveTo(3.6, 8.6, 4.1, 10.4);
    ctx.quadraticCurveTo(4.4, 11.6, 3.8, 11.3);
    ctx.quadraticCurveTo(2.05, 10.2, 1.95, 6.2);
    ctx.closePath();
    fillStroke(ctx, t.base, t.outline, 0.26);
    shineArc(2.5, 1.1);
  } else {
    // Spiky — energetic tufts radiating from the crown
    ctx.beginPath();
    ctx.moveTo(2.4, 7.2);
    // left spike
    ctx.quadraticCurveTo(1.2, 4.4, 2.6, 2.6);
    ctx.quadraticCurveTo(3.2, 3.6, 4.0, 3.0);
    // up spikes
    ctx.quadraticCurveTo(3.8, 0.9, 5.2, 0.2);
    ctx.quadraticCurveTo(5.8, 1.6, 6.7, 1.4);
    ctx.quadraticCurveTo(7.2, -0.4, 8.6, -0.2);
    ctx.quadraticCurveTo(8.8, 1.3, 9.7, 1.5);
    ctx.quadraticCurveTo(10.5, 0.2, 11.6, 0.8);
    ctx.quadraticCurveTo(11.6, 2.2, 12.4, 2.8);
    ctx.quadraticCurveTo(13.8, 3.0, 13.9, 4.6);
    ctx.quadraticCurveTo(14.4, 5.8, 13.6, 7.2);
    // jagged fringe
    ctx.quadraticCurveTo(12.9, 5.0, 11.8, 4.9);
    ctx.quadraticCurveTo(11.0, 5.8, 10.2, 4.5);
    ctx.quadraticCurveTo(9.1, 5.8, 8.0, 4.4);
    ctx.quadraticCurveTo(6.9, 5.8, 5.8, 4.5);
    ctx.quadraticCurveTo(5.0, 5.8, 4.2, 4.9);
    ctx.quadraticCurveTo(3.1, 5.0, 2.4, 7.2);
    ctx.closePath();
    fillStroke(ctx, t.base, t.outline, 0.26);
    // shine ticks
    ctx.strokeStyle = t.shine;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 0.42;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(5.6, 2.2);
    ctx.lineTo(6.1, 1.2);
    ctx.moveTo(8.0, 1.6);
    ctx.lineTo(8.2, 0.6);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

/* ---------------------------------------------------------------------------
   Body & outfits
--------------------------------------------------------------------------- */

type Pose = {
  /** 0 standing; -1..1 walk swing */
  swing: number;
  walking: boolean;
};

function drawShoe(ctx: Ctx, cx: number, color: string) {
  ellipsePath(ctx, cx, 21.05, 1.18, 0.68);
  fillStroke(ctx, color, dark(color, 0.4), 0.22);
  // sole highlight
  ctx.strokeStyle = light(color, 0.35);
  ctx.lineWidth = 0.16;
  ctx.beginPath();
  ctx.moveTo(cx - 0.7, 20.7);
  ctx.quadraticCurveTo(cx, 20.5, cx + 0.7, 20.7);
  ctx.stroke();
}

function legPositions(pose: Pose): [number, number] {
  const spread = pose.walking ? 0.55 + Math.abs(pose.swing) * 0.85 : 0;
  return [6.95 - spread, 9.05 + spread];
}

function armPositions(pose: Pose): { lx: number; ly: number; rx: number; ry: number } {
  const out = pose.walking ? 0.55 + Math.abs(pose.swing) * 0.6 : 0;
  return { lx: 4.95 - out, ly: 15.3 - out * 0.4, rx: 11.05 + out, ry: 15.3 - out * 0.4 };
}

function drawBody(
  ctx: Ctx,
  outfitIdx: number,
  outfit: [string, string],
  skin: [string, string],
  pose: Pose
) {
  const o0 = outfit[0];
  const o1 = outfit[1];
  const oOut = dark(o0, 0.42);
  const sOut = dark(skin[0], 0.45);
  const [legL, legR] = legPositions(pose);
  const arm = armPositions(pose);
  const shoulderY = 11.9;

  const skinArms = () => {
    capsule(ctx, 5.45, shoulderY, arm.lx, arm.ly, 0.62, skin[0], sOut);
    capsule(ctx, 10.55, shoulderY, arm.rx, arm.ry, 0.62, skin[0], sOut);
  };

  if (outfitIdx === 0) {
    // ---- Suit: jacket, white shirt, tie, trousers
    capsule(ctx, legL, 15.8, legL, 20.3, 0.78, o1, oOut);
    capsule(ctx, legR, 15.8, legR, 20.3, 0.78, o1, oOut);
    drawShoe(ctx, legL, "#3c2b1e");
    drawShoe(ctx, legR, "#3c2b1e");
    // jacket arms
    capsule(ctx, 5.45, shoulderY, arm.lx, arm.ly, 0.68, o0, oOut);
    capsule(ctx, 10.55, shoulderY, arm.rx, arm.ry, 0.68, o0, oOut);
    // hands
    ellipsePath(ctx, arm.lx, arm.ly + 0.55, 0.52, 0.52);
    fillStroke(ctx, skin[0], sOut, 0.18);
    ellipsePath(ctx, arm.rx, arm.ry + 0.55, 0.52, 0.52);
    fillStroke(ctx, skin[0], sOut, 0.18);
    // torso
    ctx.beginPath();
    ctx.moveTo(5.3, 11.4);
    ctx.quadraticCurveTo(8, 10.9, 10.7, 11.4);
    ctx.quadraticCurveTo(11.2, 14.2, 10.9, 16.6);
    ctx.quadraticCurveTo(8, 17.2, 5.1, 16.6);
    ctx.quadraticCurveTo(4.8, 14.2, 5.3, 11.4);
    ctx.closePath();
    fillStroke(ctx, o0, oOut, 0.26);
    // shirt V
    ctx.beginPath();
    ctx.moveTo(6.9, 11.35);
    ctx.lineTo(9.1, 11.35);
    ctx.lineTo(8, 13.9);
    ctx.closePath();
    fillStroke(ctx, "#faf6ec", "rgba(90,70,50,0.35)", 0.14);
    // tie
    ctx.beginPath();
    ctx.moveTo(8, 11.9);
    ctx.lineTo(8.38, 12.9);
    ctx.lineTo(8, 14.2);
    ctx.lineTo(7.62, 12.9);
    ctx.closePath();
    ctx.fillStyle = dark(o1, 0.25);
    ctx.fill();
    // lapels
    ctx.strokeStyle = dark(o0, 0.28);
    ctx.lineWidth = 0.22;
    ctx.beginPath();
    ctx.moveTo(6.9, 11.4);
    ctx.quadraticCurveTo(7.5, 12.6, 7.0, 13.9);
    ctx.moveTo(9.1, 11.4);
    ctx.quadraticCurveTo(8.5, 12.6, 9.0, 13.9);
    ctx.stroke();
    // buttons
    ctx.fillStyle = light(o0, 0.4);
    ellipsePath(ctx, 7.35, 14.9, 0.14, 0.14);
    ctx.fill();
    ellipsePath(ctx, 7.35, 15.7, 0.14, 0.14);
    ctx.fill();
  } else if (outfitIdx === 1) {
    // ---- Sundress: bodice + flared skirt, bare arms
    capsule(ctx, legL, 17.6, legL, 20.3, 0.72, skin[0], sOut);
    capsule(ctx, legR, 17.6, legR, 20.3, 0.72, skin[0], sOut);
    drawShoe(ctx, legL, "#f4eee0");
    drawShoe(ctx, legR, "#f4eee0");
    skinArms();
    // bodice
    ctx.beginPath();
    ctx.moveTo(6.0, 11.6);
    ctx.quadraticCurveTo(8, 11.1, 10.0, 11.6);
    ctx.lineTo(10.1, 14.1);
    ctx.lineTo(5.9, 14.1);
    ctx.closePath();
    fillStroke(ctx, o0, oOut, 0.24);
    // straps
    ctx.strokeStyle = o0;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(6.6, 11.7);
    ctx.lineTo(6.6, 10.9);
    ctx.moveTo(9.4, 11.7);
    ctx.lineTo(9.4, 10.9);
    ctx.stroke();
    // skirt with scalloped hem
    ctx.beginPath();
    ctx.moveTo(5.9, 13.9);
    ctx.quadraticCurveTo(4.6, 16.4, 4.35, 18.3);
    ctx.quadraticCurveTo(5.55, 18.9, 6.8, 18.3);
    ctx.quadraticCurveTo(8.0, 18.95, 9.2, 18.3);
    ctx.quadraticCurveTo(10.45, 18.9, 11.65, 18.3);
    ctx.quadraticCurveTo(11.4, 16.4, 10.1, 13.9);
    ctx.closePath();
    fillStroke(ctx, o0, oOut, 0.26);
    // hem shade
    ctx.strokeStyle = o1;
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(4.75, 17.7);
    ctx.quadraticCurveTo(8, 18.7, 11.25, 17.7);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // sash
    ctx.fillStyle = o1;
    ctx.fillRect(5.85, 13.72, 4.3, 0.55);
  } else if (outfitIdx === 2) {
    // ---- Tee & Shorts
    capsule(ctx, legL, 17.3, legL, 20.3, 0.72, skin[0], sOut);
    capsule(ctx, legR, 17.3, legR, 20.3, 0.72, skin[0], sOut);
    drawShoe(ctx, legL, "#f2eee6");
    drawShoe(ctx, legR, "#f2eee6");
    // bare forearms
    skinArms();
    // tee torso
    ctx.beginPath();
    ctx.moveTo(5.6, 11.5);
    ctx.quadraticCurveTo(8, 11.0, 10.4, 11.5);
    ctx.lineTo(10.5, 15.4);
    ctx.quadraticCurveTo(8, 15.8, 5.5, 15.4);
    ctx.closePath();
    fillStroke(ctx, o0, oOut, 0.26);
    // short sleeves over the shoulders
    capsule(ctx, 5.5, 12.0, 4.9, 13.2, 0.72, o0, oOut);
    capsule(ctx, 10.5, 12.0, 11.1, 13.2, 0.72, o0, oOut);
    // collar
    ctx.strokeStyle = light(o0, 0.35);
    ctx.lineWidth = 0.26;
    ctx.beginPath();
    ctx.moveTo(7.1, 11.35);
    ctx.quadraticCurveTo(8, 11.9, 8.9, 11.35);
    ctx.stroke();
    // shorts
    ctx.beginPath();
    ctx.moveTo(5.7, 15.2);
    ctx.lineTo(10.3, 15.2);
    ctx.lineTo(10.45, 17.5);
    ctx.quadraticCurveTo(9.4, 17.8, 8.55, 17.5);
    ctx.lineTo(8, 16.4);
    ctx.lineTo(7.45, 17.5);
    ctx.quadraticCurveTo(6.6, 17.8, 5.55, 17.5);
    ctx.closePath();
    fillStroke(ctx, o1, dark(o1, 0.35), 0.24);
  } else if (outfitIdx === 3) {
    // ---- Overalls over a cream tee
    capsule(ctx, legL, 15.6, legL, 20.3, 0.8, o0, oOut);
    capsule(ctx, legR, 15.6, legR, 20.3, 0.8, o0, oOut);
    drawShoe(ctx, legL, "#6d4a30");
    drawShoe(ctx, legR, "#6d4a30");
    const tee = "#f4efe2";
    // tee sleeves + bare arms
    capsule(ctx, 5.5, 12.0, 4.95, 13.1, 0.7, tee, dark(tee, 0.3));
    capsule(ctx, 10.5, 12.0, 11.05, 13.1, 0.7, tee, dark(tee, 0.3));
    skinArms();
    // tee torso
    ctx.beginPath();
    ctx.moveTo(5.6, 11.5);
    ctx.quadraticCurveTo(8, 11.0, 10.4, 11.5);
    ctx.lineTo(10.5, 14.8);
    ctx.lineTo(5.5, 14.8);
    ctx.closePath();
    fillStroke(ctx, tee, dark(tee, 0.3), 0.22);
    // overalls hips
    ctx.beginPath();
    ctx.moveTo(5.5, 14.4);
    ctx.lineTo(10.5, 14.4);
    ctx.quadraticCurveTo(10.7, 16.4, 10.4, 16.9);
    ctx.quadraticCurveTo(8, 17.4, 5.6, 16.9);
    ctx.quadraticCurveTo(5.3, 16.4, 5.5, 14.4);
    ctx.closePath();
    fillStroke(ctx, o0, oOut, 0.24);
    // bib
    ctx.beginPath();
    ctx.moveTo(6.5, 12.3);
    ctx.lineTo(9.5, 12.3);
    ctx.quadraticCurveTo(9.7, 13.6, 9.5, 14.6);
    ctx.lineTo(6.5, 14.6);
    ctx.quadraticCurveTo(6.3, 13.6, 6.5, 12.3);
    ctx.closePath();
    fillStroke(ctx, o0, oOut, 0.22);
    // pocket
    ctx.strokeStyle = dark(o0, 0.28);
    ctx.lineWidth = 0.18;
    ctx.beginPath();
    ctx.moveTo(7.2, 13.2);
    ctx.lineTo(8.8, 13.2);
    ctx.quadraticCurveTo(8.8, 14.0, 8, 14.0);
    ctx.quadraticCurveTo(7.2, 14.0, 7.2, 13.2);
    ctx.stroke();
    // straps
    ctx.strokeStyle = o0;
    ctx.lineWidth = 0.42;
    ctx.beginPath();
    ctx.moveTo(6.7, 12.4);
    ctx.lineTo(5.9, 11.4);
    ctx.moveTo(9.3, 12.4);
    ctx.lineTo(10.1, 11.4);
    ctx.stroke();
    // buttons
    ctx.fillStyle = "#e8c15a";
    ellipsePath(ctx, 6.75, 12.55, 0.18, 0.18);
    ctx.fill();
    ellipsePath(ctx, 9.25, 12.55, 0.18, 0.18);
    ctx.fill();
  } else {
    // ---- Gown: floor-length, elegant
    skinArms();
    // skirt
    ctx.beginPath();
    ctx.moveTo(6.2, 13.8);
    ctx.quadraticCurveTo(4.6, 17.4, 4.0, 21.0);
    ctx.quadraticCurveTo(5.3, 21.7, 6.7, 21.15);
    ctx.quadraticCurveTo(8.0, 21.75, 9.3, 21.15);
    ctx.quadraticCurveTo(10.7, 21.7, 12.0, 21.0);
    ctx.quadraticCurveTo(11.4, 17.4, 9.8, 13.8);
    ctx.closePath();
    fillStroke(ctx, o0, oOut, 0.26);
    // side shade for drape
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(9.6, 14.2);
    ctx.quadraticCurveTo(11.0, 17.6, 11.5, 20.8);
    ctx.quadraticCurveTo(10.6, 21.2, 9.9, 21.0);
    ctx.quadraticCurveTo(10.2, 17.4, 9.1, 14.4);
    ctx.closePath();
    ctx.fillStyle = o1;
    ctx.fill();
    ctx.globalAlpha = 1;
    // bodice with sweetheart neckline
    ctx.beginPath();
    ctx.moveTo(6.2, 11.8);
    ctx.quadraticCurveTo(7.1, 12.4, 8.0, 11.9);
    ctx.quadraticCurveTo(8.9, 12.4, 9.8, 11.8);
    ctx.lineTo(9.9, 14.1);
    ctx.lineTo(6.1, 14.1);
    ctx.closePath();
    fillStroke(ctx, o0, oOut, 0.24);
    // waistband
    ctx.fillStyle = light(o0, 0.3);
    ctx.fillRect(6.0, 13.75, 4.0, 0.5);
    // sparkles
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    for (const [sx, sy] of [
      [5.6, 17.2],
      [8.6, 18.8],
      [7.0, 20.2],
      [10.4, 19.6],
    ] as const) {
      ellipsePath(ctx, sx, sy, 0.16, 0.16);
      ctx.fill();
    }
  }
}

/* ---------------------------------------------------------------------------
   Main entry
--------------------------------------------------------------------------- */

export type DrawOptions = {
  x: number;
  y: number;
  /** Units-to-pixels multiplier. Footprint: 16*scale x 22*scale. */
  scale: number;
  frame?: "stand" | "walk";
  /** Continuous walk phase (radians) for smooth leg/arm swing. */
  phase?: number;
  flip?: boolean;
  blink?: boolean;
  /** Soft ground shadow under the feet. */
  shadow?: boolean;
};

export function drawCharacter(ctx: Ctx, config: CharacterConfig, opts: DrawOptions) {
  const c = normalizeCharacter(config);
  const skin = SKINS[c.skin].colors;
  const hair = HAIR_COLORS[c.hairColor].colors;
  const outfit = OUTFIT_COLORS[c.outfitColor].colors;

  const pose: Pose = {
    walking: opts.frame === "walk",
    swing: opts.frame === "walk" ? Math.sin(opts.phase ?? Math.PI / 2) : 0,
  };

  ctx.save();
  ctx.translate(opts.x, opts.y);
  ctx.scale(opts.scale, opts.scale);
  if (opts.flip) {
    ctx.translate(SPRITE_W, 0);
    ctx.scale(-1, 1);
  }
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (opts.shadow) {
    ctx.fillStyle = "rgba(24, 48, 30, 0.18)";
    ellipsePath(ctx, 8, 21.75, 4.3, 0.75);
    ctx.fill();
  }

  drawHairBack(ctx, c.hairStyle, hair);
  drawBody(ctx, c.outfit, outfit, skin, pose);
  drawHead(ctx, skin);
  drawFace(ctx, opts.blink);
  drawHairFront(ctx, c.hairStyle, hair);

  ctx.restore();
}
