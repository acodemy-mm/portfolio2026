import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { getPortfolioData } from "@/lib/data/portfolio";
import "./globals.css";

/** Always read live CMS data from Supabase (not build-time static HTML). */
export const dynamic = "force-dynamic";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPortfolioData();
  return {
    title: {
      default: `${settings.name} · ${settings.role}`,
      template: `%s · ${settings.name}`,
    },
    description: settings.tagline,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings } = await getPortfolioData();

  return (
    <html lang="en" className={`${bebas.variable} ${dmSans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <Nav brand={settings.name} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
