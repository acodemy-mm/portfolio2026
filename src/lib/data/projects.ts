import "server-only";

import { randomUUID } from "crypto";
import type { Project } from "@/lib/types";
import { seedData } from "@/data/seed";
import { deleteAsset, PROJECTS_BUCKET, uploadAsset } from "@/lib/supabase/assets";
import { getSupabaseAdminClient, getSupabasePublicClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { isMissingRelationError } from "@/lib/supabase/errors";
import { ensureUuid } from "@/lib/supabase/ids";

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  cover: string;
  detail_cover: string | null;
  gallery: string[] | null;
  tags: string[] | null;
  excerpt: string;
  body: string;
  featured: boolean;
  year: string;
  role: string;
  client: string | null;
  live_url: string | null;
  created_at: string;
};

function mapProject(row: ProjectRow): Project {
  return {
    _id: row.id,
    title: row.title,
    slug: row.slug,
    cover: row.cover,
    detailCover: row.detail_cover || undefined,
    gallery: row.gallery || [],
    tags: row.tags || [],
    excerpt: row.excerpt,
    body: row.body,
    featured: row.featured,
    year: row.year,
    role: row.role,
    client: row.client || undefined,
    liveUrl: row.live_url || undefined,
  };
}

async function readProjectRows(): Promise<ProjectRow[]> {
  if (!hasSupabaseEnv()) return [];
  const client = getSupabasePublicClient();
  const { data, error } = await client
    .from("projects")
    .select("*")
    .order("featured", { ascending: false })
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingRelationError(error)) return [];
    throw new Error(`Could not load projects: ${error.message}`);
  }
  return (data || []) as ProjectRow[];
}

async function writeProjectRow(id: string, patch: Partial<ProjectRow>) {
  const client = getSupabaseAdminClient();
  const { error } = await client.from("projects").update(patch).eq("id", id);
  if (error) throw new Error(`Could not update project: ${error.message}`);
}

export async function readProjectsFile(): Promise<Project[]> {
  const rows = await readProjectRows();
  return rows.map(mapProject);
}

export async function writeProjectsFile(projects: Project[]) {
  const client = getSupabaseAdminClient();
  const payload = projects.map((project) => ({
    id: ensureUuid(project._id),
    title: project.title,
    slug: project.slug,
    cover: project.cover,
    detail_cover: project.detailCover || null,
    gallery: project.gallery || [],
    tags: project.tags || [],
    excerpt: project.excerpt,
    body: project.body,
    featured: project.featured,
    year: project.year,
    role: project.role,
    client: project.client || null,
    live_url: project.liveUrl || null,
  }));
  const { error } = await client.from("projects").upsert(payload, { onConflict: "id" });
  if (error) throw new Error(`Could not write projects: ${error.message}`);
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

async function deleteProjectUploads(project: Project) {
  const urls = [
    project.cover,
    project.detailCover,
    ...(project.gallery || []),
  ].filter(Boolean) as string[];
  await Promise.all(urls.map((u) => deleteAsset(u)));
}

export async function createProject(
  input: ProjectInput,
  files: ProjectFiles = {},
): Promise<Project> {
  const storedRows = await readProjectRows();
  const projects = storedRows.map(mapProject);
  const slug = slugify(input.slug || input.title);
  if (!slug) throw new Error("Title or slug is required");
  if (projects.some((p) => p.slug === slug)) {
    throw new Error("A project with this slug already exists");
  }

  let cover = input.coverUrl || "";
  if (files.poster && files.poster.size > 0) {
    cover = await uploadAsset(PROJECTS_BUCKET, files.poster, "projects");
  }
  if (!cover) throw new Error("Movie poster cover is required");

  let detailCover = input.detailCoverUrl || "";
  if (files.detailCover && files.detailCover.size > 0) {
    detailCover = await uploadAsset(PROJECTS_BUCKET, files.detailCover, "projects");
  }
  if (!detailCover) detailCover = cover;

  const gallery: string[] = [];
  if (files.gallery?.length) {
    for (const file of files.gallery) {
      if (file.size > 0) {
        gallery.push(await uploadAsset(PROJECTS_BUCKET, file, "projects"));
      }
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

  if (storedRows.length === 0) {
    await writeProjectsFile([...seedData.projects, project]);
  } else {
    const client = getSupabaseAdminClient();
    const payload = {
      id: project._id,
      title: project.title,
      slug: project.slug,
      cover: project.cover,
      detail_cover: project.detailCover || null,
      gallery: project.gallery || [],
      tags: project.tags,
      excerpt: project.excerpt,
      body: project.body,
      featured: project.featured,
      year: project.year,
      role: project.role,
      client: project.client || null,
      live_url: project.liveUrl || null,
    };
    const { error } = await client.from("projects").insert(payload);
    if (error) throw new Error(`Could not create project: ${error.message}`);
  }
  return project;
}

export async function updateProject(
  id: string,
  input: ProjectInput,
  files: ProjectFiles = {},
): Promise<Project> {
  const storedRows = await readProjectRows();
  let projects = storedRows.map(mapProject);
  if (projects.length === 0) projects = [...seedData.projects];
  const existing = projects.find((p) => p._id === id);
  if (!existing) throw new Error("Project not found");

  const slug = slugify(input.slug || input.title || existing.slug);
  if (projects.some((p) => p._id !== id && p.slug === slug)) {
    throw new Error("A project with this slug already exists");
  }

  let cover = existing.cover;
  if (files.poster && files.poster.size > 0) {
    const nextCover = await uploadAsset(PROJECTS_BUCKET, files.poster, "projects");
    await deleteAsset(existing.cover);
    cover = nextCover;
  } else if (input.coverUrl && input.coverUrl !== existing.cover) {
    await deleteAsset(existing.cover);
    cover = input.coverUrl;
  }

  let detailCover = existing.detailCover || existing.cover;
  if (files.detailCover && files.detailCover.size > 0) {
    const nextDetail = await uploadAsset(
      PROJECTS_BUCKET,
      files.detailCover,
      "projects",
    );
    if (existing.detailCover && existing.detailCover !== existing.cover) {
      await deleteAsset(existing.detailCover);
    }
    detailCover = nextDetail;
  } else if (input.detailCoverUrl && input.detailCoverUrl !== detailCover) {
    if (existing.detailCover && existing.detailCover !== existing.cover) {
      await deleteAsset(existing.detailCover);
    }
    detailCover = input.detailCoverUrl;
  }

  let gallery = existing.gallery ? [...existing.gallery] : [];
  if (input.galleryUrls !== undefined) {
    gallery = parseGalleryUrls(input.galleryUrls);
  }
  if (files.gallery?.length) {
    for (const file of files.gallery) {
      if (file.size > 0) {
        gallery.push(await uploadAsset(PROJECTS_BUCKET, file, "projects"));
      }
    }
  }

  const previousGallery = existing.gallery || [];
  for (const url of previousGallery) {
    if (!gallery.includes(url)) await deleteAsset(url);
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
  if (storedRows.length === 0) {
    await writeProjectsFile(projects.map((project) => (project._id === id ? updated : project)));
  } else {
    await writeProjectRow(id, {
      title: updated.title,
      slug: updated.slug,
      cover: updated.cover,
      detail_cover: updated.detailCover || null,
      gallery: updated.gallery || [],
      tags: updated.tags,
      excerpt: updated.excerpt,
      body: updated.body,
      featured: updated.featured,
      year: updated.year,
      role: updated.role,
      client: updated.client || null,
      live_url: updated.liveUrl || null,
    });
  }
  return updated;
}

export async function deleteProject(id: string) {
  const storedRows = await readProjectRows();
  let projects = storedRows.map(mapProject);
  if (projects.length === 0) projects = [...seedData.projects];
  const existing = projects.find((p) => p._id === id);
  if (!existing) throw new Error("Project not found");
  if (storedRows.length === 0) {
    await writeProjectsFile(projects.filter((p) => p._id !== id));
  } else {
    const client = getSupabaseAdminClient();
    const { error } = await client.from("projects").delete().eq("id", id);
    if (error) throw new Error(`Could not delete project: ${error.message}`);
  }
  await deleteProjectUploads(existing);
}
