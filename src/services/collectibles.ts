// src/services/collectibles.ts
'use server';

import { SAMPLE_COLLECTIBLES, SAMPLE_PACKS, type Collectible, type CollectibleRarity, type GachaPack } from '@/types/collectibles.ts';
import {
    GACHA_ROLL_SIZE,
    // GACHA_RARITY_RATES, // Pity/Rate system disabled for now
    // PITY_TARGET_RARITIES,
    // HARD_PITY_COUNT,
    // SOFT_PITY_START_COUNT,
    // SOFT_PITY_INCREASE_RATE,
    // PITY_DISTRIBUTION
} from '@/config/gachaConfig.ts';
// User profile import removed as pity system is disabled
// import { getUserProfileDocument, updateUserProfileDocument, type UserProfileData } from './profile';

const EVOLUTION_CHANCE = 0.10; // 10% chance to evolve if possible

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param array The array to shuffle.
 * @returns The shuffled array (mutated in place).
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export async function performGachaRoll(packId?: string): Promise<{ collectibles: Collectible[] } | { error: string }> {
    console.log(`[GachaService] Performing Gacha roll. PackID: ${packId}`);

    let rollablePool = [...SAMPLE_COLLECTIBLES]; // Use a copy
    let currentPackName = 'General Pool';

    if (packId) {
        const currentPack = SAMPLE_PACKS.find(p => p.id === packId);
        if (currentPack) {
            rollablePool = SAMPLE_COLLECTIBLES.filter(c => currentPack.collectibleIds.includes(c.id));
            currentPackName = currentPack.name;
            console.log(`[GachaService] Rolling from pack "${currentPackName}". Pool size: ${rollablePool.length}`);
            if (rollablePool.length === 0) {
                return { error: `Pack "${currentPackName}" has no collectibles defined or available.` };
            }
        } else {
            return { error: `Gacha Pack with ID "${packId}" not found.` };
        }
    } else {
        console.log(`[GachaService] Performing general roll. Pool size: ${rollablePool.length}`);
    }

    if (rollablePool.length === 0) {
      console.error('[GachaService] No rollable collectibles available for this roll/pack.');
      return { error: 'No collectibles available for this Gacha roll.' };
    }

    const pulledCollectiblesThisRoll: Collectible[] = [];

    // Simplified roll logic: Randomly pick GACHA_ROLL_SIZE items
    // Attempt to make them unique within this roll if possible
    if (rollablePool.length >= GACHA_ROLL_SIZE) {
        const shuffledPool = shuffleArray(rollablePool);
        for (let i = 0; i < GACHA_ROLL_SIZE; i++) {
            pulledCollectiblesThisRoll.push(shuffledPool[i]);
        }
    } else {
        // Not enough unique items, pick with replacement
        console.warn(`[GachaService] Not enough unique collectibles in the pool (${rollablePool.length}) for a roll of ${GACHA_ROLL_SIZE}. Picking with replacement.`);
        for (let i = 0; i < GACHA_ROLL_SIZE; i++) {
            pulledCollectiblesThisRoll.push(rollablePool[Math.floor(Math.random() * rollablePool.length)]);
        }
    }

    // Apply evolution chance to each pulled collectible
    const finalRolledCollectibles = pulledCollectiblesThisRoll.map(collectible => {
        let finalCollectible = { ...collectible };
        if (finalCollectible.evolvesToId && Math.random() < EVOLUTION_CHANCE) {
            const evolvedForm = SAMPLE_COLLECTIBLES.find(c => c.id === finalCollectible.evolvesToId);
            if (evolvedForm) {
                console.log(`[GachaService] Lucky Evolution! ${finalCollectible.parodyTitle} evolved into ${evolvedForm.parodyTitle}`);
                finalCollectible = { ...evolvedForm };
            }
        }
        return finalCollectible;
    });


    console.log(`[GachaService] Roll complete for ${currentPackName}. Pulled: ${finalRolledCollectibles.map(c => c.parodyTitle).join(', ')}`);
    return { collectibles: finalRolledCollectibles };
}

// Function to get display collectibles (currently sample, could be from DB later)
export async function getDisplayCollectibles(): Promise<Collectible[]> {
  return SAMPLE_COLLECTIBLES;
}
