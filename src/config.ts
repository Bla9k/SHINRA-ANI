
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
   * Base URL for the INTERNAL Consumet API proxy routes.
   * Should point to the '/api/consumet' path within this Next.js application.
   * This is NOT the external Consumet API URL.
   */
  consumetApiUrl: '/api/consumet', // Internal API base path

  /**
   * Delay in milliseconds between consecutive Jikan API calls
   * to avoid rate limiting (429 errors). Adjust based on observed behavior.
   * Jikan's official limit is roughly 1 request per second bursts,
   * and around 60 per minute. A 2-second delay is conservative.
   */
  jikanApiDelayMs: 2000, // 2 seconds

   /**
    * Delay in milliseconds between consecutive Consumet API calls (now internal).
    * Internal calls usually don't need delays unless the backing external API is slow/rate-limited.
    * Setting to 0, but can be adjusted if needed.
    */
   consumetApiDelayMs: 0,


  /**
   * Optional Jikan API Key (if needed for higher rate limits, generally not required for public data).
   */
  // jikanApiKey: process.env.JIKAN_API_KEY,

   /**
    * AniList Client Secret (NOT typically required for basic Consumet usage).
    * Stored in environment variables if needed.
    */
   aniListClientSecret: process.env.ANILIST_CLIENT_SECRET, // Example: 'Cyjdl5tP37GTxV3Co7UluQZcuf54IrQSsYFaPd13'

   /**
    * Optional API Key for alternative providers if using them directly (e.g., a specific RapidAPI host).
    * **Important:** Use environment variables for keys.
    */
   rapidApiKey: process.env.RAPIDAPI_KEY, // Example: 'bc0c31960dmshc281d1cd1ce5b62p108215jsn43c7fcbcfa83'
};
