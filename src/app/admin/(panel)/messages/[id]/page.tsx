import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageActions } from "@/components/admin/MessageActions";
import { AdminHeader, Notice, Panel } from "@/components/admin/ui";
import { getMessageForAdmin } from "@/modules/messages/message.service";

export const metadata: Metadata = { title: "Message" };

const dateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Rome",
});

export default async function MessageAdminPage({
  params,
}: PageProps<"/admin/messages/[id]">) {
  const { id } = await params;
  const message = await getMessageForAdmin(id);
  if (!message) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/messages" className="mb-6 inline-block text-sm font-semibold text-green-card hover:underline">
        ← All messages
      </Link>
      <AdminHeader eyebrow="Message" title={message.name} description={message.email} />

      {!message.emailed && (
        <Notice tone="error">
          The email to the club could not be sent (check the email settings). The message is saved here.
        </Notice>
      )}

      <Panel className="space-y-5">
        <p className="text-xs text-ink/55">Received {dateTime.format(new Date(message.createdAt))} (Italian time)</p>
        {/* Plain text: never rendered as HTML. */}
        <p className="whitespace-pre-wrap break-words leading-relaxed text-ink">{message.message}</p>
      </Panel>

      <div className="mt-6">
        <MessageActions
          id={message.id}
          email={message.email}
          subject={`Re: your message to Brescia Lions`}
          read={message.read}
        />
      </div>
    </div>
  );
}
