
// src/services/collectibles.ts
'use server';

import { SAMPLE_COLLECTIBLES, type Collectible } from '@/types/collectibles.ts'; // Added .ts extension

const GACHA_COST = 0; // Set to 0 as it's free

/**
 * Returns the list of sample collectibles.
 */
export async function getDisplayCollectibles(): Promise<Collectible[]> {
  return SAMPLE_COLLECTIBLES;
}

/**
 * Performs a Gacha roll.
 * Randomly selects from SAMPLE_COLLECTIBLES.
 * @returns A Promise resolving to the pulled Collectible or an error object.
 */
export async function performGachaRoll(): Promise<Collectible | { error: string }> {
  console.log('[CollectiblesService] Performing a Gacha roll (free).');

  if (!SAMPLE_COLLECTIBLES || SAMPLE_COLLECTIBLES.length === 0) {
    console.error('[CollectiblesService] No sample collectibles available to roll from.');
    return { error: 'No collectibles available in the Gacha at this time.' };
  }

  // Simulate a roll (random selection for now)
  const randomIndex = Math.floor(Math.random() * SAMPLE_COLLECTIBLES.length);
  const pulledCollectible = SAMPLE_COLLECTIBLES[randomIndex];

  console.log(`[CollectiblesService] Pulled collectible: ${pulledCollectible.parodyTitle}`);

  return pulledCollectible;
}
