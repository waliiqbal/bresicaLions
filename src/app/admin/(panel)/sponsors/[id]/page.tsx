import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SponsorForm } from "@/components/admin/SponsorForm";
import { AdminHeader } from "@/components/admin/ui";
import { getSponsorForAdmin } from "@/modules/sponsors/sponsor.service";

export const metadata: Metadata = { title: "Edit sponsor" };

export default async function EditSponsorPage({
  params,
}: PageProps<"/admin/sponsors/[id]">) {
  const { id } = await params;
  const sponsor = await getSponsorForAdmin(id);
  if (!sponsor) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminHeader eyebrow="Sponsors" title="Edit sponsor" />
      <SponsorForm sponsor={sponsor} />
    </div>
  );
}
