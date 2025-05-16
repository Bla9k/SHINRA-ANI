
'use client';

import { useParams, useRouter, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Users, MessageSquare, Hash, Settings, Mic, Loader2, AlertCircle, Palette, Drama } from 'lucide-react'; // Added Palette
import Link from 'next/link';
import React, { useEffect, useState, CSSProperties } from 'react';
import { Alert, AlertTitle, AlertDescription as AlertDescriptionUI } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getCommunityTheme, type CommunityTheme } from '@/types/theme';
import { Community as CommunityData } from '@/services/community'; // Assuming Community type is exported from here

// Simplified interfaces for this page
interface CommunityChannel {
    id: string;
    name: string;
    type: 'text' | 'voice';
}

interface CommunityDetails extends CommunityData {
    // Inherits: id, name, description, imageUrl, memberCount, onlineCount, channels, creatorId, creatorName, createdAt, members
}

// Dummy channel data if community.channels is empty
const dummyChannels: CommunityChannel[] = [
  { id: 'general-dummy', name: 'general', type: 'text' },
  { id: 'lounge-dummy', name: 'lounge', type: 'voice' },
];

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.communityId as string;
  const { toast } = useToast();

  const [community, setCommunity] = useState<CommunityDetails | null>(null);
  const [communityTheme, setCommunityTheme] = useState<CommunityTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<CommunityChannel | null>(null);
  const [messages, setMessages] = useState<any[]>([]); // Define proper message type later
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [dynamicStyles, setDynamicStyles] = useState<CSSProperties>({});

  useEffect(() => {
    const fetchCommunityPageData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching data for community ID: ${communityId}`);
        // TODO: Replace with actual API call to fetch full community details by ID
        // For now, using a placeholder
        const dummyDataMap: { [key: string]: CommunityDetails } = {
            'action-hub': { id: 'action-hub', name: 'Action Hub', description: 'Discuss the latest fights & power levels!', imageUrl: 'https://placehold.co/100x100.png?text=AH', memberCount: 1234, onlineCount: 156, channels: [{id: 'general-action', name: 'general', type: 'text'}, {id: 'powerscaling', name: 'power-scaling', type: 'text'}], creatorId: 'adminUser', creatorName: 'Admin', createdAt: new Date(), members: ['adminUser']},
            'berserk-fans': { id: 'berserk-fans', name: 'Berserk Fans', description: 'Analysis, theories, and fan art.', imageUrl: 'https://placehold.co/100x100.png?text=BF', memberCount: 876, onlineCount: 92, channels: [{id: 'general-berserk', name: 'general-discussion', type: 'text'}, {id: 'manga-spoilers', name: 'manga-spoilers', type: 'text'}], creatorId: 'adminUser', creatorName: 'Admin', createdAt: new Date(), members: ['adminUser']},
        };
        const fetchedCommunity = dummyDataMap[communityId] || { id: communityId, name: `Community ${communityId}`, description: 'A cool place to hang out.', imageUrl: `https://placehold.co/100x100.png?text=${communityId.slice(0,2).toUpperCase()}`, memberCount: 1, onlineCount: 0, channels: dummyChannels, creatorId: 'system', creatorName: 'System', createdAt: new Date(), members: [] }; // Fallback if not in dummy map

        setCommunity(fetchedCommunity);
        const defaultChannel = (fetchedCommunity.channels && fetchedCommunity.channels.length > 0) ? fetchedCommunity.channels.find(c => c.type === 'text') || fetchedCommunity.channels[0] : dummyChannels.find(c => c.type === 'text');
        if (defaultChannel) setSelectedChannel(defaultChannel);

        const theme = await getCommunityTheme(communityId);
        setCommunityTheme(theme);
        if (theme) console.log("Custom theme loaded for community:", communityId, theme);
        else console.log("No custom theme found for community:", communityId, "using defaults.");

      } catch (err: any) {
        console.error("Error fetching community page data:", err);
        setError("Failed to load community details or theme.");
      } finally {
        setLoading(false);
      }
    };

    if (communityId) {
      fetchCommunityPageData();
    }
  }, [communityId]);

  useEffect(() => {
    if (communityTheme) {
      const newStyles: CSSProperties = {};
      Object.entries(communityTheme.colors).forEach(([key, value]) => {
        const cssVarName = `--community-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        newStyles[cssVarName as any] = `hsl(${value})`;
      });

      if (communityTheme.background.type === 'color') {
        newStyles.backgroundColor = `hsl(${communityTheme.background.value})`;
        newStyles.backgroundImage = 'none';
      } else if (communityTheme.background.value) {
        newStyles.backgroundImage = `url("${communityTheme.background.value}")`;
        newStyles.backgroundSize = 'cover';
        newStyles.backgroundPosition = 'center';
        newStyles.backgroundAttachment = 'fixed';
        newStyles.color = `hsl(${communityTheme.colors.foreground})`;
      }
      setDynamicStyles(newStyles);
    } else {
      // Reset to default styles or ensure global theme applies cleanly
      setDynamicStyles({});
    }
  }, [communityTheme]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChannel || selectedChannel.type !== 'text' || !community) return;
      setLoadingMessages(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      setMessages([
          { id: 'm1', userId: 'u1', username: 'ShinraUser', avatarUrl: 'https://placehold.co/40x40.png?text=SU', text: communityTheme?.customTexts?.welcomeMessage || `Welcome to #${selectedChannel.name} in ${community.name}!`, timestamp: new Date() },
          { id: 'm2', userId: 'u2', username: 'NamiAI', avatarUrl: 'https://placehold.co/40x40.png?text=NAI', text: communityTheme?.customTexts?.communityTagline || 'Enjoy your stay!', timestamp: new Date() }
      ]);
      setLoadingMessages(false);
    };
    fetchMessages();
  }, [selectedChannel, community, communityTheme]);

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      toast({ title: "Message Sent!", description: "Your message: " + newMessage });
      setNewMessage('');
  };

  if (loading) return <CommunityDetailSkeleton />;
  if (error) return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Alert variant="destructive" className="max-w-md glass"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescriptionUI>{error}</AlertDescriptionUI></Alert>
    </div>
  );
  if (!community) return (
    <div className="container mx-auto px-4 py-8 text-center min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md glass"><AlertCircle className="h-4 w-4" /><AlertTitle>Community Not Found</AlertTitle><AlertDescriptionUI>The requested community does not exist or could not be loaded.</AlertDescriptionUI></Alert>
    </div>
  );

  const channelsToDisplay = (community.channels && community.channels.length > 0) ? community.channels : dummyChannels;
  const textChannels = channelsToDisplay.filter(c => c.type === 'text');
  const voiceChannels = channelsToDisplay.filter(c => c.type === 'voice');

  return (
    <div id="community-content-wrapper" style={dynamicStyles} className="transition-colors duration-500 ease-in-out min-h-screen bg-background text-foreground">
      <div className="flex h-screen overflow-hidden">
        <div className="w-60 md:w-72 flex-shrink-0 border-r flex flex-col" style={{ backgroundColor: 'var(--community-card, inherit)', borderColor: 'var(--community-border, inherit)'}}>
          <CardHeader className="p-4 border-b" style={{borderColor: 'var(--community-border, inherit)'}}>
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border" style={{borderColor: 'var(--community-primary, inherit)'}}>
                    <AvatarImage src={community.imageUrl ?? undefined} alt={community.name} />
                    <AvatarFallback style={{backgroundColor: 'var(--community-accent, inherit)', color: 'var(--community-accent-foreground, inherit)'}}>{community.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base line-clamp-1" style={{color: 'var(--community-primary-foreground, var(--community-foreground, inherit))'}}>{community.name}</CardTitle>
                    <CardDescription className="text-xs" style={{color: 'var(--community-foreground, inherit)', opacity: 0.8}}>{community.memberCount} Members</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" style={{color: 'var(--community-foreground, inherit)'}} onClick={() => router.push(`/community/${communityId}/settings/theme`)}>
                    <Palette size={16} />
                </Button>
            </div>
          </CardHeader>
          <ScrollArea className="flex-grow p-2">
            {communityTheme?.customTexts?.welcomeMessage && (
                <p className="px-2 py-1 text-xs italic rounded-md mb-2" style={{backgroundColor: 'var(--community-accent, inherit)', color: 'var(--community-accent-foreground, inherit)'}}>
                    {communityTheme.customTexts.welcomeMessage}
                </p>
            )}
            {textChannels.length > 0 && ( <div className="mb-3">
                <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider" style={{color: 'var(--community-foreground, inherit)', opacity: 0.7}}>Text Channels</p>
                {textChannels.map(channel => (
                    <Button key={channel.id} variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"} onClick={() => setSelectedChannel(channel)} className="w-full justify-start text-sm h-8" style={{color: selectedChannel?.id === channel.id ? 'var(--community-primary-foreground, var(--community-foreground, inherit))' : 'var(--community-foreground, inherit)', backgroundColor: selectedChannel?.id === channel.id ? 'var(--community-primary, inherit)' : 'transparent'}}>
                        <Hash size={16} className="mr-2"/> {channel.name}
                    </Button>
                ))}
            </div>)}
            {voiceChannels.length > 0 && (<div>
                <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider" style={{color: 'var(--community-foreground, inherit)', opacity: 0.7}}>Voice Channels</p>
                {voiceChannels.map(channel => ( <Button key={channel.id} variant="ghost" onClick={() => toast({ title: "Voice Chat Coming Soon!" })} className="w-full justify-start text-sm h-8" style={{color: 'var(--community-foreground, inherit)'}}> <Mic size={16} className="mr-2"/> {channel.name} </Button> ))}
            </div>)}
          </ScrollArea>
           <div className="p-2 border-t flex items-center gap-2" style={{borderColor: 'var(--community-border, inherit)'}}>
              <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/40x40.png?text=U" alt="User Avatar"/><AvatarFallback>U</AvatarFallback></Avatar>
              <span className="text-sm font-medium truncate" style={{color: 'var(--community-foreground, inherit)'}}>ShinraUser</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col" style={{backgroundColor: 'var(--community-background, inherit)'}}>
          <div className="h-16 flex items-center px-4 border-b flex-shrink-0" style={{backgroundColor: 'var(--community-card, inherit)', borderColor: 'var(--community-border, inherit)'}}>
            {selectedChannel ? ( <>
                {selectedChannel.type === 'text' ? <Hash size={20} className="mr-2" style={{color: 'var(--community-accent, inherit)'}}/> : <Mic size={20} className="mr-2" style={{color: 'var(--community-accent, inherit)'}}/>}
                <h2 className="text-lg font-semibold" style={{color: 'var(--community-foreground, inherit)'}}>{selectedChannel.name}</h2>
                {communityTheme?.customTexts?.communityTagline && <span className="text-xs ml-4 border-l pl-4" style={{borderColor: 'var(--community-border, inherit)', color: 'var(--community-accent, inherit)'}}>{communityTheme.customTexts.communityTagline}</span>}
            </> ) : ( <h2 className="text-lg font-semibold" style={{color: 'var(--community-foreground, inherit)', opacity: 0.7}}>Select a channel</h2> )}
            <Button variant="ghost" size="icon" className="ml-auto" style={{color: 'var(--community-foreground, inherit)'}}> <Users size={20} /> </Button>
          </div>
          <ScrollArea className="flex-grow p-4">
            {loadingMessages ? ( <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" style={{color: 'var(--community-primary, inherit)'}}/></div>
            ) : messages.length > 0 ? ( <div className="space-y-4"> {messages.map(message => (
               <div key={message.id} className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 mt-1 flex-shrink-0"><AvatarImage src={message.avatarUrl ?? undefined} alt={message.username} /><AvatarFallback>{message.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                    <div>
                       <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm" style={{color: 'var(--community-primary, inherit)'}}>{message.username}</span>
                          <span className="text-xs" style={{color: 'var(--community-foreground, inherit)', opacity: 0.6}}>{new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(message.timestamp)}</span>
                       </div>
                       <p className="text-base" style={{color: 'var(--community-foreground, inherit)', opacity: 0.9}}>{message.text}</p>
                    </div>
               </div>
            ))} </div>
            ) : ( <div className="h-full flex items-center justify-center" style={{color: 'var(--community-foreground, inherit)', opacity: 0.7}}><p>No messages here yet.</p></div> )}
          </ScrollArea>
          <div className="p-4 border-t flex-shrink-0" style={{backgroundColor: 'var(--community-card, inherit)', borderColor: 'var(--community-border, inherit)'}}>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 rounded-lg px-3 py-2 focus-within:ring-2" style={{backgroundColor: 'var(--community-input, inherit)', borderColor: 'var(--community-border, inherit)', ['--tw-ring-color' as any]: `var(--community-ring, inherit)`}}>
                <MessageSquare size={18} className="flex-shrink-0" style={{color: 'var(--community-foreground, inherit)', opacity: 0.6}}/>
                <Input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={`Message #${selectedChannel?.name || 'channel'}...`} className="flex-1 bg-transparent outline-none text-sm border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-0 px-1" style={{color: 'var(--community-foreground, inherit)'}} disabled={!selectedChannel || selectedChannel.type !== 'text'}/>
                <Button type="submit" variant="ghost" size="icon" className="h-7 w-7" style={{color: 'var(--community-primary, inherit)'}} disabled={!newMessage.trim() || !selectedChannel || selectedChannel.type !== 'text'}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
                </Button>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunityDetailSkeleton() {
    return (
        <div className="flex h-screen overflow-hidden bg-background animate-pulse">
             <div className="w-60 md:w-72 flex-shrink-0 bg-card border-r border-border/50 flex flex-col glass">
                <CardHeader className="p-4 border-b border-border/50">
                     <div className="flex items-center gap-3">
                         <Skeleton className="h-10 w-10 rounded-full" />
                         <div className="flex-1 space-y-1.5"> <Skeleton className="h-4 w-3/4" /> <Skeleton className="h-3 w-1/2" /></div>
                          <Skeleton className="h-7 w-7 rounded-md" />
                     </div>
                </CardHeader>
                 <ScrollArea className="flex-grow p-2 space-y-3">
                     <Skeleton className="h-3 w-24 mb-2" />
                     <Skeleton className="h-8 w-full rounded" /> <Skeleton className="h-8 w-full rounded" /> <Skeleton className="h-8 w-full rounded" />
                     <Separator className="my-2"/>
                      <Skeleton className="h-3 w-24 mb-2" />
                     <Skeleton className="h-8 w-full rounded" /> <Skeleton className="h-8 w-full rounded" />
                 </ScrollArea>
                  <div className="p-2 border-t border-border/50 flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" /> <Skeleton className="h-4 w-20" />
                  </div>
             </div>
             <div className="flex-1 flex flex-col">
                <div className="h-16 flex items-center px-4 border-b border-border/50 flex-shrink-0 bg-card/50 glass">
                    <Skeleton className="h-5 w-5 mr-2 rounded-full" /> <Skeleton className="h-6 w-32" />
                     <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                 </div>
                 <ScrollArea className="flex-grow p-4">
                     <div className="flex items-center justify-center h-full"> <Loader2 className="h-8 w-8 animate-spin text-primary"/> </div>
                 </ScrollArea>
                 <div className="p-4 border-t border-border/50 flex-shrink-0 bg-card/50 glass">
                     <Skeleton className="h-10 w-full rounded-lg" />
                 </div>
             </div>
        </div>
    );
}
