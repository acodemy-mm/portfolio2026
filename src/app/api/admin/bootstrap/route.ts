import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { revalidatePortfolioContent } from "@/lib/cache/portfolio";
import { bootstrapSupabaseContent } from "@/lib/supabase/bootstrap";

export async function POST(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { force?: boolean };
    const result = await bootstrapSupabaseContent(Boolean(body.force));
    revalidatePortfolioContent();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Bootstrap failed",
      },
      { status: 400 },
    );
  }
}
