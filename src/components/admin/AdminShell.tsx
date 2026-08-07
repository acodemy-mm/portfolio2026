"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const nav = [
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/experiences", label: "Experiences" },
  { href: "/admin/activity", label: "Activity" },
  { href: "/admin/articles", label: "Articles" },
];

export function AdminShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link
            href="/admin/projects"
            className="font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-[var(--accent)]"
          >
            Portfolio Admin
          </Link>
          <h1 className="mt-1 text-lg font-semibold text-white">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-sm px-3 py-2 text-sm ${
                pathname.startsWith(item.href)
                  ? "bg-white/10 text-white"
                  : "text-[var(--text-muted)] hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            className="rounded-sm px-3 py-2 text-sm text-[var(--text-muted)] hover:text-white"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-sm border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
