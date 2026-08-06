"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { ScrollReveal } from "@/components/motion/primitives";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SiteSettings } from "@/lib/types";

export function ContactForm({
  settings,
  embedded = false,
}: {
  settings: SiteSettings;
  embedded?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const prefersReduced = useReducedMotion();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !json.ok) throw new Error(json.message || "Failed");
      setStatus("success");
      setMessage(json.message || "Message sent.");
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div
      id="contact"
      className={
        embedded
          ? "mt-20 scroll-mt-[calc(var(--nav-height)+1rem)]"
          : "mx-auto max-w-[900px] px-4 pb-20 pt-[calc(var(--nav-height)+2.5rem)] md:px-8"
      }
    >
      <ScrollReveal>
        <SectionHeading
          title="Contact"
          subtitle={`Say hello — ${settings.email} · ${settings.location}`}
        />
      </ScrollReveal>

      <div className="grid gap-10 md:grid-cols-[1fr_0.85fr]">
        <ScrollReveal>
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
                Name
              </span>
              <input
                required
                name="name"
                className="w-full rounded-sm border border-white/15 bg-[var(--surface)] px-3 py-3 text-white outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
                Email
              </span>
              <input
                required
                type="email"
                name="email"
                className="w-full rounded-sm border border-white/15 bg-[var(--surface)] px-3 py-3 text-white outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
                Message
              </span>
              <textarea
                required
                name="message"
                rows={6}
                className="w-full resize-y rounded-sm border border-white/15 bg-[var(--surface)] px-3 py-3 text-white outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </label>
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-sm bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] active:scale-[0.97] disabled:opacity-60"
            >
              {status === "loading" ? "Sending…" : "Send message"}
            </button>

            <AnimatePresence mode="wait">
              {status === "success" || status === "error" ? (
                <motion.p
                  key={status}
                  initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-sm ${status === "success" ? "text-emerald-400" : "text-red-400"}`}
                >
                  {status === "success" ? "✓ " : ""}
                  {message}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </form>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="rounded-sm border border-white/10 bg-[var(--surface)] p-6">
            <p className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
              Elsewhere
            </p>
            <ul className="mt-4 space-y-3">
              {settings.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-muted)] transition hover:text-white"
                  >
                    {s.label} →
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={`mailto:${settings.email}`}
              className="mt-6 inline-block text-sm text-[var(--accent)] hover:underline"
            >
              {settings.email}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
