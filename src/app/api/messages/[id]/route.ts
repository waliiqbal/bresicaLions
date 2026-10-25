import { apiError, ok, parseBody } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { updateMessageDto } from "@/modules/messages/message.dto";
import {
  deleteMessage,
  getMessageForAdmin,
  setMessageRead,
} from "@/modules/messages/message.service";

type Ctx = RouteContext<"/api/messages/[id]">;

export const GET = withAdmin<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  const message = await getMessageForAdmin(id);
  return message ? ok({ message }) : apiError("not_found", "Message not found.", 404);
});

// PATCH { read: true | false }
export const PATCH = withAdmin<Ctx>(async (req, { params }) => {
  const { id } = await params;
  const parsed = await parseBody(req, updateMessageDto);
  if (parsed.response) return parsed.response;

  const message = await setMessageRead(id, parsed.data.read);
  return message ? ok({ message }) : apiError("not_found", "Message not found.", 404);
});

export const DELETE = withAdmin<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  return (await deleteMessage(id))
    ? ok()
    : apiError("not_found", "Message not found.", 404);
});
