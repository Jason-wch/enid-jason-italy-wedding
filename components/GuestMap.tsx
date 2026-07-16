"use client";

/**
 * Live guest map, MapleStory 2.5D edition: every RSVP'd guest's voxel
 * character hangs out on the sunlit Villa Sostaga lawn. The stored map_x
 * spreads guests across the garden and map_y now walks them back INTO the
 * scene — nearer guests stand larger, farther ones smaller, with the villa,
 * gazebo and Lake Garda behind. New guests still pop in live via Supabase
 * Realtime Broadcast (sent by the RSVP API route), with polling as a
 * fallback; without WebGL the old canvas build (GuestMap2D) takes over.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import { mockGuests } from "@/lib/mock";
import type { GuestChar } from "@/lib/types";
import {
  hashString,
  normalizeCharacter,
  SPRITE_H,
  SPRITE_W,
} from "@/lib/maple/characters";
import {
  addGoldenLights,
  CAM_FOV,
  camDistance,
  createRenderer,
  disposeObject,
  layoutParallaxLayer,
} from "@/lib/maple3d/engine";
import { makeNameTag, makeShadowQuad, VoxelCharacter } from "@/lib/maple3d/voxelChar";
import { makeGround, makeWaterSkirt, WaterSurface } from "@/lib/maple3d/tiles";
import * as sc from "@/lib/maple3d/scenery3d";
import { drawWater } from "@/lib/maple/scenery";
import { makeBillboard } from "@/lib/maple3d/engine";
import GuestMap2D from "@/components/GuestMap2D";

const MAP_W = 1100;
const MAP_H = 680;
const CHAR_SCALE = 3;
const CHAR_W = SPRITE_W * CHAR_SCALE;
const CHAR_H = SPRITE_H * CHAR_SCALE;

/** The lawn surface guests stand on (2D world y of their feet). */
const LAWN_FEET_Y = 560;
/** Guests roam x 40..~795 (left of the inlet) and z -540 (back) .. +100 (front). */
const LAWN_SPAN_X = MAP_W - 320 - CHAR_W;
const LAWN_Z_BACK = -540;
const LAWN_Z_SPAN = 640;

const SUN_X = MAP_W - 170;

function guestSpot(g: GuestChar): { x: number; z: number } {
  const mx = Number.isFinite(g.map_x) ? g.map_x : (hashString(g.id) % 1000) / 1000;
  const my = Number.isFinite(g.map_y) ? g.map_y : (hashString(g.id + "y") % 1000) / 1000;
  return {
    x: 40 + mx * LAWN_SPAN_X + CHAR_W / 2,
    z: LAWN_Z_BACK + my * LAWN_Z_SPAN,
  };
}

type Slot = {
  vox: VoxelCharacter;
  tag: THREE.Mesh;
  shadow: THREE.Mesh;
  seed: number;
  x: number;
  z: number;
  cfgKey: string;
};

export default function GuestMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guestsRef = useRef<GuestChar[]>([]);
  const versionRef = useRef(0);
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [fallback, setFallback] = useState(false);

  const loadGuests = useCallback(async () => {
    try {
      const res = await fetch("/api/guests");
      if (res.status === 503) {
        guestsRef.current = mockGuests();
        versionRef.current++;
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
      versionRef.current++;
      setGuestCount(guestsRef.current.length);
    } catch {
      // keep previous list
    }
  }, []);

  // Initial load + realtime broadcast + polling fallback.
  useEffect(() => {
    if (fallback) return; // the 2D fallback component runs its own data loop
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
  }, [loadGuests, fallback]);

  // 3D scene + render loop.
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
    renderer.setSize(MAP_W, MAP_H, false);

    const D = camDistance(MAP_H);
    const scene = new THREE.Scene();
    scene.background = sc.skyTexture(MAP_H);
    const camera = new THREE.PerspectiveCamera(CAM_FOV, MAP_W / MAP_H, 10, 30000);
    camera.position.set(MAP_W / 2, -MAP_H / 2, D);
    addGoldenLights(scene);

    /* ------------------------------ terrain ------------------------------ */

    // the lawn: one deep grass slab; guests spread across its top face
    const lawn = makeGround(1070, "grass", 160, 760);
    lawn.placeTop(-200, LAWN_FEET_Y, -240);
    scene.add(lawn.mesh);

    // lake inlet on the right: sand bed + flat-lying animated water
    const inletBed = makeGround(480, "sand", 120, 700);
    inletBed.placeTop(872, LAWN_FEET_Y + 30, -200);
    const inlet = new WaterSurface(490, 690, 96);
    inlet.place(870, LAWN_FEET_Y + 6, 145);
    const skirt = makeWaterSkirt(490, 96);
    skirt.position.set(870 + 245, -(LAWN_FEET_Y + 6 + 48), 145);
    scene.add(inletBed.mesh, inlet.mesh, skirt);

    const theBoat = sc.boat();
    theBoat.place(1000, LAWN_FEET_Y + 6, -150);
    scene.add(theBoat.billboard.mesh);

    // garden garnish scattered in depth across the lawn
    const garnish: [sc.Billboard, number, number][] = [
      [sc.flowerBed(44), 180, -320],
      [sc.mushroom(0.9), 640, -180],
      [sc.flowerBed(40), 400, -60],
      [sc.oliveTree(0.8), 80, -380],
    ];
    for (const [bb, x, z] of garnish) {
      bb.place(x, LAWN_FEET_Y, z);
      scene.add(bb.mesh);
    }

    /* --------------------- villa band at the lawn's back ------------------ */

    // p chosen so the layer sits just in front of the lawn's far edge
    const bandP = D / (D + 600);
    const band = new THREE.Group();
    scene.add(band);
    layoutParallaxLayer(band, bandP, D, MAP_W, MAP_H);
    const BAND_Y = 475; // screen baseline: exactly the lawn's far edge
    const bandPieces: [sc.Billboard, number][] = [
      [sc.villa(0.72), 56],
      [sc.gazebo(0.62), 296],
      [sc.flowerBed(48), 402],
      [sc.oliveTree(0.95), 486],
      [sc.cypress(108), 540],
      [sc.tree(0.95), 600],
      [sc.mushroom(0.9), 660],
      [sc.cypress(96), 704],
      [sc.flowerBed(44), 760],
      [sc.flowerBed(52), 900],
      [sc.tree(0.85), 990],
      [sc.mushroom(1.0), 1046],
    ];
    for (const [bb, x] of bandPieces) {
      bb.place(x, BAND_Y);
      band.add(bb.mesh);
    }

    /* ----------------------------- backdrop ------------------------------ */

    const layers: { p: number; group: THREE.Group }[] = [];
    const layer = (p: number) => {
      const group = new THREE.Group();
      scene.add(group);
      layoutParallaxLayer(group, p, D, MAP_W, MAP_H);
      layers.push({ p, group });
      return group;
    };

    const skyLayer = layer(0.25);
    const sunCard = sc.sun(34);
    sunCard.place(SUN_X, 162);
    skyLayer.add(sunCard.mesh);
    for (const [x, y, s] of [
      [80, 52, 13],
      [450, 112, 9],
      [800, 40, 12],
    ] as const) {
      const c = sc.cloud(s);
      c.place(x, y);
      skyLayer.add(c.mesh);
    }
    const island = sc.floatingIsland(130, [
      { kind: "ladder", dx: -8, dy: 14, len: 46 },
      { kind: "mushroom", dx: 35, dy: 0, s: 0.95 },
    ]);
    island.place(620, 96);
    skyLayer.add(island.mesh);
    const flockA = sc.birds();
    flockA.billboard.place(240, 70);
    const flockB = sc.birds();
    flockB.billboard.place(900, 120);
    skyLayer.add(flockA.billboard.mesh, flockB.billboard.mesh);

    const farLayer = layer(0.35);
    const farM = sc.mountains(MAP_W + 300, true);
    farM.place(-100, 306);
    farLayer.add(farM.mesh);

    const hillLayer = layer(0.45);
    const nearM = sc.mountains(MAP_W + 400, false);
    nearM.place(-240, 342); // -240 ≡ +60 (mod 300): the old hump offset
    hillLayer.add(nearM.mesh);

    // calm distant lake between the hills' feet and the lawn's far edge
    const bandWater = layer(0.55);
    const lakeStrip = makeBillboard(MAP_W + 300, 144, 0, 0, (ctx) =>
      drawWater(ctx, 0, 0, MAP_W + 300, 144, 0, SUN_X + 100)
    );
    lakeStrip.place(-100, 346);
    bandWater.add(lakeStrip.mesh);

    /* ------------------------------- guests ------------------------------ */

    const slots = new Map<string, Slot>();
    let appliedVersion = -1;

    const reconcile = () => {
      appliedVersion = versionRef.current;
      const present = new Set<string>();
      for (const g of guestsRef.current) {
        present.add(g.id);
        const cfgKey = JSON.stringify(g.character);
        let slot = slots.get(g.id);
        if (!slot) {
          const vox = new VoxelCharacter(CHAR_SCALE);
          vox.setConfig(g.character);
          const tag = makeNameTag(g.name).mesh;
          const shadow = makeShadowQuad(11 * CHAR_SCALE);
          scene.add(vox.group, tag, shadow);
          const { x, z } = guestSpot(g);
          slot = { vox, tag, shadow, seed: hashString(g.id), x, z, cfgKey };
          slots.set(g.id, slot);
        } else if (slot.cfgKey !== cfgKey) {
          slot.vox.setConfig(g.character);
          slot.cfgKey = cfgKey;
        }
      }
      for (const [id, slot] of slots) {
        if (present.has(id)) continue;
        scene.remove(slot.vox.group, slot.tag, slot.shadow);
        slot.vox.dispose();
        disposeObject(slot.tag);
        disposeObject(slot.shadow);
        slots.delete(id);
      }
    };

    /* ------------------------------- loop -------------------------------- */

    let raf = 0;
    const render = (t: number) => {
      if (appliedVersion !== versionRef.current) reconcile();

      for (const slot of slots.values()) {
        const bob = Math.sin(t / 640 + slot.seed) * 2;
        slot.vox.setFeet(slot.x, LAWN_FEET_Y + bob, slot.z);
        slot.vox.setFacing(slot.seed % 2 === 0 ? -1 : 1);
        slot.vox.setPose(false, 0, Math.floor(t / 190 + slot.seed) % 24 === 0);
        slot.shadow.position.set(slot.x, -LAWN_FEET_Y + 0.6, slot.z + 2);
        slot.tag.position.set(slot.x, -(LAWN_FEET_Y + bob - CHAR_H - 12), slot.z + 30);
      }

      inlet.repaint(t, SUN_X - 870);
      theBoat.update(t);
      flockA.update(t);
      flockB.update(t);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      for (const slot of slots.values()) slot.vox.dispose();
      slots.clear();
      const bg = scene.background;
      if (bg && (bg as THREE.Texture).isTexture) (bg as THREE.Texture).dispose();
      disposeObject(scene);
      renderer.dispose();
    };
  }, [fallback]);

  if (fallback) return <GuestMap2D />;

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
