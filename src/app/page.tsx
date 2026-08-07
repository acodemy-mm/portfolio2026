import { ActivityCard } from "@/components/activity/ActivityCard";
import { Billboard } from "@/components/home/Billboard";
import { ExperiencesList } from "@/components/home/ExperiencesList";
import {
  homeSkillHighlights,
  SkillHighlightCard,
} from "@/components/home/SkillHighlightCards";
import { HoverCard, MotionRow } from "@/components/motion/MotionRow";
import { getPortfolioData } from "@/lib/data/portfolio";

export default async function HomePage() {
  const data = await getPortfolioData();
  const brandMark = data.settings.name.trim().charAt(0) || "P";

  return (
    <>
      <Billboard
        settings={data.settings}
        backgroundImage="/hero-bg.png"
      />

      <div className="relative z-20 -mt-8 space-y-1 md:-mt-24 lg:-mt-28">
        <MotionRow title="Highlight Projects" href="/work">
          {data.projects
            .filter((p) => p.featured)
            .map((p) => (
              <HoverCard
                key={p._id}
                href={`/work/${p.slug}`}
                title={p.title}
                subtitle={p.tags.join(" · ")}
                image={p.cover}
                layoutId={`project-cover-${p.slug}`}
                variant="poster"
                brandMark={brandMark}
              />
            ))}
        </MotionRow>

        <MotionRow title="My Work" href="/work">
          {[...data.projects].reverse().map((p) => (
            <HoverCard
              key={`work-${p._id}`}
              href={`/work/${p.slug}`}
              title={p.title}
              subtitle={`${p.year} · ${p.role}`}
              image={p.cover}
              variant="poster"
              brandMark={brandMark}
            />
          ))}
        </MotionRow>

        <MotionRow title="Latest Articles" href="/articles">
          {data.articles.map((a) => (
            <HoverCard
              key={a._id}
              href={`/articles/${a.slug}`}
              title={a.title}
              subtitle={a.tags.join(" · ")}
              image={a.cover}
              layoutId={`article-cover-${a.slug}`}
              variant="poster"
              brandMark={brandMark}
            />
          ))}
        </MotionRow>

        <MotionRow title="Skills">
          {homeSkillHighlights.map((s) => (
            <SkillHighlightCard
              key={s.id}
              id={s.id}
              name={s.name}
              description={s.description}
            />
          ))}
        </MotionRow>

        <ExperiencesList
          experiences={data.experiences}
          posterSrc={data.settings.experiencePoster}
          posterAlt={`${data.settings.name} poster`}
        />

        <MotionRow title="Activity" href="/activity">
          {data.activity.map((item) => (
            <ActivityCard key={item._id} item={item} />
          ))}
        </MotionRow>
      </div>
    </>
  );
}
