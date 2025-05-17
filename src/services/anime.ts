
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
   source?: string; // Source material (e.g., Manga, Original)
   studios?: { mal_id: number; type: string; name: string; url: string }[];
   themes?: { mal_id: number; type: string; name: string; url: string }[];
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
    error?: string; // Jikan sometimes uses 'error' for messages
}

/**
 * Represents the response structure for Jikan single anime fetch operations.
 */
export interface JikanSingleAnimeResponse {
    data: any; // Single Jikan anime object
      // Potential error fields
    status?: number;
    type?: string;
    message?: string;
    error?: string;
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
    currentPage?: number;
    lastPage?: number;
}


// Jikan API v4 base URL
const JIKAN_API_URL = 'https://api.jikan.moe/v4';
// Default items per page for Jikan API (max 25)
const DEFAULT_JIKAN_LIMIT = 24;
// Delay between Jikan API calls in milliseconds to avoid rate limits
const JIKAN_DELAY = config.jikanApiDelayMs;

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// Helper function to map Jikan API response to our Anime interface
export const mapJikanDataToAnime = (jikanData: any): Anime | null => {
  if (!jikanData || typeof jikanData.mal_id !== 'number' || !jikanData.title) {
      console.warn("[mapJikanDataToAnime] Skipping invalid Jikan anime data:", JSON.stringify(jikanData).substring(0,100));
      return null;
  }
  return {
    mal_id: jikanData.mal_id,
    id: jikanData.mal_id,
    title: jikanData.title_english || jikanData.title || 'Untitled',
    genres: jikanData.genres || [],
    year: jikanData.year || (jikanData.aired?.from ? new Date(jikanData.aired.from).getFullYear() : null),
    score: jikanData.score || null,
    synopsis: jikanData.synopsis || null,
    images: jikanData.images,
    imageUrl: jikanData.images?.jpg?.large_image_url || jikanData.images?.jpg?.image_url || jikanData.images?.webp?.large_image_url || null,
    status: jikanData.status || null,
    episodes: jikanData.episodes || null,
    url: jikanData.url || null,
    trailer: jikanData.trailer || null,
    type: 'anime',
    relations: jikanData.relations || [],
    aired: jikanData.aired,
    source: jikanData.source,
    studios: jikanData.studios || [],
    themes: jikanData.themes || [],
  };
};


export async function getAnimes(
  genre?: string | number,
  year?: number,
  minScore?: number,
  search?: string,
  status?: string,
  page: number = 1,
  sort: string = 'popularity',
  limit: number = DEFAULT_JIKAN_LIMIT,
  sortDirection?: 'asc' | 'desc'
): Promise<AnimeResponse> {
  const effectiveLimit = Math.min(limit, 25);
  const params = new URLSearchParams({ page: page.toString(), limit: effectiveLimit.toString() });

  if (search) params.append('q', search);
  if (genre) params.append('genres', genre.toString());
  if (year) params.append('start_date', `${year}-01-01`); // Jikan uses start_date for year filtering
  if (minScore && minScore > 0 && minScore <= 10) params.append('min_score', minScore.toString());
  if (status) params.append('status', status);

  let orderBy = '';
  let effectiveSortDirection = sortDirection;

  if (!effectiveSortDirection) {
    effectiveSortDirection = (sort === 'rank' || sort === 'title') ? 'asc' : 'desc';
  }

  switch (sort) {
      case 'popularity': orderBy = 'members'; break;
      case 'score': orderBy = 'score'; break;
      case 'rank': orderBy = 'rank'; break;
      case 'title': orderBy = 'title'; break;
      case 'start_date': orderBy = 'start_date'; break;
      case 'episodes': orderBy = 'episodes'; break;
      case 'favorites': orderBy = 'favorites'; break;
      default: if(!search) orderBy = 'members'; // Default to popularity if no specific sort and no search
  }

  if (orderBy) {
     params.append('order_by', orderBy);
     params.append('sort', effectiveSortDirection);
  }

  const url = `${JIKAN_API_URL}/anime?${params.toString()}`;
  const headers: HeadersInit = { 'Accept': 'application/json' };
  let response: Response | undefined;

  console.log(`[getAnimes] Attempting fetch: ${url}`);
  await delay(JIKAN_DELAY); // Maintained delay for general list fetching

  try {
    response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 1800 } }); // Cache for 30 mins
    console.log(`[getAnimes] Response status for ${url}: ${response.status}`);

    const responseBodyText = await response.text(); // Get response text first for robust error handling

    if (!response.ok) {
      console.error(`[getAnimes] Jikan API response not OK: ${response.status} "${response.statusText}"`);
      console.error('[getAnimes] Jikan Error Body:', responseBodyText.substring(0, 500));
      console.error('[getAnimes] Jikan Request URL:', url);
      return { animes: [], hasNextPage: false, currentPage: page, lastPage: page };
    }

    const jsonResponse: JikanAnimeListResponse = JSON.parse(responseBodyText);

    if ((jsonResponse.status && jsonResponse.status !== 200 && (jsonResponse.message || jsonResponse.error)) || (response.status !== 200 && (jsonResponse.message || jsonResponse.error))) {
      console.warn(`[getAnimes] Jikan API returned an error message: Status ${jsonResponse.status || response.status}, Message: ${jsonResponse.message || jsonResponse.error}. URL: ${url}`);
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

export async function getAnimeDetails(mal_id?: number, title?: string, noDelay: boolean = false): Promise<Anime | null> {
  if (!mal_id && !title) {
    console.warn("[getAnimeDetails] Called with no ID and no title.");
    return null;
  }

  let url = '';
  let queryType = '';

  if (mal_id && mal_id > 0) {
    url = `${JIKAN_API_URL}/anime/${mal_id}`;
    queryType = `ID ${mal_id}`;
  } else if (title) {
    const searchResult = await getAnimes(undefined, undefined, undefined, title, undefined, 1, 'rank', 1, 'asc');
    if (searchResult.animes.length > 0) {
      // If found by title, use its MAL ID to get full details
      // This ensures we get the most complete data for the "best" match.
      url = `${JIKAN_API_URL}/anime/${searchResult.animes[0].mal_id}`;
      queryType = `Title "${title}" (resolved to ID ${searchResult.animes[0].mal_id})`;
    } else {
      console.log(`[getAnimeDetailsByTitle] No anime found for title: "${title}"`);
      return null;
    }
  } else {
    console.warn("[getAnimeDetails] Invalid parameters: must provide mal_id or title.");
    return null;
  }

  const headers: HeadersInit = { 'Accept': 'application/json' };
  let response: Response | undefined;

  console.log(`[getAnimeDetails] Attempting fetch for ${queryType}: ${url}`);
  if (!noDelay) {
    await delay(JIKAN_DELAY);
  }


  try {
      response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 3600 } });
      console.log(`[getAnimeDetails] Response status for ${url}: ${response.status}`);

      const responseBodyText = await response.text();

      if (response.status === 404) {
          console.warn(`[getAnimeDetails] Anime not found (404) for ${queryType}. URL: ${url}`);
          return null;
      }
      if (!response.ok) {
          console.error(`[getAnimeDetails] Jikan API not OK: ${response.status} for ${url}. Body: ${responseBodyText.substring(0,200)}`);
          return null;
      }

      const jsonResponse: JikanSingleAnimeResponse = JSON.parse(responseBodyText);

      if ((jsonResponse.status && jsonResponse.status !== 200 && (jsonResponse.message || jsonResponse.error)) || (response.status !== 200 && (jsonResponse.message || jsonResponse.error))) {
        console.warn(`[getAnimeDetails] Jikan API returned an error message for ${queryType}: Status ${jsonResponse.status || response.status}, Message: ${jsonResponse.message || jsonResponse.error}. URL: ${url}`);
        return null;
      }
      if (!jsonResponse.data) {
           console.warn(`[getAnimeDetails] Jikan API missing data for ${queryType}. Resp: ${JSON.stringify(jsonResponse).substring(0,200)}`);
           return null;
      }
      return mapJikanDataToAnime(jsonResponse.data);
  } catch (error: any) {
      console.error(`[getAnimeDetails] Failed for ${queryType}, URL: ${url}. Error: ${error.message}`);
      return null;
  }
}


export async function getAnimeRecommendations(mal_id: number): Promise<Anime[]> {
    const url = `${JIKAN_API_URL}/anime/${mal_id}/recommendations`;
    const headers: HeadersInit = { 'Accept': 'application/json' };
    let response: Response | undefined;

    console.log(`[getAnimeRecommendations] Attempting fetch: ${url}`);
    await delay(JIKAN_DELAY);

    try {
        response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 3600 * 12 } });
        console.log(`[getAnimeRecommendations] Response status for ${url}: ${response.status}`);
        const responseBodyText = await response.text();
        if (!response.ok) {
            console.error(`[getAnimeRecommendations] Jikan API not OK: ${response.status} for ${url}. Body: ${responseBodyText.substring(0,200)}`);
            return [];
        }
        const jsonResponse: JikanAnimeRecommendationsResponse = JSON.parse(responseBodyText);

        if ((jsonResponse.status && jsonResponse.status !== 200 && (jsonResponse.message || jsonResponse.error)) || (response.status !== 200 && (jsonResponse.message || jsonResponse.error))) {
            console.warn(`[getAnimeRecommendations] Jikan API returned an error message for MAL ID ${mal_id}: Status ${jsonResponse.status || response.status}, Message: ${jsonResponse.message || jsonResponse.error}. URL: ${url}`);
            return [];
        }
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


export async function getSeasonAnime(
  year: number,
  season: 'winter' | 'spring' | 'summer' | 'fall',
  page: number = 1,
  limit: number = DEFAULT_JIKAN_LIMIT
): Promise<AnimeResponse> {
  const effectiveLimit = Math.min(limit, 25);
  const params = new URLSearchParams({ page: page.toString(), limit: effectiveLimit.toString() });

  const url = `${JIKAN_API_URL}/seasons/${year}/${season}?${params.toString()}`;
  const headers: HeadersInit = { 'Accept': 'application/json' };
  let response: Response | undefined;

  console.log(`[getSeasonAnime] Attempting fetch: ${url}`);
  await delay(JIKAN_DELAY);

  try {
    response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 3600 * 24 } });
    console.log(`[getSeasonAnime] Response status for ${url}: ${response.status}`);
    const responseBodyText = await response.text();

    if (!response.ok) {
      console.error(`[getSeasonAnime] Jikan API not OK: ${response.status} for ${url}. Body: ${responseBodyText.substring(0,500)}`);
      return { animes: [], hasNextPage: false, currentPage: page, lastPage: page };
    }

    const jsonResponse: JikanAnimeListResponse = JSON.parse(responseBodyText);
    if ((jsonResponse.status && jsonResponse.status !== 200 && (jsonResponse.message || jsonResponse.error)) || (response.status !== 200 && (jsonResponse.message || jsonResponse.error))) {
        console.warn(`[getSeasonAnime] Jikan API returned error ${jsonResponse.status || response.status} in response: ${jsonResponse.message || jsonResponse.error}. URL: ${url}`);
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
