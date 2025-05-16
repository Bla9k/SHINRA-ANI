
'use server';

/**
 * @fileOverview AI-Powered Search flow for providing smarter, context-based anime and manga suggestions.
 * This flow now includes a tool to search for characters via the Jikan API and improved natural language processing.
 *
 * - aiPoweredSearch - A function that handles the AI-powered search process.
 * - AIPoweredSearchInput - The input type for the aiPoweredSearchInput function.
 * - AIPoweredSearchOutput - The return type for the aiPoweredSearchInput function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { Anime, getAnimes, AnimeResponse, getAnimeDetails, getSeasonAnime } from '@/services/anime'; // Added getAnimeDetails & getSeasonAnime
import { Manga, getMangas, MangaResponse, getMangaDetails } from '@/services/manga'; // Added getMangaDetails
import { searchCharacterTool } from '@/ai/tools/jikan-tools';
import type { CharacterSearchResult } from '@/services/characters';

const AIPoweredSearchInputSchema = z.object({
  searchTerm: z.string().describe('The natural language search query entered by the user (e.g., "isekai anime with op mc", "find manga with character Guts", "sad romance anime", "anime like Attack on Titan", "short action series", "this season\'s popular anime", "manga version of One Punch Man anime").'),
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
  results: z.array(SearchResultSchema).describe('A list of search results (anime, manga, or characters) from Jikan or seasonal data.'),
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
        minScore: z.number().min(0).max(10).optional().describe('If the query implies high quality (e.g., "best", "top rated", "score above 8.5", "highly acclaimed"), suggest a minScore like 7.5 or 8.0. If a range like "score 7-8" is mentioned, use the lower bound as minScore (7).'),
        exactScore: z.number().min(0).max(10).optional().describe("If the user specifies an exact score (e.g., 'anime with score 8.2'), extract it here."),
        sortOrder: z.enum(['asc', 'desc']).optional().describe("The sort order, if specifically implied (e.g., 'asc' for shortest first). Default is typically 'desc' for scores/popularity."),
        sortByField: z.enum(['episodes', 'chapters', 'score', 'popularity', 'rank', 'title', 'start_date', 'favorites', 'volumes']).optional().describe("Field to sort by, if implied (e.g., 'episodes' for 'shortest anime')."),
        maxEpisodes: z.number().int().positive().optional().describe("If 'short anime' is requested, suggest a max episode count (e.g., 13 or 26). Also consider keywords like 'short series'."),
        maxChapters: z.number().int().positive().optional().describe("If 'short manga' is requested, suggest a max chapter count (e.g., 50 or 100). Also consider keywords like 'short story'."),
        season: z.enum(['winter', 'spring', 'summer', 'fall']).optional().describe("If a specific season (e.g., 'spring 2023 anime', 'this season's anime') is requested, extract the season name."),
        seasonYear: z.number().int().optional().describe("If a specific season (e.g., 'spring 2023 anime', 'this season') is requested, extract the year."),
        referenceTitle: z.string().optional().describe("If asking for content 'similar to X' or 'like X', specify X's title here. The flow will then fetch X's details to find similar content."),
        adaptationQueryTitle: z.string().optional().describe("If asking for an anime/manga version of a given title (e.g., 'manga for Attack on Titan anime'), specify the GIVEN title here."),
        adaptationQueryType: z.enum(['anime', 'manga']).optional().describe("The type of the GIVEN title in an adaptation query (e.g., if asking 'manga for Attack on Titan anime', this is 'anime')."),
        genreBreakdownQueryTitle: z.string().optional().describe("If asking 'what genres is X', specify X's title here."),
        targetType: z.enum(['anime', 'manga', 'character', 'both', 'unknown']).describe("The primary type of content the user is looking for: 'anime', 'manga', 'character', 'both' (if query is generic like 'best adventure series'), or 'unknown'."),
        characterToSearch: z.string().optional().describe('If a character name is specifically mentioned as the primary subject of the search (e.g., "Gojo Satoru", "details on Guts"), specify the CHARACTER NAME here. If the query is "anime with Gojo", then targetType should be "anime" and characterToSearch can still be "Gojo Satoru" for potential cross-referencing or to enrich the search if the main series isn\'t immediately identified by keywords.'),
        aiAnalysis: z.string().describe('Brief analysis (1-2 sentences) of the user query and your plan. Mention what parameters you extracted for Jikan/character search. E.g., "User looking for isekai anime. Will search Jikan with genre ID 62." or "User seeking manga similar to Berserk. Will first fetch Berserk details, then search manga using its genres."'),
    })
  },
  tools: [searchCharacterTool],
  prompt: `You are Nami AI, an anime/manga search expert for Shinra-Ani.
User Query: "{{searchTerm}}"

Analyze the query meticulously. Extract parameters for Jikan API, character search, or direct information retrieval.

**Query Types & Parameter Extraction Guidelines:**

1.  **Keywords**:
    *   Extract concise Jikan 'q' keywords.
    *   For thematic requests (e.g., "strong female lead", "dark fantasy"), translate these themes into relevant search keywords.
    *   If about content *featuring* a character (e.g., "anime with Gojo"), use the **SERIES TITLE** (e.g., "Jujutsu Kaisen") as primary keywords if known; otherwise, use character name + general terms (e.g., "Gojo anime").
2.  **Genre ID**: If a genre is strongly implied (e.g., "fantasy", "romance", "isekai"), provide its single most relevant MAL genre ID (e.g., Fantasy: "10", Romance: "22", Isekai: "62", Psychological: "40").
3.  **Status**: If a status like "finished anime" or "ongoing manga" is mentioned, extract a Jikan-compatible status string (e.g., "complete" for finished anime, "finished" for finished manga, "airing", "publishing", "upcoming").
4.  **Year**: If a specific year is mentioned (e.g., "anime from 2022"), extract the year.
5.  **Score**:
    *   minScore: If "score above 8.5", "best", "top rated", "highly acclaimed" is mentioned, set minScore (e.g., 8.0 or 8.5). If a range like "score 7-8" is given, set minScore to the lower bound (7).
    *   exactScore: If "score 8.2" is mentioned, set exactScore to 8.2.
6.  **Target Type**: 'anime', 'manga', 'character', 'both', or 'unknown'.
    *   If just a character name (e.g., "Gojo Satoru"), targetType is 'character', characterToSearch is "Gojo Satoru".
    *   If "anime with Gojo", targetType is 'anime', characterToSearch is "Gojo Satoru", extractedSearchKeywords should be "Jujutsu Kaisen" if known.
7.  **Character to Search**: If a character's name is mentioned, specify it in characterToSearch.
8.  **Short Content**:
    *   If "short anime" or "quick watch anime": suggest sortByField: 'episodes', sortOrder: 'asc', and optionally maxEpisodes: 13 (or 26 for 2-cour). Add "short" to keywords.
    *   If "short manga": suggest sortByField: 'chapters', sortOrder: 'asc', and optionally maxChapters: 50 (or 100). Add "short" to keywords.
9.  **Seasonal Trends**:
    *   If "this season's popular anime": Determine current year and season. Set seasonYear and season (winter, spring, summer, fall). Set sortByField: 'popularity'. targetType is 'anime'.
    *   If "spring 2023 anime": seasonYear: 2023, season: 'spring'. targetType is 'anime'.
10. **Similarity ("like X")**:
    *   If "anime like Attack on Titan": referenceTitle: "Attack on Titan", targetType: 'anime'.
    *   Your aiAnalysis should state you will first fetch "Attack on Titan", then search using its genres/themes. Do NOT try to guess genres for "Attack on Titan" yourself in the output fields here; the flow will do that.
11. **Adaptation Query**:
    *   If "manga version of One Punch Man anime": adaptationQueryTitle: "One Punch Man", adaptationQueryType: 'anime'. Target type becomes 'manga'.
    *   If "anime for Berserk manga": adaptationQueryTitle: "Berserk", adaptationQueryType: 'manga'. Target type becomes 'anime'.
12. **Genre Breakdown**:
    *   If "what genres is 86": genreBreakdownQueryTitle: "86". targetType can be 'anime' or 'manga' (or 'both' if not specified by user). aiAnalysis will state you'll provide the genre list.
13. **Sort By/Order**: If query implies sorting (e.g., "newest isekai", "shortest action anime"), set sortByField and sortOrder.

**AI Analysis**: Your brief analysis (1-2 sentences) is crucial. Explain your plan and parameters. E.g., "User looking for short, high-score action anime. Will search Jikan anime with genre Action, minScore 8.0, sorted by episodes ascending." or "User wants manga similar to Berserk. Will first fetch Berserk details, then search manga using its genres."

Output ONLY the JSON object.`,
});

// (Keep existing searchSuggestionPrompt, can be refined later)
const searchSuggestionPrompt = ai.definePrompt({
  name: 'searchSuggestionPrompt',
  input: {
    schema: z.object({
      originalQuery: z.string().describe("The user's original natural language query."),
      aiAnalysis: z.string().optional().describe("Nami's analysis of the original query."),
      filtersApplied: z.object({
          keywords: z.string().optional(), genreId: z.string().optional(), status: z.string().optional(),
          year: z.number().optional(), minScore: z.number().optional(),
          type: z.enum(['anime', 'manga', 'character', 'both', 'unknown', 'seasonal', 'adaptation', 'genre_breakdown']), // Added new types
          character: z.string().optional(),
          season: z.string().optional(), seasonYear: z.number().optional(),
          referenceTitle: z.string().optional(), adaptationQueryTitle: z.string().optional(),
          genreBreakdownQueryTitle: z.string().optional(),
          maxEpisodes: z.number().optional(), maxChapters: z.number().optional(),
          sortByField: z.string().optional(), sortOrder: z.string().optional(),
      }).describe('Parameters used for the search based on AI analysis.'),
      resultsCount: z.number().describe('Number of results found.'),
      exampleResultsTitles: z.array(z.string()).optional().describe('A few example titles from the results.'),
    }),
  },
  output: { schema: z.object({ suggestions: z.array(z.string()).max(4).describe('3-4 concise NEW search term suggestions.') }) },
  prompt: `User Query: "{{originalQuery}}"
{{#if aiAnalysis}}Nami's Interpretation: {{aiAnalysis}}{{/if}}
Search Used: Type={{filtersApplied.type}}{{#if filtersApplied.keywords}}, Keywords="{{filtersApplied.keywords}}"{{/if}}{{#if filtersApplied.genreId}}, GenreID="{{filtersApplied.genreId}}"{{/if}}{{#if filtersApplied.status}}, Status="{{filtersApplied.status}}"{{/if}}{{#if filtersApplied.year}}, Year={{filtersApplied.year}}{{/if}}{{#if filtersApplied.minScore}}, MinScore={{filtersApplied.minScore}}{{/if}}{{#if filtersApplied.character}}, Character="{{filtersApplied.character}}"{{/if}}{{#if filtersApplied.season}}, Season="{{filtersApplied.season}}" {{filtersApplied.seasonYear}}{{/if}}
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
    let appliedFiltersForSuggestion: any = {}; // For the suggestion prompt

    try {
        console.log("[AI Search] Analyzing query:", input.searchTerm);
        const analysisResponse = await searchQueryAnalysisPrompt(input);
        const analysisOutput = analysisResponse.output;

        if (!analysisOutput) throw new Error("AI query analysis failed.");
        aiAnalysisResult = analysisOutput.aiAnalysis;
        console.log("[AI Search] AI Analysis Output:", analysisOutput);

        const {
            extractedSearchKeywords, extractedGenreId, extractedStatus, extractedYear,
            minScore, exactScore, sortOrder, sortByField,
            maxEpisodes, maxChapters, season, seasonYear,
            referenceTitle, adaptationQueryTitle, adaptationQueryType, genreBreakdownQueryTitle,
            targetType, characterToSearch
        } = analysisOutput;

        appliedFiltersForSuggestion = { ...analysisOutput, type: targetType }; // Capture all for suggestion prompt

        let effectiveMinScore = minScore;
        if (exactScore) {
            effectiveMinScore = Math.max(exactScore - 0.2, 0); // Jikan usually needs min_score
        }

        // Character-focused search (if specifically requested or part of a broader query)
        if (characterToSearch && (targetType === 'character' || (targetType !== 'character' && (extractedSearchKeywords || '').toLowerCase().includes(characterToSearch.toLowerCase())))) {
            console.log(`[AI Search] Using character search tool for: "${characterToSearch}"`);
            const characterToolResults: CharacterSearchResult[] = await searchCharacterTool({ name: characterToSearch });
            const mappedCharResults = characterToolResults.map(char => ({
                id: char.mal_id, title: char.name, imageUrl: char.images?.jpg?.image_url ?? char.images?.webp?.small_image_url ?? char.images?.webp?.image_url ?? null,
                description: char.about ? (char.about.length > 150 ? char.about.substring(0, 147) + '...' : char.about) : null, type: 'character' as const,
                nicknames: char.nicknames, favorites: char.favorites,
                anime: char.anime?.map(a => ({ mal_id: a.anime.mal_id, title: a.anime.title })) || [],
                manga: char.manga?.map(m => ({ mal_id: m.manga.mal_id, title: m.manga.title })) || [],
            }));
            finalResults.push(...mappedCharResults);
        }

        // Seasonal Anime Search
        if (season && seasonYear && (targetType === 'anime' || targetType === 'both')) {
            console.log(`[AI Search] Fetching seasonal anime for ${season} ${seasonYear}`);
            const seasonalResponse = await getSeasonAnime(seasonYear, season, 1, 20); // Fetch up to 20
            const seasonalAnime = (seasonalResponse.animes || []).map(a => ({ ...a, id: a.mal_id, description: a.synopsis, type: 'anime' as const, imageUrl: a.imageUrl, score: a.score, year: a.year, episodes: a.episodes, status: a.status, genres: a.genres }));
            finalResults.push(...seasonalAnime);
        }
        // Similarity Search
        else if (referenceTitle && (targetType === 'anime' || targetType === 'manga' || targetType === 'both')) {
            console.log(`[AI Search] Similarity search based on: "${referenceTitle}"`);
            let refItemDetails: Anime | Manga | null = null;
            if (targetType === 'anime' || targetType === 'both') {
                const refAnimes = await getAnimes(undefined, undefined, undefined, referenceTitle, undefined, 1, 'rank', 1);
                if (refAnimes.animes.length > 0) refItemDetails = refAnimes.animes[0];
            }
            if (!refItemDetails && (targetType === 'manga' || targetType === 'both')) {
                const refMangas = await getMangas(undefined, undefined, referenceTitle, undefined, 1, 'rank', 1);
                if (refMangas.mangas.length > 0) refItemDetails = refMangas.mangas[0];
            }

            if (refItemDetails) {
                const similarGenres = refItemDetails.genres.map(g => g.mal_id.toString()).join(',');
                // Construct keywords from themes/synopsis - simple split for now
                const similarKeywords = refItemDetails.synopsis?.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0,5).join(' ') || undefined;

                if (targetType === 'anime' || targetType === 'both') {
                    const similarAnimes = await getAnimes(similarGenres, undefined, effectiveMinScore, similarKeywords || extractedSearchKeywords, extractedStatus, 1, sortByField || 'score', 10, sortOrder);
                    finalResults.push(...(similarAnimes.animes || []).map(a => ({ ...a, id: a.mal_id, description: a.synopsis, type: 'anime' as const, imageUrl: a.imageUrl, score: a.score, year: a.year, episodes: a.episodes, status: a.status, genres: a.genres })));
                }
                if (targetType === 'manga' || targetType === 'both') {
                     const similarMangas = await getMangas(similarGenres, extractedStatus, similarKeywords || extractedSearchKeywords, effectiveMinScore, 1, sortByField || 'score', 10, sortOrder);
                     finalResults.push(...(similarMangas.mangas || []).map(m => ({ ...m, id: m.mal_id, description: m.synopsis, type: 'manga' as const, imageUrl: m.imageUrl, score: m.score, year: m.year, chapters: m.chapters, volumes: m.volumes, status: m.status, genres: m.genres })));
                }
            }
        }
        // Adaptation Query
        else if (adaptationQueryTitle && adaptationQueryType) {
            console.log(`[AI Search] Adaptation query for: "${adaptationQueryTitle}" (type: ${adaptationQueryType})`);
            let sourceItem: Anime | Manga | null = null;
            if (adaptationQueryType === 'anime') {
                sourceItem = await getAnimeDetails(0, adaptationQueryTitle); // Assuming getAnimeDetails can search by title if ID is 0
            } else {
                sourceItem = await getMangaDetails(0, adaptationQueryTitle); // Assuming getMangaDetails can search by title
            }

            if (sourceItem && (sourceItem as any).relations) {
                const relations = (sourceItem as any).relations as Array<{ relation: string, entry: Array<{ mal_id: number, type: string, name: string, url: string }> }>;
                const adaptationRelation = relations.find(r => r.relation.toLowerCase().includes('adaptation'));
                if (adaptationRelation) {
                    for (const entry of adaptationRelation.entry) {
                        if (entry.type !== adaptationQueryType) { // Looking for the *other* type
                            let adaptedItem: SearchResult | null = null;
                            if (entry.type === 'anime') {
                                const animeDetail = await getAnimeDetails(entry.mal_id);
                                if (animeDetail) adaptedItem = { ...animeDetail, id: animeDetail.mal_id, description: animeDetail.synopsis, type: 'anime', imageUrl: animeDetail.imageUrl, score: animeDetail.score, year: animeDetail.year, episodes: animeDetail.episodes, status: animeDetail.status, genres: animeDetail.genres };
                            } else if (entry.type === 'manga') {
                                const mangaDetail = await getMangaDetails(entry.mal_id);
                                if (mangaDetail) adaptedItem = { ...mangaDetail, id: mangaDetail.mal_id, description: mangaDetail.synopsis, type: 'manga', imageUrl: mangaDetail.imageUrl, score: mangaDetail.score, year: mangaDetail.year, chapters: mangaDetail.chapters, volumes: mangaDetail.volumes, status: mangaDetail.status, genres: mangaDetail.genres };
                            }
                            if (adaptedItem) finalResults.push(adaptedItem);
                        }
                    }
                } else {
                    aiAnalysisResult += " No direct adaptation relation found in MAL data.";
                }
            }
        }
        // Genre Breakdown Query
        else if (genreBreakdownQueryTitle) {
             console.log(`[AI Search] Genre breakdown for: "${genreBreakdownQueryTitle}"`);
             let itemDetails: Anime | Manga | null = null;
             if (targetType === 'anime' || targetType === 'both' || targetType === 'unknown') {
                 itemDetails = await getAnimeDetails(0, genreBreakdownQueryTitle);
             }
             if (!itemDetails && (targetType === 'manga' || targetType === 'both' || targetType === 'unknown')) {
                 itemDetails = await getMangaDetails(0, genreBreakdownQueryTitle);
             }
             if (itemDetails) {
                 aiAnalysisResult = `${genreBreakdownQueryTitle} (${itemDetails.type}) Genres: ${itemDetails.genres.map(g => g.name).join(', ')}. ${itemDetails.synopsis?.substring(0,100)}...`;
                 finalResults.push({ ...itemDetails, id: itemDetails.mal_id, description: itemDetails.synopsis, type: itemDetails.type as 'anime' | 'manga', imageUrl: itemDetails.imageUrl, score: itemDetails.score, year: itemDetails.year, episodes: (itemDetails as Anime).episodes, chapters: (itemDetails as Manga).chapters, volumes: (itemDetails as Manga).volumes, status: itemDetails.status, genres: itemDetails.genres });
             } else {
                 aiAnalysisResult = `Could not find details for "${genreBreakdownQueryTitle}" to provide a genre breakdown.`;
             }
        }
        // Standard Search (if not handled by specific queries above)
        else if (targetType !== 'character' && targetType !== 'seasonal') { // Avoid re-searching if character/seasonal already handled
             const searchPromises: Promise<any>[] = [];
             const animeStatus = extractedStatus === 'finished' ? 'complete' : extractedStatus;
             const mangaStatus = extractedStatus;

             if (targetType === 'anime' || targetType === 'both' || targetType === 'unknown') {
                 searchPromises.push(
                     getAnimes(extractedGenreId, extractedYear, effectiveMinScore, extractedSearchKeywords, animeStatus, 1, sortByField || 'rank', 10, sortOrder)
                         .then(res => (res.animes || []).map(a => ({ ...a, id: a.mal_id, description: a.synopsis, type: 'anime' as const, imageUrl: a.imageUrl, score: a.score, year: a.year, episodes: a.episodes, status: a.status, genres: a.genres })))
                         .catch(err => { console.warn("AI Standard Anime search failed:", err); return []; })
                 );
             }
             if (targetType === 'manga' || targetType === 'both' || targetType === 'unknown') {
                 searchPromises.push(
                     getMangas(extractedGenreId, mangaStatus, extractedSearchKeywords, effectiveMinScore, 1, sortByField || 'rank', 10, sortOrder)
                         .then(res => (res.mangas || []).map(m => ({ ...m, id: m.mal_id, description: m.synopsis, type: 'manga' as const, imageUrl: m.imageUrl, score: m.score, year: m.year, chapters: m.chapters, volumes: m.volumes, status: m.status, genres: m.genres })))
                         .catch(err => { console.warn("AI Standard Manga search failed:", err); return []; })
                 );
             }
            if (searchPromises.length > 0) {
                const searchResultsArrays = await Promise.all(searchPromises);
                searchResultsArrays.forEach(arr => finalResults.push(...arr));
            }
        }

        // Filter by maxEpisodes/maxChapters if applicable
        if (maxEpisodes && (targetType === 'anime' || targetType === 'both')) {
            finalResults = finalResults.filter(r => r.type !== 'anime' || (r.episodes != null && r.episodes <= maxEpisodes));
        }
        if (maxChapters && (targetType === 'manga' || targetType === 'both')) {
            finalResults = finalResults.filter(r => r.type !== 'manga' || (r.chapters != null && r.chapters <= maxChapters));
        }
        if (exactScore) { // Stricter filter for exact score
            finalResults = finalResults.filter(r => r.score && Math.abs(r.score - exactScore) < 0.15);
        }


        const uniqueResults = Array.from(new Map(finalResults.map((item, index) => [`${item.type}-${item.id}-${index}`, item])).values());
        finalResults = uniqueResults.slice(0, 20); // Global limit
        console.log(`[AI Search] Total unique results after all processing: ${finalResults.length}`);

        // Generate Suggestions
        console.log("[AI Search] Generating search suggestions...");
         try {
            const suggestionResponse = await searchSuggestionPrompt({
                 originalQuery: input.searchTerm, aiAnalysis: aiAnalysisResult, filtersApplied: appliedFiltersForSuggestion,
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

// Helper to get current season (client-side, but flow runs on server)
// This is a simplification; robust season detection might need a library or more complex date logic.
function getCurrentSeasonInfo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    let season: 'winter' | 'spring' | 'summer' | 'fall';
    if (month < 3) season = 'winter'; // Jan, Feb, Mar (Winter starts in Dec of prev year often, but Jikan uses Jan-Mar)
    else if (month < 6) season = 'spring'; // Apr, May, Jun
    else if (month < 9) season = 'summer'; // Jul, Aug, Sep
    else season = 'fall'; // Oct, Nov, Dec
    return { year, season };
}

    

