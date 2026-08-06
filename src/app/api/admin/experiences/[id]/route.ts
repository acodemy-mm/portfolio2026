import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import {
  deleteExperience,
  updateExperience,
  type ExperienceInput,
} from "@/lib/data/experiences";

type Ctx = { params: Promise<{ id: string }> };

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

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const form = await request.formData();
    const logo = form.get("companyLogo");
    const logoFile = logo instanceof File && logo.size > 0 ? logo : null;
    const experience = await updateExperience(id, inputFromForm(form), logoFile);
    return NextResponse.json({ ok: true, experience });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await deleteExperience(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed" },
      { status: 400 },
    );
  }
}
