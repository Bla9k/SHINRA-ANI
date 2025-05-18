// src/types/collectibles.ts

export type CollectibleRarity =
  | 'Common'
  | 'Rare'
  | 'Ultra Rare'
  | 'Legendary'
  | 'Mythic'
  | 'Event'
  | 'Forbidden';

export interface Collectible {
  id: string;
  parodyTitle: string;
  originalMalId: number;
  originalType: 'anime' | 'manga';
  rarity: CollectibleRarity;
  parodyBlurb: string;
  imageUrl: string | null; // Can be specific parody art or a fallback
  genreTags?: string[];
  moodTags?: string[];
  evolvesToId?: string;
  isEvolvedForm?: boolean;
  packExclusive?: boolean; // Can this collectible ONLY be found in packs?
}

export interface GachaPack {
  id: string;
  name: string;
  description: string;
  themeTags?: string[];
  faceCardCollectibleId?: string; // ID of a Collectible to be the "face" of the pack
  packImageUrl?: string; // Dedicated image URL for the pack art
  collectibleIds: string[]; // Collectible IDs available in THIS pack
  isLegacyPack?: boolean; // Flag for special handling like single, high-tier card
  // Optional: Pack-specific rarity overrides or boosted chances
  // dropRateModifiers?: Partial<Record<CollectibleRarity, number>>;
}

// Placeholders for image URLs - these help distinguish if a specific art is missing vs. general error
export const NO_ART_PLACEHOLDER = 'https://placehold.co/300x450/0a0a0a/777777?text=NoParodyArt&font=poppins';
export const GENERIC_LOADING_PLACEHOLDER = 'https://placehold.co/300x450/1a1b26/e0e7ef?text=Loading...&font=poppins';
export const IMAGE_UNAVAILABLE_PLACEHOLDER = 'https://placehold.co/300x450/1a1b26/e0e7ef?text=ImageError&font=poppins';
export const LEGACY_DATA_PLACEHOLDER = 'https://placehold.co/300x450/050505/cc0000?text=LEGACY_DATA&font=orbitron';


// --- SAMPLE COLLECTIBLES ---
// This list should be expanded significantly.
export const SAMPLE_COLLECTIBLES: Collectible[] = [
  {
    id: 'lelouch-zero-requiem',
    parodyTitle: "The Emperor's Final Gambit: Zero Requiem",
    originalMalId: 1575, // Code Geass: Lelouch of the Rebellion
    originalType: 'anime',
    rarity: 'Forbidden',
    parodyBlurb: "To save the world, he became its greatest villain. A masterpiece of manipulation and sacrifice. All Hail Lelouch!",
    imageUrl: 'https://placehold.co/300x400/0d0208/e00034?text=ZERO_REQUIEM&font=cinzel', // Thematic Placeholder
    genreTags: ['Mecha', 'Military', 'Drama', 'Psychological', 'Super Power'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster', 'Epic Adventure'],
    packExclusive: true,
  },
  {
    id: 'sao-good-this-time',
    parodyTitle: 'Sword Art Actually Kinda Good This Time??',
    originalMalId: 11757, // Sword Art Online
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Against all odds, Kirito logs into a game that doesn't immediately try to kill him. Character development ensues. Or does it?",
    imageUrl: 'https://placehold.co/300x400/mythicgold/000000?text=SAO+Redemption&font=sans-serif',
    genreTags: ['Isekai', 'Action', 'Adventure', 'Meta'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'naruto-s-lost-uncle-returns-in-2025',
    parodyTitle: 'Naruto’s Lost Uncle Returns in 2025',
    originalMalId: 20, // Naruto
    originalType: 'anime',
    rarity: 'Event',
    parodyBlurb: "Believe it! He's got a new jutsu: 'The Power of Forgotten Relatives!' Get ready for filler... we mean, epic new lore!",
    imageUrl: 'https://placehold.co/300x400/eventyellow/000000?text=UncleNaruto&font=naruto',
    genreTags: ['Action', 'Adventure', 'Shonen', 'Event'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
    packExclusive: true,
  },
  {
    id: 'budget-jojo-but-still-fire',
    parodyTitle: 'Budget JoJo but Still Fire',
    originalMalId: 14719, // JoJo's Bizarre Adventure (TV)
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "The poses are slightly less fabulous, the 'Ora Ora' is more of an 'Okay Okay,' but the spirit is indomitable!",
    imageUrl: 'https://placehold.co/300x400/legendaryorange/FFFFFF?text=Budget+JoJo&font=impact',
    genreTags: ['Action', 'Adventure', 'Supernatural', 'Comedy'],
    moodTags: ['Adrenaline Rush'],
  },
  {
    id: 'isekai-truck-kun',
    parodyTitle: 'Truck-kun Strikes Again!',
    originalMalId: 37430, // That Time I Got Reincarnated as a Slime (example for isekai trigger)
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Our hero's previous life was... short. Now he's a [random object] in a fantasy world. Standard procedure.",
    imageUrl: 'https://placehold.co/300x400/commonblue/FFFFFF?text=Truck-Kun&font=arial',
    genreTags: ['Isekai', 'Fantasy', 'Comedy'],
    moodTags: ['Epic Adventure', 'Comfy & Cozy'],
    evolvesToId: 'isekai-truck-kun-deluxe',
  },
  {
    id: 'isekai-truck-kun-deluxe',
    parodyTitle: 'Truck-kun: Interdimensional Delivery Service',
    originalMalId: 37430,
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "He's no longer just a harbinger of isekai; he's a full-service transportation solution for protagonists!",
    imageUrl: 'https://placehold.co/300x400/rareblue/FFFFFF?text=Truck-Kun+Deluxe&font=arial',
    genreTags: ['Isekai', 'Fantasy', 'Comedy', 'Meta'],
    moodTags: ['Epic Adventure', 'Hilarious'],
    isEvolvedForm: true,
  },
  {
    id: 'magical-girl-despair',
    parodyTitle: 'Suffering Builds Character (Magical Girl Edition)',
    originalMalId: 9756, // Puella Magi Madoka Magica
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Cute girls, cute outfits, soul-crushing despair. What's not to love? Contractually obligated fun!",
    imageUrl: 'https://placehold.co/300x400/ultrararepurple/FFFFFF?text=Despair+Magi&font=cursive',
    genreTags: ['Mahou Shoujo', 'Psychological', 'Dark Fantasy', 'Drama'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'angsty-teen-reluctantly-pilots-giant-robot-again',
    parodyTitle: 'Angsty Teen Reluctantly Pilots Giant Robot Again',
    originalMalId: 30, // Neon Genesis Evangelion
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Get in the robot, Shinji! Or don't. We're all doomed anyway. Existential dread sold separately.",
    imageUrl: 'https://placehold.co/300x400/legendaryorange/FFFFFF?text=Angst+Robot&font=impact',
    genreTags: ['Mecha', 'Psychological', 'Drama', 'Sci-Fi'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'my-smartphone-in-another-world:-now-with-5g!',
    parodyTitle: 'My Smartphone In Another World: Now With 5G!',
    originalMalId: 35203, // In Another World With My Smartphone
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He's got god-tier Wi-Fi and a harem that updates like an app. What more could you want?",
    imageUrl: 'https://placehold.co/300x400/commonblue/FFFFFF?text=5G+Isekai&font=arial',
    genreTags: ['Isekai', 'Harem', 'Fantasy', 'Comedy'],
    moodTags: ['Comfy & Cozy', 'Hilarious'],
  },
  {
    id: 'food-wars:-extra-salty-edition',
    parodyTitle: 'Food Wars: Extra Salty Edition',
    originalMalId: 28171, // Shokugeki no Soma
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "The foodgasms are more intense, the rivalries spicier, and the plot armor? Chef's kiss!",
    imageUrl: 'https://placehold.co/300x400/rareblue/FFFFFF?text=Salty+Food&font=arial',
    genreTags: ['Shonen', 'Ecchi', 'School', 'Comedy'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
    isEvolvedForm: false, // Can evolve from a common "Food Wars: Regular Seasoning"
  },
  {
    id: 'berserk:-the-suffering-never-ends-(but-the-art-is-great)',
    parodyTitle: 'Berserk: The Suffering Never Ends (But The Art Is Great)',
    originalMalId: 22, // Berserk (Manga)
    originalType: 'manga',
    rarity: 'Legendary',
    parodyBlurb: "Follow Guts as he experiences every possible form of pain, rendered in excruciatingly beautiful detail.",
    imageUrl: 'https://placehold.co/300x400/legendaryorange/FFFFFF?text=Berserk+Pain&font=gothic',
    genreTags: ['Dark Fantasy', 'Action', 'Horror', 'Tragedy', 'Seinen'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'chainsaw-man:-denji-really-needs-therapy-(and-a-hug)',
    parodyTitle: 'Chainsaw Man: Denji Really Needs Therapy (And A Hug)',
    originalMalId: 116778, // Chainsaw Man (Manga)
    originalType: 'manga',
    rarity: 'Mythic',
    parodyBlurb: "He just wants a normal life, but destiny (and devils) have other, gorier plans. Woof.",
    imageUrl: 'https://placehold.co/300x400/mythicgold/000000?text=Denji+Therapy&font=impact',
    genreTags: ['Action', 'Dark Fantasy', 'Horror', 'Shonen'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'gintama:-the-fourth-wall-is-but-a-suggestion',
    parodyTitle: 'Gintama: The Fourth Wall Is But A Suggestion',
    originalMalId: 918, // Gintama
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Parodying everything from Dragon Ball to current events, while occasionally having a serious plot. Masterpiece.",
    imageUrl: 'https://placehold.co/300x400/mythicgold/000000?text=Gintama+NoWall&font=comic-sans',
    genreTags: ['Action', 'Comedy', 'Historical', 'Parody', 'Samurai', 'Sci-Fi', 'Shonen'],
    moodTags: ['Hilarious', 'Adrenaline Rush'],
  },
   {
    id: 'one-piece:-the-journey-that-will-outlive-us-all',
    parodyTitle: 'One Piece: The Journey That Will Outlive Us All',
    originalMalId: 21, // One Piece
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Set sail for adventure! And keep sailing. And sailing. Is there even an end? Who cares, it's fun!",
    imageUrl: 'https://placehold.co/300x400/mythicgold/000000?text=OnePiece+Endless&font=pirate',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Shonen', 'Super Power'],
    moodTags: ['Epic Adventure', 'Heartwarming'],
  },
  {
    id: 'cowboy-bebop:-space-jazz-and-existential-dread',
    parodyTitle: 'Cowboy Bebop: Space Jazz And Existential Dread',
    originalMalId: 1, // Cowboy Bebop
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "See you, space cowboy... You're gonna carry that weight. A timeless classic of cool and melancholy.",
    imageUrl: 'https://placehold.co/300x400/mythicgold/000000?text=Bebop+Blues&font=jazz',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Drama', 'Sci-Fi', 'Space', 'Adult Cast'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
   {
    id: 'the-tatami-galaxy:-college-student-relives-his-first-two-years-repeatedly-trying-to-find-happiness',
    parodyTitle: 'The Tatami Galaxy: College Student Relives His First Two Years Repeatedly Trying To Find Happiness',
    originalMalId: 7785, // Yojouhan Shinwa Taikei
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "A rapid-fire, surreal, and ultimately heartwarming story about choices, regret, and the elusive 'rose-colored campus life.'",
    imageUrl: 'https://placehold.co/300x400/mythicgold/000000?text=Tatami+Loop&font=mincho',
    genreTags: ['Mystery', 'Psychological', 'Romance', 'Comedy', 'Time Travel (sort of)'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'devilman-crybaby:-demons,-sex,-drugs,-and-a-whole-lot-of-crying',
    parodyTitle: 'Devilman Crybaby: Demons, Sex, Drugs, And A Whole Lot Of Crying',
    originalMalId: 35120, // Devilman: Crybaby
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "A beautiful and brutal depiction of love, betrayal, and the end of the world. You will not be okay.",
    imageUrl: 'https://placehold.co/300x400/mythicgold/000000?text=Devilman+Tears&font=gothic',
    genreTags: ['Action', 'Avant Garde', 'Demons', 'Drama', 'Horror', 'Supernatural', 'Gore'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
   {
    id: 'the-end-of-evangelion:-congratulations!-(everyone-turns-into-tang)',
    parodyTitle: 'The End of Evangelion: Congratulations! (Everyone Turns Into Tang)',
    originalMalId: 32, // Neon Genesis Evangelion: The End of Evangelion
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "The original ending wasn't confusing enough, so here's a movie to make you question reality even more. Tumbling down.",
    imageUrl: 'https://placehold.co/300x400/mythicgold/000000?text=EoE+Tang&font=serif-monospace',
    genreTags: ['Action', 'Avant Garde', 'Dementia', 'Drama', 'Mecha', 'Psychological', 'Sci-Fi', 'Suspense'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'grave-of-the-fireflies:-you-will-cry.-that-s-it,-that-s-the-description.',
    parodyTitle: 'Grave of the Fireflies: You Will Cry. That’s It, That’s The Description.',
    originalMalId: 578, // Hotaru no Haka
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "A beautiful and devastating anti-war film. Prepare for uncontrollable sobbing. Do not watch if you want to be happy.",
    imageUrl: 'https://placehold.co/300x400/mythicgold/000000?text=Fireflies+Sad&font=serif',
    genreTags: ['Drama', 'Historical', 'Tragedy', 'War'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: '[oshi-no-ko]:-the-dark-side-of-showbiz-(with-reincarnation-and-revenge)',
    parodyTitle: '[Oshi no Ko]: The Dark Side Of Showbiz (With Reincarnation And Revenge)',
    originalMalId: 52034, // [Oshi no Ko]
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Idols, actors, and a whole lot of trauma. This story goes places you wouldn't expect.",
    imageUrl: 'https://placehold.co/300x400/mythicgold/000000?text=OshiNoKo+Revenge&font=sans-serif',
    genreTags: ['Drama', 'Mystery', 'Psychological', 'Reincarnation', 'Supernatural', 'Seinen', 'Showbiz'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'frieren:-beyond-journey-s-end-(elf-outlives-everyone,-learns-to-feel)',
    parodyTitle: 'Frieren: Beyond Journey’s End (Elf Outlives Everyone, Learns To Feel)',
    originalMalId: 52991, // Sousou no Frieren
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "A quiet, melancholic journey about time, loss, and the importance of making memories. Peak fantasy.",
    imageUrl: 'https://placehold.co/300x400/mythicgold/000000?text=Frieren+Journey&font=serif',
    genreTags: ['Adventure', 'Drama', 'Fantasy', 'Shonen', 'Slice of Life'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
   {
    id: 'solo-leveling:-weakest-hunter-becomes-strongest-(with-a-video-game-system)',
    parodyTitle: 'Solo Leveling: Weakest Hunter Becomes Strongest (With A Video Game System)',
    originalMalId: 121496, // Na Honjaman Level Up (Manhwa)
    originalType: 'manga',
    rarity: 'Legendary',
    parodyBlurb: "Arise! Sung Jinwoo grinds his way to the top, one shadow soldier at a time. Pure power fantasy.",
    imageUrl: 'https://placehold.co/300x400/legendaryorange/FFFFFF?text=Solo+Level+Up&font=impact',
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Super Power', 'Webtoon'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
   {
    id: 'frieren-beyond-journey-s-end-season-2',
    parodyTitle: 'Frieren S2: More Feels, More Flashbacks',
    originalMalId: 58305, // Sousou no Frieren Season 2 (Hypothetical MAL ID for S2)
    originalType: 'anime',
    rarity: 'Event',
    parodyBlurb: "The journey through time and memory continues. Prepare for more quiet contemplation and emotional gut punches.",
    imageUrl: 'https://placehold.co/300x400/eventyellow/000000?text=Frieren+S2&font=serif',
    genreTags: ['Adventure', 'Drama', 'Fantasy', 'Slice of Life'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
    packExclusive: true,
  },
  {
    id: 'chainsaw-man-movie:-rezebomb',
    parodyTitle: 'Chainsaw Man Movie: The Reze Bomb (Prepare for Pain)',
    originalMalId: 56679, // Chainsaw Man Movie: Reze-hen (Actual MAL ID)
    originalType: 'anime',
    rarity: 'Event', // Could be Legendary or Event depending on impact
    parodyBlurb: "Denji thought he found happiness. He was wrong. The Bomb Girl arc is coming to break everyone's hearts.",
    imageUrl: 'https://placehold.co/300x400/eventyellow/000000?text=CSM+Movie&font=impact',
    genreTags: ['Action', 'Dark Fantasy', 'Horror', 'Supernatural', 'Gore'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
    packExclusive: true,
  },
  {
    id: 'one-punch-man-season-3:-finally-animated-(probably-by-a-different-studio-again)',
    parodyTitle: 'One-Punch Man S3: New Studio, Same Saitama?',
    originalMalId: 58125, // One-Punch Man 3rd Season (Actual MAL ID)
    originalType: 'anime',
    rarity: 'Event',
    parodyBlurb: "Saitama is back! And he's still bored. Garou's monster rampage continues. Let's hope the animation is good this time!",
    imageUrl: 'https://placehold.co/300x400/eventyellow/000000?text=OPM+S3&font=impact',
    genreTags: ['Action', 'Comedy', 'Parody', 'Sci-Fi', 'Seinen', 'Super Power', 'Supernatural'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
    packExclusive: true,
  },
  // ... (any other Mythic, Event, Forbidden cards from the previous list if they aren't already here)
];


// --- SAMPLE GACHA PACKS ---
export const SAMPLE_PACKS: GachaPack[] = [
  {
    id: 'isekai-starter-pack',
    name: 'Isekai Starter Pack',
    description: 'Everything you need to begin your journey to another world! (Truck-kun may or may not be included).',
    themeTags: ['isekai', 'fantasy', 'comedy'],
    faceCardCollectibleId: 'isekai-truck-kun',
    packImageUrl: 'https://placehold.co/200x320/7289da/ffffff?text=Isekai+Starter&font=lora', // Discord-like blue
    collectibleIds: SAMPLE_COLLECTIBLES.filter(c => (c.genreTags?.includes('Isekai') || c.genreTags?.includes('Fantasy')) && (c.rarity === 'Common' || c.rarity === 'Rare')).map(c => c.id).slice(0, 20),
  },
  {
    id: 'legendary-heroes-pack',
    name: 'Legendary Heroes Showcase',
    description: 'Pull for parodies of the most iconic and overpowered heroes in anime & manga!',
    themeTags: ['action', 'legendary', 'mythic', 'shonen'],
    faceCardCollectibleId: 'budget-jojo-but-still-fire', // Changed face card
    packImageUrl: 'https://placehold.co/200x320/ffcc00/000000?text=Heroic+Legends&font=impact', // Gold and black
    collectibleIds: SAMPLE_COLLECTIBLES.filter(c => c.rarity === 'Legendary' || c.rarity === 'Mythic').map(c => c.id).slice(0, 20),
  },
  {
    id: 'emotional-damage-pack', // Renamed for clarity
    name: 'Emotional Damage Pack',
    description: 'For when you want to feel things... deeply. Bring tissues and a therapist.',
    themeTags: ['drama', 'emotional', 'tragedy', 'psychological'],
    faceCardCollectibleId: 'grave-of-the-fireflies:-you-will-cry.-that-s-it,-that-s-the-description.',
    packImageUrl: 'https://placehold.co/200x320/5865f2/ffffff?text=Feels+Trip&font=cursive', // Softer blue
    collectibleIds: SAMPLE_COLLECTIBLES.filter(c => c.moodTags?.includes('Emotional Rollercoaster') || c.moodTags?.includes('Dark & Deep')).map(c => c.id).slice(0, 20),
  },
  {
    id: 'comedy-gold-pack', // Renamed
    name: 'Comedy Gold Pack',
    description: 'Laugh till you drop with these hilarious parodies and gag series!',
    themeTags: ['comedy', 'parody', 'slice of life', 'gag humor'],
    faceCardCollectibleId: 'gintama:-the-fourth-wall-is-but-a-suggestion',
    packImageUrl: 'https://placehold.co/200x320/f9a825/000000?text=LOL+Pack&font=comic-sans', // Bright yellow
    collectibleIds: SAMPLE_COLLECTIBLES.filter(c => c.genreTags?.includes('Comedy') || c.moodTags?.includes('Hilarious')).map(c => c.id).slice(0, 20),
  },
  {
    id: 'legacy-pack',
    name: 'Legacy Pack',
    description: 'Contains one ultra-rare card: a chance at Mythic, Event, or the elusive Forbidden tier!',
    themeTags: ['mythic', 'event', 'forbidden', 'ultra_rare'],
    faceCardCollectibleId: 'lelouch-zero-requiem',
    packImageUrl: 'https://placehold.co/200x320/1f1f1f/ff0033?text=LEGACY&font=cinzel', // Dark with crimson text
    collectibleIds: [
        'lelouch-zero-requiem',
        'sao-good-this-time',
        'gintama:-the-fourth-wall-is-but-a-suggestion',
        'one-piece:-the-journey-that-will-outlive-us-all',
        'cowboy-bebop:-space-jazz-and-existential-dread',
        'devilman-crybaby:-demons,-sex,-drugs,-and-a-whole-lot-of-crying',
        'the-tatami-galaxy:-college-student-relives-his-first-two-years-repeatedly-trying-to-find-happiness',
        'the-end-of-evangelion:-congratulations!-(everyone-turns-into-tang)',
        'grave-of-the-fireflies:-you-will-cry.-that-s-it,-that-s-the-description.',
        '[oshi-no-ko]:-the-dark-side-of-showbiz-(with-reincarnation-and-revenge)',
        'frieren:-beyond-journey-s-end-(elf-outlives-everyone,-learns-to-feel)',
        'naruto-s-lost-uncle-returns-in-2025',
        'frieren-beyond-journey-s-end-season-2',
        'one-punch-man-season-3:-finally-animated-(probably-by-a-different-studio-again)',
        'chainsaw-man-movie:-rezebomb',
        // Add more existing Mythic/Event cards if you have them
    ].filter((id, index, self) => id && self.indexOf(id) === index), // Ensure unique IDs
    isLegacyPack: true,
  }
];
