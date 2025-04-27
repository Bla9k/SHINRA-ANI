
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
   * Base URL for the Consumet API.
   * Used for fetching streaming sources and episode lists.
   * Ensure this points to a valid and trusted Consumet instance.
   * Example: 'https://consumet-api-production-delta.vercel.app' or your self-hosted instance.
   */
  consumetApiUrl: process.env.NEXT_PUBLIC_CONSUMET_API_URL || 'https://api.consumet.org', // Default to official/known instance

  /**
   * Delay in milliseconds between consecutive Jikan API calls
   * to avoid rate limiting (429 errors). Adjust based on observed behavior.
   * Jikan's official limit is roughly 1 request per second bursts,
   * and around 60 per minute. A 2-second delay is conservative.
   */
  jikanApiDelayMs: 2000, // 2 seconds

   /**
    * Delay in milliseconds between consecutive Consumet API calls.
    * Rate limits can vary depending on the instance. Adjust as needed.
    */
   consumetApiDelayMs: 500, // 0.5 seconds (adjust if hitting limits)


  /**
   * Optional Jikan API Key (if needed for higher rate limits, generally not required for public data).
   */
  // jikanApiKey: process.env.JIKAN_API_KEY,

   /**
    * AniList API Client Secret (if needed for specific authenticated AniList actions, not typically required for public data via Consumet/Jikan).
    * **Important:** Treat API secrets with extreme care. Do not hardcode them here directly. Use environment variables.
    * This is likely NOT needed for basic streaming/metadata fetching via Consumet/Jikan.
    */
   // aniListClientSecret: process.env.ANILIST_CLIENT_SECRET, // Example: 'Cyjdl5tP37GTxV3Co7UluQZcuf54IrQSsYFaPd13' - DO NOT HARDCODE

   /**
    * Optional API Key for alternative providers if using them directly (e.g., a specific RapidAPI host).
    * **Important:** Use environment variables for keys.
    */
   // rapidApiKey: process.env.RAPIDAPI_KEY, // Example: 'bc0c31960dmshc281d1cd1ce5b62p108215jsn43c7fcbcfa83' - DO NOT HARDCODE
};
