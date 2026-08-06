"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Project } from "@/lib/types";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type Props = {
  mode: "create" | "edit";
  initial?: Project;
};

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
          className="mt-3 h-40 w-auto max-w-full rounded-sm object-cover"
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

export function ProjectForm({ mode, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [tags, setTags] = useState(initial?.tags.join(", ") || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [body, setBody] = useState(initial?.body || "");
  const [year, setYear] = useState(
    initial?.year || String(new Date().getFullYear()),
  );
  const [role, setRole] = useState(initial?.role || "");
  const [client, setClient] = useState(initial?.client || "");
  const [liveUrl, setLiveUrl] = useState(initial?.liveUrl || "");
  const [featured, setFeatured] = useState(initial?.featured || false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [detailFile, setDetailFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [keptGallery, setKeptGallery] = useState<string[]>(
    initial?.gallery || [],
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const posterPreview = useMemo(() => {
    if (posterFile) return URL.createObjectURL(posterFile);
    return initial?.cover || "";
  }, [posterFile, initial?.cover]);

  const detailPreview = useMemo(() => {
    if (detailFile) return URL.createObjectURL(detailFile);
    return initial?.detailCover || initial?.cover || "";
  }, [detailFile, initial?.detailCover, initial?.cover]);

  const newGalleryPreviews = useMemo(
    () => galleryFiles.map((f) => URL.createObjectURL(f)),
    [galleryFiles],
  );

  useEffect(() => {
    return () => {
      if (posterPreview.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
    };
  }, [posterPreview]);

  useEffect(() => {
    return () => {
      if (detailPreview.startsWith("blob:")) URL.revokeObjectURL(detailPreview);
    };
  }, [detailPreview]);

  useEffect(() => {
    return () => {
      newGalleryPreviews.forEach((u) => {
        if (u.startsWith("blob:")) URL.revokeObjectURL(u);
      });
    };
  }, [newGalleryPreviews]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

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
    form.set("year", year);
    form.set("role", role);
    form.set("client", client);
    form.set("liveUrl", liveUrl);
    form.set("featured", featured ? "true" : "false");
    if (initial?.cover) form.set("coverUrl", initial.cover);
    if (initial?.detailCover) form.set("detailCoverUrl", initial.detailCover);
    form.set("galleryUrls", JSON.stringify(keptGallery));
    if (posterFile) form.set("poster", posterFile);
    if (detailFile) form.set("detailCover", detailFile);
    galleryFiles.forEach((f) => form.append("gallery", f));

    try {
      const url =
        mode === "create"
          ? "/api/admin/projects"
          : `/api/admin/projects/${initial!._id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        body: form,
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message || "Save failed");
        return;
      }
      router.replace("/admin/projects");
      router.refresh();
    } catch {
      setError("Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Title
          </span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-sm border border-white/15 bg-[var(--surface)] px-3 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Slug
          </span>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="w-full rounded-sm border border-white/15 bg-[var(--surface)] px-3 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Year
          </span>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded-sm border border-white/15 bg-[var(--surface)] px-3 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Role
          </span>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-sm border border-white/15 bg-[var(--surface)] px-3 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Client
          </span>
          <input
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="w-full rounded-sm border border-white/15 bg-[var(--surface)] px-3 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Tags (comma-separated)
          </span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Product Design, Next.js"
            className="w-full rounded-sm border border-white/15 bg-[var(--surface)] px-3 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Live URL
          </span>
          <input
            type="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            className="w-full rounded-sm border border-white/15 bg-[var(--surface)] px-3 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Excerpt
          </span>
          <textarea
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full rounded-sm border border-white/15 bg-[var(--surface)] px-3 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Body
          </span>
          <textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-sm border border-white/15 bg-[var(--surface)] px-3 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>

        <div className="md:col-span-2 border-t border-white/10 pt-5">
          <p className="mb-4 font-semibold text-white">Project photos</p>
        </div>

        <FileField
          label="Movie poster cover"
          hint="Vertical poster used in Netflix-style rows and work cards."
          required={mode === "create" && !initial?.cover}
          previewUrl={posterPreview}
          onChange={(files) => setPosterFile(files?.[0] || null)}
        />

        <FileField
          label="Project detail cover"
          hint="Wide hero image shown at the top of the project detail page. Falls back to the poster if omitted."
          previewUrl={detailPreview}
          onChange={(files) => setDetailFile(files?.[0] || null)}
        />

        <FileField
          label="Gallery photos"
          hint="Additional images for the project gallery. You can select multiple."
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

        <label className="flex items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Featured project
        </label>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-sm bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {loading
            ? "Saving…"
            : mode === "create"
              ? "Create project"
              : "Save changes"}
        </button>
        <Link
          href="/admin/projects"
          className="rounded-sm border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/10"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
