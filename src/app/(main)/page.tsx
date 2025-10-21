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

function GameBrowserLoader() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
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
  [key: string]: any;
}


function HomePageComponent() {
    const firestore = useFirestore();

    const publishedGamesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'publishedGames');
    }, [firestore]);

    const { data: publishedGames } = useCollection<PublishedGame>(publishedGamesQuery);

    const allGames = useMemo(() => {
        if (!publishedGames) {
            return [];
        }

        const transformedGames: Game[] = publishedGames.map(pg => ({
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
        }));

        return transformedGames;
    }, [publishedGames]);

  return (
    <div className="space-y-6">
      <GameSearch />
      <Suspense fallback={<GameBrowserLoader />}>
        <GameBrowser allGames={allGames} />
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
