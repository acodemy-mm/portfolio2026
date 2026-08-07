import { revalidatePath } from "next/cache";

type RevalidateOptions = {
  slug?: string;
  activityId?: string;
};

/** Bust public page caches after admin CMS writes. */
export function revalidatePortfolioContent(
  slugOrOptions?: string | RevalidateOptions,
) {
  const options =
    typeof slugOrOptions === "string"
      ? { slug: slugOrOptions }
      : slugOrOptions || {};

  revalidatePath("/", "layout");
  revalidatePath("/work");
  if (options.slug) {
    revalidatePath(`/work/${options.slug}`);
    revalidatePath(`/articles/${options.slug}`);
  }
  revalidatePath("/activity");
  if (options.activityId) revalidatePath(`/activity/${options.activityId}`);
  revalidatePath("/skills");
  revalidatePath("/about");
  revalidatePath("/resume");
  revalidatePath("/services");
  revalidatePath("/articles");
}
