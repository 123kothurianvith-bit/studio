import { z } from 'genkit';

export const GenerateGameDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the game.'),
  platform: z.string().describe('The platform the game is on (e.g., PC, PS5, Xbox Series X).'),
  genre: z.string().describe('The genre of the game (e.g., Action, RPG, Strategy).'),
  keyFeatures: z.string().describe('A comma-separated list of key features of the game.'),
  targetAudience: z.string().describe('The target audience for the game.'),
});
export type GenerateGameDescriptionInput = z.infer<typeof GenerateGameDescriptionInputSchema>;

export const GenerateGameDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated game description.'),
});
export type GenerateGameDescriptionOutput = z.infer<typeof GenerateGameDescriptionOutputSchema>;
