
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirestore, useUser, useMemoFirebase, FirebaseClientProvider } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PublishedGame {
  id: string;
  gameName: string;
  iconUrl: string;
  downloadUrl: string;
  description: string;
  publisherId: string;
  whatsNew?: string;
}

const formSchema = z.object({
  iconUrl: z.string().url({ message: 'Please enter a valid URL for the game icon.' }),
  downloadUrl: z.string().url({ message: 'Please enter a valid URL for the game download.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  whatsNew: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function EditGameComponent() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gameDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'publishedGames', id);
  }, [firestore, id]);

  const { data: game, isLoading } = useDoc<PublishedGame>(gameDocRef);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      iconUrl: '',
      downloadUrl: '',
      description: '',
      whatsNew: '',
    },
  });
  
  useEffect(() => {
    if (game) {
      form.reset({
        iconUrl: game.iconUrl,
        downloadUrl: game.downloadUrl,
        description: game.description,
        whatsNew: game.whatsNew || '',
      });
    }
  }, [game, form]);

  async function onSubmit(values: FormValues) {
    if (!gameDocRef) return;

    setIsSubmitting(true);
    try {
      await updateDoc(gameDocRef, values);
      toast({
        title: 'Game Updated!',
        description: `${game?.gameName} has been successfully updated.`,
      });
      router.push(`/game/${id}`);
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Update Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!game || (user && user.uid !== game.publisherId)) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-center">
        <p className="text-xl text-muted-foreground">
          {game ? 'You do not have permission to edit this game.' : 'Game not found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
        <div className="mb-4">
            <Button asChild variant="ghost" size="sm">
                <Link href={`/game/${id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Game Page
                </Link>
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Edit {game.gameName}</CardTitle>
                <CardDescription>Update the details for your game below.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="iconUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon URL</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="downloadUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Download URL</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea className="min-h-[120px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="whatsNew"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>What's New</FormLabel>
                                    <FormControl>
                                        <Textarea className="min-h-[120px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}


export default function EditGamePage() {
    return (
        <FirebaseClientProvider>
            <EditGameComponent />
        </FirebaseClientProvider>
    )
}
