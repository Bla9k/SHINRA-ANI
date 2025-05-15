
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
import { Anime, getAnimes, AnimeResponse } from '@/services/anime';
import { Manga, getMangas, MangaResponse } from '@/services/manga';
import { searchCharacterTool } from '@/ai/tools/jikan-tools';
import type { CharacterSearchResult } from '@/services/characters';

const AIPoweredSearchInputSchema = z.object({
  searchTerm: z.string().describe('The natural language search query entered by the user (e.g., "isekai anime with op mc", "find manga with character Guts", "sad romance anime").'),
});
export type AIPoweredSearchInput = z.infer<typeof AIPoweredSearchInputSchema>;

const SearchResultSchema = z.object({
    id: z.number().describe('The MyAnimeList ID of the item.'),
    title: z.string().describe('The title of the anime, manga, or character name.'),
    imageUrl: z.string().nullable().describe('The URL of the cover or character image.'),
    description: z.string().nullable().describe('A short description (synopsis or character details).'),
    type: z.enum(['anime', 'manga', 'character']).describe("Type of the result"),
    genres: z.array(z.object({ mal_id: z.number(), type: z.string(), name: z.string(), url: z.string() })).optional().describe('Genres (for anime/manga).'),
    year: z.number().nullable().optional().describe('Release year (for anime/manga).'),
    score: z.number().nullable().optional().describe('Score (0-10 scale) (for anime/manga).'),
    episodes: z.number().nullable().optional().describe('Number of episodes (for anime).'),
    status: z.string().nullable().optional().describe('Status (for anime/manga).'),
    chapters: z.number().nullable().optional().describe('Number of chapters (for manga).'),
    volumes: z.number().nullable().optional().describe('Number of volumes (for manga).'),
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

export async function aiPoweredSearch(input: AIPoweredSearchInput): Promise<AIPoweredSearchOutput> {
  return aiPoweredSearchFlow(input);
}

const searchQueryAnalysisPrompt = ai.definePrompt({
  name: 'searchQueryAnalysisPrompt',
  input: { schema: AIPoweredSearchInputSchema },
  output: {
    schema: z.object({
        extractedSearchKeywords: z.string().optional().describe('Relevant keywords extracted from the query to use in Jikan\'s "q" parameter (e.g., "isekai op mc", "sad romance"). Keep it concise. If the query is very specific like a full title, use that as keywords.'),
        extractedGenreId: z.string().optional().describe('A SINGLE relevant MAL genre ID extracted or inferred (e.g., "10" for Fantasy, "22" for Romance). Pick the most prominent one. Reference common MAL genre IDs. If a niche genre like "isekai" (62) or "psychological" (40) is mentioned, use its ID.'),
        extractedStatus: z.string().optional().describe('Status extracted (e.g., "finished", "airing", "publishing", "complete", "upcoming"). Standardize to Jikan values like "complete" for finished anime, "finished" for finished manga.'),
        targetType: z.enum(['anime', 'manga', 'character', 'both', 'unknown']).describe("The primary type of content: 'anime', 'manga', 'character' (if looking *for* a character or *about* a character), 'both' (if applicable to either or query is generic like 'best adventure'), or 'unknown'."),
        characterToSearch: z.string().optional().describe('If the query is about finding a character (e.g. "Gojo Satoru") or content *featuring* a character (e.g., "anime with Gojo Satoru"), specify the CHARACTER NAME here. The flow will decide whether to call the character tool or use this to refine anime/manga search.'),
        aiAnalysis: z.string().describe('Brief analysis (1-2 sentences) of the user query and your plan. Mention what parameters you extracted for Jikan/character search. E.g., "User looking for isekai anime. Will search Jikan with genre ID 62." or "User searching for character Guts. Will use character tool."'),
    })
  },
  tools: [searchCharacterTool], // Jikan character search tool
  prompt: `You are Nami AI, an anime/manga search expert for AniManga Stream.
User Query: "{{searchTerm}}"

Analyze the query. Extract parameters for Jikan API or character search.
1.  **Keywords:** Extract concise Jikan 'q' keywords. If it's a title, use the title.
2.  **Genre ID:** If a genre is strongly implied (e.g., "fantasy", "romance", "isekai"), provide its single most relevant MAL genre ID (e.g., Fantasy: "10", Romance: "22", Isekai: "62", Psychological: "40").
3.  **Status:** If status like "finished anime" or "ongoing manga" is mentioned, extract Jikan-compatible status ("complete" for finished anime, "finished" for manga, "airing", "publishing", "upcoming").
4.  **Target Type:** Determine if user wants 'anime', 'manga', 'character', 'both', or 'unknown'. If query is just "Gojo Satoru", target is 'character'. If "anime with Gojo", target is 'anime' and characterToSearch is "Gojo Satoru".
5.  **Character to Search:** If a character is mentioned, specify the character's name.
6.  **AI Analysis:** Briefly explain your plan and parameters.

Example: "sad romance anime" -> { "extractedSearchKeywords": "sad romance", "extractedGenreId": "22", "targetType": "anime", "aiAnalysis": "User wants sad romance anime. Searching Jikan anime with genre 22, keywords 'sad romance'." }
Example: "manga with character Guts" -> { "extractedSearchKeywords": "Berserk Guts", "targetType": "manga", "characterToSearch": "Guts", "aiAnalysis": "User wants manga featuring Guts. Will first search for Guts character, then related manga." }
Example: "Gojo Satoru" -> { "targetType": "character", "characterToSearch": "Gojo Satoru", "aiAnalysis": "User searching for Gojo Satoru. Will use character search tool." }
Example: "best completed isekai series" -> { "extractedSearchKeywords": "best isekai", "extractedGenreId": "62", "extractedStatus": "complete", "targetType": "both", "aiAnalysis": "User wants completed Isekai. Searching Jikan anime (status=complete) and manga (status=finished) with genre 62, keywords 'best isekai'."}

Output ONLY the JSON object.`,
});

const searchSuggestionPrompt = ai.definePrompt({
  name: 'searchSuggestionPrompt',
  input: {
    schema: z.object({
      originalQuery: z.string().describe("The user's original natural language query."),
      aiAnalysis: z.string().optional().describe("Nami's analysis of the original query."),
      filtersApplied: z.object({
          keywords: z.string().optional(), genreId: z.string().optional(), status: z.string().optional(),
          type: z.enum(['anime', 'manga', 'character', 'both', 'unknown']), character: z.string().optional(),
      }).describe('Parameters used for the search based on AI analysis.'),
      resultsCount: z.number().describe('Number of results found.'),
      exampleResultsTitles: z.array(z.string()).optional().describe('A few example titles from the results.'),
    }),
  },
  output: { schema: z.object({ suggestions: z.array(z.string()).max(4).describe('3-4 concise NEW search term suggestions.') }) },
  prompt: `User Query: "{{originalQuery}}"
{{#if aiAnalysis}}Nami's Interpretation: {{aiAnalysis}}{{/if}}
Search Used: Type={{filtersApplied.type}}{{#if filtersApplied.keywords}}, Keywords="{{filtersApplied.keywords}}"{{/if}}{{#if filtersApplied.genreId}}, GenreID="{{filtersApplied.genreId}}"{{/if}}{{#if filtersApplied.status}}, Status="{{filtersApplied.status}}"{{/if}}{{#if filtersApplied.character}}, Character="{{filtersApplied.character}}"{{/if}}
Results Found: {{resultsCount}}
{{#if exampleResultsTitles}}Examples: {{#each exampleResultsTitles}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

Provide 3-4 concise NEW search terms. Think related genres, themes, character roles, alternative phrasings, or correcting misunderstandings. Example: { "suggestions": ["Action fantasy anime", "Manga by Kentaro Miura", "Upcoming Isekai 2024"] }
Return ONLY the JSON object.`,
});


const aiPoweredSearchFlow = ai.defineFlow< typeof AIPoweredSearchInputSchema, typeof AIPoweredSearchOutputSchema >(
  { name: 'aiPoweredSearchFlow', inputSchema: AIPoweredSearchInputSchema, outputSchema: AIPoweredSearchOutputSchema },
  async (input) => {
    let finalResults: SearchResult[] = [];
    let suggestions: string[] = [];
    let aiAnalysisResult: string | undefined;
    let appliedFilters: any = {};

    try {
        console.log("[AI Search] Analyzing query:", input.searchTerm);
        const analysisResponse = await searchQueryAnalysisPrompt(input);
        const analysisOutput = analysisResponse.output;

        if (!analysisOutput) throw new Error("AI query analysis failed.");
        aiAnalysisResult = analysisOutput.aiAnalysis;
        console.log("[AI Search] AI Analysis Output:", analysisOutput);

        const { extractedSearchKeywords, extractedGenreId, extractedStatus, targetType, characterToSearch } = analysisOutput;
        appliedFilters = { keywords: extractedSearchKeywords, genreId: extractedGenreId, status: extractedStatus, type: targetType, character: characterToSearch };

        // Character-focused search strategy
        if (characterToSearch && (targetType === 'character' || (targetType !== 'character' && extractedSearchKeywords?.toLowerCase().includes(characterToSearch.toLowerCase())))) {
            console.log(`[AI Search] Using character search tool for: "${characterToSearch}"`);
            const characterResults: CharacterSearchResult[] = await searchCharacterTool({ name: characterToSearch });
            console.log(`[AI Search] Character tool returned ${characterResults.length} results.`);
            const mappedCharResults = characterResults.map(char => ({
                id: char.mal_id, title: char.name, imageUrl: char.images?.jpg?.image_url ?? null,
                description: char.about ? char.about.split('. ')[0] + '.' : null, type: 'character' as const,
                nicknames: char.nicknames, favorites: char.favorites,
                anime: char.anime?.map(a => ({ mal_id: a.anime.mal_id, title: a.anime.title })) || [],
                manga: char.manga?.map(m => ({ mal_id: m.manga.mal_id, title: m.manga.title })) || [],
            }));
            finalResults.push(...mappedCharResults);

            // If the primary target was ONLY the character, we might stop here or fetch their works.
            // For "anime with character X", we continue to search anime/manga using the character's known works.
            if (targetType !== 'character' && mappedCharResults.length > 0) {
                // Logic to refine anime/manga search based on character's known works can be added.
                // For now, we'll proceed with the general anime/manga search if targetType isn't solely 'character'.
                // This means if user searched "anime with Goku", we show Goku, then search for "Dragon Ball" related anime.
                // The searchQueryAnalysisPrompt should ideally set extractedSearchKeywords to something like "Dragon Ball" in such cases.
            }
        }

        // Anime/Manga Search (runs if not solely character search, or as primary search)
        if (targetType === 'anime' || targetType === 'manga' || targetType === 'both' || targetType === 'unknown') {
             const searchPromises: Promise<any>[] = [];
             const animeStatus = extractedStatus === 'finished' ? 'complete' : extractedStatus; // Jikan uses 'complete' for finished anime
             const mangaStatus = extractedStatus; // Jikan uses 'finished' for finished manga

             if (targetType === 'anime' || targetType === 'both' || targetType === 'unknown') {
                 console.log(`[AI Search] Queueing Jikan anime search: Keywords='${extractedSearchKeywords}', Genre='${extractedGenreId}', Status='${animeStatus}'`);
                 searchPromises.push(
                     getAnimes(extractedGenreId, undefined, undefined, extractedSearchKeywords, animeStatus, 1, 'rank', 10)
                         .then(res => (res.animes || []).map(a => ({ ...a, id: a.mal_id, description: a.synopsis, type: 'anime' as const, imageUrl: a.imageUrl })))
                         .catch(err => { console.warn("AI Anime search failed:", err); return []; })
                 );
             }
             if (targetType === 'manga' || targetType === 'both' || targetType === 'unknown') {
                 console.log(`[AI Search] Queueing Jikan manga search: Keywords='${extractedSearchKeywords}', Genre='${extractedGenreId}', Status='${mangaStatus}'`);
                 searchPromises.push(
                     getMangas(extractedGenreId, mangaStatus, extractedSearchKeywords, undefined, 1, 'rank', 10)
                         .then(res => (res.mangas || []).map(m => ({ ...m, id: m.mal_id, description: m.synopsis, type: 'manga' as const, imageUrl: m.imageUrl })))
                         .catch(err => { console.warn("AI Manga search failed:", err); return []; })
                 );
             }
            if (searchPromises.length > 0) {
                const searchResultsArrays = await Promise.all(searchPromises);
                searchResultsArrays.forEach(arr => finalResults.push(...arr));
            }
        }

        const uniqueResults = Array.from(new Map(finalResults.map((item, index) => [`${item.type}-${item.id}-${index}`, item])).values());
        finalResults = uniqueResults.slice(0, 20); // Limit total results to 20 for popup
        console.log(`[AI Search] Total unique results: ${finalResults.length}`);

        // Generate Suggestions
        console.log("[AI Search] Generating search suggestions...");
         try {
            const suggestionResponse = await searchSuggestionPrompt({
                 originalQuery: input.searchTerm, aiAnalysis: aiAnalysisResult, filtersApplied,
                 resultsCount: finalResults.length,
                 exampleResultsTitles: finalResults.slice(0,3).map(r => r.title),
            });
            suggestions = suggestionResponse.output?.suggestions || [];
            console.log("[AI Search] AI Suggestions:", suggestions);
         } catch (promptError) {
             console.error("[AI Search] Error getting AI suggestions:", promptError);
             suggestions = [];
         }

        return { results: finalResults, suggestions, aiAnalysis: aiAnalysisResult };

    } catch (flowError: any) {
        console.error("[AI Search] Error in aiPoweredSearchFlow:", flowError);
        return { results: [], suggestions: [], aiAnalysis: aiAnalysisResult || `Nami Error: ${flowError.message}` };
    }
  }
);

