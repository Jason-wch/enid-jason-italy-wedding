import { NextResponse } from "next/server";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabaseServer";

/** Public-safe guest list for the guest map: name + character + position only. */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mock: true, error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("rsvps")
    .select("id, name, character, map_x, map_y")
    .eq("attending", "yes")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Guest list fetch failed:", error);
    return NextResponse.json({ error: "Could not load guests" }, { status: 500 });
  }

  return NextResponse.json({ guests: data ?? [] });
}
