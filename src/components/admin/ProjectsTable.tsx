"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Project } from "@/lib/types";

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onDelete(id: string, title: string) {
    if (!confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
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

  if (projects.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-white/15 p-8 text-center text-[var(--text-muted)]">
        No projects yet.{" "}
        <Link href="/admin/projects/new" className="text-[var(--accent)]">
          Add your first project
        </Link>
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wider text-[var(--text-dim)]">
          <tr>
            <th className="px-4 py-3">Poster</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Year</th>
            <th className="px-4 py-3">Featured</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p._id} className="border-t border-white/10">
              <td className="px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.cover}
                  alt=""
                  className="h-12 w-20 rounded-sm object-cover"
                />
              </td>
              <td className="px-4 py-3 font-medium text-white">{p.title}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{p.year}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">
                {p.featured ? "Yes" : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/projects/${p._id}`}
                    className="rounded-sm bg-white/10 px-3 py-1.5 text-xs hover:bg-white/15"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === p._id}
                    onClick={() => onDelete(p._id, p.title)}
                    className="rounded-sm bg-red-600/80 px-3 py-1.5 text-xs hover:bg-red-600 disabled:opacity-50"
                  >
                    {busyId === p._id ? "…" : "Delete"}
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
