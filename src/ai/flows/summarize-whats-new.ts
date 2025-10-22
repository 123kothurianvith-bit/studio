'use server';

/**
 * @fileOverview An AI agent to summarize "What's New" text for game updates.
 *
 * - summarizeWhatsNew - A function that handles the summarization process.
 * - SummarizeWhatsNewInput - The input type for the summarizeWhatsNew function.
 * - SummarizeWhatsNewOutput - The return type for the summarizeWhatsNew function.
 */

import { ai } from '@/ai/genkit';
import { 
  SummarizeWhatsNewInputSchema, 
  SummarizeWhatsNewOutputSchema,
  type SummarizeWhatsNewInput,
  type SummarizeWhatsNewOutput
} from '@/ai/schemas/summarize-whats-new';


export async function summarizeWhatsNew(input: SummarizeWhatsNewInput): Promise<SummarizeWhatsNewOutput> {
  return summarizeWhatsNewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeWhatsNewPrompt',
  input: { schema: SummarizeWhatsNewInputSchema },
  output: { schema: SummarizeWhatsNewOutputSchema },
  prompt: `You are an expert copywriter for a game store. Your task is to create a short, catchy summary of a game update's "What's New" section. The summary must be under 100 characters.

Focus on the most exciting changes, like new content, major features, or significant improvements.

Full "What's New" Text:
{{{whatsNewText}}}

Generate a compelling summary.`,
});

const summarizeWhatsNewFlow = ai.defineFlow(
  {
    name: 'summarizeWhatsNewFlow',
    inputSchema: SummarizeWhatsNewInputSchema,
    outputSchema: SummarizeWhatsNewOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
