
'use client';

import type { Game } from '@/lib/types';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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
      className="group w-full cursor-pointer overflow-hidden transition-all hover:bg-accent"
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-foreground">{game.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {game.featuredDescription}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
