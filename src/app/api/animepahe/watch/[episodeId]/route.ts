
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
    <file