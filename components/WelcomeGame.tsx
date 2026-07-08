"use client";

/**
 * Welcome minigame: a MapleStory-style side-scroller. Walk (and jump) your
 * pixel character past cypress trees and Villa Sostaga, and dive into
 * Lake Garda to enter the wedding website.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_CHARACTER,
  drawCharacter,
  normalizeCharacter,
  SPRITE_H,
  SPRITE_W,
  type CharacterConfig,
} from "@/lib/pixel/sprites";
import {
  drawBirds,
  drawBoat,
  drawBush,
  drawCloud,
  drawCypress,
  drawFloatingIsland,
  drawGrass,
  drawLadder,
  drawLemonTree,
  drawMountains,
  drawMushroom,
  drawOliveTree,
  drawPath,
  drawPergola,
  drawSign,
  drawSky,
  drawSun,
  drawTerraceWall,
  drawTree,
  drawVilla,
  drawWater,
  PALETTE,
} from "@/lib/pixel/scenery";
import { WEDDING } from "@/lib/wedding";
import { LogoMark } from "@/components/decor/Logo";

const VIEW_W = 960;
const VIEW_H = 540;
const WORLD_W = 1500;
const GROUND_Y = 470;
const LAKE_X = 900; // water starts here
const ARRIVE_X = 1020; // reaching this point finishes the game
const CHAR_SCALE = 4;
const CHAR_W = SPRITE_W * CHAR_SCALE;
const CHAR_H = SPRITE_H * CHAR_SCALE;

type Splash = { x: number; y: number; vx: number; vy: number; life: number };

export default function WelcomeGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const [arrived, setArrived] = useState(false);
  const arrivedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let character: CharacterConfig = DEFAULT_CHARACTER;
    try {
      const saved = window.localStorage.getItem("ej-character");
      if (saved) character = normalizeCharacter(JSON.parse(saved));
    } catch {
      // keep default
    }

    const player = {
      x: 60,
      y: GROUND_Y - CHAR_H,
      vy: 0,
      onGround: true,
      facing: 1,
      moving: false,
      frameTimer: 0,
      walkFrame: false,
    };
    const splashes: Splash[] = [];
    let fade = 0;
    let finishing = false;
    let navigated = false;
    let last = performance.now();
    let raf = 0;

    const keys = keysRef.current;

    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "a", "d", "w"].includes(e.key)) {
        e.preventDefault();
      }
      keys.add(e.key);
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const finish = () => {
      if (navigated) return;
      navigated = true;
      window.localStorage.setItem("ej-visited", "1");
      router.push("/home");
    };

    const step = (now: number) => {
      const dt = Math.min(32, now - last) / 16.667; // normalized to 60fps units
      last = now;
      const t = now;

      // --- update ---
      const left = keys.has("ArrowLeft") || keys.has("a") || keys.has("touch-left");
      const right = keys.has("ArrowRight") || keys.has("d") || keys.has("touch-right");
      const jump =
        keys.has("ArrowUp") || keys.has(" ") || keys.has("w") || keys.has("touch-jump");

      if (!finishing) {
        player.moving = false;
        if (left) {
          player.x -= 4.2 * dt;
          player.facing = -1;
          player.moving = true;
        }
        if (right) {
          player.x += 4.2 * dt;
          player.facing = 1;
          player.moving = true;
        }
        player.x = Math.max(0, Math.min(WORLD_W - CHAR_W, player.x));

        if (jump && player.onGround) {
          player.vy = -13;
          player.onGround = false;
        }
      }
      player.vy += 0.7 * dt;
      player.y += player.vy * dt;

      const feetX = player.x + CHAR_W / 2;
      const inLake = feetX > LAKE_X + 40;
      const floorY = inLake ? GROUND_Y + 26 : GROUND_Y;
      if (player.y >= floorY - CHAR_H) {
        if (!player.onGround && inLake && !finishing) {
          // splash on landing in water
          for (let i = 0; i < 26; i++) {
            splashes.push({
              x: feetX,
              y: floorY - 10,
              vx: (Math.random() - 0.5) * 8,
              vy: -Math.random() * 9 - 2,
              life: 1,
            });
          }
        }
        player.y = floorY - CHAR_H;
        player.vy = 0;
        player.onGround = true;
      }

      if (player.moving && player.onGround) {
        player.frameTimer += dt * 16.667;
        if (player.frameTimer > 130) {
          player.frameTimer = 0;
          player.walkFrame = !player.walkFrame;
        }
      } else {
        player.walkFrame = false;
      }

      if (!finishing && feetX >= ARRIVE_X) {
        finishing = true;
        arrivedRef.current = true;
        setArrived(true);
        for (let i = 0; i < 40; i++) {
          splashes.push({
            x: feetX,
            y: GROUND_Y + 10,
            vx: (Math.random() - 0.5) * 10,
            vy: -Math.random() * 11 - 3,
            life: 1,
          });
        }
        setTimeout(finish, 2600);
      }
      if (finishing) fade = Math.min(1, fade + 0.006 * dt * 16.667 * 0.06);

      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 0.5 * dt;
        s.life -= 0.02 * dt;
        if (s.life <= 0) splashes.splice(i, 1);
      }

      const cam = Math.max(0, Math.min(WORLD_W - VIEW_W, player.x - VIEW_W * 0.38));

      // --- draw ---
      const sunScreenX = 800 - cam * 0.06;
      const sunWorldX = sunScreenX + cam;

      ctx.imageSmoothingEnabled = false;
      drawSky(ctx, VIEW_W, VIEW_H);
      drawSun(ctx, sunScreenX, 78, 30);
      drawBirds(ctx, 320 - cam * 0.15, 96, t);
      drawBirds(ctx, 760 - cam * 0.15, 140, t);
      // big puffy clouds
      drawCloud(ctx, 90 - cam * 0.2, 58, 15);
      drawCloud(ctx, 470 - cam * 0.2, 120, 11);
      drawCloud(ctx, 900 - cam * 0.2, 48, 13);
      drawCloud(ctx, 1420 - cam * 0.2, 96, 12);
      // floating grass islands drifting in the sky
      drawFloatingIsland(ctx, 300 - cam * 0.3, 128, 150);
      drawLadder(ctx, 292 - cam * 0.3, 140, 52);
      drawMushroom(ctx, 340 - cam * 0.3, 128, 1.2);
      drawFloatingIsland(ctx, 820 - cam * 0.3, 84, 116);
      drawTree(ctx, 820 - cam * 0.3, 84, 0.62);
      drawFloatingIsland(ctx, 1280 - cam * 0.3, 150, 96);
      // hazy blue ridges + rolling green hills
      drawMountains(ctx, VIEW_W, 306, -cam * 0.35, true);
      drawMountains(ctx, VIEW_W, 348, -cam * 0.55, false);

      // distant lake strip behind everything (it IS Lake Garda country)
      drawWater(ctx, 0, 352, VIEW_W, 32, t, sunScreenX);

      ctx.save();
      ctx.translate(-cam, 0);

      // ground: grass over soil until the lake shore, then water
      drawGrass(ctx, 0, GROUND_Y, LAKE_X + 60, VIEW_H - GROUND_Y);
      drawPath(ctx, 0, GROUND_Y + 18, LAKE_X + 20, 24);
      // shore slope
      ctx.fillStyle = PALETTE.path;
      ctx.fillRect(LAKE_X + 20, GROUND_Y, 40, VIEW_H - GROUND_Y);
      drawWater(ctx, LAKE_X + 60, GROUND_Y + 16, WORLD_W - LAKE_X - 60 + VIEW_W, VIEW_H - GROUND_Y - 16, t, sunWorldX);

      // scenery along the way: big trees, mushrooms, the lemon terrace,
      // the villa, a wisteria pergola, then down to the shore
      drawTree(ctx, 105, GROUND_Y, 1.15);
      drawMushroom(ctx, 158, GROUND_Y, 1.15);
      drawSign(ctx, 205, GROUND_Y, "VILLA SOSTAGA");
      drawTerraceWall(ctx, 255, GROUND_Y - 10, 180);
      drawLemonTree(ctx, 300, GROUND_Y - 10, 2);
      drawLemonTree(ctx, 375, GROUND_Y - 10, 2);
      drawOliveTree(ctx, 448, GROUND_Y, 2);
      drawVilla(ctx, 500, GROUND_Y, 1);
      drawPergola(ctx, 705, GROUND_Y, 130);
      drawBush(ctx, 758, GROUND_Y, 22);
      drawMushroom(ctx, 800, GROUND_Y, 0.95);
      drawSign(ctx, 858, GROUND_Y, "LAKE GARDA");
      drawCypress(ctx, 896, GROUND_Y, 100);
      drawBoat(ctx, 1150, GROUND_Y + 24, t);

      // player (half-submerged when in the lake)
      const submerged = player.x + CHAR_W / 2 > LAKE_X + 60;
      drawCharacter(ctx, character, {
        x: Math.round(player.x),
        y: Math.round(player.y),
        scale: CHAR_SCALE,
        frame: player.walkFrame ? "walk" : "stand",
        flip: player.facing === -1,
        blink: Math.floor(t / 200) % 18 === 0,
      });
      if (submerged) {
        drawWater(ctx, LAKE_X + 60, GROUND_Y + 40, WORLD_W - LAKE_X + VIEW_W, VIEW_H - GROUND_Y - 40, t);
      }

      // splash particles
      ctx.fillStyle = PALETTE.lakeShine;
      for (const s of splashes) {
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillRect(s.x, s.y, 4, 4);
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      // fade out at the end
      if (fade > 0) {
        ctx.fillStyle = `rgba(250, 246, 238, ${fade})`;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [router]);

  const press = (key: string, down: boolean) => {
    if (down) keysRef.current.add(key);
    else keysRef.current.delete(key);
  };

  const touchBtn = (key: string, label: string, extra = "") => (
    <button
      className={`font-sans text-xl font-medium w-16 h-16 rounded-full bg-white/95 text-ink shadow-[0_6px_20px_-6px_rgba(20,50,80,0.45)] border border-black/5 active:scale-95 active:bg-sky-100 transition-transform select-none touch-none ${extra}`}
      onPointerDown={(e) => {
        e.preventDefault();
        press(key, true);
      }}
      onPointerUp={() => press(key, false)}
      onPointerLeave={() => press(key, false)}
      onPointerCancel={() => press(key, false)}
      aria-label={key}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden touch-none select-none"
      style={{
        // Letterbox bands read as sky (above) and deep water (below) on
        // portrait screens where the 16:9 canvas can't fill the viewport.
        background: "linear-gradient(to bottom, #4fb3ef 0 50%, #2a7cc2 50% 100%)",
      }}
    >
      <canvas
        ref={canvasRef}
        width={VIEW_W}
        height={VIEW_H}
        className="pixelated w-full h-full object-contain touch-none"
      />

      {/* Title & instructions */}
      <div
        className="absolute inset-x-0 flex flex-col items-center pointer-events-none px-4"
        style={{ top: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div className="max-w-[76vw] px-5 sm:px-7 py-3 sm:py-4 text-center rounded-2xl bg-white/95 shadow-[0_10px_36px_-12px_rgba(20,50,80,0.45)] border border-black/5">
          <div className="flex justify-center text-gold">
            <LogoMark size={26} />
          </div>
          <h1 className="font-pixel text-center text-xs sm:text-base text-ink mt-2">
            Enid &amp; Jason
          </h1>
          <p
            className="font-sans text-center text-[0.55rem] sm:text-[0.6rem] font-medium tracking-[0.25em] uppercase mt-1 text-stone"
            style={{ textIndent: "0.25em" }}
          >
            23–25 April 2027 · {WEDDING.venue}
          </p>
        </div>
        {!arrived && (
          <p className="text-center italic text-sm sm:text-base mt-3 sm:mt-4 text-ink/85 bg-white/85 rounded-full shadow-[0_8px_24px_-10px_rgba(20,50,80,0.4)] px-6 py-2.5 max-w-[92vw] sm:max-w-md">
            Walk right into Lake Garda →
            <span className="not-italic hidden pointer-fine:block font-sans text-[0.6rem] font-medium tracking-[0.2em] uppercase mt-1 text-stone">
              arrow keys / WASD · space to jump
            </span>
            <span className="not-italic hidden pointer-coarse:block font-sans text-[0.6rem] font-medium tracking-[0.2em] uppercase mt-1 text-stone">
              use the buttons below · ▲ to jump
            </span>
          </p>
        )}
        {arrived && (
          <p className="font-pixel text-center text-xs sm:text-base mt-4 sm:mt-6 text-ink bg-white/95 rounded-2xl shadow-[0_10px_36px_-12px_rgba(20,50,80,0.45)] border border-black/5 px-6 py-3.5 max-w-[92vw] animate-float-slow">
            Welcome to our wedding ♥
          </p>
        )}
      </div>

      {/* Skip */}
      <button
        onClick={() => {
          window.localStorage.setItem("ej-visited", "1");
          router.push("/home");
        }}
        className="absolute font-sans text-[0.66rem] font-medium tracking-[0.25em] uppercase px-5 py-2.5 rounded-full bg-white/95 text-ink shadow-[0_8px_24px_-10px_rgba(20,50,80,0.45)] border border-black/5 hover:bg-white cursor-pointer transition-colors"
        style={{
          top: "max(0.75rem, env(safe-area-inset-top))",
          right: "max(0.75rem, env(safe-area-inset-right))",
        }}
      >
        Salta →
      </button>

      {/* Touch controls — any touch-primary device (phones AND tablets) */}
      <div
        className="absolute inset-x-0 bottom-0 hidden pointer-coarse:flex justify-between items-end px-6"
        style={{
          paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
          paddingLeft: "max(1.5rem, env(safe-area-inset-left))",
          paddingRight: "max(1.5rem, env(safe-area-inset-right))",
        }}
      >
        <div className="flex gap-3">
          {touchBtn("touch-left", "◀")}
          {touchBtn("touch-right", "▶")}
        </div>
        {touchBtn("touch-jump", "▲")}
      </div>
    </div>
  );
}
