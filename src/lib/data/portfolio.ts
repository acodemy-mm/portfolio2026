import { seedData } from "@/data/seed";
import { getStoredActivity, getStoredActivityById } from "@/lib/data/activity";
import {
  getStoredArticleBySlug,
  getStoredArticles,
} from "@/lib/data/articles";
import { getStoredExperiences } from "@/lib/data/experiences";
import {
  getStoredProjectBySlug,
  getStoredProjects,
} from "@/lib/data/projects";
import type { ActivityItem, Article, PortfolioData, Project } from "@/lib/types";

export async function getPortfolioData(): Promise<PortfolioData> {
  const [projects, experiences, activity, articles] = await Promise.all([
    getStoredProjects(),
    getStoredExperiences(),
    getStoredActivity(),
    getStoredArticles(),
  ]);
  return {
    ...seedData,
    projects,
    experiences,
    activity,
    articles,
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
  return getStoredArticleBySlug(slug);
}

export async function getActivityById(
  id: string,
): Promise<ActivityItem | undefined> {
  return getStoredActivityById(id);
}
