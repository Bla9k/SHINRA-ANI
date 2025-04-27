
import { env } from '@/env';

/**
 * Represents an Anime based on Jikan API v4 data structure.
 */
export interface Anime {
  /**
   * The MyAnimeList ID of the anime.
   */
  mal_id: number;
  /**
   * The primary title of the anime.
   */
  title: string;
  /**
   * The anime genres.
   */
  genres: { mal_id: number; type: string; name: string; url: string }[];
  /**
   * The anime release year.
   */
  year: number | null;
  /**
   * The anime score (0-10 scale).
   */
  score: number | null;
  /**
   * The anime synopsis.
   */
  synopsis: string | null;
  /**
   * The anime cover image URLs.
   */
  images: {
      jpg: {
          image_url: string | null;
          small_image_url: string | null;
          large_image_url: string | null; // Use this for cards/details
      };
      webp: {
          image_url: string | null;
          small_image_url: string | null;
          large_image_url: string | null;
      };
  };
  /**
   * The anime status (e.g., "Finished Airing", "Currently Airing").
   */
  status: string | null;
  /**
   * Number of episodes.
   */
  episodes: number | null;
  /**
   * URL to the MyAnimeList page.
   */
  url: string | null;
  /**
   * Trailer information (YouTube).
   */
  trailer: {
      youtube_id: string | null;
      url: string | null;
      embed_url: string | null;
      images: {
        image_url: string | null;
        small_image_url: string | null;
        medium_image_url: string | null;
        large_image_url: string | null;
        maximum_image_url: string | null;
      } | null;
  } | null;
  /**
   * Type identifier
   */
  type: 'anime'; // Explicitly set type for easier differentiation
   /**
    * Derived image URL field for easier access
    */
   imageUrl: string | null; // Add this for easier access in components
   /**
    * Mapped ID field for component key consistency
    */
   id?: number; // Add this optional field
}

/**
 * Represents the response structure for Jikan anime list fetch operations.
 */
export interface JikanAnimeListResponse {
    data?: any[]; // Optional in case of error
    pagination?: {
        last_visible_page: number;
        has_next_page: boolean;
        current_page: number;
        items: {
            count: number;
            total: number;
            per_page: number;
        };
    };
     // Potential error fields
    status?: number;
    type?: string;
    message?: string;
    error?: string;
}

/**
 * Represents the response structure for Jikan single anime fetch operations.
 */
export interface JikanSingleAnimeResponse {
    data: any; // Single Jikan anime object
}

/**
 * Represents the response structure for anime fetch operations using our Anime interface.
 */
export interface AnimeResponse {
    animes: Anime[];
    hasNextPage: boolean;
    currentPage?: number; // Add current page if needed
    lastPage?: number; // Add last page if needed
}


// Jikan API v4 base URL
const JIKAN_API_URL = 'https://api.jikan.moe/v4';
// Default items per page for Jikan API (max 25)
const DEFAULT_JIKAN_LIMIT = 24; // Keep it slightly below max to be safe
// Delay between Jikan API calls in milliseconds to avoid rate limits
const JIKAN_DELAY = 4000; // Increased delay to 4 seconds

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// Helper function to map Jikan API response to our Anime interface
const mapJikanDataToAnime = (jikanData: any): Anime | null => {
  // Basic validation to ensure essential fields exist
  if (!jikanData || typeof jikanData.mal_id !== 'number' || !jikanData.title) {
      console.warn("Skipping invalid Jikan anime data:", jikanData);
      return null; // Return null if essential data is missing
  }
  return {
    mal_id: jikanData.mal_id,
    id: jikanData.mal_id, // Map mal_id to id for consistency
    title: jikanData.title_english || jikanData.title || 'Untitled', // Prioritize English title
    genres: jikanData.genres || [],
    year: jikanData.year || (jikanData.aired?.from ? new Date(jikanData.aired.from).getFullYear() : null),
    score: jikanData.score || null,
    synopsis: jikanData.synopsis || null,
    images: jikanData.images,
    imageUrl: jikanData.images?.jpg?.large_image_url || jikanData.images?.jpg?.image_url || null, // Consistent field name
    status: jikanData.status || null,
    episodes: jikanData.episodes || null,
    url: jikanData.url || null,
    trailer: jikanData.trailer || null,
    type: 'anime', // Add type identifier
  };
};


/**
 * Asynchronously retrieves anime from Jikan API v4 with optional filters and pagination.
 * Includes delay to mitigate rate limiting.
 *
 * @param genre The genre MAL ID (number) or name (string) to filter animes on. Jikan expects ID.
 * @param year The specific release year to filter animes on.
 * @param minScore The minimum score to filter animes on (0-10 scale).
 * @param search Optional search term (query) for the title.
 * @param status Optional status string (e.g., "airing", "complete", "upcoming").
 * @param page The page number to fetch (default: 1).
 * @param sort Optional sorting parameter mapping to Jikan's `order_by` and `sort`.
 *             Examples: "popularity", "score", "rank", "title", "start_date", "episodes", "favorites".
 * @param limit Optional number of items per page (defaults to DEFAULT_JIKAN_LIMIT, max 25).
 * @returns A promise that resolves to an AnimeResponse object containing the list of Anime and pagination info.
 */
export async function getAnimes(
  genre?: string | number,
  year?: number,
  minScore?: number,
  search?: string,
  status?: string,
  page: number = 1,
  sort: string = 'popularity', // Default sort is popularity
  limit: number = DEFAULT_JIKAN_LIMIT // Allow custom limit
): Promise<AnimeResponse> {
  // Ensure limit doesn't exceed Jikan's max
  const effectiveLimit = Math.min(limit, 25);

  const params = new URLSearchParams({
    page: page.toString(),
    limit: effectiveLimit.toString(),
    // sfw: 'true', // Ensure Safe-for-Work results, optional
  });

  if (search) params.append('q', search);
  if (genre) params.append('genres', genre.toString()); // Jikan uses 'genres' param with comma-separated IDs
  if (year) params.append('start_date', `${year}-01-01`); // Approximate year filtering by start date
  if (minScore && minScore > 0 && minScore <= 10) params.append('min_score', minScore.toString());
  if (status) params.append('status', status);

  // Jikan Sorting Logic
  let orderBy = '';
  let sortDirection = 'desc'; // Default sort direction

  switch (sort) {
      case 'popularity':
          orderBy = 'members'; // Jikan uses 'members' for popularity
          break;
      case 'score':
          orderBy = 'score';
          break;
      case 'rank':
          orderBy = 'rank';
          sortDirection = 'asc'; // Rank is ascending
          break;
      case 'title':
          orderBy = 'title';
          sortDirection = 'asc'; // Title A-Z
          break;
      case 'start_date':
          orderBy = 'start_date';
          break;
       case 'episodes':
          orderBy = 'episodes';
          break;
       case 'favorites': // Added favorites sort
           orderBy = 'favorites';
           break;
      default:
         // If no specific sort matches, and no search term, default to popularity
         if(!search) {
            orderBy = 'members';
         }
         // If there's a search term, Jikan might default to relevance, so we don't force an order_by unless specifically requested
  }

  if (orderBy) {
     params.append('order_by', orderBy);
     params.append('sort', sortDirection);
  }

  const url = `${JIKAN_API_URL}/anime?${params.toString()}`;
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  let response: Response | undefined;

  console.log(`[getAnimes] Attempting fetch: ${url} (Delay: ${JIKAN_DELAY}ms)`);
  await delay(JIKAN_DELAY); // Wait before making the API call

  try {
    response = await fetch(url, {
      method: 'GET',
      headers: headers,
      next: { revalidate: 3600 }, // Revalidate cache every hour
    });

    console.log(`[getAnimes] Response status for ${url}: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[getAnimes] Jikan API response not OK:', response.status, response.statusText);
      console.error('[getAnimes] Jikan Error Body:', errorBody);
      console.error('[getAnimes] Jikan Request URL:', url);
       // Improved logging for rate limiting
       if (response.status === 429) {
          console.warn("[getAnimes] Jikan API rate limit likely exceeded (429). Consider increasing JIKAN_DELAY or reducing requests.");
       }
      // Try parsing for structured error
      let parsedError = null;
      try {
          parsedError = JSON.parse(errorBody);
          console.error('[getAnimes] Parsed Jikan Error:', parsedError);
      } catch {}
      // Instead of throwing, return an empty response
        return {
            animes: [],
            hasNextPage: false,
            currentPage: page,
            lastPage: page, // Assume current page is last on error
        };
      // throw new Error(`Jikan API request failed: ${response.status} ${response.statusText}. URL: ${url}. Error: ${parsedError?.error || errorBody}`);
    }

    const jsonResponse: JikanAnimeListResponse = await response.json();
    // console.log('[getAnimes] Jikan JSON Response:', JSON.stringify(jsonResponse, null, 2)); // Verbose logging

    // Check for valid data structure in response
    if (!jsonResponse || !jsonResponse.data || !Array.isArray(jsonResponse.data)) {
         console.warn('[getAnimes] Jikan API error: Response OK but missing or invalid "data" field.');
         console.warn('[getAnimes] Jikan Response:', JSON.stringify(jsonResponse));
         console.warn('[getAnimes] Jikan Request URL:', url);
         // Return empty results gracefully
         return {
             animes: [],
             hasNextPage: false,
             currentPage: page,
             lastPage: jsonResponse?.pagination?.last_visible_page ?? page,
         };
    }

    const pagination = jsonResponse.pagination;
    const animes = jsonResponse.data
                        .map(mapJikanDataToAnime)
                        .filter((anime): anime is Anime => anime !== null); // Filter out null results

    console.log(`[getAnimes] Successfully fetched ${animes.length} anime for URL: ${url}. HasNextPage: ${pagination?.has_next_page ?? false}`);

    return {
        animes: animes,
        hasNextPage: pagination?.has_next_page ?? false,
        currentPage: pagination?.current_page,
        lastPage: pagination?.last_visible_page,
    };

  } catch (error: any) {
    console.error(`[getAnimes] Failed to fetch anime from Jikan. URL: ${url}`);
    if(response) {
        console.error('[getAnimes] Response Status on Catch:', response.status, response.statusText);
    }
    // Log detailed fetch error
    console.error('[getAnimes] Fetch Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
     // Return empty response on fetch error
     return {
         animes: [],
         hasNextPage: false,
         currentPage: page,
         lastPage: page,
     };
    // throw new Error(`Failed to fetch anime data from Jikan: ${error.message || 'Unknown fetch error'}`);
  }
}

/**
 * Fetches a single anime by its MyAnimeList ID using Jikan API.
 * Includes delay to mitigate rate limiting.
 *
 * @param mal_id The MyAnimeList ID of the anime to fetch.
 * @returns A promise that resolves to the Anime object or null if not found.
 */
export async function getAnimeById(mal_id: number): Promise<Anime | null> {
  const url = `${JIKAN_API_URL}/anime/${mal_id}`;
  const headers: HeadersInit = { 'Accept': 'application/json' };
  let response: Response | undefined;

    console.log(`[getAnimeById] Attempting fetch: ${url} (Delay: ${JIKAN_DELAY}ms)`);
    await delay(JIKAN_DELAY); // Wait before making the API call

    try {
        response = await fetch(url, {
            method: 'GET',
            headers: headers,
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        console.log(`[getAnimeById] Response status for ${url}: ${response.status}`);


        if (response.status === 404) {
            console.warn(`[getAnimeById] Jikan: Anime with MAL ID ${mal_id} not found (404).`);
            return null; // Not found
        }

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('[getAnimeById] Jikan API response not OK:', response.status, response.statusText);
            console.error('[getAnimeById] Jikan Error Body:', errorBody);
            console.error('[getAnimeById] Jikan Request URL:', url);
             if (response.status === 429) {
                console.warn("[getAnimeById] Jikan API rate limit likely exceeded on single fetch (429). Consider increasing JIKAN_DELAY.");
             }
             let parsedError = null;
             try {
                parsedError = JSON.parse(errorBody);
                console.error('[getAnimeById] Parsed Jikan Error:', parsedError);
            } catch {}
             // Return null on failure
             return null;
            // throw new Error(`Jikan API request failed: ${response.status} ${response.statusText}. URL: ${url}. Error: ${parsedError?.error || errorBody}`);
        }

        const jsonResponse: JikanSingleAnimeResponse = await response.json();
        // console.log('[getAnimeById] Jikan JSON Response:', JSON.stringify(jsonResponse, null, 2));


        if (!jsonResponse.data) {
             console.warn('[getAnimeById] Jikan API error: Response OK but missing data field for single anime.');
             console.warn('[getAnimeById] Jikan Response:', JSON.stringify(jsonResponse));
             console.warn('[getAnimeById] Jikan Request URL:', url);
             return null; // Return null if data is missing
        }

        const mappedAnime = mapJikanDataToAnime(jsonResponse.data);

        if (mappedAnime) {
             console.log(`[getAnimeById] Successfully fetched anime ID ${mal_id}: ${mappedAnime.title}`);
        } else {
             console.warn(`[getAnimeById] Failed to map Jikan data for anime ID ${mal_id}. Raw Data:`, JSON.stringify(jsonResponse.data));
        }

        return mappedAnime;
    } catch (error: any) {
        console.error(`[getAnimeById] Failed to fetch anime with MAL ID ${mal_id} from Jikan. URL: ${url}`);
        if(response) {
            console.error('[getAnimeById] Response Status on Catch:', response.status, response.statusText);
        }
        console.error('[getAnimeById] Fetch Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        // Return null or re-throw based on how you want to handle errors
        return null;
        // Or: throw new Error(`Failed to fetch anime details (ID: ${mal_id}): ${error.message}`);
    }
}

/**
 * Fetches detailed information for a single anime by ID using Jikan API.
 * Currently identical to getAnimeById, but can be expanded later.
 *
 * @param id The MyAnimeList ID of the anime.
 * @returns A promise that resolves to the detailed Anime object or null if not found.
 */
export async function getAnimeDetails(id: number): Promise<Anime | null> {
  // For now, fetching by ID gives sufficient detail from Jikan
  return getAnimeById(id);
}
