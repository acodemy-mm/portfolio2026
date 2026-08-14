import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { revalidatePortfolioContent } from "@/lib/cache/portfolio";
import {
  deleteArticle,
  updateArticle,
  type ArticleFiles,
  type ArticleInput,
} from "@/lib/data/articles";

type Ctx = { params: Promise<{ id: string }> };

function filesFromForm(form: FormData): ArticleFiles {
  const coverRaw = form.get("cover");
  const galleryRaw = form.getAll("gallery");
  return {
    cover: coverRaw instanceof File && coverRaw.size > 0 ? coverRaw : null,
    gallery: galleryRaw.filter(
      (f): f is File => f instanceof File && f.size > 0,
    ),
  };
}

function inputFromForm(form: FormData): ArticleInput {
  return {
    title: String(form.get("title") || ""),
    slug: String(form.get("slug") || ""),
    tags: String(form.get("tags") || ""),
    excerpt: String(form.get("excerpt") || ""),
    body: String(form.get("body") || ""),
    publishedAt: String(form.get("publishedAt") || ""),
    coverUrl: String(form.get("coverUrl") || ""),
    galleryUrls: String(form.get("galleryUrls") || ""),
  };
}

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const form = await request.formData();
    const article = await updateArticle(id, inputFromForm(form), filesFromForm(form));
    revalidatePortfolioContent(article.slug);
    return NextResponse.json({ ok: true, article });
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
    await deleteArticle(id);
    revalidatePortfolioContent();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed" },
      { status: 400 },
    );
  }
}
