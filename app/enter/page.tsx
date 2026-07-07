"use client";

import { useState } from "react";
import { WEDDING } from "@/lib/wedding";
import { Monogram, LakeScene } from "@/components/decor";

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
    <div className="fixed inset-0 overflow-hidden bg-verde-deep">
      {/* Line-art lake scene anchored to the bottom */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center text-cream opacity-[0.14] pointer-events-none">
        <LakeScene className="w-[64rem] max-w-none" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-4 overflow-y-auto">
        <div
          className="arch-frame w-full max-w-md !border-cream/30 animate-hero-in my-8"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="bg-cream px-6 sm:px-10 pt-14 pb-12 text-center text-ink">
            <div
              className="flex justify-center text-verde animate-hero-in"
              style={{ animationDelay: "0.3s" }}
            >
              <Monogram size={56} />
            </div>
            <p
              className="eyebrow eyebrow-rule mt-8 animate-hero-in"
              style={{ animationDelay: "0.45s" }}
            >
              Siete invitati
            </p>
            <h1
              className="font-heading text-5xl sm:text-6xl mt-6 leading-tight animate-hero-in"
              style={{ animationDelay: "0.6s" }}
            >
              Enid <span className="display-italic text-terracotta">&amp;</span> Jason
            </h1>
            <p
              className="mt-4 text-lg italic text-ink/65 animate-hero-in"
              style={{ animationDelay: "0.7s" }}
            >
              {WEDDING.dates} · {WEDDING.location}
            </p>

            <form
              onSubmit={submit}
              className="mt-10 space-y-7 animate-hero-in"
              style={{ animationDelay: "0.85s" }}
            >
              <p className="text-ink/55 text-sm italic">
                La parola d&apos;ordine è sul vostro invito — the password is on your
                invitation.
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Password"
                autoFocus
                className="input-line"
              />
              {status === "error" && (
                <p className="text-terracotta italic">
                  Non è quella giusta — please try again.
                </p>
              )}
              <button
                type="submit"
                disabled={status === "checking"}
                className="btn btn-terracotta"
              >
                {status === "checking" ? "Un momento…" : "Entra"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
