/**
 * Represents an Anime.
 */
export interface Anime {
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
  releaseYear: number;
  /**
   * The anime rating.
   */
  rating: number;
  /**
   * The anime description.
   */
  description: string;
  /**
   * The anime image url.
   */
  imageUrl: string;
}

/**
 * Asynchronously retrieves anime with the given filters.
 *
 * @param genre The genre to filter animes on.
 * @param releaseYear The release year to filter animes on.
 * @param rating The rating to filter animes on.
 * @returns A promise that resolves to a list of Anime.
 */
export async function getAnimes(
  genre?: string,
  releaseYear?: number,
  rating?: number
): Promise<Anime[]> {
  // TODO: Implement this by calling an API.

  // Placeholder data
  const allAnimes: Anime[] = [
    {
      title: 'Attack on Titan',
      genre: ['Action', 'Drama', 'Fantasy', 'Mystery'],
      releaseYear: 2013,
      rating: 8.8,
      description:
        'After his hometown is destroyed, young Eren Yeager vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.',
      imageUrl:
        'https://m.media-amazon.com/images/M/MV5BNzc5MTczNDQtNDFjNi00ZDU5LWFkNzItOTE1NzQzMzdhNzE0XkEyXkFqcGdeQXVyNzEzNzYxMDA@._V1_.jpg',
    },
    {
      title: 'One Piece',
      genre: ['Adventure', 'Comedy', 'Action', 'Fantasy'],
      releaseYear: 1999,
      rating: 8.9, // Updated rating based on common consensus
      description:
        'Follows the adventures of Monkey D. Luffy and his pirate crew in order to find the greatest treasure ever left behind by the legendary Pirate, Gol D Roger. The famous mystery treasure is named "One Piece".', // Completed description
      imageUrl:
        'https://m.media-amazon.com/images/M/MV5BODcwNWE3OTMtMDc3MS00NDFjLWE1OTAtNDU3NjgxODMxY2UyXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_FMjpg_UX1000_.jpg', // Found a more representative image URL
    },
    {
      title: 'Jujutsu Kaisen',
      genre: ['Action', 'Supernatural', 'Fantasy'],
      releaseYear: 2020,
      rating: 8.7,
      description: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman school to be able to locate the demon\'s other body parts and thus exorcise himself.',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BNGY4MTg3NzgtMmFkZi00NTg5LWExMmEtMWI3YzI1ODdmMWQ1XkEyXkFqcGdeQXVyMjQwMDg0Ng@@._V1_FMjpg_UX1000_.jpg'
    },
    {
      title: 'Spy x Family',
      genre: ['Comedy', 'Action', 'Slice of Life'],
      releaseYear: 2022,
      rating: 8.6,
      description: 'A spy on an undercover mission gets married and adopts a child, not realizing that the girl is a telepath, and the woman is an assassin.',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BMDIxMjY0YjgtYjA0MS00ZjY1LWIyZmUtNTIxMGYxMDg1NjQ5XkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_.jpg'
    },
    {
        title: 'Demon Slayer: Kimetsu no Yaiba',
        genre: ['Action', 'Fantasy', 'Adventure'],
        releaseYear: 2019,
        rating: 8.7,
        description: 'A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.',
        imageUrl: 'https://m.media-amazon.com/images/M/MV5BZjZjNzI5MDctY2Y4YS00NmM4LTljMmItZTFkOTExNGI3ODRhXkEyXkFqcGdeQXVyNjc3MjQzNTI@._V1_FMjpg_UX1000_.jpg'
    },
     {
        title: 'Fullmetal Alchemist: Brotherhood',
        genre: ['Action', 'Adventure', 'Drama', 'Fantasy'],
        releaseYear: 2009,
        rating: 9.1,
        description: 'Two brothers search for a Philosopher\'s Stone after an attempt to revive their deceased mother goes awry and leaves them in damaged physical forms.',
        imageUrl: 'https://m.media-amazon.com/images/M/MV5BZmEzN2YzOTItMDI5MS00MGU4LWI1NWQtOTg5ZThhNGQwYTEzXkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_FMjpg_UX1000_.jpg'
    },
  ];

  // Apply filters
  let filteredAnimes = allAnimes;
  if (genre) {
    filteredAnimes = filteredAnimes.filter(anime => anime.genre.includes(genre));
  }
  if (releaseYear) {
    filteredAnimes = filteredAnimes.filter(anime => anime.releaseYear === releaseYear);
  }
  if (rating) {
    filteredAnimes = filteredAnimes.filter(anime => anime.rating >= rating);
  }

  return filteredAnimes;
}
