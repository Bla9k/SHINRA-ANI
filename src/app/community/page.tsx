
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react'; // Import icons
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// --- Dummy Data ---
const dummyServers = [
  { id: 'home', name: 'Home', icon: <Compass size={20}/>, type: 'special' },
  { id: 'nami', name: 'Nami AI Chat', icon: <Bot size={20}/>, type: 'special' },
  { id: 'indie', name: 'Indie Manga Hub', icon: <BookText size={20}/>, type: 'special' },
  { id: 'separator', type: 'separator'},
  { id: '1', name: 'Action Fanatics', iconUrl: 'https://picsum.photos/seed/action/48/48' },
  { id: '2', name: 'Berserk Enjoyers', iconUrl: 'https://picsum.photos/seed/berserk/48/48' },
  { id: '3', name: 'Isekai World', iconUrl: 'https://picsum.photos/seed/isekai/48/48' },
  { id: '4', name: 'Romance Readers', iconUrl: 'https://picsum.photos/seed/romance/48/48' },
  { id: 'add', name: 'Add a Server', icon: <Plus size={20}/>, type: 'action' },
  { id: 'discover', name: 'Explore Servers', icon: <Compass size={20}/>, type: 'action' },
];

const dummyChannels = {
  '1': [
    { id: '1-general', name: 'general-chat', type: 'text' },
    { id: '1-spoilers', name: 'spoilers-beware', type: 'text' },
    { id: '1-recommendations', name: 'action-recs', type: 'text' },
    { id: '1-voice', name: 'Action Hangout', type: 'voice' },
  ],
  '2': [
    { id: '2-discussion', name: 'struggler-talk', type: 'text' },
    { id: '2-art', name: 'fan-art', type: 'text' },
    { id: '2-voice', name: 'Eclipse Watch Party', type: 'voice' },
  ],
  '3': [
    { id: '3-general', name: 'isekai-lounge', type: 'text' },
    { id: '3-op-mcs', name: 'overpowered-mcs', type: 'text' },
    { id: '3-memes', name: 'isekai-memes', type: 'text' },
    { id: '3-voice', name: 'Truck-kun Fanclub', type: 'voice' },
  ],
   '4': [
    { id: '4-general', name: 'romance-cafe', type: 'text' },
    { id: '4-new-reads', name: 'new-releases', type: 'text' },
    { id: '4-voice', name: 'Heart-to-Heart', type: 'voice' },
  ],
  // No channels for special/action servers
  'home': [],
  'nami': [],
  'indie': [],
  'add': [],
  'discover': [],
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
};

const dummyIndieManga = [
  { id: 1, title: 'Galactic Gourmet', author: 'CosmoChef', imageUrl: 'https://picsum.photos/200/300?random=10', genre: ['Sci-Fi', 'Cooking'], description: 'A chef explores the universe searching for exotic ingredients.' },
  { id: 2, title: 'Urban Necromancer', author: 'GraveWalker', imageUrl: 'https://picsum.photos/200/300?random=11', genre: ['Fantasy', 'Urban'], description: 'A necromancer tries to live a normal life in the big city.' },
  { id: 3, title: 'Mecha Gardeners', author: 'PlantBot', imageUrl: 'https://picsum.photos/200/300?random=12', genre: ['Mecha', 'Slice of Life'], description: 'Giant robots tending to giant gardens.' },
  { id: 4, title: 'Samurai Squirrel', author: 'BushidoBlade', imageUrl: 'https://picsum.photos/200/300?random=13', genre: ['Action', 'Animals'], description: 'A squirrel follows the path of the samurai.' },
];

type IndieManga = typeof dummyIndieManga[0];

// --- Components ---

// Server Icon Button
const ServerButton = ({ server, onClick, isActive }: { server: any, onClick: () => void, isActive: boolean }) => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "w-12 h-12 rounded-full transition-all duration-200 ease-in-out relative group overflow-hidden mb-2 flex-shrink-0",
            isActive ? "rounded-2xl bg-primary neon-glow" : "rounded-3xl bg-background/50 hover:rounded-2xl hover:bg-primary",
            server.type === 'separator' && "h-0.5 w-8 bg-border mx-auto cursor-default pointer-events-none p-0",
             server.type === 'action' && "bg-muted hover:bg-primary text-primary hover:text-primary-foreground"
          )}
          onClick={server.type !== 'separator' ? onClick : undefined}
          disabled={server.type === 'separator'}
        >
          {/* Active Indicator */}
           <div className={cn(
              "absolute left-0 top-1/2 transform -translate-y-1/2 h-0 w-1 bg-white rounded-r-full transition-all duration-200",
              isActive ? "h-10" : "group-hover:h-5 h-2"
          )} />

          {server.iconUrl ? (
             <Image src={server.iconUrl} alt={server.name} fill className={cn("object-cover", isActive ? "" : "")} sizes="48px" />
          ) : server.icon ? (
             <div className={cn(isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary-foreground")}>
                {server.icon}
             </div>
          ) : (
            <span className={cn("font-bold text-xs", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary-foreground")}>
              {server.name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </Button>
      </TooltipTrigger>
       <TooltipContent side="right">
         <p>{server.name}</p>
       </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Channel List Item
const ChannelItem = ({ channel, onClick, isActive }: { channel: any, onClick: () => void, isActive: boolean }) => (
  <Button
    variant="ghost"
    size="sm"
    className={cn(
      "w-full justify-start px-2 text-left h-7 mb-0.5",
      isActive ? "bg-accent/80 text-foreground font-semibold" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
    )}
    onClick={onClick}
  >
    {channel.type === 'text' ? <Hash size={16} className="mr-1.5 flex-shrink-0" /> : <Mic size={16} className="mr-1.5 flex-shrink-0" />}
    <span className="truncate flex-grow">{channel.name}</span>
    {/* Add indicators like unread count here if needed */}
  </Button>
);

// User Info Bar at bottom left
const UserInfoBar = () => {
    const user = dummyUsers[0]; // Use the first user as current user

    return (
        <div className="p-2 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-xs overflow-hidden">
                    <p className="font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-muted-foreground truncate">{user.status}</p>
                </div>
            </div>
            <div className="flex items-center">
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-7 h-7">
                                <Mic size={16} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Mute</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="w-7 h-7">
                                 <Headphones size={16} />
                             </Button>
                        </TooltipTrigger>
                         <TooltipContent side="top"><p>Deafen</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon" className="w-7 h-7" asChild>
                               <Link href="/settings">
                                  <Settings size={16} />
                               </Link>
                           </Button>
                        </TooltipTrigger>
                         <TooltipContent side="top"><p>User Settings</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};

// Message Component
const Message = ({ message }: { message: any }) => {
    const user = dummyUsers.find(u => u.id === message.userId);
    if (!user) return null; // Don't render if user not found

    return (
        <div className="flex items-start gap-3 p-2 hover:bg-accent/5 rounded-sm transition-colors">
            <Avatar className="w-9 h-9 mt-0.5 flex-shrink-0">
                 <AvatarImage src={user.avatarUrl} alt={user.name} />
                 <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
             </Avatar>
             <div className="flex-grow">
                 <div className="flex items-baseline gap-2 mb-0.5">
                     <span className="font-semibold text-sm text-primary">{user.name}</span>
                     <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                 </div>
                 <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
             </div>
        </div>
    );
};

// Main Chat Area Component
const ChatArea = ({ activeChannelId, activeServerId }: { activeChannelId: string | null, activeServerId: string | null}) => {
    const messages = activeChannelId ? dummyMessages[activeChannelId as keyof typeof dummyMessages] || [] : [];
    const channel = activeServerId && activeChannelId ? (dummyChannels[activeServerId as keyof typeof dummyChannels] || []).find(c => c.id === activeChannelId) : null;

    if (!channel) {
        return <div className="flex-grow flex items-center justify-center text-muted-foreground">Select a channel</div>;
    }

    return (
        <div className="flex flex-col flex-grow h-full">
             {/* Channel Header */}
             <div className="h-12 border-b border-border/50 flex items-center px-4 flex-shrink-0">
                 <div className="flex items-center gap-1.5 text-lg font-semibold">
                     {channel.type === 'text' ? <Hash size={20} className="text-muted-foreground" /> : <Mic size={20} className="text-muted-foreground" />}
                     <span className="truncate">{channel.name}</span>
                 </div>
                 {/* Add topic or other header elements here */}
                 <div className="ml-auto flex items-center gap-2">
                     <TooltipProvider delayDuration={100}>
                         <Tooltip>
                             <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-muted-foreground w-8 h-8">
                                     <HelpCircle size={18}/>
                                  </Button>
                             </TooltipTrigger>
                             <TooltipContent side="bottom"><p>Help</p></TooltipContent>
                         </Tooltip>
                         <Tooltip>
                             <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-muted-foreground w-8 h-8">
                                      <Users size={18}/>
                                  </Button>
                             </TooltipTrigger>
                             <TooltipContent side="bottom"><p>Member List</p></TooltipContent>
                         </Tooltip>
                     </TooltipProvider>
                     {/* Search in Channel */}
                     <Input type="search" placeholder="Search" className="h-7 w-36 text-xs glass hidden md:block"/>
                 </div>
             </div>

            {/* Messages Area */}
             <ScrollArea className="flex-grow p-2">
                 {messages.length > 0 ? (
                     messages.map(msg => <Message key={msg.id} message={msg} />)
                 ) : (
                     <div className="text-center text-muted-foreground py-10">No messages yet in #{channel.name}.</div>
                 )}
             </ScrollArea>

             {/* Message Input Area */}
             <div className="p-3 border-t border-border/50 flex-shrink-0">
                 <div className="relative">
                     <Input
                         type="text"
                         placeholder={`Message #${channel.name}`}
                         className="w-full glass pr-10 h-10" // Add padding for button
                         // Add state and handlers for sending messages
                     />
                     <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8">
                         <Plus size={18}/>
                     </Button>
                 </div>
             </div>
        </div>
    );
};

// Nami AI Chat Component Placeholder
 const NamiAIChat = () => (
     <div className="flex-grow flex flex-col h-full bg-gradient-to-br from-background to-indigo-900/20">
         <div className="h-12 border-b border-border/50 flex items-center px-4 flex-shrink-0">
             <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                 <Bot size={20} /> Nami AI Chat
             </div>
         </div>
        <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
            <Bot size={48} className="mb-4 text-primary opacity-80"/>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Chat with Nami AI</h2>
            <p className="text-sm mb-6">Ask Nami for recommendations, anime/manga info, or just chat!</p>
            <p className="text-xs italic">Nami AI Chat Interface - Coming Soon!</p>
            {/* TODO: Implement AI Chat interface here */}
        </div>
         <div className="p-3 border-t border-border/50 flex-shrink-0">
             <div className="relative">
                 <Input type="text" placeholder="Type your message to Nami..." className="w-full glass pr-10 h-10" disabled />
                 <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8" disabled>
                    <Plus size={18}/>
                 </Button>
             </div>
        </div>
     </div>
 );


// Indie Manga Hub Component
const IndieMangaHub = () => {
    const [loadingIndie, setLoadingIndie] = useState(false);

    return (
        <div className="flex-grow flex flex-col h-full bg-gradient-to-br from-background to-blue-900/20">
             <div className="h-12 border-b border-border/50 flex items-center justify-between px-4 flex-shrink-0">
                 <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                     <BookText size={20} /> Indie Manga Hub
                 </div>
                  <Button asChild variant="outline" size="sm" className="neon-glow-hover">
                     <Link href="/upload">
                        <Upload size={16} className="mr-1.5" /> Upload Manga
                     </Link>
                 </Button>
             </div>
             <ScrollArea className="flex-grow p-4">
                 {loadingIndie ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                         {Array.from({ length: 4 }).map((_, index) => <IndieMangaSkeletonCard key={`skel-${index}`} />)}
                     </div>
                 ) : dummyIndieManga.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
};

// Indie Manga Card Component
const IndieMangaCard = ({ manga }: { manga: IndieManga }) => (
    <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-105 group h-full flex flex-col">
      <CardHeader className="p-0 relative aspect-[2/3] w-full">
        <Image
          src={manga.imageUrl || 'https://picsum.photos/200/300?grayscale'}
          alt={manga.title}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 23vw"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
         <div className="absolute bottom-2 left-2 right-2 z-10">
           <CardTitle className="text-base font-semibold text-primary-foreground line-clamp-1 shadow-text">{manga.title}</CardTitle>
           <p className="text-xs text-muted-foreground shadow-text">by {manga.author}</p>
         </div>
      </CardHeader>
      <CardContent className="p-3 flex flex-col flex-grow">
        <div className="flex gap-1 mb-2 flex-wrap">
           {manga.genre.map(g => <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>)}
        </div>
        <CardDescription className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-grow">
           {manga.description}
         </CardDescription>
        <div className="mt-auto flex justify-end">
            <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto group-hover:underline">
               {/* TODO: Update link to actual indie manga reader page */}
               <Link href={`/community/manga/${manga.id}`}>
                  Read Now
               </Link>
            </Button>
        </div>
      </CardContent>
     </Card>
);

// Indie Manga Skeleton Card
const IndieMangaSkeletonCard = () => (
    <Card className="overflow-hidden glass h-full flex flex-col">
       <CardHeader className="p-0 relative aspect-[2/3] w-full">
          <Skeleton className="h-full w-full" />
       </CardHeader>
       <CardContent className="p-3 space-y-2 flex flex-col flex-grow">
          <Skeleton className="h-4 w-3/4" /> {/* Title */}
          <Skeleton className="h-3 w-1/2" /> {/* Author */}
           <div className="flex gap-1 mb-1 flex-wrap"> {/* Genres */}
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-14 rounded-full" />
           </div>
          <Skeleton className="h-3 w-full" /> {/* Desc line 1 */}
          <Skeleton className="h-3 w-5/6" /> {/* Desc line 2 */}
          <div className="flex-grow" /> {/* Spacer */}
           <div className="flex justify-end mt-auto"> {/* Button */}
              <Skeleton className="h-5 w-1/4" />
           </div>
       </CardContent>
    </Card>
 );

// Community Home Placeholder
const CommunityHome = () => (
    <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground p-6 text-center bg-gradient-to-br from-background to-green-900/20">
         <Compass size={48} className="mb-4 text-primary opacity-80"/>
        <h2 className="text-xl font-semibold mb-2 text-foreground">Welcome Home!</h2>
        <p className="text-sm mb-6">Explore servers, discover indie manga, or chat with Nami AI.</p>
        {/* Add quick links or recent activity here */}
        <Button variant="outline" className="neon-glow-hover">Explore Servers</Button>
    </div>
);


// --- Main Community Page ---

export default function CommunityPage() {
  const [activeServerId, setActiveServerId] = useState<string>('home'); // Default to Home
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const channels = dummyChannels[activeServerId as keyof typeof dummyChannels] || [];

  const handleServerClick = (serverId: string) => {
    setActiveServerId(serverId);
    setActiveChannelId(null); // Reset channel when server changes
    // Automatically select the first text channel if available
    if (serverId !== 'home' && serverId !== 'nami' && serverId !== 'indie' && serverId !== 'add' && serverId !== 'discover') {
        const firstTextChannel = (dummyChannels[serverId as keyof typeof dummyChannels] || []).find(c => c.type === 'text');
        if (firstTextChannel) {
            setActiveChannelId(firstTextChannel.id);
        }
    }
  };

  const handleChannelClick = (channelId: string) => {
    setActiveChannelId(channelId);
  };

   const renderMainContent = () => {
        switch (activeServerId) {
            case 'home':
                return <CommunityHome />;
            case 'nami':
                return <NamiAIChat />;
            case 'indie':
                return <IndieMangaHub />;
            case 'add':
            case 'discover':
                // Placeholder for Add/Discover server flows
                return <div className="flex-grow flex items-center justify-center text-muted-foreground">Server Discovery/Creation - Coming Soon!</div>;
            default:
                // Render Chat Area for regular servers
                return <ChatArea activeChannelId={activeChannelId} activeServerId={activeServerId} />;
        }
    };


  return (
    // Main flex container mimicking Discord layout
    <div className="flex h-screen max-h-screen overflow-hidden bg-background text-foreground">

      {/* Server List Sidebar */}
      <nav className="w-18 bg-background/70 glass flex flex-col items-center py-3 flex-shrink-0 overflow-y-auto scrollbar-thin">
        {dummyServers.map((server) => (
           server.type === 'separator'
            ? <Separator key={server.id} className="w-8 my-2 bg-border" />
            : <ServerButton
                key={server.id}
                server={server}
                onClick={() => handleServerClick(server.id)}
                isActive={activeServerId === server.id}
              />
        ))}
      </nav>

       {/* Channel List & User Info Sidebar */}
       {(activeServerId && activeServerId !== 'home' && activeServerId !== 'nami' && activeServerId !== 'indie' && activeServerId !== 'add' && activeServerId !== 'discover') ? (
          <nav className="w-60 bg-muted/30 glass flex flex-col flex-shrink-0 border-r border-border/50">
              {/* Server Header */}
              <div className="h-12 border-b border-border/50 flex items-center px-3 shadow-sm">
                  <h2 className="font-bold text-foreground truncate">
                      {dummyServers.find(s => s.id === activeServerId)?.name || 'Server'}
                  </h2>
                   {/* Add dropdown for server settings */}
              </div>
              {/* Channel List */}
              <ScrollArea className="flex-grow p-2">
                  {channels.length > 0 ? (
                     channels.map((channel) => (
                        <ChannelItem
                          key={channel.id}
                          channel={channel}
                          onClick={() => handleChannelClick(channel.id)}
                          isActive={activeChannelId === channel.id}
                        />
                     ))
                  ) : (
                     <p className="text-xs text-muted-foreground text-center py-4">No channels here.</p>
                  )}
              </ScrollArea>
              {/* User Info Bar */}
              <UserInfoBar />
          </nav>
       ) : (
           // Placeholder or different sidebar for special sections if needed
           <div className="w-60 bg-muted/30 glass flex flex-col flex-shrink-0 border-r border-border/50">
               <div className="h-12 border-b border-border/50 flex items-center px-3 shadow-sm">
                 <h2 className="font-bold text-foreground truncate">
                     {dummyServers.find(s => s.id === activeServerId)?.name || 'Section'}
                 </h2>
               </div>
               <div className="flex-grow p-2 text-center text-xs text-muted-foreground">
                  {/* Content for special sections like Nami or Indie */}
                  {activeServerId === 'nami' && 'Talk to Nami directly!'}
                  {activeServerId === 'indie' && 'Discover and upload manga.'}
                   {activeServerId === 'home' && 'Your central hub.'}
               </div>
                <UserInfoBar />
           </div>
       )}

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col bg-card/50">
        {renderMainContent()}
      </main>

       {/* Optional: Member List Sidebar (conditionally rendered) */}
       {/* <aside className="w-60 bg-muted/30 glass flex-shrink-0 border-l border-border/50">
           {/* Member list content *\/}
       </aside> */}

    </div>
  );
}
