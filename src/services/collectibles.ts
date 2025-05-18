
// src/services/collectibles.ts
'use server';

import { SAMPLE_COLLECTIBLES, SAMPLE_PACKS, type Collectible, type CollectibleRarity, type GachaPack } from '@/types/collectibles.ts';
import { GACHA_ROLL_SIZE, RARITY_ORDER, RARITY_NUMERICAL_VALUE, GACHA_RARITY_RATES, PITY_TARGET_RARITIES, HARD_PITY_COUNT, SOFT_PITY_START_COUNT, SOFT_PITY_INCREASE_RATE, PITY_DISTRIBUTION } from '@/config/gachaConfig.ts';
import { shuffleArray } from '@/lib/utils';
// User profile service is NOT imported as we removed user-specific inventory for now, pity still relies on userId.
// import { getUserProfileDocument, updateUserProfileDocument, type UserProfileData } from './profile';

const GACHA_COST = 0; // For beta, Gacha is free

/**
 * Performs a Gacha roll.
 * If packId is provided, rolls from that specific pack's pool.
 * Otherwise, rolls from the general pool.
 * Handles pity system if userId is provided.
 */
export async function performGachaRoll(
    // userId: string | null, // Pity system is disabled for now
    packId?: string
): Promise<{ collectibles: Collectible[] } | { error: string }> {
    console.log(`[GachaService] Performing Gacha roll. PackID: ${packId}`);

    let rollSize = GACHA_ROLL_SIZE;
    let rollablePoolBase: Collectible[] = [...SAMPLE_COLLECTIBLES]; // Start with all collectibles
    const currentPack = packId ? SAMPLE_PACKS.find(p => p.id === packId) : undefined;

    if (currentPack) {
        console.log(`[GachaService] Rolling from pack "${currentPack.name}".`);
        rollablePoolBase = SAMPLE_COLLECTIBLES.filter(c => currentPack.collectibleIds.includes(c.id));
        if (rollablePoolBase.length === 0) {
            console.error(`[GachaService] Error: Pack "${currentPack.name}" (ID: ${packId}) has no defined/valid collectibles.`);
            return { error: `Pack "${currentPack.name}" is empty or misconfigured.` };
        }
        if (currentPack.isLegacyPack) {
            rollSize = 1; // Legacy pack always yields 1 card
            console.log(`[GachaService] Legacy Pack roll. Pool size for this pack: ${rollablePoolBase.length}. Rolling 1 card.`);
        }
    } else {
        console.log(`[GachaService] Performing general roll. Base pool size: ${rollablePoolBase.length}`);
    }

    if (rollablePoolBase.length === 0) {
        console.error("[GachaService] Error: The rollable pool of collectibles is empty. Cannot perform roll.");
        return { error: "Gacha pool is currently empty. Please try again later." };
    }

    const pulledCollectiblesThisRoll: Collectible[] = [];

    if (currentPack?.isLegacyPack) {
        // Legacy Pack: Pulls 1 card directly from its defined pool
        if (rollablePoolBase.length === 0) {
            console.error(`[GachaService] CRITICAL: Legacy pack "${currentPack.name}" has an empty collectible pool after filtering.`);
            return { error: `Legacy Pack "${currentPack.name}" configuration error (empty pool).` };
        }
        // Pick one random card from the legacy pack's specific pool
        const pickedCollectible = shuffleArray([...rollablePoolBase])[0];
        let finalLegacyCard = { ...pickedCollectible };

        // Apply lucky evolution chance even for legacy cards if applicable
        if (finalLegacyCard.evolvesToId && !finalLegacyCard.isEvolvedForm && Math.random() < 0.10) { // 10% evolution chance
            const evolvedForm = SAMPLE_COLLECTIBLES.find(c => c.id === finalLegacyCard.evolvesToId);
            if (evolvedForm) {
                console.log(`[GachaService] Lucky Evolution! ${finalLegacyCard.parodyTitle} evolved into ${evolvedForm.parodyTitle}`);
                finalLegacyCard = { ...evolvedForm, isEvolvedForm: true };
            }
        }
        pulledCollectiblesThisRoll.push(finalLegacyCard);
        console.log(`[GachaService] Legacy Pack pull: ${finalLegacyCard.parodyTitle} (${finalLegacyCard.rarity})`);
    } else {
        // General Pack / General Roll Logic
        const raritiesToPull: CollectibleRarity[] = [];
        for (let i = 0; i < rollSize; i++) {
            // Simplified rarity determination: direct random based on GACHA_RARITY_RATES (pity disabled)
            let chosenRarity: CollectibleRarity = 'Common'; // Fallback
            const randomRoll = Math.random();
            let cumulativeChance = 0;
            const normalizedRates = { ...GACHA_RARITY_RATES };
            let sumRates = Object.values(normalizedRates).reduce((s, r) => s + (r || 0), 0);
             if (sumRates === 0) { // Should not happen if config is valid
                normalizedRates['Common'] = 1; sumRates = 1;
            }
            if (Math.abs(sumRates - 1.0) > 0.001) {
                (Object.keys(normalizedRates) as CollectibleRarity[]).forEach(r => {
                    normalizedRates[r] = (normalizedRates[r] || 0) / sumRates;
                });
            }

            for (const rarity of RARITY_ORDER) { // Use RARITY_ORDER to check in order
                if (rarity === 'Forbidden' && !currentPack?.isLegacyPack) continue; // Forbidden only in legacy or specific events

                cumulativeChance += (normalizedRates[rarity] || 0);
                if (randomRoll < cumulativeChance) {
                    chosenRarity = rarity;
                    break;
                }
            }
            raritiesToPull.push(chosenRarity);
        }
        console.log(`[GachaService] Target rarities for this roll: ${raritiesToPull.join(', ')}`);

        const pulledIdsThisRoll = new Set<string>();
        const shuffledFullPoolForSelection = shuffleArray([...rollablePoolBase]);

        for (const targetRarity of raritiesToPull) {
            let pickedCollectible: Collectible | undefined = undefined;
            const raritySpecificPool = shuffledFullPoolForSelection.filter(c => c.rarity === targetRarity && c.rarity !== 'Forbidden' && c.rarity !== 'Event');

            if (raritySpecificPool.length > 0) {
                pickedCollectible = raritySpecificPool.find(c => !pulledIdsThisRoll.has(c.id));
                if (!pickedCollectible) { // If all unique of this rarity are taken, pick any from this rarity
                    pickedCollectible = raritySpecificPool[Math.floor(Math.random() * raritySpecificPool.length)];
                }
            }

            if (!pickedCollectible) {
                // Fallback: try any non-Forbidden/Event card not yet pulled
                let fallbackPool = shuffledFullPoolForSelection.filter(c => c.rarity !== 'Forbidden' && c.rarity !== 'Event' && !pulledIdsThisRoll.has(c.id));
                if (fallbackPool.length > 0) {
                    pickedCollectible = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
                    console.log(`[GachaService] Fallback to different rarity: ${pickedCollectible.parodyTitle} (${pickedCollectible.rarity}) for target ${targetRarity}`);
                } else {
                    // Absolute fallback: pick any non-Forbidden/Event (duplicates possible if pool is tiny)
                    fallbackPool = SAMPLE_COLLECTIBLES.filter(c => c.rarity !== 'Forbidden' && c.rarity !== 'Event');
                    if (fallbackPool.length > 0) {
                        pickedCollectible = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
                         console.log(`[GachaService] Absolute fallback (duplicate possible): ${pickedCollectible.parodyTitle} (${pickedCollectible.rarity})`);
                    } else {
                        console.error("[GachaService] CRITICAL: No collectible could be found even with fallbacks. Check SAMPLE_COLLECTIBLES.");
                        return { error: "Internal Gacha Error: Could not select any collectible." };
                    }
                }
            }
            
            let finalCollectible = { ...pickedCollectible };
            pulledIdsThisRoll.add(finalCollectible.id); // Track ID for uniqueness within this roll

            if (finalCollectible.evolvesToId && !finalCollectible.isEvolvedForm && Math.random() < 0.10) { // 10% evolution chance
                const evolvedForm = SAMPLE_COLLECTIBLES.find(c => c.id === finalCollectible.evolvesToId);
                if (evolvedForm) {
                    console.log(`[GachaService] Lucky Evolution! ${finalCollectible.parodyTitle} evolved into ${evolvedForm.parodyTitle}`);
                    finalCollectible = { ...evolvedForm, isEvolvedForm: true };
                }
            }
            pulledCollectiblesThisRoll.push(finalCollectible);
        }
    }


    console.log(`[GachaService] Roll complete. Pulled: ${pulledCollectiblesThisRoll.map(c => `${c.parodyTitle} (${c.rarity})`).join(', ')}.`);
    return { collectibles: pulledCollectiblesThisRoll };
}
