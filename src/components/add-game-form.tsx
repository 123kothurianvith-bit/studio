"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from 'react';
import { generateGameDescription } from '@/ai/flows/generate-game-description';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";


const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  platform: z.literal('Android'),
  genre: z.enum(['Action', 'RPG', 'Strategy', 'Adventure', 'Sports']),
  keyFeatures: z.string().min(10, {
    message: "Please list at least one key feature."
  }),
  targetAudience: z.string().min(3, {
    message: "Please describe the target audience."
  }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddGameForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      platform: "Android",
      keyFeatures: "",
      targetAudience: "",
      description: "",
    },
  });

  async function handleGenerateDescription() {
    const { title, platform, genre, keyFeatures, targetAudience } = form.getValues();
    if (!title || !platform || !genre || !keyFeatures || !targetAudience) {
      toast({
        title: "Missing Information",
        description: "Please fill out Title, Platform, Genre, Key Features, and Target Audience before generating a description.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateGameDescription({
        title,
        platform,
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

  function onSubmit(values: FormValues) {
    console.log(values);
    toast({
      title: "Game Submitted!",
      description: "Check the console for the submitted game data.",
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 rounded-lg border border-border p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Game Title</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Cosmic Rift" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Android">Android</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
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
        </div>

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
                Enter a comma-separated list of key features. This will be used by the AI to generate a description.
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
        <Button type="submit">Add Game to Store</Button>
      </form>
    </Form>
  );
}
