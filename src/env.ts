
/**
 * Environment variables for the application.
 * It is recommended to define environment variables in a .env file for local development.
 * Do NOT commit .env files to version control.
 * For production deployments, configure these environment variables in your hosting provider's settings.
 */
export const env = {
  /**
   * Optional Google Generative AI API Key for Genkit AI features.
   * If not provided, AI features may be disabled or use alternative models.
   */
  GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY,

  /**
   * Optional AniList Access Token for authenticated requests (e.g., managing user lists).
   * Public data fetching generally does not require a token.
   * Obtain from AniList developer settings if needed.
   */
  ANILIST_ACCESS_TOKEN: process.env.ANILIST_ACCESS_TOKEN, // Optional: For authenticated actions

  // Removed ANILIST_API_KEY and ANILIST_SECRET as they are not standard AniList auth methods
  // Removed RAPIDAPI_KEY as it's not used for AniList
};
