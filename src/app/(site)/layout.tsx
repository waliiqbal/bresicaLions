import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";

// Every public page reads the database, so it is rendered on each request.
// A pre-built copy would go stale on hosts where cache refreshing does not
// work (new stories missing on the home page) and would need the database at build time.
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold focus:px-5 focus:py-2 focus:text-xs focus:font-bold focus:uppercase focus:text-green-deep"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
