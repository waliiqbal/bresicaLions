import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlayerCard } from "@/components/site/PlayerCard";
import { Section } from "@/components/site/Section";
import {
  getPlayerBySlug,
  getPlayerSlugs,
  getRelatedPlayers,
} from "@/modules/players/player.service";

export async function generateStaticParams() {
  const slugs = await getPlayerSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/squad/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) return {};

  const title = `${player.name} · ${player.role}`;
  return {
    title,
    description: player.bio,
    openGraph: {
      title,
      description: player.bio,
      images: player.image ? [{ url: player.image }] : undefined,
    },
  };
}

export default async function PlayerPage({
  params,
}: PageProps<"/squad/[slug]">) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) notFound();

  const related = await getRelatedPlayers(player, 4);

  const facts = [
    { label: "Shirt number", value: `#${player.number}` },
    { label: "Role", value: player.role },
    { label: "Batting", value: player.battingStyle },
    { label: "Bowling", value: player.bowlingStyle },
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
        <ButtonLink href="/squad" variant="outline" className="mb-8">
          ← Full Squad
        </ButtonLink>

        <div className="grid gap-10 md:grid-cols-[20rem_1fr] lg:grid-cols-[24rem_1fr] lg:gap-14">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl border border-gold/40 bg-linear-to-br from-green-card to-green-deep shadow-card md:mx-0 md:max-w-none">
            {player.image && (
              <Image
                src={player.image}
                alt={player.name}
                fill
                priority
                sizes="(min-width: 768px) 24rem, 90vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-green-deep/70 via-transparent to-transparent" />
            <span className="absolute left-4 top-3 font-heading text-6xl font-bold text-cream/85 drop-shadow-lg">
              {String(player.number).padStart(2, "0")}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {player.isCaptain && <Badge>Captain</Badge>}
              <Badge tone="muted">{player.role}</Badge>
            </div>
            <h1 className="mt-4 font-heading text-4xl font-bold uppercase leading-tight text-cream sm:text-5xl">
              {player.name}
            </h1>

            <dl className="mt-8 grid grid-cols-2 gap-4">
              {facts.map((fact) => (
                <Card key={fact.label} className="p-4 hover:translate-y-0">
                  <dt className="text-[10px] font-bold uppercase tracking-widest text-gold">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 font-semibold text-cream">{fact.value}</dd>
                </Card>
              ))}
            </dl>

            <div className="mt-8">
              <h2 className="font-heading text-2xl font-bold text-gold-light">
                Profile
              </h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-cream/80">
                {player.bio}
              </p>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <Section className="bg-black/20">
          <SectionHeading
            white="More From The"
            gold="Squad"
            subtitle="Teammates"
          />
          <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
            {related.map((item) => (
              <li key={item.id}>
                <PlayerCard player={item} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
