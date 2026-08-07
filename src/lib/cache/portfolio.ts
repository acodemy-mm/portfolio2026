import { revalidatePath } from "next/cache";

/** Bust public page caches after admin CMS writes. */
export function revalidatePortfolioContent(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/work");
  if (slug) {
    revalidatePath(`/work/${slug}`);
    revalidatePath(`/articles/${slug}`);
  }
  revalidatePath("/activity");
  revalidatePath("/skills");
  revalidatePath("/about");
  revalidatePath("/resume");
  revalidatePath("/services");
  revalidatePath("/articles");
}
