'use client';

import type { Game } from '@/lib/types';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useWishlist } from '@/contexts/wishlist-context';
import { useInView } from '@/hooks/use-in-view';
import { useRef } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const wishlisted = isWishlisted(game.id);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { margin: "-100px" });


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
      const updateData = {
          downloads: (game.downloads || 0) + 1
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

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlisted) {
        removeFromWishlist(game.id);
    } else {
        addToWishlist(game.id);
    }
  }
  
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
               <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
                onClick={handleWishlistToggle}
               >
                <Heart className={cn("h-4 w-4", wishlisted && "fill-red-500 text-red-500")} />
              </Button>
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
      ref={cardRef}
      onClick={handleCardClick} 
      className={cn(
        "group w-full cursor-pointer overflow-hidden rounded-2xl border-0 shadow-lg transition-all bg-gradient-to-br p-4 flex items-center gap-4",
         cardGradient,
         isInView && "animate-shake"
      )}
       style={{
         animationDelay: `${Math.random() * 0.3}s`,
       }}
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
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-full text-white/80 hover:bg-white/20 hover:text-white"
        onClick={handleWishlistToggle}
      >
        <Heart className={cn("h-5 w-5", wishlisted && "fill-red-500 text-red-500")} />
      </Button>
      <Button 
        onClick={handleInstallClick} 
        size="sm" 
        disabled={!game.downloadUrl} 
        className="shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Install
      </Button>
    </div>
  );
}
