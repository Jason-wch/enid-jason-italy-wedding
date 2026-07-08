import type { CharacterConfig } from "@/lib/maple/characters";

/** null = not yet responded. */
export type Attending = "yes" | "no" | null;

/** An invited household / group. */
export type Party = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

/** An individual invited guest, belonging to a party. */
export type Guest = {
  id: string;
  party_id: string;
  full_name: string;
  email: string;
  attending: Attending;
  driving: boolean;
  dietary: string;
  character: CharacterConfig;
  map_x: number;
  map_y: number;
  responded_at: string | null;
  created_at: string;
};

/** A party together with all of its guests (used by lookup + admin). */
export type PartyWithGuests = Party & {
  guests: Guest[];
};

/** One guest's answers, submitted as part of a party RSVP. */
export type GuestResponse = {
  guestId: string;
  attending: Exclude<Attending, null>;
  email: string;
  driving: boolean;
  dietary: string;
  character: CharacterConfig;
};

/** Payload posted from the RSVP page for a whole party. */
export type RsvpSubmission = {
  partyId: string;
  message: string;
  responses: GuestResponse[];
};

/** Public-safe subset shown on the guest map. */
export type GuestChar = {
  id: string;
  name: string;
  character: CharacterConfig;
  map_x: number;
  map_y: number;
};
