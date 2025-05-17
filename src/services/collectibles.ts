
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

const GACHA_COST = 0; // Still free

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

// Helper to perform a weighted random selection
function weightedRandom(rates: Record<CollectibleRarity, number>): CollectibleRarity {
    let sum = 0;
    const r = Math.random();
    const normalizedRates: { rarity: CollectibleRarity, chance: number }[] = [];

    // Normalize rates in case they don't sum to 1 (e.g. after soft pity adjustments)
    const totalRate = Object.values(rates).reduce((acc, rate) => acc + rate, 0);
    if (totalRate === 0) { // Should not happen if there are always rates > 0
        console.warn("[GachaService] Total rate is 0 in weightedRandom. Defaulting to Common.");
        return 'Common';
    }

    for (const rarity in rates) {
        if (rates[rarity as CollectibleRarity] > 0) { // Only consider rarities with a chance
            normalizedRates.push({rarity: rarity as CollectibleRarity, chance: rates[rarity as CollectibleRarity] / totalRate});
        }
    }
    // Sort by chance to ensure consistent selection order if Math.random() is at boundary
    normalizedRates.sort((a,b) => a.chance - b.chance);


    for (const {rarity, chance} of normalizedRates) {
        sum += chance;
        if (r <= sum) {
            return rarity;
        }
    }
    // Fallback, should ideally not be reached if rates sum to 1 and are processed correctly
    return normalizedRates.length > 0 ? normalizedRates[normalizedRates.length - 1].rarity : 'Common';
}


export async function performGachaRoll(userId: string | null, packId?: string): Promise<{ collectibles: Collectible[]; newPityCounter?: number } | { error: string }> {
    console.log(`[GachaService] Performing Gacha roll. UserID: ${userId}, PackID: ${packId}`);

    let userProfile: UserProfileData | null = null;
    let currentPity = 0;

    if (userId) {
        try {
            userProfile = await getUserProfileDocument(userId);
            if (userProfile) {
                currentPity = userProfile.gachaPityCounter || 0;
            } else {
                console.warn(`[GachaService] User profile not found for ${userId}. Pity system will not apply for this roll.`);
            }
        } catch (e) {
            console.error(`[GachaService] Error fetching profile for ${userId}: ${(e as Error).message}. Pity system will not apply.`);
        }
    }

    let rollablePool = [...SAMPLE_COLLECTIBLES];
    let currentPack: GachaPack | undefined = undefined;
    let rollSize = GACHA_ROLL_SIZE; // Default 4 cards

    if (packId) {
        currentPack = SAMPLE_PACKS.find(p => p.id === packId);
        if (currentPack) {
            rollablePool = SAMPLE_COLLECTIBLES.filter(c => currentPack!.collectibleIds.includes(c.id) && c.rarity !== 'Forbidden'); // Base pool for pack
            if (currentPack.isLegacyPack) {
                rollSize = 1;
                // Legacy pack specifically targets its defined high-tier cards
                rollablePool = SAMPLE_COLLECTIBLES.filter(c => currentPack!.collectibleIds.includes(c.id) && (c.rarity === 'Mythic' || c.rarity === 'Event' || c.rarity === 'Forbidden'));
                 console.log(`[GachaService] Legacy Pack roll. Pool size: ${rollablePool.length}, contains rarities: ${[...new Set(rollablePool.map(c=>c.rarity))].join(', ')}`);
            } else {
                 console.log(`[GachaService] Rolling from pack "${currentPack.name}". Base pool size: ${rollablePool.length}`);
            }

            if (rollablePool.length === 0) {
                return { error: `Pack "${currentPack.name}" has no suitable collectibles defined or available.` };
            }
        } else {
            return { error: `Gacha Pack with ID "${packId}" not found.` };
        }
    } else {
        console.log(`[GachaService] Performing general roll. Base pool size: ${rollablePool.length}`);
    }


    const pulledCollectiblesThisRoll: Collectible[] = [];
    let pityForThisRoll = currentPity; // Local counter for this batch of rolls

    for (let i = 0; i < rollSize; i++) {
        pityForThisRoll++;
        let effectiveRates = { ...GACHA_RARITY_RATES }; // Start with base rates

        if (currentPack?.isLegacyPack) {
            // Legacy pack has its own simple logic: pick one from its pool
            if (rollablePool.length > 0) {
                const pickedLegacyCard = rollablePool[Math.floor(Math.random() * rollablePool.length)];
                pulledCollectiblesThisRoll.push(pickedLegacyCard);
                if (PITY_TARGET_RARITIES.includes(pickedLegacyCard.rarity)) {
                    pityForThisRoll = 0; // Reset pity if a target rarity is hit
                }
                continue; // Skip to next roll item (or end if rollSize is 1)
            } else {
                 console.warn("[GachaService] Legacy Pack pool empty after filtering. This shouldn't happen.");
                 // Fallback to a general common card if legacy pool is somehow empty
                 const commonFallbackPool = SAMPLE_COLLECTIBLES.filter(c => c.rarity === 'Common');
                 if (commonFallbackPool.length > 0) pulledCollectiblesThisRoll.push(commonFallbackPool[Math.floor(Math.random() * commonFallbackPool.length)]);
                 else pulledCollectiblesThisRoll.push(SAMPLE_COLLECTIBLES[0]); // Absolute fallback
                 continue;
            }
        }

        // Pity logic for General Pool and non-Legacy Packs
        if (pityForThisRoll >= HARD_PITY_COUNT) {
            console.log(`[GachaService] Hard pity hit at ${pityForThisRoll} pulls!`);
            effectiveRates = Object.fromEntries(
                Object.keys(GACHA_RARITY_RATES).map(r => [r, 0])
            ) as Record<CollectibleRarity, number>;
            PITY_TARGET_RARITIES.forEach(r => {
                if (PITY_DISTRIBUTION[r]) {
                     effectiveRates[r] = PITY_DISTRIBUTION[r]!;
                }
            });
        } else if (pityForThisRoll >= SOFT_PITY_START_COUNT) {
            const pullsIntoSoftPity = pityForThisRoll - SOFT_PITY_START_COUNT + 1;
            const totalIncrease = SOFT_PITY_INCREASE_RATE * pullsIntoSoftPity;
            let currentNonTargetRateSum = 0;
            PITY_TARGET_RARITIES.forEach(r => {
                if (effectiveRates[r] !== undefined && PITY_DISTRIBUTION[r]) {
                     effectiveRates[r] = (effectiveRates[r] || 0) + (totalIncrease * PITY_DISTRIBUTION[r]!);
                }
            });
            // Normalize other rates down
            Object.keys(effectiveRates).forEach(rKey => {
                const r = rKey as CollectibleRarity;
                if (!PITY_TARGET_RARITIES.includes(r)) {
                    currentNonTargetRateSum += GACHA_RARITY_RATES[r];
                }
            });
            const reductionFactor = currentNonTargetRateSum > 0 ? (1 - PITY_TARGET_RARITIES.reduce((sum, pr) => sum + effectiveRates[pr], 0)) / currentNonTargetRateSum : 0;
             Object.keys(effectiveRates).forEach(rKey => {
                const r = rKey as CollectibleRarity;
                if (!PITY_TARGET_RARITIES.includes(r) && GACHA_RARITY_RATES[r] > 0) {
                    effectiveRates[r] = Math.max(0, GACHA_RARITY_RATES[r] * reductionFactor);
                }
            });
             console.log(`[GachaService] Soft pity. Pulls into soft: ${pullsIntoSoftPity}, totalIncrease: ${totalIncrease.toFixed(3)}`, effectiveRates);
        }

        const rolledRarity = weightedRandom(effectiveRates);
        let potentialPulls = rollablePool.filter(c => c.rarity === rolledRarity && (!c.packExclusive || (c.packExclusive && currentPack)));
        
        if (potentialPulls.length === 0) { // Fallback if no items of rolled rarity in current pool
            console.warn(`[GachaService] No items of rarity ${rolledRarity} found in current pool. Falling back.`);
            const fallbackRarities = RARITY_ORDER.filter(r => r !== 'Event' && r !== 'Forbidden'); // General fallback
            for (const fr of fallbackRarities) {
                potentialPulls = rollablePool.filter(c => c.rarity === fr && (!c.packExclusive || (c.packExclusive && currentPack)));
                if (potentialPulls.length > 0) break;
            }
            if (potentialPulls.length === 0) potentialPulls = rollablePool; // Absolute fallback to any in pool
            if (potentialPulls.length === 0) potentialPulls = SAMPLE_COLLECTIBLES.filter(c => c.rarity === 'Common'); // Last resort
        }


        let chosenCollectible = potentialPulls.length > 0
            ? { ...potentialPulls[Math.floor(Math.random() * potentialPulls.length)] }
            : { ...SAMPLE_COLLECTIBLES[0] }; // Absolute fallback

        // Lucky Evolution Chance (not for Forbidden tier)
        if (chosenCollectible.evolvesToId && chosenCollectible.rarity !== 'Forbidden' && Math.random() < 0.10) { // 10% evolution chance
            const evolvedForm = SAMPLE_COLLECTIBLES.find(c => c.id === chosenCollectible.evolvesToId);
            if (evolvedForm) {
                console.log(`[GachaService] Lucky Evolution! ${chosenCollectible.parodyTitle} evolved into ${evolvedForm.parodyTitle}`);
                chosenCollectible = { ...evolvedForm };
            }
        }

        pulledCollectiblesThisRoll.push(chosenCollectible);

        if (PITY_TARGET_RARITIES.includes(chosenCollectible.rarity)) {
            console.log(`[GachaService] Pulled a ${chosenCollectible.rarity}! Pity reset.`);
            pityForThisRoll = 0;
        }
    }

    // Ensure uniqueness within the single roll if possible
    if (rollSize > 1 && pulledCollectiblesThisRoll.length === rollSize) {
        const uniqueIds = new Set<string>();
        const finalUniqueRoll: Collectible[] = [];
        for (const card of pulledCollectiblesThisRoll) {
            if (!uniqueIds.has(card.id)) {
                finalUniqueRoll.push(card);
                uniqueIds.add(card.id);
            }
        }
        // If we don't have enough unique cards, fill the rest with random picks (duplicates allowed now)
        // from the same original pool, trying to maintain approximate rarity distribution of what was initially pulled.
        let attempts = 0;
        while (finalUniqueRoll.length < rollSize && attempts < rollSize * 3) { // Limit attempts to avoid infinite loop
            // This fallback logic for filling duplicates could be smarter, e.g., re-rolling rarity then picking
            const fallbackPickPool = currentPack?.isLegacyPack ? rollablePool : SAMPLE_COLLECTIBLES;
            if (fallbackPickPool.length > 0) {
                finalUniqueRoll.push(fallbackPickPool[Math.floor(Math.random() * fallbackPickPool.length)]);
            } else {
                break; // Should not happen if SAMPLE_COLLECTIBLES is not empty
            }
            attempts++;
        }
         if (finalUniqueRoll.length < rollSize) {
             console.warn(`[GachaService] Could not fill all ${rollSize} slots with unique cards after attempts. Final roll size: ${finalUniqueRoll.length}`);
         }
        pulledCollectiblesThisRoll.splice(0, pulledCollectiblesThisRoll.length, ...finalUniqueRoll.slice(0, rollSize));
    }


    if (userId && userProfile) {
        try {
            await updateUserProfileDocument(userId, { gachaPityCounter: pityForThisRoll });
            console.log(`[GachaService] User ${userId} pity counter updated to ${pityForThisRoll}`);
        } catch (e) {
            console.error(`[GachaService] Error updating pity counter for ${userId}: ${(e as Error).message}`);
        }
    }

    console.log(`[GachaService] Roll complete. Pulled: ${pulledCollectiblesThisRoll.map(c => `${c.parodyTitle} (${c.rarity})`).join(', ')}. New Pity: ${pityForThisRoll}`);
    return { collectibles: pulledCollectiblesThisRoll, newPityCounter: pityForThisRoll };
}


// Function to get display collectibles (currently sample, could be from DB later)
export async function getDisplayCollectibles(): Promise<Collectible[]> {
  // In a real app, this might fetch from a 'collectibles' Firestore collection
  return SAMPLE_COLLECTIBLES;
}

    