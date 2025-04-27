
/**
 * Represents a Manga based on AniList data structure.
 */
export interface Manga {
  /**
   * The AniList ID of the manga.
   */
  id: number;
  /**
   * The title of the manga.
   */
  title: string;
  /**
   * The manga genres.
   */
  genre: string[];
  /**
   * The manga status (e.g., RELEASING, FINISHED).
   */
  status: string | null; // Status can be null
  /**
   * The manga description (HTML format).
   */
  description: string | null; // Description can be null
  /**
   * The manga cover image url.
   */
  imageUrl: string | null; // Image can be null
   /**
    * The manga average score (0-100).
    */
   averageScore: number | null;
   /**
    * Number of chapters.
    */
   chapters: number | null;
   /**
    * Number of volumes.
    */
   volumes: number | null;
    /**
    * The release year.
    */
   releaseYear: number | null;
   /**
    * Banner image URL (optional)
    */
   bannerImage?: string | null;
    /**
    * AniList URL
    */
    siteUrl?: string | null;
     /**
      * Type identifier
      */
     type: 'manga';
}

// AniList API endpoint (kept for structure, but key won't work here)
const ANILIST_API_URL = 'https://graphql.anilist.co';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // Read key from environment

// GraphQL query to fetch manga details including banner
const MANGA_QUERY = `
query ($page: Int, $perPage: Int, $sort: [MediaSort], $genre: String, $status: MediaStatus, $search: String, $id: Int) {
  Page(page: $page, perPage: $perPage) {
    media(id: $id, type: MANGA, sort: $sort, genre: $genre, status: $status, search: $search, isAdult: false) {
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
      chapters
      volumes
      siteUrl # Fetch AniList URL
    }
  }
}
`;

// Helper function to map AniList response to our Manga interface
const mapAniListDataToManga = (media: any): Manga => {
  return {
    id: media.id,
    title: media.title.english || media.title.romaji || media.title.native || 'Untitled',
    genre: media.genres || [],
    status: media.status || null,
    description: media.description || null,
    imageUrl: media.coverImage?.large || null, // Use large for consistency in cards
    bannerImage: media.bannerImage || null,
    averageScore: media.averageScore || null,
    chapters: media.chapters || null,
    volumes: media.volumes || null,
    releaseYear: media.startDate?.year || null,
    siteUrl: media.siteUrl || null,
    type: 'manga', // Add type identifier
  };
};

/**
 * Asynchronously retrieves manga from AniList with optional filters or by ID.
 * Includes RapidAPI key in headers as requested, though likely incompatible with AniList.
 *
 * @param genre The genre to filter mangas on.
 * @param status The status to filter mangas on (e.g., RELEASING, FINISHED).
 * @param search Optional search term for the title.
 * @param id Optional AniList ID to fetch a specific manga.
 * @returns A promise that resolves to a list of Manga.
 */
export async function getMangas(
  genre?: string,
  status?: string,
  search?: string,
  id?: number // Add id parameter
): Promise<Manga[]> {
   const variables: any = {
    page: 1,
    perPage: id ? 1 : 40, // Fetch 1 if ID is provided, else 40 for lists
    sort: search ? ['SEARCH_MATCH'] : ['TRENDING_DESC', 'POPULARITY_DESC'],
    genre: genre || undefined,
    status: status ? status.toUpperCase().replace(' ', '_') : undefined,
    search: search || undefined,
    id: id || undefined, // Include id in variables if provided
  };

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
  };

  // Add RapidAPI key header if it exists
  if (RAPIDAPI_KEY) {
      headers['X-RapidAPI-Key'] = RAPIDAPI_KEY;
      // Note: You might also need 'X-RapidAPI-Host' depending on the actual RapidAPI endpoint
      // headers['X-RapidAPI-Host'] = 'your-rapidapi-host.com';
  } else {
       console.warn("RAPIDAPI_KEY environment variable not set.");
      // Optionally throw an error or proceed without the key depending on requirements
      // throw new Error("RAPIDAPI_KEY environment variable is required.");
  }

  let response: Response | undefined;
  try {
    response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: headers, // Use updated headers
      body: JSON.stringify({
        query: MANGA_QUERY,
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

    let mangas = jsonResponse.data?.Page?.media?.map(mapAniListDataToManga) || [];

    // Limit results if needed (only for list requests, not when fetching by ID)
    if (!id) {
        mangas = mangas.slice(0, 20);
    }

    return mangas;

  } catch (error: any) {
    // Log the specific error and the request variables
    console.error('Failed to fetch manga from AniList. Variables:', JSON.stringify(variables)); // Log stringified variables
     // Log the response status if available
    if(response) {
        console.error('Response Status:', response.status, response.statusText);
    }
    // Attempt to log more detailed error information
    // Avoid stringifying the raw error object directly as it might be complex/circular
    console.error('Fetch Error Message:', error.message);
    if (error instanceof Error) {
        console.error('Error Name:', error.name);
        console.error('Error Stack:', error.stack);
    }

    // Re-throw the error to be handled by the calling component
    throw new Error(`Failed to fetch manga data from AniList: ${error.message || 'Unknown fetch error'}`);
  }
}


/**
 * Fetches a single manga by its AniList ID.
 *
 * @param id The AniList ID of the manga to fetch.
 * @returns A promise that resolves to the Manga object or null if not found.
 */
export async function getMangaById(id: number): Promise<Manga | null> {
    try {
        // Ensure getMangas is called correctly to fetch by ID
        const mangas = await getMangas(undefined, undefined, undefined, id);
        return mangas.length > 0 ? mangas[0] : null;
    } catch (error) {
        console.error(`Failed to fetch manga with ID ${id}:`, error);
        // Return null or re-throw based on how you want to handle errors in the specific component
        return null;
        // Or: throw error;
    }
}
