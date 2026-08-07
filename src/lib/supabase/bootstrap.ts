import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { seedData } from "@/data/seed";
import { writeActivityFile } from "@/lib/data/activity";
import { writeArticlesFile } from "@/lib/data/articles";
import { writeExperiencesFile } from "@/lib/data/experiences";
import { writeProjectsFile } from "@/lib/data/projects";
import type { ActivityItem, Article, Experience, Project } from "@/lib/types";
import {
  ACTIVITY_BUCKET,
  ARTICLES_BUCKET,
  EXPERIENCES_BUCKET,
  PROJECTS_BUCKET,
  parseSupabaseAssetUrl,
  uploadAsset,
} from "@/lib/supabase/assets";
import { getSupabaseAdminClient } from "@/lib/supabase/client";

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function mimeFromPath(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".avif":
      return "image/avif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "";
  }
}

type AssetBucket =
  | typeof PROJECTS_BUCKET
  | typeof EXPERIENCES_BUCKET
  | typeof ACTIVITY_BUCKET
  | typeof ARTICLES_BUCKET;

async function migrateLocalAsset(
  value: string | undefined,
  bucket: AssetBucket,
  folder: string,
) {
  if (!value || value.startsWith("http")) return value;
  if (parseSupabaseAssetUrl(value)) return value;
  if (!value.startsWith("/uploads/")) return value;
  const localPath = path.join(process.cwd(), "public", value.replace(/^\//, ""));
  if (!(await fileExists(localPath))) return value;
  const buffer = await fs.readFile(localPath);
  const file = new File([buffer], path.basename(localPath), {
    type: mimeFromPath(localPath),
  });
  return uploadAsset(bucket, file, folder);
}

async function loadProjectsSource() {
  const local = await readJsonIfExists<Project[]>(
    path.join(process.cwd(), "data", "projects.json"),
  );
  return Array.isArray(local) && local.length > 0 ? local : seedData.projects;
}

async function loadExperiencesSource() {
  const local = await readJsonIfExists<Experience[]>(
    path.join(process.cwd(), "data", "experiences.json"),
  );
  return Array.isArray(local) && local.length > 0 ? local : seedData.experiences;
}

async function loadActivitySource() {
  const local = await readJsonIfExists<ActivityItem[]>(
    path.join(process.cwd(), "data", "activity.json"),
  );
  return Array.isArray(local) && local.length > 0 ? local : seedData.activity;
}

async function loadArticlesSource() {
  const local = await readJsonIfExists<Article[]>(
    path.join(process.cwd(), "data", "articles.json"),
  );
  return Array.isArray(local) && local.length > 0 ? local : seedData.articles;
}

async function countRows(
  table: "projects" | "experiences" | "activity" | "articles",
) {
  const client = getSupabaseAdminClient();
  const { count, error } = await client
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(`Could not count ${table}: ${error.message}`);
  return count || 0;
}

export async function bootstrapSupabaseContent(force = false) {
  const [projectCount, experienceCount, activityCount, articleCount] =
    await Promise.all([
      countRows("projects"),
      countRows("experiences"),
      countRows("activity"),
      countRows("articles"),
    ]);

  if (
    !force &&
    (projectCount > 0 ||
      experienceCount > 0 ||
      activityCount > 0 ||
      articleCount > 0)
  ) {
    return {
      skipped: true,
      counts: {
        projects: projectCount,
        experiences: experienceCount,
        activity: activityCount,
        articles: articleCount,
      },
    };
  }

  const [projectsSource, experiencesSource, activitySource, articlesSource] =
    await Promise.all([
      loadProjectsSource(),
      loadExperiencesSource(),
      loadActivitySource(),
      loadArticlesSource(),
    ]);

  const projects = await Promise.all(
    projectsSource.map(async (project) => ({
      ...project,
      cover:
        (await migrateLocalAsset(project.cover, PROJECTS_BUCKET, "projects")) ||
        project.cover,
      detailCover:
        (await migrateLocalAsset(
          project.detailCover,
          PROJECTS_BUCKET,
          "projects",
        )) || project.detailCover,
      gallery: await Promise.all(
        (project.gallery || []).map(
          async (url) =>
            (await migrateLocalAsset(url, PROJECTS_BUCKET, "projects")) || url,
        ),
      ),
    })),
  );

  const experiences = await Promise.all(
    experiencesSource.map(async (experience) => ({
      ...experience,
      companyLogo:
        (await migrateLocalAsset(
          experience.companyLogo,
          EXPERIENCES_BUCKET,
          "experiences",
        )) || experience.companyLogo,
    })),
  );

  const activity = await Promise.all(
    activitySource.map(async (item) => ({
      ...item,
      thumbnail:
        (await migrateLocalAsset(item.thumbnail, ACTIVITY_BUCKET, "activity")) ||
        item.thumbnail,
    })),
  );

  const articles = await Promise.all(
    articlesSource.map(async (article) => ({
      ...article,
      cover:
        (await migrateLocalAsset(article.cover, ARTICLES_BUCKET, "articles")) ||
        article.cover,
    })),
  );

  await Promise.all([
    writeProjectsFile(projects),
    writeExperiencesFile(experiences),
    writeActivityFile(activity),
    writeArticlesFile(articles),
  ]);

  return {
    skipped: false,
    counts: {
      projects: projects.length,
      experiences: experiences.length,
      activity: activity.length,
      articles: articles.length,
    },
  };
}
