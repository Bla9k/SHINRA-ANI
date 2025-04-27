
'use server';

/**
 * @fileOverview Flow for generating a surprise anime/manga recommendation based on user profile, mood, and recent interactions.
 * Relies on LLM knowledge, does not fetch from Jikan directly.
 *
 * - surpriseMeRecommendation - A function that returns a surprise anime or manga recommendation.
 * - SurpriseMeRecommendationInput - The input type for the surpriseMeRecommendation function.
 * - SurpriseMeRecommendationOutput - The return type for the surpriseMeRecommendation function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import { Anime } from '@/services/anime'; // Import Jikan-based type
import { Manga } from '@/services/manga'; // Import Jikan-based type

const SurpriseMeRecommendationInputSchema = z.object({
  userProfile: z
    .string()
    .describe('A description of the user profile and their preferences (e.g., favorite genres, watched/read titles).'),
  mood: z.string().describe('The current mood of the user (e.g., adventurous, nostalgic, curious).'),
  recentInteractions: z
    .string()
    .describe('A summary of the user recent interactions with the app (e.g., last watched/read, searches).'),
});
export type SurpriseMeRecommendationInput = z.infer<typeof SurpriseMeRecommendationInputSchema>;

// Output schema based on Jikan structure (or a simplified version for surprise)
const SurpriseMeRecommendationOutputSchema = z.object({
  type: z.enum(['anime', 'manga']).describe('The type of recommendation.'),
  mal_id: z.number().describe('The MyAnimeList ID of the recommended item.'),
  title: z.string().describe('The title of the recommended anime or manga.'),
  synopsis: z.string().nullable().describe('A brief synopsis of the recommendation.'),
  imageUrl: z.string().nullable().describe('The URL of the recommended content cover image (large jpg).'),
  // Optionally include other relevant fields like score or year
  score: z.number().nullable().optional().describe('The score (0-10).'),
  year: z.number().nullable().optional().describe('The release year.'),
});
export type SurpriseMeRecommendationOutput = z.infer<typeof SurpriseMeRecommendationOutputSchema>;

export async function surpriseMeRecommendation(input: SurpriseMeRecommendationInput): Promise<SurpriseMeRecommendationOutput> {
  return surpriseMeRecommendationFlow(input);
}

// Prompt definition: Asks LLM for a single surprise recommendation.
const surpriseMeRecommendationPrompt = ai.definePrompt({
  name: 'surpriseMeRecommendationPrompt',
  input: {
    schema: SurpriseMeRecommendationInputSchema // Use the defined input schema
  },
  output: {
    schema: SurpriseMeRecommendationOutputSchema // Use the Jikan-based output schema
  },
  prompt: `You are Nami, an AI assistant specializing in anime and manga recommendations on AniManga Stream.

Based on the user's profile, mood, and recent interactions, provide a single **surprise** recommendation (either anime or manga). This should ideally be something relevant but perhaps slightly outside their usual picks.

User Profile: {{{userProfile}}}
Mood: {{{mood}}}
Recent Interactions: {{{recentInteractions}}}

Select either anime or manga. Provide the recommendation details strictly matching the output JSON schema, including a plausible 'mal_id', 'title', 'synopsis', 'imageUrl' (use cdn.myanimelist.net pattern if possible), 'score', and 'year'.
`,
});

// Flow definition: Calls the prompt and returns the LLM's response.
const surpriseMeRecommendationFlow = ai.defineFlow<
  typeof SurpriseMeRecommendationInputSchema,
  typeof SurpriseMeRecommendationOutputSchema
>(
  {
    name: 'surpriseMeRecommendationFlow',
    inputSchema: SurpriseMeRecommendationInputSchema,
    outputSchema: SurpriseMeRecommendationOutputSchema,
  },
  async input => {
    try {
        const {output} = await surpriseMeRecommendationPrompt(input);

        if (!output) {
            throw new Error('AI model did not return a surprise recommendation.');
        }
        // Ensure basic fields are present
        if (!output.mal_id || !output.title || !output.type) {
             throw new Error('AI model returned incomplete recommendation data.');
        }

        return output;
    } catch (error) {
         console.error("Error in surpriseMeRecommendationFlow:", error);
         // Provide a fallback or re-throw
         // For now, re-throwing might be better to indicate failure
         throw new Error(`Failed to get surprise recommendation: ${error instanceof Error ? error.message : error}`);
    }
  }
);
