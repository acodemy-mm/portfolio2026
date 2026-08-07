/** True when a table/relation is missing (Postgres or PostgREST schema cache). */
export function isMissingRelationError(
  error: { code?: string; message?: string } | null,
) {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  const message = (error.message || "").toLowerCase();
  return (
    message.includes("could not find the table") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}
