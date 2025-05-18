// src/config/gachaConfig.ts
import type { CollectibleRarity } from '@/types/collectibles.ts';

export const GACHA_ROLL_SIZE = 4; // How many cards from a general or standard pack roll
export const GACHA_COST = 0; // For beta, Gacha is free

// Base Drop Rates (should sum to 1.0 for general pool)
export const GACHA_RARITY_RATES: Record<CollectibleRarity, number> = {
  Common: 0.55,      // 55%
  Rare: 0.28,        // 28%
  'Ultra Rare': 0.10,// 10%
  Legendary: 0.04,   // 4%
  Mythic: 0.02,      // 2%
  Event: 0.01,       // 1% chance for an event card in general pool (if any are not packExclusive)
  Forbidden: 0,      // 0% in general pool, only from Legacy Pack or specific events
};

// Pity System Parameters
// Rarity tiers that trigger pity reset and are guaranteed by hard pity
export const PITY_TARGET_RARITIES: CollectibleRarity[] = ['Legendary', 'Mythic', 'Event', 'Forbidden'];

export const HARD_PITY_COUNT = 90; // Guarantees a pity target card by this many INDIVIDUAL card pulls
export const SOFT_PITY_START_COUNT = 70; // Chance for pity target cards starts increasing significantly
export const SOFT_PITY_INCREASE_RATE = 0.06; // Additional 6% chance for a pity target PER PULL into soft pity

// Distribution for *hard pity* pulls (if a hard pity target is hit)
// This sums to 1.0 for the PITY_TARGET_RARITIES
export const PITY_DISTRIBUTION: Partial<Record<CollectibleRarity, number>> = {
  Legendary: 0.60,   // 60% chance of Legendary on hard pity
  Mythic: 0.30,      // 30% chance of Mythic on hard pity
  Event: 0.08,       // 8% chance of Event card on hard pity (if available)
  Forbidden: 0.02,   // 2% chance of Forbidden on hard pity (if available and not pack-exclusive)
};

// Order for fusion logic and display, from lowest to highest
export const RARITY_ORDER: CollectibleRarity[] = ['Common', 'Rare', 'Ultra Rare', 'Legendary', 'Mythic', 'Event', 'Forbidden'];

// Numerical value for rarity comparison and fusion logic
export const RARITY_NUMERICAL_VALUE: Record<CollectibleRarity, number> = {
    Common: 0,
    Rare: 1,
    'Ultra Rare': 2,
    Legendary: 3,
    Mythic: 4,
    Event: 5, // Event can be considered higher than Mythic for some purposes
    Forbidden: 6, // Highest tier
};


// --- Validations for Gacha Config ---
// Validate that PITY_DISTRIBUTION sums to 1.0 for the PITY_TARGET_RARITIES it covers
const activePityDistributionSum = PITY_TARGET_RARITIES.reduce((sum, rarity) => {
    // Only include rarities explicitly defined in PITY_DISTRIBUTION for the sum check
    return sum + (PITY_DISTRIBUTION[rarity] || 0);
}, 0);

// Check if there are any pity target rarities with a defined distribution
const hasDefinedPityDistribution = PITY_TARGET_RARITIES.some(r => (PITY_DISTRIBUTION[r] ?? 0) > 0);

if (hasDefinedPityDistribution && Math.abs(activePityDistributionSum - 1.0) > 0.001) {
    console.warn(
        `GACHA WARNING: PITY_DISTRIBUTION values for active PITY_TARGET_RARITIES do not sum to 1.0 (Current sum: ${activePityDistributionSum}). ` +
        `This may lead to unexpected behavior during pity pulls. Please adjust PITY_DISTRIBUTION for [${PITY_TARGET_RARITIES.join(', ')}].`
    );
}


// Validate that GACHA_RARITY_RATES sum to 1.0
const baseRateSum = Object.values(GACHA_RARITY_RATES).reduce((sum, rate) => sum + rate, 0);
if (Math.abs(baseRateSum - 1.0) > 0.001) {
    console.warn(
        `GACHA WARNING: GACHA_RARITY_RATES do not sum to 1.0 (Current sum: ${baseRateSum}). Drop rates will be normalized if this is not corrected.`
    );
}
