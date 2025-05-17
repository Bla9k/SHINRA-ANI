
// src/config/gachaConfig.ts
import type { CollectibleRarity } from '@/types/collectibles';

export const GACHA_ROLL_SIZE = 4;
export const GACHA_COST = 0; // Still free for beta

// Base Drop Rates (should sum to 1.0 for general pool)
// Note: These won't directly apply to Legacy Pack, which has its own pull logic.
export const GACHA_RARITY_RATES: Record<CollectibleRarity, number> = {
  Common: 0.58,      // 58%
  Rare: 0.25,        // 25%
  'Ultra Rare': 0.09,// 9%
  Legendary: 0.04,   // 4%
  Mythic: 0.02,      // 2%
  Event: 0.02,       // 2% chance for an event card in general pool (if any are not packExclusive)
  Forbidden: 0,      // 0% in general pool, only from Legacy Pack or specific events
};

// Pity System Parameters
// Rarity tiers that trigger pity reset and are guaranteed by hard pity
export const PITY_TARGET_RARITIES: CollectibleRarity[] = ['Legendary', 'Mythic', 'Event', 'Forbidden'];

export const HARD_PITY_COUNT = 90;
export const SOFT_PITY_START_COUNT = 75;
export const SOFT_PITY_INCREASE_RATE = 0.06;

// Distribution for pity pulls (if a pity target is hit)
export const PITY_DISTRIBUTION: Partial<Record<CollectibleRarity, number>> = {
  Legendary: 0.60,
  Mythic: 0.25,
  Event: 0.10,
  Forbidden: 0.05, // Small chance even on general pity if we decide Forbidden can drop rarely outside Legacy. For now, Legacy pack is main source.
};

// Order for fusion logic and display
export const RARITY_ORDER: CollectibleRarity[] = ['Common', 'Rare', 'Ultra Rare', 'Legendary', 'Mythic', 'Event', 'Forbidden'];
export const RARITY_NUMERICAL_VALUE: Record<CollectibleRarity, number> = {
    Common: 0,
    Rare: 1,
    'Ultra Rare': 2,
    Legendary: 3,
    Mythic: 4,
    Event: 5, // Event can be considered higher than Mythic for some purposes
    Forbidden: 6, // Highest tier
};


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

    