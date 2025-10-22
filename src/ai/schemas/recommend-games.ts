import { z } from 'genkit';

const GameInfoSchema = z.object({
    id: z.string(),
    gameName: z.string(),
    description: z.string(),
    genre: z.string(),
    developerName: z.string(),
});

export const RecommendGamesInputSchema = z.object({
  allGames: z.array(GameInfoSchema).describe('A list of all games available in the store.'),
  wishlistedGames: z.array(GameInfoSchema).describe("A list of games the user has wishlisted."),
  followedDevelopers: z.array(z.string()).describe("A list of developer names the user follows."),
  count: z.number().describe('The desired number of recommendations.'),
});
export type RecommendGamesInput = z.infer<typeof RecommendGamesInputSchema>;

export const RecommendGamesOutputSchema = z.object({
  recommendedGameIds: z.array(z.string()).describe('An array of recommended game IDs.'),
});
export type RecommendGamesOutput = z.infer<typeof RecommendGamesOutputSchema>;
