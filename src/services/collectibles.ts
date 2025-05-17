// src/services/collectibles.ts
'use server';

import { SAMPLE_COLLECTIBLES, SAMPLE_PACKS, type Collectible, type CollectibleRarity, type GachaPack } from '@/types/collectibles';
import { GACHA_ROLL_SIZE, RARITY_ORDER, RARITY_NUMERICAL_VALUE, GACHA_RARITY_RATES } from '@/config/gachaConfig';
import { shuffleArray } from '@/lib/utils'; // Import shuffleArray

const GACHA_COST = 0; // Still free for beta

/**
 * Performs a Gacha roll.
 * If packId is provided, rolls from that specific pack's pool.
 * Otherwise, rolls from the general pool.
 * Attempts to ensure unique collectibles within the roll if the pool allows.
 * Includes a chance for a "lucky evolution" if a pulled card can evolve.
 */
export async function performGachaRoll(packId?: string): Promise<{ collectibles: Collectible[] } | { error: string }> {
    console.log(`[GachaService] Performing Gacha roll. PackID: ${packId}`);

    let rollablePoolBase = [...SAMPLE_COLLECTIBLES];
    let currentPack: GachaPack | undefined = undefined;
    let rollSize = GACHA_ROLL_SIZE;

    if (packId) {
        currentPack = SAMPLE_PACKS.find(p => p.id === packId);
        if (currentPack) {
            rollablePoolBase = SAMPLE_COLLECTIBLES.filter(c => currentPack!.collectibleIds.includes(c.id));
            if (currentPack.isLegacyPack) {
                rollSize = 1;
                // Legacy pack specifically targets its defined high-tier cards
                rollablePoolBase = SAMPLE_COLLECTIBLES.filter(c => 
                    currentPack!.collectibleIds.includes(c.id) && 
                    (c.rarity === 'Mythic' || c.rarity === 'Event' || c.rarity === 'Forbidden')
                );
                console.log(`[GachaService] Legacy Pack roll. Pool size: ${rollablePoolBase.length}`);
            } else {
                console.log(`[GachaService] Rolling from pack "${currentPack.name}". Base pool size: ${rollablePoolBase.length}`);
            }

            if (rollablePoolBase.length === 0) {
                return { error: `Pack "${currentPack.name}" has no suitable collectibles.` };
            }
        } else {
            return { error: `Gacha Pack with ID "${packId}" not found.` };
        }
    } else {
        console.log(`[GachaService] Performing general roll. Base pool size: ${rollablePoolBase.length}`);
    }

    const pulledCollectiblesThisRoll: Collectible[] = [];

    // Simplified roll logic without pity or weighted rates for now
    const shuffledPool = shuffleArray([...rollablePoolBase]); // Shuffle a copy

    if (rollablePoolBase.length >= rollSize) { // Enough unique items for the roll
        for (let i = 0; i < rollSize; i++) {
            if (shuffledPool.length > i) {
                let chosenCollectible = { ...shuffledPool[i] }; // Pick unique
                // Lucky Evolution Chance (not for Forbidden tier)
                if (chosenCollectible.evolvesToId && chosenCollectible.rarity !== 'Forbidden' && Math.random() < 0.10) {
                    const evolvedForm = SAMPLE_COLLECTIBLES.find(c => c.id === chosenCollectible.evolvesToId);
                    if (evolvedForm) {
                        console.log(`[GachaService] Lucky Evolution! ${chosenCollectible.parodyTitle} evolved into ${evolvedForm.parodyTitle}`);
                        chosenCollectible = { ...evolvedForm };
                    }
                }
                pulledCollectiblesThisRoll.push(chosenCollectible);
            } else {
                // This case should not be hit if rollablePoolBase.length >= rollSize,
                // but as a fallback, pick randomly with replacement
                const fallbackCollectible = { ...rollablePoolBase[Math.floor(Math.random() * rollablePoolBase.length)] };
                // Apply evolution chance here too if needed
                pulledCollectiblesThisRoll.push(fallbackCollectible);
            }
        }
    } else { // Not enough unique items, pick with replacement
        console.warn(`[GachaService] Not enough unique items in pool (${rollablePoolBase.length}) for a roll of ${rollSize}. Picking with replacement.`);
        for (let i = 0; i < rollSize; i++) {
            let chosenCollectible = { ...rollablePoolBase[Math.floor(Math.random() * rollablePoolBase.length)] };
            // Lucky Evolution Chance (not for Forbidden tier)
            if (chosenCollectible.evolvesToId && chosenCollectible.rarity !== 'Forbidden' && Math.random() < 0.10) {
                const evolvedForm = SAMPLE_COLLECTIBLES.find(c => c.id === chosenCollectible.evolvesToId);
                if (evolvedForm) {
                    console.log(`[GachaService] Lucky Evolution! ${chosenCollectible.parodyTitle} evolved into ${evolvedForm.parodyTitle}`);
                    chosenCollectible = { ...evolvedForm };
                }
            }
            pulledCollectiblesThisRoll.push(chosenCollectible);
        }
    }

    console.log(`[GachaService] Roll complete. Pulled: ${pulledCollectiblesThisRoll.map(c => `${c.parodyTitle} (${c.rarity})`).join(', ')}.`);
    return { collectibles: pulledCollectiblesThisRoll };
}

export async function getDisplayCollectibles(): Promise<Collectible[]> {
  return SAMPLE_COLLECTIBLES;
}
