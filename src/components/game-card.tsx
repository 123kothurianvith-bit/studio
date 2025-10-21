'use client';

import Image from 'next/image';
import type { Game } from '@/lib/types';
import Link from 'next/link';
import { Star, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

type GameCardProps = {
  game: Game;
};

export default function GameCard({ game }: GameCardProps) {
  const firestore = useFirestore();
  const router = useRouter();

  const handleInstallClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (game?.downloadUrl) {
      window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
      if (firestore && game.id && game.publisherId) { // Ensure game.id is valid
         const gameDocRef = doc(firestore, 'publishedGames', game.id);
         updateDoc(gameDocRef, {
            downloads: (game.downloads || 0) + 1
        });
      }
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // a small hack to check if the click target or its parent is the developer link
    let target = e.target as HTMLElement;
    while(target && target !== e.currentTarget) {
        if(target.hasAttribute('data-developer-link')) {
            return; // Exit if the click was on the developer link
        }
        target = target.parentElement as HTMLElement;
    }
    router.push(`/game/${game.id}`);
  };

  const handleDeveloperClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click handler from firing
    router.push(`/developer/${game.publisherId}`);
  };


  return (
    <div onClick={handleCardClick} className="group flex cursor-pointer items-center justify-between gap-4 rounded-lg p-2 transition-colors hover:bg-accent">
      <div className="flex flex-1 items-center gap-4">
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
          {game.developerName && game.publisherId ? (
            <div 
              data-developer-link 
              onClick={handleDeveloperClick} 
              className="text-sm text-primary hover:underline w-fit"
            >
              {game.developerName}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{game.genre}</p>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{game.averageRating?.toFixed(1) ?? 'N/A'}</span>
            <Star className="h-3 w-3 fill-current" />
          </div>
        </div>
      </div>
      {game.downloadUrl && (
        <Button variant="outline" size="sm" onClick={handleInstallClick}>
            <Download className="mr-2 h-4 w-4" />
            Install
        </Button>
      )}
    </div>
  );
}
