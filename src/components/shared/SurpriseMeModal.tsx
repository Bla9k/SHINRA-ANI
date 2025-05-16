
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Anime } from '@/services/anime'; // Assuming Anime type is from here
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowRight, BadgeCheck, RefreshCw, Sparkles, Star, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface SurpriseMeModalProps {
  anime: Anime | null;
  isOpen: boolean;
  onClose: () => void;
  onTryAnother: () => void;
  isLoading: boolean;
}

const SurpriseMeModal: React.FC<SurpriseMeModalProps> = ({ anime, isOpen, onClose, onTryAnother, isLoading }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="glass-deep sm:max-w-md md:max-w-lg lg:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 border-b border-border/50 sticky top-0 bg-card/80 backdrop-blur-sm z-10">
          <DialogTitle className="text-xl sm:text-2xl text-primary flex items-center gap-2">
            <Sparkles size={22} /> Nami's Surprise Pick!
          </DialogTitle>
           <DialogClose className="absolute right-4 top-1/2 -translate-y-1/2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <XCircle className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-4 sm:p-6">
            {isLoading && !anime && (
              <div className="space-y-4">
                <Skeleton className="h-56 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            )}

            {!isLoading && !anime && (
              <div className="text-center py-10 text-muted-foreground">
                <AlertCircle className="mx-auto h-12 w-12 mb-3" />
                <p>Nami couldn't find a surprise this time. Please try again!</p>
              </div>
            )}

            {anime && !isLoading && (
              <div className="space-y-3">
                <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden shadow-lg border border-border/30">
                  <Image
                    src={anime.trailer?.images?.maximum_image_url || anime.images?.jpg?.large_image_url || 'https://placehold.co/720x405.png?text=No+Image'}
                    alt={anime.title}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint="anime scene"
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{anime.title}</h3>
                <div className="flex flex-wrap gap-1">
                  {anime.genres?.slice(0, 3).map(g => <Badge key={g.mal_id} variant="secondary">{g.name}</Badge>)}
                  {anime.score && <Badge variant="outline" className="flex items-center gap-1"><Star size={12} className="text-yellow-400"/>{anime.score.toFixed(1)}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {anime.synopsis || 'No synopsis available.'}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 sm:p-6 border-t border-border/50 flex-shrink-0 bg-card/80 backdrop-blur-sm flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onTryAnother} disabled={isLoading} className="w-full sm:w-auto neon-glow-hover">
            <RefreshCw size={16} className={cn("mr-2", isLoading && "animate-spin")} /> Try Another!
          </Button>
          {anime && (
            <Link href={`/anime/${anime.mal_id}`} passHref legacyBehavior>
              <Button asChild className="w-full sm:w-auto fiery-glow-hover" onClick={onClose}>
                <a>View Details <ArrowRight size={16} className="ml-2"/></a>
              </Button>
            </Link>
          )}
           <DialogClose asChild className="sm:hidden">
             <Button variant="ghost" className="w-full">Close</Button>
           </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SurpriseMeModal;
