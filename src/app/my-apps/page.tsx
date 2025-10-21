'use client';

import { useMemo } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad, Loader2, Frown } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PublishedGame {
  id: string;
  gameName: string;
  iconUrl: string;
  downloads: number;
  averageRating: number;
}

export default function MyAppsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const publishedGamesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'publishedGames'), where('publisherId', '==', user.uid));
  }, [firestore, user]);

  const { data: games, isLoading } = useCollection<PublishedGame>(publishedGamesQuery);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!games || games.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center h-[50vh]">
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
          <Card key={game.id} className="overflow-hidden">
            <CardHeader className="p-0">
                <div className="relative aspect-square w-full">
                    <Image src={game.iconUrl} alt={game.gameName} fill className="object-cover" />
                </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="truncate text-xl">{game.gameName}</CardTitle>
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>Downloads: {game.downloads}</span>
                <span>Rating: {game.averageRating.toFixed(1)} ★</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
