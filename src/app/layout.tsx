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

function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production.replace(/\/$/, "")}`;
  const preview = process.env.VERCEL_URL;
  if (preview) return `https://${preview.replace(/\/$/, "")}`;
  return "https://lynnhtet-drab.vercel.app";
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPortfolioData();
  const title = `${settings.name} · ${settings.role}`;
  const description = settings.summary || settings.tagline;
  const ogImage = {
    url: "/hero-bg.png",
    width: 1024,
    height: 576,
    alt: `${settings.name} — ${settings.role}`,
  };

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: title,
      template: `%s · ${settings.name}`,
    },
    description: settings.tagline,
    openGraph: {
      type: "website",
      siteName: settings.name,
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
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
