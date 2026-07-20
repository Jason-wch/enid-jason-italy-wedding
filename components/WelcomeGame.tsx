"use client";

/**
 * Welcome minigame — MapleStory-style 2.5D side-scroller rendered with
 * Three.js. Walk (and jump) your voxel character down Villa Sostaga's
 * lakeside walk and wade into Lake Garda to enter the wedding website.
 *
 * The gameplay is the original canvas game's, byte-for-byte: walk 4.2 px/f,
 * gravity 0.7, jump -13, the same dt clamp, camera lead and arrive trigger.
 * Only the renderer changed.
 *
 * If WebGL is unavailable (or the context dies), the old Canvas-2D build in
 * WelcomeGame2D.tsx takes over seamlessly.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import {
  DEFAULT_CHARACTER,
  normalizeCharacter,
  SPRITE_H,
  SPRITE_W,
  type CharacterConfig,
} from "@/lib/maple/characters";
import { PALETTE } from "@/lib/maple/scenery";
import {
  CAM_FOV,
  camDistance,
  createRenderer,
  disposeObject,
  srgbColor,
} from "@/lib/maple3d/engine";
import { makeShadowQuad, VoxelCharacter } from "@/lib/maple3d/voxelChar";
import {
  ARRIVE_X,
  buildEntranceWorld,
  GROUND_Y,
  LAKE_X,
  MAX_VIEW_W,
  MIN_VIEW_W,
  VIEW_H,
  WORLD_W,
} from "@/lib/maple3d/level";
import { WEDDING } from "@/lib/wedding";
import { LogoMark } from "@/components/decor/Logo";
import WelcomeGame2D from "@/components/WelcomeGame2D";

const CHAR_SCALE = 4;
const CHAR_W = SPRITE_W * CHAR_SCALE;
const CHAR_H = SPRITE_H * CHAR_SCALE;
const MAX_SPLASHES = 96;

type Splash = { x: number; y: number; vx: number; vy: number; life: number };

export default function WelcomeGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const [arrived, setArrived] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (fallback) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = createRenderer(canvas);
    if (!renderer) {
      setFallback(true);
      return;
    }
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setFallback(true);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

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

    const D = camDistance(VIEW_H);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAM_FOV, viewW / VIEW_H, 10, 30000);
    camera.position.set(viewW / 2, -VIEW_H / 2, D);
    const world = buildEntranceWorld(scene, camera, D);

    const applySize = () => {
      renderer.setSize(viewW, VIEW_H, false);
      camera.aspect = viewW / VIEW_H;
      camera.updateProjectionMatrix();
      world.layout(viewW);
    };
    applySize();
    const onResize = () => {
      viewW = viewWFor();
      applySize();
    };
    window.addEventListener("resize", onResize);

    let character: CharacterConfig = DEFAULT_CHARACTER;
    try {
      const saved = window.localStorage.getItem("ej-character");
      if (saved) character = normalizeCharacter(JSON.parse(saved));
    } catch {
      // keep default
    }

    const playerVox = new VoxelCharacter(CHAR_SCALE);
    playerVox.setConfig(character);
    scene.add(playerVox.group);
    const shadow = makeShadowQuad(11 * CHAR_SCALE);
    scene.add(shadow);

    const splashMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({
        color: srgbColor(PALETTE.lakeShine),
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
      MAX_SPLASHES
    );
    splashMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    splashMesh.frustumCulled = false;
    splashMesh.count = 0;
    scene.add(splashMesh);
    const tmpPos = new THREE.Vector3();
    const tmpScale = new THREE.Vector3();
    const tmpQuat = new THREE.Quaternion();
    const tmpMatrix = new THREE.Matrix4();

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

    const addSplashes = (n: number, x: number, y: number, power: number) => {
      for (let i = 0; i < n; i++) {
        splashes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * (power + 2),
          vy: -Math.random() * (power + 1) - 2,
          life: 1,
        });
      }
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
          addSplashes(26, feetX, floorY - 10, 7); // splash on landing in water
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
        addSplashes(40, feetX, GROUND_Y + 10, 9);
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

      // --- render ---
      camera.position.set(cam + viewW / 2, -VIEW_H / 2, D);

      const submerged = player.x + CHAR_W / 2 > LAKE_X + 60;
      playerVox.setFeet(player.x + CHAR_W / 2, player.y + CHAR_H);
      playerVox.setFacing(player.facing);
      playerVox.setPose(
        player.moving && player.onGround,
        player.walkPhase,
        Math.floor(t / 200) % 18 === 0
      );
      shadow.visible = player.onGround && !submerged;
      if (shadow.visible) {
        shadow.position.set(player.x + CHAR_W / 2, -(player.y + CHAR_H) + 0.6, 1);
      }

      const n = Math.min(splashes.length, MAX_SPLASHES);
      for (let i = 0; i < n; i++) {
        const s = splashes[i];
        const size = Math.max(0.15, Math.min(1, s.life));
        tmpPos.set(s.x, -s.y, 118);
        tmpScale.setScalar(size);
        tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
        splashMesh.setMatrixAt(i, tmpMatrix);
      }
      splashMesh.count = n;
      splashMesh.instanceMatrix.needsUpdate = true;

      world.update(t, cam, viewW);
      if (fadeRef.current) fadeRef.current.style.opacity = fade.toFixed(3);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      playerVox.dispose();
      const bg = scene.background;
      if (bg && (bg as THREE.Texture).isTexture) (bg as THREE.Texture).dispose();
      disposeObject(scene);
      renderer.dispose();
    };
  }, [router, fallback]);

  if (fallback) return <WelcomeGame2D />;

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

      {/* End-of-game fade to cream (driven by the game loop) */}
      <div
        ref={fadeRef}
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: "rgb(250, 246, 238)", opacity: 0 }}
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
