
'use server';

/**
 * @fileOverview AI-Powered Search flow for providing smarter, context-based anime and manga suggestions.
 * This flow now includes a tool to search for characters via the Jikan API and improved natural language processing.
 *
 * - aiPoweredSearch - A function that handles the AI-powered search process.
 * - AIPoweredSearchInput - The input type for the aiPoweredSearch function.
 * - AIPoweredSearchOutput - The return type for the aiPoweredSearch function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
// Use Jikan-based services
import { Anime, getAnimes, AnimeResponse } from '@/services/anime';
import { Manga, getMangas, MangaResponse } from '@/services/manga';
// Import character search tool
import { searchCharacterTool } from '@/ai/tools/jikan-tools';
import type { CharacterSearchResult } from '@/services/characters'; // Import type

// --- Input Schema ---
const AIPoweredSearchInputSchema = z.object({
  searchTerm: z.string().describe('The natural language search query entered by the user (e.g., "isekai anime with op mc", "find manga with character Guts").'),
  searchType: z.enum(['anime', 'manga', 'all']).default('all').describe('The type of content to search for (anime, manga, or all). "all" allows the AI to determine the best type or search both.'),
  // Filters are now optional, AI can extract them from the search term
  genre: z.string().optional().describe('Specific genre name or MAL ID to filter by (overrides AI extraction).'),
  year: z.number().optional().describe('Specific release year to filter by (overrides AI extraction).'),
  minScore: z.number().min(0).max(10).optional().describe('Specific minimum score (0-10) to filter by (overrides AI extraction).'),
  status: z.string().optional().describe('Specific status to filter by (e.g., "airing", "finished", overrides AI extraction).'),
});
export type AIPoweredSearchInput = z.infer<typeof AIPoweredSearchInputSchema>;

// --- Output Schemas ---
// Schema for a single search result (can be anime, manga, or character)
const SearchResultSchema = z.object({
    id: z.number().describe('The MyAnimeList ID of the item.'), // mal_id
    title: z.string().describe('The title of the anime, manga, or character name.'),
    imageUrl: z.string().nullable().describe('The URL of the cover or character image.'),
    description: z.string().nullable().describe('A short description (synopsis or character details).'),
    type: z.enum(['anime', 'manga', 'character']).describe("Type of the result"),
    // Anime/Manga specific (optional)
    genres: z.array(z.object({ mal_id: z.number(), type: z.string(), name: z.string(), url: z.string() })).optional().describe('Genres (for anime/manga).'),
    year: z.number().nullable().optional().describe('Release year (for anime/manga).'),
    score: z.number().nullable().optional().describe('Score (0-10 scale) (for anime/manga).'),
    episodes: z.number().nullable().optional().describe('Number of episodes (for anime).'),
    status: z.string().nullable().optional().describe('Status (for anime/manga).'),
    chapters: z.number().nullable().optional().describe('Number of chapters (for manga).'),
    volumes: z.number().nullable().optional().describe('Number of volumes (for manga).'),
    // Character specific (optional)
    nicknames: z.array(z.string()).optional().describe('Character nicknames.'),
    favorites: z.number().optional().describe('Number of MAL favorites (for character).'),
    anime: z.array(z.object({ mal_id: z.number(), title: z.string() })).optional().describe('Anime the character appears in.'),
    manga: z.array(z.object({ mal_id: z.number(), title: z.string() })).optional().describe('Manga the character appears in.'),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;


const AIPoweredSearchOutputSchema = z.object({
  results: z.array(SearchResultSchema).describe('A list of search results (anime, manga, or characters) from Jikan.'),
  suggestions: z.array(z.string()).describe('AI-powered search term suggestions based on the query and results.'),
  aiAnalysis: z.string().optional().describe('A brief explanation from Nami about how the query was interpreted or why certain results were chosen.'),
});
export type AIPoweredSearchOutput = z.infer<typeof AIPoweredSearchOutputSchema>;


// --- Exported Function ---
export async function aiPoweredSearch(input: AIPoweredSearchInput): Promise<AIPoweredSearchOutput> {
  return aiPoweredSearchFlow(input);
}


// --- Main Prompt Definition ---
// This prompt now instructs the AI to analyze the query, extract parameters,
// decide if a character search is needed, and formulate a response plan.
const searchQueryAnalysisPrompt = ai.definePrompt({
  name: 'searchQueryAnalysisPrompt',
  input: {
    schema: AIPoweredSearchInputSchema // Use the main input schema
  },
  // The LLM will output extracted parameters and its reasoning/plan
  output: {
    schema: z.object({
        extractedSearchTerm: z.string().optional().describe('The core keyword(s) to use for anime/manga title search, if applicable.'),
        extractedGenre: z.string().optional().describe('Genre extracted from the query (e.g., "Isekai", "Romance").'),
        extractedYear: z.number().optional().describe('Year extracted from the query.'),
        extractedMinScore: z.number().optional().describe('Minimum score extracted or inferred.'),
        extractedStatus: z.string().optional().describe('Status extracted (e.g., "finished", "airing").'),
        targetType: z.enum(['anime', 'manga', 'character', 'both', 'unknown']).describe('The primary type of content the user seems to be looking for.'),
        characterToSearch: z.string().optional().describe('If the user query is about finding a character, specify the character name here.'),
        aiAnalysis: z.string().describe('Brief analysis of the user query and the plan to fulfill the request (e.g., "User is looking for finished isekai manga. Searching Jikan manga endpoint with filters. Then suggesting related terms.").'),
    })
  },
  // Use the character search tool
  tools: [searchCharacterTool],
  prompt: `You are Nami AI, an expert in anime and manga, helping users search AniManga Stream.

Analyze the user's search query and any provided filters. Determine the user's intent.

User Query: "{{searchTerm}}"
{{#if searchType}}Explicit Type: {{searchType}}{{/if}}
{{#if genre}}Explicit Genre Filter: "{{genre}}"{{/if}}
{{#if year}}Explicit Year Filter: {{year}}{{/if}}
{{#if minScore}}Explicit Min Score Filter: {{minScore}}{{/if}}
{{#if status}}Explicit Status Filter: "{{status}}"{{/if}}

Your Task:
1.  **Analyze Intent:** Understand what the user is looking for (anime, manga, a specific character, etc.). Prioritize explicit filters if provided.
2.  **Extract Parameters:** Identify relevant keywords, genres, years, statuses, scores, or character names from the natural language query.
3.  **Determine Target Type:** Decide if the primary target is 'anime', 'manga', 'character', 'both', or 'unknown'. If the explicit searchType is 'all' or not provided, make your best guess based on the query.
4.  **Character Search:** If the query is clearly about finding anime/manga *featuring* a specific character (e.g., "anime with Gojo Satoru", "manga where character named Guts appears"), identify the 'characterToSearch'. DO NOT use the character search tool yet, just identify the name.
5.  **Formulate Plan:** Briefly explain your analysis and how you'll proceed (this will be shown to the user).

Output ONLY the JSON object matching the specified output schema.

Example Query: "finished isekai manga from 2020"
Example Output:
{
  "extractedSearchTerm": "isekai",
  "extractedGenre": "Isekai",
  "extractedYear": 2020,
  "extractedStatus": "finished",
  "targetType": "manga",
  "aiAnalysis": "User is searching for finished Isekai manga released starting 2020. Will query Jikan manga API with these filters."
}

Example Query: "anime with the character Levi Ackerman"
Example Output:
{
  "targetType": "character",
  "characterToSearch": "Levi Ackerman",
  "aiAnalysis": "User wants to find anime featuring Levi Ackerman. Will use the character search tool first, then potentially search for the anime listed."
}

Example Query: "slice of life"
Example Output:
{
  "extractedSearchTerm": "slice of life",
  "extractedGenre": "Slice of Life",
  "targetType": "both", // Could be anime or manga
  "aiAnalysis": "User is searching for slice of life content. Will search both anime and manga endpoints using the genre filter."
}`,
});


// --- Suggestion Prompt (Remains similar, focuses on suggesting *new* search terms) ---
const searchSuggestionPrompt = ai.definePrompt({
  name: 'searchSuggestionPrompt',
  input: {
     // Input includes original query context and *initial* Jikan results
    schema: z.object({
      originalQuery: z.string().describe("The user's original natural language query."),
      searchType: z.enum(['anime', 'manga', 'character', 'both', 'unknown']).describe('The type of content searched.'),
      filtersApplied: z.object({
          genre: z.string().optional(),
          year: z.number().optional(),
          minScore: z.number().optional(),
          status: z.string().optional(),
          character: z.string().optional(),
      }).describe('Filters used for the search.'),
      initialResultsCount: z.number().describe('Number of initial results found.'),
      exampleResults: z.array( // Simplified examples
        z.object({
          title: z.string(),
          type: z.enum(['anime', 'manga', 'character']),
        })
      ).optional().describe('A few example titles/types from the initial results.'),
    }),
  },
  output: {
    schema: z.object({
      suggestions: z.array(z.string()).describe('3-5 concise search term suggestions for further exploration.'),
    }),
  },
  prompt: `You are Nami AI, providing search suggestions on AniManga Stream.

User's Original Query: "{{originalQuery}}"
Searched For: {{searchType}}
Filters Applied: {{#if filtersApplied.genre}}Genre: {{filtersApplied.genre}} {{/if}}{{#if filtersApplied.year}}Year: {{filtersApplied.year}} {{/if}}{{#if filtersApplied.minScore}}Min Score: {{filtersApplied.minScore}} {{/if}}{{#if filtersApplied.status}}Status: {{filtersApplied.status}} {{/if}}{{#if filtersApplied.character}}Character: {{filtersApplied.character}}{{/if}}
{{initialResultsCount}} initial results found.
{{#if exampleResults}}Examples: {{#each exampleResults}}{{title}} ({{type}}){{#unless @last}}, {{/unless}}{{/each}}{{/if}}

Based on the original query, filters, and the initial results, provide 3-5 **concise and relevant NEW search terms** to help the user refine or broaden their search. Think about related genres, themes, studios/authors, alternative phrasings, or character roles. Suggestions should be things the user could type next.

Return ONLY the JSON object with the suggestions array. Example:
{
  "suggestions": ["Action fantasy anime", "Manga by Kentaro Miura", "Characters similar to Levi", "Upcoming Isekai 2024"]
}`,
});

// --- Main Flow Definition ---
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
    let finalResults: SearchResult[] = [];
    let suggestions: string[] = [];
    let aiAnalysisResult: string | undefined;

    try {
        // 1. Analyze the user query with the LLM
        console.log("Analyzing search query:", input.searchTerm);
        const analysisResponse = await searchQueryAnalysisPrompt(input);
        const analysisOutput = analysisResponse.output;

        if (!analysisOutput) {
            throw new Error("AI query analysis failed.");
        }
        aiAnalysisResult = analysisOutput.aiAnalysis; // Store analysis for output
        console.log("AI Analysis:", analysisOutput);

        // --- Determine Search Strategy based on Analysis ---
        const searchPromises: Promise<any>[] = []; // To hold promises for Jikan/Tool calls

        // Use explicitly provided filters OR AI extracted filters
        const finalGenre = input.genre ?? analysisOutput.extractedGenre;
        const finalYear = input.year ?? analysisOutput.extractedYear;
        const finalMinScore = input.minScore ?? analysisOutput.extractedMinScore;
        const finalStatus = input.status ?? analysisOutput.extractedStatus;
        const finalSearchTerm = analysisOutput.extractedSearchTerm || input.searchTerm; // Use extracted term or original if none extracted
        const characterToSearch = analysisOutput.characterToSearch;
        let targetType = analysisOutput.targetType;

        // Refine target type if explicitly set
        if (input.searchType !== 'all') {
            targetType = input.searchType;
        }

         // --- Character Search Logic ---
        if (characterToSearch && (targetType === 'character' || targetType === 'all' || targetType === 'both')) {
             console.log(`Using character search tool for: "${characterToSearch}"`);
             // Use the character search tool (defined in jikan-tools.ts)
             const characterResults: CharacterSearchResult[] = await searchCharacterTool({ name: characterToSearch });
             console.log(`Character search tool returned ${characterResults.length} results.`);

             // Map character results to the standard SearchResult format
             const mappedCharResults = characterResults.map(char => ({
                 id: char.mal_id,
                 title: char.name,
                 imageUrl: char.images?.jpg?.image_url ?? null,
                 description: char.about ? char.about.split('. ')[0] + '.' : null, // First sentence of 'about'
                 type: 'character' as const, // Explicitly type as 'character'
                 nicknames: char.nicknames,
                 favorites: char.favorites,
                 anime: char.anime?.map(a => ({ mal_id: a.anime.mal_id, title: a.anime.title })) || [],
                 manga: char.manga?.map(m => ({ mal_id: m.manga.mal_id, title: m.manga.title })) || [],
             }));
             finalResults.push(...mappedCharResults);

             // If the intent was *only* character, we might stop here or search related anime/manga later
             // For now, we'll let it proceed to potentially search anime/manga based on other terms if present
             if (targetType === 'character') {
                 // Optionally, could decide to *only* return character results here
                 // targetType = 'unknown'; // Prevent further anime/manga search unless other terms exist
             }
         }

         // --- Anime/Manga Search Logic ---
         const shouldSearchAnime = targetType === 'anime' || targetType === 'both' || (targetType === 'all' && !characterToSearch) || (targetType === 'unknown' && !characterToSearch);
         const shouldSearchManga = targetType === 'manga' || targetType === 'both' || (targetType === 'all' && !characterToSearch) || (targetType === 'unknown' && !characterToSearch);

        if (shouldSearchAnime) {
            console.log(`Queueing Jikan anime search: Term='${finalSearchTerm}', Genre='${finalGenre}', Year='${finalYear}', Score='${finalMinScore}', Status='${finalStatus}'`);
            searchPromises.push(
                getAnimes(finalGenre, finalYear, finalMinScore, finalSearchTerm, finalStatus, 1) // Fetch page 1
                    .then(res => res.animes.map(a => ({ ...a, id: a.mal_id, description: a.synopsis, type: 'anime' as const }))) // Map and type
                    .catch(err => { console.warn("Anime search failed:", err); return []; }) // Handle individual fetch errors
            );
        }

        if (shouldSearchManga) {
            console.log(`Queueing Jikan manga search: Term='${finalSearchTerm}', Genre='${finalGenre}', Score='${finalMinScore}', Status='${finalStatus}'`);
             // Note: Jikan manga search doesn't directly support year filter, applying others
            searchPromises.push(
                getMangas(finalGenre, finalStatus, finalSearchTerm, finalMinScore, 1) // Fetch page 1
                    .then(res => res.mangas.map(m => ({ ...m, id: m.mal_id, description: m.synopsis, type: 'manga' as const }))) // Map and type
                    .catch(err => { console.warn("Manga search failed:", err); return []; }) // Handle individual fetch errors
            );
        }

        // Execute searches in parallel
        const searchResultsArrays = await Promise.all(searchPromises);
        searchResultsArrays.forEach(arr => finalResults.push(...arr));

        // Deduplicate results based on type and id
        const uniqueResults = Array.from(new Map(finalResults.map(item => [`${item.type}-${item.id}`, item])).values());
        finalResults = uniqueResults;

        console.log(`Total unique results found: ${finalResults.length}`);


        // 3. Generate Suggestions based on initial results
        if (finalResults.length > 0 || input.searchTerm) { // Generate suggestions even if no results, based on query
             console.log("Generating search suggestions...");
             try {
                 const suggestionInput = {
                     originalQuery: input.searchTerm,
                     searchType: targetType,
                     filtersApplied: {
                         genre: finalGenre,
                         year: finalYear,
                         minScore: finalMinScore,
                         status: finalStatus,
                         character: characterToSearch,
                     },
                     initialResultsCount: finalResults.length,
                     exampleResults: finalResults.slice(0, 5).map(r => ({ // Provide examples
                         title: r.title,
                         type: r.type,
                     })),
                 };
                const suggestionResponse = await searchSuggestionPrompt(suggestionInput);
                suggestions = suggestionResponse.output?.suggestions || [];
                console.log("AI Suggestions generated:", suggestions);
             } catch (promptError) {
                 console.error("Error getting AI suggestions:", promptError);
                 suggestions = []; // Gracefully degrade
             }
         }


        // 4. Return combined results
        return {
            results: finalResults,
            suggestions: suggestions,
            aiAnalysis: aiAnalysisResult,
        };

    } catch (flowError: any) {
        console.error("Error in aiPoweredSearchFlow:", flowError);
        setError(flowError.message || "An unexpected error occurred during the search.");
        // Return empty results with error analysis if possible
        return {
            results: [],
            suggestions: [],
            aiAnalysis: aiAnalysisResult || `Error processing search: ${flowError.message}`,
        };
    }
  }
);
