import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticlesAdminTable } from "@/components/admin/ArticlesAdminTable";
import { seedData } from "@/data/seed";
import { verifyAdminSession } from "@/lib/admin/auth";
import { readArticlesFile } from "@/lib/data/articles";

export default async function AdminArticlesPage() {
  if (!(await verifyAdminSession())) redirect("/admin/login");
  const stored = await readArticlesFile();
  const articles = stored.length > 0 ? stored : seedData.articles;

  return (
    <AdminShell title="Articles">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">
          {articles.length} article{articles.length === 1 ? "" : "s"}
          {stored.length === 0 ? " (seed until you save)" : ""}
        </p>
        <Link
          href="/admin/articles/new"
          className="rounded-sm bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          + Add article
        </Link>
      </div>
      <ArticlesAdminTable articles={articles} />
    </AdminShell>
  );
}
