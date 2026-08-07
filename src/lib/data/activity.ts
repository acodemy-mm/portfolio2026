import "server-only";

import { randomUUID } from "crypto";
import { seedData } from "@/data/seed";
import type { ActivityItem } from "@/lib/types";
import { ACTIVITY_BUCKET, deleteAsset, uploadAsset } from "@/lib/supabase/assets";
import { getSupabaseAdminClient, getSupabasePublicClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { isMissingRelationError } from "@/lib/supabase/errors";
import { ensureUuid } from "@/lib/supabase/ids";

const TYPES: ActivityItem["type"][] = [
  "ship",
  "speak",
  "write",
  "award",
  "milestone",
];

type ActivityRow = {
  id: string;
  type: ActivityItem["type"];
  title: string;
  date: string;
  summary: string;
  thumbnail: string | null;
  link: string | null;
  created_at: string;
};

function mapActivity(row: ActivityRow): ActivityItem {
  return {
    _id: row.id,
    type: row.type,
    title: row.title,
    date: row.date,
    summary: row.summary,
    thumbnail: row.thumbnail || undefined,
    link: row.link || undefined,
  };
}

async function readActivityRows(): Promise<ActivityRow[]> {
  if (!hasSupabaseEnv()) return [];
  const client = getSupabasePublicClient();
  const { data, error } = await client
    .from("activity")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingRelationError(error)) return [];
    throw new Error(`Could not load activity: ${error.message}`);
  }
  return (data || []) as ActivityRow[];
}

export async function readActivityFile(): Promise<ActivityItem[]> {
  const rows = await readActivityRows();
  return rows.map(mapActivity);
}

export async function writeActivityFile(items: ActivityItem[]) {
  const client = getSupabaseAdminClient();
  const payload = items.map((item) => ({
    id: ensureUuid(item._id),
    type: item.type,
    title: item.title,
    date: item.date,
    summary: item.summary,
    thumbnail: item.thumbnail || null,
    link: item.link || null,
  }));
  const { error } = await client.from("activity").upsert(payload, { onConflict: "id" });
  if (error) throw new Error(`Could not write activity: ${error.message}`);
}

export async function getStoredActivity(): Promise<ActivityItem[]> {
  const stored = await readActivityFile();
  if (stored.length > 0) return stored;
  return seedData.activity;
}

export async function getStoredActivityById(
  id: string,
): Promise<ActivityItem | undefined> {
  const items = await getStoredActivity();
  return items.find((item) => item._id === id);
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

async function deleteThumbnail(url?: string) {
  await deleteAsset(url);
}

export async function createActivity(
  input: ActivityInput,
  thumbnailFile?: File | null,
): Promise<ActivityItem> {
  const storedRows = await readActivityRows();
  if (!input.title.trim()) throw new Error("Title is required");
  if (!input.date) throw new Error("Date is required");

  let thumbnail = input.thumbnailUrl || "";
  if (thumbnailFile && thumbnailFile.size > 0) {
    thumbnail = await uploadAsset(ACTIVITY_BUCKET, thumbnailFile, "activity");
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

  if (storedRows.length === 0) {
    await writeActivityFile(sortActivity([...seedData.activity, item]));
  } else {
    const client = getSupabaseAdminClient();
    const payload = {
      id: item._id,
      type: item.type,
      title: item.title,
      date: item.date,
      summary: item.summary,
      thumbnail: item.thumbnail || null,
      link: item.link || null,
    };
    const { error } = await client.from("activity").insert(payload);
    if (error) throw new Error(`Could not create activity: ${error.message}`);
  }
  return item;
}

export async function updateActivity(
  id: string,
  input: ActivityInput,
  thumbnailFile?: File | null,
): Promise<ActivityItem> {
  const storedRows = await readActivityRows();
  let items = storedRows.map(mapActivity);
  if (items.length === 0) items = [...seedData.activity];
  const index = items.findIndex((a) => a._id === id);
  if (index < 0) throw new Error("Activity not found");

  const existing = items[index]!;
  let thumbnail = existing.thumbnail;
  if (thumbnailFile && thumbnailFile.size > 0) {
    const next = await uploadAsset(ACTIVITY_BUCKET, thumbnailFile, "activity");
    await deleteThumbnail(existing.thumbnail);
    thumbnail = next;
  } else if (
    input.thumbnailUrl !== undefined &&
    input.thumbnailUrl !== existing.thumbnail
  ) {
    await deleteThumbnail(existing.thumbnail);
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
  if (storedRows.length === 0) {
    await writeActivityFile(sortActivity(items));
  } else {
    const client = getSupabaseAdminClient();
    const payload = {
      type: updated.type,
      title: updated.title,
      date: updated.date,
      summary: updated.summary,
      thumbnail: updated.thumbnail || null,
      link: updated.link || null,
    };
    const { error } = await client.from("activity").update(payload).eq("id", id);
    if (error) throw new Error(`Could not update activity: ${error.message}`);
  }
  return updated;
}

export async function deleteActivity(id: string) {
  const storedRows = await readActivityRows();
  let items = storedRows.map(mapActivity);
  if (items.length === 0) items = [...seedData.activity];
  const existing = items.find((a) => a._id === id);
  if (!existing) throw new Error("Activity not found");
  if (storedRows.length === 0) {
    await writeActivityFile(items.filter((a) => a._id !== id));
  } else {
    const client = getSupabaseAdminClient();
    const { error } = await client.from("activity").delete().eq("id", id);
    if (error) throw new Error(`Could not delete activity: ${error.message}`);
  }
  await deleteThumbnail(existing.thumbnail);
}
