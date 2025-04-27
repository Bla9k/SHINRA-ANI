
import { env } from '@/env';

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
    // Add other potential error fields if observed
}


/**
 * Represents the response structure for Jikan single manga fetch operations.
 */
export interface JikanSingleMangaResponse {
    data: any; // Single Jikan manga object
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
const JIKAN_DELAY = 4000; // 4 seconds - adjust as needed based on rate limit issues

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// Helper function to map Jikan API response to our Manga interface
const mapJikanDataToManga = (jikanData: any): Manga | null => {
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
 * @returns A promise that resolves to a MangaResponse object containing the list of Manga and pagination info.
 */
export async function getMangas(
  genre?: string | number,
  status?: string,
  search?: string,
  minScore?: number,
  page: number = 1,
  sort: string = 'popularity', // Default sort is popularity
  limit: number = DEFAULT_JIKAN_LIMIT // Allow custom limit
): Promise<MangaResponse> {
   // Ensure limit doesn't exceed Jikan's max
   const effectiveLimit = Math.min(limit, 25);

  const params = new URLSearchParams({
    page: page.toString(),
    limit: effectiveLimit.toString(),
    // sfw: 'true', // Optional: Ensure Safe-for-Work results
  });

  if (search) params.append('q', search);
  if (genre) params.append('genres', genre.toString());
  if (status) params.append('status', status);
  if (minScore && minScore > 0 && minScore <= 10) params.append('min_score', minScore.toString());

   // Jikan Sorting Logic
  let orderBy = '';
  let sortDirection = 'desc'; // Default sort direction

  switch (sort) {
      case 'popularity':
          orderBy = 'members';
          break;
      case 'score':
          orderBy = 'score';
          break;
      case 'rank':
          orderBy = 'rank';
          sortDirection = 'asc';
          break;
      case 'title':
          orderBy = 'title';
          sortDirection = 'asc';
          break;
      case 'start_date':
          orderBy = 'start_date';
          break;
       case 'chapters':
          orderBy = 'chapters';
          break;
       case 'volumes':
           orderBy = 'volumes';
           break;
       case 'favorites': // Added favorites sort
           orderBy = 'favorites';
           break;
      default:
         if(!search) {
            orderBy = 'members'; // Default if no sort/search
         }
         // Let Jikan handle relevance if search term exists and no specific sort
  }

  if (orderBy) {
     params.append('order_by', orderBy);
     params.append('sort', sortDirection);
  }

  const url = `${JIKAN_API_URL}/manga?${params.toString()}`;
  const headers: HeadersInit = { 'Accept': 'application/json' };
  let response: Response | undefined;

  console.log(`[getMangas] Attempting fetch: ${url} (Delay: ${JIKAN_DELAY}ms)`);
  await delay(JIKAN_DELAY); // Wait before making the API call

  try {
    response = await fetch(url, {
      method: 'GET',
      headers: headers,
      // Use shorter revalidation to get fresher data, but risk hitting rate limits more often
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    console.log(`[getMangas] Response status for ${url}: ${response.status}`);


    // Check if the response status is OK (2xx) BEFORE trying to parse JSON
    if (!response.ok) {
        const errorBody = await response.text(); // Get raw error body
        console.error(`[getMangas] Jikan API response not OK: ${response.status} "${response.statusText}"`);
        console.error('[getMangas] Jikan Error Body:', errorBody);
        console.error('[getMangas] Jikan Request URL:', url);
         if (response.status === 429) {
            console.warn("[getMangas] Jikan API rate limit likely exceeded (429). Consider increasing JIKAN_DELAY or reducing requests.");
         }
         let parsedError = null;
        try {
            parsedError = JSON.parse(errorBody);
             // Improved logging for parsed error body
             if (parsedError && typeof parsedError === 'object' && Object.keys(parsedError).length === 0) {
                 console.warn('[getMangas] Parsed Jikan error body was empty.');
             } else if (parsedError) {
                 console.error('[getMangas] Parsed Jikan Error Body:', parsedError);
             } else {
                 console.warn('[getMangas] Could not parse Jikan error body as JSON.');
             }
        } catch {}
        // Instead of throwing, return an empty response to allow the UI to handle it gracefully
        return {
            mangas: [],
            hasNextPage: false,
            currentPage: page,
            lastPage: page, // Assume current page is last on error
        };
    }

    // If response is OK, proceed to parse JSON
    const jsonResponse: JikanMangaListResponse = await response.json();
    // console.log('[getMangas] Jikan JSON Response:', JSON.stringify(jsonResponse, null, 2)); // Verbose logging


    // Check if the data field is missing or not an array AFTER confirming response.ok
     if (!jsonResponse || !jsonResponse.data || !Array.isArray(jsonResponse.data)) {
         console.error('[getMangas] Jikan API error: Response OK but missing or invalid "data" field.');
         console.error('[getMangas] Jikan Response:', JSON.stringify(jsonResponse)); // Log the problematic response
         console.error('[getMangas] Jikan Request URL:', url);
         // Check if it looks like a Jikan error structure even with 2xx status (unlikely but possible)
         if (jsonResponse.status && jsonResponse.message) {
             console.warn(`[getMangas] Jikan API returned error ${jsonResponse.status} in 2xx response: ${jsonResponse.message}`);
         }
          // Return an empty list gracefully
          return {
              mangas: [],
              hasNextPage: false,
              currentPage: page,
              lastPage: jsonResponse?.pagination?.last_visible_page ?? page,
          };
    }

    const pagination = jsonResponse.pagination;
    // Map only if data exists and is an array, filter out nulls
    const mangas = jsonResponse.data
                        .map(mapJikanDataToManga)
                        .filter((manga): manga is Manga => manga !== null);

     console.log(`[getMangas] Successfully fetched ${mangas.length} manga for URL: ${url}. HasNextPage: ${pagination?.has_next_page ?? false}`);

    return {
        mangas: mangas,
        hasNextPage: pagination?.has_next_page ?? false,
        currentPage: pagination?.current_page,
        lastPage: pagination?.last_visible_page,
    };

  } catch (error: any) {
    console.error(`[getMangas] Failed to fetch manga from Jikan. URL: ${url}`);
     // Log the response status if available
     if(response) {
         console.error('[getMangas] Response Status on Catch:', response.status, response.statusText);
     }
    // Attempt to log more detailed error information
     console.error('[getMangas] Fetch Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
     // Return empty response on fetch error
     return {
         mangas: [],
         hasNextPage: false,
         currentPage: page,
         lastPage: page,
     };
    // throw new Error(`Failed to fetch manga data from Jikan: ${error.message || 'Unknown fetch error'}`);
  }
}


/**
 * Fetches a single manga by its MyAnimeList ID using Jikan API.
 * Includes delay to mitigate rate limiting.
 *
 * @param mal_id The MyAnimeList ID of the manga to fetch.
 * @returns A promise that resolves to the Manga object or null if not found.
 */
export async function getMangaById(mal_id: number): Promise<Manga | null> {
    const url = `${JIKAN_API_URL}/manga/${mal_id}`;
    const headers: HeadersInit = { 'Accept': 'application/json' };
    let response: Response | undefined;

    console.log(`[getMangaById] Attempting fetch: ${url} (Delay: ${JIKAN_DELAY}ms)`);
    await delay(JIKAN_DELAY); // Wait before making the API call

    try {
        response = await fetch(url, {
            method: 'GET',
            headers: headers,
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        console.log(`[getMangaById] Response status for ${url}: ${response.status}`);


        if (response.status === 404) {
            console.warn(`[getMangaById] Jikan: Manga with MAL ID ${mal_id} not found (404).`);
            return null; // Not found is not necessarily an error
        }

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[getMangaById] Jikan API response not OK: ${response.status} "${response.statusText}"`);
            console.error('[getMangaById] Jikan Error Body:', errorBody);
            console.error('[getMangaById] Jikan Request URL:', url);
             if (response.status === 429) {
                 console.warn("[getMangaById] Jikan API rate limit likely exceeded on single fetch (429). Consider increasing JIKAN_DELAY.");
             }
             let parsedError = null;
             try {
                parsedError = JSON.parse(errorBody);
                 if (parsedError && typeof parsedError === 'object' && Object.keys(parsedError).length === 0) {
                    console.warn('[getMangaById] Parsed Jikan error body was empty.');
                } else if (parsedError) {
                    console.error('[getMangaById] Parsed Jikan Error Body:', parsedError);
                } else {
                    console.warn('[getMangaById] Could not parse Jikan error body as JSON.');
                }
            } catch {}
            // Return null on failure as per function signature
            return null;
            // throw new Error(`Jikan API request failed: ${response.status} ${response.statusText}. URL: ${url}. Error: ${parsedError?.error || errorBody}`);
        }

        const jsonResponse: JikanSingleMangaResponse = await response.json();
        // console.log('[getMangaById] Jikan JSON Response:', JSON.stringify(jsonResponse, null, 2));


         if (!jsonResponse.data) {
             console.warn('[getMangaById] Jikan API error: Response OK but missing data field for single manga.');
             console.warn('[getMangaById] Jikan Response:', JSON.stringify(jsonResponse));
             console.warn('[getMangaById] Jikan Request URL:', url);
              return null; // Return null instead of throwing
         }

        const mappedManga = mapJikanDataToManga(jsonResponse.data);

        if (mappedManga) {
             console.log(`[getMangaById] Successfully fetched manga ID ${mal_id}: ${mappedManga.title}`);
        } else {
             console.warn(`[getMangaById] Failed to map Jikan data for manga ID ${mal_id}. Raw Data:`, JSON.stringify(jsonResponse.data));
        }

        return mappedManga;
    } catch (error: any) {
        console.error(`[getMangaById] Failed to fetch manga with MAL ID ${mal_id} from Jikan. URL: ${url}`);
        if(response) {
            console.error('[getMangaById] Response Status on Catch:', response.status, response.statusText);
        }
        console.error('[getMangaById] Fetch Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        // Return null as the function signature suggests, indicating failure to retrieve
        return null;
    }
}

/**
 * Fetches detailed information for a single manga by ID using Jikan API.
 *
 * @param id The MyAnimeList ID of the manga.
 * @returns A promise that resolves to the detailed Manga object or null if not found.
 */
export async function getMangaDetails(id: number): Promise<Manga | null> {
  return getMangaById(id);
}
