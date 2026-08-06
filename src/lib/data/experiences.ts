import "server-only";

import { randomUUID } from "crypto";
import { seedData } from "@/data/seed";
import type { EmploymentType, Experience, WorkMode } from "@/lib/types";
import { deleteAsset, EXPERIENCES_BUCKET, uploadAsset } from "@/lib/supabase/assets";
import { getSupabaseAdminClient, getSupabasePublicClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { ensureUuid } from "@/lib/supabase/ids";

type ExperienceRow = {
  id: string;
  company: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  employment_type: EmploymentType;
  work_mode: WorkMode;
  company_logo: string | null;
  description: string;
  highlights: string[] | null;
  created_at: string;
};

function isMissingRelationError(error: { code?: string } | null) {
  return error?.code === "42P01";
}

function mapExperience(row: ExperienceRow): Experience {
  return {
    _id: row.id,
    company: row.company,
    title: row.title,
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date || undefined,
    current: row.current,
    employmentType: row.employment_type,
    workMode: row.work_mode,
    companyLogo: row.company_logo || undefined,
    description: row.description,
    highlights: row.highlights || [],
  };
}

async function readExperienceRows(): Promise<ExperienceRow[]> {
  if (!hasSupabaseEnv()) return [];
  const client = getSupabasePublicClient();
  const { data, error } = await client
    .from("experiences")
    .select("*")
    .order("current", { ascending: false })
    .order("start_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingRelationError(error)) return [];
    throw new Error(`Could not load experiences: ${error.message}`);
  }
  return (data || []) as ExperienceRow[];
}

export async function readExperiencesFile(): Promise<Experience[]> {
  const rows = await readExperienceRows();
  return rows.map(mapExperience);
}

export async function writeExperiencesFile(items: Experience[]) {
  const client = getSupabaseAdminClient();
  const payload = items.map((item) => ({
    id: ensureUuid(item._id),
    company: item.company,
    title: item.title,
    location: item.location,
    start_date: item.startDate,
    end_date: item.endDate || null,
    current: item.current,
    employment_type: item.employmentType,
    work_mode: item.workMode,
    company_logo: item.companyLogo || null,
    description: item.description,
    highlights: item.highlights || [],
  }));
  const { error } = await client
    .from("experiences")
    .upsert(payload, { onConflict: "id" });
  if (error) throw new Error(`Could not write experiences: ${error.message}`);
}

export async function getStoredExperiences(): Promise<Experience[]> {
  const stored = await readExperiencesFile();
  if (stored.length > 0) return stored;
  return seedData.experiences;
}

export type ExperienceInput = {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: string | boolean;
  employmentType?: string;
  workMode?: string;
  description?: string;
  highlights?: string;
  companyLogoUrl?: string;
};

function parseBool(v?: string | boolean) {
  if (typeof v === "boolean") return v;
  return v === "true" || v === "on" || v === "1";
}

function parseHighlights(raw?: string) {
  if (!raw) return [] as string[];
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

const EMPLOYMENT: EmploymentType[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
];
const MODES: WorkMode[] = ["On-site", "Hybrid", "Remote"];

function asEmployment(v?: string): EmploymentType {
  return EMPLOYMENT.includes(v as EmploymentType)
    ? (v as EmploymentType)
    : "Full-time";
}

function asMode(v?: string): WorkMode {
  return MODES.includes(v as WorkMode) ? (v as WorkMode) : "On-site";
}

async function deleteLogo(url?: string) {
  await deleteAsset(url);
}

function sortExperiences(items: Experience[]) {
  return [...items].sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    return (b.startDate || "").localeCompare(a.startDate || "");
  });
}

export async function createExperience(
  input: ExperienceInput,
  logoFile?: File | null,
): Promise<Experience> {
  const storedRows = await readExperienceRows();
  if (!input.title.trim() || !input.company.trim()) {
    throw new Error("Title and company are required");
  }
  if (!input.startDate) throw new Error("Start date is required");

  let companyLogo = input.companyLogoUrl || "";
  if (logoFile && logoFile.size > 0) {
    companyLogo = await uploadAsset(EXPERIENCES_BUCKET, logoFile, "experiences");
  }

  const exp: Experience = {
    _id: randomUUID(),
    title: input.title.trim(),
    company: input.company.trim(),
    location: (input.location || "").trim(),
    startDate: input.startDate,
    endDate: parseBool(input.current) ? undefined : input.endDate || undefined,
    current: parseBool(input.current),
    employmentType: asEmployment(input.employmentType),
    workMode: asMode(input.workMode),
    companyLogo: companyLogo || undefined,
    description: (input.description || "").trim(),
    highlights: parseHighlights(input.highlights),
  };

  if (storedRows.length === 0) {
    const next = sortExperiences([...seedData.experiences, exp]);
    await writeExperiencesFile(next);
  } else {
    const client = getSupabaseAdminClient();
    const payload = {
      id: exp._id,
      company: exp.company,
      title: exp.title,
      location: exp.location,
      start_date: exp.startDate,
      end_date: exp.endDate || null,
      current: exp.current,
      employment_type: exp.employmentType,
      work_mode: exp.workMode,
      company_logo: exp.companyLogo || null,
      description: exp.description,
      highlights: exp.highlights,
    };
    const { error } = await client.from("experiences").insert(payload);
    if (error) throw new Error(`Could not create experience: ${error.message}`);
  }
  return exp;
}

export async function updateExperience(
  id: string,
  input: ExperienceInput,
  logoFile?: File | null,
): Promise<Experience> {
  const storedRows = await readExperienceRows();
  let items = storedRows.map(mapExperience);
  if (items.length === 0) items = [...seedData.experiences];
  const index = items.findIndex((e) => e._id === id);
  if (index < 0) throw new Error("Experience not found");

  const existing = items[index]!;
  let companyLogo = existing.companyLogo;
  if (logoFile && logoFile.size > 0) {
    const next = await uploadAsset(EXPERIENCES_BUCKET, logoFile, "experiences");
    await deleteLogo(existing.companyLogo);
    companyLogo = next;
  } else if (
    input.companyLogoUrl !== undefined &&
    input.companyLogoUrl !== existing.companyLogo
  ) {
    await deleteLogo(existing.companyLogo);
    companyLogo = input.companyLogoUrl || undefined;
  }

  const updated: Experience = {
    ...existing,
    title: (input.title || existing.title).trim(),
    company: (input.company || existing.company).trim(),
    location:
      input.location !== undefined
        ? input.location.trim()
        : existing.location,
    startDate: input.startDate || existing.startDate,
    current:
      input.current !== undefined ? parseBool(input.current) : existing.current,
    endDate:
      input.current !== undefined && parseBool(input.current)
        ? undefined
        : input.endDate !== undefined
          ? input.endDate || undefined
          : existing.endDate,
    employmentType: input.employmentType
      ? asEmployment(input.employmentType)
      : existing.employmentType,
    workMode: input.workMode ? asMode(input.workMode) : existing.workMode,
    companyLogo,
    description:
      input.description !== undefined
        ? input.description.trim()
        : existing.description,
    highlights:
      input.highlights !== undefined
        ? parseHighlights(input.highlights)
        : existing.highlights,
  };

  items[index] = updated;
  if (storedRows.length === 0) {
    await writeExperiencesFile(sortExperiences(items));
  } else {
    const client = getSupabaseAdminClient();
    const payload = {
      company: updated.company,
      title: updated.title,
      location: updated.location,
      start_date: updated.startDate,
      end_date: updated.endDate || null,
      current: updated.current,
      employment_type: updated.employmentType,
      work_mode: updated.workMode,
      company_logo: updated.companyLogo || null,
      description: updated.description,
      highlights: updated.highlights,
    };
    const { error } = await client
      .from("experiences")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(`Could not update experience: ${error.message}`);
  }
  return updated;
}

export async function deleteExperience(id: string) {
  const storedRows = await readExperienceRows();
  let items = storedRows.map(mapExperience);
  if (items.length === 0) items = [...seedData.experiences];
  const existing = items.find((e) => e._id === id);
  if (!existing) throw new Error("Experience not found");
  if (storedRows.length === 0) {
    await writeExperiencesFile(items.filter((e) => e._id !== id));
  } else {
    const client = getSupabaseAdminClient();
    const { error } = await client.from("experiences").delete().eq("id", id);
    if (error) throw new Error(`Could not delete experience: ${error.message}`);
  }
  await deleteLogo(existing.companyLogo);
}
