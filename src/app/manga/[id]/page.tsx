
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getMangaDetails, Manga, getMangaRecommendations } from '@/services/manga';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Star, BookText, Layers, Library, Clock, ExternalLink, AlertCircle, CalendarDays, BookOpen, Sparkles, Users, Link2, Drama, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ItemCard, SkeletonItemCard } from '@/components/shared/ItemCard';
import { getMoodBasedRecommendations } from '@/ai/flows/mood-based-recommendations';

// Helper function to format status
const formatStatus = (status: string | null): string => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

// Helper to format score with icon
const ScoreDisplay = ({ score }: { score: number | null }) => {
    if (score === null || score === undefined) return <span className="text-sm text-muted-foreground">N/A</span>;
    const scoreColor = score >= 8 ? 'text-green-400' : score >= 6 ? 'text-yellow-400' : 'text-red-400';
    return (
        <span className={`flex items-center gap-1 font-semibold ${scoreColor}`}>
            <Star size={16} className="fill-current" /> {score.toFixed(1)}
        </span>
    );
};

// Helper to render a horizontal scrollable section for related items
const renderHorizontalSection = (
    title: string,
    icon: React.ElementType,
    items: Manga[] | null | undefined,
    isLoading: boolean,
    emptyMessage: string = "Nothing to show here right now.",
    itemComponent: React.FC<{ item: any }> = ItemCard,
    skeletonComponent: React.FC = SkeletonItemCard
) => {
    const validItems = Array.isArray(items) ? items : [];
    const displayItems = validItems.map(item => ({
        ...item,
        id: item.mal_id,
        type: 'manga' as const,
        imageUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || null,
    }));

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-3 md:mb-4 px-0">
                <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                    {React.createElement(icon, { className: "text-primary w-5 h-5 md:w-6 md:h-6" })} {title}
                </h3>
            </div>
            <div className="relative">
                <div className={cn(
                    "flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent",
                    "snap-x snap-mandatory"
                )}>
                    {isLoading && displayItems.length === 0
                        ? Array.from({ length: 5 }).map((_, index) => React.createElement(skeletonComponent, { key: `${title}-skel-${index}` }))
                        : displayItems.length > 0
                            ? displayItems.map((item, index) => item && item.id ? React.createElement(itemComponent, { key: `${item.type}-${item.id}-${index}`, item: item }) : null)
                            : !isLoading && <p className="text-center text-muted-foreground italic px-4 py-5">{emptyMessage}</p>}
                </div>
            </div>
        </section>
    );
};

export default function MangaDetailPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id as string, 10) : NaN;

  const [manga, setManga] = useState<Manga | null>(null);
  const [recommendations, setRecommendations] = useState<Manga[]>([]);
  const [namiRecommendations, setNamiRecommendations] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingNamiRecs, setLoadingNamiRecs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [namiError, setNamiError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(id)) {
      setError('Invalid Manga ID.');
      setLoading(false); setLoadingRecs(false); setLoadingNamiRecs(false);
      return;
    }

    async function fetchMangaData() {
       setLoading(true); setLoadingRecs(true); setLoadingNamiRecs(true);
       setError(null); setNamiError(null);
       setManga(null); setRecommendations([]); setNamiRecommendations([]);

      try {
        const fetchedManga = await getMangaDetails(id);
        if (!fetchedManga) {
            setError('Manga details not found.'); notFound(); return;
        }
        setManga(fetchedManga);
        setLoading(false);

        getMangaRecommendations(id).then(recs => setRecommendations(recs)).catch(err => console.error("Jikan Recs failed:", err)).finally(() => setLoadingRecs(false));

        const namiInput = { mood: "Similar to this", watchHistory: [fetchedManga.title], profileActivity: `Interested in manga like ${fetchedManga.title}, genres: ${fetchedManga.genres.map(g => g.name).join(', ')}.` };
        getMoodBasedRecommendations(namiInput).then(namiRecs => setNamiRecommendations(namiRecs.mangaRecommendations || [])).catch(err => { console.error("Nami Recs failed:", err); setNamiError("Nami couldn't find recommendations."); }).finally(() => setLoadingNamiRecs(false));
      } catch (err: any) {
        console.error(`Error fetching manga details for ID ${id}:`, err);
        setError(err.message || 'Failed to load manga details.');
      } finally {
         setLoading(false); setLoadingRecs(false); setLoadingNamiRecs(false);
      }
    }
    fetchMangaData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading && !manga) return <MangaDetailSkeleton />;
  if (error) return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
         <Alert variant="destructive" className="max-w-md glass"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
      </div>
  );
  if (!manga) return (
      <div className="container mx-auto px-4 py-8 text-center flex items-center justify-center min-h-[60vh]">
          <Alert variant="destructive" className="max-w-md glass"><AlertCircle className="h-4 w-4" /><AlertTitle>Manga Not Found</AlertTitle><AlertDescription>The requested manga could not be loaded.</AlertDescription></Alert>
      </div>
  );

  const alternativeTitles = {
    english: (manga as any).title_english,
    japanese: (manga as any).title_japanese,
    synonyms: (manga as any).title_synonyms || [],
  };

  const mangaDexSearchUrl = `https://mangadex.org/search?q=${encodeURIComponent(manga.title)}`;

  return (
     <div className="container mx-auto px-4 py-8">
        <div className="absolute inset-x-0 top-0 h-[40vh] md:h-[60vh] -z-10 overflow-hidden">
             {manga.imageUrl && <Image src={manga.imageUrl} alt={`${manga.title} backdrop`} fill className="object-cover object-top opacity-15 blur-md scale-110" aria-hidden="true" priority />}
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
        </div>

        <div className="relative mt-16 md:mt-32">
            <Card className="overflow-visible glass border-primary/20 shadow-xl backdrop-blur-xl bg-card/60 mb-12">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-4 md:p-8">
                    <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0 text-center -mt-24 md:-mt-32 z-10">
                        <Card className="overflow-hidden aspect-[2/3] relative shadow-lg neon-glow border-2 border-primary/50 w-48 md:w-full mx-auto">
                           {manga.imageUrl ? <Image src={manga.imageUrl} alt={manga.title} fill sizes="(max-width: 768px) 192px, 25vw" className="object-cover" priority />
                           : <div className="h-full w-full bg-muted flex items-center justify-center"><BookText className="w-16 h-16 text-muted-foreground opacity-50" /></div>}
                        </Card>
                        <div className="flex flex-col gap-3 mt-4">
                            <Button size="sm" className="w-full neon-glow-hover" asChild>
                                <Link href={mangaDexSearchUrl} target="_blank" rel="noopener noreferrer">
                                    <BookOpen size={16} className="mr-2"/> Read on MangaDex
                                    <ArrowRight size={14} className="ml-1.5" />
                                </Link>
                            </Button>
                           {manga.url && <Button variant="outline" size="sm" asChild className="w-full neon-glow-hover">
                                  <Link href={manga.url} target="_blank" rel="noopener noreferrer">View on MyAnimeList <ExternalLink size={14} className="ml-2" /></Link></Button>}
                        </div>
                    </div>
                    <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                        <CardHeader className="p-0 mb-3">
                           <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">{manga.title}</CardTitle>
                           {alternativeTitles.english && alternativeTitles.english !== manga.title && <p className="text-lg text-muted-foreground">{alternativeTitles.english}</p>}
                           {alternativeTitles.japanese && <p className="text-md text-muted-foreground/80">{alternativeTitles.japanese}</p>}
                        </CardHeader>
                        <div className="flex flex-wrap gap-2 mb-4">
                           {manga.genres?.map(g => <Badge key={g.mal_id} variant="secondary" className="neon-glow-hover text-xs cursor-default backdrop-blur-sm bg-secondary/60">{g.name}</Badge>)}
                           {(manga as any).demographics?.map((d: any) => <Badge key={d.mal_id} variant="outline" className="text-xs cursor-default backdrop-blur-sm bg-accent/20 border-accent/50">{d.name}</Badge>)}
                        </div>
                         <Card className="glass p-3 mb-4 border-primary/10">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                                <div className="flex items-center gap-2" title="Score"><ScoreDisplay score={manga.score} /></div>
                                <div className="flex items-center gap-1" title="Chapters"><Layers size={16} className="text-muted-foreground" /> <span className="text-foreground">{manga.chapters ?? 'N/A'} Ch</span></div>
                                <div className="flex items-center gap-1" title="Volumes"><Library size={16} className="text-muted-foreground" /> <span className="text-foreground">{manga.volumes ?? 'N/A'} Vol</span></div>
                               <div className="flex items-center gap-1" title="Status"><Clock size={16} className="text-muted-foreground" /> <span className="text-foreground">{formatStatus(manga.status)}</span></div>
                               {manga.year && <div className="flex items-center gap-1" title="Year"><CalendarDays size={16} className="text-muted-foreground" /> <span className="text-foreground">{manga.year}</span></div>}
                           </div>
                         </Card>
                        {(manga as any).authors?.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Authors:</h4>
                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                    {(manga as any).authors.map((author: any) => (
                                        <span key={author.mal_id} className="text-sm text-foreground/90">{author.name} ({author.type})</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <Separator className="my-4 bg-border/50" />
                        <CardContent className="p-0 flex-grow">
                            <div className="space-y-2">
                               <h3 className="text-xl font-semibold mb-2">Synopsis</h3>
                               <ScrollArea className="h-24 pr-3"><CardDescription className="text-base leading-relaxed prose prose-invert prose-sm max-w-none">{manga.synopsis || 'No synopsis available.'}</CardDescription></ScrollArea>
                            </div>
                             {alternativeTitles.synonyms && alternativeTitles.synonyms.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Also Known As:</h4>
                                    <p className="text-xs text-muted-foreground/90">{alternativeTitles.synonyms.join(', ')}</p>
                                </div>
                            )}
                        </CardContent>
                    </div>
                </div>
            </Card>

            <section className="mb-12">
                 <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Layers size={22}/> Chapters</h3>
                 <Card className="glass p-6 flex flex-col items-center justify-center text-center border-border/50 min-h-[150px]">
                     <BookOpen size={40} className="mb-3 text-muted-foreground opacity-50"/>
                     <p className="font-medium text-muted-foreground">Chapter Lists & In-App Reading Coming Soon!</p>
                     <p className="text-sm text-muted-foreground">We're working hard to bring you a seamless reading experience. For now, please use the "Read on MangaDex" button above or check MyAnimeList/other official sources for chapter details.</p>
                 </Card>
            </section>

            {(manga as any).relations?.length > 0 && (
                <section className="mb-12">
                    <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Link2 size={22}/> Related Manga</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {(manga as any).relations.map((relation: any) => (
                            relation.entry.filter((e: any) => e.type === 'manga').map((relatedManga: any) => (
                                <Link key={relatedManga.mal_id} href={`/manga/${relatedManga.mal_id}`} passHref legacyBehavior>
                                    <a className="block group">
                                        <Card className="glass neon-glow-hover h-full">
                                            <CardContent className="p-3">
                                                <CardTitle className="text-sm group-hover:text-primary">{relatedManga.name}</CardTitle>
                                                <CardDescription className="text-xs capitalize">{relation.relation.replace(/_/g, ' ')}</CardDescription>
                                            </CardContent>
                                        </Card>
                                    </a>
                                </Link>
                            ))
                        ))}
                    </div>
                </section>
            )}

            {(loadingNamiRecs || namiRecommendations.length > 0 || namiError) && (
                 <section className="mb-12">
                    <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Sparkles className="text-primary"/> Nami's Picks For You</h3>
                    {namiError && !loadingNamiRecs && (<Alert variant="destructive" className="glass mb-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Nami Error</AlertTitle><AlertDescription>{namiError}</AlertDescription></Alert>)}
                    {renderHorizontalSection("", () => null, namiRecommendations, loadingNamiRecs, "Nami couldn't find recommendations right now.", ItemCard, SkeletonItemCard)}
                 </section>
             )}

             {renderHorizontalSection("Similar Manga (from MAL)", Drama, recommendations, loadingRecs, "No similar manga found.", ItemCard, SkeletonItemCard)}
        </div>
    </div>
  );
}

function MangaDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
       <div className="absolute inset-x-0 top-0 h-[40vh] md:h-[60vh] -z-10"><Skeleton className="h-full w-full opacity-15 blur-md scale-110" /><div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" /></div>
       <div className="relative mt-16 md:mt-32">
            <Card className="overflow-visible glass border-primary/20 bg-card/60 mb-12">
               <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-4 md:p-8">
                  <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0 text-center -mt-24 md:-mt-32 z-10">
                      <Card className="overflow-hidden aspect-[2/3] relative border-2 border-primary/50 w-48 md:w-full mx-auto"><Skeleton className="h-full w-full" /></Card>
                       <div className="flex flex-col gap-3 mt-4"><Skeleton className="h-9 w-full rounded-md" /><Skeleton className="h-9 w-full rounded-md" /></div>
                  </div>
                  <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                      <CardHeader className="p-0 mb-3"><Skeleton className="h-8 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2 mb-1" /><Skeleton className="h-4 w-1/3" /></CardHeader>
                      <div className="flex flex-wrap gap-2 mb-4"><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-6 w-20 rounded-full" /></div>
                       <Card className="glass p-3 mb-4 border-primary/10"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
                              <Skeleton className="h-5 w-14" /><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-24" /><Skeleton className="h-5 w-16" /></div></Card>
                       <Skeleton className="h-4 w-24 mb-2" />
                       <div className="flex flex-wrap gap-2 mb-4"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-28" /></div>
                      <Separator className="my-4 bg-border/50" />
                      <CardContent className="p-0 flex-grow">
                          <div className="space-y-2 mb-6"><Skeleton className="h-7 w-32 mb-2" /><div className="h-24 pr-3 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div></div>
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-full mb-1" /><Skeleton className="h-3 w-3/4" />
                      </CardContent>
                  </div>
               </div>
            </Card>
             <section className="mb-12"><Skeleton className="h-8 w-36 mb-4" /><Card className="glass p-6"><div className="flex flex-col items-center justify-center text-center"><Skeleton className="h-10 w-10 rounded-full mb-3" /><Skeleton className="h-5 w-48 mb-2" /><Skeleton className="h-4 w-64" /></div></Card></section>
            <section className="mb-12"><Skeleton className="h-8 w-48 mb-4" /><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={`rel-skel-${index}`} className="h-20 glass rounded-md" />)}</div></section>
            <section className="mb-12"><Skeleton className="h-8 w-48 mb-4" /><div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4">{Array.from({ length: 5 }).map((_, index) => <SkeletonItemCard key={`rec-skel-${index}`} />)}</div></section>
             <section><Skeleton className="h-8 w-52 mb-4" /><div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4">{Array.from({ length: 5 }).map((_, index) => <SkeletonItemCard key={`sim-skel-${index}`} />)}</div></section>
        </div>
    </div>
  );
}
