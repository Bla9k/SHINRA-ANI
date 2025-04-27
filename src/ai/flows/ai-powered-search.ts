
'use server'; // Ensure this runs on the server

/**
 * @fileOverview AI-Powered Search flow for providing smarter, context-based anime and manga suggestions using AniList data.
 *
 * - aiPoweredSearch - A function that handles the AI-powered search process.
 * - AIPoweredSearchInput - The input type for the aiPoweredSearch function.
 * - AIPoweredSearchOutput - The return type for the aiPoweredSearch function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {Anime, getAnimes} from '@/services/anime'; // Use updated service
import {Manga, getMangas} from '@/services/manga'; // Use updated service

// Input schema reflects filter options and AniList structure
const AIPoweredSearchInputSchema = z.object({
  searchTerm: z.string().describe('The search term entered by the user.'),
  searchType: z.enum(['anime', 'manga']).describe('The type of content to search for (anime or manga).'),
  genre: z.string().optional().describe('The genre to filter by (AniList genre).'),
  releaseYear: z.number().optional().describe('The minimum release year to filter by (for anime).'),
  rating: z.number().optional().describe('The minimum rating (0-10 scale) to filter by (for anime).'),
  status: z.string().optional().describe('The status to filter by (for manga - e.g., RELEASING, FINISHED).'),
});
export type AIPoweredSearchInput = z.infer<typeof AIPoweredSearchInputSchema>;

// Output schema aligns with the data structure provided by the services
const SearchResultSchema = z.object({
    id: z.number().describe('The AniList ID of the item.'),
    title: z.string().describe('The title of the anime or manga.'),
    imageUrl: z.string().nullable().describe('The URL of the cover image.'),
    description: z.string().nullable().describe('A short description.'),
    genre: z.array(z.string()).optional().describe('The genres.'),
    // Anime specific
    releaseYear: z.number().nullable().optional().describe('The release year (if anime).'),
    rating: z.number().nullable().optional().describe('The rating (0-10 scale) (if anime).'),
    episodes: z.number().nullable().optional().describe('Number of episodes (if anime).'),
    // Manga specific
    status: z.string().nullable().optional().describe('The status (if manga).'),
    chapters: z.number().nullable().optional().describe('Number of chapters (if manga).'),
    volumes: z.number().nullable().optional().describe('Number of volumes (if manga).'),
});

const AIPoweredSearchOutputSchema = z.object({
  results: z.array(SearchResultSchema).describe('A list of search results from AniList.'),
  suggestions: z.array(z.string()).describe('AI-powered search term suggestions based on the query and initial results.'),
});
export type AIPoweredSearchOutput = z.infer<typeof AIPoweredSearchOutputSchema>;

// Exported function to be called by the frontend
export async function aiPoweredSearch(input: AIPoweredSearchInput): Promise<AIPoweredSearchOutput> {
  return aiPoweredSearchFlow(input);
}

// Define the prompt for generating search suggestions
const searchSuggestionPrompt = ai.definePrompt({
  name: 'searchSuggestionPrompt',
  input: {
    schema: z.object({
      searchTerm: z.string().describe('The user\'s original search term.'),
      searchType: z.enum(['anime', 'manga']).describe('The type of content searched.'),
      genre: z.string().optional().describe('Genre filter applied.'),
      status: z.string().optional().describe('Status filter applied (manga).'),
      initialResultsCount: z.number().describe('Number of initial results found.'),
      // Provide a few example results for context
      exampleResults: z.array(
        z.object({
          title: z.string(),
          genres: z.array(z.string()).optional(),
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
{{#if genre}}They filtered by the genre: "{{genre}}".{{/if}}
{{#if status}}They filtered by the status: "{{status}}".{{/if}}

{{initialResultsCount}} initial results were found.
{{#if exampleResults}}Here are some examples:
{{#each exampleResults}}
- {{title}} (Genres: {{#if genres}}{{#each genres}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}N/A{{/if}})
{{/each}}{{/if}}

Based on the user's query and the context, provide 3-5 **concise and relevant search terms** that could help them discover related or more specific content. Think about related genres, themes, authors/studios (if applicable and known), or alternative phrasing. The suggestions should be things the user could type into the search bar.

Return ONLY the JSON object with the suggestions array. Example:
{
  "suggestions": ["Mecha anime with romance", "Isekai manga completed", "Studio Ghibli movies"]
}`,
});

// Define the main flow
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

    // 1. Fetch initial results based on input filters using the services
    if (input.searchType === 'anime') {
      // Pass search term to getAnimes
      initialResults = await getAnimes(input.genre, input.releaseYear, input.rating, input.searchTerm);
    } else if (input.searchType === 'manga') {
      // Pass search term to getMangas
       initialResults = await getMangas(input.genre, input.status, input.searchTerm);
    }

     // Map results to the format expected by the output schema
     const mappedResults: z.infer<typeof SearchResultSchema>[] = initialResults.map(result => ({
        id: result.id,
        title: result.title,
        imageUrl: result.imageUrl,
        description: result.description,
        genre: result.genre,
        // Anime specific fields - use type assertion or check property existence
        releaseYear: (result as Anime).releaseYear ?? null,
        rating: (result as Anime).rating ?? null,
        episodes: (result as Anime).episodes ?? null,
        // Manga specific fields
        status: (result as Manga).status ?? null,
        chapters: (result as Manga).chapters ?? null,
        volumes: (result as Manga).volumes ?? null,
      }));


    // 2. Prepare input for the suggestion prompt
    const suggestionPromptInput = {
      searchTerm: input.searchTerm,
      searchType: input.searchType,
      genre: input.genre,
      status: input.searchType === 'manga' ? input.status : undefined,
      initialResultsCount: mappedResults.length,
      // Take top 5 results as examples for the prompt
      exampleResults: mappedResults.slice(0, 5).map(r => ({ title: r.title, genres: r.genre })),
    };

    // 3. Call the suggestion prompt
    let suggestions: string[] = [];
    try {
        const { output } = await searchSuggestionPrompt(suggestionPromptInput);
        suggestions = output?.suggestions || [];
    } catch (promptError) {
        console.error("Error getting AI suggestions:", promptError);
        // Don't fail the whole search if suggestions fail, just return empty suggestions
        suggestions = [];
    }


    // 4. Return the combined results and suggestions
    return {
      results: mappedResults,
      suggestions: suggestions,
    };
  }
);
