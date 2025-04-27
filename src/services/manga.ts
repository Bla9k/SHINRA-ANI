
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
const JIKAN_LIMIT = 24; // Keep it slightly below max
// Delay between Jikan API calls in milliseconds to avoid rate limits
const JIKAN_DELAY = 600; // Increased delay again (was 400ms)

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// Helper function to map Jikan API response to our Manga interface
const mapJikanDataToManga = (jikanData: any): Manga => {
  return {
    mal_id: jikanData.mal_id,
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
 * @param genre The genre MAL ID (number) or name (string) to filter mangas on.
 * @param status The status string (e.g., "publishing", "finished", "upcoming").
 * @param search Optional search term (query) for the title.
 * @param minScore The minimum score to filter mangas on (0-10 scale).
 * @param page The page number to fetch (default: 1).
 * @param sort Optional sorting parameter (e.g., "score", "popularity", "rank").
 * @returns A promise that resolves to a MangaResponse object containing the list of Manga and pagination info.
 */
export async function getMangas(
  genre?: string | number,
  status?: string,
  search?: string,
  minScore?: number,
  page: number = 1,
  sort?: string
): Promise<MangaResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: JIKAN_LIMIT.toString(),
    // sfw: 'true', // Optional: Ensure Safe-for-Work results
  });

  if (search) params.append('q', search);
  if (genre) params.append('genres', genre.toString());
  if (status) params.append('status', status);
  if (minScore && minScore > 0) params.append('min_score', minScore.toString()); // Add only if > 0
  if (sort) params.append('sort', sort); // Jikan uses 'sort' ('asc', 'desc') and 'order_by'
  if (sort === 'score') params.append('order_by', 'score');
  if (sort === 'popularity') params.append('order_by', 'members');

  // Default sort if no search or specific sort provided
   if (!search && !sort) {
       params.append('order_by', 'members'); // Default to sorting by popularity
       params.append('sort', 'desc');
   }


  const url = `${JIKAN_API_URL}/manga?${params.toString()}`;
  const headers: HeadersInit = { 'Accept': 'application/json' };
  let response: Response | undefined;

  try {
    await delay(JIKAN_DELAY); // Wait before making the API call
    // console.log("Fetching Jikan Manga URL:", url);
    response = await fetch(url, {
      method: 'GET',
      headers: headers,
      // Consider shorter revalidation, or none if debugging rate limits
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Jikan API response not OK:', response.status, response.statusText);
        console.error('Jikan Error Body:', errorBody);
        console.error('Jikan Request URL:', url);
        // Try to parse error body as JSON for more details
        try {
            const errorJson = JSON.parse(errorBody);
            console.error('Parsed Jikan Error Body:', errorJson);
        } catch {
             // Ignore if parsing fails, already logged raw body
        }
        throw new Error(`Jikan API request failed: ${response.status} ${response.statusText}. URL: ${url}`);
    }

    const jsonResponse: JikanMangaListResponse = await response.json();

     // Log the raw response *before* checking for the data field
     // console.log('Raw Jikan Manga Response:', JSON.stringify(jsonResponse));

     // Check if the data field is missing or not an array
     if (!jsonResponse.data || !Array.isArray(jsonResponse.data)) {
         console.error('Jikan API error: Response missing or invalid "data" field.');
         console.error('Jikan Response:', JSON.stringify(jsonResponse)); // Log the problematic response
         console.error('Jikan Request URL:', url);
         // Check if it looks like a Jikan error structure
         if (jsonResponse.status && jsonResponse.message) {
             throw new Error(`Jikan API returned error ${jsonResponse.status}: ${jsonResponse.message}`);
         } else {
             throw new Error('Jikan API response missing or invalid data field.');
         }
    }

    const pagination = jsonResponse.pagination;
    // Map only if data exists and is an array
    const mangas = jsonResponse.data.map(mapJikanDataToManga);

    return {
        mangas: mangas,
        hasNextPage: pagination?.has_next_page ?? false,
        currentPage: pagination?.current_page,
        lastPage: pagination?.last_visible_page,
    };

  } catch (error: any) {
    console.error('Failed to fetch manga from Jikan. URL:', url);
    if(response) {
        console.error('Response Status:', response.status, response.statusText);
    }
    // Log detailed fetch error
    console.error('Fetch Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    throw new Error(`Failed to fetch manga data from Jikan: ${error.message || 'Unknown fetch error'}`);
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

    try {
        await delay(JIKAN_DELAY); // Wait before making the API call
        // console.log("Fetching Jikan Manga by ID:", url);
        response = await fetch(url, {
            method: 'GET',
            headers: headers,
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (response.status === 404) {
            return null; // Not found
        }

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Jikan API response not OK:', response.status, response.statusText);
            console.error('Jikan Error Body:', errorBody);
            console.error('Jikan Request URL:', url);
             try {
                const errorJson = JSON.parse(errorBody);
                console.error('Parsed Jikan Error Body:', errorJson);
            } catch {}
            throw new Error(`Jikan API request failed: ${response.status} ${response.statusText}`);
        }

        const jsonResponse: JikanSingleMangaResponse = await response.json();

         if (!jsonResponse.data) {
             console.error('Jikan API error: Response missing data field for single manga.');
             console.error('Jikan Response:', JSON.stringify(jsonResponse));
             console.error('Jikan Request URL:', url);
             throw new Error('Jikan API response missing data field.');
         }

        return mapJikanDataToManga(jsonResponse.data);
    } catch (error: any) {
        console.error(`Failed to fetch manga with MAL ID ${mal_id} from Jikan. URL:`, url);
        if(response) {
            console.error('Response Status:', response.status, response.statusText);
        }
        console.error('Fetch Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        // Return null or re-throw based on how you want to handle errors
        return null;
        // Or: throw new Error(`Failed to fetch manga details (ID: ${mal_id}): ${error.message}`);
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
