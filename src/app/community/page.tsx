
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Use Tabs
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Search
} from 'lucide-react'; // Import icons
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// --- Dummy Data (Keep for structure, simplify if needed) ---
const dummyServers = [
  // Simplified: maybe just represent communities/topics
  { id: '1', name: 'Action Hub' },
  { id: '2', name: 'Berserk Fans' },
  { id: '3', name: 'Isekai Tavern' },
  { id: '4', name: 'Romance Corner' },
];

const dummyChannels = {
  '1': [
    { id: '1-general', name: 'general-action', type: 'text' },
    { id: '1-recommendations', name: 'recs', type: 'text' },
    { id: '1-voice', name: 'Action Hangout', type: 'voice' },
  ],
  '2': [
    { id: '2-discussion', name: 'struggler-talk', type: 'text' },
    { id: '2-art', name: 'fan-art', type: 'text' },
    { id: '2-voice', name: 'Eclipse Watch Party', type: 'voice' },
  ],
   '3': [
    { id: '3-general', name: 'isekai-lounge', type: 'text' },
    { id: '3-memes', name: 'isekai-memes', type: 'text' },
    { id: '3-voice', name: 'Truck-kun Fanclub', type: 'voice' },
  ],
   '4': [
    { id: '4-general', name: 'romance-cafe', type: 'text' },
    { id: '4-new-reads', name: 'new-releases', type: 'text' },
    { id: '4-voice', name: 'Heart-to-Heart', type: 'voice' },
  ],
};

const dummyUsers = [
    { id: 'u1', name: 'ShinraFanatic', avatarUrl: 'https://picsum.photos/seed/u1/32/32', status: 'online' },
    { id: 'u2', name: 'GutsBestBoy', avatarUrl: 'https://picsum.photos/seed/u2/32/32', status: 'online' },
    { id: 'u3', name: 'IsekaiDreamer', avatarUrl: 'https://picsum.photos/seed/u3/32/32', status: 'idle' },
    { id: 'u4', name: 'RomanceLover', avatarUrl: 'https://picsum.photos/seed/u4/32/32', status: 'offline' },
    { id: 'nami-bot', name: 'Nami AI', avatarUrl: 'https://picsum.photos/seed/nami/32/32', status: 'bot' },
];

const dummyMessages = {
    '1-general': [
        { id: 'm1', userId: 'u1', content: 'Anyone seen the latest action anime trailers?', timestamp: '10:30 AM' },
        { id: 'm2', userId: 'u2', content: 'Yeah, that new mecha one looks insane!', timestamp: '10:31 AM' },
        { id: 'm3', userId: 'u1', content: 'Totally!', timestamp: '10:31 AM' },
    ],
    '2-discussion': [
        { id: 'm4', userId: 'u2', content: 'Just reread the Golden Age arc... masterpiece.', timestamp: 'Yesterday' },
        { id: 'm5', userId: 'u4', content: 'It truly is!', timestamp: 'Yesterday' },
    ],
    // Add more messages for other channels
     '3-general': [
        { id: 'm6', userId: 'u3', content: 'Just got reincarnated as a vending machine, AMA.', timestamp: '11:00 AM' },
     ],
      '4-general': [
        { id: 'm7', userId: 'u4', content: 'Any good fluffy romance recommendations?', timestamp: 'Yesterday PM' },
     ]
};

const dummyIndieManga = [
  { id: 1, title: 'Galactic Gourmet', author: 'CosmoChef', imageUrl: 'https://picsum.photos/200/300?random=10', genre: ['Sci-Fi', 'Cooking'], description: 'A chef explores the universe searching for exotic ingredients.' },
  { id: 2, title: 'Urban Necromancer', author: 'GraveWalker', imageUrl: 'https://picsum.photos/200/300?random=11', genre: ['Fantasy', 'Urban'], description: 'A necromancer tries to live a normal life in the big city.' },
  { id: 3, title: 'Mecha Gardeners', author: 'PlantBot', imageUrl: 'https://picsum.photos/200/300?random=12', genre: ['Mecha', 'Slice of Life'], description: 'Giant robots tending to giant gardens.' },
  { id: 4, title: 'Samurai Squirrel', author: 'BushidoBlade', imageUrl: 'https://picsum.photos/200/300?random=13', genre: ['Action', 'Animals'], description: 'A squirrel follows the path of the samurai.' },
];

type IndieManga = typeof dummyIndieManga[0];

// --- Redesigned Components ---

// Minimalist Chat Message
const ChatMessage = ({ message }: { message: any }) => {
    const user = dummyUsers.find(u => u.id === message.userId);
    if (!user) return null; // Don't render if user not found

    return (
        <div className="flex items-start gap-3 p-2 rounded-sm group hover:bg-accent/10 transition-colors">
            <Avatar className="w-8 h-8 mt-0.5 flex-shrink-0 group-hover:scale-105 transition-transform">
                 <AvatarImage src={user.avatarUrl} alt={user.name} />
                 <AvatarFallback>{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
             </Avatar>
             <div className="flex-grow">
                 <div className="flex items-baseline gap-2 mb-0.5">
                     <span className="font-semibold text-sm text-primary group-hover:text-primary-foreground transition-colors">{user.name}</span>
                     <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                 </div>
                 <p className="text-sm text-foreground/90 leading-normal">{message.content}</p>
             </div>
        </div>
    );
};

// Simplified Indie Manga Card
const IndieMangaCard = ({ manga }: { manga: IndieManga }) => (
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
           {manga.genre.map(g => <Badge key={g} variant="secondary" className="text-[10px]">{g}</Badge>)}
        </div>
        <CardDescription className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-grow">
           {manga.description}
         </CardDescription>
        <div className="mt-auto flex justify-end">
            <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto group-hover:underline text-primary">
               {/* TODO: Update link to actual indie manga reader page */}
               <Link href={`/community/manga/${manga.id}`}>
                  Read Now
               </Link>
            </Button>
        </div>
      </CardContent>
     </Card>
);

// Indie Manga Skeleton Card (Simplified)
const IndieMangaSkeletonCard = () => (
    <Card className="overflow-hidden glass h-full flex flex-col border-primary/10">
       <CardHeader className="p-0 relative aspect-[2/3] w-full">
          <Skeleton className="h-full w-full" />
       </CardHeader>
       <CardContent className="p-3 space-y-2 flex flex-col flex-grow">
          <Skeleton className="h-4 w-3/4" /> {/* Title */}
          <Skeleton className="h-3 w-1/2 mb-1" /> {/* Author */}
           <div className="flex gap-1 flex-wrap"> {/* Genres */}
              <Skeleton className="h-4 w-10 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
           </div>
          <Skeleton className="h-3 w-full" /> {/* Desc line 1 */}
          <Skeleton className="h-3 w-5/6 mb-2" /> {/* Desc line 2 */}
          <div className="flex-grow" /> {/* Spacer */}
           <div className="flex justify-end mt-auto"> {/* Button */}
              <Skeleton className="h-5 w-16" />
           </div>
       </CardContent>
    </Card>
 );

// --- New Page Structure ---

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('servers'); // Default tab
  const [selectedServer, setSelectedServer] = useState<any>(dummyServers[0]); // Default to first server
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
      dummyChannels[dummyServers[0]?.id as keyof typeof dummyChannels]?.[0]?.id || null // Default to first channel of first server
  );

  const channels = selectedServer ? dummyChannels[selectedServer.id as keyof typeof dummyChannels] || [] : [];
  const messages = selectedChannelId ? dummyMessages[selectedChannelId as keyof typeof dummyMessages] || [] : [];

  const handleServerSelect = (serverId: string) => {
    const server = dummyServers.find(s => s.id === serverId);
    if (server) {
      setSelectedServer(server);
      // Select the first channel of the new server
      const firstChannel = dummyChannels[serverId as keyof typeof dummyChannels]?.[0];
      setSelectedChannelId(firstChannel?.id || null);
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

  // Tab Content Components (simplified)
  const ServersTabContent = () => (
    <div className="flex h-full">
      {/* Server/Community List */}
      <ScrollArea className="w-72 border-r border-border/50 p-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold px-2">Communities</h3>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
               <Plus size={18}/>
               <span className="sr-only">Create Community</span>
            </Button>
        </div>
        <Input placeholder="Find a community..." className="glass mb-2 h-8 text-xs"/>
        <div className="space-y-1">
          {dummyServers.map((server) => (
            <Button
              key={server.id}
              variant={selectedServer?.id === server.id ? "secondary" : "ghost"}
              className="w-full justify-start h-9 text-sm"
              onClick={() => handleServerSelect(server.id)}
            >
              {/* Add an icon based on community type maybe? */}
              <Hash size={16} className="mr-2 text-muted-foreground" />
              <span className="truncate">{server.name}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Channel & Chat Area */}
      <div className="flex flex-col flex-grow h-full">
         {selectedServer ? (
             <>
                {/* Channel List */}
                <div className="h-12 border-b border-border/50 flex items-center px-4 flex-shrink-0 bg-muted/30">
                    <h2 className="text-lg font-semibold truncate mr-auto">{selectedServer.name}</h2>
                    {/* Add server actions/settings icon */}
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground"><Settings size={18}/></Button>
                 </div>

                {/* Chat/Content Area */}
                <div className="flex flex-grow overflow-hidden">
                    {/* Channels Sidebar */}
                    <ScrollArea className="w-56 border-r border-border/50 p-2 flex-shrink-0 bg-muted/20">
                        {channels.length > 0 ? channels.map((channel) => (
                             <Button
                                key={channel.id}
                                variant={selectedChannelId === channel.id ? "secondary" : "ghost"}
                                size="sm"
                                className="w-full justify-start px-2 text-left h-7 mb-0.5"
                                onClick={() => handleChannelSelect(channel.id)}
                            >
                                {channel.type === 'text' ? <Hash size={16} className="mr-1.5 flex-shrink-0" /> : <Mic size={16} className="mr-1.5 flex-shrink-0" />}
                                <span className="truncate flex-grow">{channel.name}</span>
                            </Button>
                        )) : (
                            <p className="text-xs text-muted-foreground text-center py-4">No channels.</p>
                        )}
                    </ScrollArea>

                    {/* Main Chat View */}
                     <div className="flex flex-col flex-grow h-full overflow-hidden">
                        {selectedChannelId ? (
                             <>
                                <ScrollArea className="flex-grow p-3">
                                   {messages.length > 0 ? (
                                       messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
                                   ) : (
                                       <div className="text-center text-muted-foreground py-10">No messages yet.</div>
                                   )}
                                </ScrollArea>
                                <div className="p-3 border-t border-border/50 flex-shrink-0 bg-muted/30">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder={`Message #${channels.find(c=>c.id === selectedChannelId)?.name || 'channel'}`}
                                            className="w-full glass pr-10 h-10"
                                        />
                                        <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 text-primary">
                                            <PlusCircle size={18}/>
                                        </Button>
                                    </div>
                                </div>
                             </>
                         ) : (
                            <div className="flex-grow flex items-center justify-center text-muted-foreground">Select a channel</div>
                         )}
                     </div>
                </div>
             </>
         ) : (
             <div className="flex-grow flex items-center justify-center text-muted-foreground">Select a community</div>
         )}
      </div>
    </div>
  );

  const NamiChatTabContent = () => (
     <div className="flex-grow flex flex-col h-full bg-gradient-to-br from-background to-indigo-900/20 p-6">
        <div className="flex items-center gap-2 text-2xl font-semibold text-primary mb-4">
             <Bot size={24} /> Nami AI Chat
        </div>
        <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground text-center">
            <Bot size={56} className="mb-4 text-primary opacity-70"/>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Chat with Nami AI</h2>
            <p className="text-sm mb-6 max-w-md">Get recommendations, search for anime/manga using natural language, or just talk about your favorite series!</p>
            <p className="text-xs italic">(Chat Interface Coming Soon)</p>
        </div>
         <div className="p-3 border-t border-border/50 flex-shrink-0 mt-4">
             <div className="relative">
                 <Input type="text" placeholder="Ask Nami anything..." className="w-full glass pr-10 h-10" disabled />
                 <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8" disabled>
                    <Plus size={18}/>
                 </Button>
             </div>
        </div>
     </div>
 );

  const IndieMangaTabContent = () => (
     <div className="flex-grow flex flex-col h-full bg-gradient-to-br from-background to-blue-900/20 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 text-2xl font-semibold text-primary">
                <BookText size={24} /> Indie Manga Hub
            </div>
             <Button asChild variant="outline" size="sm" className="neon-glow-hover">
                <Link href="/upload">
                   <Upload size={16} className="mr-1.5" /> Upload Manga
                </Link>
            </Button>
        </div>
        <ScrollArea className="flex-grow -mx-4 md:-mx-6 px-4 md:px-6"> {/* Allow scroll within tab */}
             {dummyIndieManga.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                     {dummyIndieManga.map((manga) => (
                         <IndieMangaCard key={manga.id} manga={manga} />
                     ))}
                 </div>
             ) : (
                 <div className="text-center text-muted-foreground py-10">
                    <p>No indie manga found yet. Be the first to upload!</p>
                 </div>
             )}
        </ScrollArea>
     </div>
  );


  return (
    // Main container using full height and flex column
    <div className="flex flex-col h-full max-h-full overflow-hidden bg-background text-foreground">
        {/* Page Header */}
        <div className="p-4 md:p-6 border-b border-border/50 flex-shrink-0">
             <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                 <Users className="text-primary w-7 h-7" />
                 Community Hub
             </h1>
             <p className="text-muted-foreground text-sm mt-1">Connect, discuss, and discover user-created manga.</p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-border/50 h-12 flex-shrink-0 px-4 md:px-6 bg-background">
            <TabsTrigger value="servers" className="text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent h-full">
              <MessageSquare className="w-4 h-4 mr-1.5"/> Communities
            </TabsTrigger>
            <TabsTrigger value="nami" className="text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent h-full">
               <Bot className="w-4 h-4 mr-1.5"/> Nami Chat
            </TabsTrigger>
            <TabsTrigger value="indie" className="text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent h-full">
               <BookText className="w-4 h-4 mr-1.5"/> Indie Manga
            </TabsTrigger>
          </TabsList>

          {/* Tab Content Area */}
          <TabsContent value="servers" className="mt-0 flex-grow overflow-hidden">
            <ServersTabContent />
          </TabsContent>
          <TabsContent value="nami" className="mt-0 flex-grow overflow-hidden">
            <NamiChatTabContent />
          </TabsContent>
          <TabsContent value="indie" className="mt-0 flex-grow overflow-hidden">
             <IndieMangaTabContent />
          </TabsContent>
        </Tabs>
    </div>
  );
}
