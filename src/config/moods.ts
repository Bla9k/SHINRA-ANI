
// src/config/moods.ts
import type { LucideIcon } from 'lucide-react';
import { Smile, CloudLightning, Coffee, HeartCrack, Zap, Shield, Drama, Ghost, Brain } from 'lucide-react'; // Added more icons

export interface Mood {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  genreIds?: string[]; // Jikan Genre IDs (comma-separated string for URL param)
  keywords?: string[]; // Keywords for Jikan 'q' search (space-separated string for URL param)
}

export const MOOD_FILTERS_ANIME: Mood[] = [
  {
    id: 'heartwarming',
    name: 'Heartwarming',
    icon: Smile,
    description: 'Feel-good and uplifting stories that warm the soul.',
    genreIds: ['36' /* Slice of Life */, '4' /* Comedy */, '22' /* Romance */, '15' /* Kids (sometimes) */],
    keywords: ['iyashikei', 'uplifting', 'healing'],
  },
  {
    id: 'adrenaline-rush',
    name: 'Adrenaline Rush',
    icon: Zap,
    description: 'Fast-paced action, thrilling sequences, and excitement.',
    genreIds: ['1' /* Action */, '30' /* Sports */, '2' /* Adventure */, '38' /* Military */],
    keywords: ['high stakes', 'intense battles'],
  },
  {
    id: 'dark-thought-provoking',
    name: 'Dark & Deep',
    icon: Brain,
    description: 'Intense narratives, psychological depth, and mature themes.',
    genreIds: ['40' /* Psychological */, '8' /* Drama */, '7' /* Mystery */, '14' /* Horror */, '41' /* Thriller */],
    keywords: ['philosophical', 'suspense', 'existential'],
  },
  {
    id: 'comfy-cozy',
    name: 'Comfy & Cozy',
    icon: Coffee,
    description: 'Relaxing, easy-going shows perfect for unwinding.',
    genreIds: ['36' /* Slice of Life */, '10' /* Fantasy (often slice-of-life) */, '15' /* Kids */],
    keywords: ['iyashikei', 'slice of life', 'relaxing', 'chill'],
  },
  {
    id: 'emotional-rollercoaster',
    name: 'Emotional Ride',
    icon: Drama, // Changed from HeartCrack for a broader emotional scope
    description: 'Stories that will tug at your heartstrings and take you on a journey.',
    genreIds: ['8' /* Drama */, '22' /* Romance */, '37' /* Supernatural (often with drama) */, '36' /* Slice of Life (can be emotional) */],
    keywords: ['bittersweet', 'tearjerker', 'character development'],
  },
  {
    id: 'epic-adventure',
    name: 'Epic Adventure',
    icon: Ghost, // Using Ghost for a sense of journey/otherworldly
    description: 'Grand journeys, fantastical worlds, and high stakes.',
    genreIds: ['2' /* Adventure */, '10' /* Fantasy */, '24' /* Sci-Fi */, '13' /* Historical (epic scope) */],
    keywords: ['world-building', 'quest', 'exploration'],
  },
];

// Placeholder for manga moods if we decide to differentiate them later
export const MOOD_FILTERS_MANGA: Mood[] = MOOD_FILTERS_ANIME; // For now, same as anime
