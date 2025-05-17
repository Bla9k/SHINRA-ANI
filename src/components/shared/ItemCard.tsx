
import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Added this import
import { Star, CalendarDays, Tv, BookText, ArrowRight, Film, Layers, Info } from 'lucide-react';
import type { DisplayItem } from '@/app/page';
import { cn, } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface ItemCardProps {
  item: DisplayItem;
  className?: string;
  viewMode?: 'grid' | 'list';
  onEngageFocusMode?: (item: DisplayItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, className, viewMode = 'grid', onEngageFocusMode }) => {
  if (!item || typeof item.id !== 'number') return null;
  const linkHref = `/${item.type}/${item.id}`;
  const { theme } = useTheme();
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (onEngageFocusMode && viewMode === 'grid') {
      clearTimeout(hoverTimerRef.current!);
      hoverTimerRef.current = setTimeout(() => {
        onEngageFocusMode(item);
      }, 700);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const cardClasses = cn(
    "overflow-hidden transition-all duration-300 ease-in-out group rounded-lg shadow-md",
    theme === 'hypercharge-netflix'
      ? 'bg-card text-card-foreground border border-border/30 hover:border-primary/70 hover:shadow-primary/20 hover:shadow-lg rounded-sm'
      : 'glass-deep neon-glow-subtle-hover group-hover:border-primary/40',
    viewMode === 'list' ? 'h-28 flex flex-row' : 'h-full flex flex-col'
  );

  const imageContainerClasses = cn(
    "p-0 relative overflow-hidden",
    viewMode === 'list' ? 'w-20 flex-shrink-0 rounded-l-lg' : 'aspect-[5/7] w-full rounded-t-lg'
  );

  const contentClasses = cn(
    "flex flex-col flex-grow justify-between",
    viewMode === 'list' ? 'p-3' : 'p-2 sm:p-2.5'
  );

  return (
    <div
      className={cn(
        "block group",
        viewMode === 'list' ? 'w-full' : 'w-36 sm:w-40 md:w-44 lg:w-48 flex-shrink-0 h-full snap-start',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={linkHref} passHref legacyBehavior>
        <a className="block h-full">
          <Card className={cardClasses}>
            <CardHeader className={imageContainerClasses}>
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes={viewMode === 'list' ? "80px" : "(max-width: 640px) 40vw, (max-width: 768px) 30vw, 192px"}
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  priority={false}
                  onError={(e) => { (e.target as HTMLImageElement).src = viewMode === 'list' ? `https://placehold.co/80x112.png?text=N/A` : `https://placehold.co/300x420.png?text=N/A`; }}
                  data-ai-hint={item.type === 'anime' ? "anime poster" : "manga cover"}
                />
              ) : (
                <div className="absolute inset-0 bg-muted/70 flex items-center justify-center">
                  {item.type === 'anime' ? <Tv className="w-12 h-12 text-muted-foreground opacity-60" /> : <BookText className="w-12 h-12 text-muted-foreground opacity-60" />}
                </div>
              )}
              {viewMode === 'grid' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                  <div className="absolute bottom-1.5 left-2 right-2 z-10">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-primary-foreground line-clamp-2 shadow-text group-hover:text-primary transition-colors duration-200">{item.title}</CardTitle>
                  </div>
                  <Badge variant={item.status?.toLowerCase().includes('finished') || item.status?.toLowerCase().includes('complete') ? "secondary" : "default"} className="absolute top-1.5 right-1.5 text-[10px] capitalize backdrop-blur-sm bg-background/70 px-1.5 py-0.5 shadow-sm border border-border/50">
                    {item.status ? item.status.replace("Currently Airing", "Airing").replace("Finished Airing", "Finished") : item.type}
                  </Badge>
                </>
              )}
            </CardHeader>
            <CardContent className={contentClasses}>
              {viewMode === 'list' ? (
                <>
                  <div>
                    <CardTitle className="text-sm font-semibold mb-0.5 line-clamp-1 group-hover:text-primary transition-colors duration-200">{item.title}</CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                      {item.synopsis || (item.genres && item.genres.map(g => g.name).join(', ')) || 'No description available.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-start items-center text-[10px] text-muted-foreground mt-auto gap-x-2 gap-y-0.5">
                    {item.score && <span className="flex items-center gap-0.5"><Star size={12} className="text-yellow-400"/> {item.score.toFixed(1)}</span>}
                    {item.year && <span className="flex items-center gap-0.5"><CalendarDays size={12} /> {item.year}</span>}
                    {item.type === 'anime' && item.episodes && <span className="flex items-center gap-0.5"><Film size={12} /> {item.episodes} Ep</span>}
                    {item.type === 'manga' && item.chapters && <span className="flex items-center gap-0.5"><Layers size={12} /> {item.chapters} Ch</span>}
                    {item.status && <Badge variant="outline" className="text-[9px] capitalize px-1 py-0">{item.status.replace("Currently Airing", "Airing").replace("Finished Airing", "Finished")}</Badge>}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-1 mb-1.5 flex-wrap">
                      {item.genres?.slice(0, 2).map(g => <Badge key={g.mal_id} variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0.5 border-primary/30 text-primary/90">{g.name}</Badge>)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground space-y-0.5 mt-auto pt-1.5 border-t border-border/50">
                      {item.score && <p className="flex items-center gap-0.5"><Star size={12} className="text-yellow-400"/> Rating: {item.score.toFixed(1)}</p>}
                      {item.type === 'anime' && item.episodes && <p><Film size={12} className="inline mr-0.5"/> Episodes: {item.episodes}</p>}
                      {item.type === 'manga' && item.chapters && <p><Layers size={12} className="inline mr-0.5"/> Chapters: {item.chapters ?? 'N/A'}</p>}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </a>
      </Link>
    </div>
  );
};

export const SkeletonItemCard: React.FC<{ className?: string; viewMode?: 'grid' | 'list' }> = ({ className, viewMode = 'grid' }) => {
  const { theme } = useTheme();
    if (viewMode === 'list') {
        return (
            <Card className={cn("overflow-hidden w-full h-28 flex flex-row animate-pulse", theme === 'hypercharge-netflix' ? 'bg-card border-border/30 rounded-sm' : 'glass-deep', className)}>
                <CardHeader className="p-0 relative w-20 flex-shrink-0">
                    <Skeleton className="h-full w-full" />
                </CardHeader>
                <CardContent className="p-3 flex-grow flex flex-col justify-between">
                    <div>
                        <Skeleton className="h-4 w-3/4 mb-1.5" />
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-3 w-5/6 mb-2" />
                    </div>
                    <div className="flex justify-start items-center mt-auto gap-2">
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Default Grid Skeleton
    return (
        <Card className={cn("overflow-hidden w-36 sm:w-40 md:w-44 lg:w-48 flex-shrink-0 h-full flex flex-col snap-start rounded-lg shadow-md animate-pulse", theme === 'hypercharge-netflix' ? 'bg-card border-border/30 rounded-sm' : 'glass-deep', className)}>
            <CardHeader className="p-0 relative aspect-[5/7] w-full">
                <Skeleton className="h-full w-full" />
            </CardHeader>
            <CardContent className="p-2 sm:p-2.5 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <div className="flex gap-1.5">
                    <Skeleton className="h-3 w-10 rounded-full" />
                    <Skeleton className="h-3 w-12 rounded-full" />
                </div>
                <div className="mt-auto pt-1.5 border-t border-border/50 space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </CardContent>
        </Card>
    );
};


interface BannerCardProps {
  item: DisplayItem;
  className?: string;
  onEngageFocusMode?: (item: DisplayItem) => void;
}

export const BannerCard: React.FC<BannerCardProps> = ({ item, className, onEngageFocusMode }) => {
  if (!item || typeof item.id !== 'number') return null;
  const linkHref = `/${item.type}/${item.id}`;
  const bannerImageUrl = (item as Anime).trailer?.images?.maximum_image_url || (item as Anime).trailer?.images?.large_image_url || item.images?.jpg?.large_image_url || item.images?.webp?.large_image_url || item.imageUrl;
  const { theme } = useTheme();
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (onEngageFocusMode) {
      clearTimeout(hoverTimerRef.current!);
      hoverTimerRef.current = setTimeout(() => {
        onEngageFocusMode(item);
      }, 700);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  return (
    <div
      className={cn(
        "block w-[88vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] flex-shrink-0 relative aspect-video sm:aspect-[16/7] md:aspect-[16/6] h-auto snap-center group rounded-xl overflow-hidden",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={linkHref} passHref legacyBehavior>
        <a className="block h-full w-full">
          <Card className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out group-hover:scale-[1.02] h-full w-full shadow-xl",
              theme === 'hypercharge-netflix'
                ? 'border border-border/20 hover:border-primary/50 rounded-md'
                : 'glass-deep neon-glow-hover group-hover:border-primary/50'
            )}>
            <div className="absolute inset-0">
              {bannerImageUrl ? (
                <Image
                  src={bannerImageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 70vw"
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                  priority
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/800x450.png?text=Banner`; }}
                  data-ai-hint={item.type === 'anime' ? "anime banner" : "manga promotion"}
                />
              ) : (
                <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
                  {item.type === 'anime' ? <Tv className="w-16 h-16 text-muted-foreground opacity-50" /> : <BookText className="w-16 h-16 text-muted-foreground opacity-50" />}
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none md:w-1/2"></div>

            <CardContent className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10 flex flex-col sm:flex-row justify-between items-end sm:items-center gap-3">
              <div className="space-y-1.5 max-w-full sm:max-w-[65%]">
                <Badge variant="secondary" className="capitalize text-xs backdrop-blur-sm bg-background/70 border-border/50 shadow-sm">{item.type}</Badge>
                <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground line-clamp-1 shadow-text group-hover:text-primary transition-colors duration-200">{item.title}</CardTitle>
                <CardDescription className="text-md md:text-lg text-muted-foreground line-clamp-2 shadow-text group-hover:text-foreground/90 transition-colors duration-200">{item.synopsis || 'Discover more about this title.'}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "shrink-0 group-hover:text-primary-foreground transition-all duration-200 ease-in-out group-hover:scale-105 rounded-lg text-base",
                   theme === 'hypercharge-netflix'
                     ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                     : 'glass-deep neon-glow-hover group-hover:bg-primary group-hover:border-primary'
                )}
              >
                View Details <ArrowRight size={18} className="ml-2 group-hover:translate-x-1.5 transition-transform duration-200" />
              </Button>
            </CardContent>
          </Card>
        </a>
      </Link>
    </div>
  );
};

export const SkeletonBannerCard: React.FC<{ className?: string }> = ({ className }) => {
    const { theme } = useTheme();
    return (
    <Card className={cn(
        "overflow-hidden w-[88vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] flex-shrink-0 relative aspect-video sm:aspect-[16/7] md:aspect-[16/6] h-auto snap-center rounded-xl shadow-xl animate-pulse",
         theme === 'hypercharge-netflix' ? 'bg-card border-border/30 rounded-md' : 'glass-deep',
         className
        )}>
         <Skeleton className="absolute inset-0" />
         <CardContent className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10 flex flex-col sm:flex-row justify-between items-end sm:items-center gap-3">
             <div className="space-y-1.5 flex-grow mr-4 max-w-full sm:max-w-[65%]">
                 <Skeleton className="h-5 w-16 mb-1.5" />
                 <Skeleton className="h-7 md:h-8 w-3/4 mb-1.5" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-5/6" />
             </div>
             <Skeleton className="h-10 w-32 shrink-0 rounded-lg" />
         </CardContent>
    </Card>
)};
