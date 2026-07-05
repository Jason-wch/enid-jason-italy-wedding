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

  // The password gate is a standalone fullscreen page with no site chrome.
  if (pathname === "/enter") {
    return <>{children}</>;
  }

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
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <p className="hidden sm:block text-[0.7rem] tracking-[0.35em] uppercase text-ink/50 w-40">
              {WEDDING.dates}
            </p>
            <Link
              href="/home"
              className="font-heading text-2xl sm:text-[1.7rem] tracking-[0.18em] text-ink hover:text-sage-dark transition-colors"
            >
              E&nbsp;<span className="text-gold">&amp;</span>&nbsp;J
            </Link>
            <div className="hidden sm:flex items-center justify-end gap-3 w-40">
              <MusicToggle />
            </div>
            <div className="sm:hidden">
              <MusicToggle />
            </div>
          </div>
          <nav className="flex items-center justify-center gap-x-5 gap-y-1 flex-wrap pb-3 -mt-1">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative text-[0.72rem] tracking-[0.28em] uppercase py-1 transition-colors ${
                    active ? "text-ink" : "text-ink/50 hover:text-ink"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute left-0 -bottom-px h-px bg-gold transition-all duration-500 ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 border-t border-ink/10 bg-parchment/60">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="eyebrow eyebrow-rule">Con amore</p>
          <p className="font-heading text-4xl sm:text-6xl mt-6 text-ink">
            Enid <span className="text-gold">&amp;</span> Jason
          </p>
          <p className="mt-5 text-lg italic text-ink/60">
            {WEDDING.dates} · {WEDDING.venue}
          </p>
          <p className="mt-1 text-base text-ink/45">{WEDDING.location}</p>
          <div className="hairline max-w-24 mx-auto mt-10" />
          <p className="mt-6 text-sm tracking-[0.3em] uppercase text-ink/35">
            Made with amore · e un po&apos; di magia pixel
          </p>
        </div>
      </footer>
    </div>
  );
}
