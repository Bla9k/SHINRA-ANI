
'use server';

/**
 * @fileOverview Flow for generating a surprise anime/manga recommendation based on user profile, mood, and recent interactions.
 * Relies on LLM knowledge and generates structured data matching Jikan format.
 *
 * - surpriseMeRecommendation - A function that returns a surprise anime or manga recommendation.
 * - SurpriseMeRecommendationInput - The input type for the surpriseMeRecommendation function.
 * - SurpriseMeRecommendationOutput - The return type for the surpriseMeRecommendation function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
// Import shared schemas for output structure
import { AnimeRecommendationSchema, MangaRecommendationSchema } from '@/ai/flows/shared-schemas';

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

// Output schema: Returns either a single anime or manga recommendation structure
const SurpriseMeRecommendationOutputSchema = z.union([
    AnimeRecommendationSchema,
    MangaRecommendationSchema
]).describe('A single surprise recommendation, either anime or manga, matching Jikan structure.');

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
    schema: SurpriseMeRecommendationOutputSchema // Use the union output schema
  },
  prompt: `You are Nami, an AI assistant specializing in anime and manga recommendations on AniManga Stream.

Based on the user's profile, mood, and recent interactions, provide a single **surprise** recommendation (either anime or manga). This should ideally be something relevant but perhaps slightly outside their usual picks.

User Profile: {{{userProfile}}}
Mood: {{{mood}}}
Recent Interactions: {{{recentInteractions}}}

Select EITHER anime OR manga. Provide the recommendation details strictly matching EITHER the AnimeRecommendationSchema OR the MangaRecommendationSchema (including plausible 'mal_id', 'title', 'synopsis', 'images' (use cdn.myanimelist.net pattern), 'score', 'year'/'status', 'genres', etc.). Ensure the 'type' field is correctly set to 'anime' or 'manga'.
Return ONLY the single JSON object for the recommendation.
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

         // Add imageUrl and id mapping
        return {
             ...output,
             imageUrl: output.images?.jpg?.large_image_url || output.images?.jpg?.image_url || null,
             id: output.mal_id // Ensure id is mapped from mal_id
        };

    } catch (error) {
         console.error("Error in surpriseMeRecommendationFlow:", error);
         // Provide a fallback or re-throw
         // Re-throwing might be better to indicate failure clearly
         throw new Error(`Failed to get surprise recommendation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);
