
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a personalized anime/manga homepage
 * based on user browsing habits, fetching actual data from Jikan API.
 *
 * - aiDrivenHomepage - A function that generates a personalized homepage.
 * - AIDrivenHomepageInput - The input type for the aiDrivenHomepage function.
 * - AIDrivenHomepageOutput - The return type for the aiDrivenHomepage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
// Use Jikan-based services
import { Anime, getAnimes, AnimeResponse } from '@/services/anime';
import { Manga, getMangas, MangaResponse } from '@/services/manga';

const AIDrivenHomepageInputSchema = z.object({
  userProfile: z
    .string()
    .describe(
      'A description of the user profile, including their viewing/reading history (titles), favorite genres, and general preferences.'
    ),
  currentMood: z.string().optional().describe('The current mood of the user (e.g., adventurous, relaxed, thoughtful).'),
});
export type AIDrivenHomepageInput = z.infer<typeof AIDrivenHomepageInputSchema>;

// Output schema returns only titles and reasoning. Details are fetched separately.
const AIDrivenHomepageOutputSchema = z.object({
  animeRecommendations: z.array(
       z.string().describe('Title of a recommended anime.')
  ).describe('A list of recommended anime titles.'),
  mangaRecommendations: z.array(
       z.string().describe('Title of a recommended manga.')
  ).describe('A list of recommended manga titles.'),
  reasoning: z.string().describe('A brief reasoning behind the collective recommendations based on the user profile and mood.'),
});
export type AIDrivenHomepageOutput = z.infer<typeof AIDrivenHomepageOutputSchema>;

// Exported wrapper function
export async function aiDrivenHomepage(input: AIDrivenHomepageInput): Promise<AIDrivenHomepageOutput> {
  return aiDrivenHomepageFlow(input);
}

// Prompt definition (remains largely the same, asking for titles)
const prompt = ai.definePrompt({
  name: 'aiDrivenHomepagePrompt',
  input: {
    schema: AIDrivenHomepageInputSchema
  },
  output: {
    schema: AIDrivenHomepageOutputSchema
  },
  prompt: `You are Nami AI, personalizing the homepage for AniManga Stream.

Based on the user's profile and current mood, recommend exactly 4 distinct anime titles and 4 distinct manga titles they are likely to enjoy. Ensure anime and manga titles are different.

User Profile:
{{{userProfile}}}

{{#if currentMood}}Current Mood: {{{currentMood}}}{{/if}}

Analyze their history, favorite genres, and mood. Suggest a diverse mix, potentially including:
- Titles similar to their favorites.
- Titles in preferred genres they might not have seen.
- Perhaps one "wildcard" pick based on mood or a less-obvious connection.

Provide *only* the lists of titles and a brief, engaging reasoning (1-2 sentences) for the overall selection.

Return the recommendations strictly in the specified JSON format.
`,
});

// Flow definition
const aiDrivenHomepageFlow = ai.defineFlow<
  typeof AIDrivenHomepageInputSchema,
  typeof AIDrivenHomepageOutputSchema
>(
  {
    name: 'aiDrivenHomepageFlow',
    inputSchema: AIDrivenHomepageInputSchema,
    outputSchema: AIDrivenHomepageOutputSchema,
  },
  async (input) => {
    try {
      // Call the LLM to get title recommendations and reasoning
      const { output } = await prompt(input);

      if (!output) {
        throw new Error('Failed to get recommendations from AI model.');
      }

      // The flow directly returns the output from the prompt (titles + reasoning).
      // The frontend (page.tsx) will fetch details using Jikan services.
      return {
          animeRecommendations: output.animeRecommendations || [],
          mangaRecommendations: output.mangaRecommendations || [],
          reasoning: output.reasoning || "Here are some recommendations you might like!", // Default reasoning
      };

    } catch (error: any) {
      console.error("Error in aiDrivenHomepageFlow:", error);
      // Provide a fallback or re-throw
      return {
        animeRecommendations: [],
        mangaRecommendations: [],
        reasoning: "Sorry, couldn't generate personalized recommendations right now.",
      };
      // Or: throw new Error("Failed to generate homepage recommendations.");
    }
  }
);
