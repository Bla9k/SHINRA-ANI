
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
  imageUrl: string | null; // Can be specific parody art, or Jikan URL will be used
  genreTags?: string[];
  moodTags?: string[];
  evolvesToId?: string;
  isEvolvedForm?: boolean;
  packExclusive?: boolean; // If true, only found in specific packs, not general pool
}

export interface GachaPack {
  id: string;
  name: string;
  description: string;
  themeTags?: string[];
  faceCardCollectibleId?: string; // ID of a Collectible to be the "face" of the pack
  packImageUrl?: string; // Dedicated image for the pack art itself
  collectibleIds: string[]; // Array of Collectible IDs that can be pulled from this pack
  isLegacyPack?: boolean; // If true, pulls only 1 card, potentially special rules
  // dropRateModifiers?: Partial<Record<CollectibleRarity, number>>; // For later
}

export const NO_ART_PLACEHOLDER = 'https://placehold.co/300x450/0a0a0a/777777?text=NoParodyArt&font=poppins';
export const GENERIC_LOADING_PLACEHOLDER = 'https://placehold.co/300x450/1a1b26/e0e7ef?text=Loading...&font=poppins';
export const IMAGE_UNAVAILABLE_PLACEHOLDER = 'https://placehold.co/300x450/1a1b26/e0e7ef?text=ImageError&font=poppins';
export const LEGACY_DATA_PLACEHOLDER = 'https://placehold.co/300x450/050505/cc0000?text=LEGACY_DATA&font=orbitron';
export const GENERIC_PACK_PLACEHOLDER = 'https://placehold.co/200x320/1a1b26/e0e7ef?text=BoosterPack&font=orbitron';


export const SAMPLE_COLLECTIBLES: Collectible[] = [
  // Forbidden Tier
  {
    id: 'lelouch-zero-requiem',
    parodyTitle: "The Emperor's Final Gambit: Zero Requiem",
    originalMalId: 2904, // Code Geass R2
    originalType: 'anime',
    rarity: 'Forbidden',
    parodyBlurb: "To save the world, he became its greatest villain. A masterpiece of manipulation and sacrifice. All Hail Lelouch!",
    imageUrl: 'https://placehold.co/300x400/0d0208/e00034?text=ZERO_REQUIEM&font=cinzel', // Thematic placeholder
    genreTags: ['Mecha', 'Military', 'Drama', 'Psychological', 'Super Power'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster', 'Epic Adventure'],
    packExclusive: true,
  },
  // Mythic Tier
  {
    id: 'sao-good-this-time',
    parodyTitle: 'Sword Art Actually Kinda Good This Time??',
    originalMalId: 11757, // SAO Season 1
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Against all odds, Kirito logs into a game that doesn't immediately try to kill him. Character development ensues. Or does it?",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Isekai', 'Action', 'Adventure', 'Meta'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'chainsaw-man:-denji-really-needs-therapy-(and-a-hug)',
    parodyTitle: 'Chainsaw Man: Denji Really Needs Therapy (And A Hug)',
    originalMalId: 44511, // CSM Anime ID
    originalType: 'anime', // Using anime ID as it has widely recognized visuals
    rarity: 'Mythic',
    parodyBlurb: "He just wants a normal life, but destiny (and devils) have other, gorier plans. Woof.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Dark Fantasy', 'Horror', 'Shonen'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'gintama:-the-fourth-wall-is-but-a-suggestion',
    parodyTitle: 'Gintama: The Fourth Wall Is But A Suggestion',
    originalMalId: 918, // Gintama (first season)
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Parodying everything from Dragon Ball to current events, while occasionally having a serious plot. Masterpiece.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Comedy', 'Historical', 'Parody', 'Samurai', 'Sci-Fi', 'Shonen'],
    moodTags: ['Hilarious', 'Adrenaline Rush'],
  },
  {
    id: 'one-piece:-the-journey-that-will-outlive-us-all',
    parodyTitle: 'One Piece: The Journey That Will Outlive Us All',
    originalMalId: 21, // One Piece Anime
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Set sail for adventure! And keep sailing. And sailing. Is there even an end? Who cares, it's fun!",
    imageUrl: NO_ART_PLACEHOLDER,
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
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Adventure', 'Comedy', 'Drama', 'Sci-Fi', 'Space', 'Adult Cast'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
   {
    id: 'the-tatami-galaxy:-college-student-relives-his-first-two-years-repeatedly-trying-to-find-happiness',
    parodyTitle: 'The Tatami Galaxy: Infinite Campus Loop',
    originalMalId: 7785,
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "A rapid-fire, surreal, and ultimately heartwarming story about choices, regret, and the elusive 'rose-colored campus life.'",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Mystery', 'Psychological', 'Romance', 'Comedy', 'Time Travel (sort of)'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'devilman-crybaby:-demons,-sex,-drugs,-and-a-whole-lot-of-crying',
    parodyTitle: 'Devilman Crybaby: Emotional Apocalypse',
    originalMalId: 35120,
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "A beautiful and brutal depiction of love, betrayal, and the end of the world. You will not be okay.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Avant Garde', 'Demons', 'Drama', 'Horror', 'Supernatural', 'Gore'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'the-end-of-evangelion:-congratulations!-(everyone-turns-into-tang)',
    parodyTitle: 'The End of Evangelion: Group Hug Orange Juice',
    originalMalId: 32,
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "The original ending wasn't confusing enough, so here's a movie to make you question reality even more. Tumbling down.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Avant Garde', 'Dementia', 'Drama', 'Mecha', 'Psychological', 'Sci-Fi', 'Suspense'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'grave-of-the-fireflies:-you-will-cry.-that-s-it,-that-s-the-description.',
    parodyTitle: 'Grave of the Fireflies: Why Would You Watch This?',
    originalMalId: 578,
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "A beautiful and devastating anti-war film. Prepare for uncontrollable sobbing. Do not watch if you want to be happy.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Drama', 'Historical', 'Tragedy', 'War'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: '[oshi-no-ko]:-the-dark-side-of-showbiz-(with-reincarnation-and-revenge)',
    parodyTitle: '[Oshi no Ko]: Idol Revenge Story X-TREME',
    originalMalId: 52034,
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Idols, actors, and a whole lot of trauma. This story goes places you wouldn't expect.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Drama', 'Mystery', 'Psychological', 'Reincarnation', 'Supernatural', 'Seinen', 'Showbiz'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'frieren:-beyond-journey-s-end-(elf-outlives-everyone,-learns-to-feel)',
    parodyTitle: 'Frieren: Slow Life Fantasy (With Occasional Sadness)',
    originalMalId: 52991,
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "A quiet, melancholic journey about time, loss, and the importance of making memories. Peak fantasy.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Adventure', 'Drama', 'Fantasy', 'Shonen', 'Slice of Life'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },

  // Event Tier
  {
    id: 'naruto-s-lost-uncle-returns-in-2025',
    parodyTitle: 'Naruto’s Lost Uncle Returns in 2025',
    originalMalId: 20, // Naruto
    originalType: 'anime',
    rarity: 'Event',
    parodyBlurb: "Believe it! He's got a new jutsu: 'The Power of Forgotten Relatives!' Get ready for filler... we mean, epic new lore!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Adventure', 'Shonen', 'Event'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
    packExclusive: true,
  },
  {
    id: 'frieren-beyond-journey-s-end-season-2',
    parodyTitle: 'Frieren S2: More Feels, More Flashbacks',
    originalMalId: 58305, // Placeholder for S2 or new content
    originalType: 'anime',
    rarity: 'Event',
    parodyBlurb: "The journey through time and memory continues. Prepare for more quiet contemplation and emotional gut punches.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Adventure', 'Drama', 'Fantasy', 'Slice of Life'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
    packExclusive: true,
  },
  {
    id: 'chainsaw-man-movie:-rezebomb',
    parodyTitle: 'Chainsaw Man Movie: The Reze Bomb (Prepare for Pain)',
    originalMalId: 56679, // Placeholder for movie
    originalType: 'anime',
    rarity: 'Event',
    parodyBlurb: "Denji thought he found happiness. He was wrong. The Bomb Girl arc is coming to break everyone's hearts.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Dark Fantasy', 'Horror', 'Supernatural', 'Gore'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
    packExclusive: true,
  },
  {
    id: 'one-punch-man-season-3:-finally-animated-(probably-by-a-different-studio-again)',
    parodyTitle: 'One-Punch Man S3: New Studio, Same Saitama?',
    originalMalId: 58125, // Placeholder for S3
    originalType: 'anime',
    rarity: 'Event',
    parodyBlurb: "Saitama is back! And he's still bored. Garou's monster rampage continues. Let's hope the animation is good this time!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Comedy', 'Parody', 'Sci-Fi', 'Seinen', 'Super Power', 'Supernatural'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
    packExclusive: true,
  },

  // Legendary Tier
  {
    id: 'budget-jojo-but-still-fire',
    parodyTitle: 'Budget JoJo but Still Fire',
    originalMalId: 14719, // JoJo's Bizarre Adventure (TV)
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "The poses are slightly less fabulous, the 'Ora Ora' is more of an 'Okay Okay,' but the spirit is indomitable!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Adventure', 'Supernatural', 'Comedy'],
    moodTags: ['Adrenaline Rush'],
  },
  {
    id: 'angsty-teen-reluctantly-pilots-giant-robot-again',
    parodyTitle: 'Angsty Teen Reluctantly Pilots Giant Robot Again',
    originalMalId: 30, // Neon Genesis Evangelion
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Get in the robot, Shinji! Or don't. We're all doomed anyway. Existential dread sold separately.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Mecha', 'Psychological', 'Drama', 'Sci-Fi'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'berserk:-the-suffering-never-ends-(but-the-art-is-great)',
    parodyTitle: 'Berserk: The Suffering Never Ends (But The Art Is Great)',
    originalMalId: 22, // Berserk Manga
    originalType: 'manga',
    rarity: 'Legendary',
    parodyBlurb: "Follow Guts as he experiences every possible form of pain, rendered in excruciatingly beautiful detail.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Dark Fantasy', 'Action', 'Horror', 'Tragedy', 'Seinen'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
   {
    id: 'solo-leveling:-weakest-hunter-becomes-strongest-(with-a-video-game-system)',
    parodyTitle: 'Solo Leveling: Grind To Win',
    originalMalId: 121496, // Solo Leveling Manhwa
    originalType: 'manga',
    rarity: 'Legendary',
    parodyBlurb: "Arise! Sung Jinwoo grinds his way to the top, one shadow soldier at a time. Pure power fantasy.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Super Power', 'Webtoon'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },

  // Ultra Rare
  {
    id: 'magical-girl-despair',
    parodyTitle: 'Suffering Builds Character (Magical Girl Edition)',
    originalMalId: 9756, // Madoka Magica
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Cute girls, cute outfits, soul-crushing despair. What's not to love? Contractually obligated fun!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Mahou Shoujo', 'Psychological', 'Dark Fantasy', 'Drama'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'attack-on-titan-final-final-season-part-4-prologue',
    parodyTitle: 'Attack on Titan: Final Final Season (Part 4 Prologue)',
    originalMalId: 16498, // Attack on Titan
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Just when you thought it was over, it's not! More rumbling, more despair, probably another timeskip.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Dark Fantasy', 'Drama', 'Horror', 'Shonen'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'death-note-with-more-potato-chips',
    parodyTitle: 'Death Note: Now With More Potato Chips!',
    originalMalId: 1535, // Death Note
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "He'll take a potato chip... AND EAT IT! Justice, mind games, and surprisingly intense snack consumption.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Mystery', 'Psychological', 'Supernatural', 'Thriller'],
    moodTags: ['Dark & Deep'],
  },
  {
    id: 'your-lie-in-april-prepare-to-ugly-cry',
    parodyTitle: 'Your Lie in April: Prepare To Ugly Cry',
    originalMalId: 23273, // Your Lie in April
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Beautiful music, tragic romance, and an ending that will emotionally devastate you for weeks. 10/10 would suffer again.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Drama', 'Music', 'Romance', 'School', 'Shonen'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },

  // Rare
  {
    id: 'isekai-truck-kun-deluxe',
    parodyTitle: 'Truck-kun: Interdimensional Delivery Service',
    originalMalId: 37430, // Often a generic isekai
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "He's no longer just a harbinger of isekai; he's a full-service transportation solution for protagonists!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Isekai', 'Fantasy', 'Comedy', 'Meta'],
    moodTags: ['Epic Adventure', 'Hilarious'],
    isEvolvedForm: true, // Assuming 'isekai-truck-kun' (Common) evolves into this
  },
  {
    id: 'food-wars:-extra-salty-edition',
    parodyTitle: 'Food Wars: Extra Salty Edition',
    originalMalId: 28171, // Food Wars! Shokugeki no Soma
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "The foodgasms are more intense, the rivalries spicier, and the plot armor? Chef's kiss!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Shonen', 'Ecchi', 'School', 'Comedy'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
  },
  {
    id: 'konosuba-another-useless-goddess-quest',
    parodyTitle: "Konosuba: Another Useless Goddess Quest",
    originalMalId: 30831, // KonoSuba
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "Kazuma just wants to chill, but Aqua's debt isn't going to pay itself. Explosions and screaming ensue.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Adventure", "Comedy", "Fantasy", "Isekai", "Parody"],
    moodTags: ["Hilarious", "Adrenaline Rush"]
  },
  {
    id: 'that-time-i-got-reincarnated-as-a-slime-(and-became-op-instantly)',
    parodyTitle: 'Slime Isekai: From Puddle to Power Lord',
    originalMalId: 37430, // Tensei shitara Slime Datta Ken
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Being a slime is surprisingly efficient for world domination... or just making a really comfy village.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Isekai', 'Fantasy', 'Action', 'Comedy'],
    moodTags: ['Epic Adventure', 'Comfy & Cozy'],
  },

  // Common
  {
    id: 'isekai-truck-kun',
    parodyTitle: 'Truck-kun Strikes Again!',
    originalMalId: 37430, // Placeholder for a generic isekai
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Our hero's previous life was... short. Now he's a [random object] in a fantasy world. Standard procedure.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Isekai', 'Fantasy', 'Comedy'],
    moodTags: ['Epic Adventure', 'Comfy & Cozy'],
    evolvesToId: 'isekai-truck-kun-deluxe',
  },
  {
    id: 'my-smartphone-in-another-world:-now-with-5g!',
    parodyTitle: 'My Smartphone In Another World: Now With 5G!',
    originalMalId: 35203, // Isekai wa Smartphone to Tomo ni.
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He's got god-tier Wi-Fi and a harem that updates like an app. What more could you want?",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Isekai', 'Harem', 'Fantasy', 'Comedy'],
    moodTags: ['Comfy & Cozy', 'Hilarious'],
  },
  {
    id: 'high-school-romcom-where-they-never-confess',
    parodyTitle: 'High School RomCom: They Never Confess',
    originalMalId: 40839, // Kaguya-sama: Love is War
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Two geniuses, one goal: make the other confess first. Misunderstandings and overthinking for 3 seasons.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Comedy', 'Romance', 'School', 'Slice of Life'],
    moodTags: ['Hilarious', 'Heartwarming'],
  },
  {
    id: 'generic-shonen-power-up-sequence',
    parodyTitle: 'Generic Shonen: Power-Up Sequence #734',
    originalMalId: 20, // Naruto (as an example of many shonen)
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "The villain is too strong! Time for a flashback, a scream, and a conveniently timed new ability.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Shonen', 'Super Power', 'Adventure'],
    moodTags: ['Adrenaline Rush'],
  },
  // Batch 2 (New Additions)
  {
    id: 'slice-of-life-about-cute-girls-doing-cute-things',
    parodyTitle: 'Cute Girls Do Cute Things: The Anime',
    originalMalId: 7674, // K-On!
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "No plot, no problem! Just pure, unadulterated fluff and friendship. Diabetes warning.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Slice of Life', 'Comedy', 'School', 'Music'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
  },
  {
    id: 'sports-anime-power-of-friendship-wins-again',
    parodyTitle: 'Sports Anime: The Power of Friendship Wins Again!',
    originalMalId: 1699, // Eyeshield 21
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "They were underdogs, but with teamwork and shouting each other's names, they reached nationals!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Sports', 'Shonen', 'School', 'Comedy'],
    moodTags: ['Adrenaline Rush', 'Heartwarming'],
  },
  {
    id: 'mecha-anime-angst-and-explosions',
    parodyTitle: 'Mecha Anime: More Angst, More Explosions!',
    originalMalId: 80, // Mobile Suit Gundam Wing
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Giant robots, political intrigue, and traumatized teenagers. The classic mecha experience.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Mecha', 'Action', 'Sci-Fi', 'Drama', 'Military'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'food-so-good-clothes-explode',
    parodyTitle: "Culinary Ecstasy: Clothes Just Explode!",
    originalMalId: 28171, // Shokugeki no Souma
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "Every bite is a revelation, every dish a battlefield, and every tasting... a wardrobe malfunction.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Ecchi", "School", "Shounen", "Comedy"],
    moodTags: ["Hilarious", "Adrenaline Rush"]
  },
  {
    id: 'detective-boy-solves-impossible-murders',
    parodyTitle: "Child Detective: Murders Every Week!",
    originalMalId: 235, // Detective Conan
    originalType: "anime",
    rarity: "Legendary",
    parodyBlurb: "Wherever he goes, someone dies. He's either cursed or the world's unluckiest (or luckiest?) detective.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Mystery", "Adventure", "Comedy", "Police", "Shounen"],
    moodTags: ["Intriguing", "Adrenaline Rush"]
  },
  {
    id: 'another-world-harem-with-op-mc',
    parodyTitle: "Isekai Harem: My OP MC Can't Be This Dense!",
    originalMalId: 35203, // Isekai wa Smartphone to Tomo ni.
    originalType: "anime",
    rarity: "Common",
    parodyBlurb: "Transported to another world, gains ultimate power, and somehow, all the girls fall for him. Standard.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Isekai", "Harem", "Fantasy", "Comedy", "Romance"],
    moodTags: ["Comfy & Cozy", "Hilarious"]
  },
  {
    id: 'magical-girl-saves-world-with-sparkles',
    parodyTitle: "Sparkle Power Transformation Sequence GO!",
    originalMalId: 92, // Cardcaptor Sakura
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "With the power of friendship and glitter, she defeats evil monsters before tea time. Pure magical girl goodness.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Mahou Shoujo", "Adventure", "Comedy", "Fantasy", "Romance"],
    moodTags: ["Heartwarming", "Comfy & Cozy"]
  },
  {
    id: 'dark-fantasy-everyone-suffers',
    parodyTitle: "Grimdark Suffering Simulator 20XX",
    originalMalId: 31240, // Re:Zero
    originalType: "anime",
    rarity: "Ultra Rare",
    parodyBlurb: "Hope is a fleeting dream in this world of despair, betrayal, and gruesome deaths. Enjoy!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Dark Fantasy", "Drama", "Horror", "Psychological", "Thriller", "Isekai"],
    moodTags: ["Dark & Deep", "Emotional Rollercoaster"]
  },
  {
    id: 'cyberpunk-dystopia-neon-and-rain',
    parodyTitle: "Cyberpunk Blues: Neon, Rain, and Existentialism",
    originalMalId: 40, // Ghost in the Shell
    originalType: "anime",
    rarity: "Legendary",
    parodyBlurb: "In a future of high-tech and low-life, what does it mean to be human? Also, cool cyborgs.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Sci-Fi", "Cyberpunk", "Action", "Mecha", "Police", "Psychological"],
    moodTags: ["Dark & Deep", "Intriguing"]
  },
  {
    id: 'school-life-comedy-misunderstandings-galore',
    parodyTitle: "School Comedy: It Was All a Misunderstanding!",
    originalMalId: 17895, // Gekkan Shoujo Nozaki-kun
    originalType: "anime",
    rarity: "Common",
    parodyBlurb: "She confessed her love, he thought she was a fan. Hilarity ensues. Communication is hard.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["School", "Comedy", "Romance", "Slice of Life"],
    moodTags: ["Hilarious", "Comfy & Cozy"]
  },
  {
    id: 'historical-epic-war-and-tragedy',
    parodyTitle: "Historical Drama: Everyone Dies (But With Honor!)",
    originalMalId: 5114, // Fullmetal Alchemist: Brotherhood (has historical/war themes)
    originalType: "anime",
    rarity: "Mythic",
    parodyBlurb: "Grand battles, political schemes, and heartbreaking sacrifices. History was never this dramatic... or was it?",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Historical", "Drama", "Action", "Military", "War", "Tragedy"],
    moodTags: ["Epic Adventure", "Emotional Rollercoaster"]
  },
  {
    id: 'space-opera-battleships-and-lasers',
    parodyTitle: "Space Opera: Pew Pew Lasers and Betrayal",
    originalMalId: 820, // Ginga Eiyuu Densetsu
    originalType: "anime",
    rarity: "Legendary",
    parodyBlurb: "Across the vast expanse of space, empires clash and heroes rise. Who needs physics when you have giant space fleets?",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Space Opera", "Sci-Fi", "Action", "Military", "Drama"],
    moodTags: ["Epic Adventure", "Adrenaline Rush"]
  },
  {
    id: 'vampire-romance-angst-and-neck-biting',
    parodyTitle: "Vampire Love: It's Complicated (And Bitey)",
    originalMalId: 2927, // Vampire Knight
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "She's torn between two brooding, immortal pretty boys. Oh, the delicious angst and forbidden love!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Vampire", "Romance", "Supernatural", "Drama", "Shoujo"],
    moodTags: ["Emotional Rollercoaster", "Dark & Deep"]
  },
  {
    id: 'samurai-action-swords-and-bushido',
    parodyTitle: "Samurai Showdown: Katanas and Manly Tears",
    originalMalId: 205, // Samurai Champloo
    originalType: "anime",
    rarity: "Ultra Rare",
    parodyBlurb: "Honor, revenge, and epic sword fights. Every clash of steel is a poem written in blood.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Samurai", "Action", "Adventure", "Historical", "Chanbara"],
    moodTags: ["Adrenaline Rush", "Epic Adventure"]
  },
  {
    id: 'post-apocalyptic-survival-world-is-over',
    parodyTitle: "End of the World: Now What?",
    originalMalId: 31964, // Kabaneri of the Iron Fortress
    originalType: "anime",
    rarity: "Legendary",
    parodyBlurb: "The world ended, but humanity (and its problems) didn't. Scavenge, survive, and try not to get eaten.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Post-Apocalyptic", "Action", "Sci-Fi", "Horror", "Survival"],
    moodTags: ["Dark & Deep", "Adrenaline Rush"]
  },
  {
    id: 'music-anime-band-drama-and-concerts',
    parodyTitle: "Rock On! (But Mostly Offstage Drama)",
    originalMalId: 430, // BECK: Mongolian Chop Squad
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "They dream of making it big, but mostly they argue, practice, and deal with teenage angst. Oh, and sometimes play music.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Music", "Drama", "Slice of Life", "Romance", "Shonen"],
    moodTags: ["Emotional Rollercoaster", "Heartwarming"]
  },
  {
    id: 'reverse-harem-one-girl-many-boys',
    parodyTitle: "Reverse Harem: Surrounded by Pretty Boys",
    originalMalId: 10703, // Ouran High School Host Club
    originalType: "anime",
    rarity: "Common",
    parodyBlurb: "She's just a normal girl, but somehow all the hottest guys in school are inexplicably drawn to her. It's tough.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Reverse Harem", "Romance", "Comedy", "School", "Shoujo"],
    moodTags: ["Hilarious", "Heartwarming"]
  },
  {
    id: 'idol-anime-singing-dancing-and-dreams',
    parodyTitle: "Idol Stardom: Sparkling Dreams & Fierce Competition",
    originalMalId: 9253, // The iDOLM@STER
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "They sing, they dance, they sparkle! Follow their journey to become top idols, one concert at a time.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Idol", "Music", "Slice of Life", "Comedy"],
    moodTags: ["Heartwarming", "Comfy & Cozy"]
  },
  {
    id: 'psychological-thriller-mind-games-galore',
    parodyTitle: "Mind Games: The Anime - Who Is Fooling Whom?",
    originalMalId: 10620, // Mirai Nikki
    originalType: "anime",
    rarity: "Ultra Rare",
    parodyBlurb: "Every conversation is a battle of wits, every action a calculated move. Trust no one. Not even yourself.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Psychological", "Thriller", "Mystery", "Drama", "Suspense"],
    moodTags: ["Dark & Deep", "Intriguing"]
  },
  {
    id: 'fantasy-adventure-dragons-and-magic',
    parodyTitle: "Generic Fantasy Quest: Slay the Dragon, Save the Princess!",
    originalMalId: 21843, // Record of Lodoss War
    originalType: "anime",
    rarity: "Common",
    parodyBlurb: "A brave hero, a magical sword, a fearsome dragon, and a princess in distress. You know the drill.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Fantasy", "Adventure", "Action", "Magic"],
    moodTags: ["Epic Adventure", "Adrenaline Rush"]
  },
  // Add more diverse entries...
  {
    id: 'isekai-overlord-skeleton-takes-over',
    parodyTitle: 'Overlord: Sasuga Ainz-sama!',
    originalMalId: 29803, // Overlord
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Accidentally becoming an all-powerful undead lich in your favorite DMMORPG? Just another Tuesday.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Isekai', 'Dark Fantasy', 'Action', 'Adventure'],
    moodTags: ['Dark & Deep', 'Epic Adventure'],
  },
  {
    id: 'spy-x-family-wholesome-espionage',
    parodyTitle: 'Spy x Family: Wholesome Espionage Adventures',
    originalMalId: 50265, // Spy x Family
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "A spy, an assassin, and a telepath walk into a fake family... and it's surprisingly heartwarming.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Comedy', 'Action', 'Slice of Life', 'Shonen'],
    moodTags: ['Heartwarming', 'Hilarious'],
  },
  {
    id: 'k-on-moe-blob-power',
    parodyTitle: 'K-On!: The Power of Moe & Tea Time',
    originalMalId: 5680, // K-On!
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "They were supposed to be in a band, but mostly they just eat cake and procrastinate. Relatable.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Slice of Life', 'Comedy', 'Music', 'School'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
    evolvesToId: 'k-on-world-tour-rare',
  },
  {
    id: 'k-on-world-tour-rare',
    parodyTitle: 'K-On!: World Tour (Still Mostly Cake)',
    originalMalId: 7791, // K-On!! (Season 2)
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "The band actually goes places! But don't worry, there's still plenty of time for tea and desserts.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Slice of Life', 'Comedy', 'Music', 'School'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
    isEvolvedForm: true,
  },
  {
    id: 'steins-gate-microwaving-bananas-saves-world',
    parodyTitle: 'Steins;Gate: Microwaving Bananas Saves the World',
    originalMalId: 9253, // Steins;Gate
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "El Psy Kongroo. Time travel, conspiracies, and the desperate struggle to reach the Steins Gate world line.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Sci-Fi', 'Thriller', 'Psychological', 'Drama', 'Time Travel'],
    moodTags: ['Dark & Deep', 'Intriguing'],
  },
  {
    id: 'haikyuu-volleyball-boys-too-pure',
    parodyTitle: "Haikyuu!!: Volleyball Boys Are Too Pure For This World",
    originalMalId: 20583, // Haikyuu!!
    originalType: "anime",
    rarity: "Ultra Rare",
    parodyBlurb: "Fly! Intense matches, character growth, and the overwhelming power of teamwork and believing in yourself. You will cry.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Sports", "School", "Shounen", "Comedy", "Drama"],
    moodTags: ["Adrenaline Rush", "Heartwarming", "Emotional Rollercoaster"]
  },
  {
    id: 'demon-slayer-breathing-techniques-and-sad-backstories',
    parodyTitle: "Demon Slayer: Breathing, Crying, Slaying",
    originalMalId: 38000, // Kimetsu no Yaiba
    originalType: "anime",
    rarity: "Legendary",
    parodyBlurb: "Every demon has a tragic past, every Hashira has a cool breathing style. The animation is god-tier.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Action", "Dark Fantasy", "Historical", "Shounen", "Supernatural"],
    moodTags: ["Adrenaline Rush", "Emotional Rollercoaster"]
  },
  {
    id: 'mushishi-chill-supernatural-problem-solver',
    parodyTitle: "Mushishi: Ghostbuster, But Make It Chill",
    originalMalId: 457, // Mushishi
    originalType: "anime",
    rarity: "Mythic",
    parodyBlurb: "Ginko wanders the land solving Mushi-related problems with ancient wisdom and a calm demeanor. Peak comfy fantasy.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Slice of Life", "Mystery", "Historical", "Supernatural", "Fantasy", "Seinen"],
    moodTags: ["Comfy & Cozy", "Intriguing", "Heartwarming"]
  },
  {
    id: 'jujutsu-kaisen-gojo-is-just-built-different',
    parodyTitle: "Jujutsu Kaisen: Gojo Satoru Is Just Built Different",
    originalMalId: 40748, // Jujutsu Kaisen (TV)
    originalType: "anime",
    rarity: "Legendary",
    parodyBlurb: "Cursed spirits, domain expansions, and the undeniable fact that Gojo could solve everything if he felt like it.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Action", "Dark Fantasy", "School", "Shounen", "Supernatural"],
    moodTags: ["Adrenaline Rush", "Dark & Deep"]
  },
  {
    id: 'vinland-saga-no-enemies-just-pain',
    parodyTitle: "Vinland Saga: I Have No Enemies (Only Trauma)",
    originalMalId: 37521, // Vinland Saga
    originalType: "anime",
    rarity: "Legendary",
    parodyBlurb: "Vikings, revenge, and a young boy's brutal journey to understand the true meaning of being a warrior. Thorfinn needs a hug.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Action", "Adventure", "Drama", "Historical", "Seinen"],
    moodTags: ["Dark & Deep", "Emotional Rollercoaster", "Epic Adventure"]
  },
  {
    id: 'made-in-abyss-cute-art-horrifying-reality',
    parodyTitle: "Made in Abyss: Don't Let The Cute Art Fool You",
    originalMalId: 34599, // Made in Abyss
    originalType: "anime",
    rarity: "Mythic",
    parodyBlurb: "Adorable children explore a beautiful, treacherous abyss where every discovery comes with immense suffering. Send help.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Adventure", "Dark Fantasy", "Drama", "Mystery", "Sci-Fi", "Suspense"],
    moodTags: ["Dark & Deep", "Emotional Rollercoaster", "Intriguing"]
  },
  {
    id: 'mob-psycho-100-op-esper-just-wants-to-be-normal',
    parodyTitle: "Mob Psycho 100: OP Esper Just Wants Friends",
    originalMalId: 32182, // Mob Psycho 100
    originalType: "anime",
    rarity: "Legendary",
    parodyBlurb: "He could destroy the world with his mind, but he'd rather join the Body Improvement Club. Peak character development.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Action", "Comedy", "Slice of Life", "Supernatural", "Super Power"],
    moodTags: ["Adrenaline Rush", "Heartwarming", "Hilarious"]
  },
  {
    id: 'classroom-of-the-elite-high-school-mind-games',
    parodyTitle: "Classroom of the Elite: 5D Chess High School",
    originalMalId: 35507, // Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e
    originalType: "anime",
    rarity: "Ultra Rare",
    parodyBlurb: "Everyone is a genius manipulator in this cutthroat school where only the results matter. Trust is a weakness.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Psychological", "Drama", "School", "Suspense"],
    moodTags: ["Dark & Deep", "Intriguing"]
  },
  {
    id: 'dr-stone-science-will-save-the-world',
    parodyTitle: "Dr. Stone: Rebuilding Civilization, 10 Billion Percent!",
    originalMalId: 38691, // Dr. Stone
    originalType: "anime",
    rarity: "Ultra Rare",
    parodyBlurb: "Humanity turned to stone? No problem! Senku will science the heck out of this post-apocalyptic world. Get excited!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Adventure", "Comedy", "Sci-Fi", "Shonen"],
    moodTags: ["Epic Adventure", "Adrenaline Rush", "Hilarious"]
  },
  {
    id: 'grand-blue-college-diving-and-mostly-drinking',
    parodyTitle: "Grand Blue Dreaming: College Shenanigans (Mostly Drinking)",
    originalMalId: 37105, // Grand Blue
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "He came for a peaceful college life by the sea. He got a diving club full of naked, drunk upperclassmen. It's art.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Comedy", "Slice of Life", "Seinen"],
    moodTags: ["Hilarious", "Comfy & Cozy"]
  },
  {
    id: 'ancient-magus-bride-beauty-and-the-beast-but-with-magic',
    parodyTitle: "Ancient Magus' Bride: Girl Buys Skull-Headed Mage",
    originalMalId: 35062, // Mahoutsukai no Yome
    originalType: "anime",
    rarity: "Ultra Rare",
    parodyBlurb: "A lonely girl finds a new life with a mysterious, ancient mage. Beautiful visuals and heartwarming fantasy.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Fantasy", "Slice of Life", "Drama", "Mythology", "Romance", "Supernatural"],
    moodTags: ["Heartwarming", "Emotional Rollercoaster", "Comfy & Cozy"]
  },
  {
    id: 'horimiya-actually-healthy-romance-progression',
    parodyTitle: "Horimiya: They Actually Communicate?! A RomCom Miracle!",
    originalMalId: 42897, // Horimiya
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "A surprisingly wholesome and straightforward high school romance where characters talk and relationships develop. Refreshing!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Romance", "School", "Slice of Life", "Shonen"],
    moodTags: ["Heartwarming", "Comfy & Cozy"]
  },
  {
    id: 'that-time-i-got-reincarnated-as-a-sword',
    parodyTitle: 'Reincarnated as a Sword: I AM THE SWORD!',
    originalMalId: 49891, // Tensei shitara Ken Deshita
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A man becomes a sentient sword and teams up with a cute cat girl. Adventure and surprisingly deep lore ensues.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Isekai', 'Fantasy', 'Action', 'Adventure'],
    moodTags: ['Epic Adventure', 'Adrenaline Rush'],
  },
  {
    id: 'mushoku-tensei-peak-isekai-with-problematic-mc',
    parodyTitle: 'Mushoku Tensei: Peak Isekai (But Rudeus...)',
    originalMalId: 39535, // Mushoku Tensei: Isekai Ittara Honki Dasu
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Incredible world-building, character development, and animation. The MC is... a work in progress. A very slow work.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Isekai', 'Fantasy', 'Drama', 'Adventure', 'Ecchi'],
    moodTags: ['Epic Adventure', 'Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'spy-classroom-cute-girls-fail-at-spying',
    parodyTitle: 'Spy Classroom: Incompetent Waifus Save the World?',
    originalMalId: 51213, // Spy Kyoushitsu
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "A team of spy school dropouts tackles impossible missions. Their greatest weapon? Plot armor and moe.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Comedy', 'Mystery', 'Harem (elements)'],
    moodTags: ['Hilarious', 'Adrenaline Rush'],
  },
  {
    id: 'bunny-girl-senpai-quantum-physics-and-teen-angst',
    parodyTitle: 'Bunny Girl Senpai: Quantum Physics & Sad Girl Problems',
    originalMalId: 37450, // Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Dealing with 'Adolescence Syndrome' which manifests as supernatural phenomena. Also, a very good bunny girl.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Supernatural', 'Romance', 'Drama', 'School', 'Psychological'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep', 'Intriguing'],
  },
  {
    id: 'welcome-to-demon-school-iruma-kun-wholesome-demon-shenanigans',
    parodyTitle: 'Welcome to Demon School! Iruma-kun: Too Pure For Hell',
    originalMalId: 39196, // Mairimashita! Iruma-kun
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A human boy sold to demons ends up being the most beloved student in demon school. Pure wholesome fun.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Comedy', 'Fantasy', 'School', 'Shonen', 'Supernatural'],
    moodTags: ['Heartwarming', 'Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'log-horizon-isekai-with-actual-strategy-and-world-building',
    parodyTitle: 'Log Horizon: Isekai MMO, But With Spreadsheets',
    originalMalId: 17265, // Log Horizon
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Trapped in an MMO, but instead of just fighting, they build a society and deal with economics. Surprisingly engaging.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Isekai', 'Fantasy', 'Adventure', 'Action', 'Game', 'Magic'],
    moodTags: ['Epic Adventure', 'Intriguing'],
  },
  {
    id: 'rent-a-girlfriend-cringe-comedy-gold',
    parodyTitle: "Rent-a-Girlfriend: Professional Cringe Compilation",
    originalMalId: 42962, // Kanojo, Okarishimasu
    originalType: "anime",
    rarity: "Common",
    parodyBlurb: "Kazuya makes terrible decisions, and we're all here for the secondhand embarrassment. It's a lifestyle.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Comedy", "Romance", "School", "Shounen"],
    moodTags: ["Hilarious", "Emotional Rollercoaster (of cringe)"]
  },
  {
    id: 'shield-hero-everyone-hates-him-but-he-gets-stronger',
    parodyTitle: "Rising of the Shield Hero: Anger Management Issues",
    originalMalId: 35790, // Tate no Yuusha no Nariagari
    originalType: "anime",
    rarity: "Ultra Rare",
    parodyBlurb: "Betrayed and ostracized, Naofumi rises with the power of defense... and a lot of justified rage. Also, raccoons.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Action", "Adventure", "Drama", "Fantasy", "Isekai"],
    moodTags: ["Adrenaline Rush", "Dark & Deep", "Epic Adventure"]
  },
  {
    id: 'fire-force-hot-firefighters-fight-fire-with-fire',
    parodyTitle: "Fire Force: Látom! (And Lots of Fanservice)",
    originalMalId: 38671, // Enen no Shouboutai
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "Spontaneous human combustion is a problem, so these pyrokinetic firefighters fight fire... with more fire. Makes sense.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Action", "Sci-Fi", "Shounen", "Supernatural", "Ecchi"],
    moodTags: ["Adrenaline Rush"]
  },
  {
    id: 'erased-time-travel-to-save-mom',
    parodyTitle: "Erased: Butterfly Effect - Save Mom Edition",
    originalMalId: 31043, // Boku dake ga Inai Machi
    originalType: "anime",
    rarity: "Legendary",
    parodyBlurb: "A man with the ability to go back in time must prevent a series of tragedies. Gripping mystery and suspense.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Mystery", "Psychological", "Seinen", "Supernatural", "Suspense"],
    moodTags: ["Dark & Deep", "Intriguing", "Emotional Rollercoaster"]
  },
  {
    id: 'violet-evergarden-automemory-doll-makes-you-cry',
    parodyTitle: "Violet Evergarden: Professional Letter Writer Makes You Cry",
    originalMalId: 33352, // Violet Evergarden
    originalType: "anime",
    rarity: "Mythic",
    parodyBlurb: "A former child soldier learns about human emotions by writing letters. Each episode is an emotional journey. Stunning animation.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Drama", "Fantasy", "Slice of Life"],
    moodTags: ["Emotional Rollercoaster", "Heartwarming"]
  },
  {
    id: 'cells-at-work-anthropomorphic-body-cells',
    parodyTitle: "Cells at Work!: Your Body is an Anime",
    originalMalId: 37141, // Hataraku Saibou
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "Ever wondered what your cells do all day? Turns out it's a lot of moe and some intense battles against germs.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Comedy", "Shonen", "Educational"],
    moodTags: ["Hilarious", "Heartwarming", "Comfy & Cozy"]
  },
  {
    id: 'laid-back-camp-maximum-comfy',
    parodyTitle: "Laid-Back Camp: The Comfiest Anime Ever Made",
    originalMalId: 34798, // Yuru Camp
    originalType: "anime",
    rarity: "Ultra Rare",
    parodyBlurb: "Cute girls go camping in winter. That's it. It's perfect. Secret Society BLANKET, activate!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Slice of Life", "Comedy", "CGDCT"],
    moodTags: ["Comfy & Cozy", "Heartwarming"]
  },
  {
    id: 'promised-neverland-s1-kids-escape-farm',
    parodyTitle: "The Promised Neverland S1: Smart Kids vs Demons",
    originalMalId: 37779, // Yakusoku no Neverland
    originalType: "anime",
    rarity: "Legendary",
    parodyBlurb: "These genius orphans discover their orphanage is a farm for demons. Time for a big brain escape plan! (Ignore S2)",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Mystery", "Psychological", "Sci-Fi", "Shonen", "Suspense", "Horror"],
    moodTags: ["Dark & Deep", "Intriguing", "Adrenaline Rush"]
  },
  {
    id: 'your-name-body-swapping-comet-disaster',
    parodyTitle: "Your Name.: Body Swap Comet Love Story",
    originalMalId: 32281, // Kimi no Na wa.
    originalType: "anime",
    rarity: "Mythic",
    parodyBlurb: "Two teens swap bodies and fall in love across time and space, all while trying to prevent a disaster. Beautiful animation.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Drama", "Romance", "School", "Supernatural"],
    moodTags: ["Emotional Rollercoaster", "Heartwarming"]
  },
  {
    id: 'a-silent-voice-bullying-redemption-and-tears',
    parodyTitle: "A Silent Voice: Redemption Arc The Movie",
    originalMalId: 28851, // Koe no Katachi
    originalType: "anime",
    rarity: "Mythic",
    parodyBlurb: "A former bully seeks forgiveness from the deaf girl he tormented. Prepare for heavy themes and a lot of emotion.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Drama", "School", "Shonen"],
    moodTags: ["Emotional Rollercoaster", "Dark & Deep", "Heartwarming"]
  },
  {
    id: 'beastars-furry-high-school-drama-and-murder',
    parodyTitle: "Beastars: Furry Zootopia But With More Angst",
    originalMalId: 39195, // BEASTARS
    originalType: "anime",
    rarity: "Ultra Rare",
    parodyBlurb: "In a world of anthropomorphic animals, a gentle wolf struggles with his predatory instincts and falls for a dwarf rabbit. Also, murder mystery.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Drama", "Psychological", "School", "Shonen", "Slice of Life"],
    moodTags: ["Dark & Deep", "Emotional Rollercoaster", "Intriguing"]
  },
  {
    id: 'goblin-slayer-brutal-goblin-slaying-only',
    parodyTitle: "Goblin Slayer: He REALLY Hates Goblins",
    originalMalId: 37349, // Goblin Slayer
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "Goblins? Goblins. Goblins! He only kills goblins. Brutally. Don't let the fantasy setting fool you.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Action", "Adventure", "Dark Fantasy", "Gore"],
    moodTags: ["Adrenaline Rush", "Dark & Deep"]
  },
  {
    id: 'domestic-girlfriend-dumpster-fire-romance',
    parodyTitle: "Domestic Girlfriend: Professional Dumpster Fire",
    originalMalId: 103139, // Domestic na Kanojo (Manga)
    originalType: "manga",
    rarity: "Common",
    parodyBlurb: "He's in love with his teacher, sleeps with another girl who becomes his stepsister, teacher becomes other stepsister. It's a mess. A glorious mess.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Drama", "Romance", "School", "Shonen", "Ecchi"],
    moodTags: ["Emotional Rollercoaster (of bad decisions)"]
  },
  {
    id: 'school-live-cute-girls-zombie-apocalypse',
    parodyTitle: "School-Live!: Moe Zombies Are Still Zombies",
    originalMalId: 24765, // Gakkougurashi!
    originalType: "anime",
    rarity: "Ultra Rare",
    parodyBlurb: "Adorable girls live a happy school life... except the school is barricaded and surrounded by zombies. The contrast is jarring.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Slice of Life", "Psychological", "Horror", "Mystery", "School", "Survival"],
    moodTags: ["Dark & Deep", "Intriguing", "Emotional Rollercoaster"]
  },
  {
    id: 'golden-kamuy-treasure-hunt-with-absurd-men',
    parodyTitle: "Golden Kamuy: Manly Men, Ainu Gold, & Weird Food",
    originalMalId: 36028, // Golden Kamuy
    originalType: "anime",
    rarity: "Legendary",
    parodyBlurb: "A Russo-Japanese War veteran and an Ainu girl hunt for hidden gold, encountering bizarre characters and eating questionable things.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Action", "Adventure", "Historical", "Seinen", "Comedy", "Gourmet"],
    moodTags: ["Adrenaline Rush", "Epic Adventure", "Hilarious"]
  },
  {
    id: 'that-time-i-got-reincarnated-as-a-spider',
    parodyTitle: "So I'm a Spider, So What? Level Up or Die!",
    originalMalId: 37984, // Kumo Desu ga, Nani ka?
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "A high school girl reincarnates as a weak spider monster in a massive dungeon. Time to grind and evolve!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Isekai", "Adventure", "Comedy", "Fantasy", "Action"],
    moodTags: ["Epic Adventure", "Adrenaline Rush"]
  },
  {
    id: 'aggretsuko-red-panda-death-metal-office-rage',
    parodyTitle: "Aggretsuko: Death Metal Red Panda vs Capitalism",
    originalMalId: 36822, // Aggressive Retsuko (ONA)
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "Retsuko is a cute red panda dealing with office frustrations by secretly singing death metal karaoke. Highly relatable.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Slice of Life", "Comedy", "Music", "Office Life"],
    moodTags: ["Hilarious", "Comfy & Cozy", "Emotional Rollercoaster (mildly)"]
  },
  {
    id: 'wandering-witch-elaina-travels-and-observes-sadness',
    parodyTitle: "Wandering Witch: Elaina's Journey of Vicarious Trauma",
    originalMalId: 40571, // Majo no Tabitabi
    originalType: "anime",
    rarity: "Ultra Rare",
    parodyBlurb: "A talented witch travels the world, encountering various towns and people, mostly observing their often tragic stories. Beautiful but sometimes dark.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Adventure", "Fantasy", "Slice of Life", "Drama"],
    moodTags: ["Emotional Rollercoaster", "Dark & Deep", "Intriguing"]
  },
  {
    id: 'yuri-on-ice-ice-skating-romance-and-pork-cutlet-bowls',
    parodyTitle: "Yuri!!! on ICE: Gay Ice Skating & Pork Cutlet Bowls",
    originalMalId: 32995, // Yuri!!! on Ice
    originalType: "anime",
    rarity: "Legendary",
    parodyBlurb: "A Japanese figure skater on the verge of retirement is coached by his idol, leading to love, victory, and delicious food.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Sports", "Drama", "Romance", "Boys Love (elements)"],
    moodTags: ["Heartwarming", "Emotional Rollercoaster", "Adrenaline Rush"]
  },
  {
    id: 'world-trigger-strategic-team-battles',
    parodyTitle: "World Trigger: Sci-Fi Team Battles & Border Defense",
    originalMalId: 24405, // World Trigger
    originalType: "anime",
    rarity: "Rare",
    parodyBlurb: "Agents of Border defend Earth from interdimensional invaders using advanced trigger technology. Focuses on strategy and teamwork.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Action", "Sci-Fi", "School", "Shonen", "Super Power"],
    moodTags: ["Adrenaline Rush", "Intriguing"]
  },
  {
    id: 'initial-d-eurobeat-intensifies',
    parodyTitle: "Initial D: Eurobeat-Powered Tofu Delivery",
    originalMalId: 185, // Initial D First Stage
    originalType: "anime",
    rarity: "Ultra Rare",
    parodyBlurb: "A young tofu delivery boy unknowingly becomes a street racing legend in his AE86. Deja vu!",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Action", "Cars", "Drama", "Seinen", "Sports"],
    moodTags: ["Adrenaline Rush"]
  },
  {
    id: 'princess-mononoke-environmentalism-and-wolf-girl',
    parodyTitle: "Princess Mononoke: Angry Forest Spirits vs Humans",
    originalMalId: 164, // Mononoke Hime
    originalType: "anime",
    rarity: "Mythic",
    parodyBlurb: "A cursed prince gets caught in the struggle between humans encroaching on a forest and the ancient gods protecting it. Ghibli masterpiece.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Action", "Adventure", "Fantasy", "Historical", "Supernatural"],
    moodTags: ["Epic Adventure", "Dark & Deep", "Emotional Rollercoaster"]
  },
  {
    id: 'spirited-away-girl-works-in-bathhouse-for-spirits',
    parodyTitle: "Spirited Away: Girl Gets Trapped in Spirit World Day Spa",
    originalMalId: 199, // Sen to Chihiro no Kamikakushi
    originalType: "anime",
    rarity: "Mythic",
    parodyBlurb: "A young girl wanders into a world of spirits and must work in a bathhouse to save her parents and find her way home. Another Ghibli classic.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ["Adventure", "Award Winning", "Fantasy", "Supernatural"],
    moodTags: ["Epic Adventure", "Heartwarming", "Intriguing"]
  },
   {
    id: 'ghost-in-the-shell-sac-cyberpunk-police-procedural',
    parodyTitle: "GitS: SAC - Cybercrime Unit Solves Future Crimes",
    originalMalId: 467, // Ghost in the Shell: Stand Alone Complex
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Major Kusanagi and Section 9 tackle complex cybercrimes and philosophical questions about humanity in a networked future.",
    imageUrl: NO_ART_PLACEHOLDER,
    genreTags: ['Action', 'Sci-Fi', 'Police', 'Military', 'Mecha', 'Psychological'],
    moodTags: ['Intriguing', 'Dark & Deep', 'Adrenaline Rush'],
  },
];

// Add more entries following the pattern to reach ~500
// Remember to update originalMalId and originalType for accurate linking if you intend to use them.


export const SAMPLE_PACKS: GachaPack[] = [
  {
    id: 'isekai-starter-pack',
    name: 'Isekai Starter Pack',
    description: 'Everything you need to begin your journey to another world! (Truck-kun may or may not be included).',
    themeTags: ['isekai', 'fantasy', 'comedy'],
    faceCardCollectibleId: 'isekai-truck-kun',
    packImageUrl: 'https://placehold.co/200x320/7289da/ffffff?text=Isekai+Starter&font=lora',
    collectibleIds: SAMPLE_COLLECTIBLES.filter(c => (c.genreTags?.includes('Isekai') || c.genreTags?.includes('Fantasy')) && (c.rarity === 'Common' || c.rarity === 'Rare')).map(c => c.id).slice(0, 20),
  },
  {
    id: 'legendary-heroes-pack',
    name: 'Legendary Heroes Showcase',
    description: 'Pull for parodies of the most iconic and overpowered heroes in anime & manga!',
    themeTags: ['action', 'legendary', 'mythic', 'shonen'],
    faceCardCollectibleId: 'budget-jojo-but-still-fire',
    packImageUrl: 'https://placehold.co/200x320/ffcc00/000000?text=Heroic+Legends&font=impact',
    collectibleIds: SAMPLE_COLLECTIBLES.filter(c => c.rarity === 'Legendary' || c.rarity === 'Mythic').map(c => c.id).slice(0, 20),
  },
  {
    id: 'emotional-damage-pack',
    name: 'Emotional Damage Pack',
    description: 'For when you want to feel things... deeply. Bring tissues and a therapist.',
    themeTags: ['drama', 'emotional', 'tragedy', 'psychological'],
    faceCardCollectibleId: 'grave-of-the-fireflies:-you-will-cry.-that-s-it,-that-s-the-description.',
    packImageUrl: 'https://placehold.co/200x320/5865f2/ffffff?text=Feels+Trip&font=cursive',
    collectibleIds: SAMPLE_COLLECTIBLES.filter(c => c.moodTags?.includes('Emotional Rollercoaster') || c.moodTags?.includes('Dark & Deep')).map(c => c.id).slice(0, 20),
  },
  {
    id: 'comedy-gold-pack',
    name: 'Comedy Gold Pack',
    description: 'Laugh till you drop with these hilarious parodies and gag series!',
    themeTags: ['comedy', 'parody', 'slice of life', 'gag humor'],
    faceCardCollectibleId: 'gintama:-the-fourth-wall-is-but-a-suggestion',
    packImageUrl: 'https://placehold.co/200x320/f9a825/000000?text=LOL+Pack&font=comic-sans',
    collectibleIds: SAMPLE_COLLECTIBLES.filter(c => c.genreTags?.includes('Comedy') || c.moodTags?.includes('Hilarious')).map(c => c.id).slice(0, 20),
  },
  {
    id: 'legacy-pack',
    name: 'Legacy Pack',
    description: 'Contains one ultra-rare card: a chance at Mythic, Event, or the elusive Forbidden tier!',
    themeTags: ['mythic', 'event', 'forbidden', 'ultra_rare'],
    faceCardCollectibleId: 'lelouch-zero-requiem',
    packImageUrl: 'https://placehold.co/200x320/1f1f1f/ff0033?text=LEGACY&font=cinzel', // Unique art for Legacy Pack
    collectibleIds: [ // Explicitly list IDs from Forbidden, Mythic, and Event tiers
        'lelouch-zero-requiem',
        'sao-good-this-time',
        'chainsaw-man:-denji-really-needs-therapy-(and-a-hug)',
        'gintama:-the-fourth-wall-is-but-a-suggestion',
        'one-piece:-the-journey-that-will-outlive-us-all',
        'cowboy-bebop:-space-jazz-and-existential-dread',
        'the-tatami-galaxy:-college-student-relives-his-first-two-years-repeatedly-trying-to-find-happiness',
        'devilman-crybaby:-demons,-sex,-drugs,-and-a-whole-lot-of-crying',
        'the-end-of-evangelion:-congratulations!-(everyone-turns-into-tang)',
        'grave-of-the-fireflies:-you-will-cry.-that-s-it,-that-s-the-description.',
        '[oshi-no-ko]:-the-dark-side-of-showbiz-(with-reincarnation-and-revenge)',
        'frieren:-beyond-journey-s-end-(elf-outlives-everyone,-learns-to-feel)',
        'naruto-s-lost-uncle-returns-in-2025',
        'frieren-beyond-journey-s-end-season-2',
        'one-punch-man-season-3:-finally-animated-(probably-by-a-different-studio-again)',
        'chainsaw-man-movie:-rezebomb',
        'mushishi-chill-supernatural-problem-solver',
        'made-in-abyss-cute-art-horrifying-reality',
        'violet-evergarden-automemory-doll-makes-you-cry',
        'your-name-body-swapping-comet-disaster',
        'a-silent-voice-bullying-redemption-and-tears',
        'princess-mononoke-environmentalism-and-wolf-girl',
        'spirited-away-girl-works-in-bathhouse-for-spirits',
    ].filter((id, index, self) => id && SAMPLE_COLLECTIBLES.find(c=>c.id === id) && self.indexOf(id) === index), // Ensure IDs are valid and unique
    isLegacyPack: true,
  }
];

// Ensure faceCardCollectibleIds in SAMPLE_PACKS actually exist in SAMPLE_COLLECTIBLES
SAMPLE_PACKS.forEach(pack => {
  if (pack.faceCardCollectibleId && !SAMPLE_COLLECTIBLES.find(c => c.id === pack.faceCardCollectibleId)) {
    console.warn(`[CollectiblesData] Pack "${pack.name}" has a faceCardCollectibleId "${pack.faceCardCollectibleId}" that does not exist in SAMPLE_COLLECTIBLES. Pack image might default to placeholder.`);
  }
  if (pack.collectibleIds.some(id => !SAMPLE_COLLECTIBLES.find(c => c.id === id))) {
    console.warn(`[CollectiblesData] Pack "${pack.name}" contains collectible IDs that do not exist in SAMPLE_COLLECTIBLES. This might affect pack contents.`);
  }
});

// Validation logic for PITY_DISTRIBUTION moved to gachaConfig.ts
// This file should ideally only contain type definitions and SAMPLE_COLLECTIBLES data.
// The validation was:
// const pityDistributionSum = PITY_TARGET_RARITIES.reduce((sum, rarity) => sum + (PITY_DISTRIBUTION[rarity] || 0), 0);
// if (Math.abs(pityDistributionSum - 1.0) > 0.001 && PITY_TARGET_RARITIES.length > 0 && PITY_TARGET_RARITIES.some(r => PITY_DISTRIBUTION[r] && PITY_DISTRIBUTION[r]! > 0) ) {
//     console.warn(
//         `GACHA WARNING: PITY_DISTRIBUTION values for PITY_TARGET_RARITIES do not sum to 1.0 (Current sum: ${pityDistributionSum}). ` +
//         `This may lead to unexpected behavior during pity pulls. Please adjust PITY_DISTRIBUTION for [${PITY_TARGET_RARITIES.join(', ')}].`
//     );
// }

// The GACHA_RARITY_RATES validation is also better placed in gachaConfig.ts

