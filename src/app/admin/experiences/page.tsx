import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ExperiencesAdminTable } from "@/components/admin/ExperiencesAdminTable";
import { seedData } from "@/data/seed";
import { verifyAdminSession } from "@/lib/admin/auth";
import { readExperiencesFile } from "@/lib/data/experiences";

export default async function AdminExperiencesPage() {
  if (!(await verifyAdminSession())) redirect("/admin/login");
  const stored = await readExperiencesFile();
  const experiences = stored.length > 0 ? stored : seedData.experiences;

  return (
    <AdminShell title="Work Experiences">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">
          {experiences.length} experience{experiences.length === 1 ? "" : "s"}
          {stored.length === 0 ? " (seed until you save)" : ""}
        </p>
        <Link
          href="/admin/experiences/new"
          className="rounded-sm bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          + Add experience
        </Link>
      </div>
      <ExperiencesAdminTable experiences={experiences} />
    </AdminShell>
  );
}
