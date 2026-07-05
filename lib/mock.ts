"use client";

/**
 * LocalStorage-backed mock guest list so the whole site works before Supabase
 * credentials are configured. API routes return 503 + {mock: true} when
 * unconfigured, and clients fall back to this store.
 */

import { normalizeName } from "@/lib/names";
import { DEFAULT_CHARACTER } from "@/lib/pixel/sprites";
import type {
  GuestChar,
  Guest,
  Party,
  PartyWithGuests,
  RsvpSubmission,
} from "@/lib/types";

const PARTIES_KEY = "ej-mock-parties";
const GUESTS_KEY = "ej-mock-guests";

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

const SEED_PARTIES: Party[] = [
  {
    id: "party-rossi",
    name: "The Rossi Family",
    message: "Auguri! We can't wait.",
    created_at: new Date("2026-06-01T10:00:00Z").toISOString(),
  },
  {
    id: "party-smith",
    name: "Marco & Guest",
    message: "",
    created_at: new Date("2026-06-03T18:30:00Z").toISOString(),
  },
];

const SEED_GUESTS: Guest[] = [
  {
    id: "guest-rosa",
    party_id: "party-rossi",
    full_name: "Rosa Rossi",
    attending: "yes",
    dietary: "",
    character: { skin: 1, hairStyle: 3, hairColor: 0, outfit: 1, outfitColor: 4 },
    map_x: 0.22,
    map_y: 0.4,
    responded_at: new Date("2026-06-01T10:00:00Z").toISOString(),
    created_at: new Date("2026-06-01T10:00:00Z").toISOString(),
  },
  {
    id: "guest-luca",
    party_id: "party-rossi",
    full_name: "Luca Rossi",
    attending: "yes",
    dietary: "Vegetarian",
    character: { skin: 2, hairStyle: 4, hairColor: 1, outfit: 2, outfitColor: 2 },
    map_x: 0.3,
    map_y: 0.55,
    responded_at: new Date("2026-06-01T10:00:00Z").toISOString(),
    created_at: new Date("2026-06-01T10:05:00Z").toISOString(),
  },
  {
    id: "guest-marco",
    party_id: "party-smith",
    full_name: "Marco Bianchi",
    attending: null,
    dietary: "",
    character: { ...DEFAULT_CHARACTER },
    map_x: 0.62,
    map_y: 0.7,
    responded_at: null,
    created_at: new Date("2026-06-03T18:30:00Z").toISOString(),
  },
  {
    id: "guest-plusone",
    party_id: "party-smith",
    full_name: "Guest of Marco",
    attending: null,
    dietary: "",
    character: { ...DEFAULT_CHARACTER },
    map_x: 0.7,
    map_y: 0.6,
    responded_at: null,
    created_at: new Date("2026-06-03T18:31:00Z").toISOString(),
  },
];

function read<T>(key: string, seed: T[]): T[] {
  if (typeof window === "undefined") return [...seed];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(seed));
      return [...seed];
    }
    return JSON.parse(raw) as T[];
  } catch {
    return [...seed];
  }
}

function writeParties(parties: Party[]): void {
  window.localStorage.setItem(PARTIES_KEY, JSON.stringify(parties));
}
function writeGuests(guests: Guest[]): void {
  window.localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));
}

function allParties(): Party[] {
  return read(PARTIES_KEY, SEED_PARTIES);
}
function allGuests(): Guest[] {
  return read(GUESTS_KEY, SEED_GUESTS);
}

/** Party + guests, used by admin. */
export function mockParties(): PartyWithGuests[] {
  const guests = allGuests();
  return allParties().map((p) => ({
    ...p,
    guests: guests.filter((g) => g.party_id === p.id),
  }));
}

/** Look a guest up by name and return their party. */
export function mockLookup(name: string): PartyWithGuests | null {
  const norm = normalizeName(name);
  const guest = allGuests().find((g) => normalizeName(g.full_name) === norm);
  if (!guest) return null;
  const party = allParties().find((p) => p.id === guest.party_id);
  if (!party) return null;
  return { ...party, guests: allGuests().filter((g) => g.party_id === party.id) };
}

/** Save a whole party's RSVP. */
export function mockSubmit(submission: RsvpSubmission): void {
  const guests = allGuests().map((g) => {
    const r = submission.responses.find((x) => x.guestId === g.id);
    if (!r) return g;
    return {
      ...g,
      attending: r.attending,
      dietary: r.dietary,
      character: r.character,
      responded_at: new Date().toISOString(),
    };
  });
  writeGuests(guests);
  const parties = allParties().map((p) =>
    p.id === submission.partyId ? { ...p, message: submission.message } : p
  );
  writeParties(parties);
}

/** Attending guests for the guest map. */
export function mockGuests(): GuestChar[] {
  return allGuests()
    .filter((g) => g.attending === "yes")
    .map(({ id, full_name, character, map_x, map_y }) => ({
      id,
      name: full_name,
      character,
      map_x,
      map_y,
    }));
}

export function mockAddParty(name: string, guestNames: string[]): void {
  const party: Party = {
    id: uid("party"),
    name: name.trim(),
    message: "",
    created_at: new Date().toISOString(),
  };
  writeParties([...allParties(), party]);
  const newGuests: Guest[] = guestNames
    .map((n) => n.trim())
    .filter(Boolean)
    .map((full_name) => ({
      id: uid("guest"),
      party_id: party.id,
      full_name,
      attending: null,
      dietary: "",
      character: { ...DEFAULT_CHARACTER },
      map_x: Math.random(),
      map_y: Math.random(),
      responded_at: null,
      created_at: new Date().toISOString(),
    }));
  if (newGuests.length) writeGuests([...allGuests(), ...newGuests]);
}

export function mockAddGuest(partyId: string, fullName: string): void {
  const guest: Guest = {
    id: uid("guest"),
    party_id: partyId,
    full_name: fullName.trim(),
    attending: null,
    dietary: "",
    character: { ...DEFAULT_CHARACTER },
    map_x: Math.random(),
    map_y: Math.random(),
    responded_at: null,
    created_at: new Date().toISOString(),
  };
  writeGuests([...allGuests(), guest]);
}

export function mockUpdateParty(id: string, patch: Partial<Party>): void {
  writeParties(allParties().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export function mockUpdateGuest(id: string, patch: Partial<Guest>): void {
  writeGuests(allGuests().map((g) => (g.id === id ? { ...g, ...patch } : g)));
}

export function mockDeleteParty(id: string): void {
  writeParties(allParties().filter((p) => p.id !== id));
  writeGuests(allGuests().filter((g) => g.party_id !== id));
}

export function mockDeleteGuest(id: string): void {
  writeGuests(allGuests().filter((g) => g.id !== id));
}
