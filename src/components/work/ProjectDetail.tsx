"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/SectionHeading";
import { easeOut, ScrollReveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import type { Project } from "@/lib/types";

export function ProjectDetail({ project }: { project: Project }) {
  const prefersReduced = useReducedMotion();
  const heroImage = project.detailCover || project.cover;
  const gallery = project.gallery?.filter(Boolean) || [];

  return (
    <article>
      <section className="relative min-h-[60vh] overflow-hidden pt-[var(--nav-height)] md:min-h-[70vh]">
        <motion.div
          layoutId={`project-cover-${project.slug}`}
          className="absolute inset-0"
          transition={{ duration: prefersReduced ? 0.01 : 0.45, ease: easeOut }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="billboard-gradient absolute inset-0" />
        </motion.div>

        <div className="relative z-10 flex min-h-[60vh] items-end px-4 pb-16 md:min-h-[70vh] md:px-12 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              {project.year} · {project.role}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-bebas)] text-5xl tracking-wide text-white md:text-7xl lg:text-8xl">
              {project.title}
            </h1>
            <p className="mt-4 max-w-xl text-base text-[var(--text-muted)] md:text-lg">
              {project.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm border border-white/15 bg-black/40 px-2.5 py-1 text-xs text-[var(--text-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
        <ScrollReveal>
          <div className="grid gap-6 border-b border-white/10 pb-10 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--text-dim)]">
                Role
              </p>
              <p className="mt-1 text-white">{project.role}</p>
            </div>
            {project.client ? (
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--text-dim)]">
                  Client
                </p>
                <p className="mt-1 text-white">{project.client}</p>
              </div>
            ) : null}
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--text-dim)]">
                Year
              </p>
              <p className="mt-1 text-white">{project.year}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08} className="prose-portable mt-10">
          {project.body.split("\n\n").map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </ScrollReveal>

        {gallery.length > 0 ? (
          <ScrollReveal className="mt-14">
            <h2 className="mb-5 font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-white">
              Gallery
            </h2>
            <Stagger className="grid gap-3 sm:grid-cols-2">
              {gallery.map((src, i) => (
                <StaggerItem key={`${src}-${i}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${project.title} gallery ${i + 1}`}
                    className="aspect-[4/3] w-full rounded-sm object-cover"
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </ScrollReveal>
        ) : null}

        <ScrollReveal className="mt-12 flex flex-wrap gap-3">
          {project.liveUrl ? (
            <ButtonLink href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              View Live
            </ButtonLink>
          ) : null}
          <ButtonLink href="/work" variant="secondary">
            ← All Work
          </ButtonLink>
          <Link
            href="/about#contact"
            className="inline-flex items-center text-sm text-[var(--text-muted)] hover:text-white"
          >
            Discuss a project
          </Link>
        </ScrollReveal>
      </div>
    </article>
  );
}
