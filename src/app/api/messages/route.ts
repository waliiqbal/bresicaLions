import { after, type NextRequest } from "next/server";
import { apiError, clientIp, ok, parseBody } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createMessageDto } from "@/modules/messages/message.dto";
import {
  createMessage,
  emailMessageToClub,
  listMessagesForAdmin,
  type MessageFilter,
} from "@/modules/messages/message.service";

// PUBLIC on purpose: the website contact form posts here. It is protected by a
// same-origin check, validation, a hidden bot trap and a per-visitor limit.
export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, createMessageDto);
  if (parsed.response) return parsed.response;

  // Bots fill the hidden field: pretend it worked and save nothing.
  if (parsed.data.website) return ok(undefined, { status: 201 });

  const limit = await rateLimit(`contact:${clientIp(req)}`, 5, 60 * 60);
  if (!limit.allowed) {
    return apiError(
      "rate_limited",
      "You have sent several messages already. Please try again later.",
      429,
      { retryAfter: limit.retryAfter },
    );
  }

  const message = await createMessage(parsed.data);
  after(() => emailMessageToClub(message));
  return ok(undefined, { status: 201 });
}

// GET /api/messages?q=&filter=all|unread  (admin)
export const GET = withAdmin(async (req) => {
  const params = req.nextUrl.searchParams;
  const messages = await listMessagesForAdmin({
    query: params.get("q") ?? undefined,
    filter: (params.get("filter") === "unread" ? "unread" : "all") as MessageFilter,
  });
  return ok({ messages });
});
