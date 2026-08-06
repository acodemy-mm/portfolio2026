"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="no-print mt-20 border-t border-white/10 bg-black/40">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-8">
        <div>
          <p className="font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-[var(--accent)]">
            {settings.name.split(" ")[0]?.toUpperCase()}
          </p>
          <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
            {settings.role}. {settings.tagline}
          </p>
        </div>

        <div className="flex flex-wrap gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-white">Explore</p>
            <Link href="/work" className="text-[var(--text-muted)] hover:text-white">
              My Work
            </Link>
            <Link href="/articles" className="text-[var(--text-muted)] hover:text-white">
              Articles
            </Link>
            <Link href="/resume" className="text-[var(--text-muted)] hover:text-white">
              Resume
            </Link>
            <Link href="/about" className="text-[var(--text-muted)] hover:text-white">
              About & Contact
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-white">Connect</p>
            {settings.socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] hover:text-white"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-4 text-center text-xs text-[var(--text-dim)]">
        © {new Date().getFullYear()} {settings.name}. Crafted with intentional motion.
      </div>
    </footer>
  );
}
