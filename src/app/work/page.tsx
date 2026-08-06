import type { Metadata } from "next";
import { HoverCard } from "@/components/motion/MotionRow";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPortfolioData } from "@/lib/data/portfolio";

export const metadata: Metadata = {
  title: "My Work",
};

export default async function WorkPage() {
  const { projects } = await getPortfolioData();
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-[calc(var(--nav-height)+2.5rem)] md:px-8">
      <ScrollReveal>
        <SectionHeading
          title="My Work"
          subtitle="Selected projects — product design, design systems, and shipped interfaces."
        />
      </ScrollReveal>

      {featured.length > 0 ? (
        <section className="mb-14">
          <h2 className="mb-5 font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-[var(--text-muted)]">
            Featured
          </h2>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <StaggerItem key={p._id}>
                <HoverCard
                  href={`/work/${p.slug}`}
                  title={p.title}
                  subtitle={`${p.year} · ${p.role}`}
                  image={p.cover}
                  layoutId={`project-cover-${p.slug}`}
                  variant="landscape"
                  className="!w-full !max-w-none"
                />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : null}

      <section>
        <h2 className="mb-5 font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-[var(--text-muted)]">
          All Projects
        </h2>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <StaggerItem key={p._id}>
              <HoverCard
                href={`/work/${p.slug}`}
                title={p.title}
                subtitle={`${p.year} · ${p.tags.slice(0, 2).join(" · ")}`}
                image={p.cover}
                layoutId={`project-cover-${p.slug}`}
                variant="landscape"
                className="!w-full !max-w-none"
              />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
