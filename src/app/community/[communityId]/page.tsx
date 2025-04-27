
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Users, MessageSquare, Hash, Settings, Mic } from 'lucide-react'; // Added Mic import
import Link from 'next/link';

// Dummy data for a single community (replace with actual fetch)
const dummyCommunities: { [key: string]: any } = {
    'action-hub': { id: 'action-hub', name: 'Action Hub', description: 'Discuss the latest fights & power levels!', icon: Users, imageUrl: 'https://picsum.photos/seed/action/100/100', memberCount: 1234, onlineCount: 156 },
    'berserk-fans': { id: 'berserk-fans', name: 'Berserk Fans', description: 'Analysis, theories, and fan art for strugglers.', icon: Users, imageUrl: 'https://picsum.photos/seed/berserk/100/100', memberCount: 876, onlineCount: 92 },
    'isekai-tavern': { id: 'isekai-tavern', name: 'Isekai Tavern', description: 'Share your other-world adventures!', icon: Users, imageUrl: 'https://picsum.photos/seed/isekai/100/100', memberCount: 543, onlineCount: 78 },
    'romance-corner': { id: 'romance-corner', name: 'Romance Corner', description: 'All things love and relationships in anime/manga.', icon: Users, imageUrl: 'https://picsum.photos/seed/romance/100/100', memberCount: 654, onlineCount: 112 },
    'sci-fi-nexus': { id: 'sci-fi-nexus', name: 'Sci-Fi Nexus', description: 'Explore futuristic worlds and tech.', icon: Users, imageUrl: 'https://picsum.photos/seed/scifi/100/100', memberCount: 432, onlineCount: 65 },
    'manga-creators-hq': { id: 'manga-creators-hq', name: 'Manga Creators HQ', description: 'Share tips, feedback, and collaborate.', icon: Users, imageUrl: 'https://picsum.photos/seed/creators/100/100', memberCount: 321, onlineCount: 43 },
    'slice-of-life-cafe': { id: 'slice-of-life-cafe', name: 'Slice of Life Cafe', description: 'Relax and discuss comfy series.', icon: Users, imageUrl: 'https://picsum.photos/seed/sol/100/100', memberCount: 789, onlineCount: 134 },
};

// Dummy chat channels
const dummyChannels = [
    { id: 'general', name: 'general', type: 'text' },
    { id: 'announcements', name: 'announcements', type: 'text' },
    { id: 'fan-art', name: 'fan-art', type: 'text' },
    { id: 'spoilers', name: 'spoilers', type: 'text' },
    { id: 'voice-lounge', name: 'Voice Lounge', type: 'voice' },
];

// Dummy messages
const dummyMessages = [
    { id: 'm1', user: 'ShinraFanatic', text: 'Welcome to the community!', timestamp: '10:00 AM' },
    { id: 'm2', user: 'NamiAI', text: 'Remember to follow the community guidelines.', timestamp: '10:01 AM' },
    { id: 'm3', user: 'GutsBestBoy', text: 'Anyone read the latest chapter?', timestamp: '10:05 AM' },
];

export default function CommunityDetailPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const community = dummyCommunities[communityId]; // Fetch real data based on ID

  if (!community) {
    // Handle case where community doesn't exist (e.g., show a 404 or redirect)
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold text-destructive">Community Not Found</h1>
            <p className="text-muted-foreground mt-2">The community you're looking for doesn't exist.</p>
             <Link href="/community" passHref legacyBehavior>
                <Button variant="link" className="mt-4">Back to Communities</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for Channels */}
      <div className="w-60 md:w-72 flex-shrink-0 bg-card border-r border-border/50 flex flex-col">
         <CardHeader className="p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={community.imageUrl} alt={community.name} />
                    <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base">{community.name}</CardTitle>
                    <CardDescription className="text-xs">{community.memberCount} Members</CardDescription>
                </div>
                 {/* Settings Icon (Placeholder) */}
                 <Button variant="ghost" size="icon" className="ml-auto h-7 w-7">
                    <Settings size={16} />
                </Button>
            </div>
         </CardHeader>
        <ScrollArea className="flex-grow p-2">
            <div className="space-y-1">
                {dummyChannels.filter(c => c.type === 'text').map(channel => (
                    <Button key={channel.id} variant="ghost" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 h-8">
                        <Hash size={16} className="mr-2"/> {channel.name}
                    </Button>
                ))}
                 <Separator className="my-2"/>
                 <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Voice Channels</p>
                 {dummyChannels.filter(c => c.type === 'voice').map(channel => (
                    <Button key={channel.id} variant="ghost" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 h-8">
                        <Mic size={16} className="mr-2"/> {channel.name}
                    </Button>
                 ))}
            </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Chat Header */}
        <div className="h-16 flex items-center px-4 border-b border-border/50 flex-shrink-0">
            <Hash size={20} className="text-muted-foreground mr-2"/>
            <h2 className="text-lg font-semibold">general</h2> {/* TODO: Make dynamic based on selected channel */}
            {/* Add topic or search icon here later */}
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
                {dummyMessages.map(message => (
                   <div key={message.id} className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 mt-1">
                           {/* Fetch user avatar based on message.user */}
                           <AvatarImage src={`https://picsum.photos/seed/${message.user}/40/40`} alt={message.user} />
                           <AvatarFallback>{message.user.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                           <div className="flex items-baseline gap-2">
                              <span className="font-semibold text-sm text-primary">{message.user}</span>
                              <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                           </div>
                           <p className="text-base">{message.text}</p>
                        </div>
                   </div>
                ))}
            </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border/50 flex-shrink-0">
            {/* TODO: Implement actual message input component */}
             <div className="flex items-center gap-2 bg-card border border-input rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
                <MessageSquare size={18} className="text-muted-foreground"/>
                <input
                    type="text"
                    placeholder="Message #general..." // Make dynamic
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
                 {/* Add emoji picker, file upload buttons here */}
             </div>
        </div>
      </div>

      {/* Optional: Member List Sidebar */}
      {/* <div className="w-60 bg-card border-l border-border/50"> ... </div> */}
    </div>
  );
}

