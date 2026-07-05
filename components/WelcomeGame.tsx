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
  drawBush,
  drawCloud,
  drawCypress,
  drawGrass,
  drawMountains,
  drawPath,
  drawSign,
  drawSky,
  drawSun,
  drawVilla,
  drawWater,
  PALETTE,
} from "@/lib/pixel/scenery";
import { WEDDING } from "@/lib/wedding";

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
      ctx.imageSmoothingEnabled = false;
      drawSky(ctx, VIEW_W, VIEW_H);
      drawSun(ctx, 820 - cam * 0.1, 90, 34);
      drawCloud(ctx, 120 - cam * 0.2, 70, 12);
      drawCloud(ctx, 520 - cam * 0.2, 120, 9);
      drawCloud(ctx, 980 - cam * 0.2, 60, 11);
      drawCloud(ctx, 1600 - cam * 0.2, 100, 10);
      drawMountains(ctx, VIEW_W, 300, -cam * 0.35, true);
      drawMountains(ctx, VIEW_W, 340, -cam * 0.55, false);

      // distant lake strip behind everything (it IS Lake Garda country)
      drawWater(ctx, 0, 340, VIEW_W, 40, t);

      ctx.save();
      ctx.translate(-cam, 0);

      // ground: grass until the lake shore, then water
      drawGrass(ctx, 0, GROUND_Y, LAKE_X + 60, VIEW_H - GROUND_Y);
      drawPath(ctx, 0, GROUND_Y + 14, LAKE_X + 20, 26);
      // shore slope
      ctx.fillStyle = PALETTE.path;
      ctx.fillRect(LAKE_X + 20, GROUND_Y, 40, VIEW_H - GROUND_Y);
      drawWater(ctx, LAKE_X + 60, GROUND_Y + 16, WORLD_W - LAKE_X - 60 + VIEW_W, VIEW_H - GROUND_Y - 16, t);

      // scenery along the way (compact: a short stroll from villa to lake)
      drawSign(ctx, 180, GROUND_Y, "VILLA SOSTAGA >");
      drawCypress(ctx, 120, GROUND_Y, 120);
      drawCypress(ctx, 300, GROUND_Y, 150);
      drawBush(ctx, 400, GROUND_Y, 22);
      drawVilla(ctx, 500, GROUND_Y, 1);
      drawCypress(ctx, 690, GROUND_Y, 140);
      drawBush(ctx, 760, GROUND_Y, 26);
      drawSign(ctx, 820, GROUND_Y, "LAKE GARDA >");
      drawCypress(ctx, 870, GROUND_Y, 100);

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
      className={`font-pixel text-lg w-16 h-16 rounded-2xl border-2 border-ink/30 bg-cream/85 active:bg-villa select-none touch-none ${extra}`}
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
    <div className="fixed inset-0 bg-[#aed7f0] flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={VIEW_W}
        height={VIEW_H}
        className="pixelated w-full h-full object-contain"
      />

      {/* Title & instructions */}
      <div className="absolute top-4 inset-x-0 flex flex-col items-center pointer-events-none px-4">
        <h1 className="font-pixel text-center text-base sm:text-lg text-ink drop-shadow-[2px_2px_0_rgba(255,255,255,0.7)]">
          ENID ♥ JASON
        </h1>
        <p className="font-pixel text-center text-xs sm:text-sm mt-2 text-ink/80">
          23–25 APRIL 2027 · {WEDDING.venue.toUpperCase()}
        </p>
        {!arrived && (
          <p className="font-pixel text-center text-xs sm:text-sm mt-4 text-ink/70 bg-cream/70 rounded px-3 py-2 max-w-md">
            WALK RIGHT INTO LAKE GARDA TO ENTER →<br />
            (ARROW KEYS / WASD · SPACE TO JUMP)
          </p>
        )}
        {arrived && (
          <p className="font-pixel text-center text-[10px] sm:text-sm mt-6 text-lake-deep bg-cream/90 rounded px-4 py-3 animate-float-slow">
            BENVENUTI! WELCOME TO OUR WEDDING ♥
          </p>
        )}
      </div>

      {/* Skip */}
      <button
        onClick={() => {
          window.localStorage.setItem("ej-visited", "1");
          router.push("/home");
        }}
        className="absolute top-3 right-3 font-pixel text-sm px-3 py-2 rounded-full border-2 border-ink/20 bg-cream/90 hover:bg-parchment cursor-pointer"
      >
        SKIP →
      </button>

      {/* Touch controls */}
      <div className="absolute bottom-5 inset-x-0 flex justify-between px-6 sm:hidden">
        <div className="flex gap-3">
          {touchBtn("touch-left", "◀")}
          {touchBtn("touch-right", "▶")}
        </div>
        {touchBtn("touch-jump", "▲")}
      </div>
    </div>
  );
}
