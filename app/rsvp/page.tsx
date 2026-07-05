"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CharacterBuilder from "@/components/CharacterBuilder";
import CharacterSprite from "@/components/CharacterSprite";
import { mockInsert } from "@/lib/mock";
import {
  DEFAULT_CHARACTER,
  normalizeCharacter,
  type CharacterConfig,
} from "@/lib/pixel/sprites";
import type { Attending, RsvpInput } from "@/lib/types";

export default function RsvpPage() {
  const [character, setCharacter] = useState<CharacterConfig>(DEFAULT_CHARACTER);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<Attending>("yes");
  const [guestsCount, setGuestsCount] = useState(1);
  const [dietary, setDietary] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [usedMock, setUsedMock] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("ej-character");
      if (saved) setCharacter(normalizeCharacter(JSON.parse(saved)));
    } catch {
      // keep default
    }
  }, []);

  // The welcome game uses the character you designed here.
  useEffect(() => {
    window.localStorage.setItem("ej-character", JSON.stringify(character));
  }, [character]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    const input: RsvpInput = {
      name: name.trim(),
      email: email.trim(),
      attending,
      guests_count: guestsCount,
      dietary: dietary.trim(),
      message: message.trim(),
      character,
    };

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.status === 503) {
        mockInsert(input);
        setUsedMock(true);
        setStatus("done");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="flex justify-center animate-float-slow">
          <CharacterSprite config={character} scale={8} />
        </div>
        <h1 className="font-pixel text-sm text-sage-dark mt-8">
          {attending === "yes" ? "GRAZIE MILLE! SEE YOU AT THE LAKE ♥" : "WE'LL MISS YOU! ♥"}
        </h1>
        <p className="mt-6 text-xl text-ink/80">
          {attending === "yes"
            ? "Your RSVP is in and your character has just arrived at the villa."
            : "Thanks for letting us know — your message means a lot."}
        </p>
        {usedMock && (
          <p className="mt-4 text-ink/50 text-base">
            (Demo mode: saved locally in your browser — connect Supabase to collect real
            RSVPs.)
          </p>
        )}
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          {attending === "yes" && (
            <Link
              href="/guests"
              className="font-pixel text-[11px] px-6 py-4 rounded-full bg-sage text-cream hover:bg-sage-dark transition-colors"
            >
              SEE YOURSELF ON THE GUEST MAP
            </Link>
          )}
          <Link
            href="/home"
            className="font-pixel text-[11px] px-6 py-4 rounded-full bg-parchment hover:bg-gold/20 transition-colors"
          >
            BACK HOME
          </Link>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border-2 border-ink/15 bg-white/70 px-4 py-3 text-lg focus:outline-none focus:border-sage transition-colors";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-pixel text-sm text-sage-dark text-center">RSVP</h1>
      <p className="text-center mt-4 text-xl text-ink/75 max-w-2xl mx-auto">
        Tell us if you&apos;re coming — and design the pixel character that will represent
        you on our guest map (and in the welcome game!).
      </p>

      <form onSubmit={submit} className="mt-10 grid lg:grid-cols-2 gap-8 items-start">
        <CharacterBuilder value={character} onChange={setCharacter} />

        <div className="space-y-4">
          <div>
            <label className="font-pixel text-[9px] text-ink/60 block mb-1.5">NAME *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="font-pixel text-[9px] text-ink/60 block mb-1.5">EMAIL *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-pixel text-[9px] text-ink/60 block mb-1.5">
                WILL YOU JOIN US?
              </label>
              <select
                value={attending}
                onChange={(e) => setAttending(e.target.value as Attending)}
                className={inputCls}
              >
                <option value="yes">Joyfully accept 🎉</option>
                <option value="no">Regretfully decline 😢</option>
              </select>
            </div>
            <div>
              <label className="font-pixel text-[9px] text-ink/60 block mb-1.5">
                PARTY SIZE
              </label>
              <select
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className={inputCls}
                disabled={attending === "no"}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="font-pixel text-[9px] text-ink/60 block mb-1.5">
              DIETARY REQUIREMENTS
            </label>
            <input
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className={inputCls}
              placeholder="Allergies, vegetarian, vegan…"
            />
          </div>
          <div>
            <label className="font-pixel text-[9px] text-ink/60 block mb-1.5">
              MESSAGE FOR THE COUPLE
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className={inputCls}
              placeholder="Anything you want to tell us!"
            />
          </div>

          {status === "error" && (
            <p className="text-terracotta font-medium">⚠ {errorMsg} — please try again.</p>
          )}

          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full font-pixel text-[12px] px-6 py-5 rounded-xl bg-sage text-cream hover:bg-sage-dark transition-colors disabled:opacity-60 cursor-pointer"
          >
            {status === "saving" ? "SENDING…" : "SEND RSVP ♥"}
          </button>
        </div>
      </form>
    </div>
  );
}
