"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/motion/primitives";
import { richTextToHtml } from "@/lib/html";
import type { ActivityItem } from "@/lib/types";

function formatActivityTime(date: string) {
  const parts = date.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m) return date;
  const dt = new Date(y, m - 1, d || 1);
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: d ? "numeric" : undefined,
  });
}

function isExternalLink(href: string) {
  return /^https?:\/\//i.test(href);
}

export function ActivityDetail({ item }: { item: ActivityItem }) {
  const bodyHtml = richTextToHtml(item.summary || "");

  return (
    <article>
      <section className="relative min-h-[45vh] overflow-hidden pt-[var(--nav-height)] md:min-h-[55vh]">
        <div className="absolute inset-0">
          {item.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumbnail}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[var(--surface-hover)]" />
          )}
          <div className="billboard-gradient absolute inset-0" />
        </div>

        <div className="relative z-10 flex min-h-[45vh] items-end px-4 pb-14 md:min-h-[55vh] md:px-12 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              {item.type}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-bebas)] text-5xl tracking-wide text-white md:text-7xl">
              {item.title}
            </h1>
            <time
              dateTime={item.date}
              className="mt-4 block text-sm text-[var(--text-muted)]"
            >
              {formatActivityTime(item.date)}
            </time>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
        <ScrollReveal>
          {bodyHtml ? (
            <div
              className="prose-portable"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : (
            <p className="text-base text-[var(--text-dim)]">
              No additional details for this activity yet.
            </p>
          )}
        </ScrollReveal>

        <ScrollReveal className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/activity" variant="secondary">
            ← Back to Activity
          </ButtonLink>
          {item.link ? (
            isExternalLink(item.link) ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:bg-[var(--accent-hover)] active:scale-[0.97]"
              >
                Open related link
              </a>
            ) : (
              <ButtonLink href={item.link}>Open related link</ButtonLink>
            )
          ) : null}
        </ScrollReveal>

        <p className="mt-8 text-sm text-[var(--text-dim)]">
          <Link href="/activity" className="hover:text-white">
            All activity
          </Link>
        </p>
      </div>
    </article>
  );
}
