
// src/types/collectibles.ts

export type CollectibleRarity =
  | 'Common'
  | 'Rare'
  | 'Ultra Rare'
  | 'Legendary'
  | 'Mythic'
  | 'Event';

export interface Collectible {
  id: string; // Unique ID for the collectible (e.g., "crying-rain-sim")
  parodyTitle: string;
  originalMalId?: number; // Optional: MAL ID of the original work for reference
  rarity: CollectibleRarity;
  parodyBlurb: string;
  imageUrl: string | null; // URL to the collectible's image
  genreTags?: string[]; // Parody or original genres
  moodTags?: string[]; // Associated moods
}

// Sample data for the Gacha system
export const SAMPLE_COLLECTIBLES: Collectible[] = [
  {
    id: 'crying-rain-sim',
    parodyTitle: 'Crying in the Rain Simulator',
    originalMalId: 12345, // Example MAL ID
    rarity: 'Common',
    parodyBlurb: "Experience the thrill of... well, mostly just crying. In the rain. It's deeper than it sounds. Maybe.",
    imageUrl: 'https://placehold.co/300x400.png?text=RainCrySim&font=lora',
    genreTags: ['Drama', 'Slice of Life', 'Existential Dread'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'sword-boy-screams',
    parodyTitle: 'Sword Boy Screams for 300 Episodes',
    originalMalId: 54321,
    rarity: 'Rare',
    parodyBlurb: "He has a sword. He screams. A lot. Sometimes he wins. Sometimes he screams more. Peak fiction.",
    imageUrl: 'https://placehold.co/300x400.png?text=SwordScream&font=lora',
    genreTags: ['Action', 'Shonen', 'Power-Up'],
    moodTags: ['Adrenaline Rush'],
  },
  {
    id: 'roommate-yandere',
    parodyTitle: 'My Roommate Is a God-Level Yandere',
    originalMalId: 98760,
    rarity: 'Rare',
    parodyBlurb: "She's perfect! Except for the occasional divine retribution on anyone who looks at you. Totally normal.",
    imageUrl: 'https://placehold.co/300x400.png?text=YandereGod&font=lora',
    genreTags: ['Romance', 'Comedy', 'Horror', 'Supernatural'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'vending-machine-screams',
    parodyTitle: 'I Reincarnated as a Vending Machine but It’s Powered by Screams',
    originalMalId: 65432,
    rarity: 'Ultra Rare',
    parodyBlurb: "Dispensing lukewarm soda and existential angst. Each purchase fuels its tortured existence. Quench your thirst... for suffering.",
    imageUrl: 'https://placehold.co/300x400.png?text=ScreamVendor&font=lora',
    genreTags: ['Isekai', 'Dark Fantasy', 'Comedy'],
    moodTags: ['Dark & Deep'],
  },
  {
    id: 'depression-animated',
    parodyTitle: 'Depression: The Animated Series',
    originalMalId: 24680,
    rarity: 'Common',
    parodyBlurb: "It's just like real life, but with more muted colors and a surprisingly good soundtrack.",
    imageUrl: 'https://placehold.co/300x400.png?text=Depression&font=lora',
    genreTags: ['Slice of Life', 'Drama', 'Psychological'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'sao-good-this-time',
    parodyTitle: 'Sword Art Actually Kinda Good This Time??',
    originalMalId: 11757,
    rarity: 'Mythic',
    parodyBlurb: "Against all odds, Kirito logs into a game that doesn't immediately try to kill him. Character development ensues. Or does it?",
    imageUrl: 'https://placehold.co/300x400.png?text=SAOgood&font=lora',
    genreTags: ['Isekai', 'Action', 'Adventure', 'Meta'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'she-breathed-once',
    parodyTitle: 'She Breathed Once, So He Fell in Love',
    originalMalId: 13579,
    rarity: 'Common',
    parodyBlurb: "The pinnacle of shoujo romance. Witness breathtaking...breathing. And instantaneous, undying devotion.",
    imageUrl: 'https://placehold.co/300x400.png?text=LoveBreathe&font=lora',
    genreTags: ['Romance', 'Shoujo', 'School Life'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'naruto-uncle-returns',
    parodyTitle: 'Naruto’s Lost Uncle Returns in 2025',
    originalMalId: 20, // Naruto's MAL ID
    rarity: 'Event',
    parodyBlurb: "Believe it! He's got a new jutsu: 'The Power of Forgotten Relatives!' Get ready for filler... we mean, epic new lore!",
    imageUrl: 'https://placehold.co/300x400.png?text=UncleNaruto&font=lora',
    genreTags: ['Action', 'Adventure', 'Shonen', 'Event'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'budget-jojo',
    parodyTitle: 'Budget JoJo but Still Fire',
    originalMalId: 14719, // JoJo's Bizarre Adventure (TV)
    rarity: 'Legendary',
    parodyBlurb: "The poses are slightly less fabulous, the 'Ora Ora' is more of an 'Okay Okay,' but the spirit is indomitable!",
    imageUrl: 'https://placehold.co/300x400.png?text=BudgetJoJo&font=lora',
    genreTags: ['Action', 'Adventure', 'Supernatural', 'Comedy'],
    moodTags: ['Adrenaline Rush'],
  },
];
