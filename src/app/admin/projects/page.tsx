import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectsTable } from "@/components/admin/ProjectsTable";
import { verifyAdminSession } from "@/lib/admin/auth";
import { readProjectsFile } from "@/lib/data/projects";
import { seedData } from "@/data/seed";

export default async function AdminProjectsPage() {
  if (!(await verifyAdminSession())) redirect("/admin/login");

  const stored = await readProjectsFile();
  const projects = stored.length > 0 ? stored : seedData.projects;

  return (
    <AdminShell title="Projects">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">
          {projects.length} project{projects.length === 1 ? "" : "s"}
          {stored.length === 0
            ? " (showing seed data until you save changes)"
            : ""}
        </p>
        <Link
          href="/admin/projects/new"
          className="rounded-sm bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
        >
          + Add project
        </Link>
      </div>
      <ProjectsTable projects={projects} />
    </AdminShell>
  );
}
