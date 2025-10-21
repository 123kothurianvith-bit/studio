'use server';
/**
 * @fileOverview An AI agent to search for games based on natural language.
 *
 * - searchGames - A function that handles the game search process.
 * - SearchGamesInput - The input type for the searchGames function.
 * - SearchGamesOutput - The return type for the searchGames function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GameInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  genre: z.string(),
});

const SearchGamesInputSchema = z.object({
  query: z.string().describe('The natural language search query from the user.'),
  games: z.array(GameInfoSchema).describe('The list of all available games to search through.'),
});
export type SearchGamesInput = z.infer<typeof SearchGamesInputSchema>;

const SearchGamesOutputSchema = z.object({
  gameIds: z
    .array(z.string())
    .describe('An array of game IDs that are the most relevant results for the user query.'),
});
export type SearchGamesOutput = z.infer<typeof SearchGamesOutputSchema>;

export async function searchGames(input: SearchGamesInput): Promise<SearchGamesOutput> {
  // If the query is empty, return no results.
  if (!input.query.trim()) {
    return { gameIds: [] };
  }
  // If there are no games to search, return no results.
  if (input.games.length === 0) {
    return { gameIds: [] };
  }
  return searchGamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchGamesPrompt',
  input: { schema: SearchGamesInputSchema },
  output: { schema: SearchGamesOutputSchema },
  prompt: `You are an intelligent search engine for a game store. Your task is to find the most relevant games from the provided list based on the user's natural language query.

Analyze the user's query: "{{query}}"

Consider the title, description, and genre of each game in the list below to determine relevance. Return an array of game IDs for the games that are the best match for the query.

If no games seem relevant, return an empty array.

Here is the list of available games:
{{#each games}}
- Game ID: {{id}}
- Title: {{title}}
- Genre: {{genre}}
- Description: {{description}}
{{/each}}
`,
});

const searchGamesFlow = ai.defineFlow(
  {
    name: 'searchGamesFlow',
    inputSchema: SearchGamesInputSchema,
    outputSchema: SearchGamesOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
