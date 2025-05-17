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
  originalMalId: number; // MAL ID of the original work for reference
  originalType: 'anime' | 'manga'; // Type of the original work
  rarity: CollectibleRarity;
  parodyBlurb: string;
  imageUrl: string | null; // URL to the PARODY collectible's image
  genreTags?: string[]; // Parody or original genres
  moodTags?: string[]; // Associated moods
  evolvesToId?: string; // ID of the collectible this one can evolve into
  isEvolvedForm?: boolean; // Flag to denote if this IS an evolved version
}

// Sample data for the Gacha system
// NOTE: This list needs to be further expanded to reach the 500+ target.
// The originalMalId and originalType are illustrative.
export const SAMPLE_COLLECTIBLES: Collectible[] = [
  {
    id: 'roommate-yandere',
    parodyTitle: 'My Roommate Is a God-Level Yandere',
    originalMalId: 20507, // Mirai Nikki
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "She's perfect! Except for the occasional divine retribution on anyone who looks at you. Totally normal.",
    imageUrl: 'https://placehold.co/300x400.png?text=YandereGod&font=lora',
    genreTags: ['Romance', 'Comedy', 'Horror', 'Supernatural'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
    evolvesToId: 'roommate-yandere-prime', // Example evolution
  },
  {
    id: 'roommate-yandere-prime',
    parodyTitle: 'My Roommate IS the Yandere Goddess',
    originalMalId: 20507, // Mirai Nikki
    originalType: 'anime',
    rarity: 'Ultra Rare', // Evolved rarity
    parodyBlurb: "Turns out divine retribution was just her way of saying 'I love you.' Still terrifying, but now with more power.",
    imageUrl: 'https://placehold.co/300x400.png?text=YandereGoddess&font=lora',
    genreTags: ['Romance', 'Dark Comedy', 'Horror', 'Supernatural'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
    isEvolvedForm: true,
  },
  {
    id: 'depression-animated',
    parodyTitle: 'Depression: The Animated Series',
    originalMalId: 467, // Welcome to the N.H.K. - Using correct ID based on common association
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
    id: 'naruto-uncle-returns',
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
    id: 'budget-jojo',
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
  // Batch 1
  {
    id: 'angst-teen-pilots-robot',
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
    id: 'isekai-smartphone-max-pro',
    parodyTitle: 'My Smartphone In Another World: Now With 5G!',
    originalMalId: 35203, // Isekai wa Smartphone to Tomo ni.
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He's got god-tier Wi-Fi and a harem that updates like an app. What more could you want?",
    imageUrl: 'https://placehold.co/300x400.png?text=5GSmartphone&font=lora',
    genreTags: ['Isekai', 'Harem', 'Fantasy', 'Comedy'],
    moodTags: ['Comfy & Cozy', 'Hilarious'],
  },
  {
    id: 'food-wars-extra-salt',
    parodyTitle: 'Food Wars: Extra Salty Edition',
    originalMalId: 28171, // Shokugeki no Souma
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "The foodgasms are more intense, the rivalries spicier, and the plot armor? Chef's kiss!",
    imageUrl: 'https://placehold.co/300x400.png?text=SaltyFood&font=lora',
    genreTags: ['Shonen', 'Ecchi', 'School', 'Comedy'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
  },
  {
    id: 'overpowered-mc-problem',
    parodyTitle: 'My MC is Too Overpowered and Now I Have Plot Problems',
    originalMalId: 21, // One Punch Man (Anime MAL ID)
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "He can defeat anyone with one punch... so now what? An existential comedy about ultimate power.",
    imageUrl: 'https://placehold.co/300x400.png?text=OPMCprobs&font=lora',
    genreTags: ['Action', 'Comedy', 'Parody', 'Superhero'],
    moodTags: ['Hilarious', 'Adrenaline Rush'],
  },
  {
    id: 'cute-girls-doing-war-crimes',
    parodyTitle: 'Cute Girls Doing Questionable Battlefield Things',
    originalMalId: 35838, // Girls' Last Tour
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "They're adorable! And also potentially complicit in systematic atrocities. It's complicated.",
    imageUrl: 'https://placehold.co/300x400.png?text=CuteWarCrimes&font=lora',
    genreTags: ['Slice of Life', 'Adventure', 'Sci-Fi', 'Military'],
    moodTags: ['Dark & Deep', 'Emotional Ride'],
  },
  {
    id: 'high-school-death-game',
    parodyTitle: 'High School Death Game: Midterms Are a Killer',
    originalMalId: 32182, // Danganronpa 3: The End of Kibougamine Gakuen - Mirai-hen
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Forget pop quizzes, these students have to survive each other! Hope! Despair! Monokuma!",
    imageUrl: 'https://placehold.co/300x400.png?text=KillerMidterms&font=lora',
    genreTags: ['Mystery', 'Horror', 'Psychological', 'School'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'time-travel-fix-it-fic',
    parodyTitle: 'If I Could Turn Back Time: The Anime',
    originalMalId: 32281, // Erased
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "He keeps going back to fix his past, but mostly just makes things awkwardly more dramatic.",
    imageUrl: 'https://placehold.co/300x400.png?text=TimeFixFic&font=lora',
    genreTags: ['Mystery', 'Supernatural', 'Drama', 'Psychological'],
    moodTags: ['Emotional Ride', 'Dark & Deep'],
  },
  {
    id: 'yet-another-isekai-harem',
    parodyTitle: 'Yet Another Generic Isekai Harem Adventure',
    originalMalId: 40148, // Example: Peter Grill to Kenja no Jikan
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Average dude, fantasy world, cheat skills, girls fall for him. You know the drill. Now with extra tropes!",
    imageUrl: 'https://placehold.co/300x400.png?text=GenericIsekai&font=lora',
    genreTags: ['Isekai', 'Harem', 'Fantasy', 'Adventure', 'Comedy'],
    moodTags: ['Comfy & Cozy'],
  },
  {
    id: 'edgy-vampire-romance',
    parodyTitle: 'My Immortal, Brooding, Sparkly Boyfriend',
    originalMalId: 3457, // Vampire Knight (Anime MAL ID)
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He's a vampire! She's drawn to his darkness! Their love is forbidden! It's all very... 2008.",
    imageUrl: 'https://placehold.co/300x400.png?text=SparklyVamp&font=lora',
    genreTags: ['Romance', 'Supernatural', 'Shojo', 'Drama'],
    moodTags: ['Emotional Ride'],
  },
  {
    id: 'sports-anime-power-of-friendship',
    parodyTitle: 'The Power of Friendship Wins the Championship (Again)',
    originalMalId: 20583, // Haikyuu!!
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "They were underdogs, but with teamwork, shouting, and slow-motion action shots, they prevailed!",
    imageUrl: 'https://placehold.co/300x400.png?text=FriendshipSports&font=lora',
    genreTags: ['Sports', 'School', 'Shonen', 'Comedy', 'Drama'],
    moodTags: ['Adrenaline Rush', 'Heartwarming'],
  },
  {
    id: 'gundam-space-politics',
    parodyTitle: 'Giant Robots & Complicated Space Politics Weekly',
    originalMalId: 80, // Mobile Suit Gundam
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Explosions! Betrayal! Philosophical debates on the nature of war, but with more beam sabers.",
    imageUrl: 'https://placehold.co/300x400.png?text=GundamPolitics&font=lora',
    genreTags: ['Mecha', 'Sci-Fi', 'Military', 'Space', 'Drama'],
    moodTags: ['Epic Adventure', 'Dark & Deep'],
  },
  {
    id: 'berserk-suffering-continues',
    parodyTitle: 'Berserk: The Suffering Never Ends (But The Art is Great)',
    originalMalId: 22, // Berserk manga
    originalType: 'manga',
    rarity: 'Legendary',
    parodyBlurb: "He just wants a quiet life, but the universe (and Griffith) have other plans. Prepare for PAIN.",
    imageUrl: 'https://placehold.co/300x400.png?text=EternalSuffering&font=lora',
    genreTags: ['Action', 'Adventure', 'Horror', 'Fantasy', 'Seinen', 'Drama'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'idol-hell-sparkle-edition',
    parodyTitle: 'Idol Hell: Sparkle & Despair Edition',
    originalMalId: 32827, // Love Live! Sunshine!!
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "They sing! They dance! They cry over rankings! The idol industry is BRUTAL, but make it cute.",
    imageUrl: 'https://placehold.co/300x400.png?text=IdolHell&font=lora',
    genreTags: ['Music', 'School', 'Slice of Life', 'Drama'],
    moodTags: ['Emotional Ride', 'Heartwarming'],
  },
  {
    id: 'slow-burn-romance-glacial-pace',
    parodyTitle: 'Will They/Wont They: Glacial Pace Edition',
    originalMalId: 392, // Kimi ni Todoke (Manga MAL ID)
    originalType: 'manga',
    rarity: 'Common',
    parodyBlurb: "It'll take 300 chapters for them to hold hands, but the misunderstandings are top-tier.",
    imageUrl: 'https://placehold.co/300x400.png?text=SlowRomance&font=lora',
    genreTags: ['Romance', 'School', 'Shojo', 'Slice of Life'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
  },
  {
    id: 'death-note-potato-chip',
    parodyTitle: 'Death Note: I\'ll Take a Potato Chip... AND EAT IT!',
    originalMalId: 1535, // Death Note
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "The most intense chip-eating scene in anime history. Also, some stuff about justice and god complexes.",
    imageUrl: 'https://placehold.co/300x400.png?text=PotatoChip&font=lora',
    genreTags: ['Mystery', 'Supernatural', 'Police', 'Psychological', 'Thriller'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'attack-on-titan-everyone-dies',
    parodyTitle: 'Attack on My Sanity: Everyone Dies',
    originalMalId: 23390, // Attack on Titan (Manga MAL ID)
    originalType: 'manga',
    rarity: 'Legendary',
    parodyBlurb: "Just when you think your favorite character is safe... nope. Giant naked people eating folks.",
    imageUrl: 'https://placehold.co/300x400.png?text=AoTEveryoneDies&font=lora',
    genreTags: ['Action', 'Drama', 'Fantasy', 'Horror', 'Shonen', 'Mystery'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster', 'Adrenaline Rush'],
  },
  {
    id: 'magical-boy-transformation',
    parodyTitle: 'Magical Boy Transformation Sequence: The Series',
    originalMalId: 28891, // Cute High Earth Defense Club LOVE!
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "It's like magical girls, but with more sparkles, less plot, and questionable fashion choices. Fabulous!",
    imageUrl: 'https://placehold.co/300x400.png?text=MagicalBoy&font=lora',
    genreTags: ['Comedy', 'Parody', 'Mahou Shoujo', 'Slice of Life'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'slime-isekai-nation-building',
    parodyTitle: 'That Time I Got Reincarnated as a Slime and Accidentally Built a Nation',
    originalMalId: 37430, // Tensura
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "He just wanted to chill, but now he's got trade agreements and international diplomacy. Oops.",
    imageUrl: 'https://placehold.co/300x400.png?text=SlimeNation&font=lora',
    genreTags: ['Isekai', 'Fantasy', 'Comedy', 'Action'],
    moodTags: ['Epic Adventure', 'Comfy & Cozy'],
  },
  {
    id: 'ghost-in-shell-philosophy-101',
    parodyTitle: 'Ghost in the Shell: Philosophy 101 with Guns',
    originalMalId: 43, // Ghost in the Shell (1995 Movie)
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "What does it mean to be human when you're mostly cybernetics? Also, cool explosions.",
    imageUrl: 'https://placehold.co/300x400.png?text=GitSPhilosophy&font=lora',
    genreTags: ['Sci-Fi', 'Mecha', 'Police', 'Psychological', 'Seinen'],
    moodTags: ['Dark & Deep'],
  },
  {
    id: 'clannad-feels-trip',
    parodyTitle: 'Clannad: The Onion Cutting Simulator',
    originalMalId: 2167, // Clannad
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Come for the cute girls with giant eyes, stay for the soul-crushing emotional damage. 10/10 would cry again.",
    imageUrl: 'https://placehold.co/300x400.png?text=ClannadFeels&font=lora',
    genreTags: ['Drama', 'Romance', 'School', 'Slice of Life', 'Supernatural'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'dragon-ball-power-scream',
    parodyTitle: 'Dragon Ball Z: Power Up by Screaming Louder',
    originalMalId: 813, // Dragon Ball Z
    originalType: 'anime',
    rarity: 'Event',
    parodyBlurb: "The fate of the universe depends on who can yell the longest. Spoiler: it's usually Goku.",
    imageUrl: 'https://placehold.co/300x400.png?text=DBZScream&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Fantasy', 'Shonen', 'Super Power'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'your-lie-in-april-piano-tears',
    parodyTitle: 'Your Lie in April: Play Piano, Cry Violently',
    originalMalId: 23273, // Shigatsu wa Kimi no Uso
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Beautiful music, beautiful animation, and a guarantee you'll need a box of tissues. Or several.",
    imageUrl: 'https://placehold.co/300x400.png?text=PianoTears&font=lora',
    genreTags: ['Drama', 'Music', 'Romance', 'School', 'Shonen'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'konosuba-useless-party',
    parodyTitle: 'KonoSuba: My Adventuring Party is Useless (and I Love It)',
    originalMalId: 30831, // Kono Subarashii Sekai ni Shukufuku wo!
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "An explosion-obsessed mage, a masochistic crusader, and a goddess who's mostly just annoying. Peak comedy.",
    imageUrl: 'https://placehold.co/300x400.png?text=UselessParty&font=lora',
    genreTags: ['Adventure', 'Comedy', 'Fantasy', 'Isekai', 'Parody'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'made-in-abyss-cute-horror',
    parodyTitle: 'Made in Abyss: Adorable Characters, Unspeakable Horrors',
    originalMalId: 34599, // Made in Abyss
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Don't let the art style fool you. This abyss will chew you up and spit you out. But the world-building is S-tier!",
    imageUrl: 'https://placehold.co/300x400.png?text=CuteHorror&font=lora',
    genreTags: ['Adventure', 'Drama', 'Fantasy', 'Mystery', 'Sci-Fi', 'Horror'],
    moodTags: ['Dark & Deep', 'Epic Adventure', 'Emotional Rollercoaster'],
  },
  {
    id: 'another-isekai-slave-harem',
    parodyTitle: 'Another Isekai Where the MC Buys a Slave Girl (But It\'s Okay Because Plot)',
    originalMalId: 32280, // Isekai Maou to Shoukan Shoujo no Dorei Majutsu
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He's socially awkward but OP in the game world. Standard wish fulfillment with... questionable ethics.",
    imageUrl: 'https://placehold.co/300x400.png?text=SlaveHaremIsekai&font=lora',
    genreTags: ['Isekai', 'Harem', 'Fantasy', 'Ecchi', 'Comedy'],
    moodTags: ['Comfy & Cozy'],
  },
  {
    id: 'monster-musume-everyday-life',
    parodyTitle: 'My Life With Monster Girls: It\'s a Logistical Nightmare',
    originalMalId: 16273, // Monster Musume no Iru Nichijou (Manga MAL ID)
    originalType: 'manga',
    rarity: 'Rare',
    parodyBlurb: "A lamia, a harpy, a centaur... How does he even afford groceries? The interspecies cultural exchange program is wild.",
    imageUrl: 'https://placehold.co/300x400.png?text=MonsterGirlLife&font=lora',
    genreTags: ['Comedy', 'Ecchi', 'Fantasy', 'Harem', 'Romance', 'Slice of Life'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'code-geass-chessmaster-supreme',
    parodyTitle: 'Code Geass: Lelouch Plays 5D Chess While Everyone Else Plays Checkers',
    originalMalId: 1575, // Code Geass: Lelouch of the Rebellion
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Big brain plays, giant robots, and enough melodrama to power a small nation. All Hail Lelouch!",
    imageUrl: 'https://placehold.co/300x400.png?text=5DChessGeass&font=lora',
    genreTags: ['Action', 'Drama', 'Mecha', 'Military', 'Sci-Fi', 'Super Power', 'School'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep', 'Epic Adventure'],
  },
  {
    id: 'rent-a-girlfriend-cringe-fest',
    parodyTitle: 'Rent-a-Girlfriend: The Ultimate Cringe Compilation',
    originalMalId: 40839, // Kanojo, Okarishimasu
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He pays for dates and gets emotionally manipulated. Peak fiction or peak second-hand embarrassment? You decide.",
    imageUrl: 'https://placehold.co/300x400.png?text=CringeGirlfriend&font=lora',
    genreTags: ['Comedy', 'Drama', 'Romance', 'School', 'Shonen'],
    moodTags: ['Emotional Rollercoaster', 'Hilarious'],
  },
  {
    id: 'mushishi-chill-supernatural-detective',
    parodyTitle: 'Mushishi: Supernatural Pest Control, But Make It Zen',
    originalMalId: 457, // Mushishi
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Ginko wanders around solving problems caused by ethereal beings called Mushi. Very calm, very beautiful, occasionally unsettling.",
    imageUrl: 'https://placehold.co/300x400.png?text=ZenPestControl&font=lora',
    genreTags: ['Adventure', 'Fantasy', 'Historical', 'Mystery', 'Slice of Life', 'Supernatural', 'Seinen'],
    moodTags: ['Comfy & Cozy', 'Dark & Deep'],
  },
  {
    id: 'promised-neverland-s1-only',
    parodyTitle: 'The Promised Neverland (Season 1 ONLY, We Don\'t Talk About The Rest)',
    originalMalId: 37779, // Yakusoku no Neverland
    originalType: 'anime',
    rarity: 'Event',
    parodyBlurb: "A masterpiece of thriller and suspense... until it wasn't. Cherish those first 12 episodes.",
    imageUrl: 'https://placehold.co/300x400.png?text=TPNS1Only&font=lora',
    genreTags: ['Mystery', 'Psychological', 'Sci-Fi', 'Shonen', 'Thriller', 'Horror'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'spy-x-family-wholesome-espionage',
    parodyTitle: 'Spy x Family: Wholesome Espionage and Fake Marriages',
    originalMalId: 50265, // Spy x Family
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A spy, an assassin, and a telepath walk into a family... and it's the most adorable thing ever. Waku waku!",
    imageUrl: 'https://placehold.co/300x400.png?text=SpyFamilyWholesome&font=lora',
    genreTags: ['Action', 'Comedy', 'Shonen', 'Slice of Life', 'Childcare'],
    moodTags: ['Heartwarming', 'Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'vinland-saga-no-enemies',
    parodyTitle: 'Vinland Saga: Thorfinn Has No Enemies (Eventually)',
    originalMalId: 17375, // Vinland Saga (Manga MAL ID)
    originalType: 'manga',
    rarity: 'Legendary',
    parodyBlurb: "From revenge-fueled Viking rage machine to... a guy who really wants to farm peacefully. Character development!",
    imageUrl: 'https://placehold.co/300x400.png?text=NoEnemiesThorfinn&font=lora',
    genreTags: ['Action', 'Adventure', 'Drama', 'Historical', 'Seinen'],
    moodTags: ['Epic Adventure', 'Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'k-on-moe-blob-band',
    parodyTitle: 'K-On!: Cute Girls Eat Cake and Occasionally Play Music',
    originalMalId: 5680, // K-On!
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "The fuel for a thousand moe debates. They're in a band, but mostly they just drink tea and be adorable.",
    imageUrl: 'https://placehold.co/300x400.png?text=CuteCakeBand&font=lora',
    genreTags: ['Slice of Life', 'Comedy', 'Music', 'School'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
  },
  {
    id: 'goblin-slayer-controversy-bait',
    parodyTitle: 'Goblin Slayer: Edgy, Controversial, and Surprisingly Vanilla Later',
    originalMalId: 37180, // Goblin Slayer
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Episode 1 will shock you! The rest is... pretty standard D&D goblin slaying. Mostly.",
    imageUrl: 'https://placehold.co/300x400.png?text=GoblinControversy&font=lora',
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Dark Fantasy'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'another-world-restaurant-food-porn',
    parodyTitle: 'Restaurant to Another World: Pure, Unadulterated Food Porn',
    originalMalId: 34012, // Isekai Shokudou
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Dragons, elves, and lizardmen all agree: Earth food is the best. Get ready to be hungry.",
    imageUrl: 'https://placehold.co/300x400.png?text=IsekaiFoodPorn&font=lora',
    genreTags: ['Slice of Life', 'Fantasy', 'Isekai', 'Food'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
  },
  {
    id: 'demon-slayer-breathing-styles',
    parodyTitle: 'Demon Slayer: Everyone Has a Cool Breathing Style Except Zenitsu (Sometimes)',
    originalMalId: 38000, // Kimetsu no Yaiba
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Water Breathing! Flame Breathing! Thunder Breathing (mostly while asleep)! Amazing animation and family trauma.",
    imageUrl: 'https://placehold.co/300x400.png?text=BreathingStyles&font=lora',
    genreTags: ['Action', 'Adventure', 'Demons', 'Historical', 'Shonen', 'Supernatural'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure', 'Emotional Rollercoaster'],
  },
  {
    id: 'fate-stay-night-confusing-timeline',
    parodyTitle: 'Fate/Stay Night: Which Route AM I Watching?!',
    originalMalId: 356, // Fate/stay night (2006)
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Unlimited Blade Works? Heaven's Feel? Just pick one and pray you understand the lore. People die when they are killed.",
    imageUrl: 'https://placehold.co/300x400.png?text=ConfusingFate&font=lora',
    genreTags: ['Action', 'Fantasy', 'Magic', 'Romance', 'Supernatural'],
    moodTags: ['Epic Adventure', 'Dark & Deep'],
  },
  {
    id: 'bunny-girl-senpai-quantum-physics',
    parodyTitle: 'Rascal Does Not Dream of Quantum Physics and Sad Girls',
    originalMalId: 37450, // Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Adolescence Syndrome is basically a plot device for supernatural teen drama. But Mai-san is best girl.",
    imageUrl: 'https://placehold.co/300x400.png?text=QuantumBunny&font=lora',
    genreTags: ['Comedy', 'Drama', 'Romance', 'School', 'Supernatural', 'Psychological'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming', 'Dark & Deep'],
  },
  {
    id: 'mushoku-tensei-problematic-mc',
    parodyTitle: 'Mushoku Tensei: Talented Isekai Protagonist, Questionable Life Choices',
    originalMalId: 39535, // Mushoku Tensei: Isekai Ittara Honki Dasu
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Amazing world-building, incredible animation... and an MC that makes you go 'oof' a lot. It's a journey.",
    imageUrl: 'https://placehold.co/300x400.png?text=ProblematicMC&font=lora',
    genreTags: ['Adventure', 'Drama', 'Fantasy', 'Isekai', 'Ecchi'],
    moodTags: ['Epic Adventure', 'Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'grand-blue-diving-anime',
    parodyTitle: 'Grand Blue Dreaming: The Diving Anime That\'s Not About Diving',
    originalMalId: 37105, // Grand Blue
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "They say it's about diving. It's mostly about getting blackout drunk and chaotic college life. Peak comedy.",
    imageUrl: 'https://placehold.co/300x400.png?text=NotDivingAnime&font=lora',
    genreTags: ['Comedy', 'Seinen', 'Slice of Life'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 're-zero-suffering-loop',
    parodyTitle: 'Re:Zero - Starting Life in Another World by Dying Repeatedly',
    originalMalId: 31240, // Re:Zero kara Hajimeru Isekai Seikatsu
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Subaru's main skill is 'Return by Death,' which is as fun as it sounds. Mostly for him. We get to watch.",
    imageUrl: 'https://placehold.co/300x400.png?text=SufferingLoop&font=lora',
    genreTags: ['Drama', 'Fantasy', 'Isekai', 'Psychological', 'Suspense', 'Thriller'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster', 'Adrenaline Rush'],
  },
  {
    id: 'shield-hero-misunderstood',
    parodyTitle: 'The Rising of the Shield Hero: Everyone Hates Me But I Have a Raccoon Girl',
    originalMalId: 35790, // Tate no Yuusha no Nariagari
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Betrayed, ostracized, but he's got a shield and a cute demi-human companion. That'll show 'em.",
    imageUrl: 'https://placehold.co/300x400.png?text=ShieldRaccoon&font=lora',
    genreTags: ['Action', 'Adventure', 'Drama', 'Fantasy', 'Isekai'],
    moodTags: ['Epic Adventure', 'Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'haikyuu-volleyball-jesus',
    parodyTitle: 'Haikyuu!!: Short Ginger Kid is Basically Volleyball Jesus',
    originalMalId: 20583, // Haikyuu!!
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "He can jump REALLY high. Also, found family, intense matches, and more character development than you can spike at.",
    imageUrl: 'https://placehold.co/300x400.png?text=VolleyballJesus&font=lora',
    genreTags: ['Sports', 'School', 'Shonen', 'Drama', 'Comedy'],
    moodTags: ['Adrenaline Rush', 'Heartwarming'],
  },
  {
    id: 'classroom-of-elite-edgy-mc',
    parodyTitle: 'Classroom of the Elite: My High School Life is an Edgy Mind Game',
    originalMalId: 35507, // Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Everyone is a manipulative genius, especially the quiet kid. High school is tough.",
    imageUrl: 'https://placehold.co/300x400.png?text=EdgyClassroom&font=lora',
    genreTags: ['Drama', 'Psychological', 'School', 'Suspense'],
    moodTags: ['Dark & Deep'],
  },
  {
    id: 'horimiya-diabetes-inducing-romance',
    parodyTitle: 'Horimiya: This Romance is Too Sweet, I Need Insulin',
    originalMalId: 42897, // Horimiya
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "No drama, just pure, wholesome, diabetes-inducing high school romance. Protect them at all costs.",
    imageUrl: 'https://placehold.co/300x400.png?text=SweetHorimiya&font=lora',
    genreTags: ['Romance', 'School', 'Shonen', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'steins-gate-microwave-time-machine',
    parodyTitle: 'Steins;Gate: My Microwave is a Time Machine (and it Screws Everything Up)',
    originalMalId: 9253, // Steins;Gate (Anime MAL ID)
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "El Psy Kongroo! Science, conspiracies, and a whole lot of 'tuturu~'. The choice of Steins Gate.",
    imageUrl: 'https://placehold.co/300x400.png?text=MicrowaveTime&font=lora',
    genreTags: ['Drama', 'Psychological', 'Sci-Fi', 'Suspense', 'Thriller', 'Time Travel'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster', 'Adrenaline Rush'],
  },
  {
    id: 'your-name-body-swap-feels',
    parodyTitle: 'Your Name.: Beautiful Scenery, Body Swaps, and Imminent Disaster',
    originalMalId: 32282, // Kimi no Na wa.
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "They swap bodies, fall in love, and then things get REALLY complicated. Bring tissues and admire the animation.",
    imageUrl: 'https://placehold.co/300x400.png?text=YourNameFeels&font=lora',
    genreTags: ['Drama', 'Romance', 'School', 'Supernatural'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'a-silent-voice-communication-is-hard',
    parodyTitle: 'A Silent Voice: Communication is Hard, Okay?',
    originalMalId: 28851, // Koe no Katachi
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "A story about bullying, redemption, and the struggles of connecting with others. Prepare for emotional impact.",
    imageUrl: 'https://placehold.co/300x400.png?text=SilentCommunication&font=lora',
    genreTags: ['Drama', 'School', 'Shonen'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep', 'Heartwarming'],
  },
  {
    id: 'violet-evergarden-typing-with-feelings',
    parodyTitle: 'Violet Evergarden: Learning to Type... With Feelings',
    originalMalId: 33352, // Violet Evergarden
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "She was a child soldier, now she's an Auto Memory Doll. Each letter she types is a lesson in humanity. Gorgeous.",
    imageUrl: 'https://placehold.co/300x400.png?text=VioletTyping&font=lora',
    genreTags: ['Drama', 'Fantasy', 'Slice of Life'],
    moodTags: ['Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'that-time-i-got-reincarnated-as-a-spider',
    parodyTitle: 'So I\'m a Spider, So What? Now With More Stats!',
    originalMalId: 37984, // Kumo Desu ga, Nani ka?
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Level up, evolve, eat gross monsters. Being a spider in a fantasy dungeon is a full-time job.",
    imageUrl: 'https://placehold.co/300x400.png?text=SpiderStats&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Fantasy', 'Isekai', 'Magic'],
    moodTags: ['Epic Adventure', 'Adrenaline Rush'],
  },
  {
    id: 'love-is-war-galaxy-brain-romance',
    parodyTitle: 'Kaguya-sama: Love is War (But Mostly Overthinking)',
    originalMalId: 37999, // Kaguya-sama wa Kokurasetai: Tensai-tachi no Renai Zunousen
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Two geniuses are too proud to confess, so they engage in elaborate mind games. 'How cute.'",
    imageUrl: 'https://placehold.co/300x400.png?text=GalaxyBrainLove&font=lora',
    genreTags: ['Comedy', 'Psychological', 'Romance', 'School', 'Seinen'],
    moodTags: ['Hilarious', 'Heartwarming'],
  },
  {
    id: 'chainsaw-man-needs-therapy',
    parodyTitle: 'Chainsaw Man: Denji REALLY Needs Therapy (and a Hug)',
    originalMalId: 116778, // Chainsaw Man (Manga MAL ID)
    originalType: 'manga',
    rarity: 'Legendary',
    parodyBlurb: "Devils, gore, and a boy who just wants a normal life with toast and jam. It's a wild ride.",
    imageUrl: 'https://placehold.co/300x400.png?text=ChainsawTherapy&font=lora',
    genreTags: ['Action', 'Adventure', 'Award Winning', 'Dark Fantasy', 'Shonen', 'Supernatural'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush', 'Emotional Rollercoaster'],
  },
  {
    id: 'jujutsu-kaisen-cool-powers-trauma',
    parodyTitle: 'Jujutsu Kaisen: Cool Powers, Endless Trauma',
    originalMalId: 40748, // Jujutsu Kaisen (TV)
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Cursed energy, epic fights, and characters you love getting absolutely wrecked. Standard Shonen Plus.",
    imageUrl: 'https://placehold.co/300x400.png?text=JJKTrauma&font=lora',
    genreTags: ['Action', 'Award Winning', 'Fantasy', 'School', 'Shonen', 'Supernatural'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep'],
  },
  // Batch 2
  {
    id: 'bleach-filler-arc-simulator',
    parodyTitle: 'Bleach: The Never-Ending Filler Arc Simulator',
    originalMalId: 269, // Bleach
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Just when the plot gets good, BAM! A wild Bount appears. At least the swords are cool.",
    imageUrl: 'https://placehold.co/300x400.png?text=BleachFiller&font=lora',
    genreTags: ['Action', 'Adventure', 'Super Power', 'Shonen'],
    moodTags: ['Adrenaline Rush'],
  },
  {
    id: 'fullmetal-alchemist-equivalent-exchange-of-tears',
    parodyTitle: 'Fullmetal Alchemist: Equivalent Exchange of My Tears',
    originalMalId: 5114, // Fullmetal Alchemist: Brotherhood
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Two brothers try alchemy, it costs an arm and a leg (literally). Philosophical, action-packed, and emotionally devastating.",
    imageUrl: 'https://placehold.co/300x400.png?text=FMABroTears&font=lora',
    genreTags: ['Action', 'Adventure', 'Drama', 'Fantasy', 'Magic', 'Military', 'Shonen'],
    moodTags: ['Epic Adventure', 'Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'gintama-fourth-wall-breaker-supreme',
    parodyTitle: 'Gintama: The Fourth Wall Is But a Suggestion',
    originalMalId: 918, // Gintama
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Comedy, action, drama, parody, and a main character who picks his nose. There's nothing Gintama can't do.",
    imageUrl: 'https://placehold.co/300x400.png?text=Gintama4thWall&font=lora',
    genreTags: ['Action', 'Comedy', 'Historical', 'Parody', 'Samurai', 'Sci-Fi', 'Shonen'],
    moodTags: ['Hilarious', 'Adrenaline Rush', 'Emotional Rollercoaster'],
  },
  {
    id: 'hunter-x-hunter-hiatus-simulator',
    parodyTitle: 'Hunter x Hunter: Hiatus Simulator (Now with More Nen!)',
    originalMalId: 136, // Hunter x Hunter (2011)
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Incredible world-building, complex power systems, and the constant fear the author will take another decade-long break.",
    imageUrl: 'https://placehold.co/300x400.png?text=HxHHiatus&font=lora',
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Shonen', 'Super Power'],
    moodTags: ['Epic Adventure', 'Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'mob-psycho-100-emotional-explosion',
    parodyTitle: 'Mob Psycho 100: If My Emotions Hit 100%, Something Explodes',
    originalMalId: 32182, // Danganronpa 3 (Placeholder - this ID is for Danganronpa, Mob Psycho is 31170)
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "A sweet, unassuming esper who just wants to be popular. Also, he can level cities when stressed. Relatable.",
    imageUrl: 'https://placehold.co/300x400.png?text=MobExplodes&font=lora',
    genreTags: ['Action', 'Comedy', 'Slice of Life', 'Supernatural'],
    moodTags: ['Hilarious', 'Heartwarming', 'Adrenaline Rush'],
  },
  {
    id: 'one-piece-never-ending-journey',
    parodyTitle: 'One Piece: The Journey That Will Outlive Us All',
    originalMalId: 21, // One Piece (anime)
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Pirates, adventure, found family, and a treasure that might actually be the friends we made along the way. We'll find out in 2077.",
    imageUrl: 'https://placehold.co/300x400.png?text=OnePieceNeverEnds&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Shonen', 'Super Power'],
    moodTags: ['Epic Adventure', 'Emotional Rollercoaster', 'Heartwarming'],
  },
  {
    id: 'that-time-i-got-reincarnated-as-a-demon-lord-with-a-secretary',
    parodyTitle: 'I\'m a Demon Lord But My Secretary Runs Everything',
    originalMalId: 41489, // Maoujou de Oyasumi
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Conquering the world is hard work, mostly for my extremely competent (and terrified) staff.",
    imageUrl: 'https://placehold.co/300x400.png?text=DemonLordSecretary&font=lora',
    genreTags: ['Comedy', 'Fantasy', 'Slice of Life', 'Supernatural'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'tokyo-ghoul-edgy-and-confusing',
    parodyTitle: 'Tokyo Ghoul: What Is Even Happening Anymore? (But Edgy)',
    originalMalId: 35227, // Tokyo Ghoul:re
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Ghouls, gore, existential angst, and a plot that requires a flowchart. At least the OPs slap.",
    imageUrl: 'https://placehold.co/300x400.png?text=ConfusingGhoul&font=lora',
    genreTags: ['Action', 'Drama', 'Horror', 'Mystery', 'Psychological', 'Supernatural', 'Seinen'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'yuri-on-ice-ice-skating-romance',
    parodyTitle: 'Yuri!!! on Ice: Competitive Ice Skating and Unspoken Romance',
    originalMalId: 32995, // Yuri!!! on Ice
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "They make history on the ice! And also in our hearts. Beautiful animation and pure, wholesome love.",
    imageUrl: 'https://placehold.co/300x400.png?text=YuriOnIce&font=lora',
    genreTags: ['Award Winning', 'Comedy', 'Drama', 'Sports'],
    moodTags: ['Heartwarming', 'Emotional Rollercoaster'],
  },
  {
    id: 'banana-fish-pain-and-suffering',
    parodyTitle: 'Banana Fish: Emotional Support Gangster Story (Prepare for Pain)',
    originalMalId: 36649, // Banana Fish
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "A tragic story of street gangs, trauma, and a pure, doomed love. You will not be okay.",
    imageUrl: 'https://placehold.co/300x400.png?text=BananaFishPain&font=lora',
    genreTags: ['Action', 'Adventure', 'Drama', 'Shoujo'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'cells-at-work-anthropomorphic-biology',
    parodyTitle: 'Cells at Work!: Your Biology Class, But Moe',
    originalMalId: 37141, // Hataraku Saibou
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Red Blood Cell is a klutz, White Blood Cell is a badass. Learn about your body while shipping platelets.",
    imageUrl: 'https://placehold.co/300x400.png?text=MoeBiology&font=lora',
    genreTags: ['Comedy', 'Shonen', 'Educational'],
    moodTags: ['Hilarious', 'Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'dr-stone-science-isekai',
    parodyTitle: 'Dr. Stone: Rebuilding Civilization with SCIENCE! (and Hair Gel)',
    originalMalId: 38691, // Dr. Stone
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Everyone turned to stone, but this genius kid is gonna science the world back, one invention at a time. Ten billion percent exciting!",
    imageUrl: 'https://placehold.co/300x400.png?text=ScienceIsekai&font=lora',
    genreTags: ['Adventure', 'Comedy', 'Sci-Fi', 'Shonen'],
    moodTags: ['Epic Adventure', 'Adrenaline Rush', 'Hilarious'],
  },
  {
    id: 'fire-force-firefighters-with-superpowers',
    parodyTitle: 'Fire Force: Firefighters, But They START The Fires (With Their Souls)',
    originalMalId: 38671, // Enen no Shouboutai
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Spontaneous human combustion is a problem, so these superpowered firefighters fight fire with... more fire? Látom.",
    imageUrl: 'https://placehold.co/300x400.png?text=SoulFirefighters&font=lora',
    genreTags: ['Action', 'Fantasy', 'Shonen', 'Supernatural'],
    moodTags: ['Adrenaline Rush'],
  },
  {
    id: 'golden-kamuy-weird-west-hokkaido',
    parodyTitle: 'Golden Kamuy: Hokkaido Treasure Hunt with War Criminals and Bear Fights',
    originalMalId: 36028, // Golden Kamuy
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "A Russo-Japanese War vet and an Ainu girl search for gold, encountering the weirdest, toughest dudes in Japan. Hinna hinna.",
    imageUrl: 'https://placehold.co/300x400.png?text=HokkaidoTreasure&font=lora',
    genreTags: ['Action', 'Adventure', 'Historical', 'Seinen', 'Comedy'],
    moodTags: ['Epic Adventure', 'Adrenaline Rush', 'Dark & Deep', 'Hilarious'],
  },
  {
    id: 'my-hero-academia-superhero-school-drama',
    parodyTitle: 'My Hero Academia: Superhero High School with Extra Drama',
    originalMalId: 31964, // Boku no Hero Academia
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Everyone has quirks! Except this one kid... until he gets the BEST quirk. Plus Ultra emotional breakdowns!",
    imageUrl: 'https://placehold.co/300x400.png?text=SuperheroSchool&font=lora',
    genreTags: ['Action', 'Comedy', 'School', 'Shonen', 'Super Power'],
    moodTags: ['Adrenaline Rush', 'Heartwarming', 'Emotional Rollercoaster'],
  },
  {
    id: 'ranking-of-kings-dont-judge-by-appearance',
    parodyTitle: 'Ranking of Kings: Don\'t Judge a Prince by His Size (He Will Wreck You)',
    originalMalId: 40834, // Ousama Ranking
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "A deaf, tiny prince who's stronger than he looks, and his best friend is a shadow blob. Prepare for feels and hype.",
    imageUrl: 'https://placehold.co/300x400.png?text=TinyPrinceWrecks&font=lora',
    genreTags: ['Adventure', 'Award Winning', 'Fantasy'],
    moodTags: ['Heartwarming', 'Epic Adventure', 'Emotional Rollercoaster'],
  },
  {
    id: 'that-time-i-got-reincarnated-as-a-slime-season-2-more-meetings',
    parodyTitle: 'Slime Isekai S2: Now With More Meetings and Nation Building!',
    originalMalId: 39551, // Tensei shitara Slime Datta Ken 2nd Season
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Rimuru's got a council now. And paperwork. Still OP, but with diplomatic immunity.",
    imageUrl: 'https://placehold.co/300x400.png?text=SlimeMeetings&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Fantasy', 'Isekai'],
    moodTags: ['Epic Adventure', 'Comfy & Cozy'],
  },
  {
    id: 'to-your-eternity-immortal-suffering-simulator',
    parodyTitle: 'To Your Eternity: Immortal Being Learns About Life Through Unending Pain',
    originalMalId: 41025, // Fumetsu no Anata e
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "An orb becomes a rock, then moss, then a wolf, then a boy... and experiences every form of suffering imaginable. Beautifully tragic.",
    imageUrl: 'https://placehold.co/300x400.png?text=ImmortalSuffering&font=lora',
    genreTags: ['Adventure', 'Drama', 'Fantasy', 'Shonen', 'Supernatural'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'wonder-egg-priority-trauma-and-symbolism',
    parodyTitle: 'Wonder Egg Priority: Cute Girls Fight Trauma Monsters (It\'s Very Symbolic)',
    originalMalId: 43299, // Wonder Egg Priority
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Buy an egg, fight a monster representing someone's trauma, get... more trauma? Gorgeous animation, confusing plot.",
    imageUrl: 'https://placehold.co/300x400.png?text=TraumaEggs&font=lora',
    genreTags: ['Award Winning', 'Drama', 'Fantasy', 'Psychological', 'Suspense'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'ancient-magus-bride-wholesome-monster-romance',
    parodyTitle: 'Ancient Magus\' Bride: Girl Buys Monster Husband, It\'s Surprisingly Wholesome',
    originalMalId: 9095, // Mahoutsukai no Yome (Manga MAL ID)
    originalType: 'manga',
    rarity: 'Rare',
    parodyBlurb: "She was sold at an auction, he's got a cow skull for a head. Somehow, it's one of the most heartwarming fantasy romances.",
    imageUrl: 'https://placehold.co/300x400.png?text=MonsterHusband&font=lora',
    genreTags: ['Fantasy', 'Mythology', 'Romance', 'Slice of Life', 'Shonen', 'Supernatural'],
    moodTags: ['Heartwarming', 'Comfy & Cozy', 'Epic Adventure'],
  },
  {
    id: 'beastars-furry-high-school-drama',
    parodyTitle: 'Beastars: Furry High School Is More Angsty Than Yours',
    originalMalId: 103701, // Beastars (Manga MAL ID)
    originalType: 'manga',
    rarity: 'Ultra Rare',
    parodyBlurb: "Carnivores and herbivores navigate love, prejudice, and the irresistible urge to eat their classmates. Zootopia this ain't.",
    imageUrl: 'https://placehold.co/300x400.png?text=FurryAngst&font=lora',
    genreTags: ['Award Winning', 'Drama', 'Psychological', 'Shonen', 'Slice of Life'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'devils-line-vampire-cop-romance',
    parodyTitle: 'Devils\' Line: He\'s a Vampire Cop, She\'s a Grad Student, It Gets Bloody',
    originalMalId: 80609, // Devils Line (Manga MAL ID)
    originalType: 'manga',
    rarity: 'Common',
    parodyBlurb: "Their romance is complicated by his bloodlust and her tendency to get into dangerous situations. Standard vampire stuff.",
    imageUrl: 'https://placehold.co/300x400.png?text=VampireCop&font=lora',
    genreTags: ['Action', 'Drama', 'Fantasy', 'Romance', 'Supernatural', 'Seinen'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'eromanga-sensei-problematic-sibling-comedy',
    parodyTitle: 'Eromanga Sensei: My Little Sister Is My Lewd Manga Artist (It\'s Complicated)',
    originalMalId: 32901, // Eromanga Sensei
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He writes light novels, she illustrates them with... questionable content. Family bonding at its finest?",
    imageUrl: 'https://placehold.co/300x400.png?text=EromangaSister&font=lora',
    genreTags: ['Comedy', 'Drama', 'Ecchi', 'Harem', 'Romance', 'Slice of Life'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'gate-jsdf-invades-fantasy-world',
    parodyTitle: 'GATE: The JSDF Invades a Fantasy World (And It Goes Surprisingly Well)',
    originalMalId: 28907, // Gate: Jieitai Kanochi nite, Kaku Tatakaeri
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Modern military versus dragons and mages. Guess who wins? Also, elf girls.",
    imageUrl: 'https://placehold.co/300x400.png?text=JSDFvsFantasy&font=lora',
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Isekai', 'Military'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'jobless-reincarnation-redemption-arc-deluxe',
    parodyTitle: 'Jobless Reincarnation: From NEET to Actually Trying (Slowly)',
    originalMalId: 39535, // Mushoku Tensei (Same as problematic MC, focusing on redemption arc)
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "A 34-year-old loser gets a second chance at life... and tries not to screw it up quite as badly this time. Keyword: tries.",
    imageUrl: 'https://placehold.co/300x400.png?text=JoblessRedemption&font=lora',
    genreTags: ['Adventure', 'Drama', 'Ecchi', 'Fantasy', 'Isekai'],
    moodTags: ['Epic Adventure', 'Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'kill-la-kill-clothes-are-evil',
    parodyTitle: 'Kill la Kill: Clothes Are Evil (And Also Power-Ups)',
    originalMalId: 18679, // Kill la Kill
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Scissor blades, talking sailor uniforms, and a whole lot of NUDISTO BEACH. Don't lose your way!",
    imageUrl: 'https://placehold.co/300x400.png?text=EvilClothes&font=lora',
    genreTags: ['Action', 'Award Winning', 'Comedy', 'Ecchi', 'School', 'Super Power'],
    moodTags: ['Adrenaline Rush', 'Hilarious'],
  },
  {
    id: 'log-horizon-stuck-in-mmo-but-with-economics',
    parodyTitle: 'Log Horizon: Stuck in an MMO, But With More Spreadsheets',
    originalMalId: 17245, // Log Horizon
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "It's like SAO, but instead of fighting for their lives, they're mostly worried about guild politics and supply chains.",
    imageUrl: 'https://placehold.co/300x400.png?text=MMOspreadsheets&font=lora',
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Game', 'Isekai', 'Magic'],
    moodTags: ['Epic Adventure', 'Dark & Deep'],
  },
  {
    id: 'made-in-abyss-season-2-even-more-suffering',
    parodyTitle: 'Made in Abyss S2: The Suffering Intensifies (Still Cute Tho)',
    originalMalId: 41084, // Made in Abyss: Retsujitsu no Ougonkyou
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "Just when you thought it couldn't get darker or more disturbing... welcome to the Golden City. Bless these poor children.",
    imageUrl: 'https://placehold.co/300x400.png?text=AbyssSufferingS2&font=lora',
    genreTags: ['Adventure', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Sci-Fi'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'monogatari-series-talk-no-jutsu-supreme',
    parodyTitle: 'Monogatari Series: 90% Talking, 10% Supernatural Shenanigans',
    originalMalId: 5081, // Bakemonogatari
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Head tilts, snappy dialogue, and a vampire loli. If you can keep up with the wordplay, you're in for a treat.",
    imageUrl: 'https://placehold.co/300x400.png?text=MonogatariTalk&font=lora',
    genreTags: ['Comedy', 'Mystery', 'Romance', 'Supernatural', 'Vampire'],
    moodTags: ['Dark & Deep', 'Hilarious'],
  },
  {
    id: 'noragami-homeless-god-for-hire',
    parodyTitle: 'Noragami: Your Friendly Neighborhood Homeless God (5 Yen Per Wish)',
    originalMalId: 20507, // Noragami (Placeholder ID, actual: 20507 is Mirai Nikki, Noragami is 20507)
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "He's trying to get a shrine, she's a half-phantom, and his regalia is a sassy teenage boy. Godhood is tough.",
    imageUrl: 'https://placehold.co/300x400.png?text=HomelessGod&font=lora',
    genreTags: ['Action', 'Adventure', 'Comedy', 'Shonen', 'Supernatural'],
    moodTags: ['Adrenaline Rush', 'Hilarious', 'Heartwarming'],
  },
  {
    id: 'overlord-isekai-evil-mc-is-fun',
    parodyTitle: 'Overlord: Being an Evil Skeletal Overlord is Surprisingly Fun',
    originalMalId: 29803, // Overlord
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "He's trapped as his OP guild leader avatar and accidentally conquers the world. Sasuga Ainz-sama!",
    imageUrl: 'https://placehold.co/300x400.png?text=EvilMCFun&font=lora',
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Game', 'Isekai', 'Magic', 'Supernatural'],
    moodTags: ['Epic Adventure', 'Dark & Deep'],
  },
  {
    id: 'psycho-pass-dystopian-future-crime-coefficient',
    parodyTitle: 'Psycho-Pass: Your Crime Coefficient is Too High, Prepare for DOMINATOR',
    originalMalId: 13601, // Psycho-Pass
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "In the future, a supercomputer decides if you're a criminal before you even do anything. What could go wrong?",
    imageUrl: 'https://placehold.co/300x400.png?text=CrimeCoefficient&font=lora',
    genreTags: ['Action', 'Mystery', 'Police', 'Psychological', 'Sci-Fi', 'Suspense'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'steins-gate-0-more-suffering-different-timeline',
    parodyTitle: 'Steins;Gate 0: More Suffering, Different Timeline, Same Sad Okabe',
    originalMalId: 30484, // Steins;Gate 0
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "He couldn't save her, so now he's depressed. But wait, there's AI and more time travel shenanigans! El Psy Kongroo... maybe?",
    imageUrl: 'https://placehold.co/300x400.png?text=SteinsGate0Suffering&font=lora',
    genreTags: ['Drama', 'Psychological', 'Sci-Fi', 'Suspense', 'Thriller', 'Time Travel'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  {
    id: 'sword-of-the-stranger-samurai-movie-peak-animation',
    parodyTitle: 'Sword of the Stranger: The Best Samurai Fight You\'ve Ever Seen',
    originalMalId: 2418, // Stranger: Mukou Hadan
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "A ronin, a kid, and a whole lot of beautifully animated sword fights. The plot is simple, the action is god-tier.",
    imageUrl: 'https://placehold.co/300x400.png?text=PeakSamuraiFight&font=lora',
    genreTags: ['Action', 'Adventure', 'Award Winning', 'Historical', 'Samurai'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure'],
  },
  {
    id: 'toradora-tsundere-romcom-classic',
    parodyTitle: 'Toradora!: The Palm-Top Tiger and the Dense Delinquent-Looking Guy',
    originalMalId: 4224, // Toradora!
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "She's tiny and fierce, he's misunderstood. They team up to help each other with their crushes... and then fall in love. Classic.",
    imageUrl: 'https://placehold.co/300x400.png?text=PalmTopTiger&font=lora',
    genreTags: ['Comedy', 'Drama', 'Romance', 'School', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Emotional Rollercoaster', 'Hilarious'],
  },
  {
    id: 'tower-of-god-manhwa-anime-adaptation',
    parodyTitle: 'Tower of God: Climb the Tower, Find Your Girl (It\'s Complicated)',
    originalMalId: 1151, // Tower of God (Manhwa MAL ID)
    originalType: 'manga', // Original is Manhwa
    rarity: 'Rare',
    parodyBlurb: "He'll do anything to find Rachel, even if it means climbing a giant, deadly tower full of weirdos and tests.",
    imageUrl: 'https://placehold.co/300x400.png?text=ClimbTheTower&font=lora',
    genreTags: ['Action', 'Adventure', 'Drama', 'Fantasy', 'Mystery'],
    moodTags: ['Epic Adventure', 'Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'uzaki-chan-wants-to-hang-out-annoying-but-cute',
    parodyTitle: 'Uzaki-chan Wants to Hang Out (And Annoy You Endlessly, But It\'s Kinda Cute)',
    originalMalId: 41226, // Uzaki-chan wa Asobitai!
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "She's loud, she's smug, she's got a huge... personality. He just wants some peace and quiet. Not gonna happen.",
    imageUrl: 'https://placehold.co/300x400.png?text=AnnoyingUzaki&font=lora',
    genreTags: ['Comedy', 'Ecchi', 'Romance', 'Slice of Life'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'wandering-witch-elaina-travel-and-trauma',
    parodyTitle: 'Wandering Witch: Elaina\'s Travel Blog (Now With More Trauma!)',
    originalMalId: 40571, // Majo no Tabitabi
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A cute witch travels the world, sees pretty places, and occasionally stumbles into horrifying situations. As for me, I'm Elaina.",
    imageUrl: 'https://placehold.co/300x400.png?text=ElainaTraumaBlog&font=lora',
    genreTags: ['Adventure', 'Drama', 'Fantasy'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep', 'Epic Adventure'],
  },
  {
    id: 'wolf-children-single-mom-werewolf-story',
    parodyTitle: 'Wolf Children: Single Mom Raises Werewolf Kids, It\'s Tough',
    originalMalId: 12355, // Ookami Kodomo no Ame to Yuki
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "A beautiful and poignant story about motherhood, identity, and choosing your own path, even if it involves howling at the moon.",
    imageUrl: 'https://placehold.co/300x400.png?text=WolfMom&font=lora',
    genreTags: ['Award Winning', 'Fantasy', 'Slice of Life'],
    moodTags: ['Heartwarming', 'Emotional Rollercoaster'],
  },
  {
    id: 'yuru-camp-comfy-camping-girls',
    parodyTitle: 'Yuru Camp: Maximum Comfiness Achieved Through Camping',
    originalMalId: 34798, // Yuru Camp
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Cute girls go camping. That's it. That's the plot. And it's perfect. Secret Society BLANKET, assemble!",
    imageUrl: 'https://placehold.co/300x400.png?text=ComfyCamp&font=lora',
    genreTags: ['Award Winning', 'Comedy', 'Slice of Life', 'Iyashikei'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
  },
  {
    id: 'zombieland-saga-idol-zombies',
    parodyTitle: 'Zombieland Saga: Zombie Idols Save Saga Prefecture (Somehow)',
    originalMalId: 37976, // Zombie Land Saga
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A group of legendary girls from different eras are resurrected as zombies to become idols. It's exactly as chaotic and amazing as it sounds.",
    imageUrl: 'https://placehold.co/300x400.png?text=ZombieIdols&font=lora',
    genreTags: ['Comedy', 'Music', 'Supernatural', 'Idols (Female)'],
    moodTags: ['Hilarious', 'Heartwarming', 'Adrenaline Rush'],
  },
  {
    id: 'ancient-wyverns-tale-dragon-dad',
    parodyTitle: 'The Ancient Wyvern Who Became My Dad',
    originalMalId: 12403, // Dragon, Ie wo Kau (Dragon Goes House-Hunting) - using related theme
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He's old, scaly, and surprisingly good at parenting. A heartwarming tale of found family and fire breath.",
    imageUrl: 'https://placehold.co/300x400.png?text=DragonDad&font=lora',
    genreTags: ['Fantasy', 'Slice of Life', 'Comedy'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'cat-cafe-chronicles-too-much-fluff',
    parodyTitle: 'Cat Cafe Chronicles: Drowning in Cuteness',
    originalMalId: 38907, // Nekopara
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Work at a cafe run by catgirls. It's exactly as fluffy and slightly problematic as you imagine.",
    imageUrl: 'https://placehold.co/300x400.png?text=FluffCafe&font=lora',
    genreTags: ['Comedy', 'Slice of Life', 'Fantasy', 'Romance'],
    moodTags: ['Comfy & Cozy', 'Heartwarming', 'Hilarious'],
  },
  {
    id: 'cyberpunk-samurai-soul',
    parodyTitle: 'Cyberpunk Samurai: My Katana Has Wi-Fi',
    originalMalId: 42332, // Cyberpunk: Edgerunners
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Neon lights, cybernetic enhancements, and ancient codes of honor clash in this dystopian future. Bushido with bandwidth.",
    imageUrl: 'https://placehold.co/300x400.png?text=WiFiKatana&font=lora',
    genreTags: ['Action', 'Sci-Fi', 'Cyberpunk', 'Drama'],
    moodTags: ['Adrenaline Rush', 'Dark & Deep', 'Epic Adventure'],
  },
  {
    id: 'detective-is-already-dead-but-not-really',
    parodyTitle: 'The Detective Is Already Dead (But Her Ghost Won\'t Leave Me Alone)',
    originalMalId: 46471, // Tantei wa Mou, Shindeiru.
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "She solved her own murder, now her spirit sidekick has to deal with the aftermath. And more cases, apparently.",
    imageUrl: 'https://placehold.co/300x400.png?text=GhostDetective&font=lora',
    genreTags: ['Mystery', 'Romance', 'Drama', 'Supernatural'],
    moodTags: ['Emotional Rollercoaster', 'Dark & Deep'],
  },
  {
    id: 'dragon-maid- Kobayashi-too-relatable',
    parodyTitle: 'Miss Kobayashi\'s Dragon Maid: My Life Is Chaos But The Dragons Are Cute',
    originalMalId: 33206, // Kobayashi-san Chi no Maid Dragon
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "A stoic office worker accidentally ends up with a dragon maid, and then more dragons. It's a slice of life, but with more property damage.",
    imageUrl: 'https://placehold.co/300x400.png?text=DragonChaos&font=lora',
    genreTags: ['Slice of Life', 'Comedy', 'Fantasy', 'Girls Love', 'Mythology'],
    moodTags: ['Comfy & Cozy', 'Heartwarming', 'Hilarious'],
  },
  {
    id: 'elf-archer-tsundere-overload',
    parodyTitle: 'Elf Archer: My Tsundere Level Is Over 9000!',
    originalMalId: 26297, // Goblin Slayer (Plausible source for elf archer trope)
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "It's not like she LIKES shooting arrows with you or anything, b-baka! Highly skilled, highly flustered.",
    imageUrl: 'https://placehold.co/300x400.png?text=TsundereElf&font=lora',
    genreTags: ['Fantasy', 'Action', 'Romance', 'Comedy'],
    moodTags: ['Hilarious', 'Adrenaline Rush'],
  },
  {
    id: 'isekai-cheat-skill-farm',
    parodyTitle: 'I Got a Cheat Skill in Another World and Became Unrivaled in the Real World, Too (Mostly Farming)',
    originalMalId: 52346, // Isekai de Cheat Skill wo Te ni Shita Ore wa, Genjitsu Sekai wo mo Musou Suru
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "One portal later, he's OP in two worlds. But really, he just wants to tend his overpowered crops.",
    imageUrl: 'https://placehold.co/300x400.png?text=CheatFarm&font=lora',
    genreTags: ['Action', 'Adventure', 'Fantasy', 'Isekai', 'Romance', 'School'],
    moodTags: ['Comfy & Cozy', 'Epic Adventure'],
  },
  {
    id: 'knight-and-demon-king-romance',
    parodyTitle: 'The Knight and Her Demon King: Office Romance, Underworld Edition',
    originalMalId: 41380, // Maoujou de Oyasumi (Different context, but fitting for demon king romance)
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "She was supposed to slay him, but HR policies in the demon realm are surprisingly progressive. Now they're dating.",
    imageUrl: 'https://placehold.co/300x400.png?text=DemonOfficeLove&font=lora',
    genreTags: ['Romance', 'Fantasy', 'Comedy', 'Supernatural'],
    moodTags: ['Heartwarming', 'Hilarious'],
  },
  {
    id: 'space-opera-with-talking-cats',
    parodyTitle: 'Galaxy Cats: The Space Opera (But With More Naps)',
    originalMalId: 584, // Outlaw Star (Has a catgirl, close enough)
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "Epic space battles, ancient mysteries, and a ship's cat that's secretly running the whole operation. Meowtstanding.",
    imageUrl: 'https://placehold.co/300x400.png?text=GalaxyCats&font=lora',
    genreTags: ['Sci-Fi', 'Adventure', 'Space', 'Comedy', 'Action'],
    moodTags: ['Epic Adventure', 'Hilarious'],
  },
  {
    id: 'succubus-cafe-slice-of-death',
    parodyTitle: 'Welcome to the Succubus Cafe: Slice of Life (and Death)',
    originalMalId: 41403, // Ishuzoku Reviewers (Adjacent theme)
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "Serving coffee, pastries, and life-draining kisses. Customer service is a killer.",
    imageUrl: 'https://placehold.co/300x400.png?text=SuccubusCafe&font=lora',
    genreTags: ['Comedy', 'Fantasy', 'Ecchi', 'Slice of Life'],
    moodTags: ['Hilarious', 'Dark & Deep'],
  },
  {
    id: 'isekai-pharmacist-revolutionizes-medicine',
    parodyTitle: 'Isekai Pharmacist: Revolutionizing Medieval Medicine with Modern Chemistry',
    originalMalId: 49438, // Isekai Yakkyoku
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "He was a top researcher, now he's teaching knights about germ theory. The real magic was science all along.",
    imageUrl: 'https://placehold.co/300x400.png?text=IsekaiPharmacy&font=lora',
    genreTags: ['Fantasy', 'Isekai', 'Medical'],
    moodTags: ['Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'slime-rancher-in-another-world',
    parodyTitle: 'Slime Rancher: Isekai Edition',
    originalMalId: 39292, // Kami-tachi ni Hirowareta Otoko
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "Reborn with the power to tame slimes. It's less glamorous than it sounds, but surprisingly profitable.",
    imageUrl: 'https://placehold.co/300x400.png?text=SlimeRancherIsekai&font=lora',
    genreTags: ['Fantasy', 'Isekai', 'Slice of Life', 'Iyashikei'],
    moodTags: ['Comfy & Cozy', 'Heartwarming'],
  },
  {
    id: 'assassination-classroom-kill-your-teacher',
    parodyTitle: 'Assassination Classroom: Our Teacher is an Octopus Alien and We Must Kill Him',
    originalMalId: 24833, // Ansatsu Kyoushitsu
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "He'll destroy the Earth, but first, he's gonna teach these delinquents life lessons. Koro-sensei is best teacher.",
    imageUrl: 'https://placehold.co/300x400.png?text=KillOctopusTeacher&font=lora',
    genreTags: ['Action', 'Comedy', 'School', 'Shonen'],
    moodTags: ['Hilarious', 'Heartwarming', 'Emotional Rollercoaster'],
  },
  {
    id: 'durarara-ikebukuro-chaos-simulator',
    parodyTitle: 'Durarara!!: Ikebukuro Is a Mess and I Love It',
    originalMalId: 6746, // Durarara!!
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "Headless riders, super-strong bartenders, color gangs, and a manipulative information broker. Just a normal day in Ikebukuro.",
    imageUrl: 'https://placehold.co/300x400.png?text=IkebukuroChaos&font=lora',
    genreTags: ['Action', 'Mystery', 'Supernatural', 'Psychological', 'Suspense'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'food-dungeon-survival-gourmet',
    parodyTitle: 'Dungeon Meshi: Gourmet Cooking with Monster Parts',
    originalMalId: 85781, // Dungeon Meshi (Manga MAL ID)
    originalType: 'manga',
    rarity: 'Ultra Rare',
    parodyBlurb: "They\'re deep in a dungeon, their sister got eaten by a dragon, and they're broke. Solution? Eat the monsters. Delicious in Dungeon!",
    imageUrl: 'https://placehold.co/300x400.png?text=DungeonGourmet&font=lora',
    genreTags: ['Adventure', 'Comedy', 'Fantasy', 'Gourmet', 'Seinen'],
    moodTags: ['Hilarious', 'Epic Adventure', 'Comfy & Cozy'],
  },
  {
    id: 'rezero-emilia-best-girl-debate-club',
    parodyTitle: 'Re:Zero - Emilia Best Girl Debate Club (Subaru Suffers in Background)',
    originalMalId: 31240, // Re:Zero kara Hajimeru Isekai Seikatsu
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "While Subaru dies repeatedly, the real battle is fought in online forums. EMT! No, Rem! It never ends.",
    imageUrl: 'https://placehold.co/300x400.png?text=EmiliaBestGirl&font=lora',
    genreTags: ['Fantasy', 'Isekai', 'Drama', 'Meta', 'Comedy'],
    moodTags: ['Emotional Rollercoaster', 'Hilarious'],
    isEvolvedForm: true, // Assuming 'Suffering Loop' is base
  },
  {
    id: 'oshi-no-ko-entertainment-industry-dark-side',
    parodyTitle: '[Oshi no Ko]: The Dark Side of Showbiz (with Reincarnation and Revenge)',
    originalMalId: 130907, // [Oshi no Ko] (Manga MAL ID)
    originalType: 'manga',
    rarity: 'Legendary',
    parodyBlurb: "An idol, her reincarnated superfan children, and a quest for revenge against the entertainment industry. It gets dark.",
    imageUrl: 'https://placehold.co/300x400.png?text=OshiNoKoDark&font=lora',
    genreTags: ['Drama', 'Mystery', 'Reincarnation', 'Supernatural', 'Seinen', 'Psychological'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster'],
  },
  // Start of Batch 2 (Creative continuation)
  {
    id: 'blend-s-surprise-sadistic-smile',
    parodyTitle: 'Blend S: Service with a (Surprise! Sadistic!) Smile',
    originalMalId: 34618, // Blend S
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "She just wants to be sweet, but her default expression is pure evil. Perfect for a character cafe!",
    imageUrl: 'https://placehold.co/300x400.png?text=SadisticSmile&font=lora',
    genreTags: ['Comedy', 'Slice of Life', 'Workplace'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'darling-in-the-franxx-angsty-teens-giant-robots-again',
    parodyTitle: 'Darling in the FranXX: Angsty Teens Pilot Lewd Robots (Again, but Different)',
    originalMalId: 35849, // Darling in the FranXX
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "The future is bleak, monsters attack, and only teens in suggestive mechs can save humanity. Oh, and there's a dino girl.",
    imageUrl: 'https://placehold.co/300x400.png?text=LewdRobots&font=lora',
    genreTags: ['Action', 'Drama', 'Mecha', 'Romance', 'Sci-Fi'],
    moodTags: ['Emotional Rollercoaster', 'Adrenaline Rush', 'Dark & Deep'],
  },
  {
    id: 'erased-who-dunnit-time-loop',
    parodyTitle: 'Erased: Butterfly Effect Detective Agency',
    originalMalId: 32281, // Boku dake ga Inai Machi
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "He can go back in time a few minutes to prevent disasters... or get stuck in his childhood solving a murder mystery. High stakes!",
    imageUrl: 'https://placehold.co/300x400.png?text=ButterflyDetective&font=lora',
    genreTags: ['Mystery', 'Psychological', 'Supernatural', 'Suspense', 'Time Travel'],
    moodTags: ['Dark & Deep', 'Adrenaline Rush'],
  },
  {
    id: 'gabriel-dropout-fallen-angel-neet',
    parodyTitle: 'Gabriel DropOut: Top Angel Becomes Ultimate NEET Gamer',
    originalMalId: 33731, // Gabriel DropOut
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "She was supposed to guide humanity, but online games are way more interesting. Now she's a lazy, game-addicted slob. Relatable.",
    imageUrl: 'https://placehold.co/300x400.png?text=AngelNEET&font=lora',
    genreTags: ['Comedy', 'School', 'Slice of Life', 'Supernatural'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  {
    id: 'gurren-lagann-drill-pierce-the-heavens',
    parodyTitle: 'Gurren Lagann: My Drill Is The Drill That Will Pierce The Heavens (And Logic)',
    originalMalId: 2001, // Tengen Toppa Gurren Lagann
    originalType: 'anime',
    rarity: 'Mythic',
    parodyBlurb: "It starts in a hole, ends with galaxies being thrown around. Don't believe in yourself, believe in the Kamina who believes in you! ROW ROW FIGHT THE POWAH!",
    imageUrl: 'https://placehold.co/300x400.png?text=DrillHeavens&font=lora',
    genreTags: ['Action', 'Adventure', 'Award Winning', 'Comedy', 'Mecha', 'Sci-Fi'],
    moodTags: ['Adrenaline Rush', 'Epic Adventure', 'Hilarious'],
  },
  {
    id: 'hinamatsuri-yakuza-psychic-daughter',
    parodyTitle: 'Hinamatsuri: Yakuza Adopts Psychic Girl, Hilarity Ensues',
    originalMalId: 36296, // Hinamatsuri
    originalType: 'anime',
    rarity: 'Rare',
    parodyBlurb: "A stoic yakuza member suddenly becomes the caretaker of a deadpan, all-powerful psychic child. His life will never be the same.",
    imageUrl: 'https://placehold.co/300x400.png?text=YakuzaPsychic&font=lora',
    genreTags: ['Comedy', 'Sci-Fi', 'Seinen', 'Slice of Life', 'Supernatural'],
    moodTags: ['Hilarious', 'Heartwarming', 'Comfy & Cozy'],
  },
  {
    id: 'initial-d-eurobeat-drift-king',
    parodyTitle: 'Initial D: Eurobeat Intensifies While Tofu Gets Delivered',
    originalMalId: 185, // Initial D First Stage
    originalType: 'anime',
    rarity: 'Legendary',
    parodyBlurb: "He's just a tofu delivery boy, but on the mountain pass, he's the Drift King. DEJA VU!",
    imageUrl: 'https://placehold.co/300x400.png?text=EurobeatDrift&font=lora',
    genreTags: ['Action', 'Cars', 'Drama', 'Seinen', 'Sports'],
    moodTags: ['Adrenaline Rush'],
  },
  {
    id: 'interviews-with-monster-girls-demi-chans-are-cute',
    parodyTitle: 'Interviews with Monster Girls: My Students Are Monsters (Literally, and It\'s Cute)',
    originalMalId: 33430, // Demi-chan wa Kataritai
    originalType: 'anime',
    rarity: 'Common',
    parodyBlurb: "A biology teacher navigates teaching a vampire, a dullahan, a snow woman, and a succubus. Wholesome and educational-ish.",
    imageUrl: 'https://placehold.co/300x400.png?text=CuteMonsterStudents&font=lora',
    genreTags: ['Comedy', 'Fantasy', 'School', 'Seinen', 'Slice of Life', 'Supernatural', 'Vampire'],
    moodTags: ['Heartwarming', 'Comfy & Cozy', 'Hilarious'],
  },
  {
    id: 'land-of-the-lustrous-gem-people-suffering',
    parodyTitle: 'Land of the Lustrous: Pretty Gem People Suffer Beautifully',
    originalMalId: 92507, // Houseki no Kuni (Manga MAL ID)
    originalType: 'manga',
    rarity: 'Legendary',
    parodyBlurb: "Immortal gem beings fight moon people who want to turn them into jewelry. Existential, gorgeous, and full of body horror.",
    imageUrl: 'https://placehold.co/300x400.png?text=GemSuffering&font=lora',
    genreTags: ['Action', 'Award Winning', 'Drama', 'Fantasy', 'Mystery', 'Psychological', 'Sci-Fi', 'Seinen'],
    moodTags: ['Dark & Deep', 'Emotional Rollercoaster', 'Epic Adventure'],
  },
  {
    id: 'nichijou-my-ordinary-life-is-anything-but',
    parodyTitle: 'Nichijou: My Ordinary Life is an Absurdist Fever Dream',
    originalMalId: 10165, // Nichijou
    originalType: 'anime',
    rarity: 'Ultra Rare',
    parodyBlurb: "A robot girl, a talking cat, a principal who suplexes deer. Just everyday occurrences in this perfectly normal high school.",
    imageUrl: 'https://placehold.co/300x400.png?text=AbsurdistLife&font=lora',
    genreTags: ['Comedy', 'School', 'Slice of Life', 'Gag Humor'],
    moodTags: ['Hilarious', 'Comfy & Cozy'],
  },
  // NOTE: THIS IS THE END OF THE 50 NEW CARDS. I WILL CONTINUE ADDING MORE IN SUBSEQUENT TURNS.
  // The existing cards below this line are the ones we had before this expansion.
];
// Removed getRarityColorClasses as it's now defined in gacha/page.tsx
// The list above now contains the original set + approximately 50 new ones.
// Further expansion will continue in the next response if needed.

```
  </change>
  <change>
    <file>/src/config/gachaConfig.ts</file>
    <content><![CDATA[// src/config/gachaConfig.ts
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
        `GACHA WARNING: GACHA_RARITY_RATES do not sum to 1.0 (Current sum: ${baseRateSum}). ` +
        `Drop rates will be normalized, but this may indicate a configuration error.`
    );
}
