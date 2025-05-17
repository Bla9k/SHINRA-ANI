
// src/services/collectibles.ts
'use server';

import { SAMPLE_COLLECTIBLES, SAMPLE_PACKS, type Collectible, type CollectibleRarity, type GachaPack } from '@/types/collectibles.ts';
import {
    GACHA_ROLL_SIZE,
    GACHA_RARITY_RATES,
    PITY_TARGET_RARITIES,
    HARD_PITY_COUNT,
    SOFT_PITY_START_COUNT,
    SOFT_PITY_INCREASE_RATE,
    PITY_DISTRIBUTION
} from '@/config/gachaConfig.ts';
import { getUserProfileDocument, updateUserProfileDocument, type UserProfileData } from './profile';

const GACHA_COST = 0; // Free for beta

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param array The array to shuffle.
 * @returns The shuffled array (mutated in place).
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]; // Create a shallow copy to avoid mutating the original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getRollableCollectiblesByRarityMap(pool: Collectible[]): Map<CollectibleRarity, Collectible[]> {
    const map = new Map<CollectibleRarity, Collectible[]>();
    for (const rarity in GACHA_RARITY_RATES) { // Initialize map with all defined rarities
        map.set(rarity as CollectibleRarity, []);
    }
    pool.forEach(collectible => {
        const list = map.get(collectible.rarity);
        if (list) {
            list.push(collectible);
        } else {
            // This case should be rare if rarities in Collectible match GACHA_RARITY_RATES keys
            console.warn(`[GachaService] Collectible '${collectible.parodyTitle}' with unmapped rarity '${collectible.rarity}' found in pool. Assigning to Common.`);
            const commonList = map.get('Common');
            commonList?.push(collectible);
        }
    });
    return map;
}


function selectRarityBasedOnRates(rates: Record<CollectibleRarity, number>): CollectibleRarity {
    let sum = 0;
    const r = Math.random();
    const totalRate = Object.values(rates).reduce((acc, val) => acc + val, 0);
    const normalizedRates: Partial<Record<CollectibleRarity, number>> = {}; // Use Partial as not all rarities might be in `rates`

    if (Math.abs(totalRate - 1.0) > 0.001 && totalRate > 0) {
        for (const key in rates) {
            normalizedRates[key as CollectibleRarity] = rates[key as CollectibleRarity] / totalRate;
        }
    } else if (totalRate === 0) {
        console.warn("[GachaService] All effective rates are zero, defaulting to Common for rarity selection.");
        return 'Common'; // Fallback if all rates are zero
    } else {
        // Directly use rates if they already sum to 1 or are intended as is
        Object.assign(normalizedRates, rates);
    }

    // Ensure all rarities from GACHA_RARITY_RATES are considered, even if their current rate is 0
    for (const rarityKey of Object.keys(GACHA_RARITY_RATES) as CollectibleRarity[]) {
        const rate = normalizedRates[rarityKey] || 0; // Use 0 if not in effective/normalized rates
        sum += rate;
        if (r <= sum) {
            return rarityKey;
        }
    }

    console.warn("[GachaService] Fallback rarity selection to Common, check rate logic. Sum was:", sum, "Random was:", r, "Rates:", JSON.stringify(rates));
    return 'Common'; // Ultimate fallback
}


const EVOLUTION_CHANCE = 0.10; // 10% chance to evolve if possible

export async function performGachaRoll(userId: string | null, packId?: string): Promise<{ collectibles: Collectible[]; newPityCounter?: number } | { error: string }> {
    console.log(`[GachaService] Performing Gacha roll. UserID: ${userId}, PackID: ${packId}`);

    let rollablePool = SAMPLE_COLLECTIBLES;
    let currentPack: GachaPack | undefined = undefined;

    if (packId) {
        currentPack = SAMPLE_PACKS.find(p => p.id === packId);
        if (currentPack) {
            rollablePool = SAMPLE_COLLECTIBLES.filter(c => currentPack!.collectibleIds.includes(c.id));
            console.log(`[GachaService] Rolling from pack "${currentPack.name}". Pool size: ${rollablePool.length}`);
            if (rollablePool.length === 0) {
                return { error: `Pack "${currentPack.name}" has no collectibles defined or available.` };
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

    let userProfile: UserProfileData | null = null;
    let userPityCounter = 0;

    if (userId) {
        try {
            userProfile = await getUserProfileDocument(userId);
            if (userProfile) {
                userPityCounter = userProfile.gachaPityCounter || 0;
            }
        } catch (e) {
            console.error("[GachaService] Failed to fetch user profile for pity system:", e);
            // Continue without user-specific pity if profile fetch fails
        }
    }
    console.log(`[GachaService] Starting roll with pity counter: ${userPityCounter}`);

    const pulledCollectiblesThisRoll: Collectible[] = [];
    const pulledCollectibleIdsThisRoll = new Set<string>();
    const collectiblesByRarityMap = getRollableCollectiblesByRarityMap(rollablePool);

    let currentPityForRoll = userPityCounter;

    for (let i = 0; i < GACHA_ROLL_SIZE; i++) {
        currentPityForRoll++;
        let effectiveRates = { ...GACHA_RARITY_RATES };
        let isPityPull = false;
        let pityGuaranteedRarity: CollectibleRarity | null = null;

        if (PITY_TARGET_RARITIES.length > 0 && currentPityForRoll >= HARD_PITY_COUNT) {
            isPityPull = true;
            console.log(`[GachaService] Hard pity hit at ${currentPityForRoll} pulls!`);
            let tempPityRates: Partial<Record<CollectibleRarity, number>> = {};
            PITY_TARGET_RARITIES.forEach(r => {
                if (GACHA_RARITY_RATES[r] > 0 && (collectiblesByRarityMap.get(r) || []).length > 0) { // Ensure rarity is possible in current pool
                    tempPityRates[r] = PITY_DISTRIBUTION[r] || (1 / PITY_TARGET_RARITIES.filter(pr => GACHA_RARITY_RATES[pr] > 0 && (collectiblesByRarityMap.get(pr) || []).length > 0).length);
                }
            });
            (Object.keys(effectiveRates) as CollectibleRarity[]).forEach(r => {
                if (!tempPityRates[r]) tempPityRates[r] = 0; // Set non-target or unavailable target rarities to 0
            });
            effectiveRates = tempPityRates as Record<CollectibleRarity, number>;
            pityGuaranteedRarity = selectRarityBasedOnRates(effectiveRates);
        } else if (PITY_TARGET_RARITIES.length > 0 && currentPityForRoll >= SOFT_PITY_START_COUNT) {
            console.log(`[GachaService] Soft pity active at ${currentPityForRoll} pulls.`);
            const pullsIntoSoftPity = currentPityForRoll - SOFT_PITY_START_COUNT + 1;
            const totalIncreaseForTargets = Math.min(1.0, pullsIntoSoftPity * SOFT_PITY_INCREASE_RATE);
            let currentTotalTargetRate = PITY_TARGET_RARITIES.reduce((sum, r) => sum + (GACHA_RARITY_RATES[r] || 0), 0);
            let actualIncrease = Math.min(totalIncreaseForTargets, 1.0 - currentTotalTargetRate);

            if (actualIncrease > 0) {
                const newTargetTotalRate = currentTotalTargetRate + actualIncrease;
                let sumOfNonTargetRates = 0;
                (Object.keys(effectiveRates) as CollectibleRarity[]).forEach(r => {
                    if (!PITY_TARGET_RARITIES.includes(r)) sumOfNonTargetRates += effectiveRates[r];
                });

                PITY_TARGET_RARITIES.forEach(r => {
                    const baseTargetRate = GACHA_RARITY_RATES[r] || 0;
                    const proportionOfPityChance = PITY_DISTRIBUTION[r] || (PITY_TARGET_RARITIES.length > 0 ? (1 / PITY_TARGET_RARITIES.length) : 0);
                    effectiveRates[r] = baseTargetRate + (actualIncrease * proportionOfPityChance);
                });
                
                if (sumOfNonTargetRates > 0) {
                    const reductionFactor = (1.0 - newTargetTotalRate) / sumOfNonTargetRates;
                    (Object.keys(effectiveRates) as CollectibleRarity[]).forEach(r => {
                        if (!PITY_TARGET_RARITIES.includes(r)) effectiveRates[r] *= reductionFactor;
                    });
                } else if (newTargetTotalRate < 1.0) { // If all non-targets were 0, distribute remaining to targets
                    const scaleUpFactor = 1.0 / newTargetTotalRate;
                     PITY_TARGET_RARITIES.forEach(r => {
                        effectiveRates[r] *= scaleUpFactor;
                    });
                }
            }
        }

        let rolledRarity = pityGuaranteedRarity || selectRarityBasedOnRates(effectiveRates);
        let availableForRarity = collectiblesByRarityMap.get(rolledRarity) || [];
        
        let fallbackAttempt = 0;
        while(availableForRarity.length === 0 && fallbackAttempt < Object.keys(GACHA_RARITY_RATES).length) {
            console.warn(`[GachaService] No collectibles for initially rolled rarity ${rolledRarity} in current pool. Trying lower rarity.`);
            const currentRarityIndex = Object.keys(GACHA_RARITY_RATES).indexOf(rolledRarity);
            if (currentRarityIndex > 0) { // Try next lower rarity
                rolledRarity = Object.keys(GACHA_RARITY_RATES)[currentRarityIndex - 1] as CollectibleRarity;
            } else { // If already at lowest, default to common (should be caught by map init) or break
                rolledRarity = 'Common';
            }
            availableForRarity = collectiblesByRarityMap.get(rolledRarity) || [];
            fallbackAttempt++;
             if (fallbackAttempt >= Object.keys(GACHA_RARITY_RATES).length && availableForRarity.length === 0) {
                console.error("[GachaService] Critical error: No collectibles available even after rarity fallback.");
                return { error: "Gacha error: No collectibles available for any rarity in the current pool." };
            }
        }
        
        let chosenCollectible: Collectible | undefined;
        let pickAttempt = 0;
        const MAX_REPICK_ATTEMPTS = availableForRarity.length > GACHA_ROLL_SIZE ? 10 : Math.max(1, availableForRarity.length);

        do {
            chosenCollectible = availableForRarity[Math.floor(Math.random() * availableForRarity.length)];
            pickAttempt++;
        } while (
            chosenCollectible &&
            pulledCollectibleIdsThisRoll.has(chosenCollectible.id) &&
            pickAttempt < MAX_REPICK_ATTEMPTS &&
            rollablePool.length > pulledCollectiblesThisRoll.size
        );

        if (!chosenCollectible) {
            // If still couldn't find a unique one, pick any from the target rarity (even if it's a duplicate for this roll)
            chosenCollectible = availableForRarity[Math.floor(Math.random() * availableForRarity.length)];
            if (!chosenCollectible) { // If availableForRarity was somehow empty after all checks (should not happen)
                 console.error("[GachaService] Critical error: Could not select any collectible from target rarity after fallbacks.");
                 return { error: "Gacha error: Could not select a collectible." };
            }
        }
        
        let finalPulledCollectible = { ...chosenCollectible }; // Clone to modify

        if (finalPulledCollectible.evolvesToId && Math.random() < EVOLUTION_CHANCE) {
            const evolvedForm = SAMPLE_COLLECTIBLES.find(c => c.id === finalPulledCollectible.evolvesToId); // Evolve from global pool
            if (evolvedForm) {
                console.log(`[GachaService] Lucky Evolution! ${finalPulledCollectible.parodyTitle} evolved into ${evolvedForm.parodyTitle}`);
                finalPulledCollectible = { ...evolvedForm };
            }
        }

        pulledCollectiblesThisRoll.push(finalPulledCollectible);
        pulledCollectibleIdsThisRoll.add(finalPulledCollectible.id);

        if (PITY_TARGET_RARITIES.includes(finalPulledCollectible.rarity)) {
            console.log(`[GachaService] Target rarity ${finalPulledCollectible.rarity} pulled! Pity counter reset.`);
            currentPityForRoll = 0;
        }
    }

    // Removed inventory update logic
    // if (userId && pulledCollectiblesThisRoll.length > 0) {
    //     try {
    //         await addCollectiblesToUserInventory(userId, pulledCollectiblesThisRoll.map(c => c.id));
    //     } catch (e) {
    //         console.error("[GachaService] Failed to add collectibles to user inventory:", e);
    //     }
    // }

    if (userId && userProfile) {
        try {
            await updateUserProfileDocument(userId, { gachaPityCounter: currentPityForRoll });
            console.log(`[GachaService] User ${userId} pity counter updated to ${currentPityForRoll}`);
        } catch (e) {
            console.error("[GachaService] Failed to update user pity counter in Firestore:", e);
        }
    }

    console.log(`[GachaService] Roll complete. Pulled: ${pulledCollectiblesThisRoll.map(c => c.parodyTitle).join(', ')}. Final user pity for next roll: ${currentPityForRoll}`);
    return { collectibles: pulledCollectiblesThisRoll, newPityCounter: currentPityForRoll };
}

// Function to get display collectibles (currently sample, could be from DB later)
export async function getDisplayCollectibles(): Promise<Collectible[]> {
  return SAMPLE_COLLECTIBLES;
}
