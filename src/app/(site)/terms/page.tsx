import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/LegalPage";
import { siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/modules/settings/settings.service";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The rules for using the Brescia Lions website.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const { contact } = await getSiteSettings();

  return (
    <LegalPage white="Terms of" gold="Use">
      <p>
        By using the {siteConfig.name} website you agree to these terms. If you do not agree, please
        do not use the website.
      </p>

      <h2>About the website</h2>
      <p>
        The website gives fans news, fixtures, results, squad details and a way to contact the club.
        We work to keep the information correct and up to date, but match details, scores, tables and
        player information may change or contain mistakes, and we do not promise that they are
        complete or always current.
      </p>

      <h2>Our content</h2>
      <p>
        The {siteConfig.name} name, crest, logo, photos, texts and design belong to the club or its
        partners and are protected by copyright and trademark law. You may share links to our pages
        and quote short parts of our news with a link back to the source. Please do not copy, sell or
        use our crest, photos or other content for commercial purposes without our written permission.
      </p>

      <h2>Using the website</h2>
      <ul>
        <li>Do not try to break, overload or gain unauthorised access to the website or the admin area.</li>
        <li>Do not use the contact form or newsletter box to send spam, false, offensive or unlawful content.</li>
        <li>Do not use automated tools to copy large parts of the website.</li>
      </ul>
      <p>We may block anyone who misuses the website.</p>

      <h2>Messages and newsletter</h2>
      <p>
        What you send us is handled as described in our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Links to other websites</h2>
      <p>
        The website links to other sites, such as social media and partners. We do not control them
        and are not responsible for their content or privacy practices.
      </p>

      <h2>Liability</h2>
      <p>
        The website is provided &ldquo;as is&rdquo;. As far as the law allows, we are not liable for
        losses that come from using the website or from relying on its information, or from it being
        unavailable for a time. Nothing in these terms limits rights that you have by law as a consumer.
      </p>

      <h2>Law</h2>
      <p>
        These terms follow Italian law. Disputes are handled by the competent courts, without
        affecting any consumer rights to use the courts of your own place of residence.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Write to <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>
    </LegalPage>
  );
}
