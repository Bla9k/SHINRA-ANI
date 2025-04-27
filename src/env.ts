
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
   * Optional Jikan API Key (if needed for higher rate limits, generally not required for public data).
   * Jikan v4 API base URL: https://api.jikan.moe/v4
   */
  // JIKAN_API_KEY: process.env.JIKAN_API_KEY, // Add if needed later

  // Removed ANILIST_ACCESS_TOKEN
};
