/**
 * 8-bit chibi characters drawn CryptoPunks-style on canvas — one fat pixel
 * per grid cell, flat colors, hard 1px outlines, big square head, tiny body.
 *
 * Characters use the same CharacterConfig shape stored in Supabase and
 * localStorage, so previously saved characters keep working.
 *
 * Coordinate system: a 16 x 22 "unit" box multiplied by `scale`. One pixel
 * IS one unit — a true 16 x 22 sprite, punk resolution.
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
   Pixel helpers — one grid cell is one fat pixel
--------------------------------------------------------------------------- */

type PxFill = (x: number, y: number, w: number, h: number, color: string) => void;

/** Rectangle with 1-step "rounded" pixel corners. */
function blk(R: PxFill, x: number, y: number, w: number, h: number, color: string) {
  R(x + 1, y, w - 2, h, color);
  R(x, y + 1, w, h - 2, color);
}

/* ---------------------------------------------------------------------------
   Head & face
--------------------------------------------------------------------------- */

function drawHeadPx(R: PxFill, skin: [string, string]) {
  const outline = dark(skin[0], 0.55);
  blk(R, 3, 1, 11, 10, outline); // silhouette y1..10
  blk(R, 4, 2, 9, 8, skin[0]); // face fill y2..9
  // jaw shading
  R(5, 9, 7, 1, skin[1]);
}

function drawFacePx(R: PxFill, ctx: Ctx, blink?: boolean) {
  if (blink) {
    R(5, 5, 2, 1, "#2b1d13");
    R(9, 5, 2, 1, "#2b1d13");
  } else {
    for (const ex of [5, 9]) {
      // 2x2 punk eye: dark block with a single white glint
      R(ex, 4, 2, 2, "#2b1c12");
      R(ex, 4, 1, 1, "#ffffff");
    }
  }
  // mouth
  R(7, 7, 2, 1, "#a34b40");
  // blush
  ctx.globalAlpha = 0.45;
  R(4, 6, 1, 1, "#ef8a6f");
  R(12, 6, 1, 1, "#ef8a6f");
  ctx.globalAlpha = 1;
}

/* ---------------------------------------------------------------------------
   Hair — back layer (behind body/head) and front layer (over the face)
--------------------------------------------------------------------------- */

function hairTones(hair: [string, string]) {
  return {
    base: hair[0],
    shade: dark(hair[0], 0.26),
    shine: light(hair[0], 0.35),
    outline: dark(hair[0], 0.5),
  };
}

function drawHairBackPx(R: PxFill, style: number, hair: [string, string]) {
  const t = hairTones(hair);
  if (style === 1) {
    // Long — mane behind the body with a toothed hem
    blk(R, 2, 2, 13, 12, t.outline);
    blk(R, 3, 3, 11, 10, t.shade);
    for (const fx of [3, 5, 7, 9, 11, 13]) R(fx, 13, 1, 1, t.shade);
  } else if (style === 2) {
    // Ponytail — chunky tail down the right
    R(13, 2, 2, 3, t.outline);
    R(14, 4, 2, 5, t.outline);
    R(13, 3, 1, 2, t.shade);
    R(14, 5, 1, 4, t.shade);
    R(13, 3, 1, 1, "#c14b45"); // hair tie
  } else if (style === 3) {
    // Bob — rounded volume behind the head
    blk(R, 2, 2, 13, 10, t.outline);
    blk(R, 3, 3, 11, 8, t.shade);
  }
}

function drawHairFrontPx(R: PxFill, ctx: Ctx, style: number, hair: [string, string]) {
  const t = hairTones(hair);
  const shine = () => {
    ctx.globalAlpha = 0.85;
    R(5, 1, 4, 1, t.shine);
    ctx.globalAlpha = 1;
  };

  if (style === 0) {
    // Short & Neat — cap with a notched fringe + sideburns
    blk(R, 3, 0, 11, 5, t.outline);
    R(5, 0, 7, 1, t.base);
    R(4, 1, 9, 2, t.base);
    R(4, 3, 2, 1, t.base);
    R(7, 3, 3, 1, t.base);
    R(11, 3, 2, 1, t.base);
    R(4, 4, 1, 2, t.base);
    R(12, 4, 1, 2, t.base);
    shine();
  } else if (style === 1) {
    // Long — parted fringe + face-framing locks over the head outline
    blk(R, 3, 0, 11, 5, t.outline);
    R(5, 0, 7, 1, t.base);
    R(4, 1, 9, 2, t.base);
    R(4, 3, 4, 1, t.base);
    R(9, 3, 4, 1, t.base);
    R(3, 3, 1, 7, t.base);
    R(13, 3, 1, 7, t.base);
    shine();
  } else if (style === 2) {
    // Ponytail — swept-back cap with one side swoop
    blk(R, 3, 0, 11, 5, t.outline);
    R(5, 0, 7, 1, t.base);
    R(4, 1, 9, 2, t.base);
    R(4, 3, 7, 1, t.base);
    R(4, 4, 1, 2, t.base);
    shine();
  } else if (style === 3) {
    // Bob — straight fringe with dips + face-framing curve
    blk(R, 3, 0, 11, 5, t.outline);
    R(5, 0, 7, 1, t.base);
    R(4, 1, 9, 2, t.base);
    R(4, 3, 2, 1, t.base);
    R(7, 3, 3, 1, t.base);
    R(11, 3, 2, 1, t.base);
    R(3, 3, 1, 8, t.base);
    R(13, 3, 1, 8, t.base);
    R(4, 10, 1, 1, t.base);
    R(12, 10, 1, 1, t.base);
    shine();
  } else {
    // Spiky — single-pixel tufts above a jagged cap
    for (const sx of [4, 6, 8, 10, 12]) {
      R(sx - 1, 0, 3, 2, t.outline);
      R(sx, 0, 1, 2, t.base);
    }
    blk(R, 3, 1, 11, 4, t.outline);
    R(4, 2, 9, 1, t.base);
    R(4, 3, 2, 1, t.base);
    R(7, 3, 3, 1, t.base);
    R(11, 3, 2, 1, t.base);
    ctx.globalAlpha = 0.85;
    R(6, 0, 1, 1, t.shine);
    R(10, 0, 1, 1, t.shine);
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

function drawBodyPx(
  R: PxFill,
  ctx: Ctx,
  outfitIdx: number,
  outfit: [string, string],
  skin: [string, string],
  pose: Pose
) {
  const o0 = outfit[0];
  const o1 = outfit[1];

  // walk cycle: legs scissor apart, arms swing out (whole pixels only)
  const spread = pose.walking ? 1 + Math.round(Math.abs(pose.swing)) : 0;
  const armOut = pose.walking ? Math.round(Math.abs(pose.swing)) : 0;
  const legL = 5 - spread;
  const legR = 9 + spread;
  const armLX = 4 - armOut;
  const armRX = 11 + armOut;

  const shoe = (x: number, toe: -1 | 1, color: string) => {
    R(toe < 0 ? x - 1 : x, 20, 3, 2, color);
  };
  const leg = (x: number, color: string, top = 15) => R(x, top, 2, 20 - top, color);
  const arm = (x: number, color: string, hand = true) => {
    R(x, 10, 1, 3, color);
    if (hand) R(x, 13, 1, 1, skin[0]);
  };
  const skinArms = () => {
    arm(armLX, skin[0]);
    arm(armRX, skin[0]);
  };

  if (outfitIdx === 0) {
    // ---- Suit: jacket, white shirt, tie, trousers
    leg(legL, o1);
    leg(legR, o1);
    shoe(legL, -1, "#3c2b1e");
    shoe(legR, 1, "#3c2b1e");
    arm(armLX, o0);
    arm(armRX, o0);
    R(5, 10, 6, 5, o0); // jacket torso
    R(7, 10, 2, 1, "#faf6ec"); // shirt
    R(7, 11, 2, 2, dark(o1, 0.25)); // tie
    R(6, 10, 1, 2, dark(o0, 0.3)); // lapels
    R(9, 10, 1, 2, dark(o0, 0.3));
    R(6, 13, 1, 1, light(o0, 0.45)); // button
  } else if (outfitIdx === 1) {
    // ---- Sundress: bodice + flared skirt, bare arms & legs
    leg(legL, skin[0]);
    leg(legR, skin[0]);
    shoe(legL, -1, "#f4eee0");
    shoe(legR, 1, "#f4eee0");
    skinArms();
    R(5, 10, 6, 3, o0); // bodice
    R(5, 12, 6, 1, o1); // sash
    R(5, 13, 6, 1, o0); // flared skirt
    R(4, 14, 8, 2, o0);
    R(3, 16, 10, 1, o1); // hem shade
    for (const fx of [4, 7, 10]) R(fx, 17, 1, 1, o1); // scalloped hem
  } else if (outfitIdx === 2) {
    // ---- Tee & Shorts
    leg(legL, skin[0]);
    leg(legR, skin[0]);
    shoe(legL, -1, "#f2eee6");
    shoe(legR, 1, "#f2eee6");
    skinArms();
    R(5, 10, 6, 3, o0); // tee
    R(4, 10, 1, 2, o0); // sleeves
    R(11, 10, 1, 2, o0);
    R(7, 10, 2, 1, light(o0, 0.35)); // collar
    R(5, 13, 6, 2, o1); // shorts
    R(legL, 15, 2, 1, o1); // cuffs follow the legs
    R(legR, 15, 2, 1, o1);
  } else if (outfitIdx === 3) {
    // ---- Overalls over a cream tee
    const tee = "#f4efe2";
    leg(legL, o0);
    leg(legR, o0);
    shoe(legL, -1, "#6d4a30");
    shoe(legR, 1, "#6d4a30");
    skinArms();
    R(4, 10, 1, 2, tee); // tee sleeves over the arms
    R(11, 10, 1, 2, tee);
    R(5, 10, 6, 2, tee); // tee torso
    R(5, 10, 1, 1, o0); // straps
    R(10, 10, 1, 1, o0);
    R(6, 11, 4, 2, o0); // bib
    R(5, 13, 6, 2, o0); // hips
    R(6, 11, 1, 1, "#e8c15a"); // buttons
    R(9, 11, 1, 1, "#e8c15a");
  } else {
    // ---- Gown: floor-length, elegant — no legs peeking out
    skinArms();
    R(5, 10, 6, 3, o0); // bodice
    R(5, 12, 6, 1, light(o0, 0.3)); // waistband
    for (let yy = 13; yy < 22; yy++) {
      const g = yy < 15 ? 1 : yy < 18 ? 2 : 3;
      R(5 - g, yy, 6 + 2 * g, 1, o0);
      // drape shading down the right side
      ctx.globalAlpha = 0.55;
      R(9 + g, yy, 2, 1, o1);
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = 0.75;
    for (const [sx, sy] of [
      [4, 16],
      [8, 18],
      [11, 15],
      [6, 20],
    ] as const) {
      R(sx, sy, 1, 1, "#ffffff");
    }
    ctx.globalAlpha = 1;
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
  /** Continuous walk phase (radians) for the leg/arm scissor. */
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
  // integer translate keeps pixel edges on whole device pixels
  ctx.translate(Math.round(opts.x), Math.round(opts.y));
  ctx.scale(opts.scale, opts.scale);
  if (opts.flip) {
    ctx.translate(SPRITE_W, 0);
    ctx.scale(-1, 1);
  }

  const R: PxFill = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  if (opts.shadow) {
    ctx.fillStyle = "rgba(80, 55, 15, 0.25)";
    ctx.fillRect(3, 21, 11, 1);
  }

  drawHairBackPx(R, c.hairStyle, hair);
  drawBodyPx(R, ctx, c.outfit, outfit, skin, pose);
  drawHeadPx(R, skin);
  drawFacePx(R, ctx, opts.blink);
  drawHairFrontPx(R, ctx, c.hairStyle, hair);

  ctx.restore();
}
