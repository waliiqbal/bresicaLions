import type { Metadata } from "next";
import { PlayerForm } from "@/components/admin/PlayerForm";
import { AdminHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Add player" };

export default function NewPlayerPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <AdminHeader eyebrow="Squad" title="Add player" />
      <PlayerForm />
    </div>
  );
}
