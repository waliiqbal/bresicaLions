import type { ReactNode } from "react";
import { PageHeader } from "./PageHeader";
import { Section } from "./Section";

/** Date shown on the privacy and terms pages. Change it whenever the text changes. */
export const LEGAL_UPDATED = "24 October 2026";

type LegalPageProps = {
  white: string;
  gold: string;
  children: ReactNode;
};

// Shared layout for Privacy Policy and Terms of Use.
export function LegalPage({ white, gold, children }: LegalPageProps) {
  return (
    <>
      <PageHeader eyebrow={`Last updated ${LEGAL_UPDATED}`} white={white} gold={gold} />
      <Section>
        <div className="article-content mx-auto max-w-3xl">{children}</div>
      </Section>
    </>
  );
}
