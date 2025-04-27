
'use server';

/**
 * @fileOverview Provides anime and manga recommendations based on the user's current mood, watch history, and profile activity.
 * This flow relies on the LLM's internal knowledge and generates structured data matching Jikan format.
 *
 * - getMoodBasedRecommendations - A function that returns a list of anime and manga recommendations based on mood.
 * - MoodBasedRecommendationsInput - The input type for the getMoodBasedRecommendations function.
 * - MoodBasedRecommendationsOutput - The return type for the getMoodBasedRecommendations function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
// Import shared schemas for output structure
import { AnimeRecommendationSchema, MangaRecommendationSchema } from '@/ai/flows/shared-schemas';

const MoodBasedRecommendationsInputSchema = z.object({
  mood: z.string().describe('The current mood of the user (e.g., happy, sad, excited).'),
  watchHistory: z.array(z.string()).describe('A list of anime/manga titles the user has watched/read.'),
  profileActivity: z
    .string()
    .describe('A summary of the user profile activity (e.g., genres, ratings, favorite characters).'),
});
export type MoodBasedRecommendationsInput = z.infer<typeof MoodBasedRecommendationsInputSchema>;


const MoodBasedRecommendationsOutputSchema = z.object({
  animeRecommendations: z.array(AnimeRecommendationSchema).describe('List of recommended anime based on Jikan structure.'),
  mangaRecommendations: z.array(MangaRecommendationSchema).describe('List of recommended manga based on Jikan structure.'),
});
export type MoodBasedRecommendationsOutput = z.infer<typeof MoodBasedRecommendationsOutputSchema>;

export async function getMoodBasedRecommendations(
  input: MoodBasedRecommendationsInput
): Promise<MoodBasedRecommendationsOutput> {
  return moodBasedRecommendationsFlow(input);
}

// Prompt definition: Asks LLM for recommendations based on input.
// It should return data matching the *structure* described in the output schema.
const prompt = ai.definePrompt({
  name: 'moodBasedRecommendationsPrompt',
  input: {
    schema: MoodBasedRecommendationsInputSchema // Use the defined input schema
  },
  output: {
    // Describe the desired output structure to the LLM using the shared schemas
    schema: MoodBasedRecommendationsOutputSchema
  },
  prompt: `Based on the user's current mood, watch/read history, and profile activity, recommend a list of anime and manga titles (up to 3 of each).

  Mood: {{{mood}}}
  History: {{#each watchHistory}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Profile Activity: {{{profileActivity}}}

  Provide recommendations that fit the user's preferences and mood.
  Return the results strictly in the specified JSON format, matching the Jikan API structure described in the AnimeRecommendationSchema and MangaRecommendationSchema (including fields like mal_id, title, genres, year/status, score/chapters, synopsis, images).
  Generate plausible data for fields like mal_id, score, year, images etc. based on the recommended title. Use common image URL patterns from cdn.myanimelist.net if possible for 'images.jpg.large_image_url'. Ensure the 'type' field is correctly set to 'anime' or 'manga'.
  `,
});

// Flow definition: Calls the prompt and returns the LLM's response.
const moodBasedRecommendationsFlow = ai.defineFlow<
  typeof MoodBasedRecommendationsInputSchema,
  typeof MoodBasedRecommendationsOutputSchema
>(
  {
    name: 'moodBasedRecommendationsFlow',
    inputSchema: MoodBasedRecommendationsInputSchema,
    outputSchema: MoodBasedRecommendationsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);

      if (!output) {
        throw new Error('AI model did not return recommendations.');
      }
       // Basic validation/cleanup and ensure imageUrl/id mapping
       const addImageUrlAndId = (item: any) => ({
           ...item,
           imageUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || null,
           id: item.mal_id // Ensure id is mapped from mal_id
       });

      return {
          animeRecommendations: (output.animeRecommendations || []).map(addImageUrlAndId),
          mangaRecommendations: (output.mangaRecommendations || []).map(addImageUrlAndId),
      };
    } catch (error) {
       console.error("Error in moodBasedRecommendationsFlow:", error);
       // Return empty lists on error
       return { animeRecommendations: [], mangaRecommendations: [] };
    }
  }
);
