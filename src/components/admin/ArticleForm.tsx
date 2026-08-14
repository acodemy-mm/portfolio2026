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

function FileField({
  label,
  hint,
  required,
  acceptMultiple,
  previewUrl,
  previewUrls,
  onChange,
  onRemoveGalleryIndex,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  acceptMultiple?: boolean;
  previewUrl?: string;
  previewUrls?: string[];
  onChange: (files: FileList | null) => void;
  onRemoveGalleryIndex?: (index: number) => void;
}) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
        {label}
        {required ? " (required)" : ""}
      </span>
      {hint ? (
        <span className="mb-2 block text-xs text-[var(--text-muted)]">{hint}</span>
      ) : null}
      <input
        type="file"
        accept="image/*"
        multiple={acceptMultiple}
        required={required}
        onChange={(e) => onChange(e.target.files)}
        className="block w-full text-sm text-[var(--text-muted)] file:mr-3 file:rounded-sm file:border-0 file:bg-[var(--accent)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
      />
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt=""
          className="mt-3 aspect-video w-full max-w-md rounded-sm object-cover"
        />
      ) : null}
      {previewUrls && previewUrls.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {previewUrls.map((url, i) => (
            <div key={`${url}-${i}`} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="aspect-[4/3] w-full rounded-sm object-cover"
              />
              {onRemoveGalleryIndex ? (
                <button
                  type="button"
                  onClick={() => onRemoveGalleryIndex(i)}
                  className="absolute right-1 top-1 rounded-sm bg-black/70 px-1.5 py-0.5 text-[10px] text-white"
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </label>
  );
}

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
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [keptGallery, setKeptGallery] = useState<string[]>(
    initial?.gallery || [],
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const coverPreview = useMemo(() => {
    if (coverFile) return URL.createObjectURL(coverFile);
    return initial?.cover || "";
  }, [coverFile, initial?.cover]);

  const newGalleryPreviews = useMemo(
    () => galleryFiles.map((f) => URL.createObjectURL(f)),
    [galleryFiles],
  );

  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  useEffect(() => {
    return () => {
      newGalleryPreviews.forEach((u) => {
        if (u.startsWith("blob:")) URL.revokeObjectURL(u);
      });
    };
  }, [newGalleryPreviews]);

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
    form.set("galleryUrls", JSON.stringify(keptGallery));
    if (coverFile) form.set("cover", coverFile);
    galleryFiles.forEach((f) => form.append("gallery", f));

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
            Body (HTML)
          </span>
          <span className="mb-2 block text-xs text-[var(--text-muted)]">
            Use HTML for headings, lists, links, and inline images. Plain text is
            wrapped into paragraphs automatically.
          </span>
          <textarea
            rows={14}
            className={`${field} font-mono text-sm`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="<p>Opening paragraph.</p>&#10;<h2>Section</h2>&#10;<p>More copy with <strong>emphasis</strong>.</p>"
          />
        </label>

        <div className="md:col-span-2 border-t border-white/10 pt-5">
          <p className="mb-4 font-semibold text-white">Article photos</p>
        </div>

        <FileField
          label="Cover image"
          hint="Hero image at the top of the article detail page."
          required={mode === "create" && !initial?.cover}
          previewUrl={coverPreview}
          onChange={(files) => setCoverFile(files?.[0] || null)}
        />

        <FileField
          label="More photos"
          hint="Additional images shown in the More photos section. You can select multiple."
          acceptMultiple
          previewUrls={[...keptGallery, ...newGalleryPreviews]}
          onChange={(files) =>
            setGalleryFiles(files ? Array.from(files) : [])
          }
          onRemoveGalleryIndex={(index) => {
            if (index < keptGallery.length) {
              setKeptGallery((prev) => prev.filter((_, i) => i !== index));
            } else {
              const fileIndex = index - keptGallery.length;
              setGalleryFiles((prev) => prev.filter((_, i) => i !== fileIndex));
            }
          }}
        />
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
