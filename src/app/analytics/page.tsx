'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase, FirebaseClientProvider } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart2, Gamepad, Loader2, Frown, Users, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

interface PublishedGame {
  id: string;
  gameName: string;
  downloads: number;
  averageRating: number;
}

function AnalyticsComponent() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
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

  const totalDownloads = useMemo(() => games?.reduce((acc, game) => acc + game.downloads, 0) || 0, [games]);
  const averageRatingOverall = useMemo(() => {
    if (!games || games.length === 0) return 0;
    const totalRating = games.reduce((acc, game) => acc + game.averageRating, 0);
    return totalRating / games.length;
  }, [games]);

  const comparisonData = useMemo(() => {
    if (!games || !selectedGameId) return [];
    const selectedGame = games.find(g => g.id === selectedGameId);
    if (!selectedGame) return [];

    return games.map(game => ({
        name: game.gameName,
        'Downloads': game.downloads,
        'Rating': game.averageRating,
        'Selected Game Downloads': game.id === selectedGameId ? game.downloads : selectedGame.downloads,
        'Selected Game Rating': game.id === selectedGameId ? game.averageRating : selectedGame.averageRating,
    }));
  }, [games, selectedGameId]);

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
           You must be a developer to view analytics.
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
        <h3 className="text-xl font-semibold text-foreground">No Analytics Data</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Publish a game to start seeing analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        <BarChart2 className="h-8 w-8"/>
        Game Analytics
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              <Gamepad className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{games.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDownloads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRatingOverall.toFixed(2)} ★</div>
            </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Game Performance Comparison</CardTitle>
          <CardDescription>Select a game to compare its downloads and rating against all your other games.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Select onValueChange={setSelectedGameId} defaultValue={selectedGameId || undefined}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a game to compare..." />
              </SelectTrigger>
              <SelectContent>
                {games.map(game => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.gameName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedGameId && (
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{fontSize: 12}}/>
                        <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" domain={[0, 5]}/>
                        <Tooltip
                            contentStyle={{
                                background: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="Downloads" fill="hsl(var(--primary))" />
                        <Bar yAxisId="right" dataKey="Rating" fill="hsl(var(--accent))" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function AnalyticsPage() {
    return (
        <FirebaseClientProvider>
            <AnalyticsComponent />
        </FirebaseClientProvider>
    )
}
