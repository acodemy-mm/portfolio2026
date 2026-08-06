import {
  formatDuration,
  formatExperienceRange,
} from "@/lib/dates";
import type { Experience } from "@/lib/types";

function Logo({ exp }: { exp: Experience }) {
  const initial = exp.company.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-sm bg-white/5 sm:h-12 sm:w-12">
      {exp.companyLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={exp.companyLogo}
          alt=""
          className="absolute inset-0 !h-full !w-full object-cover"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center bg-[var(--accent)]/20 font-[family-name:var(--font-bebas)] text-xl text-[var(--accent)]"
          aria-hidden
        >
          {initial}
        </span>
      )}
    </div>
  );
}

export function ExperiencesList({
  experiences,
  posterSrc,
  posterAlt = "Featured poster",
}: {
  experiences: Experience[];
  posterSrc?: string;
  posterAlt?: string;
}) {
  return (
    <section className="px-4 py-6 md:px-12 md:py-8">
      <h2 className="mb-5 text-lg font-bold text-white md:mb-6 md:text-xl lg:text-2xl">
        Experiences
      </h2>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        <ul className="w-full max-w-full divide-y divide-white/10 overflow-hidden rounded-sm border border-white/10 bg-[var(--surface)] lg:w-[60%] lg:max-w-[60%] lg:shrink-0">
          {experiences.map((exp) => {
            const range = formatExperienceRange(
              exp.startDate,
              exp.endDate,
              exp.current,
            );
            const duration = formatDuration(
              exp.startDate,
              exp.endDate,
              exp.current,
            );
            return (
              <li
                key={exp._id}
                className="flex gap-3 px-3 py-3.5 sm:gap-4 sm:px-4 sm:py-4 md:gap-4 md:px-5 md:py-5"
              >
                <Logo exp={exp} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-snug text-white sm:text-base md:text-lg">
                    {exp.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)] sm:text-sm">
                    {exp.company}
                    {exp.employmentType ? ` · ${exp.employmentType}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-dim)] sm:text-sm">
                    {range}
                    {duration ? ` · ${duration}` : ""}
                  </p>
                  {(exp.location || exp.workMode) && (
                    <p className="mt-0.5 text-xs text-[var(--text-dim)] sm:text-sm">
                      {[exp.location, exp.workMode].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mx-auto w-full max-w-[280px] sm:max-w-[300px] lg:mx-0 lg:max-w-none lg:w-[40%] lg:min-w-0 lg:flex-1">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-sm border border-white/10 bg-[var(--surface)] shadow-[0_12px_40px_rgba(0,0,0,0.45)] lg:aspect-auto lg:h-full lg:min-h-full">
            {posterSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterSrc}
                alt={posterAlt}
                className="absolute inset-0 !h-full !w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-[var(--surface-hover)] to-black/80 px-4 text-center">
                <span className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white/40">
                  POSTER
                </span>
                <span className="text-xs text-[var(--text-dim)]">
                  Add experiencePoster in site settings
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
