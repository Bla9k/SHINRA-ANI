
'use server';

/**
 * @fileOverview Flow for generating a random anime or manga recommendation directly from Jikan,
 * optionally filtered by genre. This is used for the "What's Next?" roulette feature.
 *
 * - surpriseMeRecommendation - A function that returns a random anime or manga.
 * - SurpriseMeRecommendationInput - The input type (requestType, optional genres).
 * - SurpriseMeRecommendationOutput - The return type (a single anime or manga).
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { Anime, Manga, getAnimes, getMangas, mapJikanDataToAnime, mapJikanDataToManga } from '@/services'; // Import base services and mappers
import { AnimeRecommendationSchema, MangaRecommendationSchema } from '@/ai/flows/shared-schemas';
import { config as appConfig } from '@/config';

// Simplified Input Schema for the Jikan-based roulette
const SurpriseMeRecommendationInputSchema = z.object({
  requestType: z.enum(['anime', 'manga']).default('anime').describe('The type of content to recommend (anime or manga).'),
  genres: z.array(z.string()).optional().describe('Optional list of genre IDs to filter by for a more targeted surprise.'),
});
export type SurpriseMeRecommendationInput = z.infer<typeof SurpriseMeRecommendationInputSchema>;

// Output schema: Returns either a single anime or manga recommendation structure
// Re-using the existing schemas from shared-schemas which should match Jikan structure
const SurpriseMeRecommendationOutputSchema = z.union([
    AnimeRecommendationSchema,
    MangaRecommendationSchema
]).describe('A single surprise recommendation, either anime or manga, matching Jikan structure.');
export type SurpriseMeRecommendationOutput = z.infer<typeof SurpriseMeRecommendationOutputSchema>;


export async function surpriseMeRecommendation(input: SurpriseMeRecommendationInput): Promise<SurpriseMeRecommendationOutput> {
  return surpriseMeRecommendationFlow(input);
}

// Flow definition: Directly fetches from Jikan.
const surpriseMeRecommendationFlow = ai.defineFlow<
  typeof SurpriseMeRecommendationInputSchema,
  typeof SurpriseMeRecommendationOutputSchema
>(
  {
    name: 'surpriseMeRecommendationFlow',
    inputSchema: SurpriseMeRecommendationInputSchema,
    outputSchema: SurpriseMeRecommendationOutputSchema,
  },
  async (input) => {
    console.log('[SurpriseMeFlow] Received input:', input);
    const { requestType, genres } = input;
    let chosenItem: Anime | Manga | null = null;

    try {
      // Fetch a list of popular/well-regarded items from Jikan
      // To get a "random" feel, fetch a page of popular items and pick one.
      // Fetching from a random page can be slow if the total pages are unknown or very large.
      // Let's fetch a page of highly rated items and pick randomly from there.
      const randomPage = Math.floor(Math.random() * 5) + 1; // Pick from first 5 pages of top items for speed
      const itemsPerRequest = 10; // Fetch a small batch

      const genreFilterString = genres && genres.length > 0 ? genres.join(',') : undefined;

      if (requestType === 'anime') {
        console.log(`[SurpriseMeFlow] Fetching random anime. Page: ${randomPage}, Genres: ${genreFilterString}`);
        const response = await getAnimes(genreFilterString, undefined, 7.0, undefined, 'complete', randomPage, 'score', itemsPerRequest);
        if (response.animes && response.animes.length > 0) {
          chosenItem = response.animes[Math.floor(Math.random() * response.animes.length)];
          console.log('[SurpriseMeFlow] Anime chosen:', chosenItem?.title);
        }
      } else if (requestType === 'manga') {
        console.log(`[SurpriseMeFlow] Fetching random manga. Page: ${randomPage}, Genres: ${genreFilterString}`);
        const response = await getMangas(genreFilterString, 'finished', undefined, 7.0, randomPage, 'score', itemsPerRequest);
        if (response.mangas && response.mangas.length > 0) {
          chosenItem = response.mangas[Math.floor(Math.random() * response.mangas.length)];
          console.log('[SurpriseMeFlow] Manga chosen:', chosenItem?.title);
        }
      }

      if (!chosenItem) {
        console.warn('[SurpriseMeFlow] No item chosen. Trying a broader fallback.');
        // Fallback: Get any popular item if the initial random pick failed
        if (requestType === 'anime') {
          const fallbackResponse = await getAnimes(undefined, undefined, 7.0, undefined, 'complete', 1, 'popularity', 5);
          if (fallbackResponse.animes && fallbackResponse.animes.length > 0) {
            chosenItem = fallbackResponse.animes[Math.floor(Math.random() * fallbackResponse.animes.length)];
          }
        } else {
          const fallbackResponse = await getMangas(undefined, 'finished', undefined, 7.0, 1, 'popularity', 5);
          if (fallbackResponse.mangas && fallbackResponse.mangas.length > 0) {
            chosenItem = fallbackResponse.mangas[Math.floor(Math.random() * fallbackResponse.mangas.length)];
          }
        }
      }

      if (!chosenItem) {
        console.error('[SurpriseMeFlow] Failed to find any surprise item after fallback.');
        throw new Error('Could not find a surprise recommendation.');
      }

      // Map to the correct output schema. Jikan service functions already use mappers,
      // but we need to ensure the output matches AnimeRecommendationSchema or MangaRecommendationSchema.
      // The shared schemas are based on Jikan structure, so direct mapping should be mostly fine.
      // The services `getAnimes`/`getMangas` now return objects already conforming to Anime/Manga type, which includes `id` and `imageUrl`.
      // The `AnimeRecommendationSchema` requires `mal_id` and `images`, etc.
      // Let's ensure the object we return matches the output schema.

      const mappedItem = chosenItem.type === 'anime'
        ? mapJikanDataToAnime(chosenItem) // Use the full Jikan data to ensure all fields
        : mapJikanDataToManga(chosenItem);

      if (!mappedItem) {
         throw new Error('Failed to map Jikan data to recommendation schema.');
      }

      // Further ensure the structure matches the *exact* fields in AnimeRecommendationSchema/MangaRecommendationSchema
      // This step might be redundant if mapJikanDataToAnime/Manga is perfectly aligned with the recommendation schemas.
      // For safety, we can re-construct:
      const finalOutput: any = {
        mal_id: mappedItem.mal_id,
        title: mappedItem.title,
        genres: mappedItem.genres,
        year: mappedItem.year,
        score: mappedItem.score,
        synopsis: mappedItem.synopsis,
        images: mappedItem.images, // This should be the full images object from Jikan
        status: mappedItem.status,
        url: mappedItem.url,
        type: mappedItem.type, // 'anime' or 'manga'
      };

      if (mappedItem.type === 'anime') {
        finalOutput.episodes = (mappedItem as Anime).episodes;
        finalOutput.trailer = (mappedItem as Anime).trailer;
      } else {
        finalOutput.chapters = (mappedItem as Manga).chapters;
        finalOutput.volumes = (mappedItem as Manga).volumes;
      }
      
      console.log('[SurpriseMeFlow] Returning final output:', finalOutput.title, finalOutput.type);
      return finalOutput as SurpriseMeRecommendationOutput; // Cast as the flow expects this union type

    } catch (error) {
      console.error("[SurpriseMeFlow] Error:", error instanceof Error ? error.message : String(error));
      // In case of an error, attempt to return a hardcoded known-good item or throw.
      // For now, we'll re-throw, and the calling component should handle it.
      throw new Error(`Failed to get surprise recommendation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);

