"use client";

import { useEffect, useState } from "react";
import { WEDDING } from "@/lib/wedding";

function diffParts(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

export default function Countdown() {
  const target = new Date(WEDDING.startDateISO).getTime();
  const [parts, setParts] = useState<ReturnType<typeof diffParts> | null>(null);

  useEffect(() => {
    setParts(diffParts(target));
    const id = setInterval(() => setParts(diffParts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells = [
    { label: "DAYS", value: parts?.days },
    { label: "HOURS", value: parts?.hours },
    { label: "MINS", value: parts?.minutes },
    { label: "SECS", value: parts?.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-5 justify-center">
      {cells.map((c) => (
        <div
          key={c.label}
          className="bg-cream/90 border-2 border-gold/40 rounded-xl px-3 sm:px-5 py-3 text-center min-w-[72px] shadow-sm"
        >
          <div className="font-pixel text-lg sm:text-2xl text-sage-dark tabular-nums">
            {c.value === undefined ? "--" : String(c.value).padStart(2, "0")}
          </div>
          <div className="font-pixel text-xs mt-2 text-ink/50">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
