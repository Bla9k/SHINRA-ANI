
// src/types/collectibles.ts

export type CollectibleRarity =
  | 'Common'
  | 'Rare'
  | 'Ultra Rare'
  | 'Legendary'
  | 'Mythic'
  | 'Event'
  | 'Forbidden'; // New Rarity

export interface Collectible {
  id: string;
  parodyTitle: string;
  originalMalId: number;
  originalType: 'anime' | 'manga';
  rarity: CollectibleRarity;
  parodyBlurb: string;
  imageUrl: string | null;
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
  faceCardCollectibleId?: string;
  packImageUrl?: string; // Fallback image for the pack itself
  collectibleIds: string[]; // Collectibles available in this pack
  isLegacyPack?: boolean; // Flag for special handling
}


// --- SAMPLE COLLECTIBLES ---
// NOTE: This list needs to be significantly expanded to ~500 for a full experience.
// The originalMalId and originalType are illustrative and should be verified for accuracy.
// For the Legacy Pack, ensure some Mythic, Event, and the new Forbidden card are included.

export const SAMPLE_COLLECTIBLES: Collectible[] = [
  // ... (previous collectibles remain, ensure some Mythics and Events exist)
  {
    id: 'lelouch-zero-requiem',
    parodyTitle: "The Emperor's Final Gambit: Zero Requiem",
    originalMalId: 1575, // Code Geass: Lelouch of the Rebellion
    originalType: 'anime',
    rarity: 'Forbidden',
    parodyBlurb: "To save the world, he became its greatest villain. A masterpiece of manipulation and sacrifice. All Hail Lelouch!",
    imageUrl: 'https://placehold.co/300x400.png?text=ZeroRequiem&font=gothic',
    genreTags: ['Mecha', 'Military', 'Drama', 'Psychological', 'Super Power'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster', 'Epic Adventure'],
    packExclusive: true, // Typically Forbidden cards would be pack exclusive
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
    packExclusive: true,
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
  {
    id: 'my-smartphone-in-another-world:-now-with-5g!',
    parodyTitle: 'My Smartphone In Another World: Now With 5G!',
    originalMalId: 35203, // In Another World With My Smartphone
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
    originalMalId: 28171, // Shokugeki no Soma
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "The foodgasms are more intense, the rivalries spicier, and the plot armor? Chef's kiss!",
    imageUrl: 'https://placehold.co/300x400.png?text=SaltyFood&font=lora',
    genreTags: ['Shonen', 'Ecchi', 'School', 'Comedy'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
    isEvolvedForm: true,
  },
  {
    id: 'yet-another-generic-isekai-harem-adventure',
    parodyTitle: 'Yet Another Generic Isekai Harem Adventure',
    originalMalId: 35203, // Example: In Another World With My Smartphone
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Our hero is bland, but somehow all the girls love him. Features: power fantasies, questionable outfits.",
    imageUrl: 'https://placehold.co/300x400.png?text=GenericIsekai&font=lora',
    genreTags: ['Isekai', 'Harem', 'Fantasy', 'Adventure'],
    moodTags: ['Comfy & Cozy', 'Brain Off'],
  },
  {
    id: 'another-isekai-where-the-mc-buys-a-slave-girl-(but-it-s-okay-because-plot)',
    parodyTitle: 'Another Isekai Where The MC Buys A Slave Girl (But It’s Okay Because Plot)',
    originalMalId: 32494, // Example: The Rising of the Shield Hero (use with caution)
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "It's fine, she's totally happy being his property and fighting his battles. No ethical concerns here!",
    imageUrl: 'https://placehold.co/300x400.png?text=SlaveGirlIsekai&font=lora',
    genreTags: ['Isekai', 'Fantasy', 'Problematic Tropes', 'Action'],
    moodTags: ['Dark & Deep', 'Cringe'],
  },
  {
    id: 'i-got-a-cheat-skill-in-another-world-and-became-unrivaled-in-the-real-world,-too-(mostly-farming)',
    parodyTitle: 'I Got A Cheat Skill In Another World And Became Unrivaled In The Real World, Too (Mostly Farming)',
    originalMalId: 51631, // I Got a Cheat Skill in Another World and Became Unrivaled in the Real World, Too
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "He one-shots dragons and then comes home to perfectly till his fields. The ultimate power fantasy.",
    imageUrl: 'https://placehold.co/300x400.png?text=CheatFarmer&font=lora',
    genreTags: ['Isekai', 'Action', 'Fantasy', 'Slice of Life'],
    moodTags: ['Adrenaline Rush', 'Comfy & Cozy'],
  },
  {
    id: 'isekai-pharmacist:-revolutionizing-medieval-medicine-with-modern-chemistry',
    parodyTitle: 'Isekai Pharmacist: Revolutionizing Medieval Medicine With Modern Chemistry',
    originalMalId: 49438, // Parallel World Pharmacy
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Turns out knowing high school chemistry makes you a medical god in a world without penicillin.",
    imageUrl: 'https://placehold.co/300x400.png?text=IsekaiRx&font=lora',
    genreTags: ['Isekai', 'Fantasy', 'Medical', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'slime-rancher:-isekai-edition',
    parodyTitle: 'Slime Rancher: Isekai Edition',
    originalMalId: 37430, // That Time I Got Reincarnated as a Slime
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Collect slimes, build a farm, accidentally become a demon lord. Just another Tuesday.",
    imageUrl: 'https://placehold.co/300x400.png?text=SlimeRancher&font=lora',
    genreTags: ['Isekai', 'Fantasy', 'Comedy', 'Slice of Life'],
    moodTags: ['Comfy & Cozy', 'Epic Adventure'],
  },
  {
    id: 'that-time-i-got-reincarnated-as-a-slime-and-accidentally-built-a-nation',
    parodyTitle: 'That Time I Got Reincarnated As A Slime And Accidentally Built A Nation',
    originalMalId: 37430, // That Time I Got Reincarnated as a Slime
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "One minute you're a slime, the next you're signing trade agreements. It escalates quickly.",
    imageUrl: 'https://placehold.co/300x400.png?text=SlimeNation&font=lora',
    genreTags: ['Isekai', 'Fantasy', 'Nation Building', 'Comedy'],
    moodTags: ['Epic Adventure', 'Comfy & Cozy'],
    evolvesToId: 'that-time-i-got-reincarnated-as-a-slime-and-accidentally-became-a-god-king',
  },
  {
    id: 'that-time-i-got-reincarnated-as-a-slime-and-accidentally-became-a-god-king',
    parodyTitle: 'That Time I Got Reincarnated As A Slime And Accidentally Became A God-King',
    originalMalId: 37430, // That Time I Got Reincarnated as a Slime
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Nation building was just the tutorial. Now for divine ascension and interdimensional politics!",
    imageUrl: 'https://placehold.co/300x400.png?text=SlimeGodKing&font=lora',
    genreTags: ['Isekai', 'Fantasy', 'Power Fantasy', 'Comedy', 'Politics'],
    moodTags: ['Epic Adventure', 'Adrenaline Rush'],
    isEvolvedForm: true,
  },
  {
    id: 'berserk:-the-suffering-never-ends-(but-the-art-is-great)',
    parodyTitle: 'Berserk: The Suffering Never Ends (But The Art Is Great)',
    originalMalId: 22, // Berserk (Manga)
    originalType: 'manga',
    rarity: 'Legendary',
    parodyBlurb: "Follow Guts as he experiences every possible form of pain, rendered in excruciatingly beautiful detail.",
    imageUrl: 'https://placehold.co/300x400.png?text=BerserkSuffers&font=lora',
    genreTags: ['Dark Fantasy', 'Action', 'Horror', 'Tragedy', 'Seinen'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'death-note:-i-ll-take-a-potato-chip...-and-eat-it!',
    parodyTitle: 'Death Note: I’ll Take A Potato Chip... AND EAT IT!',
    originalMalId: 1535, // Death Note
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Watch Light outsmart everyone with his 5D chess moves, all while enjoying a dramatically eaten snack.",
    imageUrl: 'https://placehold.co/300x400.png?text=DeathChip&font=lora',
    genreTags: ['Mystery', 'Psychological', 'Supernatural', 'Thriller'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'attack-on-my-sanity:-everyone-dies',
    parodyTitle: 'Attack On My Sanity: Everyone Dies',
    originalMalId: 16498, // Attack on Titan
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Giant naked cannibals, political intrigue, and a body count higher than your IQ. Peak fiction.",
    imageUrl: 'https://placehold.co/300x400.png?text=AoTDead&font=lora',
    genreTags: ['Action', 'Dark Fantasy', 'Horror', 'Drama', 'Mystery'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'ghost-in-the-shell:-philosophy-101-with-guns',
    parodyTitle: 'Ghost In The Shell: Philosophy 101 With Guns',
    originalMalId: 43, // Ghost in the Shell (Movie)
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "What does it mean to be human? Can I shoot it? Existential crises and cybernetic action.",
    imageUrl: 'https://placehold.co/300x400.png?text=GitSPhilosophy&font=lora',
    genreTags: ['Sci-Fi', 'Cyberpunk', 'Action', 'Psychological', 'Police'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'clannad:-the-onion-cutting-simulator',
    parodyTitle: 'Clannad: The Onion Cutting Simulator',
    originalMalId: 2167, // Clannad
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "It's a heartwarming story about family, friendship, and why you need to buy stock in tissue companies.",
    imageUrl: 'https://placehold.co/300x400.png?text=ClannadOnions&font=lora',
    genreTags: ['Slice of Life', 'Drama', 'Romance', 'Supernatural'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'dragon-ball-z:-power-up-by-screaming-louder',
    parodyTitle: 'Dragon Ball Z: Power Up By Screaming Louder',
    originalMalId: 813, // Dragon Ball Z
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "The fate of the universe depends on who can yell the longest. Also, hair changes color.",
    imageUrl: 'https://placehold.co/300x400.png?text=DBZScream&font=lora',
    genreTags: ['Action', 'Adventure', 'Shonen', 'Super Power'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'code-geass:-lelouch-plays-5d-chess-while-everyone-else-plays-checkers',
    parodyTitle: 'Code Geass: Lelouch Plays 5D Chess While Everyone Else Plays Checkers',
    originalMalId: 1575, // Code Geass
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Master strategist? Or just really good at making dramatic poses? Why not both?",
    imageUrl: 'https://placehold.co/300x400.png?text=LelouchChess&font=lora',
    genreTags: ['Action', 'Mecha', 'Military', 'Sci-Fi', 'Super Power', 'Drama'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'made-in-abyss:-adorable-characters,-unspeakable-horrors',
    parodyTitle: 'Made In Abyss: Adorable Characters, Unspeakable Horrors',
    originalMalId: 34599, // Made in Abyss
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Don't let the cute art style fool you. This will emotionally scar you. 10/10 would recommend.",
    imageUrl: 'https://placehold.co/300x400.png?text=AbyssHorror&font=lora',
    genreTags: ['Adventure', 'Dark Fantasy', 'Mystery', 'Sci-Fi', 'Drama'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'steins;gate:-my-microwave-is-a-time-machine-(and-it-screws-everything-up)',
    parodyTitle: 'Steins;Gate: My Microwave Is A Time Machine (And It Screws Everything Up)',
    originalMalId: 9253, // Steins;Gate
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "El Psy Kongroo. Also, suffering. Lots and lots of suffering. But for science!",
    imageUrl: 'https://placehold.co/300x400.png?text=SteinsMicrowave&font=lora',
    genreTags: ['Sci-Fi', 'Thriller', 'Psychological', 'Drama'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'your-name.:-beautiful-scenery,-body-swaps,-and-imminent-disaster',
    parodyTitle: 'Your Name.: Beautiful Scenery, Body Swaps, And Imminent Disaster',
    originalMalId: 32281, // Kimi no Na wa.
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Come for the stunning visuals, stay for the existential dread and a love story that defies time and space.",
    imageUrl: 'https://placehold.co/300x400.png?text=YourNameDisaster&font=lora',
    genreTags: ['Drama', 'Romance', 'Supernatural', 'School'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'violet-evergarden:-learning-to-type...-with-feelings',
    parodyTitle: 'Violet Evergarden: Learning To Type... With Feelings',
    originalMalId: 33352, // Violet Evergarden
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "She'll write you a letter so beautiful it'll make you question your life choices. Also, PTSD.",
    imageUrl: 'https://placehold.co/300x400.png?text=VioletTypes&font=lora',
    genreTags: ['Drama', 'Fantasy', 'Slice of Life'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'chainsaw-man:-denji-really-needs-therapy-(and-a-hug)',
    parodyTitle: 'Chainsaw Man: Denji Really Needs Therapy (And A Hug)',
    originalMalId: 116778, // Chainsaw Man (Manga)
    originalType: 'manga',
    rarity: 'Mythic',
    parodyBlurb: "He just wants a normal life, but destiny (and devils) have other, gorier plans. Woof.",
    imageUrl: 'https://placehold.co/300x400.png?text=DenjiTherapy&font=lora',
    genreTags: ['Action', 'Dark Fantasy', 'Horror', 'Shonen'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'fullmetal-alchemist:-equivalent-exchange-of-my-tears',
    parodyTitle: 'Fullmetal Alchemist: Equivalent Exchange of My Tears',
    originalMalId: 5114, // Fullmetal Alchemist: Brotherhood
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "To gain something, something of equal value must be lost. In this case, your emotional stability.",
    imageUrl: 'https://placehold.co/300x400.png?text=FMATears&font=lora',
    genreTags: ['Action', 'Adventure', 'Drama', 'Fantasy', 'Military', 'Shonen'],
    moodTags: ['Emotional Rollercoaster', 'Epic Adventure'],
  },
  {
    id: 'gintama:-the-fourth-wall-is-but-a-suggestion',
    parodyTitle: 'Gintama: The Fourth Wall Is But A Suggestion',
    originalMalId: 918, // Gintama
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Parodying everything from Dragon Ball to current events, while occasionally having a serious plot. Masterpiece.",
    imageUrl: 'https://placehold.co/300x400.png?text=Gintama4thWall&font=lora',
    genreTags: ['Action', 'Comedy', 'Historical', 'Parody', 'Samurai', 'Sci-Fi', 'Shonen'],
    moodTags: ['Hilarious', 'Adrenaline Rush'],
  },
  {
    id: 'hunter-x-hunter:-hiatus-simulator-(now-with-more-nen!)',
    parodyTitle: 'Hunter x Hunter: Hiatus Simulator (Now With More Nen!)',
    originalMalId: 11061, // Hunter x Hunter (2011)
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Experience the thrill of complex power systems and the agony of indefinite waiting periods.",
    imageUrl: 'https://placehold.co/300x400.png?text=HxHHiatus&font=lora',
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Shonen', 'Super Power'],
    moodTags: ['Epic Adventure', 'Adrenaline Rush'],
  },
  {
    id: 'one-piece:-the-journey-that-will-outlive-us-all',
    parodyTitle: 'One Piece: The Journey That Will Outlive Us All',
    originalMalId: 21, // One Piece
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Set sail for adventure! And keep sailing. And sailing. Is there even an end? Who cares, it's fun!",
    imageUrl: 'https://placehold.co/300x400.png?text=OnePieceForever&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Shonen', 'Super Power'],
    moodTags: ['Epic Adventure', 'Heartwarming'],
  },
  {
    id: 'yuri!!!-on-ice:-competitive-ice-skating-and-unspoken-romance',
    parodyTitle: 'Yuri!!! On Ice: Competitive Ice Skating And Unspoken Romance',
    originalMalId: 32995, // Yuri!!! On Ice
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "They were born to make history. And to make us all cry with how beautiful it is. We ship it.",
    imageUrl: 'https://placehold.co/300x400.png?text=YuriOnIce&font=lora',
    genreTags: ['Sports', 'Drama', 'Romance'],
    moodTags: ['Heartwarming', 'Emotional Rollercoaster'],
  },
  {
    id: 'banana-fish:-emotional-support-gangster-story-(prepare-for-pain)',
    parodyTitle: 'Banana Fish: Emotional Support Gangster Story (Prepare For Pain)',
    originalMalId: 36649, // Banana Fish
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Come for the cool 80s New York crime aesthetic, stay for the soul-crushing trauma. You'll never be the same.",
    imageUrl: 'https://placehold.co/300x400.png?text=BananaPain&font=lora',
    genreTags: ['Action', 'Adventure', 'Drama', 'Shoujo'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'golden-kamuy:-hokkaido-treasure-hunt-with-war-criminals-and-bear-fights',
    parodyTitle: 'Golden Kamuy: Hokkaido Treasure Hunt With War Criminals And Bear Fights',
    originalMalId: 36028, // Golden Kamuy
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "History, culture, cooking, homoeroticism, and extreme violence. What's not to love? Hinna hinna.",
    imageUrl: 'https://placehold.co/300x400.png?text=GoldenBear&font=lora',
    genreTags: ['Action', 'Adventure', 'Historical', 'Seinen', 'Drama'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'to-your-eternity:-immortal-being-learns-about-life-through-unending-pain',
    parodyTitle: 'To Your Eternity: Immortal Being Learns About Life Through Unending Pain',
    originalMalId: 41025, // To Your Eternity
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Each arc introduces new characters you'll love, just so they can die tragically. Peak emotional damage.",
    imageUrl: 'https://placehold.co/300x400.png?text=EternityPain&font=lora',
    genreTags: ['Adventure', 'Drama', 'Fantasy', 'Shonen', 'Supernatural'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'kill-la-kill:-clothes-are-evil-(and-also-power-ups)',
    parodyTitle: 'Kill la Kill: Clothes Are Evil (And Also Power Ups)',
    originalMalId: 18679, // Kill la Kill
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Don't lose your way! Or your clothes! A wild ride of fanservice, action, and surprisingly deep themes.",
    imageUrl: 'https://placehold.co/300x400.png?text=KillClothes&font=lora',
    genreTags: ['Action', 'Comedy', 'Ecchi', 'School', 'Super Power'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
  },
  {
    id: 'konosuba:-my-adventuring-party-is-useless-(and-i-love-it)',
    parodyTitle: 'KonoSuba: My Adventuring Party Is Useless (And I Love It)',
    originalMalId: 30831, // KonoSuba
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A goddess who's more trouble than she's worth, a masochist knight, and an explosion-obsessed mage. Comedy gold.",
    imageUrl: 'https://placehold.co/300x400.png?text=KonoUseless&font=lora',
    genreTags: ['Adventure', 'Comedy', 'Fantasy', 'Isekai', 'Parody', 'Supernatural'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'grand-blue-dreaming:-the-diving-anime-that-s-not-about-diving',
    parodyTitle: 'Grand Blue Dreaming: The Diving Anime That’s Not About Diving',
    originalMalId: 37105, // Grand Blue
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "It's about college, friendship, and copious amounts of underage (looking) drinking. Oh, and sometimes they dive.",
    imageUrl: 'https://placehold.co/300x400.png?text=GrandDrinking&font=lora',
    genreTags: ['Comedy', 'Seinen', 'Slice of Life'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'magical-boy-transformation-sequence:-the-series',
    parodyTitle: 'Magical Boy Transformation Sequence: The Series',
    originalMalId: 28009, // Cute High Earth Defense Club LOVE!
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Who needs magical girls when you have sparkly boys fighting evil with the power of love and friendship?",
    imageUrl: 'https://placehold.co/300x400.png?text=MagicalBoy&font=lora',
    genreTags: ['Comedy', 'Mahou Shoujo', 'Parody', 'Slice of Life'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'cells-at-work!:-your-biology-class,-but-moe',
    parodyTitle: 'Cells at Work!: Your Biology Class, But Moe',
    originalMalId: 37141, // Hataraku Saibou
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Learn about the human body while watching cute anime characters work tirelessly to keep you alive. Educational!",
    imageUrl: 'https://placehold.co/300x400.png?text=MoeCells&font=lora',
    genreTags: ['Comedy', 'Shonen', 'Slice of Life', 'Educational'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'if-i-could-turn-back-time:-the-anime',
    parodyTitle: 'If I Could Turn Back Time: The Anime',
    originalMalId: 32829, // Erased
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "He goes back in time to save lives, but mostly just makes things more complicated. Also, pizza delivery.",
    imageUrl: 'https://placehold.co/300x400.png?text=TimeTravelPizza&font=lora',
    genreTags: ['Mystery', 'Psychological', 'Supernatural', 'Thriller', 'Seinen'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'the-disastrous-life-of-saiki-k-he-just-wants-to-be-left-alone-(but-he-s-a-god-tier-psychic)',
    parodyTitle: 'The Disastrous Life of Saiki K: He Just Wants To Be Left Alone (But He’s A God-Tier Psychic)',
    originalMalId: 33255, // Saiki Kusuo no Psi-nan
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Superpowers are a pain when all you want is coffee jelly and peace. His friends are idiots. Yare yare.",
    imageUrl: 'https://placehold.co/300x400.png?text=SaikiCoffeeJelly&font=lora',
    genreTags: ['Comedy', 'School', 'Shonen', 'Slice of Life', 'Supernatural', 'Super Power'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'monthly-girls-nozaki-kun-he-s-a-shojo-mangaka-but-completely-oblivious',
    parodyTitle: 'Monthly Girls’ Nozaki-kun: He’s A Shojo Mangaka But Completely Oblivious',
    originalMalId: 23289, // Gekkan Shoujo Nozaki-kun
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "She confesses her love, he gives her an autograph. The ultimate romantic comedy of misunderstandings.",
    imageUrl: 'https://placehold.co/300x400.png?text=NozakiOblivious&font=lora',
    genreTags: ['Comedy', 'Romance', 'School', 'Shoujo'],
    moodTags: ['Hilarious', 'Heartwarming'],
  },
  {
    id: 'ouran-high-school-host-club:-rich-boys-entertain-commoner-girl-(who-s-disguised-as-a-boy)',
    parodyTitle: 'Ouran High School Host Club: Rich Boys Entertain Commoner Girl (Who’s Disguised As A Boy)',
    originalMalId: 853, // Ouran Koukou Host Club
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Kiss kiss fall in love! Also, critiques of class structures and gender roles, probably.",
    imageUrl: 'https://placehold.co/300x400.png?text=OuranHostClub&font=lora',
    genreTags: ['Comedy', 'Harem', 'Reverse Harem', 'Romance', 'School', 'Shoujo'],
    moodTags: ['Hilarious', 'Heartwarming'],
  },
  {
    id: 'daily-lives-of-high-school-boys:-boys-will-be-idiots',
    parodyTitle: 'Daily Lives of High School Boys: Boys Will Be Idiots',
    originalMalId: 11843, // Danshi Koukousei no Nichijou
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "A surprisingly accurate depiction of what boys do when left unsupervised. Hint: it's stupid.",
    imageUrl: 'https://placehold.co/300x400.png?text=BoysIdiots&font=lora',
    genreTags: ['Comedy', 'School', 'Shonen', 'Slice of Life'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'aggretsuko:-red-panda-rages-against-office-life-with-death-metal-karaoke',
    parodyTitle: 'Aggretsuko: Red Panda Rages Against Office Life With Death Metal Karaoke',
    originalMalId: 36904, // Aggressive Retsuko (ONA)
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Relatable office struggles meet adorable Sanrio character meets brutal death metal. A masterpiece.",
    imageUrl: 'https://placehold.co/300x400.png?text=AggretsukoMetal&font=lora',
    genreTags: ['Comedy', 'Slice of Life', 'Music', 'Office Life'],
    moodTags: ['Hilarious', 'Relatable'],
  },
  {
    id: 'azumanga-daioh:-surreal-high-school-comedy-that-defined-a-generation',
    parodyTitle: 'Azumanga Daioh: Surreal High School Comedy That Defined A Generation',
    originalMalId: 66, // Azumanga Daioh
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Hello everynyan! How are you? Fine thank you. I wish I were a bird. Yes.",
    imageUrl: 'https://placehold.co/300x400.png?text=AzumangaBird&font=lora',
    genreTags: ['Comedy', 'School', 'Slice of Life'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'himouto!-umaru-chan:-my-perfect-little-sister-is-a-cola-guzzling-gremlin-at-home',
    parodyTitle: 'Himouto! Umaru-chan: My Perfect Little Sister Is A Cola-Guzzling Gremlin At Home',
    originalMalId: 28825, // Himouto! Umaru-chan
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Publicly, she's an angel. Privately, she's a hamster-hooded, game-addicted, junk-food fiend. Relatable.",
    imageUrl: 'https://placehold.co/300x400.png?text=UmaruGremlin&font=lora',
    genreTags: ['Comedy', 'School', 'Slice of Life', 'Seinen'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'gabriel-dropout:-top-angel-becomes-ultimate-neet-gamer',
    parodyTitle: 'Gabriel DropOut: Top Angel Becomes Ultimate NEET Gamer',
    originalMalId: 33731, // Gabriel DropOut
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Heaven's valedictorian discovers MMORPGs and microtransactions. The fall from grace is hilarious.",
    imageUrl: 'https://placehold.co/300x400.png?text=GabrielNEET&font=lora',
    genreTags: ['Comedy', 'School', 'Shonen', 'Slice of Life', 'Supernatural'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'hinamatsuri:-yakuza-adopts-psychic-girl,-hilarity-ensues',
    parodyTitle: 'Hinamatsuri: Yakuza Adopts Psychic Girl, Hilarity Ensues',
    originalMalId: 36296, // Hinamatsuri
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "She uses her powers for naps and demanding salmon roe. He just wanted a quiet life. Tough luck, buddy.",
    imageUrl: 'https://placehold.co/300x400.png?text=HinaPsychic&font=lora',
    genreTags: ['Comedy', 'Sci-Fi', 'Seinen', 'Slice of Life', 'Supernatural'],
    moodTags: ['Hilarious', 'Heartwarming'],
  },
  {
    id: 'interviews-with-monster-girls:-my-students-are-monsters-(literally,-and-it-s-cute)',
    parodyTitle: 'Interviews with Monster Girls: My Students Are Monsters (Literally, And It’s Cute)',
    originalMalId: 33988, // Demi-chan wa Kataritai
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "A vampire, a dullahan, a snow woman, and a succubus walk into a high school... and it's surprisingly wholesome.",
    imageUrl: 'https://placehold.co/300x400.png?text=DemiChanCute&font=lora',
    genreTags: ['Comedy', 'Fantasy', 'School', 'Seinen', 'Slice of Life', 'Supernatural'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'nichijou:-my-ordinary-life-is-an-absurdist-fever-dream',
    parodyTitle: 'Nichijou: My Ordinary Life Is An Absurdist Fever Dream',
    originalMalId: 10165, // Nichijou
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Deer wrestling, rocket punches, and a talking cat. Just a normal day in this slice-of-life masterpiece.",
    imageUrl: 'https://placehold.co/300x400.png?text=NichijouFever&font=lora',
    genreTags: ['Comedy', 'School', 'Slice of Life', 'Shonen'],
    moodTags: ['Hilarious', 'Surreal'],
  },
  {
    id: 'acchi-kocchi:-tiny-tsundere,-giant-gentle-guy,-much-fluff',
    parodyTitle: 'Acchi Kocchi: Tiny Tsundere, Giant Gentle Guy, Much Fluff',
    originalMalId: 12327, // Acchi Kocchi (TV)
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "She's smol, angry, and madly in love. He's oblivious but very pattable. Pure diabetes.",
    imageUrl: 'https://placehold.co/300x400.png?text=AcchiKocchiFluff&font=lora',
    genreTags: ['Comedy', 'Romance', 'School', 'Seinen', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'barakamon:-calligrapher-has-an-existential-crisis-on-a-rural-island',
    parodyTitle: 'Barakamon: Calligrapher Has An Existential Crisis On A Rural Island',
    originalMalId: 22789, // Barakamon
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "He punched a critic, got exiled, and befriended a bunch of kids. Character development achieved via mochi.",
    imageUrl: 'https://placehold.co/300x400.png?text=BarakamonIsland&font=lora',
    genreTags: ['Comedy', 'Slice of Life', 'Shonen'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'the-devil-is-a-part-timer!:-satan-flips-burgers-at-mgro-nalds',
    parodyTitle: 'The Devil Is a Part-Timer!: Satan Flips Burgers At MgRonalds',
    originalMalId: 15809, // Hataraku Maou-sama!
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "World domination can wait; rent is due and those fries won't cook themselves. The hero is also a call center agent.",
    imageUrl: 'https://placehold.co/300x400.png?text=SatanBurger&font=lora',
    genreTags: ['Comedy', 'Fantasy', 'Romance', 'Supernatural'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'wotakoi:-love-is-hard-for-otaku-(but-also-very-relatable)',
    parodyTitle: 'Wotakoi: Love Is Hard for Otaku (But Also Very Relatable)',
    originalMalId: 35968, // Wotaku ni Koi wa Muzukashii
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Dating your fellow otaku colleague: shared hobbies, awkward moments, and debates about best girl.",
    imageUrl: 'https://placehold.co/300x400.png?text=WotakoiRelatable&font=lora',
    genreTags: ['Comedy', 'Romance', 'Slice of Life', 'Workplace'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'the-way-of-the-househusband:-ex-yakuza-is-now-a-domestic-god',
    parodyTitle: 'The Way of the Househusband: Ex-Yakuza Is Now A Domestic God',
    originalMalId: 43692, // Gokushufudou
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He'll kill you... with kindness. And perfectly packed bento boxes. The 'Immortal Dragon' has retired to domestic bliss.",
    imageUrl: 'https://placehold.co/300x400.png?text=HousehusbandYakuza&font=lora',
    genreTags: ['Comedy', 'Slice of Life', 'Gag Humor'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'my-life-with-monster-girls:-it-s-a-logistical-nightmare',
    parodyTitle: 'My Life With Monster Girls: It’s A Logistical Nightmare',
    originalMalId: 27739, // Monster Musume no Iru Nichijou
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Lamias, centaurs, harpies, oh my! His house is full, his heart is (mostly) willing, and the government is watching.",
    imageUrl: 'https://placehold.co/300x400.png?text=MonsterGirlsLogistics&font=lora',
    genreTags: ['Comedy', 'Ecchi', 'Fantasy', 'Harem', 'Romance', 'Slice of Life', 'Monster Girls'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'blend-s:-service-with-a-(surprise!-sadistic!)-smile',
    parodyTitle: 'Blend S: Service With A (Surprise! Sadistic!) Smile',
    originalMalId: 34618, // Blend S
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "She just wants to be cute, but her default expression is terrifying. Perfect for a cafe with weird roleplay themes.",
    imageUrl: 'https://placehold.co/300x400.png?text=BlendSSadistic&font=lora',
    genreTags: ['Comedy', 'Slice of Life', 'Workplace'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'working!!:-restaurant-slice-of-life-with-quirky-staff-and-tiny-senpai',
    parodyTitle: 'Working!!: Restaurant Slice-of-Life With Quirky Staff And Tiny Senpai',
    originalMalId: 6956, // Working!!
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Everyone at Wagnaria has issues, but at least the food is decent. And Popura is very small.",
    imageUrl: 'https://placehold.co/300x400.png?text=WorkingWagnaria&font=lora',
    genreTags: ['Comedy', 'Romance', 'Slice of Life', 'Workplace', 'Seinen'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'a-silent-voice:-communication-is-hard,-okay?',
    parodyTitle: 'A Silent Voice: Communication Is Hard, Okay?',
    originalMalId: 28851, // Koe no Katachi
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Bullying, regret, and the struggle to connect. This movie will make you feel things. Many things.",
    imageUrl: 'https://placehold.co/300x400.png?text=SilentVoiceComm&font=lora',
    genreTags: ['Drama', 'School', 'Shonen'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'your-lie-in-april:-play-piano,-cry-violently',
    parodyTitle: 'Your Lie in April: Play Piano, Cry Violently',
    originalMalId: 23273, // Shigatsu wa Kimi no Uso
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Beautiful music, tragic romance, and a whole lot of emotional baggage. Keep the tissues handy.",
    imageUrl: 'https://placehold.co/300x400.png?text=LieInAprilCry&font=lora',
    genreTags: ['Drama', 'Music', 'Romance', 'School', 'Shonen'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'wolf-children:-single-mom-raises-werewolf-kids,-it-s-tough',
    parodyTitle: 'Wolf Children: Single Mom Raises Werewolf Kids, It’s Tough',
    originalMalId: 12355, // Ookami Kodomo no Ame to Yuki
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A heartwarming and heartbreaking story about motherhood, identity, and choosing your own path (wolf or human).",
    imageUrl: 'https://placehold.co/300x400.png?text=WolfChildrenMom&font=lora',
    genreTags: ['Fantasy', 'Slice of Life', 'Drama'],
    moodTags: ['Heartwarming', 'Emotional Rollercoaster'],
  },
  {
    id: 'anohana:-the-ghost-girl-who-made-everyone-cry-for-11-episodes',
    parodyTitle: 'Anohana: The Ghost Girl Who Made Everyone Cry For 11 Episodes',
    originalMalId: 9989, // Ano Hi Mita Hana no Namae wo Bokutachi wa Mada Shiranai.
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Childhood friends reunite to grant a ghost's wish. Get ready for a feels trip you won't forget.",
    imageUrl: 'https://placehold.co/300x400.png?text=AnohanaGhostCry&font=lora',
    genreTags: ['Drama', 'Slice of Life', 'Supernatural', 'Tragedy'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'school-live!:-cute-girls-survive-the-zombie-apocalypse-(mostly-by-ignoring-it)',
    parodyTitle: 'School-Live!: Cute Girls Survive The Zombie Apocalypse (Mostly By Ignoring It)',
    originalMalId: 24765, // Gakkou Gurashi!
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "It's a fun school club! Except for the zombies. And the trauma. And the talking dog illusion. Moe horror!",
    imageUrl: 'https://placehold.co/300x400.png?text=SchoolLiveZombies&font=lora',
    genreTags: ['Horror', 'Mystery', 'Psychological', 'School', 'Slice of Life', 'Survival'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'wonder-egg-priority:-cute-girls-fight-trauma-monsters-(it-s-very-symbolic)',
    parodyTitle: 'Wonder Egg Priority: Cute Girls Fight Trauma Monsters (It’s Very Symbolic)',
    originalMalId: 43299, // Wonder Egg Priority
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Visually stunning, thematically heavy, and a bit confusing. But the eggs are pretty.",
    imageUrl: 'https://placehold.co/300x400.png?text=WonderEggSymbolic&font=lora',
    genreTags: ['Drama', 'Fantasy', 'Psychological', 'Mahou Shoujo'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'the-ancient-magus-bride:-girl-buys-herself-a-skull-headed-mage-husband',
    parodyTitle: 'The Ancient Magus Bride: Girl Buys Herself A Skull-Headed Mage Husband',
    originalMalId: 35062, // Mahoutsukai no Yome
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "It's less weird than it sounds. Mostly. A beautiful story about finding belonging in a magical world.",
    imageUrl: 'https://placehold.co/300x400.png?text=MagusBrideSkull&font=lora',
    genreTags: ['Fantasy', 'Drama', 'Romance', 'Slice of Life', 'Supernatural', 'Mythology'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'mushishi:-chill-guy-solves-supernatural-problems-with-zen-and-tobacco',
    parodyTitle: 'Mushishi: Chill Guy Solves Supernatural Problems With Zen And Tobacco',
    originalMalId: 457, // Mushishi
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Episodic tales of strange spiritual beings and the man who helps humans coexist with them. Very calming.",
    imageUrl: 'https://placehold.co/300x400.png?text=MushishiZen&font=lora',
    genreTags: ['Adventure', 'Fantasy', 'Historical', 'Mystery', 'Slice of Life', 'Supernatural', 'Iyashikei'],
    moodTags: ['Comfy & Cozy', 'Dark & Deep'],
  },
  {
    id: 'nana:-two-girls-named-nana-become-roommates,-drama-ensues',
    parodyTitle: 'NANA: Two Girls Named Nana Become Roommates, Drama Ensues',
    originalMalId: 877, // NANA
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Punk rock, fashion, love triangles, and adulting is hard. Prepare for a rollercoaster of emotions.",
    imageUrl: 'https://placehold.co/300x400.png?text=NanaDrama&font=lora',
    genreTags: ['Drama', 'Music', 'Romance', 'Slice of Life', 'Josei'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'revolutionary-girl-utena:-lesbian-sword-fights-for-the-rose-bride-(it-s-very-symbolic)',
    parodyTitle: 'Revolutionary Girl Utena: Lesbian Sword Fights For The Rose Bride (It’s Very Symbolic)',
    originalMalId: 440, // Shoujo Kakumei Utena
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Breaking gender roles, surreal imagery, and a whole lot of roses. A true classic of queer anime.",
    imageUrl: 'https://placehold.co/300x400.png?text=UtenaRoses&font=lora',
    genreTags: ['Drama', 'Fantasy', 'Mystery', 'Psychological', 'Romance', 'Shoujo', 'School'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'skip-beat!:-girl-joins-showbiz-for-revenge,-accidentally-finds-herself',
    parodyTitle: 'Skip Beat!: Girl Joins Showbiz For Revenge, Accidentally Finds Herself',
    originalMalId: 4722, // Skip Beat!
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "He broke her heart, so she'll break into the entertainment industry. Kyoko is a force of nature.",
    imageUrl: 'https://placehold.co/300x400.png?text=SkipBeatRevenge&font=lora',
    genreTags: ['Comedy', 'Drama', 'Romance', 'Shoujo', 'Showbiz'],
    moodTags: ['Heartwarming', 'Hilarious'],
  },
  {
    id: 'princess-jellyfish:-neet-girls-try-to-save-their-building-with-fashion-(and-a-crossdressing-boy)',
    parodyTitle: 'Princess Jellyfish: NEET Girls Try To Save Their Building With Fashion (And A Crossdressing Boy)',
    originalMalId: 8129, // Kuragehime
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Socially awkward girls obsessed with jellyfish meet a stylish boy who helps them find their confidence. Wholesome.",
    imageUrl: 'https://placehold.co/300x400.png?text=JellyfishFashion&font=lora',
    genreTags: ['Comedy', 'Josei', 'Slice of Life', 'Crossdressing'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'haikyuu!!:-volleyball-boys-are-very-intense-about-volleyball',
    parodyTitle: 'Haikyuu!!: Volleyball Boys Are Very Intense About Volleyball',
    originalMalId: 20583, // Haikyuu!!
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Fly! Jump! Spike! These high schoolers take volleyball more seriously than you take your entire life.",
    imageUrl: 'https://placehold.co/300x400.png?text=HaikyuuFly&font=lora',
    genreTags: ['Sports', 'School', 'Shonen', 'Drama', 'Comedy'],
    moodTags: ['Adrenaline Rush', 'Heartwarming'],
  },
  {
    id: 'kuroko-s-basketball:-basketball-with-superpowers',
    parodyTitle: 'Kuroko’s Basketball: Basketball With Superpowers',
    originalMalId: 11771, // Kuroko no Basket
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Invisible passes, full-court shots, and Zone mode. It's basically a sports battle shonen.",
    imageUrl: 'https://placehold.co/300x400.png?text=KurokoZone&font=lora',
    genreTags: ['Sports', 'School', 'Shonen', 'Super Power'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'free!:-swimming-boys-and-their-very-close-friendships',
    parodyTitle: 'Free!: Swimming Boys And Their Very Close Friendships',
    originalMalId: 18507, // Free!
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Lots of water, lots of muscles, and lots of... bonding. For the plot, of course.",
    imageUrl: 'https://placehold.co/300x400.png?text=FreeWaterBoys&font=lora',
    genreTags: ['Sports', 'School', 'Slice of Life', 'Drama', 'Comedy'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'slam-dunk:-delinquent-joins-basketball-team-to-impress-a-girl,-actually-gets-good',
    parodyTitle: 'Slam Dunk: Delinquent Joins Basketball Team To Impress A Girl, Actually Gets Good',
    originalMalId: 170, // Slam Dunk
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "The original basketball bad boy. Hanamichi Sakuragi is a comedic and sports genius.",
    imageUrl: 'https://placehold.co/300x400.png?text=SlamDunkGenius&font=lora',
    genreTags: ['Sports', 'School', 'Shonen', 'Comedy', 'Drama'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
  },
  {
    id: 'chihayafuru:-competitive-poetry-slapping-is-surprisingly-hype',
    parodyTitle: 'Chihayafuru: Competitive Poetry Slapping Is Surprisingly Hype',
    originalMalId: 10800, // Chihayafuru
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Karuta: it's like lightning-fast memory Go Fish with 100 ancient poems. And so much drama.",
    imageUrl: 'https://placehold.co/300x400.png?text=ChihayaKaruta&font=lora',
    genreTags: ['Drama', 'Game', 'Josei', 'School', 'Slice of Life', 'Sports'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'initial-d:-eurobeat-intensifies-while-tofu-gets-delivered',
    parodyTitle: 'Initial D: Eurobeat Intensifies While Tofu Gets Delivered',
    originalMalId: 185, // Initial D First Stage
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Deja vu! I've just been in this place before! Drifting, racing, and the power of an AE86.",
    imageUrl: 'https://placehold.co/300x400.png?text=InitialDEurobeat&font=lora',
    genreTags: ['Action', 'Cars', 'Drama', 'Seinen', 'Sports'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'ping-pong-the-animation:-ugly-art-style,-beautiful-story',
    parodyTitle: 'Ping Pong The Animation: Ugly Art Style, Beautiful Story',
    originalMalId: 22147, // Ping Pong The Animation
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "The hero appears! A unique and masterfully told story about talent, friendship, and table tennis.",
    imageUrl: 'https://placehold.co/300x400.png?text=PingPongUglyBeautiful&font=lora',
    genreTags: ['Drama', 'Psychological', 'Seinen', 'Sports'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'megalo-box:-cyberpunk-boxing-with-a-retro-futuristic-vibe',
    parodyTitle: 'Megalo Box: Cyberpunk Boxing With A Retro-Futuristic Vibe',
    originalMalId: 36563, // Megalo Box
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Gearless Joe punches his way to the top in a gritty, stylish tribute to Ashita no Joe.",
    imageUrl: 'https://placehold.co/300x400.png?text=MegaloBoxGearless&font=lora',
    genreTags: ['Action', 'Drama', 'Sci-Fi', 'Slice of Life', 'Sports', 'Shonen'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'run-with-the-wind:-college-students-reluctantly-train-for-a-marathon-(it-s-very-inspiring)',
    parodyTitle: 'Run with the Wind: College Students Reluctantly Train For A Marathon (It’s Very Inspiring)',
    originalMalId: 37965, // Kaze ga Tsuyoku Fuiteiru
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A group of misfits, a shared goal, and a whole lot of running. You'll want to go for a jog after this.",
    imageUrl: 'https://placehold.co/300x400.png?text=RunWindMarathon&font=lora',
    genreTags: ['Sports', 'Drama', 'Comedy', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Emotional Rollercoaster'],
  },
  {
    id: 'sk8-the-infinity:-pretty-boys-do-dangerous-skateboard-races-(and-it-s-very-gay)',
    parodyTitle: 'SK8 the Infinity: Pretty Boys Do Dangerous Skateboard Races (And It’s Very Gay)',
    originalMalId: 42923, // SK8 The Infinity
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Illegal downhill skateboarding, intense rivalries, and a whole lot of beef. It's a blast!",
    imageUrl: 'https://placehold.co/300x400.png?text=SK8InfinityGay&font=lora',
    genreTags: ['Sports', 'Comedy', 'Drama', 'Shonen', 'BL (implied)'],
    moodTags: ['Adrenaline Rush', 'Heartwarming'],
  },
  {
    id: 'tengen-toppa-gurren-lagann:-my-drill-is-the-drill-that-will-pierce-the-heavens-(and-logic)',
    parodyTitle: 'Tengen Toppa Gurren Lagann: My Drill Is The Drill That Will Pierce The Heavens (And Logic)',
    originalMalId: 2001, // Tengen Toppa Gurren Lagann
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Believe in the Simon that believes in you! Giant robots, galaxy-sized drills, and pure, unadulterated hype.",
    imageUrl: 'https://placehold.co/300x400.png?text=GurrenLagannDrill&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Mecha', 'Sci-Fi', 'Shonen'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'promare:-trigger-does-trigger-things-(it-s-very-loud-and-colorful)',
    parodyTitle: 'Promare: Trigger Does Trigger Things (It’s Very Loud And Colorful)',
    originalMalId: 35847, // Promare
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Firefighters with mechs fight fire mutants. Expect explosions, crazy animation, and a killer soundtrack.",
    imageUrl: 'https://placehold.co/300x400.png?text=PromareFire&font=lora',
    genreTags: ['Action', 'Mecha', 'Sci-Fi', 'Super Power'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'redline:-2d-animation-flexes-so-hard-it-took-7-years-to-make',
    parodyTitle: 'Redline: 2D Animation Flexes So Hard It Took 7 Years To Make',
    originalMalId: 6675, // Redline
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "The most insane, visually stunning space race you'll ever see. Pure animated adrenaline.",
    imageUrl: 'https://placehold.co/300x400.png?text=RedlineFlex&font=lora',
    genreTags: ['Action', 'Cars', 'Sci-Fi', 'Sports', 'Space'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'space-dandy:-he-s-a-dandy-guy...-in-space',
    parodyTitle: 'Space Dandy: He’s A Dandy Guy... In Space',
    originalMalId: 20057, // Space Dandy
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Groovy alien hunting adventures across the galaxy. Each episode is a different genre. Baby.",
    imageUrl: 'https://placehold.co/300x400.png?text=SpaceDandyGuy&font=lora',
    genreTags: ['Action', 'Comedy', 'Sci-Fi', 'Space', 'Adventure'],
    moodTags: ['Hilarious', 'Epic Adventure'],
  },
  {
    id: 'cowboy-bebop:-space-jazz-and-existential-dread',
    parodyTitle: 'Cowboy Bebop: Space Jazz And Existential Dread',
    originalMalId: 1, // Cowboy Bebop
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "See you, space cowboy... You're gonna carry that weight. A timeless classic of cool and melancholy.",
    imageUrl: 'https://placehold.co/300x400.png?text=BebopJazzDread&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Drama', 'Sci-Fi', 'Space', 'Adult Cast'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'samurai-champloo:-hip-hop-samurai-road-trip',
    parodyTitle: 'Samurai Champloo: Hip-Hop Samurai Road Trip',
    originalMalId: 205, // Samurai Champloo
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Feudal Japan meets Nujabes beats. Three unlikely companions search for a samurai who smells of sunflowers.",
    imageUrl: 'https://placehold.co/300x400.png?text=ChamplooHipHop&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Historical', 'Samurai', 'Shonen', 'Music'],
    moodTags: ['Adrenaline Rush', 'Comfy & Cozy'],
  },
  {
    id: 'baccano!:-immortal-gangsters-and-a-very-confusing-timeline',
    parodyTitle: 'Baccano!: Immortal Gangsters And A Very Confusing Timeline',
    originalMalId: 2251, // Baccano!
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "It all makes sense in the end. Maybe. A wild, non-linear ride through Prohibition-era America with a supernatural twist.",
    imageUrl: 'https://placehold.co/300x400.png?text=BaccanoConfusing&font=lora',
    genreTags: ['Action', 'Mystery', 'Supernatural', 'Historical', 'Drama', 'Comedy', 'Adult Cast'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'durarara!!:-ikebukuro-is-a-weird-place',
    parodyTitle: 'Durarara!!: Ikebukuro Is A Weird Place',
    originalMalId: 6746, // Durarara!!
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Headless riders, superhuman bartenders, and online gangs. Just another day in the city.",
    imageUrl: 'https://placehold.co/300x400.png?text=DurararaWeird&font=lora',
    genreTags: ['Action', 'Mystery', 'Supernatural', 'Drama', 'Romance', 'School'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'mononoke:-stylish-horror-with-a-medicine-seller-who-fights-demons',
    parodyTitle: 'Mononoke: Stylish Horror With A Medicine Seller Who Fights Demons',
    originalMalId: 2246, // Mononoke
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Unforgettable art style, chilling stories, and a mysterious protagonist. Peak Japanese horror.",
    imageUrl: 'https://placehold.co/300x400.png?text=MononokeMedicine&font=lora',
    genreTags: ['Mystery', 'Horror', 'Supernatural', 'Historical', 'Demons', 'Psychological', 'Fantasy'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'kaiba:-dystopian-sci-fi-with-memory-manipulation-and-a-unique-art-style',
    parodyTitle: 'Kaiba: Dystopian Sci-Fi With Memory Manipulation And A Unique Art Style',
    originalMalId: 3701, // Kaiba
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Amnesiac protagonist, body-swapping, and a society where memories can be bought and sold. Mind-bending.",
    imageUrl: 'https://placehold.co/300x400.png?text=KaibaMemory&font=lora',
    genreTags: ['Adventure', 'Mystery', 'Romance', 'Sci-Fi', 'Drama', 'Psychological'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'the-tatami-galaxy:-college-student-relives-his-first-two-years-repeatedly-trying-to-find-happiness',
    parodyTitle: 'The Tatami Galaxy: College Student Relives His First Two Years Repeatedly Trying To Find Happiness',
    originalMalId: 7785, // Yojouhan Shinwa Taikei
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "A rapid-fire, surreal, and ultimately heartwarming story about choices, regret, and the elusive 'rose-colored campus life.'",
    imageUrl: 'https://placehold.co/300x400.png?text=TatamiGalaxyRose&font=lora',
    genreTags: ['Mystery', 'Psychological', 'Romance', 'Comedy', 'Time Travel (sort of)'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: ' FLCL:-coming-of-age-with-robots,-aliens,-and-vespas',
    parodyTitle: 'FLCL: Coming-Of-Age With Robots, Aliens, And Vespas',
    originalMalId: 227, // FLCL
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Nothing makes sense, but it's incredibly stylish and a perfect metaphor for puberty. Never knows best.",
    imageUrl: 'https://placehold.co/300x400.png?text=FLCLVespa&font=lora',
    genreTags: ['Action', 'Avant Garde', 'Comedy', 'Dementia', 'Mecha', 'Sci-Fi'],
    moodTags: ['Hilarious', 'Surreal'],
  },
  {
    id: 'devilman-crybaby:-demons,-sex,-drugs,-and-a-whole-lot-of-crying',
    parodyTitle: 'Devilman Crybaby: Demons, Sex, Drugs, And A Whole Lot Of Crying',
    originalMalId: 35120, // Devilman: Crybaby
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "A beautiful and brutal depiction of love, betrayal, and the end of the world. You will not be okay.",
    imageUrl: 'https://placehold.co/300x400.png?text=DevilmanCrying&font=lora',
    genreTags: ['Action', 'Avant Garde', 'Demons', 'Drama', 'Horror', 'Supernatural', 'Gore'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'mob-psycho-100:-socially-awkward-kid-is-actually-an-omega-level-esper',
    parodyTitle: 'Mob Psycho 100: Socially Awkward Kid Is Actually An Omega-Level Esper',
    originalMalId: 32182, // Mob Psycho 100
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "He just wants to be normal and impress his crush, but his psychic powers (and his con-artist master) have other plans.",
    imageUrl: 'https://placehold.co/300x400.png?text=MobEsper&font=lora',
    genreTags: ['Action', 'Comedy', 'Slice of Life', 'Supernatural', 'Super Power'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
  },
  {
    id: 'eromanga-sensei:-my-little-sister-is-my-erotic-manga-artist-(and-it-s-somehow-wholesome?)',
    parodyTitle: 'Eromanga Sensei: My Little Sister Is My Erotic Manga Artist (And It’s Somehow Wholesome?)',
    originalMalId: 32901, // Eromanga Sensei
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Questionable premise, surprisingly charming execution. It's a rom-com, mostly.",
    imageUrl: 'https://placehold.co/300x400.png?text=EromangaWholesome&font=lora',
    genreTags: ['Comedy', 'Drama', 'Ecchi', 'Harem', 'Romance', 'Slice of Life', 'Incest (implied/baited)'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'darling-in-the-franxx:-teens-pilot-suggestive-mechs-to-fight-monsters-(and-also-puberty)',
    parodyTitle: 'Darling in the FranXX: Teens Pilot Suggestive Mechs To Fight Monsters (And Also Puberty)',
    originalMalId: 35849, // Darling in the FranXX
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Great mecha designs, controversial plot developments, and a whole lot of teen angst. Zero Two best girl.",
    imageUrl: 'https://placehold.co/300x400.png?text=FranXXMechs&font=lora',
    genreTags: ['Action', 'Drama', 'Mecha', 'Romance', 'Sci-Fi'],
    moodTags: ['Emotional Rollercoaster', 'Adrenaline Rush'],
  },
  {
    id: 'kaguya-sama:-love-is-war-(and-these-two-idiots-are-losing)',
    parodyTitle: 'Kaguya-sama: Love Is War (And These Two Idiots Are Losing)',
    originalMalId: 37999, // Kaguya-sama wa Kokurasetai
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Two geniuses try to make the other confess their love first. The result is hilarious mind games and misunderstandings.",
    imageUrl: 'https://placehold.co/300x400.png?text=KaguyaLoveWar&font=lora',
    genreTags: ['Comedy', 'Psychological', 'Romance', 'School', 'Seinen'],
    moodTags: ['Hilarious', 'Heartwarming'],
  },
  {
    id: 'vinland-saga:-viking-revenge-story-turns-into-farming-simulator',
    parodyTitle: 'Vinland Saga: Viking Revenge Story Turns Into Farming Simulator',
    originalMalId: 37521, // Vinland Saga
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "He has no enemies. Except for the ones he brutally murdered. A profound story about violence and redemption.",
    imageUrl: 'https://placehold.co/300x400.png?text=VinlandFarming&font=lora',
    genreTags: ['Action', 'Adventure', 'Drama', 'Historical', 'Seinen'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: '[oshi-no-ko]:-the-dark-side-of-showbiz-(with-reincarnation-and-revenge)',
    parodyTitle: '[Oshi no Ko]: The Dark Side Of Showbiz (With Reincarnation And Revenge)',
    originalMalId: 52034, // [Oshi no Ko]
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Idols, actors, and a whole lot of trauma. This story goes places you wouldn't expect.",
    imageUrl: 'https://placehold.co/300x400.png?text=OshiNoKoDark&font=lora',
    genreTags: ['Drama', 'Mystery', 'Psychological', 'Reincarnation', 'Supernatural', 'Seinen', 'Showbiz'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'call-of-the-night:-vampire-girl-helps-insomniac-boy-find-meaning-(and-blood)',
    parodyTitle: 'Call of the Night: Vampire Girl Helps Insomniac Boy Find Meaning (And Blood)',
    originalMalId: 111233, // Yofukashi no Uta (Manga)
    originalType: 'manga',
    rarity: 'Rare',
    parodyBlurb: "Night walks, deep talks, and the allure of becoming a creature of the night. Very chill, very stylish.",
    imageUrl: 'https://placehold.co/300x400.png?text=CallNightVamp&font=lora',
    genreTags: ['Comedy', 'Romance', 'Shonen', 'Slice of Life', 'Supernatural', 'Vampire'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
  },
  {
    id: 'blue-lock:-soccer-battle-royale-with-egoists',
    parodyTitle: 'Blue Lock: Soccer Battle Royale With Egoists',
    originalMalId: 137822, // Blue Lock (Manga)
    originalType: 'manga',
    rarity: 'Ultra Rare',
    parodyBlurb: "Forget teamwork, it's all about being the best striker in Japan. Survival of the fittest, on the field.",
    imageUrl: 'https://placehold.co/300x400.png?text=BlueLockEgo&font=lora',
    genreTags: ['Action', 'Drama', 'Shonen', 'Sports', 'Survival'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'spy-x-family:-fake-family,-real-feelings-(and-world-peace-is-at-stake)',
    parodyTitle: 'Spy x Family: Fake Family, Real Feelings (And World Peace Is At Stake)',
    originalMalId: 49572, // Spy x Family
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A spy, an assassin, and a telepathic child pretend to be a normal family. Waku waku!",
    imageUrl: 'https://placehold.co/300x400.png?text=SpyFamilyWaku&font=lora',
    genreTags: ['Action', 'Comedy', 'Shonen', 'Slice of Life', 'Childcare'],
    moodTags: ['Heartwarming', 'Hilarious'],
  },
  {
    id: 'heavenly-delusion:-post-apocalyptic-mystery-tour-with-confusing-timelines',
    parodyTitle: 'Heavenly Delusion: Post-Apocalyptic Mystery Tour With Confusing Timelines',
    originalMalId: 51491, // Tengoku Daimakyou
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Two kids search for 'Heaven' in a ruined world, while other kids live in a walled garden. It's connected, probably.",
    imageUrl: 'https://placehold.co/300x400.png?text=HeavenlyDelusion&font=lora',
    genreTags: ['Adventure', 'Mystery', 'Sci-Fi', 'Seinen', 'Psychological'],
    moodTags: ['Dark & Deep', 'Epic Adventure'],
  },
  {
    id: 'bocchi-the-rock!:-socially-anxious-guitar-hero-joins-a-band',
    parodyTitle: 'Bocchi the Rock!: Socially Anxious Guitar Hero Joins A Band',
    originalMalId: 47917, // Bocchi the Rock!
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "She shreds online, but can barely order coffee in real life. Relatable and hilarious. Kita~n!",
    imageUrl: 'https://placehold.co/300x400.png?text=BocchiRockKitaan&font=lora',
    genreTags: ['Comedy', 'Music', 'Slice of Life', 'CGDCT'],
    moodTags: ['Hilarious', 'Heartwarming'],
  },
  {
    id: 'cyberpunk-samurai:-my-katana-has-wi-fi',
    parodyTitle: 'Cyberpunk Samurai: My Katana Has Wi-Fi',
    originalMalId: 42203, // Cyberpunk: Edgerunners
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "He slices through corporations and firewalls with equal ease. Neon lights and existential angst included.",
    imageUrl: 'https://placehold.co/300x400.png?text=CyberSamuraiWiFi&font=lora',
    genreTags: ['Action', 'Sci-Fi', 'Cyberpunk', 'Samurai'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'slime-isekai-s2:-now-with-more-meetings-and-nation-building!',
    parodyTitle: 'Slime Isekai S2: Now With More Meetings and Nation Building!',
    originalMalId: 39551, // Tensei shitara Slime Datta Ken 2nd Season
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Rimuru's back, and this time, it's personal...ly about trade agreements and international diplomacy. Still OP though.",
    imageUrl: 'https://placehold.co/300x400.png?text=SlimeMeetingsS2&font=lora',
    genreTags: ['Isekai', 'Fantasy', 'Action', 'Comedy', 'Nation Building'],
    moodTags: ['Epic Adventure', 'Comfy & Cozy'],
  },
  {
    id: 'cute-girls-doing-cute-things-(but-it-s-actually-about-existentialism)',
    parodyTitle: 'Cute Girls Doing Cute Things (But It’s Actually About Existentialism)',
    originalMalId: 30276, // Shoujo Shuumatsu Ryokou (Girls' Last Tour)
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Two adorable girls wander a post-apocalyptic wasteland. It's surprisingly profound and melancholic.",
    imageUrl: 'https://placehold.co/300x400.png?text=CuteGirlsExistential&font=lora',
    genreTags: ['Adventure', 'Mystery', 'Sci-Fi', 'Slice of Life', 'CGDCT', 'Post-Apocalyptic'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'my-hero-academia:-plus-ultra-crybaby-edition',
    parodyTitle: 'My Hero Academia: Plus Ultra Crybaby Edition',
    originalMalId: 31964, // Boku no Hero Academia
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Deku cries, villains monologue, and everyone screams their special moves. Go beyond!",
    imageUrl: 'https://placehold.co/300x400.png?text=MHACrybaby&font=lora',
    genreTags: ['Action', 'School', 'Shonen', 'Super Power', 'Comedy'],
    moodTags: ['Adrenaline Rush', 'Heartwarming'],
  },
  {
    id: 'jujutsu-kaisen:-curse-punching-high-schoolers-with-great-fashion',
    parodyTitle: 'Jujutsu Kaisen: Curse-Punching High Schoolers With Great Fashion',
    originalMalId: 40748, // Jujutsu Kaisen (TV)
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "It's dark, it's stylish, and Gojo Satoru is everyone's problematic fave. Domain Expansion!",
    imageUrl: 'https://placehold.co/300x400.png?text=JJKFashion&font=lora',
    genreTags: ['Action', 'Supernatural', 'Horror', 'School', 'Shonen', 'Dark Fantasy'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'demon-slayer:-breathing-techniques-make-pretty-water-effects',
    parodyTitle: 'Demon Slayer: Breathing Techniques Make Pretty Water Effects',
    originalMalId: 38000, // Kimetsu no Yaiba
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Tanjiro is too pure for this world. Also, Nezuko is adorable. The animation budget is insane.",
    imageUrl: 'https://placehold.co/300x400.png?text=DSWaterEffects&font=lora',
    genreTags: ['Action', 'Supernatural', 'Historical', 'Demons', 'Shonen', 'Dark Fantasy'],
    moodTags: ['Adrenaline Rush', 'Emotional Rollercoaster'],
  },
  {
    id: 'march-comes-in-like-a-lion-depression-shogi-and-found-family',
    parodyTitle: 'March Comes In Like A Lion: Depression, Shogi, And Found Family',
    originalMalId: 31646, // 3-gatsu no Lion
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "A beautifully animated story about dealing with grief, finding your place, and the intense world of competitive shogi.",
    imageUrl: 'https://placehold.co/300x400.png?text=MarchShogiFamily&font=lora',
    genreTags: ['Drama', 'Game', 'Slice of Life', 'Seinen', 'Psychological'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'mushoku-tensei:-problematic-mc-gets-a-second-chance-(still-kinda-problematic)',
    parodyTitle: 'Mushoku Tensei: Problematic MC Gets A Second Chance (Still Kinda Problematic)',
    originalMalId: 39535, // Mushoku Tensei: Isekai Ittara Honki Dasu
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "High-quality animation, deep world-building, and an MC you'll have very mixed feelings about.",
    imageUrl: 'https://placehold.co/300x400.png?text=MushokuProblematic&font=lora',
    genreTags: ['Adventure', 'Drama', 'Fantasy', 'Isekai', 'Ecchi', 'Harem'],
    moodTags: ['Epic Adventure', 'Dark & Deep'],
  },
  {
    id: 're:zero:-suffering-simulator-with-waifus',
    parodyTitle: 'Re:Zero: Suffering Simulator With Waifus',
    originalMalId: 31240, // Re:Zero kara Hajimeru Isekai Seikatsu
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Subaru dies. A lot. But Rem is best girl. Or is it Emilia? The suffering continues until morale improves.",
    imageUrl: 'https://placehold.co/300x400.png?text=ReZeroWaifus&font=lora',
    genreTags: ['Drama', 'Fantasy', 'Isekai', 'Psychological', 'Suspense', 'Thriller'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'tokyo-revengers:-time-traveling-delinquent-cries-a-lot',
    parodyTitle: 'Tokyo Revengers: Time-Traveling Delinquent Cries A Lot',
    originalMalId: 42249, // Tokyo Revengers
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "He goes back in time to save his girlfriend by... joining a biker gang? And crying. A lot.",
    imageUrl: 'https://placehold.co/300x400.png?text=TokyoRevCries&font=lora',
    genreTags: ['Action', 'Drama', 'School', 'Shonen', 'Supernatural', 'Delinquents', 'Time Travel'],
    moodTags: ['Adrenaline Rush', 'Emotional Rollercoaster'],
  },
  {
    id: 'ancient-magus-bride-s2:-still-magical,-still-slow,-still-beautiful',
    parodyTitle: 'Ancient Magus Bride S2: Still Magical, Still Slow, Still Beautiful',
    originalMalId: 50446, // Mahoutsukai no Yome Season 2
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Chise goes to magic college! More fae, more quiet moments, more Elias being a doting skull husband.",
    imageUrl: 'https://placehold.co/300x400.png?text=MagusBrideS2&font=lora',
    genreTags: ['Drama', 'Fantasy', 'Mythology', 'Romance', 'Slice of Life', 'Supernatural', 'School'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'heaven-officials-blessing:-beautiful-chinese-boys-solve-ghostly-mysteries-(very-gay)',
    parodyTitle: 'Heaven Official’s Blessing: Beautiful Chinese Boys Solve Ghostly Mysteries (Very Gay)',
    originalMalId: 40730, // Tian Guan Ci Fu
    originalType: 'anime', // Donghua
    rarity: 'Ultra Rare',
    parodyBlurb: "A thrice-ascended god and a devoted ghost king. The animation is stunning, the story is captivating.",
    imageUrl: 'https://placehold.co/300x400.png?text=TGCFGay&font=lora',
    genreTags: ['Action', 'Adventure', 'Drama', 'Fantasy', 'Historical', 'Mystery', 'Supernatural', 'BL (Donghua)'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'mo-dao-zu-shi:-necromancer-solves-crimes-with-his-uptight-soulmate-(also-very-gay)',
    parodyTitle: 'Mo Dao Zu Shi: Necromancer Solves Crimes With His Uptight Soulmate (Also Very Gay)',
    originalMalId: 37208, // Mo Dao Zu Shi
    originalType: 'anime', // Donghua
    rarity: 'Legendary',
    parodyBlurb: "Cultivation, zombies, political intrigue, and a love story that spans lifetimes. WangXian is canon.",
    imageUrl: 'https://placehold.co/300x400.png?text=MDZSGay&font=lora',
    genreTags: ['Action', 'Adventure', 'Drama', 'Fantasy', 'Historical', 'Mystery', 'Supernatural', 'BL (Donghua)'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'ranking-of-kings:-tiny-deaf-prince-is-strongest-boy-(will-make-you-cry)',
    parodyTitle: 'Ranking of Kings: Tiny Deaf Prince Is Strongest Boy (Will Make You Cry)',
    originalMalId: 40834, // Ousama Ranking
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Bojji is a treasure. Kage is best friend. This show will break your heart and then mend it with pure wholesomeness.",
    imageUrl: 'https://placehold.co/300x400.png?text=BojjiStrong&font=lora',
    genreTags: ['Adventure', 'Fantasy', 'Drama', 'Action'],
    moodTags: ['Heartwarming', 'Emotional Rollercoaster'],
  },
  {
    id: 'odd-taxi:-talking-animals-in-a-noir-mystery-(it-s-surprisingly-good)',
    parodyTitle: 'Odd Taxi: Talking Animals In A Noir Mystery (It’s Surprisingly Good)',
    originalMalId: 46102, // Odd Taxi
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "A walrus taxi driver gets caught up in a missing girl case. The dialogue is sharp, the plot is tight, and the ending is *chef's kiss*.",
    imageUrl: 'https://placehold.co/300x400.png?text=OddTaxiNoir&font=lora',
    genreTags: ['Mystery', 'Drama', 'Psychological', 'Suspense', 'Anthropomorphic'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'sonny-boy:-drifting-classroom-but-make-it-surreal-and-existential',
    parodyTitle: 'Sonny Boy: Drifting Classroom But Make It Surreal And Existential',
    originalMalId: 48849, // Sonny Boy
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "High school students suddenly find themselves adrift in other dimensions with strange powers. Visually stunning and thought-provoking.",
    imageUrl: 'https://placehold.co/300x400.png?text=SonnyBoyDrift&font=lora',
    genreTags: ['Adventure', 'Mystery', 'Psychological', 'Sci-Fi', 'Supernatural', 'Super Power'],
    moodTags: ['Dark & Deep', 'Surreal'],
  },
  {
    id: 'link-click:-time-traveling-photographers-solve-cases-(and-suffer)',
    parodyTitle: 'Link Click: Time-Traveling Photographers Solve Cases (And Suffer)',
    originalMalId: 44074, // Shiguang Dailiren
    originalType: 'anime', // Donghua
    rarity: 'Ultra Rare',
    parodyBlurb: "They can enter photos to relive moments, but changing the past has consequences. Prepare for feels and suspense.",
    imageUrl: 'https://placehold.co/300x400.png?text=LinkClickTime&font=lora',
    genreTags: ['Drama', 'Mystery', 'Supernatural', 'Suspense', 'Time Travel'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'toilets,-ghosts,-and-romance:-hanako-kun',
    parodyTitle: 'Toilets, Ghosts, And Romance: Hanako-kun',
    originalMalId: 39734, // Jibaku Shounen Hanako-kun
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "She summons a bathroom ghost to grant her wish for love, gets stuck cleaning toilets instead. Cute art, spooky vibes.",
    imageUrl: 'https://placehold.co/300x400.png?text=HanakoToilet&font=lora',
    genreTags: ['Comedy', 'School', 'Shonen', 'Supernatural', 'Romance'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
  },
  {
    id: 'the-promised-neverland-s1:-smart-kids-escape-a-demon-farm-(s2-doesn-t-exist)',
    parodyTitle: 'The Promised Neverland S1: Smart Kids Escape A Demon Farm (S2 Doesn’t Exist)',
    originalMalId: 37779, // Yakusoku no Neverland
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "A thrilling psychological horror about orphans outsmarting their captors. Season 1 is a masterpiece. We don't talk about Season 2.",
    imageUrl: 'https://placehold.co/300x400.png?text=TPNS1&font=lora',
    genreTags: ['Mystery', 'Psychological', 'Sci-Fi', 'Shonen', 'Suspense', 'Thriller', 'Horror'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'dr.-stone:-science-will-save-the-world-(after-everyone-turns-to-stone)',
    parodyTitle: 'Dr. Stone: Science Will Save The World (After Everyone Turns To Stone)',
    originalMalId: 38691, // Dr. Stone
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Senku rebuilds civilization from scratch with the power of 10 billion percent knowledge. Get excited!",
    imageUrl: 'https://placehold.co/300x400.png?text=DrStoneScience&font=lora',
    genreTags: ['Adventure', 'Comedy', 'Sci-Fi', 'Shonen', 'Educational', 'Post-Apocalyptic'],
    moodTags: ['Epic Adventure', 'Adrenaline Rush'],
  },
  {
    id: 'fire-force:-firefighters-with-fire-powers-fight-fire-demons-(latom)',
    parodyTitle: 'Fire Force: Firefighters With Fire Powers Fight Fire Demons (Látom)',
    originalMalId: 38671, // Enen no Shouboutai
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Cool character designs, flashy fire animation, and a plot that gets surprisingly complicated. Tamaki's Lucky Lecher Lure!",
    imageUrl: 'https://placehold.co/300x400.png?text=FireForceLatom&font=lora',
    genreTags: ['Action', 'Sci-Fi', 'Shonen', 'Supernatural', 'Ecchi'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'that-time-i-got-reincarnated-as-a-slime-movie:-scarlet-bond-(more-rimuru,-more-fun)',
    parodyTitle: 'That Time I Got Reincarnated as a Slime Movie: Scarlet Bond (More Rimuru, More Fun)',
    originalMalId: 49873, // Tensei shitara Slime Datta Ken Movie: Guren no Kizuna-hen
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Rimuru and friends go on a side quest! Expect cool fights, heartwarming moments, and nation-building on the go.",
    imageUrl: 'https://placehold.co/300x400.png?text=SlimeMovieScarlet&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Fantasy', 'Isekai'],
    moodTags: ['Epic Adventure', 'Heartwarming'],
  },
  {
    id: 'the-apothecary-diaries:-girl-detective-solves-mysteries-in-ancient-china-(with-poison-knowledge)',
    parodyTitle: 'The Apothecary Diaries: Girl Detective Solves Mysteries In Ancient China (With Poison Knowledge)',
    originalMalId: 54492, // Kusuriya no Hitorigoto
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Maomao just wants to test poisons, but keeps getting dragged into imperial court drama. She's not amused.",
    imageUrl: 'https://placehold.co/300x400.png?text=ApothecaryPoison&font=lora',
    genreTags: ['Drama', 'Historical', 'Mystery', 'Romance', 'Medical', 'Seinen'],
    moodTags: ['Dark & Deep', 'Intriguing'],
  },
  {
    id: 'frieren:-beyond-journey-s-end-(elf-outlives-everyone,-learns-to-feel)',
    parodyTitle: 'Frieren: Beyond Journey’s End (Elf Outlives Everyone, Learns To Feel)',
    originalMalId: 52991, // Sousou no Frieren
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "A quiet, melancholic journey about time, loss, and the importance of making memories. Peak fantasy.",
    imageUrl: 'https://placehold.co/300x400.png?text=FrierenFeels&font=lora',
    genreTags: ['Adventure', 'Drama', 'Fantasy', 'Shonen', 'Slice of Life'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'undead-unluck:-cursed-duo-fights-god-with-bad-luck-and-immortality',
    parodyTitle: 'Undead Unluck: Cursed Duo Fights God With Bad Luck And Immortality',
    originalMalId: 52741, // Undead Unluck
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "She brings misfortune, he can't die. Together, they're an unstoppable (and chaotic) force against a cosmic rulebook.",
    imageUrl: 'https://placehold.co/300x400.png?text=UndeadUnluckChaos&font=lora',
    genreTags: ['Action', 'Comedy', 'Fantasy', 'Shonen', 'Supernatural', 'Super Power'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
  },
  {
    id: 'solo-leveling:-weakest-hunter-becomes-strongest-(with-a-video-game-system)',
    parodyTitle: 'Solo Leveling: Weakest Hunter Becomes Strongest (With A Video Game System)',
    originalMalId: 121496, // Na Honjaman Level Up (Manhwa)
    originalType: 'manga',
    rarity: 'Legendary',
    parodyBlurb: "Arise! Sung Jinwoo grinds his way to the top, one shadow soldier at a time. Pure power fantasy.",
    imageUrl: 'https://placehold.co/300x400.png?text=SoloLevelingArise&font=lora',
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Super Power', 'Webtoon'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'the-eminence-in-shadow:-mc-larps-as-a-shadow-mastermind-(and-it-s-all-real)',
    parodyTitle: 'The Eminence in Shadow: MC LARPs As A Shadow Mastermind (And It’s All Real)',
    originalMalId: 48316, // Kage no Jitsuryokusha ni Naritakute!
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Cid just wants to be the cool, mysterious puppet master. He has no idea his chuuni fantasies are actually happening.",
    imageUrl: 'https://placehold.co/300x400.png?text=EminenceLARP&font=lora',
    genreTags: ['Action', 'Comedy', 'Fantasy', 'Isekai', 'School', 'Harem'],
    moodTags: ['Hilarious', 'Adrenaline Rush'],
  },
  {
    id: 'mushoku-tensei-s2:-rudeus-deals-with-trauma-(and-more-isekai-adventures)',
    parodyTitle: 'Mushoku Tensei S2: Rudeus Deals With Trauma (And More Isekai Adventures)',
    originalMalId: 51179, // Mushoku Tensei II: Isekai Ittara Honki Dasu
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "The journey continues, with more character development, world-building, and Rudeus being Rudeus.",
    imageUrl: 'https://placehold.co/300x400.png?text=MushokuS2Trauma&font=lora',
    genreTags: ['Adventure', 'Drama', 'Ecchi', 'Fantasy', 'Isekai', 'Romance'],
    moodTags: ['Epic Adventure', 'Emotional Rollercoaster'],
  },
  {
    id: 'zom-100:-bucket-list-of-the-dead-(zombie-apocalypse-is-actually-liberating)',
    parodyTitle: 'Zom 100: Bucket List of the Dead (Zombie Apocalypse Is Actually Liberating)',
    originalMalId: 54112, // Zom 100: Zombie ni Naru made ni Shitai 100 no Koto
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "His soul-crushing job was worse than zombies. Now he's finally free to live his best (undead) life!",
    imageUrl: 'https://placehold.co/300x400.png?text=Zom100Bucket&font=lora',
    genreTags: ['Action', 'Comedy', 'Horror', 'Shonen', 'Survival', 'Post-Apocalyptic'],
    moodTags: ['Hilarious', 'Adrenaline Rush'],
  },
  {
    id: 'bleach:-thousand-year-blood-war-(bankai!-the-animation)',
    parodyTitle: 'Bleach: Thousand-Year Blood War (BANKAI! - The Animation)',
    originalMalId: 41467, // Bleach: Sennen Kessen-hen
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "The final arc, finally animated! Expect epic fights, returning characters, and lots of Bankai reveals.",
    imageUrl: 'https://placehold.co/300x400.png?text=BleachTYBWBankai&font=lora',
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Shonen', 'Super Power', 'Supernatural'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'hell-s-paradise:-ninja-death-game-on-a-psychedelic-island',
    parodyTitle: 'Hell’s Paradise: Ninja Death Game On A Psychedelic Island',
    originalMalId: 46569, // Jigokuraku
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Convicts and their executioners search for the elixir of life. It's beautiful, brutal, and full of flower monsters.",
    imageUrl: 'https://placehold.co/300x400.png?text=HellsParadiseFlower&font=lora',
    genreTags: ['Action', 'Adventure', 'Drama', 'Fantasy', 'Historical', 'Horror', 'Shonen', 'Supernatural'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'my-happy-marriage:-arranged-marriage-with-a-cold-duke-(turns-out-he-s-not-so-bad)',
    parodyTitle: 'My Happy Marriage: Arranged Marriage With A Cold Duke (Turns Out He’s Not So Bad)',
    originalMalId: 51916, // Watashi no Shiawase na Kekkon
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Cinderella story with a supernatural twist. She's abused, he's rumored to be cruel, but they find happiness. Eventually.",
    imageUrl: 'https://placehold.co/300x400.png?text=HappyMarriageDuke&font=lora',
    genreTags: ['Drama', 'Fantasy', 'Historical', 'Romance', 'Supernatural', 'Shoujo (implied)'],
    moodTags: ['Heartwarming', 'Emotional Rollercoaster'],
  },
  {
    id: 'horimiya:-high-school-romance-that-actually-progresses',
    parodyTitle: 'Horimiya: High School Romance That Actually Progresses',
    originalMalId: 42897, // Horimiya
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Two students with secret identities outside of school fall in love. It's cute, funny, and surprisingly realistic.",
    imageUrl: 'https://placehold.co/300x400.png?text=HorimiyaProgress&font=lora',
    genreTags: ['Comedy', 'Romance', 'School', 'Shonen', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'the-quintessential-quintuplets:-mc-tutors-five-identical-dumb-sisters-(one-will-be-the-bride)',
    parodyTitle: 'The Quintessential Quintuplets: MC Tutors Five Identical Dumb Sisters (One Will Be The Bride)',
    originalMalId: 38101, // 5-toubun no Hanayome
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "It's a harem, but with a mystery: Who does he marry? Place your bets now! All girls are best girl.",
    imageUrl: 'https://placehold.co/300x400.png?text=QuintupletsBride&font=lora',
    genreTags: ['Comedy', 'Harem', 'Romance', 'School', 'Shonen', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Hilarious'],
  },
  {
    id: 'rent-a-girlfriend:-mc-is-down-bad-(painfully-relatable-or-just-painful?)',
    parodyTitle: 'Rent-a-Girlfriend: MC Is Down Bad (Painfully Relatable Or Just Painful?)',
    originalMalId: 40839, // Kanojo, Okarishimasu
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Kazuya makes questionable decisions. Chizuru is a goddess. The cringe is real, but you can't look away.",
    imageUrl: 'https://placehold.co/300x400.png?text=RentAGirlfriendCringe&font=lora',
    genreTags: ['Comedy', 'Drama', 'Romance', 'School', 'Shonen', 'Harem'],
    moodTags: ['Emotional Rollercoaster', 'Cringe Comedy'],
  },
  {
    id: 'wolfs-rain:-sad-wolves-search-for-paradise-(in-a-dying-world)',
    parodyTitle: 'Wolfs Rain: Sad Wolves Search For Paradise (In A Dying World)',
    originalMalId: 202, // Wolf's Rain
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "A melancholic journey with beautiful animation, a haunting soundtrack, and a lot of wolf angst.",
    imageUrl: 'https://placehold.co/300x400.png?text=WolfsRainParadise&font=lora',
    genreTags: ['Action', 'Adventure', 'Drama', 'Fantasy', 'Mystery', 'Sci-Fi', 'Supernatural'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'ergo-proxy:-existential-cyberpunk-mystery-(prepare-to-be-confused,-in-a-good-way)',
    parodyTitle: 'Ergo Proxy: Existential Cyberpunk Mystery (Prepare To Be Confused, In A Good Way)',
    originalMalId: 790, // Ergo Proxy
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "In a domed city, a detective investigates a series of murders linked to auto-reivs (androids). It's deep, dark, and stylish.",
    imageUrl: 'https://placehold.co/300x400.png?text=ErgoProxyConfused&font=lora',
    genreTags: ['Mystery', 'Psychological', 'Sci-Fi', 'Suspense', 'Cyberpunk'],
    moodTags: ['Dark & Deep', 'Intriguing'],
  },
  {
    id: 'texhnolyze:-brutal,-nihilistic-cyberpunk-(not-for-the-faint-of-heart)',
    parodyTitle: 'Texhnolyze: Brutal, Nihilistic Cyberpunk (Not For The Faint Of Heart)',
    originalMalId: 26, // Texhnolyze
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "An underground city, prosthetic limbs, and a whole lot of despair. It's art, but it's also incredibly bleak.",
    imageUrl: 'https://placehold.co/300x400.png?text=TexhnolyzeBleak&font=lora',
    genreTags: ['Action', 'Avant Garde', 'Drama', 'Psychological', 'Sci-Fi', 'Suspense', 'Cyberpunk'],
    moodTags: ['Dark & Deep', 'Existential'],
  },
  {
    id: 'serial-experiments-lain:-the-internet-is-scary-(and-also-god?)',
    parodyTitle: 'Serial Experiments Lain: The Internet Is Scary (And Also God?)',
    originalMalId: 339, // Serial Experiments Lain
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Let's all love Lain. A mind-bending exploration of identity, communication, and the nature of reality in the digital age.",
    imageUrl: 'https://placehold.co/300x400.png?text=LainInternet&font=lora',
    genreTags: ['Avant Garde', 'Dementia', 'Drama', 'Mystery', 'Psychological', 'Sci-Fi', 'Supernatural', 'Suspense'],
    moodTags: ['Dark & Deep', 'Surreal'],
  },
  {
    id: 'perfect-blue:-pop-idol-loses-her-mind-(masterpiece-of-psychological-horror)',
    parodyTitle: 'Perfect Blue: Pop Idol Loses Her Mind (Masterpiece Of Psychological Horror)',
    originalMalId: 437, // Perfect Blue
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "The dark side of fame and obsession. Satoshi Kon's genius will mess with your head.",
    imageUrl: 'https://placehold.co/300x400.png?text=PerfectBlueMind&font=lora',
    genreTags: ['Avant Garde', 'Dementia', 'Drama', 'Horror', 'Mystery', 'Psychological', 'Suspense'],
    moodTags: ['Dark & Deep', 'Thriller'],
  },
  {
    id: 'paprika:-dream-detective-navigates-surreal-mindscapes-(more-satoshi-kon-genius)',
    parodyTitle: 'Paprika: Dream Detective Navigates Surreal Mindscapes (More Satoshi Kon Genius)',
    originalMalId: 1943, // Paprika
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "What if dreams could be hacked? A visually stunning and imaginative journey into the subconscious.",
    imageUrl: 'https://placehold.co/300x400.png?text=PaprikaDreams&font=lora',
    genreTags: ['Avant Garde', 'Fantasy', 'Horror', 'Mystery', 'Psychological', 'Sci-Fi', 'Suspense', 'Thriller'],
    moodTags: ['Surreal', 'Intriguing'],
  },
  {
    id: 'paranoia-agent:-a-kid-with-a-golden-bat-is-terrorizing-tokyo-(or-is-he?)',
    parodyTitle: 'Paranoia Agent: A Kid With A Golden Bat Is Terrorizing Tokyo (Or Is He?)',
    originalMalId: 323, // Mousou Dairinin
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Social anxieties manifest as a mysterious attacker. Another mind-bending series from Satoshi Kon.",
    imageUrl: 'https://placehold.co/300x400.png?text=ParanoiaBat&font=lora',
    genreTags: ['Avant Garde', 'Drama', 'Mystery', 'Police', 'Psychological', 'Supernatural', 'Suspense', 'Thriller'],
    moodTags: ['Dark & Deep', 'Surreal'],
  },
  {
    id: 'shinsekai-yori:-kids-with-psychic-powers-in-a-dystopian-future-(it-gets-dark)',
    parodyTitle: 'Shinsekai Yori: Kids With Psychic Powers In A Dystopian Future (It Gets Dark)',
    originalMalId: 13125, // Shinsekai yori
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "A thousand years in the future, humanity has psychic powers, but society is built on dark secrets. Masterful world-building.",
    imageUrl: 'https://placehold.co/300x400.png?text=ShinsekaiDark&font=lora',
    genreTags: ['Drama', 'Horror', 'Mystery', 'Psychological', 'Sci-Fi', 'Supernatural', 'Suspense'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'psycho-pass:-your-crime-coefficient-is-too-high,-prepare-for-dominator',
    parodyTitle: 'Psycho-Pass: Your Crime Coefficient Is Too High, Prepare For Dominator',
    originalMalId: 13601, // Psycho-Pass
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "In a future where your mental state determines your criminality, justice is swift and often messy.",
    imageUrl: 'https://placehold.co/300x400.png?text=PsychoPassDominator&font=lora',
    genreTags: ['Action', 'Police', 'Psychological', 'Sci-Fi', 'Suspense', 'Thriller'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'steins;gate-0:-more-suffering,-different-timeline,-same-sad-okabe',
    parodyTitle: 'Steins;Gate 0: More Suffering, Different Timeline, Same Sad Okabe',
    originalMalId: 30484, // Steins;Gate 0
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "What if Okabe couldn't save her? This is that timeline. Prepare for even more emotional devastation. El Psy Kongroo...?",
    imageUrl: 'https://placehold.co/300x400.png?text=SteinsGate0Sad&font=lora',
    genreTags: ['Drama', 'Sci-Fi', 'Suspense', 'Thriller', 'Psychological', 'Time Travel'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'elfen-lied:-cute-girl-with-horns-murders-everyone-(with-invisible-hands)',
    parodyTitle: 'Elfen Lied: Cute Girl With Horns Murders Everyone (With Invisible Hands)',
    originalMalId: 226, // Elfen Lied
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Gore, nudity, trauma, and a surprisingly touching (if messed up) story. Not for the faint of heart.",
    imageUrl: 'https://placehold.co/300x400.png?text=ElfenLiedGore&font=lora',
    genreTags: ['Action', 'Drama', 'Ecchi', 'Horror', 'Psychological', 'Romance', 'Supernatural', 'Gore', 'Seinen'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'higurashi:-cute-kids-in-a-time-loop-of-murder-and-madness',
    parodyTitle: 'Higurashi: Cute Kids In A Time Loop Of Murder And Madness',
    originalMalId: 934, // Higurashi no Naku Koro ni
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Don't trust anyone. Especially not the cute girls. This village has issues. Lots of issues.",
    imageUrl: 'https://placehold.co/300x400.png?text=HigurashiMadness&font=lora',
    genreTags: ['Horror', 'Mystery', 'Psychological', 'Supernatural', 'Suspense', 'Thriller', 'Dementia'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'shiki:-vampires-terrorize-a-remote-village-(slow-burn-horror)',
    parodyTitle: 'Shiki: Vampires Terrorize A Remote Village (Slow Burn Horror)',
    originalMalId: 7724, // Shiki
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "A chilling and atmospheric horror series that explores paranoia and what it means to be a monster.",
    imageUrl: 'https://placehold.co/300x400.png?text=ShikiVampires&font=lora',
    genreTags: ['Horror', 'Mystery', 'Supernatural', 'Suspense', 'Thriller', 'Vampire'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'another:-cursed-class-and-creative-deaths',
    parodyTitle: 'Another: Cursed Class And Creative Deaths',
    originalMalId: 11111, // Another
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "There's an extra student, and people start dying in increasingly elaborate ways. Final Destination: Anime Edition.",
    imageUrl: 'https://placehold.co/300x400.png?text=AnotherDeaths&font=lora',
    genreTags: ['Horror', 'Mystery', 'School', 'Supernatural', 'Suspense', 'Thriller'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'happy-sugar-life:-yandere-girl-protects-her-loli-love-(it-s-very-messed-up)',
    parodyTitle: 'Happy Sugar Life: Yandere Girl Protects Her Loli Love (It’s Very Messed Up)',
    originalMalId: 37204, // Happy Sugar Life
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "This is what love is, right? Kidnapping, murder, and psychological manipulation. Definitely not a happy show.",
    imageUrl: 'https://placehold.co/300x400.png?text=HappySugarYandere&font=lora',
    genreTags: ['Drama', 'Horror', 'Psychological', 'Shonen', 'Yuri (distorted)'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'future-diary:-death-game-with-cell-phones-(yuno-is-best/worst-girl)',
    parodyTitle: 'Future Diary: Death Game With Cell Phones (Yuno Is Best/Worst Girl)',
    originalMalId: 10620, // Mirai Nikki (TV)
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Twelve diary holders fight to become God. Yukiteru is useless, but Yuno Gasai is iconic for a reason.",
    imageUrl: 'https://placehold.co/300x400.png?text=FutureDiaryYuno&font=lora',
    genreTags: ['Action', 'Mystery', 'Psychological', 'Shonen', 'Supernatural', 'Suspense', 'Thriller', 'Gore', 'Survival'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'deadman-wonderland:-wrongfully-convicted-teen-fights-in-a-prison-death-circus',
    parodyTitle: 'Deadman Wonderland: Wrongfully Convicted Teen Fights In A Prison Death Circus',
    originalMalId: 6880, // Deadman Wonderland
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Blood powers, crazy inmates, and a conspiracy. The anime ended too soon, read the manga.",
    imageUrl: 'https://placehold.co/300x400.png?text=DeadmanCircus&font=lora',
    genreTags: ['Action', 'Horror', 'Sci-Fi', 'Shonen', 'Super Power', 'Gore', 'Survival'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'blood-c:-cute-shrine-maiden-by-day,-brutal-monster-slayer-by-night-(so-much-blood)',
    parodyTitle: 'Blood-C: Cute Shrine Maiden By Day, Brutal Monster Slayer By Night (So Much Blood)',
    originalMalId: 10490, // Blood-C
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "It starts off slow, then BAM! Blood, guts, and a very memorable final episode. Coffee and guimauve.",
    imageUrl: 'https://placehold.co/300x400.png?text=BloodCGuts&font=lora',
    genreTags: ['Action', 'Horror', 'School', 'Supernatural', 'Vampire', 'Gore'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'corpse-party:-kids-get-trapped-in-a-haunted-school-(everyone-suffers-and-dies-horribly)',
    parodyTitle: 'Corpse Party: Kids Get Trapped In A Haunted School (Everyone Suffers And Dies Horribly)',
    originalMalId: 15037, // Corpse Party: Tortured Souls
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Don't perform weird rituals. Just don't. This OVA is a masterclass in gore and despair.",
    imageUrl: 'https://placehold.co/300x400.png?text=CorpsePartySuffers&font=lora',
    genreTags: ['Horror', 'Mystery', 'Supernatural', 'Gore', 'School'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'puella-magi-madoka-magica-the-movie-part-3:-rebellion-(homura-did-nothing-wrong...-right?)',
    parodyTitle: 'Puella Magi Madoka Magica The Movie Part 3: Rebellion (Homura Did Nothing Wrong... Right?)',
    originalMalId: 11981, // Mahou Shoujo Madoka★Magica Movie 3: Hangyaku no Monogatari
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Just when you thought it was over, Homura takes 'for the sake of Madoka' to a whole new, reality-bending level.",
    imageUrl: 'https://placehold.co/300x400.png?text=HomuraRebellion&font=lora',
    genreTags: ['Drama', 'Mahou Shoujo', 'Psychological', 'Suspense', 'Thriller'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'the-end-of-evangelion:-congratulations!-(everyone-turns-into-tang)',
    parodyTitle: 'The End of Evangelion: Congratulations! (Everyone Turns Into Tang)',
    originalMalId: 32, // Neon Genesis Evangelion: The End of Evangelion
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "The original ending wasn't confusing enough, so here's a movie to make you question reality even more. Tumbling down.",
    imageUrl: 'https://placehold.co/300x400.png?text=EoETang&font=lora',
    genreTags: ['Action', 'Avant Garde', 'Dementia', 'Drama', 'Mecha', 'Psychological', 'Sci-Fi', 'Suspense'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'pokemon:-the-first-movie-(mewtwo-is-an-edgelord,-ash-dies-but-gets-better)',
    parodyTitle: 'Pokémon: The First Movie (Mewtwo Is An Edgelord, Ash Dies But Gets Better)',
    originalMalId: 527, // Pokemon Movie 01: Mewtwo no Gyakushuu
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Genetically engineered super-Pokémon has an existential crisis. Also, Pikachu crying can heal fatal wounds.",
    imageUrl: 'https://placehold.co/300x400.png?text=MewtwoEdgelord&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Kids', 'Sci-Fi'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'digimon-adventure:-our-war-game!-(internet-is-saved-by-kids-and-their-digital-monsters)',
    parodyTitle: 'Digimon Adventure: Our War Game! (Internet Is Saved By Kids And Their Digital Monsters)',
    originalMalId: 2397, // Digimon Adventure: Bokura no War Game!
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Before Summer Wars, there was this. A surprisingly tense and stylish movie about a Y2K-era internet virus.",
    imageUrl: 'https://placehold.co/300x400.png?text=DigimonWarGame&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Kids', 'Sci-Fi'],
    moodTags: ['Adrenaline Rush', 'Heartwarming'],
  },
  {
    id: 'spirited-away:-girl-works-at-a-bathhouse-for-gods-(and-it-s-beautiful)',
    parodyTitle: 'Spirited Away: Girl Works At A Bathhouse For Gods (And It’s Beautiful)',
    originalMalId: 199, // Sen to Chihiro no Kamikakushi
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "A visual masterpiece about courage, identity, and the magic of the spirit world. Studio Ghibli at its finest.",
    imageUrl: 'https://placehold.co/300x400.png?text=SpiritedAwayBathhouse&font=lora',
    genreTags: ['Adventure', 'Award Winning', 'Drama', 'Fantasy', 'Supernatural', 'Mythology'],
    moodTags: ['Heartwarming', 'Epic Adventure'],
  },
  {
    id: 'princess-mononoke:-environmentalism,-but-with-gods-and-cursed-boars',
    parodyTitle: 'Princess Mononoke: Environmentalism, But With Gods And Cursed Boars',
    originalMalId: 164, // Mononoke Hime
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Humans vs. nature, with a lot of blood, cool spirits, and a strong female lead. Another Ghibli classic.",
    imageUrl: 'https://placehold.co/300x400.png?text=MononokeBoars&font=lora',
    genreTags: ['Action', 'Adventure', 'Award Winning', 'Drama', 'Fantasy', 'Historical'],
    moodTags: ['Epic Adventure', 'Dark & Deep'],
  },
  {
    id: 'howl-s-moving-castle:-girl-gets-cursed,-moves-in-with-a-pretty-wizard-(and-a-fire-demon)',
    parodyTitle: 'Howl’s Moving Castle: Girl Gets Cursed, Moves In With A Pretty Wizard (And A Fire Demon)',
    originalMalId: 431, // Howl no Ugoku Shiro
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "A charming and whimsical anti-war story with a magical moving castle and a very handsome wizard. Ghibli magic.",
    imageUrl: 'https://placehold.co/300x400.png?text=HowlCastleWizard&font=lora',
    genreTags: ['Adventure', 'Award Winning', 'Drama', 'Fantasy', 'Romance'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'my-neighbor-totoro:-kids-befriend-giant-fluffy-forest-spirits-(pure-childhood-wonder)',
    parodyTitle: 'My Neighbor Totoro: Kids Befriend Giant Fluffy Forest Spirits (Pure Childhood Wonder)',
    originalMalId: 523, // Tonari no Totoro
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "The ultimate feel-good movie. Whimsical, heartwarming, and featuring the iconic Catbus.",
    imageUrl: 'https://placehold.co/300x400.png?text=TotoroFluffy&font=lora',
    genreTags: ['Adventure', 'Award Winning', 'Comedy', 'Fantasy', 'Kids', 'Slice of Life', 'Supernatural'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'kiki-s-delivery-service:-young-witch-starts-a-delivery-business-(and-deals-with-burnout)',
    parodyTitle: 'Kiki’s Delivery Service: Young Witch Starts A Delivery Business (And Deals With Burnout)',
    originalMalId: 512, // Majo no Takkyuubin
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A charming coming-of-age story about independence, creativity, and finding your place in the world.",
    imageUrl: 'https://placehold.co/300x400.png?text=KikiDeliveryBurnout&font=lora',
    genreTags: ['Adventure', 'Comedy', 'Drama', 'Fantasy', 'Kids', 'Romance', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'grave-of-the-fireflies:-you-will-cry.-that-s-it,-that-s-the-description.',
    parodyTitle: 'Grave of the Fireflies: You Will Cry. That’s It, That’s The Description.',
    originalMalId: 578, // Hotaru no Haka
    originalType: 'anime',
    rarity: 'Mythic', // For its emotional impact
    parodyBlurb: "A beautiful and devastating anti-war film. Prepare for uncontrollable sobbing. Do not watch if you want to be happy.",
    imageUrl: 'https://placehold.co/300x400.png?text=GraveFirefliesCry&font=lora',
    genreTags: ['Drama', 'Historical', 'Tragedy', 'War'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'akira:-motorcycle-gangs,-psychic-powers,-and-neo-tokyo-is-about-to-explode',
    parodyTitle: 'Akira: Motorcycle Gangs, Psychic Powers, And Neo-Tokyo Is About To Explode',
    originalMalId: 47, // Akira
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "TETSUOOOOO! KANEDAAAAA! A landmark of cyberpunk animation with stunning visuals and a complex story.",
    imageUrl: 'https://placehold.co/300x400.png?text=AkiraTetsuo&font=lora',
    genreTags: ['Action', 'Adventure', 'Horror', 'Military', 'Mystery', 'Psychological', 'Sci-Fi', 'Supernatural', 'Suspense', 'Thriller'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'ninja-scroll:-badass-wandering-samurai-fights-demons-(very-violent,-very-cool)',
    parodyTitle: 'Ninja Scroll: Badass Wandering Samurai Fights Demons (Very Violent, Very Cool)',
    originalMalId: 617, // Juubee Ninpuuchou
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Jubei Kibagami is a legend. Brutal action, memorable villains, and a classic of 90s anime.",
    imageUrl: 'https://placehold.co/300x400.png?text=NinjaScrollJubei&font=lora',
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Historical', 'Horror', 'Romance', 'Samurai', 'Supernatural', 'Demons'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'vampire-hunter-d:-bloodlust-(dhampir-hunts-vampires,-looks-fabulous-doing-it)',
    parodyTitle: 'Vampire Hunter D: Bloodlust (Dhampir Hunts Vampires, Looks Fabulous Doing It)',
    originalMalId: 543, // Vampire Hunter D (2000)
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Gothic horror, stunning animation, and a stoic half-vampire hero. Based on the legendary novels.",
    imageUrl: 'https://placehold.co/300x400.png?text=VampHunterDBloodlust&font=lora',
    genreTags: ['Action', 'Adventure', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Supernatural', 'Vampire'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'sword-of-the-stranger:-the-best-samurai-fight-you-ve-ever-seen',
    parodyTitle: 'Sword of the Stranger: The Best Samurai Fight You’ve Ever Seen',
    originalMalId: 2418, // Stranger: Mukou Hadan
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "A nameless ronin protects a young boy. The plot is simple, but the animation and fight choreography are god-tier.",
    imageUrl: 'https://placehold.co/300x400.png?text=SwordStrangerFight&font=lora',
    genreTags: ['Action', 'Adventure', 'Historical', 'Samurai', 'Award Winning'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'the-girl-who-leapt-through-time:-girl-discovers-time-travel,-uses-it-for-trivial-things-(mostly)',
    parodyTitle: 'The Girl Who Leapt Through Time: Girl Discovers Time Travel, Uses It For Trivial Things (Mostly)',
    originalMalId: 2236, // Toki wo Kakeru Shoujo
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A charming and bittersweet story about youth, choices, and the consequences of messing with time.",
    imageUrl: 'https://placehold.co/300x400.png?text=TimeLeapGirl&font=lora',
    genreTags: ['Adventure', 'Drama', 'Romance', 'Sci-Fi', 'Time Travel'],
    moodTags: ['Heartwarming', 'Emotional Rollercoaster'],
  },
  {
    id: 'summer-wars:-grandma-s-connections-save-the-world-from-rogue-ai',
    parodyTitle: 'Summer Wars: Grandma’s Connections Save The World From Rogue AI',
    originalMalId: 5681, // Summer Wars
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "A math genius, a fake engagement, and a virtual world on the brink of collapse. Family and Hanafuda save the day.",
    imageUrl: 'https://placehold.co/300x400.png?text=SummerWarsGrandma&font=lora',
    genreTags: ['Action', 'Award Winning', 'Comedy', 'Family', 'Sci-Fi', 'Suspense', 'Thriller'],
    moodTags: ['Heartwarming', 'Adrenaline Rush'],
  },
  {
    id: 'a-place-further-than-the-universe:-high-school-girls-go-to-antarctica-(it-s-very-inspiring)',
    parodyTitle: 'A Place Further Than the Universe: High School Girls Go To Antarctica (It’s Very Inspiring)',
    originalMalId: 35839, // Sora yori mo Tooi Basho
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Four girls chase an impossible dream. A beautiful story about friendship, adventure, and a mother's love.",
    imageUrl: 'https://placehold.co/300x400.png?text=UniverseAntarctica&font=lora',
    genreTags: ['Adventure', 'Comedy', 'Drama', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Emotional Rollercoaster'],
  },
  {
    id: 'laid-back-camp:-cute-girls-go-camping-(maximum-comfiness-achieved)',
    parodyTitle: 'Laid-Back Camp: Cute Girls Go Camping (Maximum Comfiness Achieved)',
    originalMalId: 34798, // Yuru Camp△
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "The ultimate comfy anime. Beautiful scenery, delicious camp food, and cozy vibes. Secret Society BLANKET.",
    imageUrl: 'https://placehold.co/300x400.png?text=YuruCampComfy&font=lora',
    genreTags: ['Comedy', 'Slice of Life', 'CGDCT', 'Iyashikei'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
  },
  {
    id: 'non-non-biyori:-countryside-slice-of-life-(nyanpasu!)',
    parodyTitle: 'Non Non Biyori: Countryside Slice-of-Life (Nyanpasu!)',
    originalMalId: 17549, // Non Non Biyori
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Four girls live in a tiny rural village where nothing much happens, and it's absolutely delightful. Renge is a treasure.",
    imageUrl: 'https://placehold.co/300x400.png?text=NyanpasuBiyori&font=lora',
    genreTags: ['Comedy', 'School', 'Seinen', 'Slice of Life', 'Iyashikei', 'CGDCT'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
  },
  {
    id: 'flying-witch:-chill-witch-moves-to-the-countryside-(more-comfiness)',
    parodyTitle: 'Flying Witch: Chill Witch Moves To The Countryside (More Comfiness)',
    originalMalId: 31376, // Flying Witch
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "A young witch learns about everyday magic and rural life. Very relaxing and charming.",
    imageUrl: 'https://placehold.co/300x400.png?text=FlyingWitchChill&font=lora',
    genreTags: ['Comedy', 'Shonen', 'Slice of Life', 'Supernatural', 'Iyashikei'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
  },
  {
    id: 'aria-the-animation:-gondola-girls-on-mars-(maximum-healing-power)',
    parodyTitle: 'Aria The Animation: Gondola Girls On Mars (Maximum Healing Power)',
    originalMalId: 477, // Aria The Animation
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Set in Neo-Venezia on a terraformed Mars, this series is the epitome of iyashikei. It will heal your soul.",
    imageUrl: 'https://placehold.co/300x400.png?text=AriaMarsHealing&font=lora',
    genreTags: ['Fantasy', 'Sci-Fi', 'Shounen', 'Slice of Life', 'Iyashikei'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
  },
  {
    id: 'land-of-the-lustrous:-pretty-gem-people-suffer-beautifully',
    parodyTitle: 'Land of the Lustrous: Pretty Gem People Suffer Beautifully',
    originalMalId: 35557, // Houseki no Kuni (TV)
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Gems fight moon people. The CGI is stunning, the story is intriguing, and the suffering is existential.",
    imageUrl: 'https://placehold.co/300x400.png?text=LustrousGems&font=lora',
    genreTags: ['Action', 'Drama', 'Fantasy', 'Mystery', 'Psychological', 'Seinen'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'girls-last-tour:-two-girls-and-a-kettenkrad-in-a-post-apocalyptic-world-(bittersweet-comfiness)',
    parodyTitle: 'Girls Last Tour: Two Girls And A Kettenkrad In A Post-Apocalyptic World (Bittersweet Comfiness)',
    originalMalId: 35838, // Shoujo Shuumatsu Ryokou
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Chito and Yuuri search for hope in a desolate world. It's surprisingly cozy and deeply philosophical.",
    imageUrl: 'https://placehold.co/300x400.png?text=GirlsLastTourKettenkrad&font=lora',
    genreTags: ['Adventure', 'Mystery', 'Sci-Fi', 'Slice of Life', 'CGDCT', 'Post-Apocalyptic', 'Iyashikei'],
    moodTags: ['Comfy & Cozy', 'Dark & Deep'],
  },
  {
    id: 'the-melancholy-of-haruhi-suzumiya:-don-t-bore-the-god-girl,-or-else',
    parodyTitle: 'The Melancholy of Haruhi Suzumiya: Don’t Bore The God Girl, Or Else',
    originalMalId: 849, // Suzumiya Haruhi no Yuuutsu
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "She can unconsciously alter reality. Her friends (an alien, a time traveler, an esper) try to keep her entertained.",
    imageUrl: 'https://placehold.co/300x400.png?text=HaruhiGodGirl&font=lora',
    genreTags: ['Avant Garde', 'Comedy', 'Mystery', 'School', 'Sci-Fi', 'Slice of Life', 'Supernatural'],
    moodTags: ['Hilarious', 'Surreal'],
  },
  {
    id: 'angel-beats!:-afterlife-high-school-with-more-guns-and-sad-backstories',
    parodyTitle: 'Angel Beats!: Afterlife High School With More Guns And Sad Backstories',
    originalMalId: 6547, // Angel Beats!
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Teens fight against God (or an angel student council president) to avoid obliteration. It's funnier and sadder than it sounds.",
    imageUrl: 'https://placehold.co/300x400.png?text=AngelBeatsGuns&font=lora',
    genreTags: ['Action', 'Comedy', 'Drama', 'School', 'Supernatural', 'Tragedy'],
    moodTags: ['Emotional Rollercoaster', 'Hilarious'],
  },
  {
    id: 'gurren-lagann:-my-drill-is-the-drill-that-will-pierce-the-heavens-(and-logic)', // Duplicate ID, will be handled
    parodyTitle: 'Gurren Lagann Reprise: MORE DRILLS!',
    originalMalId: 2001, // Tengen Toppa Gurren Lagann
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Just when you thought there weren't enough drills, Simon finds an even BIGGER one. Believe harder!",
    imageUrl: 'https://placehold.co/300x400.png?text=MoreDrills&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Mecha', 'Sci-Fi', 'Shonen'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
    isEvolvedForm: true,
  },
  {
    id: 'violet-evergarden-the-movie-prepare-for-more-tears',
    parodyTitle: 'Violet Evergarden The Movie: Prepare For More Tears',
    originalMalId: 37987, // Violet Evergarden Movie
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "The stunning conclusion to Violet's journey of understanding love. Yes, you will cry again.",
    imageUrl: 'https://placehold.co/300x400.png?text=VioletMovieTears&font=lora',
    genreTags: ['Award Winning', 'Drama', 'Fantasy', 'Slice of Life'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'wandering-witch:-elaina-s-travel-blog-(now-with-more-trauma!)',
    parodyTitle: 'Wandering Witch: Elaina’s Travel Blog (Now With More Trauma!)',
    originalMalId: 40571, // Majo no Tabitabi
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A cute witch travels the world, encountering beautiful scenery and occasionally horrific situations. It's a mixed bag.",
    imageUrl: 'https://placehold.co/300x400.png?text=ElainaTraumaBlog&font=lora',
    genreTags: ['Adventure', 'Drama', 'Fantasy', 'Slice of Life'],
    moodTags: ['Comfy & Cozy', 'Dark & Deep'],
  },
  {
    id: 'the-detective-is-already-dead-(but-her-ghost-won-t-leave-me-alone)',
    parodyTitle: 'The Detective Is Already Dead (But Her Ghost Won’t Leave Me Alone)',
    originalMalId: 46471, // Tantei wa Mou, Shindeiru.
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "His legendary detective partner died, but that's just the beginning of his problems. And flashbacks.",
    imageUrl: 'https://placehold.co/300x400.png?text=DetectiveDeadGhost&font=lora',
    genreTags: ['Comedy', 'Drama', 'Mystery', 'Romance', 'Supernatural', 'Suspense'],
    moodTags: ['Emotional Rollercoaster', 'Intriguing'],
  },
  {
    id: 'my-dress-up-darling:-shy-doll-maker-meets-gyaru-cosplayer-(very-wholesome-ecchi)',
    parodyTitle: 'My Dress-Up Darling: Shy Doll Maker Meets Gyaru Cosplayer (Very Wholesome Ecchi)',
    originalMalId: 48736, // Sono Bisque Doll wa Koi wo Suru
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Gojo and Marin are adorable. A story about passion, craftsmanship, and a surprisingly healthy relationship.",
    imageUrl: 'https://placehold.co/300x400.png?text=DressUpDarlingCosplay&font=lora',
    genreTags: ['Comedy', 'Ecchi', 'Romance', 'School', 'Seinen', 'Slice of Life', 'Otaku Culture'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'mushoku-tensei-jobless-reincarnation-season-2-part-2:-rudeus-finally-gets-some',
    parodyTitle: 'Mushoku Tensei S2P2: Rudeus Actually Makes Progress',
    originalMalId: 55420, // Mushoku Tensei II: Isekai Ittara Honki Dasu Part 2
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "The magic academy arc continues, with more character development, relationship drama, and Rudeus making progress.",
    imageUrl: 'https://placehold.co/300x400.png?text=MushokuS2P2Progress&font=lora',
    genreTags: ['Adventure', 'Drama', 'Ecchi', 'Fantasy', 'Isekai', 'Romance'],
    moodTags: ['Epic Adventure', 'Emotional Rollercoaster'],
  },
  {
    id: 'frieren-beyond-journey-s-end-season-2',
    parodyTitle: 'Frieren S2: More Feels, More Flashbacks',
    originalMalId: 58305, // Sousou no Frieren Season 2 (Hypothetical MAL ID for S2)
    originalType: 'anime',
    rarity: 'Event',
    parodyBlurb: "The journey through time and memory continues. Prepare for more quiet contemplation and emotional gut punches.",
    imageUrl: 'https://placehold.co/300x400.png?text=FrierenS2Flashbacks&font=lora',
    genreTags: ['Adventure', 'Drama', 'Fantasy', 'Slice of Life'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
    packExclusive: true,
  },
  {
    id: 'chainsaw-man-movie:-rezebomb',
    parodyTitle: 'Chainsaw Man Movie: The Reze Bomb (Prepare for Pain)',
    originalMalId: 56679, // Chainsaw Man Movie: Reze-hen (Actual MAL ID)
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Denji thought he found happiness. He was wrong. The Bomb Girl arc is coming to break everyone's hearts.",
    imageUrl: 'https://placehold.co/300x400.png?text=CSMRezeBomb&font=lora',
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
    imageUrl: 'https://placehold.co/300x400.png?text=OPMS3NewStudio&font=lora',
    genreTags: ['Action', 'Comedy', 'Parody', 'Sci-Fi', 'Seinen', 'Super Power', 'Supernatural'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
    packExclusive: true,
  },
  {
    id: 'kono-subarashii-sekai-ni-shukufuku-wo!-3',
    parodyTitle: 'KonoSuba S3: Explosion Boogaloo!',
    originalMalId: 51660, // Kono Subarashii Sekai ni Shukufuku wo! 3
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Kazuma, Aqua, Megumin, and Darkness return for more debt, explosions, and accidental heroism. EXPLOSION!",
    imageUrl: 'https://placehold.co/300x400.png?text=KonoSubaS3Boogaloo&font=lora',
    genreTags: ['Adventure', 'Comedy', 'Fantasy', 'Isekai', 'Parody', 'Supernatural'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'that-time-i-got-reincarnated-as-a-slime-season-3',
    parodyTitle: 'Slime Isekai S3: Rimuru For President!',
    originalMalId: 53312, // Tensei shitara Slime Datta Ken 3rd Season
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "More politics, more battles, more cute monster girls. Rimuru continues his accidental world domination tour.",
    imageUrl: 'https://placehold.co/300x400.png?text=SlimeS3President&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Fantasy', 'Isekai'],
    moodTags: ['Epic Adventure', 'Comfy & Cozy'],
  },
  {
    id: 'kaiju-no-8:-man-turns-into-giant-monster,-fights-other-giant-monsters',
    parodyTitle: 'Kaiju No. 8: Attack on Kafka',
    originalMalId: 53798, // Kaijuu 8-gou
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "He wanted to join the Defense Force, now he IS the monster they fight. Awkward.",
    imageUrl: 'https://placehold.co/300x400.png?text=KaijuNo8Kafka&font=lora',
    genreTags: ['Action', 'Sci-Fi', 'Shonen', 'Kaiju', 'Military'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'wind-breaker:-delinquent-protects-his-town-with-fists-and-friendship',
    parodyTitle: 'Wind Breaker: Bofurin Top Dogs',
    originalMalId: 55901, // Wind Breaker
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "He came to the toughest school to be the strongest, ended up being a local hero. Surprisingly wholesome.",
    imageUrl: 'https://placehold.co/300x400.png?text=WindBreakerBofurin&font=lora',
    genreTags: ['Action', 'Delinquents', 'School', 'Shonen'],
    moodTags: ['Adrenaline Rush', 'Heartwarming'],
  },
  {
    id: 'delicious-in-dungeon:-eating-monsters-to-survive-(gourmet-dungeon-crawl)',
    parodyTitle: 'Dungeon Meshi: Monster Chef Diaries',
    originalMalId: 52701, // Dungeon Meshi
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "They're broke, their friend got eaten by a dragon, so they'll eat their way through the dungeon to save her. Bon appétit!",
    imageUrl: 'https://placehold.co/300x400.png?text=DungeonMeshiChef&font=lora',
    genreTags: ['Adventure', 'Comedy', 'Fantasy', 'Gourmet', 'Seinen'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'the-unwanted-undead-adventurer:-reincarnated-as-a-skeleton,-still-wants-to-be-a-hero',
    parodyTitle: 'Unwanted Undead: Skeletal Ambitions',
    originalMalId: 52617, // Nozomanu Fushi no Boukensha
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He died, became a skeleton, but his adventuring spirit lives on! Or, un-lives on. You get it.",
    imageUrl: 'https://placehold.co/300x400.png?text=UndeadSkeletal&font=lora',
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Isekai (ish)'],
    moodTags: ['Epic Adventure', 'Dark & Deep'],
  },
  {
    id: 'sasaki-and-peeps:-office-worker-buys-a-psychic-bird,-gets-dragged-into-magical-girl-battles',
    parodyTitle: 'Sasaki & Peeps: Bird is the Word (and Psychic)',
    originalMalId: 54004, // Sasaki to Pii-chan
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "He just wanted a cute pet. Now he's dealing with interdimensional beings and government agents. What a life.",
    imageUrl: 'https://placehold.co/300x400.png?text=SasakiBirdPsychic&font=lora',
    genreTags: ['Adventure', 'Comedy', 'Fantasy', 'Isekai', 'Magic', 'Slice of Life', 'Supernatural'],
    moodTags: ['Hilarious', 'Epic Adventure'],
  },
  {
    id: 'a-sign-of-affection:-deaf-girl-and-polyglot-boy-s-sweet-romance',
    parodyTitle: 'A Sign of Affection: Silent Love Songs',
    originalMalId: 55866, // Yubisaki to Renren
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A heartwarming and beautifully animated love story that explores communication and connection.",
    imageUrl: 'https://placehold.co/300x400.png?text=SignAffectionSilent&font=lora',
    genreTags: ['Drama', 'Romance', 'School', 'Shoujo', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Emotional Rollercoaster'],
  },
  {
    id: 'metallic-rouge:-android-girl-hunts-rogue-androids-on-mars-(blade-runner-vibes)',
    parodyTitle: 'Metallic Rouge: Mars Blade Huntress',
    originalMalId: 54794, // Metallic Rouge
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Stylish sci-fi action with a focus on identity and what it means to be human. Great music too.",
    imageUrl: 'https://placehold.co/300x400.png?text=MetallicMarsHuntress&font=lora',
    genreTags: ['Action', 'Mecha', 'Sci-Fi', 'Space'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'the-wrong-way-to-use-healing-magic:-healer-gets-dragged-into-the-front-lines',
    parodyTitle: 'Healing Magic: Combat Medic Mayhem',
    originalMalId: 53618, // Chiyu Mahou no Machigatta Tsukaikata
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He thought he'd be safe in the back, but his healing is too OP. Now he's a combat medic against his will.",
    imageUrl: 'https://placehold.co/300x400.png?text=HealingCombatMedic&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Fantasy', 'Isekai', 'Magic'],
    moodTags: ['Hilarious', 'Adrenaline Rush'],
  },
  {
    id: 'tsukimichi:-moonlit-fantasy-(mc-gets-isekai-d,-rejected-by-goddess,-becomes-op)',
    parodyTitle: 'Tsukimichi: Goddess Reject OP MC',
    originalMalId: 43838, // Tsukimichi: Moonlit Fantasy
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "The goddess called him ugly, so he's building his own multicultural paradise with monster girls. As one does.",
    imageUrl: 'https://placehold.co/300x400.png?text=TsukimichiRejectOP&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Fantasy', 'Harem', 'Isekai'],
    moodTags: ['Epic Adventure', 'Comfy & Cozy'],
  },
  {
    id: 'mashle:-magic-and-muscles-(harry-potter-but-saitama-is-the-mc)',
    parodyTitle: 'Mashle: Buffs Not Puffs',
    originalMalId: 52211, // Mashle
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "He can't use magic, so he just punches his way through magic school. Cream puffs are serious business.",
    imageUrl: 'https://placehold.co/300x400.png?text=MashleBuffs&font=lora',
    genreTags: ['Action', 'Comedy', 'Fantasy', 'School', 'Shonen', 'Parody'],
    moodTags: ['Hilarious', 'Adrenaline Rush'],
  },
  {
    id: 'ishura:-battle-royale-of-overpowered-demigods-(everyone-is-broken)',
    parodyTitle: 'Ishura: Demigod Deathmatch Deluxe',
    originalMalId: 55413, // Ishura
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "The Demon King is dead, now his ridiculously strong generals fight each other. Expect hype fights and cool designs.",
    imageUrl: 'https://placehold.co/300x400.png?text=IshuraDeathmatch&font=lora',
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Seinen'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'villainess-level-99:-i-may-be-the-hidden-boss-but-i-m-not-the-demon-lord-(she-just-wants-to-be-left-alone)',
    parodyTitle: 'Villainess Lv99: Just Wanna Chill, Bro',
    originalMalId: 55310, // Akuyaku Reijou Level 99
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "She's so OP it's terrifying, but all she wants is a peaceful life. The misunderstandings are hilarious.",
    imageUrl: 'https://placehold.co/300x400.png?text=VillainessChill&font=lora',
    genreTags: ['Comedy', 'Fantasy', 'Isekai', 'Romance', 'School', 'Slice of Life'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: '7th-time-loop:-the-villainess-enjoys-a-carefree-life-married-to-her-worst-enemy!-(this-time-it-ll-be-different!)',
    parodyTitle: '7th Time Loop: Marry Your Nemesis, It’s Fine',
    originalMalId: 55351, // Loop 7-kaime no Akuyaku Reijou
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "After six failed lives, Rishe is determined to just chill in her seventh. But her former killer is now her fiancé. Awkward.",
    imageUrl: 'https://placehold.co/300x400.png?text=7thLoopNemesis&font=lora',
    genreTags: ['Fantasy', 'Romance', 'Time Travel', 'Comedy'],
    moodTags: ['Heartwarming', 'Hilarious'],
  },
  {
    id: 'brave-bang-bravern!!:-mech-pilot-gets-a-very-enthusiastic-sentient-mech-(it-s-weirdly-wholesome?)',
    parodyTitle: 'Bang Bravern: My Mech Loves Me Too Much',
    originalMalId: 56568, // Yuuki Bakuhatsu Bang Bravern
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A hot-blooded super robot show with a twist. Bravern really, REALLY loves Isami.",
    imageUrl: 'https://placehold.co/300x400.png?text=BangBravernLove&font=lora',
    genreTags: ['Action', 'Mecha', 'Sci-Fi', 'Comedy', 'Military'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
  },
  {
    id: 'a-galaxy-next-door:-mangaka-hires-an-alien-princess-as-his-assistant-(and-they-get-engaged-immediately)',
    parodyTitle: 'Galaxy Next Door: Alien Fiancée Manager',
    originalMalId: 51705, // Otonari ni Ginga
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "A sweet and fluffy romance about an overworked artist and a very dedicated alien. Very wholesome.",
    imageUrl: 'https://placehold.co/300x400.png?text=GalaxyAlienFiancee&font=lora',
    genreTags: ['Comedy', 'Romance', 'Sci-Fi', 'Seinen', 'Slice of Life', 'Supernatural'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'my-clueless-first-friend:-gloomy-girl-makes-friends-with-an-oblivious-sunshine-boy',
    parodyTitle: 'Clueless Friend: Sunshine Oblivion',
    originalMalId: 51262, // Jijou wo Shiranai Tenkousei ga Guigui Kuru.
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "She's an outcast, he thinks she's a cool grim reaper. Their friendship is pure and adorable.",
    imageUrl: 'https://placehold.co/300x400.png?text=CluelessSunshine&font=lora',
    genreTags: ['Comedy', 'School', 'Shonen', 'Slice of Life', 'Kids'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'the-angel-next-door-spoils-me-rotten:-neet-boy-gets-pampered-by-the-school-angel',
    parodyTitle: 'Angel Next Door: Pampered NEET Paradise',
    originalMalId: 50739, // Otonari no Tenshi-sama ni Itsunomanika Dame Ningen ni Sareteita Ken
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "She's perfect, he's a slob. She starts cooking for him. Diabetes-inducing fluff ensues.",
    imageUrl: 'https://placehold.co/300x400.png?text=AngelPamperedNEET&font=lora',
    genreTags: ['Comedy', 'Romance', 'School', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'isekai-nonbiri-nouka:-isekai-farmer-gets-a-harem-of-monster-girls-(very-chill)',
    parodyTitle: 'Isekai Farmer: Monster Girl Harvest',
    originalMalId: 51462, // Isekai Nonbiri Nouka
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He just wants to farm in peace. Somehow, this attracts a vampire, an angel, and a bunch of elves. Standard.",
    imageUrl: 'https://placehold.co/300x400.png?text=IsekaiMonsterHarvest&font=lora',
    genreTags: ['Fantasy', 'Harem', 'Isekai', 'Slice of Life', 'Monster Girls'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
  },
  {
    id: 'the-ice-guy-and-his-cool-female-colleague:-icy-descendant-melts-for-his-kind-coworker',
    parodyTitle: 'Ice Guy & Cool Gal: Office Freeze Frame Romance',
    originalMalId: 52173, // Koori Zokusei Danshi to Cool na Douryou Joshi
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He literally freezes things when he's flustered. She's cool and collected. A very sweet office romance.",
    imageUrl: 'https://placehold.co/300x400.png?text=IceGuyFreezeFrame&font=lora',
    genreTags: ['Comedy', 'Fantasy', 'Josei', 'Romance', 'Slice of Life', 'Supernatural', 'Workplace'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'uzaki-chan-wants-to-hang-out!:-senpai-is-annoyed-(but-secretly-loves-it)',
    parodyTitle: 'Uzaki-chan: Annoying Senpai Bait',
    originalMalId: 41226, // Uzaki-chan wa Asobitai!
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "She's loud, she's energetic, and she really wants to hang out with her grumpy senpai. SUGOI DEKAI.",
    imageUrl: 'https://placehold.co/300x400.png?text=UzakiSenpaiBait&font=lora',
    genreTags: ['Comedy', 'Ecchi', 'Romance', 'Slice of Life', 'Seinen'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'don-t-toy-with-me,-miss-nagatoro:-sadistic-kouhai-teases-her-senpai-(he-s-into-it)',
    parodyTitle: 'Nagatoro: Teasing Master Nagatoro-san',
    originalMalId: 42361, // Ijiranaide, Nagatoro-san
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "She bullies him relentlessly, but it's mostly just her weird way of flirting. Senpai is a trooper.",
    imageUrl: 'https://placehold.co/300x400.png?text=NagatoroMasterTease&font=lora',
    genreTags: ['Comedy', 'Romance', 'School', 'Shonen', 'Slice of Life', 'Sadism (comedic)'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'komi-can-t-communicate:-beautiful-girl-has-extreme-social-anxiety-(but-everyone-loves-her)',
    parodyTitle: 'Komi Can’t Communicate: 100 Friends Quest',
    originalMalId: 48926, // Komi-san wa, Comyushou desu.
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "She wants to make 100 friends, but can't speak. Tadano is her first friend and translator. Wholesome and funny.",
    imageUrl: 'https://placehold.co/300x400.png?text=Komi100Friends&font=lora',
    genreTags: ['Comedy', 'School', 'Shonen', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'aharen-san-is-indecipherable:-tiny-girl-is-either-too-close-or-too-far-(raidou-is-confused)',
    parodyTitle: 'Aharen-san: Personal Space Invader',
    originalMalId: 49520, // Aharen-san wa Hakarenai
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "She has no concept of personal space. He has an overactive imagination. Their relationship is... unique.",
    imageUrl: 'https://placehold.co/300x400.png?text=AharenSpaceInvader&font=lora',
    genreTags: ['Comedy', 'School', 'Shonen', 'Slice of Life', 'Romance'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'my-senpai-is-annoying:-short-kouhai-has-a-crush-on-her-giant,-oblivious-senpai',
    parodyTitle: 'My Senpai is Annoying: Office Crush Saga',
    originalMalId: 42351, // Senpai ga Uzai Kouhai no Hanashi
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "A sweet and funny office rom-com about an energetic kouhai and her well-meaning but dense senpai.",
    imageUrl: 'https://placehold.co/300x400.png?text=SenpaiOfficeCrush&font=lora',
    genreTags: ['Comedy', 'Romance', 'Slice of Life', 'Workplace', 'Josei'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'shikimori-s-not-just-a-cutie:-girlfriend-is-sometimes-cool,-sometimes-cute-(boyfriend-is-unlucky)',
    parodyTitle: 'Shikimori: Cool Girlfriend, Clumsy Boyfriend',
    originalMalId: 45613, // Kawaii dake ja Nai Shikimori-san
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "She's the perfect girlfriend... until danger strikes, then she becomes the coolest. Her boyfriend is a walking disaster magnet.",
    imageUrl: 'https://placehold.co/300x400.png?text=ShikimoriCoolClumsy&font=lora',
    genreTags: ['Comedy', 'Romance', 'School', 'Shonen', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  }
  // ... (Continue adding up to ~500, ensuring unique IDs and diverse content)
];

// --- SAMPLE GACHA PACKS ---
export const SAMPLE_PACKS: GachaPack[] = [
  {
    id: 'isekai-starter-pack',
    name: 'Isekai Starter Pack',
    description: 'Everything you need to begin your journey to another world! (Truck-kun may or may not be included).',
    themeTags: ['isekai', 'fantasy', 'comedy'],
    faceCardCollectibleId: 'isekai-truck-kun',
    packImageUrl: 'https://placehold.co/200x320.png?text=IsekaiPackArt&font=orbitron',
    collectibleIds: SAMPLE_COLLECTIBLES.filter(c => c.genreTags?.includes('Isekai')).map(c => c.id).slice(0, 20),
  },
  {
    id: 'legendary-heroes-pack',
    name: 'Legendary Heroes Showcase',
    description: 'Pull for parodies of the most iconic and overpowered heroes in anime & manga!',
    themeTags: ['action', 'legendary', 'mythic', 'shonen'],
    faceCardCollectibleId: 'sao-good-this-time',
    packImageUrl: 'https://placehold.co/200x320.png?text=HeroicLegends&font=orbitron',
    collectibleIds: SAMPLE_COLLECTIBLES.filter(c => c.rarity === 'Legendary' || c.rarity === 'Mythic').map(c => c.id).slice(0, 20),
  },
  {
    id: 'slice-of-sadness-pack',
    name: 'Slice of Sadness Pack',
    description: 'For when you want to feel things... deeply. Bring tissues.',
    themeTags: ['drama', 'emotional', 'slice of life', 'tragedy'],
    faceCardCollectibleId: 'clannad:-the-onion-cutting-simulator',
    packImageUrl: 'https://placehold.co/200x320.png?text=TearJerkerPack&font=orbitron',
    collectibleIds: SAMPLE_COLLECTIBLES.filter(c => c.moodTags?.includes('Emotional Rollercoaster') || c.genreTags?.includes('Tragedy')).map(c => c.id).slice(0, 20),
  },
  {
    id: 'comedy-central-pack',
    name: 'Comedy Central Pack',
    description: 'Laugh till you drop with these hilarious parodies!',
    themeTags: ['comedy', 'parody', 'slice of life', 'gag humor'],
    faceCardCollectibleId: 'konosuba:-my-adventuring-party-is-useless-(and-i-love-it)',
    packImageUrl: 'https://placehold.co/200x320.png?text=LaughOutLoud&font=orbitron',
    collectibleIds: SAMPLE_COLLECTIBLES.filter(c => c.genreTags?.includes('Comedy') || c.moodTags?.includes('Hilarious')).map(c => c.id).slice(0, 20),
  },
  {
    id: 'legacy-pack',
    name: 'Legacy Pack',
    description: 'Contains one ultra-rare card: a chance at Mythic, Event, or the elusive Forbidden tier!',
    themeTags: ['mythic', 'event', 'forbidden', 'ultra_rare'],
    faceCardCollectibleId: 'lelouch-zero-requiem', // The new Forbidden card
    packImageUrl: 'https://placehold.co/200x320.png?text=LegacyPack&font=cinzel', // Distinct pack art
    collectibleIds: [
        'lelouch-zero-requiem', // Forbidden
        'sao-good-this-time', // Mythic
        'gintama:-the-fourth-wall-is-but-a-suggestion', // Mythic
        'one-piece:-the-journey-that-will-outlive-us-all', // Mythic
        'redline:-2d-animation-flexes-so-hard-it-took-7-years-to-make', // Mythic
        'cowboy-bebop:-space-jazz-and-existential-dread', // Mythic
        'devilman-crybaby:-demons,-sex,-drugs,-and-a-whole-lot-of-crying', // Mythic
        'the-tatami-galaxy:-college-student-relives-his-first-two-years-repeatedly-trying-to-find-happiness', // Mythic
        'frieren:-beyond-journey-s-end-(elf-outlives-everyone,-learns-to-feel)', // Mythic
        '[oshi-no-ko]:-the-dark-side-of-showbiz-(with-reincarnation-and-revenge)', // Mythic
        'naruto-s-lost-uncle-returns-in-2025', // Event
        'frieren-beyond-journey-s-end-season-2', // Event
        'one-punch-man-season-3:-finally-animated-(probably-by-a-different-studio-again)', // Event
        // Add more Mythic/Event card IDs here as they are created
    ],
    isLegacyPack: true, // Flag for special handling
  }
];

    