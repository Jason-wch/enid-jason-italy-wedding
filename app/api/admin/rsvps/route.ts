import { NextResponse } from "next/server";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabaseServer";

function checkPassword(req: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD || "sostaga2027";
  return req.headers.get("x-admin-password") === expected;
}

export async function GET(req: Request) {
  if (!checkPassword(req)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mock: true, error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("rsvps")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin fetch failed:", error);
    return NextResponse.json({ error: "Could not load RSVPs" }, { status: 500 });
  }
  return NextResponse.json({ rsvps: data ?? [] });
}

const EDITABLE = new Set(["name", "email", "attending", "guests_count", "dietary", "message"]);

export async function PATCH(req: Request) {
  if (!checkPassword(req)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mock: true, error: "Supabase not configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as {
    id?: string;
    patch?: Record<string, unknown>;
  } | null;
  if (!body?.id || !body.patch) {
    return NextResponse.json({ error: "id and patch are required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body.patch)) {
    if (EDITABLE.has(k)) patch[k] = v;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No editable fields in patch" }, { status: 400 });
  }

  const supabase = getServerSupabase();
  const { error } = await supabase.from("rsvps").update(patch).eq("id", body.id);
  if (error) {
    console.error("Admin update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
