'use client';

import Image from 'next/image';
import type { Game } from '@/lib/types';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

type FeaturedGameCardProps = {
  game: Game;
};

export default function FeaturedGameCard({ game }: FeaturedGameCardProps) {
  const firestore = useFirestore();
  const router = useRouter();

  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (game?.downloadUrl && firestore) {
      window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
      const gameDocRef = doc(firestore, 'publishedGames', game.id);
      updateDoc(gameDocRef, {
        downloads: (game.downloads || 0) + 1,
      });
    }
  };

  const handleCardClick = () => {
    router.push(`/game/${game.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-xl"
    >
      {game.featuredImageUrl && (
        <Image
          src={game.featuredImageUrl}
          alt={game.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-xl font-bold">{game.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-300">
          {game.description}
        </p>
        <Button
          onClick={handleInstallClick}
          variant="secondary"
          size="sm"
          className="mt-4"
          disabled={!game.downloadUrl}
        >
          <Download className="mr-2 h-4 w-4" />
          Install
        </Button>
      </div>
    </div>
  );
}
