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
}

// AniList API endpoint
const ANILIST_API_URL = 'https://graphql.anilist.co';

// Basic GraphQL query to fetch trending manga with optional genre/status filter
const MANGA_QUERY = `
query ($page: Int, $perPage: Int, $sort: [MediaSort], $genre: String, $status: MediaStatus, $search: String) {
  Page(page: $page, perPage: $perPage) {
    media(type: MANGA, sort: $sort, genre: $genre, status: $status, search: $search, isAdult: false) {
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
        large
        extraLarge
      }
      status
      chapters
      volumes
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
    imageUrl: media.coverImage?.extraLarge || media.coverImage?.large || null,
    averageScore: media.averageScore || null,
    chapters: media.chapters || null,
    volumes: media.volumes || null,
    releaseYear: media.startDate?.year || null,
  };
};

/**
 * Asynchronously retrieves manga from AniList with optional filters.
 *
 * @param genre The genre to filter mangas on.
 * @param status The status to filter mangas on (e.g., RELEASING, FINISHED, NOT_YET_RELEASED, CANCELLED, HIATUS).
 * @param search Optional search term for the title.
 * @returns A promise that resolves to a list of Manga.
 */
export async function getMangas(
  genre?: string,
  status?: string,
  search?: string
): Promise<Manga[]> {
  const variables: {
      page: number;
      perPage: number;
      sort: string[];
      genre?: string;
      status?: string;
      search?: string;
    } = {
    page: 1,
    perPage: 40, // Fetch more for potential filtering
    sort: search ? ['SEARCH_MATCH'] : ['TRENDING_DESC', 'POPULARITY_DESC'],
    genre: genre || undefined,
    // Map user-friendly status to AniList MediaStatus enum if needed
    status: status ? status.toUpperCase().replace(' ', '_') : undefined, // Basic mapping
    search: search || undefined,
  };


  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: MANGA_QUERY,
        variables: variables,
      }),
       // Add cache control if needed, e.g., revalidate every hour
      next: { revalidate: 3600 }
    });

     if (!response.ok) {
      console.error('AniList API response not OK:', response.status, response.statusText);
      const errorBody = await response.text();
      console.error('Error Body:', errorBody);
      throw new Error(`AniList API request failed: ${response.status}`);
     }

    const jsonResponse = await response.json();

     if (jsonResponse.errors) {
       console.error('AniList API errors:', jsonResponse.errors);
       throw new Error(`AniList API errors: ${jsonResponse.errors.map((e: any) => e.message).join(', ')}`);
     }


    let mangas = jsonResponse.data?.Page?.media?.map(mapAniListDataToManga) || [];

     // Limit results if needed (after potential filtering, though filtering here is basic)
     mangas = mangas.slice(0, 20);

    return mangas;

  } catch (error) {
    console.error('Failed to fetch manga from AniList:', error);
    return [];
    // throw error;
  }
}
