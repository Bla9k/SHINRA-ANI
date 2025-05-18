// src/services/collectibles.ts
'use server';

import { SAMPLE_COLLECTIBLES, SAMPLE_PACKS, type Collectible, type CollectibleRarity, type GachaPack } from '@/types/collectibles.ts';
import { GACHA_ROLL_SIZE, RARITY_ORDER, RARITY_NUMERICAL_VALUE, GACHA_RARITY_RATES, PITY_TARGET_RARITIES, HARD_PITY_COUNT, SOFT_PITY_START_COUNT, SOFT_PITY_INCREASE_RATE, PITY_DISTRIBUTION } from '@/config/gachaConfig.ts';
import { shuffleArray } from '@/lib/utils';
import { getUserProfileDocument, updateUserProfileDocument, type UserProfileData } from './profile';

/**
 * Performs a Gacha roll.
 * If packId is provided, rolls from that specific pack's pool.
 * Otherwise, rolls from the general pool.
 * Implements rarity-based drop rates and a pity system.
 */
export async function performGachaRoll(userId: string | null, packId?: string): Promise<{ collectibles: Collectible[]; newPityCounter?: number } | { error: string }> {
    console.log(`[GachaService] Performing Gacha roll. UserID: ${userId}, PackID: ${packId}`);

    let rollSize = GACHA_ROLL_SIZE;
    let rollablePoolBase = [...SAMPLE_COLLECTIBLES];
    const currentPack = packId ? SAMPLE_PACKS.find(p => p.id === packId) : undefined;
    let effectiveDropRates = { ...GACHA_RARITY_RATES };

    if (currentPack) {
        console.log(`[GachaService] Rolling from pack "${currentPack.name}".`);
        rollablePoolBase = SAMPLE_COLLECTIBLES.filter(c => currentPack.collectibleIds.includes(c.id));
        if (rollablePoolBase.length === 0) {
            return { error: `Pack "${currentPack.name}" has no defined collectibles.` };
        }
        if (currentPack.isLegacyPack) {
            rollSize = 1;
            // Legacy pack has its own "rates" by virtue of its curated high-tier pool
            // We'll ensure it picks from its defined rarities (Mythic, Event, Forbidden)
            console.log(`[GachaService] Legacy Pack roll. Pool size for this pack: ${rollablePoolBase.length}. Rolling 1 card.`);
        }
        // Future: Implement currentPack.dropRateModifiers if needed
    } else {
        console.log(`[GachaService] Performing general roll. Base pool size: ${rollablePoolBase.length}`);
    }

    const pulledCollectiblesThisRoll: Collectible[] = [];
    let userProfile: UserProfileData | null = null;
    let currentPityCounter = 0;

    if (userId) {
        userProfile = await getUserProfileDocument(userId);
        if (userProfile) {
            currentPityCounter = userProfile.gachaPityCounter || 0;
            console.log(`[GachaService] User ${userId} current pity: ${currentPityCounter}`);
        } else {
            // This case should ideally not happen if profile creation is robust
            console.warn(`[GachaService] No profile found for user ${userId} during gacha roll. Pity will not apply.`);
        }
    }

    const raritiesToPull: CollectibleRarity[] = [];

    for (let i = 0; i < rollSize; i++) {
        currentPityCounter++;
        let chosenRarity: CollectibleRarity | null = null;

        if (currentPack?.isLegacyPack) {
            // For legacy pack, we directly pick a card from its specific pool.
            // The rarity is inherent to the card picked.
            // No need to roll for rarity first based on general rates.
            // The pool itself is already curated (Mythic, Event, Forbidden).
            // We'll just pick one randomly.
            if (rollablePoolBase.length > 0) {
                const randomIndex = Math.floor(Math.random() * rollablePoolBase.length);
                chosenRarity = rollablePoolBase[randomIndex].rarity; // Get rarity from the picked card
            } else {
                 console.error("[GachaService] Legacy pack has an empty collectible pool. This shouldn't happen.");
                 chosenRarity = 'Common'; // Fallback, though highly unlikely for legacy
            }
        } else {
            // Calculate effective drop rates for non-Legacy packs
            effectiveDropRates = { ...GACHA_RARITY_RATES }; // Reset for each pull in a multi-pull
            if (userId && userProfile) { // Only apply pity if user is logged in and profile exists
                if (currentPityCounter >= HARD_PITY_COUNT) {
                    console.log(`[GachaService] Hard pity reached at ${currentPityCounter} pulls!`);
                    let sumPityRates = 0;
                    PITY_TARGET_RARITIES.forEach(r => sumPityRates += (PITY_DISTRIBUTION[r] || 0));
                    
                    if (sumPityRates > 0) {
                        (Object.keys(effectiveDropRates) as CollectibleRarity[]).forEach(r => {
                            effectiveDropRates[r] = PITY_TARGET_RARITIES.includes(r) ? (PITY_DISTRIBUTION[r] || 0) / sumPityRates : 0;
                        });
                    } else {
                         console.warn("[GachaService] Pity distribution sum is 0. Falling back to guaranteeing a Legendary.");
                         (Object.keys(effectiveDropRates) as CollectibleRarity[]).forEach(r => {
                            effectiveDropRates[r] = r === 'Legendary' ? 1 : 0;
                         });
                    }

                } else if (currentPityCounter >= SOFT_PITY_START_COUNT) {
                    console.log(`[GachaService] Soft pity active at ${currentPityCounter} pulls.`);
                    let totalIncrease = 0;
                    PITY_TARGET_RARITIES.forEach(r => {
                        const increase = SOFT_PITY_INCREASE_RATE * (currentPityCounter - SOFT_PITY_START_COUNT + 1);
                        effectiveDropRates[r] = (effectiveDropRates[r] || 0) + increase;
                        totalIncrease += increase;
                    });

                    let sumNonPityOriginalRates = 0;
                    (Object.keys(effectiveDropRates) as CollectibleRarity[]).forEach(r => {
                        if (!PITY_TARGET_RARITIES.includes(r)) {
                            sumNonPityOriginalRates += (GACHA_RARITY_RATES[r] || 0);
                        }
                    });

                    if (sumNonPityOriginalRates > 0) {
                        (Object.keys(effectiveDropRates) as CollectibleRarity[]).forEach(r => {
                            if (!PITY_TARGET_RARITIES.includes(r)) {
                                effectiveDropRates[r] = Math.max(0, (GACHA_RARITY_RATES[r] || 0) - totalIncrease * ((GACHA_RARITY_RATES[r] || 0) / sumNonPityOriginalRates));
                            }
                        });
                    }
                }
            }

            // Normalize rates to sum to 1
            let sumRates = Object.values(effectiveDropRates).reduce((s, r) => s + r, 0);
            if (sumRates === 0) { // Should not happen if rates are defined
                console.warn("[GachaService] Sum of effective rates is 0. Defaulting to Common.");
                effectiveDropRates['Common'] = 1;
                sumRates = 1;
            }
            if (Math.abs(sumRates - 1.0) > 0.001) {
                (Object.keys(effectiveDropRates) as CollectibleRarity[]).forEach(r => {
                    effectiveDropRates[r] = (effectiveDropRates[r] || 0) / sumRates;
                });
            }

            // Roll for rarity
            const randomRoll = Math.random();
            let cumulativeChance = 0;
            for (const rarity of RARITY_ORDER) { // Use RARITY_ORDER to ensure consistent checking
                cumulativeChance += (effectiveDropRates[rarity] || 0);
                if (randomRoll < cumulativeChance) {
                    chosenRarity = rarity;
                    break;
                }
            }
            if (!chosenRarity) chosenRarity = 'Common'; // Fallback
        }
        
        raritiesToPull.push(chosenRarity);

        if (userId && PITY_TARGET_RARITIES.includes(chosenRarity)) {
            console.log(`[GachaService] Pity target rarity ${chosenRarity} pulled! Resetting pity for user ${userId}.`);
            currentPityCounter = 0; // Reset pity for the next item in the roll AND for user's profile
        }
    }

    // Select collectibles based on chosen rarities, attempting uniqueness
    const shuffledFullPool = shuffleArray([...rollablePoolBase]); // Shuffle the base pool for this pack/general
    const pulledIdsThisRoll = new Set<string>();

    for (const targetRarity of raritiesToPull) {
        let pickedCollectible: Collectible | undefined = undefined;
        let attempts = 0;
        const maxAttempts = 5; // Try a few times to find a unique one of the target rarity

        // Filter pool for target rarity
        const raritySpecificPool = shuffledFullPool.filter(c => c.rarity === targetRarity);

        if (raritySpecificPool.length > 0) {
            while (attempts < maxAttempts) {
                const potentialPick = raritySpecificPool[Math.floor(Math.random() * raritySpecificPool.length)];
                if (!pulledIdsThisRoll.has(potentialPick.id)) {
                    pickedCollectible = potentialPick;
                    break;
                }
                attempts++;
            }
            // If still no unique pick after attempts, take the last potential pick (allows duplicate if pool is small)
            if (!pickedCollectible) pickedCollectible = raritySpecificPool[Math.floor(Math.random() * raritySpecificPool.length)];
        }

        // Fallback if no card of chosen rarity (should be rare with large pool)
        if (!pickedCollectible) {
            console.warn(`[GachaService] No collectible found for rarity ${targetRarity}. Falling back to general pool random.`);
            pickedCollectible = shuffledFullPool[Math.floor(Math.random() * shuffledFullPool.length)] || rollablePoolBase[0]; // Absolute fallback
            if (!pickedCollectible) { // Should be impossible if rollablePoolBase is not empty
                 return { error: "Internal Gacha Error: Failed to select any fallback collectible." };
            }
        }
        
        let finalCollectible = { ...pickedCollectible }; // Clone
        pulledIdsThisRoll.add(finalCollectible.id);

        // Lucky Evolution Chance (not for Forbidden or if already an evolved form)
        if (finalCollectible.evolvesToId && finalCollectible.rarity !== 'Forbidden' && !finalCollectible.isEvolvedForm && Math.random() < 0.10) {
            const evolvedForm = SAMPLE_COLLECTIBLES.find(c => c.id === finalCollectible.evolvesToId);
            if (evolvedForm) {
                console.log(`[GachaService] Lucky Evolution! ${finalCollectible.parodyTitle} evolved into ${evolvedForm.parodyTitle}`);
                finalCollectible = { ...evolvedForm, isEvolvedForm: true }; // Ensure isEvolvedForm is set
            }
        }
        pulledCollectiblesThisRoll.push(finalCollectible);
    }

    if (userId && userProfile) { // Only update if user is logged in and profile was loaded
        try {
            await updateUserProfileDocument(userId, { gachaPityCounter: currentPityCounter });
            console.log(`[GachaService] User ${userId} pity counter updated to ${currentPityCounter}.`);
        } catch (error) {
            console.error(`[GachaService] Failed to update pity counter for user ${userId}:`, error);
            // Proceed with returning collectibles, pity update failure is not critical for the roll itself
        }
    }

    console.log(`[GachaService] Roll complete. Pulled: ${pulledCollectiblesThisRoll.map(c => `${c.parodyTitle} (${c.rarity})`).join(', ')}.`);
    return { collectibles: pulledCollectiblesThisRoll, newPityCounter: userId ? currentPityCounter : undefined };
}
