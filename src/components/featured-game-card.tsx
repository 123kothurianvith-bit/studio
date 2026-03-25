'use client';

import type { Game } from '@/lib/types';
import { Button } from './ui/button';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card } from './ui/card';
import { Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/contexts/wishlist-context';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


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

type FeaturedGameCardProps = {
  game: Game;
  index: number;
};

export default function FeaturedGameCard({ game, index }: FeaturedGameCardProps) {
  const firestore = useFirestore();
  const router = useRouter();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const wishlisted = isWishlisted(game.id);

  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (game?.downloadUrl && firestore) {
      window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
      const gameDocRef = doc(firestore, 'publishedGames', game.id);
      const updateData = {
        downloads: (game.downloads || 0) + 1,
      };
      updateDoc(gameDocRef, updateData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: gameDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  const handleCardClick = () => {
    router.push(`/game/${game.id}`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlisted) {
        removeFromWishlist(game.id);
    } else {
        addToWishlist(game.id);
    }
  }
  
  const cardGradient = getGradientForCard(index);

  return (
    <Card
      onClick={handleCardClick}
      className={cn("group w-full cursor-pointer overflow-hidden rounded-2xl border-0 shadow-lg transition-all bg-gradient-to-br", cardGradient)}
    >
      <div className="relative flex aspect-[16/9] w-full flex-col justify-between p-4">
        <div className="flex justify-between">
           <h3 className="text-xl font-bold text-white drop-shadow-md flex-1">
                {game.featuredDescription}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full text-white/80 hover:bg-white/20 hover:text-white"
              onClick={handleWishlistToggle}
            >
              <Heart className={cn("h-5 w-5", wishlisted && "fill-red-500 text-red-500")} />
            </Button>
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
            <Button onClick={handleInstallClick} size="sm" className="shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={!game.downloadUrl}>
                Install
            </Button>
        </div>
      </div>
    </Card>
  );
}
