import { ScrollReveal } from "@/components/motion/primitives";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SiteSettings } from "@/lib/types";

export function ContactForm({
  settings,
  embedded = false,
}: {
  settings: SiteSettings;
  embedded?: boolean;
}) {
  return (
    <div
      id="contact"
      className={
        embedded
          ? "mt-20 scroll-mt-[calc(var(--nav-height)+1rem)]"
          : "mx-auto max-w-[900px] px-4 pb-20 pt-[calc(var(--nav-height)+2.5rem)] md:px-8"
      }
    >
      <ScrollReveal>
        <SectionHeading
          title="Contact"
          subtitle="Reach out directly — happy to talk about product design, systems, and collaboration."
        />
      </ScrollReveal>

      <div className="grid gap-10 md:grid-cols-[1fr_0.85fr]">
        <ScrollReveal>
          <div className="rounded-sm border border-white/10 bg-[var(--surface)] p-6 md:p-8">
            <p className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
              Contact information
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
              Prefer email for project inquiries, mentoring, or speaking. I usually
              reply within a couple of days.
            </p>

            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-xs uppercase tracking-wider text-[var(--text-dim)]">
                  Name
                </dt>
                <dd className="mt-1.5 text-base text-white">{settings.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[var(--text-dim)]">
                  Email
                </dt>
                <dd className="mt-1.5">
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-base text-[var(--accent)] hover:underline"
                  >
                    {settings.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[var(--text-dim)]">
                  Location
                </dt>
                <dd className="mt-1.5 text-base text-white">{settings.location}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[var(--text-dim)]">
                  Role
                </dt>
                <dd className="mt-1.5 text-base text-white">{settings.role}</dd>
              </div>
            </dl>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="rounded-sm border border-white/10 bg-[var(--surface)] p-6 md:p-8">
            <p className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
              Elsewhere
            </p>
            <ul className="mt-4 space-y-3">
              {settings.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-muted)] transition hover:text-white"
                  >
                    {s.label} →
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={`mailto:${settings.email}`}
              className="mt-6 inline-block text-sm text-[var(--accent)] hover:underline"
            >
              {settings.email}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
