"use client";

/**
 * Spreadsheet-style RSVP admin view: password-gated, Google-Sheets-like
 * editable table with live refresh and CSV export. Falls back to the local
 * demo store when Supabase isn't configured.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import CharacterSprite from "@/components/CharacterSprite";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import { mockAll, mockUpdate } from "@/lib/mock";
import type { RsvpRow } from "@/lib/types";

const PASS_KEY = "ej-admin-pass";

function toCsv(rows: RsvpRow[]): string {
  const cols = [
    "name",
    "email",
    "attending",
    "guests_count",
    "dietary",
    "message",
    "created_at",
  ] as const;
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [cols.join(",")];
  for (const r of rows) lines.push(cols.map((c) => esc(r[c])).join(","));
  return lines.join("\n");
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const passRef = useRef("");

  const load = useCallback(async (): Promise<boolean> => {
    const res = await fetch("/api/admin/rsvps", {
      headers: { "x-admin-password": passRef.current },
    });
    if (res.status === 401) return false;
    if (res.status === 503) {
      setRows(mockAll().sort((a, b) => b.created_at.localeCompare(a.created_at)));
      setDemoMode(true);
      setLastRefresh(new Date());
      return true;
    }
    if (!res.ok) return true;
    const data = (await res.json()) as { rsvps: RsvpRow[] };
    setRows(data.rsvps);
    setLastRefresh(new Date());
    return true;
  }, []);

  // Restore saved session.
  useEffect(() => {
    const saved = window.sessionStorage.getItem(PASS_KEY);
    if (saved) {
      passRef.current = saved;
      void load().then((ok) => setAuthed(ok));
    }
  }, [load]);

  // Live updates: broadcast channel + polling while authed.
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

  const saveCell = async (id: string, field: keyof RsvpRow, value: string | number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? ({ ...r, [field]: value } as RsvpRow) : r))
    );
    if (demoMode) {
      mockUpdate(id, { [field]: value } as Partial<RsvpRow>);
      return;
    }
    await fetch("/api/admin/rsvps", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": passRef.current,
      },
      body: JSON.stringify({ id, patch: { [field]: value } }),
    });
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rsvps.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24">
        <h1 className="font-pixel text-sm text-sage-dark text-center">ADMIN</h1>
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
            className="w-full font-pixel text-[11px] px-6 py-4 rounded-xl bg-sage text-cream hover:bg-sage-dark transition-colors cursor-pointer"
          >
            UNLOCK
          </button>
          <p className="text-center text-ink/50 text-base">
            Default password is <code>sostaga2027</code> until you set{" "}
            <code>ADMIN_PASSWORD</code>.
          </p>
        </form>
      </div>
    );
  }

  const attendingRows = rows.filter((r) => r.attending === "yes");
  const totalHeads = attendingRows.reduce((sum, r) => sum + (r.guests_count || 1), 0);

  const cellCls = "border border-ink/10 px-2 py-1 text-base";
  const inputCls =
    "w-full bg-transparent focus:outline-none focus:bg-villa/20 px-1 py-0.5 rounded";

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="font-pixel text-sm text-sage-dark">RSVP SHEET</h1>
        <span className="bg-sage/15 rounded-full px-4 py-1.5">
          {attendingRows.length} parties attending · {totalHeads} total guests
        </span>
        {demoMode && (
          <span className="font-pixel text-[9px] text-ink/50 bg-parchment rounded-full px-4 py-2">
            DEMO MODE
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
            className="font-pixel text-[9px] px-4 py-2.5 rounded-full border-2 border-ink/15 hover:bg-parchment cursor-pointer"
          >
            ↻ REFRESH
          </button>
          <button
            onClick={exportCsv}
            className="font-pixel text-[9px] px-4 py-2.5 rounded-full bg-sage text-cream hover:bg-sage-dark cursor-pointer"
          >
            ⤓ EXPORT CSV
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border-2 border-ink/10 bg-white/80 shadow-sm">
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-parchment font-pixel text-[8px] text-ink/60">
              {["", "NAME", "EMAIL", "ATTENDING", "PARTY", "DIETARY", "MESSAGE", "DATE"].map(
                (h, i) => (
                  <th key={i} className={`${cellCls} text-left py-2`}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="odd:bg-cream/50 hover:bg-villa/10">
                <td className={`${cellCls} w-12 text-center`}>
                  <CharacterSprite config={r.character} scale={2} animate={false} />
                </td>
                <td className={cellCls}>
                  <input
                    className={inputCls}
                    defaultValue={r.name}
                    onBlur={(e) => e.target.value !== r.name && saveCell(r.id, "name", e.target.value)}
                  />
                </td>
                <td className={cellCls}>
                  <input
                    className={inputCls}
                    defaultValue={r.email}
                    onBlur={(e) => e.target.value !== r.email && saveCell(r.id, "email", e.target.value)}
                  />
                </td>
                <td className={`${cellCls} w-28`}>
                  <select
                    className={`${inputCls} cursor-pointer`}
                    value={r.attending}
                    onChange={(e) => saveCell(r.id, "attending", e.target.value)}
                  >
                    <option value="yes">yes</option>
                    <option value="no">no</option>
                  </select>
                </td>
                <td className={`${cellCls} w-20`}>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className={inputCls}
                    defaultValue={r.guests_count}
                    onBlur={(e) =>
                      Number(e.target.value) !== r.guests_count &&
                      saveCell(r.id, "guests_count", Number(e.target.value) || 1)
                    }
                  />
                </td>
                <td className={cellCls}>
                  <input
                    className={inputCls}
                    defaultValue={r.dietary}
                    onBlur={(e) =>
                      e.target.value !== r.dietary && saveCell(r.id, "dietary", e.target.value)
                    }
                  />
                </td>
                <td className={cellCls}>
                  <input
                    className={inputCls}
                    defaultValue={r.message}
                    onBlur={(e) =>
                      e.target.value !== r.message && saveCell(r.id, "message", e.target.value)
                    }
                  />
                </td>
                <td className={`${cellCls} whitespace-nowrap text-ink/50 text-sm`}>
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-ink/50">
                  No RSVPs yet — share the site with your guests!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
