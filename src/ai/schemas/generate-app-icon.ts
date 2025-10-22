import { z } from 'genkit';

export const GenerateAppIconInputSchema = z.object({
  name: z.string().describe('The name of the game.'),
  genre: z.string().describe('The genre of the game.'),
});
export type GenerateAppIconInput = z.infer<typeof GenerateAppIconInputSchema>;

export const GenerateAppIconOutputSchema = z.object({
  iconUrl: z.string().describe('The data URI of the generated icon.'),
});
export type GenerateAppIconOutput = z.infer<typeof GenerateAppIconOutputSchema>;

    