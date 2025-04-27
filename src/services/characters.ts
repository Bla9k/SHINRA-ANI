
import { env } from '@/env';

/**
 * Represents a Character Search Result based on Jikan API v4 data structure.
 */
export interface CharacterSearchResult {
  mal_id: number;
  url: string;
  images?: {
    jpg?: { image_url: string | null };
    webp?: { image_url: string | null; small_image_url: string | null };
  };
  name: string;
  name_kanji?: string | null;
  nicknames?: string[];
  favorites?: number;
  about?: string | null;
   // Relations - simplified for search results, detail fetches might need more
   anime?: Array<{
       role: string;
       anime: {
           mal_id: number;
           url: string;
           images?: {
              jpg?: { image_url: string | null };
              webp?: { image_url: string | null; small_image_url: string | null };
           };
           title: string;
       };
   }>;
    manga?: Array<{
       role: string;
       manga: {
           mal_id: number;
           url: string;
           images?: {
              jpg?: { image_url: string | null };
              webp?: { image_url: string | null; small_image_url: string | null };
           };
           title: string;
       };
   }>;
    // voices? : Actor[]; // Might add later if needed for detailed view
}

/**
 * Represents the response structure for Jikan character search operations.
 */
export interface JikanCharacterSearchResponse {
    data?: any[]; // Array of Jikan character objects
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
    // Error fields
    status?: number;
    type?: string;
    message?: string;
    error?: string;
}

// Jikan API v4 base URL
const JIKAN_API_URL = 'https://api.jikan.moe/v4';
// Delay between Jikan API calls in milliseconds
const JIKAN_DELAY = 1500; // ~1.5 second delay

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// Helper function to map Jikan API response to our CharacterSearchResult interface
const mapJikanDataToCharacter = (jikanData: any): CharacterSearchResult | null => {
    if (!jikanData || typeof jikanData.mal_id !== 'number' || !jikanData.name) {
        console.warn("Skipping invalid Jikan character data:", jikanData);
        return null;
    }
    return {
        mal_id: jikanData.mal_id,
        url: jikanData.url,
        images: jikanData.images,
        name: jikanData.name,
        name_kanji: jikanData.name_kanji,
        nicknames: jikanData.nicknames || [],
        favorites: jikanData.favorites,
        about: jikanData.about,
        // Keep anime/manga relations if present in search result (they often are)
        anime: jikanData.anime,
        manga: jikanData.manga,
    };
};


/**
 * Asynchronously searches for characters by name using Jikan API v4.
 * Includes delay to mitigate rate limiting.
 *
 * @param name The character name to search for.
 * @param page The page number to fetch (default: 1).
 * @param limit Optional number of items per page (defaults to 15 for characters).
 * @returns A promise that resolves to an array of CharacterSearchResult objects.
 */
export async function searchCharacters(
    name: string,
    page: number = 1,
    limit: number = 15 // Jikan default is 15 for characters
): Promise<CharacterSearchResult[]> {
    const effectiveLimit = Math.min(limit, 25); // Still cap at 25 max

    const params = new URLSearchParams({
        q: name,
        page: page.toString(),
        limit: effectiveLimit.toString(),
    });

    const url = `${JIKAN_API_URL}/characters?${params.toString()}`;
    const headers: HeadersInit = { 'Accept': 'application/json' };
    let response: Response | undefined;

    console.log(`Attempting to fetch Jikan Character URL: ${url} with delay ${JIKAN_DELAY}ms`);
    await delay(JIKAN_DELAY); // Wait before making the API call

    try {
        response = await fetch(url, {
            method: 'GET',
            headers: headers,
            next: { revalidate: 3600 * 6 }, // Cache character search for 6 hours
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Jikan Character Search API response not OK: ${response.status} "${response.statusText}"`);
            console.error('Jikan Error Body:', errorBody);
            console.error('Jikan Request URL:', url);
             if (response.status === 429) {
                console.warn("Jikan API rate limit likely exceeded. Consider increasing JIKAN_DELAY.");
             }
            // Throw a specific error or return empty array
            // throw new Error(`Jikan Character Search failed: ${response.status} ${response.statusText}`);
            return []; // Return empty array on failure for graceful handling in tools/flows
        }

        const jsonResponse: JikanCharacterSearchResponse = await response.json();

        if (!jsonResponse.data || !Array.isArray(jsonResponse.data)) {
            console.warn('Jikan Character Search API response OK but missing or invalid "data" field.');
            console.warn('Jikan Response:', JSON.stringify(jsonResponse));
            console.warn('Jikan Request URL:', url);
            return []; // Return empty array if data is invalid
        }

        const characters = jsonResponse.data
                            .map(mapJikanDataToCharacter)
                            .filter((char): char is CharacterSearchResult => char !== null); // Filter out nulls

        console.log(`Successfully fetched ${characters.length} characters for query "${name}"`);
        return characters;

    } catch (error: any) {
        console.error(`Failed to search characters "${name}" from Jikan. URL: ${url}`);
        if(response) {
            console.error('Response Status:', response.status, response.statusText);
        }
        console.error('Fetch Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return []; // Return empty array on fetch error
    }
}

// Add getCharacterById if needed later for full details page
/*
export async function getCharacterById(id: number): Promise<CharacterSearchResult | null> {
    // Implementation similar to getAnimeById/getMangaById
}
*/
