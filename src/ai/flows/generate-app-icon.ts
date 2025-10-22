'use server';

/**
 * @fileOverview An AI agent to generate app icons.
 *
 * - generateAppIcon - A function that handles the app icon generation process.
 * - GenerateAppIconInput - The input type for the generateAppIcon function.
 * - GenerateAppIconOutput - The return type for the generateAppIcon function.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateAppIconInputSchema,
  GenerateAppIconOutputSchema,
  type GenerateAppIconInput,
  type GenerateAppIconOutput,
} from '@/ai/schemas/generate-app-icon';

export async function generateAppIcon(input: GenerateAppIconInput): Promise<GenerateAppIconOutput> {
  return generateAppIconFlow(input);
}

const generateAppIconFlow = ai.defineFlow(
  {
    name: 'generateAppIconFlow',
    inputSchema: GenerateAppIconInputSchema,
    outputSchema: GenerateAppIconOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `Generate a funky and unique abstract app icon for a game with the following details. The icon should use vibrant gradient colors and be suitable for a modern app store.

Game Name: ${input.name}
Game Genre: ${input.genre}

Do not include any text in the icon. The icon should be a simple, memorable, abstract shape or symbol.
`,
    });
    
    return {
        iconUrl: media.url,
    };
  }
);

    