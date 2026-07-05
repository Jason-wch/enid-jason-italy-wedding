import { NextResponse } from "next/server";

/** Verify the site password and, on success, set the access cookie. */
export async function POST(req: Request) {
  const expected = process.env.SITE_PASSWORD || "garda2027";
  const body = (await req.json().catch(() => ({}))) as { password?: unknown };

  if (String(body.password ?? "") !== expected) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("ej-site-access", expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 120, // 120 days
  });
  return res;
}
