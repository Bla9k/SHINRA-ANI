
// src/services/collectibles.ts
'use server';

import { SAMPLE_COLLECTIBLES, type Collectible, type CollectibleRarity } from '@/types/collectibles';
import {
    GACHA_ROLL_SIZE,
    GACHA_RARITY_RATES,
    PITY_TARGET_RARITIES,
    HARD_PITY_COUNT,
    SOFT_PITY_START_COUNT,
    SOFT_PITY_INCREASE_RATE,
    PITY_DISTRIBUTION,
    GACHA_COST
} from '@/config/gachaConfig';
import { getUserProfileDocument, updateUserProfileDocument, type UserProfileData } from './profile';

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

// Helper to get collectibles grouped by rarity
let rollableCollectiblesByRarity: Map<CollectibleRarity, Collectible[]> | null = null;

function getRollableCollectiblesByRarityMap(): Map<CollectibleRarity, Collectible[]> {
    if (rollableCollectiblesByRarity) {
        return rollableCollectiblesByRarity;
    }
    const map = new Map<CollectibleRarity, Collectible[]>();
    for (const rarity in GACHA_RARITY_RATES) {
        map.set(rarity as CollectibleRarity, []);
    }
    SAMPLE_COLLECTIBLES.forEach(collectible => {
        const list = map.get(collectible.rarity);
        if (list) {
            list.push(collectible);
        } else {
            // This case should not happen if GACHA_RARITY_RATES includes all rarities
            console.warn(`Collectible with unknown rarity found: ${collectible.rarity}`);
            const commonList = map.get('Common');
            commonList?.push(collectible); // Add to common as a fallback
        }
    });
    rollableCollectiblesByRarity = map;
    return map;
}


function selectRarityBasedOnRates(rates: Record<CollectibleRarity, number>): CollectibleRarity {
    let sum = 0;
    const r = Math.random();
    // Normalize rates if they don't sum to 1 (e.g., due to soft pity adjustments)
    const totalRate = Object.values(rates).reduce((acc, val) => acc + val, 0);
    const normalizedRates: Record<string, number> = {};
    if (Math.abs(totalRate - 1.0) > 0.001 && totalRate > 0) {
        // console.warn(`Normalizing rates from sum ${totalRate}`);
        for (const key in rates) {
            normalizedRates[key] = rates[key as CollectibleRarity] / totalRate;
        }
    } else if (totalRate === 0) { // Edge case: if all rates become 0 (e.g. only one target rarity was left)
        console.warn("All rates are zero, defaulting to Common for rarity selection.");
        return 'Common';
    } else {
        Object.assign(normalizedRates, rates);
    }


    for (const rarity in normalizedRates) {
        sum += normalizedRates[rarity];
        if (r <= sum) {
            return rarity as CollectibleRarity;
        }
    }
    return 'Common'; // Fallback, should ideally not be reached if rates sum to 1
}


export async function performGachaRoll(userId: string | null): Promise<{ collectibles: Collectible[]; newPityCounter?: number } | { error: string }> {
    console.log(`[CollectiblesService] Performing Gacha roll for ${GACHA_ROLL_SIZE} items. UserID: ${userId}`);

    if (!SAMPLE_COLLECTIBLES || SAMPLE_COLLECTIBLES.length === 0) {
        console.error('[CollectiblesService] No sample collectibles available.');
        return { error: 'No collectibles available in the Gacha at this time.' };
    }

    let userProfile: UserProfileData | null = null;
    let currentPity = 0;

    if (userId) {
        try {
            userProfile = await getUserProfileDocument(userId);
            if (userProfile) {
                currentPity = userProfile.gachaPityCounter || 0;
            }
        } catch (e) {
            console.error("[CollectiblesService] Failed to fetch user profile for pity system:", e);
            // Proceed without pity if profile fetch fails, or handle as error
        }
    }
    console.log(`[CollectiblesService] Starting roll with pity counter: ${currentPity}`);

    const pulledCollectiblesThisRoll: Collectible[] = [];
    const pulledCollectibleIdsThisRoll = new Set<string>();
    const collectiblesByRarityMap = getRollableCollectiblesByRarityMap();

    for (let i = 0; i < GACHA_ROLL_SIZE; i++) {
        currentPity++; // Increment pity for this specific item in the roll
        let effectiveRates = { ...GACHA_RARITY_RATES };
        let isPityPull = false;
        let pityGuaranteedRarity: CollectibleRarity | null = null;

        // 1. Apply Pity System
        if (currentPity >= HARD_PITY_COUNT && PITY_TARGET_RARITIES.length > 0) {
            isPityPull = true;
            console.log(`[CollectiblesService] Hard pity hit at ${currentPity} pulls!`);
            // Force a PITY_TARGET_RARITY
            // Distribute 100% chance among PITY_TARGET_RARITIES based on PITY_DISTRIBUTION
            let tempPityRates: Record<CollectibleRarity, number> = {} as Record<CollectibleRarity, number>;
            PITY_TARGET_RARITIES.forEach(r => {
                tempPityRates[r] = PITY_DISTRIBUTION[r] || (1 / PITY_TARGET_RARITIES.length); // fallback to equal distribution
            });
            // Zero out other rates
            (Object.keys(effectiveRates) as CollectibleRarity[]).forEach(r => {
                if (!PITY_TARGET_RARITIES.includes(r)) {
                    tempPityRates[r] = 0;
                }
            });
            effectiveRates = tempPityRates;
            pityGuaranteedRarity = selectRarityBasedOnRates(effectiveRates); // Select from target rarities
        } else if (currentPity >= SOFT_PITY_START_COUNT && PITY_TARGET_RARITIES.length > 0) {
            console.log(`[CollectiblesService] Soft pity active at ${currentPity} pulls.`);
            const pullsIntoSoftPity = currentPity - SOFT_PITY_START_COUNT + 1;
            const totalIncreaseForTargets = Math.min(1.0, pullsIntoSoftPity * SOFT_PITY_INCREASE_RATE); // Cap at 100% total for targets

            let currentTotalTargetRate = PITY_TARGET_RARITIES.reduce((sum, r) => sum + (GACHA_RARITY_RATES[r] || 0), 0);
            let actualIncrease = Math.min(totalIncreaseForTargets, 1.0 - currentTotalTargetRate); // Don't exceed 100% for targets

            if (actualIncrease > 0) {
                const newTargetTotalRate = currentTotalTargetRate + actualIncrease;
                let sumOfNonTargetRates = 0;
                (Object.keys(effectiveRates) as CollectibleRarity[]).forEach(r => {
                    if (!PITY_TARGET_RARITIES.includes(r)) {
                        sumOfNonTargetRates += effectiveRates[r];
                    }
                });

                PITY_TARGET_RARITIES.forEach(r => {
                    const baseTargetRate = GACHA_RARITY_RATES[r] || 0;
                    const proportionOfPityChance = PITY_DISTRIBUTION[r] || (1 / PITY_TARGET_RARITIES.length);
                    effectiveRates[r] = baseTargetRate + (actualIncrease * proportionOfPityChance);
                });
                
                // Decrease non-target rates proportionally
                if (sumOfNonTargetRates > 0) {
                    const reductionFactor = (1.0 - newTargetTotalRate) / sumOfNonTargetRates;
                     (Object.keys(effectiveRates) as CollectibleRarity[]).forEach(r => {
                        if (!PITY_TARGET_RARITIES.includes(r)) {
                           effectiveRates[r] *= reductionFactor;
                        }
                    });
                }
            }
        }

        // 2. Select Rarity
        const rolledRarity = pityGuaranteedRarity || selectRarityBasedOnRates(effectiveRates);
        console.log(`[CollectiblesService] Item ${i + 1}: Rolled Rarity - ${rolledRarity} (Pity: ${currentPity}, isPityPull: ${isPityPull})`);

        // 3. Select Collectible of that Rarity
        let availableForRarity = collectiblesByRarityMap.get(rolledRarity) || [];
        let chosenCollectible: Collectible | undefined;
        let attempt = 0;
        const MAX_REPICK_ATTEMPTS = 5; // To avoid infinite loops if pool is too small

        do {
            if (availableForRarity.length === 0) {
                console.warn(`[CollectiblesService] No collectibles for rarity ${rolledRarity}. Falling back to Common.`);
                availableForRarity = collectiblesByRarityMap.get('Common') || [];
                if (availableForRarity.length === 0) { // Should not happen if SAMPLE_COLLECTIBLES is not empty
                    return { error: "Internal Gacha error: No Common collectibles available." };
                }
            }
            chosenCollectible = availableForRarity[Math.floor(Math.random() * availableForRarity.length)];
            attempt++;
        } while (chosenCollectible && pulledCollectibleIdsThisRoll.has(chosenCollectible.id) && attempt < MAX_REPICK_ATTEMPTS && SAMPLE_COLLECTIBLES.length > pulledCollectiblesThisRoll.size);
        // If still duplicate after attempts (or pool too small), accept it or handle differently
        
        if (!chosenCollectible) { // Extremely unlikely if Common has items
             console.error("[CollectiblesService] Critical error: Could not select any collectible.");
             return { error: "Gacha error: Could not select a collectible." };
        }

        pulledCollectiblesThisRoll.push(chosenCollectible);
        pulledCollectibleIdsThisRoll.add(chosenCollectible.id);

        // 4. Reset Pity if a target rarity was pulled
        if (PITY_TARGET_RARITIES.includes(chosenCollectible.rarity)) {
            console.log(`[CollectiblesService] Target rarity ${chosenCollectible.rarity} pulled! Pity counter reset.`);
            currentPity = 0; // Reset for the user's profile
        }
    }

    if (userId && userProfile) {
        try {
            await updateUserProfileDocument(userId, { gachaPityCounter: currentPity });
            console.log(`[CollectiblesService] User ${userId} pity counter updated to ${currentPity}`);
        } catch (e) {
            console.error("[CollectiblesService] Failed to update user pity counter in Firestore:", e);
        }
    }

    console.log(`[CollectiblesService] Roll complete. Pulled: ${pulledCollectiblesThisRoll.map(c => c.parodyTitle).join(', ')}. Final pity: ${currentPity}`);
    return { collectibles: pulledCollectiblesThisRoll, newPityCounter: currentPity };
}

// ----- No Inventory Logic -----
// The following functions related to user inventory are removed:
// - addCollectiblesToUserInventory
// - getUserOwnedCollectibles
// The UserProfileData in profile.ts will also have ownedCollectibleIds removed.

export async function getDisplayCollectibles(): Promise<Collectible[]> {
  return SAMPLE_COLLECTIBLES;
}
