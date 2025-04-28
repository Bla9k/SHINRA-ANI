
/**
 * Configuration settings for the application.
 * It is recommended to define sensitive settings like API keys in environment variables.
 */
export const config = {
  /**
   * Base URL for the Jikan API (v4).
   * Used for fetching anime/manga metadata.
   */
  jikanApiUrl: 'https://api.jikan.moe/v4',

  /**
   * Delay in milliseconds between consecutive Jikan API calls
   * to avoid rate limiting (429 errors). Adjust based on observed behavior.
   * Jikan's official limit is roughly 1 request per second bursts,
   * and around 60 per minute. A 4-second delay is conservative.
   */
  jikanApiDelayMs: 4000, // 4 seconds

   /**
    * Optional API Key for alternative providers if using them directly (e.g., a specific RapidAPI host).
    * **Important:** Use environment variables for keys.
    */
   rapidApiKey: process.env.RAPIDAPI_KEY, // Example: 'bc0c31960dmshc281d1cd1ce5b62p108215jsn43c7fcbcfa83'
};

