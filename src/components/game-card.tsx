"use client";

import Image from 'next/image';
import type { Game } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Heart, Download } from 'lucide-react';
import { useWishlist } from '@/contexts/wishlist-context';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import Link from 'next/link';

type GameCardProps = {
  game: Game;
};

export default function GameCard({ game }: GameCardProps) {
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isWishlisted(game.id)) {
      removeFromWishlist(game.id);
    } else {
      addToWishlist(game.id);
    }
  };

  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (game.downloadUrl) {
      window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <Link href={`/game/${game.id}`} className="h-full">
      <Card className="flex h-full transform flex-col overflow-hidden bg-card transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
        <div className="relative h-80 w-full">
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={game.imageHint}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-10 w-10 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted(game.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={cn("h-5 w-5", isWishlisted(game.id) ? 'fill-accent text-accent' : 'text-white')} />
          </Button>
        </div>
        <CardHeader>
          <CardTitle className="truncate text-xl">{game.title}</CardTitle>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
              <Badge variant="secondary" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>{game.platform}</span>
              </Badge>
              <Badge variant="outline">{game.genre}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">{game.description}</p>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center justify-end">
            <Button onClick={handleInstallClick} disabled={!game.downloadUrl}>Install</Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
