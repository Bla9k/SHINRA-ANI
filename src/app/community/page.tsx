
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BookText,
  MessageSquare,
  Hash,
  Mic,
  Settings,
  Plus,
  HelpCircle,
  Compass,
  Headphones,
  User as UserIcon,
  LogOut,
  Bot,
  Palette,
  Upload,
  X,
  Search,
  PlusCircle,
  Swords, // Example icon for Action
  Sparkles, // Example icon for Fantasy
  Heart, // Example icon for Romance
  Rocket, // Example icon for Sci-Fi
  Flame, // Example icon for Trending
  MessageCircle, // For comments
  Newspaper, // For announcements/features
  Info, // For how-to guides
  List, // For endpoints/features
  Github, // Example for external links if needed
  ArrowRight
} from 'lucide-react'; // Import icons
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// --- Dummy Data (Revised for Jikan-like Structure) ---

const dummyFeaturedCommunities = [
    { id: '1', name: 'Action Hub', description: 'Discuss the latest fights & power levels!', icon: Swords, imageUrl: 'https://picsum.photos/seed/action/80/80' },
    { id: '2', name: 'Berserk Fans', description: 'Analysis, theories, and fan art for strugglers.', icon: Flame, imageUrl: 'https://picsum.photos/seed/berserk/80/80' },
    { id: '3', name: 'Isekai Tavern', description: 'Share your other-world adventures!', icon: Sparkles, imageUrl: 'https://picsum.photos/seed/isekai/80/80' },
    { id: '4', name: 'Romance Corner', description: 'All things love and relationships in anime/manga.', icon: Heart, imageUrl: 'https://picsum.photos/seed/romance/80/80' },
];

const dummyTopComments = [
    { id: 'c1', user: 'GutsBestBoy', community: 'Berserk Fans', text: "Just reread the Golden Age arc... masterpiece.", timestamp: "2h ago" },
    { id: 'c2', user: 'ShinraFanatic', community: 'Action Hub', text: "That new mecha anime trailer looks insane!", timestamp: "5h ago" },
    { id: 'c3', user: 'IsekaiDreamer', community: 'Isekai Tavern', text: "Reincarnated as a vending machine, AMA.", timestamp: "1d ago" },
];

const dummyAllCommunities = [
    ...dummyFeaturedCommunities,
    { id: '5', name: 'Sci-Fi Nexus', description: 'Explore futuristic worlds and tech.', icon: Rocket, imageUrl: 'https://picsum.photos/seed/scifi/80/80' },
    { id: '6', name: 'Manga Creators HQ', description: 'Share tips, feedback, and collaborate.', icon: BookText, imageUrl: 'https://picsum.photos/seed/creators/80/80' },
    { id: '7', name: 'Slice of Life Cafe', description: 'Relax and discuss comfy series.', icon: UserIcon, imageUrl: 'https://picsum.photos/seed/sol/80/80' },
];

const dummyFeatures = [
    { name: 'Indie Manga Uploads', description: 'Share your original manga creations.', icon: Upload },
    { name: 'Text & Voice Chat', description: 'Real-time discussion rooms.', icon: MessageSquare },
    { name: 'Community Creation', description: 'Start your own themed community.', icon: Users },
    { name: 'Nami AI Integration', description: 'AI-powered chat and recommendations.', icon: Bot },
    { name: 'Profile Customization', description: 'Personalize your Shinra-Ani identity.', icon: Palette },
    { name: 'Events & Competitions', description: 'Join community challenges.', icon: Swords }, // Placeholder icon
];

const dummyUpcomingFeatures = [
    { name: 'Creator Subscriptions', date: 'Soon™' },
    { name: 'Advanced Moderation Tools', date: 'Q4 2024' },
    { name: 'Live Watch Parties', date: 'TBD' },
];

const dummyIndieManga = [
  { id: 1, title: 'Galactic Gourmet', author: 'CosmoChef', imageUrl: 'https://picsum.photos/200/300?random=10', genre: ['Sci-Fi', 'Cooking'] },
  { id: 2, title: 'Urban Necromancer', author: 'GraveWalker', imageUrl: 'https://picsum.photos/200/300?random=11', genre: ['Fantasy', 'Urban'] },
  { id: 3, title: 'Mecha Gardeners', author: 'PlantBot', imageUrl: 'https://picsum.photos/200/300?random=12', genre: ['Mecha', 'Slice of Life'] },
  { id: 4, title: 'Samurai Squirrel', author: 'BushidoBlade', imageUrl: 'https://picsum.photos/200/300?random=13', genre: ['Action', 'Animals'] },
];

// --- Reusable Components ---

// Card for showcasing a community
const CommunityCard = ({ community }: { community: any }) => (
    <Card className="glass neon-glow-hover h-full flex flex-col transition-all duration-300 hover:border-primary/50 group">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-12 w-12 border-2 border-primary/30 group-hover:border-primary transition-colors">
                <AvatarImage src={community.imageUrl} alt={community.name} />
                <AvatarFallback><community.icon size={20} /></AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <CardTitle className="text-base group-hover:text-primary transition-colors">{community.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{community.description}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="pt-2 mt-auto flex justify-end">
            {/* TODO: Link to actual community page */}
            <Button variant="link" size="sm" className="text-xs h-auto p-0 group-hover:underline text-primary">
                Join Community <ArrowRight size={12} className="ml-1"/>
            </Button>
        </CardContent>
    </Card>
);

// Card for showcasing a feature
const FeatureCard = ({ feature }: { feature: any }) => (
    <Card className="glass h-full flex flex-col p-4 items-center text-center transition-transform duration-300 hover:scale-105 border border-transparent hover:border-primary/30">
        <feature.icon className="w-8 h-8 mb-2 text-primary" />
        <CardTitle className="text-sm font-semibold mb-1">{feature.name}</CardTitle>
        <CardDescription className="text-xs">{feature.description}</CardDescription>
    </Card>
);

// Card for showcasing indie manga (Simplified)
const IndieMangaCard = ({ manga }: { manga: any }) => (
    <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-[1.02] group h-full flex flex-col border-primary/10 hover:border-primary/30">
      <CardHeader className="p-0 relative aspect-[2/3] w-full">
        <Image
          src={manga.imageUrl || 'https://picsum.photos/200/300?grayscale'}
          alt={manga.title}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 23vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
         <div className="absolute bottom-2 left-2 right-2 z-10">
           <CardTitle className="text-sm font-semibold text-primary-foreground line-clamp-1 shadow-text group-hover:text-primary transition-colors">{manga.title}</CardTitle>
         </div>
      </CardHeader>
      <CardContent className="p-3 flex flex-col flex-grow">
        <p className="text-xs text-muted-foreground mb-1">by {manga.author}</p>
        <div className="flex gap-1 mb-2 flex-wrap">
           {manga.genre.map((g: string) => <Badge key={g} variant="secondary" className="text-[10px]">{g}</Badge>)}
        </div>
        <div className="mt-auto flex justify-end">
            <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto group-hover:underline text-primary">
               {/* TODO: Update link to actual indie manga reader page */}
               <Link href={`/community/manga/${manga.id}`}>
                  Read Now <ArrowRight size={12} className="ml-1"/>
               </Link>
            </Button>
        </div>
      </CardContent>
     </Card>
);

// --- Community Page Component ---

export default function CommunityPage() {
  return (
    // Use ScrollArea for the entire page content to manage scrolling
    <ScrollArea className="h-full">
        <div className="container mx-auto px-4 py-8 space-y-12 md:space-y-16">

          {/* Section 1: Hero Area (Like Jikan Top) */}
          <section className="text-center relative overflow-hidden rounded-lg p-8 md:p-12 glass border-primary/20 shadow-xl backdrop-blur-xl bg-card/60">
               {/* Subtle background effect */}
                <div className="absolute inset-0 -z-10 opacity-10">
                   {/* Could add a subtle pattern or gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-blue-900/30"></div>
                </div>

              <Users className="w-12 h-12 mx-auto mb-4 text-primary neon-glow" />
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Shinra-Ani Community Hub</h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                 Connect with fellow fans, discover indie creators, and dive into discussions.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                 {dummyFeaturedCommunities.map((community) => (
                    <Link href="#" key={community.id} className="block group">
                        <Card className="glass p-3 text-center transition-all duration-300 hover:scale-105 hover:bg-primary/10 border border-transparent hover:border-primary/30">
                             <Avatar className="h-10 w-10 mx-auto mb-1 border-2 border-primary/50 group-hover:border-primary transition-colors">
                                <AvatarImage src={community.imageUrl} alt={community.name} />
                                <AvatarFallback><community.icon size={16} /></AvatarFallback>
                            </Avatar>
                            <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">{community.name}</p>
                        </Card>
                    </Link>
                 ))}
              </div>
              <div className="mt-6 flex justify-center gap-3">
                  <Button size="lg" className="neon-glow-hover" asChild>
                      <Link href="#community-directory">Explore Communities</Link>
                  </Button>
                   <Button size="lg" variant="outline" className="glass neon-glow-hover" asChild>
                       <Link href="/upload">
                          <Upload size={18} className="mr-2"/> Upload Manga
                       </Link>
                   </Button>
              </div>
          </section>

          {/* Section 2: Top Interactions (Replacing Jikan's Free & Open Source) */}
           <section id="top-interactions">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                 <MessageCircle className="text-primary"/> Top Discussions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {dummyTopComments.map((comment) => (
                     <Card key={comment.id} className="glass p-4 flex flex-col group hover:bg-accent/10 transition-colors">
                       <p className="text-sm text-foreground/90 mb-2 flex-grow">"{comment.text}"</p>
                       <div className="text-xs text-muted-foreground flex justify-between items-center mt-auto pt-2 border-t border-border/50">
                           <span>by <strong className="text-primary group-hover:underline">{comment.user}</strong> in <span className="italic">{comment.community}</span></span>
                           <span>{comment.timestamp}</span>
                       </div>
                     </Card>
                 ))}
              </div>
           </section>

           <Separator className="bg-border/50"/>

          {/* Section 3: Community Directory (Replacing Jikan's Powered By) */}
           <section id="community-directory">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Compass className="text-primary"/> Community Directory
                 </h2>
                  <Button variant="outline" size="sm" className="glass neon-glow-hover" asChild>
                       <Link href="#">
                           <PlusCircle size={16} className="mr-1.5"/> Create New
                       </Link>
                   </Button>
              </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   {dummyAllCommunities.map((community) => (
                       <CommunityCard key={community.id} community={community} />
                   ))}
               </div>
           </section>

           <Separator className="bg-border/50"/>

          {/* Section 4: Available Features (Replacing Jikan's Available Endpoints) */}
           <section id="features">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                 <List className="text-primary"/> What You Can Do Here
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {dummyFeatures.map((feature) => (
                       <FeatureCard key={feature.name} feature={feature} />
                  ))}
              </div>
           </section>

           <Separator className="bg-border/50"/>

           {/* Section 5: Upcoming Features & How-to Guides (Mixed Section) */}
           <section id="guides-and-upcoming" className="grid md:grid-cols-2 gap-8">
               {/* How-to Guides */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Info className="text-primary"/> How Does It Work?</h2>
                    <div className="space-y-3">
                         <Card className="glass p-4 transition-colors hover:bg-accent/10">
                             <CardTitle className="text-base mb-1 flex items-center gap-1.5"><Users size={16} className="text-primary"/> Creating & Joining</CardTitle>
                            <CardDescription className="text-xs">Learn how to create your own community or find and join existing ones based on your interests.</CardDescription>
                             <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1 text-primary">Read Guide <ArrowRight size={12} className="ml-1"/></Button>
                        </Card>
                         <Card className="glass p-4 transition-colors hover:bg-accent/10">
                             <CardTitle className="text-base mb-1 flex items-center gap-1.5"><Upload size={16} className="text-primary"/> Uploading Manga</CardTitle>
                            <CardDescription className="text-xs">Step-by-step guide on uploading your manga chapters, cover art, and details.</CardDescription>
                             <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1 text-primary">Read Guide <ArrowRight size={12} className="ml-1"/></Button>
                        </Card>
                         <Card className="glass p-4 transition-colors hover:bg-accent/10">
                             <CardTitle className="text-base mb-1 flex items-center gap-1.5"><MessageSquare size={16} className="text-primary"/> Using Chat</CardTitle>
                            <CardDescription className="text-xs">Understand text/voice channels, private messages, and chat commands.</CardDescription>
                             <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1 text-primary">Read Guide <ArrowRight size={12} className="ml-1"/></Button>
                        </Card>
                    </div>
                </div>

                 {/* Upcoming Features */}
                <div>
                   <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Rocket className="text-primary"/> Upcoming Features</h2>
                   <Card className="glass p-4">
                        <ul className="space-y-2">
                           {dummyUpcomingFeatures.map((feature) => (
                               <li key={feature.name} className="flex justify-between items-center text-sm border-b border-border/30 pb-1.5 last:border-b-0">
                                   <span className="text-foreground/90">{feature.name}</span>
                                   <Badge variant="outline" className="text-xs">{feature.date}</Badge>
                               </li>
                           ))}
                        </ul>
                   </Card>
                </div>
           </section>

           <Separator className="bg-border/50"/>

           {/* Section 6: Featured Indie Manga (Replacing Jikan Integrations) */}
           <section id="featured-indie">
               <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <BookText className="text-primary"/> Featured Indie Manga
               </h2>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                   {dummyIndieManga.slice(0, 5).map((manga) => ( // Show limited number
                       <IndieMangaCard key={manga.id} manga={manga} />
                   ))}
               </div>
               {/* Optional: Link to a dedicated Indie Manga browse page */}
               {/* <div className="mt-4 text-center">
                    <Button variant="outline" className="glass neon-glow-hover" asChild>
                       <Link href="/community/indie">Browse All Indie Manga</Link>
                   </Button>
               </div> */}
           </section>

        </div>

         {/* Footer-like section (optional) */}
         <footer className="text-center py-8 mt-12 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
                Shinra-Ani Community Hub - &copy; {new Date().getFullYear()}
            </p>
            {/* Add social links or other footer content if needed */}
        </footer>
    </ScrollArea>
  );
}
