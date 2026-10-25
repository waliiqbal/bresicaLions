import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlayerForm } from "@/components/admin/PlayerForm";
import { AdminHeader } from "@/components/admin/ui";
import { getPlayerForAdmin } from "@/modules/players/player.service";

export const metadata: Metadata = { title: "Edit player" };

export default async function EditPlayerPage({
  params,
}: PageProps<"/admin/squad/[id]">) {
  const { id } = await params;
  const player = await getPlayerForAdmin(id);
  if (!player) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminHeader eyebrow="Squad" title="Edit player" />
      <PlayerForm player={player} />
    </div>
  );
}
