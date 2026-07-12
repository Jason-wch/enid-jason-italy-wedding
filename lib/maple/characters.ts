/**
 * MapleStory-inspired chibi characters drawn as 16-bit pixel art on canvas —
 * big head, tall sparkly eyes, tiny body, chunky SNES-era pixels.
 *
 * Characters use the same CharacterConfig shape stored in Supabase and
 * localStorage, so previously saved characters keep working.
 *
 * Coordinate system: a 16 x 22 "unit" box multiplied by `scale`. One pixel
 * (texel) is half a unit, giving a 32 x 44 texel sprite.
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
   Pixel helpers — everything is drawn on a 32 x 44 texel grid where one
   texel = 0.5 units. `R` fills whole texels only, keeping edges razor sharp.
--------------------------------------------------------------------------- */

const T = 0.5; // texel size in unit space

type PxFill = (x: number, y: number, w: number, h: number, color: string) => void;

/** Rectangle with 2-step "rounded" pixel corners. */
function blockPx(R: PxFill, x: number, y: number, w: number, h: number, color: string) {
  R(x + 2, y, w - 4, h, color);
  R(x + 1, y + 1, w - 2, h - 2, color);
  R(x, y + 2, w, h - 4, color);
}

/* ---------------------------------------------------------------------------
   Head & face
--------------------------------------------------------------------------- */

function drawHeadPx(R: PxFill, skin: [string, string]) {
  const outline = dark(skin[0], 0.5);
  blockPx(R, 4, 1, 24, 20, outline); // silhouette y1..20
  blockPx(R, 5, 2, 22, 18, skin[0]); // face fill y2..19
  // jaw shading
  R(9, 18, 14, 1, skin[1]);
}

function drawFacePx(R: PxFill, ctx: Ctx, blink?: boolean) {
  // brows
  R(10, 8, 4, 1, "rgba(58, 39, 26, 0.75)");
  R(18, 8, 4, 1, "rgba(58, 39, 26, 0.75)");

  if (blink) {
    // happy closed lashes
    for (const ex of [10, 19]) {
      R(ex, 13, 3, 1, "#2b1d13");
      R(ex - 1, 12, 1, 1, "#2b1d13");
      R(ex + 3, 12, 1, 1, "#2b1d13");
    }
  } else {
    for (const ex of [10, 19]) {
      // tall sclera + lash line
      R(ex, 10, 3, 6, "#ffffff");
      R(ex - 1, 9, 5, 1, "#20140c");
      // iris: dark top, warm brown bottom — MapleStory eyes
      R(ex, 11, 2, 2, "#31221a");
      R(ex, 13, 2, 2, "#8a5c3c");
      // sparkle glints
      R(ex + 1, 11, 1, 1, "#ffffff");
      ctx.globalAlpha = 0.8;
      R(ex, 14, 1, 1, "#ffffff");
      ctx.globalAlpha = 1;
    }
  }

  // little smile
  R(14, 16, 4, 1, "#a34b40");
  R(15, 17, 2, 1, "#8c4034");

  // blush
  ctx.globalAlpha = 0.4;
  R(7, 14, 2, 1, "#ef8a6f");
  R(23, 14, 2, 1, "#ef8a6f");
  ctx.globalAlpha = 1;
}

/* ---------------------------------------------------------------------------
   Hair — back layer (behind body/head) and front layer (over the face)
--------------------------------------------------------------------------- */

function hairTones(hair: [string, string]) {
  return {
    base: hair[0],
    shade: dark(hair[0], 0.26),
    shine: light(hair[0], 0.33),
    outline: dark(hair[0], 0.48),
  };
}

function drawHairBackPx(R: PxFill, style: number, hair: [string, string]) {
  const t = hairTones(hair);
  if (style === 1) {
    // Long — flowing mane behind the body with a toothed hem
    blockPx(R, 3, 2, 26, 25, t.outline);
    blockPx(R, 4, 3, 24, 23, t.shade);
    for (const fx of [4, 8, 12, 16, 20, 24]) R(fx, 26, 3, 2, t.shade);
  } else if (style === 2) {
    // Ponytail — chunky tail swooping down the right
    R(24, 3, 4, 3, t.outline);
    R(26, 5, 5, 7, t.outline);
    R(27, 12, 4, 6, t.outline);
    R(25, 4, 3, 2, t.shade);
    R(27, 6, 3, 6, t.shade);
    R(28, 12, 2, 5, t.shade);
    // hair tie
    R(24, 4, 2, 2, "#c14b45");
  } else if (style === 3) {
    // Bob — rounded volume behind the head
    blockPx(R, 3, 3, 26, 21, t.outline);
    blockPx(R, 4, 4, 24, 19, t.shade);
  }
}

function drawHairFrontPx(R: PxFill, ctx: Ctx, style: number, hair: [string, string]) {
  const t = hairTones(hair);
  const shine = (x: number, w: number) => {
    ctx.globalAlpha = 0.85;
    R(x, 2, w, 1, t.shine);
    ctx.globalAlpha = 1;
  };

  if (style === 0) {
    // Short & Neat — glossy cap with a toothed fringe + sideburns
    blockPx(R, 4, 0, 24, 10, t.outline);
    blockPx(R, 5, 1, 22, 8, t.base);
    for (const fx of [5, 9, 14, 19, 24]) R(fx, 9, 3, 1, t.base);
    R(5, 9, 2, 4, t.base);
    R(25, 9, 2, 4, t.base);
    shine(8, 10);
  } else if (style === 1) {
    // Long — middle-parted curtain bangs + face-framing locks
    blockPx(R, 4, 0, 24, 9, t.outline);
    blockPx(R, 5, 1, 22, 7, t.base);
    // parted fringe sweeping out from the center
    R(5, 7, 4, 4, t.base);
    R(9, 7, 3, 2, t.base);
    R(12, 7, 2, 1, t.base);
    R(23, 7, 4, 4, t.base);
    R(20, 7, 3, 2, t.base);
    R(18, 7, 2, 1, t.base);
    // face-framing locks
    R(4, 8, 2, 14, t.base);
    R(26, 8, 2, 14, t.base);
    shine(8, 7);
    shine(18, 5);
  } else if (style === 2) {
    // Ponytail — swept-back cap with one big side swoop
    blockPx(R, 4, 0, 24, 9, t.outline);
    blockPx(R, 5, 1, 22, 7, t.base);
    R(18, 8, 7, 1, t.base);
    R(11, 8, 7, 2, t.base);
    R(6, 9, 5, 2, t.base);
    R(5, 8, 2, 5, t.base);
    shine(8, 10);
  } else if (style === 3) {
    // Bob — straight fringe with dips + face-framing curve
    blockPx(R, 4, 0, 24, 10, t.outline);
    blockPx(R, 5, 1, 22, 8, t.base);
    R(5, 9, 4, 1, t.base);
    R(10, 9, 5, 1, t.base);
    R(17, 9, 5, 1, t.base);
    R(23, 9, 4, 1, t.base);
    R(4, 6, 2, 16, t.base);
    R(26, 6, 2, 16, t.base);
    R(5, 20, 2, 2, t.base);
    R(25, 20, 2, 2, t.base);
    shine(8, 10);
  } else {
    // Spiky — energetic tufts radiating from the crown
    blockPx(R, 4, 1, 24, 9, t.outline);
    // spikes (outline first, then fill)
    for (const [sx, sw] of [
      [5, 3],
      [10, 3],
      [15, 3],
      [20, 3],
      [25, 2],
    ] as const) {
      R(sx - 1, 0, sw + 2, 3, t.outline);
      R(sx, 0, sw, 3, t.base);
    }
    R(2, 3, 2, 4, t.outline);
    R(28, 3, 2, 4, t.outline);
    R(3, 4, 2, 3, t.base);
    R(27, 4, 2, 3, t.base);
    blockPx(R, 5, 2, 22, 7, t.base);
    // jagged fringe teeth
    for (const fx of [5, 9, 13, 17, 21, 25]) R(fx, 9, 2, fx % 8 === 1 ? 2 : 1, t.base);
    ctx.globalAlpha = 0.85;
    R(7, 1, 1, 2, t.shine);
    R(12, 0, 1, 2, t.shine);
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

  // walk cycle: legs scissor apart, arms swing out (whole texels only)
  const spread = pose.walking ? 1 + Math.round(Math.abs(pose.swing) * 2) : 0;
  const armOut = pose.walking ? 1 + Math.round(Math.abs(pose.swing)) : 0;
  const legL = 12 - spread;
  const legR = 18 + spread;
  const armLX = 8 - armOut;
  const armRX = 22 + armOut;

  const shoe = (x: number, color: string) => {
    R(x - 1, 41, 5, 2, color);
    R(x - 1, 41, 5, 1, light(color, 0.25));
  };
  const leg = (x: number, color: string, top = 32) => R(x, top, 3, 41 - top, color);
  const arm = (x: number, color: string, hand = true) => {
    R(x, 22, 2, 7, color);
    if (hand) R(x, 29, 2, 2, skin[0]);
  };
  const skinArms = () => {
    arm(armLX, skin[0]);
    arm(armRX, skin[0]);
  };

  if (outfitIdx === 0) {
    // ---- Suit: jacket, white shirt, tie, trousers
    leg(legL, o1);
    leg(legR, o1);
    shoe(legL, "#3c2b1e");
    shoe(legR, "#3c2b1e");
    arm(armLX, o0);
    arm(armRX, o0);
    R(10, 21, 13, 11, o0); // jacket torso
    // shirt V
    R(13, 21, 7, 1, "#faf6ec");
    R(14, 22, 5, 1, "#faf6ec");
    R(15, 23, 3, 1, "#faf6ec");
    // tie
    R(15, 22, 3, 1, dark(o1, 0.25));
    R(16, 23, 1, 3, dark(o1, 0.25));
    // lapels
    R(13, 22, 1, 3, dark(o0, 0.3));
    R(19, 22, 1, 3, dark(o0, 0.3));
    // buttons
    R(14, 27, 1, 1, light(o0, 0.45));
    R(14, 29, 1, 1, light(o0, 0.45));
  } else if (outfitIdx === 1) {
    // ---- Sundress: bodice + flared skirt, bare arms & legs
    leg(legL, skin[0]);
    leg(legR, skin[0]);
    shoe(legL, "#f4eee0");
    shoe(legR, "#f4eee0");
    skinArms();
    R(11, 21, 11, 5, o0); // bodice
    R(12, 20, 1, 1, o0); // straps
    R(20, 20, 1, 1, o0);
    // flared skirt
    for (let yy = 26; yy < 34; yy++) {
      const g = Math.floor((yy - 26) / 2) + 1;
      R(11 - g, yy, 11 + 2 * g, 1, o0);
    }
    R(7, 33, 19, 1, o1); // hem shade
    for (const fx of [8, 12, 16, 20, 23]) R(fx, 34, 2, 1, o1); // scalloped hem
    R(11, 25, 11, 1, o1); // sash
  } else if (outfitIdx === 2) {
    // ---- Tee & Shorts
    leg(legL, skin[0]);
    leg(legR, skin[0]);
    shoe(legL, "#f2eee6");
    shoe(legR, "#f2eee6");
    skinArms();
    R(10, 21, 13, 9, o0); // tee
    R(8, 22, 2, 4, o0); // sleeves
    R(22, 22, 2, 4, o0);
    R(14, 21, 5, 1, light(o0, 0.35)); // collar
    R(11, 29, 11, 3, o1); // shorts hip
    R(legL, 32, 3, 2, o1); // short cuffs follow the legs
    R(legR, 32, 3, 2, o1);
  } else if (outfitIdx === 3) {
    // ---- Overalls over a cream tee
    const tee = "#f4efe2";
    leg(legL, o0);
    leg(legR, o0);
    shoe(legL, "#6d4a30");
    shoe(legR, "#6d4a30");
    skinArms();
    R(8, 22, 2, 3, tee); // tee sleeves over the arms
    R(22, 22, 2, 3, tee);
    R(10, 21, 13, 6, tee); // tee torso
    R(11, 27, 11, 6, o0); // overalls hips
    R(13, 23, 7, 5, o0); // bib
    R(12, 21, 1, 2, o0); // straps
    R(20, 21, 1, 2, o0);
    R(15, 25, 3, 1, dark(o0, 0.3)); // pocket
    R(13, 23, 1, 1, "#e8c15a"); // buttons
    R(19, 23, 1, 1, "#e8c15a");
  } else {
    // ---- Gown: floor-length, elegant — no legs peeking out
    skinArms();
    R(11, 21, 11, 5, o0); // bodice
    R(13, 21, 7, 1, light(o0, 0.25)); // neckline
    R(11, 25, 11, 1, light(o0, 0.3)); // waistband
    for (let yy = 26; yy < 43; yy++) {
      const g = Math.min(5, Math.floor((yy - 26) / 3) + 1);
      R(11 - g, yy, 11 + 2 * g, 1, o0);
      // drape shading down the right side
      ctx.globalAlpha = 0.55;
      R(19 + g, yy, 2, 1, o1);
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = 0.75;
    for (const [sx, sy] of [
      [9, 32],
      [14, 36],
      [19, 30],
      [12, 40],
      [21, 39],
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
  // integer translate keeps texel edges on whole device pixels
  ctx.translate(Math.round(opts.x), Math.round(opts.y));
  ctx.scale(opts.scale, opts.scale);
  if (opts.flip) {
    ctx.translate(SPRITE_W, 0);
    ctx.scale(-1, 1);
  }

  const R: PxFill = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * T, y * T, w * T, h * T);
  };

  if (opts.shadow) {
    ctx.fillStyle = "rgba(30, 18, 42, 0.28)";
    ctx.fillRect(8 * T, 43 * T, 17 * T, 1 * T);
    ctx.fillRect(10 * T, 42.5 * T, 13 * T, 0.5 * T);
  }

  drawHairBackPx(R, c.hairStyle, hair);
  drawBodyPx(R, ctx, c.outfit, outfit, skin, pose);
  drawHeadPx(R, skin);
  drawFacePx(R, ctx, opts.blink);
  drawHairFrontPx(R, ctx, c.hairStyle, hair);

  ctx.restore();
}
