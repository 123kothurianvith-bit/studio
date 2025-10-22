
'use client';

import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import GameCard from '@/components/game-card';
import { Skeleton } from '@/components/ui/skeleton';
import GameSearch from '@/components/game-search';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Game } from '@/lib/types';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import FeaturedGameCard from '@/components/featured-game-card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Frown, Gamepad, Bot } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Autoplay from "embla-carousel-autoplay";
import { recommendGames } from '@/ai/flows/recommend-games';


function GameBrowserLoader() {
  return (
    <div className="flex flex-col gap-4 px-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
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
  genre: Game['genre'];
  [key: string]: any;
}


function HomePageComponent() {
    const firestore = useFirestore();
    const { user } = useUser();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q');
    const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }))

    const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);
    const [isRecommending, setIsRecommending] = useState(false);

    const publishedGamesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'publishedGames');
    }, [firestore]);

    const { data: publishedGames, isLoading } = useCollection<PublishedGame>(publishedGamesQuery);

    const allGames: Game[] = useMemo(() => {
        if (!publishedGames) return [];
        return publishedGames.map(pg => ({
            id: pg.id,
            title: pg.gameName,
            platform: 'Android', 
            price: 0, 
            genre: pg.genre || 'User Published', 
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
    }, [publishedGames]);

    const filteredGames = useMemo(() => {
        if (!searchQuery) {
            return allGames;
        }
        return allGames.filter(game =>
            game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            game.developerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            game.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allGames, searchQuery]);

    const { featuredGames, popularGames } = useMemo(() => {
        if (!publishedGames) {
            return { featuredGames: [], popularGames: [] };
        }
        
        const featured = allGames.filter(g => g.isFeatured && g.featuredDescription);
        const popular = [...allGames].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5);

        return { featuredGames: featured, popularGames: popular };
    }, [allGames, publishedGames]);

     useEffect(() => {
        if (user && user.profile && allGames.length > 0 && !searchQuery) {
            const getRecommendations = async () => {
                setIsRecommending(true);
                try {
                    const wishlistedGames = allGames.filter(g => user.profile.wishlistIds?.includes(g.id));
                    const followedDeveloperNames = user.profile.followingDeveloperIds || []; // Assuming this will be populated
                    
                    // For now, let's find the names from the games list
                    const developerNames = allGames.filter(g => followedDeveloperNames.includes(g.publisherId || ''))
                                                    .map(g => g.developerName)
                                                    .filter((value, index, self) => self.indexOf(value) === index);


                    const result = await recommendGames({
                        allGames: allGames.map(g => ({ id: g.id, gameName: g.title, description: g.description, genre: g.genre, developerName: g.developerName || '' })),
                        wishlistedGames: wishlistedGames.map(g => ({ id: g.id, gameName: g.title, description: g.description, genre: g.genre, developerName: g.developerName || '' })),
                        followedDevelopers: developerNames,
                        count: 10,
                    });

                    if (result.recommendedGameIds) {
                        const recommended = allGames.filter(g => result.recommendedGameIds.includes(g.id));
                        setRecommendedGames(recommended);
                    }
                } catch (error) {
                    console.error("Failed to get recommendations:", error);
                } finally {
                    setIsRecommending(false);
                }
            };

            getRecommendations();
        } else {
            setRecommendedGames([]);
        }
    }, [user, allGames, searchQuery]);

  return (
    <div className="space-y-8 pb-8">
      {!searchQuery && featuredGames.length > 0 && (
          <div className="space-y-4">
              <h2 className="px-4 text-2xl font-bold tracking-tight">Featured</h2>
              <Carousel 
                  opts={{ loop: true }}
                  plugins={[plugin.current]}
                  onMouseEnter={plugin.current.stop}
                  onMouseLeave={plugin.current.reset}
                  className="w-full"
              >
                  <CarouselContent className="-ml-2">
                      {featuredGames.map((game, index) => (
                          <CarouselItem key={game.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                              <FeaturedGameCard game={game} index={index} />
                          </CarouselItem>
                      ))}
                  </CarouselContent>
              </Carousel>
          </div>
      )}
      
      <div className="space-y-4">
        <h2 className="px-4 text-2xl font-bold tracking-tight">{searchQuery ? `Results for "${searchQuery}"` : "All Games"}</h2>
        {isLoading ? (
            <GameBrowserLoader />
        ) : filteredGames.length > 0 ? (
           <div className="flex flex-col gap-4 px-4">
            {filteredGames.map((game) => <GameCard key={game.id} game={game} />)}
           </div>
        ) : !isLoading && filteredGames.length === 0 ? (
            <div className="flex h-[40vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Frown className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No Games Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria, or publish a new game!
            </p>
        </div>
        ) : null}
      </div>

      {!searchQuery && recommendedGames.length > 0 && (
        <div className="space-y-4">
            <h2 className="px-4 text-2xl font-bold tracking-tight flex items-center gap-2"><Bot className="w-6 h-6" /> For You</h2>
             <Carousel opts={{align: "start"}} className="w-full">
                <CarouselContent className="-ml-2">
                    {recommendedGames.map((game, index) => (
                        <CarouselItem key={`${game.id}-${index}`} className="pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5">
                           <GameCard game={game} variant="compact" />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
      )}

      {!searchQuery && popularGames.length > 0 && (
        <div className="space-y-4">
            <h2 className="px-4 text-2xl font-bold tracking-tight">What's buzzing</h2>
            <Carousel opts={{align: "start"}} className="w-full">
                <CarouselContent className="-ml-2">
                    {popularGames.map((game, index) => (
                        <CarouselItem key={`${game.id}-${index}`} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                           <GameCard key={game.id} game={game} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
      )}

    </div>
  );
}


export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FirebaseClientProvider>
        <div className="flex-1 overflow-y-auto">
          <HomePageComponent />
        </div>
      </FirebaseClientProvider>
    </Suspense>
  )
}
