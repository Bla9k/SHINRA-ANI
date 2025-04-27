
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a personalized anime/manga homepage
 * based on user browsing habits. It leverages Jikan API calls via services for recommendations.
 *
 * - aiDrivenHomepage - A function that generates a personalized homepage with structured recommendations.
 * - AIDrivenHomepageInput - The input type for the aiDrivenHomepage function.
 * - AIDrivenHomepageOutput - The return type for the aiDrivenHomepage function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { Anime, Manga, getAnimes, getMangas } from '@/services'; // Import services
import type { AnimeRecommendationSchema as JikanAnimeSchema, MangaRecommendationSchema as JikanMangaSchema } from '@/ai/flows/shared-schemas'; // Import Jikan-based Zod schemas for type safety

// --- Input / Output Schemas ---
const AIDrivenHomepageInputSchema = z.object({
  userProfile: z
    .string()
    .describe(
      'A description of the user profile, including their viewing/reading history (titles), favorite genres, and general preferences.'
    ),
  currentMood: z.string().optional().describe('The current mood of the user (e.g., adventurous, relaxed, thoughtful).'),
  // Add more user context if available (e.g., recent searches, ratings)
  recentActivity: z.array(z.string()).optional().describe('Titles of recently watched/read items.'),
});
export type AIDrivenHomepageInput = z.infer<typeof AIDrivenHomepageInputSchema>;

// Output schema uses Jikan service types
const AIDrivenHomepageOutputSchema = z.object({
    // Use the actual types from services, mapped later if needed
    trendingAnime: z.array(z.custom<Anime>()).describe('List of currently trending anime from Jikan.'),
    trendingManga: z.array(z.custom<Manga>()).describe('List of currently trending manga from Jikan.'),
    popularAnime: z.array(z.custom<Anime>()).describe('List of popular anime based on score/favorites from Jikan.'),
    popularManga: z.array(z.custom<Manga>()).describe('List of popular manga based on score/favorites from Jikan.'),
    personalizedAnime: z.array(z.custom<Anime>()).describe('AI-personalized anime recommendations based on profile/mood.'),
    personalizedManga: z.array(z.custom<Manga>()).describe('AI-personalized manga recommendations based on profile/mood.'),
    reasoning: z.string().describe('A brief reasoning behind the personalized recommendations based on the user profile and mood.'),
});
export type AIDrivenHomepageOutput = z.infer<typeof AIDrivenHomepageOutputSchema>;


// --- Helper function to map Jikan types to schema types if necessary (though direct use is often fine) ---
// Example: If output schema needed stricter adherence to the Zod schema
/*
const mapAnimeToSchema = (anime: Anime): z.infer<typeof JikanAnimeSchema> => ({
    mal_id: anime.mal_id,
    title: anime.title,
    genres: anime.genres,
    year: anime.year,
    score: anime.score,
    synopsis: anime.synopsis,
    images: anime.images,
    status: anime.status,
    episodes: anime.episodes,
    url: anime.url,
    trailer: anime.trailer,
    type: 'anime',
});

const mapMangaToSchema = (manga: Manga): z.infer<typeof JikanMangaSchema> => ({
    mal_id: manga.mal_id,
    title: manga.title,
    genres: manga.genres,
    status: manga.status,
    synopsis: manga.synopsis,
    images: manga.images,
    score: manga.score,
    chapters: manga.chapters,
    volumes: manga.volumes,
    year: manga.year,
    url: manga.url,
    type: 'manga',
});
*/


// --- Exported Wrapper Function ---
export async function aiDrivenHomepage(input: AIDrivenHomepageInput): Promise<AIDrivenHomepageOutput> {
  return aiDrivenHomepageFlow(input);
}


// --- Personalized Recommendation Prompt ---
// This prompt focuses SOLELY on *analyzing* the user profile and *suggesting* criteria (like genres, keywords)
// for fetching personalized recommendations from Jikan. It does NOT generate fake data anymore.
const personalizationAnalysisPrompt = ai.definePrompt({
  name: 'personalizationAnalysisPrompt',
  input: {
    schema: AIDrivenHomepageInputSchema // Takes user profile/mood/activity
  },
  output: {
    // Outputs criteria for Jikan search
    schema: z.object({
        recommendedAnimeGenres: z.array(z.string()).describe("List of 1-2 anime genre IDs (numbers as strings) strongly indicated by the user profile/mood."),
        recommendedMangaGenres: z.array(z.string()).describe("List of 1-2 manga genre IDs (numbers as strings) strongly indicated by the user profile/mood."),
        potentialKeywords: z.array(z.string()).optional().describe("1-2 potential keywords (e.g., 'magic school', 'post-apocalyptic') based on preferences for Jikan search."),
        reasoning: z.string().describe("Brief reasoning for the personalized suggestions.")
    })
  },
  prompt: `You are Nami AI, analyzing user preferences for AniManga Stream to suggest personalized anime/manga criteria.

User Profile:
{{{userProfile}}}

{{#if currentMood}}Current Mood: {{{currentMood}}}{{/if}}
{{#if recentActivity}}Recent Activity: {{#each recentActivity}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

Analyze the user's history, favorite genres, mood, and recent activity.
Based on this, suggest:
1.  1-2 specific ANIME genre IDs (as strings) that align strongly with their tastes and mood.
2.  1-2 specific MANGA genre IDs (as strings) that align strongly with their tastes and mood.
3.  Optionally, 1-2 relevant KEYWORDS (lowercase) that could be used in a Jikan search (e.g., "samurai", "vampire", "space opera").
4.  A brief reasoning for your suggestions (1-2 sentences).

Focus on identifying criteria for fetching *real* data. Do not invent titles or full details. Use common MAL genre IDs if possible (e.g., Action: "1", Fantasy: "10", Romance: "22", Sci-Fi: "24", Slice of Life: "36").

Return ONLY the JSON object matching the output schema.
`,
});

// --- Flow Definition ---
const aiDrivenHomepageFlow = ai.defineFlow<
  typeof AIDrivenHomepageInputSchema,
  typeof AIDrivenHomepageOutputSchema
>(
  {
    name: 'aiDrivenHomepageFlow',
    inputSchema: AIDrivenHomepageInputSchema,
    outputSchema: AIDrivenHomepageOutputSchema, // Outputs structured data using Jikan types
  },
  async (input) => {
    let personalizedAnime: Anime[] = [];
    let personalizedManga: Manga[] = [];
    let reasoning = "Here are some recommendations you might like!"; // Default reasoning

    try {
      // 1. Fetch standard sections (Trending, Popular) concurrently using Jikan services
      console.log("Fetching standard homepage sections (Trending, Popular)...");
      const [
        trendingAnimeResponse,
        trendingMangaResponse,
        popularAnimeResponse, // Popular by score/favorites
        popularMangaResponse, // Popular by score/favorites
      ] = await Promise.all([
        getAnimes(undefined, undefined, undefined, undefined, undefined, 1, 'popularity', 6), // Trending Anime (Popularity)
        getMangas(undefined, undefined, undefined, undefined, 1, 'popularity', 6), // Trending Manga (Popularity)
        getAnimes(undefined, undefined, undefined, undefined, undefined, 1, 'score', 6), // Popular Anime (Score) - Limited to 6
        getMangas(undefined, undefined, undefined, undefined, 1, 'score', 6), // Popular Manga (Score) - Limited to 6
      ]);

      // 2. Analyze user profile for personalized criteria using LLM
      console.log("Analyzing user profile for personalized criteria...");
      const analysisResult = await personalizationAnalysisPrompt(input);
       const analysisOutput = analysisResult.output;

      if (analysisOutput?.reasoning) {
          reasoning = analysisOutput.reasoning;
      } else {
          console.warn("AI analysis did not provide reasoning.");
      }

      // 3. Fetch personalized recommendations based on AI analysis (concurrently)
      const personalizedFetchPromises: Promise<any>[] = [];
      const maxPersonalized = 3; // Max 3 personalized items per type

      if (analysisOutput?.recommendedAnimeGenres?.length > 0 || analysisOutput?.potentialKeywords?.length > 0) {
           const animeKeywords = analysisOutput.potentialKeywords?.join(' ') || undefined;
           const animeGenre = analysisOutput.recommendedAnimeGenres?.[0]; // Use the first recommended genre ID
           console.log(`Fetching personalized anime: Genre=${animeGenre}, Keywords=${animeKeywords}`);
           personalizedFetchPromises.push(
                getAnimes(animeGenre, undefined, undefined, animeKeywords, undefined, 1, 'popularity', maxPersonalized) // Fetch based on AI criteria
                    .then(res => res.animes)
                    .catch(err => { console.error("Failed fetching personalized anime:", err); return []; })
           );
      } else {
           personalizedFetchPromises.push(Promise.resolve([])); // Add empty promise if no criteria
      }

      if (analysisOutput?.recommendedMangaGenres?.length > 0 || analysisOutput?.potentialKeywords?.length > 0) {
          const mangaKeywords = analysisOutput.potentialKeywords?.join(' ') || undefined;
          const mangaGenre = analysisOutput.recommendedMangaGenres?.[0]; // Use the first recommended genre ID
          console.log(`Fetching personalized manga: Genre=${mangaGenre}, Keywords=${mangaKeywords}`);
          personalizedFetchPromises.push(
              getMangas(mangaGenre, undefined, mangaKeywords, undefined, 1, 'popularity', maxPersonalized) // Fetch based on AI criteria
                  .then(res => res.mangas)
                  .catch(err => { console.error("Failed fetching personalized manga:", err); return []; })
          );
       } else {
            personalizedFetchPromises.push(Promise.resolve([])); // Add empty promise if no criteria
       }

        const [fetchedPersonalizedAnime, fetchedPersonalizedManga] = await Promise.all(personalizedFetchPromises);
        personalizedAnime = fetchedPersonalizedAnime;
        personalizedManga = fetchedPersonalizedManga;

        console.log(`Fetched ${personalizedAnime.length} personalized anime, ${personalizedManga.length} personalized manga.`);


      // 4. Combine all results into the final output structure
      // Note: The types Anime/Manga from services are directly used. Mapping can be added if strict Zod adherence is needed.
      return {
        trendingAnime: trendingAnimeResponse.animes || [],
        trendingManga: trendingMangaResponse.mangas || [],
        popularAnime: popularAnimeResponse.animes || [],
        popularManga: popularMangaResponse.mangas || [],
        personalizedAnime: personalizedAnime || [],
        personalizedManga: personalizedManga || [],
        reasoning: reasoning,
      };

    } catch (error: any) {
      console.error("Error in aiDrivenHomepageFlow:", error);
      // Provide a fallback with empty lists
      return {
        trendingAnime: [],
        trendingManga: [],
        popularAnime: [],
        popularManga: [],
        personalizedAnime: [],
        personalizedManga: [],
        reasoning: "Sorry, couldn't generate the homepage right now.",
      };
    }
  }
);
