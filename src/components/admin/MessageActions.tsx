"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";
import { DeleteButton } from "./DeleteButton";

type MessageActionsProps = {
  id: string;
  email: string;
  subject: string;
  read: boolean;
};

/** Opening a message marks it as read; the buttons let the admin undo that, reply or delete. */
export function MessageActions({ id, email, subject, read }: MessageActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!read) {
      sendJson(`/api/messages/${id}`, { read: true }, "PATCH").then(() => router.refresh());
    }
    // Only when the message is first opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function markUnread() {
    setBusy(true);
    const result = await sendJson(`/api/messages/${id}`, { read: false }, "PATCH");
    setBusy(false);
    if (result.ok) router.push("/admin/messages");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-3">
      <ButtonLink href={`mailto:${email}?subject=${encodeURIComponent(subject)}`} variant="dark">
        Reply by email
      </ButtonLink>
      <Button type="button" variant="outlineDark" onClick={markUnread} disabled={busy}>
        Mark as unread
      </Button>
      <DeleteButton
        endpoint={`/api/messages/${id}`}
        itemName="this message"
        message="The message will be deleted for good."
        redirectTo="/admin/messages?notice=deleted"
      />
    </div>
  );
}
