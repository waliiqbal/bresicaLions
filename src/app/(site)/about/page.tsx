import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Logo } from "@/components/site/Logo";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { StaffCard } from "@/components/site/StaffCard";
import { StatsList } from "@/components/site/StatsList";
import { getAbout } from "@/modules/about/about.service";
import { getSupportStaff } from "@/modules/staff/staff.service";
import { HASHTAG_SRC, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The story of the Brescia Lions: our history, the meaning of our crest, our mission and the people behind the club.",
};

export default async function AboutPage() {
  const [about, coaching] = await Promise.all([getAbout(), getSupportStaff()]);

  return (
    <>
      <PageHeader
        eyebrow={siteConfig.tagline}
        white="About"
        gold="Us"
        subtitle="A New Pride. A New Chapter."
      />

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading white="Who We" gold="Are" className="mb-5" />
            <div className="space-y-4 text-cream/80">
              {about.history.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-l-2 border-gold pl-4">
              {about.historyClosing.map((p) => (
                <p key={p} className="font-heading text-lg font-bold text-gold-light">
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-8">
              <StatsList stats={about.stats} />
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-gold/40 shadow-card lg:sticky lg:top-28">
            <Image
              src={about.historyImage}
              alt="Brescia Cricket Ground"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-green-deep/50 to-transparent" />
          </div>
        </div>
      </Section>

      <Section className="bg-black/20">
        <div className="grid items-start gap-10 lg:grid-cols-[22rem_1fr] lg:gap-14">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl border border-gold/40 bg-linear-to-br from-green-card to-green-deep shadow-card lg:sticky lg:top-28 lg:max-w-none">
            {about.owner.image ? (
              <Image
                src={about.owner.image}
                alt={about.owner.name}
                fill
                sizes="(min-width: 1024px) 22rem, 384px"
                className="object-cover"
              />
            ) : (
              <svg
                viewBox="0 0 100 125"
                preserveAspectRatio="xMidYMax slice"
                aria-hidden="true"
                className="absolute inset-0 size-full text-cream/15"
              >
                <circle cx="50" cy="45" r="19" fill="currentColor" />
                <path d="M12 125c0-29 17-46 38-46s38 17 38 46z" fill="currentColor" />
              </svg>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-green-deep/60 to-transparent" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold">
              {about.owner.kicker}
            </p>
            <SectionHeading
              white={about.owner.name.split(" ")[0]}
              gold={about.owner.name.split(" ").slice(1).join(" ")}
              subtitle="Owner of Brescia Lions"
              className="mt-2 mb-5"
            />
            <div className="space-y-4 text-cream/80">
              {about.owner.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-l-2 border-gold pl-4">
              {about.owner.closing.map((p) => (
                <p key={p} className="font-heading text-lg font-bold text-gold-light">
                  {p}
                </p>
              ))}
            </div>
            <p className="mt-5 text-sm font-bold uppercase tracking-widest text-cream/70">
              {about.owner.signature}
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          white="The Story Behind"
          gold="The Crest"
          subtitle={siteConfig.tagline}
        />
        <div className="grid items-start gap-10 lg:grid-cols-[22rem_1fr] lg:gap-14">
          <div className="flex flex-col items-center gap-4 justify-self-center lg:sticky lg:top-28 lg:justify-self-auto">
            <Logo size={420} className="w-72 sm:w-80 lg:w-full" />
            <Image
              src={HASHTAG_SRC}
              alt={siteConfig.hashtag}
              width={220}
              height={92}
              className="h-auto w-48"
            />
          </div>
          <div>
            <p className="mb-6 text-lg text-cream/80">{about.crestIntro}</p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {about.crestElements.map((item) => (
                <li key={item.title} className="sm:last:odd:col-span-2">
                  <Card className="h-full p-5 hover:translate-y-0">
                    <h3 className="font-heading text-lg font-bold text-gold-light">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="mt-1 text-sm font-semibold text-cream">
                        {item.subtitle}
                      </p>
                    )}
                    <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-cream/70">
                      {item.text.split("\n").map((line) => {
                        const colon = line.indexOf(": ");
                        return colon > 0 ? (
                          <p key={line}>
                            <span className="font-bold text-gold-light">
                              {line.slice(0, colon + 1)}
                            </span>{" "}
                            {line.slice(colon + 2)}
                          </p>
                        ) : (
                          <p key={line}>{line}</p>
                        );
                      })}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section className="bg-black/20">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-7 hover:translate-y-0">
            <h2 className="font-heading text-3xl font-bold uppercase text-cream">
              Our <span className="text-gold-light">Mission</span>
            </h2>
            <p className="mt-4 leading-relaxed text-cream/80">{about.mission}</p>
          </Card>
          <Card className="p-7 hover:translate-y-0">
            <h2 className="font-heading text-3xl font-bold uppercase text-cream">
              Our <span className="text-gold-light">Vision</span>
            </h2>
            <p className="mt-4 leading-relaxed text-cream/80">{about.vision}</p>
          </Card>
        </div>
      </Section>

      <Section>
        {coaching.length > 0 && (
          <>
            <SectionHeading
              white="Coaching"
              gold="Staff"
              subtitle="The team behind the team"
            />
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {coaching.map((member) => (
                <li key={member.id}>
                  <StaffCard member={member} href={`/squad/staff/${member.slug}`} />
                </li>
              ))}
            </ul>
          </>
        )}
        <div className={coaching.length > 0 ? "mt-12 text-center" : "text-center"}>
          <ButtonLink href="/squad">Meet The Squad</ButtonLink>
        </div>
      </Section>
    </>
  );
}
