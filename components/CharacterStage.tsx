"use client";

/**
 * Mini 2.5D character stage for the RSVP builder: the guest's voxel
 * character idles on a floating grass tile while the camera sways gently to
 * show off the depth — MapleStory character-select energy in a 232px card.
 * Transparent canvas, so it sits on the builder's golden-hour arch niche.
 * Falls back to the flat CharacterSprite when WebGL isn't available.
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import CharacterSprite from "@/components/CharacterSprite";
import { normalizeCharacter, type CharacterConfig } from "@/lib/maple/characters";
import {
  addGoldenLights,
  CAM_FOV,
  camDistance,
  createRenderer,
  disposeObject,
} from "@/lib/maple3d/engine";
import { makeShadowQuad, VoxelCharacter } from "@/lib/maple3d/voxelChar";
import { makePlatform } from "@/lib/maple3d/tiles";

const W = 232;
const H = 260;
const SCALE = 9; // 16x22 sprite -> 144x198 px character
const FEET_Y = 218; // platform top line

type Props = { config: CharacterConfig };

export default function CharacterStage({ config }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const voxRef = useRef<VoxelCharacter | null>(null);
  const configRef = useRef(config);
  configRef.current = config;
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (fallback) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = createRenderer(canvas, { alpha: true });
    if (!renderer) {
      setFallback(true);
      return;
    }
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setFallback(true);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(W, H, false);

    const D = camDistance(H);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAM_FOV, W / H, 10, 4000);
    addGoldenLights(scene);

    const slab = makePlatform(150);
    slab.placeTop(W / 2 - 75, FEET_Y);
    scene.add(slab.mesh);

    const shadow = makeShadowQuad(11 * SCALE * 0.8);
    shadow.position.set(W / 2, -FEET_Y + 0.6, 1);
    scene.add(shadow);

    const vox = new VoxelCharacter(SCALE);
    vox.setConfig(normalizeCharacter(configRef.current));
    scene.add(vox.group);
    voxRef.current = vox;

    let raf = 0;
    const render = (t: number) => {
      const bob = (Math.sin(t / 480) + 1) * 0.5 * 4;
      vox.setFeet(W / 2, FEET_Y - bob);
      vox.setPose(false, 0, Math.floor(t / 190) % 24 === 0);

      camera.position.set(W / 2 + Math.sin(t / 1400) * 30, -H / 2, D);
      camera.lookAt(W / 2, -H / 2, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      voxRef.current = null;
      vox.dispose();
      disposeObject(scene);
      renderer.dispose();
    };
  }, [fallback]);

  // Live-update the voxels as the builder cycles options.
  useEffect(() => {
    voxRef.current?.setConfig(normalizeCharacter(config));
  }, [config]);

  if (fallback) return <CharacterSprite config={config} scale={7} />;

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="block"
      style={{ width: W, height: H }}
      aria-label="Character preview"
    />
  );
}
