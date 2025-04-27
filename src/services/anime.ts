/**
 * Represents an Anime based on AniList data structure.
 */
export interface Anime {
  /**
   * The AniList ID of the anime.
   */
  id: number;
  /**
   * The title of the anime.
   */
  title: string;
  /**
   * The anime genres.
   */
  genre: string[];
  /**
   * The anime release year.
   */
  releaseYear: number | null; // Year can be null
  /**
   * The anime average score (0-100). Rating will be this / 10.
   */
  averageScore: number | null; // Score can be null
  /**
   * The anime rating (derived from averageScore).
   */
  rating: number | null;
  /**
   * The anime description (HTML format).
   */
  description: string | null; // Description can be null
  /**
   * The anime cover image url.
   */
  imageUrl: string | null; // Image can be null
   /**
    * The anime status (e.g., RELEASING, FINISHED).
    */
   status: string | null;
   /**
    * Number of episodes.
    */
   episodes: number | null;
   /**
    * Banner image URL (optional)
    */
   bannerImage?: string | null;
   /**
    * Trailer information (optional)
    */
   trailer?: {
     id?: string | null;
     site?: string | null; // e.g., "youtube"
     thumbnail?: string | null;
   } | null;
    /**
    * AniList URL
    */
    siteUrl?: string | null;
     /**
      * Type identifier
      */
     type: 'anime';
}

// AniList API endpoint
const ANILIST_API_URL = 'https://graphql.anilist.co';

// GraphQL query to fetch anime details including banner and trailer
const ANIME_QUERY = `
query ($page: Int, $perPage: Int, $sort: [MediaSort], $genre: String, $search: String, $id: Int) {
  Page(page: $page, perPage: $perPage) {
    media(id: $id, type: ANIME, sort: $sort, genre: $genre, search: $search, isAdult: false) {
      id
      title {
        romaji
        english
        native
      }
      genres
      startDate {
        year
      }
      averageScore
      description(asHtml: false)
      coverImage {
        large # For cards
        extraLarge # For details page potentially
      }
      bannerImage # Fetch banner image
      status
      episodes
      trailer { # Fetch trailer info
        id
        site
        thumbnail
      }
      siteUrl # Fetch AniList URL
    }
  }
}
`;

// Helper function to map AniList response to our Anime interface
const mapAniListDataToAnime = (media: any): Anime => {
  const averageScore = media.averageScore;
  const rating = averageScore ? parseFloat((averageScore / 10).toFixed(1)) : null; // Convert 0-100 to 0-10
  return {
    id: media.id,
    title: media.title.english || media.title.romaji || media.title.native || 'Untitled', // Prioritize English title
    genre: media.genres || [],
    releaseYear: media.startDate?.year || null,
    averageScore: averageScore,
    rating: rating,
    description: media.description || null,
    imageUrl: media.coverImage?.large || null, // Use large for consistency in cards
    bannerImage: media.bannerImage || null,
    status: media.status || null,
    episodes: media.episodes || null,
    trailer: media.trailer || null,
    siteUrl: media.siteUrl || null,
    type: 'anime', // Add type identifier
  };
};


/**
 * Asynchronously retrieves anime from AniList with optional filters or by ID.
 *
 * @param genre The genre to filter animes on.
 * @param releaseYear The release year to filter animes on (filtering done post-fetch).
 * @param rating The minimum rating to filter animes on (0-10 scale, filtering done post-fetch).
 * @param search Optional search term for the title.
 * @param id Optional AniList ID to fetch a specific anime.
 * @returns A promise that resolves to a list of Anime.
 */
export async function getAnimes(
  genre?: string,
  releaseYear?: number,
  rating?: number,
  search?: string,
  id?: number // Add id parameter
): Promise<Anime[]> {
  const variables: any = {
    page: 1,
    perPage: id ? 1 : 40, // Fetch 1 if ID is provided, else 40 for lists
    sort: search ? ['SEARCH_MATCH'] : ['TRENDING_DESC', 'POPULARITY_DESC'],
    genre: genre || undefined,
    search: search || undefined,
    id: id || undefined, // Include id in variables if provided
  };

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: ANIME_QUERY,
        variables: variables,
      }),
      // Using shorter revalidation for testing, increase for production
      next: { revalidate: 600 }, // Revalidate cache every 10 minutes
      // Consider adding a timeout if needed
      // signal: AbortSignal.timeout(10000) // e.g., 10 seconds timeout
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('AniList API response not OK:', response.status, response.statusText);
      console.error('AniList Error Body:', errorBody);
      console.error('AniList Request Variables:', JSON.stringify(variables)); // Log stringified variables on error
      throw new Error(`AniList API request failed: ${response.status} ${response.statusText}`);
    }

    const jsonResponse = await response.json();

    if (jsonResponse.errors) {
      console.error('AniList API errors:', jsonResponse.errors);
      console.error('AniList Request Variables:', JSON.stringify(variables)); // Log stringified variables on error
      throw new Error(`AniList API errors: ${jsonResponse.errors.map((e: any) => e.message).join(', ')}`);
    }

    let animes = jsonResponse.data?.Page?.media?.map(mapAniListDataToAnime) || [];

    // --- Client-side filtering (only for list requests, not when fetching by ID) ---
    if (!id) {
        if (releaseYear) {
        animes = animes.filter(anime => anime.releaseYear === releaseYear);
        }
        if (rating !== undefined && rating !== null) {
        animes = animes.filter(anime => anime.rating !== null && anime.rating >= rating);
        }
        // Limit results after filtering if necessary for list view
        animes = animes.slice(0, 20);
    }


    return animes;

  } catch (error: any) {
    // Log the specific error and the request variables
    console.error('Failed to fetch anime from AniList. Variables:', JSON.stringify(variables));
    // Attempt to log more detailed error information
    console.error('Fetch Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    // Re-throw the error to be handled by the calling component
    // This allows the UI to show a specific error message
    throw new Error(`Failed to fetch anime data from AniList: ${error.message || JSON.stringify(error)}`);
  }
}

/**
 * Fetches a single anime by its AniList ID.
 *
 * @param id The AniList ID of the anime to fetch.
 * @returns A promise that resolves to the Anime object or null if not found.
 */
export async function getAnimeById(id: number): Promise<Anime | null> {
    try {
        // Ensure getAnimes is called correctly to fetch by ID
        const animes = await getAnimes(undefined, undefined, undefined, undefined, id);
        return animes.length > 0 ? animes[0] : null;
    } catch (error) {
        console.error(`Failed to fetch anime with ID ${id}:`, error);
        // Return null or re-throw based on how you want to handle errors in the specific component
        return null;
        // Or: throw error;
    }
}
