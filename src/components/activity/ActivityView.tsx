"use client";

import Link from "next/link";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { htmlToPlainText } from "@/lib/html";
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

export function ActivityView({ items }: { items: ActivityItem[] }) {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-[calc(var(--nav-height)+2.5rem)] md:px-8">
      <ScrollReveal>
        <SectionHeading
          title="Activity"
          subtitle="Ships, talks, writing, and milestones — a living feed of the work."
        />
      </ScrollReveal>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <StaggerItem key={item._id}>
            <Link
              href={`/activity/${item._id}`}
              className="block overflow-hidden rounded-sm border border-white/10 bg-[var(--surface)] transition hover:border-white/25"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                {item.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="absolute inset-0 !h-full !w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[140px] items-center justify-center bg-[var(--surface-hover)]">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                      {item.type}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                  {item.type}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {item.title}
                </h3>
                {item.summary ? (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--text-muted)]">
                    {htmlToPlainText(item.summary)}
                  </p>
                ) : null}
                <time
                  dateTime={item.date}
                  className="mt-4 block text-xs text-[var(--text-dim)]"
                >
                  {formatActivityTime(item.date)}
                </time>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
