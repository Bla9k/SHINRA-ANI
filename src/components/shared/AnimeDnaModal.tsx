
'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAnimeDetails, type Anime } from '@/services/anime'; // Ensure type Anime is exported
import { AlertCircle, ExternalLink, XCircle, Star, CalendarDays, Tv, Film, Layers, Library, Clock, Users, Link as LinkIcon, Briefcase, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimeDnaModalProps {
  animeId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  return (
    <div className="text-sm">
      <span className="font-semibold text-muted-foreground flex items-center">
        {Icon && <Icon size={14} className="mr-1.5 opacity-70" />}
        {label}:
      </span>
      <span className="ml-1 text-foreground/90">
        {typeof value === 'string' || typeof value === 'number' ? value : Array.isArray(value) ? value.join(', ') : value}
      </span>
    </div>
  );
};

const AnimeDnaModal: React.FC<AnimeDnaModalProps> = ({ animeId, isOpen, onClose }) => {
  const [animeDetails, setAnimeDetails] = useState<Anime | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && animeId !== null) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError(null);
        setAnimeDetails(null);
        try {
          const details = await getAnimeDetails(animeId);
          if (details) {
            setAnimeDetails(details);
          } else {
            setError('Could not load anime details.');
          }
        } catch (err) {
          console.error("Error fetching DNA details:", err);
          setError('Failed to fetch anime DNA. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, animeId]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-40 w-28" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-6 w-1/3 mt-2" />
          <Skeleton className="h-4 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      );
    }

    if (!animeDetails) {
      return <div className="p-6 text-center text-muted-foreground">No details available.</div>;
    }

    return (
      <>
        <DialogHeader className="p-4 sm:p-6 border-b border-border/50 sticky top-0 bg-card/90 backdrop-blur-sm z-10">
          <DialogTitle className="text-xl sm:text-2xl text-primary truncate pr-8">{animeDetails.title}</DialogTitle>
           <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <XCircle className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(70vh-120px)] sm:max-h-[calc(70vh-140px)]"> {/* Adjusted max-h */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              {animeDetails.imageUrl && (
                <div className="relative w-28 h-40 sm:w-32 sm:h-44 flex-shrink-0 rounded-md overflow-hidden border border-border shadow-md">
                  <Image src={animeDetails.imageUrl} alt={animeDetails.title} layout="fill" objectFit="cover" />
                </div>
              )}
              <div className="space-y-1.5 flex-1">
                <DetailItem label="Score" value={animeDetails.score ? `${animeDetails.score.toFixed(1)}/10` : 'N/A'} icon={Star} />
                <DetailItem label="Year" value={animeDetails.year} icon={CalendarDays} />
                <DetailItem label="Episodes" value={animeDetails.episodes} icon={Film} />
                <DetailItem label="Status" value={animeDetails.status} icon={Clock} />
                <DetailItem label="Source" value={animeDetails.source} icon={Briefcase} />
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-muted-foreground mb-1.5 flex items-center"><Palette size={16} className="mr-1.5 opacity-70"/>Genres:</h4>
              <div className="flex flex-wrap gap-1.5">
                {animeDetails.genres?.map(g => <Badge key={g.mal_id} variant="secondary">{g.name}</Badge>)}
              </div>
            </div>
            
            {(animeDetails as any).themes?.length > 0 && (
                 <div>
                    <h4 className="font-semibold text-muted-foreground mb-1.5 flex items-center"><Layers size={16} className="mr-1.5 opacity-70"/>Themes:</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {(animeDetails as any).themes.map((t: any) => <Badge key={t.mal_id} variant="outline">{t.name}</Badge>)}
                    </div>
                 </div>
            )}

            {(animeDetails as any).studios?.length > 0 && (
                 <div>
                    <h4 className="font-semibold text-muted-foreground mb-1.5 flex items-center"><Users size={16} className="mr-1.5 opacity-70"/>Studios:</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {(animeDetails as any).studios.map((s: any) => <Badge key={s.mal_id} variant="outline">{s.name}</Badge>)}
                    </div>
                 </div>
            )}
            
            {animeDetails.synopsis && (
              <div>
                <h4 className="font-semibold text-muted-foreground mb-1.5">Synopsis:</h4>
                <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all duration-300 ease-in-out">{animeDetails.synopsis}</p>
              </div>
            )}

            {(animeDetails as any).relations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-muted-foreground mb-1.5 flex items-center"><LinkIcon size={16} className="mr-1.5 opacity-70"/>Related Anime:</h4>
                <ul className="space-y-1 text-sm list-disc list-inside">
                  {(animeDetails as any).relations.map((rel: any, index: number) => (
                    rel.entry.map((entry: any) => (
                      <li key={`${index}-${entry.mal_id}`} className="text-foreground/90">
                        <span className="capitalize font-medium">{rel.relation.replace(/_/g, ' ')}:</span>
                        <a href={entry.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">
                          {entry.name} ({entry.type}) <ExternalLink size={12} className="inline-block ml-0.5 opacity-70"/>
                        </a>
                      </li>
                    ))
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 sm:p-6 border-t border-border/50 flex-shrink-0 bg-card/80 backdrop-blur-sm flex justify-end gap-2 sticky bottom-0">
          <DialogClose asChild>
             <Button variant="outline">Close</Button>
          </DialogClose>
          <Link href={`/anime/${animeDetails.mal_id}`} passHref legacyBehavior>
            <Button className="neon-glow-hover" onClick={onClose}>View Full Details</Button>
          </Link>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-deep sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default AnimeDnaModal;

    