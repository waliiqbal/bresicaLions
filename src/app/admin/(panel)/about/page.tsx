import type { Metadata } from "next";
import { AboutForm } from "@/components/admin/AboutForm";
import { AdminHeader } from "@/components/admin/ui";
import { getAboutForAdmin } from "@/modules/about/about.service";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutAdminPage() {
  const about = await getAboutForAdmin();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminHeader
        eyebrow="About Us"
        title="About Us page"
        description="The club story, owner, crest and mission. The first part also appears as the intro on the home page. The coaching staff are managed in Squad."
      />
      <AboutForm about={about} />
    </div>
  );
}
