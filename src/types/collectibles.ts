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
    originalMalId: 120, // One Punch Man (Manga MAL ID)
    originalType: 'manga',
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
    originalMalId: 10032, // Danganronpa (Game, often associated with anime 1502)
    originalType: 'anime', // Assuming anime adaptation 32182
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
    originalMalId: 1577, // Vampire Knight (Manga MAL ID)
    originalType: 'manga',
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
  }
];
// Removed getRarityColorClasses as it's now defined in gacha/page.tsx
