"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { MusicToggle } from "@/components/MusicProvider";
import { WEDDING } from "@/lib/wedding";
import Logo, { LogoMark } from "@/components/decor/Logo";

const LINKS = [
  { href: "/home", label: "Home", sub: "welcome" },
  { href: "/schedule", label: "Schedule", sub: "the program" },
  { href: "/rsvp", label: "RSVP", sub: "will you be there?" },
  { href: "/guests", label: "Guest Map", sub: "the guests" },
  { href: "/faq", label: "FAQ", sub: "questions" },
  { href: "/dress-code", label: "Dress Code", sub: "what to wear" },
  { href: "/registry", label: "Registry", sub: "the gifts" },
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
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-3">
            <div className="justify-self-start">
              <span
                className="hidden sm:block font-sans text-[0.62rem] font-medium tracking-[0.28em] uppercase text-stone"
                style={{ textIndent: "0.28em" }}
              >
                {WEDDING.dates}
              </span>
              <button
                className="sm:hidden font-sans text-[0.66rem] font-medium tracking-[0.28em] uppercase text-ink/80 hover:text-ink py-2 pr-4 cursor-pointer"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                Menu
              </button>
            </div>
            <Link href="/home" aria-label="Home — Enid & Jason" className="justify-self-center">
              <Logo markSize={30} />
            </Link>
            <div className="justify-self-end flex items-center gap-5">
              <Link
                href="/rsvp"
                className="hidden sm:block font-sans text-[0.66rem] font-medium tracking-[0.28em] uppercase text-ink hover:text-stone transition-colors"
              >
                RSVP
              </Link>
              <MusicToggle />
            </div>
          </div>
          <nav className="hidden sm:flex items-center justify-center gap-x-7 pb-3">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative font-sans text-[0.64rem] font-medium tracking-[0.24em] uppercase py-1 transition-colors ${
                    active ? "text-ink" : "text-stone hover:text-ink"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute left-0 -bottom-px h-px bg-ink transition-all duration-500 ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-cream flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
            <span
              className="font-sans text-[0.6rem] font-medium tracking-[0.28em] uppercase text-stone"
              style={{ textIndent: "0.28em" }}
            >
              {WEDDING.dates}
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="font-sans text-[0.66rem] font-medium tracking-[0.28em] uppercase text-ink/70 hover:text-ink px-2 py-1 cursor-pointer"
            >
              Close ×
            </button>
          </div>
          <div className="flex justify-center pt-10">
            <Logo markSize={36} />
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-7 py-12">
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
                    className={`font-heading text-[2.1rem] leading-tight transition-colors ${
                      active ? "text-ink" : "text-ink/75 hover:text-ink"
                    }`}
                  >
                    {l.label}
                  </span>
                  <span className="block font-heading italic text-base text-stone">{l.sub}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <main className="flex-1">{children}</main>

      <footer className="mt-28 border-t border-ink/10">
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
          <LogoMark size={44} className="text-gold mx-auto" />
          <p className="font-heading text-3xl sm:text-4xl mt-6 tracking-[0.18em] uppercase">
            Enid &amp; Jason
          </p>
          <p className="mt-4 font-heading italic text-xl text-stone">
            {WEDDING.dates} · {WEDDING.venue}
          </p>
          <p
            className="mt-2 font-sans text-[0.62rem] font-medium tracking-[0.3em] uppercase text-stone"
            style={{ textIndent: "0.3em" }}
          >
            {WEDDING.location}
          </p>
          <div className="hairline max-w-16 mx-auto mt-10" />
          <p
            className="mt-6 font-sans text-[0.58rem] font-medium tracking-[0.26em] uppercase text-ink/35"
            style={{ textIndent: "0.26em" }}
          >
            Made with love — and a little pixel magic
          </p>
        </div>
      </footer>
    </div>
  );
}
