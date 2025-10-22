
'use client';

import { useMemo, useEffect, useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase, FirebaseClientProvider } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad, Loader2, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { generateAppIcon } from '@/ai/flows/generate-app-icon';

interface PublishedGame {
  id: string;
  gameName: string;
  iconUrl?: string;
  downloads: number;
  averageRating: number;
  genre: 'Action' | 'RPG' | 'Strategy' | 'Adventure' | 'Sports';
}

function MyAppsComponent() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user?.profile?.role !== 'developer') {
        router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const publishedGamesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'publishedGames'), where('publisherId', '==', user.uid));
  }, [firestore, user]);

  const { data: games, isLoading } = useCollection<PublishedGame>(publishedGamesQuery);

  useEffect(() => {
    if (games && firestore) {
      games.forEach(async (game) => {
        if (!game.iconUrl) {
          console.log(`Generating icon for ${game.gameName}...`);
          try {
            const iconResult = await generateAppIcon({ name: game.gameName, genre: game.genre });
            if (iconResult.iconUrl) {
              const gameDocRef = doc(firestore, 'publishedGames', game.id);
              await updateDoc(gameDocRef, { iconUrl: iconResult.iconUrl });
              console.log(`Icon generated and saved for ${game.gameName}.`);
            }
          } catch (error) {
            console.error(`Failed to generate icon for ${game.gameName}:`, error);
          }
        }
      });
    }
  }, [games, firestore]);

  if (isLoading || isUserLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user?.profile?.role !== 'developer') {
     return (
       <div className="flex h-[80vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
         <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
           <Frown className="h-8 w-8 text-primary" />
         </div>
         <h3 className="text-xl font-semibold text-foreground">Access Denied</h3>
         <p className="mt-2 text-sm text-muted-foreground">
           You must be a developer to view your apps.
         </p>
       </div>
     );
  }

  if (!games || games.length === 0) {
      return (
          <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Frown className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">No Published Games Yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                  Publish your first game to see it here.
              </p>
              <Button asChild className="mt-4">
                  <Link href="/publish">Publish a Game</Link>
              </Button>
          </div>
      )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <Gamepad className="h-8 w-8"/>
            My Published Apps
        </h1>
        <Button asChild>
          <Link href="/publish">Publish New Game</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game) => (
          <Link href={`/game/${game.id}`} key={game.id}>
            <Card className="group overflow-hidden rounded-xl border-0 shadow-lg transition-all hover:scale-105">
              <CardContent className="p-4 flex flex-col justify-between aspect-square">
                  <div className='relative flex-1 flex items-center justify-center bg-muted rounded-lg overflow-hidden'>
                    {game.iconUrl ? (
                      <Image src={game.iconUrl} alt={`${game.gameName} icon`} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className='mt-2'>
                    <CardTitle className="truncate text-lg">{game.gameName}</CardTitle>
                    <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                      <span>{game.downloads.toLocaleString()} dl</span>
                      <span>{game.averageRating.toFixed(1)} ★</span>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function MyAppsPage() {
    return (
        <FirebaseClientProvider>
            <MyAppsComponent />
        </FirebaseClientProvider>
    )
}
