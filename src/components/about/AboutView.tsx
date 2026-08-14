"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ContactForm } from "@/components/contact/ContactForm";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { ButtonLink, SectionHeading } from "@/components/ui/SectionHeading";
import type { AboutContent, SiteSettings } from "@/lib/types";

export function AboutView({
  about,
  settings,
}: {
  about: AboutContent;
  settings: SiteSettings;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-[calc(var(--nav-height)+2.5rem)] md:px-8">
      <ScrollReveal>
        <SectionHeading title="About" subtitle={about.headline} />
      </ScrollReveal>

      <div className="grid items-start gap-10 md:grid-cols-[0.9fr_1.1fr]">
        <ScrollReveal>
          <div className="overflow-hidden rounded-sm">
            <motion.img
              src={about.portrait}
              alt={settings.name}
              className="aspect-[9/16] w-full object-cover object-top"
              initial={prefersReduced ? false : { scale: 1.08 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </ScrollReveal>

        <div>
          {about.bio.map((para, i) => (
            <ScrollReveal key={para.slice(0, 20)} delay={i * 0.08}>
              <p className="mb-5 text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
                {para}
              </p>
            </ScrollReveal>
          ))}
          <ScrollReveal className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/resume">View Resume</ButtonLink>
            <ButtonLink href="#contact" variant="secondary">
              Get in touch
            </ButtonLink>
          </ScrollReveal>
        </div>
      </div>

      <Stagger className="mt-16 grid gap-4 md:grid-cols-3">
        {about.values.map((v) => (
          <StaggerItem key={v.title}>
            <div className="rounded-sm border border-white/10 bg-[var(--surface)] p-5">
              <h3 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
                {v.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{v.description}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <ContactForm settings={settings} embedded />
    </div>
  );
}
