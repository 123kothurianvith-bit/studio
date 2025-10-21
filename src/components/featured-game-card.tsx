
'use client';

import type { Game } from '@/lib/types';
import { Button } from './ui/button';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from './ui/card';
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
      <div className={cn("relative flex aspect-[16/9] w-full flex-col justify-between bg-gradient-to-br p-4", cardGradient)}>
        <div className="flex-1">
           <h3 className="text-xl font-bold text-white drop-shadow-md">
                {game.featuredDescription}
            </h3>
        </div>
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1 overflow-hidden">
                <h4 className="truncate font-semibold text-white">{game.title}</h4>
                <p className="truncate text-sm text-white/80">{game.developerName}</p>
                <div className="mt-1 flex items-center gap-1 text-sm text-white/80">
                    <span>{game.averageRating?.toFixed(1) ?? 'New'}</span>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
            </div>
            <Button onClick={handleInstallClick} size="sm" className="shrink-0 rounded-full bg-white text-black hover:bg-white/90" disabled={!game.downloadUrl}>
                Install
            </Button>
        </div>
      </div>
    </Card>
  );
}
