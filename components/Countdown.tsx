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
    <div className="inline-flex items-baseline gap-4">
      <span className="font-heading text-6xl sm:text-7xl leading-none tabular-nums">
        {days === null ? "—" : days}
      </span>
      <span className="text-[0.72rem] tracking-[0.4em] uppercase opacity-80">
        {days === 1 ? "day to go" : "days to go"}
      </span>
    </div>
  );
}
