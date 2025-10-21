
'use client';

import type { Game } from '@/lib/types';
import { Button } from './ui/button';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import { Star } from 'lucide-react';

type FeaturedGameCardProps = {
  game: Game;
};

export default function FeaturedGameCard({ game }: FeaturedGameCardProps) {
  const firestore = useFirestore();
  const router = useRouter();

  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (game?.downloadUrl && firestore) {
      window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
      const gameDocRef = doc(firestore, 'publishedGames', game.id);
      updateDoc(gameDocRef, {
        downloads: (game.downloads || 0) + 1,
      });
    }
  };

  const handleCardClick = () => {
    router.push(`/game/${game.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className="group w-full cursor-pointer overflow-hidden rounded-2xl border-0 shadow-lg transition-all"
    >
      <div className="relative aspect-[16/9] w-full">
        {game.featuredImageUrl ? (
            <Image
                src={game.featuredImageUrl}
                alt={`${game.title} background`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        ) : (
            <div className="h-full w-full bg-muted"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/0 to-background/0" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
           <h3 className="text-lg font-bold text-foreground drop-shadow-md">
                {game.featuredDescription}
            </h3>
        </div>
      </div>
      <CardContent className="flex items-center gap-4 p-4">
        {game.iconUrl && (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                 <Image
                    src={game.iconUrl}
                    alt={`${game.title} icon`}
                    fill
                    className="object-cover"
                    sizes="64px"
                />
            </div>
        )}
        <div className="flex-1 overflow-hidden">
          <h4 className="truncate font-semibold text-foreground">{game.title}</h4>
          <p className="truncate text-sm text-muted-foreground">{game.developerName}</p>
           <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <span>{game.averageRating?.toFixed(1) ?? 'New'}</span>
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
        </div>
        <Button onClick={handleInstallClick} size="sm" className="shrink-0 rounded-full" disabled={!game.downloadUrl}>
            Install
        </Button>
      </CardContent>
    </Card>
  );
}
