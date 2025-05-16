
import { config } from '@/config';

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
   id: number; // Use definite ID
   relations?: Array<{ relation: string, entry: Array<{ mal_id: number, type: string, name: string, url: string }> }>; // For adaptation queries
   aired?: { from: string | null; to: string | null; }; // For year calculation if not directly present
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
 * Represents a single anime recommendation entry from Jikan API.
 */
export interface JikanAnimeRecommendationEntry {
    entry: {
        mal_id: number;
        url: string;
        images: any; // Use the same images structure as Anime interface
        title: string;
    };
    url: string;
    votes: number;
}

/**
 * Represents the response structure for Jikan anime recommendations fetch operations.
 */
export interface JikanAnimeRecommendationsResponse {
    data?: JikanAnimeRecommendationEntry[];
    // Potential error fields
    status?: number;
    type?: string;
    message?: string;
    error?: string;
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
const JIKAN_DELAY = config.jikanApiDelayMs;

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// Helper function to map Jikan API response to our Anime interface
export const mapJikanDataToAnime = (jikanData: any): Anime | null => {
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
    relations: jikanData.relations || [],
    aired: jikanData.aired,
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
 * @param sortDirection Optional sort direction ('asc' or 'desc').
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
  limit: number = DEFAULT_JIKAN_LIMIT, // Allow custom limit
  sortDirection?: 'asc' | 'desc' // New parameter
): Promise<AnimeResponse> {
  const effectiveLimit = Math.min(limit, 25);

  const params = new URLSearchParams({
    page: page.toString(),
    limit: effectiveLimit.toString(),
  });

  if (search) params.append('q', search);
  if (genre) params.append('genres', genre.toString());
  if (year) params.append('start_date', `${year}-01-01`);
  if (minScore && minScore > 0 && minScore <= 10) params.append('min_score', minScore.toString());
  if (status) params.append('status', status);

  let orderBy = '';
  let effectiveSortDirection = sortDirection || 'desc'; // Use provided or default to 'desc'

  switch (sort) {
      case 'popularity': orderBy = 'members'; break;
      case 'score': orderBy = 'score'; break;
      case 'rank': orderBy = 'rank'; if (!sortDirection) effectiveSortDirection = 'asc'; break;
      case 'title': orderBy = 'title'; if (!sortDirection) effectiveSortDirection = 'asc'; break;
      case 'start_date': orderBy = 'start_date'; break;
      case 'episodes': orderBy = 'episodes'; break;
      case 'favorites': orderBy = 'favorites'; break;
      default: if(!search) orderBy = 'members';
  }

  if (orderBy) {
     params.append('order_by', orderBy);
     params.append('sort', effectiveSortDirection);
  }

  const url = `${JIKAN_API_URL}/anime?${params.toString()}`;
  const headers: HeadersInit = { 'Accept': 'application/json' };
  let response: Response | undefined;

  console.log(`[getAnimes] Attempting fetch: ${url} (Delay: ${JIKAN_DELAY}ms)`);
  await delay(JIKAN_DELAY);

  try {
    response = await fetch(url, {
      method: 'GET',
      headers: headers,
      next: { revalidate: 3600 },
    });

    console.log(`[getAnimes] Response status for ${url}: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[getAnimes] Jikan API response not OK: ${response.status} "${response.statusText}"`);
      console.error('[getAnimes] Jikan Error Body:', errorBody.substring(0, 500)); // Log only first 500 chars
      console.error('[getAnimes] Jikan Request URL:', url);
      return { animes: [], hasNextPage: false, currentPage: page, lastPage: page };
    }

    const jsonResponse: JikanAnimeListResponse = await response.json();

    if (jsonResponse.status && jsonResponse.status !== 200 && jsonResponse.message) {
      console.warn(`[getAnimes] Jikan API returned error ${jsonResponse.status} in 2xx response: ${jsonResponse.message}. URL: ${url}`);
      return { animes: [], hasNextPage: false, currentPage: page, lastPage: page };
    }

    if (!jsonResponse || !jsonResponse.data || !Array.isArray(jsonResponse.data)) {
         console.warn(`[getAnimes] Jikan API error: Response OK but missing or invalid "data" field. URL: ${url}`);
         console.warn('[getAnimes] Jikan Response Body:', JSON.stringify(jsonResponse).substring(0, 500));
         return { animes: [], hasNextPage: false, currentPage: page, lastPage: jsonResponse?.pagination?.last_visible_page ?? page };
    }

    const pagination = jsonResponse.pagination;
    const animes = jsonResponse.data
                        .map(mapJikanDataToAnime)
                        .filter((anime): anime is Anime => anime !== null);

    console.log(`[getAnimes] Successfully fetched ${animes.length} anime for URL: ${url}. HasNextPage: ${pagination?.has_next_page ?? false}`);
    return { animes, hasNextPage: pagination?.has_next_page ?? false, currentPage: pagination?.current_page, lastPage: pagination?.last_visible_page };

  } catch (error: any) {
    console.error(`[getAnimes] Failed to fetch anime from Jikan. URL: ${url}`);
    if(response) console.error('[getAnimes] Response Status on Catch:', response.status, response.statusText);
    console.error('[getAnimes] Fetch Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { animes: [], hasNextPage: false, currentPage: page, lastPage: page };
  }
}

/**
 * Fetches a single anime by its MyAnimeList ID or by title (if ID is 0 or not provided).
 * Includes delay to mitigate rate limiting.
 *
 * @param mal_id The MyAnimeList ID of the anime to fetch. If 0 or undefined, uses title.
 * @param title Optional title to search for if mal_id is not used.
 * @returns A promise that resolves to the Anime object or null if not found.
 */
export async function getAnimeDetails(mal_id?: number, title?: string): Promise<Anime | null> {
  if (mal_id && mal_id > 0) {
    const url = `${JIKAN_API_URL}/anime/${mal_id}`;
    const headers: HeadersInit = { 'Accept': 'application/json' };
    let response: Response | undefined;

    console.log(`[getAnimeDetailsByID] Attempting fetch: ${url} (Delay: ${JIKAN_DELAY}ms)`);
    await delay(JIKAN_DELAY);

    try {
        response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 3600 } });
        console.log(`[getAnimeDetailsByID] Response status for ${url}: ${response.status}`);
        if (response.status === 404) return null;
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[getAnimeDetailsByID] Jikan API not OK: ${response.status} for ${url}. Body: ${errorBody.substring(0,200)}`);
            return null;
        }
        const jsonResponse: JikanSingleAnimeResponse = await response.json();
        if (!jsonResponse.data) {
             console.warn(`[getAnimeDetailsByID] Jikan API missing data for ID ${mal_id}. Resp: ${JSON.stringify(jsonResponse).substring(0,200)}`);
             return null;
        }
        return mapJikanDataToAnime(jsonResponse.data);
    } catch (error: any) {
        console.error(`[getAnimeDetailsByID] Failed for ID ${mal_id}, URL: ${url}. Error: ${error.message}`);
        return null;
    }
  } else if (title) {
    console.log(`[getAnimeDetailsByTitle] Searching for title: "${title}"`);
    const searchResult = await getAnimes(undefined, undefined, undefined, title, undefined, 1, 'rank', 1);
    if (searchResult.animes.length > 0) {
      return searchResult.animes[0]; // Return the first, most relevant result
    }
    return null;
  }
  console.warn("[getAnimeDetails] Called with no ID and no title.");
  return null;
}


/**
 * Fetches anime recommendations based on a given MAL ID using Jikan API.
 * Includes delay to mitigate rate limiting.
 *
 * @param mal_id The MyAnimeList ID of the anime for which to fetch recommendations.
 * @returns A promise that resolves to an array of Anime objects (recommendations).
 */
export async function getAnimeRecommendations(mal_id: number): Promise<Anime[]> {
    const url = `${JIKAN_API_URL}/anime/${mal_id}/recommendations`;
    const headers: HeadersInit = { 'Accept': 'application/json' };
    let response: Response | undefined;

    console.log(`[getAnimeRecommendations] Attempting fetch: ${url} (Delay: ${JIKAN_DELAY}ms)`);
    await delay(JIKAN_DELAY);

    try {
        response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 3600 * 12 } });
        console.log(`[getAnimeRecommendations] Response status for ${url}: ${response.status}`);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[getAnimeRecommendations] Jikan API not OK: ${response.status} for ${url}. Body: ${errorBody.substring(0,200)}`);
            return [];
        }
        const jsonResponse: JikanAnimeRecommendationsResponse = await response.json();
        if (!jsonResponse || !jsonResponse.data || !Array.isArray(jsonResponse.data)) {
            console.warn(`[getAnimeRecommendations] Jikan API missing/invalid data for MAL ID ${mal_id}. Resp: ${JSON.stringify(jsonResponse).substring(0,200)}`);
            return [];
        }
        return jsonResponse.data.map(rec => mapJikanDataToAnime(rec.entry)).filter((anime): anime is Anime => anime !== null);
    } catch (error: any) {
        console.error(`[getAnimeRecommendations] Failed for MAL ID ${mal_id}, URL: ${url}. Error: ${error.message}`);
        return [];
    }
}


/**
 * Fetches anime for a specific season (year and season name).
 * @param year The year of the season.
 * @param season The season name ('winter', 'spring', 'summer', 'fall').
 * @param page The page number.
 * @param limit The number of items per page.
 * @returns A promise that resolves to an AnimeResponse object.
 */
export async function getSeasonAnime(
  year: number,
  season: 'winter' | 'spring' | 'summer' | 'fall',
  page: number = 1,
  limit: number = DEFAULT_JIKAN_LIMIT
): Promise<AnimeResponse> {
  const effectiveLimit = Math.min(limit, 25);
  const params = new URLSearchParams({
    page: page.toString(),
    limit: effectiveLimit.toString(),
    // Jikan's season endpoint doesn't support sfw or other filters directly in the same way
    // but content is generally SFW.
  });

  const url = `${JIKAN_API_URL}/seasons/${year}/${season}?${params.toString()}`;
  const headers: HeadersInit = { 'Accept': 'application/json' };
  let response: Response | undefined;

  console.log(`[getSeasonAnime] Attempting fetch: ${url} (Delay: ${JIKAN_DELAY}ms)`);
  await delay(JIKAN_DELAY);

  try {
    response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 3600 * 24 } }); // Cache seasonal data for a day
    console.log(`[getSeasonAnime] Response status for ${url}: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[getSeasonAnime] Jikan API not OK: ${response.status} for ${url}. Body: ${errorBody.substring(0,500)}`);
      return { animes: [], hasNextPage: false, currentPage: page, lastPage: page };
    }

    const jsonResponse: JikanAnimeListResponse = await response.json();
    if (jsonResponse.status && jsonResponse.status !== 200 && jsonResponse.message) {
        console.warn(`[getSeasonAnime] Jikan API returned error ${jsonResponse.status} in 2xx response: ${jsonResponse.message}. URL: ${url}`);
        return { animes: [], hasNextPage: false, currentPage: page, lastPage: page };
    }
    if (!jsonResponse || !jsonResponse.data || !Array.isArray(jsonResponse.data)) {
      console.warn(`[getSeasonAnime] Jikan API missing/invalid data for ${year} ${season}. Resp: ${JSON.stringify(jsonResponse).substring(0,500)}`);
      return { animes: [], hasNextPage: false, currentPage: page, lastPage: jsonResponse?.pagination?.last_visible_page ?? page };
    }

    const pagination = jsonResponse.pagination;
    const animes = jsonResponse.data
                        .map(mapJikanDataToAnime)
                        .filter((anime): anime is Anime => anime !== null);

    console.log(`[getSeasonAnime] Successfully fetched ${animes.length} anime for ${year} ${season}. URL: ${url}. HasNextPage: ${pagination?.has_next_page ?? false}`);
    return { animes, hasNextPage: pagination?.has_next_page ?? false, currentPage: pagination?.current_page, lastPage: pagination?.last_visible_page };

  } catch (error: any) {
    console.error(`[getSeasonAnime] Failed for ${year} ${season}, URL: ${url}. Error: ${error.message}`);
    if(response) console.error('[getSeasonAnime] Response Status on Catch:', response.status, response.statusText);
    return { animes: [], hasNextPage: false, currentPage: page, lastPage: page };
  }
}

    