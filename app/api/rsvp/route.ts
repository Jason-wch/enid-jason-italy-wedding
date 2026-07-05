import { NextResponse } from "next/server";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabaseServer";
import { normalizeCharacter } from "@/lib/pixel/sprites";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 80);
  const email = String(body.email ?? "").trim().slice(0, 120);
  const attending = body.attending === "no" ? "no" : "yes";
  const guests_count = Math.min(10, Math.max(1, Number(body.guests_count) || 1));
  const dietary = String(body.dietary ?? "").slice(0, 500);
  const message = String(body.message ?? "").slice(0, 1000);
  const character = normalizeCharacter(body.character);

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    // Client falls back to the localStorage mock store.
    return NextResponse.json({ mock: true, error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = getServerSupabase();
  const row = {
    name,
    email,
    attending,
    guests_count,
    dietary,
    message,
    character,
    map_x: Math.random(),
    map_y: Math.random(),
  };

  const { data, error } = await supabase
    .from("rsvps")
    .insert(row)
    .select("id, name, attending, character, map_x, map_y")
    .single();

  if (error) {
    console.error("RSVP insert failed:", error);
    return NextResponse.json({ error: "Could not save RSVP" }, { status: 500 });
  }

  // Notify guest-map viewers over Realtime Broadcast (public channel).
  try {
    const channel = supabase.channel("guest-map");
    await channel.send({
      type: "broadcast",
      event: "rsvp",
      payload: { id: data.id, name: data.name },
    });
    await supabase.removeChannel(channel);
  } catch (e) {
    console.warn("Broadcast failed (non-fatal):", e);
  }

  return NextResponse.json({ ok: true, guest: data });
}
