import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { seedData } from "@/data/seed";
import type { EmploymentType, Experience, WorkMode } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "experiences.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "experiences");

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function readExperiencesFile(): Promise<Experience[]> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Experience[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeExperiencesFile(items: Experience[]) {
  await ensureDirs();
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf8");
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

export async function saveLogoFile(file: File): Promise<string> {
  await ensureDirs();
  const ext = path.extname(file.name) || ".png";
  const safeExt = ext.match(/^\.(jpe?g|png|webp|gif|avif|svg)$/i) ? ext : ".png";
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${safeExt.toLowerCase()}`;
  await fs.writeFile(
    path.join(UPLOAD_DIR, filename),
    Buffer.from(await file.arrayBuffer()),
  );
  return `/uploads/experiences/${filename}`;
}

async function deleteLogo(url?: string) {
  if (!url?.startsWith("/uploads/experiences/")) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(url)));
  } catch {
    // ignore
  }
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
  const items = await readExperiencesFile();
  if (!input.title.trim() || !input.company.trim()) {
    throw new Error("Title and company are required");
  }
  if (!input.startDate) throw new Error("Start date is required");

  let companyLogo = input.companyLogoUrl || "";
  if (logoFile && logoFile.size > 0) {
    companyLogo = await saveLogoFile(logoFile);
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

  const base = items.length === 0 ? [...seedData.experiences] : items;
  const next = sortExperiences([...base, exp]);
  await writeExperiencesFile(next);
  return exp;
}

export async function updateExperience(
  id: string,
  input: ExperienceInput,
  logoFile?: File | null,
): Promise<Experience> {
  let items = await readExperiencesFile();
  if (items.length === 0) items = [...seedData.experiences];
  const index = items.findIndex((e) => e._id === id);
  if (index < 0) throw new Error("Experience not found");

  const existing = items[index]!;
  let companyLogo = existing.companyLogo;
  if (logoFile && logoFile.size > 0) {
    const next = await saveLogoFile(logoFile);
    await deleteLogo(existing.companyLogo);
    companyLogo = next;
  } else if (input.companyLogoUrl !== undefined) {
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
  await writeExperiencesFile(sortExperiences(items));
  return updated;
}

export async function deleteExperience(id: string) {
  let items = await readExperiencesFile();
  if (items.length === 0) items = [...seedData.experiences];
  const existing = items.find((e) => e._id === id);
  if (!existing) throw new Error("Experience not found");
  await writeExperiencesFile(items.filter((e) => e._id !== id));
  await deleteLogo(existing.companyLogo);
}
