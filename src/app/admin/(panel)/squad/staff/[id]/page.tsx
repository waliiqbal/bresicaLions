import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaffForm } from "@/components/admin/StaffForm";
import { AdminHeader } from "@/components/admin/ui";
import { getStaffForAdmin } from "@/modules/staff/staff.service";

export const metadata: Metadata = { title: "Edit staff member" };

export default async function EditStaffPage({
  params,
}: PageProps<"/admin/squad/staff/[id]">) {
  const { id } = await params;
  const staff = await getStaffForAdmin(id);
  if (!staff) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminHeader eyebrow="Squad" title="Edit staff member" />
      <StaffForm staff={staff} />
    </div>
  );
}
