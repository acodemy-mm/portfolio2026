import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { revalidatePortfolioContent } from "@/lib/cache/portfolio";
import {
  createProject,
  readProjectsFile,
  type ProjectFiles,
  type ProjectInput,
} from "@/lib/data/projects";
import { seedData } from "@/data/seed";

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

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const stored = await readProjectsFile();
  const projects = stored.length > 0 ? stored : seedData.projects;
  return NextResponse.json({ ok: true, projects });
}

export async function POST(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const input = inputFromForm(form);
    if (!input.title.trim()) {
      return NextResponse.json(
        { ok: false, message: "Title is required." },
        { status: 400 },
      );
    }
    const project = await createProject(input, filesFromForm(form));
    revalidatePortfolioContent(project.slug);
    return NextResponse.json({ ok: true, project });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : "Create failed",
      },
      { status: 400 },
    );
  }
}
