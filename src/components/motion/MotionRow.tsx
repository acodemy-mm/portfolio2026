"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { easeOut, ScrollReveal } from "@/components/motion/primitives";

type MotionRowProps = {
  title: string;
  href?: string;
  children: ReactNode;
  className?: string;
};

export function MotionRow({ title, href, children, className }: MotionRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const prefersReduced = useReducedMotion();

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.min(el.clientWidth * 0.85, 720),
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  return (
    <ScrollReveal className={`relative py-3 md:py-4 ${className ?? ""}`}>
      <div className="mb-3 flex items-end justify-between px-4 md:mb-4 md:px-12">
        <h2 className="text-lg font-bold text-white md:text-xl lg:text-2xl">
          {title}
        </h2>
        {href ? (
          <Link
            href={href}
            className="text-sm font-semibold text-[var(--text-muted)] transition-colors hover:text-white"
          >
            Explore All
          </Link>
        ) : null}
      </div>

      <div className="group/row relative">
        {canLeft ? (
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-0 z-20 hidden h-full w-10 items-center justify-center bg-black/55 text-3xl text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/row:opacity-100 md:flex"
          >
            ‹
          </button>
        ) : null}
        {canRight ? (
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-0 z-20 hidden h-full w-10 items-center justify-center bg-black/55 text-3xl text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/row:opacity-100 md:flex"
          >
            ›
          </button>
        ) : null}

        <div
          ref={scrollerRef}
          className="row-mask flex gap-1.5 overflow-x-auto scroll-smooth px-4 pb-2 md:gap-2 md:px-12"
          style={{ scrollbarWidth: "none" }}
        >
          {children}
        </div>
      </div>
    </ScrollReveal>
  );
}

type HoverCardProps = {
  href: string;
  title: string;
  subtitle?: string;
  image: string;
  layoutId?: string;
  className?: string;
  /** Netflix-style vertical poster (default on home rows) */
  variant?: "poster" | "landscape";
  brandMark?: string;
};

export function HoverCard({
  href,
  title,
  subtitle,
  image,
  layoutId,
  className,
  variant = "poster",
  brandMark = "N",
}: HoverCardProps) {
  const prefersReduced = useReducedMotion();
  const isPoster = variant === "poster";

  return (
    <Link
      href={href}
      className={`group relative block shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
        isPoster
          ? "w-[28vw] max-w-[180px] sm:w-[20vw] sm:max-w-[200px] md:w-[14vw] md:max-w-[220px]"
          : "w-[42vw] max-w-[280px] sm:w-[30vw] md:w-[22vw] md:max-w-[320px]"
      } ${className ?? ""}`}
    >
      <motion.div
        layoutId={layoutId}
        className={`relative overflow-hidden rounded-[2px] bg-[var(--surface)] ${
          isPoster ? "aspect-[2/3]" : "aspect-[16/9]"
        }`}
        whileHover={
          prefersReduced
            ? undefined
            : {
                scale: 1.08,
                zIndex: 10,
                transition: { duration: 0.28, ease: easeOut },
              }
        }
        whileFocus={
          prefersReduced
            ? undefined
            : {
                scale: 1.08,
                zIndex: 10,
                transition: { duration: 0.28, ease: easeOut },
              }
        }
        style={{ transformOrigin: "center center" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {isPoster ? (
          <span
            className="absolute left-1.5 top-1.5 z-10 flex h-5 w-3.5 items-center justify-center rounded-[1px] bg-[var(--accent)] font-[family-name:var(--font-bebas)] text-[11px] leading-none text-white shadow-sm"
            aria-hidden
          >
            {brandMark.charAt(0).toUpperCase()}
          </span>
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-2.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:p-3">
          <p className="line-clamp-2 text-sm font-semibold leading-tight text-white">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--text-muted)]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </motion.div>
    </Link>
  );
}
