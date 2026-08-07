"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Article } from "@/lib/types";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type Props = { mode: "create" | "edit"; initial?: Article };

export function ArticleForm({ mode, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [tags, setTags] = useState((initial?.tags || []).join(", "));
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [body, setBody] = useState(initial?.body || "");
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt || new Date().toISOString().slice(0, 10),
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const coverPreview = useMemo(() => {
    if (coverFile) return URL.createObjectURL(coverFile);
    return initial?.cover || "";
  }, [coverFile, initial?.cover]);

  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData();
    form.set("title", title);
    form.set("slug", slug);
    form.set("tags", tags);
    form.set("excerpt", excerpt);
    form.set("body", body);
    form.set("publishedAt", publishedAt);
    if (initial?.cover) form.set("coverUrl", initial.cover);
    if (coverFile) form.set("cover", coverFile);

    try {
      const url =
        mode === "create"
          ? "/api/admin/articles"
          : `/api/admin/articles/${initial!._id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        body: form,
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message || "Save failed");
        return;
      }
      router.replace("/admin/articles");
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
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Title
          </span>
          <input
            required
            className={field}
            value={title}
            onChange={(e) => {
              const next = e.target.value;
              setTitle(next);
              if (!slugTouched) setSlug(slugify(next));
            }}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Slug
          </span>
          <input
            required
            className={field}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Published (YYYY-MM-DD)
          </span>
          <input
            required
            className={field}
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            placeholder="2025-10-02"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Tags (comma-separated)
          </span>
          <input
            className={field}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Motion, UX, Frontend"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Excerpt
          </span>
          <textarea
            rows={3}
            className={field}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Body
          </span>
          <textarea
            rows={10}
            className={field}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Cover image
            {mode === "create" && !initial?.cover ? " (required)" : ""}
          </span>
          <input
            type="file"
            accept="image/*"
            required={mode === "create" && !initial?.cover}
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-[var(--text-muted)] file:mr-3 file:rounded-sm file:border-0 file:bg-[var(--accent)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverPreview}
              alt=""
              className="mt-3 aspect-video w-full max-w-md rounded-sm object-cover"
            />
          ) : null}
        </label>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-sm bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading
            ? "Saving…"
            : mode === "create"
              ? "Create article"
              : "Save changes"}
        </button>
        <Link
          href="/admin/articles"
          className="rounded-sm border border-white/15 px-5 py-2.5 text-sm text-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
