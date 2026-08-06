import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]",
  secondary:
    "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25",
  ghost:
    "bg-transparent text-white underline-offset-4 hover:underline",
};

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <Link
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold transition-transform active:scale-[0.97] ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <h1 className="font-[family-name:var(--font-bebas)] text-5xl tracking-wide text-white md:text-6xl lg:text-7xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-3 text-base text-[var(--text-muted)] md:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
