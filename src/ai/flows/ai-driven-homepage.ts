
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a personalized anime/manga homepage
 * based on user browsing habits. The flow now returns structured data directly to avoid extra API calls.
 *
 * - aiDrivenHomepage - A function that generates a personalized homepage with structured recommendations.
 * - AIDrivenHomepageInput - The input type for the aiDrivenHomepage function.
 * - AIDrivenHomepageOutput - The return type for the aiDrivenHomepage function (now includes structured data).
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
// Import Jikan-based schemas for output structure guidance
import { AnimeRecommendationSchema, MangaRecommendationSchema } from '@/ai/flows/shared-schemas';


const AIDrivenHomepageInputSchema = z.object({
  userProfile: z
    .string()
    .describe(
      'A description of the user profile, including their viewing/reading history (titles), favorite genres, and general preferences.'
    ),
  currentMood: z.string().optional().describe('The current mood of the user (e.g., adventurous, relaxed, thoughtful).'),
});
export type AIDrivenHomepageInput = z.infer<typeof AIDrivenHomepageInputSchema>;

// Output schema returns structured recommendations and reasoning.
const AIDrivenHomepageOutputSchema = z.object({
    animeRecommendations: z.array(AnimeRecommendationSchema).describe('List of recommended anime based on Jikan structure.'),
    mangaRecommendations: z.array(MangaRecommendationSchema).describe('List of recommended manga based on Jikan structure.'),
    reasoning: z.string().describe('A brief reasoning behind the collective recommendations based on the user profile and mood.'),
});
export type AIDrivenHomepageOutput = z.infer<typeof AIDrivenHomepageOutputSchema>;

// Exported wrapper function
export async function aiDrivenHomepage(input: AIDrivenHomepageInput): Promise<AIDrivenHomepageOutput> {
  return aiDrivenHomepageFlow(input);
}

// Prompt definition (updated to request 3 structured recommendations each)
const prompt = ai.definePrompt({
  name: 'aiDrivenHomepagePrompt',
  input: {
    schema: AIDrivenHomepageInputSchema
  },
  output: {
    schema: AIDrivenHomepageOutputSchema // Use the updated output schema
  },
  prompt: `You are Nami AI, personalizing the homepage for AniManga Stream.

Based on the user's profile and current mood, recommend exactly 3 distinct anime and 3 distinct manga titles they are likely to enjoy. Ensure anime and manga titles are different.

User Profile:
{{{userProfile}}}

{{#if currentMood}}Current Mood: {{{currentMood}}}{{/if}}

Analyze their history, favorite genres, and mood. Suggest a diverse mix, potentially including:
- Titles similar to their favorites.
- Titles in preferred genres they might not have seen.
- Perhaps one "wildcard" pick based on mood or a less-obvious connection.

Provide the recommendations strictly matching the output JSON schema.
For each recommendation, generate plausible data matching the Jikan API structure described in the output schema (including fields like mal_id, title, genres, year/status, score/chapters, synopsis, images).
- Use common image URL patterns from cdn.myanimelist.net for 'images.jpg.large_image_url'.
- Provide a brief, engaging reasoning (1-2 sentences) for the overall selection in the 'reasoning' field.

Return ONLY the JSON object matching the AIDrivenHomepageOutputSchema.
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
      // Call the LLM to get structured recommendations and reasoning
      const { output } = await prompt(input);

      if (!output) {
        throw new Error('Failed to get recommendations from AI model.');
      }

      // The flow directly returns the structured output from the prompt.
      // Basic validation/cleanup if needed
      output.animeRecommendations = output.animeRecommendations || [];
      output.mangaRecommendations = output.mangaRecommendations || [];
      output.reasoning = output.reasoning || "Here are some recommendations you might like!"; // Default reasoning

      // Ensure imageUrl is derived for each item
      const addImageUrl = (item: any) => ({
          ...item,
          imageUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || null,
          id: item.mal_id // Ensure id is mapped from mal_id
      });

      return {
          animeRecommendations: output.animeRecommendations.map(addImageUrl),
          mangaRecommendations: output.mangaRecommendations.map(addImageUrl),
          reasoning: output.reasoning,
      };

    } catch (error: any) {
      console.error("Error in aiDrivenHomepageFlow:", error);
      // Provide a fallback or re-throw
      return {
        animeRecommendations: [],
        mangaRecommendations: [],
        reasoning: "Sorry, couldn't generate personalized recommendations right now.",
      };
    }
  }
);
