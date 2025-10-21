import React, { Suspense } from 'react';
import GameBrowser from '@/components/game-browser';
import { games } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import GameSearch from '@/components/game-search';

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


export default function HomePage() {
  return (
    <div className="space-y-6">
      <GameSearch />
      <Suspense fallback={<GameBrowserLoader />}>
        <GameBrowser allGames={games} />
      </Suspense>
    </div>
  );
}
