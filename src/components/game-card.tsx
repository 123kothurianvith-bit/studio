'use client';

import Image from 'next/image';
import type { Game } from '@/lib/types';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

type GameCardProps = {
  game: Game;
};

export default function GameCard({ game }: GameCardProps) {
  const router = useRouter();
  const firestore = useFirestore();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent nested link issues
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    e.preventDefault();
    router.push(`/game/${game.id}`);
  };

  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    if (game?.downloadUrl && firestore) {
      window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
      const gameDocRef = doc(firestore, 'publishedGames', game.id);
      updateDoc(gameDocRef, {
        downloads: (game.downloads || 0) + 1
      });
    }
  };

  return (
    <div onClick={handleCardClick} className="group flex w-full cursor-pointer items-center gap-4 transition-colors hover:bg-accent/50 rounded-lg p-2">
        <div className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
          <Image
            src={game.coverImage}
            alt={game.title}
            width={64}
            height={64}
            className="object-cover"
            data-ai-hint={game.imageHint}
          />
        </div>
        <div className="flex-1">
          <h3 className="truncate font-medium text-foreground">{game.title}</h3>
            {game.developerName && game.publisherId ? (
                <Link
                href={`/developer/${game.publisherId}`}
                className="text-sm text-primary hover:underline w-fit"
                onClick={(e) => e.stopPropagation()} // Stop propagation to prevent card click
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
        <Button onClick={handleInstallClick} size="sm" disabled={!game.downloadUrl} variant="outline" className="rounded-full">
            Install
        </Button>
    </div>
  );
}
