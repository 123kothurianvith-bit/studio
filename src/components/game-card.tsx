"use client";

import Image from 'next/image';
import type { Game } from '@/lib/types';
import Link from 'next/link';

type GameCardProps = {
  game: Game;
};

export default function GameCard({ game }: GameCardProps) {
  
  return (
    <Link href={`/game/${game.id}`} className="group">
      <div className="flex flex-col items-start gap-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={game.imageHint}
          />
        </div>
        <div className="w-full">
            <p className="truncate text-sm font-medium text-foreground">{game.title}</p>
        </div>
      </div>
    </Link>
  );
}
