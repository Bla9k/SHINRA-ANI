
// src/app/api/animepahe/episodes/[malId]/route.ts
// This file will handle requests for anime episodes using the Animepahe source by scraping.

import { NextResponse } from 'next/server';
import type { AnimepaheEpisode } from '@/services/animepahe';
import { parse } from 'node-html-parser'; // Simple HTML parser

/**
 * Placeholder mapping from MAL ID to AnimePahe internal ID/slug.
 * In a real application, this would require searching AnimePahe or using an external mapping service.
 */
const malToAnimepaheMap: { [key: number]: string } = {
    5114: '9d136b8e-b155-dcc6-75e0-30191159d0d3', // FMA:B (Example internal ID)
    16498: 'f59bd07c-8b93-45a2-d81c-0b6a6999e2a6', // AOT S1
    30276: '4596b2f7-796d-1fe4-a31a-9a63021b5979', // One Punch Man S1
    40748: '7d3e1b2a-0a4e-2c9c-c22a-9a6b307c1e9f', // Jujutsu Kaisen S1
    // Add more mappings as needed for testing
};

/**
 * Fetches the AnimePahe episode page HTML and parses it to extract episode data.
 * @param animepaheId The internal AnimePahe ID (usually a UUID).
 * @returns An array of AnimepaheEpisode objects.
 */
async function fetchAndParseEpisodes(animepaheId: string): Promise<AnimepaheEpisode[]> {
    const animeUrl = `https://animepahe.com/anime/${animepaheId}`; // Changed from .com to .ru? Check actual domain if needed
    // Use animepahe.ru as animepahe.com might be down or region-locked
    // const animeUrl = `https://animepahe.ru/anime/${animepaheId}`;
    console.log(`[API/animepahe/episodes] Fetching HTML from: ${animeUrl}`);

    try {
        // Fetch the main anime page HTML
        const response = await fetch(animeUrl, {
            headers: {
                // Add headers to mimic a browser visit if necessary
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.error(`[API/animepahe/episodes] Failed to fetch anime page ${animeUrl}. Status: ${response.status}`);
            throw new Error(`Failed to fetch anime page. Status: ${response.statusText}`);
        }

        const html = await response.text();
        const root = parse(html);

        // Find the episode list container and buttons/links
        // Adjust the selector based on AnimePahe's current structure
        // This selector targets the buttons within the episode list div
        const episodeElements = root.querySelectorAll('#episodeList .episode-list-buttons a.play'); // Example selector, needs inspection

        if (!episodeElements || episodeElements.length === 0) {
            console.warn(`[API/animepahe/episodes] No episode elements found on ${animeUrl} using selector '#episodeList .episode-list-buttons a.play'. Structure might have changed.`);
            // Attempt another common selector pattern if the first fails
            const alternativeElements = root.querySelectorAll('.episode-list a'); // More generic selector
            if (!alternativeElements || alternativeElements.length === 0) {
                 console.error(`[API/animepahe/episodes] Still no episode elements found using '.episode-list a'. Cannot parse episodes.`);
                 return [];
            }
            console.log(`[API/animepahe/episodes] Using alternative selector '.episode-list a'. Found ${alternativeElements.length} elements.`);
            episodeElements.push(...alternativeElements); // Use the alternative if found
        }

        const episodes: AnimepaheEpisode[] = [];
        episodeElements.forEach((element, index) => {
            const href = element.getAttribute('href'); // e.g., /play/anime-slug/session-id
             // Episode number is often the text content of the button/link
            const numberText = element.textContent?.trim() || (index + 1).toString();
            const number = parseInt(numberText, 10); // Attempt to parse as int

            if (href && !isNaN(number)) {
                // Extract the session ID from the href
                const parts = href.split('/');
                const sessionId = parts[parts.length - 1]; // Last part is usually the session ID

                if (sessionId) {
                     episodes.push({
                        id: sessionId, // This is the AnimePahe episode ID needed for the watch route
                        number: number,
                        // AnimePahe often lacks titles in the list itself
                        title: element.getAttribute('title') || null,
                        thumbnail: null, // Thumbnails usually aren't in the list
                        duration: null,
                        isFiller: null,
                    });
                } else {
                    console.warn(`[API/animepahe/episodes] Could not extract session ID from href: ${href}`);
                }
            } else {
                 console.warn(`[API/animepahe/episodes] Skipping element, missing href or invalid number:`, { href, numberText });
            }
        });

        // Sort episodes by number just in case parsing order isn't guaranteed
        episodes.sort((a, b) => a.number - b.number);

        console.log(`[API/animepahe/episodes] Parsed ${episodes.length} episodes from ${animeUrl}`);
        return episodes;

    } catch (error) {
        console.error(`[API/animepahe/episodes] Error during fetch/parse for ${animeUrl}:`, error);
        throw error; // Re-throw to be caught by the main handler
    }
}


/**
 * Handles GET requests for anime episodes based on MAL ID using Animepahe scraping.
 */
export async function GET(
    request: Request,
    { params }: { params: { malId: string } }
) {
    const { malId } = params;

    if (!malId || isNaN(parseInt(malId))) {
        return NextResponse.json({ message: 'Invalid or missing MAL ID' }, { status: 400 });
    }

    const numericMalId = parseInt(malId);
    console.log(`[API/animepahe/episodes] Received request for MAL ID: ${numericMalId}`);

    const animepaheId = malToAnimepaheMap[numericMalId];

    if (!animepaheId) {
        console.error(`[API/animepahe/episodes] No AnimePahe ID mapped for MAL ID: ${numericMalId}`);
        // Use 404 specific message
        return NextResponse.json({ message: `AnimePahe ID mapping not found for MAL ID ${numericMalId}. Cannot fetch episodes.` }, { status: 404 });
    }

    console.log(`[API/animepahe/episodes] Mapped MAL ID ${numericMalId} to AnimePahe ID: ${animepaheId}`);

    try {
        const episodes = await fetchAndParseEpisodes(animepaheId);

        if (!Array.isArray(episodes)) {
             console.error(`[API/animepahe/episodes] fetchAndParseEpisodes did not return an array for MAL ID ${numericMalId}.`);
             return NextResponse.json({ message: 'Internal error fetching episode data.' }, { status: 500 });
        }

        // Check if scraping failed to find episodes
        if (episodes.length === 0) {
             console.warn(`[API/animepahe/episodes] No episodes parsed for AnimePahe ID: ${animepaheId} (MAL ID: ${numericMalId}). Possible structure change or no episodes available.`);
             // Return 404 if scraping yielded no results
             return NextResponse.json({ message: 'No episodes found on AnimePahe for this anime (parsing failed or none exist).' }, { status: 404 });
        }

        console.log(`[API/animepahe/episodes] Successfully fetched ${episodes.length} episodes for MAL ID: ${numericMalId}`);
        return NextResponse.json(episodes); // Return the array directly

    } catch (error: any) {
        console.error(`[API/animepahe/episodes] Error fetching episodes for MAL ID ${numericMalId}:`, error);
        // Return 500 for unexpected errors during scraping/parsing
        return NextResponse.json({ message: 'Error fetching episodes from source', error: error.message }, { status: 500 });
    }
}

```
  </change>
  <change>
    <file>src/app/api/animepahe/watch/[episodeId]/route.ts</file>
    <description>Implement basic scraping for AnimePahe watch page to extract Kwik stream URL. Includes placeholder for actual Kwik URL resolving.</description>
    <content><![CDATA[
// src/app/api/animepahe/watch/[episodeId]/route.ts
// This file handles requests for streaming links for a specific AnimePahe episode ID by scraping.

import { NextResponse } from 'next/server';
import type { AnimepaheWatchResponse, AnimepaheStreamingSource } from '@/services/animepahe'; // Use the specific types
import { parse } from 'node-html-parser'; // Simple HTML parser

/**
 * Placeholder function to resolve Kwik stream URLs.
 * This is complex and requires inspecting Kwik's obfuscation methods.
 * @param kwikUrl The URL of the Kwik streaming page (e.g., https://kwik.cx/e/...)
 * @returns A promise resolving to the actual M3U8 stream URL.
 */
async function resolveKwikStream(kwikUrl: string): Promise<string | null> {
    console.warn(`[API/animepahe/watch] Kwik resolving placeholder for URL: ${kwikUrl}. Returning direct URL for now.`);
    // TODO: Implement actual Kwik resolving logic. This usually involves:
    // 1. Fetching the Kwik page HTML.
    // 2. Finding the packed JavaScript (often using eval or similar).
    // 3. De-obfuscating/executing the script in a sandbox or parsing it to extract the source URL pattern.
    // 4. Returning the final M3U8 URL.
    // For now, return a placeholder or the direct Kwik URL (which won't play in standard players)
    // Simulating a successful resolution with a fake M3U8 link for testing:
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay for Kwik fetch
    const fakeM3U8 = `https://example-cdn.com/resolved/${kwikUrl.split('/').pop()}.m3u8`;
    console.log(`[API/animepahe/watch] Placeholder resolved ${kwikUrl} to ${fakeM3U8}`);
    return fakeM3U8; // Return placeholder M3U8
}


/**
 * Fetches the AnimePahe player page and extracts potential streaming sources (like Kwik URLs).
 * @param episodeId The AnimePahe episode session ID.
 * @returns A promise resolving to the streaming data.
 */
async function fetchAndParseWatchSources(episodeId: string): Promise<AnimepaheWatchResponse> {
    // Note: AnimePahe structure might involve a slug, but often the session ID is enough
    // We need the anime slug to build the /play URL correctly. This needs to be passed
    // or derived. For now, let's assume a placeholder structure or attempt without slug.
    // A robust solution requires knowing the anime's slug.
    // Let's try a common pattern, but it might fail.
    const watchUrl = `https://animepahe.com/play/some-anime-slug/${episodeId}`; // Placeholder slug
    console.log(`[API/animepahe/watch] Fetching HTML from player page (using placeholder slug): ${watchUrl}`);
     // Alternative: Use animepahe.ru if .com is blocked
    // const watchUrl = `https://animepahe.ru/play/some-anime-slug/${episodeId}`;

    try {
        const response = await fetch(watchUrl, {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': `https://animepahe.com/anime/some-anime-id` // Might need referer
            }
        });

        if (!response.ok) {
            console.error(`[API/animepahe/watch] Failed to fetch player page ${watchUrl}. Status: ${response.status}`);
            throw new Error(`Failed to fetch player page. Status: ${response.statusText}`);
        }

        const html = await response.text();
        const root = parse(html);

        // Find the streaming quality buttons/links
        // Adjust selector based on AnimePahe's structure
        const qualityButtons = root.querySelectorAll('#resolutionMenu button[data-src]'); // Example selector for Kwik links

        if (!qualityButtons || qualityButtons.length === 0) {
            console.warn(`[API/animepahe/watch] No quality buttons with data-src found on ${watchUrl}. Structure might have changed or links are embedded differently.`);
            // Add alternative selectors if needed
            return { sources: [], headers: { Referer: watchUrl } }; // Return empty if no buttons found
        }

        console.log(`[API/animepahe/watch] Found ${qualityButtons.length} quality buttons.`);

        const sources: AnimepaheStreamingSource[] = [];
        const resolutionPromises: Promise<void>[] = [];

        qualityButtons.forEach((button) => {
            const kwikUrl = button.getAttribute('data-src');
            const quality = button.textContent?.trim().replace('p', '') + 'p'; // Extract quality (e.g., "1080p")

            if (kwikUrl && quality) {
                console.log(`[API/animepahe/watch] Found potential Kwik source: Quality=${quality}, URL=${kwikUrl}`);
                // Resolve the Kwik URL asynchronously
                 resolutionPromises.push(
                    resolveKwikStream(kwikUrl).then(resolvedUrl => {
                        if (resolvedUrl) {
                            sources.push({
                                url: resolvedUrl,
                                quality: quality,
                                isM3U8: resolvedUrl.includes('.m3u8')
                            });
                             console.log(`[API/animepahe/watch] Successfully added resolved source for ${quality}`);
                        } else {
                             console.warn(`[API/animepahe/watch] Failed to resolve Kwik URL for ${quality}: ${kwikUrl}`);
                        }
                    }).catch(err => {
                         console.error(`[API/animepahe/watch] Error resolving Kwik URL for ${quality}:`, err);
                    })
                );
            } else {
                 console.warn(`[API/animepahe/watch] Skipping button, missing data-src or quality text:`, button.outerHTML);
            }
        });

        // Wait for all Kwik URLs to attempt resolution
        await Promise.all(resolutionPromises);

        console.log(`[API/animepahe/watch] Processed all quality buttons. Found ${sources.length} resolved sources.`);

        // Sort sources by quality (e.g., 1080p first)
        sources.sort((a, b) => {
            const qualityA = parseInt(a.quality.replace('p', ''), 10);
            const qualityB = parseInt(b.quality.replace('p', ''), 10);
            return (isNaN(qualityB) ? 0 : qualityB) - (isNaN(qualityA) ? 0 : qualityA);
        });


        return {
            headers: {
                Referer: watchUrl // Pass referer which might be needed by some players/CDNs
            },
            sources: sources,
            intro: { start: 0, end: 0 }, // Placeholder
        };

    } catch (error) {
        console.error(`[API/animepahe/watch] Error during fetch/parse for watch page ${episodeId}:`, error);
        throw error;
    }
}


/**
 * Handles GET requests for streaming links based on an AnimePahe episode ID using scraping.
 */
export async function GET(
    request: Request,
    { params }: { params: { episodeId: string } }
) {
    const { episodeId } = params;

    if (!episodeId) {
        return NextResponse.json({ message: 'Missing AnimePahe Episode ID' }, { status: 400 });
    }

    // Decode just in case, though AnimePahe IDs are usually safe
    const decodedEpisodeId = decodeURIComponent(episodeId);

    console.log(`[API/animepahe/watch] Received request for AnimePahe Episode ID: ${decodedEpisodeId}`);

    try {
        const streamingData = await fetchAndParseWatchSources(decodedEpisodeId);

         if (!streamingData || !streamingData.sources || streamingData.sources.length === 0) {
              console.warn(`[API/animepahe/watch] No streaming sources found after parsing/resolving for Episode ID: ${decodedEpisodeId}`);
              return NextResponse.json({ message: 'No streaming sources found from AnimePahe after processing.' }, { status: 404 });
         }

        console.log(`[API/animepahe/watch] Successfully fetched streaming data for Episode ID: ${decodedEpisodeId}`);
        return NextResponse.json(streamingData);

    } catch (error: any) {
        console.error(`[API/animepahe/watch] Error fetching streaming data for ${decodedEpisodeId}:`, error);
        // Use 500 for errors during the scraping/resolving process
        return NextResponse.json({ message: 'Error fetching streaming data from source', error: error.message }, { status: 500 });
    }
}

```
  </change>
  <change>
    <file>package.json</file>
    <description>Add node-html-parser dependency for basic HTML scraping.</description>
    <content><![CDATA[
{
  "name": "shinra-ani",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
    "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@genkit-ai/googleai": "^1.0.4",
    "@genkit-ai/next": "^1.0.4",
    "@hookform/resolvers": "^4.1.3",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@tanstack-query-firebase/react": "^1.0.5",
    "@tanstack/react-query": "^5.66.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "firebase": "^11.3.0",
    "genkit": "^1.0.4",
    "hls.js": "^1.5.14",
    "lucide-react": "^0.475.0",
    "next": "15.2.3",
    "node-html-parser": "^6.1.13",
    "patch-package": "^8.0.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "genkit-cli": "^1.0.4",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}

