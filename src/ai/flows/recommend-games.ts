'use server';

/**
 * @fileOverview An AI agent to recommend games to users.
 * 
 * - recommendGames - A function that handles the game recommendation process.
 * - RecommendGamesInput - The input type for the recommendGames function.
 * - RecommendGamesOutput - The return type for the recommendGames function.
 */

import { ai } from '@/ai/genkit';
import { 
  RecommendGamesInputSchema, 
  RecommendGamesOutputSchema,
  type RecommendGamesInput,
  type RecommendGamesOutput,
} from '@/ai/schemas/recommend-games';


export async function recommendGames(input: RecommendGamesInput): Promise<RecommendGamesOutput> {
  return recommendGamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendGamesPrompt',
  input: { schema: RecommendGamesInputSchema },
  output: { schema: RecommendGamesOutputSchema },
  prompt: `You are a game recommendation expert for a digital game store. Your task is to recommend a list of games to a user based on their preferences.

Analyze the user's wishlisted games and the developers they follow to understand their taste.

USER PREFERENCES:
- Wishlisted Games:
{{{json wishlistedGames}}}

- Followed Developers:
{{{json followedDevelopers}}}

AVAILABLE GAMES:
Here is a list of all games available in the store:
{{{json allGames}}}

Based on the user's preferences, recommend a list of {{count}} games from the "AVAILABLE GAMES" list that they have not already wishlisted. Return only the IDs of the recommended games. Do not recommend games that are already in the user's wishlist. If there are not enough games to recommend, return as many as you can.
`,
});

const recommendGamesFlow = ai.defineFlow(
  {
    name: 'recommendGamesFlow',
    inputSchema: RecommendGamesInputSchema,
    outputSchema: RecommendGamesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
