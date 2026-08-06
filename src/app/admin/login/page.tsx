import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin/auth";
import AdminLoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  if (await verifyAdminSession()) redirect("/admin/projects");
  return <AdminLoginForm />;
}
