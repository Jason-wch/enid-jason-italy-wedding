"use client";

import { useState } from "react";
import Image from "next/image";
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
    <div className="fixed inset-0 overflow-hidden">
      <Image
        src="/images/hero.png"
        alt=""
        fill
        priority
        className="object-cover animate-ken-burns"
      />
      <div className="absolute inset-0 bg-ink/55" />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center text-cream">
          <p
            className="eyebrow eyebrow-rule !text-cream/85 animate-hero-in"
            style={{ animationDelay: "0.15s" }}
          >
            You&apos;re invited
          </p>
          <h1
            className="font-heading text-6xl sm:text-7xl mt-7 leading-tight animate-hero-in"
            style={{ animationDelay: "0.4s" }}
          >
            Enid <span className="text-villa">&amp;</span> Jason
          </h1>
          <p
            className="mt-5 text-lg italic text-cream/85 animate-hero-in"
            style={{ animationDelay: "0.6s" }}
          >
            {WEDDING.dates} · {WEDDING.location}
          </p>

          <form
            onSubmit={submit}
            className="mt-14 space-y-8 animate-hero-in"
            style={{ animationDelay: "0.8s" }}
          >
            <p className="text-cream/70 text-base tracking-[0.2em] uppercase">
              Enter the password from your invitation
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
              className="input-line !text-cream !border-cream/40 focus:!border-villa placeholder:!text-cream/40"
            />
            {status === "error" && (
              <p className="text-villa italic">
                That password isn&apos;t right — please try again.
              </p>
            )}
            <button type="submit" disabled={status === "checking"} className="btn btn-light">
              {status === "checking" ? "Checking…" : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
