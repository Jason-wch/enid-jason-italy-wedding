/**
 * The entrance level: Villa Sostaga's lakeside walk rebuilt as a 2.5D
 * MapleStory map. World coordinates, scenery placement, parallax factors and
 * the collision constants are carried over 1:1 from the old canvas game —
 * plus a new (strictly optional) course of one-way floating platforms above
 * the flat path.
 */

import * as THREE from "three";
import { layoutParallaxLayer } from "./engine";
import * as sc from "./scenery3d";
import { makeGround, makePlatform, makeWaterSkirt, WaterSurface, PLATFORM_DEPTH } from "./tiles";

export const MAX_VIEW_W = 960;
export const MIN_VIEW_W = 240;
export const VIEW_H = 540;
export const WORLD_W = 1500;
export const GROUND_Y = 470;
export const LAKE_X = 900; // water starts here
export const ARRIVE_X = 1020; // reaching this point finishes the game

export type Platform = { x: number; top: number; w: number };

/**
 * One-way jumpable platforms (land from above, jump up through from below).
 * The flat ground walk to ARRIVE_X never needs them — max rise per hop stays
 * under the jump apex (~120px with vy=-13, g=0.7).
 */
export const PLATFORMS: Platform[] = [
  { x: 150, top: 360, w: 132 },
  { x: 330, top: 268, w: 120 },
  { x: 520, top: 212, w: 132 },
  { x: 700, top: 292, w: 120 },
  { x: 858, top: 372, w: 108 },
];

export type EntranceWorld = {
  /** Re-place everything that depends on the view width (call on resize). */
  layout: (viewW: number) => void;
  /** Animate water/birds/boat. camX = camera scroll, t = ms clock. */
  update: (t: number, camX: number, viewW: number) => void;
};

export function buildEntranceWorld(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  D: number
): EntranceWorld {
  scene.background = sc.skyTexture(VIEW_H);

  /* ------------------------------ terrain ------------------------------ */

  const grass = makeGround(978, "grass", 160, 220);
  grass.placeTop(-60, GROUND_Y);
  const beach = makeGround(44, "sand", 160, 220);
  beach.placeTop(918, GROUND_Y);
  const lakebed = makeGround(1140, "sand", 120, 220);
  lakebed.placeTop(962, GROUND_Y + 56);
  scene.add(grass.mesh, beach.mesh, lakebed.mesh);

  for (const p of PLATFORMS) {
    const slab = makePlatform(p.w);
    slab.placeTop(p.x, p.top);
    scene.add(slab.mesh);
  }

  // decorative ladder hanging from the first platform — the Maple invite
  const firstLadder = sc.ladder(GROUND_Y - (PLATFORMS[0].top + 22) - 8);
  firstLadder.place(PLATFORMS[0].x + 22, PLATFORMS[0].top + 22, -PLATFORM_DEPTH / 2 + 2);
  scene.add(firstLadder.mesh);

  const water = new WaterSurface(1140, 240, 96);
  water.place(960, GROUND_Y + 16, 116);
  const skirt = makeWaterSkirt(1140, 80);
  skirt.position.set(960 + 570, -(GROUND_Y + 16 + 40), 116);
  scene.add(water.mesh, skirt);

  /* --------------------------- foreground band -------------------------- */

  const stand = (bb: sc.Billboard | ReturnType<typeof sc.villa>, x: number, z: number) => {
    bb.place(x, GROUND_Y, z);
    scene.add(bb.mesh);
  };
  stand(sc.villa(0.95), 458, -34);
  stand(sc.gazebo(0.82), 706, -30);
  stand(sc.cypress(120), 48, -26);
  stand(sc.cypress(104), 432, -26);
  stand(sc.cypress(92), 893, -26);
  stand(sc.tree(1.0), 118, -22);
  stand(sc.oliveTree(1.05), 385, -22);
  stand(sc.sign("VILLA SOSTAGA"), 205, -16);
  stand(sc.sign("LAKE GARDA"), 852, -16);
  stand(sc.mushroom(1.0), 262, -12);
  stand(sc.mushroom(0.85), 812, -12);
  stand(sc.flowerBed(58), 292, -10);
  stand(sc.flowerBed(46), 792, -10);

  /* ---------------------------- parallax sky ---------------------------- */

  const layers: { p: number; group: THREE.Group }[] = [];
  const layer = (p: number) => {
    const group = new THREE.Group();
    scene.add(group);
    layers.push({ p, group });
    return group;
  };

  const sunLayer = layer(0.06);
  const sunCard = sc.sun(36);
  sunLayer.add(sunCard.mesh);

  const birdLayer = layer(0.15);
  const flockA = sc.birds();
  flockA.billboard.place(320, 96);
  const flockB = sc.birds();
  flockB.billboard.place(760, 140);
  birdLayer.add(flockA.billboard.mesh, flockB.billboard.mesh);

  const cloudLayer = layer(0.2);
  for (const [x, y, s] of [
    [90, 58, 15],
    [470, 120, 11],
    [900, 48, 13],
    [1420, 96, 12],
  ] as const) {
    const c = sc.cloud(s);
    c.place(x, y);
    cloudLayer.add(c.mesh);
  }

  const islandLayer = layer(0.3);
  const islandA = sc.floatingIsland(150, [
    { kind: "ladder", dx: -8, dy: 12, len: 52 },
    { kind: "mushroom", dx: 40, dy: 0, s: 1.1 },
  ]);
  islandA.place(300, 128);
  const islandB = sc.floatingIsland(116, [{ kind: "tree", dx: 0, dy: 0, s: 0.6 }]);
  islandB.place(820, 84);
  const islandC = sc.floatingIsland(96);
  islandC.place(1280, 150);
  islandLayer.add(islandA.mesh, islandB.mesh, islandC.mesh);

  const farLayer = layer(0.35);
  const farM = sc.mountains(2040, true);
  farM.place(0, 306);
  farLayer.add(farM.mesh);

  const nearLayer = layer(0.55);
  const nearM = sc.mountains(2100, false);
  nearM.place(0, 348);
  nearLayer.add(nearM.mesh);

  // screen-fixed distant lake band behind the near hills' feet
  const backdrop = new sc.BackdropWater(D, 1200, VIEW_H, 352, 118);
  camera.add(backdrop.mesh);
  scene.add(camera);

  /* ------------------------------- wiring ------------------------------- */

  const theBoat = sc.boat();
  theBoat.place(1150, GROUND_Y + 34, 40);
  scene.add(theBoat.billboard.mesh);

  const layout = (viewW: number) => {
    for (const { p, group } of layers) layoutParallaxLayer(group, p, D, viewW, VIEW_H);
    sunCard.place(viewW * 0.83, 158);
  };

  const update = (t: number, camX: number, viewW: number) => {
    const sunScreenX = viewW * 0.83 - camX * 0.06;
    const sunWorldX = sunScreenX + camX;
    water.repaint(t, sunWorldX - 960);
    backdrop.repaint(t, sunScreenX, viewW);
    flockA.update(t);
    flockB.update(t);
    theBoat.update(t);
  };

  return { layout, update };
}
