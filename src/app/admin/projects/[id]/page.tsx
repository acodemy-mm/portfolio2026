import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { seedData } from "@/data/seed";
import { verifyAdminSession } from "@/lib/admin/auth";
import { readProjectsFile } from "@/lib/data/projects";

type Props = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Props) {
  if (!(await verifyAdminSession())) redirect("/admin/login");

  const { id } = await params;
  const stored = await readProjectsFile();
  const projects = stored.length > 0 ? stored : seedData.projects;
  const project = projects.find((p) => p._id === id);
  if (!project) notFound();

  return (
    <AdminShell title={`Edit · ${project.title}`}>
      <ProjectForm mode="edit" initial={project} />
    </AdminShell>
  );
}
