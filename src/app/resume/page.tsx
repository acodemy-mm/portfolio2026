import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/resume/PrintButton";
import { getPortfolioData } from "@/lib/data/portfolio";

export const metadata: Metadata = {
  title: "Resume",
  description: "ATS-optimized resume — single column, semantic HTML, keyword-rich.",
};

function formatRange(start: string, end?: string, current?: boolean) {
  const fmt = (d: string) => {
    const [y, m] = d.split("-");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[Number(m) - 1] ?? ""} ${y}`;
  };
  return `${fmt(start)} – ${current ? "Present" : end ? fmt(end) : ""}`;
}

export default async function ResumePage() {
  const { settings, experiences, skills, education } = await getPortfolioData();
  const skillNames = skills.map((s) => s.name).join(", ");
  const pdfHref = "/api/resume";

  return (
    <div className="resume-page mx-auto max-w-[800px] px-4 pb-20 pt-[calc(var(--nav-height)+2.5rem)] text-[var(--text)] md:px-8">
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">
          ATS-friendly single-column resume
        </p>
        <div className="flex gap-3">
          <a
            href={pdfHref}
            download
            className="rounded-sm bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            Download PDF
          </a>
          <PrintButton />
        </div>
      </div>

      <header className="border-b border-white/15 pb-6">
        <h1 className="text-3xl font-bold text-white md:text-4xl">{settings.name}</h1>
        <p className="mt-1 text-lg text-[var(--text-muted)]">{settings.role}</p>
        <p className="mt-2 text-sm text-[var(--text-dim)]">
          {settings.email} | {settings.location}
          {settings.socials.length
            ? ` | ${settings.socials.map((s) => `${s.label}: ${s.url}`).join(" | ")}`
            : ""}
        </p>
      </header>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-white">Summary</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          {settings.summary}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-white">Skills</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          {skillNames}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-white">Experience</h2>
        <div className="mt-4 space-y-6">
          {experiences.map((exp) => (
            <div key={exp._id}>
              <h3 className="text-base font-bold text-white">
                {exp.title} | {exp.company}
              </h3>
              <p className="text-sm text-[var(--text-dim)]">
                {formatRange(exp.startDate, exp.endDate, exp.current)} |{" "}
                {exp.location}
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{exp.description}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
                {exp.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-white">Education</h2>
        <div className="mt-4 space-y-3">
          {education.map((ed) => (
            <div key={ed._id}>
              <h3 className="text-base font-bold text-white">
                {ed.degree} | {ed.school}
              </h3>
              <p className="text-sm text-[var(--text-dim)]">
                {ed.year}
                {ed.details ? ` | ${ed.details}` : ""}
              </p>
            </div>
          ))}
        </div>
      </section>

      <p className="no-print mt-10 text-sm text-[var(--text-dim)]">
        Prefer a designed overview? See{" "}
        <Link href="/about" className="text-[var(--accent)] hover:underline">
          About
        </Link>{" "}
        or{" "}
        <Link href="/work" className="text-[var(--accent)] hover:underline">
          My Work
        </Link>
        .
      </p>
    </div>
  );
}
