"use client";

import Image from 'next/image';
import type { Game } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Star } from 'lucide-react';
import Link from 'next/link';

type GameCardProps = {
  game: Game;
};

export default function GameCard({ game }: GameCardProps) {
  
  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (game.downloadUrl) {
      window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <Link href={`/game/${game.id}`} className="h-full group">
      <Card className="flex h-full transform flex-col overflow-hidden bg-card transition-all duration-300 hover:shadow-xl">
        <div className="relative h-40 w-full">
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={game.imageHint}
          />
        </div>
        <CardHeader className="p-4">
            <div className='flex items-start gap-4'>
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image
                        src={game.coverImage}
                        alt={`${game.title} icon`}
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <CardTitle className="truncate text-base font-medium">{game.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{game.genre}</p>
                    <div className="mt-1 flex items-center gap-1">
                        <span className="text-xs font-medium">{game.averageRating?.toFixed(1) || 'New'}</span>
                        {game.averageRating !== undefined && <Star className="h-3 w-3 fill-current" />}
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <p className="text-xs text-muted-foreground line-clamp-2">{game.description}</p>
        </CardContent>
        <div className="p-4 pt-0">
           <Button onClick={handleInstallClick} disabled={!game.downloadUrl} className="w-full">
                <Download className="mr-2 h-4 w-4"/>
                Install
            </Button>
        </div>
      </Card>
    </Link>
  );
}
