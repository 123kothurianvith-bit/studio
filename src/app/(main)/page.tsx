'use client';

import React, { Suspense, useMemo } from 'react';
import GameBrowser from '@/components/game-browser';
import { Skeleton } from '@/components/ui/skeleton';
import GameSearch from '@/components/game-search';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Game } from '@/lib/types';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import FeaturedGameCard from '@/components/featured-game-card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';


function GameBrowserLoader() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface PublishedGame {
  id: string;
  gameName: string;
  iconUrl: string;
  downloadUrl: string;
  description: string;
  averageRating: number;
  publisherId: string;
  developerName: string;
  featuredImageUrl?: string;
  [key: string]: any;
}


function HomePageComponent() {
    const firestore = useFirestore();

    const publishedGamesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'publishedGames');
    }, [firestore]);

    const { data: publishedGames } = useCollection<PublishedGame>(publishedGamesQuery);

    const { featuredGames, regularGames } = useMemo(() => {
        if (!publishedGames) {
            return { featuredGames: [], regularGames: [] };
        }

        const allGames: Game[] = publishedGames.map(pg => ({
            id: pg.id,
            title: pg.gameName,
            platform: 'Android', 
            price: 0, 
            genre: 'User Published', 
            description: pg.description || 'A user published game.',
            coverImage: pg.iconUrl,
            imageHint: 'user game',
            downloadUrl: pg.downloadUrl,
            averageRating: pg.averageRating,
            publisherId: pg.publisherId,
            developerName: pg.developerName,
            featuredImageUrl: pg.featuredImageUrl,
        }));
        
        const featured = allGames.filter(g => g.featuredImageUrl);
        const regular = allGames.filter(g => !g.featuredImageUrl);

        return { featuredGames: featured, regularGames: regular };
    }, [publishedGames]);

  return (
    <div className="space-y-8">
      <GameSearch />

      {featuredGames.length > 0 && (
          <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Featured Games</h2>
              <Carousel opts={{ loop: true }} className="w-full">
                  <CarouselContent>
                      {featuredGames.map(game => (
                          <CarouselItem key={game.id}>
                              <FeaturedGameCard game={game} />
                          </CarouselItem>
                      ))}
                  </CarouselContent>
              </Carousel>
          </div>
      )}

      <Suspense fallback={<GameBrowserLoader />}>
        <GameBrowser allGames={regularGames} />
      </Suspense>
    </div>
  );
}


export default function HomePage() {
  return (
    <FirebaseClientProvider>
      <HomePageComponent />
    </FirebaseClientProvider>
  )
}
