import Image from "next/image";
import type { AboutContent } from "@/modules/about/about.types";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatsList } from "./StatsList";

export function AboutSection({ about }: { about: AboutContent }) {
  const [white, ...rest] = about.heading.split(" ");
  const gold = rest.pop() ?? "";
  const lead = [white, ...rest].join(" ");

  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-gold/40 shadow-card">
        <Image
          src={about.image}
          alt="Brescia Lions"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-green-deep/50 to-transparent" />
      </div>

      <div>
        <SectionHeading white={lead} gold={gold} className="mb-5" />
        <div className="space-y-4 text-cream/80">
          {about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <div className="mt-8">
          <StatsList stats={about.stats} />
        </div>

        <ButtonLink href="/about" className="mt-8">
          Read More
        </ButtonLink>
      </div>
    </div>
  );
}
