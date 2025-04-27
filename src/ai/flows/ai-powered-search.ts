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
// Simplified input: AI should extract filters from the natural language query
const AIPoweredSearchInputSchema = z.object({
  searchTerm: z.string().describe('The natural language search query entered by the user (e.g., "isekai anime with op mc", "find manga with character Guts", "sad romance anime").'),
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
// This prompt instructs the AI to analyze the query, extract parameters FOR JIKAN,
// decide if a character search is needed, and formulate a response plan.
const searchQueryAnalysisPrompt = ai.definePrompt({
  name: 'searchQueryAnalysisPrompt',
  input: {
    schema: AIPoweredSearchInputSchema // Use the main input schema
  },
  // The LLM will output extracted parameters and its reasoning/plan
  output: {
    schema: z.object({
        extractedSearchKeywords: z.string().optional().describe('Relevant keywords extracted from the query to use in Jikan\'s "q" parameter (e.g., "isekai op mc", "sad romance"). Keep it concise.'),
        extractedGenreId: z.string().optional().describe('A SINGLE relevant MAL genre ID extracted or inferred from the query (e.g., "10" for Fantasy, "22" for Romance). If multiple genres seem relevant, pick the most prominent one.'),
        // extractedYear: z.number().optional().describe('Year extracted from the query.'), // Year extraction can be unreliable, prioritize keywords/genre
        // extractedMinScore: z.number().optional().describe('Minimum score extracted or inferred.'), // Score extraction can be unreliable
        extractedStatus: z.string().optional().describe('Status extracted (e.g., "finished", "airing", "publishing").'),
        targetType: z.enum(['anime', 'manga', 'character', 'both', 'unknown']).describe('The primary type of content the user seems to be looking for (anime, manga, character, both, or unknown if unsure).'),
        characterToSearch: z.string().optional().describe('If the query is about finding content *featuring* a specific character, specify the character name here.'),
        aiAnalysis: z.string().describe('Brief analysis of the user query and the plan to fulfill the request (e.g., "User is looking for sad romance anime. Searching Jikan anime endpoint with genre ID 22 and keywords \'sad romance\'. Then suggesting related terms.").'),
    })
  },
  // Use the character search tool
  tools: [searchCharacterTool],
  prompt: `You are Nami AI, an expert in anime and manga, helping users search AniManga Stream using the Jikan API.

Analyze the user's natural language search query. Determine the user's intent and extract parameters suitable for querying the Jikan API.

User Query: "{{searchTerm}}"

Your Task:
1.  **Analyze Intent:** Understand what the user is looking for (anime, manga, a specific character, etc.).
2.  **Extract Keywords:** Identify the most relevant keywords for a Jikan 'q' parameter search. Be concise (e.g., "isekai op mc", "samurai adventure").
3.  **Extract Genre ID:** If a specific genre is strongly implied (like "romance", "sci-fi", "fantasy"), provide its **single most relevant MAL genre ID** (e.g., Action: "1", Adventure: "2", Comedy: "4", Drama: "8", Fantasy: "10", Horror: "14", Mystery: "7", Romance: "22", Sci-Fi: "24", Slice of Life: "36", Sports: "30", Supernatural: "37", Thriller: "41"). If multiple genres fit, pick the primary one.
4.  **Extract Status:** Identify if a status like "finished", "airing", or "publishing" is mentioned.
5.  **Determine Target Type:** Decide if the primary target is 'anime', 'manga', 'character', 'both' (if applicable to either), or 'unknown'.
6.  **Character Search:** If the query is clearly about finding anime/manga *featuring* a specific character (e.g., "anime with Gojo Satoru", "manga where character named Guts appears"), identify the 'characterToSearch'. DO NOT use the character search tool yet, just identify the name. If the query is just the character name, assume they want info *about* the character.
7.  **Formulate Plan:** Briefly explain your analysis and how you'll proceed using the extracted parameters (this will be shown to the user). Mention the parameters you extracted.

Output ONLY the JSON object matching the specified output schema.

Example Query: "sad romance anime"
Example Output:
{
  "extractedSearchKeywords": "sad romance",
  "extractedGenreId": "22",
  "targetType": "anime",
  "aiAnalysis": "User is looking for sad romance anime. Will query Jikan anime API using genre ID 22 and keywords 'sad romance'."
}

Example Query: "find manga starring the character Guts"
Example Output:
{
  "targetType": "character",
  "characterToSearch": "Guts",
  "aiAnalysis": "User wants to find manga featuring Guts. Will use the character search tool first, then potentially search for the manga listed."
}

Example Query: "Gojo Satoru"
Example Output:
{
  "targetType": "character",
  "characterToSearch": "Gojo Satoru",
  "aiAnalysis": "User is searching for information about the character Gojo Satoru. Will use the character search tool."
}

Example Query: "best finished isekai"
Example Output:
{
  "extractedSearchKeywords": "best isekai",
  "extractedGenreId": "62", // Genre ID for Isekai
  "extractedStatus": "finished", // Jikan uses 'complete' for anime, 'finished' for manga, let flow handle this
  "targetType": "both", // Could be anime or manga
  "aiAnalysis": "User is looking for completed Isekai. Will query Jikan anime (status=complete) and manga (status=finished) API using keywords 'best isekai' and genre ID 62."
}
`,
});


// --- Suggestion Prompt ---
const searchSuggestionPrompt = ai.definePrompt({
  name: 'searchSuggestionPrompt',
  input: {
    schema: z.object({
      originalQuery: z.string().describe("The user's original natural language query."),
      aiAnalysis: z.string().optional().describe("Nami's analysis of the original query."),
      filtersApplied: z.object({
          keywords: z.string().optional(),
          genreId: z.string().optional(),
          status: z.string().optional(),
          type: z.enum(['anime', 'manga', 'character', 'both', 'unknown']),
          character: z.string().optional(),
      }).describe('Parameters used for the search based on AI analysis.'),
      resultsCount: z.number().describe('Number of results found.'),
      exampleResults: z.array(
        z.object({ title: z.string(), type: z.enum(['anime', 'manga', 'character']) })
      ).optional().describe('A few example titles/types from the results.'),
    }),
  },
  output: {
    schema: z.object({
      suggestions: z.array(z.string()).max(4).describe('3-4 concise search term suggestions for further exploration.'),
    }),
  },
  prompt: `You are Nami AI, providing search suggestions on AniManga Stream.

User's Original Query: "{{originalQuery}}"
{{#if aiAnalysis}}Your Interpretation: {{aiAnalysis}}{{/if}}
Search Parameters Used: Type={{filtersApplied.type}}{{#if filtersApplied.keywords}}, Keywords="{{filtersApplied.keywords}}"{{/if}}{{#if filtersApplied.genreId}}, GenreID="{{filtersApplied.genreId}}"{{/if}}{{#if filtersApplied.status}}, Status="{{filtersApplied.status}}"{{/if}}{{#if filtersApplied.character}}, Character="{{filtersApplied.character}}"{{/if}}
Results Found: {{resultsCount}}
{{#if exampleResults}}Examples: {{#each exampleResults}}{{title}} ({{type}}){{#unless @last}}, {{/unless}}{{/each}}{{/if}}

Based on the user's query, your interpretation, the parameters used, and the results (or lack thereof), provide 3-4 **concise and relevant NEW search terms** to help the user refine or broaden their search. Think about related genres, themes, character roles, alternative phrasings, or correcting potential misunderstandings. Suggestions should be things the user could type next.

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
    let appliedFilters: any = {}; // To store parameters used for suggestions prompt

    try {
        // 1. Analyze the user query with the LLM
        console.log("[AI Search] Analyzing query:", input.searchTerm);
        const analysisResponse = await searchQueryAnalysisPrompt(input);
        const analysisOutput = analysisResponse.output;

        if (!analysisOutput) {
            throw new Error("AI query analysis failed to return output.");
        }
        aiAnalysisResult = analysisOutput.aiAnalysis; // Store analysis for output
        console.log("[AI Search] AI Analysis Output:", analysisOutput);

        // --- Determine Search Strategy based on Analysis ---
        const searchPromises: Promise<any>[] = []; // To hold promises for Jikan/Tool calls

        // Use AI extracted filters
        const finalKeywords = analysisOutput.extractedSearchKeywords;
        const finalGenreId = analysisOutput.extractedGenreId;
        const finalStatus = analysisOutput.extractedStatus;
        const characterToSearch = analysisOutput.characterToSearch;
        const targetType = analysisOutput.targetType;

        // Store applied filters for suggestions prompt
        appliedFilters = {
            keywords: finalKeywords,
            genreId: finalGenreId,
            status: finalStatus,
            type: targetType,
            character: characterToSearch,
        };

         // --- Character Search Logic ---
         // Execute immediately if the primary target is a character
        if (characterToSearch && (targetType === 'character')) {
             console.log(`[AI Search] Using character search tool for: "${characterToSearch}"`);
             const characterResults: CharacterSearchResult[] = await searchCharacterTool({ name: characterToSearch });
             console.log(`[AI Search] Character search tool returned ${characterResults.length} results.`);

             // Map character results to the standard SearchResult format
             const mappedCharResults = characterResults.map(char => ({
                 id: char.mal_id,
                 title: char.name,
                 imageUrl: char.images?.jpg?.image_url ?? null,
                 description: char.about ? char.about.split('. ')[0] + '.' : null, // First sentence
                 type: 'character' as const,
                 nicknames: char.nicknames,
                 favorites: char.favorites,
                 anime: char.anime?.map(a => ({ mal_id: a.anime.mal_id, title: a.anime.title })) || [],
                 manga: char.manga?.map(m => ({ mal_id: m.manga.mal_id, title: m.manga.title })) || [],
             }));
             finalResults.push(...mappedCharResults);
             // If ONLY character was the target, skip further anime/manga search
         }

         // --- Anime/Manga Search Logic ---
         // Search if target is anime/manga/both/unknown OR if character search is meant to find *related* content
         if (targetType !== 'character' || (characterToSearch && targetType === 'character' /* and intent was related content, adjust prompt if needed */)) {
             const shouldSearchAnime = targetType === 'anime' || targetType === 'both' || targetType === 'unknown';
             const shouldSearchManga = targetType === 'manga' || targetType === 'both' || targetType === 'unknown';

             // Map generic status to Jikan specific status if needed
             const animeStatus = finalStatus === 'finished' ? 'complete' : finalStatus;
             const mangaStatus = finalStatus === 'airing' ? 'publishing' : finalStatus;

             if (shouldSearchAnime) {
                 console.log(`[AI Search] Queueing Jikan anime search: Keywords='${finalKeywords}', GenreID='${finalGenreId}', Status='${animeStatus}'`);
                 searchPromises.push(
                     getAnimes(finalGenreId, undefined, undefined, finalKeywords, animeStatus, 1, 'rank', 10) // Sort by rank/relevance, limit results
                         .then(res => res.animes.map(a => ({ ...a, id: a.mal_id, description: a.synopsis, type: 'anime' as const, imageUrl: a.imageUrl })))
                         .catch(err => { console.warn("AI Anime search failed:", err); return []; })
                 );
             }

             if (shouldSearchManga) {
                 console.log(`[AI Search] Queueing Jikan manga search: Keywords='${finalKeywords}', GenreID='${finalGenreId}', Status='${mangaStatus}'`);
                 searchPromises.push(
                     getMangas(finalGenreId, mangaStatus, finalKeywords, undefined, 1, 'rank', 10) // Sort by rank/relevance, limit results
                         .then(res => res.mangas.map(m => ({ ...m, id: m.mal_id, description: m.synopsis, type: 'manga' as const, imageUrl: m.imageUrl })))
                         .catch(err => { console.warn("AI Manga search failed:", err); return []; })
                 );
             }
         }

        // Execute searches in parallel if any were queued
        if (searchPromises.length > 0) {
            const searchResultsArrays = await Promise.all(searchPromises);
            searchResultsArrays.forEach(arr => finalResults.push(...arr));
        }

        // Deduplicate results based on type and id
        const uniqueResults = Array.from(new Map(finalResults.map(item => [`${item.type}-${item.id}`, item])).values());
        finalResults = uniqueResults;

        console.log(`[AI Search] Total unique results found: ${finalResults.length}`);

        // 3. Generate Suggestions based on the search performed
        // Generate suggestions even if no results, based on query and analysis
        console.log("[AI Search] Generating search suggestions...");
         try {
             const suggestionInput = {
                 originalQuery: input.searchTerm,
                 aiAnalysis: aiAnalysisResult,
                 filtersApplied: appliedFilters, // Use the filters derived from AI analysis
                 resultsCount: finalResults.length,
                 exampleResults: finalResults.slice(0, 3).map(r => ({ // Provide a few examples
                     title: r.title,
                     type: r.type,
                 })),
             };
            const suggestionResponse = await searchSuggestionPrompt(suggestionInput);
            suggestions = suggestionResponse.output?.suggestions || [];
            console.log("[AI Search] AI Suggestions generated:", suggestions);
         } catch (promptError) {
             console.error("[AI Search] Error getting AI suggestions:", promptError);
             suggestions = []; // Gracefully degrade
         }

        // 4. Return combined results
        return {
            results: finalResults,
            suggestions: suggestions,
            aiAnalysis: aiAnalysisResult,
        };

    } catch (flowError: any) {
        console.error("[AI Search] Error in aiPoweredSearchFlow:", flowError);
        // Return empty results with error analysis if possible
        return {
            results: [],
            suggestions: [],
            aiAnalysis: aiAnalysisResult || `Nami Error: ${flowError.message}`,
        };
    }
  }
);
