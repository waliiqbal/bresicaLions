import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Section } from "@/components/site/Section";
import { StaffCard } from "@/components/site/StaffCard";
import {
  getStaffBySlug,
  getStaffSlugs,
  getSupportStaff,
} from "@/modules/staff/staff.service";

export async function generateStaticParams() {
  const slugs = await getStaffSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/squad/staff/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const member = await getStaffBySlug(slug);
  if (!member) return {};

  const title = `${member.name} · ${member.role}`;
  const description = member.bio ?? `${member.name}, ${member.role} at the Brescia Lions.`;
  return {
    title,
    description,
    alternates: { canonical: `/squad/staff/${member.slug}` },
    openGraph: {
      title,
      description,
      images: member.image ? [{ url: member.image }] : undefined,
    },
  };
}

export default async function StaffPage({
  params,
}: PageProps<"/squad/staff/[slug]">) {
  const { slug } = await params;
  const member = await getStaffBySlug(slug);
  if (!member) notFound();

  const others = (await getSupportStaff())
    .filter((m) => m.slug !== member.slug)
    .slice(0, 4);

  const facts = [
    { label: "Role", value: member.role },
    member.experience && { label: "Experience", value: member.experience },
    member.speciality && { label: "Speciality", value: member.speciality },
  ].filter(Boolean) as { label: string; value: string }[];

  const paragraphs = (member.profile ?? member.bio ?? "")
    .split(/\n{2,}/)
    .filter(Boolean);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
        <ButtonLink href="/squad" variant="outline" className="mb-8">
          ← Full Squad
        </ButtonLink>

        <div className="grid gap-10 md:grid-cols-[20rem_1fr] lg:grid-cols-[24rem_1fr] lg:gap-14">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl border border-gold/40 bg-linear-to-br from-green-card to-green-deep shadow-card md:mx-0 md:max-w-none">
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name}
                fill
                priority
                sizes="(min-width: 768px) 24rem, 90vw"
                className="object-cover"
              />
            ) : (
              <svg
                viewBox="0 0 100 133"
                preserveAspectRatio="xMidYMax slice"
                aria-hidden="true"
                className="absolute inset-0 size-full text-cream/15"
              >
                <circle cx="50" cy="48" r="20" fill="currentColor" />
                <path d="M12 133c0-30 17-48 38-48s38 18 38 48z" fill="currentColor" />
              </svg>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-green-deep/60 via-transparent to-transparent" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">
              {member.role}
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold uppercase leading-tight text-cream sm:text-5xl">
              {member.name}
            </h1>

            <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {facts.map((fact) => (
                <Card key={fact.label} className="p-4 hover:translate-y-0">
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-gold">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 font-semibold text-cream">{fact.value}</dd>
                </Card>
              ))}
            </dl>

            {paragraphs.length > 0 && (
              <div className="mt-8">
                <h2 className="font-heading text-2xl font-bold text-gold-light">
                  Profile
                </h2>
                <div className="mt-3 max-w-2xl space-y-4 leading-relaxed text-cream/80">
                  {paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <Section className="bg-black/20">
          <SectionHeading
            white="More From The"
            gold="Staff"
            subtitle="Coaches and support staff"
          />
          <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
            {others.map((item) => (
              <li key={item.id}>
                <StaffCard member={item} href={`/squad/staff/${item.slug}`} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
