import Link from "next/link";
import type { ActivityItem } from "@/lib/types";
import { htmlToPlainText } from "@/lib/html";

function formatActivityTime(date: string) {
  // Accept YYYY-MM-DD or YYYY-MM
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

export function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <Link
      href={`/activity/${item._id}`}
      className="group flex w-[70vw] max-w-[280px] shrink-0 flex-col overflow-hidden rounded-[2px] border border-white/10 bg-[var(--surface)] transition hover:border-white/25 hover:bg-[var(--surface-hover)] sm:w-[45vw] md:w-[22vw] md:max-w-[260px]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black/40">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt=""
            className="absolute inset-0 !h-full !w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full min-h-[120px] items-center justify-center bg-[var(--surface-hover)]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              {item.type}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">
          {item.type}
        </p>
        <h3 className="mt-1.5 text-base font-semibold leading-snug text-white">
          {item.title}
        </h3>
        {item.summary ? (
          <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-[var(--text-muted)]">
            {htmlToPlainText(item.summary)}
          </p>
        ) : null}
        <time
          dateTime={item.date}
          className="mt-3 text-[11px] text-[var(--text-dim)]"
        >
          {formatActivityTime(item.date)}
        </time>
      </div>
    </Link>
  );
}
