"use client";

import { useState } from "react";
import { WEDDING } from "@/lib/wedding";
import Logo from "@/components/decor/Logo";

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
    <div className="fixed inset-0 overflow-y-auto bg-cream">
      <div className="min-h-full flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="animate-hero-in" style={{ animationDelay: "0.15s" }}>
            <Logo markSize={44} />
          </div>

          <h1
            className="font-heading text-4xl sm:text-5xl mt-12 leading-tight animate-hero-in"
            style={{ animationDelay: "0.4s" }}
          >
            Oh beloved guests,
            <br />
            we have been expecting you.
          </h1>
          <p
            className="font-heading italic text-xl mt-6 text-stone animate-hero-in"
            style={{ animationDelay: "0.55s" }}
          >
            {WEDDING.dates} · {WEDDING.location}
          </p>

          <form
            onSubmit={submit}
            className="mt-14 space-y-8 animate-hero-in"
            style={{ animationDelay: "0.75s" }}
          >
            <p className="body-sans">
              The password is on your invitation — la parola d&apos;ordine è sul vostro
              invito.
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
              <p className="font-heading italic text-terracotta">
                Non è quella giusta — please try again.
              </p>
            )}
            <button type="submit" disabled={status === "checking"} className="btn btn-dark">
              {status === "checking" ? "Un momento…" : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
