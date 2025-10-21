"use client";

import Image from 'next/image';
import type { Game } from '@/lib/types';
import { Card, CardContent, CardTitle } from './ui/card';
import { Star } from 'lucide-react';
import Link from 'next/link';

type GameCardProps = {
  game: Game;
};

export default function GameCard({ game }: GameCardProps) {
  
  return (
    <Link href={`/game/${game.id}`} className="group h-full">
      <Card className="h-full transform overflow-hidden border-0 bg-transparent shadow-none transition-all duration-300 hover:bg-accent">
        <CardContent className="p-4">
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
          <div className="mt-2">
              <CardTitle className="truncate text-base font-medium">{game.title}</CardTitle>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="font-medium">{game.averageRating?.toFixed(1) || 'New'}</span>
                  {game.averageRating !== undefined && <Star className="h-3 w-3 fill-current" />}
              </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
