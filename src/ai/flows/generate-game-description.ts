'use server';

/**
 * @fileOverview An AI agent to generate game descriptions.
 *
 * - generateGameDescription - A function that handles the game description generation process.
 * - GenerateGameDescriptionInput - The input type for the generateGameDescription function.
 * - GenerateGameDescriptionOutput - The return type for the generateGameDescription function.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateGameDescriptionInputSchema,
  GenerateGameDescriptionOutputSchema,
  type GenerateGameDescriptionInput,
  type GenerateGameDescriptionOutput
} from '@/ai/schemas/generate-game-description';


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
