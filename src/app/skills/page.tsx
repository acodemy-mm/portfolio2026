import type { Metadata } from "next";
import { SkillsExperienceView } from "@/components/skills/SkillsExperienceView";
import { getPortfolioData } from "@/lib/data/portfolio";

export const metadata: Metadata = {
  title: "Skills & Experiences",
};

export default async function SkillsPage() {
  const { skills, experiences, settings } = await getPortfolioData();
  return (
    <SkillsExperienceView
      skills={skills}
      experiences={experiences}
      experiencePoster={settings.experiencePoster}
    />
  );
}
