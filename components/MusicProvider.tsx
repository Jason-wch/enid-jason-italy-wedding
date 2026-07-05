"use client";

/**
 * Background music with a persistent mute toggle.
 * If /audio/bgm.mp3 exists it is looped via an <audio> element; otherwise a
 * built-in WebAudio chiptune (MapleStory-esque, original melody) plays.
 * Browsers block autoplay, so playback starts on the first user interaction.
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

/** Simple looping chiptune sequencer (square lead + triangle bass). */
class Chiptune {
  private ctx: AudioContext;
  private master: GainNode;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextNoteTime = 0;
  private step = 0;

  // Original cheerful melody in C major, 8th notes (MIDI numbers, 0 = rest).
  private static LEAD = [
    64, 67, 69, 67, 72, 71, 67, 64,
    65, 69, 72, 69, 74, 72, 69, 65,
    64, 67, 71, 67, 72, 74, 76, 74,
    72, 71, 69, 67, 69, 67, 65, 64,
    60, 64, 67, 64, 69, 67, 64, 60,
    62, 65, 69, 65, 71, 69, 65, 62,
    64, 67, 72, 71, 69, 67, 65, 64,
    62, 64, 65, 67, 64, 62, 60, 0,
  ];
  // Bass roots per bar (4 bass notes per bar of 8 lead steps).
  private static BASS = [
    48, 55, 52, 55, 53, 60, 57, 60, 48, 55, 52, 55, 55, 62, 59, 62,
    48, 55, 52, 55, 50, 57, 53, 57, 48, 55, 52, 55, 43, 50, 47, 50,
  ];

  private static TEMPO = 104; // bpm
  private get eighth() {
    return 60 / Chiptune.TEMPO / 2;
  }

  constructor() {
    type AudioContextCtor = new () => AudioContext;
    const w = window as unknown as {
      AudioContext?: AudioContextCtor;
      webkitAudioContext?: AudioContextCtor;
    };
    const Ctor = (w.AudioContext ?? w.webkitAudioContext)!;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.07;
    this.master.connect(this.ctx.destination);
  }

  private midiToFreq(m: number) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  private playNote(freq: number, time: number, dur: number, type: OscillatorType, vol: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.01);
    gain.gain.setValueAtTime(vol, time + dur * 0.6);
    gain.gain.linearRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private schedule() {
    while (this.nextNoteTime < this.ctx.currentTime + 0.2) {
      const leadNote = Chiptune.LEAD[this.step % Chiptune.LEAD.length];
      if (leadNote > 0) {
        this.playNote(this.midiToFreq(leadNote), this.nextNoteTime, this.eighth * 0.95, "square", 0.5);
      }
      if (this.step % 2 === 0) {
        const bassNote = Chiptune.BASS[(this.step / 2) % Chiptune.BASS.length];
        this.playNote(this.midiToFreq(bassNote), this.nextNoteTime, this.eighth * 1.9, "triangle", 0.8);
      }
      this.nextNoteTime += this.eighth;
      this.step++;
    }
  }

  start() {
    if (this.timer) return;
    void this.ctx.resume();
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.timer = setInterval(() => this.schedule(), 80);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    void this.ctx.suspend();
  }
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chiptuneRef = useRef<Chiptune | null>(null);
  const hasMp3Ref = useRef<boolean | null>(null);

  // Restore saved preference (default: on, pending first interaction).
  useEffect(() => {
    const pref = window.localStorage.getItem(PREF_KEY);
    setEnabled(pref !== "off");
  }, []);

  const startPlayback = useCallback(async () => {
    if (hasMp3Ref.current === null) {
      try {
        const res = await fetch("/audio/bgm.mp3", { method: "HEAD" });
        hasMp3Ref.current =
          res.ok && (res.headers.get("content-type") ?? "").startsWith("audio");
      } catch {
        hasMp3Ref.current = false;
      }
    }
    if (hasMp3Ref.current) {
      if (!audioRef.current) {
        const el = new Audio("/audio/bgm.mp3");
        el.loop = true;
        el.volume = 0.35;
        audioRef.current = el;
      }
      audioRef.current.play().catch(() => {});
    } else {
      if (!chiptuneRef.current) chiptuneRef.current = new Chiptune();
      chiptuneRef.current.start();
    }
  }, []);

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    chiptuneRef.current?.stop();
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
      className={`font-pixel text-[10px] px-3 py-2 rounded-full border-2 border-ink/20 bg-cream/90 hover:bg-parchment transition-colors cursor-pointer ${className}`}
    >
      {enabled ? "♪ ON" : "♪ OFF"}
    </button>
  );
}
