import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { revalidatePortfolioContent } from "@/lib/cache/portfolio";
import { seedData } from "@/data/seed";
import {
  createExperience,
  readExperiencesFile,
  type ExperienceInput,
} from "@/lib/data/experiences";

function inputFromForm(form: FormData): ExperienceInput {
  return {
    title: String(form.get("title") || ""),
    company: String(form.get("company") || ""),
    location: String(form.get("location") || ""),
    startDate: String(form.get("startDate") || ""),
    endDate: String(form.get("endDate") || ""),
    current: String(form.get("current") || "false"),
    employmentType: String(form.get("employmentType") || "Full-time"),
    workMode: String(form.get("workMode") || "On-site"),
    description: String(form.get("description") || ""),
    highlights: String(form.get("highlights") || ""),
    companyLogoUrl: String(form.get("companyLogoUrl") || ""),
  };
}

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const stored = await readExperiencesFile();
  return NextResponse.json({
    ok: true,
    experiences: stored.length > 0 ? stored : seedData.experiences,
  });
}

export async function POST(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const form = await request.formData();
    const logo = form.get("companyLogo");
    const logoFile = logo instanceof File && logo.size > 0 ? logo : null;
    const experience = await createExperience(inputFromForm(form), logoFile);
    revalidatePortfolioContent();
    return NextResponse.json({ ok: true, experience });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed" },
      { status: 400 },
    );
  }
}
