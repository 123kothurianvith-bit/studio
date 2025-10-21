'use client';

import { useParams } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirestore, useUser, useMemoFirebase, FirebaseClientProvider } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Star, Download } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface PublishedGame {
  id: string;
  gameName: string;
  iconUrl: string;
  downloadUrl: string;
  description: string;
  publisherId: string;
  downloads: number;
  averageRating: number;
  ratings: { userId: string; rating: number }[];
  createdAt: any;
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
                            'h-8 w-8 transition-colors',
                            (hoverRating || currentRating) >= star
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-muted-foreground'
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

  const handleRateGame = async (rating: number) => {
    if (!user) {
        toast({ title: "Please log in to rate.", variant: 'destructive' });
        return;
    }
    if (!game || !gameDocRef) return;

    setIsSubmittingRating(true);

    const existingRating = game.ratings.find(r => r.userId === user.uid);

    // Optimistically update the UI
    const newRatings = existingRating
        ? game.ratings.map(r => r.userId === user.uid ? { userId: user.uid, rating } : r)
        : [...game.ratings, { userId: user.uid, rating }];
    
    const totalRating = newRatings.reduce((acc, r) => acc + r.rating, 0);
    const newAverageRating = totalRating / newRatings.length;

    try {
        if(existingRating) {
            // Remove the old rating, then add the new one
            await updateDoc(gameDocRef, {
                ratings: arrayRemove(existingRating)
            });
            await updateDoc(gameDocRef, {
                ratings: arrayUnion({ userId: user.uid, rating }),
                averageRating: newAverageRating
            });
        } else {
            await updateDoc(gameDocRef, {
                ratings: arrayUnion({ userId: user.uid, rating }),
                averageRating: newAverageRating
            });
        }

        toast({ title: "Rating submitted!", description: `You rated ${game.gameName} ${rating} stars.` });

    } catch (error: any) {
        console.error(error);
        toast({ title: "Error submitting rating", description: error.message, variant: 'destructive' });
    } finally {
        setIsSubmittingRating(false);
    }
  };

  const handleInstallClick = () => {
    if (game?.downloadUrl) {
      window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

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
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2">
            <div className="relative aspect-square">
                <Image src={game.iconUrl} alt={game.gameName} fill className="object-cover" />
            </div>
            <div className="flex flex-col p-6">
                <CardHeader className="p-0">
                    <CardTitle className="text-3xl font-bold">{game.gameName}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{game.averageRating.toFixed(2)}</span>
                        <span>({game.ratings.length} ratings)</span>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow p-0 pt-4">
                    <CardDescription>{game.description || 'No description available.'}</CardDescription>
                </CardContent>
                <div className="mt-6 space-y-4">
                    <div>
                        <h4 className="font-semibold">Rate this game</h4>
                        <StarRating currentRating={userRating} onRate={handleRateGame} disabled={!user || isSubmittingRating}/>
                    </div>
                    <Button onClick={handleInstallClick} className="w-full" size="lg" disabled={!game.downloadUrl}>
                        <Download className="mr-2 h-5 w-5"/>
                        Install
                    </Button>
                </div>
            </div>
        </div>
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