import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Project } from "@/lib/types";
import { seedData } from "@/data/seed";

const DATA_DIR = path.join(process.cwd(), "data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "projects");

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function readProjectsFile(): Promise<Project[]> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(PROJECTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Project[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeProjectsFile(projects: Project[]) {
  await ensureDirs();
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf8");
}

export async function getStoredProjects(): Promise<Project[]> {
  const stored = await readProjectsFile();
  if (stored.length > 0) return stored;
  return seedData.projects;
}

export async function getStoredProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  const projects = await getStoredProjects();
  return projects.find((p) => p.slug === slug);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type ProjectInput = {
  title: string;
  slug?: string;
  tags?: string;
  excerpt?: string;
  body?: string;
  year?: string;
  role?: string;
  client?: string;
  liveUrl?: string;
  featured?: string | boolean;
  coverUrl?: string;
  detailCoverUrl?: string;
  galleryUrls?: string;
};

export type ProjectFiles = {
  poster?: File | null;
  detailCover?: File | null;
  gallery?: File[];
};

function parseTags(tags?: string) {
  if (!tags) return [] as string[];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function parseFeatured(value?: string | boolean) {
  if (typeof value === "boolean") return value;
  return value === "true" || value === "on" || value === "1";
}

function parseGalleryUrls(raw?: string): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((u): u is string => typeof u === "string");
    }
  } catch {
    // fall through
  }
  return raw
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
}

export async function saveUploadFile(file: File): Promise<string> {
  await ensureDirs();
  const ext = path.extname(file.name) || ".jpg";
  const safeExt = ext.match(/^\.(jpe?g|png|webp|gif|avif)$/i) ? ext : ".jpg";
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${safeExt.toLowerCase()}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/projects/${filename}`;
}

export async function deleteUploadFile(url: string) {
  if (!url.startsWith("/uploads/projects/")) return;
  const filename = path.basename(url);
  const full = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(full);
  } catch {
    // ignore missing file
  }
}

async function deleteProjectUploads(project: Project) {
  const urls = [
    project.cover,
    project.detailCover,
    ...(project.gallery || []),
  ].filter(Boolean) as string[];
  await Promise.all(urls.map((u) => deleteUploadFile(u)));
}

export async function createProject(
  input: ProjectInput,
  files: ProjectFiles = {},
): Promise<Project> {
  const projects = await readProjectsFile();
  const slug = slugify(input.slug || input.title);
  if (!slug) throw new Error("Title or slug is required");
  if (projects.some((p) => p.slug === slug)) {
    throw new Error("A project with this slug already exists");
  }

  let cover = input.coverUrl || "";
  if (files.poster && files.poster.size > 0) {
    cover = await saveUploadFile(files.poster);
  }
  if (!cover) throw new Error("Movie poster cover is required");

  let detailCover = input.detailCoverUrl || "";
  if (files.detailCover && files.detailCover.size > 0) {
    detailCover = await saveUploadFile(files.detailCover);
  }
  if (!detailCover) detailCover = cover;

  const gallery: string[] = [];
  if (files.gallery?.length) {
    for (const file of files.gallery) {
      if (file.size > 0) gallery.push(await saveUploadFile(file));
    }
  }

  const project: Project = {
    _id: randomUUID(),
    title: input.title.trim(),
    slug,
    cover,
    detailCover,
    gallery,
    tags: parseTags(input.tags),
    excerpt: (input.excerpt || "").trim(),
    body: (input.body || "").trim(),
    featured: parseFeatured(input.featured),
    year: (input.year || String(new Date().getFullYear())).trim(),
    role: (input.role || "").trim(),
    client: input.client?.trim() || undefined,
    liveUrl: input.liveUrl?.trim() || undefined,
  };

  const next =
    projects.length === 0
      ? [...seedData.projects, project]
      : [...projects, project];
  await writeProjectsFile(next);
  return project;
}

export async function updateProject(
  id: string,
  input: ProjectInput,
  files: ProjectFiles = {},
): Promise<Project> {
  let projects = await readProjectsFile();
  if (projects.length === 0) {
    projects = [...seedData.projects];
  }
  const index = projects.findIndex((p) => p._id === id);
  if (index < 0) throw new Error("Project not found");

  const existing = projects[index]!;
  const slug = slugify(input.slug || input.title || existing.slug);
  if (projects.some((p, i) => i !== index && p.slug === slug)) {
    throw new Error("A project with this slug already exists");
  }

  let cover = existing.cover;
  if (files.poster && files.poster.size > 0) {
    const nextCover = await saveUploadFile(files.poster);
    if (existing.cover.startsWith("/uploads/projects/")) {
      await deleteUploadFile(existing.cover);
    }
    cover = nextCover;
  } else if (input.coverUrl) {
    cover = input.coverUrl;
  }

  let detailCover = existing.detailCover || existing.cover;
  if (files.detailCover && files.detailCover.size > 0) {
    const nextDetail = await saveUploadFile(files.detailCover);
    if (
      existing.detailCover?.startsWith("/uploads/projects/") &&
      existing.detailCover !== existing.cover
    ) {
      await deleteUploadFile(existing.detailCover);
    }
    detailCover = nextDetail;
  } else if (input.detailCoverUrl) {
    detailCover = input.detailCoverUrl;
  }

  let gallery = existing.gallery ? [...existing.gallery] : [];
  if (input.galleryUrls !== undefined) {
    gallery = parseGalleryUrls(input.galleryUrls);
  }
  if (files.gallery?.length) {
    for (const file of files.gallery) {
      if (file.size > 0) gallery.push(await saveUploadFile(file));
    }
  }

  // Delete gallery images removed from the kept list
  const previousGallery = existing.gallery || [];
  for (const url of previousGallery) {
    if (!gallery.includes(url) && url.startsWith("/uploads/projects/")) {
      await deleteUploadFile(url);
    }
  }

  const updated: Project = {
    ...existing,
    title: (input.title || existing.title).trim(),
    slug,
    cover,
    detailCover,
    gallery,
    tags: input.tags !== undefined ? parseTags(input.tags) : existing.tags,
    excerpt:
      input.excerpt !== undefined ? input.excerpt.trim() : existing.excerpt,
    body: input.body !== undefined ? input.body.trim() : existing.body,
    featured:
      input.featured !== undefined
        ? parseFeatured(input.featured)
        : existing.featured,
    year: (input.year || existing.year).trim(),
    role: (input.role || existing.role).trim(),
    client:
      input.client !== undefined
        ? input.client.trim() || undefined
        : existing.client,
    liveUrl:
      input.liveUrl !== undefined
        ? input.liveUrl.trim() || undefined
        : existing.liveUrl,
  };

  projects[index] = updated;
  await writeProjectsFile(projects);
  return updated;
}

export async function deleteProject(id: string) {
  let projects = await readProjectsFile();
  if (projects.length === 0) {
    projects = [...seedData.projects];
  }
  const existing = projects.find((p) => p._id === id);
  if (!existing) throw new Error("Project not found");
  const next = projects.filter((p) => p._id !== id);
  await writeProjectsFile(next);
  await deleteProjectUploads(existing);
}
