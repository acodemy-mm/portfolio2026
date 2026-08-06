import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { seedData } from "@/data/seed";
import type { ActivityItem } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "activity.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "activity");

const TYPES: ActivityItem["type"][] = [
  "ship",
  "speak",
  "write",
  "award",
  "milestone",
];

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function readActivityFile(): Promise<ActivityItem[]> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as ActivityItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeActivityFile(items: ActivityItem[]) {
  await ensureDirs();
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function getStoredActivity(): Promise<ActivityItem[]> {
  const stored = await readActivityFile();
  if (stored.length > 0) return stored;
  return seedData.activity;
}

export type ActivityInput = {
  type?: string;
  title: string;
  date: string;
  summary?: string;
  link?: string;
  thumbnailUrl?: string;
};

function asType(v?: string): ActivityItem["type"] {
  return TYPES.includes(v as ActivityItem["type"])
    ? (v as ActivityItem["type"])
    : "milestone";
}

function sortActivity(items: ActivityItem[]) {
  return [...items].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export async function saveActivityThumbnail(file: File): Promise<string> {
  await ensureDirs();
  const ext = path.extname(file.name) || ".jpg";
  const safeExt = ext.match(/^\.(jpe?g|png|webp|gif|avif)$/i) ? ext : ".jpg";
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${safeExt.toLowerCase()}`;
  await fs.writeFile(
    path.join(UPLOAD_DIR, filename),
    Buffer.from(await file.arrayBuffer()),
  );
  return `/uploads/activity/${filename}`;
}

async function deleteThumbnail(url?: string) {
  if (!url?.startsWith("/uploads/activity/")) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(url)));
  } catch {
    // ignore
  }
}

export async function createActivity(
  input: ActivityInput,
  thumbnailFile?: File | null,
): Promise<ActivityItem> {
  const items = await readActivityFile();
  if (!input.title.trim()) throw new Error("Title is required");
  if (!input.date) throw new Error("Date is required");

  let thumbnail = input.thumbnailUrl || "";
  if (thumbnailFile && thumbnailFile.size > 0) {
    thumbnail = await saveActivityThumbnail(thumbnailFile);
  }

  const item: ActivityItem = {
    _id: randomUUID(),
    type: asType(input.type),
    title: input.title.trim(),
    date: input.date,
    summary: (input.summary || "").trim(),
    thumbnail: thumbnail || undefined,
    link: input.link?.trim() || undefined,
  };

  const base = items.length === 0 ? [...seedData.activity] : items;
  await writeActivityFile(sortActivity([...base, item]));
  return item;
}

export async function updateActivity(
  id: string,
  input: ActivityInput,
  thumbnailFile?: File | null,
): Promise<ActivityItem> {
  let items = await readActivityFile();
  if (items.length === 0) items = [...seedData.activity];
  const index = items.findIndex((a) => a._id === id);
  if (index < 0) throw new Error("Activity not found");

  const existing = items[index]!;
  let thumbnail = existing.thumbnail;
  if (thumbnailFile && thumbnailFile.size > 0) {
    const next = await saveActivityThumbnail(thumbnailFile);
    await deleteThumbnail(existing.thumbnail);
    thumbnail = next;
  } else if (input.thumbnailUrl !== undefined) {
    thumbnail = input.thumbnailUrl || undefined;
  }

  const updated: ActivityItem = {
    ...existing,
    type: input.type ? asType(input.type) : existing.type,
    title: (input.title || existing.title).trim(),
    date: input.date || existing.date,
    summary:
      input.summary !== undefined ? input.summary.trim() : existing.summary,
    thumbnail,
    link:
      input.link !== undefined ? input.link.trim() || undefined : existing.link,
  };

  items[index] = updated;
  await writeActivityFile(sortActivity(items));
  return updated;
}

export async function deleteActivity(id: string) {
  let items = await readActivityFile();
  if (items.length === 0) items = [...seedData.activity];
  const existing = items.find((a) => a._id === id);
  if (!existing) throw new Error("Activity not found");
  await writeActivityFile(items.filter((a) => a._id !== id));
  await deleteThumbnail(existing.thumbnail);
}
