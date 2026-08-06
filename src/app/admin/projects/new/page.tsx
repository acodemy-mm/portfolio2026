import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { verifyAdminSession } from "@/lib/admin/auth";

export default async function NewProjectPage() {
  if (!(await verifyAdminSession())) redirect("/admin/login");

  return (
    <AdminShell title="New project">
      <ProjectForm mode="create" />
    </AdminShell>
  );
}
