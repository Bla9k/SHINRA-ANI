
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
}

/**
 * Represents the response structure for Jikan anime list fetch operations.
 */
export interface JikanAnimeListResponse {
    data: any[]; // Array of Jikan anime objects
    pagination: {
        last_visible_page: number;
        has_next_page: boolean;
        current_page: number;
        items: {
            count: number;
            total: number;
            per_page: number;
        };
    };
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
const JIKAN_LIMIT = 24; // Keep it slightly below max to be safe
// Delay between Jikan API calls in milliseconds to avoid rate limits
const JIKAN_DELAY = 400; // Increased delay (e.g., 400ms) - adjust as needed

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// Helper function to map Jikan API response to our Anime interface
const mapJikanDataToAnime = (jikanData: any): Anime => {
  return {
    mal_id: jikanData.mal_id,
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
 * @param genre The genre MAL ID (number) or name (string) to filter animes on.
 * @param year The specific release year to filter animes on.
 * @param minScore The minimum score to filter animes on (0-10 scale).
 * @param search Optional search term (query) for the title.
 * @param status Optional status string (e.g., "airing", "complete", "upcoming").
 * @param page The page number to fetch (default: 1).
 * @param sort Optional sorting parameter (e.g., "score", "popularity", "rank"). Jikan default is usually MAL ID or popularity.
 * @returns A promise that resolves to an AnimeResponse object containing the list of Anime and pagination info.
 */
export async function getAnimes(
  genre?: string | number,
  year?: number,
  minScore?: number,
  search?: string,
  status?: string,
  page: number = 1,
  sort?: string // Add sort parameter if needed for specific sorting
): Promise<AnimeResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: JIKAN_LIMIT.toString(),
    // sfw: 'true', // Ensure Safe-for-Work results, optional
  });

  if (search) params.append('q', search);
  if (genre) {
    // Jikan uses genre IDs, but we might accept names for convenience if needed
    // For now, assume ID if number, otherwise pass string (might fail if Jikan expects ID)
    params.append('genres', genre.toString());
  }
  if (year) params.append('start_date', `${year}-01-01`); // Approximate year filtering
  if (minScore && minScore > 0) params.append('min_score', minScore.toString()); // Add minScore only if > 0
  if (status) params.append('status', status);
  if (sort) params.append('sort', sort); // Example: 'desc' with 'order_by'='score'
  if (sort === 'score') params.append('order_by', 'score');
  if (sort === 'popularity') params.append('order_by', 'members'); // Jikan uses members for popularity
  // Add other order_by parameters if needed ('rank', 'title', 'episodes', etc.)


  // Jikan doesn't have a direct 'trending' sort like AniList.
  // We might default to popularity or score descending if no search term.
  if (!search && !sort) {
      params.append('order_by', 'members'); // Default to sorting by popularity (members)
      params.append('sort', 'desc');
  }

  const url = `${JIKAN_API_URL}/anime?${params.toString()}`;
  const headers: HeadersInit = {
    'Accept': 'application/json',
    // Add API key header if you have one and need it
    // 'X-Jikan-Authorization': `Bearer ${env.JIKAN_API_KEY}`
  };

  let response: Response | undefined;
  try {
    await delay(JIKAN_DELAY); // Wait before making the API call
    // console.log("Fetching Jikan URL:", url); // Log the URL being fetched
    response = await fetch(url, {
      method: 'GET', // Jikan uses GET
      headers: headers,
      // Consider shorter revalidation for Jikan as data might update less frequently than AniList trending
      next: { revalidate: 3600 }, // Revalidate cache every hour
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Jikan API response not OK:', response.status, response.statusText);
      console.error('Jikan Error Body:', errorBody);
      console.error('Jikan Request URL:', url);
      throw new Error(`Jikan API request failed: ${response.status} ${response.statusText}. URL: ${url}`);
    }

    const jsonResponse: JikanAnimeListResponse = await response.json();

    // Basic check for errors in the response structure (Jikan might not have a dedicated errors field like GraphQL)
    if (!jsonResponse.data) {
         console.error('Jikan API error: Response missing data field.');
         console.error('Jikan Response:', JSON.stringify(jsonResponse));
         console.error('Jikan Request URL:', url);
         throw new Error('Jikan API response missing data field.');
    }

    const pagination = jsonResponse.pagination;
    const animes = jsonResponse.data.map(mapJikanDataToAnime);

    return {
        animes: animes,
        hasNextPage: pagination?.has_next_page ?? false,
        currentPage: pagination?.current_page,
        lastPage: pagination?.last_visible_page,
    };

  } catch (error: any) {
    console.error('Failed to fetch anime from Jikan. URL:', url);
    if(response) {
        console.error('Response Status:', response.status, response.statusText);
    }
    console.error('Fetch Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    throw new Error(`Failed to fetch anime data from Jikan: ${error.message || 'Unknown fetch error'}`);
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

    try {
        await delay(JIKAN_DELAY); // Wait before making the API call
        // console.log("Fetching Jikan Anime by ID:", url);
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
            throw new Error(`Jikan API request failed: ${response.status} ${response.statusText}`);
        }

        const jsonResponse: JikanSingleAnimeResponse = await response.json();

        if (!jsonResponse.data) {
             console.error('Jikan API error: Response missing data field.');
             console.error('Jikan Response:', JSON.stringify(jsonResponse));
             console.error('Jikan Request URL:', url);
             throw new Error('Jikan API response missing data field.');
        }


        return mapJikanDataToAnime(jsonResponse.data);
    } catch (error: any) {
        console.error(`Failed to fetch anime with MAL ID ${mal_id} from Jikan. URL:`, url);
        if(response) {
            console.error('Response Status:', response.status, response.statusText);
        }
        console.error('Fetch Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
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
