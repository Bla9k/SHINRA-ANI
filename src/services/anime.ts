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
}

// AniList API endpoint
const ANILIST_API_URL = 'https://graphql.anilist.co';

// Basic GraphQL query to fetch trending anime with optional genre filter
const ANIME_QUERY = `
query ($page: Int, $perPage: Int, $sort: [MediaSort], $genre: String, $search: String) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: $sort, genre: $genre, search: $search, isAdult: false) {
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
      episodes
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
    imageUrl: media.coverImage?.extraLarge || media.coverImage?.large || null,
    status: media.status || null,
    episodes: media.episodes || null,
  };
};


/**
 * Asynchronously retrieves anime from AniList with optional filters.
 *
 * @param genre The genre to filter animes on.
 * @param releaseYear The release year to filter animes on (Not directly supported by basic query, filtering done post-fetch).
 * @param rating The minimum rating to filter animes on (0-10 scale, filtering done post-fetch).
 * @param search Optional search term for the title.
 * @returns A promise that resolves to a list of Anime.
 */
export async function getAnimes(
  genre?: string,
  releaseYear?: number,
  rating?: number,
  search?: string
): Promise<Anime[]> {
  const variables = {
    page: 1,
    perPage: 40, // Fetch more items to allow for client-side filtering
    sort: search ? ['SEARCH_MATCH'] : ['TRENDING_DESC', 'POPULARITY_DESC'], // Sort by trending/popularity if no search
    genre: genre || undefined, // Pass genre if provided
    search: search || undefined, // Pass search term if provided
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

    let animes = jsonResponse.data?.Page?.media?.map(mapAniListDataToAnime) || [];

     // --- Client-side filtering (as basic query doesn't support all) ---
     if (releaseYear) {
       animes = animes.filter(anime => anime.releaseYear === releaseYear);
     }
     if (rating !== undefined && rating !== null) {
       animes = animes.filter(anime => anime.rating !== null && anime.rating >= rating);
     }
     // Limit results after filtering if necessary
     animes = animes.slice(0, 20); // Limit to 20 results after filtering

    return animes;

  } catch (error) {
    console.error('Failed to fetch anime from AniList:', error);
    // Return empty array or re-throw error based on desired behavior
    return [];
    // throw error; // Or re-throw the error
  }
}
