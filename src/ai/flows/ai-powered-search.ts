// use server'

/**
 * @fileOverview AI-Powered Search flow for providing smarter, context-based anime and manga suggestions.
 *
 * - aiPoweredSearch - A function that handles the AI-powered search process.
 * - AIPoweredSearchInput - The input type for the aiPoweredSearch function.
 * - AIPoweredSearchOutput - The return type for the aiPoweredSearch function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {Anime, getAnimes} from '@/services/anime';
import {Manga, getMangas} from '@/services/manga';

const AIPoweredSearchInputSchema = z.object({
  searchTerm: z.string().describe('The search term entered by the user.'),
  searchType: z.enum(['anime', 'manga']).describe('The type of content to search for (anime or manga).'),
  genre: z.string().optional().describe('The genre to filter by.'),
  releaseYear: z.number().optional().describe('The release year to filter by (for anime).'),
  rating: z.number().optional().describe('The minimum rating to filter by (for anime).'),
  status: z.string().optional().describe('The status to filter by (for manga).'),
});
export type AIPoweredSearchInput = z.infer<typeof AIPoweredSearchInputSchema>;

const AIPoweredSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      title: z.string().describe('The title of the anime or manga.'),
      imageUrl: z.string().describe('The URL of the anime or manga image.'),
      description: z.string().describe('A short description of the anime or manga.'),
      genre: z.array(z.string()).describe('The genres of the anime or manga.'),
      releaseYear: z.number().optional().describe('The release year of the anime (if applicable).'),
      rating: z.number().optional().describe('The rating of the anime (if applicable).'),
      status: z.string().optional().describe('The status of the manga (if applicable).'),
    })
  ).describe('A list of search results.'),
  suggestions: z.array(z.string()).describe('AI-powered suggestions to enhance the search.'),
});
export type AIPoweredSearchOutput = z.infer<typeof AIPoweredSearchOutputSchema>;

export async function aiPoweredSearch(input: AIPoweredSearchInput): Promise<AIPoweredSearchOutput> {
  return aiPoweredSearchFlow(input);
}

const searchPrompt = ai.definePrompt({
  name: 'searchPrompt',
  input: {
    schema: z.object({
      searchTerm: z.string().describe('The search term entered by the user.'),
      searchType: z.enum(['anime', 'manga']).describe('The type of content to search for (anime or manga).'),
      genre: z.string().optional().describe('The genre to filter by.'),
      releaseYear: z.number().optional().describe('The release year to filter by (for anime).'),
      rating: z.number().optional().describe('The minimum rating to filter by (for anime).'),
      status: z.string().optional().describe('The status to filter by (for manga).'),
      results: z.array(
        z.object({
          title: z.string().describe('The title of the anime or manga.'),
          imageUrl: z.string().describe('The URL of the anime or manga image.'),
          description: z.string().describe('A short description of the anime or manga.'),
          genre: z.array(z.string()).describe('The genres of the anime or manga.'),
          releaseYear: z.number().optional().describe('The release year of the anime (if applicable).'),
          rating: z.number().optional().describe('The rating of the anime (if applicable).'),
          status: z.string().optional().describe('The status of the manga (if applicable).'),
        })
      ).describe('A list of search results.'),
    }),
  },
  output: {
    schema: z.object({
      suggestions: z.array(z.string()).describe('AI-powered suggestions to enhance the search.'),
    }),
  },
  prompt: `You are Nami AI, an expert in anime and manga. A user has searched for "{{searchTerm}}" in the "{{searchType}}" category.

  Based on their search and the following existing results:

  {{#each results}}
  - Title: {{title}}, Description: {{description}}, Genres: {{genre}}
  {{/each}}

  Provide a list of 3-5 suggestions that would help the user refine their search and discover more relevant content. These should be actual search terms that the user could type in.
  Return the suggestions as a JSON array of strings.  For example:  {
  "suggestions": ["suggestion 1", "suggestion 2"]
  }
  `,
});

const aiPoweredSearchFlow = ai.defineFlow<
  typeof AIPoweredSearchInputSchema,
  typeof AIPoweredSearchOutputSchema
>(
  {
    name: 'aiPoweredSearchFlow',
    inputSchema: AIPoweredSearchInputSchema,
    outputSchema: AIPoweredSearchOutputSchema,
  },
  async input => {
    let results: (Anime | Manga)[] = [];

    if (input.searchType === 'anime') {
      results = await getAnimes(input.genre, input.releaseYear, input.rating);
    } else if (input.searchType === 'manga') {
      results = await getMangas(input.genre, input.status);
    }

    const promptInput = {
      ...input,
      results: results.map(result => ({
        title: result.title,
        imageUrl: result.imageUrl,
        description: result.description,
        genre: result.genre,
        releaseYear: (result as Anime).releaseYear,
        rating: (result as Anime).rating,
        status: (result as Manga).status,
      })),
    };

    const {output} = await searchPrompt(promptInput);

    return {
      results: results.map(result => ({
        title: result.title,
        imageUrl: result.imageUrl,
        description: result.description,
        genre: result.genre,
        releaseYear: (result as Anime).releaseYear,
        rating: (result as Anime).rating,
        status: (result as Manga).status,
      })),
      suggestions: output!.suggestions,
    };
  }
);
