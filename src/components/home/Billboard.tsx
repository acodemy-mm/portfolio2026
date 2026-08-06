"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { easeOut } from "@/components/motion/primitives";
import type { SiteSettings } from "@/lib/types";

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5.14v13.72L19 12 8 5.14z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7.5h.01" strokeLinecap="round" />
    </svg>
  );
}

export function Billboard({
  settings,
  backgroundImage,
}: {
  settings: SiteSettings;
  backgroundImage: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, prefersReduced ? 0 : 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);

  const brandMark = settings.name.trim().charAt(0).toUpperCase() || "P";
  const blurb = settings.summary || settings.tagline;

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden md:h-[86vh] md:min-h-[640px]"
    >
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 min-h-full"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backgroundImage}
          alt=""
          className="h-full w-full scale-[1.02] object-cover object-[72%_center]"
        />
      </motion.div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(to top, #141414 0%, rgba(20,20,20,0.9) 18%, transparent 48%),
            linear-gradient(to right, rgba(20,20,20,0.92) 0%, rgba(20,20,20,0.55) 28%, transparent 58%),
            linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)
          `,
        }}
      />

      {/* Mobile: hug content height. Desktop: fill viewport like Netflix. */}
      <div className="relative z-10 flex flex-col items-start justify-end px-4 pb-16 pt-[calc(var(--nav-height)+1.25rem)] md:h-full md:justify-center md:px-12 md:pb-[14%] md:pt-[calc(var(--nav-height)+5.5rem)] lg:px-14">
        <div className="w-full max-w-[560px] md:max-w-[600px]">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="mb-3 flex items-center gap-2 md:mb-4"
          >
            <span
              className="flex h-7 w-5 items-center justify-center rounded-[2px] bg-[var(--accent)] font-[family-name:var(--font-bebas)] text-lg leading-none text-white md:h-8 md:w-6 md:text-xl"
              aria-hidden
            >
              {brandMark}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90 md:text-xs">
              Portfolio
            </span>
          </motion.div>

          <motion.h1
            initial={prefersReduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06, ease: easeOut }}
            className="font-[family-name:var(--font-bebas)] text-[clamp(3.5rem,10vw,7rem)] leading-[0.9] tracking-[0.02em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)]"
          >
            {settings.name}
          </motion.h1>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: easeOut }}
            className="mt-2 font-semibold text-white/95 drop-shadow-md md:mt-3 md:text-xl"
          >
            {settings.role}
          </motion.p>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: easeOut }}
            className="mt-4 line-clamp-3 max-w-[34rem] text-[15px] leading-snug text-white/90 drop-shadow-md md:mt-5 md:text-lg md:leading-relaxed"
          >
            {blurb}
          </motion.p>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24, ease: easeOut }}
            className="mt-6 flex flex-wrap items-center gap-3 md:mt-8"
          >
            <Link
              href="/work"
              className="inline-flex items-center gap-2 rounded-[4px] bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)] active:scale-[0.98] md:px-7 md:py-3 md:text-base"
            >
              <PlayIcon className="h-5 w-5 md:h-6 md:w-6" />
              My Work
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-[4px] bg-white/30 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-[2px] transition hover:bg-white/40 active:scale-[0.98] md:px-7 md:py-3 md:text-base"
            >
              <InfoIcon className="h-5 w-5 md:h-6 md:w-6" />
              More Info
            </Link>
          </motion.div>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.34 }}
            className="mt-4 text-xs text-white/55 md:text-sm"
          >
            {settings.location}
            {settings.email ? ` · ${settings.email}` : ""}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
