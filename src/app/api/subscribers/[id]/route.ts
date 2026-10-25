import { apiError, ok } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { deleteSubscriber } from "@/modules/subscribers/subscriber.service";

type Ctx = RouteContext<"/api/subscribers/[id]">;

export const DELETE = withAdmin<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  return (await deleteSubscriber(id))
    ? ok()
    : apiError("not_found", "Subscriber not found.", 404);
});
