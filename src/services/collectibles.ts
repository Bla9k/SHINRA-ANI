// src/services/collectibles.ts
'use server';

import { SAMPLE_COLLECTIBLES, type Collectible } from '@/types/collectibles.ts';

const GACHA_COST = 0; // Set to 0 as it's free

/**
 * Returns the list of sample collectibles.
 */
export async function getDisplayCollectibles(): Promise<Collectible[]> {
  return SAMPLE_COLLECTIBLES;
}

/**
 * Performs a Gacha roll.
 * Randomly selects 10 collectibles from SAMPLE_COLLECTIBLES.
 * @returns A Promise resolving to an array of 10 pulled Collectibles or an error object.
 */
export async function performGachaRoll(): Promise<{ collectibles: Collectible[] } | { error: string }> {
  console.log('[CollectiblesService] Performing a Gacha roll (free, 10 items).');

  if (!SAMPLE_COLLECTIBLES || SAMPLE_COLLECTIBLES.length === 0) {
    console.error('[CollectiblesService] No sample collectibles available to roll from.');
    return { error: 'No collectibles available in the Gacha at this time.' };
  }

  const pulledCollectibles: Collectible[] = [];
  for (let i = 0; i < 10; i++) {
    // Allow replacement if sample size is small, otherwise ensure variety if sample size > 10
    const randomIndex = Math.floor(Math.random() * SAMPLE_COLLECTIBLES.length);
    pulledCollectibles.push(SAMPLE_COLLECTIBLES[randomIndex]);
  }

  console.log(`[CollectiblesService] Pulled ${pulledCollectibles.length} collectibles.`);
  return { collectibles: pulledCollectibles };
}
