import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/articles/ArticleDetail";
import { getArticleBySlug, getPortfolioData } from "@/lib/data/portfolio";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { articles } = await getPortfolioData();
  return articles.map((a) => ({ slug: a.slug }));
}

/** Allow new admin-created article slugs without a redeploy. */
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article" };
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  return <ArticleDetail article={article} />;
}
