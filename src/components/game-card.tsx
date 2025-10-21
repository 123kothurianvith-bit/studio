'use client';

import Image from 'next/image';
import type { Game } from '@/lib/types';
import Link from 'next/link';
import { Star, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

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
      if (firestore && game.id && game.publisherId) {
         const gameDocRef = doc(firestore, 'publishedGames', game.id);
         updateDoc(gameDocRef, {
            downloads: (game.downloads || 0) + 1
        });
      }
    }
  };

  const handleCardClick = () => {
    router.push(`/game/${game.id}`);
  };

  return (
    <Card onClick={handleCardClick} className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
            data-ai-hint={game.imageHint}
          />
        </div>
        <div className="p-4">
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
            {game.averageRating ? <Star className="h-4 w-4 fill-current text-primary" /> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
