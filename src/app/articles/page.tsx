import type { Metadata } from "next";
import { HoverCard } from "@/components/motion/MotionRow";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPortfolioData } from "@/lib/data/portfolio";

export const metadata: Metadata = {
  title: "Articles",
};

export default async function ArticlesPage() {
  const { articles } = await getPortfolioData();

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-20 pt-[calc(var(--nav-height)+2.5rem)] md:px-8">
      <ScrollReveal>
        <SectionHeading
          title="Articles"
          subtitle="Notes on motion, systems, and shipping craft. Manage posts in Sanity Studio."
        />
      </ScrollReveal>
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <StaggerItem key={a._id}>
            <HoverCard
              href={`/articles/${a.slug}`}
              title={a.title}
              subtitle={a.publishedAt}
              image={a.cover}
              layoutId={`article-cover-${a.slug}`}
              variant="landscape"
              className="!w-full !max-w-none"
            />
            <p className="mt-3 line-clamp-2 text-sm text-[var(--text-muted)]">
              {a.excerpt}
            </p>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
