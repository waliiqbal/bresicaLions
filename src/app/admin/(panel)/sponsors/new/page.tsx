import type { Metadata } from "next";
import { SponsorForm } from "@/components/admin/SponsorForm";
import { AdminHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Add sponsor" };

export default function NewSponsorPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <AdminHeader eyebrow="Sponsors" title="Add sponsor" />
      <SponsorForm />
    </div>
  );
}
