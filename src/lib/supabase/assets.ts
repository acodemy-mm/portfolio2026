import "server-only";

import path from "path";
import { randomUUID } from "crypto";
import { getSupabaseAdminClient, getSupabasePublicClient } from "@/lib/supabase/client";
import { getSupabaseUrl } from "@/lib/supabase/config";

export const PROJECTS_BUCKET = "projects";
export const EXPERIENCES_BUCKET = "experiences";
export const ACTIVITY_BUCKET = "activity";

type SupportedBucket =
  | typeof PROJECTS_BUCKET
  | typeof EXPERIENCES_BUCKET
  | typeof ACTIVITY_BUCKET;

function getPublicPrefix() {
  return `${getSupabaseUrl()}/storage/v1/object/public/`;
}

export function parseSupabaseAssetUrl(
  value?: string | null,
): { bucket: SupportedBucket; objectPath: string } | null {
  const publicPrefix = getPublicPrefix();
  if (!value || !value.startsWith(publicPrefix)) return null;
  const rest = value.slice(publicPrefix.length);
  const slash = rest.indexOf("/");
  if (slash <= 0) return null;
  const bucket = rest.slice(0, slash) as SupportedBucket;
  const objectPath = rest.slice(slash + 1);
  if (!objectPath) return null;
  return { bucket, objectPath };
}

export async function uploadAsset(
  bucket: SupportedBucket,
  file: File,
  folder = "portfolio",
) {
  const client = getSupabaseAdminClient();
  const ext = path.extname(file.name).toLowerCase() || ".bin";
  const objectPath = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await client.storage.from(bucket).upload(objectPath, buffer, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  const result = getSupabasePublicClient()
    .storage
    .from(bucket)
    .getPublicUrl(objectPath);
  return result.data.publicUrl;
}

export async function deleteAsset(value?: string | null) {
  const parsed = parseSupabaseAssetUrl(value);
  if (!parsed) return;
  const client = getSupabaseAdminClient();
  const { error } = await client.storage
    .from(parsed.bucket)
    .remove([parsed.objectPath]);
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
