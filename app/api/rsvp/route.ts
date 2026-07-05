import { NextResponse } from "next/server";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabaseServer";
import { normalizeCharacter } from "@/lib/pixel/sprites";

/**
 * Submit RSVPs for a whole party. Updates each guest row in the party with
 * their attending status, dietary needs and pixel character, and stores the
 * party's message. Validates that every guest belongs to the given party.
 */
export async function POST(req: Request) {
  let body: {
    partyId?: unknown;
    message?: unknown;
    responses?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const partyId = String(body.partyId ?? "").trim();
  const message = String(body.message ?? "").slice(0, 1000);
  const responses = Array.isArray(body.responses) ? body.responses : [];

  if (!partyId) {
    return NextResponse.json({ error: "Missing party" }, { status: 400 });
  }
  if (responses.length === 0) {
    return NextResponse.json({ error: "No guests to save" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    // Client falls back to the localStorage demo store.
    return NextResponse.json({ mock: true, error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = getServerSupabase();

  // Confirm which guest ids actually belong to this party.
  const { data: partyGuests, error: fetchError } = await supabase
    .from("guests")
    .select("id")
    .eq("party_id", partyId);

  if (fetchError || !partyGuests) {
    console.error("RSVP party fetch failed:", fetchError);
    return NextResponse.json({ error: "Could not save RSVP" }, { status: 500 });
  }
  const validIds = new Set(partyGuests.map((g) => g.id));
  const now = new Date().toISOString();

  for (const raw of responses) {
    const r = raw as Record<string, unknown>;
    const guestId = String(r.guestId ?? "");
    if (!validIds.has(guestId)) continue;

    const attending = r.attending === "no" ? "no" : "yes";
    const dietary = String(r.dietary ?? "").slice(0, 500);
    const character = normalizeCharacter(r.character);

    const { error } = await supabase
      .from("guests")
      .update({ attending, dietary, character, responded_at: now })
      .eq("id", guestId);

    if (error) {
      console.error("RSVP guest update failed:", error);
      return NextResponse.json({ error: "Could not save RSVP" }, { status: 500 });
    }
  }

  const { error: msgError } = await supabase
    .from("parties")
    .update({ message })
    .eq("id", partyId);
  if (msgError) {
    console.error("RSVP message update failed:", msgError);
  }

  // Notify guest-map viewers over Realtime Broadcast (public channel).
  try {
    const channel = supabase.channel("guest-map");
    await channel.send({ type: "broadcast", event: "rsvp", payload: { partyId } });
    await supabase.removeChannel(channel);
  } catch (e) {
    console.warn("Broadcast failed (non-fatal):", e);
  }

  return NextResponse.json({ ok: true });
}
