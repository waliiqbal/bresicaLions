import type { NextRequest } from "next/server";
import { apiError, clientIp, ok, parseBody } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { subscribeDto } from "@/modules/subscribers/subscriber.dto";
import {
  listSubscribersForAdmin,
  subscribe,
} from "@/modules/subscribers/subscriber.service";

// PUBLIC on purpose: the footer subscribe box posts here. Same protection as
// the contact form. The answer is the same for new and existing emails.
export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, subscribeDto);
  if (parsed.response) return parsed.response;

  if (parsed.data.website) return ok(undefined, { status: 201 });

  const limit = await rateLimit(`subscribe:${clientIp(req)}`, 10, 60 * 60);
  if (!limit.allowed) {
    return apiError("rate_limited", "Too many attempts. Please try again later.", 429, {
      retryAfter: limit.retryAfter,
    });
  }

  await subscribe(parsed.data.email);
  return ok(undefined, { status: 201 });
}

// GET /api/subscribers?q=  (admin)
export const GET = withAdmin(async (req) => {
  const subscribers = await listSubscribersForAdmin(req.nextUrl.searchParams.get("q") ?? undefined);
  return ok({ subscribers });
});
