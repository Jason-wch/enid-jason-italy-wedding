"use client";

import { useState } from "react";
import Link from "next/link";
import CharacterBuilder from "@/components/CharacterBuilder";
import CharacterSprite from "@/components/CharacterSprite";
import { mockLookup, mockSubmit } from "@/lib/mock";
import { normalizeCharacter, type CharacterConfig } from "@/lib/pixel/sprites";
import type { PartyWithGuests, RsvpSubmission } from "@/lib/types";

type Answer = {
  attending: "yes" | "no";
  email: string;
  driving: boolean;
  dietary: string;
  character: CharacterConfig;
};

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
        driving: g.driving ?? false,
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
    setSaveStatus("saving");
    setErrorMsg("");

    const submission: RsvpSubmission = {
      partyId: party.id,
      message: message.trim(),
      responses: party.guests.map((g) => ({
        guestId: g.id,
        attending: answers[g.id].attending,
        email: answers[g.id].email.trim(),
        driving: answers[g.id].driving,
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

  const inputCls =
    "w-full rounded-xl border-2 border-ink/15 bg-white/70 px-4 py-3 text-lg focus:outline-none focus:border-sage transition-colors";

  // -- Success screen --------------------------------------------------------
  if (step === "done") {
    const attendingChars =
      party?.guests
        .filter((g) => answers[g.id]?.attending === "yes")
        .map((g) => ({ id: g.id, character: answers[g.id].character })) ?? [];
    const anyone = attendingChars.length > 0;
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        {anyone && (
          <div className="flex justify-center gap-2 flex-wrap animate-float-slow">
            {attendingChars.map((c) => (
              <CharacterSprite key={c.id} config={c.character} scale={7} />
            ))}
          </div>
        )}
        <h1 className="font-pixel text-2xl text-sage-dark mt-8">
          {anyone ? "Grazie mille!" : "We'll miss you"}
        </h1>
        <p className="mt-6 text-xl text-ink/80">
          {anyone
            ? "Your RSVP is in — your characters have just arrived at the villa."
            : "Thank you for letting us know — your message means a lot."}
        </p>
        {usedMock && (
          <p className="mt-4 text-ink/50 text-base">
            (Demo mode: saved locally in your browser — connect Supabase to collect real RSVPs.)
          </p>
        )}
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          {anyone && (
            <Link
              href="/guests"
              className="font-pixel text-sm px-6 py-4 rounded-full bg-sage text-cream hover:bg-sage-dark transition-colors"
            >
              See yourself on the guest map
            </Link>
          )}
          <Link
            href="/home"
            className="font-pixel text-sm px-6 py-4 rounded-full bg-parchment hover:bg-gold/20 transition-colors"
          >
            Back home
          </Link>
        </div>
      </div>
    );
  }

  // -- Name lookup step ------------------------------------------------------
  if (step === "lookup") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <h1 className="font-pixel text-2xl text-sage-dark text-center">RSVP</h1>
        <p className="text-center mt-4 text-xl text-ink/75">
          Enter your full name as it appears on your invitation, and we&apos;ll find your party.
        </p>
        <form onSubmit={lookup} className="mt-10 space-y-4">
          <input
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (lookupStatus !== "idle") setLookupStatus("idle");
            }}
            className={inputCls}
            placeholder="e.g. Rosa Rossi"
            autoFocus
          />
          {lookupStatus === "notfound" && (
            <p className="text-terracotta">
              We couldn&apos;t find that name. Please check the spelling (or try another name in
              your party). Still stuck? Just reach out to Enid or Jason.
            </p>
          )}
          {lookupStatus === "error" && (
            <p className="text-terracotta">Something went wrong — please try again.</p>
          )}
          <button
            type="submit"
            disabled={lookupStatus === "searching"}
            className="w-full font-pixel text-base px-6 py-5 rounded-xl bg-sage text-cream hover:bg-sage-dark transition-colors disabled:opacity-60 cursor-pointer"
          >
            {lookupStatus === "searching" ? "Searching…" : "Find my invitation"}
          </button>
        </form>
      </div>
    );
  }

  // -- Party RSVP form -------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-pixel text-2xl text-sage-dark text-center">{party?.name}</h1>
      <p className="text-center mt-4 text-xl text-ink/75 max-w-2xl mx-auto">
        Let us know who&apos;s joining us — and design the pixel character that will represent each
        guest on our map (and in the welcome game!).
      </p>

      <form onSubmit={submit} className="mt-10 space-y-6">
        {party?.guests.map((g) => {
          const a = answers[g.id];
          const attending = a?.attending === "yes";
          return (
            <div
              key={g.id}
              className="rounded-2xl border-2 border-gold/30 bg-white/60 p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="font-pixel text-lg text-ink">{g.full_name}</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAnswer(g.id, { attending: "yes" })}
                    className={`font-pixel text-xs px-4 py-2.5 rounded-full transition-colors cursor-pointer ${
                      attending ? "bg-sage text-cream" : "bg-parchment hover:bg-sage/20"
                    }`}
                  >
                    Attending
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswer(g.id, { attending: "no" })}
                    className={`font-pixel text-xs px-4 py-2.5 rounded-full transition-colors cursor-pointer ${
                      !attending ? "bg-terracotta text-cream" : "bg-parchment hover:bg-terracotta/20"
                    }`}
                  >
                    Can&apos;t make it
                  </button>
                </div>
              </div>

              {attending && (
                <div className="mt-5 grid md:grid-cols-2 gap-6 items-start">
                  <CharacterBuilder
                    value={a.character}
                    onChange={(character) => setAnswer(g.id, { character })}
                  />
                  <div className="space-y-4">
                    <div>
                      <label className="font-pixel text-xs text-ink/60 block mb-1.5">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={a.email}
                        onChange={(e) => setAnswer(g.id, { email: e.target.value })}
                        className={inputCls}
                        placeholder="name@example.com"
                      />
                    </div>
                    <div>
                      <label className="font-pixel text-xs text-ink/60 block mb-1.5">
                        Driving to the venue?
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAnswer(g.id, { driving: true })}
                          className={`font-pixel text-xs px-4 py-2.5 rounded-full transition-colors cursor-pointer ${
                            a.driving ? "bg-lake-deep text-cream" : "bg-parchment hover:bg-lake/20"
                          }`}
                        >
                          Driving
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnswer(g.id, { driving: false })}
                          className={`font-pixel text-xs px-4 py-2.5 rounded-full transition-colors cursor-pointer ${
                            !a.driving ? "bg-sage text-cream" : "bg-parchment hover:bg-sage/20"
                          }`}
                        >
                          Not driving
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="font-pixel text-xs text-ink/60 block mb-1.5">
                        Dietary requirements
                      </label>
                      <input
                        value={a.dietary}
                        onChange={(e) => setAnswer(g.id, { dietary: e.target.value })}
                        className={inputCls}
                        placeholder="Allergies, vegetarian, vegan…"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div>
          <label className="font-pixel text-xs text-ink/60 block mb-1.5">
            Message for the couple
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className={inputCls}
            placeholder="Anything you want to tell us!"
          />
        </div>

        {saveStatus === "error" && (
          <p className="text-terracotta font-medium">⚠ {errorMsg} — please try again.</p>
        )}

        <div className="flex gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setStep("lookup");
              setParty(null);
            }}
            className="font-pixel text-sm px-6 py-4 rounded-xl bg-parchment hover:bg-gold/20 transition-colors cursor-pointer"
          >
            ← Not you?
          </button>
          <button
            type="submit"
            disabled={saveStatus === "saving"}
            className="flex-1 font-pixel text-base px-6 py-4 rounded-xl bg-sage text-cream hover:bg-sage-dark transition-colors disabled:opacity-60 cursor-pointer"
          >
            {saveStatus === "saving" ? "Sending…" : "Send RSVP ♥"}
          </button>
        </div>
      </form>
    </div>
  );
}
