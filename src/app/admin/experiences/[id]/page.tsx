import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { seedData } from "@/data/seed";
import { verifyAdminSession } from "@/lib/admin/auth";
import { readExperiencesFile } from "@/lib/data/experiences";

type Props = { params: Promise<{ id: string }> };

export default async function EditExperiencePage({ params }: Props) {
  if (!(await verifyAdminSession())) redirect("/admin/login");
  const { id } = await params;
  const stored = await readExperiencesFile();
  const list = stored.length > 0 ? stored : seedData.experiences;
  const experience = list.find((e) => e._id === id);
  if (!experience) notFound();

  return (
    <AdminShell title={`Edit · ${experience.title}`}>
      <ExperienceForm mode="edit" initial={experience} />
    </AdminShell>
  );
}
