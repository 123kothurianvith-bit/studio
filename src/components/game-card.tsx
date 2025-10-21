"use client";

import Image from 'next/image';
import type { Game } from '@/lib/types';
import Link from 'next/link';
import { Star } from 'lucide-react';

type GameCardProps = {
  game: Game;
};

export default function GameCard({ game }: GameCardProps) {
  
  return (
    <Link href={`/game/${game.id}`} className="group flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
        <Image
          src={game.coverImage}
          alt={game.title}
          fill
          sizes="64px"
          className="object-cover"
          data-ai-hint={game.imageHint}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{game.title}</p>
        <p className="text-sm text-muted-foreground">{game.genre}</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{game.averageRating?.toFixed(1) ?? 'N/A'}</span>
          <Star className="h-3 w-3 fill-current" />
        </div>
      </div>
    </Link>
  );
}
