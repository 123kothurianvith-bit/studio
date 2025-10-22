
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
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type GameCardProps = {
  game: Game;
  variant?: 'default' | 'compact';
  index?: number;
};

const gradients = [
    'from-pink-500 to-purple-600',
    'from-emerald-400 to-cyan-600',
    'from-amber-400 to-orange-600',
    'from-rose-400 to-fuchsia-600',
    'from-indigo-500 to-sky-600',
    'from-red-500 to-yellow-500',
    'from-green-400 to-blue-500',
];

const getGradientForCard = (index: number) => {
    return gradients[index % gradients.length];
};

export default function GameCard({ game, variant = 'default', index = 0 }: GameCardProps) {
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
  
  const placeholderImage = PlaceHolderImages.find(p => p.imageHint.includes(game.imageHint))?.imageUrl || 'https://picsum.photos/seed/1/600/400';
  const cardGradient = getGradientForCard(index);

  if (variant === 'compact') {
      return (
        <Card onClick={handleCardClick} className="group w-full cursor-pointer overflow-hidden rounded-lg">
           <div className="aspect-[3/4] w-full bg-muted relative">
            <Image
              src={placeholderImage}
              alt={`Cover art for ${game.title}`}
              fill
              className="object-cover"
              data-ai-hint={game.imageHint}
              />
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
    <div 
      onClick={handleCardClick} 
      className={cn(
        "group w-full cursor-pointer overflow-hidden rounded-2xl border-0 shadow-lg transition-all bg-gradient-to-br p-4 flex items-center gap-4",
         cardGradient
      )}
    >
      <div className="flex-1 overflow-hidden">
        <h3 className="truncate font-semibold text-white text-lg drop-shadow-md">{game.title}</h3>
        {game.developerName && game.publisherId ? (
            <Link
            href={`/developer/${game.publisherId}`}
            className="text-sm text-white/90 hover:underline w-fit"
            onClick={(e) => e.stopPropagation()}
            >
            {game.developerName}
            </Link>
        ) : (
            <p className="text-sm text-white/80">{game.genre}</p>
        )}
        <div className="mt-1 flex items-center gap-1 text-sm text-white/80">
            <span>{game.averageRating?.toFixed(1) ?? 'New'}</span>
            {game.averageRating ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : null}
        </div>
      </div>
      <Button 
        onClick={handleInstallClick} 
        size="sm" 
        disabled={!game.downloadUrl} 
        className="shrink-0 rounded-full bg-slate-100 text-slate-900 hover:bg-slate-200"
      >
        Install
      </Button>
    </div>
  );
}
