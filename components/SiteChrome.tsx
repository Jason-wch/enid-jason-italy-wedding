"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { MusicToggle } from "@/components/MusicProvider";
import { WEDDING } from "@/lib/wedding";
import { Monogram, OliveBranch, LakeScene } from "@/components/decor";

const LINKS = [
  { href: "/home", label: "Home", it: "benvenuti" },
  { href: "/schedule", label: "Schedule", it: "il programma" },
  { href: "/rsvp", label: "RSVP", it: "ci sarete?" },
  { href: "/guests", label: "Guest Map", it: "gli ospiti" },
  { href: "/faq", label: "FAQ", it: "domande" },
  { href: "/dress-code", label: "Dress Code", it: "l'eleganza" },
  { href: "/registry", label: "Registry", it: "i regali" },
];

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on navigation and lock scroll while it is open.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center py-3">
            <p className="hidden sm:block text-[0.7rem] tracking-[0.35em] uppercase text-ink/50">
              {WEDDING.dates}
            </p>
            <button
              className="sm:hidden justify-self-start text-[0.72rem] tracking-[0.3em] uppercase text-ink/70 hover:text-ink py-2 pr-4 cursor-pointer"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              Menu
            </button>
            <Link
              href="/home"
              aria-label="Home — Enid & Jason"
              className="justify-self-center text-verde hover:text-verde-deep transition-colors"
            >
              <Monogram size={40} />
            </Link>
            <div className="flex items-center justify-end gap-4">
              <Link
                href="/rsvp"
                className="hidden sm:inline text-[0.7rem] tracking-[0.3em] uppercase text-terracotta hover:text-ink transition-colors"
              >
                RSVP
              </Link>
              <MusicToggle />
            </div>
          </div>
          <nav className="hidden sm:flex items-center justify-center gap-x-6 pb-3">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`group relative text-[0.72rem] tracking-[0.28em] uppercase py-1 transition-colors ${
                    active ? "text-ink" : "text-ink/50 hover:text-ink"
                  }`}
                >
                  <span
                    className={`absolute -left-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-limone transition-opacity duration-300 ${
                      active ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                    }`}
                  />
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
        <div className="stripe-band" style={{ height: 5 }} />
      </header>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-verde-deep text-cream flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-[0.7rem] tracking-[0.35em] uppercase text-cream/60">
              {WEDDING.dates}
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="text-2xl leading-none px-3 py-1 text-cream/80 hover:text-cream cursor-pointer"
            >
              ×
            </button>
          </div>
          <div className="flex justify-center text-cream/90">
            <Monogram size={52} />
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-6 py-10">
            {LINKS.map((l, i) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-center animate-hero-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span
                    className={`font-heading text-[2rem] leading-tight transition-colors ${
                      active ? "text-limone" : "text-cream hover:text-limone"
                    }`}
                  >
                    {l.label}
                  </span>
                  <span className="block text-sm italic text-cream/50">{l.it}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-end justify-between px-4 pb-4 text-cream/40">
            <OliveBranch width={90} />
            <OliveBranch width={90} mirror />
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>

      <footer className="mt-24 scallop-top bg-verde-deep text-cream [--scallop-color:var(--color-verde-deep)]">
        <div className="relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 text-cream opacity-15 pointer-events-none flex justify-center">
            <LakeScene className="w-[52rem] max-w-none" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-14 text-center">
            <div className="flex justify-center text-cream/90">
              <Monogram size={54} />
            </div>
            <p className="font-heading text-4xl sm:text-6xl mt-8">
              Enid <span className="display-italic text-limone">&amp;</span> Jason
            </p>
            <p className="mt-5 text-lg italic text-cream/70">
              {WEDDING.dates} · {WEDDING.venue}
            </p>
            <p className="mt-1 text-base text-cream/50">{WEDDING.location}</p>
            <p className="eyebrow mt-10 !text-limone">Ci vediamo sul lago ♥</p>
            <div className="hairline max-w-24 mx-auto mt-10 !bg-cream/20" />
            <p className="mt-6 text-sm tracking-[0.3em] uppercase text-cream/35">
              Fatto con amore — e un po&apos; di magia pixel
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
