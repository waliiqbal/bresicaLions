import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AboutSection } from "@/components/site/AboutSection";
import { ComingSoonCard } from "@/components/site/ComingSoonCard";
import { HeroSlider } from "@/components/site/HeroSlider";
import { MatchCard } from "@/components/site/MatchCard";
import { NewsCard } from "@/components/site/NewsCard";
import { PhotoMosaic } from "@/components/site/PhotoMosaic";
import { PlayerCard } from "@/components/site/PlayerCard";
import { ScrollRow } from "@/components/site/ScrollRow";
import { Section } from "@/components/site/Section";
import { getAbout } from "@/modules/about/about.service";
import { getLatestArticles } from "@/modules/articles/article.service";
import { getActiveBanners } from "@/modules/banners/banner.service";
import { defaultBanner } from "@/modules/banners/default-banner";
import { getLatestGalleryItems } from "@/modules/gallery/gallery.service";
import { getUpcomingMatches } from "@/modules/matches/match.service";
import { getPlayers } from "@/modules/players/player.service";
import { getSiteSettings } from "@/modules/settings/settings.service";
import { getSponsors } from "@/modules/sponsors/sponsor.service";
import { SponsorsRow } from "@/components/site/SponsorsRow";
import { JsonLd } from "@/components/site/JsonLd";
import { LOGO_SRC, SITE_URL, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [banners, matches, articles, about, players, gallery, sponsors, settings] =
    await Promise.all([
      getActiveBanners(),
      getUpcomingMatches(3),
      getLatestArticles(12),
      getAbout(),
      getPlayers(),
      getLatestGalleryItems(5),
      getSponsors(),
      getSiteSettings(),
    ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsTeam",
          name: siteConfig.name,
          sport: "Cricket",
          slogan: siteConfig.tagline,
          url: SITE_URL,
          logo: `${SITE_URL}${LOGO_SRC}`,
          location: {
            "@type": "Place",
            address: settings.contact.address,
          },
        }}
      />
      <HeroSlider slides={banners.length > 0 ? banners : [defaultBanner]} />

      <Section>
        <SectionHeading
          white="Upcoming"
          gold="Fixtures"
          subtitle="Next matches of the Brescia Lions"
        />
        {matches.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <ComingSoonCard />
        )}
        <div className="mt-10 text-center">
          <ButtonLink href="/fixtures" variant="outline">
            View All Fixtures
          </ButtonLink>
        </div>
      </Section>

      <Section className="bg-black/20">
        <SectionHeading
          white="Latest"
          gold="News"
          subtitle="Stories from the den"
        />
        {articles.length > 3 ? (
          // More than three stories: a slider (swipe, arrows or the scrollbar).
          <ScrollRow scrollbar>
            {articles.map((article, i) => (
              <div
                key={article.id}
                className="flex w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]"
              >
                <div className="w-full">
                  <NewsCard article={article} priority={i < 3} />
                </div>
              </div>
            ))}
          </ScrollRow>
        ) : articles.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-cream/70">No news yet. Check back soon.</p>
        )}
        <div className="mt-10 text-center">
          <ButtonLink href="/news" variant="outline">
            View All News
          </ButtonLink>
        </div>
      </Section>

      <Section>
        <AboutSection about={about} />
      </Section>

      {players.length > 0 && (
        <Section className="bg-black/20">
          <SectionHeading
            white="Meet the"
            gold="Squad"
            subtitle="The pride of Brescia"
          />
          <ScrollRow>
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                className="w-52 shrink-0 snap-start sm:w-60"
              />
            ))}
          </ScrollRow>
          <div className="mt-6 text-center">
            <ButtonLink href="/squad" variant="outline">
              View Full Squad
            </ButtonLink>
          </div>
        </Section>
      )}

      {gallery.length > 0 && (
        <Section>
          <SectionHeading
            white="Photo"
            gold="Gallery"
            subtitle="Moments from the field"
          />
          <PhotoMosaic items={gallery} />
          <div className="mt-10 text-center">
            <ButtonLink href="/gallery" variant="outline">
              View Gallery
            </ButtonLink>
          </div>
        </Section>
      )}

      <Section className="bg-black/20">
        {sponsors.length > 0 && (
          <div className="mb-14">
            <SectionHeading
              white="Our"
              gold="Sponsors"
              subtitle="The partners who stand with the Lions"
            />
            <SponsorsRow sponsors={sponsors} />
          </div>
        )}
        <SectionHeading
          white="Partner with the"
          gold="Lions"
          subtitle="Grow your brand with Brescia's cricket family"
        />
        <Card className="w-full p-8 text-center">
          <p className="text-cream/80">
            Join us as a sponsor and put your brand in front of our fans, on
            the field and online. Get in touch and let&apos;s build something
            together.
          </p>
          <div className="mt-6">
            <ButtonLink href="/contact">Contact Us</ButtonLink>
          </div>
        </Card>
      </Section>
    </>
  );
}
