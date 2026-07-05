import type { CharacterConfig } from "@/lib/pixel/sprites";

export type Attending = "yes" | "no";

export type RsvpInput = {
  name: string;
  email: string;
  attending: Attending;
  guests_count: number;
  dietary: string;
  message: string;
  character: CharacterConfig;
};

export type RsvpRow = RsvpInput & {
  id: string;
  map_x: number;
  map_y: number;
  created_at: string;
};

/** Public-safe subset shown on the guest map. */
export type GuestChar = {
  id: string;
  name: string;
  character: CharacterConfig;
  map_x: number;
  map_y: number;
};
