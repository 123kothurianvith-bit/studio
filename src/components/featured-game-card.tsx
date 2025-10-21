
'use client';

import type { Game } from '@/lib/types';
import { Button } from './ui/button';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';


const gradients = [
    'from-pink-500 to-purple-600',
    'from-emerald-400 to-cyan-600',
    'from-amber-400 to-orange-600',
    'from-rose-400 to-fuchsia-600',
    'from-indigo-500 to-sky-600',
    'from-red-500 to-yellow-500',
    'from-green-400 to-blue-500',
];

const getGradientForCard = (title: string) => {
    const charCodeSum = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[charCodeSum % gradients.length];
};

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
  
  const cardGradient = getGradientForCard(game.title);

  return (
    <Card
      onClick={handleCardClick}
      className="group w-full cursor-pointer overflow-hidden rounded-2xl border-0 shadow-lg transition-all"
    >
      <div className={cn("relative aspect-[16/9] w-full bg-gradient-to-br", cardGradient)}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
           <h3 className="text-center text-xl font-bold text-white drop-shadow-md">
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
                    width={64}
                    height={64}
                    className="object-cover"
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
