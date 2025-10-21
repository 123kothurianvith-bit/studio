"use client";

import { useWishlist } from '@/contexts/wishlist-context';
import { games } from '@/lib/data';
import GameCard from '@/components/game-card';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const wishlistedGames = games.filter(game => wishlist.includes(game.id));

  return (
    <div className="container mx-auto">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Your Wishlist</h1>
      {wishlistedGames.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistedGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Your wishlist is empty</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Add games to your wishlist to see them here.
            </p>
        </div>
      )}
    </div>
  );
}
