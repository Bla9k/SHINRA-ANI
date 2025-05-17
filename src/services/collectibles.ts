
// src/services/collectibles.ts
'use server';

import { SAMPLE_COLLECTIBLES, type Collectible } from '@/types/collectibles';
// Removed profile service imports as coin/ownership is no longer Firestore-based for Gacha

const GACHA_COST = 0; // Set to 0 as it's free

/**
 * Returns the list of sample collectibles.
 * In a real application, this might fetch from a Firestore 'collectibles' collection.
 */
export async function getDisplayCollectibles(): Promise<Collectible[]> {
  return SAMPLE_COLLECTIBLES;
}

/**
 * Performs a Gacha roll.
 * For now, it randomly selects from SAMPLE_COLLECTIBLES.
 * No longer interacts with user coins or Firestore for ownership.
 * @returns A Promise resolving to the pulled Collectible or an error object.
 */
export async function performGachaRoll(): Promise<Collectible | { error: string }> {
  console.log('[CollectiblesService] Performing a Gacha roll (free).');

  if (!SAMPLE_COLLECTIBLES || SAMPLE_COLLECTIBLES.length === 0) {
    console.error('[CollectiblesService] No sample collectibles available to roll from.');
    return { error: 'No collectibles available in the Gacha at this time.' };
  }

  // Simulate a roll (random selection for now)
  // In a real system, this would involve rarity probabilities.
  const randomIndex = Math.floor(Math.random() * SAMPLE_COLLECTIBLES.length);
  const pulledCollectible = SAMPLE_COLLECTIBLES[randomIndex];

  console.log(`[CollectiblesService] Pulled collectible: ${pulledCollectible.parodyTitle}`);

  // No need to update coins or user's owned collectibles in Firestore for this free version
  return pulledCollectible;
}

// Removed addUserCollectible as it's not needed for the free, no-login version
