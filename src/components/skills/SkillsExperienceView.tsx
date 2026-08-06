"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ExperiencesList } from "@/components/home/ExperiencesList";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { easeOut } from "@/components/motion/primitives";
import type { Experience, Skill } from "@/lib/types";

export function SkillsExperienceView({
  skills,
  experiences,
  experiencePoster,
}: {
  skills: Skill[];
  experiences: Experience[];
  experiencePoster?: string;
}) {
  const prefersReduced = useReducedMotion();
  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-[calc(var(--nav-height)+2.5rem)] md:px-8">
      <ScrollReveal>
        <SectionHeading
          title="Skills & Experiences"
          subtitle="Craft across design, engineering, and product strategy — with a track record of shipping."
        />
      </ScrollReveal>

      <div className="space-y-14">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="mb-5 font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-white">
              {cat}
            </h2>
            <Stagger className="space-y-4">
              {skills
                .filter((s) => s.category === cat)
                .map((s) => (
                  <StaggerItem key={s._id}>
                    <div className="flex items-center gap-4">
                      <p className="w-40 shrink-0 text-sm text-[var(--text-muted)] md:w-52">
                        {s.name}
                      </p>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-[var(--accent)]"
                          initial={{ width: prefersReduced ? `${s.level}%` : 0 }}
                          whileInView={{ width: `${s.level}%` }}
                          viewport={{ once: true }}
                          transition={
                            prefersReduced
                              ? { duration: 0.01 }
                              : { duration: 0.9, ease: easeOut }
                          }
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-[var(--text-dim)]">
                        {s.level}
                      </span>
                    </div>
                  </StaggerItem>
                ))}
            </Stagger>
          </section>
        ))}
      </div>

      <div className="mt-16 -mx-4 md:-mx-8">
        <ExperiencesList
          experiences={experiences}
          posterSrc={experiencePoster}
        />
      </div>
    </div>
  );
}
