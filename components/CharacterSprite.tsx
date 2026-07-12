"use client";

import { useEffect, useRef } from "react";
import {
  drawCharacter,
  SPRITE_H,
  SPRITE_W,
  type CharacterConfig,
} from "@/lib/maple/characters";

type Props = {
  config: CharacterConfig;
  /** Unit size in CSS px. The sprite box is 16*scale x 22*scale. */
  scale?: number;
  animate?: boolean;
  className?: string;
};

/** Renders a single character on a small canvas, with an idle bob + blink. */
export default function CharacterSprite({ config, scale = 6, animate = true, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Render at 2x so texels land on whole device pixels on retina screens.
    const RES = 2;
    canvas.width = SPRITE_W * scale * RES;
    canvas.height = (SPRITE_H * scale + scale) * RES;

    const drawFrame = (t: number) => {
      ctx.setTransform(RES, 0, 0, RES, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bob = animate ? (Math.sin(t / 480) + 1) * 0.5 * scale : 0;
      drawCharacter(ctx, configRef.current, {
        x: 0,
        y: bob,
        scale,
        frame: "stand",
        blink: animate && Math.floor(t / 180) % 22 === 0,
      });
    };

    let raf = 0;
    const render = (t: number) => {
      drawFrame(t);
      raf = requestAnimationFrame(render);
    };

    if (animate) {
      raf = requestAnimationFrame(render);
      return () => cancelAnimationFrame(raf);
    }
    drawFrame(0);
  }, [scale, animate, config]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: SPRITE_W * scale, height: SPRITE_H * scale + scale, imageRendering: "pixelated" }}
      className={className}
    />
  );
}
