import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { verifyAdminSession } from "@/lib/admin/auth";

export default async function NewArticlePage() {
  if (!(await verifyAdminSession())) redirect("/admin/login");
  return (
    <AdminShell title="New article">
      <ArticleForm mode="create" />
    </AdminShell>
  );
}
