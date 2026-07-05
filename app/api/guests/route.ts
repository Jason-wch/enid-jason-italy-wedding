import { NextResponse } from "next/server";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabaseServer";

/** Public-safe guest list for the guest map: name + character + position only. */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mock: true, error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("guests")
    .select("id, full_name, character, map_x, map_y")
    .eq("attending", "yes")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Guest list fetch failed:", error);
    return NextResponse.json({ error: "Could not load guests" }, { status: 500 });
  }

  // Map full_name -> name for the public-safe GuestChar shape.
  const guests = (data ?? []).map((g) => ({
    id: g.id,
    name: g.full_name,
    character: g.character,
    map_x: g.map_x,
    map_y: g.map_y,
  }));

  return NextResponse.json({ guests });
}
