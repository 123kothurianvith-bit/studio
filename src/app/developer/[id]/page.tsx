
'use client';

import { useParams } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase, FirebaseClientProvider } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { Loader2, Frown, User } from 'lucide-react';
import GameCard from '@/components/game-card';
import type { Game } from '@/lib/types';
import { useMemo } from 'react';


interface DeveloperProfile {
  id: string;
  developerName: string;
  gameCount: number;
}

interface PublishedGame {
  id: string;
  gameName: string;
  downloadUrl: string;
  description: string;
  averageRating: number;
  publisherId: string;
  developerName: string;
  [key: string]: any;
}

function DeveloperProfilePageComponent() {
  const params = useParams();
  const developerId = params.id as string;
  const firestore = useFirestore();

  const developerDocRef = useMemoFirebase(() => {
    if (!firestore || !developerId) return null;
    return doc(firestore, 'developers', developerId);
  }, [firestore, developerId]);

  const publishedGamesQuery = useMemoFirebase(() => {
    if (!firestore || !developerId) return null;
    return query(collection(firestore, 'publishedGames'), where('publisherId', '==', developerId));
  }, [firestore, developerId]);

  const { data: developer, isLoading: isLoadingDeveloper } = useDoc<DeveloperProfile>(developerDocRef);
  const { data: publishedGames, isLoading: isLoadingGames } = useCollection<PublishedGame>(publishedGamesQuery);

  const allGames = useMemo(() => {
    if (!publishedGames) return [];
    const transformedGames: Game[] = publishedGames.map(pg => ({
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
    }));
    return transformedGames;
  }, [publishedGames]);
  
  if (isLoadingDeveloper || isLoadingGames) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-center">
         <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Frown className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Developer Not Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                This developer profile could not be found.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground sm:h-20 sm:w-20">
                <User className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {developer.developerName}
                </h1>
                 <p className="text-muted-foreground">{developer.gameCount} apps</p>
            </div>
        </div>

        <div>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">All apps from this developer</h2>
            {allGames.length > 0 ? (
                 <div className="flex flex-col gap-4">
                    {allGames.map((game) => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">This developer has not published any games yet.</p>
            )}
        </div>
    </div>
  );
}


export default function DeveloperProfilePage() {
    return (
        <FirebaseClientProvider>
            <DeveloperProfilePageComponent />
        </FirebaseClientProvider>
    )
}

    