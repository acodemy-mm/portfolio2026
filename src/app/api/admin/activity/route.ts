import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { revalidatePortfolioContent } from "@/lib/cache/portfolio";
import { seedData } from "@/data/seed";
import {
  createActivity,
  readActivityFile,
  type ActivityInput,
} from "@/lib/data/activity";

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

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const stored = await readActivityFile();
  return NextResponse.json({
    ok: true,
    activity: stored.length > 0 ? stored : seedData.activity,
  });
}

export async function POST(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const form = await request.formData();
    const thumb = form.get("thumbnail");
    const thumbnailFile =
      thumb instanceof File && thumb.size > 0 ? thumb : null;
    const activity = await createActivity(inputFromForm(form), thumbnailFile);
    revalidatePortfolioContent({ activityId: activity._id });
    return NextResponse.json({ ok: true, activity });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed" },
      { status: 400 },
    );
  }
}
