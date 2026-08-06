import type { Metadata } from "next";
import { ActivityView } from "@/components/activity/ActivityView";
import { getPortfolioData } from "@/lib/data/portfolio";

export const metadata: Metadata = {
  title: "Activity",
};

export default async function ActivityPage() {
  const { activity } = await getPortfolioData();
  return <ActivityView items={activity} />;
}
