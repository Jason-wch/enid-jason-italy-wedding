"use client";

import { useEffect, useState } from "react";
import { WEDDING } from "@/lib/wedding";

function daysUntil(target: number) {
  const ms = Math.max(0, target - Date.now());
  return Math.floor(ms / 86400000);
}

export default function Countdown() {
  const target = new Date(WEDDING.startDateISO).getTime();
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysUntil(target));
    const id = setInterval(() => setDays(daysUntil(target)), 60000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="flex justify-center">
      <div className="bg-cream/90 border-2 border-gold/40 rounded-xl px-6 sm:px-8 py-4 text-center min-w-[120px] shadow-sm">
        <div className="font-pixel text-2xl sm:text-4xl text-sage-dark tabular-nums">
          {days === null ? "--" : days}
        </div>
        <div className="font-pixel text-xs mt-2 text-ink/50">
          {days === 1 ? "DAY TO GO" : "DAYS TO GO"}
        </div>
      </div>
    </div>
  );
}
