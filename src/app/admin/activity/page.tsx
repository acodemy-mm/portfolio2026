import Link from "next/link";
import { redirect } from "next/navigation";
import { ActivityAdminTable } from "@/components/admin/ActivityAdminTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { seedData } from "@/data/seed";
import { verifyAdminSession } from "@/lib/admin/auth";
import { readActivityFile } from "@/lib/data/activity";

export default async function AdminActivityPage() {
  if (!(await verifyAdminSession())) redirect("/admin/login");
  const stored = await readActivityFile();
  const activity = stored.length > 0 ? stored : seedData.activity;

  return (
    <AdminShell title="Activity">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">
          {activity.length} item{activity.length === 1 ? "" : "s"}
          {stored.length === 0 ? " (seed until you save)" : ""}
        </p>
        <Link
          href="/admin/activity/new"
          className="rounded-sm bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          + Add activity
        </Link>
      </div>
      <ActivityAdminTable items={activity} />
    </AdminShell>
  );
}
