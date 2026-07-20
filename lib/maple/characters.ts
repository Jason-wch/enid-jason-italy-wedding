/**
 * Flat 8-bit avatar characters, in the classic pixel-crowd illustration
 * style: no outlines, no shading, one flat color per element, a big flat
 * rectangular head with tiny dot eyes, and a stubby body with arms hanging
 * at the sides.
 *
 * Characters use the same CharacterConfig shape stored in Supabase and
 * localStorage, so previously saved characters keep working.
 *
 * Coordinate system: a 16 x 22 "unit" box multiplied by `scale`. One pixel
 * IS one unit — a true 16 x 22 sprite.
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
   Pixel helpers — one grid cell is one fat pixel, flat colors only
--------------------------------------------------------------------------- */

type Ctx = CanvasRenderingContext2D;

type PxFill = (x: number, y: number, w: number, h: number, color: string) => void;

const EYE = "#2b2320";
const MOUTH = "#a34b40";

/* ---------------------------------------------------------------------------
   Head & face — flat rectangle, dot eyes, tiny mouth. No outline, no shade.
--------------------------------------------------------------------------- */

function drawHeadPx(R: PxFill, skin: [string, string]) {
  R(4, 1, 9, 9, skin[0]);
}

function drawFacePx(R: PxFill, blink?: boolean) {
  if (blink) {
    R(5, 5, 2, 1, EYE);
    R(10, 5, 2, 1, EYE);
  } else {
    // white eyeball with the pupil sitting on it (inner edge)
    R(5, 4, 2, 2, "#ffffff");
    R(10, 4, 2, 2, "#ffffff");
    R(6, 4, 1, 2, EYE);
    R(10, 4, 1, 2, EYE);
  }
  R(7, 7, 2, 1, MOUTH);
}

/* ---------------------------------------------------------------------------
   Hair — one flat color per style, layered behind and over the head
--------------------------------------------------------------------------- */

function drawHairBackPx(R: PxFill, style: number, hair: [string, string]) {
  const c = hair[0];
  if (style === 1) {
    // Long — flat curtain falling past the shoulders
    R(3, 1, 11, 13, c);
  } else if (style === 2) {
    // Ponytail — flat tail down the right side
    R(12, 2, 2, 7, c);
    R(12, 4, 2, 1, "#c14b45"); // hair tie
  } else if (style === 3) {
    // Bob — flat volume down to the jaw
    R(3, 1, 11, 10, c);
  }
}

function drawHairFrontPx(R: PxFill, style: number, hair: [string, string]) {
  const c = hair[0];
  if (style === 0) {
    // Short & Neat — straight flat cap with sideburns
    R(4, 0, 9, 3, c);
    R(4, 3, 1, 2, c);
    R(12, 3, 1, 2, c);
  } else if (style === 1) {
    // Long — fringe with a center part showing the forehead
    R(4, 0, 9, 2, c);
    R(4, 2, 3, 1, c);
    R(10, 2, 3, 1, c);
  } else if (style === 2) {
    // Ponytail — swept-back cap with a side swoop
    R(4, 0, 9, 2, c);
    R(4, 2, 7, 1, c);
    R(4, 3, 1, 2, c);
  } else if (style === 3) {
    // Bob — full straight fringe over the back volume
    R(4, 0, 9, 3, c);
  } else {
    // Spiky — single-pixel tufts above a low cap
    for (const sx of [4, 6, 8, 10, 12]) R(sx, 0, 1, 1, c);
    R(4, 1, 9, 2, c);
  }
}

/* ---------------------------------------------------------------------------
   Body & outfits — stubby torso, arms at the sides, flat color blocks
--------------------------------------------------------------------------- */

type Pose = {
  /** 0 standing; -1..1 walk swing */
  swing: number;
  walking: boolean;
};

function drawBodyPx(
  R: PxFill,
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
  const legL = 6 - spread;
  const legR = 9 + spread;
  const armLX = 4 - armOut;
  const armRX = 12 + armOut;

  const shoe = (x: number, toe: -1 | 1, color: string) => {
    R(toe < 0 ? x - 1 : x, 20, 3, 2, color);
  };
  const leg = (x: number, color: string, top = 16) => R(x, top, 2, 20 - top, color);
  const arm = (x: number, color: string) => {
    R(x, 10, 1, 4, color);
    R(x, 14, 1, 1, skin[0]); // hand
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
    R(5, 10, 7, 6, o0); // jacket
    R(7, 10, 3, 2, "#faf6ec"); // shirt
    R(8, 12, 1, 3, o1); // tie
  } else if (outfitIdx === 1) {
    // ---- Sundress: bodice + flared skirt, bare arms & legs
    leg(legL, skin[0]);
    leg(legR, skin[0]);
    shoe(legL, -1, "#f4eee0");
    shoe(legR, 1, "#f4eee0");
    skinArms();
    R(5, 10, 7, 3, o0); // bodice
    R(5, 13, 7, 1, o1); // sash
    R(4, 14, 9, 2, o0); // flared skirt
    R(3, 16, 11, 1, o0);
  } else if (outfitIdx === 2) {
    // ---- Tee & Shorts
    leg(legL, skin[0]);
    leg(legR, skin[0]);
    shoe(legL, -1, "#f2eee6");
    shoe(legR, 1, "#f2eee6");
    skinArms();
    R(4, 10, 1, 2, o0); // sleeves over the arms
    R(12, 10, 1, 2, o0);
    R(5, 10, 7, 4, o0); // tee
    R(5, 14, 7, 2, o1); // shorts
    R(legL, 16, 2, 1, o1); // cuffs follow the legs
    R(legR, 16, 2, 1, o1);
  } else if (outfitIdx === 3) {
    // ---- Overalls over a cream tee
    const tee = "#f4efe2";
    leg(legL, o0);
    leg(legR, o0);
    shoe(legL, -1, "#6d4a30");
    shoe(legR, 1, "#6d4a30");
    skinArms();
    R(4, 10, 1, 2, tee); // tee sleeves over the arms
    R(12, 10, 1, 2, tee);
    R(5, 10, 7, 2, tee); // tee
    R(5, 10, 1, 1, o0); // straps
    R(11, 10, 1, 1, o0);
    R(6, 11, 5, 2, o0); // bib
    R(5, 13, 7, 3, o0); // hips
    R(6, 11, 1, 1, "#e8c15a"); // buttons
    R(10, 11, 1, 1, "#e8c15a");
  } else {
    // ---- Gown: floor-length, flat and elegant — no legs peeking out
    skinArms();
    R(5, 10, 7, 3, o0); // bodice
    R(5, 12, 7, 1, o1); // waistband
    for (let yy = 13; yy < 22; yy++) {
      const g = yy < 16 ? 1 : yy < 19 ? 2 : 3;
      R(6 - g, yy, 5 + 2 * g, 1, o0);
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
    ctx.fillStyle = "rgba(80, 55, 15, 0.22)";
    ctx.fillRect(3, 21, 11, 1);
  }

  drawHairBackPx(R, c.hairStyle, hair);
  drawBodyPx(R, c.outfit, outfit, skin, pose);
  drawHeadPx(R, skin);
  drawFacePx(R, opts.blink);
  drawHairFrontPx(R, c.hairStyle, hair);

  ctx.restore();
}
