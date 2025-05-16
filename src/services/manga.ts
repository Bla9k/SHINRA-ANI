
import { config } from '@/config';

/**
 * Represents a Manga based on Jikan API v4 data structure.
 */
export interface Manga {
  /**
   * The MyAnimeList ID of the manga.
   */
  mal_id: number;
  /**
   * The primary title of the manga.
   */
  title: string;
  /**
   * The manga genres.
   */
  genres: { mal_id: number; type: string; name: string; url: string }[];
  /**
   * The manga status (e.g., "Finished", "Publishing").
   */
  status: string | null;
  /**
   * The manga synopsis.
   */
  synopsis: string | null;
  /**
   * The manga cover image URLs.
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
   * The manga score (0-10 scale).
   */
  score: number | null;
  /**
   * Number of chapters.
   */
  chapters: number | null;
  /**
   * Number of volumes.
   */
  volumes: number | null;
   /**
    * The release year (from published.from).
    */
   year: number | null;
   /**
    * URL to the MyAnimeList page.
    */
   url: string | null;
   /**
    * Type identifier
    */
   type: 'manga'; // Explicitly set type
   /**
    * Derived image URL field for easier access
    */
   imageUrl: string | null;
    /**
    * Mapped ID field for component key consistency
    */
   id: number; // Use definite ID
   relations?: Array<{ relation: string, entry: Array<{ mal_id: number, type: string, name: string, url: string }> }>; // For adaptation queries
   published?: { from: string | null; to: string | null; }; // For year calculation
}

/**
 * Represents the response structure for Jikan manga list fetch operations.
 * Adding optional fields that might appear in error responses.
 */
export interface JikanMangaListResponse {
    data?: any[]; // Array of Jikan manga objects (optional in case of error)
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
    // Potential error fields from Jikan
    status?: number;
    type?: string;
    message?: string;
    error?: string;
}


/**
 * Represents the response structure for Jikan single manga fetch operations.
 */
export interface JikanSingleMangaResponse {
    data: any; // Single Jikan manga object
}

/**
 * Represents a single manga recommendation entry from Jikan API.
 */
export interface JikanMangaRecommendationEntry {
    entry: {
        mal_id: number;
        url: string;
        images: any; // Use the same images structure as Manga interface
        title: string;
    };
    url: string;
    votes: number;
}

/**
 * Represents the response structure for Jikan manga recommendations fetch operations.
 */
export interface JikanMangaRecommendationsResponse {
    data?: JikanMangaRecommendationEntry[];
    // Potential error fields
    status?: number;
    type?: string;
    message?: string;
    error?: string;
}

/**
 * Represents the response structure for manga fetch operations using our Manga interface.
 */
export interface MangaResponse {
    mangas: Manga[];
    hasNextPage: boolean;
    currentPage?: number;
    lastPage?: number;
}

// Jikan API v4 base URL
const JIKAN_API_URL = 'https://api.jikan.moe/v4';
// Default items per page for Jikan API (max 25)
const DEFAULT_JIKAN_LIMIT = 24; // Keep it slightly below max
// Delay between Jikan API calls in milliseconds to avoid rate limits
const JIKAN_DELAY = config.jikanApiDelayMs;

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// Helper function to map Jikan API response to our Manga interface
export const mapJikanDataToManga = (jikanData: any): Manga | null => {
   // Basic validation to ensure essential fields exist
   if (!jikanData || typeof jikanData.mal_id !== 'number' || !jikanData.title) {
      console.warn("Skipping invalid Jikan manga data:", jikanData);
      return null; // Return null if essential data is missing
  }
  return {
    mal_id: jikanData.mal_id,
    id: jikanData.mal_id, // Map mal_id to id for consistency
    title: jikanData.title_english || jikanData.title || 'Untitled',
    genres: jikanData.genres || [],
    status: jikanData.status || null,
    synopsis: jikanData.synopsis || null,
    images: jikanData.images,
    imageUrl: jikanData.images?.jpg?.large_image_url || jikanData.images?.jpg?.image_url || null,
    score: jikanData.score || null,
    chapters: jikanData.chapters || null,
    volumes: jikanData.volumes || null,
    year: jikanData.published?.from ? new Date(jikanData.published.from).getFullYear() : null,
    url: jikanData.url || null,
    type: 'manga',
    relations: jikanData.relations || [],
    published: jikanData.published,
  };
};

/**
 * Asynchronously retrieves manga from Jikan API v4 with optional filters and pagination.
 * Includes delay to mitigate rate limiting.
 *
 * @param genre The genre MAL ID (number) or name (string) to filter mangas on. Jikan expects ID.
 * @param status The status string (e.g., "publishing", "finished", "upcoming").
 * @param search Optional search term (query) for the title.
 * @param minScore The minimum score to filter mangas on (0-10 scale).
 * @param page The page number to fetch (default: 1).
 * @param sort Optional sorting parameter mapping to Jikan's `order_by` and `sort`.
 *             Examples: "popularity", "score", "rank", "title", "start_date", "chapters", "volumes".
 * @param limit Optional number of items per page (defaults to DEFAULT_JIKAN_LIMIT, max 25).
 * @param sortDirection Optional sort direction ('asc' or 'desc').
 * @returns A promise that resolves to a MangaResponse object containing the list of Manga and pagination info.
 */
export async function getMangas(
  genre?: string | number,
  status?: string,
  search?: string,
  minScore?: number,
  page: number = 1,
  sort: string = 'popularity', // Default sort is popularity
  limit: number = DEFAULT_JIKAN_LIMIT, // Allow custom limit
  sortDirection?: 'asc' | 'desc' // New parameter
): Promise<MangaResponse> {
   const effectiveLimit = Math.min(limit, 25);

  const params = new URLSearchParams({
    page: page.toString(),
    limit: effectiveLimit.toString(),
  });

  if (search) params.append('q', search);
  if (genre) params.append('genres', genre.toString());
  if (status) params.append('status', status);
  if (minScore && minScore > 0 && minScore <= 10) params.append('min_score', minScore.toString());

  let orderBy = '';
  let effectiveSortDirection = sortDirection || 'desc';

  switch (sort) {
      case 'popularity': orderBy = 'members'; break;
      case 'score': orderBy = 'score'; break;
      case 'rank': orderBy = 'rank'; if (!sortDirection) effectiveSortDirection = 'asc'; break;
      case 'title': orderBy = 'title'; if (!sortDirection) effectiveSortDirection = 'asc'; break;
      case 'start_date': orderBy = 'start_date'; break;
      case 'chapters': orderBy = 'chapters'; break;
      case 'volumes': orderBy = 'volumes'; break;
      case 'favorites': orderBy = 'favorites'; break;
      default: if(!search) orderBy = 'members';
  }

  if (orderBy) {
     params.append('order_by', orderBy);
     params.append('sort', effectiveSortDirection);
  }

  const url = `${JIKAN_API_URL}/manga?${params.toString()}`;
  const headers: HeadersInit = { 'Accept': 'application/json' };
  let response: Response | undefined;

  console.log(`[getMangas] Attempting fetch: ${url} (Delay: ${JIKAN_DELAY}ms)`);
  await delay(JIKAN_DELAY);

  try {
    response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 1800 } });
    console.log(`[getMangas] Response status for ${url}: ${response.status}`);

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[getMangas] Jikan API response not OK: ${response.status} "${response.statusText}"`);
        console.error('[getMangas] Jikan Error Body:', errorBody.substring(0, 500));
        console.error('[getMangas] Jikan Request URL:', url);
        return { mangas: [], hasNextPage: false, currentPage: page, lastPage: page };
    }

    const jsonResponse: JikanMangaListResponse = await response.json();
    if (jsonResponse.status && jsonResponse.status !== 200 && jsonResponse.message) {
        console.warn(`[getMangas] Jikan API returned error ${jsonResponse.status} in 2xx response: ${jsonResponse.message}. URL: ${url}`);
        return { mangas: [], hasNextPage: false, currentPage: page, lastPage: page };
    }
    if (!jsonResponse || !jsonResponse.data || !Array.isArray(jsonResponse.data)) {
         console.warn(`[getMangas] Jikan API error: Response OK but missing or invalid "data" field. URL: ${url}`);
         console.warn('[getMangas] Jikan Response Body:', JSON.stringify(jsonResponse).substring(0, 500));
         return { mangas: [], hasNextPage: false, currentPage: page, lastPage: jsonResponse?.pagination?.last_visible_page ?? page };
    }

    const pagination = jsonResponse.pagination;
    const mangas = jsonResponse.data
                        .map(mapJikanDataToManga)
                        .filter((manga): manga is Manga => manga !== null);

     console.log(`[getMangas] Successfully fetched ${mangas.length} manga for URL: ${url}. HasNextPage: ${pagination?.has_next_page ?? false}`);
    return { mangas, hasNextPage: pagination?.has_next_page ?? false, currentPage: pagination?.current_page, lastPage: pagination?.last_visible_page };

  } catch (error: any) {
    console.error(`[getMangas] Failed to fetch manga from Jikan. URL: ${url}`);
     if(response) console.error('[getMangas] Response Status on Catch:', response.status, response.statusText);
     console.error('[getMangas] Fetch Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
     return { mangas: [], hasNextPage: false, currentPage: page, lastPage: page };
  }
}


/**
 * Fetches a single manga by its MyAnimeList ID or by title (if ID is 0 or not provided).
 * Includes delay to mitigate rate limiting.
 *
 * @param mal_id The MyAnimeList ID of the manga to fetch. If 0 or undefined, uses title.
 * @param title Optional title to search for if mal_id is not used.
 * @returns A promise that resolves to the Manga object or null if not found.
 */
export async function getMangaDetails(mal_id?: number, title?: string): Promise<Manga | null> {
    if (mal_id && mal_id > 0) {
        const url = `${JIKAN_API_URL}/manga/${mal_id}`;
        const headers: HeadersInit = { 'Accept': 'application/json' };
        let response: Response | undefined;

        console.log(`[getMangaDetailsByID] Attempting fetch: ${url} (Delay: ${JIKAN_DELAY}ms)`);
        await delay(JIKAN_DELAY);

        try {
            response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 3600 } });
            console.log(`[getMangaDetailsByID] Response status for ${url}: ${response.status}`);
            if (response.status === 404) return null;
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`[getMangaDetailsByID] Jikan API not OK: ${response.status} for ${url}. Body: ${errorBody.substring(0,200)}`);
                return null;
            }
            const jsonResponse: JikanSingleMangaResponse = await response.json();
            if (!jsonResponse.data) {
                 console.warn(`[getMangaDetailsByID] Jikan API missing data for ID ${mal_id}. Resp: ${JSON.stringify(jsonResponse).substring(0,200)}`);
                 return null;
            }
            return mapJikanDataToManga(jsonResponse.data);
        } catch (error: any) {
            console.error(`[getMangaDetailsByID] Failed for ID ${mal_id}, URL: ${url}. Error: ${error.message}`);
            return null;
        }
    } else if (title) {
        console.log(`[getMangaDetailsByTitle] Searching for title: "${title}"`);
        const searchResult = await getMangas(undefined, undefined, title, undefined, 1, 'rank', 1);
        if (searchResult.mangas.length > 0) {
            return searchResult.mangas[0];
        }
        return null;
    }
    console.warn("[getMangaDetails] Called with no ID and no title.");
    return null;
}


/**
 * Fetches manga recommendations based on a given MAL ID using Jikan API.
 * Includes delay to mitigate rate limiting.
 *
 * @param mal_id The MyAnimeList ID of the manga for which to fetch recommendations.
 * @returns A promise that resolves to an array of Manga objects (recommendations).
 */
export async function getMangaRecommendations(mal_id: number): Promise<Manga[]> {
    const url = `${JIKAN_API_URL}/manga/${mal_id}/recommendations`;
    const headers: HeadersInit = { 'Accept': 'application/json' };
    let response: Response | undefined;

    console.log(`[getMangaRecommendations] Attempting fetch: ${url} (Delay: ${JIKAN_DELAY}ms)`);
    await delay(JIKAN_DELAY);

    try {
        response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 3600 * 12 } });
        console.log(`[getMangaRecommendations] Response status for ${url}: ${response.status}`);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[getMangaRecommendations] Jikan API not OK: ${response.status} for ${url}. Body: ${errorBody.substring(0,200)}`);
            return [];
        }
        const jsonResponse: JikanMangaRecommendationsResponse = await response.json();
        if (!jsonResponse || !jsonResponse.data || !Array.isArray(jsonResponse.data)) {
            console.warn(`[getMangaRecommendations] Jikan API missing/invalid data for MAL ID ${mal_id}. Resp: ${JSON.stringify(jsonResponse).substring(0,200)}`);
            return [];
        }
        return jsonResponse.data.map(rec => mapJikanDataToManga(rec.entry)).filter((manga): manga is Manga => manga !== null);
    } catch (error: any) {
        console.error(`[getMangaRecommendations] Failed for MAL ID ${mal_id}, URL: ${url}. Error: ${error.message}`);
        return [];
    }
}

    