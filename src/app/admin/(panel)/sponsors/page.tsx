import type { Metadata } from "next";
import { OrderedList } from "@/components/admin/OrderedList";
import { AdminHeader, EmptyState, Notice } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { listSponsorsForAdmin } from "@/modules/sponsors/sponsor.service";

export const metadata: Metadata = { title: "Sponsors" };

const notices: Record<string, string> = {
  created: "Sponsor added.",
  updated: "Sponsor updated.",
};

export default async function SponsorsAdminPage({
  searchParams,
}: PageProps<"/admin/sponsors">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const notice = typeof params.notice === "string" ? notices[params.notice] : undefined;
  const sponsors = await listSponsorsForAdmin(q);

  return (
    <div className="mx-auto max-w-5xl">
      <AdminHeader
        eyebrow="Partners"
        title="Sponsors"
        description="The sponsor logos shown on the home page, in the order below. With no sponsors the section is hidden."
        action={
          <ButtonLink href="/admin/sponsors/new" variant="dark">
            + Add sponsor
          </ButtonLink>
        }
      />

      {notice && <Notice>{notice}</Notice>}

      <form action="/admin/sponsors" role="search" className="mb-5 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search sponsors..."
          aria-label="Search sponsors"
          className="w-full rounded-lg border border-green-dark/25 bg-white px-3.5 py-2 text-sm sm:w-64"
        />
        <button
          type="submit"
          className="rounded-lg bg-green-dark px-4 text-xs font-bold uppercase tracking-wider text-cream"
        >
          Search
        </button>
      </form>

      {sponsors.length === 0 ? (
        <EmptyState
          title={q ? "No sponsors found" : "No sponsors yet"}
          text={q ? "Try a different search." : "Add your first sponsor. You can also load demo content from the Dashboard."}
          href="/admin/sponsors/new"
          actionLabel="Add sponsor"
        />
      ) : (
        <OrderedList
          items={sponsors.map((sponsor) => ({
            id: sponsor.id,
            title: sponsor.name,
            subtitle: sponsor.url,
            image: sponsor.logo,
            active: sponsor.active,
            isDemo: sponsor.isDemo,
          }))}
          apiPath="/api/sponsors"
          editPath="/admin/sponsors"
          itemName="this sponsor"
          deleteMessage="{name} will be removed from the website and the logo deleted."
          imageFit="contain"
          reorderDisabled={Boolean(q)}
        />
      )}
    </div>
  );
}
