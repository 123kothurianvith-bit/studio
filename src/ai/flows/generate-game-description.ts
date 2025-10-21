'use server';

/**
 * @fileOverview An AI agent to generate game descriptions.
 *
 * - generateGameDescription - A function that handles the game description generation process.
 * - GenerateGameDescriptionInput - The input type for the generateGameDescription function.
 * - GenerateGameDescriptionOutput - The return type for the generateGameDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGameDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the game.'),
  platform: z.string().describe('The platform the game is on (e.g., PC, PS5, Xbox Series X).'),
  genre: z.string().describe('The genre of the game (e.g., Action, RPG, Strategy).'),
  keyFeatures: z.string().describe('A comma-separated list of key features of the game.'),
  targetAudience: z.string().describe('The target audience for the game.'),
});
export type GenerateGameDescriptionInput = z.infer<typeof GenerateGameDescriptionInputSchema>;

const GenerateGameDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated game description.'),
});
export type GenerateGameDescriptionOutput = z.infer<typeof GenerateGameDescriptionOutputSchema>;

export async function generateGameDescription(
  input: GenerateGameDescriptionInput
): Promise<GenerateGameDescriptionOutput> {
  return generateGameDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGameDescriptionPrompt',
  input: {schema: GenerateGameDescriptionInputSchema},
  output: {schema: GenerateGameDescriptionOutputSchema},
  prompt: `You are an expert game description writer. Generate an engaging and informative description for a game based on the following information:

Title: {{{title}}}
Platform: {{{platform}}}
Genre: {{{genre}}}
Key Features: {{{keyFeatures}}}
Target Audience: {{{targetAudience}}}

The description should include key features, gameplay mechanics, and the target audience.`,
});

const generateGameDescriptionFlow = ai.defineFlow(
  {
    name: 'generateGameDescriptionFlow',
    inputSchema: GenerateGameDescriptionInputSchema,
    outputSchema: GenerateGameDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
