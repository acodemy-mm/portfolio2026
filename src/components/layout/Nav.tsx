"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "My Work" },
  { href: "/activity", label: "Activity" },
  { href: "/articles", label: "Articles" },
  { href: "/about", label: "About & Contact" },
];

export function Nav({ brand }: { brand: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 24);
  });

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/about") {
      return pathname.startsWith("/about") || pathname.startsWith("/contact");
    }
    return pathname.startsWith(href);
  };

  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter] duration-300 ${
        scrolled || open
          ? "bg-black/90 backdrop-blur-md"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[var(--nav-height)] max-w-[1600px] items-center justify-between gap-4 px-4 md:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-bebas)] text-2xl tracking-[0.06em] text-[var(--accent)] md:text-3xl"
        >
          {brand.split(" ")[0]?.toUpperCase() ?? "PORTFOLIO"}
        </Link>

        <ul className="hidden items-center gap-1 lg:flex xl:gap-2">
          {links.map((link) => (
            <li key={link.href} className="relative">
              <Link
                href={link.href}
                className={`relative px-2.5 py-2 text-[13px] font-medium transition-colors xl:text-sm ${
                  isActive(link.href)
                    ? "text-white"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                {link.label}
                {isActive(link.href) ? (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-[var(--accent)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/resume"
          className="hidden rounded-sm bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white transition-transform hover:bg-[var(--accent-hover)] active:scale-[0.97] lg:inline-block"
        >
          Resume
        </Link>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="flex w-5 flex-col gap-1.5">
            <span
              className={`block h-0.5 bg-white transition ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 bg-white transition ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 bg-white transition ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </div>
        </button>
      </nav>

      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/10 bg-black/95 px-4 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-sm px-3 py-3 text-base ${
                    isActive(link.href)
                      ? "bg-white/10 text-white"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/resume"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-sm bg-[var(--accent)] px-3 py-3 text-center font-semibold text-white"
              >
                Resume
              </Link>
            </li>
          </ul>
        </motion.div>
      ) : null}
    </header>
  );
}
