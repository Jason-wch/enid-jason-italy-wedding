"use client";

/**
 * Live guest map: every RSVP'd guest's pixel character hangs out in the
 * Villa Sostaga gardens. New guests pop in live via Supabase Realtime
 * Broadcast (sent by the RSVP API route), with polling as a fallback.
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
} from "@/lib/pixel/sprites";
import {
  drawBush,
  drawCloud,
  drawCypress,
  drawGrass,
  drawMountains,
  drawPath,
  drawSky,
  drawSun,
  drawVilla,
  drawWater,
} from "@/lib/pixel/scenery";

const MAP_W = 1100;
const MAP_H = 680;
const CHAR_SCALE = 3;
const CHAR_W = SPRITE_W * CHAR_SCALE;
const CHAR_H = SPRITE_H * CHAR_SCALE;

// Lawn area where guests stand (below the villa, above/left of the lake edge).
const LAWN = { x: 40, y: 400, w: MAP_W - 320, h: 200 };

function guestPos(g: GuestChar): { x: number; y: number } {
  const mx = Number.isFinite(g.map_x) ? g.map_x : (hashString(g.id) % 1000) / 1000;
  const my = Number.isFinite(g.map_y) ? g.map_y : (hashString(g.id + "y") % 1000) / 1000;
  return {
    x: LAWN.x + mx * (LAWN.w - CHAR_W),
    y: LAWN.y + my * (LAWN.h - CHAR_H),
  };
}

export default function GuestMap() {
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

    let raf = 0;
    const render = (t: number) => {
      ctx.imageSmoothingEnabled = false;

      drawSky(ctx, MAP_W, 360);
      drawSun(ctx, MAP_W - 140, 80, 30);
      drawCloud(ctx, 90, 60, 10);
      drawCloud(ctx, 460, 110, 8);
      drawCloud(ctx, 820, 50, 12);
      drawMountains(ctx, MAP_W, 300, 0, true);
      drawMountains(ctx, MAP_W, 330, 60, false);
      drawWater(ctx, 0, 330, MAP_W, 40, t);

      // gardens
      drawGrass(ctx, 0, 370, MAP_W, MAP_H - 370);
      // lake inlet on the right
      drawWater(ctx, MAP_W - 240, 430, 240, MAP_H - 430, t);
      ctx.fillStyle = "#d9c9a3";
      ctx.fillRect(MAP_W - 252, 430, 12, MAP_H - 430);

      drawVilla(ctx, 70, 372, 0.9);
      drawPath(ctx, 0, 372, MAP_W - 240, 20);
      drawCypress(ctx, 330, 372, 100);
      drawCypress(ctx, 380, 372, 80);
      drawCypress(ctx, 620, 372, 110);
      drawCypress(ctx, 900, 372, 95);
      drawBush(ctx, 450, 372, 18);
      drawBush(ctx, 760, 372, 22);
      drawBush(ctx, 1020, 372, 18);

      // guests, sorted by y so lower characters draw in front
      const guests = [...guestsRef.current].sort((a, b) => guestPos(a).y - guestPos(b).y);
      for (const g of guests) {
        const { x, y } = guestPos(g);
        const seed = hashString(g.id);
        const bob = Math.floor(t / 400 + seed) % 2 === 1 ? CHAR_SCALE : 0;
        const flip = seed % 2 === 0;

        drawCharacter(ctx, g.character, {
          x: Math.round(x),
          y: Math.round(y + bob),
          scale: CHAR_SCALE,
          frame: "stand",
          flip,
          blink: Math.floor(t / 190 + seed) % 24 === 0,
        });

        // name tag
        const label = g.name.length > 14 ? `${g.name.slice(0, 13)}…` : g.name;
        ctx.font = "8px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const tw = ctx.measureText(label).width + 10;
        const tx = x + CHAR_W / 2;
        const ty = y + bob - 12;
        ctx.fillStyle = "rgba(46, 42, 38, 0.75)";
        ctx.fillRect(tx - tw / 2, ty - 8, tw, 16);
        ctx.fillStyle = "#faf6ee";
        ctx.fillText(label, tx, ty + 1);
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
        <span className="font-pixel text-[10px] text-sage-dark bg-sage/15 rounded-full px-4 py-2">
          {guestCount === null ? "LOADING GUESTS…" : `${guestCount} GUEST${guestCount === 1 ? "" : "S"} AT THE VILLA`}
        </span>
        {demoMode && (
          <span className="font-pixel text-[9px] text-ink/50 bg-parchment rounded-full px-4 py-2">
            DEMO MODE — CONNECT SUPABASE FOR LIVE DATA
          </span>
        )}
      </div>
      <div className="rounded-2xl overflow-hidden border-4 border-gold/30 shadow-lg">
        <canvas
          ref={canvasRef}
          width={MAP_W}
          height={MAP_H}
          className="pixelated w-full h-auto block"
        />
      </div>
    </div>
  );
}
