
'use client';

import React, { Suspense, useMemo } from 'react';
import GameCard from '@/components/game-card';
import { Skeleton } from '@/components/ui/skeleton';
import GameSearch from '@/components/game-search';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Game } from '@/lib/types';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import FeaturedGameCard from '@/components/featured-game-card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Frown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';


function GameBrowserLoader() {
  return (
    <div className="space-y-4 px-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}

interface PublishedGame {
  id: string;
  gameName: string;
  downloadUrl: string;
  description: string;
  averageRating: number;
  publisherId: string;
  developerName: string;
  isFeatured?: boolean;
  featuredDescription?: string;
  downloads?: number;
  [key: string]: any;
}


function HomePageComponent() {
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q');

    const publishedGamesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'publishedGames');
    }, [firestore]);

    const { data: publishedGames, isLoading } = useCollection<PublishedGame>(publishedGamesQuery);

    const { featuredGames, popularGames, regularGames } = useMemo(() => {
        if (!publishedGames) {
            return { featuredGames: [], popularGames: [], regularGames: [] };
        }

        let allGames: Game[] = publishedGames.map(pg => ({
            id: pg.id,
            title: pg.gameName,
            platform: 'Android', 
            price: 0, 
            genre: 'User Published', 
            description: pg.description || 'A user published game.',
            imageHint: 'user game',
            downloadUrl: pg.downloadUrl,
            averageRating: pg.averageRating,
            publisherId: pg.publisherId,
            developerName: pg.developerName,
            isFeatured: pg.isFeatured,
            featuredDescription: pg.featuredDescription,
            downloads: pg.downloads || 0,
        }));
        
        let filteredGames = allGames;
        if (searchQuery) {
            filteredGames = allGames.filter(game => game.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        
        const featured = allGames.filter(g => g.isFeatured && g.featuredDescription);

        const popular = [...allGames].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5);

        return { featuredGames: featured, popularGames: popular, regularGames: filteredGames };
    }, [publishedGames, searchQuery]);

  return (
    <div className="space-y-8 pb-8">
      <GameSearch />

      {featuredGames.length > 0 && !searchQuery && (
          <div className="space-y-4">
              <h2 className="px-4 text-2xl font-bold tracking-tight">Featured Games</h2>
              <Carousel opts={{ loop: true }} className="w-full">
                  <CarouselContent className="-ml-2">
                      {featuredGames.map(game => (
                          <CarouselItem key={game.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                              <FeaturedGameCard game={game} />
                          </CarouselItem>
                      ))}
                  </CarouselContent>
              </Carousel>
          </div>
      )}
      
      <div className="space-y-4">
        <h2 className="px-4 text-2xl font-bold tracking-tight">For you</h2>
        <div className="flex flex-col gap-4 px-4">
          {isLoading ? (
             <GameBrowserLoader />
          ) : regularGames.length > 0 ? (
            regularGames.map((game) => <GameCard key={game.id} game={game} />)
          ) : (
             <div className="flex h-[40vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Frown className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">No Games Found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria, or publish a new game!
                </p>
            </div>
          )}
        </div>
      </div>

      {popularGames.length > 0 && !searchQuery && (
        <div className="space-y-4">
            <h2 className="px-4 text-2xl font-bold tracking-tight">What's buzzing</h2>
            <div className="flex flex-col gap-4 px-4">
                {popularGames.map((game) => <GameCard key={game.id} game={game} />)}
            </div>
        </div>
      )}

    </div>
  );
}


export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FirebaseClientProvider>
        <HomePageComponent />
      </FirebaseClientProvider>
    </Suspense>
  )
}
