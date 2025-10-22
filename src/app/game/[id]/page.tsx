
'use client';

import { useParams } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirestore, useUser, useMemoFirebase, FirebaseClientProvider } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Star, Download, Edit } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface PublishedGame {
  id: string;
  gameName: string;
  downloadUrl: string;
  description: string;
  publisherId: string;
  developerName: string;
  downloads: number;
  averageRating: number;
  ratings: { userId: string; rating: number }[];
  createdAt: any;
  whatsNew?: string;
  whatsNewSummary?: string;
}

function StarRating({ currentRating, onRate, disabled }: { currentRating: number, onRate: (rating: number) => void, disabled: boolean }) {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={disabled}
                    className="disabled:cursor-not-allowed"
                >
                    <Star
                        className={cn(
                            'h-6 w-6 transition-colors sm:h-8 sm:w-8',
                            (hoverRating || currentRating) >= star
                                ? 'text-primary fill-primary'
                                : 'text-muted-foreground/50'
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

function GameDetailPageComponent() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const gameDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'publishedGames', id);
  }, [firestore, id]);

  const { data: game, isLoading } = useDoc<PublishedGame>(gameDocRef);

  const userRating = game?.ratings.find(r => r.userId === user?.uid)?.rating || 0;
  
  const ratingDistribution = useMemo(() => {
    if (!game || !game.ratings.length) return [0,0,0,0,0];
    const dist = [0,0,0,0,0];
    game.ratings.forEach(r => {
        if(r.rating >= 1 && r.rating <= 5) {
            dist[r.rating - 1]++;
        }
    });
    return dist.reverse();
  }, [game]);

  const handleRateGame = async (rating: number) => {
    if (!user) {
        toast({ title: "Please log in to rate.", variant: 'destructive' });
        return;
    }
    if (!game || !gameDocRef) return;

    setIsSubmittingRating(true);

    const existingRating = game.ratings.find(r => r.userId === user.uid);

    let newRatings;
    if(existingRating) {
        newRatings = game.ratings.map(r => r.userId === user.uid ? { userId: user.uid, rating } : r)
    } else {
        newRatings = [...game.ratings, { userId: user.uid, rating }];
    }
    
    const totalRating = newRatings.reduce((acc, r) => acc + r.rating, 0);
    const newAverageRating = totalRating / newRatings.length;

    try {
        await updateDoc(gameDocRef, {
            ratings: newRatings,
            averageRating: newAverageRating,
        });

        toast({ title: "Rating submitted!", description: `You rated ${game.gameName} ${rating} stars.` });

    } catch (error: any) {
        console.error(error);
        toast({ title: "Error submitting rating", description: error.message, variant: 'destructive' });
    } finally {
        setIsSubmittingRating(false);
    }
  };

  const handleInstallClick = () => {
    if (game?.downloadUrl && gameDocRef) {
      window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
      updateDoc(gameDocRef, {
          downloads: (game.downloads || 0) + 1
      });
    }
  };
  
  const isPublisher = user && game && user.uid === game.publisherId;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-center">
        <p className="text-xl text-muted-foreground">Game not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-8 py-4 sm:py-8">
      <header className="flex flex-col gap-6 sm:flex-row">
        <div className="flex flex-col justify-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{game.gameName}</h1>
          <Link href={`/developer/${game.publisherId}`} className="text-lg text-primary hover:underline sm:text-xl">
            {game.developerName}
          </Link>
          <p className="text-sm text-muted-foreground">Contains ads</p>
        </div>
      </header>

      <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
        <Button onClick={handleInstallClick} className="w-full sm:w-auto" size="lg" disabled={!game.downloadUrl}>
          <Download className="mr-2 h-5 w-5" />
          Install
        </Button>
        {isPublisher && (
          <Button asChild variant="outline" className="w-full sm:w-auto" size="lg">
            <Link href={`/game/${id}/edit`}>
              <Edit className="mr-2 h-5 w-5" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      <Separator />

      {(game.whatsNew || game.whatsNewSummary) && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>What's New</CardTitle>
              {game.whatsNewSummary && <CardDescription>{game.whatsNewSummary}</CardDescription>}
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">{game.whatsNew}</p>
            </CardContent>
          </Card>
          <Separator />
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ratings and reviews</CardTitle>
          <CardDescription>Ratings and reviews are verified and are from people who use the same type of device that you use.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-6xl font-bold">{game.averageRating.toFixed(1)}</div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={cn('h-6 w-6', game.averageRating >= star ? 'text-primary fill-primary' : 'text-muted-foreground/30')} />
              ))}
            </div>
            <div className="text-muted-foreground">{game.ratings.length.toLocaleString()} reviews</div>
          </div>

          <div className="w-full space-y-2">
            {ratingDistribution.map((count, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 text-sm font-medium">{5 - i}</span>
                <Progress value={game.ratings.length > 0 ? (count / game.ratings.length) * 100 : 0} className="h-2 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate this game</CardTitle>
          <CardDescription>Tell others what you think</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <StarRating currentRating={userRating} onRate={handleRateGame} disabled={!user || isSubmittingRating} />
          <p className="text-sm text-muted-foreground">
            {user ? (isSubmittingRating ? "Submitting..." : (userRating > 0 ? "You rated this game" : "Share your experience")) : "Log in to rate"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About this game</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-muted-foreground">{game.description || 'No description available.'}</p>
        </CardContent>
      </Card>

    </div>
  );
}

export default function GameDetailPage() {
    return (
        <FirebaseClientProvider>
            <GameDetailPageComponent />
        </FirebaseClientProvider>
    );
}
