"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MusicToggle } from "@/components/MusicProvider";
import { WEDDING } from "@/lib/wedding";

const LINKS = [
  { href: "/home", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/guests", label: "Guest Map" },
  { href: "/faq", label: "FAQ" },
  { href: "/dress-code", label: "Dress Code" },
  { href: "/registry", label: "Registry" },
];

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // The welcome minigame is fullscreen with its own overlay controls.
  if (pathname === "/") {
    return (
      <>
        {children}
        <div className="fixed top-3 left-3 z-50">
          <MusicToggle />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <Link href="/home" className="text-2xl font-semibold tracking-wide text-sage-dark">
            {WEDDING.couple}
          </Link>
          <nav className="flex items-center gap-1 flex-wrap text-base ml-auto">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  pathname === l.href
                    ? "bg-sage text-cream"
                    : "hover:bg-parchment text-ink/80"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <MusicToggle className="ml-2" />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-ink/10 py-8 text-center text-ink/60">
        <p className="text-lg">
          {WEDDING.couple} · {WEDDING.dates} · {WEDDING.venue}
        </p>
        <p className="font-pixel text-xs mt-3 text-ink/40">
          made with ♥ (and a little pixel magic)
        </p>
      </footer>
    </div>
  );
}
