"use client";

/**
 * Canvas-2D fallback build of the live guest map (used when WebGL is
 * unavailable): every RSVP'd guest's 8-bit pixel character hangs out in
 * the Villa Sostaga gardens above Lake Garda, bathed in a golden-hour glow.
 * New guests pop in live via Supabase Realtime Broadcast (sent by the RSVP
 * API route), with polling as a fallback.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import { mockGuests } from "@/lib/mock";
import type { GuestChar } from "@/lib/types";
import {
  drawCharacter,
  hashString,
  normalizeCharacter,
  SPRITE_H,
  SPRITE_W,
} from "@/lib/maple/characters";
import {
  drawBirds,
  drawBoat,
  drawCloud,
  drawCypress,
  drawFlowerBed,
  drawFloatingIsland,
  drawGazebo,
  drawGrass,
  drawGravel,
  drawLadder,
  drawMountains,
  drawMushroom,
  drawOliveTree,
  drawSky,
  drawSun,
  drawTree,
  drawVilla,
  drawWater,
} from "@/lib/maple/scenery";

const MAP_W = 1100;
const MAP_H = 680;
const CHAR_SCALE = 3;
const CHAR_W = SPRITE_W * CHAR_SCALE;
const CHAR_H = SPRITE_H * CHAR_SCALE;

// Lawn area where guests stand (below the villa, left of the lake inlet).
const LAWN = { x: 40, y: 408, w: MAP_W - 320, h: 200 };

// Lake inlet on the right edge of the gardens.
const INLET = { x: MAP_W - 240, y: 430 };

function guestPos(g: GuestChar): { x: number; y: number } {
  const mx = Number.isFinite(g.map_x) ? g.map_x : (hashString(g.id) % 1000) / 1000;
  const my = Number.isFinite(g.map_y) ? g.map_y : (hashString(g.id + "y") % 1000) / 1000;
  return {
    x: LAWN.x + mx * (LAWN.w - CHAR_W),
    y: LAWN.y + my * (LAWN.h - CHAR_H),
  };
}

/** Pre-renders everything that never moves: sky, villa, gardens. */
function buildBackground(res: number): HTMLCanvasElement {
  const off = document.createElement("canvas");
  off.width = MAP_W * res;
  off.height = MAP_H * res;
  const ctx = off.getContext("2d")!;
  ctx.setTransform(res, 0, 0, res, 0, 0);
  ctx.imageSmoothingEnabled = false;

  const sunX = MAP_W - 170;
  drawSky(ctx, MAP_W, 380);
  drawSun(ctx, sunX, 162, 34);
  // puffy clouds + a floating island drifting over the garden
  drawCloud(ctx, 80, 52, 13);
  drawCloud(ctx, 450, 112, 9);
  drawCloud(ctx, 800, 40, 12);
  drawFloatingIsland(ctx, 620, 96, 130);
  drawLadder(ctx, 612, 110, 46);
  drawMushroom(ctx, 655, 96, 0.95);
  drawMountains(ctx, MAP_W, 306, 0, true);
  drawMountains(ctx, MAP_W, 342, 60, false);
  // calm distant lake strip (villa overlaps it, so it lives in the static bg)
  drawWater(ctx, 0, 346, MAP_W, 28, 0, sunX);

  // gardens — a bright sunlit lawn all the way down
  drawGrass(ctx, 0, 372, MAP_W, MAP_H - 372);
  ctx.fillStyle = "#74c24b";
  ctx.fillRect(0, 385, MAP_W, MAP_H - 385);
  // mottled fat-pixel grass texture (snapped to a 6px grid)
  for (let i = 0; i < 70; i++) {
    const gx = Math.round(((i * 173) % MAP_W) / 6) * 6;
    const gy = Math.round((400 + ((i * 97) % (MAP_H - 410))) / 6) * 6;
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = i % 3 === 0 ? "#5fae3d" : "#8fd964";
    ctx.fillRect(gx, gy, 18, 6);
  }
  ctx.globalAlpha = 1;
  // scattered fat-pixel daisies
  for (let i = 0; i < 14; i++) {
    const gx = Math.round((30 + ((i * 211) % (MAP_W - 300))) / 6) * 6;
    const gy =
      Math.round((i % 2 === 0 ? 630 + ((i * 13) % 40) : 398 + ((i * 7) % 14)) / 6) * 6;
    ctx.fillStyle = i % 3 === 0 ? "#f08aa8" : "#ffffff";
    ctx.fillRect(gx, gy, 6, 6);
  }
  // sandy shore edges of the inlet
  ctx.fillStyle = "#e0c089";
  ctx.fillRect(INLET.x - 12, INLET.y - 12, 12, MAP_H - INLET.y + 12);
  ctx.fillRect(INLET.x - 12, INLET.y - 12, MAP_W - INLET.x + 12, 12);

  // scenery band along the top of the gardens
  drawVilla(ctx, 56, 386, 0.72);
  drawGravel(ctx, 0, 388, 270, 18);
  drawGazebo(ctx, 296, 386, 0.62);
  drawFlowerBed(ctx, 402, 386, 48);
  drawOliveTree(ctx, 486, 384, 0.95);
  drawCypress(ctx, 540, 386, 108);
  drawTree(ctx, 600, 386, 0.95);
  drawMushroom(ctx, 660, 386, 0.9);
  drawCypress(ctx, 704, 386, 96);
  drawFlowerBed(ctx, 760, 386, 44);
  drawFlowerBed(ctx, 900, 386, 52);
  drawTree(ctx, 990, 386, 0.85);
  drawMushroom(ctx, 1046, 386, 1.0);

  return off;
}

export default function GuestMap2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guestsRef = useRef<GuestChar[]>([]);
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const loadGuests = useCallback(async () => {
    try {
      const res = await fetch("/api/guests");
      if (res.status === 503) {
        guestsRef.current = mockGuests();
        setDemoMode(true);
        setGuestCount(guestsRef.current.length);
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { guests: GuestChar[] };
      guestsRef.current = data.guests.map((g) => ({
        ...g,
        character: normalizeCharacter(g.character),
      }));
      setGuestCount(guestsRef.current.length);
    } catch {
      // keep previous list
    }
  }, []);

  // Initial load + realtime broadcast + polling fallback.
  useEffect(() => {
    void loadGuests();
    const poll = setInterval(() => void loadGuests(), 30000);

    const supabase = getBrowserSupabase();
    const channel = supabase
      ?.channel("guest-map")
      .on("broadcast", { event: "rsvp" }, () => void loadGuests())
      .subscribe();

    return () => {
      clearInterval(poll);
      if (supabase && channel) void supabase.removeChannel(channel);
    };
  }, [loadGuests]);

  // Render loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Integer resolution only, so every texel lands on whole device pixels.
    const RES = (window.devicePixelRatio || 1) >= 1.5 ? 2 : 1;
    canvas.width = MAP_W * RES;
    canvas.height = MAP_H * RES;
    const background = buildBackground(RES);

    let raf = 0;
    const render = (t: number) => {
      ctx.setTransform(RES, 0, 0, RES, 0, 0);
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(background, 0, 0, MAP_W, MAP_H);

      // animated bits: birds, the lake inlet and its little boat
      drawBirds(ctx, 240, 70, t);
      drawBirds(ctx, 900, 120, t);
      drawWater(ctx, INLET.x, INLET.y, 240, MAP_H - INLET.y, t, MAP_W - 170);
      drawBoat(ctx, MAP_W - 120, 490, t);

      // guests, sorted by y so lower characters draw in front
      const guests = [...guestsRef.current].sort((a, b) => guestPos(a).y - guestPos(b).y);
      for (const g of guests) {
        const { x, y } = guestPos(g);
        const seed = hashString(g.id);
        const bob = Math.sin(t / 640 + seed) * 2;
        const flip = seed % 2 === 0;

        drawCharacter(ctx, g.character, {
          x,
          y: y + bob,
          scale: CHAR_SCALE,
          frame: "stand",
          flip,
          blink: Math.floor(t / 190 + seed) % 24 === 0,
          shadow: true,
        });

        // name tag — rounded navy pill, like an MMO nametag
        const label = g.name.length > 14 ? `${g.name.slice(0, 13)}…` : g.name;
        ctx.font = "500 11px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const tw = ctx.measureText(label).width + 14;
        const tx = x + CHAR_W / 2;
        const ty = y + bob - 12;
        ctx.fillStyle = "rgba(23, 42, 63, 0.85)";
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(tx - tw / 2, ty - 9, tw, 18, 9);
        } else {
          ctx.rect(tx - tw / 2, ty - 9, tw, 18);
        }
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, tx, ty + 0.5);
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-center gap-3 flex-wrap mb-5">
        <span className="font-pixel text-xs text-ink bg-white rounded-full shadow-[0_6px_20px_-8px_rgba(20,50,80,0.35)] border border-black/5 px-5 py-2.5">
          {guestCount === null ? "Loading guests…" : `${guestCount} guest${guestCount === 1 ? "" : "s"} at the villa`}
        </span>
        {demoMode && (
          <span className="font-pixel text-xs text-stone bg-parchment rounded-full px-5 py-2.5">
            Demo mode — connect Supabase for live data
          </span>
        )}
      </div>
      {/* Rounded game frame. On phones the full map would be unreadably
          small, so it keeps a minimum size and pans horizontally. */}
      <div className="rounded-2xl bg-white p-2 sm:p-3 shadow-[0_24px_60px_-24px_rgba(20,50,80,0.4)] border border-black/5">
        <div className="overflow-x-auto overscroll-x-contain rounded-xl">
          <canvas
            ref={canvasRef}
            width={MAP_W}
            height={MAP_H}
            className="block h-auto w-full min-w-[640px] sm:min-w-0 [image-rendering:pixelated]"
          />
        </div>
      </div>
      <p className="sm:hidden text-center font-sans text-[0.58rem] font-medium tracking-[0.22em] uppercase text-ink/40 mt-3">
        Swipe to explore the garden →
      </p>
    </div>
  );
}
