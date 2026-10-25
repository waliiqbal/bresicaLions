import type { Metadata } from "next";
import { StaffForm } from "@/components/admin/StaffForm";
import { AdminHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Add staff member" };

export default function NewStaffPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <AdminHeader eyebrow="Squad" title="Add staff member" />
      <StaffForm />
    </div>
  );
}
