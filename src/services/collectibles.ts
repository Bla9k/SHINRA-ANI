// src/services/collectibles.ts
'use server';

import { SAMPLE_COLLECTIBLES, type Collectible } from '@/types/collectibles';
import { getAnimeDetails, Anime } from '@/services/anime';
import { getMangaDetails, Manga } from '@/services/manga';

const GACHA_ROLL_SIZE = 4; // Changed from 10 to 4

/**
 * Returns the list of sample collectibles.
 */
export async function getDisplayCollectibles(): Promise<Collectible[]> {
  // In a real app, this might fetch from a Firestore 'collectibles' collection
  return SAMPLE_COLLECTIBLES;
}

/**
 * Performs a Gacha roll.
 * Randomly selects a defined number of collectibles from SAMPLE_COLLECTIBLES.
 * @returns A Promise resolving to an array of pulled Collectibles or an error object.
 */
export async function performGachaRoll(): Promise<{ collectibles: Collectible[] } | { error: string }> {
  console.log(`[CollectiblesService] Performing a Gacha roll (free, ${GACHA_ROLL_SIZE} items).`);

  if (!SAMPLE_COLLECTIBLES || SAMPLE_COLLECTIBLES.length === 0) {
    console.error('[CollectiblesService] No sample collectibles available to roll from.');
    return { error: 'No collectibles available in the Gacha at this time.' };
  }

  // Ensure we have enough unique samples if SAMPLE_COLLECTIBLES.length < GACHA_ROLL_SIZE
  // For now, simple random selection with replacement if needed.
  const pulledCollectibles: Collectible[] = [];
  for (let i = 0; i < GACHA_ROLL_SIZE; i++) {
    const randomIndex = Math.floor(Math.random() * SAMPLE_COLLECTIBLES.length);
    pulledCollectibles.push(SAMPLE_COLLECTIBLES[randomIndex]);
  }

  console.log(`[CollectiblesService] Pulled ${pulledCollectibles.length} collectibles.`);
  return { collectibles: pulledCollectibles };
}
