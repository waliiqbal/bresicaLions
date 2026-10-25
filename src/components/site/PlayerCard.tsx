import Image from "next/image";
import Link from "next/link";
import type { Player } from "@/modules/players/player.types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export function PlayerCard({
  player,
  className,
  priority = false,
}: {
  player: Player;
  className?: string;
  priority?: boolean;
}) {
  const label = player.isCaptain ? `Captain · ${player.role}` : player.role;

  return (
    <Link href={`/squad/${player.slug}`} className={cn("group block", className)}>
      <Card className="overflow-hidden">
        <div className="relative aspect-[4/5] bg-linear-to-br from-green-card to-green-deep">
          {player.image && (
            <Image
              src={player.image}
              alt={player.name}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 60vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-green-deep via-green-deep/20 to-transparent" />
          <span className="absolute left-3 top-2 font-heading text-4xl font-bold text-cream/85 drop-shadow-lg">
            {String(player.number).padStart(2, "0")}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="text-sm font-bold text-cream">{player.name}</h3>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gold-light">
              {label}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
