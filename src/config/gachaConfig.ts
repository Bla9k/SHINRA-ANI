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
export const SOFT_PITY_INCREASE_RATE = 0.06; // 6% increase per pull in soft pity for target rarities sum

// How to distribute the pity chance among target rarities if hard pity is hit,
// or how to distribute the increased soft pity chance.
export const PITY_DISTRIBUTION: Partial<Record<CollectibleRarity, number>> = {
  Legendary: 0.70,
  Mythic: 0.28,
  Event: 0.02,
};

// For precise fusion
export const RARITY_ORDER: CollectibleRarity[] = ['Common', 'Rare', 'Ultra Rare', 'Legendary', 'Mythic'];
export const RARITY_NUMERICAL_VALUE: Record<CollectibleRarity, number> = {
    Common: 0,
    Rare: 1,
    'Ultra Rare': 2,
    Legendary: 3,
    Mythic: 4,
    Event: 5, // Event rarity is high but typically excluded from standard fusion
};


// Validate that PITY_DISTRIBUTION sums to 1 for the PITY_TARGET_RARITIES it covers
const pityDistributionSum = PITY_TARGET_RARITIES.reduce((sum, rarity) => {
    return sum + (PITY_DISTRIBUTION[rarity] || 0);
}, 0);

if (Math.abs(pityDistributionSum - 1.0) > 0.001 && PITY_TARGET_RARITIES.length > 0 && PITY_TARGET_RARITIES.some(r => PITY_DISTRIBUTION[r] && PITY_DISTRIBUTION[r]! > 0) ) {
    console.warn(
        `GACHA WARNING: PITY_DISTRIBUTION values for PITY_TARGET_RARITIES do not sum to 1.0 (Current sum: ${pityDistributionSum}). ` +
        `This may lead to unexpected behavior during pity pulls. Please adjust PITY_DISTRIBUTION for [${PITY_TARGET_RARITIES.join(', ')}].`
    );
}

// Validate that GACHA_RARITY_RATES sum to 1.0
const baseRateSum = Object.values(GACHA_RARITY_RATES).reduce((sum, rate) => sum + rate, 0);
if (Math.abs(baseRateSum - 1.0) > 0.001) {
    console.warn(
        `GACHA WARNING: GACHA_RARITY_RATES do not sum to 1.0