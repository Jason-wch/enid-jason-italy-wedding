/**
 * Original MapleStory-inspired chibi pixel sprites (big head, small body).
 * Characters are composed from layered 16x22 pixel grids:
 * outfit/body -> face -> hair. Each cell character maps to a palette role.
 *
 * Legend: '.' empty | S/s skin/shade | E eye | W eye shine | M mouth
 *         H/h hair/shade | O/o outfit/shade | C white detail | B shoe
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
  { label: "Blonde", colors: ["#e8c464", "#c9a13f"] },
  { label: "Auburn", colors: ["#a8432c", "#c25c40"] },
  { label: "Pink", colors: ["#e88ab8", "#c765a0"] },
  { label: "Blue", colors: ["#4f7fb5", "#6d9bcc"] },
];

export const OUTFIT_COLORS: { label: string; colors: [string, string] }[] = [
  { label: "Ivory", colors: ["#f2ead8", "#cdbe97"] },
  { label: "Sage", colors: ["#93a884", "#6e8560"] },
  { label: "Dusty Blue", colors: ["#7f9cbf", "#5f7fa6"] },
  { label: "Terracotta", colors: ["#c2704e", "#a2583a"] },
  { label: "Plum", colors: ["#8a5f8f", "#6f4a75"] },
  { label: "Navy", colors: ["#3f5a78", "#2e4863"] },
];

export const HAIR_STYLES: string[] = ["Short & Neat", "Long", "Ponytail", "Bob", "Spiky"];
export const OUTFITS: string[] = ["Suit", "Sundress", "Tee & Shorts", "Overalls", "Gown"];

const EMPTY = "................";

const FACE: string[] = [
  EMPTY,
  EMPTY,
  "....SSSSSSSS....",
  "...SSSSSSSSSS...",
  "..SSSSSSSSSSSS..",
  "..SSSSSSSSSSSS..",
  "..SSSSSSSSSSSS..",
  "..SSEWSSSSEWSS..",
  "..SSEESSSSEESS..",
  "..sSSSSSSSSSSs..",
  "...sSSSMMSSSs...",
  "....ssssssss....",
  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
];

/** Face variant with closed eyes, used for blinking. */
const FACE_BLINK: string[] = FACE.map((row, i) =>
  i === 7 ? "..SSSSSSSSSSSS.." : i === 8 ? "..SSEESSSSEESS.." : row
);

const HAIR_LAYERS: string[][] = [
  // 0: Short & Neat
  [
    "....HHHHHHHH....",
    "...HHHHHHHHHH...",
    "..HHHHHHHHHHHH..",
    "..HHhHHHHHHhHH..",
    "..HH........HH..",
    "..H..........H..",
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
  ],
  // 1: Long
  [
    "....HHHHHHHH....",
    "...HHHHHHHHHH...",
    "..HHHHHHHHHHHH..",
    "..HHhHHHHHHhHH..",
    ".HHH........HHH.",
    ".HHH........HHH.",
    ".HH..........HH.",
    ".HH..........HH.",
    ".HH..........HH.",
    ".HH..........HH.",
    ".HH..........HH.",
    ".HHh........hHH.",
    ".HH..........HH.",
    ".hh..........hh.",
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
  ],
  // 2: Ponytail
  [
    "....HHHHHHHH....",
    "...HHHHHHHHHH...",
    "..HHHHHHHHHHHH..",
    "..HHhHHHHHHhHH..",
    "..HH........HHH.",
    "..H..........HH.",
    "..............HH",
    "..............HH",
    "..............Hh",
    "..............hh",
    "...............h",
    EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
  ],
  // 3: Bob
  [
    "....HHHHHHHH....",
    "...HHHHHHHHHH...",
    "..HHHHHHHHHHHH..",
    ".HHHhHHHHHHhHHH.",
    ".HHH........HHH.",
    ".HH..........HH.",
    ".HH..........HH.",
    ".HH..........HH.",
    ".HHH........HHH.",
    "..hh........hh..",
    EMPTY, EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
  ],
  // 4: Spiky
  [
    "...H...HH...H...",
    "..HHH.HHHH.HHH..",
    "..HHHHHHHHHHHH..",
    "..HhHHHHHHHHhH..",
    "..HH........HH..",
    "..H..........H..",
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
  ],
];

const PAD12 = [
  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
  EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
];

type BodyFrames = { stand: string[]; walk: string[] };

const BODIES: BodyFrames[] = [
  // 0: Suit
  {
    stand: [
      ...PAD12,
      ".....OOOOOO.....",
      "....OOoCCoOO....",
      "....SOoCCoOS....",
      ".....OOOOOO.....",
      ".....oOOOOo.....",
      "......oo.oo.....",
      "......oo.oo.....",
      "......oo.oo.....",
      "......BB.BB.....",
      EMPTY,
    ],
    walk: [
      ...PAD12,
      ".....OOOOOO.....",
      "....OOoCCoOO....",
      "....SOoCCoOS....",
      ".....OOOOOO.....",
      ".....oOOOOo.....",
      ".....oo..oo.....",
      "....oo....oo....",
      "....oo....oo....",
      "....BB....BB....",
      EMPTY,
    ],
  },
  // 1: Sundress
  {
    stand: [
      ...PAD12,
      ".....OOOOOO.....",
      "....SOOOOOOS....",
      "....SOoOOoOS....",
      ".....OOOOOO.....",
      ".....OOOOOO.....",
      "....OOOOOOOO....",
      "...OOOOOOOOOO...",
      "...oOoOoOoOoo...",
      "......SS.SS.....",
      "......BB.BB.....",
    ],
    walk: [
      ...PAD12,
      ".....OOOOOO.....",
      "....SOOOOOOS....",
      "....SOoOOoOS....",
      ".....OOOOOO.....",
      ".....OOOOOO.....",
      "....OOOOOOOO....",
      "...OOOOOOOOOO...",
      "...oOoOoOoOoo...",
      "....SS....SS....",
      "....BB....BB....",
    ],
  },
  // 2: Tee & Shorts
  {
    stand: [
      ...PAD12,
      ".....OOOOOO.....",
      "....SOOOOOOS....",
      "....SOOOOOOS....",
      ".....OOOOOO.....",
      ".....oooooo.....",
      "......oo.oo.....",
      "......SS.SS.....",
      "......SS.SS.....",
      "......BB.BB.....",
      EMPTY,
    ],
    walk: [
      ...PAD12,
      ".....OOOOOO.....",
      "....SOOOOOOS....",
      "....SOOOOOOS....",
      ".....OOOOOO.....",
      ".....oooooo.....",
      ".....oo..oo.....",
      "....SS....SS....",
      "....SS....SS....",
      "....BB....BB....",
      EMPTY,
    ],
  },
  // 3: Overalls
  {
    stand: [
      ...PAD12,
      ".....CCCCCC.....",
      "....SCOCCOCS....",
      "....SCOOOOCS....",
      ".....OOOOOO.....",
      ".....OOOOOO.....",
      "......OO.OO.....",
      "......OO.OO.....",
      "......SS.SS.....",
      "......BB.BB.....",
      EMPTY,
    ],
    walk: [
      ...PAD12,
      ".....CCCCCC.....",
      "....SCOCCOCS....",
      "....SCOOOOCS....",
      ".....OOOOOO.....",
      ".....OOOOOO.....",
      ".....OO..OO.....",
      "....OO....OO....",
      "....SS....SS....",
      "....BB....BB....",
      EMPTY,
    ],
  },
  // 4: Gown
  {
    stand: [
      ...PAD12,
      ".....OOOOOO.....",
      "....SOOOOOOS....",
      ".....OOOOOO.....",
      ".....OOOOOO.....",
      "....OOOOOOOO....",
      "....OOOOOOOO....",
      "...OOOOOOOOOO...",
      "...OOOOOOOOOO...",
      "..OOOOOOOOOOOO..",
      "..oooooooooooo..",
    ],
    walk: [
      ...PAD12,
      ".....OOOOOO.....",
      "....SOOOOOOS....",
      ".....OOOOOO.....",
      ".....OOOOOO.....",
      "....OOOOOOOO....",
      "....OOOOOOOO....",
      "...OOOOOOOOOO...",
      "...OOOOOOOOOO...",
      "..OOOOOOOOOOOO..",
      "..oooooooooooo..",
    ],
  },
];

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

export type DrawOptions = {
  x: number;
  y: number;
  /** Size of one sprite pixel in canvas px. */
  scale: number;
  frame?: "stand" | "walk";
  flip?: boolean;
  blink?: boolean;
};

function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: string[],
  colors: Record<string, string>,
  scale: number
) {
  for (let row = 0; row < SPRITE_H; row++) {
    const line = layer[row] ?? EMPTY;
    for (let col = 0; col < SPRITE_W; col++) {
      const ch = line[col];
      if (!ch || ch === ".") continue;
      const color = colors[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(col * scale, row * scale, scale, scale);
    }
  }
}

/**
 * Draws a character. (x, y) is the top-left of the 16x22 sprite box.
 * Total size: 16*scale wide, 22*scale tall.
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  config: CharacterConfig,
  opts: DrawOptions
) {
  const c = normalizeCharacter(config);
  const skin = SKINS[c.skin].colors;
  const hair = HAIR_COLORS[c.hairColor].colors;
  const outfit = OUTFIT_COLORS[c.outfitColor].colors;

  const colors: Record<string, string> = {
    S: skin[0],
    s: skin[1],
    E: "#26211f",
    W: "#ffffff",
    M: "#c96a6a",
    H: hair[0],
    h: hair[1],
    O: outfit[0],
    o: outfit[1],
    C: "#f7f3ea",
    B: "#4a3a2e",
  };

  const body = BODIES[c.outfit][opts.frame === "walk" ? "walk" : "stand"];
  const face = opts.blink ? FACE_BLINK : FACE;
  const hairLayer = HAIR_LAYERS[c.hairStyle];

  ctx.save();
  ctx.translate(opts.x, opts.y);
  if (opts.flip) {
    ctx.translate(SPRITE_W * opts.scale, 0);
    ctx.scale(-1, 1);
  }
  drawLayer(ctx, body, colors, opts.scale);
  drawLayer(ctx, face, colors, opts.scale);
  drawLayer(ctx, hairLayer, colors, opts.scale);
  ctx.restore();
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
