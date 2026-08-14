import "server-only";

import { randomUUID } from "crypto";
import { seedData } from "@/data/seed";
import type { Article } from "@/lib/types";
import { ARTICLES_BUCKET, deleteAsset, uploadAsset } from "@/lib/supabase/assets";
import { getSupabaseAdminClient, getSupabasePublicClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { isMissingRelationError } from "@/lib/supabase/errors";
import { ensureUuid } from "@/lib/supabase/ids";

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  cover: string;
  excerpt: string;
  body: string;
  gallery: string[] | null;
  tags: string[] | null;
  published_at: string;
  created_at: string;
};

function mapArticle(row: ArticleRow): Article {
  return {
    _id: row.id,
    title: row.title,
    slug: row.slug,
    cover: row.cover,
    excerpt: row.excerpt,
    body: row.body,
    gallery: row.gallery || [],
    tags: row.tags || [],
    publishedAt: row.published_at,
  };
}

async function readArticleRows(): Promise<ArticleRow[]> {
  if (!hasSupabaseEnv()) return [];
  const client = getSupabasePublicClient();
  const { data, error } = await client
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingRelationError(error)) return [];
    throw new Error(`Could not load articles: ${error.message}`);
  }
  return (data || []) as ArticleRow[];
}

export async function readArticlesFile(): Promise<Article[]> {
  const rows = await readArticleRows();
  return rows.map(mapArticle);
}

export async function writeArticlesFile(items: Article[]) {
  const client = getSupabaseAdminClient();
  const payload = items.map((item) => ({
    id: ensureUuid(item._id),
    title: item.title,
    slug: item.slug,
    cover: item.cover,
    excerpt: item.excerpt,
    body: item.body,
    gallery: item.gallery || [],
    tags: item.tags || [],
    published_at: item.publishedAt,
  }));
  const { error } = await client.from("articles").upsert(payload, { onConflict: "id" });
  if (error) throw new Error(`Could not write articles: ${error.message}`);
}

export async function getStoredArticles(): Promise<Article[]> {
  const stored = await readArticlesFile();
  if (stored.length > 0) return stored;
  return seedData.articles;
}

export async function getStoredArticleBySlug(
  slug: string,
): Promise<Article | undefined> {
  const articles = await getStoredArticles();
  return articles.find((a) => a.slug === slug);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type ArticleInput = {
  title: string;
  slug?: string;
  tags?: string;
  excerpt?: string;
  body?: string;
  publishedAt?: string;
  coverUrl?: string;
  galleryUrls?: string;
};

export type ArticleFiles = {
  cover?: File | null;
  gallery?: File[];
};

function parseTags(tags?: string) {
  if (!tags) return [] as string[];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
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

function sortArticles(items: Article[]) {
  return [...items].sort((a, b) =>
    (b.publishedAt || "").localeCompare(a.publishedAt || ""),
  );
}

async function deleteArticleUploads(article: Article) {
  const urls = [article.cover, ...(article.gallery || [])].filter(Boolean);
  await Promise.all(urls.map((url) => deleteAsset(url)));
}

export async function createArticle(
  input: ArticleInput,
  files: ArticleFiles = {},
): Promise<Article> {
  const storedRows = await readArticleRows();
  const articles = storedRows.map(mapArticle);
  if (!input.title.trim()) throw new Error("Title is required");

  const slug = slugify(input.slug || input.title);
  if (!slug) throw new Error("Title or slug is required");
  if (articles.some((a) => a.slug === slug)) {
    throw new Error("An article with this slug already exists");
  }

  let cover = input.coverUrl || "";
  if (files.cover && files.cover.size > 0) {
    cover = await uploadAsset(ARTICLES_BUCKET, files.cover, "articles");
  }
  if (!cover) throw new Error("Cover image is required");

  const gallery: string[] = [];
  if (files.gallery?.length) {
    for (const file of files.gallery) {
      if (file.size > 0) {
        gallery.push(await uploadAsset(ARTICLES_BUCKET, file, "articles"));
      }
    }
  }

  const article: Article = {
    _id: randomUUID(),
    title: input.title.trim(),
    slug,
    cover,
    excerpt: (input.excerpt || "").trim(),
    body: (input.body || "").trim(),
    gallery,
    tags: parseTags(input.tags),
    publishedAt:
      (input.publishedAt || "").trim() ||
      new Date().toISOString().slice(0, 10),
  };

  if (storedRows.length === 0) {
    await writeArticlesFile(sortArticles([...seedData.articles, article]));
  } else {
    const client = getSupabaseAdminClient();
    const payload = {
      id: article._id,
      title: article.title,
      slug: article.slug,
      cover: article.cover,
      excerpt: article.excerpt,
      body: article.body,
      gallery: article.gallery,
      tags: article.tags,
      published_at: article.publishedAt,
    };
    const { error } = await client.from("articles").insert(payload);
    if (error) throw new Error(`Could not create article: ${error.message}`);
  }
  return article;
}

export async function updateArticle(
  id: string,
  input: ArticleInput,
  files: ArticleFiles = {},
): Promise<Article> {
  const storedRows = await readArticleRows();
  let items = storedRows.map(mapArticle);
  if (items.length === 0) items = [...seedData.articles];
  const index = items.findIndex((a) => a._id === id);
  if (index < 0) throw new Error("Article not found");

  const existing = items[index]!;
  const slug = slugify(input.slug || input.title || existing.slug);
  if (items.some((a) => a._id !== id && a.slug === slug)) {
    throw new Error("An article with this slug already exists");
  }

  let cover = existing.cover;
  if (files.cover && files.cover.size > 0) {
    const next = await uploadAsset(ARTICLES_BUCKET, files.cover, "articles");
    await deleteAsset(existing.cover);
    cover = next;
  } else if (input.coverUrl && input.coverUrl !== existing.cover) {
    await deleteAsset(existing.cover);
    cover = input.coverUrl;
  }

  let gallery = existing.gallery ? [...existing.gallery] : [];
  if (input.galleryUrls !== undefined) {
    gallery = parseGalleryUrls(input.galleryUrls);
  }
  if (files.gallery?.length) {
    for (const file of files.gallery) {
      if (file.size > 0) {
        gallery.push(await uploadAsset(ARTICLES_BUCKET, file, "articles"));
      }
    }
  }

  const previousGallery = existing.gallery || [];
  for (const url of previousGallery) {
    if (!gallery.includes(url)) await deleteAsset(url);
  }

  const updated: Article = {
    ...existing,
    title: (input.title || existing.title).trim(),
    slug,
    cover,
    excerpt:
      input.excerpt !== undefined ? input.excerpt.trim() : existing.excerpt,
    body: input.body !== undefined ? input.body.trim() : existing.body,
    gallery,
    tags: input.tags !== undefined ? parseTags(input.tags) : existing.tags,
    publishedAt:
      input.publishedAt !== undefined
        ? input.publishedAt.trim() || existing.publishedAt
        : existing.publishedAt,
  };

  items[index] = updated;
  if (storedRows.length === 0) {
    await writeArticlesFile(sortArticles(items));
  } else {
    const client = getSupabaseAdminClient();
    const payload = {
      title: updated.title,
      slug: updated.slug,
      cover: updated.cover,
      excerpt: updated.excerpt,
      body: updated.body,
      gallery: updated.gallery,
      tags: updated.tags,
      published_at: updated.publishedAt,
    };
    const { error } = await client.from("articles").update(payload).eq("id", id);
    if (error) throw new Error(`Could not update article: ${error.message}`);
  }
  return updated;
}

export async function deleteArticle(id: string) {
  const storedRows = await readArticleRows();
  let items = storedRows.map(mapArticle);
  if (items.length === 0) items = [...seedData.articles];
  const existing = items.find((a) => a._id === id);
  if (!existing) throw new Error("Article not found");
  if (storedRows.length === 0) {
    await writeArticlesFile(items.filter((a) => a._id !== id));
  } else {
    const client = getSupabaseAdminClient();
    const { error } = await client.from("articles").delete().eq("id", id);
    if (error) throw new Error(`Could not delete article: ${error.message}`);
  }
  await deleteArticleUploads(existing);
}
