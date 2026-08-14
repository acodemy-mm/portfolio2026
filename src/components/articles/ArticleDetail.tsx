"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { articleBodyToHtml } from "@/lib/html";
import type { Article } from "@/lib/types";

export function ArticleDetail({ article }: { article: Article }) {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const bodyHtml = articleBodyToHtml(article.body);
  const gallery = article.gallery?.filter(Boolean) || [];

  return (
    <article>
      {!prefersReduced ? (
        <motion.div
          className="fixed left-0 right-0 top-0 z-[60] h-0.5 origin-left bg-[var(--accent)]"
          style={{ scaleX: progress }}
        />
      ) : null}

      <section className="relative min-h-[50vh] overflow-hidden pt-[var(--nav-height)]">
        <motion.div layoutId={`article-cover-${article.slug}`} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.cover} alt="" className="h-full w-full object-cover" />
          <div className="billboard-gradient absolute inset-0" />
        </motion.div>
        <div className="relative z-10 flex min-h-[50vh] items-end px-4 pb-12 md:px-12">
          <div className="max-w-3xl">
            <p className="text-sm text-[var(--text-muted)]">{article.publishedAt}</p>
            <h1 className="mt-2 font-[family-name:var(--font-bebas)] text-5xl tracking-wide text-white md:text-7xl">
              {article.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-sm border border-white/15 px-2 py-0.5 text-xs text-[var(--text-muted)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-14 md:px-8">
        <ScrollReveal>
          <p className="text-lg text-[var(--text-muted)]">{article.excerpt}</p>
        </ScrollReveal>
        {bodyHtml ? (
          <ScrollReveal delay={0.08} className="prose-portable mt-8">
            <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          </ScrollReveal>
        ) : null}

        {gallery.length > 0 ? (
          <ScrollReveal className="mt-14">
            <h2 className="mb-5 font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-white">
              More photos
            </h2>
            <Stagger className="grid gap-3 sm:grid-cols-2">
              {gallery.map((src, i) => (
                <StaggerItem key={`${src}-${i}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${article.title} photo ${i + 1}`}
                    className="aspect-[4/3] w-full rounded-sm object-cover"
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </ScrollReveal>
        ) : null}

        <ScrollReveal className="mt-12">
          <Link
            href="/articles"
            className="text-sm text-[var(--text-muted)] hover:text-white"
          >
            ← All Articles
          </Link>
        </ScrollReveal>
      </div>
    </article>
  );
}
