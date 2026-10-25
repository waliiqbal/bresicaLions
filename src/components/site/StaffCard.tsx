import Image from "next/image";
import Link from "next/link";
import type { StaffMember } from "@/modules/staff/staff.types";
import { Card } from "@/components/ui/Card";

type StaffCardProps = {
  member: StaffMember;
  /** When set, the whole card opens the staff profile. */
  href?: string;
  priority?: boolean;
};

export function StaffCard({ member, href, priority = false }: StaffCardProps) {
  const card = (
    <Card className="h-full overflow-hidden">
      <div className="relative aspect-[4/5] bg-linear-to-br from-green-card to-green-deep">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 60vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
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
        <div className="absolute inset-0 bg-linear-to-t from-green-deep via-green-deep/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-sm font-bold text-cream">{member.name}</h3>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gold-light">
            {member.role}
          </p>
        </div>
      </div>
      {member.bio && (
        <div className="p-4">
          <p className="line-clamp-3 text-sm leading-relaxed text-cream/70">
            {member.bio}
          </p>
          {href && (
            <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-gold-light">
              View profile →
            </p>
          )}
        </div>
      )}
    </Card>
  );

  if (!href) return card;
  return (
    <Link href={href} className="group block h-full">
      {card}
    </Link>
  );
}
