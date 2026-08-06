import { notFound, redirect } from "next/navigation";
import { ActivityForm } from "@/components/admin/ActivityForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { seedData } from "@/data/seed";
import { verifyAdminSession } from "@/lib/admin/auth";
import { readActivityFile } from "@/lib/data/activity";

type Props = { params: Promise<{ id: string }> };

export default async function EditActivityPage({ params }: Props) {
  if (!(await verifyAdminSession())) redirect("/admin/login");
  const { id } = await params;
  const stored = await readActivityFile();
  const list = stored.length > 0 ? stored : seedData.activity;
  const item = list.find((a) => a._id === id);
  if (!item) notFound();

  return (
    <AdminShell title={`Edit · ${item.title}`}>
      <ActivityForm mode="edit" initial={item} />
    </AdminShell>
  );
}
