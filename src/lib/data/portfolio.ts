import { seedData } from "@/data/seed";
import { getStoredActivity } from "@/lib/data/activity";
import { getStoredExperiences } from "@/lib/data/experiences";
import {
  getStoredProjectBySlug,
  getStoredProjects,
} from "@/lib/data/projects";
import type { Article, PortfolioData, Project } from "@/lib/types";

export async function getPortfolioData(): Promise<PortfolioData> {
  const [projects, experiences, activity] = await Promise.all([
    getStoredProjects(),
    getStoredExperiences(),
    getStoredActivity(),
  ]);
  return {
    ...seedData,
    projects,
    experiences,
    activity,
  };
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  return getStoredProjectBySlug(slug);
}

export async function getArticleBySlug(
  slug: string,
): Promise<Article | undefined> {
  const data = await getPortfolioData();
  return data.articles.find((a) => a.slug === slug);
}
