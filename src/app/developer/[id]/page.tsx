
'use client';

import { useParams } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useUser, useMemoFirebase, FirebaseClientProvider } from '@/firebase';
import { doc, collection, query, where, arrayUnion, arrayRemove, runTransaction, increment } from 'firebase/firestore';
import Link from 'next/link';
import { Loader2, Frown, User as UserIcon, Rss } from 'lucide-react';
import GameCard from '@/components/game-card';
import type { Game, UserAccount } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DeveloperProfile {
  id: string;
  developerName: string;
  gameCount: number;
  followerCount: number;
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
  const { user } = useUser();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

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

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userAccount } = useDoc<UserAccount>(userDocRef);

  useEffect(() => {
    if (userAccount && developerId) {
      setIsFollowing(userAccount.followingDeveloperIds?.includes(developerId) || false);
    }
  }, [userAccount, developerId]);

  const handleFollowToggle = async () => {
    if (!user || !firestore || !developerDocRef || !userDocRef) {
      toast({ title: 'You must be logged in to follow developers.', variant: 'destructive'});
      return;
    }
    
    setIsFollowLoading(true);

    try {
        await runTransaction(firestore, async (transaction) => {
            const devDoc = await transaction.get(developerDocRef);
            if (!devDoc.exists()) {
                throw new Error("Developer not found!");
            }

            if (isFollowing) {
                transaction.update(userDocRef, {
                    followingDeveloperIds: arrayRemove(developerId)
                });
                transaction.update(developerDocRef, {
                    followerCount: increment(-1)
                });
            } else {
                transaction.update(userDocRef, {
                    followingDeveloperIds: arrayUnion(developerId)
                });
                transaction.update(developerDocRef, {
                    followerCount: increment(1)
                });
            }
        });
        setIsFollowing(!isFollowing);
        toast({
            title: isFollowing ? 'Unfollowed!' : 'Followed!',
            description: `You are now ${isFollowing ? 'no longer' : ''} following ${developer?.developerName}.`
        });
    } catch (e) {
        console.error(e);
        toast({ title: "Something went wrong", description: "Could not update follow status.", variant: "destructive"})
    } finally {
        setIsFollowLoading(false);
    }
  }

  const allGames = useMemo(() => {
    if (!publishedGames) return [];
    const transformedGames: Game[] = publishedGames.map(pg => ({
        id: pg.id,
        title: pg.gameName,
        platform: 'Android',
        price: 0,
        genre: pg.genre || 'User Published',
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                 <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground sm:h-20 sm:w-20">
                    <UserIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {developer.developerName}
                    </h1>
                    <p className="text-muted-foreground">{(developer.followerCount || 0).toLocaleString()} followers &middot; {developer.gameCount} apps</p>
                </div>
            </div>
            {user && user.uid !== developerId && (
                <Button onClick={handleFollowToggle} disabled={isFollowLoading}>
                    {isFollowLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rss className="mr-2 h-4 w-4" />}
                    {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
            )}
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
