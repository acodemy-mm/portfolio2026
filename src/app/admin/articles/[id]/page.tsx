import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { seedData } from "@/data/seed";
import { verifyAdminSession } from "@/lib/admin/auth";
import { readArticlesFile } from "@/lib/data/articles";

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  if (!(await verifyAdminSession())) redirect("/admin/login");
  const { id } = await params;
  const stored = await readArticlesFile();
  const list = stored.length > 0 ? stored : seedData.articles;
  const article = list.find((a) => a._id === id);
  if (!article) notFound();

  return (
    <AdminShell title={`Edit · ${article.title}`}>
      <ArticleForm mode="edit" initial={article} />
    </AdminShell>
  );
}
