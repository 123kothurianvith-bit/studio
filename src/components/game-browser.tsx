"use client";

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type { Game } from '@/lib/types';
import GameCard from './game-card';
import { Frown } from 'lucide-react';

type GameBrowserProps = {
  allGames: Game[];
};

export default function GameBrowser({ allGames }: GameBrowserProps) {
  const searchParams = useSearchParams();

  const filteredGames = useMemo(() => {
    const searchTerm = searchParams.get('q')?.toLowerCase() || '';
    const genre = searchParams.get('genre');

    return allGames.filter((game) => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm);
      const matchesGenre = !genre || game.genre === genre;
      
      return matchesSearch && matchesGenre;
    });
  }, [searchParams, allGames]);

  if (filteredGames.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Frown className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">No Games Found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {filteredGames.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
