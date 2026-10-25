import type { Metadata } from "next";
import { Sidebar } from "@/components/admin/Sidebar";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

// Admin pages are always rendered per request. Without this, `next build`
// also runs the page bodies (in parallel with the login check) and a page that
// creates the Lions team would write to the database during the build.
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: LayoutProps<"/admin">) {
  // Second lock after proxy.ts: checks the admin in the database too.
  const admin = await requireAdminPage();

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-paper text-ink lg:flex-row">
      <Sidebar email={admin.email} />
      <main id="main" className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
