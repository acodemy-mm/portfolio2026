import type { Metadata } from "next";
import { ServicesView } from "@/components/services/ServicesView";
import { getPortfolioData } from "@/lib/data/portfolio";

export const metadata: Metadata = {
  title: "Services",
};

export default async function ServicesPage() {
  const { services } = await getPortfolioData();
  return <ServicesView services={services} />;
}
