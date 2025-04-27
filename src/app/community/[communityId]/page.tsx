
'use client';

import { useParams, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Users, MessageSquare, Hash, Settings, Mic, Loader2, AlertCircle } from 'lucide-react'; // Added Loader2, AlertCircle
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'; // Import Alert components
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// --- Interfaces for Community Data ---
interface CommunityChannel {
    id: string;
    name: string;
    type: 'text' | 'voice';
}

interface CommunityMember {
    id: string;
    username: string;
    avatarUrl: string | null;
    status: 'online' | 'offline' | 'idle'; // Example statuses
}

interface CommunityChatMessage {
    id: string;
    userId: string;
    username: string; // Denormalized for display
    avatarUrl: string | null; // Denormalized for display
    text: string;
    timestamp: Date; // Use Date object
}

interface CommunityDetails {
    id: string;
    name: string;
    description: string;
    icon?: React.ElementType; // Optional: Icon component
    imageUrl: string | null;
    memberCount: number;
    onlineCount: number;
    channels: CommunityChannel[];
    // members: CommunityMember[]; // Could be fetched separately for performance
}


// --- Component ---
export default function CommunityDetailPage() {
  const params = useParams();
  const communityId = params.communityId as string;

  const [community, setCommunity] = useState<CommunityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<CommunityChannel | null>(null);
  const [messages, setMessages] = useState<CommunityChatMessage[]>([]); // State for messages
  const [loadingMessages, setLoadingMessages] = useState(false); // State for loading messages

  // --- Data Fetching ---
  useEffect(() => {
    const fetchCommunityData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching community data for ID: ${communityId}`);
        // TODO: Replace with actual API call to fetch community details
        // Example: const data = await getCommunityDetailsFromAPI(communityId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

        // --- Placeholder Data (REMOVE THIS in production) ---
        const dummyDataMap: { [key: string]: CommunityDetails } = {
            'action-hub': {
                id: 'action-hub', name: 'Action Hub', description: 'Discuss the latest fights & power levels!', imageUrl: 'https://picsum.photos/seed/action/100/100', memberCount: 1234, onlineCount: 156,
                channels: [
                    { id: 'general-action', name: 'general', type: 'text' },
                    { id: 'power-scaling', name: 'power-scaling', type: 'text' },
                    { id: 'fight-club-vc', name: 'Fight Club VC', type: 'voice' },
                ],
            },
             'berserk-fans': {
                 id: 'berserk-fans', name: 'Berserk Fans', description: 'Analysis, theories, and fan art for strugglers.', imageUrl: 'https://picsum.photos/seed/berserk/100/100', memberCount: 876, onlineCount: 92,
                 channels: [
                     { id: 'general-berserk', name: 'general', type: 'text' },
                     { id: 'manga-discussion', name: 'manga-discussion', type: 'text' },
                     { id: 'fan-art-berserk', name: 'fan-art', type: 'text' },
                     { id: 'struggler-hangout-vc', name: 'Struggler Hangout', type: 'voice' },
                 ],
             },
             // Add other communities if needed for testing
        };
        const data = dummyDataMap[communityId] || null;
        // --- End Placeholder Data ---

        if (data) {
          setCommunity(data);
          // Set the first text channel as default selected
          const defaultChannel = data.channels.find(c => c.type === 'text');
          if (defaultChannel) {
              setSelectedChannel(defaultChannel);
          }
        } else {
          setError('Community not found.');
          // Consider using Next.js notFound() for actual 404 handling
          // notFound();
        }
      } catch (err: any) {
        console.error("Error fetching community data:", err);
        setError("Failed to load community details.");
      } finally {
        setLoading(false);
      }
    };

    if (communityId) {
      fetchCommunityData();
    }
  }, [communityId]);


  // --- Fetch Messages when selectedChannel changes ---
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChannel || selectedChannel.type !== 'text') {
          setMessages([]); // Clear messages if no text channel is selected
          return;
      }
      setLoadingMessages(true);
      console.log(`Fetching messages for channel: ${selectedChannel.name} (${selectedChannel.id})`);
      try {
          // TODO: Replace with actual API call to fetch messages for the channel
          // Example: const fetchedMessages = await getMessagesForChannel(selectedChannel.id);
          await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

         // --- Placeholder Messages (REMOVE THIS in production) ---
          const dummyMessagesMap: { [key: string]: CommunityChatMessage[] } = {
              'general-action': [
                  { id: 'm1a', userId: 'u1', username: 'ShinraFanatic', avatarUrl: 'https://picsum.photos/seed/user1/40/40', text: 'Welcome to Action Hub!', timestamp: new Date(Date.now() - 3600000) },
                  { id: 'm2a', userId: 'u2', username: 'NamiAI', avatarUrl: 'https://picsum.photos/seed/nami/40/40', text: 'Remember the rules! No spoilers outside designated channels.', timestamp: new Date(Date.now() - 3540000) },
                  { id: 'm3a', userId: 'u3', username: 'PowerScaler99', avatarUrl: 'https://picsum.photos/seed/user3/40/40', text: 'Who wins, Goku or Saitama?', timestamp: new Date(Date.now() - 3000000) },
              ],
              'power-scaling': [
                   { id: 'm1p', userId: 'u3', username: 'PowerScaler99', avatarUrl: 'https://picsum.photos/seed/user3/40/40', text: 'Let\'s settle this Goku vs Saitama debate once and for all.', timestamp: new Date(Date.now() - 2000000) },
                   { id: 'm2p', userId: 'u1', username: 'ShinraFanatic', avatarUrl: 'https://picsum.photos/seed/user1/40/40', text: 'Saitama\'s whole deal is being infinitely strong...', timestamp: new Date(Date.now() - 1900000) },
              ],
               'general-berserk': [
                  { id: 'm1b', userId: 'u4', username: 'GutsBestBoy', avatarUrl: 'https://picsum.photos/seed/user4/40/40', text: 'Just finished the conviction arc again... masterpiece.', timestamp: new Date(Date.now() - 7200000) },
                  { id: 'm2b', userId: 'u5', username: 'GriffithDidNothingWrong', avatarUrl: 'https://picsum.photos/seed/user5/40/40', text: '<.<', timestamp: new Date(Date.now() - 7100000) },
              ],
              // Add more channel messages as needed
          };
          const fetchedMessages = dummyMessagesMap[selectedChannel.id] || [];
         // --- End Placeholder Messages ---

          setMessages(fetchedMessages);
      } catch (err) {
          console.error(`Error fetching messages for channel ${selectedChannel.id}:`, err);
           toast({ // Use toast for message loading errors
               title: "Error Loading Messages",
               description: `Could not load messages for #${selectedChannel.name}.`,
               variant: "destructive",
           });
           setMessages([]); // Clear messages on error
      } finally {
          setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedChannel]); // Re-fetch when channel changes

  // --- Render Logic ---

  if (loading) {
    return <CommunityDetailSkeleton />;
  }

  if (error) {
    return (
        <div className="container mx-auto px-4 py-8 flex items-center justify-center h-full">
            <Alert variant="destructive" className="max-w-md glass">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Community</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                <Link href="/community" passHref legacyBehavior>
                    <Button variant="link" className="mt-4 text-destructive-foreground">Back to Communities</Button>
                </Link>
            </Alert>
        </div>
    );
  }

  if (!community) {
      // Should be caught by error state, but added as fallback
      return (
        <div className="container mx-auto px-4 py-8 text-center h-full flex items-center justify-center">
             <p className="text-muted-foreground">Community details could not be loaded.</p>
             <Link href="/community" passHref legacyBehavior>
                <Button variant="link" className="mt-4">Back to Communities</Button>
            </Link>
        </div>
    );
  }

  const textChannels = community.channels.filter(c => c.type === 'text');
  const voiceChannels = community.channels.filter(c => c.type === 'voice');

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for Channels */}
      <div className="w-60 md:w-72 flex-shrink-0 bg-card border-r border-border/50 flex flex-col glass">
         <CardHeader className="p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={community.imageUrl ?? undefined} alt={community.name} />
                    <AvatarFallback>{community.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base line-clamp-1">{community.name}</CardTitle>
                    <CardDescription className="text-xs">{community.memberCount} Members</CardDescription>
                </div>
                 {/* Settings Icon (Placeholder for community settings) */}
                 <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-muted-foreground hover:text-foreground">
                    <Settings size={16} />
                </Button>
            </div>
         </CardHeader>
        <ScrollArea className="flex-grow p-2">
            {/* Text Channels Section */}
             {textChannels.length > 0 && (
                 <div className="mb-3">
                    <p className="px-2 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Text Channels</p>
                     {textChannels.map(channel => (
                        <Button
                            key={channel.id}
                            variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                            onClick={() => setSelectedChannel(channel)}
                            className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 h-8"
                        >
                            <Hash size={16} className="mr-2"/> {channel.name}
                        </Button>
                    ))}
                 </div>
             )}

             {/* Voice Channels Section */}
            {voiceChannels.length > 0 && (
                 <div>
                     <p className="px-2 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Voice Channels</p>
                     {voiceChannels.map(channel => (
                        <Button
                             key={channel.id}
                             variant="ghost"
                             // TODO: Add onClick handler for joining voice channels
                             className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 h-8"
                         >
                            <Mic size={16} className="mr-2"/> {channel.name}
                        </Button>
                     ))}
                 </div>
             )}
             {textChannels.length === 0 && voiceChannels.length === 0 && (
                 <p className="px-2 text-sm text-muted-foreground italic">No channels available.</p>
             )}
        </ScrollArea>
         {/* Optional: User Controls at bottom (Mute, Deafen, Settings) */}
         {/* <div className="p-2 border-t border-border/50"> ... </div> */}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 flex items-center px-4 border-b border-border/50 flex-shrink-0 bg-card/50 glass">
            {selectedChannel ? (
                 <>
                    {selectedChannel.type === 'text' ? <Hash size={20} className="text-muted-foreground mr-2"/> : <Mic size={20} className="text-muted-foreground mr-2"/>}
                    <h2 className="text-lg font-semibold">{selectedChannel.name}</h2>
                     {/* Optional: Channel Topic */}
                    {/* <span className="text-xs text-muted-foreground ml-4 border-l border-border/50 pl-4">Channel topic goes here...</span> */}
                 </>
             ) : (
                 <h2 className="text-lg font-semibold text-muted-foreground">Select a channel</h2>
             )}
            {/* TODO: Add member list toggle icon, search icon etc. */}
        </div>

        {/* Chat Messages Area */}
        <ScrollArea className="flex-grow p-4 bg-background"> {/* Ensure background color */}
            {loadingMessages ? (
                 <div className="space-y-4">
                    {/* Message Skeletons */}
                    {Array.from({ length: 5 }).map((_, i) => (
                         <div key={i} className="flex items-start gap-3 animate-pulse">
                             <Skeleton className="h-9 w-9 rounded-full mt-1" />
                             <div className="flex-1 space-y-1.5">
                                 <div className="flex items-baseline gap-2">
                                     <Skeleton className="h-4 w-20" />
                                     <Skeleton className="h-3 w-12" />
                                 </div>
                                 <Skeleton className="h-4 w-3/4" />
                             </div>
                         </div>
                    ))}
                 </div>
             ) : messages.length > 0 ? (
                <div className="space-y-4">
                    {messages.map(message => (
                       <div key={message.id} className="flex items-start gap-3">
                            <Avatar className="h-9 w-9 mt-1 flex-shrink-0">
                               <AvatarImage src={message.avatarUrl ?? undefined} alt={message.username} />
                               <AvatarFallback>{message.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                               <div className="flex items-baseline gap-2">
                                  <span className="font-semibold text-sm text-primary">{message.username}</span>
                                  <span className="text-xs text-muted-foreground">
                                      {/* Format timestamp (e.g., using date-fns) */}
                                       {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(message.timestamp)}
                                  </span>
                               </div>
                               <p className="text-base text-foreground/90">{message.text}</p>
                                {/* TODO: Add reactions/reply button */}
                            </div>
                       </div>
                    ))}
                </div>
             ) : (
                 <div className="h-full flex items-center justify-center text-muted-foreground">
                     <p>No messages in this channel yet.</p>
                 </div>
             )}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border/50 flex-shrink-0 bg-card/50 glass">
            {/* TODO: Implement actual message input component with send functionality */}
             <div className="flex items-center gap-2 bg-input/50 border border-input rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
                 {/* Optional: Add attachment button */}
                 {/* <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"> <PlusCircle size={18}/> </Button> */}
                <MessageSquare size={18} className="text-muted-foreground flex-shrink-0"/>
                <input
                    type="text"
                    placeholder={`Message #${selectedChannel?.name || 'channel'}...`} // Make dynamic
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                    disabled={!selectedChannel || selectedChannel.type !== 'text'} // Disable if no text channel selected
                    // Add state and onChange handler for message input
                />
                 {/* Optional: Add emoji picker, GIF button */}
                 {/* <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"> <Smile size={18}/> </Button> */}
             </div>
        </div>
      </div>

      {/* Optional: Member List Sidebar */}
      {/* <div className="w-60 bg-card border-l border-border/50 hidden lg:flex flex-col"> ... </div> */}
    </div>
  );
}

// Skeleton Component for Loading State
function CommunityDetailSkeleton() {
    return (
        <div className="flex h-screen overflow-hidden bg-background animate-pulse">
             {/* Sidebar Skeleton */}
             <div className="w-60 md:w-72 flex-shrink-0 bg-card border-r border-border/50 flex flex-col glass">
                <CardHeader className="p-4 border-b border-border/50">
                     <div className="flex items-center gap-3">
                         <Skeleton className="h-10 w-10 rounded-full" />
                         <div className="flex-1 space-y-1.5">
                             <Skeleton className="h-4 w-3/4" />
                             <Skeleton className="h-3 w-1/2" />
                         </div>
                          <Skeleton className="h-7 w-7 rounded-md" />
                     </div>
                </CardHeader>
                 <ScrollArea className="flex-grow p-2 space-y-3">
                     <Skeleton className="h-3 w-24 mb-2" /> {/* Section Title */}
                     <Skeleton className="h-8 w-full rounded" />
                     <Skeleton className="h-8 w-full rounded" />
                     <Skeleton className="h-8 w-full rounded" />
                     <Separator className="my-2"/>
                      <Skeleton className="h-3 w-24 mb-2" /> {/* Section Title */}
                     <Skeleton className="h-8 w-full rounded" />
                     <Skeleton className="h-8 w-full rounded" />
                 </ScrollArea>
             </div>

             {/* Main Chat Area Skeleton */}
             <div className="flex-1 flex flex-col">
                {/* Header Skeleton */}
                <div className="h-16 flex items-center px-4 border-b border-border/50 flex-shrink-0 bg-card/50 glass">
                    <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                 </div>
                 {/* Messages Skeleton */}
                 <ScrollArea className="flex-grow p-4">
                     <div className="space-y-4">
                         {Array.from({ length: 5 }).map((_, i) => (
                             <div key={i} className="flex items-start gap-3">
                                 <Skeleton className="h-9 w-9 rounded-full mt-1" />
                                 <div className="flex-1 space-y-1.5">
                                     <div className="flex items-baseline gap-2">
                                         <Skeleton className="h-4 w-20" />
                                         <Skeleton className="h-3 w-12" />
                                     </div>
                                     <Skeleton className="h-4 w-3/4" />
                                 </div>
                             </div>
                         ))}
                     </div>
                 </ScrollArea>
                 {/* Input Skeleton */}
                 <div className="p-4 border-t border-border/50 flex-shrink-0 bg-card/50 glass">
                     <Skeleton className="h-10 w-full rounded-lg" />
                 </div>
             </div>
        </div>
    );
}

// --- Toast Import (Assuming it's available) ---
// Ensure useToast is imported correctly if used
import { useToast } from '@/hooks/use-toast';
const { toast } = useToast();
