
'use server';

/**
 * @fileOverview Defines Genkit tools for interacting with the Jikan API.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { searchCharacters, CharacterSearchResult } from '@/services/characters';

// Schema for the output of the character search tool, based on CharacterSearchResult
const CharacterSearchResultSchema = z.array(
    z.object({
      mal_id: z.number().describe('MyAnimeList ID of the character.'),
      url: z.string().describe('URL to the character MAL page.'),
      images: z.object({
          jpg: z.object({ image_url: z.string().nullable() }),
          webp: z.object({ image_url: z.string().nullable(), small_image_url: z.string().nullable() })
      }).optional().describe('Character image URLs.'),
      name: z.string().describe('Character name.'),
      name_kanji: z.string().nullable().describe('Character name in Kanji.'),
      nicknames: z.array(z.string()).describe('Character nicknames.'),
      favorites: z.number().describe('Number of MAL favorites.'),
      about: z.string().nullable().describe('Character description/bio.'),
      // Simplified Anime/Manga relations for the tool output
       anime: z.array(z.object({
           role: z.string(),
           anime: z.object({
               mal_id: z.number(),
               url: z.string(),
               images: z.object({
                  jpg: z.object({ image_url: z.string().nullable() }),
                  webp: z.object({ image_url: z.string().nullable(), small_image_url: z.string().nullable() })
               }).optional(),
               title: z.string()
           })
       })).optional().describe('Anime the character appears in.'),
        manga: z.array(z.object({
            role: z.string(),
            manga: z.object({
               mal_id: z.number(),
               url: z.string(),
               images: z.object({
                  jpg: z.object({ image_url: z.string().nullable() }),
                  webp: z.object({ image_url: z.string().nullable(), small_image_url: z.string().nullable() })
               }).optional(),
                title: z.string()
            })
        })).optional().describe('Manga the character appears in.'),
    })
).describe('List of characters found matching the search query.');


// --- Character Search Tool ---
export const searchCharacterTool = ai.defineTool(
  {
    name: 'searchJikanCharacter',
    description: 'Searches for anime/manga characters by name using the Jikan API.',
    inputSchema: z.object({
      name: z.string().describe('The name of the character to search for.'),
    }),
    // The output should conform to the CharacterSearchResult shape from the service
    // We use the Zod schema derived from it to inform the LLM.
    outputSchema: CharacterSearchResultSchema,
  },
  async (input): Promise<CharacterSearchResult[]> => {
    console.log(`[searchCharacterTool] Searching for character: "${input.name}"`);
    try {
        const results = await searchCharacters(input.name);
        console.log(`[searchCharacterTool] Found ${results.length} characters for "${input.name}"`);
        // The service already returns data matching CharacterSearchResult[], so we return it directly.
        // Add basic error handling/logging within the tool execution.
        return results;
    } catch (error: any) {
        console.error(`[searchCharacterTool] Error searching for character "${input.name}":`, error);
        // Return empty array or throw, depending on desired error handling strategy.
        // Returning empty array might be safer for the LLM flow.
        return [];
    }
  }
);

// --- Potentially add more tools here ---
// e.g., getAnimeRecommendationsTool, getMangaRecommendationsTool, getAnimeDetailsTool etc.
// based on existing or new functions in src/services/

// Example: Tool to get anime details (if needed beyond simple search)
/*
const getAnimeDetailsTool = ai.defineTool(
  {
    name: 'getJikanAnimeDetails',
    description: 'Fetches detailed information about a specific anime using its MyAnimeList ID.',
    inputSchema: z.object({
      mal_id: z.number().describe('The MyAnimeList ID of the anime.'),
    }),
    outputSchema: z.any(), // Use the Anime Zod schema from shared-schemas or services if defined
  },
  async (input) => {
    // const animeDetails = await getAnimeById(input.mal_id); // Assuming getAnimeById exists
    // return animeDetails;
    return {}; // Placeholder
  }
);
*/
