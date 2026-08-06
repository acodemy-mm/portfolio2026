import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import {
  deleteProject,
  updateProject,
  type ProjectFiles,
  type ProjectInput,
} from "@/lib/data/projects";

type Ctx = { params: Promise<{ id: string }> };

function filesFromForm(form: FormData): ProjectFiles {
  const posterRaw = form.get("poster") ?? form.get("cover");
  const detailRaw = form.get("detailCover");
  const galleryRaw = form.getAll("gallery");

  return {
    poster:
      posterRaw instanceof File && posterRaw.size > 0 ? posterRaw : null,
    detailCover:
      detailRaw instanceof File && detailRaw.size > 0 ? detailRaw : null,
    gallery: galleryRaw.filter(
      (f): f is File => f instanceof File && f.size > 0,
    ),
  };
}

function inputFromForm(form: FormData): ProjectInput {
  return {
    title: String(form.get("title") || ""),
    slug: String(form.get("slug") || ""),
    tags: String(form.get("tags") || ""),
    excerpt: String(form.get("excerpt") || ""),
    body: String(form.get("body") || ""),
    year: String(form.get("year") || ""),
    role: String(form.get("role") || ""),
    client: String(form.get("client") || ""),
    liveUrl: String(form.get("liveUrl") || ""),
    featured: String(form.get("featured") || "false"),
    coverUrl: String(form.get("coverUrl") || ""),
    detailCoverUrl: String(form.get("detailCoverUrl") || ""),
    galleryUrls: String(form.get("galleryUrls") || ""),
  };
}

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    const form = await request.formData();
    const project = await updateProject(id, inputFromForm(form), filesFromForm(form));
    return NextResponse.json({ ok: true, project });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : "Update failed",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    await deleteProject(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : "Delete failed",
      },
      { status: 400 },
    );
  }
}
