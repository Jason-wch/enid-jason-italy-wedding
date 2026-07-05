"use client";

import { useState } from "react";
import { WEDDING } from "@/lib/wedding";

export default function EnterPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("checking");
    try {
      const res = await fetch("/api/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from") || "/";
      window.location.href = from;
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-lake/30 to-sage/20 px-4">
      <div className="w-full max-w-sm text-center">
        <p className="font-pixel text-xs text-gold tracking-widest">You&apos;re invited</p>
        <h1 className="font-pixel text-3xl text-sage-dark mt-3">{WEDDING.couple}</h1>
        <p className="mt-3 text-lg text-ink/70">{WEDDING.dates}</p>
        <p className="mt-8 text-ink/70">
          Please enter the password from your invitation to continue.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="Password"
            autoFocus
            className="w-full rounded-xl border-2 border-ink/15 bg-white/80 px-4 py-3 text-lg text-center focus:outline-none focus:border-sage"
          />
          {status === "error" && (
            <p className="text-terracotta">That password isn&apos;t right — please try again.</p>
          )}
          <button
            type="submit"
            disabled={status === "checking"}
            className="w-full font-pixel text-base px-6 py-4 rounded-xl bg-sage text-cream hover:bg-sage-dark transition-colors disabled:opacity-60 cursor-pointer"
          >
            {status === "checking" ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
