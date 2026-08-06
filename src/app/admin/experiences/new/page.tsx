import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { verifyAdminSession } from "@/lib/admin/auth";

export default async function NewExperiencePage() {
  if (!(await verifyAdminSession())) redirect("/admin/login");
  return (
    <AdminShell title="New experience">
      <ExperienceForm mode="create" />
    </AdminShell>
  );
}
