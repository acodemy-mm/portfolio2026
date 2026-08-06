"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatExperienceRange } from "@/lib/dates";
import type { Experience } from "@/lib/types";

export function ExperiencesAdminTable({
  experiences,
}: {
  experiences: Experience[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onDelete(id: string, title: string) {
    if (!confirm(`Delete “${title}”?`)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/experiences/${id}`, {
        method: "DELETE",
      });
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
            <th className="px-4 py-3">Logo</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Dates</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {experiences.map((e) => (
            <tr key={e._id} className="border-t border-white/10">
              <td className="px-4 py-3">
                {e.companyLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.companyLogo}
                    alt=""
                    className="h-10 w-10 rounded-sm object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-[var(--accent)]/20 text-sm text-[var(--accent)]">
                    {e.company.charAt(0)}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-medium text-white">{e.title}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">
                {e.company} · {e.employmentType}
              </td>
              <td className="px-4 py-3 text-[var(--text-muted)]">
                {formatExperienceRange(e.startDate, e.endDate, e.current)}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/experiences/${e._id}`}
                    className="rounded-sm bg-white/10 px-3 py-1.5 text-xs"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === e._id}
                    onClick={() => onDelete(e._id, e.title)}
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
