import { NextResponse } from "next/server";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabaseServer";
import { normalizeName } from "@/lib/names";
import type { Guest, PartyWithGuests } from "@/lib/types";

/**
 * Look a guest up by full name and return their whole party so they can RSVP
 * for everyone in it. Matching is case/space-insensitive.
 */
export async function POST(req: Request) {
  let body: { name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = normalizeName(String(body.name ?? ""));
  if (!name) {
    return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    // Client falls back to the localStorage demo store.
    return NextResponse.json({ mock: true, error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = getServerSupabase();

  // Find the matching guest (case-insensitive on the full name).
  const { data: match, error: matchError } = await supabase
    .from("guests")
    .select("party_id")
    .ilike("full_name", name)
    .limit(1)
    .maybeSingle();

  if (matchError) {
    console.error("Lookup failed:", matchError);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
  if (!match) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: party, error: partyError } = await supabase
    .from("parties")
    .select("id, name, message, created_at")
    .eq("id", match.party_id)
    .single();

  const { data: guests, error: guestsError } = await supabase
    .from("guests")
    .select("*")
    .eq("party_id", match.party_id)
    .order("created_at", { ascending: true });

  if (partyError || guestsError || !party) {
    console.error("Lookup party fetch failed:", partyError ?? guestsError);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  const result: PartyWithGuests = { ...party, guests: (guests ?? []) as Guest[] };
  return NextResponse.json({ party: result });
}
