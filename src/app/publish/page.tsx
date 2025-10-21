'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { useFirestore, useUser, FirebaseClientProvider } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { addDocumentNonBlocking } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const formSchema = z.object({
  gameName: z.string().min(2, { message: 'Game name must be at least 2 characters.' }),
  iconUrl: z.string().url({ message: 'Please enter a valid URL for the game icon.' }),
  downloadUrl: z.string().url({ message: 'Please enter a valid URL for the game download.' }),
});

type FormValues = z.infer<typeof formSchema>;

function PublishComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gameName: '',
      iconUrl: '',
      downloadUrl: '',
    },
  });

  async function onSubmit(values: FormValues) {
    if (!firestore || !user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to publish a game.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    
    try {
      const gamesCollection = collection(firestore, 'publishedGames');
      
      const newGameData = {
        ...values,
        publisherId: user.uid,
        downloads: 0,
        averageRating: 0,
        ratings: [],
        createdAt: new Date(),
      };

      await addDocumentNonBlocking(gamesCollection, newGameData);
      
      toast({
        title: 'Game Published!',
        description: `${values.gameName} is now live!`,
      });
      router.push('/my-apps');
    } catch (error: any) {
      toast({
        title: 'Publishing Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="container mx-auto max-w-2xl py-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Upload className="h-6 w-6"/>
                    Publish a New Game
                </CardTitle>
                <CardDescription>
                    Fill in the details below to publish your game to the store.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="gameName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Game Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Super Mega Runner" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="iconUrl"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Game Icon URL</FormLabel>
                            <FormControl>
                            <Input placeholder="https://example.com/icon.png" {...field} />
                            </FormControl>
                            <FormDescription>The URL for your game's icon (should be a square image).</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="downloadUrl"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Game Download URL</FormLabel>
                            <FormControl>
                            <Input placeholder="https://example.com/game.zip" {...field} />
                            </FormControl>
                             <FormDescription>The direct download link for your game file.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Upload className="mr-2 h-4 w-4" />
                        )}
                        Publish Game
                    </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}

export default function PublishPage() {
    return (
        <FirebaseClientProvider>
            <PublishComponent />
        </FirebaseClientProvider>
    )
}