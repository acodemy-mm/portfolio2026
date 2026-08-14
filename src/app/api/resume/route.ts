import { NextResponse } from "next/server";
import { getPortfolioData } from "@/lib/data/portfolio";
import { buildResumePdf, resumeFileName } from "@/lib/resume/pdf";

export const dynamic = "force-dynamic";

export async function GET() {
  const { settings, experiences, skills, education } = await getPortfolioData();
  const bytes = await buildResumePdf({
    settings,
    experiences,
    skills,
    education,
  });
  const filename = resumeFileName(settings.name);

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
