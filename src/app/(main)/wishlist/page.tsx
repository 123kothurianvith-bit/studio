"use client";

import { useWishlist } from '@/contexts/wishlist-context';
import GameCard from '@/components/game-card';
import { Heart } from 'lucide-react';
import type { Game } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';

// NOTE: This is a placeholder implementation.
// The wishlist context currently only stores game IDs.
// To fully implement this, you'd need to fetch game details for each ID.
// For now, we show nothing until this is properly implemented with Firestore.

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const firestore = useFirestore();

  const gamesQuery = useMemoFirebase(() => {
    if (!firestore || wishlist.length === 0) return null;
    // This query fetches all games that are in the user's wishlist
    return query(collection(firestore, 'publishedGames'), where('id', 'in', wishlist));
  }, [firestore, wishlist]);

  const { data: wishlistedGamesData } = useCollection(gamesQuery);

  const wishlistedGames: Game[] = useMemo(() => {
     if (!wishlistedGamesData) return [];
     return wishlistedGamesData.map(game => ({
        id: game.id,
        title: game.gameName,
        platform: 'Android',
        price: 0,
        genre: 'User Published',
        description: game.description || 'A user published game.',
        coverImage: game.iconUrl,
        imageHint: 'user game',
        downloadUrl: game.downloadUrl,
        averageRating: game.averageRating,
        publisherId: game.publisherId,
        developerName: game.developerName,
        featuredImageUrl: game.featuredImageUrl,
    }));
  }, [wishlistedGamesData]);


  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Your Wishlist</h1>
      {wishlistedGames.length > 0 ? (
        <div className="flex flex-col gap-4">
          {wishlistedGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
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
