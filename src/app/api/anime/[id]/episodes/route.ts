import { NextResponse } from 'next/server';
// Import episode fetching functions from the desired layer files.
// Adjust the import paths and syntax (CommonJS require vs ES Module import) based on your layer files.
// Assuming they use CommonJS require based on the files I read previously.

// Import episode fetching functions from layers (AnimeSuge and AniWave)
const { fetchEpisodesFromAnimeSuge, fetchFromAnimeSuge } = require('@/layers/animesuge.js');
const { fetchEpisodesFromAniWave, fetchFromAniWave } = require('@/layers/aniwave.js');
import { getAnimeDetails } from '@/services/anime'; // Keep Jikan API for anime title

/**
 * Handles GET requests to fetch episode lists for a given anime ID,
 * using AnimeSuge and AniWave scraper sources with fallback logic.
 *
 * @param request The incoming request.
 * @param params The dynamic parameters from the URL, containing the anime ID (id).
 * @returns A NextResponse with the episode list or an error.
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log('[API/anime/[id]/episodes] === API Route Hit ==='); // <-- Added this line
    const { id } = params; // The ID here is likely the MAL ID from the anime details page

    if (!id) {
        return NextResponse.json({ message: 'Missing Anime ID' }, { status: 400 });
    }

    console.log(`[API/anime/[id]/episodes] Received request for Anime ID: ${id}`);

    let episodes = null;
    let sourceUsed = null;
    let animeTitle = null; // To store anime title

    // --- 1. Fetch Anime Title from Jikan API --- //
    try {
        const animeDetails = await getAnimeDetails(parseInt(id)); // getAnimeDetails expects a number
        if (animeDetails && animeDetails.title) {
            animeTitle = animeDetails.title;
            console.log(`[API/anime/[id]/episodes] Fetched anime title from Jikan: ${animeTitle}`);
        } else {
            console.warn('[API/anime/[id]/episodes] Could not fetch anime title from Jikan. This may affect scrapers needing a title.');
        }
    } catch (error) {
        console.error('[API/anime/[id]/episodes] Error fetching anime title from Jikan:', error);
    }

    // --- Fallback Logic for Fetching Episodes (AnimeSuge then AniWave) ---

    // Attempt 1: AnimeSuge (Primary Scraper)
    if (animeTitle) { // Only attempt if title is available
        console.log(`[API/anime/[id]/episodes] Attempting to fetch episodes from AnimeSuge for ID: ${id}`);
        try {
            const searchResult = await fetchFromAnimeSuge(animeTitle);
            if (searchResult && searchResult.link) {
                episodes = await fetchEpisodesFromAnimeSuge({ link: searchResult.link });
                if (episodes && episodes.length > 0) {
                    sourceUsed = 'AnimeSuge';
                    console.log(`[API/anime/[id]/episodes] Successfully fetched ${episodes.length} episodes from AnimeSuge for ID: ${id}`);
                    console.log('[API/anime/[id]/episodes] AnimeSuge Episodes data structure:', JSON.stringify(episodes, null, 2));
                } else {
                    console.log(`[API/anime/[id]/episodes] AnimeSuge returned no episodes for ID: ${id}. Trying next fallback.`);
                }
            } else {
                console.warn('[API/anime/[id]/episodes] AnimeSuge search failed to return a link.');
            }
        } catch (error: any) {
            console.error(`[API/anime/[id]/episodes] Error fetching episodes from AnimeSuge for ID ${id}:`, error);
            console.error('[API/anime/[id]/episodes] AnimeSuge Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        }
    } else {
        console.warn('[API/anime/[id]/episodes] Skipping AnimeSuge fallback: Anime title is missing.');
    }

    // Attempt 2: AniWave (Fallback Scraper)
     if (!episodes || episodes.length === 0) {
        console.log(`[API/anime/[id]/episodes] Attempting to fetch episodes from AniWave for ID: ${id}`);
        if (animeTitle) { // Only attempt if title is available
            try {
                const searchResult = await fetchFromAniWave(animeTitle);
                if (searchResult && searchResult.link) {
                    episodes = await fetchEpisodesFromAniWave({ link: searchResult.link });
                    if (episodes && episodes.length > 0) {
                        sourceUsed = 'AniWave';
                        console.log(`[API/anime/[id]/episodes] Successfully fetched ${episodes.length} episodes from AniWave for ID: ${id}`);
                        console.log('[API/anime/[id]/episodes] AniWave Episodes data structure:', JSON.stringify(episodes, null, 2));
                    } else {
                        console.log(`[API/anime/[id]/episodes] AniWave returned no episodes for ID: ${id}.`);
                    }
                } else {
                    console.warn('[API/anime/[id]/episodes] AniWave search failed to return a link.');
                }
            } catch (error: any) {
                console.error(`[API/anime/[id]/episodes] Error fetching episodes from AniWave for ID ${id}:`, error);
                console.error('[API/anime/[id]/episodes] AniWave Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            }
        } else {
            console.warn('[API/anime/[id]/episodes] Skipping AniWave fallback: Anime title is missing.');
        }
    }


    // --- End Fallback Logic ---

    if (episodes && episodes.length > 0) {
        return NextResponse.json({ episodes: episodes, source: sourceUsed });
    } else {
        console.warn(`[API/anime/[id]/episodes] Failed to fetch episodes from any source for Anime ID: ${id}`);
        return NextResponse.json({ message: 'Could not retrieve episode list for this anime from available sources.' }, { status: 404 });
    }
}

// Helper function placeholders if needed for integration
// async function fetchEpisodesFromSecondaryScraper(id: string): Promise<any[] | null> {
//     // Logic to call other scrapers
//     return null;
// }
