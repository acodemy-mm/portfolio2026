import { NextResponse } from "next/server";
import {
  createAdminSession,
  getAdminPassword,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const expected = getAdminPassword();

    if (!expected) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "ADMIN_PASSWORD is not configured. Add it to .env.local.",
        },
        { status: 500 },
      );
    }

    if (!body.password || body.password !== expected) {
      return NextResponse.json(
        { ok: false, message: "Incorrect password." },
        { status: 401 },
      );
    }

    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Login failed." },
      { status: 500 },
    );
  }
}
