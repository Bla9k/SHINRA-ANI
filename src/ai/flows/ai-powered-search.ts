
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
        extractedSearchKeywords: z.string().optional().describe('Relevant keywords extracted from the query to use in Jikan\'s "q" parameter. If the query is about content *featuring* a character (e.g., "anime with Gojo Satoru"), try to use the main series title (e.g., "Jujutsu Kaisen") as keywords if known; otherwise, use the character name and general terms (e.g., "Gojo anime"). For direct title searches (e.g., "Naruto Shippuden"), use the title itself. If the query asks for content *similar to* a known title, extract key genres and themes from that known title to use as keywords.'),
        extractedGenreId: z.string().optional().describe('A SINGLE relevant MAL genre ID extracted or inferred (e.g., "10" for Fantasy, "22" for Romance). Pick the most prominent one. Reference common MAL genre IDs. If a niche genre like "isekai" (62) or "psychological" (40) is mentioned, use its ID. If the query asks for content *similar to* a known title, infer a primary genre ID from that known title.'),
        extractedStatus: z.string().optional().describe('Status extracted (e.g., "finished", "airing", "publishing", "complete", "upcoming"). Standardize to Jikan values like "complete" for finished anime, "finished" for finished manga.'),
        extractedYear: z.number().optional().describe('If a specific year is mentioned (e.g., "anime from 2022"), extract the year as a number.'),
        minScore: z.number().optional().describe('If the query implies high quality (e.g., "best", "top rated", "highly acclaimed"), suggest a minScore like 7.5 or 8.0.'),
        targetType: z.enum(['anime', 'manga', 'character', 'both', 'unknown']).describe("The primary type of content: 'anime', 'manga', 'character' (if looking *for* a character or *about* a character), 'both' (if applicable to either or query is generic like 'best adventure'), or 'unknown'."),
        characterToSearch: z.string().optional().describe('If a character name is mentioned (e.g., "Gojo Satoru", "Guts"), specify the CHARACTER NAME here. This helps identify series for keyword extraction or for direct character searches.'),
        aiAnalysis: z.string().describe('Brief analysis (1-2 sentences) of the user query and your plan. Mention what parameters you extracted for Jikan/character search. E.g., "User looking for isekai anime. Will search Jikan with genre ID 62." or "User searching for character Guts. Will use character tool." or "User wants anime featuring Gojo. Will search Jikan anime with keywords \'Jujutsu Kaisen\' and also show character details for Gojo." If the query was for similar content, mention the original title and the genres/themes inferred.'),
    })
  },
  tools: [searchCharacterTool], // Jikan character search tool
  prompt: `You are Nami AI, an anime/manga search expert for AniManga Stream.
User Query: "{{searchTerm}}"

Analyze the query. Extract parameters for Jikan API or character search.

**Instructions for "Similar To" Queries:**
If the user asks for anime or manga *similar to* a specific title (e.g., "anime like Attack on Titan", "manga similar to Berserk"), follow these steps:
1.  Identify the referenced title.
2.  Based on your knowledge, determine the primary genres and key themes of that title (e.g., Attack on Titan is Fantasy, Shounen, Action, Military, Mystery, Super Power).
3.  Use these inferred genres and themes to populate the \`extractedGenreId\` (pick the most dominant one if possible) and \`extractedSearchKeywords\` fields.
4.  Set the \`targetType\` to 'anime' or 'manga' as specified by the user, or 'both' if not specified.

**General Instructions for All Queries:**
1.  **Keywords**:
    *   Extract concise Jikan 'q' keywords.
    *   If the query is a specific title (e.g., "Naruto Shippuden"), use that title as keywords.
    *   If the query is about content *featuring* a character (e.g., "anime with Gojo Satoru", "manga where Guts appears"), and you know the primary series associated with that character (e.g., "Jujutsu Kaisen" for Gojo, "Berserk" for Guts), use the **SERIES TITLE** as the primary keywords. If the series is unknown, use the character name along with general terms like "anime" or "manga".
    *   **Apply keywords derived from "similar to" analysis.**
2.  **Genre ID**: If a genre is strongly implied (e.g., "fantasy", "romance", "isekai"), provide its single most relevant MAL genre ID (e.g., Fantasy: "10", Romance: "22", Isekai: "62", Psychological: "40"). **Apply genre ID derived from "similar to" analysis.**
3.  **Status**: If a status like "finished anime" or "ongoing manga" is mentioned, extract a Jikan-compatible status string (e.g., "complete" for finished anime, "finished" for finished manga, "airing", "publishing", "upcoming").
4.  **Year**: If a specific year is mentioned (e.g., "anime from 2022"), extract the year as a number.
5.  **Min Score**: If the query implies high quality (e.g., "best", "top rated", "highly acclaimed"), suggest a minScore like 7.5 or 8.0.
6.  **Target Type**: Determine if the user wants 'anime', 'manga', 'character', 'both' (if applicable to either or query is generic like 'best adventure'), or 'unknown'.
    *   If the query is just a character name like "Gojo Satoru", targetType is 'character'.
    *   If "anime with Gojo", targetType is 'anime' and characterToSearch is "Gojo Satoru".
7.  **Character to Search**: If a character's name is mentioned (e.g., "Gojo Satoru", "Guts"), specify the CHARACTER NAME here. This helps identify series for keyword extraction or for direct character searches.
8.  **AI Analysis**: Briefly explain your plan and extracted parameters. E.g., "User looking for isekai anime. Will search Jikan with genre ID 62." or "User searching for character Guts. Will use character tool." or "User wants anime featuring Gojo. Will search Jikan anime with keywords 'Jujutsu Kaisen' and also show character details for Gojo."
    *   **If the query was for similar content, mention the original title and the genres/themes inferred for the search.**

Example: "sad romance anime" -> { "extractedSearchKeywords": "sad romance", "extractedGenreId": "22", "targetType": "anime", "aiAnalysis": "User wants sad romance anime. Searching Jikan anime with genre 22, keywords 'sad romance'." }
Example: "manga with character Guts" -> { "extractedSearchKeywords": "Berserk Guts", "targetType": "manga", "characterToSearch": "Guts", "aiAnalysis": "User wants manga featuring Guts. Will first search for Guts character, then related manga using 'Berserk' as keyword." }
Example: "Gojo Satoru" -> { "targetType": "character", "characterToSearch": "Gojo Satoru", "aiAnalysis": "User searching for Gojo Satoru. Will use character search tool." }
Example: "best completed isekai series" -> { "extractedSearchKeywords": "best isekai", "extractedGenreId": "62", "extractedStatus": "complete", "extractedYear": null, "minScore": 8.0, "targetType": "both", "aiAnalysis": "User wants completed Isekai. Searching Jikan anime (status=complete) and manga (status=finished) with genre 62, keywords 'best isekai', min score 8.0."}
Example: "anime similar to Attack on Titan" -> { "extractedSearchKeywords": "fantasy action military shounen", "extractedGenreId": "10", "targetType": "anime", "aiAnalysis": "User wants anime similar to Attack on Titan. Searching Jikan anime with keywords 'fantasy action military shounen' and genre 10 (Fantasy)."}

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
          year: z.number().optional(), minScore: z.number().optional(),
          type: z.enum(['anime', 'manga', 'character', 'both', 'unknown']), character: z.string().optional(),
      }).describe('Parameters used for the search based on AI analysis.'),
      resultsCount: z.number().describe('Number of results found.'),
      exampleResultsTitles: z.array(z.string()).optional().describe('A few example titles from the results.'),
    }),
  },
  output: { schema: z.object({ suggestions: z.array(z.string()).max(4).describe('3-4 concise NEW search term suggestions.') }) },
  prompt: `User Query: "{{originalQuery}}"
{{#if aiAnalysis}}Nami's Interpretation: {{aiAnalysis}}{{/if}}
Search Used: Type={{filtersApplied.type}}{{#if filtersApplied.keywords}}, Keywords="{{filtersApplied.keywords}}"{{/if}}{{#if filtersApplied.genreId}}, GenreID="{{filtersApplied.genreId}}"{{/if}}{{#if filtersApplied.status}}, Status="{{filtersApplied.status}}"{{/if}}{{#if filtersApplied.year}}, Year={{filtersApplied.year}}{{/if}}{{#if filtersApplied.minScore}}, MinScore={{filtersApplied.minScore}}{{/if}}{{#if filtersApplied.character}}, Character="{{filtersApplied.character}}"{{/if}}
Results Found: {{resultsCount}}
{{#if exampleResultsTitles}}Examples: {{#each exampleResultsTitles}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

Provide 3-4 concise NEW search terms. Think related genres, themes, character roles, alternative phrasings, or correcting misunderstandings. Example: { "suggestions": ["Action fantasy anime", "Manga by Kentaro Miura", "Upcoming Isekai 2024", "Psychological thrillers like Death Note"] }
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

        const { extractedSearchKeywords, extractedGenreId, extractedStatus, extractedYear, minScore, targetType, characterToSearch } = analysisOutput;
        appliedFilters = { keywords: extractedSearchKeywords, genreId: extractedGenreId, status: extractedStatus, year: extractedYear, minScore, type: targetType, character: characterToSearch };

        // Character-focused search strategy
        if (characterToSearch && (targetType === 'character' || (targetType !== 'character' && (extractedSearchKeywords || '').toLowerCase().includes(characterToSearch.toLowerCase())))) {
            console.log(`[AI Search] Using character search tool for: "${characterToSearch}"`);
            const characterToolResults: CharacterSearchResult[] = await searchCharacterTool({ name: characterToSearch });
            console.log(`[AI Search] Character tool returned ${characterToolResults.length} results.`);
            const mappedCharResults = characterToolResults.map(char => ({
                id: char.mal_id, title: char.name, imageUrl: char.images?.jpg?.image_url ?? char.images?.webp?.small_image_url ?? char.images?.webp?.image_url ?? null,
                description: char.about ? (char.about.length > 150 ? char.about.substring(0, 147) + '...' : char.about) : null, type: 'character' as const,
                nicknames: char.nicknames, favorites: char.favorites,
                anime: char.anime?.map(a => ({ mal_id: a.anime.mal_id, title: a.anime.title })) || [],
                manga: char.manga?.map(m => ({ mal_id: m.manga.mal_id, title: m.manga.title })) || [],
            }));
            finalResults.push(...mappedCharResults);
        }

        // Anime/Manga Search (runs if not solely character search, or as primary search)
        if (targetType === 'anime' || targetType === 'manga' || targetType === 'both' || targetType === 'unknown') {
             const searchPromises: Promise<any>[] = [];
             const animeStatus = extractedStatus === 'finished' ? 'complete' : extractedStatus;
             const mangaStatus = extractedStatus; // Jikan manga status 'finished' is fine

             if (targetType === 'anime' || targetType === 'both' || targetType === 'unknown') {
                 console.log(`[AI Search] Queueing Jikan anime search: Keywords='${extractedSearchKeywords}', Genre='${extractedGenreId}', Status='${animeStatus}', Year='${extractedYear}', MinScore='${minScore}'`);
                 searchPromises.push(
                     getAnimes(extractedGenreId, extractedYear, minScore, extractedSearchKeywords, animeStatus, 1, 'rank', 10) // Using Jikan search, limit 10
                         .then(res => (res.animes || []).map(a => ({ ...a, id: a.mal_id, description: a.synopsis, type: 'anime' as const, imageUrl: a.imageUrl, score: a.score, year: a.year, episodes: a.episodes, status: a.status, genres: a.genres })))
                         .catch(err => { console.warn("AI Anime search failed:", err); return []; })
                 );
             }
             if (targetType === 'manga' || targetType === 'both' || targetType === 'unknown') {
                 console.log(`[AI Search] Queueing Jikan manga search: Keywords='${extractedSearchKeywords}', Genre='${extractedGenreId}', Status='${mangaStatus}', Year='${extractedYear}', MinScore='${minScore}'`);
                 searchPromises.push(
                     getMangas(extractedGenreId, mangaStatus, extractedSearchKeywords, minScore, 1, 'rank', 10) // Using Jikan search, limit 10
                         .then(res => (res.mangas || []).map(m => ({ ...m, id: m.mal_id, description: m.synopsis, type: 'manga' as const, imageUrl: m.imageUrl, score: m.score, year: m.year, chapters: m.chapters, volumes: m.volumes, status: m.status, genres: m.genres })))
                         .catch(err => { console.warn("AI Manga search failed:", err); return []; })
                 );
             }
            if (searchPromises.length > 0) {
                const searchResultsArrays = await Promise.all(searchPromises);
                searchResultsArrays.forEach(arr => finalResults.push(...arr));
            }
        }

        const uniqueResults = Array.from(new Map(finalResults.map((item, index) => [`${item.type}-${item.id}-${index}`, item])).values());
        finalResults = uniqueResults.slice(0, 20);
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
