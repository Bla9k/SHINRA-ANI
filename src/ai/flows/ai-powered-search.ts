
'use server';

/**
 * @fileOverview AI-Powered Search flow for providing smarter, context-based anime and manga suggestions using Jikan API data.
 *
 * - aiPoweredSearch - A function that handles the AI-powered search process.
 * - AIPoweredSearchInput - The input type for the aiPoweredSearch function.
 * - AIPoweredSearchOutput - The return type for the aiPoweredSearch function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
// Use Jikan-based services
import { Anime, getAnimes, AnimeResponse } from '@/services/anime';
import { Manga, getMangas, MangaResponse } from '@/services/manga';

// Input schema reflects filter options and Jikan structure
const AIPoweredSearchInputSchema = z.object({
  searchTerm: z.string().describe('The search term entered by the user.'),
  searchType: z.enum(['anime', 'manga']).describe('The type of content to search for (anime or manga).'),
  genre: z.string().optional().describe('The genre name or MAL ID to filter by.'), // Can be name or ID for Jikan
  year: z.number().optional().describe('The release year to filter by.'), // Jikan uses 'start_date' or 'year'
  minScore: z.number().optional().describe('The minimum score (0-10 scale) to filter by.'), // Jikan uses 'min_score'
  status: z.string().optional().describe('The status to filter by (e.g., "airing", "finished").'), // Jikan status strings
});
export type AIPoweredSearchInput = z.infer<typeof AIPoweredSearchInputSchema>;

// Output schema aligns with the data structure provided by the Jikan services (Anime/Manga interfaces)
const SearchResultSchema = z.object({
    id: z.number().describe('The MyAnimeList ID of the item.'), // Use mal_id
    title: z.string().describe('The title of the anime or manga.'),
    imageUrl: z.string().nullable().describe('The URL of the cover image.'),
    description: z.string().nullable().describe('A short description (synopsis).'), // Use synopsis
    genres: z.array(z.object({ // Jikan genre structure
        mal_id: z.number(),
        type: z.string(),
        name: z.string(),
        url: z.string(),
    })).optional().describe('The genres.'),
    // Anime specific (from Jikan)
    year: z.number().nullable().optional().describe('The release year.'),
    score: z.number().nullable().optional().describe('The score (0-10 scale).'),
    episodes: z.number().nullable().optional().describe('Number of episodes.'),
    // Manga specific (from Jikan)
    status: z.string().nullable().optional().describe('The status (e.g., "Finished", "Publishing").'),
    chapters: z.number().nullable().optional().describe('Number of chapters.'),
    volumes: z.number().nullable().optional().describe('Number of volumes.'),
    // Common
    type: z.enum(['anime', 'manga']).describe("Type of the result")
});

const AIPoweredSearchOutputSchema = z.object({
  results: z.array(SearchResultSchema).describe('A list of search results from Jikan.'),
  suggestions: z.array(z.string()).describe('AI-powered search term suggestions based on the query and initial results.'),
});
export type AIPoweredSearchOutput = z.infer<typeof AIPoweredSearchOutputSchema>;

// Exported function to be called by the frontend
export async function aiPoweredSearch(input: AIPoweredSearchInput): Promise<AIPoweredSearchOutput> {
  return aiPoweredSearchFlow(input);
}

// Define the prompt for generating search suggestions - Adapt context for Jikan
const searchSuggestionPrompt = ai.definePrompt({
  name: 'searchSuggestionPrompt',
  input: {
    schema: z.object({
      searchTerm: z.string().describe('The user\'s original search term.'),
      searchType: z.enum(['anime', 'manga']).describe('The type of content searched.'),
      genre: z.string().optional().describe('Genre filter applied.'),
      status: z.string().optional().describe('Status filter applied.'),
      year: z.number().optional().describe('Year filter applied.'),
      minScore: z.number().optional().describe('Min Score filter applied.'),
      initialResultsCount: z.number().describe('Number of initial results found.'),
      // Provide a few example results for context using Jikan structure
      exampleResults: z.array(
        z.object({
          title: z.string(),
          genres: z.array(z.string()).optional(), // Pass genre names
        })
      ).optional().describe('A few example titles and genres from the initial results.'),
    }),
  },
  output: {
    schema: z.object({
      suggestions: z.array(z.string()).describe('3-5 concise search term suggestions.'),
    }),
  },
  prompt: `You are Nami AI, an expert in anime and manga, helping users refine their search on AniManga Stream.

The user searched for "{{searchTerm}}" for {{searchType}}.
{{#if genre}}Filtered by genre: "{{genre}}".{{/if}}
{{#if status}}Filtered by status: "{{status}}".{{/if}}
{{#if year}}Filtered by year: {{year}}.{{/if}}
{{#if minScore}}Filtered by minimum score: {{minScore}}.{{/if}}

{{initialResultsCount}} initial results were found.
{{#if exampleResults}}Here are some examples:
{{#each exampleResults}}
- {{title}} (Genres: {{#if genres}}{{#each genres}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}N/A{{/if}})
{{/each}}{{/if}}

Based on the user's query and the filters applied, provide 3-5 **concise and relevant search terms** that could help them discover related or more specific content. Think about related genres, themes, authors/studios (if applicable), or alternative phrasing. The suggestions should be things the user could type into the search bar.

Return ONLY the JSON object with the suggestions array. Example:
{
  "suggestions": ["Mecha anime with romance", "Isekai manga finished", "Studio Ghibli movies"]
}`,
});

// Define the main flow using Jikan services
const aiPoweredSearchFlow = ai.defineFlow<
  typeof AIPoweredSearchInputSchema,
  typeof AIPoweredSearchOutputSchema
>(
  {
    name: 'aiPoweredSearchFlow',
    inputSchema: AIPoweredSearchInputSchema,
    outputSchema: AIPoweredSearchOutputSchema,
  },
  async (input) => {
    let initialResults: (Anime | Manga)[] = [];
    let response; // To hold the full response object

    // 1. Fetch initial results from Jikan based on input filters
    if (input.searchType === 'anime') {
        response = await getAnimes(
            input.genre,
            input.year,
            input.minScore,
            input.searchTerm || undefined, // Pass search term
            input.status,
            1 // Fetch page 1 initially
        );
        initialResults = response.animes;
    } else if (input.searchType === 'manga') {
         response = await getMangas(
             input.genre,
             input.status,
             input.searchTerm || undefined, // Pass search term
             input.minScore,
             1 // Fetch page 1 initially
         );
         initialResults = response.mangas;
    }

     // Map Jikan results to the format expected by the AIPoweredSearchOutputSchema
     const mappedResults: z.infer<typeof SearchResultSchema>[] = initialResults.map(result => ({
        id: result.mal_id, // Use mal_id
        title: result.title,
        imageUrl: result.imageUrl, // Use derived imageUrl
        description: result.synopsis, // Use synopsis
        genres: result.genres, // Use Jikan genre structure
        year: result.year ?? null,
        score: result.score ?? null,
        episodes: result.episodes ?? null,
        status: result.status ?? null,
        chapters: result.chapters ?? null,
        volumes: result.volumes ?? null,
        type: result.type, // Include type
      }));


    // 2. Prepare input for the suggestion prompt
    const suggestionPromptInput = {
      searchTerm: input.searchTerm,
      searchType: input.searchType,
      genre: input.genre,
      status: input.status,
      year: input.year,
      minScore: input.minScore,
      initialResultsCount: mappedResults.length,
      // Take top 5 results as examples for the prompt
      exampleResults: mappedResults.slice(0, 5).map(r => ({
          title: r.title,
          genres: r.genres?.map(g => g.name) || [], // Extract genre names
      })),
    };

    // 3. Call the suggestion prompt
    let suggestions: string[] = [];
    try {
        const { output } = await searchSuggestionPrompt(suggestionPromptInput);
        suggestions = output?.suggestions || [];
    } catch (promptError) {
        console.error("Error getting AI suggestions:", promptError);
        // Don't fail the whole search if suggestions fail
        suggestions = [];
    }


    // 4. Return the combined results and suggestions
    return {
      results: mappedResults,
      suggestions: suggestions,
    };
  }
);
