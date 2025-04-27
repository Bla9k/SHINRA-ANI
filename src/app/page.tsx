'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getAnimes, getMangas, Anime, Manga } from '@/services'; // Updated imports
import { Sparkles, AlertCircle, Tv, BookText, Star, TrendingUp, Clock, CalendarDays, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; // Import cn utility
import { aiDrivenHomepage, AIDrivenHomepageInput, AIDrivenHomepageOutput } from '@/ai/flows/ai-driven-homepage'; // Import AI Flow


// Define a unified type for items displayed on the homepage
type DisplayItem = (Anime | Manga) & {
    id: number; // Consistent ID field (mapped from mal_id)
    type: 'anime' | 'manga';
    imageUrl: string | null; // Derived image URL
    description?: string | null; // Synopsis mapped here
    // Add other common fields if needed
};

// Helper to map Anime/Manga service types to DisplayItem
const mapToDisplayItem = (item: Anime | Manga): DisplayItem | null => {
    if (!item || typeof item.mal_id !== 'number') return null;
    return {
        ...item,
        id: item.mal_id,
        type: 'episodes' in item ? 'anime' : 'manga',
        imageUrl: item.images?.jpg?.large_image_url ?? item.images?.jpg?.image_url ?? null,
        description: item.synopsis,
        // Ensure year is mapped if available (used in cards)
        year: item.year ?? ('published' in item && item.published?.from ? new Date(item.published.from).getFullYear() : null),
    };
};

// --- Components ---

// Item Card for regular sections (horizontal scroll)
const ItemCard = ({ item }: { item: DisplayItem }) => {
    if (!item) return null;
    const linkHref = `/${item.type}/${item.id}`;

    return (
        <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-105 group w-40 md:w-48 flex-shrink-0 h-full flex flex-col snap-start"> {/* Fixed width, snap */}
            <CardHeader className="p-0 relative aspect-[2/3] w-full overflow-hidden">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 40vw, 192px" // Adjusted sizes
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        priority={false} // Lower priority for non-banner images
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/200/300?grayscale`; }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        {item.type === 'anime' ? <Tv className="w-10 h-10 text-muted-foreground opacity-50" /> : <BookText className="w-10 h-10 text-muted-foreground opacity-50" />}
                    </div>
                )}
                {/* Subtle Gradient for text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                 <div className="absolute bottom-1.5 left-2 right-2 z-10"> {/* Ensure text is above gradient */}
                    <CardTitle className="text-xs font-semibold text-primary-foreground line-clamp-2 shadow-text">{item.title}</CardTitle>
                 </div>
                 <Badge variant="secondary" className="absolute top-1 right-1 text-[10px] capitalize backdrop-blur-sm bg-background/60 px-1.5 py-0.5 z-10"> {/* Ensure badge is above */}
                   {item.type}
                 </Badge>
            </CardHeader>
             <CardContent className="p-2 flex flex-col flex-grow"> {/* Reduced padding */}
                 <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-auto pt-1 border-t border-border/50">
                     {item.score && (
                        <span className="flex items-center gap-0.5" title="Score">
                            <Star size={10} className="text-yellow-400" /> {item.score.toFixed(1)}
                        </span>
                     )}
                     {item.year && (
                        <span className="flex items-center gap-0.5" title="Year">
                            <CalendarDays size={10} /> {item.year}
                        </span>
                     )}
                     <Button variant="link" size="sm" asChild className="text-[10px] p-0 h-auto">
                         <Link href={linkHref}>Details</Link>
                     </Button>
                 </div>
             </CardContent>
        </Card>
    );
};

// Banner Card for Nami's Picks (horizontal scroll) - Larger Hero Style
const BannerCard = ({ item }: { item: DisplayItem }) => {
    if (!item) return null;
    const linkHref = `/${item.type}/${item.id}`;

    return (
        // Increased width and adjusted aspect ratio for a more banner-like feel
        <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-[1.02] group w-[85vw] sm:w-[75vw] md:w-[65vw] lg:w-[55vw] flex-shrink-0 relative aspect-[16/7] h-auto snap-center"> {/* Adjusted widths */}
             <div className="absolute inset-0">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        // Updated sizes for the larger banner
                        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 75vw, 65vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        priority // Higher priority for banner images
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/800/350?grayscale`; }} // Larger placeholder
                    />
                ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        {item.type === 'anime' ? <Tv className="w-16 h-16 text-muted-foreground opacity-50" /> : <BookText className="w-16 h-16 text-muted-foreground opacity-50" />}
                    </div>
                )}
            </div>
            {/* More subtle gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none"></div> {/* Left fade subtle */}


            {/* Content positioned at the bottom left */}
            <CardContent className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10 flex justify-between items-end">
                 <div className="space-y-1 max-w-[70%]"> {/* Limit text width */}
                    <Badge variant="secondary" className="capitalize text-xs backdrop-blur-sm bg-background/60">{item.type}</Badge>
                    <CardTitle className="text-xl md:text-2xl font-bold text-primary-foreground line-clamp-1 shadow-text">{item.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2 shadow-text">{item.description || 'Check it out!'}</CardDescription>
                 </div>
                 <Button variant="outline" size="sm" asChild className="glass neon-glow-hover shrink-0">
                     <Link href={linkHref}>
                         View Details <ArrowRight size={14} className="ml-1" />
                     </Link>
                 </Button>
            </CardContent>
        </Card>
    );
};

// Skeleton Card for regular sections
const SkeletonItemCard = () => (
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

// Skeleton Card for Banner section - Adjusted size
const SkeletonBannerCard = () => (
    <Card className="overflow-hidden glass w-[85vw] sm:w-[75vw] md:w-[65vw] lg:w-[55vw] flex-shrink-0 relative aspect-[16/7] h-auto snap-center"> {/* Match banner size */}
         <Skeleton className="absolute inset-0" />
         <CardContent className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10 flex justify-between items-end">
             <div className="space-y-1 flex-grow mr-4 max-w-[70%]">
                 <Skeleton className="h-4 w-16 mb-1" />
                 <Skeleton className="h-6 md:h-7 w-3/4 mb-1" /> {/* Larger title skeleton */}
                 <Skeleton className="h-3 w-full" />
                 <Skeleton className="h-3 w-5/6" />
             </div>
             <Skeleton className="h-8 w-24 shrink-0" />
         </CardContent>
    </Card>
);


// --- Main Page Component ---

export default function Home() {
    const [homepageData, setHomepageData] = useState<AIDrivenHomepageOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial data using the AI flow
    const fetchHomepageData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // TODO: Replace dummy profile/mood/activity with actual user data
            const input: AIDrivenHomepageInput = {
                userProfile: "Loves action, fantasy, isekai anime. Recently watched One Punch Man, reads Berserk.",
                currentMood: "Adventurous",
                recentActivity: ["One Punch Man"],
            };
            console.log("Fetching AI Driven Homepage with input:", input);
            const data = await aiDrivenHomepage(input);
            setHomepageData(data);
            console.log("AI Driven Homepage data received:", data);

        } catch (err: any) {
            console.error("Failed to fetch AI-driven homepage data:", err);
            setError("Could not load personalized homepage content. Please try refreshing.");
            setHomepageData(null); // Clear data on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHomepageData();
    }, [fetchHomepageData]);

    // Helper to render a horizontally scrolling section
    const renderHorizontalSection = (
        title: string,
        icon: React.ElementType,
        items: (Anime | Manga)[] | undefined, // Make items optional
        isLoading: boolean,
        viewAllLink?: string,
        itemComponent: React.FC<{ item: DisplayItem }> = ItemCard, // Default to ItemCard
        skeletonComponent: React.FC = SkeletonItemCard // Default skeleton
    ) => {
        // Ensure items is an array before mapping, default to empty array if undefined
        const validItems = Array.isArray(items) ? items : [];
        const displayItems = validItems.map(mapToDisplayItem).filter((item): item is DisplayItem => item !== null);

        return (
            <section className="mb-8 md:mb-12">
                {/* Section Title - Add padding here to align with container */}
                <div className="flex items-center justify-between mb-3 md:mb-4 px-4 md:px-6 lg:px-8">
                    <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                        {React.createElement(icon, { className: "text-primary w-5 h-5 md:w-6 md:h-6" })} {title}
                    </h2>
                    {viewAllLink && displayItems.length > 0 && ( // Only show View All if there are items
                        <Button variant="link" size="sm" asChild className="text-xs md:text-sm">
                            <Link href={viewAllLink}>View All <ArrowRight size={14} className="ml-1" /></Link>
                        </Button>
                    )}
                </div>
                 {/* Scrollable Container - Use pl for starting padding, let it scroll off-screen */}
                 <div className="relative">
                  <div className={cn(
                      "flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent",
                      "pl-4 md:pl-6 lg:pl-8", // Consistent starting padding matching the title
                      "snap-x snap-mandatory", // Add snap scrolling
                      "pr-4 md:pr-6 lg:pr-8" // Add right padding to prevent last item sticking to edge
                      )}>
                    {isLoading && displayItems.length === 0
                        ? Array.from({ length: itemComponent === BannerCard ? 3 : 5 }).map((_, index) => React.createElement(skeletonComponent, { key: `${title}-skel-${index}` })) // Show fewer banner skeletons
                        : displayItems.length > 0
                            ? displayItems.map((item, index) => React.createElement(itemComponent, { key: `${item.type}-${item.id}-${index}`, item: item })) // Use index in key for safety if IDs overlap between anime/manga in combined lists
                            : !isLoading && <p className="text-center text-muted-foreground italic px-4 py-5">Nothing to show here right now.</p>}
                  </div>
                 {/* Removed the fade overlays for cleaner look */}
                </div>
            </section>
        );
    };


    return (
         // Removed container mx-auto, use full width but control padding within sections
        <div className="py-6 md:py-8">
            {/* Global Error Display */}
            {error && (
                 // Added padding to match section titles
                 <div className="px-4 md:px-6 lg:px-8 mb-6">
                   <Alert variant="destructive">
                     <AlertCircle className="h-4 w-4" />
                     <AlertTitle>Error Loading Homepage</AlertTitle>
                     <AlertDescription>{error}</AlertDescription>
                   </Alert>
                 </div>
            )}

            {/* Nami's Picks Banner Section - Using AI data */}
            {renderHorizontalSection(
                "Nami's Picks For You",
                Sparkles,
                // Combine personalized anime and manga from AI response
                 homepageData ? [...(homepageData.personalizedAnime || []), ...(homepageData.personalizedManga || [])] : [],
                loading,
                undefined, // No "View All"
                BannerCard, // Use BannerCard component
                SkeletonBannerCard // Use Banner Skeleton
             )}
             {homepageData?.reasoning && !loading && (
                 // Added padding to match section titles
                 <p className="text-sm text-center italic text-muted-foreground mb-8 px-4 md:px-6 lg:px-8">{homepageData.reasoning}</p>
             )}

             {/* Other Sections */}
             {renderHorizontalSection( "Trending Anime", TrendingUp, homepageData?.trendingAnime, loading, "/anime?sort=popularity")}
             {renderHorizontalSection( "Trending Manga", TrendingUp, homepageData?.trendingManga, loading, "/manga?sort=popularity")}
             {renderHorizontalSection( "Airing Now", Clock, homepageData?.airingAnime, loading, "/anime?status=airing")}
             {renderHorizontalSection( "Popular Anime", Star, homepageData?.popularAnime, loading, "/anime?sort=score")}
             {renderHorizontalSection( "Popular Manga", Star, homepageData?.popularManga, loading, "/manga?sort=score")}
             {renderHorizontalSection( "Upcoming Anime", CalendarDays, homepageData?.upcomingAnime, loading, "/anime?status=upcoming")}

        </div>
    );
}

// Basic text shadow utility class
const styles = `
  .shadow-text {
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
  }
  /* Custom Scrollbar */
  .scrollbar-thin {
    scrollbar-width: thin; /* For Firefox */
    scrollbar-color: hsl(var(--primary) / 0.5) transparent; /* For Firefox */
  }
  .scrollbar-thin::-webkit-scrollbar {
    height: 6px; /* Height of horizontal scrollbar */
    width: 6px; /* Width of vertical scrollbar */
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent; /* Optional: style the track */
     border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: hsl(var(--primary) / 0.5); /* Thumb color */
    border-radius: 3px;
    border: 1px solid transparent; /* Optional: creates padding around thumb */
     background-clip: content-box;
  }
   .scrollbar-thin::-webkit-scrollbar-thumb:hover {
     background-color: hsl(var(--primary) / 0.7); /* Thumb color on hover */
   }

   /* Ensure snap scrolling works correctly */
    .snap-x { scroll-snap-type: x mandatory; }
    .snap-start { scroll-snap-align: start; }
    .snap-center { scroll-snap-align: center; }
`;
// Inject styles
if (typeof window !== 'undefined') {
    const styleId = 'custom-styles-homepage'; // Use a unique ID
    if (!document.getElementById(styleId)) {
        const styleSheet = document.createElement("style");
        styleSheet.id = styleId;
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }
}
