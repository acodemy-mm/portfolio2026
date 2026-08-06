import type { ReactNode } from "react";

export const homeSkillHighlights = [
  {
    id: "product-design",
    name: "Product Design",
    description: "End-to-end interfaces from discovery to polished UI.",
  },
  {
    id: "ux-research",
    name: "UX Research",
    description: "Interviews, usability tests, and insight-driven decisions.",
  },
  {
    id: "design-system",
    name: "Design System",
    description: "Tokens, components, and scalable design foundations.",
  },
  {
    id: "ux-audit",
    name: "UX Audit",
    description: "Clarity, conversion, and accessibility reviews.",
  },
  {
    id: "ai-powered-design",
    name: "AI Powered Design",
    description: "Workflows that blend craft with AI-assisted speed.",
  },
  {
    id: "product-management",
    name: "Product Management",
    description: "Roadmaps, prioritization, and outcome-focused delivery.",
  },
] as const;

function SkillIcon({ id }: { id: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-7 w-7",
    "aria-hidden": true,
  };

  const icons: Record<string, ReactNode> = {
    "product-design": (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
    "ux-research": (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
        <path d="M8 11h6" />
        <path d="M11 8v6" />
      </svg>
    ),
    "design-system": (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    "ux-audit": (
      <svg {...common}>
        <path d="M9 11l2 2 4-4" />
        <path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      </svg>
    ),
    "ai-powered-design": (
      <svg {...common}>
        <path d="M12 3v3" />
        <path d="M12 18v3" />
        <path d="M3 12h3" />
        <path d="M18 12h3" />
        <path d="m5.6 5.6 2.1 2.1" />
        <path d="m16.3 16.3 2.1 2.1" />
        <path d="m16.3 5.6-2.1 2.1" />
        <path d="m5.6 16.3 2.1-2.1" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    ),
    "product-management": (
      <svg {...common}>
        <path d="M4 6h16" />
        <path d="M4 12h10" />
        <path d="M4 18h7" />
        <path d="M16 12v6l3-2 3 2v-6" />
      </svg>
    ),
  };

  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-[var(--accent)]/15 text-[var(--accent)]">
      {icons[id] ?? icons["product-design"]}
    </span>
  );
}

export function SkillHighlightCard({
  id,
  name,
  description,
}: {
  id: string;
  name: string;
  description: string;
}) {
  return (
    <div className="flex w-[70vw] max-w-[260px] shrink-0 flex-col gap-3 rounded-[2px] border border-white/10 bg-[var(--surface)] p-5 sm:w-[45vw] md:w-[22vw] md:max-w-[240px]">
      <SkillIcon id={id} />
      <div>
        <p className="text-base font-semibold leading-snug text-white">{name}</p>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}
