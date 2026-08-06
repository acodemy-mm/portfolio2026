import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/work/ProjectDetail";
import { getPortfolioData, getProjectBySlug } from "@/lib/data/portfolio";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { projects } = await getPortfolioData();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project" };
  return { title: project.title, description: project.excerpt };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
