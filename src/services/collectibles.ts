// src/services/collectibles.ts
'use server';

import { SAMPLE_COLLECTIBLES, SAMPLE_PACKS, type Collectible, type CollectibleRarity, type GachaPack } from '@/types/collectibles';
import { GACHA_ROLL_SIZE, RARITY_ORDER, RARITY_NUMERICAL_VALUE, GACHA_RARITY_RATES, PITY_TARGET_RARITIES, HARD_PITY_COUNT, SOFT_PITY_START_COUNT, SOFT_PITY_INCREASE_RATE, PITY_DISTRIBUTION } from '@/config/gachaConfig';
import { shuffleArray } from '@/lib/utils';
import { getUserProfileDocument, updateUserProfileDocument, type UserProfileData } from './profile';

const GACHA_COST = 0; // For beta, Gacha is free

/**
 * Performs a Gacha roll.
 * If packId is provided, rolls from that specific pack's pool.
 * Otherwise, rolls from the general pool.
 */
export async function performGachaRoll(
    userId: string | null,
    packId?: string
): Promise<{ collectibles: Collectible[]; newPityCounter?: number } | { error: string }> {
    console.log(`[GachaService] Performing Gacha roll. UserID: ${userId}, PackID: ${packId}`);

    let rollSize = GACHA_ROLL_SIZE;
    let rollablePoolBase = [...SAMPLE_COLLECTIBLES];
    const currentPack = packId ? SAMPLE_PACKS.find(p => p.id === packId) : undefined;
    let effectiveDropRates = { ...GACHA_RARITY_RATES };

    if (currentPack) {
        console.log(`[GachaService] Rolling from pack "${currentPack.name}".`);
        rollablePoolBase = SAMPLE_COLLECTIBLES.filter(c => currentPack.collectibleIds.includes(c.id));
        if (rollablePoolBase.length === 0) {
            console.error(`[GachaService] Error: Pack "${currentPack.name}" (ID: ${packId}) has no defined/valid collectibles in its collectibleIds list or SAMPLE_COLLECTIBLES is missing these IDs.`);
            return { error: `Pack "${currentPack.name}" is empty or misconfigured.` };
        }
        if (currentPack.isLegacyPack) {
            rollSize = 1;
            console.log(`[GachaService] Legacy Pack roll. Pool size for this pack: ${rollablePoolBase.length}. Rolling 1 card.`);
        }
        // Future: Implement currentPack.dropRateModifiers if needed
    } else {
        console.log(`[GachaService] Performing general roll. Base pool size: ${rollablePoolBase.length}`);
    }

    if (rollablePoolBase.length === 0 && !currentPack?.isLegacyPack) { // Check for general pool emptiness specifically
        console.error("[GachaService] Error: The general rollable pool of collectibles is empty. Cannot perform roll.");
        return { error: "Gacha pool is currently empty. Please try again later." };
    }


    const pulledCollectiblesThisRoll: Collectible[] = [];
    let userProfile: UserProfileData | null = null;
    let currentPityCounter = 0; // This will be the counter *during* the roll.

    // Temporarily disable pity for this debugging pass
    // if (userId) {
    //     userProfile = await getUserProfileDocument(userId);
    //     if (userProfile) {
    //         currentPityCounter = userProfile.gachaPityCounter || 0;
    //         console.log(`[GachaService] User ${userId} initial pity: ${currentPityCounter}`);
    //     } else {
    //         console.warn(`[GachaService] No profile found for user ${userId}. Pity will not apply.`);
    //     }
    // }

    const raritiesToPull: CollectibleRarity[] = [];

    for (let i = 0; i < rollSize; i++) {
        // currentPityCounter++; // Increment pity for each card pulled in the sequence
        let chosenRarity: CollectibleRarity | null = null;

        if (currentPack?.isLegacyPack) {
            // For legacy pack, rarity is determined by the single card pulled from its curated pool
            if (rollablePoolBase.length > 0) {
                const randomIndex = Math.floor(Math.random() * rollablePoolBase.length);
                chosenRarity = rollablePoolBase[randomIndex].rarity;
            } else {
                // This case should ideally be prevented by the check at the start of the function
                console.error("[GachaService] CRITICAL: Legacy pack's rollablePoolBase is empty during card selection.");
                return { error: "Legacy Pack configuration error." };
            }
        } else {
            // For non-Legacy packs, determine rarity based on rates (pity system temporarily disabled)
            effectiveDropRates = { ...GACHA_RARITY_RATES }; // Use base rates

            // Normalize rates to sum to 1
            let sumRates = Object.values(effectiveDropRates).reduce((s, r) => s + (r || 0), 0);
            if (sumRates === 0) {
                console.warn("[GachaService] Sum of effective rates is 0. Defaulting to Common.");
                effectiveDropRates['Common'] = 1;
                sumRates = 1;
            }
             if (Math.abs(sumRates - 1.0) > 0.001) { // Normalize if not already summing to 1
                (Object.keys(effectiveDropRates) as CollectibleRarity[]).forEach(r => {
                    effectiveDropRates[r] = (effectiveDropRates[r] || 0) / sumRates;
                });
            }

            const randomRoll = Math.random();
            let cumulativeChance = 0;
            for (const rarity of RARITY_ORDER) {
                cumulativeChance += (effectiveDropRates[rarity] || 0);
                if (randomRoll < cumulativeChance) {
                    chosenRarity = rarity;
                    break;
                }
            }
            if (!chosenRarity) chosenRarity = 'Common'; // Fallback
        }
        
        raritiesToPull.push(chosenRarity);

        // if (userId && PITY_TARGET_RARITIES.includes(chosenRarity)) {
        //     console.log(`[GachaService] Pity target rarity ${chosenRarity} pulled for user ${userId}. Resetting pity for subsequent pulls in this roll and for profile.`);
        //     currentPityCounter = 0; // Reset pity for the next item in this roll AND for user's profile later
        // }
    }

    const shuffledFullPoolForSelection = shuffleArray([...rollablePoolBase]);
    const pulledIdsThisRoll = new Set<string>();

    for (const targetRarity of raritiesToPull) {
        let pickedCollectible: Collectible | undefined = undefined;
        
        // For Legacy Pack, we already know the pool is specific. Pick one.
        if (currentPack?.isLegacyPack) {
            if (shuffledFullPoolForSelection.length > 0) {
                 pickedCollectible = shuffledFullPoolForSelection.pop(); // Take one from the pack's specific pool
            }
        } else {
            // For general/other packs, filter by targetRarity
            const raritySpecificPool = shuffledFullPoolForSelection.filter(c => c.rarity === targetRarity);
            let attempts = 0;
            const maxAttempts = raritySpecificPool.length > 0 ? raritySpecificPool.length : 5; // More attempts if pool is large

            if (raritySpecificPool.length > 0) {
                while (attempts < maxAttempts) {
                    const potentialPick = raritySpecificPool[Math.floor(Math.random() * raritySpecificPool.length)];
                    if (!pulledIdsThisRoll.has(potentialPick.id)) {
                        pickedCollectible = potentialPick;
                        break;
                    }
                    attempts++;
                }
                if (!pickedCollectible) pickedCollectible = raritySpecificPool[Math.floor(Math.random() * raritySpecificPool.length)];
            }
        }

        if (!pickedCollectible) {
            console.warn(`[GachaService] No collectible found for rarity ${targetRarity} from its specific pool or general pool. Trying absolute fallback.`);
            // Absolute fallback: pick any card from the original shuffled base pool that hasn't been picked yet
            let fallbackPick = shuffledFullPoolForSelection.find(c => !pulledIdsThisRoll.has(c.id));
            if (!fallbackPick && rollablePoolBase.length > 0) { // If all unique used, pick any
                fallbackPick = rollablePoolBase[Math.floor(Math.random() * rollablePoolBase.length)];
            }
            if (!fallbackPick) {
                 console.error("[GachaService] CRITICAL: Could not select any fallback collectible. The pool might be entirely empty.");
                 return { error: "Internal Gacha Error: Failed to select any fallback collectible." };
            }
            pickedCollectible = fallbackPick;
            console.log(`[GachaService] Fallback pick: ${pickedCollectible.parodyTitle} (${pickedCollectible.rarity})`);
        }
        
        let finalCollectible = { ...pickedCollectible };
        pulledIdsThisRoll.add(finalCollectible.id);

        if (finalCollectible.evolvesToId && finalCollectible.rarity !== 'Forbidden' && !finalCollectible.isEvolvedForm && Math.random() < 0.10) {
            const evolvedForm = SAMPLE_COLLECTIBLES.find(c => c.id === finalCollectible.evolvesToId);
            if (evolvedForm) {
                console.log(`[GachaService] Lucky Evolution! ${finalCollectible.parodyTitle} evolved into ${evolvedForm.parodyTitle}`);
                finalCollectible = { ...evolvedForm, isEvolvedForm: true };
            }
        }
        pulledCollectiblesThisRoll.push(finalCollectible);
    }

    // if (userId && userProfile) { // Only update if user is logged in and profile was loaded
    //     try {
    //         await updateUserProfileDocument(userId, { gachaPityCounter: currentPityCounter });
    //         console.log(`[GachaService] User ${userId} pity counter updated to ${currentPityCounter}.`);
    //     } catch (error) {
    //         console.error(`[GachaService] Failed to update pity counter for user ${userId}:`, error);
    //     }
    // }

    console.log(`[GachaService] Roll complete. Pulled: ${pulledCollectiblesThisRoll.map(c => `${c.parodyTitle} (${c.rarity})`).join(', ')}.`);
    return { collectibles: pulledCollectiblesThisRoll /* newPityCounter: userId ? currentPityCounter : undefined */ };
}
