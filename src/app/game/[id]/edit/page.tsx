'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirestore, useUser, useMemoFirebase, FirebaseClientProvider, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { summarizeWhatsNew } from '@/ai/flows/summarize-whats-new';

interface PublishedGame {
  id: string;
  gameName: string;
  downloadUrl: string;
  description: string;
  publisherId: string;
  whatsNew?: string;
  whatsNewSummary?: string;
}

const formSchema = z.object({
  downloadUrl: z.string().url({ message: 'Please enter a valid URL for the game download.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  whatsNew: z.string().optional(),
  whatsNewSummary: z.string().optional(),
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
  const [isGenerating, setIsGenerating] = useState(false);

  const gameDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'publishedGames', id);
  }, [firestore, id]);

  const { data: game, isLoading } = useDoc<PublishedGame>(gameDocRef);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      downloadUrl: '',
      description: '',
      whatsNew: '',
      whatsNewSummary: '',
    },
  });
  
  useEffect(() => {
    if (game) {
      form.reset({
        downloadUrl: game.downloadUrl,
        description: game.description,
        whatsNew: game.whatsNew || '',
        whatsNewSummary: game.whatsNewSummary || '',
      });
    }
  }, [game, form]);

  async function handleGenerateSummary() {
    const whatsNewText = form.getValues('whatsNew');
    if (!whatsNewText || whatsNewText.length < 10) {
      toast({
        title: "Text is too short",
        description: "Please write a more detailed 'What's New' before generating a summary.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await summarizeWhatsNew({ whatsNewText });
      if (result.summary) {
        form.setValue("whatsNewSummary", result.summary, { shouldValidate: true });
        toast({ title: "Summary Generated!" });
      }
    } catch (error) {
      console.error("Failed to generate summary:", error);
      toast({ title: "Generation Failed", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSubmit(values: FormValues) {
    if (!gameDocRef) return;

    setIsSubmitting(true);
    
    updateDoc(gameDocRef, values)
      .then(() => {
        toast({
          title: 'Game Updated!',
          description: `${game?.gameName} has been successfully updated.`,
        });
        router.push(`/game/${id}`);
      })
      .catch(async (error) => {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: gameDocRef.path,
                operation: 'update',
                requestResourceData: values,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            toast({
                title: 'Update Failed',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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
                        <FormField
                          control={form.control}
                          name="whatsNewSummary"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>What's New Summary (AI)</FormLabel>
                                <Button type="button" size="sm" onClick={handleGenerateSummary} disabled={isGenerating}>
                                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                  Generate
                                </Button>
                              </div>
                              <FormControl>
                                <Input {...field} placeholder="AI-generated summary will appear here..." />
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
