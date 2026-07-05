import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Site-wide password gate. Every page (and API route) requires a valid access
 * cookie; visitors without it are sent to /enter. The password is read from the
 * SITE_PASSWORD env var (falls back to "garda2027" if unset).
 */
export function middleware(req: NextRequest) {
  const expected = process.env.SITE_PASSWORD || "garda2027";
  const token = req.cookies.get("ej-site-access")?.value;
  if (token === expected) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/enter";
  url.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Gate everything except the unlock page/route, Next internals and static files.
  matcher: ["/((?!_next|api/enter|enter|favicon.ico|.*\\..*).*)"],
};
