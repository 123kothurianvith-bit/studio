
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirestore, useUser, useMemoFirebase, FirebaseClientProvider } from '@/firebase';
import { doc, updateDoc, runTransaction } from 'firebase/firestore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Star, Download, Edit, Heart, ChevronRight, Gamepad, Trash2, Send, User } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useWishlist } from '@/contexts/wishlist-context';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface PublishedGame {
  id: string;
  gameName: string;
  downloadUrl: string;
  description: string;
  publisherId: string;
  developerName: string;
  downloads: number;
  averageRating: number;
  ratings: { userId: string; userName?: string; rating: number; comment?: string }[];
  createdAt: any;
  whatsNew?: string;
  whatsNewSummary?: string;
  genre: string;
}

const gradients = [
    'from-pink-500 to-purple-600',
    'from-emerald-400 to-cyan-600',
    'from-amber-400 to-orange-600',
    'from-rose-400 to-fuchsia-600',
    'from-indigo-500 to-sky-600',
    'from-red-500 to-yellow-500',
    'from-green-400 to-blue-500',
];

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
                    className="disabled:cursor-not-allowed p-1"
                >
                    <Star
                        className={cn(
                            'h-8 w-8 transition-all',
                            (hoverRating || currentRating) >= star
                                ? 'text-primary fill-primary scale-110'
                                : 'text-muted-foreground/30'
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

function GameDetailPageComponent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();

  const gameDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'publishedGames', id);
  }, [firestore, id]);

  const { data: game, isLoading } = useDoc<PublishedGame>(gameDocRef);

  const wishlisted = useMemo(() => game ? isWishlisted(game.id) : false, [game, isWishlisted]);

  const handleWishlistToggle = () => {
    if (!game) return;
    if (wishlisted) {
      removeFromWishlist(game.id);
    } else {
      addToWishlist(game.id);
    }
  };

  const existingRating = useMemo(() => game?.ratings.find(r => r.userId === user?.uid), [game, user]);
  const userRating = existingRating?.rating || 0;
  
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

  const handleRateGame = (rating: number) => {
    if (!user) {
        toast({ title: "Please log in to rate.", variant: 'destructive' });
        return;
    }
    if (!game || !gameDocRef) return;

    if (!reviewComment.trim()) {
        toast({ title: "Review required", description: "Please write a review before submitting.", variant: 'destructive' });
        return;
    }

    setIsSubmittingRating(true);

    const userName = user.profile?.displayName || user.email?.split('@')[0] || "User";

    let newRatings;
    if(existingRating) {
        newRatings = game.ratings.map(r => r.userId === user.uid ? { ...r, userName, rating, comment: reviewComment } : r)
    } else {
        newRatings = [...game.ratings, { userId: user.uid, userName, rating, comment: reviewComment }];
    }
    
    const totalRating = newRatings.reduce((acc, r) => acc + r.rating, 0);
    const newAverageRating = totalRating / newRatings.length;

    const updateData = {
        ratings: newRatings,
        averageRating: newAverageRating,
    };

    updateDoc(gameDocRef, updateData)
        .then(() => {
             toast({ title: "Rating submitted!", description: `You rated ${game.gameName} ${rating} stars.` });
             setReviewComment("");
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: gameDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => {
            setIsSubmittingRating(false);
        });
  };

  const handleInstallClick = () => {
    if (game?.downloadUrl && gameDocRef) {
      window.open(game.downloadUrl, '_blank', 'noopener,noreferrer');
      const updateData = {
          downloads: (game.downloads || 0) + 1
      };
      updateDoc(gameDocRef, updateData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: gameDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  const handleDeleteGame = async () => {
    if (!user || !game || !gameDocRef || !firestore) return;

    setIsDeleting(true);
    
    runTransaction(firestore, async (transaction) => {
        const developerRef = doc(firestore, 'developers', user.uid);
        const devDoc = await transaction.get(developerRef);
        
        if (devDoc.exists()) {
            const currentCount = devDoc.data().gameCount || 0;
            transaction.update(developerRef, {
                gameCount: Math.max(0, currentCount - 1)
            });
        }
        
        transaction.delete(gameDocRef);
    })
    .then(() => {
        toast({
            title: 'Game Deleted',
            description: `${game.gameName} has been removed from the store.`,
        });
        router.push('/my-apps');
    })
    .catch(async (error) => {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: gameDocRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            toast({
                title: "Deletion Failed",
                description: error.message || "Could not delete the game.",
                variant: "destructive"
            });
        }
    })
    .finally(() => {
        setIsDeleting(false);
    });
  };
  
  const isPublisher = user && game && user.uid === game.publisherId;

  const charCodeSum = useMemo(() => id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0), [id]);
  const primaryGradient = gradients[charCodeSum % gradients.length];

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
    <div className="container mx-auto max-w-4xl space-y-6 pb-20 pt-4 px-4 sm:pt-8">
      <section className="flex items-start gap-4 sm:gap-6">
        <div className={cn("relative h-20 w-20 shrink-0 flex items-center justify-center rounded-2xl shadow-md sm:h-28 sm:w-28 bg-gradient-to-br", primaryGradient)}>
           <Gamepad className="h-10 w-10 text-white/40 sm:h-14 sm:w-14" />
        </div>
        <div className="flex flex-col gap-1 overflow-hidden">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-3xl">{game.gameName}</h1>
          <Link href={`/developer/${game.publisherId}`} className="w-fit text-sm font-medium text-primary hover:underline sm:text-base">
            {game.developerName}
          </Link>
          <div className="text-xs text-muted-foreground sm:text-sm">Contains ads · In-app purchases</div>
        </div>
      </section>

      <section className="flex items-center justify-around py-2 sm:justify-start sm:gap-12">
        <div className="flex flex-col items-center gap-1 sm:items-start">
            <div className="flex items-center gap-1 text-sm font-bold sm:text-base">
                {game.averageRating.toFixed(1)} <Star className="h-3 w-3 fill-foreground text-foreground" />
            </div>
            <div className="text-[10px] text-muted-foreground sm:text-xs">{game.ratings.length.toLocaleString()} reviews</div>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex flex-col items-center gap-1 sm:items-start">
            <div className="text-sm font-bold sm:text-base flex items-center gap-1">
                <Download className="h-4 w-4" />
                {(game.downloads || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground sm:text-xs">Downloads</div>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex flex-col items-center gap-1 sm:items-start">
            <div className="rounded border border-foreground/20 px-1 text-[10px] font-bold sm:text-xs">3+</div>
            <div className="text-[10px] text-muted-foreground sm:text-xs">Rated for 3+</div>
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button 
            onClick={handleInstallClick} 
            className="h-11 w-full bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90 sm:w-64" 
            disabled={!game.downloadUrl}
        >
          Install
        </Button>
        <div className="flex gap-2">
            <Button 
                onClick={handleWishlistToggle} 
                variant="outline" 
                className="flex-1 sm:flex-none"
            >
                <Heart className={cn("mr-2 h-5 w-5", wishlisted && "fill-destructive text-destructive")} />
                {wishlisted ? 'In Wishlist' : 'Add to Wishlist'}
            </Button>
            {isPublisher && (
                <>
                <Button asChild variant="outline" size="icon">
                    <Link href={`/game/${id}/edit`}>
                    <Edit className="h-5 w-5" />
                    </Link>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete <strong>{game.gameName}</strong> and remove all associated data. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteGame} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Delete Game
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </>
            )}
        </div>
      </section>

      <section className="pt-2">
          <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
            <CarouselContent className="-ml-2">
              {[0, 1, 2].map((idx) => (
                <CarouselItem key={idx} className="pl-2 basis-3/4 sm:basis-1/3">
                  <div className={cn(
                      "relative aspect-[16/9] w-full overflow-hidden rounded-xl border shadow-sm bg-gradient-to-br flex items-center justify-center",
                      gradients[(charCodeSum + idx + 1) % gradients.length]
                  )}>
                    <Gamepad className="h-12 w-12 text-white/20" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
      </section>

      <section className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold sm:text-xl">About this game</h2>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="line-clamp-3 text-sm text-muted-foreground sm:text-base">
            {game.description || 'No description available.'}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
              <div className="rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium">{game.genre}</div>
              <div className="rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium">Casual</div>
              <div className="rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium">Single Player</div>
          </div>
      </section>

      <Separator />

      {(game.whatsNew || game.whatsNewSummary) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold sm:text-xl">What's New</h2>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          {game.whatsNewSummary && (
            <div className="rounded-lg bg-primary/5 p-3 text-sm text-primary">
                {game.whatsNewSummary}
            </div>
          )}
          <p className="whitespace-pre-wrap text-sm text-muted-foreground sm:text-base">
            {game.whatsNew}
          </p>
        </section>
      )}

      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold sm:text-xl">Ratings and reviews</h2>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex items-start gap-8">
            <div className="flex flex-col items-center shrink-0">
                <div className="text-5xl font-bold">{game.averageRating.toFixed(1)}</div>
                <div className="mt-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={cn('h-3 w-3', game.averageRating >= star ? 'text-primary fill-primary' : 'text-muted-foreground/30')} />
                    ))}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{game.ratings.length.toLocaleString()} ratings</div>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
                {ratingDistribution.map((count, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="w-2 text-[10px] font-medium">{5 - i}</span>
                        <Progress value={game.ratings.length > 0 ? (count / game.ratings.length) * 100 : 0} className="h-2 flex-1 bg-muted" />
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-8 space-y-6">
            {game.ratings.filter(r => r.comment).length > 0 ? (
                game.ratings.filter(r => r.comment).map((rating, idx) => (
                    <div key={`${rating.userId}-${idx}`} className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    <User className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{rating.userName || 'User'}</span>
                                <div className="flex items-center gap-1">
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={cn('h-2 w-2', rating.rating >= star ? 'text-primary fill-primary' : 'text-muted-foreground/20')} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">Recent</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground pl-11">
                            {rating.comment}
                        </p>
                    </div>
                ))
            ) : (
                <p className="text-center text-sm text-muted-foreground py-4">No textual reviews yet. Be the first!</p>
            )}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="space-y-1">
                <h3 className="text-lg font-bold">Rate this game</h3>
                <p className="text-sm text-muted-foreground">Tell others what you think</p>
            </div>
            <StarRating currentRating={userRating} onRate={handleRateGame} disabled={!user || isSubmittingRating} />
            
            {user && (
                <div className="w-full max-w-md space-y-2">
                    <Textarea
                        placeholder="Write a review (required)..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="min-h-[100px] text-sm"
                    />
                    <p className="text-xs text-muted-foreground text-left">
                        Posting as <span className="font-medium text-foreground">{user.profile?.displayName || user.email?.split('@')[0] || 'User'}</span>
                    </p>
                    <Button
                        size="sm"
                        onClick={() => handleRateGame(userRating)}
                        disabled={isSubmittingRating || !userRating || !reviewComment.trim()}
                        className="w-full"
                    >
                        {isSubmittingRating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit Review
                    </Button>
                </div>
            )}

            {!user && (
                <p className="text-xs font-medium text-primary">
                    Log in to rate and review
                </p>
            )}
        </div>
      </section>
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
