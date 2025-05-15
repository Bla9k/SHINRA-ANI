
'use server';

/**
 * @fileOverview Defines Genkit tools for interacting with the Jikan API.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { searchCharacters, CharacterSearchResult } from '@/services/characters'; // Ensure CharacterSearchResult is exported

// Refined schema for the output of the character search tool, aligning with CharacterSearchResult
const CharacterSearchResultSchema = z.array(
    z.object({
      mal_id: z.number().describe('MyAnimeList ID of the character.'),
      url: z.string().describe('URL to the character MAL page.'),
      images: z.object({
          jpg: z.object({ image_url: z.string().nullable() }).optional(),
          webp: z.object({ image_url: z.string().nullable(), small_image_url: z.string().nullable() }).optional()
      }).optional().describe('Character image URLs.'),
      name: z.string().describe('Character name.'),
      name_kanji: z.string().nullable().optional().describe('Character name in Kanji.'),
      nicknames: z.array(z.string()).optional().describe('Character nicknames.'),
      favorites: z.number().optional().describe('Number of MAL favorites.'),
      about: z.string().nullable().optional().describe('Character description/bio.'),
       anime: z.array(z.object({ // Ensure anime and manga structures match CharacterSearchResult
           role: z.string(),
           anime: z.object({
               mal_id: z.number(), url: z.string(), title: z.string(),
               images: z.object({
                  jpg: z.object({ image_url: z.string().nullable() }).optional(),
                  webp: z.object({ image_url: z.string().nullable(), small_image_url: z.string().nullable() }).optional()
               }).optional(),
           })
       })).optional().describe('Anime the character appears in.'),
        manga: z.array(z.object({
            role: z.string(),
            manga: z.object({
               mal_id: z.number(), url: z.string(), title: z.string(),
                images: z.object({
                  jpg: z.object({ image_url: z.string().nullable() }).optional(),
                  webp: z.object({ image_url: z.string().nullable(), small_image_url: z.string().nullable() }).optional()
               }).optional(),
            })
        })).optional().describe('Manga the character appears in.'),
    })
).describe('List of characters found matching the search query from Jikan.');


// --- Character Search Tool ---
export const searchCharacterTool = ai.defineTool(
  {
    name: 'searchJikanCharacterByName', // More descriptive name
    description: 'Searches for anime or manga characters by their name using the Jikan API and returns a list of matching characters with their details.',
    inputSchema: z.object({
      name: z.string().describe('The name of the character to search for (e.g., "Lelouch Lamperouge", "Goku").'),
    }),
    outputSchema: CharacterSearchResultSchema,
  },
  async (input): Promise<CharacterSearchResult[]> => {
    console.log(`[JikanTool/searchCharacter] Searching for character: "${input.name}"`);
    try {
        // The searchCharacters service function already returns data matching CharacterSearchResult[]
        const results = await searchCharacters(input.name, 1, 5); // Search first page, limit to 5 for tool use
        console.log(`[JikanTool/searchCharacter] Found ${results.length} characters for "${input.name}"`);
        return results;
    } catch (error: any) {
        console.error(`[JikanTool/searchCharacter] Error searching for character "${input.name}":`, error.message);
        return []; // Return empty array on error to allow flow to continue if possible
    }
  }
);

// Potential future tools:
// - getAnimeDetailsByIdTool
// - getMangaDetailsByIdTool
// - getAnimeRecommendationsTool
// - getMangaRecommendationsTool
// These would wrap the respective functions from src/services/anime.ts and src/services/manga.ts
// and would require defining Zod schemas for their inputs and outputs based on the Anime/Manga interfaces.
