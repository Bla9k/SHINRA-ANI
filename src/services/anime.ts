
import { config as appConfig } from '@/config'; // Renamed import to avoid conflict

/**
 * Represents an Anime based on Jikan API v4 data structure.
 */
export interface Anime {
  mal_id: number;
  title: string;
  genres: { mal_id: number; type: string; name: string; url: string }[];
  year: number | null;
  score: number | null;
  synopsis: string | null;
  images: {
      jpg: { image_url: string | null; small_image_url: string | null; large_image_url: string | null; };
      webp: { image_url: string | null; small_image_url: string | null; large_image_url: string | null; };
  };
  status: string | null;
  episodes: number | null;
  url: string | null;
  trailer: {
      youtube_id: string | null; url: string | null; embed_url: string | null;
      images: { image_url: string | null; small_image_url: string | null; medium_image_url: string | null; large_image_url: string | null; maximum_image_url: string | null; } | null;
  } | null;
  type: 'anime';
  imageUrl: string | null;
  id: number;
  relations?: Array<{ relation: string, entry: Array<{ mal_id: number, type: string, name: string, url: string }> }>;
  aired?: { from: string | null; to: string | null; };
  source?: string;
  studios?: { mal_id: number; type: string; name: string; url: string }[];
  themes?: { mal_id: number; type: string; name: string; url: string }[];
}

export interface JikanAnimeListResponse {
    data?: any[];
    pagination?: { last_visible_page: number; has_next_page: boolean; current_page: number; items: { count: number; total: number; per_page: number; }; };
    status?: number; type?: string; message?: string; error?: string;
}

export interface JikanSingleAnimeResponse {
    data: any;
    status?: number; type?: string; message?: string; error?: string;
}

export interface JikanAnimeRecommendationEntry {
    entry: { mal_id: number; url: string; images: any; title: string; };
    url: string; votes: number;
}

export interface JikanAnimeRecommendationsResponse {
    data?: JikanAnimeRecommendationEntry[];
    status?: number; type?: string; message?: string; error?: string;
}

export interface AnimeResponse {
    animes: Anime[];
    hasNextPage: boolean;
    currentPage?: number;
    lastPage?: number;
}

const JIKAN_API_URL = 'https://api.jikan.moe/v4';
const DEFAULT_JIKAN_LIMIT = 24;
// JIKAN_DELAY is now imported from appConfig

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  if (year) params.append('start_date', `${year}-01-01`);
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
      default: if(!search) orderBy = 'members';
  }

  if (orderBy) {
     params.append('order_by', orderBy);
     if (effectiveSortDirection) params.append('sort', effectiveSortDirection);
  }

  const url = `${JIKAN_API_URL}/anime?${params.toString()}`;
  const headers: HeadersInit = { 'Accept': 'application/json' };
  let response: Response | undefined;

  console.log(`[getAnimes] Attempting fetch: ${url}`);
  await delay(appConfig.jikanApiDelayMs);

  try {
    response = await fetch(url, { method: 'GET', headers: headers, next: { revalidate: 1800 } });
    console.log(`[getAnimes] Response status for ${url}: ${response.status}`);

    const responseBodyText = await response.text();

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
    await delay(appConfig.jikanApiDelayMs);
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
    await delay(appConfig.jikanApiDelayMs);

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
  await delay(appConfig.jikanApiDelayMs);

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
// Helper function to get an anime by its MAL ID, typically for internal use or when ID is known.
export async function getAnimeById(malId: number, noDelay: boolean = false): Promise<Anime | null> {
    if (!malId) {
        console.warn('[getAnimeById] MAL ID is required.');
        return null;
    }
    return getAnimeDetails(malId, undefined, noDelay);
}
