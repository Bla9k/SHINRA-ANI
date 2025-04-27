
'use server';

/**
 * @fileOverview Provides anime and manga recommendations based on the user's current mood, watch history, and profile activity.
 * This flow relies on the LLM's internal knowledge and does not directly fetch from Jikan.
 *
 * - getMoodBasedRecommendations - A function that returns a list of anime and manga recommendations based on mood.
 * - MoodBasedRecommendationsInput - The input type for the getMoodBasedRecommendations function.
 * - MoodBasedRecommendationsOutput - The return type for the getMoodBasedRecommendations function.
 */

import {ai} from '@/ai/ai-instance';
import { Anime } from '@/services/anime'; // Import Jikan-based type
import { Manga } from '@/services/manga'; // Import Jikan-based type
import {z} from 'genkit';

const MoodBasedRecommendationsInputSchema = z.object({
  mood: z.string().describe('The current mood of the user (e.g., happy, sad, excited).'),
  watchHistory: z.array(z.string()).describe('A list of anime/manga titles the user has watched/read.'),
  profileActivity: z
    .string()
    .describe('A summary of the user profile activity (e.g., genres, ratings, favorite characters).'),
});
export type MoodBasedRecommendationsInput = z.infer<typeof MoodBasedRecommendationsInputSchema>;

// Define Schemas based on Jikan structure (used in output description for LLM)
const JikanGenreSchema = z.object({
    mal_id: z.number(),
    type: z.string(),
    name: z.string(),
    url: z.string(),
});

const JikanImageSchema = z.object({
      image_url: z.string().nullable(),
      small_image_url: z.string().nullable(),
      large_image_url: z.string().nullable(),
});

const JikanImagesSchema = z.object({
      jpg: JikanImageSchema,
      webp: JikanImageSchema,
});

const AnimeRecommendationSchema = z.object({
      mal_id: z.number().describe('The MyAnimeList ID of the recommended anime.'),
      title: z.string().describe('The title of the recommended anime.'),
      genres: z.array(JikanGenreSchema).describe('The anime genres.'),
      year: z.number().nullable().describe('The anime release year.'),
      score: z.number().nullable().describe('The anime score (0-10).'),
      synopsis: z.string().nullable().describe('The anime synopsis.'),
      images: JikanImagesSchema.describe('URLs for the anime cover image.'),
});

const MangaRecommendationSchema = z.object({
      mal_id: z.number().describe('The MyAnimeList ID of the recommended manga.'),
      title: z.string().describe('The title of the recommended manga.'),
      genres: z.array(JikanGenreSchema).describe('The manga genres.'),
      status: z.string().nullable().describe('The manga status (e.g., "Finished", "Publishing").'),
      synopsis: z.string().nullable().describe('The manga synopsis.'),
      images: JikanImagesSchema.describe('URLs for the manga cover image.'),
      chapters: z.number().nullable().describe('Number of chapters.'),
      volumes: z.number().nullable().describe('Number of volumes.'),
});


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
// It should try to return data matching the *structure* described in the output schema.
const prompt = ai.definePrompt({
  name: 'moodBasedRecommendationsPrompt',
  input: {
    schema: MoodBasedRecommendationsInputSchema // Use the defined input schema
  },
  output: {
    // Describe the desired output structure to the LLM using the Jikan-based schemas
    schema: MoodBasedRecommendationsOutputSchema
  },
  prompt: `Based on the user's current mood, watch/read history, and profile activity, recommend a list of anime and manga titles.

  Mood: {{{mood}}}
  History: {{#each watchHistory}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Profile Activity: {{{profileActivity}}}

  Provide recommendations that fit the user's preferences and mood.
  Return the results strictly in the specified JSON format, matching the Jikan API structure described in the output schema (including fields like mal_id, title, genres, year/status, score/chapters, synopsis, images).
  Generate plausible data for fields like mal_id, score, year, images etc. based on the recommended title. Use common image URL patterns from cdn.myanimelist.net if possible for 'images.jpg.large_image_url'.
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
      // Basic validation/cleanup if needed
      output.animeRecommendations = output.animeRecommendations || [];
      output.mangaRecommendations = output.mangaRecommendations || [];

      return output;
    } catch (error) {
       console.error("Error in moodBasedRecommendationsFlow:", error);
       // Return empty lists on error
       return { animeRecommendations: [], mangaRecommendations: [] };
    }
  }
);
