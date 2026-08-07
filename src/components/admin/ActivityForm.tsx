"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import type { ActivityItem } from "@/lib/types";

type Props = { mode: "create" | "edit"; initial?: ActivityItem };

export function ActivityForm({ mode, initial }: Props) {
  const router = useRouter();
  const [type, setType] = useState<ActivityItem["type"]>(
    initial?.type || "ship",
  );
  const [title, setTitle] = useState(initial?.title || "");
  const [date, setDate] = useState(initial?.date || "");
  const [summary, setSummary] = useState(initial?.summary || "");
  const [link, setLink] = useState(initial?.link || "");
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const thumbPreview = useMemo(() => {
    if (thumbFile) return URL.createObjectURL(thumbFile);
    return initial?.thumbnail || "";
  }, [thumbFile, initial?.thumbnail]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData();
    form.set("type", type);
    form.set("title", title);
    form.set("date", date);
    form.set("summary", summary);
    form.set("link", link);
    if (initial?.thumbnail) form.set("thumbnailUrl", initial.thumbnail);
    if (thumbFile) form.set("thumbnail", thumbFile);

    try {
      const url =
        mode === "create"
          ? "/api/admin/activity"
          : `/api/admin/activity/${initial!._id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        body: form,
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message || "Save failed");
        return;
      }
      router.replace("/admin/activity");
      router.refresh();
    } catch {
      setError("Save failed");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-sm border border-white/15 bg-[var(--surface)] px-3 py-3 outline-none focus:border-[var(--accent)]";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Type
          </span>
          <select
            className={field}
            value={type}
            onChange={(e) => setType(e.target.value as ActivityItem["type"])}
          >
            {["ship", "speak", "write", "award", "milestone"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Time / Date (YYYY-MM-DD)
          </span>
          <input
            required
            className={field}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="2025-11-12"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Heading
          </span>
          <input
            required
            className={field}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Body text
          </span>
          <textarea
            rows={4}
            className={field}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Thumbnail image
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-[var(--text-muted)] file:mr-3 file:rounded-sm file:border-0 file:bg-[var(--accent)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          {thumbPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbPreview}
              alt=""
              className="mt-3 aspect-video w-full max-w-sm rounded-sm object-cover"
            />
          ) : null}
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Related link (optional)
          </span>
          <input
            className={field}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/work/slug, /articles/slug, or https://..."
          />
          <span className="mt-1.5 block text-xs text-[var(--text-muted)]">
            Cards open the activity detail page. This link is shown as a button there.
          </span>
        </label>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-sm bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Saving…" : mode === "create" ? "Add activity" : "Save changes"}
        </button>
        <Link
          href="/admin/activity"
          className="rounded-sm border border-white/15 px-5 py-2.5 text-sm text-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
