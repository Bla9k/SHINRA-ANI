
// src/config/gachaConfig.ts
import type { CollectibleRarity } from '@/types/collectibles';

export const GACHA_ROLL_SIZE = 4;
export const GACHA_COST = 0; // Still free for beta

// Base Drop Rates (should sum to 1.0)
export const GACHA_RARITY_RATES: Record<CollectibleRarity, number> = {
  Common: 0.60,      // 60%
  Rare: 0.25,        // 25%
  'Ultra Rare': 0.09,// 9%
  Legendary: 0.04,   // 4%
  Mythic: 0.02,      // 2%
  Event: 0,          // Event items typically have their own banners or specific conditions
};

// Pity System Parameters
// Rarity tiers that trigger pity reset and are guaranteed by hard pity
export const PITY_TARGET_RARITIES: CollectibleRarity[] = ['Legendary', 'Mythic', 'Event'];

export const HARD_PITY_COUNT = 90; // Guaranteed target rarity at this many pulls without one
export const SOFT_PITY_START_COUNT = 75; // Chance for target rarities starts increasing significantly

// How much the combined chance of PITY_TARGET_RARITIES increases per pull during soft pity.
// For example, if 0.05 (5%), and base total for targets is 6%, at pull 76 it becomes 11%, at pull 77 it's 16%, etc.
// This increase is then distributed among the PITY_TARGET_RARITIES.
export const SOFT_PITY_INCREASE_RATE = 0.06; // 6% increase per pull in soft pity for target rarities sum

// How to distribute the pity chance among target rarities if hard pity is hit,
// or how to distribute the increased soft pity chance.
// Example: if PITY_TARGET_RARITIES = ['Legendary', 'Mythic']
// Then Legendary might get 70% of the pity chance, Mythic 30%.
export const PITY_DISTRIBUTION: Partial<Record<CollectibleRarity, number>> = {
  Legendary: 0.70, // 70% of the pity chance goes to Legendary
  Mythic: 0.28,    // 28% of the pity chance goes to Mythic
  Event: 0.02,     // 2% of the pity chance goes to Event (if applicable)
};

// Validate that PITY_DISTRIBUTION sums to 1 for the PITY_TARGET_RARITIES it covers
const pityDistributionSum = PITY_TARGET_RARITIES.reduce((sum, rarity) => {
    return sum + (PITY_DISTRIBUTION[rarity] || 0);
}, 0);

if (Math.abs(pityDistributionSum - 1.0) > 0.001 && PITY_TARGET_RARITIES.length > 0) {
    console.warn(
        `GACHA WARNING: PITY_DISTRIBUTION values for PITY_TARGET_RARITIES do not sum to 1.0 (Current sum: ${pityDistributionSum}). ` +
        `This may lead to unexpected behavior during pity pulls. Please adjust PITY_DISTRIBUTION for [${PITY_TARGET_RARITIES.join(', ')}].`
    );
}

// Validate that GACHA_RARITY_RATES sum to 1.0
const baseRateSum = Object.values(GACHA_RARITY_RATES).reduce((sum, rate) => sum + rate, 0);
if (Math.abs(baseRateSum - 1.0) > 0.001) {
    console.warn(
        `GACHA WARNING: GACHA_RARITY_RATES do not sum to 1.0 (Current sum: ${baseRateSum}). ` +
        `Drop rates will be normalized, but this may indicate a configuration error.`
    );
}
