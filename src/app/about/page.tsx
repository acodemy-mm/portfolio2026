import type { Metadata } from "next";
import { AboutView } from "@/components/about/AboutView";
import { getPortfolioData } from "@/lib/data/portfolio";

export const metadata: Metadata = {
  title: "About & Contact",
};

export default async function AboutPage() {
  const { about, settings } = await getPortfolioData();
  return <AboutView about={about} settings={settings} />;
}
