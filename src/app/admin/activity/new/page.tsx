import { redirect } from "next/navigation";
import { ActivityForm } from "@/components/admin/ActivityForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { verifyAdminSession } from "@/lib/admin/auth";

export default async function NewActivityPage() {
  if (!(await verifyAdminSession())) redirect("/admin/login");
  return (
    <AdminShell title="New activity">
      <ActivityForm mode="create" />
    </AdminShell>
  );
}
