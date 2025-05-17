// src/services/collectibles.ts
'use server';

import { SAMPLE_COLLECTIBLES, type Collectible, type CollectibleRarity } from '@/types/collectibles.ts';
import {
    GACHA_ROLL_SIZE,
    GACHA_RARITY_RATES,
    PITY_TARGET_RARITIES,
    HARD_PITY_COUNT,
    SOFT_PITY_START_COUNT,
    SOFT_PITY_INCREASE_RATE,
    PITY_DISTRIBUTION
} from '@/config/gachaConfig.ts';
import { getUserProfileDocument, updateUserProfileDocument, type UserProfileData } from './profile.ts';

const GACHA_COST = 0; // Still free

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param array The array to shuffle.
 * @returns The shuffled array (mutated in place).
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

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
            console.warn(`[GachaService] Collectible with unknown rarity found: ${collectible.rarity}`);
            const commonList = map.get('Common');
            commonList?.push(collectible);
        }
    });
    rollableCollectiblesByRarity = map;
    return map;
}

function selectRarityBasedOnRates(rates: Record<CollectibleRarity, number>): CollectibleRarity {
    let sum = 0;
    const r = Math.random();
    const totalRate = Object.values(rates).reduce((acc, val) => acc + val, 0);
    const normalizedRates: Record<string, number> = {};

    if (Math.abs(totalRate - 1.0) > 0.001 && totalRate > 0) {
        for (const key in rates) {
            normalizedRates[key] = rates[key as CollectibleRarity] / totalRate;
        }
    } else if (totalRate === 0) {
        console.warn("[GachaService] All effective rates are zero, defaulting to Common for rarity selection.");
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
    console.warn("[GachaService] Fallback rarity selection to Common, check rate logic.");
    return 'Common';
}

const EVOLUTION_CHANCE = 0.10; // 10% chance to evolve if possible

export async function performGachaRoll(userId: string | null): Promise<{ collectibles: Collectible[]; newPityCounter?: number } | { error: string }> {
    console.log(`[GachaService] Performing Gacha roll for ${GACHA_ROLL_SIZE} items. UserID: ${userId}`);

    if (!SAMPLE_COLLECTIBLES || SAMPLE_COLLECTIBLES.length === 0) {
        console.error('[GachaService] No sample collectibles available.');
        return { error: 'No collectibles available in the Gacha at this time.' };
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
        }
    }
    console.log(`[GachaService] Starting roll with pity counter: ${userPityCounter}`);

    const pulledCollectiblesThisRoll: Collectible[] = [];
    const pulledCollectibleIdsThisRoll = new Set<string>(); // To ensure uniqueness within THIS roll
    const collectiblesByRarityMap = getRollableCollectiblesByRarityMap();

    let currentPityForRoll = userPityCounter; // Use user's pity for the start of the roll

    for (let i = 0; i < GACHA_ROLL_SIZE; i++) {
        currentPityForRoll++; // Increment pity for this specific item in the roll
        let effectiveRates = { ...GACHA_RARITY_RATES };
        let isPityPull = false;
        let pityGuaranteedRarity: CollectibleRarity | null = null;

        // Apply Pity System
        if (PITY_TARGET_RARITIES.length > 0 && currentPityForRoll >= HARD_PITY_COUNT) {
            isPityPull = true;
            console.log(`[GachaService] Hard pity hit at ${currentPityForRoll} pulls!`);
            let tempPityRates: Partial<Record<CollectibleRarity, number>> = {};
            PITY_TARGET_RARITIES.forEach(r => {
                tempPityRates[r] = PITY_DISTRIBUTION[r] || (1 / PITY_TARGET_RARITIES.length);
            });
            (Object.keys(effectiveRates) as CollectibleRarity[]).forEach(r => {
                if (!PITY_TARGET_RARITIES.includes(r)) tempPityRates[r] = 0;
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
                    const proportionOfPityChance = PITY_DISTRIBUTION[r] || (1 / PITY_TARGET_RARITIES.length);
                    effectiveRates[r] = baseTargetRate + (actualIncrease * proportionOfPityChance);
                });
                
                if (sumOfNonTargetRates > 0) {
                    const reductionFactor = (1.0 - newTargetTotalRate) / sumOfNonTargetRates;
                    (Object.keys(effectiveRates) as CollectibleRarity[]).forEach(r => {
                        if (!PITY_TARGET_RARITIES.includes(r)) effectiveRates[r] *= reductionFactor;
                    });
                }
            }
        }

        let rolledRarity = pityGuaranteedRarity || selectRarityBasedOnRates(effectiveRates);
        let availableForRarity = collectiblesByRarityMap.get(rolledRarity) || [];
        
        // Fallback if no collectibles for the rolled rarity
        if(availableForRarity.length === 0) {
            console.warn(`[GachaService] No collectibles for rarity ${rolledRarity}. Falling back to Common.`);
            rolledRarity = 'Common';
            availableForRarity = collectiblesByRarityMap.get('Common') || [];
            if (availableForRarity.length === 0) {
                return { error: "Internal Gacha error: No Common collectibles available." };
            }
        }
        
        let chosenCollectible: Collectible | undefined;
        let attempt = 0;
        const MAX_REPICK_ATTEMPTS = availableForRarity.length > GACHA_ROLL_SIZE ? 10 : availableForRarity.length; // Adjust attempts based on pool size

        // Try to pick a unique collectible for this roll
        do {
            chosenCollectible = availableForRarity[Math.floor(Math.random() * availableForRarity.length)];
            attempt++;
        } while (
            chosenCollectible &&
            pulledCollectibleIdsThisRoll.has(chosenCollectible.id) && // Check against IDs already pulled in this roll
            attempt < MAX_REPICK_ATTEMPTS &&
            SAMPLE_COLLECTIBLES.length > pulledCollectiblesThisRoll.size // Ensure we don't loop forever if pool is tiny
        );
        
        if (!chosenCollectible) { // Should be extremely rare
             console.error("[GachaService] Critical error: Could not select any collectible even after fallbacks.");
             return { error: "Gacha error: Could not select a collectible." };
        }

        // Simplified "Lucky Pull" Evolution
        if (chosenCollectible.evolvesToId && Math.random() < EVOLUTION_CHANCE) {
            const evolvedForm = SAMPLE_COLLECTIBLES.find(c => c.id === chosenCollectible!.evolvesToId);
            if (evolvedForm) {
                console.log(`[GachaService] Lucky Evolution! ${chosenCollectible.parodyTitle} evolved into ${evolvedForm.parodyTitle}`);
                chosenCollectible = evolvedForm; // Replace with the evolved version
            }
        }

        pulledCollectiblesThisRoll.push(chosenCollectible);
        pulledCollectibleIdsThisRoll.add(chosenCollectible.id); // Add to set for uniqueness within this roll

        if (PITY_TARGET_RARITIES.includes(chosenCollectible.rarity)) {
            console.log(`[GachaService] Target rarity ${chosenCollectible.rarity} pulled! Pity counter reset.`);
            currentPityForRoll = 0; // Reset pity for the user
        }
    }

    if (userId && userProfile) {
        try {
            await updateUserProfileDocument(userId, { gachaPityCounter: currentPityForRoll });
            console.log(`[GachaService] User ${userId} pity counter updated to ${currentPityForRoll}`);
        } catch (e) {
            console.error("[GachaService] Failed to update user pity counter in Firestore:", e);
        }
    }

    console.log(`[GachaService] Roll complete. Pulled: ${pulledCollectiblesThisRoll.map(c => c.parodyTitle).join(', ')}. Final user pity: ${currentPityForRoll}`);
    return { collectibles: pulledCollectiblesThisRoll, newPityCounter: currentPityForRoll };
}

// No inventory-related functions
export async function getDisplayCollectibles(): Promise<Collectible[]> {
  return SAMPLE_COLLECTIBLES;
}
