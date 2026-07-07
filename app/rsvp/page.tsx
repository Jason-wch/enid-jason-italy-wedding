"use client";

import { useState } from "react";
import Link from "next/link";
import CharacterBuilder from "@/components/CharacterBuilder";
import CharacterSprite from "@/components/CharacterSprite";
import { Monogram, LemonSprig, OrnamentRule } from "@/components/decor";
import { mockLookup, mockSubmit } from "@/lib/mock";
import { normalizeCharacter, type CharacterConfig } from "@/lib/pixel/sprites";
import type { PartyWithGuests, RsvpSubmission } from "@/lib/types";

type Answer = {
  attending: "yes" | "no";
  email: string;
  driving: boolean | null; // null = not yet answered (a required choice)
  dietary: string;
  character: CharacterConfig;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RsvpPage() {
  const [step, setStep] = useState<"lookup" | "form" | "done">("lookup");
  const [name, setName] = useState("");
  const [lookupStatus, setLookupStatus] = useState<"idle" | "searching" | "notfound" | "error">(
    "idle"
  );

  const [party, setParty] = useState<PartyWithGuests | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [message, setMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [usedMock, setUsedMock] = useState(false);

  const beginParty = (p: PartyWithGuests) => {
    const initial: Record<string, Answer> = {};
    for (const g of p.guests) {
      initial[g.id] = {
        attending: g.attending === "no" ? "no" : "yes",
        email: g.email ?? "",
        // Force an explicit choice unless they've already responded.
        driving: g.attending == null ? null : (g.driving ?? false),
        dietary: g.dietary ?? "",
        character: normalizeCharacter(g.character),
      };
    }
    setParty(p);
    setAnswers(initial);
    setMessage(p.message ?? "");
    setStep("form");
  };

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupStatus("searching");
    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.status === 503) {
        const p = mockLookup(name);
        if (!p) {
          setLookupStatus("notfound");
          return;
        }
        setUsedMock(true);
        beginParty(p);
        setLookupStatus("idle");
        return;
      }
      if (res.status === 404) {
        setLookupStatus("notfound");
        return;
      }
      if (!res.ok) throw new Error("Lookup failed");
      const data = (await res.json()) as { party: PartyWithGuests };
      beginParty(data.party);
      setLookupStatus("idle");
    } catch {
      setLookupStatus("error");
    }
  };

  const setAnswer = (guestId: string, patch: Partial<Answer>) => {
    setAnswers((prev) => ({ ...prev, [guestId]: { ...prev[guestId], ...patch } }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!party) return;

    // Email + driving are required for everyone attending.
    const missing = party.guests.filter((g) => {
      const a = answers[g.id];
      if (a.attending !== "yes") return false;
      return !EMAIL_RE.test(a.email.trim()) || a.driving === null;
    });
    if (missing.length > 0) {
      setErrorMsg(
        "Please add a valid email address and answer the driving question for everyone attending"
      );
      setSaveStatus("error");
      return;
    }

    setSaveStatus("saving");
    setErrorMsg("");

    const submission: RsvpSubmission = {
      partyId: party.id,
      message: message.trim(),
      responses: party.guests.map((g) => ({
        guestId: g.id,
        attending: answers[g.id].attending,
        email: answers[g.id].email.trim(),
        driving: answers[g.id].driving === true,
        dietary: answers[g.id].dietary.trim(),
        character: answers[g.id].character,
      })),
    };

    // Keep one avatar for the welcome game.
    const firstYes = submission.responses.find((r) => r.attending === "yes");
    if (firstYes) {
      try {
        window.localStorage.setItem("ej-character", JSON.stringify(firstYes.character));
      } catch {
        // ignore
      }
    }

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      if (res.status === 503) {
        mockSubmit(submission);
        setUsedMock(true);
        setStep("done");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }
      setStep("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setSaveStatus("error");
    }
  };

  const label = "block text-[0.68rem] tracking-[0.3em] uppercase text-ink/50 mb-2";

  // -- Success screen --------------------------------------------------------
  if (step === "done") {
    const attendingChars =
      party?.guests
        .filter((g) => answers[g.id]?.attending === "yes")
        .map((g) => ({ id: g.id, character: answers[g.id].character })) ?? [];
    const anyone = attendingChars.length > 0;
    return (
      <div className="max-w-2xl mx-auto px-4 py-28 text-center">
        {anyone && (
          <div className="flex justify-center gap-3 flex-wrap animate-float-slow">
            {attendingChars.map((c) => (
              <CharacterSprite key={c.id} config={c.character} scale={7} />
            ))}
          </div>
        )}
        <p className="eyebrow eyebrow-rule mt-12">{anyone ? "Evviva" : "Ci mancherai"}</p>
        <h1 className="font-heading text-5xl sm:text-6xl mt-6">
          {anyone ? (
            <>
              Grazie <span className="display-italic">mille!</span>
            </>
          ) : (
            "We'll miss you"
          )}
        </h1>
        <p className="mt-8 text-xl italic text-ink/70 max-w-lg mx-auto">
          {anyone
            ? "Your RSVP is in — your characters have just arrived at the villa."
            : "Thank you for letting us know — your message means a lot."}
        </p>
        {anyone && (
          <p className="mt-3 text-lg italic text-verde">
            Ci vediamo sul lago — see you on the lake.
          </p>
        )}
        <OrnamentRule className="mt-10" />
        {usedMock && (
          <p className="mt-4 text-ink/45 text-base">
            (Demo mode: saved locally in your browser — connect Supabase to collect real RSVPs.)
          </p>
        )}
        <div className="mt-12 flex gap-4 justify-center flex-wrap">
          {anyone && (
            <Link href="/guests" className="btn btn-dark">
              See yourself on the guest map
            </Link>
          )}
          <Link href="/home" className="btn btn-ghost">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  // -- Name lookup step ------------------------------------------------------
  if (step === "lookup") {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="flex justify-center text-verde">
          <Monogram size={48} />
        </div>
        <p className="eyebrow eyebrow-rule mt-8">Ci sarete?</p>
        <h1 className="font-heading text-6xl sm:text-7xl mt-6">R·S·V·P</h1>
        <p className="mt-8 text-xl italic text-ink/60 max-w-md mx-auto">
          Scrivete il vostro nome — enter your full name as it appears on your invitation,
          and we&apos;ll find your party.
        </p>
        <div className="tile-frame relative !bg-parchment mt-14 px-6 sm:px-10 pt-10 pb-12">
          <LemonSprig width={64} className="absolute -top-7 left-4 -rotate-6" />
          <form onSubmit={lookup} className="space-y-8">
            <input
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (lookupStatus !== "idle") setLookupStatus("idle");
              }}
              className="input-line"
              placeholder="e.g. Rosa Rossi"
              autoFocus
            />
            {lookupStatus === "notfound" && (
              <p className="text-terracotta italic">
                We couldn&apos;t find that name. Please check the spelling (or try another
                name in your party). Still stuck? Just reach out to Enid or Jason.
              </p>
            )}
            {lookupStatus === "error" && (
              <p className="text-terracotta italic">Something went wrong — please try again.</p>
            )}
            <button
              type="submit"
              disabled={lookupStatus === "searching"}
              className="btn btn-terracotta"
            >
              {lookupStatus === "searching" ? "Cercando…" : "Find my invitation"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -- Party RSVP form -------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
      <div className="text-center">
        <p className="eyebrow eyebrow-rule">Il vostro invito</p>
        <h1 className="font-heading text-5xl sm:text-6xl mt-6">
          <span className="display-italic text-verde">Benvenuti,</span> {party?.name}
        </h1>
        <p className="mt-6 text-xl italic text-ink/60 max-w-2xl mx-auto">
          Let us know who&apos;s joining us — and design the pixel character that will
          represent each guest on our map (and in the welcome game!).
        </p>
      </div>

      <form onSubmit={submit} className="mt-16 space-y-12">
        {party?.guests.map((g) => {
          const a = answers[g.id];
          const attending = a?.attending === "yes";
          return (
            <div key={g.id} className="tile-frame px-5 sm:px-8 py-8">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <h2 className="font-heading text-3xl sm:text-4xl">{g.full_name}</h2>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAnswer(g.id, { attending: "yes" })}
                    className={`chip ${attending ? "chip-active" : ""}`}
                  >
                    Attending
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswer(g.id, { attending: "no" })}
                    className={`chip ${!attending ? "chip-active" : ""}`}
                  >
                    Can&apos;t make it
                  </button>
                </div>
              </div>

              {attending && (
                <div className="mt-8 grid md:grid-cols-2 gap-8 items-start">
                  <CharacterBuilder
                    value={a.character}
                    onChange={(character) => setAnswer(g.id, { character })}
                  />
                  <div className="space-y-6">
                    <div>
                      <label className={label}>Email address *</label>
                      <input
                        type="email"
                        required
                        value={a.email}
                        onChange={(e) => setAnswer(g.id, { email: e.target.value })}
                        className="input-card"
                        placeholder="name@example.com"
                      />
                    </div>
                    <div>
                      <label className={label}>Driving to the venue? *</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setAnswer(g.id, { driving: true })}
                          className={`chip ${a.driving === true ? "chip-active" : ""}`}
                        >
                          Driving
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnswer(g.id, { driving: false })}
                          className={`chip ${a.driving === false ? "chip-active" : ""}`}
                        >
                          Not driving
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={label}>Dietary requirements</label>
                      <input
                        value={a.dietary}
                        onChange={(e) => setAnswer(g.id, { dietary: e.target.value })}
                        className="input-card"
                        placeholder="Allergies, vegetarian, vegan…"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="tile-frame px-5 sm:px-8 py-8">
          <label className={label}>Message for the couple</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="input-card"
            placeholder="Anything you want to tell us!"
          />
        </div>

        {saveStatus === "error" && (
          <p className="text-terracotta italic text-center">⚠ {errorMsg} — please try again.</p>
        )}

        <div className="flex gap-4 flex-wrap justify-center pt-2">
          <button
            type="button"
            onClick={() => {
              setStep("lookup");
              setParty(null);
            }}
            className="btn btn-ghost"
          >
            ← Not you?
          </button>
          <button type="submit" disabled={saveStatus === "saving"} className="btn btn-terracotta">
            {saveStatus === "saving" ? "Un momento…" : "Invia · Send RSVP ♥"}
          </button>
        </div>
      </form>
    </div>
  );
}
