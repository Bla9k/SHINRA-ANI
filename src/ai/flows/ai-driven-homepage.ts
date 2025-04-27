'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a personalized anime/manga homepage
 * based on user browsing habits.
 *
 * - aiDrivenHomepage - A function that generates a personalized homepage.
 * - AIDrivenHomepageInput - The input type for the aiDrivenHomepage function.
 * - AIDrivenHomepageOutput - The return type for the aiDrivenHomepage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {Anime, getAnimes} from '@/services/anime';
import {Manga, getMangas} from '@/services/manga';

const AIDrivenHomepageInputSchema = z.object({
  userProfile: z
    .string()
    .describe(
      'A description of the user profile, including their viewing history, favorites, and preferences.'
    ),
  currentMood: z.string().describe('The current mood of the user.'),
});
export type AIDrivenHomepageInput = z.infer<typeof AIDrivenHomepageInputSchema>;

const AIDrivenHomepageOutputSchema = z.object({
  animeRecommendations: z.array(z.string()).describe('A list of recommended anime titles.'),
  mangaRecommendations: z.array(z.string()).describe('A list of recommended manga titles.'),
  reasoning: z.string().describe('The reasoning behind the recommendations.'),
});
export type AIDrivenHomepageOutput = z.infer<typeof AIDrivenHomepageOutputSchema>;

export async function aiDrivenHomepage(input: AIDrivenHomepageInput): Promise<AIDrivenHomepageOutput> {
  return aiDrivenHomepageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDrivenHomepagePrompt',
  input: {
    schema: z.object({
      userProfile: z
        .string()
        .describe(
          'A description of the user profile, including their viewing history, favorites, and preferences.'
        ),
      currentMood: z.string().describe('The current mood of the user.'),
    }),
  },
  output: {
    schema: z.object({
      animeRecommendations: z.array(z.string()).describe('A list of recommended anime titles.'),
      mangaRecommendations: z.array(z.string()).describe('A list of recommended manga titles.'),
      reasoning: z.string().describe('The reasoning behind the recommendations.'),
    }),
  },
  prompt: `You are an AI assistant that personalizes the homepage of an anime and manga streaming platform.

  Based on the user's profile and current mood, recommend anime and manga titles that they are likely to enjoy.

  User Profile: {{{userProfile}}}
  Current Mood: {{{currentMood}}}

  Consider the user's viewing history, favorite genres, and any specific preferences mentioned in their profile.
  Take into account their current mood to suggest titles that align with their emotional state.

  Provide a list of anime recommendations and a list of manga recommendations.
  Also, explain your reasoning behind these choices, referencing specific aspects of the user's profile and mood.
  Make the anime and manga titles distinct. Do not repeat titles.
  `,
});

const aiDrivenHomepageFlow = ai.defineFlow<
  typeof AIDrivenHomepageInputSchema,
  typeof AIDrivenHomepageOutputSchema
>(
  {
    name: 'aiDrivenHomepageFlow',
    inputSchema: AIDrivenHomepageInputSchema,
    outputSchema: AIDrivenHomepageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
