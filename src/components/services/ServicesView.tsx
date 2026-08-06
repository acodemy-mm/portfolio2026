"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Service } from "@/lib/types";

function ServiceCard({ service }: { service: Service }) {
  const [open, setOpen] = useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={() => setOpen((v) => !v)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      className="w-full rounded-sm border border-white/10 bg-[var(--surface)] p-6 text-left transition hover:border-white/25 hover:bg-[var(--surface-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
      whileHover={prefersReduced ? undefined : { y: -2 }}
    >
      <h3 className="font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-white">
        {service.title}
      </h3>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{service.description}</p>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.ul
            key="deliverables"
            initial={prefersReduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={prefersReduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="mt-4 space-y-1 overflow-hidden border-t border-white/10 pt-4 text-sm text-[var(--text-dim)]"
          >
            {service.deliverables.map((d) => (
              <li key={d} className="flex gap-2">
                <span className="text-[var(--accent)]">→</span>
                {d}
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}

export function ServicesView({ services }: { services: Service[] }) {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-[calc(var(--nav-height)+2.5rem)] md:px-8">
      <ScrollReveal>
        <SectionHeading
          title="Services"
          subtitle="Engagements from discovery to production — hover or focus a card for deliverables."
        />
      </ScrollReveal>
      <Stagger className="grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <StaggerItem key={s._id}>
            <ServiceCard service={s} />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
