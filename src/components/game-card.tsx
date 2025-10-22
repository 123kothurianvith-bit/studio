
'use client';

import type { Game } from '@/lib/types';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';

type GameCardProps = {
  game: Game;
  variant?: 'default' | 'compact';
};

export default function GameCard({ game, variant = 'default' }: GameCardProps) {
  const router = useRouter();
  const firestore = useFirestore();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    e.preventDefault();
    router.push(`/game/${game.id}`);
  };

  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (game?.downloadUrl && firestore) {
      window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
      const gameDocRef = doc(firestore, 'publishedGames', game.id);
      updateDoc(gameDocRef, {
        downloads: (game.downloads || 0) + 1
      });
    }
  };

  if (variant === 'compact') {
      return (
        <Card onClick={handleCardClick} className="group w-full cursor-pointer overflow-hidden rounded-lg">
          <div className="aspect-[3/4] w-full bg-muted">
            {/* Placeholder for game image */}
          </div>
          <div className="p-2">
            <h3 className="truncate text-sm font-medium text-foreground">{game.title}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <span>{game.averageRating?.toFixed(1) ?? 'New'}</span>
              {game.averageRating ? <Star className="h-3 w-3 fill-primary text-primary" /> : null}
            </div>
          </div>
        </Card>
      );
  }

  return (
    <div onClick={handleCardClick} className="group flex w-full cursor-pointer items-center gap-4 transition-colors hover:bg-accent/50 rounded-lg p-2">
        <div className="flex-1">
          <h3 className="truncate font-medium text-foreground">{game.title}</h3>
            {game.developerName && game.publisherId ? (
                <Link
                href={`/developer/${game.publisherId}`}
                className="text-sm text-primary hover:underline w-fit"
                onClick={(e) => e.stopPropagation()}
                >
                {game.developerName}
                </Link>
            ) : (
                <p className="text-sm text-muted-foreground">{game.genre}</p>
            )}
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <span>{game.averageRating?.toFixed(1) ?? 'New'}</span>
            {game.averageRating ? <Star className="h-4 w-4 fill-primary text-primary" /> : null}
          </div>
        </div>
        <Button onClick={handleInstallClick} size="sm" disabled={!game.downloadUrl} className="rounded-full">
            Install
        </Button>
    </div>
  );
}
