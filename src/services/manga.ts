
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
   published?: { from: string | null; to: string | null; string?: string | null }; // Added optional string to published.string for Jikan consistency
   authors?: { mal_id: number; type: string; name: string; url: string }[];
   themes?: { mal_id: number; type: string; name: string; url: string }[];
   demographics?: { mal_id: number; type: string; name: string; url: string }[];
}

/**
 * Represents the response structure for Jikan manga list fetch operations.
 */
export interface JikanMangaListResponse {
    data?: any[];
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
    status?: number;
    type?: string;
    message?: string;
    error?: string;
}

/**
 * Represents the response structure for Jikan single manga fetch operations.
 */
export interface JikanSingleMangaResponse {
    data: any;
    status?: number;
    type?: string;
    message?: string;
    error?: string;
}

/**
 * Represents a single manga recommendation entry from Jikan API.
 */
export interface JikanMangaRecommendationEntry {
    entry: {
        mal_id: number;
        url: string;
        images: any;
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
    status?: number;
    type?: string;
    message?: string;
    error?: string;
}

export interface MangaResponse {
    mangas: Manga[];
    hasNextPage: boolean;
    currentPage?: number;
    lastPage?: number;
}

const JIKAN_API_URL = 'https://api.jikan.moe/v4';
const DEFAULT_JIKAN_LIMIT = 24;
const JIKAN_DELAY = config.jikanApiDelayMs;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mapJikanDataToManga = (jikanData: any): Manga | null => {
   if (!jikanData || typeof jikanData.mal_id !== 'number' || !jikanData.title) {
      console.warn("[mapJikanDataToManga] Skipping invalid Jikan manga data:", JSON.stringify(jikanData).substring(0,100));
      return null;
  }
  return {
    mal_id: jikanData.mal_id,
    id: jikanData.mal_id,
    title: jikanData.title_english || jikanData.title || 'Untitled',
    genres: jikanData.genres || [],
    status: jikanData.status || null,
    synopsis: jikanData.synopsis || null,
    images: jikanData.images,
    imageUrl: jikanData.images?.jpg?.large_image_url || jikanData.images?.jpg?.image_url || jikanData.images?.webp?.large_image_url || null,
    score: jikanData.score || null,
    chapters: jikanData.chapters || null,
    volumes: jikanData.volumes || null,
    year: jikanData.published?.from ? new Date(jikanData.published.from).getFullYear() : null,
    url: jikanData.url || null,
    type: 'manga',
    relations: jikanData.relations || [],
    published: jikanData.published,
    authors: jikanData.authors || [],
    themes: jikanData.themes || [],
    demographics: jikanData.demographics || [],
  };
};

export async function getMangas(
  genre?: string | number,
  status?: string,
  search?: string,
  minScore?: number,
  page: number = 1,
  sort: string = 'popularity',
  limit: number = DEFAULT_JIKAN_LIMIT,
  sortDirection?: 'asc' | 'desc'
): Promise<MangaResponse> {
   const effectiveLimit = Math.min(limit, 25);
  const params = new URLSearchParams({ page: page.toString(), limit: effectiveLimit.toString() });

  if (search) params.append('q', search);
  if (genre) params.append('genres', genre.toString());
  if (status) params.append('status', status);
  if (minScore && minScore > 0 && minScore <= 10) params.append('min_score', minScore.toString());

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

  console.log(`[getMangas] Attempting fetch: ${url}`);
  await delay(JIKAN_DELAY);

  try {
    response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 1800 } });
    console.log(`[getMangas] Response status for ${url}: ${response.status}`);
    const responseBodyText = await response.text();

    if (!response.ok) {
        console.error(`[getMangas] Jikan API response not OK: ${response.status} "${response.statusText}"`);
        console.error('[getMangas] Jikan Error Body:', responseBodyText.substring(0, 500));
        console.error('[getMangas] Jikan Request URL:', url);
        return { mangas: [], hasNextPage: false, currentPage: page, lastPage: page };
    }

    const jsonResponse: JikanMangaListResponse = JSON.parse(responseBodyText);

    if ((jsonResponse.status && jsonResponse.status !== 200 && (jsonResponse.message || jsonResponse.error)) || (response.status !== 200 && (jsonResponse.message || jsonResponse.error))) {
        console.warn(`[getMangas] Jikan API returned an error message: Status ${jsonResponse.status || response.status}, Message: ${jsonResponse.message || jsonResponse.error}. URL: ${url}`);
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


export async function getMangaDetails(mal_id?: number, title?: string, noDelay: boolean = false): Promise<Manga | null> {
    if (!mal_id && !title) {
      console.warn("[getMangaDetails] Called with no ID and no title.");
      return null;
    }

    let url = '';
    let queryType = '';

    if (mal_id && mal_id > 0) {
      url = `${JIKAN_API_URL}/manga/${mal_id}`;
      queryType = `ID ${mal_id}`;
    } else if (title) {
      const searchResult = await getMangas(undefined, undefined, title, undefined, 1, 'rank', 1, 'asc');
      if (searchResult.mangas.length > 0) {
        url = `${JIKAN_API_URL}/manga/${searchResult.mangas[0].mal_id}`;
        queryType = `Title "${title}" (resolved to ID ${searchResult.mangas[0].mal_id})`;
      } else {
        console.log(`[getMangaDetailsByTitle] No manga found for title: "${title}"`);
        return null;
      }
    } else {
        console.warn("[getMangaDetails] Invalid parameters: must provide mal_id or title.");
        return null;
    }

    const headers: HeadersInit = { 'Accept': 'application/json' };
    let response: Response | undefined;

    console.log(`[getMangaDetails] Attempting fetch for ${queryType}: ${url}`);
    if (!noDelay) {
      await delay(JIKAN_DELAY);
    }

    try {
        response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 3600 } });
        console.log(`[getMangaDetails] Response status for ${url}: ${response.status}`);
        const responseBodyText = await response.text();

        if (response.status === 404) {
            console.warn(`[getMangaDetails] Manga not found (404) for ${queryType}. URL: ${url}`);
            return null;
        }
        if (!response.ok) {
            console.error(`[getMangaDetails] Jikan API not OK: ${response.status} for ${url}. Body: ${responseBodyText.substring(0,200)}`);
            return null;
        }

        const jsonResponse: JikanSingleMangaResponse = JSON.parse(responseBodyText);

         if ((jsonResponse.status && jsonResponse.status !== 200 && (jsonResponse.message || jsonResponse.error)) || (response.status !== 200 && (jsonResponse.message || jsonResponse.error))) {
            console.warn(`[getMangaDetails] Jikan API returned an error message for ${queryType}: Status ${jsonResponse.status || response.status}, Message: ${jsonResponse.message || jsonResponse.error}. URL: ${url}`);
            return null;
        }
        if (!jsonResponse.data) {
             console.warn(`[getMangaDetails] Jikan API missing data for ${queryType}. Resp: ${JSON.stringify(jsonResponse).substring(0,200)}`);
             return null;
        }
        return mapJikanDataToManga(jsonResponse.data);
    } catch (error: any) {
        console.error(`[getMangaDetails] Failed for ${queryType}, URL: ${url}. Error: ${error.message}`);
        return null;
    }
}


export async function getMangaRecommendations(mal_id: number): Promise<Manga[]> {
    const url = `${JIKAN_API_URL}/manga/${mal_id}/recommendations`;
    const headers: HeadersInit = { 'Accept': 'application/json' };
    let response: Response | undefined;

    console.log(`[getMangaRecommendations] Attempting fetch: ${url}`);
    await delay(JIKAN_DELAY);

    try {
        response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 3600 * 12 } });
        console.log(`[getMangaRecommendations] Response status for ${url}: ${response.status}`);
        const responseBodyText = await response.text();
        if (!response.ok) {
            console.error(`[getMangaRecommendations] Jikan API not OK: ${response.status} for ${url}. Body: ${responseBodyText.substring(0,200)}`);
            return [];
        }
        const jsonResponse: JikanMangaRecommendationsResponse = JSON.parse(responseBodyText);

        if ((jsonResponse.status && jsonResponse.status !== 200 && (jsonResponse.message || jsonResponse.error)) || (response.status !== 200 && (jsonResponse.message || jsonResponse.error))) {
            console.warn(`[getMangaRecommendations] Jikan API returned an error message for MAL ID ${mal_id}: Status ${jsonResponse.status || response.status}, Message: ${jsonResponse.message || jsonResponse.error}. URL: ${url}`);
            return [];
        }
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
