import { NextResponse } from "next/server";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabaseServer";
import type { Guest, Party, PartyWithGuests } from "@/lib/types";

function checkPassword(req: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD || "sostaga2027";
  return req.headers.get("x-admin-password") === expected;
}

function unauthorized() {
  return NextResponse.json({ error: "Wrong password" }, { status: 401 });
}

function notConfigured() {
  return NextResponse.json({ mock: true, error: "Supabase not configured" }, { status: 503 });
}

/** List all parties with their guests. */
export async function GET(req: Request) {
  if (!checkPassword(req)) return unauthorized();
  if (!isSupabaseConfigured()) return notConfigured();

  const supabase = getServerSupabase();
  const [{ data: parties, error: pErr }, { data: guests, error: gErr }] = await Promise.all([
    supabase.from("parties").select("*").order("created_at", { ascending: true }),
    supabase.from("guests").select("*").order("created_at", { ascending: true }),
  ]);

  if (pErr || gErr) {
    console.error("Admin parties fetch failed:", pErr ?? gErr);
    return NextResponse.json({ error: "Could not load guest list" }, { status: 500 });
  }

  const byParty = new Map<string, Guest[]>();
  for (const g of (guests ?? []) as Guest[]) {
    const list = byParty.get(g.party_id) ?? [];
    list.push(g);
    byParty.set(g.party_id, list);
  }
  const result: PartyWithGuests[] = ((parties ?? []) as Party[]).map((p) => ({
    ...p,
    guests: byParty.get(p.id) ?? [],
  }));

  return NextResponse.json({ parties: result });
}

/** Create a party with an initial set of guest names. */
export async function POST(req: Request) {
  if (!checkPassword(req)) return unauthorized();
  if (!isSupabaseConfigured()) return notConfigured();

  const body = (await req.json().catch(() => null)) as {
    name?: string;
    guestNames?: unknown;
  } | null;

  const name = String(body?.name ?? "").trim().slice(0, 120);
  if (!name) {
    return NextResponse.json({ error: "Party name is required" }, { status: 400 });
  }
  const guestNames = Array.isArray(body?.guestNames)
    ? body!.guestNames.map((n) => String(n).trim().slice(0, 80)).filter(Boolean)
    : [];

  const supabase = getServerSupabase();
  const { data: party, error: pErr } = await supabase
    .from("parties")
    .insert({ name })
    .select("*")
    .single();

  if (pErr || !party) {
    console.error("Create party failed:", pErr);
    return NextResponse.json({ error: "Could not create party" }, { status: 500 });
  }

  if (guestNames.length > 0) {
    const rows = guestNames.map((full_name) => ({ party_id: party.id, full_name }));
    const { error: gErr } = await supabase.from("guests").insert(rows);
    if (gErr) {
      console.error("Create guests failed:", gErr);
      return NextResponse.json({ error: "Party created but guests failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, id: party.id });
}

const PARTY_FIELDS = new Set(["name", "message"]);
const GUEST_FIELDS = new Set(["full_name", "email", "attending", "driving", "dietary"]);

/** Edit a party or a single guest, or add a guest to a party. */
export async function PATCH(req: Request) {
  if (!checkPassword(req)) return unauthorized();
  if (!isSupabaseConfigured()) return notConfigured();

  const body = (await req.json().catch(() => null)) as {
    partyId?: string;
    guestId?: string;
    addGuestName?: string;
    patch?: Record<string, unknown>;
  } | null;

  const supabase = getServerSupabase();

  // Add a new guest to an existing party.
  if (body?.partyId && body.addGuestName) {
    const full_name = String(body.addGuestName).trim().slice(0, 80);
    if (!full_name) {
      return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
    }
    const { error } = await supabase
      .from("guests")
      .insert({ party_id: body.partyId, full_name });
    if (error) {
      console.error("Add guest failed:", error);
      return NextResponse.json({ error: "Could not add guest" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (!body?.patch) {
    return NextResponse.json({ error: "patch is required" }, { status: 400 });
  }

  if (body.guestId) {
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body.patch)) {
      if (GUEST_FIELDS.has(k)) patch[k] = v === "" && k === "attending" ? null : v;
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No editable guest fields" }, { status: 400 });
    }
    const { error } = await supabase.from("guests").update(patch).eq("id", body.guestId);
    if (error) {
      console.error("Update guest failed:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.partyId) {
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body.patch)) {
      if (PARTY_FIELDS.has(k)) patch[k] = v;
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No editable party fields" }, { status: 400 });
    }
    const { error } = await supabase.from("parties").update(patch).eq("id", body.partyId);
    if (error) {
      console.error("Update party failed:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "partyId or guestId is required" }, { status: 400 });
}

/** Delete a whole party (cascades to its guests) or a single guest. */
export async function DELETE(req: Request) {
  if (!checkPassword(req)) return unauthorized();
  if (!isSupabaseConfigured()) return notConfigured();

  const body = (await req.json().catch(() => null)) as {
    partyId?: string;
    guestId?: string;
  } | null;

  const supabase = getServerSupabase();

  if (body?.guestId) {
    const { error } = await supabase.from("guests").delete().eq("id", body.guestId);
    if (error) {
      console.error("Delete guest failed:", error);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }
  if (body?.partyId) {
    const { error } = await supabase.from("parties").delete().eq("id", body.partyId);
    if (error) {
      console.error("Delete party failed:", error);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "partyId or guestId is required" }, { status: 400 });
}
