"use client";

import { usePathname } from "next/navigation";
import { PageTransition } from "@/components/motion/primitives";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return <PageTransition>{children}</PageTransition>;
}
