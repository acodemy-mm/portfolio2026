import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActivityDetail } from "@/components/activity/ActivityDetail";
import { getActivityById, getPortfolioData } from "@/lib/data/portfolio";
import { htmlToPlainText } from "@/lib/html";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const { activity } = await getPortfolioData();
  return activity.map((item) => ({ id: item._id }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getActivityById(id);
  if (!item) return { title: "Activity" };
  return { title: item.title, description: htmlToPlainText(item.summary) };
}

export default async function ActivityDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await getActivityById(id);
  if (!item) notFound();
  return <ActivityDetail item={item} />;
}
