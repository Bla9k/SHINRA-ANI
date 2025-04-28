
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Star, CalendarDays, Tv, BookText } from 'lucide-react';
import type { Anime } from '@/services/anime'; // Use types for better safety
import type { Manga } from '@/services/manga';

// Define a unified type for items
type DisplayItem = (Anime | Manga) & {
    id: number;
    type: 'anime' | 'manga';
    imageUrl: string | null;
    score?: number | null;
    year?: number | null;
};

interface ItemCardProps {
  item: DisplayItem;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  if (!item || typeof item.id !== 'number') return null;
  const linkHref = `/${item.type}/${item.id}`;

  return (
    <Link href={linkHref} passHref legacyBehavior>
      <a className="block w-40 md:w-48 flex-shrink-0 h-full snap-start group">
        <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 group-hover:scale-105 h-full flex flex-col">
          <CardHeader className="p-0 relative aspect-[2/3] w-full overflow-hidden">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 40vw, 192px"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                priority={false}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/200/300?grayscale`; }}
              />
            ) : (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                {item.type === 'anime' ? <Tv className="w-10 h-10 text-muted-foreground opacity-50" /> : <BookText className="w-10 h-10 text-muted-foreground opacity-50" />}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-1.5 left-2 right-2 z-10">
              <CardTitle className="text-xs font-semibold text-primary-foreground line-clamp-2 shadow-text">{item.title}</CardTitle>
            </div>
            <Badge variant="secondary" className="absolute top-1 right-1 text-[10px] capitalize backdrop-blur-sm bg-background/60 px-1.5 py-0.5 z-10">
              {item.type}
            </Badge>
          </CardHeader>
          <CardContent className="p-2 flex flex-col flex-grow">
            <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-auto pt-1 border-t border-border/50">
              {item.score !== null && item.score !== undefined && (
                <span className="flex items-center gap-0.5" title="Score">
                  <Star size={10} className="text-yellow-400" /> {item.score.toFixed(1)}
                </span>
              )}
              {item.year && (
                <span className="flex items-center gap-0.5" title="Year">
                  <CalendarDays size={10} /> {item.year}
                </span>
              )}
              <span className="text-primary text-[10px] font-medium group-hover:underline">Details</span>
            </div>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
};

export const SkeletonItemCard: React.FC = () => (
    <Card className="overflow-hidden glass w-40 md:w-48 flex-shrink-0 h-full flex flex-col snap-start">
        <CardHeader className="p-0 relative aspect-[2/3] w-full">
            <Skeleton className="h-full w-full" />
        </CardHeader>
        <CardContent className="p-2 space-y-1">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between items-center pt-1 border-t border-border/50">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-4 w-10" />
            </div>
        </CardContent>
    </Card>
);

// Add BannerCard and SkeletonBannerCard here if needed for consistency
// Example (can be customized further):
interface BannerCardProps {
  item: DisplayItem;
}

export const BannerCard: React.FC<BannerCardProps> = ({ item }) => {
  if (!item || typeof item.id !== 'number') return null;
  const linkHref = `/${item.type}/${item.id}`;

  return (
    <Link href={linkHref} passHref legacyBehavior>
      <a className="block w-[85vw] sm:w-[75vw] md:w-[65vw] lg:w-[55vw] flex-shrink-0 relative aspect-[16/7] h-auto snap-center group">
        <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 group-hover:scale-[1.02] h-full w-full">
          <div className="absolute inset-0">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 75vw, 65vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/800/350?grayscale`; }}
              />
            ) : (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                {item.type === 'anime' ? <Tv className="w-16 h-16 text-muted-foreground opacity-50" /> : <BookText className="w-16 h-16 text-muted-foreground opacity-50" />}
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none"></div>

          <CardContent className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10 flex justify-between items-end">
            <div className="space-y-1 max-w-[70%]">
              <Badge variant="secondary" className="capitalize text-xs backdrop-blur-sm bg-background/60">{item.type}</Badge>
              <CardTitle className="text-xl md:text-2xl font-bold text-primary-foreground line-clamp-1 shadow-text">{item.title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground line-clamp-2 shadow-text">{item.synopsis || 'Check it out!'}</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="glass neon-glow-hover shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              View Details <ArrowRight size={14} className="ml-1" />
            </Button>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
};

export const SkeletonBannerCard: React.FC = () => (
    <Card className="overflow-hidden glass w-[85vw] sm:w-[75vw] md:w-[65vw] lg:w-[55vw] flex-shrink-0 relative aspect-[16/7] h-auto snap-center">
         <Skeleton className="absolute inset-0" />
         <CardContent className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10 flex justify-between items-end">
             <div className="space-y-1 flex-grow mr-4 max-w-[70%]">
                 <Skeleton className="h-4 w-16 mb-1" />
                 <Skeleton className="h-6 md:h-7 w-3/4 mb-1" />
                 <Skeleton className="h-3 w-full" />
                 <Skeleton className="h-3 w-5/6" />
             </div>
             <Skeleton className="h-8 w-24 shrink-0" />
         </CardContent>
    </Card>
);
