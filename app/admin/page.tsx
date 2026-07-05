"use client";

/**
 * Password-gated guest-list admin. Manage parties (households) and their
 * guests, watch RSVPs come in live, and export a CSV. Falls back to the local
 * demo store when Supabase isn't configured.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import CharacterSprite from "@/components/CharacterSprite";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import {
  mockAddGuest,
  mockAddParty,
  mockDeleteGuest,
  mockDeleteParty,
  mockParties,
  mockUpdateGuest,
  mockUpdateParty,
} from "@/lib/mock";
import type { Guest, PartyWithGuests } from "@/lib/types";

const PASS_KEY = "ej-admin-pass";

function toCsv(parties: PartyWithGuests[]): string {
  const cols = ["party", "guest", "email", "attending", "driving", "dietary", "responded_at"] as const;
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [cols.join(",")];
  for (const p of parties) {
    for (const g of p.guests) {
      lines.push(
        [
          esc(p.name),
          esc(g.full_name),
          esc(g.email),
          esc(g.attending ?? "pending"),
          esc(g.driving ? "yes" : "no"),
          esc(g.dietary),
          esc(g.responded_at ?? ""),
        ].join(",")
      );
    }
  }
  return lines.join("\n");
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [parties, setParties] = useState<PartyWithGuests[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const passRef = useRef("");

  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyGuests, setNewPartyGuests] = useState("");

  const load = useCallback(async (): Promise<boolean> => {
    const res = await fetch("/api/admin/parties", {
      headers: { "x-admin-password": passRef.current },
    });
    if (res.status === 401) return false;
    if (res.status === 503) {
      setParties(mockParties());
      setDemoMode(true);
      setLastRefresh(new Date());
      return true;
    }
    if (!res.ok) return true;
    const data = (await res.json()) as { parties: PartyWithGuests[] };
    setParties(data.parties);
    setLastRefresh(new Date());
    return true;
  }, []);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(PASS_KEY);
    if (saved) {
      passRef.current = saved;
      void load().then((ok) => setAuthed(ok));
    }
  }, [load]);

  useEffect(() => {
    if (!authed) return;
    const poll = setInterval(() => void load(), 15000);
    const supabase = getBrowserSupabase();
    const channel = supabase
      ?.channel("guest-map")
      .on("broadcast", { event: "rsvp" }, () => void load())
      .subscribe();
    return () => {
      clearInterval(poll);
      if (supabase && channel) void supabase.removeChannel(channel);
    };
  }, [authed, load]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    passRef.current = password;
    const ok = await load();
    if (ok) {
      window.sessionStorage.setItem(PASS_KEY, password);
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("Wrong password.");
    }
  };

  // Generic mutation: use the demo store or the API, then reload.
  const api = async (method: string, body: unknown) => {
    await fetch("/api/admin/parties", {
      method,
      headers: { "Content-Type": "application/json", "x-admin-password": passRef.current },
      body: JSON.stringify(body),
    });
  };

  const addParty = async () => {
    const name = newPartyName.trim();
    if (!name) return;
    const guestNames = newPartyGuests
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (demoMode) mockAddParty(name, guestNames);
    else await api("POST", { name, guestNames });
    setNewPartyName("");
    setNewPartyGuests("");
    await load();
  };

  const editParty = async (id: string, patch: Partial<PartyWithGuests>) => {
    if (demoMode) mockUpdateParty(id, patch);
    else await api("PATCH", { partyId: id, patch });
    await load();
  };

  const removeParty = async (id: string) => {
    if (!confirm("Delete this whole party and all its guests?")) return;
    if (demoMode) mockDeleteParty(id);
    else await api("DELETE", { partyId: id });
    await load();
  };

  const addGuest = async (partyId: string, name: string) => {
    const full_name = name.trim();
    if (!full_name) return;
    if (demoMode) mockAddGuest(partyId, full_name);
    else await api("PATCH", { partyId, addGuestName: full_name });
    await load();
  };

  const editGuest = async (id: string, patch: Partial<Guest>) => {
    // Optimistic update so inline edits feel instant.
    setParties((prev) =>
      prev.map((p) => ({
        ...p,
        guests: p.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      }))
    );
    if (demoMode) mockUpdateGuest(id, patch);
    else await api("PATCH", { guestId: id, patch });
  };

  const removeGuest = async (id: string) => {
    if (demoMode) mockDeleteGuest(id);
    else await api("DELETE", { guestId: id });
    await load();
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(parties)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guest-list.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24">
        <h1 className="font-pixel text-2xl text-sage-dark text-center">Admin</h1>
        <form onSubmit={login} className="mt-8 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border-2 border-ink/15 bg-white/70 px-4 py-3 text-lg focus:outline-none focus:border-sage"
            autoFocus
          />
          {authError && <p className="text-terracotta">{authError}</p>}
          <button
            type="submit"
            className="w-full font-pixel text-sm px-6 py-4 rounded-xl bg-sage text-cream hover:bg-sage-dark transition-colors cursor-pointer"
          >
            Unlock
          </button>
          <p className="text-center text-ink/50 text-base">
            Default password is <code>sostaga2027</code> until you set <code>ADMIN_PASSWORD</code>.
          </p>
        </form>
      </div>
    );
  }

  const allGuests = parties.flatMap((p) => p.guests);
  const invited = allGuests.length;
  const responded = allGuests.filter((g) => g.attending !== null).length;
  const attending = allGuests.filter((g) => g.attending === "yes").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="font-pixel text-2xl text-sage-dark">Guest list</h1>
        <span className="bg-sage/15 rounded-full px-4 py-1.5">
          {parties.length} parties · {invited} invited · {responded} responded · {attending}{" "}
          attending
        </span>
        {demoMode && (
          <span className="font-pixel text-xs text-ink/50 bg-parchment rounded-full px-4 py-2">
            Demo mode
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          {lastRefresh && (
            <span className="text-ink/40 text-sm">
              updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => void load()}
            className="font-pixel text-xs px-4 py-2.5 rounded-full border-2 border-ink/15 hover:bg-parchment cursor-pointer"
          >
            ↻ Refresh
          </button>
          <button
            onClick={exportCsv}
            className="font-pixel text-xs px-4 py-2.5 rounded-full bg-sage text-cream hover:bg-sage-dark cursor-pointer"
          >
            ⤓ Export CSV
          </button>
        </div>
      </div>

      {/* Add a party */}
      <div className="mt-6 rounded-2xl border-2 border-gold/30 bg-white/70 p-5">
        <h2 className="font-pixel text-base text-sage-dark">Add a party</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <input
            value={newPartyName}
            onChange={(e) => setNewPartyName(e.target.value)}
            placeholder="Party name (e.g. The Rossi Family)"
            className="rounded-xl border-2 border-ink/15 bg-white px-4 py-3 text-lg focus:outline-none focus:border-sage"
          />
          <textarea
            value={newPartyGuests}
            onChange={(e) => setNewPartyGuests(e.target.value)}
            placeholder="Guest full names, one per line"
            rows={3}
            className="rounded-xl border-2 border-ink/15 bg-white px-4 py-3 text-base focus:outline-none focus:border-sage"
          />
        </div>
        <button
          onClick={() => void addParty()}
          className="mt-4 font-pixel text-sm px-6 py-3 rounded-full bg-sage text-cream hover:bg-sage-dark cursor-pointer"
        >
          + Add party
        </button>
      </div>

      {/* Parties */}
      <div className="mt-6 space-y-5">
        {parties.map((p) => (
          <PartyCard
            key={p.id}
            party={p}
            onEditParty={editParty}
            onRemoveParty={removeParty}
            onAddGuest={addGuest}
            onEditGuest={editGuest}
            onRemoveGuest={removeGuest}
          />
        ))}
        {parties.length === 0 && (
          <p className="text-center py-10 text-ink/50">
            No parties yet — add your first one above.
          </p>
        )}
      </div>
    </div>
  );
}

function PartyCard({
  party,
  onEditParty,
  onRemoveParty,
  onAddGuest,
  onEditGuest,
  onRemoveGuest,
}: {
  party: PartyWithGuests;
  onEditParty: (id: string, patch: Partial<PartyWithGuests>) => void;
  onRemoveParty: (id: string) => void;
  onAddGuest: (partyId: string, name: string) => void;
  onEditGuest: (id: string, patch: Partial<Guest>) => void;
  onRemoveGuest: (id: string) => void;
}) {
  const [newGuest, setNewGuest] = useState("");
  const cellCls = "border border-ink/10 px-2 py-1 text-base";
  const inputCls = "w-full bg-transparent focus:outline-none focus:bg-villa/20 px-1 py-0.5 rounded";

  return (
    <div className="rounded-2xl border-2 border-ink/10 bg-white/80 shadow-sm p-5">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          defaultValue={party.name}
          onBlur={(e) =>
            e.target.value.trim() !== party.name &&
            onEditParty(party.id, { name: e.target.value.trim() })
          }
          className="font-pixel text-lg text-sage-dark bg-transparent focus:outline-none focus:bg-villa/20 rounded px-1"
        />
        <span className="text-ink/40 text-sm">
          {party.guests.filter((g) => g.attending === "yes").length}/{party.guests.length} attending
        </span>
        <button
          onClick={() => onRemoveParty(party.id)}
          className="ml-auto text-sm text-terracotta hover:underline cursor-pointer"
        >
          Delete party
        </button>
      </div>

      {party.message && (
        <p className="mt-2 text-ink/70 italic text-base">“{party.message}”</p>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-parchment font-pixel text-xs text-ink/60">
              {["", "Name", "Email", "Attending", "Driving", "Dietary", ""].map((h, i) => (
                <th key={i} className={`${cellCls} text-left`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {party.guests.map((g) => (
              <tr key={g.id} className="odd:bg-cream/50 hover:bg-villa/10">
                <td className={`${cellCls} w-12 text-center`}>
                  <CharacterSprite config={g.character} scale={2} animate={false} />
                </td>
                <td className={cellCls}>
                  <input
                    className={inputCls}
                    defaultValue={g.full_name}
                    onBlur={(e) =>
                      e.target.value !== g.full_name &&
                      onEditGuest(g.id, { full_name: e.target.value })
                    }
                  />
                </td>
                <td className={cellCls}>
                  <input
                    className={inputCls}
                    defaultValue={g.email}
                    onBlur={(e) =>
                      e.target.value !== g.email && onEditGuest(g.id, { email: e.target.value })
                    }
                  />
                </td>
                <td className={`${cellCls} w-28`}>
                  <select
                    className={`${inputCls} cursor-pointer`}
                    value={g.attending ?? ""}
                    onChange={(e) =>
                      onEditGuest(g.id, {
                        attending: e.target.value === "" ? null : (e.target.value as "yes" | "no"),
                      })
                    }
                  >
                    <option value="">pending</option>
                    <option value="yes">yes</option>
                    <option value="no">no</option>
                  </select>
                </td>
                <td className={`${cellCls} w-24`}>
                  <select
                    className={`${inputCls} cursor-pointer`}
                    value={g.driving ? "yes" : "no"}
                    onChange={(e) => onEditGuest(g.id, { driving: e.target.value === "yes" })}
                  >
                    <option value="no">no</option>
                    <option value="yes">yes</option>
                  </select>
                </td>
                <td className={cellCls}>
                  <input
                    className={inputCls}
                    defaultValue={g.dietary}
                    onBlur={(e) =>
                      e.target.value !== g.dietary && onEditGuest(g.id, { dietary: e.target.value })
                    }
                  />
                </td>
                <td className={`${cellCls} w-10 text-center`}>
                  <button
                    onClick={() => onRemoveGuest(g.id)}
                    className="text-terracotta hover:opacity-70 cursor-pointer"
                    aria-label="Remove guest"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={newGuest}
          onChange={(e) => setNewGuest(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAddGuest(party.id, newGuest);
              setNewGuest("");
            }
          }}
          placeholder="Add a guest…"
          className="flex-1 rounded-lg border-2 border-ink/15 bg-white px-3 py-2 text-base focus:outline-none focus:border-sage"
        />
        <button
          onClick={() => {
            onAddGuest(party.id, newGuest);
            setNewGuest("");
          }}
          className="font-pixel text-xs px-4 py-2 rounded-full bg-parchment hover:bg-sage/20 cursor-pointer"
        >
          + Add
        </button>
      </div>
    </div>
  );
}
