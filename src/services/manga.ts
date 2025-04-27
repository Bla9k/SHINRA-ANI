/**
 * Represents a Manga.
 */
export interface Manga {
  /**
   * The title of the manga.
   */
  title: string;
  /**
   * The manga genres.
   */
  genre: string[];
  /**
   * The manga status.
   */
  status: string;
  /**
   * The manga description.
   */
  description: string;
  /**
   * The manga image url.
   */
  imageUrl: string;
}

/**
 * Asynchronously retrieves mangas with the given filters.
 *
 * @param genre The genre to filter mangas on.
 * @param status The status to filter mangas on.
 * @returns A promise that resolves to a list of Manga.
 */
export async function getMangas(
  genre?: string,
  status?: string
): Promise<Manga[]> {
  // TODO: Implement this by calling an API.

  // Placeholder data
  const allMangas: Manga[] = [
    {
      title: 'Berserk',
      genre: ['Action', 'Dark Fantasy', 'Adventure', 'Horror'],
      status: 'Ongoing', // Note: Often on Hiatus
      description:
        'Guts, a former mercenary now known as the "Black Swordsman," is out for revenge. After a tumultuous childhood, he finally finds someone he respects and believes he can trust, only to have everything fall apart when this person takes away everything Guts cares about.',
      imageUrl:
        'https://m.media-amazon.com/images/M/MV5BNjRmY2NjZGEtOGU5Mi00NmFmLWE0ZDQtNzMxNjBkNWQ2MmNjXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg',
    },
    {
      title: 'Vagabond',
      genre: ['Action', 'Adventure', 'Historical', 'Drama'],
      status: 'Hiatus', // Often on Hiatus
      description:
        'Based on the novel "Musashi" by Eiji Yoshikawa, Vagabond follows the journey of Shinmen Takezou, later known as Miyamoto Musashi, as he strives to become the greatest swordsman under the sun.',
      imageUrl:
        'https://m.media-amazon.com/images/M/MV5BMjE5NzA4OTE5MV5BMl5BanBnXkFtZTcwMjU4NzYwNw@@._V1_FMjpg_UX1000_.jpg', // Fixed image URL
    },
    {
      title: 'One Punch Man',
      genre: ['Action', 'Comedy', 'Sci-Fi', 'Super Power'],
      status: 'Ongoing',
      description: 'The story of Saitama, a hero that does it just for fun & can defeat enemies with a single punch.',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BZjJlNzE5ZjItZWQyYy00MmFlLTg5YjktMzJiMzk5ZjIwYTEyXkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_FMjpg_UX1000_.jpg'
    },
    {
      title: 'Chainsaw Man',
      genre: ['Action', 'Dark Fantasy', 'Supernatural'],
      status: 'Ongoing',
      description: 'Following a betrayal, a young man left for dead is reborn as a powerful devil-human hybrid after merging with his pet devil and is soon enlisted into an organization dedicated to hunting devils.',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BMzRmMGVkMzItMzA1ZS00ZGMxLTgzMzItNDRhODA1NGE5YTg5XkEyXkFqcGdeQXVyMTE0MTY2Mzk2._V1_FMjpg_UX1000_.jpg'
    },
    {
        title: 'Monster',
        genre: ['Mystery', 'Psychological', 'Thriller', 'Drama'],
        status: 'Completed',
        description: 'Dr. Kenzo Tenma, an elite neurosurgeon, is confronted with a series of suspicious deaths that intertwine with his past decision to save a young boy over the town\'s mayor.',
        imageUrl: 'https://m.media-amazon.com/images/M/MV5BZmJhZTMyYWUtMTVlZS00OTQ5LTg0MzItMDIwMWIzZmRjNTAxXkEyXkFqcGdeQXVyNjc2NjA5MTU@._V1_FMjpg_UX1000_.jpg'
    },
  ];

  // Apply filters
  let filteredMangas = allMangas;
  if (genre) {
    filteredMangas = filteredMangas.filter(manga => manga.genre.includes(genre));
  }
  if (status) {
    filteredMangas = filteredMangas.filter(manga => manga.status === status);
  }

  return filteredMangas;
}
