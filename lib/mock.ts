"use client";

/**
 * LocalStorage-backed mock RSVP store so the whole site works before
 * Supabase credentials are configured. API routes return 503 + {mock: true}
 * when unconfigured, and clients fall back to this store.
 */

import type { GuestChar, RsvpInput, RsvpRow } from "@/lib/types";

const KEY = "ej-mock-rsvps";

const SEED: RsvpRow[] = [
  {
    id: "seed-1",
    name: "Nonna Rosa",
    email: "rosa@example.com",
    attending: "yes",
    guests_count: 1,
    dietary: "",
    message: "Auguri!",
    character: { skin: 1, hairStyle: 3, hairColor: 0, outfit: 1, outfitColor: 4 },
    map_x: 0.22,
    map_y: 0.4,
    created_at: new Date("2026-06-01T10:00:00Z").toISOString(),
  },
  {
    id: "seed-2",
    name: "Marco",
    email: "marco@example.com",
    attending: "yes",
    guests_count: 2,
    dietary: "Vegetarian",
    message: "Can't wait to see the lake!",
    character: { skin: 2, hairStyle: 4, hairColor: 1, outfit: 2, outfitColor: 2 },
    map_x: 0.62,
    map_y: 0.7,
    created_at: new Date("2026-06-03T18:30:00Z").toISOString(),
  },
];

export function mockAll(): RsvpRow[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED));
      return [...SEED];
    }
    return JSON.parse(raw) as RsvpRow[];
  } catch {
    return [...SEED];
  }
}

export function mockInsert(input: RsvpInput): RsvpRow {
  const row: RsvpRow = {
    ...input,
    id: `local-${Date.now()}`,
    map_x: Math.random(),
    map_y: Math.random(),
    created_at: new Date().toISOString(),
  };
  const all = mockAll();
  all.push(row);
  window.localStorage.setItem(KEY, JSON.stringify(all));
  return row;
}

export function mockUpdate(id: string, patch: Partial<RsvpRow>): void {
  const all = mockAll().map((r) => (r.id === id ? { ...r, ...patch } : r));
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function mockGuests(): GuestChar[] {
  return mockAll()
    .filter((r) => r.attending === "yes")
    .map(({ id, name, character, map_x, map_y }) => ({ id, name, character, map_x, map_y }));
}
