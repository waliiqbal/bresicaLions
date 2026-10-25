import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AdminHeader } from "@/components/admin/ui";
import { getSettingsForAdmin } from "@/modules/settings/settings.service";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsAdminPage() {
  const settings = await getSettingsForAdmin();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminHeader
        eyebrow="Settings"
        title="Contact, social & footer"
        description="Change the club's contact details and social links. They update on the whole website at once."
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
