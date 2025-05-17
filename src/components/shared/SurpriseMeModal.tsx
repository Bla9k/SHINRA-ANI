
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Anime, Manga } from '@/services'; // Using Anime/Manga types directly
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowRight, BadgeCheck, RefreshCw, Sparkles, Star, XCircle, Tv, BookText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import type { SurpriseMeRecommendationOutput } from '@/ai/flows/surprise-me-recommendation';

interface SurpriseMeModalProps {
  item: SurpriseMeRecommendationOutput | null; // Item can be Anime or Manga
  isOpen: boolean;
  onClose: () => void;
  onTryAnother: () => void;
  isLoading: boolean;
}

const SurpriseMeModal: React.FC<SurpriseMeModalProps> = ({ item, isOpen, onClose, onTryAnother, isLoading }) => {
  if (!isOpen) return null;

  const isAnime = item?.type === 'anime';
  const displayItem = item as (Anime | Manga | null); // Cast for easier access to common fields

  const itemImageUrl = displayItem?.images?.jpg?.large_image_url ||
                       displayItem?.images?.jpg?.image_url ||
                       displayItem?.images?.webp?.large_image_url ||
                       (isAnime ? (displayItem as Anime)?.trailer?.images?.maximum_image_url : null) ||
                       'https://placehold.co/720x405.png?text=Shinra+Pick&font=lora';

  const detailPageUrl = displayItem ? `/${displayItem.type}/${displayItem.mal_id}` : '#';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="glass-deep sm:max-w-md md:max-w-lg lg:max-w-xl p-0 overflow-hidden shadow-xl border-primary/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader className="p-4 sm:p-5 border-b border-border/50 sticky top-0 bg-card/80 backdrop-blur-sm z-10 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg sm:text-xl text-primary flex items-center gap-2">
            <Sparkles size={20} /> Nami's Surprise Pick!
          </DialogTitle>
           <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <XCircle className="h-5 w-5" />
                <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(70vh-100px)] sm:max-h-[calc(70vh-120px)]"> {/* Adjusted max-h */}
          <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
            {isLoading && !displayItem && (
              <div className="space-y-4">
                <Skeleton className="h-48 sm:h-56 w-full rounded-lg bg-muted/30" />
                <Skeleton className="h-6 w-3/4 bg-muted/30" />
                <Skeleton className="h-4 w-1/2 bg-muted/30" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full bg-muted/30" />
                  <Skeleton className="h-5 w-20 rounded-full bg-muted/30" />
                </div>
                <Skeleton className="h-16 w-full bg-muted/30" />
              </div>
            )}

            {!isLoading && !displayItem && (
              <div className="text-center py-10 text-muted-foreground">
                <AlertCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 opacity-70" />
                <p>Nami couldn't find a surprise this time. Please try again!</p>
              </div>
            )}

            {displayItem && !isLoading && (
              <>
                <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden shadow-lg border border-border/20">
                  <Image
                    src={itemImageUrl}
                    alt={displayItem.title}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint="anime manga scene"
                    priority
                  />
                   <Badge variant="secondary" className="absolute top-2 left-2 text-xs capitalize backdrop-blur-sm bg-black/50 text-white px-2 py-1">
                    {displayItem.type === 'anime' ? <Tv size={14} className="mr-1"/> : <BookText size={14} className="mr-1"/>}
                    {displayItem.type}
                  </Badge>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">{displayItem.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {displayItem.genres?.slice(0, 3).map(g => <Badge key={g.mal_id} variant="secondary" className="text-xs">{g.name}</Badge>)}
                  {displayItem.score && <Badge variant="outline" className="flex items-center gap-1 text-xs border-yellow-500/50 text-yellow-400"><Star size={12} className="fill-yellow-400 text-yellow-500"/>{displayItem.score.toFixed(1)}</Badge>}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {displayItem.synopsis || 'No synopsis available.'}
                </p>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-3 sm:p-4 border-t border-border/50 sticky bottom-0 bg-card/80 backdrop-blur-sm z-10 flex flex-col sm:flex-row gap-2 justify-end">
          <Button variant="outline" onClick={onTryAnother} disabled={isLoading} className="w-full sm:w-auto neon-glow-hover">
            <RefreshCw size={16} className={cn("mr-2", isLoading && "animate-spin")} /> Try Another!
          </Button>
          {displayItem && (
            <Link href={detailPageUrl} passHref legacyBehavior>
              <Button asChild className="w-full sm:w-auto fiery-glow-hover" onClick={onClose}>
                <a>View Details <ArrowRight size={16} className="ml-2"/></a>
              </Button>
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SurpriseMeModal;

