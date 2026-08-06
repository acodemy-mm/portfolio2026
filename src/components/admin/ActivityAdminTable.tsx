"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ActivityItem } from "@/lib/types";

export function ActivityAdminTable({ items }: { items: ActivityItem[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onDelete(id: string, title: string) {
    if (!confirm(`Delete “${title}”?`)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/activity/${id}`, { method: "DELETE" });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !json.ok) {
        alert(json.message || "Delete failed");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wider text-[var(--text-dim)]">
          <tr>
            <th className="px-4 py-3">Thumb</th>
            <th className="px-4 py-3">Heading</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a._id} className="border-t border-white/10">
              <td className="px-4 py-3">
                {a.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.thumbnail}
                    alt=""
                    className="h-12 w-20 rounded-sm object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-20 items-center justify-center rounded-sm bg-white/5 text-[10px] uppercase text-[var(--text-dim)]">
                    none
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-medium text-white">{a.title}</td>
              <td className="px-4 py-3 uppercase text-[var(--accent)]">{a.type}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{a.date}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/activity/${a._id}`}
                    className="rounded-sm bg-white/10 px-3 py-1.5 text-xs"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === a._id}
                    onClick={() => onDelete(a._id, a.title)}
                    className="rounded-sm bg-red-600/80 px-3 py-1.5 text-xs text-white"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
