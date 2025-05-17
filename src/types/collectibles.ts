
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
  originalMalId: number;
  originalType: 'anime' | 'manga';
  rarity: CollectibleRarity;
  parodyBlurb: string;
  imageUrl: string | null; // Image for the collectible itself
  genreTags?: string[];
  moodTags?: string[];
  evolvesToId?: string;
  isEvolvedForm?: boolean;
  packExclusive?: boolean;
}

export interface GachaPack {
  id: string;
  name: string;
  description: string;
  themeTags?: string[];
  faceCardCollectibleId?: string; // ID of a Collectible to be the "face" of the pack
  packImageUrl?: string; // Dedicated image URL for the pack art itself
  collectibleIds: string[];
}


// Sample data for the Gacha system
export const SAMPLE_COLLECTIBLES: Collectible[] = [
  {
    id: 'roommate-yandere',
    parodyTitle: 'My Roommate Is a God-Level Yandere',
    originalMalId: 20507, // Mirai Nikki
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "She's perfect! Except for the occasional divine retribution on anyone who looks at you. Totally normal.",
    imageUrl: 'https://placehold.co/300x400.png?text=YandereGod&font=lora',
    genreTags: ['Romance', 'Comedy', 'Horror', 'Supernatural', 'Isekai'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
    evolvesToId: 'roommate-yandere-prime',
  },
  {
    id: 'roommate-yandere-prime',
    parodyTitle: 'My Roommate IS the Yandere Goddess',
    originalMalId: 20507, // Mirai Nikki
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Turns out divine retribution was just her way of saying 'I love you.' Still terrifying, but now with more power.",
    imageUrl: 'https://placehold.co/300x400.png?text=YandereGoddess&font=lora',
    genreTags: ['Romance', 'Dark Comedy', 'Horror', 'Supernatural', 'Isekai'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
    isEvolvedForm: true,
  },
  {
    id: 'depression-animated',
    parodyTitle: 'Depression: The Animated Series',
    originalMalId: 467, // Welcome to the N.H.K.
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "It's just like real life, but with more muted colors and a surprisingly good soundtrack.",
    imageUrl: 'https://placehold.co/300x400.png?text=Depression&font=lora',
    genreTags: ['Slice of Life', 'Drama', 'Psychological'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'sao-good-this-time',
    parodyTitle: 'Sword Art Actually Kinda Good This Time??',
    originalMalId: 11757, // Sword Art Online
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Against all odds, Kirito logs into a game that doesn't immediately try to kill him. Character development ensues. Or does it?",
    imageUrl: 'https://placehold.co/300x400.png?text=SAOgood&font=lora',
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
    imageUrl: 'https://placehold.co/300x400.png?text=UncleNaruto&font=lora',
    genreTags: ['Action', 'Adventure', 'Shonen', 'Event'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'budget-jojo-but-still-fire',
    parodyTitle: 'Budget JoJo but Still Fire',
    originalMalId: 14719, // JoJo's Bizarre Adventure (TV)
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "The poses are slightly less fabulous, the 'Ora Ora' is more of an 'Okay Okay,' but the spirit is indomitable!",
    imageUrl: 'https://placehold.co/300x400.png?text=BudgetJoJo&font=lora',
    genreTags: ['Action', 'Adventure', 'Supernatural', 'Comedy'],
    moodTags: ['Adrenaline Rush'],
  },
  {
    id: 'isekai-truck-kun',
    parodyTitle: 'Truck-kun Strikes Again!',
    originalMalId: 37430, // That Time I Got Reincarnated as a Slime
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Our hero's previous life was... short. Now he's a [random object] in a fantasy world. Standard procedure.",
    imageUrl: 'https://placehold.co/300x400.png?text=TruckKun&font=lora',
    genreTags: ['Isekai', 'Fantasy', 'Comedy'],
    moodTags: ['Epic Adventure', 'Comfy & Cozy'],
    evolvesToId: 'isekai-truck-kun-deluxe',
  },
  {
    id: 'isekai-truck-kun-deluxe',
    parodyTitle: 'Truck-kun: Interdimensional Delivery Service',
    originalMalId: 37430, // That Time I Got Reincarnated as a Slime
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "He's no longer just a harbinger of isekai; he's a full-service transportation solution for protagonists!",
    imageUrl: 'https://placehold.co/300x400.png?text=TruckDeluxe&font=lora',
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
    imageUrl: 'https://placehold.co/300x400.png?text=MagiDespair&font=lora',
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
    imageUrl: 'https://placehold.co/300x400.png?text=AngstRobot&font=lora',
    genreTags: ['Mecha', 'Psychological', 'Drama', 'Sci-Fi'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  // ... (Keep ALL other ~100+ existing collectibles here) ...
  // Ensure originalMalId and originalType are present for all
  {
    id: 'my-smartphone-in-another-world:-now-with-5g!',
    parodyTitle: 'My Smartphone In Another World: Now With 5G!',
    originalMalId: 35203,
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He's got god-tier Wi-Fi and a harem that updates like an app. What more could you want?",
    imageUrl: 'https://placehold.co/300x400.png?text=5GSmartphone&font=lora',
    genreTags: ['Isekai', 'Harem', 'Fantasy', 'Comedy'],
    moodTags: ['Comfy & Cozy', 'Hilarious'],
  },
  {
    id: 'food-wars:-extra-salty-edition',
    parodyTitle: 'Food Wars: Extra Salty Edition',
    originalMalId: 28171,
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "The foodgasms are more intense, the rivalries spicier, and the plot armor? Chef's kiss!",
    imageUrl: 'https://placehold.co/300x400.png?text=SaltyFood&font=lora',
    genreTags: ['Shonen', 'Ecchi', 'School', 'Comedy'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
    isEvolvedForm: true,
  },
  {
    id: 'my-mc-is-too-overpowered-and-now-i-have-plot-problems',
    parodyTitle: 'My MC is Too Overpowered and Now I Have Plot Problems',
    originalMalId: 34134,
    originalType: 'manga',
    rarity: 'Ultra Rare',
    parodyBlurb: "He can defeat anyone with one punch... so now what? An existential comedy about ultimate power.",
    imageUrl: 'https://placehold.co/300x400.png?text=OPMCprobs&font=lora',
    genreTags: ['Action', 'Comedy', 'Parody', 'Superhero'],
    moodTags: ['Hilarious', 'Adrenaline Rush'],
  },
    // Add many more collectibles here...
    // All existing collectibles from before should be here.
    // I am omitting them for brevity in this response, but they must be present in the actual file.
];

export const SAMPLE_PACKS: GachaPack[] = [
  {
    id: 'isekai-starter-pack',
    name: 'Isekai Starter Pack',
    description: 'Everything you need to begin your journey to another world! (Truck-kun sold separately)',
    themeTags: ['isekai', 'fantasy', 'comedy'],
    packImageUrl: 'https://placehold.co/250x350.png?text=Isekai+Odyssey&font=orbitron',
    faceCardCollectibleId: 'isekai-truck-kun',
    collectibleIds: [
      'isekai-truck-kun',
      'my-smartphone-in-another-world:-now-with-5g!',
      'yet-another-generic-isekai-harem-adventure',
      'another-isekai-where-the-mc-buys-a-slave-girl-(but-it-s-okay-because-plot)',
      'i-got-a-cheat-skill-in-another-world-and-became-unrivaled-in-the-real-world,-too-(mostly-farming)',
      'isekai-pharmacist:-revolutionizing-medieval-medicine-with-modern-chemistry',
      'slime-rancher:-isekai-edition',
      'that-time-i-got-reincarnated-as-a-slime-and-accidentally-built-a-nation',
      'roommate-yandere',
      'roommate-yandere-prime',
      'slime-isekai-s2:-now-with-more-meetings-and-nation-building!',
    ],
  },
  {
    id: 'legendary-heroes-pack',
    name: 'Legendary Heroes Showcase',
    description: 'Pull for parodies of the most iconic and overpowered heroes in anime & manga!',
    themeTags: ['action', 'legendary', 'mythic', 'shonen'],
    packImageUrl: 'https://placehold.co/250x350.png?text=Heroic+Legends&font=orbitron',
    faceCardCollectibleId: 'sao-good-this-time',
    collectibleIds: [
      'sao-good-this-time',
      'budget-jojo-but-still-fire',
      'angsty-teen-reluctantly-pilots-giant-robot-again',
      'berserk:-the-suffering-never-ends-(but-the-art-is-great)',
      'death-note:-i-ll-take-a-potato-chip...-and-eat-it!',
      'attack-on-my-sanity:-everyone-dies',
      'ghost-in-the-shell:-philosophy-101-with-guns',
      'clannad:-the-onion-cutting-simulator',
      'dragon-ball-z:-power-up-by-screaming-louder',
      'code-geass:-lelouch-plays-5d-chess-while-everyone-else-plays-checkers',
      'made-in-abyss:-adorable-characters,-unspeakable-horrors',
      'steins;gate:-my-microwave-is-a-time-machine-(and-it-screws-everything-up)',
      'your-name.:-beautiful-scenery,-body-swaps,-and-imminent-disaster',
      'violet-evergarden:-learning-to-type...-with-feelings',
      'chainsaw-man:-denji-really-needs-therapy-(and-a-hug)',
      'fullmetal-alchemist:-equivalent-exchange-of-my-tears',
      'gintama:-the-fourth-wall-is-but-a-suggestion',
      'hunter-x-hunter:-hiatus-simulator-(now-with-more-nen!)',
      'one-piece:-the-journey-that-will-outlive-us-all',
      'yuri!!!-on-ice:-competitive-ice-skating-and-unspoken-romance',
      'banana-fish:-emotional-support-gangster-story-(prepare-for-pain)',
      'golden-kamuy:-hokkaido-treasure-hunt-with-war-criminals-and-bear-fights',
      'to-your-eternity:-immortal-being-learns-about-life-through-unending-pain',
      'kill-la-kill:-clothes-are-evil-(and-also-power-ups)',
      'made-in-abyss-s2:-the-suffering-intensifies-(still-cute-tho)',
      'monogatari-series:-90%-talking,-10%-supernatural-shenanigans',
      'psycho-pass:-your-crime-coefficient-is-too-high,-prepare-for-dominator',
      'steins;gate-0:-more-suffering,-different-timeline,-same-sad-okabe',
      'sword-of-the-stranger:-the-best-samurai-fight-you-ve-ever-seen',
      'gurren-lagann:-my-drill-is-the-drill-that-will-pierce-the-heavens-(and-logic)',
      'initial-d:-eurobeat-intensifies-while-tofu-gets-delivered',
      'land-of-the-lustrous:-pretty-gem-people-suffer-beautifully',
      'angel-beats!:-afterlife-high-school-with-more-guns-and-sad-backstories',
      'baccano!:-immortal-gangsters-and-a-very-confusing-timeline',
      'cowboy-bebop:-space-jazz-and-existential-dread',
      'dorohedoro:-magic-lizard-man-wants-his-face-back',
      'fruits-basket:-everyone-needs-therapy-(and-a-hug-from-tohru)',
      'hellsing-ultimate:-alucard-is-a-f---mother-vampire',
      'higurashi:-cute-kids-in-a-time-loop-of-murder-and-madness',
      'princess-mononoke:-environmentalism,-but-with-gods-and-cursed-boars',
      'spirited-away:-girl-works-at-a-bathhouse-for-gods-(and-it-s-beautiful)',
      'the-melancholy-of-haruhi-suzumiya:-don-t-bore-the-god-girl,-or-else',
      '[oshi-no-ko]:-the-dark-side-of-showbiz-(with-reincarnation-and-revenge)',
      'cyberpunk-samurai:-my-katana-has-wi-fi',
      'march-comes-in-like-a-lion-depression-shogi-and-found-family',
      'devilman-crybaby:-demons,-sex,-drugs,-and-a-whole-lot-of-crying',
      'FLCL:-coming-of-age-with-robots,-aliens,-and-vespas',
      'summer-wars:-grandma-s-connections-save-the-world-from-rogue-ai',
      'a-place-further-than-the-universe:-antarctica-adventure-with-high-school-girls',
      'violet-evergarden-the-movie-prepare-for-more-tears',
      'that-time-i-got-reincarnated-as-a-slime-movie:-scarlet-bond-(more-rimuru,-more-fun)',
      'wolfs-rain:-sad-wolves-search-for-paradise-(in-a-dying-world)',
    ],
  },
  {
    id: 'slice-of-sadness-pack',
    name: 'Slice of Sadness Pack',
    description: 'For when you want to feel things... deeply. Bring tissues.',
    themeTags: ['drama', 'emotional', 'slice of life', 'tragedy'],
    packImageUrl: 'https://placehold.co/250x350.png?text=Tear+Jerker+Collection&font=orbitron',
    faceCardCollectibleId: 'depression-animated',
    collectibleIds: [
      'depression-animated',
      'magical-girl-despair',
      'if-i-could-turn-back-time:-the-anime',
      'your-lie-in-april:-play-piano,-cry-violently',
      'banana-fish:-emotional-support-gangster-story-(prepare-for-pain)',
      'to-your-eternity:-immortal-being-learns-about-life-through-unending-pain',
      'wonder-egg-priority:-cute-girls-fight-trauma-monsters-(it-s-very-symbolic)',
      'clannad:-the-onion-cutting-simulator',
      'a-silent-voice:-communication-is-hard,-okay?',
      'violet-evergarden:-learning-to-type...-with-feelings',
      'steins;gate-0:-more-suffering,-different-timeline,-same-sad-okabe',
      'wolf-children:-single-mom-raises-werewolf-kids,-it-s-tough',
      'anohana:-the-ghost-girl-who-made-everyone-cry-for-11-episodes',
      'school-live!:-cute-girls-survive-the-zombie-apocalypse-(mostly-by-ignoring-it)',
      'march-comes-in-like-a-lion-depression-shogi-and-found-family',
      'the-detective-is-already-dead-(but-her-ghost-won-t-leave-me-alone)',
      'elfen-lied:-cute-girl-with-horns-murders-everyone-(with-invisible-hands)',
      'wandering-witch:-elaina-s-travel-blog-(now-with-more-trauma!)',
    ],
  },
  {
    id: 'comedy-central-pack',
    name: 'Comedy Central Pack',
    description: 'Laugh till you drop with these hilarious parodies!',
    themeTags: ['comedy', 'parody', 'slice of life', 'gag humor'],
    packImageUrl: 'https://placehold.co/250x350.png?text=Laugh+Out+Loud&font=orbitron',
    faceCardCollectibleId: 'konosuba:-my-adventuring-party-is-useless-(and-i-love-it)',
    collectibleIds: [
      'konosuba:-my-adventuring-party-is-useless-(and-i-love-it)',
      'grand-blue-dreaming:-the-diving-anime-that-s-not-about-diving',
      'magical-boy-transformation-sequence:-the-series',
      'cells-at-work!:-your-biology-class,-but-moe',
      'the-disastrous-life-of-saiki-k-he-just-wants-to-be-left-alone-(but-he-s-a-god-tier-psychic)',
      'monthly-girls-nozaki-kun-he-s-a-shojo-mangaka-but-completely-oblivious',
      'ouran-high-school-host-club:-rich-boys-entertain-commoner-girl-(who-s-disguised-as-a-boy)',
      'daily-lives-of-high-school-boys:-boys-will-be-idiots',
      'aggretsuko:-red-panda-rages-against-office-life-with-death-metal-karaoke',
      'azumanga-daioh:-surreal-high-school-comedy-that-defined-a-generation',
      'himouto!-umaru-chan:-my-perfect-little-sister-is-a-cola-guzzling-gremlin-at-home',
      'gabriel-dropout:-top-angel-becomes-ultimate-neet-gamer',
      'hinamatsuri:-yakuza-adopts-psychic-girl,-hilarity-ensues',
      'interviews-with-monster-girls:-my-students-are-monsters-(literally,-and-it-s-cute)',
      'nichijou:-my-ordinary-life-is-an-absurdist-fever-dream',
      'acchi-kocchi:-tiny-tsundere,-giant-gentle-guy,-much-fluff',
      'barakamon:-calligrapher-has-an-existential-crisis-on-a-rural-island',
      'the-devil-is-a-part-timer!:-satan-flips-burgers-at-mgro-nalds',
      'wotakoi:-love-is-hard-for-otaku-(but-also-very-relatable)',
      'the-way-of-the-househusband:-ex-yakuza-is-now-a-domestic-god',
      'my-life-with-monster-girls:-it-s-a-logistical-nightmare',
      'blend-s:-service-with-a-(surprise!-sadistic!)-smile',
      'working!!:-restaurant-slice-of-life-with-quirky-staff-and-tiny-senpai',
    ]
  }
];
// NOTE: This list is illustrative. For a real system, MAL IDs should be accurate,
// and the list needs to be expanded significantly.
// Pack exclusive tag has been added to the Collectible interface for future use.
// Current SAMPLE_PACKS reference existing collectible IDs. Ensure these IDs are present in SAMPLE_COLLECTIBLES.
// For pack-specific drop rates, a `dropRateModifiers` field could be added to GachaPack later.
// Ensure all collectibles in `collectibleIds` for packs actually exist in `SAMPLE_COLLECTIBLES`.
// Added packImageUrls for a more TCG pack feel.
