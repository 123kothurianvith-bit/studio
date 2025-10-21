
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useFirestore, useUser, FirebaseClientProvider, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { generateGameDescription } from '@/ai/flows/generate-game-description';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Frown, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  gameName: z.string().min(2, { message: 'Game name must be at least 2 characters.' }),
  developerName: z.string().min(2, { message: 'Developer name must be at least 2 characters.' }),
  iconUrl: z.string().url({ message: 'Please enter a valid URL for the game icon.' }),
  downloadUrl: z.string().url({ message: 'Please enter a valid URL for the game download.' }),
  isFeatured: z.boolean().optional(),
  featuredDescription: z.string().optional(),
  // AI fields
  genre: z.enum(['Action', 'RPG', 'Strategy', 'Adventure', 'Sports']),
  keyFeatures: z.string().min(10, { message: "Please list at least one key feature." }),
  targetAudience: z.string().min(3, { message: "Please describe the target audience." }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long.'}),
  whatsNew: z.string().optional(),
}).refine(data => {
    if (data.isFeatured && (!data.featuredDescription || data.featuredDescription.length < 10)) {
        return false;
    }
    return true;
}, {
    message: "Featured description must be at least 10 characters long when game is featured.",
    path: ["featuredDescription"],
});


type FormValues = z.infer<typeof formSchema>;

function PublishComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gameName: '',
      developerName: '',
      iconUrl: '',
      downloadUrl: '',
      isFeatured: false,
      featuredDescription: '',
      keyFeatures: "",
      targetAudience: "",
      description: "",
      whatsNew: "",
    },
  });

  const isFeaturedValue = form.watch('isFeatured');

  async function handleGenerateDescription() {
    const { gameName, genre, keyFeatures, targetAudience } = form.getValues();
    if (!gameName || !genre || !keyFeatures || !targetAudience) {
      toast({
        title: "Missing Information",
        description: "Please fill out Game Name, Genre, Key Features, and Target Audience before generating a description.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateGameDescription({
        title: gameName,
        platform: 'Android',
        genre,
        keyFeatures,
        targetAudience,
      });
      if (result.description) {
        form.setValue("description", result.description, { shouldValidate: true });
        toast({
          title: "Description Generated!",
          description: "The AI has generated a description for your game.",
        });
      }
    } catch (error) {
      console.error("Failed to generate description:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

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
    
    const developerRef = doc(firestore, 'developers', user.uid);
    const gamesCollectionRef = collection(firestore, 'publishedGames');
    const newGameRef = doc(gamesCollectionRef);

    // Declare these variables outside the transaction scope
    let developerData;
    const gameData = {
        ...values,
        id: newGameRef.id,
        publisherId: user.uid,
        downloads: 0,
        averageRating: 0,
        ratings: [],
        createdAt: serverTimestamp(),
    };


    runTransaction(firestore, async (transaction) => {
        const devDoc = await transaction.get(developerRef);

        developerData = {
            developerName: values.developerName,
            gameCount: (devDoc.exists() ? devDoc.data().gameCount : 0) + 1,
        };

        // 1. Create or update developer profile
        transaction.set(developerRef, developerData, { merge: true });
        
        // 2. Add the new game document
        transaction.set(newGameRef, gameData);

      }).then(() => {
        toast({
          title: 'Game Published!',
          description: `${values.gameName} is now live!`,
        });
        router.push('/my-apps');
      }).catch((error: any) => {
        const permissionError = new FirestorePermissionError({
          path: newGameRef.path, 
          operation: 'write', // Transactions can be complex, 'write' is a safe generalization
          requestResourceData: {
            developerProfile: developerData,
            game: gameData,
          }
        });
        errorEmitter.emit('permission-error', permissionError);

      }).finally(() => {
        setIsSubmitting(false);
      });
  }

  if (isUserLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

   if (user?.profile?.role !== 'developer') {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Frown className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Access Denied</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You must be a developer to publish games.
        </p>
      </div>
    );
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
                    Fill in the details below to publish your game to the store. Use AI to help with the description!
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
                        name="developerName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Developer Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Snapter Studios" {...field} />
                            </FormControl>
                            <FormDescription>This will be your public developer name.</FormDescription>
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
                    
                    <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                Feature this game
                                </FormLabel>
                                <FormDescription>
                                Featured games appear in a special section on the homepage.
                                </FormDescription>
                            </div>
                            </FormItem>
                        )}
                    />

                    {isFeaturedValue && (
                        <FormField
                            control={form.control}
                            name="featuredDescription"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Featured Game Description</FormLabel>
                                <FormControl>
                                <Textarea placeholder="Enter a short, catchy description for the featured games section..." {...field} />
                                </FormControl>
                                <FormDescription>This description will be shown on the featured game card on the homepage.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}


                    <FormField
                      control={form.control}
                      name="genre"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Genre</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a genre" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="Action">Action</SelectItem>
                                  <SelectItem value="RPG">RPG</SelectItem>
                                  <SelectItem value="Strategy">Strategy</SelectItem>
                                  <SelectItem value="Adventure">Adventure</SelectItem>
                                  <SelectItem value="Sports">Sports</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                          </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetAudience"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Target Audience</FormLabel>
                          <FormControl>
                              <Input placeholder="e.g., Fans of classic RPGs, Competitive players" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="keyFeatures"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Features</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Deep customization, Fast-paced combat, Branching narrative"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter a comma-separated list of key features for the AI.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Game Description</FormLabel>
                            <Button type="button" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                              {isGenerating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                              )}
                              Generate with AI
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="A detailed description of the game will appear here..."
                              className="min-h-[150px]"
                              {...field}
                            />
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
                                <FormLabel>What's New (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea className="min-h-[120px]" placeholder="e.g., Bug fixes, new levels, performance improvements..." {...field} />
                                </FormControl>
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
