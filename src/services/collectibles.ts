// src/services/collectibles.ts
'use server';

import { SAMPLE_COLLECTIBLES, type Collectible } from '@/types/collectibles.ts';
// Removed profile service imports as coin/ownership is no longer Firestore-based for Gacha

const GACHA_ROLL_SIZE = 4; // Number of collectibles per roll

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param array The array to shuffle.
 * @returns The shuffled array (mutated in place).
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

/**
 * Performs a Gacha roll.
 * Attempts to select a defined number of unique collectibles from SAMPLE_COLLECTIBLES.
 * If not enough unique samples are available, it will pick with replacement.
 * @returns A Promise resolving to an object containing an array of pulled Collectibles or an error object.
 */
export async function performGachaRoll(): Promise<{ collectibles: Collectible[] } | { error: string }> {
  console.log(`[CollectiblesService] Performing a Gacha roll (${GACHA_ROLL_SIZE} items).`);

  if (!SAMPLE_COLLECTIBLES || SAMPLE_COLLECTIBLES.length === 0) {
    console.error('[CollectiblesService] No sample collectibles available to roll from.');
    return { error: 'No collectibles available in the Gacha at this time.' };
  }

  const pulledCollectibles: Collectible[] = [];

  if (SAMPLE_COLLECTIBLES.length >= GACHA_ROLL_SIZE) {
    // Enough unique items: shuffle and pick the first GACHA_ROLL_SIZE
    const shuffledSamples = shuffleArray([...SAMPLE_COLLECTIBLES]); // Create a copy before shuffling
    for (let i = 0; i < GACHA_ROLL_SIZE; i++) {
      pulledCollectibles.push(shuffledSamples[i]);
    }
    console.log(`[CollectiblesService] Pulled ${GACHA_ROLL_SIZE} unique collectibles.`);
  } else {
    // Not enough unique items: pick with replacement and log a warning
    console.warn(`[CollectiblesService] Warning: Not enough unique collectibles (${SAMPLE_COLLECTIBLES.length}) for a full unique roll of ${GACHA_ROLL_SIZE}. Picking with replacement.`);
    for (let i = 0; i < GACHA_ROLL_SIZE; i++) {
      const randomIndex = Math.floor(Math.random() * SAMPLE_COLLECTIBLES.length);
      pulledCollectibles.push(SAMPLE_COLLECTIBLES[randomIndex]);
    }
    console.log(`[CollectiblesService] Pulled ${GACHA_ROLL_SIZE} collectibles (with potential duplicates).`);
  }

  return { collectibles: pulledCollectibles };
}

/**
 * Returns the list of sample collectibles.
 * (Currently returns the hardcoded list, could fetch from DB in future)
 */
export async function getDisplayCollectibles(): Promise<Collectible[]> {
  return SAMPLE_COLLECTIBLES;
}
