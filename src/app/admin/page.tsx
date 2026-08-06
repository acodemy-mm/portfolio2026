import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin/auth";

export default async function AdminIndexPage() {
  const ok = await verifyAdminSession();
  redirect(ok ? "/admin/projects" : "/admin/login");
}
