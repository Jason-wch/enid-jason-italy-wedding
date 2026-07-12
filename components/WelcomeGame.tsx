"use client";

/**
 * Welcome minigame: a MapleStory-style side-scroller in chunky 8-bit pixel
 * art, set in a bright golden-hour glow. Walk (and jump) your chibi
 * character down Villa Sostaga's gravel drive, past the yellow villa and the
 * gazebo terrace, and dive into Lake Garda to enter the wedding website.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_CHARACTER,
  drawCharacter,
  normalizeCharacter,
  SPRITE_H,
  SPRITE_W,
  type CharacterConfig,
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
  drawLadder,
  drawMountains,
  drawMushroom,
  drawOliveTree,
  drawSign,
  drawSky,
  drawSun,
  drawTree,
  drawVilla,
  drawWater,
  PALETTE,
} from "@/lib/maple/scenery";
import { WEDDING } from "@/lib/wedding";
import { LogoMark } from "@/components/decor/Logo";

/**
 * The view height is fixed; the view WIDTH follows the device's aspect ratio
 * so the world fills the entire screen — no letterboxing on phones.
 */
const MAX_VIEW_W = 960;
const MIN_VIEW_W = 240;
const VIEW_H = 540;
const WORLD_W = 1500;
const GROUND_Y = 470;
const LAKE_X = 900; // water starts here
const ARRIVE_X = 1020; // reaching this point finishes the game
const CHAR_SCALE = 4;
const CHAR_W = SPRITE_W * CHAR_SCALE;
const CHAR_H = SPRITE_H * CHAR_SCALE;

type Splash = { x: number; y: number; vx: number; vy: number; life: number };

/** Pre-renders the static foreground strip (ground + scenery) once. */
function buildForeground(res: number): HTMLCanvasElement {
  const off = document.createElement("canvas");
  off.width = WORLD_W * res;
  off.height = VIEW_H * res;
  const ctx = off.getContext("2d")!;
  ctx.setTransform(res, 0, 0, res, 0, 0);
  ctx.imageSmoothingEnabled = false;

  // ground: lawn until the shore, then open water (drawn live)
  drawGrass(ctx, 0, GROUND_Y, LAKE_X + 60, VIEW_H - GROUND_Y);
  // stepped sandy slope into the lake
  ctx.fillStyle = "#e0c089";
  ctx.fillRect(LAKE_X + 18, GROUND_Y, 42, VIEW_H - GROUND_Y);
  ctx.fillRect(LAKE_X + 33, GROUND_Y + 6, 27, VIEW_H - GROUND_Y - 6);
  ctx.fillStyle = "#c9a06b";
  ctx.fillRect(LAKE_X + 45, GROUND_Y + 12, 15, VIEW_H - GROUND_Y - 12);

  // the walk to the villa
  drawCypress(ctx, 48, GROUND_Y, 120);
  drawTree(ctx, 118, GROUND_Y, 1.0);
  drawSign(ctx, 205, GROUND_Y, "VILLA SOSTAGA");
  drawMushroom(ctx, 262, GROUND_Y, 1.0);
  drawFlowerBed(ctx, 292, GROUND_Y, 58);
  drawOliveTree(ctx, 385, GROUND_Y, 1.05);
  drawCypress(ctx, 432, GROUND_Y, 104);

  // the villa itself (draws its own porch, steps and potted olives)
  drawVilla(ctx, 458, GROUND_Y, 0.95);

  // gazebo terrace down to the shore
  drawGazebo(ctx, 706, GROUND_Y, 0.82);
  drawFlowerBed(ctx, 792, GROUND_Y, 46);
  drawMushroom(ctx, 812, GROUND_Y, 0.85);
  drawSign(ctx, 852, GROUND_Y, "LAKE GARDA");
  drawCypress(ctx, 893, GROUND_Y, 92);

  return off;
}

export default function WelcomeGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Integer resolution only, so every texel lands on whole device pixels.
    const RES = (window.devicePixelRatio || 1) >= 1.5 ? 2 : 1;
    // Match the viewport to the screen's aspect ratio: the game fills the
    // whole phone screen (portrait shows a narrower slice of the world).
    const viewWFor = () =>
      Math.round(
        Math.min(
          MAX_VIEW_W,
          Math.max(MIN_VIEW_W, VIEW_H * (window.innerWidth / Math.max(1, window.innerHeight)))
        )
      );
    let viewW = viewWFor();
    canvas.width = viewW * RES;
    canvas.height = VIEW_H * RES;
    const onResize = () => {
      viewW = viewWFor();
      canvas.width = viewW * RES;
    };
    window.addEventListener("resize", onResize);
    const foreground = buildForeground(RES);

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
      walkPhase: 0,
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
      const floorY = inLake ? GROUND_Y + 56 : GROUND_Y; // chest-deep in the lake
      if (player.y < floorY - CHAR_H - 0.5) player.onGround = false; // walked off a ledge
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
        player.walkPhase += dt * 0.32;
      }

      if (!finishing && feetX >= ARRIVE_X) {
        finishing = true;
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
      if (finishing) fade = Math.min(1, fade + 0.006 * dt);

      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 0.5 * dt;
        s.life -= 0.02 * dt;
        if (s.life <= 0) splashes.splice(i, 1);
      }

      const cam = Math.max(0, Math.min(WORLD_W - viewW, player.x - viewW * 0.38));

      // --- draw ---
      ctx.setTransform(RES, 0, 0, RES, 0, 0);
      ctx.imageSmoothingEnabled = false;

      const sunScreenX = viewW * 0.83 - cam * 0.06;
      const sunWorldX = sunScreenX + cam;

      // sky only needs to reach the waterline (water + foreground cover the rest)
      drawSky(ctx, viewW, 400);
      drawSun(ctx, sunScreenX, 158, 36);
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
      drawMushroom(ctx, 340 - cam * 0.3, 128, 1.1);
      drawFloatingIsland(ctx, 820 - cam * 0.3, 84, 116);
      drawTree(ctx, 820 - cam * 0.3, 84, 0.6);
      drawFloatingIsland(ctx, 1280 - cam * 0.3, 150, 96);
      // amber-hazed pre-Alps + rolling sunlit hills
      drawMountains(ctx, viewW, 306, -cam * 0.35, true);
      drawMountains(ctx, viewW, 348, -cam * 0.55, false);
      // the great lake behind the villa terrace — Villa Sostaga overlooks it
      drawWater(ctx, 0, 352, viewW, GROUND_Y - 352, t, sunScreenX);

      // pre-rendered foreground strip
      ctx.drawImage(
        foreground,
        cam * RES,
        0,
        viewW * RES,
        VIEW_H * RES,
        0,
        0,
        viewW,
        VIEW_H
      );

      ctx.save();
      ctx.translate(-cam, 0);

      // animated lake water
      drawWater(
        ctx,
        LAKE_X + 60,
        GROUND_Y + 16,
        WORLD_W - LAKE_X - 60 + viewW,
        VIEW_H - GROUND_Y - 16,
        t,
        sunWorldX
      );

      // player (chest-deep once in the lake)
      const submerged = player.x + CHAR_W / 2 > LAKE_X + 60;
      drawCharacter(ctx, character, {
        x: player.x,
        y: player.y,
        scale: CHAR_SCALE,
        frame: player.moving && player.onGround ? "walk" : "stand",
        phase: player.walkPhase,
        flip: player.facing === -1,
        blink: Math.floor(t / 200) % 18 === 0,
        shadow: player.onGround && !submerged,
      });
      if (submerged) {
        // redraw the water surface over the body below the waterline
        drawWater(
          ctx,
          LAKE_X + 60,
          GROUND_Y + 16,
          WORLD_W - LAKE_X + viewW,
          VIEW_H - GROUND_Y - 16,
          t,
          sunWorldX
        );
      }
      drawBoat(ctx, 1150, GROUND_Y + 34, t);

      // splash droplets
      for (const s of splashes) {
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = PALETTE.lakeShine;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      // fade out at the end
      if (fade > 0) {
        ctx.fillStyle = `rgba(250, 246, 238, ${fade})`;
        ctx.fillRect(0, 0, viewW, VIEW_H);
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
    };
  }, [router]);

  const press = (key: string, down: boolean) => {
    if (down) keysRef.current.add(key);
    else keysRef.current.delete(key);
  };

  /** Stepped pixel arrow, drawn with crisp SVG rects for the 8-bit look. */
  const pixelArrow = (dir: "left" | "right" | "up") => (
    <svg
      viewBox={dir === "up" ? "0 0 7 6" : "0 0 6 7"}
      width={dir === "up" ? 30 : 26}
      height={dir === "up" ? 26 : 30}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {dir === "left" && (
        <>
          <rect x="4" y="0" width="2" height="7" />
          <rect x="2" y="1" width="2" height="5" />
          <rect x="0" y="2" width="2" height="3" />
        </>
      )}
      {dir === "right" && (
        <>
          <rect x="0" y="0" width="2" height="7" />
          <rect x="2" y="1" width="2" height="5" />
          <rect x="4" y="2" width="2" height="3" />
        </>
      )}
      {dir === "up" && (
        <>
          <rect x="2" y="0" width="3" height="2" />
          <rect x="1" y="2" width="5" height="2" />
          <rect x="0" y="4" width="7" height="2" />
        </>
      )}
    </svg>
  );

  /** Chunky retro game button: hard pixel bevel + a fat drop ledge that
      squashes flat while pressed, like an arcade cabinet button. */
  const touchBtn = (key: string, content: ReactNode, extra: string) => (
    <button
      className={`flex flex-col items-center justify-center select-none touch-none border-4 ${extra}`}
      onPointerDown={(e) => {
        e.preventDefault();
        press(key, true);
      }}
      onPointerUp={() => press(key, false)}
      onPointerLeave={() => press(key, false)}
      onPointerCancel={() => press(key, false)}
      aria-label={key}
    >
      {content}
    </button>
  );

  const PAD =
    "w-[4.6rem] h-[4.6rem] rounded-lg bg-[#f7e8c9] text-[#4a2f16] border-[#4a2f16] " +
    "shadow-[inset_-4px_-4px_0_0_rgba(74,47,22,0.25),inset_4px_4px_0_0_rgba(255,255,255,0.7),0_6px_0_0_#4a2f16] " +
    "active:translate-y-[6px] active:shadow-[inset_-4px_-4px_0_0_rgba(74,47,22,0.25),inset_4px_4px_0_0_rgba(255,255,255,0.7)]";
  const JUMP =
    "w-[5.4rem] h-[5.4rem] gap-1 rounded-full bg-[#e0484b] text-[#fff6e0] border-[#6d1f22] " +
    "shadow-[inset_-4px_-6px_0_0_rgba(109,31,34,0.4),inset_4px_5px_0_0_rgba(255,255,255,0.3),0_6px_0_0_#6d1f22] " +
    "active:translate-y-[6px] active:shadow-[inset_-4px_-6px_0_0_rgba(109,31,34,0.4),inset_4px_5px_0_0_rgba(255,255,255,0.3)]";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden touch-none select-none"
      style={{
        // Fallback bands behind the canvas during rotation/resizes; the
        // canvas viewport tracks the screen aspect, so it fills everything.
        background: "linear-gradient(to bottom, #ffb84d 0 50%, #2a7ab8 50% 100%)",
      }}
    >
      <canvas
        ref={canvasRef}
        width={MAX_VIEW_W}
        height={VIEW_H}
        className="w-full h-full object-cover touch-none [image-rendering:pixelated]"
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
        Skip →
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
        <div className="flex gap-4">
          {touchBtn("touch-left", pixelArrow("left"), PAD)}
          {touchBtn("touch-right", pixelArrow("right"), PAD)}
        </div>
        {touchBtn(
          "touch-jump",
          <>
            {pixelArrow("up")}
            <span
              className="font-sans text-[0.55rem] font-bold tracking-[0.2em] uppercase"
              style={{ textIndent: "0.2em" }}
            >
              Jump
            </span>
          </>,
          JUMP
        )}
      </div>
    </div>
  );
}
