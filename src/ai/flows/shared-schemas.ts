
import { z } from 'genkit';

// Define Schemas based on Jikan structure to guide LLM output
export const JikanGenreSchema = z.object({
    mal_id: z.number().describe('MyAnimeList genre ID'),
    type: z.string().describe('Type (e.g., "anime", "manga")'),
    name: z.string().describe('Genre name'),
    url: z.string().describe('URL to the genre page on MAL'),
});

const JikanImageSchema = z.object({
      image_url: z.string().nullable().describe('Standard image URL'),
      small_image_url: z.string().nullable().describe('Small image URL'),
      large_image_url: z.string().nullable().describe('Large image URL (preferred for display)'),
});

const JikanImagesSchema = z.object({
      jpg: JikanImageSchema.describe('JPG image URLs'),
      webp: JikanImageSchema.describe('WebP image URLs'),
});

export const AnimeRecommendationSchema = z.object({
      mal_id: z.number().describe('The MyAnimeList ID of the recommended anime.'),
      title: z.string().describe('The title of the recommended anime.'),
      genres: z.array(JikanGenreSchema).describe('The anime genres.').optional(),
      year: z.number().nullable().describe('The anime release year.'),
      score: z.number().nullable().describe('The anime score (0-10).'),
      synopsis: z.string().nullable().describe('The anime synopsis.'),
      images: JikanImagesSchema.describe('URLs for the anime cover image.'),
      status: z.string().nullable().describe('Airing status (e.g., "Finished Airing", "Currently Airing")'),
      episodes: z.number().nullable().describe('Number of episodes'),
      url: z.string().nullable().describe('URL to the MAL page'),
      trailer: z.object({
          youtube_id: z.string().nullable().describe('YouTube trailer ID'),
          url: z.string().nullable().describe('YouTube trailer URL'),
          embed_url: z.string().nullable().describe('YouTube embed URL'),
      }).nullable().describe('Trailer information'),
      type: z.literal('anime').describe('Content type (must be "anime")'), // Ensure type is 'anime'
});

export const MangaRecommendationSchema = z.object({
      mal_id: z.number().describe('The MyAnimeList ID of the recommended manga.'),
      title: z.string().describe('The title of the recommended manga.'),
      genres: z.array(JikanGenreSchema).describe('The manga genres.').optional(),
      status: z.string().nullable().describe('The manga status (e.g., "Finished", "Publishing").'),
      synopsis: z.string().nullable().describe('The manga synopsis.'),
      images: JikanImagesSchema.describe('URLs for the manga cover image.'),
      score: z.number().nullable().describe('The manga score (0-10).'),
      chapters: z.number().nullable().describe('Number of chapters.'),
      volumes: z.number().nullable().describe('Number of volumes.'),
      year: z.number().nullable().describe('The publication start year.'),
      url: z.string().nullable().describe('URL to the MAL page'),
       type: z.literal('manga').describe('Content type (must be "manga")'), // Ensure type is 'manga'
});
