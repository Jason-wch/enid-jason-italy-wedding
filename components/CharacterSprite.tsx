"use client";

import { useEffect, useRef } from "react";
import {
  drawCharacter,
  SPRITE_H,
  SPRITE_W,
  type CharacterConfig,
} from "@/lib/pixel/sprites";

type Props = {
  config: CharacterConfig;
  /** Pixel size of one sprite cell. Canvas is 16*scale x 22*scale. */
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
    ctx.imageSmoothingEnabled = false;

    let raf = 0;
    const render = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bob = animate && Math.floor(t / 500) % 2 === 1 ? scale : 0;
      drawCharacter(ctx, configRef.current, {
        x: 0,
        y: bob,
        scale,
        frame: "stand",
        blink: animate && Math.floor(t / 180) % 22 === 0,
      });
      raf = requestAnimationFrame(render);
    };

    if (animate) {
      raf = requestAnimationFrame(render);
      return () => cancelAnimationFrame(raf);
    }
    drawCharacter(ctx, configRef.current, { x: 0, y: 0, scale, frame: "stand" });
  }, [scale, animate, config]);

  return (
    <canvas
      ref={canvasRef}
      width={SPRITE_W * scale}
      height={SPRITE_H * scale + scale}
      className={`pixelated ${className ?? ""}`}
    />
  );
}
