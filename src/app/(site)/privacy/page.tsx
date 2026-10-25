import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/modules/settings/settings.service";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How the Brescia Lions website collects and uses personal data.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const { contact } = await getSiteSettings();

  return (
    <LegalPage white="Privacy" gold="Policy">
      <p>
        This page explains what personal data the {siteConfig.name} website collects, why, and
        what your rights are. We collect as little as possible and we do not use advertising or
        tracking cookies.
      </p>

      <h2>Who is responsible</h2>
      <p>
        {siteConfig.name} is responsible for the data collected on this website. You can contact us
        about your data at <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>

      <h2>What we collect and why</h2>
      <ul>
        <li>
          <strong>Contact form.</strong> Your name, email address and message, so we can read and
          answer you. Legal basis: your request (GDPR art. 6(1)(b)) and our legitimate interest in
          replying to enquiries (art. 6(1)(f)). We keep messages only as long as needed to answer
          you and keep a record of the conversation, then delete them.
        </li>
        <li>
          <strong>Newsletter.</strong> Your email address, if you subscribe in the website footer,
          so we can send you news about the club. Legal basis: your consent (art. 6(1)(a)). You can
          withdraw it at any time by writing to us and we will remove you from the list.
        </li>
        <li>
          <strong>Technical data.</strong> Like every website, our host receives your IP address and
          browser details when you load a page. We also use your IP address, in a short-lived counter,
          to stop spam on our forms (legitimate interest, art. 6(1)(f)). We do not build profiles
          from it.
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        Visitors do not get any cookies from us. A single technical cookie is used only when club
        staff log in to the admin area; it is needed for the login to work and is not used for
        tracking. We do not use analytics, advertising or social media tracking cookies.
      </p>
      <p>
        The map on the Contact page is provided by Google Maps. When that page loads, Google may
        receive your IP address and set its own cookies, under{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google&apos;s privacy policy
        </a>
        . Links to Instagram, Facebook, X, YouTube and TikTok take you to those services, which have
        their own policies.
      </p>

      <h2>Who receives your data</h2>
      <p>
        We do not sell your data. We use trusted service providers who process it for us: our web
        hosting provider, our database provider (MongoDB Atlas), our image storage provider
        (Cloudinary) and our email provider. Some of them may store data outside the European Economic
        Area, using the safeguards required by the GDPR (such as standard contractual clauses).
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us at any time to access, correct or delete your data, to restrict or object to
        how we use it, to receive it in a portable format, or to withdraw a consent you gave. Write to{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a> and we will answer within one month.
        You also have the right to complain to the Italian data protection authority, the{" "}
        <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">
          Garante per la protezione dei dati personali
        </a>
        .
      </p>

      <h2>Children</h2>
      <p>
        This website is not meant for children under 14 and we do not knowingly collect their data.
        If you think a child has sent us personal data, tell us and we will delete it.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy. The date at the top of the page shows when it last changed.
      </p>
    </LegalPage>
  );
}
