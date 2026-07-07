"use client";

/**
 * Background music with a persistent mute toggle.
 * Place your track at public/audio/bgm.mp3 (e.g. "Summers in Italy" by Jack
 * Richard Pierce) and it will loop automatically. Browsers block autoplay, so
 * playback starts on the first user interaction.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type MusicContextValue = {
  enabled: boolean;
  toggle: () => void;
};

const MusicContext = createContext<MusicContextValue>({ enabled: false, toggle: () => {} });

export function useMusic() {
  return useContext(MusicContext);
}

const PREF_KEY = "ej-music";

export function MusicProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Restore saved preference (default: on, pending first interaction).
  useEffect(() => {
    const pref = window.localStorage.getItem(PREF_KEY);
    setEnabled(pref !== "off");
  }, []);

  const startPlayback = useCallback(async () => {
    if (!audioRef.current) {
      const el = new Audio("/audio/bgm.mp3");
      el.loop = true;
      el.volume = 0.35;
      audioRef.current = el;
    }
    audioRef.current.play().catch(() => {});
  }, []);

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  // Autoplay policies require a user gesture before any sound.
  useEffect(() => {
    if (interacted) return;
    const onFirst = () => setInteracted(true);
    window.addEventListener("pointerdown", onFirst, { once: true });
    window.addEventListener("keydown", onFirst, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
    };
  }, [interacted]);

  useEffect(() => {
    if (enabled && interacted) void startPlayback();
    else stopPlayback();
  }, [enabled, interacted, startPlayback, stopPlayback]);

  const toggle = useCallback(() => {
    setInteracted(true);
    setEnabled((prev) => {
      const next = !prev;
      window.localStorage.setItem(PREF_KEY, next ? "on" : "off");
      return next;
    });
  }, []);

  return <MusicContext.Provider value={{ enabled, toggle }}>{children}</MusicContext.Provider>;
}

export function MusicToggle({ className = "" }: { className?: string }) {
  const { enabled, toggle } = useMusic();
  return (
    <button
      onClick={toggle}
      aria-label={enabled ? "Mute music" : "Play music"}
      title={enabled ? "Mute music" : "Play music"}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 bg-cream/85 text-ink/80 hover:border-gold hover:text-ink transition-colors cursor-pointer ${className}`}
    >
      <span className="text-base leading-none">♪</span>
      {!enabled && (
        <span
          aria-hidden="true"
          className="absolute h-px w-6 rotate-45 bg-terracotta"
        />
      )}
    </button>
  );
}