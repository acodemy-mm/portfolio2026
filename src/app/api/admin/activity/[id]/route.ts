import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import {
  deleteActivity,
  updateActivity,
  type ActivityInput,
} from "@/lib/data/activity";

type Ctx = { params: Promise<{ id: string }> };

function inputFromForm(form: FormData): ActivityInput {
  return {
    type: String(form.get("type") || "milestone"),
    title: String(form.get("title") || ""),
    date: String(form.get("date") || ""),
    summary: String(form.get("summary") || ""),
    link: String(form.get("link") || ""),
    thumbnailUrl: String(form.get("thumbnailUrl") || ""),
  };
}

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const form = await request.formData();
    const thumb = form.get("thumbnail");
    const thumbnailFile =
      thumb instanceof File && thumb.size > 0 ? thumb : null;
    const activity = await updateActivity(id, inputFromForm(form), thumbnailFile);
    return NextResponse.json({ ok: true, activity });
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
    await deleteActivity(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed" },
      { status: 400 },
    );
  }
}
