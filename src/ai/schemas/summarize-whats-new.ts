import { z } from 'genkit';

export const SummarizeWhatsNewInputSchema = z.object({
  whatsNewText: z.string().describe("The full 'What's New' text provided by the developer."),
});
export type SummarizeWhatsNewInput = z.infer<typeof SummarizeWhatsNewInputSchema>;

export const SummarizeWhatsNewOutputSchema = z.object({
  summary: z.string().describe('A short, engaging summary of the "What\'s New" text, under 100 characters.'),
});
export type SummarizeWhatsNewOutput = z.infer<typeof SummarizeWhatsNewOutputSchema>;
