import { ok, parseBody } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { reorderArticlesDto } from "@/modules/articles/article.dto";
import { reorderArticles } from "@/modules/articles/article.service";

// POST { ids: [...] } with the story ids in their new order.
export const POST = withAdmin(async (req) => {
  const parsed = await parseBody(req, reorderArticlesDto);
  if (parsed.response) return parsed.response;

  await reorderArticles(parsed.data.ids);
  revalidateSite();
  return ok();
});
