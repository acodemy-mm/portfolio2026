"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import type { Experience } from "@/lib/types";

type Props = { mode: "create" | "edit"; initial?: Experience };

export function ExperienceForm({ mode, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [company, setCompany] = useState(initial?.company || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [startDate, setStartDate] = useState(initial?.startDate || "");
  const [endDate, setEndDate] = useState(initial?.endDate || "");
  const [current, setCurrent] = useState(initial?.current || false);
  const [employmentType, setEmploymentType] = useState(
    initial?.employmentType || "Full-time",
  );
  const [workMode, setWorkMode] = useState(initial?.workMode || "On-site");
  const [description, setDescription] = useState(initial?.description || "");
  const [highlights, setHighlights] = useState(
    (initial?.highlights || []).join("\n"),
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const logoPreview = useMemo(() => {
    if (logoFile) return URL.createObjectURL(logoFile);
    return initial?.companyLogo || "";
  }, [logoFile, initial?.companyLogo]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData();
    form.set("title", title);
    form.set("company", company);
    form.set("location", location);
    form.set("startDate", startDate);
    form.set("endDate", endDate);
    form.set("current", current ? "true" : "false");
    form.set("employmentType", employmentType);
    form.set("workMode", workMode);
    form.set("description", description);
    form.set("highlights", highlights);
    if (initial?.companyLogo) form.set("companyLogoUrl", initial.companyLogo);
    if (logoFile) form.set("companyLogo", logoFile);

    try {
      const url =
        mode === "create"
          ? "/api/admin/experiences"
          : `/api/admin/experiences/${initial!._id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        body: form,
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message || "Save failed");
        return;
      }
      router.replace("/admin/experiences");
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
            Job title
          </span>
          <input required className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Company
          </span>
          <input required className={field} value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Employment type
          </span>
          <select
            className={field}
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as Experience["employmentType"])}
          >
            {["Full-time", "Part-time", "Contract", "Freelance"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Start (YYYY-MM)
          </span>
          <input
            required
            placeholder="2025-11"
            className={field}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            End (YYYY-MM)
          </span>
          <input
            placeholder="2024-12"
            disabled={current}
            className={field}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-white md:col-span-2">
          <input
            type="checkbox"
            checked={current}
            onChange={(e) => setCurrent(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Currently working here
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Location
          </span>
          <input
            className={field}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Yangon, Myanmar"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Work mode
          </span>
          <select
            className={field}
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value as Experience["workMode"])}
          >
            {["On-site", "Hybrid", "Remote"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Company logo
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-[var(--text-muted)] file:mr-3 file:rounded-sm file:border-0 file:bg-[var(--accent)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          {logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoPreview} alt="" className="mt-3 h-14 w-14 rounded-sm object-cover" />
          ) : null}
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Description
          </span>
          <textarea
            rows={3}
            className={field}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--text-dim)]">
            Highlights (one per line)
          </span>
          <textarea
            rows={4}
            className={field}
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
          />
        </label>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-sm bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Saving…" : mode === "create" ? "Add experience" : "Save changes"}
        </button>
        <Link
          href="/admin/experiences"
          className="rounded-sm border border-white/15 px-5 py-2.5 text-sm text-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
